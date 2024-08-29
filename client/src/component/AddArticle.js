import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import './styles/AddArticle.css';

const AddArticle = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [articleData, setArticleData] = useState({
    name: '',
    image: '',
    price: '',
    description: '',
    category: 'Vêtements',
    quantity: ''
  });
  const [message, setMessage] = useState('');

  const categories = ['Vêtements', 'Manga', 'Accessoires', 'Décoration'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticleData({ ...articleData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (articleData.price <= 0) {
      setMessage("Le prix de l'article doit être supérieur à 0.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/articles', articleData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Article added successfully!');
      setArticleData({
        name: '',
        image: '',
        price: '',
        description: '',
        category: 'Vêtements',
        quantity: ''
      });
    } catch (error) {
      setMessage('Error adding article. Please try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="add-article-container">
        <div className="add-article-form-wrapper">
          <h2 className="add-article-form-title">Access Denied</h2>
          <p>Vous n'êtes pas autorisé à accéder à cette page car vous n'êtes pas un administrateur. Vous serez redirigé vers la page d'accueil dans 2 secondes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-article-container">
      <div className="add-article-form-wrapper">
        <h2 className="add-article-form-title">Add New Article</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="add-article-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              value={articleData.name}
              onChange={handleChange}
              className="add-article-input"
              required
            />
          </div>
          <div className="add-article-field">
            <label htmlFor="image">Image URL</label>
            <input
              type="text"
              name="image"
              value={articleData.image}
              onChange={handleChange}
              className="add-article-input"
              required
            />
          </div>
          <div className="add-article-field">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              name="price"
              value={articleData.price}
              onChange={handleChange}
              className="add-article-input"
              required
            />
          </div>
          <div className="add-article-field">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              value={articleData.description}
              onChange={handleChange}
              className="add-article-input"
              required
            />
          </div>
          <div className="add-article-field">
            <label htmlFor="category">Category</label>
            <select
              name="category"
              value={articleData.category}
              onChange={handleChange}
              className="add-article-input"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="add-article-field">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={articleData.quantity}
              onChange={handleChange}
              className="add-article-input"
              required
            />
          </div>
          <button type="submit" className="add-article-button">Add Article</button>
        </form>
        <button onClick={() => navigate(-1)} className="back-button">Retour</button>
      </div>
    </div>
  );
};

export default AddArticle;
