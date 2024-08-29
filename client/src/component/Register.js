import React, { useState , useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import styles from './styles/Register.css';


function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;
        const isValid = regex.test(password);
        console.log(`Password validation for "${password}": ${isValid}`);
        return isValid;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|gmail\.fr|hotmail\.com|outlook\.com)$/;
        return emailRegex.test(email);
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!validateEmail(username)) {
            setMessage('Veuillez entrer une adresse e-mail valide.');
            return;
        }
    
        if (!validatePassword(password)) {
            setMessage('Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/register', {
                username,
                password,
            });
            setMessage(response.data.message);
        } catch (error) {
            if (error.response && error.response.data.message){
                setMessage(error.response.data.message);
            } else {
                setMessage('There was an error registering !');
            }
        }
    };

    return (
        <div className="main-container">
            <div className="form-wrapper">
                <div className="form-header">
                    <div className="form-title">Register</div>
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
                    <input type="submit" value="Register" id="login-btn" />
                </form>
                {message && <p>{message}</p>}
                <div className="separator">or</div>
                <div className="alternative">
                    <button className="bi bi-google"></button>
                    <button className="bi bi-facebook"></button>
                    <button className="bi bi-discord"></button>
                </div>
                <div className="bottom">Already a member ?
                    <Link to="/login">
                        <span className="login-a"> Login Here</span>
                    </Link>
                </div>
            </div>
            <div className="bg"></div>
        </div>
    );
}

export default Register;
