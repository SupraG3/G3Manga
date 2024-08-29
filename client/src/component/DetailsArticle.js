import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './styles/DetailsArticle.css';

const DetailsArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [article, setArticle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    price: '',
    description: '',
    category: '',
    quantity: '',
    discount: 0
  });
  const [newArticles, setNewArticles] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`/api/articles/${id}`);
        setArticle(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error('There was an error fetching the article!', error);
      }
    };
    fetchArticle();

    const fetchNewArticles = async () => {
      try {
        const response = await axios.get('/api/articles');
        const sortedArticles = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNewArticles(sortedArticles.slice(0, 2).map(article => article._id));
      } catch (error) {
        console.error('There was an error fetching the articles!', error);
      }
    };
    fetchNewArticles();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {

    if (formData.discount >= 100) {
    alert("La réduction ne peut pas être de 100% ou plus.");
    return;
  }

    try {
      const response = await axios.put(`/api/articles/${id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setArticle(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('There was an error updating the article!', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/');
    } catch (error) {
      console.error('There was an error deleting the article!', error);
    }
  };

  if (!article) {
    return <div>Loading...</div>;
  }

  const isNew = newArticles.includes(article._id);
  const discountedPrice = formData.price - (formData.price * formData.discount) / 100;

  return (
    <div className="details-article-container">
      <div className="homepage-navbar">
        <div className="homepage-logog3">
          <img src={require('./assets/logo/logo-g3.png')} alt="My-logo" />
        </div>
        <div className="homepage-search">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            className="homepage-search-input"
          />
          <button className="homepage-search-button">
            <img src={require('./assets/search.png')} alt="Search" />
          </button>
          <select className="homepage-category-filter">
            <option value="">Toutes les catégories</option>
            <option value="Vêtements">Vêtements</option>
            <option value="Manga">Manga</option>
            <option value="Accessoires">Accessoires</option>
            <option value="Décoration">Décoration</option>
          </select>
        </div>
        <Link to={isAuthenticated ? "/profile" : "/login"}>
          <img src={require('./assets/profil.png')} alt="Profile" className="homepage-jpg-profil" />
        </Link>
        <div className="homepage-cart">
          <Link to="/cart">
            <img src={require('./assets/shop.png')} alt="Cart" className="homepage-jpg-shop" />
            <span className="homepage-span-shop">{cart.length}</span>
          </Link>
        </div>
      </div>
      <div className="details-article-header">
        <Link to="/" className="back-button-article">Retour</Link>
        <h2 className="details-article-title">
          {article.name} {isNew && <span className="new-badge">New !</span>}
          {article.quantity === 0 && <span className="out-of-stock-badge">Hors stock !</span>}
        </h2>
        {isAuthenticated && user.role === 'admin' && (
          <div>
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
            <button onClick={handleDelete}>Supprimer</button>
          </div>
        )}
      </div>
      <div className="details-article-content">
        {isEditing ? (
          <div className="details-article-edit-form">
            <label htmlFor="name">Nom de l'article</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <label htmlFor="image">URL de l'article</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
            />
            <label htmlFor="price">Prix</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
            />
            <label htmlFor="description">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <label htmlFor="category">Catégorie</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            />
            <label htmlFor="quantity">Quantité</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
            />
            <label htmlFor="discount">Réduction (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              placeholder="Discount (%)"
            />
            <button onClick={handleUpdate}>Mettre à jour</button>
          </div>
        ) : (
          <>
            <img src={article.image} alt={article.name} className="details-article-image" />
            <div className="details-article-info">
              <p className="details-article-description">{article.description}</p>
              {article.discount > 0 ? (
                <p className="details-article-price">
                  <span className="old-price">{article.price}€</span>
                  <span className="discount">
                    -{article.discount}% {discountedPrice.toFixed(2)}€
                  </span>
                </p>
              ) : (
                <p className="details-article-price">{article.price}€</p>
              )}
              <p className="details-article-category">Catégorie: {article.category}</p>
              <p className="details-article-quantity">Quantité: {article.quantity}</p>
              {article.quantity === 0 && <p className="out-of-stock-message">Hors stock</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailsArticle;
