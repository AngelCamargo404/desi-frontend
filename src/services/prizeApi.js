// services/prizeApi.js
import api from './api';

export const prizeApi = {
  // Crear premio individual
  crearPrize: async (prizeData) => {
    try {
      const response = await api.post('/prizes', prizeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear el premio');
    }
  },

  // Crear múltiples premios para una rifa
  crearPremiosParaRifa: async (rifaId, premios) => {
    try {
      // Asegurar que los premios tengan el formato correcto
      const premiosData = premios.map((premio, index) => ({
        nombre: premio.nombre || `Premio ${index + 1}`,
        descripcion: premio.descripcion,
        valor: premio.valor ? parseFloat(premio.valor) : undefined,
        posicion: index + 1
      }));

      const response = await api.post(`/prizes/rifa/${rifaId}/multiples`, { 
        premios: premiosData 
      });
      return response.data;
    } catch (error) {
      console.error('Error en prizeApi.crearPremiosParaRifa:', error);
      throw new Error(error.response?.data?.message || 'Error al crear los premios');
    }
  },

  // Obtener premios por rifa
  obtenerPrizesPorRifa: async (rifaId, incluirInactivos = false) => {
    try {
      const response = await api.get(`/prizes/rifa/${rifaId}`, {
        params: { incluirInactivos }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener premios');
    }
  },

  // Actualizar premio
  actualizarPrize: async (id, prizeData) => {
    try {
      const response = await api.put(`/prizes/${id}`, prizeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el premio');
    }
  },

  eliminarPrize: async (id) => {
    try {
      const response = await api.delete(`/prizes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el premio');
    }
  },

  // Asignar ganador a premio
  asignarGanador: async (prizeId, ticketId) => {
    try {
      const response = await api.patch(`/prizes/${prizeId}/asignar-ganador`, { ticketId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al asignar ganador');
    }
  }
};

export default prizeApi;