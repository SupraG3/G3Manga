import axios from 'axios';

// Configuration d'axios pour inclure le token dans les en-têtes
const instance = axios.create({
    baseURL: 'http://localhost:5000',
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;