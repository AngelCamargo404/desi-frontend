// AdminRaffleTickets.jsx - VERSION COMPLETA ACTUALIZADA
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Pagination,
  Avatar,
  Tabs,
  Tab,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Visibility,
  Cancel,
  Receipt,
  Person,
  Email,
  Phone,
  Badge,
  LocationOn,
  Payment,
  Refresh,
  Numbers,
  Search,
  Clear,
  Block,
  DoNotDisturb
} from '@mui/icons-material';
import ticketsApi from '../../services/ticketsApi';
import raffleApi from '../../services/raffleApi';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

const AdminRaffleTickets = () => {
  const { id: raffleId } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState(null);
  const [unverifiedCompras, setUnverifiedCompras] = useState([]);
  const [verifiedCompras, setVerifiedCompras] = useState([]);
  const [canceledCompras, setCanceledCompras] = useState([]);
  const [filteredUnverifiedCompras, setFilteredUnverifiedCompras] = useState([]);
  const [filteredVerifiedCompras, setFilteredVerifiedCompras] = useState([]);
  const [filteredCanceledCompras, setFilteredCanceledCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  
  // Estados para paginación
  const [unverifiedPage, setUnverifiedPage] = useState(1);
  const [verifiedPage, setVerifiedPage] = useState(1);
  const [canceledPage, setCanceledPage] = useState(1);
  const [unverifiedTotalPages, setUnverifiedTotalPages] = useState(1);
  const [verifiedTotalPages, setVerifiedTotalPages] = useState(1);
  const [canceledTotalPages, setCanceledTotalPages] = useState(1);
  const [unverifiedTotal, setUnverifiedTotal] = useState(0);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [canceledTotal, setCanceledTotal] = useState(0);
  
  // Estados para filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Estados para modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    open: false,
    transaccionId: null,
    compraData: null,
    type: 'verify' // 'verify' o 'cancel'
  });

  const ticketsPerPage = 10;

  // Opciones de filtrado
  const filterOptions = [
    { value: 'all', label: 'Todos los campos' },
    { value: 'ticket', label: 'Número de ticket' },
    { value: 'name', label: 'Nombre del comprador' },
    { value: 'email', label: 'Email' },
    { value: 'cedula', label: 'Cédula' },
    { value: 'reference', label: 'Referencia de pago' },
    { value: 'transaction', label: 'ID de transacción' }
  ];

  useEffect(() => {
    cargarDatosIniciales();
  }, [raffleId]);

  useEffect(() => {
    if (raffle) {
      if (currentTab === 0) {
        cargarComprasNoVerificadas();
      } else if (currentTab === 1) {
        cargarComprasVerificadas();
      } else if (currentTab === 2) {
        cargarComprasCanceladas();
      }
    }
  }, [raffle, currentTab, unverifiedPage, verifiedPage, canceledPage]);

  // Aplicar filtros cuando cambie el término de búsqueda o el tipo de filtro
  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, filterType, unverifiedCompras, verifiedCompras, canceledCompras, currentTab]);

  const aplicarFiltros = () => {
    if (!searchTerm.trim()) {
      setFilteredUnverifiedCompras(unverifiedCompras);
      setFilteredVerifiedCompras(verifiedCompras);
      setFilteredCanceledCompras(canceledCompras);
      return;
    }

    const term = searchTerm.toLowerCase().trim();

    const filtrarCompra = (compra) => {
      switch (filterType) {
        case 'ticket':
          return compra.numerosTickets.some(numero => 
            numero.toString().includes(term)
          );
        case 'name':
          return compra.comprador.nombre.toLowerCase().includes(term);
        case 'email':
          return compra.comprador.email.toLowerCase().includes(term);
        case 'cedula':
          return compra.comprador.cedula?.toLowerCase().includes(term);
        case 'reference':
          return compra.referenciaPago?.toLowerCase().includes(term);
        case 'transaction':
          // Para compras canceladas, buscar en transaccionIdOriginal
          if (compra.transaccionIdOriginal) {
            return compra.transaccionIdOriginal.toLowerCase().includes(term);
          }
          return compra.transaccionId.toLowerCase().includes(term);
        case 'all':
        default:
          const campos = [
            ...compra.numerosTickets.map(numero => numero.toString()),
            compra.comprador.nombre.toLowerCase(),
            compra.comprador.email.toLowerCase(),
            compra.comprador.cedula?.toLowerCase() || '',
            compra.referenciaPago?.toLowerCase() || '',
            compra.transaccionId.toLowerCase(),
            formatearMetodoPago(compra.metodoPago).toLowerCase()
          ];
          
          // Para compras canceladas, agregar transaccionIdOriginal
          if (compra.transaccionIdOriginal) {
            campos.push(compra.transaccionIdOriginal.toLowerCase());
          }
          
          return campos.some(campo => campo.includes(term));
      }
    };

    if (currentTab === 0) {
      setFilteredUnverifiedCompras(unverifiedCompras.filter(filtrarCompra));
    } else if (currentTab === 1) {
      setFilteredVerifiedCompras(verifiedCompras.filter(filtrarCompra));
    } else if (currentTab === 2) {
      setFilteredCanceledCompras(canceledCompras.filter(filtrarCompra));
    }
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await cargarRifa();
      await cargarTotales();
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      setError(error.message || 'Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const formatearMetodoPago = (metodo) => {
    if (!metodo) return 'N/A';
    return metodo
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
  };

  const cargarRifa = async () => {
    try {
      const raffleResponse = await raffleApi.obtenerRaffle(raffleId);
      if (raffleResponse.success) {
        setRaffle(raffleResponse.data);
      } else {
        setError(raffleResponse.message || 'Error al cargar la rifa');
      }
    } catch (error) {
      throw new Error(error.message || 'Error al cargar la rifa');
    }
  };

  const cargarTotales = async () => {
    try {
      
      const unverifiedResponse = await ticketsApi.obtenerComprasNoVerificadasPorRifa(raffleId, 1, 1);
      if (unverifiedResponse.success) {
        setUnverifiedTotal(unverifiedResponse.data.totalCompras || 0);
        setUnverifiedTotalPages(unverifiedResponse.data.totalPaginas || 1);
      }

      const verifiedResponse = await ticketsApi.obtenerComprasVerificadasPorRifa(raffleId, 1, 1);
      if (verifiedResponse.success) {
        setVerifiedTotal(verifiedResponse.data.totalCompras || 0);
        setVerifiedTotalPages(verifiedResponse.data.totalPaginas || 1);
      }

      // Nueva llamada para compras canceladas
      const canceledResponse = await ticketsApi.obtenerComprasCanceladasPorRifa(raffleId, 1, 1);
      if (canceledResponse.success) {
        setCanceledTotal(canceledResponse.data.totalCompras || 0);
        setCanceledTotalPages(canceledResponse.data.totalPaginas || 1);
      }

    } catch (error) {
      console.error('❌ Error cargando totales:', error);
      throw new Error('Error al cargar los totales de compras');
    }
  };

  const cargarComprasNoVerificadas = async () => {
    setLoading(true);
    try {
      const response = await ticketsApi.obtenerComprasNoVerificadasPorRifa(
        raffleId, 
        unverifiedPage, 
        ticketsPerPage
      );
      
      if (response.success) {
        setUnverifiedCompras(response.data.compras || []);
        setUnverifiedTotalPages(response.data.totalPaginas || 1);
        setUnverifiedTotal(response.data.totalCompras || 0);
      } else {
        setError(response.message || 'Error al cargar compras no verificadas');
      }
    } catch (error) {
      console.error('❌ Error cargando compras no verificadas:', error);
      setError(error.message || 'Error al cargar compras no verificadas');
    } finally {
      setLoading(false);
    }
  };

  const cargarComprasVerificadas = async () => {
    setLoading(true);
    try {
      const response = await ticketsApi.obtenerComprasVerificadasPorRifa(
        raffleId, 
        verifiedPage, 
        ticketsPerPage
      );
      
      if (response.success) {
        setVerifiedCompras(response.data.compras || []);
        setVerifiedTotalPages(response.data.totalPaginas || 1);
        setVerifiedTotal(response.data.totalCompras || 0);
      } else {
        setError(response.message || 'Error al cargar compras verificadas');
      }
    } catch (error) {
      console.error('❌ Error cargando compras verificadas:', error);
      setError(error.message || 'Error al cargar compras verificadas');
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: Cargar compras canceladas
  const cargarComprasCanceladas = async () => {
    setLoading(true);
    try {
      const response = await ticketsApi.obtenerComprasCanceladasPorRifa(
        raffleId, 
        canceledPage, 
        ticketsPerPage
      );
      
      if (response.success) {
        setCanceledCompras(response.data.compras || []);
        setCanceledTotalPages(response.data.totalPaginas || 1);
        setCanceledTotal(response.data.totalCompras || 0);
      } else {
        console.error('❌ Error en respuesta:', response.message);
        setError(response.message || 'Error al cargar compras canceladas');
      }
    } catch (error) {
      console.error('❌ Error cargando compras canceladas:', error);
      setError(error.message || 'Error al cargar compras canceladas');
    } finally {
      setLoading(false);
    }
  };

  // MODALES Y ACCIONES
  const handleOpenConfirmation = (compra, type = 'verify') => {
    setConfirmationModal({
      open: true,
      transaccionId: compra.transaccionId,
      compraData: compra,
      type: type
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({
      open: false,
      transaccionId: null,
      compraData: null,
      type: 'verify'
    });
  };

  const handleVerifyCompra = async () => {
    setVerifying(true);
    try {
      const verificadoPor = 'Administrador';
      const response = await ticketsApi.verificarCompra(confirmationModal.transaccionId, verificadoPor);
      
      if (response.success) {
        setSuccess(`Compra verificada exitosamente. ${response.data.length} ticket(s) verificados.`);
        await cargarTotales();
        await cargarComprasNoVerificadas();
        await cargarComprasVerificadas();
        handleCloseConfirmation();
        setDetailsModalOpen(false);
      }
    } catch (error) {
      setError(error.message || 'Error al verificar la compra');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelCompra = async () => {
    setCanceling(true);
    try {
      const razon = "Cancelado por administrador";
      const response = await ticketsApi.cancelarCompra(confirmationModal.transaccionId, razon);
      
      if (response.success) {
        setSuccess(`Compra cancelada exitosamente. ${response.data.ticketsCancelados} ticket(s) liberados.`);
        await cargarTotales();
        await cargarComprasNoVerificadas();
        await cargarComprasVerificadas();
        await cargarComprasCanceladas(); // Recargar la lista de canceladas
        handleCloseConfirmation();
        setDetailsModalOpen(false);
      }
    } catch (error) {
      setError(error.message || 'Error al cancelar la compra');
    } finally {
      setCanceling(false);
    }
  };

  const handleOpenDetails = (compra) => {
    setSelectedCompra(compra);
    setDetailsModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setUnverifiedPage(1);
    setVerifiedPage(1);
    setCanceledPage(1);
    limpiarFiltros();
  };

  const handleUnverifiedPageChange = (event, value) => {
    setUnverifiedPage(value);
  };

  const handleVerifiedPageChange = (event, value) => {
    setVerifiedPage(value);
  };

  const handleCanceledPageChange = (event, value) => {
    setCanceledPage(value);
  };

  const recargarTodosLosDatos = async () => {
    setLoading(true);
    try {
      await cargarTotales();
      if (currentTab === 0) {
        await cargarComprasNoVerificadas();
      } else if (currentTab === 1) {
        await cargarComprasVerificadas();
      } else if (currentTab === 2) {
        await cargarComprasCanceladas();
      }
      setSuccess('Datos actualizados correctamente');
    } catch (error) {
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Obtener compras actuales según la pestaña activa
  const comprasActuales = currentTab === 0 ? filteredUnverifiedCompras : 
                         currentTab === 1 ? filteredVerifiedCompras : 
                         filteredCanceledCompras;
  
  const totalFiltrado = comprasActuales.length;
  const totalSinFiltrar = currentTab === 0 ? unverifiedCompras.length : 
                         currentTab === 1 ? verifiedCompras.length : 
                         canceledCompras.length;

  if (loading && !raffle) {
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
            onClick={() => navigate('/admin/raffles')} 
            sx={{ mr: 2, color: '#FF6B35' }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
              Compras de {raffle?.titulo}
            </Typography>
            <Typography variant="body1" sx={{ color: '#dddee0ff' }}>
              Gestiona las compras y tickets de esta rifa
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={recargarTodosLosDatos}
          variant="outlined"
          startIcon={<Refresh />}
          disabled={loading}
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

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid #2196F3' }}>
            <CardContent>
              <Typography color="white" gutterBottom>
                Total Vendidos
              </Typography>
              <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                {raffle?.ticketsVendidos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', border: '1px solid #FF9800' }}>
            <CardContent>
              <Typography color="white" gutterBottom>
                Compras Pendientes
              </Typography>
              <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                {unverifiedTotal}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4CAF50' }}>
            <CardContent>
              <Typography color="white" gutterBottom>
                Compras Verificadas
              </Typography>
              <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {verifiedTotal}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336' }}>
            <CardContent>
              <Typography color="white" gutterBottom>
                Compras Canceladas
              </Typography>
              <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                {canceledTotal}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs para cambiar entre listas */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Cancel sx={{ mr: 1, color: '#FF9800' }} />
                  Pendientes
                  <Chip 
                    label={unverifiedTotal} 
                    size="small" 
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ mr: 1, color: '#4CAF50' }} />
                  Verificadas
                  <Chip 
                    label={verifiedTotal} 
                    size="small" 
                    color="success"
                    sx={{ ml: 1 }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DoNotDisturb sx={{ mr: 1, color: '#f44336' }} />
                  Rechazadas
                  <Chip 
                    label={canceledTotal} 
                    size="small" 
                    color="error"
                    sx={{ ml: 1 }}
                  />
                </Box>
              } 
            />
          </Tabs>

          {/* Contenido de los Tabs */}
          <Box sx={{ p: 3 }}>
            {/* Filtros de búsqueda */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar en compras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={limpiarFiltros}
                            edge="end"
                          >
                            <Clear />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filtrar por</InputLabel>
                    <Select
                      value={filterType}
                      label="Filtrar por"
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      {filterOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" sx={{ color: '#718096' }}>
                      {searchTerm ? (
                        <>Mostrando {totalFiltrado} de {totalSinFiltrar} compras</>
                      ) : (
                        <>Total: {totalSinFiltrar} compras</>
                      )}
                    </Typography>
                    {searchTerm && (
                      <Button
                        size="small"
                        startIcon={<Clear />}
                        onClick={limpiarFiltros}
                        sx={{ ml: 2 }}
                      >
                        Limpiar
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Pestaña de Compras Pendientes */}
            {currentTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#FF9800' }}>
                    Compras Pendientes de Verificación
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    Página {unverifiedPage} de {unverifiedTotalPages} • {unverifiedTotal} compras pendientes
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#FF6B35' }} />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Compra</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Comprador</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Método Pago</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tickets</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Referencia</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha Compra</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredUnverifiedCompras.length > 0 ? (
                            filteredUnverifiedCompras.map((compra) => (
                              <TableRow key={compra.transaccionId} hover>
                                <TableCell>
                                  <Box>
                                    <Chip 
                                      label={`${compra.cantidadTickets} ticket${compra.cantidadTickets > 1 ? 's' : ''}`}
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#718096', fontSize: '0.75rem' }}>
                                      ID: {compra.transaccionId.substring(0, 8)}...
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                      {compra.comprador.nombre}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                      {compra.comprador.cedula || 'Sin cédula'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">
                                      {compra.comprador.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                      {compra.comprador.telefono || 'Sin teléfono'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={formatearMetodoPago(compra.metodoPago)}
                                    size="small"
                                    color="secondary"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={compra.numerosTickets.sort((a, b) => a - b).join(', ')}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                      {compra.numerosTickets.length} número(s)
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {compra.referenciaPago || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Ver Detalles">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenDetails(compra)}
                                        sx={{ color: '#1976d2' }}
                                      >
                                        <Visibility />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Confirmar Pago">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenConfirmation(compra, 'verify')}
                                        disabled={verifying}
                                        sx={{ color: '#4CAF50' }}
                                      >
                                        <CheckCircle />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancelar Compra">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenConfirmation(compra, 'cancel')}
                                        disabled={canceling}
                                        sx={{ color: '#f44336' }}
                                      >
                                        <Block />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                {searchTerm ? (
                                  <>
                                    <Search sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                                      No se encontraron compras
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                      No hay compras que coincidan con "{searchTerm}"
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                                      No hay compras pendientes de verificación
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                      Todas las compras han sido verificadas
                                    </Typography>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Paginación para compras no verificadas */}
                    {unverifiedTotalPages > 1 && !searchTerm && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={unverifiedTotalPages}
                          page={unverifiedPage}
                          onChange={handleUnverifiedPageChange}
                          color="primary"
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Pestaña de Compras Verificadas */}
            {currentTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                    Compras Verificadas
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    Página {verifiedPage} de {verifiedTotalPages} • {verifiedTotal} compras verificadas
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#FF6B35' }} />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#e8f5e8' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Compra</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Comprador</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Método Pago</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tickets</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Verificado Por</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha Verificación</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredVerifiedCompras.length > 0 ? (
                            filteredVerifiedCompras.map((compra) => (
                              <TableRow key={compra.transaccionId} hover>
                                <TableCell>
                                  <Box>
                                    <Chip 
                                      label={`${compra.cantidadTickets} ticket${compra.cantidadTickets > 1 ? 's' : ''}`}
                                      color="success"
                                      variant="outlined"
                                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#718096', fontSize: '0.75rem' }}>
                                      ID: {compra.transaccionId.substring(0, 8)}...
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                      {compra.comprador.nombre}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                      {compra.comprador.cedula || 'Sin cédula'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">
                                      {compra.comprador.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                      {compra.comprador.telefono || 'Sin teléfono'}
                                    </Typography>
                                </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={formatearMetodoPago(compra.metodoPago)}
                                    size="small"
                                    color="secondary"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={compra.numerosTickets.sort((a, b) => a - b).join(', ')}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                      {compra.numerosTickets.length} número(s)
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {compra.verificadoPor || 'Sistema'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {compra.fechaVerificacion ? new Date(compra.fechaVerificacion).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Ver Detalles">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenDetails(compra)}
                                        sx={{ color: '#1976d2' }}
                                      >
                                        <Visibility />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancelar Compra">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleOpenConfirmation(compra, 'cancel')}
                                        disabled={canceling}
                                        sx={{ color: '#f44336' }}
                                      >
                                        <Block />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                {searchTerm ? (
                                  <>
                                    <Search sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                                      No se encontraron compras
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                      No hay compras verificadas que coincidan con "{searchTerm}"
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <Cancel sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                                      No hay compras verificadas
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                      Las compras verificadas aparecerán aquí
                                    </Typography>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Paginación para compras verificadas */}
                    {verifiedTotalPages > 1 && !searchTerm && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={verifiedTotalPages}
                          page={verifiedPage}
                          onChange={handleVerifiedPageChange}
                          color="primary"
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* NUEVA Pestaña de Compras Canceladas/Rechazadas */}
            {currentTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#f44336' }}>
                    Compras Canceladas/Rechazadas
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    Página {canceledPage} de {canceledTotalPages} • {canceledTotal} compras canceladas
                  </Typography>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#FF6B35' }} />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#ffebee' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Compra Original</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Comprador Original</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Método Pago</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tickets Liberados</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Razón</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha Cancelación</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cancelado Por</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCanceledCompras.length > 0 ? (
                            filteredCanceledCompras.map((compra) => (
                              <TableRow key={compra.transaccionIdOriginal} hover>
                                <TableCell>
                                  <Box>
                                    <Chip 
                                      label={`${compra.cantidadTickets} ticket${compra.cantidadTickets > 1 ? 's' : ''}`}
                                      color="error"
                                      variant="outlined"
                                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#718096', fontSize: '0.75rem' }}>
                                      ID: {compra.transaccionIdOriginal.substring(0, 8)}...
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                      {compra.comprador.nombre}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                      {compra.comprador.cedula || 'Sin cédula'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">
                                      {compra.comprador.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                      {compra.comprador.telefono || 'Sin teléfono'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={formatearMetodoPago(compra.metodoPago)}
                                    size="small"
                                    color="secondary"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={compra.numerosTickets.sort((a, b) => a - b).join(', ')}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#f44336' }}>
                                      {compra.numerosTickets.length} número(s) liberados
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {compra.razon}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {compra.fechaCancelacion ? new Date(compra.fechaCancelacion).toLocaleString() : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {compra.canceladoPor || 'Sistema'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                                {searchTerm ? (
                                  <>
                                    <Search sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                                      No se encontraron compras canceladas
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                      No hay compras canceladas que coincidan con "{searchTerm}"
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <DoNotDisturb sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                    <Typography variant="h6" sx={{ color: '#9e9e9e' }}>
                                      No hay compras canceladas
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                      Las compras canceladas aparecerán aquí
                                    </Typography>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Paginación para compras canceladas */}
                    {canceledTotalPages > 1 && !searchTerm && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={canceledTotalPages}
                          page={canceledPage}
                          onChange={handleCanceledPageChange}
                          color="primary"
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Modal de Detalles de la Compra */}
      <Dialog 
        open={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt sx={{ mr: 1, color: '#FF6B35' }} />
            Detalles de la Compra
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCompra && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#FF6B35' }}>
                    Información de la Compra
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        ID de Transacción
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                        {selectedCompra.transaccionId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Cantidad de Tickets
                      </Typography>
                      <Chip 
                        label={selectedCompra.cantidadTickets}
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Método de Pago
                      </Typography>
                      <Chip 
                        label={formatearMetodoPago(selectedCompra.metodoPago)}
                        color="secondary"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Estado
                      </Typography>
                      <Chip 
                        label={selectedCompra.verificado ? 'Verificado' : 'Pendiente'}
                        color={selectedCompra.verificado ? 'success' : 'warning'}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Información del Comprador */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#FF6B35' }}>
                    <Person sx={{ mr: 1 }} />
                    Información del Comprador
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Nombre Completo
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {selectedCompra.comprador.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Email
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {selectedCompra.comprador.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Teléfono
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {selectedCompra.comprador.telefono || 'No proporcionado'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Estado/Ciudad
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {selectedCompra.comprador.estadoCiudad}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Badge sx={{ mr: 1, color: '#666' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Cédula
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {selectedCompra.comprador.cedula || 'No proporcionada'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Números de Tickets */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#FF6B35' }}>
                    <Numbers sx={{ mr: 1 }} />
                    Números de Tickets
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCompra.numerosTickets.sort((a, b) => a - b).map((numero) => (
                      <Chip
                        key={numero}
                        label={`#${numero}`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Información de Pago */}
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#FF6B35' }}>
                    <Payment sx={{ mr: 1 }} />
                    Información de Pago
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Referencia de Pago
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                        {selectedCompra.referenciaPago || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Fecha de Compra
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {new Date(selectedCompra.fechaCompra).toLocaleString()}
                      </Typography>
                    </Grid>
                    {selectedCompra.verificado && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Fecha de Verificación
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {new Date(selectedCompra.fechaVerificacion).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Verificado Por
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 0.5 }}>
                            {selectedCompra.verificadoPor}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>

                {/* Comprobante de Pago */}
                {selectedCompra.comprobante && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#FF6B35' }}>
                        Comprobante de Pago
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar
                          variant="rounded"
                          src={selectedCompra.comprobante.url}
                          sx={{ 
                            width: 300, 
                            height: 300, 
                            cursor: 'pointer',
                            mx: 'auto',
                            border: '2px solid #FF6B35'
                          }}
                          onClick={() => window.open(selectedCompra.comprobante.url, '_blank')}
                        />
                        <Button
                          variant="outlined"
                          sx={{ mt: 2 }}
                          onClick={() => window.open(selectedCompra.comprobante.url, '_blank')}
                        >
                          Ver Comprobante Completo
                        </Button>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedCompra && !selectedCompra.verificado && (
            <Button
              onClick={() => handleOpenConfirmation(selectedCompra)}
              variant="contained"
              startIcon={<CheckCircle />}
              disabled={verifying}
              sx={{ backgroundColor: '#4CAF50' }}
            >
              {verifying ? 'Verificando...' : 'Confirmar Pago'}
            </Button>
          )}
          <Button onClick={() => setDetailsModalOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación (reutilizable para verificar y cancelar) */}
      <ConfirmationModal
        open={confirmationModal.open}
        onClose={handleCloseConfirmation}
        onConfirm={confirmationModal.type === 'verify' ? handleVerifyCompra : handleCancelCompra}
        title={
          confirmationModal.type === 'verify' 
            ? "Confirmar Verificación de Compra" 
            : "Confirmar Cancelación de Compra"
        }
        message={
          confirmationModal.compraData ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {confirmationModal.type === 'verify' 
                  ? "¿Estás seguro de que deseas verificar esta compra completa?"
                  : "¿Estás seguro de que deseas cancelar esta compra? Los tickets serán liberados y podrán ser comprados nuevamente."
                }
              </Typography>
              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Compra: {confirmationModal.compraData.transaccionId.substring(0, 12)}...
                </Typography>
                <Typography variant="body2">
                  Comprador: {confirmationModal.compraData.comprador.nombre}
                </Typography>
                <Typography variant="body2">
                  Email: {confirmationModal.compraData.comprador.email}
                </Typography>
                <Typography variant="body2">
                  Tickets: {confirmationModal.compraData.cantidadTickets} número(s)
                </Typography>
                <Typography variant="body2">
                  Números: {confirmationModal.compraData.numerosTickets.sort((a, b) => a - b).join(', ')}
                </Typography>
                <Typography variant="body2">
                  Método de pago: {confirmationModal.compraData.metodoPago}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, 
                color: confirmationModal.type === 'verify' ? '#FF9800' : '#f44336', 
                fontWeight: 'bold' 
              }}>
                {confirmationModal.type === 'verify' 
                  ? `Esta acción verificará ${confirmationModal.compraData.cantidadTickets} ticket(s) y enviará ${confirmationModal.compraData.cantidadTickets} email(s) de confirmación.`
                  : `Esta acción liberará ${confirmationModal.compraData.cantidadTickets} ticket(s) y los volverá a poner disponibles para la venta.`
                }
              </Typography>
            </Box>
          ) : (
            confirmationModal.type === 'verify' 
              ? "¿Estás seguro de que deseas verificar esta compra?"
              : "¿Estás seguro de que deseas cancelar esta compra?"
          )
        }
        confirmText={
          confirmationModal.type === 'verify' 
            ? `Verificar ${confirmationModal.compraData?.cantidadTickets || 0} Ticket(s)`
            : `Cancelar ${confirmationModal.compraData?.cantidadTickets || 0} Ticket(s)`
        }
        cancelText="Cancelar"
        loading={confirmationModal.type === 'verify' ? verifying : canceling}
        severity={confirmationModal.type === 'verify' ? 'warning' : 'error'}
      />
    </Container>
  );
};

export default AdminRaffleTickets;