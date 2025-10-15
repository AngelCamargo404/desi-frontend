import React, { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Grid
} from '@mui/material';
import {
  ConfirmationNumber,
  Verified,
  Pending,
  Email,
  ExpandMore,
  ExpandLess,
  Receipt,
  CalendarToday,
  Payment,
  Person,
  LocalOffer
} from '@mui/icons-material';
import { ticketsApi } from '../../services/ticketsApi';

const VerificationModal = ({ open, onClose, rifaId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [expandedCompra, setExpandedCompra] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResultado(null);

    try {
      // Usar el nuevo endpoint del backend
      const response = await ticketsApi.verificarTicketsPorEmail(rifaId, email);

      if (response.success) {
        setResultado(response.data);
        
        if (response.data.compras.length === 0) {
          setError('No se encontraron tickets para este correo electrónico');
        }
      } else {
        setError('Error al buscar tickets');
      }
    } catch (error) {
      console.error('Error al verificar tickets:', error);
      setError(error.message || 'Error al verificar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setResultado(null);
    setError('');
    setLoading(false);
    setExpandedCompra(null);
    onClose();
  };

  const toggleExpand = (transaccionId) => {
    setExpandedCompra(expandedCompra === transaccionId ? null : transaccionId);
  };

  const getStatusColor = (verificado) => {
    return verificado ? 'success' : 'warning';
  };

  const getStatusText = (verificado) => {
    return verificado ? 'Verificado' : 'Pendiente';
  };

  const getStatusIcon = (verificado) => {
    return verificado ? <Verified /> : <Pending />;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 500, md: 700 },
        maxHeight: '90vh',
        overflow: 'auto',
        outline: 'none'
      }}>
        <Paper sx={{ 
          p: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,248,245,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,107,53,0.3)',
          borderRadius: '16px'
        }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#2D3748', 
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 3
          }}>
            🎫 Verificar Mis Tickets
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ingresa tu correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: '#FF6B35' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }
              }}
              helperText="Usa el mismo email con el que compraste los tickets"
            />
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
                sx={{
                  borderRadius: '25px',
                  px: 3,
                  borderColor: '#FF6B35',
                  color: '#FF6B35'
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !email}
                sx={{
                  borderRadius: '25px',
                  px: 4,
                  background: 'linear-gradient(45deg, #FF6B35 0%, #FF8E53 100%)',
                  fontWeight: 'bold'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Buscar Tickets'}
              </Button>
            </Box>
          </form>

          {/* Estado de carga */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
              <CircularProgress sx={{ color: '#FF6B35' }} />
              <Typography variant="body2" sx={{ color: '#666' }}>
                Buscando tus tickets...
              </Typography>
            </Box>
          )}

          {/* Mensajes de error */}
          {error && !loading && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                borderRadius: '12px'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Resultados */}
          {resultado && resultado.compras.length > 0 && !loading && (
            <Box sx={{ mt: 4 }}>
              {/* Header con estadísticas */}
              <Card sx={{ mb: 3, backgroundColor: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                        📧 {resultado.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        <strong>Compras:</strong> {resultado.totalCompras}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        <strong>Tickets:</strong> {resultado.totalTickets}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Chip 
                        label={`${resultado.comprasVerificadas} verificadas`}
                        color="success" 
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Lista de compras */}
              <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2 }}>
                Tus Compras
              </Typography>
              
              <List sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                {resultado.compras.map((compra, index) => (
                  <Card key={compra.transaccionId} sx={{ 
                    border: '2px solid',
                    borderColor: compra.verificado ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)',
                    backgroundColor: compra.verificado ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease'
                  }}>
                    <CardContent sx={{ p: 0 }}>
                      {/* Header de la compra */}
                      <ListItem 
                        sx={{ 
                          px: 3,
                          py: 2,
                          cursor: 'pointer',
                          backgroundColor: compra.verificado ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)'
                        }}
                        onClick={() => toggleExpand(compra.transaccionId)}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Receipt sx={{ 
                            fontSize: 32,
                            color: compra.verificado ? '#4CAF50' : '#FF6B35'
                          }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2D3748' }}>
                                Compra {index + 1}
                              </Typography>
                              <Chip
                                icon={getStatusIcon(compra.verificado)}
                                label={getStatusText(compra.verificado)}
                                color={getStatusColor(compra.verificado)}
                                variant="filled"
                                size="medium"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {formatFecha(compra.fechaCompra)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalOffer sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold' }}>
                                  {compra.cantidadTickets} ticket(s)
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <IconButton size="small">
                          {expandedCompra === compra.transaccionId ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </ListItem>

                      {/* Detalles expandibles */}
                      <Collapse in={expandedCompra === compra.transaccionId} timeout="auto" unmountOnExit>
                        <Divider />
                        
                        <Box sx={{ p: 3 }}>
                          {/* Información de pago */}
                          {compra.metodoPago && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Payment /> Información de Pago
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: '#666' }}>
                                    <strong>Método:</strong> {compra.metodoPago}
                                  </Typography>
                                </Grid>
                                {compra.referenciaPago && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                      <strong>Referencia:</strong> {compra.referenciaPago}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )}

                          {/* Números de tickets */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: '#2D3748', fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ConfirmationNumber /> Números de Tickets ({compra.numerosTickets.length})
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1,
                              p: 2,
                              backgroundColor: 'rgba(0,0,0,0.02)',
                              borderRadius: '8px'
                            }}>
                              {compra.numerosTickets
                                .sort((a, b) => a - b)
                                .map((numero, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`#${numero}`}
                                    variant="outlined"
                                    size="medium"
                                    sx={{
                                      borderColor: '#FF6B35',
                                      color: '#FF6B35',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                ))
                              }
                            </Box>
                          </Box>

                          {/* Información de verificación */}
                          {compra.verificado && compra.fechaVerificacion && (
                            <Box sx={{ p: 2, backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: '8px' }}>
                              <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                                ✅ Verificado el {formatFecha(compra.fechaVerificacion)}
                                {compra.verificadoPor && ` por ${compra.verificadoPor}`}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      </Box>
    </Modal>
  );
};

export default VerificationModal;