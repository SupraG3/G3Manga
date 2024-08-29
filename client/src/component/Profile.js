import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import defaultAxios from 'axios';
import './styles/Profile.css';

const Profile = () => {
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
    address: {
      street: '',
      postalCode: '',
      city: '',
      country: '',
    },
    email: '',
    password: '',
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      const token = localStorage.getItem('token');
      axios.get('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        const user = response.data;
        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || {
            street: '',
            postalCode: '',
            city: '',
            country: '',
          },
          email: user.username || '',
          password: '',
        });
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
    }
  }, [isAuthenticated, navigate, user]);

  const validatePhoneNumber = (phoneNumber) => {
    const regex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    return regex.test(phoneNumber);
};

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setUserData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value,
        },
      }));

      if (addressField === 'street' && value.length > 3) {
        try {
          const response = await defaultAxios.get(`https://api-adresse.data.gouv.fr/search/?q=${value}`);
          setAddressSuggestions(response.data.features);
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
        }
      } else {
        setAddressSuggestions([]);
      }
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleAddressSelect = (suggestion) => {
    setUserData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        street: suggestion.properties.name,
        postalCode: suggestion.properties.postcode,
        city: suggestion.properties.city,
        country: 'France',
      },
    }));
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(userData.phoneNumber)) {
      setMessage('Veuillez entrer un numéro de téléphone valide.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/user', userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data);
      setMessage('Information updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('There was an error updating the account!', error);
      setMessage('Erreur lors de la mise à jour des informations.');
      setTimeout(() => setMessage(''), 3000);
    }
};


  const handleDelete = async () => {
    setShowConfirm(false);
    setMessage('Account deletion in progress...');
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Account deleted successfully. Redirection...');
      setTimeout(() => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('There was an error deleting the account!', error);
      setMessage('There was an error deleting the account!');
    }
  };

  const confirmDelete = () => {
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="profile-container">
      <div className="profile-form-wrapper">
        <div className="profile-form-header">
          <h2 className="profile-form-title">Informations de profil</h2>
          <Link to="/">
            <div className="profile-return">Retour</div>
          </Link>
        </div>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="firstName">Prénom</label>
            <input
              autoComplete='off'
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="lastName">Nom</label>
            <input
              autoComplete='off'
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="birthDate">Date de naissance</label>
            <input
              type="date"
              name="birthDate"
              value={userData.birthDate}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="phoneNumber">Numéro de téléphone</label>
            <input
              autoComplete='off'
              type="text"
              name="phoneNumber"
              value={userData.phoneNumber}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="address.street">Rue</label>
            <input
              autoComplete='off'
              type="text"
              name="address.street"
              value={userData.address.street}
              onChange={handleChange}
              className="profile-input"
              required
            />
            {addressSuggestions.length > 0 && (
              <ul className="address-suggestions">
                {addressSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.properties.id}
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    {suggestion.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="profile-field">
            <label htmlFor="address.postalCode">Code postal</label>
            <input
              autoComplete='off'
              type="text"
              name="address.postalCode"
              value={userData.address.postalCode}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="address.city">Ville</label>
            <input
              autoComplete='off'
              type="text"
              name="address.city"
              value={userData.address.city}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="address.country">Pays</label>
            <input
              autoComplete='off'
              type="text"
              name="address.country"
              value={userData.address.country}
              onChange={handleChange}
              className="profile-input"
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="email">Adresse email</label>
            <input
              autoComplete='off'
              type="email"
              name="email"
              value={userData.email}
              readOnly
              className="profile-input"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="profile-input"
              placeholder="Changer le mot de passe"
            />
          </div>
          <div className="profile-action-buttons">
            <button type="submit" id="profile-update-btn">Mettre à jour</button>
            <button type="button" id="profile-delete-btn" onClick={confirmDelete}>Supprimer le compte</button>
            <button type="button" id="profile-logout-btn" onClick={handleLogout}>Déconnecter</button>
          </div>
        </form>
        {showConfirm && (
          <div className="profile-confirm-dialog">
            <p>Êtes-vous sûr de vouloir supprimer votre compte ?</p>
            <button onClick={handleDelete}>Oui</button>
            <button onClick={handleCancel}>Non</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
