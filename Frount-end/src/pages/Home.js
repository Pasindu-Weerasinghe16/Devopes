import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
// Removed lucide-react dependency to avoid module not found error; using simple Unicode / fallback SVG icons.

const API_BASE =
  process.env.REACT_APP_API_URL || `http://${window.location.hostname}:4000`;

function ModernInventoryDashboard() {
  const [products, setProducts] = useState([]);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetch(`${API_BASE}/api/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to load inventory');
        }
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : []).map((item) => ({
          id: item._id,
          name: item.name,
          sku: item.sku,
          stock: item.stock,
          category: item.category,
          price: item.price,
          status: item.status,
          lastUpdated: item.lastUpdated || (item.updatedAt ? String(item.updatedAt).slice(0, 10) : ''),
        }));
        setProducts(normalized);
      })
      .catch((err) => {
        console.log(err);
        alert('Failed to load inventory');
      });
  }, [token, logout, navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    stock: "",
    category: "",
    price: "",
    status: "In Stock"
  });

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockItems = products.filter(p => p.stock < 50 && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: "", sku: "", stock: "", category: "", price: "", status: "In Stock" });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!token) return;
    fetch(`${API_BASE}/api/inventory/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Delete failed');
        }
        setProducts((prev) => prev.filter((p) => p.id !== id));
      })
      .catch((err) => {
        console.log(err);
        alert('Delete failed');
      });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || !formData.category || formData.stock === "" || formData.price === "") {
      alert("Please fill in all fields");
      return;
    }

    if (!token) return;

    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      stock: Number(formData.stock),
      price: Number(formData.price),
    };

    const isEdit = Boolean(editingProduct?.id);
    const url = isEdit ? `${API_BASE}/api/inventory/${editingProduct.id}` : `${API_BASE}/api/inventory`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return null;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Save failed');
        }
        return res.json();
      })
      .then((saved) => {
        if (!saved) return;
        const normalized = {
          id: saved._id,
          name: saved.name,
          sku: saved.sku,
          stock: saved.stock,
          category: saved.category,
          price: saved.price,
          status: saved.status,
          lastUpdated: saved.lastUpdated || '',
        };
        setProducts((prev) => {
          if (isEdit) return prev.map((p) => (p.id === normalized.id ? normalized : p));
          return [normalized, ...prev];
        });
        setShowModal(false);
      })
      .catch((err) => {
        console.log(err);
        alert('Save failed');
      });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case "In Stock": return "bg-emerald-100 text-emerald-700";
      case "Low Stock": return "bg-amber-100 text-amber-700";
      case "Out of Stock": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Inventory Hub
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage your products</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Logout
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <span className="text-lg">＋</span>
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <span>📈</span> Active inventory
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <span className="text-indigo-600 text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${totalValue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Current inventory worth</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <span className="text-green-600 text-2xl">💲</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Low Stock Alert</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{lowStockItems}</p>
                <p className="text-xs text-amber-600 mt-2">Items need restock</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <span className="text-amber-600 text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{outOfStock}</p>
                <p className="text-xs text-red-600 mt-2">Urgent action needed</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <span className="text-red-600 text-2xl">⛔</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Updated</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 font-medium text-gray-900">{product.name}</td>
                    <td className="py-4 px-6 text-gray-600 font-mono text-sm">{product.sku}</td>
                    <td className="py-4 px-6 text-gray-600">{product.category}</td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock < 50 ? 'text-amber-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">${product.price}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{product.lastUpdated}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✖
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => {
                    const stock = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      stock: stock, 
                      status: stock === 0 ? "Out of Stock" : stock < 50 ? "Low Stock" : "In Stock"
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  {editingProduct ? "Update" : "Add"} Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernInventoryDashboard;