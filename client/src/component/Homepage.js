import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axios from '../utils/axios';
import './styles/Homepage.css';

const Homepage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { cart, addToCart } = useContext(CartContext);
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [newArticles, setNewArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/api/articles');
        const sortedArticles = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setArticles(sortedArticles);
        setNewArticles(sortedArticles.slice(0, 2).map(article => article._id));
      } catch (error) {
        console.error('There was an error fetching the articles!', error);
      }
    };
    fetchArticles();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setFilterCategory(e.target.value);
  };

  const filteredArticles = articles.filter(article => {
    return (
      (searchTerm === '' || article.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === '' || article.category === filterCategory)
    );
  });

  return (
    <div className="homepage-container">
      <div className="homepage-navbar">
        <div className="homepage-logog3">
          <img src={require('./assets/logo/logo-g3.png')} alt="My-logo" />
        </div>
        <div className="homepage-search">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            className="homepage-search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="homepage-search-button">
            <img src={require('./assets/search.png')} alt="Search" />
          </button>
          <select className="homepage-category-filter" value={filterCategory} onChange={handleCategoryFilter}>
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

      <div className="homepage-list-item">
        <ul className="homepage-list-item-ul">
          <li className="homepage-list-item-li">
            <a href="#" className="homepage-list-item-a" onClick={() => setFilterCategory('')}>Accueil</a>
          </li>
          <li className="homepage-list-item-li">
            <a href="#" className="homepage-list-item-a" onClick={() => setFilterCategory('Vêtements')}>Vêtements</a>
          </li>
          <li className="homepage-list-item-li">
            <a href="#" className="homepage-list-item-a" onClick={() => setFilterCategory('Manga')}>Manga</a>
          </li>
          <li className="homepage-list-item-li">
            <a href="#" className="homepage-list-item-a" onClick={() => setFilterCategory('Accessoires')}>Accessoires</a>
          </li>
          <li className="homepage-list-item-li">
            <a href="#" className="homepage-list-item-a" onClick={() => setFilterCategory('Décoration')}>Décoration</a>
          </li>
          <li className="homepage-list-item-li">
            <Link to="/contact" className="homepage-list-item-a">Contact</Link>
          </li>
          {isAuthenticated && user?.role === 'admin' && (
            <li className="homepage-list-item-li">
              <Link to="/add-article" className="add-article-button">Add Article</Link>
              <Link to="/manage-users" className="manage-users-button">Manage Users</Link>
            </li>
          )}
        </ul>
      </div>

      <div className="homepage-item">
        <ul className="homepage-item-ul">
          {filteredArticles.map(article => (
            <li key={article._id} className="homepage-item-li">
              <div className="homepage-item-content">
                <Link to={`/article/${article._id}`}>
                  <img src={article.image} alt={article.name} />
                </Link>
                <p>{article.name}</p>
                  {newArticles.includes(article._id) && <span className="new-badge">New !</span>}
                  {article.quantity === 0 && <span className="out-of-stock-badge">Hors stock !</span>}
                {article.discount > 0 ? (
                  <p className="article-price">
                    <span className="old-price">{article.price}€</span>
                    <span className="discount">
                      -{article.discount}% {(article.price - (article.price * article.discount) / 100).toFixed(2)}€
                    </span>
                  </p>
                ) : (
                  <p className="article-price">{article.price}€</p>
                )}
                <button onClick={() => addToCart({ ...article, price: article.discount > 0 ? (article.price - (article.price * article.discount) / 100).toFixed(2) : article.price })} className="add-to-cart-button">Ajouter au panier</button>

              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Homepage;
