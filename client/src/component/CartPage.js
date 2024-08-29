import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './styles/CartPage.css';

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantityInCart, 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  const increaseQuantity = (itemId) => {
    const item = cart.find(item => item._id === itemId);
    if (item.quantityInCart < item.quantity) {
      updateCartQuantity(itemId, item.quantityInCart + 1);
      setError('');
    } else {
      setError(`La quantité maximale en stock pour ${item.name} est de ${item.quantity}.`);
    }
  };

  const decreaseQuantity = (itemId) => {
    const item = cart.find(item => item._id === itemId);
    if (item.quantityInCart > 1) {
      updateCartQuantity(itemId, item.quantityInCart - 1);
      setError('');
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <Link to="/" className="back-button">Retour</Link>
        <h2>Votre Panier</h2>
      </div>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          <ul>
            {cart.map(item => (
              <li key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <p>{item.price}€</p>
                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(item._id)}>-</button>
                    <span>{item.quantityInCart}</span>
                    <button onClick={() => increaseQuantity(item._id)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="remove-from-cart-button">Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <h3>Total: {calculateTotal()}€</h3>
          </div>
          <div className="cart-actions">
            <button onClick={clearCart} className="clear-cart-button">Vider le panier</button>
            <button onClick={handleCheckout} className="checkout-button">Payer</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
