// services/ticketsApi.js
import api from './api';
import { v4 as uuidv4 } from 'uuid';

export const ticketsApi = {
  // Comprar ticket
  comprarTicket: async (ticketData) => {
    try {
      const formData = new FormData();
      
      // Agregar campos básicos
      formData.append('rifaId', ticketData.rifaId);
      formData.append('cantidad', ticketData.cantidad);
      formData.append('metodoPago', ticketData.metodoPago);
      formData.append('referenciaPago', ticketData.referencia);
      
      const transaccionId = `TXN-${uuidv4()}`;
      
      // Agregar datos del comprador Y números de tickets
      const datosCompra = {
        comprador: {
          nombre: ticketData.nombre,
          email: ticketData.email,
          telefono: ticketData.telefono,
          estadoCiudad: ticketData.estadoCiudad,
          cedula: ticketData.cedula
        },
        metodoPago: ticketData.metodoPago,
        transaccionId: transaccionId, // Usar el nuevo transaccionId único
        referenciaPago: ticketData.referencia,
        numerosTickets: ticketData.numerosTickets
      };
      
      formData.append('datosCompra', JSON.stringify(datosCompra));
      
      // Agregar comprobante si existe
      if (ticketData.comprobante) {
        formData.append('comprobante', ticketData.comprobante);
      }

      const response = await api.post('/tickets/comprar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en ticketsApi.comprarTicket:', error);
      throw new Error(error.response?.data?.message || 'Error al comprar el ticket');
    }
  },

  // Obtener tickets por rifa
  obtenerTicketsPorRifa: async (rifaId, params = {}) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener tickets');
    }
  },

  // Método específico para tickets no verificados de una rifa
  obtenerTicketsNoVerificadosPorRifa: async (rifaId, pagina = 1, limite = 10) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}`, {
        params: {
          pagina,
          limite,
          verificado: false,
          estado: 'vendido'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener tickets no verificados');
    }
  },

  // Método específico para tickets verificados de una rifa
  obtenerTicketsVerificadosPorRifa: async (rifaId, pagina = 1, limite = 10) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}`, {
        params: {
          pagina,
          limite,
          verificado: true,
          estado: 'vendido'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener tickets verificados');
    }
  },

  obtenerComprasNoVerificadasPorRifa: async (rifaId, pagina = 1, limite = 10) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}/compras`, {
        params: {
          pagina,
          limite,
          verificado: false
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener compras no verificadas');
    }
  },

  obtenerComprasVerificadasPorRifa: async (rifaId, pagina = 1, limite = 10) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}/compras`, {
        params: {
          pagina,
          limite,
          verificado: true
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener compras verificadas');
    }
  },

  obtenerComprasPorEmail: async (rifaId, email) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}/compras`, {
        params: {
          email: email
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener compras por email');
    }
  },

  verificarTicketsPorEmail: async (rifaId, email) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}/verificar-tickets`, {
        params: { email }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar tickets por email');
    }
  },

  obtenerComprasPorRifa: async (rifaId, params = {}) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}/compras`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener compras');
    }
  },

  obtenerNumerosOcupados: async (rifaId) => {
    try {
      const response = await api.get(`/tickets/rifa/${rifaId}/numeros-ocupados`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener números ocupados');
    }
  },

  verificarCompra: async (transaccionId, verificadoPor) => {
    try {
      const response = await api.post(`/tickets/compra/${transaccionId}/verificar`, { verificadoPor });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar la compra');
    }
  },

  // Verificar ticket
  verificarTicket: async (ticketId, verificadoPor) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/verificar`, { verificadoPor });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar ticket');
    }
  },

  // Obtener tickets no verificados
  obtenerTicketsNoVerificados: async () => {
    try {
      const response = await api.get('/tickets/no-verificados');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener tickets no verificados');
    }
  },

  // Obtener métodos de pago disponibles
  obtenerMetodosPago: async () => {
    try {
      const response = await api.get('/tickets/metodos-pago');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener métodos de pago');
    }
  }
};

export default ticketsApi;