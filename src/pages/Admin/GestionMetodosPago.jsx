// components/admin/GestionMetodosPago.jsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Payment,
  Save,
  Cancel
} from '@mui/icons-material';
import paymentMethodsApi from '../../services/paymentMethodsApi';

const GestionMetodosPago = () => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [backendError, setBackendError] = useState(''); // Nuevo estado para errores del backend

  // Datos del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    requiereComprobante: true,
    requiereReferencia: true,
    activo: true,
    orden: 0,
    datos: {
      banco: '',
      tipo: '',
      numero: '',
      cedula_rif: '',
      telefono: '',
      cedula: '',
      email: '',
      binancePay: '',
      titular: ''
    }
  });

  const metodosConfig = {
    transferencia: {
      nombre: 'Transferencia Bancaria',
      campos: ['banco', 'tipo', 'numero', 'titular', 'cedula_rif'],
      labels: {
        banco: 'Banco',
        tipo: 'Tipo de Cuenta',
        numero: 'Número de Cuenta',
        titular: 'Titular',
        cedula_rif: 'Cédula/RIF'
      }
    },
    pago_movil: {
      nombre: 'Pago Móvil',
      campos: ['banco', 'telefono', 'cedula', 'titular'],
      labels: {
        banco: 'Banco',
        telefono: 'Teléfono',
        cedula: 'Cédula',
        titular: 'Titular'
      }
    },
    zelle: {
      nombre: 'Zelle',
      campos: ['email', 'titular'],
      labels: {
        email: 'Email',
        titular: 'Titular'
      }
    },
    binance: {
      nombre: 'Binance',
      campos: ['binancePay', 'titular'], // Cambiado de 'wallet' a 'binancePay'
      labels: {
        binancePay: 'Binance Pay', // Literal como solicitado
        titular: 'Titular'
      }
    }
  };

  useEffect(() => {
    cargarMetodosPago();
  }, []);

  const cargarMetodosPago = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodsApi.obtenerTodos();
      setMetodosPago(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para convertir Map a objeto regular
  const mapToObject = (map) => {
  if (!map) return {};
  if (typeof map === 'object' && !(map instanceof Map)) {
    return map;
  }
  const obj = {};
  for (const [key, value] of map) {
    // Migración: si existe 'wallet' lo convertimos a 'binancePay'
    if (key === 'wallet') {
      obj['binancePay'] = value;
    } else {
      obj[key] = value;
    }
  }
  return obj;
};

  const handleOpenDialog = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        codigo: method.codigo,
        nombre: method.nombre,
        requiereComprobante: method.requiereComprobante,
        requiereReferencia: method.requiereReferencia,
        activo: method.activo,
        orden: method.orden,
        datos: mapToObject(method.datos)
      });
    } else {
      setEditingMethod(null);
      setFormData({
        codigo: '',
        nombre: '',
        requiereComprobante: true,
        requiereReferencia: true,
        activo: true,
        orden: 0,
        datos: {
          banco: '',
          tipo: '',
          numero: '',
          cedula_rif: '',
          telefono: '',
          cedula: '',
          email: '',
          binancePay: '',
          titular: '' 
        }
      });
    }
    setFormErrors({});
    setBackendError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
    setFormErrors({});
    setBackendError(''); // Limpiar errores del backend al cerrar
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    // Limpiar error del backend cuando el usuario modifique algún campo
    if (backendError) {
      setBackendError('');
    }
  };

  const handleDatosChange = (campo) => (event) => {
    setFormData(prev => ({
      ...prev,
      datos: {
        ...prev.datos,
        [campo]: event.target.value
      }
    }));
    if (formErrors[campo]) {
      setFormErrors(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
    // Limpiar error del backend cuando el usuario modifique algún campo
    if (backendError) {
      setBackendError('');
    }
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  // Función para extraer mensajes de error del backend
  const extractBackendError = (error) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      
      // Si es un mensaje directo
      if (typeof data === 'string') {
        return data;
      }
      
      // Si es un objeto con mensaje
      if (data.message) {
        return data.message;
      }
      
      // Si es un objeto de validación con detalles
      if (data.errors) {
        const errorMessages = Object.values(data.errors).map(err => err.message || err);
        return errorMessages.join(', ');
      }
      
      // Si es un array de errores
      if (Array.isArray(data)) {
        return data.map(err => err.message || err).join(', ');
      }
    }
    
    // Mensaje por defecto
    return error.message || 'Error del servidor';
  };

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos del frontend
      const errors = {};
      
      if (!formData.codigo.trim()) {
        errors.codigo = 'El código del método es requerido';
      }

      if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre del método es requerido';
      }

      // Validar campos específicos del método seleccionado
      const config = metodosConfig[formData.codigo];
      if (config) {
        for (const campo of config.campos) {
          if (!formData.datos[campo] || !formData.datos[campo].toString().trim()) {
            errors[campo] = `El campo ${config.labels[campo]} es requerido`;
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Si pasa la validación del frontend, proceder con el envío al backend
      if (editingMethod) {
        await paymentMethodsApi.actualizar(formData.codigo, formData);
        setSuccess('Método de pago actualizado exitosamente');
      } else {
        await paymentMethodsApi.crear(formData);
        setSuccess('Método de pago creado exitosamente');
      }

      handleCloseDialog();
      cargarMetodosPago();
    } catch (error) {
      // Manejar error del backend y mostrarlo en el diálogo
      const backendErrorMessage = extractBackendError(error);
      setBackendError(backendErrorMessage);
      
      // También puedes mapear errores específicos de campos si el backend los proporciona
      if (error.response && error.response.data && error.response.data.errors) {
        const fieldErrors = {};
        Object.keys(error.response.data.errors).forEach(field => {
          fieldErrors[field] = error.response.data.errors[field].message || error.response.data.errors[field];
        });
        setFormErrors(fieldErrors);
      }
    }
  };

  const handleToggleActivo = async (method, activo) => {
    try {
      await paymentMethodsApi.cambiarEstado(method.codigo, activo);
      setSuccess(`Método de pago ${activo ? 'activado' : 'desactivado'} exitosamente`);
      cargarMetodosPago();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (method) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el método de pago ${method.nombre}?`)) {
      try {
        await paymentMethodsApi.eliminar(method.codigo);
        setSuccess('Método de pago eliminado exitosamente');
        cargarMetodosPago();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  // Función para filtrar y mostrar solo datos con valor
  const obtenerDatosConValor = (datos, codigo) => {
    const datosObjeto = mapToObject(datos);
    const entries = Object.entries(datosObjeto).filter(([key, value]) => value && value.trim() !== '');
    
    // Si tenemos el método configurado, usamos los labels correctos
    if (metodosConfig[codigo]) {
      return entries.map(([key, value]) => ({
        key,
        value,
        label: metodosConfig[codigo].labels[key] || key
      }));
    }
    
    return entries.map(([key, value]) => ({ key, value, label: key }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Cargando métodos de pago...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Snackbars */}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
          Gestión de Métodos de Pago
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#FF6B35',
            '&:hover': { backgroundColor: '#FF8E53' }
          }}
        >
          Nuevo Método
        </Button>
      </Box>

      {/* Lista de Métodos de Pago */}
      <Grid container spacing={3}>
        {metodosPago.map((method) => {
          const datosConValor = obtenerDatosConValor(method.datos);
          
          return (
            <Grid item xs={12} md={6} key={method._id}>
              <Card 
                sx={{ 
                  border: `2px solid ${method.activo ? '#4CAF50' : '#9E9E9E'}`,
                  opacity: method.activo ? 1 : 0.7
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                      {method.nombre}
                    </Typography>
                    <Chip 
                      label={method.activo ? 'Activo' : 'Inactivo'} 
                      color={method.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Datos de Pago:
                  </Typography>
                  
                  {datosConValor.length > 0 ? (
                    datosConValor.map(({ key, value, label }) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#718096' }}>
                          {label}:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 'medium' }}>
                          {value}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#9E9E9E', fontStyle: 'italic' }}>
                      No hay datos configurados
                    </Typography>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={method.requiereComprobante ? 'Requiere comprobante' : 'Sin comprobante'} 
                      size="small"
                      color={method.requiereComprobante ? 'primary' : 'default'}
                      variant="outlined"
                    />
                    <Chip 
                      label={method.requiereReferencia ? 'Requiere referencia' : 'Sin referencia'} 
                      size="small"
                      color={method.requiereReferencia ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={method.activo}
                        onChange={(e) => handleToggleActivo(method, e.target.checked)}
                        color="success"
                      />
                    }
                    label="Activo"
                  />
                  <Box>
                    <IconButton 
                      onClick={() => handleOpenDialog(method)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(method)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Diálogo para crear/editar */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            minHeight: '600px' // Asegurar que el diálogo tenga suficiente altura
          }
        }}
      >
        <DialogTitle>
          {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
        </DialogTitle>
        <DialogContent>
          {/* Mostrar error del backend de forma prominente */}
          {backendError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                mt: 1,
                '& .MuiAlert-message': {
                  width: '100%',
                  overflow: 'hidden'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Error del servidor:
              </Typography>
              {backendError}
            </Alert>
          )}

          {/* Mostrar errores de validación del frontend */}
          {Object.keys(formErrors).length > 0 && !backendError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Por favor, completa todos los campos requeridos correctamente.
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!formErrors.codigo}>
                <InputLabel>Código del Método</InputLabel>
                <Select
                  value={formData.codigo}
                  label="Código del Método"
                  onChange={handleInputChange('codigo')}
                  disabled={!!editingMethod}
                >
                  <MenuItem value="transferencia">Transferencia Bancaria</MenuItem>
                  <MenuItem value="pago_movil">Pago Móvil</MenuItem>
                  <MenuItem value="zelle">Zelle</MenuItem>
                  <MenuItem value="binance">Binance</MenuItem>
                </Select>
                {formErrors.codigo && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {formErrors.codigo}
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={handleInputChange('nombre')}
                sx={{ mb: 2 }}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiereComprobante}
                      onChange={handleSwitchChange('requiereComprobante')}
                    />
                  }
                  label="Requiere Comprobante"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiereReferencia}
                      onChange={handleSwitchChange('requiereReferencia')}
                    />
                  }
                  label="Requiere Referencia"
                />
              </Box>

              <TextField
                fullWidth
                label="Orden"
                type="number"
                value={formData.orden}
                onChange={handleInputChange('orden')}
                sx={{ mb: 2 }}
                error={!!formErrors.orden}
                helperText={formErrors.orden}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={handleSwitchChange('activo')}
                    color="success"
                  />
                }
                label="Activo"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Datos Específicos
              </Typography>

              {formData.codigo && metodosConfig[formData.codigo] && (
                <>
                  {metodosConfig[formData.codigo].campos.map((campo) => (
                    <TextField
                      key={campo}
                      fullWidth
                      label={metodosConfig[formData.codigo].labels[campo]}
                      value={formData.datos[campo] || ''}
                      onChange={handleDatosChange(campo)}
                      sx={{ mb: 2 }}
                      error={!!formErrors[campo]}
                      helperText={formErrors[campo]}
                    />
                  ))}
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<Save />}
          >
            {editingMethod ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionMetodosPago;