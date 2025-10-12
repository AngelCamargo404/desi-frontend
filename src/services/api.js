import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Puedes agregar tokens de autenticación aquí
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo centralizado de errores
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;