import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  CardMedia,
  Modal,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Casino, Star, LocalAtm, Rocket, Whatshot, ZoomIn, Close, CurrencyExchange } from '@mui/icons-material';
import ProgressBar from '../../components/ui/ProgressBar';
import WhatsAppButton from '../../components/ui/WhatsappButton';
import VerificationModal from '../../components/ui/VerificationModal';
import { useEffect } from 'react';
import activeRaffleApi from '../../services/activeRaffleApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [rifaData, setRifaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    cargarRifaActiva();
  }, []);

  const cargarRifaActiva = async () => {
    try {
      const response = await activeRaffleApi.obtenerRifaActiva();
      if (response.success) {
        setRifaData(response.data);
      } else {
        setError('No hay rifa activa en este momento');
      }
    } catch (error) {
      setError(error.message || 'Error al cargar la rifa activa');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear el precio según la moneda
  const formatearPrecio = () => {
    if (!rifaData) return { principal: '', equivalente: '' };

    if (rifaData.moneda === 'USD') {
      const principal = `$${rifaData.precioTicket} USD`;
      const equivalente = rifaData.precioTicketBS 
        ? `BS ${rifaData.precioTicketBS}` 
        : '';
      return { principal, equivalente };
    } else {
      const principal = `BS ${rifaData.precioTicketBS}`;
      const equivalente = rifaData.precioTicket 
        ? `$${rifaData.precioTicket} USD` 
        : '';
      return { principal, equivalente };
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        textAlign: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: '#FF6B35' }} />
      </Container>
    );
  }

  if (error || !rifaData) {
    return (
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        textAlign: 'center'
      }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">
            No hay rifas activas en este momento
          </Typography>
          <Typography variant="body2">
            Vuelve pronto para participar en nuestras próximas rifas
          </Typography>
        </Alert>
      </Container>
    );
  }

  const progress = (rifaData.ticketsVendidos / rifaData.ticketsTotales) * 100;
  const tieneImagen = rifaData.imagen && rifaData.imagen.url;
  const { principal, equivalente } = formatearPrecio();

  return (
    <Container maxWidth="lg" sx={{ 
      py: 4,
      textAlign: { xs: 'center', md: 'left' }
    }}>
      {/* Banner Principal */}
      <Card sx={{ 
        mb: 4, 
        background: tieneImagen 
          ? 'transparent'
          : 'linear-gradient(45deg, #FF6B35 0%, #FF8E53 50%, #FF6B35 100%)',
        color: tieneImagen ? 'inherit' : 'white',
        position: 'relative',
        overflow: 'hidden',
        border: tieneImagen ? 'none' : '2px solid #FFD700',
        boxShadow: tieneImagen ? 'none' : '0 10px 30px rgba(255, 107, 53, 0.4)',
        textAlign: 'center'
      }}>
        {tieneImagen ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={rifaData.imagen.url}
              alt={rifaData.titulo}
              sx={{
                objectFit: 'cover',
                width: '100%',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              onClick={() => setImageModalOpen(true)}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
                zIndex: 2
              }}
              onClick={() => setImageModalOpen(true)}
              size="large"
            >
              <ZoomIn />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                p: 3,
                borderRadius: '12px'
              }}
            >
              <Casino sx={{ fontSize: 60, mb: 2, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold', 
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                {rifaData.titulo}
              </Typography>
              <Typography variant="h6" sx={{ 
                opacity: 0.95, 
                maxWidth: '800px', 
                margin: '0 auto', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}>
                {rifaData.descripcion}
              </Typography>
            </Box>
          </Box>
        ) : (
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Casino sx={{ fontSize: 60, mb: 2, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 'bold', 
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}>
              {rifaData.titulo}
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.95, 
              maxWidth: '800px', 
              margin: '0 auto',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}>
              {rifaData.descripcion}
            </Typography>
          </CardContent>
        )}
      </Card>

      {/* Modal para visualizar imagen completa */}
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none'
        }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              },
              zIndex: 1
            }}
            onClick={() => setImageModalOpen(false)}
            size="large"
          >
            <Close />
          </IconButton>
          
          <CardMedia
            component="img"
            image={rifaData.imagen.url}
            alt={rifaData.titulo}
            sx={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          />
        </Box>
      </Modal>

      <Grid container spacing={3} justifyContent={{ xs: 'center', md: 'flex-start' }}>
        {/* Información de la Rifa */}
        <Grid item xs={12} md={8}>
          <ProgressBar progress={progress} />
          
          <Card sx={{ 
            mb: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2D3748', 
                fontWeight: 'bold',
                textAlign: { xs: 'center', md: 'left' }
              }}>
                Detalles de la Rifa
              </Typography>
              
              <Grid container spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}>
                    <LocalAtm sx={{ mr: 1, color: '#FF6B35', fontSize: 30 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#718096', fontWeight: 'medium' }}>
                        Precio por ticket
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {principal}
                      </Typography>
                      {equivalente && (
                        <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                          {equivalente}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}>
                    <Star sx={{ mr: 1, color: '#FF6B35', fontSize: 30 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#718096', fontWeight: 'medium' }}>
                        Mínimo de tickets
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        {rifaData.minTickets}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {rifaData.fechaSorteo && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Casino sx={{ mr: 1, color: '#FF6B35', fontSize: 30 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: '#718096', fontWeight: 'medium' }}>
                      Fecha del sorteo
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                      {new Date(rifaData.fechaSorteo).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Chip 
                  label={`${rifaData.ticketsVendidos}/${rifaData.ticketsTotales} tickets vendidos`}
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#FF6B35',
                    color: '#FF6B35',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)'
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Llamada a la Acción */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: 2,
            textAlign: 'center'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2D3748', 
                fontWeight: 'bold', 
                mb: 3,
                textAlign: 'center'
              }}>
                ¡Tu Momento de Ganar!
              </Typography>
              
              {/* Botón Super Llamativo */}
              <Button 
                variant="contained"
                fullWidth 
                size="large"
                startIcon={<Rocket />}
                endIcon={<Whatshot />}
                onClick={() => navigate('/comprar')}
                sx={{ 
                  mb: 2,
                  py: 2,
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FF6B35 0%, #FF8E53 50%, #FF6B35 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 3s ease-in-out infinite',
                  border: '2px solid #FFD700',
                  boxShadow: `
                    0 0 20px rgba(255, 107, 53, 0.5),
                    0 0 40px rgba(255, 107, 53, 0.3),
                    inset 0 0 20px rgba(255, 255, 255, 0.2)
                  `,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderRadius: '50px',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF8E53 0%, #FF6B35 50%, #FF8E53 100%)',
                    boxShadow: `
                      0 0 30px rgba(255, 107, 53, 0.7),
                      0 0 60px rgba(255, 107, 53, 0.5),
                      inset 0 0 30px rgba(255, 255, 255, 0.3)
                    `,
                    transform: 'translateY(-2px)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%'
                  }
                }}
              >
                Comprar Ticket Ahora
              </Button>
              
              <Typography variant="body2" sx={{ 
                color: '#718096', 
                mb: 2, 
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                ¡No esperes más para cambiar tu suerte!
              </Typography>
              
              <Button 
                variant="outlined" 
                fullWidth 
                size="medium"
                onClick={() => setVerificationModalOpen(true)}
                sx={{ 
                  borderColor: '#FF6B35',
                  color: '#FF6B35',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  '&:hover': {
                    borderColor: '#FF8E53',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Verificar Tickets
              </Button>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#2D3748', 
                fontWeight: 'bold',
                textAlign: { xs: 'center', md: 'left' }
              }}>
                ¿Por Qué Participar?
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Star sx={{ color: '#FF6B35', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Oportunidad única de ganar
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Star sx={{ color: '#FF6B35', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Premios garantizados
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Star sx={{ color: '#FF6B35', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Proceso 100% transparente
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Componentes Fijos */}
      <WhatsAppButton />
      <VerificationModal 
        open={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        rifaId={rifaData?._id}
      />
    </Container>
  );
};

export default Dashboard;