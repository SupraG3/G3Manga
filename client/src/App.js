import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Homepage from './component/Homepage';
import Login from './component/Login';
import Register from './component/Register';
import ProtectedComponent from './component/ProtectedComponent';
import Profile from './component/Profile';
import AddArticle from './component/AddArticle';
import CartPage from './component/CartPage';
import DetailsArticle from './component/DetailsArticle';
import ManageUsers from './component/ManageUsers';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ContactPage from './component/ContactPage';
import PaymentPage from './component/PaymentPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/protected" element={<ProtectedComponent />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-article" element={<AddArticle />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/article/:id" element={<DetailsArticle />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/checkout" element={<PaymentPage />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
