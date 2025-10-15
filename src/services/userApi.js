// src/services/userApi.js
import api from './api';

export const userApi = {
  // Crear usuario (solo superadmin)
  crearUsuario: async (userData) => {
    try {
      const response = await api.post('/auth/admin/crear-usuario', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  },

  // Obtener todos los usuarios (solo superadmin)
  obtenerUsuarios: async (pagina = 1, limite = 10, filtros = {}) => {
    try {
      const params = { pagina, limite, ...filtros };
      const response = await api.get('/auth/usuarios', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  // Obtener usuario por ID (solo superadmin)
  obtenerUsuario: async (id) => {
    try {
      const response = await api.get(`/auth/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  },

  // Actualizar usuario (solo superadmin)
  actualizarUsuario: async (id, userData) => {
    try {
      const response = await api.put(`/auth/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  },

  // Eliminar usuario (solo superadmin)
  eliminarUsuario: async (id) => {
    try {
      const response = await api.delete(`/auth/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  },

  // Activar usuario (solo superadmin)
  activarUsuario: async (id) => {
    try {
      const response = await api.patch(`/auth/usuarios/${id}/activar`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al activar usuario');
    }
  },

  // Obtener estadísticas de usuarios (solo superadmin)
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/auth/usuarios/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
};

export default userApi;