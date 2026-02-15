const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'In Stock' },
    lastUpdated: { type: String },
}, { timestamps: true });

const Inventory = mongoose.model('inventory', InventorySchema);
module.exports = { Inventory };
