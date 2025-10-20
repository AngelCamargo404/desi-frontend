// services/prizeApi.js - ACTUALIZADO con campos opcionales
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

  // Crear múltiples premios para una rifa - ACTUALIZADO
  crearPremiosParaRifa: async (rifaId, premios) => {
    try {
      // Asegurar que los premios tengan el formato correcto con soporte para premios no monetarios
      const premiosData = premios.map((premio, index) => {
        const premioData = {
          nombre: premio.nombre || `Premio ${index + 1}`,
          descripcion: premio.descripcion,
          posicion: index + 1
        };

        // Solo incluir campos de valor si existen
        if (premio.moneda) {
          premioData.moneda = premio.moneda;
        }
        if (premio.valor !== undefined && premio.valor !== null && premio.valor !== '') {
          premioData.valor = parseFloat(premio.valor);
        }
        if (premio.valorBS !== undefined && premio.valorBS !== null && premio.valorBS !== '') {
          premioData.valorBS = parseFloat(premio.valorBS);
        }

        return premioData;
      });

      const response = await api.post(`/prizes/rifa/${rifaId}/multiples`, { 
        premios: premiosData 
      });
      return response.data;
    } catch (error) {
      console.error('Error en prizeApi.crearPremiosParaRifa:', error);
      throw new Error(error.response?.data?.message || 'Error al crear los premios');
    }
  },

  // Los demás métodos se mantienen igual...
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