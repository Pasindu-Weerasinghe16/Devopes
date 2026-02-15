import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import './index.css';
import AuthContext, { AuthProvider } from './AuthContext';
import React, { useContext } from 'react';
//let value = {user , signin , signout};

function RequireAuth({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RedirectRoot() {
  const { isAuthenticated } = useContext(AuthContext);
  return <Navigate to={isAuthenticated ? '/inventory' : '/login'} replace />;
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectRoot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inventory" element={<RequireAuth><Home /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
