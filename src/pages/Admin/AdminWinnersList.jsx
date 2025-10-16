// src/pages/Admin/AdminWinnersList.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  EmojiEvents,
  ArrowBack,
  Visibility,
  Celebration,
  Refresh,
  LocalShipping,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import winnerApi from '../../services/winnerApi';

const AdminWinnersList = () => {
  const navigate = useNavigate();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  useEffect(() => {
    cargarGanadores();
  }, []);

  const cargarGanadores = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando lista de ganadores...');
      
      // Necesitamos crear esta función en winnerApi
      const response = await winnerApi.obtenerTodosLosGanadores();
      console.log('🏆 Respuesta de ganadores:', response);

      if (response.success) {
        setWinners(response.data || []);
        console.log(`✅ ${response.data?.length || 0} ganadores cargados`);
      } else {
        setError(response.message || 'Error al cargar los ganadores');
      }

    } catch (error) {
      console.error('❌ Error en cargarGanadores:', error);
      setError(error.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de detalles
  const handleOpenDetails = (winner) => {
    setSelectedWinner(winner);
    setDetailsModalOpen(true);
  };

  // Función para marcar como entregado
  const handleToggleDelivery = async (winnerId, entregado) => {
    setUpdatingDelivery(true);
    try {
      // Necesitamos crear esta función en winnerApi
      const response = await winnerApi.actualizarEstadoEntrega(winnerId, entregado);
      if (response.success) {
        setSuccess(entregado ? 'Premio marcado como entregado' : 'Premio marcado como no entregado');
        await cargarGanadores(); // Recargar la lista
      }
    } catch (error) {
      setError(error.message || 'Error al actualizar el estado de entrega');
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const getEstadoColor = (entregado) => {
    return entregado ? 'success' : 'warning';
  };

  const getEstadoText = (entregado) => {
    return entregado ? 'Entregado' : 'Pendiente';
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} sx={{ color: '#FF6B35' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Snackbars para feedback */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/admin')} 
            sx={{ mr: 2, color: '#FF6B35' }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
              Ganadores de Rifas
            </Typography>
            <Typography variant="body1" sx={{ color: '#dddee0ff' }}>
              Gestiona todos los ganadores del sistema
            </Typography>
          </Box>
        </Box>

        <Button
          startIcon={<Refresh />}
          onClick={cargarGanadores}
          variant="outlined"
          sx={{
            borderColor: '#FF6B35',
            color: '#FF6B35',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.1)'
            }
          }}
        >
          Actualizar
        </Button>
      </Box>

      {/* Lista de Ganadores */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Rifa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Ganador</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Número Ticket</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Premio</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Fecha Sorteo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Estado Entrega</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {winners.map((winner) => (
                  <TableRow 
                    key={winner._id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: winner.entregado ? 'rgba(76, 175, 80, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                          {winner.rifa?.titulo || 'Rifa no encontrada'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#718096' }}>
                          {winner.rifa?.descripcion ? winner.rifa.descripcion.substring(0, 60) + '...' : 'Sin descripción'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                          {winner.comprador.nombre}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#718096' }}>
                          {winner.comprador.email}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#718096', fontSize: '0.75rem' }}>
                          {winner.comprador.estadoCiudad}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: '#FFD700', 
                        color: '#000',
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        textAlign: 'center',
                        display: 'inline-block'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          #{winner.numeroTicket}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                        {winner.premio}
                      </Typography>
                      {winner.esGanadorPrincipal && (
                        <Chip 
                          label="Ganador Principal" 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#718096' }}>
                        {formatDate(winner.fechaSorteo)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getEstadoText(winner.entregado)} 
                        color={getEstadoColor(winner.entregado)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver Detalles Completos">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDetails(winner)}
                            sx={{ color: '#1976d2' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {winners.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <EmojiEvents sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#9e9e9e', mb: 1 }}>
                No hay ganadores registrados
              </Typography>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                Los ganadores aparecerán aquí una vez que se realicen los sorteos
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles del Ganador */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#4CAF50',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Celebration sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h6">
              Detalles del Ganador
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedWinner && (
            <Grid container spacing={3}>
              {/* Información de la Rifa */}
              <Grid item xs={12}>
                <Card sx={{ border: '2px solid #FF6B35' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#FF6B35', mb: 2, fontWeight: 'bold' }}>
                      INFORMACIÓN DE LA RIFA
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Título:</strong> {selectedWinner.rifa?.titulo || 'N/A'}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          <strong>Descripción:</strong> {selectedWinner.rifa?.descripcion || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Fecha del Sorteo:</strong> {formatDate(selectedWinner.fechaSorteo)}
                        </Typography>
                        {selectedWinner.esGanadorPrincipal && (
                          <Chip 
                            label="Ganador Principal" 
                            color="primary" 
                            sx={{ mt: 1 }} 
                          />
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Número Ganador Destacado */}
              <Grid item xs={12}>
                <Box sx={{ 
                  backgroundColor: '#FFD700', 
                  color: '#000',
                  borderRadius: 2,
                  py: 4,
                  textAlign: 'center',
                  border: '3px solid #FF6B35'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    NÚMERO GANADOR
                  </Typography>
                  <Typography variant="h1" sx={{ 
                    fontWeight: 'bold',
                    fontSize: '4rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    #{selectedWinner.numeroTicket}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                    PREMIO: {selectedWinner.premio}
                  </Typography>
                </Box>
              </Grid>

              {/* Información del Ganador */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#4CAF50', mb: 2, fontWeight: 'bold' }}>
                      INFORMACIÓN PERSONAL
                    </Typography>
                    <Box sx={{ space: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Nombre Completo:</strong> {selectedWinner.comprador.nombre}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Email:</strong> {selectedWinner.comprador.email}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Teléfono:</strong> {selectedWinner.comprador.telefono || 'No proporcionado'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Estado/Ciudad:</strong> {selectedWinner.comprador.estadoCiudad}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Cédula:</strong> {selectedWinner.comprador.cedula || 'No proporcionada'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Información de Entrega */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1976d2', mb: 2, fontWeight: 'bold' }}>
                      ESTADO DE ENTREGA
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Chip 
                        label={selectedWinner.entregado ? "ENTREGADO" : "PENDIENTE"} 
                        color={selectedWinner.entregado ? "success" : "warning"}
                        size="large"
                        sx={{ 
                          fontSize: '1.1rem',
                          padding: '8px 16px',
                          mb: 2
                        }}
                      />
                      
                      {selectedWinner.entregado && selectedWinner.fechaEntrega && (
                        <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                          <strong>Fecha de entrega:</strong> {formatDate(selectedWinner.fechaEntrega)}
                        </Typography>
                      )}
                      
                      {selectedWinner.notasEntrega && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            <strong>Notas de entrega:</strong> {selectedWinner.notasEntrega}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Información Adicional */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f9f9f9' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      <strong>ID del Ticket:</strong> {selectedWinner.ticket?._id || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mt: 1 }}>
                      <strong>Seleccionado por:</strong> {selectedWinner.seleccionadoPor?.nombre || 'Administrador'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>
            Cerrar
          </Button>
          <Button 
            onClick={() => handleToggleDelivery(selectedWinner?._id, !selectedWinner?.entregado)}
            variant="contained"
            startIcon={selectedWinner?.entregado ? <Cancel /> : <CheckCircle />}
            sx={{ 
              backgroundColor: selectedWinner?.entregado ? '#d32f2f' : '#4CAF50',
              '&:hover': {
                backgroundColor: selectedWinner?.entregado ? '#c62828' : '#45a049'
              }
            }}
          >
            {selectedWinner?.entregado ? 'Marcar como No Entregado' : 'Marcar como Entregado'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminWinnersList;