import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Casino,
  AttachMoney,
  Payment,
  Person,
  Email,
  Phone,
  LocationOn,
  Receipt,
  PhotoCamera,
  ArrowBack,
  CheckCircle,
  Edit,
  Clear
} from '@mui/icons-material';
import ticketsApi from '../../services/ticketsApi';
import activeRaffleApi from '../../services/activeRaffleApi';
import WhatsAppButton from '../../components/ui/WhatsappButton';
import paymentMethodsApi from '../../services/paymentMethodsApi';

const CompraTickets = () => {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRifa, setLoadingRifa] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cantidadTickets, setCantidadTickets] = useState(2);
  const [metodoPago, setMetodoPago] = useState('');
  const [rifaData, setRifaData] = useState(null);
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [numerosOcupados, setNumerosOcupados] = useState([]);
  const [cargandoNumeros, setCargandoNumeros] = useState(false);
  const [dialogoNumero, setDialogoNumero] = useState({ open: false, index: null, numero: '' });

  const [metodosPagoData, setMetodosPagoData] = useState({});
  const [metodosPagoDisponibles, setMetodosPagoDisponibles] = useState([]);
  const [cargandoMetodosPago, setCargandoMetodosPago] = useState(true);

  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    email: '',
    telefono: '',
    estadoCiudad: '',
    referencia: '',
    comprobante: null
  });

  const metodosPagoFallback = [
    { value: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
    { value: 'pago_movil', label: 'Pago Móvil', icon: '📱' },
    { value: 'zelle', label: 'Zelle', icon: '💸' },
    { value: 'binance', label: 'Binance', icon: '₿' }
  ];

  const datosEmpresaFallback = {
    transferencia: {
      banco: "Banco de Venezuela",
      tipo: "Cuenta Corriente", 
      numero: "0102-1234-5678-9012-3456",
      titular: "Gana Con Desi C.A.",
      cedula_rif: "J-12345678-9"
    },
    pago_movil: {
      banco: "Bancamiga",
      telefono: "0412-123-4567",
      cedula: "V-12345678",
      titular: "María González"
    },
    zelle: {
      email: "ganacondesi@zelle.com",
      titular: "Gana Con Desi LLC"
    },
    binance: {
      wallet: "TB1234567890ABCDEFGHIJKLMN",
      red: "TRC20",
      titular: "Gana Con Desi",
      memo: "Rifa Millonaria"
    }
  };

  const steps = ['Seleccionar Tickets', 'Información Personal', 'Método de Pago', 'Confirmación'];

  useEffect(() => {
    if (rifaData) {
      cargarNumerosOcupados();
    }
  }, [rifaData]);

  const cargarNumerosOcupados = async () => {
    try {
      setCargandoNumeros(true);
      const response = await ticketsApi.obtenerNumerosOcupados(rifaData._id);
      if (response.success) {
        setNumerosOcupados(response.data);
      }
    } catch (error) {
      console.error('Error cargando números ocupados:', error);
      setError('Error al cargar números disponibles');
    } finally {
      setCargandoNumeros(false);
    }
  };

  // Cargar la rifa activa
  useEffect(() => {
    const cargarRifaActiva = async () => {
      try {
        setLoadingRifa(true);
        setError('');
        
        // Usar endpoint público para obtener la rifa activa (no requiere token)
        const response = await activeRaffleApi.obtenerRifaActiva();
        
        if (response.success && response.data) {
          // El backend puede devolver directamente el objeto raffle o un objeto { raffleId }
          const raffle = response.data.raffleId || response.data;
          setRifaData(raffle);
        } else {
          setError('No hay una rifa activa en este momento');
        }
      } catch (error) {
        console.error('❌ Error cargando rifa activa:', error);
        setError('Error al cargar la información de la rifa activa: ' + error.message);
      } finally {
        setLoadingRifa(false);
      }
    };

    cargarRifaActiva();
  }, []);

  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        setCargandoMetodosPago(true);
        const response = await paymentMethodsApi.obtenerActivos();
        
        if (response.success && response.data && response.data.length > 0) {
          // Usar datos de la API
          const metodosMap = {};
          response.data.forEach(metodo => {
            metodosMap[metodo.codigo] = metodo.datos;
          });
          setMetodosPagoData(metodosMap);
          
          // Crear array de métodos disponibles para el select
          const metodosDisponibles = metodosPagoFallback.filter(metodo => 
            metodosMap[metodo.value]
          );
          setMetodosPagoDisponibles(metodosDisponibles);
        } else {
          // Usar fallback si no hay métodos en la API
          console.warn('⚠️ Usando métodos de pago fallback');
          setMetodosPagoData(datosEmpresaFallback);
          setMetodosPagoDisponibles(metodosPagoFallback);
        }
      } catch (error) {
        console.error('❌ Error cargando métodos de pago, usando fallback:', error);
        // Usar datos fallback en caso de error
        setMetodosPagoData(datosEmpresaFallback);
        setMetodosPagoDisponibles(metodosPagoFallback);
      } finally {
        setCargandoMetodosPago(false);
      }
    };

    cargarMetodosPago();
  }, []);

  const verificarDisponibilidadNumero = (numero, indiceActual = null) => {
    if (!rifaData) return { disponible: false, mensaje: 'Rifa no cargada' };
    
    if (numero < 1 || numero > rifaData.ticketsTotales) {
      return { disponible: false, mensaje: `El número debe estar entre 1 y ${rifaData.ticketsTotales}` };
    }
    
    if (numerosOcupados.includes(numero)) {
      return { disponible: false, mensaje: `El número ${numero} ya está ocupado` };
    }
    
    // Verificar duplicados excluyendo el número actual que se está editando
    const estaSeleccionadoEnOtroIndice = numerosSeleccionados.some((num, index) => 
      num === numero && index !== indiceActual
    );
    
    if (estaSeleccionadoEnOtroIndice) {
      return { disponible: false, mensaje: `El número ${numero} ya está seleccionado en otra posición` };
    }
    
    return { disponible: true, mensaje: `El número ${numero} está disponible` };
  };

  const generarNumerosAleatorios = () => {
    if (!rifaData) return;
    
    const numerosDisponibles = [];
    for (let i = 1; i <= rifaData.ticketsTotales; i++) {
      if (!numerosOcupados.includes(i) && !numerosSeleccionados.includes(i)) {
        numerosDisponibles.push(i);
      }
    }
    
    if (numerosDisponibles.length < cantidadTickets) {
      setError(`No hay suficientes números disponibles. Solo quedan ${numerosDisponibles.length} números libres.`);
      return;
    }
    
    // Mezclar array y tomar la cantidad necesaria
    const numerosAleatorios = numerosDisponibles
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidadTickets);
    
    setNumerosSeleccionados(numerosAleatorios);
    setError('');
  };

  const manejarCambioNumero = (index, nuevoNumero) => {
    const numero = parseInt(nuevoNumero);
    
    if (isNaN(numero)) {
      // Permitir campo vacío temporalmente
      const nuevosNumeros = [...numerosSeleccionados];
      nuevosNumeros[index] = '';
      setNumerosSeleccionados(nuevosNumeros);
      return;
    }

    const verificacion = verificarDisponibilidadNumero(numero, index);
    
    if (verificacion.disponible) {
      const nuevosNumeros = [...numerosSeleccionados];
      nuevosNumeros[index] = numero;
      setNumerosSeleccionados(nuevosNumeros);
      setError('');
    } else {
      setError(verificacion.mensaje);
    }
  };

  const abrirDialogoCambioNumero = (index) => {
    setDialogoNumero({
      open: true,
      index: index,
      numero: numerosSeleccionados[index] || ''
    });
  };

  const cerrarDialogoNumero = () => {
    setDialogoNumero({ open: false, index: null, numero: '' });
    setError('');
  };

  const aplicarCambioNumero = () => {
    const { index, numero } = dialogoNumero;
    const num = parseInt(numero);
    
    if (isNaN(num)) {
      setError('Por favor ingresa un número válido');
      return;
    }

    manejarCambioNumero(index, num);
    cerrarDialogoNumero();
  };

  const eliminarNumero = (index) => {
    const nuevosNumeros = numerosSeleccionados.filter((_, i) => i !== index);
    setNumerosSeleccionados(nuevosNumeros);
  };

  const handleNext = () => {
    // Validar que se hayan seleccionado la cantidad correcta de números
    if (activeStep === 0 && numerosSeleccionados.length !== cantidadTickets) {
      setError(`Debes seleccionar exactamente ${cantidadTickets} número(s)`);
      return;
    }

    // Validar que hay métodos de pago disponibles en el paso 2
    if (activeStep === 1 && metodosPago.length === 0) {
      setError('No hay métodos de pago disponibles. No se pueden procesar compras en este momento.');
      return;
    }

    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        comprobante: file
      }));
    }
  };

  const handleSubmit = async () => {
    if (!rifaData) {
      setError('No hay una rifa activa seleccionada');
      return;
    }

    // Validar que todos los números estén completos
    if (numerosSeleccionados.some(num => !num || isNaN(num))) {
      setError('Todos los números deben estar completos y válidos');
      return;
    }

    // Validar que no haya números duplicados
    const numerosUnicos = [...new Set(numerosSeleccionados)];
    if (numerosUnicos.length !== numerosSeleccionados.length) {
      setError('No puedes seleccionar números duplicados');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ticketData = {
        rifaId: rifaData._id,
        cantidad: cantidadTickets,
        metodoPago: metodoPago,
        referencia: formData.referencia,
        numerosTickets: numerosSeleccionados,
        ...formData
      };

      const response = await ticketsApi.comprarTicket(ticketData);

      if (response.success) {
        setSuccess(`Compra realizada exitosamente. Se crearon ${response.data.length} ticket(s)`);
        handleNext();
      } else {
        throw new Error(response.message || 'Error al procesar la compra');
      }

    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      setError(error.message || 'Error al procesar la compra. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const totalPagar = rifaData ? cantidadTickets * rifaData.precioTicket : 0;
  const datosEmpresa = metodosPagoData;
  const metodosPago = metodosPagoDisponibles.length > 0 ? metodosPagoDisponibles : metodosPagoFallback;

  const isStepDisabled = () => {
    switch (activeStep) {
      case 0:
        return !rifaData || numerosSeleccionados.length !== cantidadTickets || numerosSeleccionados.some(num => !num);
      case 1:
        return (!formData.cedula || !formData.nombre || !formData.email || !formData.telefono || !formData.estadoCiudad);
      case 2:
        // Validar que hay métodos de pago disponibles
        if (metodosPago.length === 0) return true;
        return (!metodoPago || !formData.referencia || !formData.comprobante);
      default:
        return false;
    }
  };

  // Estados de carga mejorados
  if (loadingRifa) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#FF6B35', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#718096' }}>
            Cargando información de la rifa activa...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && !rifaData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          onClick={() => navigate('/')}
          variant="contained"
          sx={{ backgroundColor: '#FF6B35' }}
        >
          Volver al Dashboard
        </Button>
      </Container>
    );
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
              Selecciona la cantidad y números de tickets
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: '2px solid #FF6B35', borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h4" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 1 }}>
                      ${rifaData?.precioTicket || '0'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#718096', mb: 2 }}>
                      Precio por ticket
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Cantidad de Tickets</InputLabel>
                      <Select
                        value={cantidadTickets}
                        label="Cantidad de Tickets"
                        onChange={(e) => {
                          const nuevaCantidad = e.target.value;
                          setCantidadTickets(nuevaCantidad);
                          
                          // Ajustar array de números seleccionados
                          if (nuevaCantidad < numerosSeleccionados.length) {
                            setNumerosSeleccionados(prev => prev.slice(0, nuevaCantidad));
                          } else if (nuevaCantidad > numerosSeleccionados.length) {
                            // Encontrar números disponibles para agregar
                            const numerosDisponibles = [];
                            for (let i = 1; i <= rifaData.ticketsTotales; i++) {
                              if (!numerosOcupados.includes(i) && !numerosSeleccionados.includes(i)) {
                                numerosDisponibles.push(i);
                              }
                            }
                            
                            const numerosAAgregar = numerosDisponibles
                              .sort(() => Math.random() - 0.5)
                              .slice(0, nuevaCantidad - numerosSeleccionados.length);
                            
                            setNumerosSeleccionados(prev => [...prev, ...numerosAAgregar]);
                          }
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <MenuItem key={num} value={num}>
                            {num} ticket{num > 1 ? 's' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Botón para números aleatorios */}
                    <Button
                      variant="outlined"
                      onClick={generarNumerosAleatorios}
                      disabled={cargandoNumeros || cantidadTickets === 0}
                      startIcon={<Casino />}
                      sx={{ mb: 3, borderColor: '#4CAF50', color: '#4CAF50', width: '100%' }}
                    >
                      {cargandoNumeros ? 'Cargando...' : 'Generar Números Aleatorios'}
                    </Button>

                    {/* Números seleccionados - editable */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2 }}>
                        Tus Números Seleccionados:
                      </Typography>
                      
                      {numerosSeleccionados.map((numero, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <TextField
                            label={`Número ${index + 1}`}
                            value={numero}
                            onChange={(e) => manejarCambioNumero(index, e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                eliminarNumero(index);
                              }
                            }}
                            type="number"
                            inputProps={{ 
                              min: 1, 
                              max: rifaData?.ticketsTotales || 100,
                              style: { textAlign: 'center' }
                            }}
                            sx={{ flex: 1 }}
                            error={numero && !verificarDisponibilidadNumero(numero, index).disponible}
                            helperText={numero ? verificarDisponibilidadNumero(numero, index).mensaje : ''}
                          />
                          <IconButton 
                            onClick={() => abrirDialogoCambioNumero(index)}
                            color="primary"
                            sx={{ border: '1px solid', borderColor: 'primary.main' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => eliminarNumero(index)}
                            color="error"
                            sx={{ border: '1px solid', borderColor: 'error.main' }}
                          >
                            <Clear />
                          </IconButton>
                        </Box>
                      ))}

                      {numerosSeleccionados.length === 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            Selecciona {cantidadTickets} número(s) o genera números aleatorios
                          </Typography>
                        </Alert>
                      )}
                    </Box>

                    <Box sx={{ p: 2, backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: 2, mt: 2 }}>
                      <Typography variant="h5" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        Total: ${totalPagar}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#718096' }}>
                        {cantidadTickets} ticket{cantidadTickets > 1 ? 's' : ''} seleccionado{cantidadTickets > 1 ? 's' : ''}
                      </Typography>
                      {numerosSeleccionados.length > 0 && (
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold', mt: 1 }}>
                          Números: {numerosSeleccionados.filter(num => num).sort((a, b) => a - b).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ border: '2px solid #4CAF50', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2 }}>
                      🎯 Información de la Rifa
                    </Typography>
                    
                    <Typography variant="h5" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 2 }}>
                      {rifaData?.titulo}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                      {rifaData?.descripcion}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#718096', display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle sx={{ color: '#4CAF50', fontSize: 16, mr: 1 }} />
                        Tickets disponibles: {rifaData ? rifaData.ticketsTotales - rifaData.ticketsVendidos : 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#718096', display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircle sx={{ color: '#4CAF50', fontSize: 16, mr: 1 }} />
                        Rango de números: 1 - {rifaData?.ticketsTotales || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#718096', display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ color: '#4CAF50', fontSize: 16, mr: 1 }} />
                        Entrega inmediata de tickets digitales
                      </Typography>
                    </Box>

                    <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Instrucciones:</strong><br/>
                        1. Selecciona la cantidad de tickets<br/>
                        2. Usa "Generar Números Aleatorios" o ingresa tus números preferidos<br/>
                        3. Verifica que los números estén disponibles (se mostrará en verde)<br/>
                        4. Puedes editar o eliminar números individualmente
                      </Typography>
                    </Alert>

                    {/* Grid de números para selección rápida */}
                    {rifaData && rifaData.ticketsTotales <= 100 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 1 }}>
                          Selección Rápida (Haz clic en un número):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto', p: 1 }}>
                          {Array.from({ length: rifaData.ticketsTotales }, (_, i) => i + 1).map(numero => {
                            const estaOcupado = numerosOcupados.includes(numero);
                            const estaSeleccionado = numerosSeleccionados.includes(numero);
                            let color = 'primary';
                            let variante = 'outlined';
                            
                            if (estaOcupado) {
                              color = 'error';
                              variante = 'outlined';
                            } else if (estaSeleccionado) {
                              color = 'primary';
                              variante = 'contained';
                            }

                            return (
                              <Button
                                key={numero}
                                variant={variante}
                                color={color}
                                disabled={estaOcupado}
                                onClick={() => {
                                  if (estaSeleccionado) {
                                    // Encontrar el índice del número seleccionado
                                    const indice = numerosSeleccionados.findIndex(n => n === numero);
                                    if (indice !== -1) {
                                      eliminarNumero(indice);
                                    }
                                  } else {
                                    // Verificar que no exceda la cantidad
                                    if (numerosSeleccionados.length >= cantidadTickets) {
                                      setError(`Solo puedes seleccionar ${cantidadTickets} número(s)`);
                                      return;
                                    }
                                    // Agregar número (no necesitamos verificar disponibilidad aquí porque ya sabemos que no está ocupado)
                                    setNumerosSeleccionados(prev => [...prev, numero]);
                                  }
                                  setError('');
                                }}
                                sx={{ 
                                  minWidth: 40, 
                                  height: 40,
                                  fontSize: '0.875rem'
                                }}
                              >
                                {numero}
                              </Button>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Diálogo para cambiar número */}
            <Dialog open={dialogoNumero.open} onClose={cerrarDialogoNumero}>
              <DialogTitle>Cambiar Número</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  label="Nuevo número"
                  type="number"
                  value={dialogoNumero.numero}
                  onChange={(e) => setDialogoNumero(prev => ({ ...prev, numero: e.target.value }))}
                  inputProps={{ 
                    min: 1, 
                    max: rifaData?.ticketsTotales || 100 
                  }}
                  fullWidth
                  sx={{ mt: 2 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      aplicarCambioNumero();
                    }
                  }}
                />
                {dialogoNumero.numero && (
                  <Alert 
                    severity={dialogoNumero.numero ? 
                      (verificarDisponibilidadNumero(parseInt(dialogoNumero.numero), dialogoNumero.index).disponible ? "success" : "error") 
                      : "info"
                    }
                    sx={{ mt: 2 }}
                  >
                    {dialogoNumero.numero ? 
                      verificarDisponibilidadNumero(parseInt(dialogoNumero.numero), dialogoNumero.index).mensaje 
                      : 'Ingresa un número'
                    }
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={cerrarDialogoNumero}>Cancelar</Button>
                <Button 
                  onClick={aplicarCambioNumero}
                  disabled={!dialogoNumero.numero || !verificarDisponibilidadNumero(parseInt(dialogoNumero.numero)).disponible}
                  variant="contained"
                >
                  Aplicar
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );

      // Los otros casos (steps 1, 2, 3) se mantienen igual...
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
              Información Personal
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cédula de Identidad"
                  value={formData.cedula}
                  onChange={handleInputChange('cedula')}
                  placeholder="Ej: V-12345678"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={formData.nombre}
                  onChange={handleInputChange('nombre')}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono / WhatsApp"
                  value={formData.telefono}
                  onChange={handleInputChange('telefono')}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Estado - Ciudad"
                  value={formData.estadoCiudad}
                  onChange={handleInputChange('estadoCiudad')}
                  placeholder="Ej: Caracas, Distrito Capital"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Importante:</strong> El correo electrónico es donde recibirás la notificación cuando tu ticket sea aprobado. 
                    Asegúrate de tener acceso a esta cuenta.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
              Método de Pago
            </Typography>

            {cargandoMetodosPago ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ color: '#FF6B35', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#718096' }}>
                  Cargando métodos de pago...
                </Typography>
              </Box>
            ) : metodosPago.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  No hay métodos de pago disponibles
                </Typography>
                <Typography variant="body2">
                  Por favor, contacte al administrador para habilitar los métodos de pago.
                </Typography>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Selecciona Método de Pago</InputLabel>
                    <Select
                      value={metodoPago}
                      label="Selecciona Método de Pago"
                      onChange={(e) => setMetodoPago(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      {metodosPago.map(metodo => (
                        <MenuItem key={metodo.value} value={metodo.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ mr: 1 }}>{metodo.icon}</Typography>
                            {metodo.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {metodoPago && datosEmpresa[metodoPago] && (
                    <Card sx={{ border: '2px solid #FF6B35', borderRadius: 2, mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2 }}>
                          Datos para el Pago - {metodosPago.find(m => m.value === metodoPago)?.label}
                        </Typography>
                        
                        {/* Filtrar y mostrar solo los datos que tienen valor */}
                        {Object.entries(datosEmpresa[metodoPago])
                          .filter(([key, value]) => value && value.trim() !== '') // Solo mostrar campos con valor
                          .map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ color: '#718096', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {key.replace(/_/g, ' ')}:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#2D3748' }}>
                                {value}
                              </Typography>
                            </Box>
                          ))}

                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                          <Typography variant="body2">
                            Realiza el pago con estos datos y guarda el comprobante.
                            {formData.referencia && ` Tu referencia: ${formData.referencia}`}
                          </Typography>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}

                  {metodoPago && !datosEmpresa[metodoPago] && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        No se encontraron datos para este método de pago. Por favor, contacte al administrador.
                      </Typography>
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Referencia del Comprobante (Últimos 4 dígitos)"
                    value={formData.referencia}
                    onChange={handleInputChange('referencia')}
                    placeholder="Ej: 1234"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Receipt sx={{ color: '#FF6B35' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ border: '2px dashed #FF6B35', borderRadius: 2, p: 2 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <PhotoCamera sx={{ fontSize: 48, color: '#FF6B35', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 1 }}>
                        Captura del Comprobante
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                        Sube una imagen clara del comprobante de pago
                      </Typography>

                      <Button
                        variant="outlined"
                        component="label"
                        sx={{
                          borderColor: '#FF6B35',
                          color: '#FF6B35',
                          borderRadius: 2,
                          mb: 2
                        }}
                      >
                        Seleccionar Archivo
                        <input
                          type="file"
                          hidden
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </Button>

                      {formData.comprobante && (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2">
                            Archivo seleccionado: {formData.comprobante.name}
                          </Typography>
                        </Alert>
                      )}

                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>Formatos aceptados:</strong> JPG, PNG, PDF, HEIC<br />
                          <strong>Tamaño máximo:</strong> 10MB
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 1 }}>
                      Resumen del Pedido
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Tickets:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748' }}>{cantidadTickets}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Precio unitario:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748' }}>${rifaData?.precioTicket || '0'}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>Total:</Typography>
                      <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>${totalPagar}</Typography>
                    </Box>
                    {numerosSeleccionados.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          Números: {numerosSeleccionados.filter(num => num).sort((a, b) => a - b).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2 }}>
              ¡Compra Exitosa!
            </Typography>
            <Typography variant="h6" sx={{ color: '#718096', mb: 3 }}>
              Tu compra ha sido procesada correctamente
            </Typography>

            <Card sx={{ maxWidth: 400, mx: 'auto', border: '2px solid #4CAF50', borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2 }}>
                  Resumen de tu Compra
                </Typography>
                
                <Box sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#718096' }}>Tickets:</Typography>
                    <Typography variant="body2" sx={{ color: '#2D3748' }}>{cantidadTickets}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#718096' }}>Números:</Typography>
                    <Typography variant="body2" sx={{ color: '#2D3748' }}>
                      {numerosSeleccionados.filter(num => num).sort((a, b) => a - b).join(', ')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#718096' }}>Método de pago:</Typography>
                    <Typography variant="body2" sx={{ color: '#2D3748' }}>
                      {metodosPago.find(m => m.value === metodoPago)?.label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#718096' }}>Total pagado:</Typography>
                    <Typography variant="body2" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>${totalPagar}</Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Recibirás un correo electrónico con los detalles de tus tickets una vez que sean verificados.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                <strong>📞 Soporte al Cliente</strong><br />
                Para cualquier duda o consulta sobre tu compra,<br />
                contacta a nuestro equipo de soporte:<br />
                <strong>WhatsApp: +58 412-1298675</strong><br />
                Horario: Lunes a Viernes 9:00 AM - 6:00 PM
              </Typography>
            </Alert>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                  backgroundColor: '#FF6B35',
                  '&:hover': { backgroundColor: '#FF8E53' },
                  borderRadius: 2,
                  px: 4,
                  py: 1
                }}
              >
                Volver al Dashboard
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <WhatsAppButton />
      {/* Snackbars para feedback */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2, color: '#FF6B35' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Comprar Tickets
          </Typography>
          <Typography variant="body1" sx={{ color: '#a9bddaff' }}>
            {rifaData?.titulo || 'Cargando...'}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Contenido del Paso */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {getStepContent(activeStep)}

          {/* Botones de Navegación */}
          {activeStep < steps.length - 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                sx={{ color: '#FF6B35' }}
              >
                Atrás
              </Button>

              <Button
                variant="contained"
                onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
                disabled={isStepDisabled() || loading}
                sx={{
                  backgroundColor: '#FF6B35',
                  '&:hover': { backgroundColor: '#FF8E53' },
                  borderRadius: 2,
                  px: 4,
                  position: 'relative'
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Procesando...
                  </>
                ) : (
                  activeStep === steps.length - 2 ? 'Completar Compra' : 'Siguiente'
                )}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CompraTickets;