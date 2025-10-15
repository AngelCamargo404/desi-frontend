// services/loginApi.js
import api from './api';

export const loginApi = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
        console.log("error", error);
        
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  },

  // Verificar token
  verificarToken: async () => {
    try {
      const response = await api.get('/auth/verificar');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar token');
    }
  },

  // Obtener perfil
  obtenerPerfil: async () => {
    try {
      const response = await api.get('/auth/perfil');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cerrar sesión');
    }
  },

  // Cambiar contraseña
  cambiarPassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/cambiar-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  }
};

export default loginApi;