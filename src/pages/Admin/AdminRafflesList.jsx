// src/pages/admin/AdminRafflesList.jsx - ACTUALIZADO con fecha de sorteo
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Casino,
  ArrowBack,
  CheckCircle,
  Cancel,
  Visibility,
  Star,
  Refresh,
  Edit,
  Delete,
  CardGiftcard,
  Add,
  Remove,
  AttachMoney,
  PhotoCamera,
  Numbers,
  EmojiEvents, 
  Celebration,
  Event,
  CurrencyExchange
} from '@mui/icons-material';
import raffleApi from '../../services/raffleApi';
import activeRaffleApi from '../../services/activeRaffleApi';
import prizeApi from '../../services/prizeApi';
import winnerApi from '../../services/winnerApi';
import ModalGanador from '../../components/modals/ModalGanador';
import ModalMultiplesGanadores from '../../components/modals/ModalMultiplesGanadores';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

const AdminRafflesList = () => {
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeRaffle, setActiveRaffle] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    raffle: null,
    type: '' // 'activate', 'delete', 'delete-prize'
  });

  // Estados para modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [editPrizeModalOpen, setEditPrizeModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [editRaffleModalOpen, setEditRaffleModalOpen] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState(null);

  // Estado para formulario de edición de premio
  const [prizeForm, setPrizeForm] = useState({
    nombre: '',
    descripcion: '',
    valor: '',
    condiciones: '',
    posicion: 1
  });

  // Estado para formulario de edición de rifa - ACTUALIZADO con fecha de sorteo
  const [raffleForm, setRaffleForm] = useState({
    titulo: '',
    descripcion: '',
    precioTicket: '',
    precioTicketBS: '', // Nuevo campo
    moneda: 'USD', // Nuevo campo
    minTickets: '',
    ticketsTotales: '',
    estado: '',
    imagen: null,
    nuevaImagen: null,
    fechaSorteo: '',
    tieneFechaSorteo: false
  });

  // Estado para vista previa de imagen
  const [imagePreview, setImagePreview] = useState(null);

  const [winnersModalOpen, setWinnersModalOpen] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [selectingWinners, setSelectingWinners] = useState(false);

  const [sorteoConfirmModal, setSorteoConfirmModal] = useState({
    open: false,
    raffleId: null,
    numPremios: 0,
    numTickets: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      
      // Cargar todas las rifas
      const rafflesResponse = await raffleApi.obtenerRaffles(1, 50);


      // Cargar información de la rifa activa actual
      const activeResponse = await activeRaffleApi.obtenerInfoRifaActiva();
      

      if (rafflesResponse.success) {
        setRaffles(rafflesResponse.data.raffles || []);
      } else {
        setError(rafflesResponse.message || 'Error al cargar las rifas');
      }

      if (activeResponse.success && activeResponse.data) {
        setActiveRaffle(activeResponse.data.raffleId);
      } else {
        setActiveRaffle(null);
      }

    } catch (error) {
      console.error('❌ Error en cargarDatos:', error);
      setError(error.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMultipleWinners = async (raffleId) => {
    try {
      // Primero cargar los premios para saber cuántos ganadores se necesitan
      const premiosResponse = await prizeApi.obtenerPrizesPorRifa(raffleId);
      
      if (!premiosResponse.success || premiosResponse.data.length === 0) {
        setError('La rifa no tiene premios configurados');
        return;
      }

      const numPremios = premiosResponse.data.length;

      // Abrir modal de confirmación
      handleOpenSorteoConfirm(raffleId, numPremios);

    } catch (error) {
      setError(error.message || 'Error al cargar los premios de la rifa');
    }
  };

  const handleOpenSorteoConfirm = async (raffleId) => {
    try {
      // Cargar información de la rifa y premios
      const premiosResponse = await prizeApi.obtenerPrizesPorRifa(raffleId);
      
      if (!premiosResponse.success || premiosResponse.data.length === 0) {
        setError('La rifa no tiene premios configurados');
        return;
      }

      const numPremios = premiosResponse.data.length;
      
      // Obtener información de tickets vendidos
      const rifaInfo = raffles.find(r => r._id === raffleId);
      const numTickets = rifaInfo?.ticketsVendidos || 0;

      if (numTickets < numPremios) {
        setError(`No hay suficientes tickets vendidos (${numTickets}) para asignar ${numPremios} premios`);
        return;
      }

      setSorteoConfirmModal({
        open: true,
        raffleId,
        numPremios,
        numTickets
      });

    } catch (error) {
      setError(error.message || 'Error al preparar el sorteo');
    }
  };

  // Función para cerrar el modal de confirmación de sorteo
  const handleCloseSorteoConfirm = () => {
    setSorteoConfirmModal({
      open: false,
      raffleId: null,
      numPremios: 0,
      numTickets: 0
    });
  };

  const handleConfirmSorteo = async () => {
    const { raffleId, numPremios } = sorteoConfirmModal;
    
    if (!raffleId) return;

    setSelectingWinners(true);
    try {
      const response = await winnerApi.seleccionarMultiplesGanadores(raffleId);
      
      if (response.success) {
        setSelectedWinners(response.data);
        setWinnersModalOpen(true);
        setSuccess(`¡${response.data.length} ganadores seleccionados exitosamente para ${numPremios} premios!`);
      } else {
        setError(response.message || 'Error al seleccionar los ganadores');
      }
    } catch (error) {
      setError(error.message || 'Error al seleccionar los ganadores');
    } finally {
      setSelectingWinners(false);
      handleCloseSorteoConfirm();
    }
  };

  // Función para cargar premios de una rifa
  const cargarPremios = async (raffleId) => {
    try {
      const response = await prizeApi.obtenerPrizesPorRifa(raffleId);
      if (response.success) {
        setPrizes(response.data);
      } else {
        setError('Error al cargar los premios');
      }
    } catch (error) {
      setError(error.message || 'Error al cargar los premios');
    }
  };

  // Función para abrir modal de detalles
  const handleOpenDetails = async (raffle) => {
    setSelectedRaffle(raffle);
    setDetailsModalOpen(true);
    await cargarPremios(raffle._id);
  };

  // Función para abrir modal de edición de premio
  const handleOpenEditPrize = (prize) => {
    setEditingPrize(prize);
    setPrizeForm({
      nombre: prize.nombre || '',
      descripcion: prize.descripcion || '',
      valor: prize.valor || '',
      condiciones: prize.condiciones || '',
      posicion: prize.posicion || 1
    });
    setEditPrizeModalOpen(true);
  };

  // Función para abrir modal de edición de rifa - ACTUALIZADA con fecha de sorteo
  const handleOpenEditRaffle = (raffle) => {
    setEditingRaffle(raffle);
    
    // Formatear la fecha para el input datetime-local si existe
    let fechaFormateada = '';
    if (raffle.fechaSorteo) {
      const fecha = new Date(raffle.fechaSorteo);
      fechaFormateada = fecha.toISOString().slice(0, 16);
    }

    setRaffleForm({
      titulo: raffle.titulo || '',
      descripcion: raffle.descripcion || '',
      precioTicket: raffle.precioTicket || '',
      precioTicketBS: raffle.precioTicketBS || '', // Nuevo campo
      moneda: raffle.moneda || 'USD', // Nuevo campo
      minTickets: raffle.minTickets || '',
      ticketsTotales: raffle.ticketsTotales || '',
      estado: raffle.estado || 'activa',
      imagen: raffle.imagen || null,
      nuevaImagen: null,
      fechaSorteo: fechaFormateada,
      tieneFechaSorteo: !!raffle.fechaSorteo
    });
    setImagePreview(raffle.imagen?.url || null);
    setEditRaffleModalOpen(true);
  };

  const handleMonedaChange = (event) => {
    const moneda = event.target.value;
    setRaffleForm(prev => ({
      ...prev,
      moneda: moneda
    }));
  };

  // NUEVO: Manejar cambio de precio en BS
  const handlePrecioTicketBSChange = (event) => {
    setRaffleForm(prev => ({
      ...prev,
      precioTicketBS: event.target.value
    }));
  };

  // NUEVO: Manejar cambio de precio en USD
  const handlePrecioTicketChange = (event) => {
    setRaffleForm(prev => ({
      ...prev,
      precioTicket: event.target.value
    }));
  };

  // Función para manejar cambio de imagen
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRaffleForm(prev => ({
        ...prev,
        nuevaImagen: file
      }));
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // NUEVO: Manejar el toggle de fecha de sorteo
  const handleToggleFechaSorteo = (event) => {
    const tieneFecha = event.target.checked;
    setRaffleForm(prev => ({
      ...prev,
      tieneFechaSorteo: tieneFecha,
      fechaSorteo: tieneFecha ? prev.fechaSorteo : ''
    }));
  };

  // NUEVO: Manejar cambio de fecha
  const handleFechaSorteoChange = (event) => {
    setRaffleForm(prev => ({
      ...prev,
      fechaSorteo: event.target.value
    }));
  };

  // Función para guardar premio editado
  const handleSavePrize = async () => {
    try {
      const prizeData = {
        ...prizeForm,
        valor: prizeForm.valor ? parseFloat(prizeForm.valor) : undefined,
        posicion: parseInt(prizeForm.posicion)
      };

      const response = await prizeApi.actualizarPrize(editingPrize.id, prizeData);
      if (response.success) {
        setSuccess('Premio actualizado exitosamente');
        setEditPrizeModalOpen(false);
        // Recargar premios
        await cargarPremios(selectedRaffle._id);
      }
    } catch (error) {
      setError(error.message || 'Error al actualizar el premio');
    }
  };

  // Función para guardar rifa editada - ACTUALIZADA con fecha de sorteo
  const handleSaveRaffle = async () => {
    try {
      setLoading(true);
      
      // Validaciones básicas
      if (!raffleForm.titulo.trim()) {
        throw new Error('El título de la rifa es requerido');
      }

      // Validar precio según la moneda seleccionada
      if (raffleForm.moneda === 'USD' && (!raffleForm.precioTicket || raffleForm.precioTicket <= 0)) {
        throw new Error('El precio del ticket en USD debe ser mayor a 0');
      }
      
      if (raffleForm.moneda === 'BS' && (!raffleForm.precioTicketBS || raffleForm.precioTicketBS <= 0)) {
        throw new Error('El precio del ticket en BS debe ser mayor a 0');
      }

      // Validar fecha si está activada
      if (raffleForm.tieneFechaSorteo && !raffleForm.fechaSorteo) {
        throw new Error('Debe seleccionar una fecha de sorteo');
      }

      // Validar que la fecha no sea en el pasado si está activada
      if (raffleForm.tieneFechaSorteo && raffleForm.fechaSorteo) {
        const fechaSorteo = new Date(raffleForm.fechaSorteo);
        const ahora = new Date();
        if (fechaSorteo <= ahora) {
          throw new Error('La fecha del sorteo debe ser futura');
        }
      }

      // Preparar datos para enviar
      const raffleData = {
        titulo: raffleForm.titulo,
        descripcion: raffleForm.descripcion,
        precioTicket: raffleForm.moneda === 'USD' ? parseFloat(raffleForm.precioTicket) : parseFloat(raffleForm.precioTicketBS),
        precioTicketBS: raffleForm.moneda === 'BS' ? parseFloat(raffleForm.precioTicketBS) : (raffleForm.precioTicketBS ? parseFloat(raffleForm.precioTicketBS) : null),
        moneda: raffleForm.moneda,
        minTickets: parseInt(raffleForm.minTickets),
        ticketsTotales: parseInt(raffleForm.ticketsTotales),
        estado: raffleForm.estado
      };

      // Solo incluir fechaSorteo si está activada y tiene valor
      if (raffleForm.tieneFechaSorteo && raffleForm.fechaSorteo) {
        raffleData.fechaSorteo = raffleForm.fechaSorteo;
      } else {
        // Si no está activada, eliminar la fecha de sorteo
        raffleData.fechaSorteo = null;
      }

      // 1. Primero actualizar los datos de la rifa
      const response = await raffleApi.actualizarRaffle(editingRaffle._id, raffleData);
      
      // 2. Si hay una nueva imagen, actualizarla por separado
      if (raffleForm.nuevaImagen) {
        try {
          await raffleApi.actualizarImagenRaffle(editingRaffle._id, raffleForm.nuevaImagen);
        } catch (imageError) {
          console.error('Error actualizando imagen:', imageError);
          // No lanzamos error aquí para no revertir la actualización de datos
          setError('Rifa actualizada pero hubo un error con la imagen: ' + imageError.message);
        }
      }

      if (response.success) {
        setSuccess('Rifa actualizada exitosamente');
        setEditRaffleModalOpen(false);
        // Recargar datos
        await cargarDatos();
      } else {
        throw new Error(response.message || 'Error al actualizar la rifa');
      }
    } catch (error) {
      console.error('Error completo al actualizar rifa:', error);
      setError(error.message || 'Error al actualizar la rifa');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar premio
  const handleDeletePrize = async () => {
    try {
      const response = await prizeApi.eliminarPrize(confirmDialog.raffle.id);
      if (response.success) {
        setSuccess('Premio eliminado exitosamente');
        setConfirmDialog({ open: false, raffle: null, type: '' });
        // Recargar premios
        await cargarPremios(selectedRaffle._id);
      }
    } catch (error) {
      setError(error.message || 'Error al eliminar el premio');
    }
  };

  // Función para eliminar rifa
  const handleDeleteRaffle = async () => {
    try {
      const response = await raffleApi.eliminarRaffle(confirmDialog.raffle._id);
      if (response.success) {
        setSuccess('Rifa eliminada exitosamente');
        setConfirmDialog({ open: false, raffle: null, type: '' });
        // Recargar datos
        await cargarDatos();
      }
    } catch (error) {
      setError(error.message || 'Error al eliminar la rifa');
    }
  };

  const handleActivarRifa = async (raffle) => {
    setActivating(true);
    try {
      
      const response = await activeRaffleApi.activarRifa(raffle._id);
      
      if (response.success) {
        setActiveRaffle(raffle);
        setSuccess(`"${raffle.titulo}" es ahora la única rifa activa en el sistema`);
        setConfirmDialog({ open: false, raffle: null, type: '' });
        await cargarDatos();
      }
    } catch (error) {
      console.error('❌ Error al activar rifa:', error);
      setError(error.message || 'Error al activar la rifa');
    } finally {
      setActivating(false);
    }
  };

  const openConfirmDialog = (raffle, type) => {
    setConfirmDialog({
      open: true,
      raffle,
      type
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      raffle: null,
      type: ''
    });
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activa: 'success',
      pausada: 'warning',
      finalizada: 'primary',
      cancelada: 'error'
    };
    return colors[estado] || 'default';
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
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

      <ModalMultiplesGanadores
        open={winnersModalOpen}
        onClose={() => setWinnersModalOpen(false)}
        winners={selectedWinners}
      />

      <ConfirmationModal
        open={sorteoConfirmModal.open}
        onClose={handleCloseSorteoConfirm}
        onConfirm={handleConfirmSorteo}
        title="Confirmar Sorteo de Múltiples Ganadores"
        message={
          <Box sx={{ lineHeight: 1.6 }}>
            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              ¿Está seguro de que desea realizar el sorteo para <strong>{sorteoConfirmModal.numPremios} premios</strong> de esta rifa?
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B35', mb: 1 }}>
                Detalles del sorteo:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Se seleccionarán <strong>{sorteoConfirmModal.numPremios} ganadores distintos</strong>
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Se asignará <strong>un premio diferente a cada ganador</strong>
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  El primer premio será designado como <strong>"Ganador Principal"</strong>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                ⚠️ Esta acción no se puede deshacer
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Tickets participantes:
              </Typography>
              <Chip 
                label={sorteoConfirmModal.numTickets} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
        }
        confirmText="Realizar Sorteo"
        cancelText="Cancelar"
        loading={selectingWinners}
        severity="warning"
      />

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
              Gestión de Rifas
            </Typography>
            <Typography variant="body1" sx={{ color: '#dddee0ff' }}>
              Administra todas las rifas del sistema
            </Typography>
          </Box>
        </Box>

        <Button
          startIcon={<Refresh />}
          onClick={cargarDatos}
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

      {/* Rifa Activa Actual */}
      {activeRaffle && (
        <Card sx={{ mb: 4, border: '2px solid #4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star sx={{ color: '#4CAF50', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 'bold', mb: 0.5 }}>
                    Rifa Activa Actual
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#dddee0ff' }}>
                    {activeRaffle.titulo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold', mt: 0.5 }}>
                    Esta rifa se está mostrando en el dashboard público
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Lista de Rifas */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Imagen</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Título</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Tickets Vendidos</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Progreso</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Precio Ticket</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2D3748' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {raffles.map((raffle) => (
                  <TableRow 
                    key={raffle._id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: activeRaffle && activeRaffle._id === raffle._id ? 'rgba(76, 175, 80, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Avatar
                        src={raffle.imagen?.url}
                        variant="rounded"
                        sx={{ 
                          width: 60, 
                          height: 60,
                          border: '2px solid #FF6B35'
                        }}
                      >
                        <Casino />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                            {raffle.titulo}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#718096' }}>
                            {raffle.descripcion.substring(0, 60)}...
                          </Typography>
                          {/* NUEVO: Mostrar fecha de sorteo si existe */}
                          {raffle.fechaSorteo && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Event sx={{ fontSize: 14, color: '#FF6B35', mr: 0.5 }} />
                              <Typography variant="caption" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                                Sorteo: {new Date(raffle.fechaSorteo).toLocaleDateString('es-ES')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={raffle.estado} 
                        color={getEstadoColor(raffle.estado)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {raffle.ticketsVendidos} / {raffle.ticketsTotales}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100px' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              backgroundColor: '#e0e0e0',
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                backgroundColor: '#FF6B35',
                                width: `${(raffle.ticketsVendidos / raffle.ticketsTotales) * 100}%`
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#718096', minWidth: 35 }}>
                          {Math.round((raffle.ticketsVendidos / raffle.ticketsTotales) * 100)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                        {raffle.moneda === 'USD' 
                          ? `$${raffle.precioTicket}` 
                          : `BS ${raffle.precioTicketBS}`
                        }
                        <Typography variant="caption" sx={{ color: '#718096', ml: 1 }}>
                          ({raffle.moneda})
                        </Typography>
                      </Typography>
                      {/* Mostrar precio equivalente si existe */}
                      {raffle.moneda === 'USD' && raffle.precioTicketBS && (
                        <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                          BS {raffle.precioTicketBS}
                        </Typography>
                      )}
                      {raffle.moneda === 'BS' && raffle.precioTicket && (
                        <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                          ${raffle.precioTicket}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>

                        <Tooltip title="Ver Tickets">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Numbers />}
                            onClick={() => navigate(`/admin/raffles/${raffle._id}/tickets`)}
                            sx={{ 
                              fontSize: '0.75rem',
                              borderColor: '#9C27B0',
                              color: '#9C27B0',
                              '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                borderColor: '#9C27B0'
                              }
                            }}
                          >
                            Tickets
                          </Button>
                        </Tooltip>

                        <Tooltip title="Activar en dashboard">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={activeRaffle && activeRaffle._id === raffle._id ? <CheckCircle /> : <Visibility />}
                            onClick={() => openConfirmDialog(raffle, 'activate')}
                            disabled={raffle.estado !== 'activa' || (activeRaffle && activeRaffle._id === raffle._id)}
                            sx={{
                              backgroundColor: activeRaffle && activeRaffle._id === raffle._id ? '#4CAF50' : '#FF6B35',
                              '&:hover': {
                                backgroundColor: activeRaffle && activeRaffle._id === raffle._id ? '#45a049' : '#FF8E53'
                              },
                              fontSize: '0.75rem'
                            }}
                          >
                            {activeRaffle && activeRaffle._id === raffle._id ? 'Activa' : 'Activar'}
                          </Button>
                        </Tooltip>

                        <Tooltip title="Ver Detalles y Premios">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CardGiftcard />}
                            onClick={() => handleOpenDetails(raffle)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Detalles
                          </Button>
                        </Tooltip>

                        <Tooltip title="Seleccionar Ganadores para Todos los Premios">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EmojiEvents />}
                            onClick={() => handleSelectMultipleWinners(raffle._id)}
                            disabled={selectingWinners || raffle.ticketsVendidos === 0}
                            sx={{ 
                              fontSize: '0.75rem',
                              borderColor: '#FFD700',
                              color: '#FFD700',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                borderColor: '#FFD700'
                              }
                            }}
                          >
                            {selectingWinners ? 'Seleccionando...' : 'Sortear'}
                          </Button>
                        </Tooltip>

                        <Tooltip title="Editar Rifa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditRaffle(raffle)}
                            sx={{ color: '#1976d2' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar Rifa">
                          <IconButton
                            size="small"
                            onClick={() => openConfirmDialog(raffle, 'delete')}
                            sx={{ color: '#d32f2f' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {raffles.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Casino sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                No hay rifas creadas
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/create-raffle')}
                sx={{ mt: 2, backgroundColor: '#FF6B35' }}
              >
                Crear Primera Rifa
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalles y Premios */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CardGiftcard sx={{ mr: 1, color: '#FF6B35' }} />
            <Typography variant="h6">
              Premios de: {selectedRaffle?.titulo}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {prizes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CardGiftcard sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#9e9e9e', mb: 1 }}>
                No hay premios para esta rifa
              </Typography>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                Puedes agregar premios editando la rifa
              </Typography>
            </Box>
          ) : (
            <List>
              {prizes.map((prize, index) => (
                <ListItem key={prize.id} divider={index < prizes.length - 1}>
                  <ListItemText
                    primary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`Posición ${prize.posicion}`}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {prize.nombre}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                          {prize.descripcion}
                        </Typography>
                        {prize.valor && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AttachMoney sx={{ fontSize: 16, color: '#4CAF50', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              Valor: ${prize.valor}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Editar Premio">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditPrize(prize)}
                          sx={{ color: '#1976d2' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Premio">
                        <IconButton
                          size="small"
                          onClick={() => openConfirmDialog(prize, 'delete-prize')}
                          sx={{ color: '#d32f2f' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edición de Premio */}
      <Dialog 
        open={editPrizeModalOpen} 
        onClose={() => setEditPrizeModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Edit sx={{ mr: 1, color: '#FF6B35' }} />
            <Typography variant="h6">
              Editar Premio
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Premio"
              value={prizeForm.nombre}
              onChange={(e) => setPrizeForm({ ...prizeForm, nombre: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={prizeForm.descripcion}
              onChange={(e) => setPrizeForm({ ...prizeForm, descripcion: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Valor"
                  type="number"
                  value={prizeForm.valor}
                  onChange={(e) => setPrizeForm({ ...prizeForm, valor: e.target.value })}
                  InputProps={{
                    startAdornment: <AttachMoney sx={{ color: '#FF6B35', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Posición"
                  type="number"
                  value={prizeForm.posicion}
                  onChange={(e) => setPrizeForm({ ...prizeForm, posicion: e.target.value })}
                  InputProps={{
                    startAdornment: <Numbers sx={{ color: '#FF6B35', mr: 1 }} />
                  }}
                  helperText="Número de orden del premio"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Condiciones (opcional)"
              multiline
              rows={2}
              value={prizeForm.condiciones}
              onChange={(e) => setPrizeForm({ ...prizeForm, condiciones: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPrizeModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSavePrize}
            variant="contained"
            sx={{ backgroundColor: '#FF6B35' }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edición de Rifa - ACTUALIZADO con monedas múltiples */}
      <Dialog 
        open={editRaffleModalOpen} 
        onClose={() => setEditRaffleModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Edit sx={{ mr: 1, color: '#FF6B35' }} />
            <Typography variant="h6">
              Editar Rifa: {editingRaffle?.titulo}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Sección de Imagen */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#2D3748' }}>
                Imagen de la Rifa
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar
                  src={imagePreview}
                  variant="rounded"
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: '3px solid #FF6B35'
                  }}
                >
                  <Casino sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 1 }}
                  >
                    Cambiar Imagen
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  <Typography variant="body2" sx={{ color: '#718096', fontSize: '0.75rem' }}>
                    Formatos: JPG, PNG, WEBP
                    <br />
                    Máx: 5MB
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* NUEVA SECCIÓN: Moneda y Precios */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyExchange sx={{ color: '#FF6B35', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#2D3748' }}>
                  Configuración de Moneda y Precios
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Moneda Principal</InputLabel>
                    <Select
                      value={raffleForm.moneda}
                      label="Moneda Principal"
                      onChange={handleMonedaChange}
                    >
                      <MenuItem value="USD">Dólares (USD)</MenuItem>
                      <MenuItem value="BS">Bolívares (BS)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Campos de precio según moneda seleccionada */}
                {raffleForm.moneda === 'USD' ? (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Precio por Ticket (USD)"
                        type="number"
                        value={raffleForm.precioTicket}
                        onChange={handlePrecioTicketChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney sx={{ color: '#FF6B35' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Precio en BS (Opcional)"
                        type="number"
                        value={raffleForm.precioTicketBS}
                        onChange={handlePrecioTicketBSChange}
                        placeholder="Equivalente en bolívares"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ color: '#FF6B35', fontWeight: 'bold' }}>BS</Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Precio por Ticket (BS)"
                        type="number"
                        value={raffleForm.precioTicketBS}
                        onChange={handlePrecioTicketBSChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ color: '#FF6B35', fontWeight: 'bold' }}>BS</Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Precio en USD (Opcional)"
                        type="number"
                        value={raffleForm.precioTicket}
                        onChange={handlePrecioTicketChange}
                        placeholder="Equivalente en dólares"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney sx={{ color: '#FF6B35' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* SECCIÓN: Fecha del Sorteo */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Event sx={{ color: '#FF6B35', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#2D3748' }}>
                  Fecha del Sorteo (Opcional)
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={raffleForm.tieneFechaSorteo}
                    onChange={handleToggleFechaSorteo}
                    color="primary"
                  />
                }
                label="Establecer fecha de sorteo"
              />

              {raffleForm.tieneFechaSorteo && (
                <TextField
                  fullWidth
                  label="Fecha y Hora del Sorteo"
                  type="datetime-local"
                  value={raffleForm.fechaSorteo}
                  onChange={handleFechaSorteoChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mt: 2 }}
                  helperText="Selecciona la fecha y hora en la que se realizará el sorteo"
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Formulario de datos básicos de la rifa */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título de la Rifa"
                  value={raffleForm.titulo}
                  onChange={(e) => setRaffleForm({ ...raffleForm, titulo: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={raffleForm.descripcion}
                  onChange={(e) => setRaffleForm({ ...raffleForm, descripcion: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mínimo de Tickets"
                  type="number"
                  value={raffleForm.minTickets}
                  onChange={(e) => setRaffleForm({ ...raffleForm, minTickets: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total de Tickets"
                  type="number"
                  value={raffleForm.ticketsTotales}
                  onChange={(e) => setRaffleForm({ ...raffleForm, ticketsTotales: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={raffleForm.estado}
                    label="Estado"
                    onChange={(e) => setRaffleForm({ ...raffleForm, estado: e.target.value })}
                  >
                    <MenuItem value="activa">Activa</MenuItem>
                    <MenuItem value="pausada">Pausada</MenuItem>
                    <MenuItem value="finalizada">Finalizada</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRaffleModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveRaffle}
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: '#FF6B35' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle sx={{ color: '#2D3748', fontWeight: 'bold' }}>
          {confirmDialog.type === 'activate' && 'Confirmar Activación Única'}
          {confirmDialog.type === 'delete' && 'Confirmar Eliminación de Rifa'}
          {confirmDialog.type === 'delete-prize' && 'Confirmar Eliminación de Premio'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.type === 'activate' && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres activar la rifa:
              </Typography>
              <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 2 }}>
                "{confirmDialog.raffle?.titulo}"
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Esta acción desactivará cualquier rifa activa actual y hará que esta sea la única rifa activa en el sistema.
                </Typography>
              </Alert>
              <Typography variant="body2" sx={{ color: '#718096' }}>
                Los usuarios verán esta rifa en el dashboard principal.
              </Typography>
            </>
          )}

          {confirmDialog.type === 'delete' && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres eliminar la rifa:
              </Typography>
              <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 2 }}>
                "{confirmDialog.raffle?.titulo}"
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Advertencia:</strong> Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta rifa.
                </Typography>
              </Alert>
            </>
          )}

          {confirmDialog.type === 'delete-prize' && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres eliminar el premio:
              </Typography>
              <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 2 }}>
                "{confirmDialog.raffle?.nombre}"
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.type === 'activate') {
                handleActivarRifa(confirmDialog.raffle);
              } else if (confirmDialog.type === 'delete') {
                handleDeleteRaffle();
              } else if (confirmDialog.type === 'delete-prize') {
                handleDeletePrize();
              }
            }}
            variant="contained"
            color={confirmDialog.type === 'delete' || confirmDialog.type === 'delete-prize' ? 'error' : 'primary'}
            sx={{ 
              backgroundColor: confirmDialog.type === 'delete' || confirmDialog.type === 'delete-prize' ? '#d32f2f' : '#FF6B35'
            }}
          >
            {confirmDialog.type === 'activate' && (activating ? <CircularProgress size={20} /> : 'Activar como Única Rifa')}
            {(confirmDialog.type === 'delete' || confirmDialog.type === 'delete-prize') && 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRafflesList;