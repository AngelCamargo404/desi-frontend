// services/paymentMethodsApi.js
import api from './api';

export const paymentMethodsApi = {
  // Obtener todos los métodos de pago (admin)
  obtenerTodos: async () => {
    try {
      const response = await api.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo métodos de pago:', error);
      // Retornar datos vacíos en lugar de lanzar error
      return {
        success: false,
        data: []
      };
    }
  },

  // Obtener métodos de pago activos (público)
  obtenerActivos: async () => {
    try {
      const response = await api.get('/payment-methods/activos');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo métodos de pago activos:', error);
      // Retornar datos vacíos para evitar que falle la compra
      return {
        success: false,
        data: []
      };
    }
  },

  // Obtener método de pago por código
  obtenerPorCodigo: async (codigo) => {
    try {
      const response = await api.get(`/payment-methods/${codigo}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error obteniendo método de pago ${codigo}:`, error);
      return {
        success: false,
        data: null
      };
    }
  },

  // Crear método de pago
  crear: async (datos) => {
    try {
      const response = await api.post('/payment-methods', datos);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear método de pago');
    }
  },

  // Actualizar método de pago
  actualizar: async (codigo, datos) => {
    try {
      const response = await api.put(`/payment-methods/${codigo}`, datos);
      return response.data;
    } catch (error) {
      console.log(error);
      
      throw new Error(error.response?.data?.message || 'Error al actualizar método de pago');
    }
  },

  // Eliminar método de pago
  eliminar: async (codigo) => {
    try {
      const response = await api.delete(`/payment-methods/${codigo}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar método de pago');
    }
  },

  // Cambiar estado (activar/desactivar)
  cambiarEstado: async (codigo, activo) => {
    try {
      const response = await api.patch(`/payment-methods/${codigo}/estado`, { activo });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado');
    }
  }
};

export default paymentMethodsApi;