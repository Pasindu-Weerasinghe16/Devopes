import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import {BrowserRouter , Route , Routes} from "react-router-dom";
import './index.css';
//let value = {user , signin , signout};


function App() {
  return (
   // <AuthContext.Provider value={value}>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes> 
      </BrowserRouter>
   // </AuthContext.Provider>
  );
}

export default App;
