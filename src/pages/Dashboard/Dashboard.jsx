import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Casino, Star, LocalAtm, Rocket, Whatshot } from '@mui/icons-material';
import ProgressBar from '../../components/ui/ProgressBar';
import WhatsAppButton from '../../components/ui/WhatsappButton';
import VerificationModal from '../../components/ui/VerificationModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const rifaData = {
    titulo: "Gran Rifa",
    descripcion: "Participa por el premio mayor de $1,000,000. ¡No pierdas esta oportunidad única de cambiar tu vida!",
    precioTicket: 50,
    minTickets: 2,
    ticketsVendidos: 650,
    ticketsTotales: 1000
  };

  const progress = (rifaData.ticketsVendidos / rifaData.ticketsTotales) * 100;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Banner Principal */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(45deg, #FF6B35 0%, #FF8E53 50%, #FF6B35 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #FFD700',
        boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)'
      }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Casino sx={{ fontSize: 60, mb: 2, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            {rifaData.titulo}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: '800px', margin: '0 auto' }}>
            {rifaData.descripcion}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Información de la Rifa */}
        <Grid item xs={12} md={8}>
          <ProgressBar progress={progress} />
          
          <Card sx={{ 
            mb: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                Detalles de la Rifa
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalAtm sx={{ mr: 1, color: '#FF6B35', fontSize: 30 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#718096', fontWeight: 'medium' }}>
                        Precio por ticket
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                        ${rifaData.precioTicket}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

              <Box sx={{ mt: 2 }}>
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
            mb: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold', mb: 3 }}>
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
                  fontSize: '1.2rem',
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
              
              <Typography variant="body2" sx={{ color: '#718096', mb: 2, fontStyle: 'italic' }}>
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
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2D3748', fontWeight: 'bold' }}>
                ¿Por Qué Participar?
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ color: '#FF6B35', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Oportunidad única de ganar
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ color: '#FF6B35', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Premios garantizados
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
      />
    </Container>
  );
};

export default Dashboard;