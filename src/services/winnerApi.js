// src/services/winnerApi.js - ACTUALIZADO
import api from './api';

export const winnerApi = {
  // Seleccionar ganador aleatorio (mantener por compatibilidad)
  seleccionarGanadorAleatorio: async (raffleId) => {
    try {
      const response = await api.post(`/winners/raffle/${raffleId}/random-winner`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al seleccionar el ganador');
    }
  },

  // NUEVO: Seleccionar múltiples ganadores según la cantidad de premios
  seleccionarMultiplesGanadores: async (raffleId) => {
    try {
      const response = await api.post(`/winners/raffle/${raffleId}/multiple-winners`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al seleccionar los ganadores');
    }
  },

  obtenerTodosLosGanadores: async () => {
    try {
      const response = await api.get('/winners');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener los ganadores');
    }
  },

  // Actualizar estado de entrega
  actualizarEstadoEntrega: async (winnerId, entregado, notasEntrega = '') => {
    try {
      const response = await api.put(`/winners/${winnerId}/entrega`, {
        entregado,
        fechaEntrega: entregado ? new Date().toISOString() : null,
        notasEntrega
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado de entrega');
    }
  },

  // Obtener ganadores de una rifa
  obtenerGanadoresPorRifa: async (raffleId) => {
    try {
      const response = await api.get(`/winners/raffle/${raffleId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener los ganadores');
    }
  }
};

export default winnerApi;