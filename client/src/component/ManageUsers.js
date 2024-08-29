import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import './styles/ManageUsers.css';

const ManageUsers = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null); // ID de l'utilisateur en cours d'édition
  const [editedData, setEditedData] = useState({}); // Données modifiées
  const [message, setMessage] = useState(''); // Message de confirmation
  const navigate = useNavigate(); // Utilisez le hook useNavigate pour la navigation

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ?");
    if (confirmDelete) {
      try {
        await axios.delete(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(users.filter(user => user._id !== userId));
        setMessage('Le compte a été supprimé avec succès.');
      } catch (error) {
        console.error('Error deleting user', error);
      }
    }
  };

  const handleUpdateClick = (user) => {
    setEditingUserId(user._id);
    setEditedData({
      firstName: user.firstName,
      lastName: user.lastName,  // Inclure lastName ici
      username: user.username,
      role: user.role
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };

  const handleUpdateSave = async () => {
    try {
      const response = await axios.put(`/api/users/${editingUserId}`, editedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(users.map(user => (user._id === editingUserId ? response.data : user)));
      setEditingUserId(null);
      setMessage('Les informations ont été mises à jour avec succès.');
    } catch (error) {
      console.error('Error updating user', error);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>
      <button onClick={() => navigate(-1)} className="back-button">Retour</button>
      
      {message && <div className="confirmation-message">{message}</div>}
      
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editedData.firstName}
                    onChange={handleInputChange}
                  />
                ) : (
                  user.firstName
                )}
              </td>
              <td>
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editedData.lastName}
                    onChange={handleInputChange}
                  />
                ) : (
                  user.lastName
                )}
              </td>
              <td>
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="username"
                    value={editedData.username}
                    onChange={handleInputChange}
                  />
                ) : (
                  user.username
                )}
              </td>
              <td>
                {editingUserId === user._id ? (
                  <select
                    name="role"
                    value={editedData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUserId === user._id ? (
                  <button onClick={handleUpdateSave}>Save</button>
                ) : (
                  <button onClick={() => handleUpdateClick(user)}>Update</button>
                )}
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
