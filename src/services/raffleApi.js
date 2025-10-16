// services/raffleApi.js - ACTUALIZADO
import api from './api';

export const raffleApi = {
  // Crear nueva rifa
  crearRaffle: async (raffleData) => {
    try {
      const formData = new FormData();
      
      // Agregar campos básicos (sin premios)
      formData.append('titulo', raffleData.titulo);
      formData.append('descripcion', raffleData.descripcion);
      formData.append('precioTicket', raffleData.precioTicket);
      formData.append('minTickets', raffleData.minTickets);
      formData.append('ticketsTotales', raffleData.ticketsTotales);
      
      // Agregar fecha de sorteo si existe
      if (raffleData.fechaSorteo) {
        formData.append('fechaSorteo', raffleData.fechaSorteo);
      }
      
      // Agregar imagen si existe
      if (raffleData.imagen) {
        formData.append('imagen', raffleData.imagen);
      }

      const response = await api.post('/raffles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw new Error(error.response?.data?.message || 'Error al crear la rifa');
    }
  },

  // Los demás métodos se mantienen igual...
  obtenerRaffles: async (pagina = 1, limite = 10, filtros = {}) => {
    try {
      console.log('🔍 Fetching raffles with params:', { pagina, limite, filtros });
      
      const params = {
        pagina: pagina.toString(),
        limite: limite.toString(),
        ...filtros
      };

      // Limpiar parámetros undefined
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await api.get('/raffles', { 
        params,
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        }
      });
      
      console.log('✅ Raffles fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching raffles:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las rifas');
    }
  },

  // Obtener rifa por ID
  obtenerRaffle: async (id) => {
    try {
      const response = await api.get(`/raffles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la rifa');
    }
  },

  // Actualizar rifa
  actualizarRaffle: async (id, raffleData) => {
    try {
      const response = await api.put(`/raffles/${id}`, raffleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la rifa');
    }
  },

  eliminarRaffle: async (id) => {
    try {
      const response = await api.delete(`/raffles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la rifa');
    }
  },

  actualizarImagenRaffle: async (raffleId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('imagen', imageFile);

      const response = await api.patch(`/raffles/${raffleId}/imagen`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la imagen');
    }
  },

  // Obtener rifa activa (para dashboard público)
  obtenerRifaActiva: async () => {
    try {
      const response = await api.get('/raffles/activa');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener rifa activa');
    }
  },

  // Actualizar imagen de la rifa
  actualizarImagen: async (id, imagen) => {
    try {
      const formData = new FormData();
      formData.append('imagen', imagen);

      const response = await api.patch(`/raffles/${id}/imagen`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar imagen');
    }
  },

  // Obtener estadísticas
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/raffles/admin/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
};

export default raffleApi;