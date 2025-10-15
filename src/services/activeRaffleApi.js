// services/activeRaffleApi.js - SIMPLIFICADO
import api from './api';

const activeRaffleApi = {
  // Obtener rifa activa (público)
  obtenerRifaActiva: async () => {
    try {
      const response = await api.get('/active-raffle/activa');
      return response.data;
    } catch (error) {
      // Si es 404 (no hay rifa activa), retornar un objeto consistente
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'No hay rifa activa'
        };
      }
      throw error.response?.data || error;
    }
  },

  // Activar una rifa (admin) - REEMPLAZA la actual
  activarRifa: async (raffleId) => {
    try {
      const response = await api.post('/active-raffle/activar', { raffleId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener información de la rifa activa (admin)
  obtenerInfoRifaActiva: async () => {
    try {
      const response = await api.get('/active-raffle/info');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Desactivar todas las rifas (admin)
  desactivarTodas: async () => {
    try {
      const response = await api.delete('/active-raffle/desactivar');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default activeRaffleApi;