// AdminCreateRaffle.jsx - ACTUALIZADO con campos opcionales
import React, { useState } from 'react';
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
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  useTheme,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Casino,
  AddPhotoAlternate,
  AttachMoney,
  Numbers,
  CardGiftcard,
  Description,
  ArrowBack,
  Add,
  Remove,
  Event,
  CurrencyExchange,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import raffleApi from '../../services/raffleApi';
import prizeApi from '../../services/prizeApi';

const AdminCreateRaffle = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precioTicket: '',
    precioTicketBS: '',
    moneda: 'USD',
    minTickets: '1',
    ticketsTotales: '',
    imagen: null,
    fechaSorteo: '',
    tieneFechaSorteo: false
  });
  
  const [premios, setPremios] = useState([{ 
    nombre: '',
    descripcion: '',
    valor: '',
    valorBS: '',
    moneda: 'USD',
    tieneValor: false // Nuevo campo para controlar si el premio tiene valor
  }]);

  const steps = ['Información Básica', 'Configuración de Premios', 'Revisar y Crear'];

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMonedaChange = (event) => {
    const moneda = event.target.value;
    setFormData(prev => ({
      ...prev,
      moneda: moneda
    }));
  };

  // Nuevo: Manejar toggle de valor en premios
  const handlePremioTieneValorChange = (index, tieneValor) => {
    const nuevosPremios = [...premios];
    nuevosPremios[index] = {
      ...nuevosPremios[index],
      tieneValor: tieneValor,
      // Limpiar valores si se desactiva
      ...(!tieneValor && {
        valor: '',
        valorBS: '',
        moneda: 'USD'
      })
    };
    setPremios(nuevosPremios);
  };

  const handlePremioMonedaChange = (index, moneda) => {
    const nuevosPremios = [...premios];
    nuevosPremios[index] = {
      ...nuevosPremios[index],
      moneda: moneda
    };
    setPremios(nuevosPremios);
  };

  const handleToggleFechaSorteo = (event) => {
    const tieneFecha = event.target.checked;
    setFormData(prev => ({
      ...prev,
      tieneFechaSorteo: tieneFecha,
      fechaSorteo: tieneFecha ? prev.fechaSorteo : ''
    }));
  };

  const handleFechaSorteoChange = (event) => {
    setFormData(prev => ({
      ...prev,
      fechaSorteo: event.target.value
    }));
  };

  const handlePremioChange = (index, field, value) => {
    const nuevosPremios = [...premios];
    nuevosPremios[index] = {
      ...nuevosPremios[index],
      [field]: value
    };
    setPremios(nuevosPremios);
  };

  const agregarPremio = () => {
    setPremios(prev => [...prev, { 
      nombre: '', 
      descripcion: '', 
      valor: '',
      valorBS: '',
      moneda: 'USD',
      tieneValor: false
    }]);
  };

  const eliminarPremio = (index) => {
    if (premios.length > 1) {
      const nuevosPremios = premios.filter((_, i) => i !== index);
      setPremios(nuevosPremios);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe exceder los 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      setError('');
    }
  };

  const handleNext = () => {
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Validaciones finales
      if (!formData.titulo.trim()) {
        throw new Error('El título de la rifa es requerido');
      }
      
      // Validar precio según la moneda seleccionada
      if (formData.moneda === 'USD' && (!formData.precioTicket || formData.precioTicket <= 0)) {
        throw new Error('El precio del ticket en USD debe ser mayor a 0');
      }
      
      if (formData.moneda === 'BS' && (!formData.precioTicketBS || formData.precioTicketBS <= 0)) {
        throw new Error('El precio del ticket en BS debe ser mayor a 0');
      }
      
      if (!formData.ticketsTotales || formData.ticketsTotales <= 0) {
        throw new Error('El total de tickets debe ser mayor a 0');
      }

      // Validar fecha si está activada
      if (formData.tieneFechaSorteo && !formData.fechaSorteo) {
        throw new Error('Debe seleccionar una fecha de sorteo');
      }

      // Validar que la fecha no sea en el pasado si está activada
      if (formData.tieneFechaSorteo && formData.fechaSorteo) {
        const fechaSorteo = new Date(formData.fechaSorteo);
        const ahora = new Date();
        if (fechaSorteo <= ahora) {
          throw new Error('La fecha del sorteo debe ser futura');
        }
      }
      
      // Validar que todos los premios tengan nombre y descripción
      const premiosInvalidos = premios.some(premio => 
        !premio.nombre.trim() || !premio.descripcion.trim()
      );
      
      if (premiosInvalidos) {
        throw new Error('Todos los premios deben tener nombre y descripción');
      }

      // Preparar datos para enviar
      const raffleData = {
        ...formData,
        precioTicket: formData.moneda === 'USD' ? parseFloat(formData.precioTicket) : parseFloat(formData.precioTicketBS),
        precioTicketBS: formData.moneda === 'BS' ? parseFloat(formData.precioTicketBS) : (formData.precioTicketBS ? parseFloat(formData.precioTicketBS) : null),
        moneda: formData.moneda,
        ticketsTotales: parseInt(formData.ticketsTotales),
        minTickets: parseInt(formData.minTickets)
      };

      // Solo incluir fechaSorteo si está activada y tiene valor
      if (formData.tieneFechaSorteo && formData.fechaSorteo) {
        raffleData.fechaSorteo = formData.fechaSorteo;
      } else {
        delete raffleData.fechaSorteo;
      }

      // Remover el campo temporal tieneFechaSorteo antes de enviar
      delete raffleData.tieneFechaSorteo;

      // Preparar premios - solo incluir valor si tieneValor es true
      const premiosParaEnviar = premios.map(premio => {
        const premioData = {
          nombre: premio.nombre,
          descripcion: premio.descripcion
        };

        // Solo incluir campos de valor si el premio tiene valor
        if (premio.tieneValor) {
          premioData.moneda = premio.moneda;
          if (premio.moneda === 'USD' && premio.valor) {
            premioData.valor = parseFloat(premio.valor);
          }
          if (premio.moneda === 'BS' && premio.valorBS) {
            premioData.valorBS = parseFloat(premio.valorBS);
          }
        }

        return premioData;
      });

      // 1. Primero crear la rifa (sin premios)
      const responseRaffle = await raffleApi.crearRaffle(raffleData);

      if (!responseRaffle.success) {
        throw new Error(responseRaffle.message || 'Error al crear la rifa');
      }

      const rifaId = responseRaffle.data.id;

      // 2. Luego crear los premios por separado
      if (premiosParaEnviar.length > 0) {
        const responsePremios = await prizeApi.crearPremiosParaRifa(rifaId, premiosParaEnviar);

        if (!responsePremios.success) {
          throw new Error('Rifa creada, pero error al crear premios: ' + responsePremios.message);
        }
        
      }

      setSuccess('Rifa y premios creados exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/raffles');
      }, 2000);

    } catch (error) {
      console.error('Error en el proceso:', error);
      setError(error.message || 'Error al crear la rifa. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
              Información de la Rifa
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título de la Rifa"
                  value={formData.titulo}
                  onChange={handleInputChange('titulo')}
                  placeholder="Ej: Gran Rifa Millonaria 2024"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Casino sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={handleInputChange('descripcion')}
                  multiline
                  rows={4}
                  placeholder="Describe los detalles de la rifa, condiciones, etc."
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description sx={{ color: '#FF6B35', mt: -2 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Selector de moneda */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Moneda Principal</InputLabel>
                  <Select
                    value={formData.moneda}
                    label="Moneda Principal"
                    onChange={handleMonedaChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <CurrencyExchange sx={{ color: '#FF6B35', ml: 1 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="USD">Dólares (USD)</MenuItem>
                    <MenuItem value="BS">Bolívares (BS)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Campos de precio según moneda seleccionada */}
              {formData.moneda === 'USD' ? (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Precio por Ticket (USD)"
                      type="number"
                      value={formData.precioTicket}
                      onChange={handleInputChange('precioTicket')}
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
                      value={formData.precioTicketBS}
                      onChange={handleInputChange('precioTicketBS')}
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
                      value={formData.precioTicketBS}
                      onChange={handleInputChange('precioTicketBS')}
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
                      value={formData.precioTicket}
                      onChange={handleInputChange('precioTicket')}
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

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Mínimo de Tickets</InputLabel>
                  <Select
                    value={formData.minTickets}
                    label="Mínimo de Tickets"
                    onChange={handleInputChange('minTickets')}
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <MenuItem key={num} value={num}>
                        {num} ticket{num > 1 ? 's' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total de Tickets Disponibles"
                  type="number"
                  value={formData.ticketsTotales}
                  onChange={handleInputChange('ticketsTotales')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Numbers sx={{ color: '#FF6B35' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Campo para fecha de sorteo */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #FF6B35', borderRadius: 2, mt: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Event sx={{ color: '#FF6B35', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                      Fecha del Sorteo (Opcional)
                    </Typography>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.tieneFechaSorteo}
                        onChange={handleToggleFechaSorteo}
                        color="primary"
                      />
                    }
                    label="Establecer fecha de sorteo"
                  />

                  {formData.tieneFechaSorteo && (
                    <TextField
                      fullWidth
                      label="Fecha y Hora del Sorteo"
                      type="datetime-local"
                      value={formData.fechaSorteo}
                      onChange={handleFechaSorteoChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{ mt: 2 }}
                      helperText="Selecciona la fecha y hora en la que se realizará el sorteo"
                    />
                  )}
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ border: '2px dashed #FF6B35', borderRadius: 2, mt: 2 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <AddPhotoAlternate sx={{ fontSize: 48, color: '#FF6B35', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 1 }}>
                      Imagen de la Rifa
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                      Sube una imagen atractiva para promocionar tu rifa
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
                      Seleccionar Imagen
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>

                    {formData.imagen && (
                      <Alert severity="success" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2">
                          Imagen seleccionada: {formData.imagen.name}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
              Configuración de Premios
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#718096' }}>
                {premios.length} premio{premios.length !== 1 ? 's' : ''} configurado{premios.length !== 1 ? 's' : ''}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={agregarPremio}
                sx={{
                  borderColor: '#FF6B35',
                  color: '#FF6B35',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 53, 0.1)'
                  }
                }}
              >
                Agregar Premio
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {premios.map((premio, index) => (
              <Card key={index} sx={{ mb: 2, border: '1px solid #FF6B35', borderRadius: 2, position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CardGiftcard sx={{ color: '#FF6B35', mr: 1 }} />
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        Premio {index + 1}
                      </Typography>
                    </Box>
                    {premios.length > 1 && (
                      <IconButton 
                        onClick={() => eliminarPremio(index)}
                        sx={{ color: '#FF6B35' }}
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={`Nombre del Premio ${index + 1}`}
                        value={premio.nombre}
                        onChange={(e) => handlePremioChange(index, 'nombre', e.target.value)}
                        placeholder={`Ej: Primer Premio`}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={premio.tieneValor}
                            onChange={(e) => handlePremioTieneValorChange(index, e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Este premio tiene valor monetario"
                      />
                    </Grid>
                  </Grid>
                  
                  <TextField
                    fullWidth
                    label={`Descripción del Premio ${index + 1}`}
                    value={premio.descripcion}
                    onChange={(e) => handlePremioChange(index, 'descripcion', e.target.value)}
                    placeholder={`Describe el premio ${index + 1}`}
                    multiline
                    rows={2}
                    sx={{ mt: 1, mb: 2 }}
                  />

                  {/* Sección de valor monetario (solo se muestra si tieneValor es true) */}
                  <Collapse in={premio.tieneValor}>
                    <Box sx={{ p: 2, backgroundColor: 'rgba(255, 107, 53, 0.05)', borderRadius: 1, mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 2 }}>
                        Valor Monetario del Premio
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Moneda del Premio</InputLabel>
                            <Select
                              value={premio.moneda}
                              label="Moneda del Premio"
                              onChange={(e) => handlePremioMonedaChange(index, e.target.value)}
                            >
                              <MenuItem value="USD">Dólares (USD)</MenuItem>
                              <MenuItem value="BS">Bolívares (BS)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={8}>
                          {premio.moneda === 'USD' ? (
                            <TextField
                              fullWidth
                              label="Valor (USD)"
                              type="number"
                              value={premio.valor}
                              onChange={(e) => handlePremioChange(index, 'valor', e.target.value)}
                              placeholder="Ej: 1000"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney sx={{ color: '#FF6B35' }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          ) : (
                            <TextField
                              fullWidth
                              label="Valor (BS)"
                              type="number"
                              value={premio.valorBS}
                              onChange={(e) => handlePremioChange(index, 'valorBS', e.target.value)}
                              placeholder="Ej: 1000000"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography sx={{ color: '#FF6B35', fontWeight: 'bold' }}>BS</Typography>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Nota:</strong> Los campos de valor monetario son opcionales. 
                Úsalos solo si el premio es dinero o tiene un valor monetario específico.
                Para premios como productos físicos o servicios, puedes dejar esta sección desactivada.
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
              Resumen de la Rifa
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ border: '2px solid #FF6B35', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                      {formData.titulo || 'Sin título'}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: '#718096', mb: 2 }}>
                      {formData.descripcion || 'Sin descripción'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Moneda principal:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {formData.moneda === 'USD' ? 'Dólares (USD)' : 'Bolívares (BS)'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Precio por ticket:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {formData.moneda === 'USD' 
                          ? `$${formData.precioTicket || '0'}`
                          : `BS ${formData.precioTicketBS || '0'}`
                        }
                      </Typography>
                    </Box>

                    {formData.moneda === 'USD' && formData.precioTicketBS && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#718096' }}>Precio equivalente en BS:</Typography>
                        <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                          BS {formData.precioTicketBS}
                        </Typography>
                      </Box>
                    )}

                    {formData.moneda === 'BS' && formData.precioTicket && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#718096' }}>Precio equivalente en USD:</Typography>
                        <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                          ${formData.precioTicket}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Mínimo de tickets:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {formData.minTickets}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Total de tickets:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {formData.ticketsTotales || '0'}
                      </Typography>
                    </Box>

                    {formData.tieneFechaSorteo && formData.fechaSorteo && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#718096' }}>Fecha del sorteo:</Typography>
                        <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                          {new Date(formData.fechaSorteo).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#718096' }}>Cantidad de premios:</Typography>
                      <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {premios.length}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ border: '2px solid #4CAF50', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                      Premios Configurados ({premios.length})
                    </Typography>
                    
                    {premios.map((premio, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                          {premio.nombre || `Premio ${index + 1}`}
                        </Typography>
                        {premio.tieneValor && premio.moneda === 'USD' && premio.valor && (
                          <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                            Valor: ${premio.valor} USD
                          </Typography>
                        )}
                        {premio.tieneValor && premio.moneda === 'BS' && premio.valorBS && (
                          <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                            Valor: BS {premio.valorBS}
                          </Typography>
                        )}
                        {!premio.tieneValor && (
                          <Typography variant="body2" sx={{ color: '#2D3748', fontStyle: 'italic' }}>
                            Premio no monetario (producto o servicio)
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: '#2D3748' }}>
                          {premio.descripcion || 'Sin descripción'}
                        </Typography>
                      </Box>
                    ))}

                    {formData.imagen && (
                      <Alert severity="success" sx={{ borderRadius: 2, mt: 2 }}>
                        <Typography variant="body2">
                          Imagen lista: {formData.imagen.name}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Revisa toda la información antes de crear la rifa. 
                Primero se creará la rifa y luego los premios de forma independiente.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4 }}>
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
        <IconButton 
          onClick={() => navigate('/admin')} 
          sx={{ mr: 2, color: '#FF6B35' }}
          disabled={loading}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ color: '#ffffffff', fontWeight: 'bold' }}>
            Crear Nueva Rifa
          </Typography>
          <Typography variant="body1" sx={{ color: '#a9bddaff' }}>
            Configura los detalles de tu nueva rifa
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Contenido del Formulario */}
      <Card sx={{ 
        borderRadius: 2, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 107, 53, 0.2)'
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {getStepContent(activeStep)}

          {/* Botones de Navegación */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0
          }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{ 
                color: '#FF6B35',
                order: isMobile ? 2 : 1
              }}
            >
              Atrás
            </Button>

            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={
                (activeStep === 0 && (
                  !formData.titulo || 
                  !formData.ticketsTotales ||
                  (formData.moneda === 'USD' && !formData.precioTicket) ||
                  (formData.moneda === 'BS' && !formData.precioTicketBS)
                )) ||
                (activeStep === 1 && premios.some(premio => !premio.nombre.trim() || !premio.descripcion.trim())) ||
                loading
              }
              sx={{
                backgroundColor: '#FF6B35',
                '&:hover': { 
                  backgroundColor: '#FF8E53',
                  transform: 'translateY(-2px)'
                },
                borderRadius: 2,
                px: 4,
                py: 1,
                fontWeight: 'bold',
                order: isMobile ? 1 : 2,
                position: 'relative'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                  Creando Rifa...
                </>
              ) : (
                activeStep === steps.length - 1 ? 'Crear Rifa y Premios' : 'Siguiente'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminCreateRaffle;