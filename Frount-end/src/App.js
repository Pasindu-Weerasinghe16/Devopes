import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './App.css';
import {BrowserRouter , Route , Routes} from "react-router-dom";
import './index.css';
import { AuthProvider } from './AuthContext';
//let value = {user , signin , signout};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
