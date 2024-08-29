import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from '../utils/axios';
import './styles/Login.css';

function Login() {
  const { setIsAuthenticated, setUser } = useContext(AuthContext);
  const { setCart } = useContext(CartContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);

      // Fetch user data and update context
      const userResponse = await axios.get('http://localhost:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(userResponse.data);
      setIsAuthenticated(true);

      // Retrieve cart from localStorage and update context
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);

      setMessage('Successful connection! You will be redirected...');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error("Login error:", error);
      setMessage('Incorrect email address or password');
    }
  };

  return (
    <div className="main-container">
      <div className="form-wrapper">
        <div className="form-header">
          <div className="form-title">Login</div>
          <Link to="/">
            <div className="return">Retour</div>
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <input
              className="inp"
              type="text"
              id="username"
              required
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="label" htmlFor="username">Email</label>
            <span className="bi bi-person"></span>
          </div>
          <div className="field">
            <input
              className="inp"
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="label" htmlFor="password">Password</label>
            <span
              className={`toggle-pass bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}
              onClick={handlePasswordVisibility}
            ></span>
          </div>
          <div className="action">
            <label htmlFor="save-info">
              <input type="checkbox" id="save-info" />
              Stay signed in
            </label>
            <a className="login-a" href="#">Need help signing in?</a>
          </div>
          <input type="submit" value="Login" id="login-btn" />
        </form>
        {message && <p>{message}</p>}
        <div className="separator">or</div>
        <div className="alternative">
          <button className="bi bi-google"></button>
          <button className="bi bi-facebook"></button>
          <button className="bi bi-discord"></button>
        </div>
        <div className="bottom">Not a member yet ?
          <Link to="/register">
            <span className="login-a"> Register Here</span>
          </Link>
        </div>
      </div>
      <div className="bg"></div>
    </div>
  );
}

export default Login;
