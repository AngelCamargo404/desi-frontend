// src/components/modals/ModalMultiplesGanadores.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  EmojiEvents,
  Person,
  ConfirmationNumber,
  Email,
  Phone,
  LocationOn,
  AttachMoney,
  Celebration
} from '@mui/icons-material';

const ModalMultiplesGanadores = ({ open, onClose, winners }) => {
  if (!winners || winners.length === 0) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Celebration sx={{ mr: 1, color: '#FFD700' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
            ¡Ganadores de la Rifa!
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
          Se han seleccionado {winners.length} ganadores para los premios
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <List>
          {winners.map((winner, index) => (
            <Box key={winner._id || index}>
              <Card 
                sx={{ 
                  mb: 2, 
                  border: winner.esGanadorPrincipal ? '2px solid #FFD700' : '1px solid #FF6B35',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{ 
                        bgcolor: winner.esGanadorPrincipal ? '#FFD700' : '#FF6B35',
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      <EmojiEvents sx={{ color: 'black' }} />
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Premio ${winner.posicionPremio}`}
                          color={winner.esGanadorPrincipal ? "warning" : "primary"}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                        {winner.esGanadorPrincipal && (
                          <Chip 
                            label="Ganador Principal"
                            color="warning"
                            variant="outlined"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {winner.premio}
                      </Typography>
                      {winner.descripcionPremio && (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {winner.descripcionPremio}
                        </Typography>
                      )}
                      {winner.valorPremio && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <AttachMoney sx={{ fontSize: 16, color: '#4CAF50', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                            Valor: ${winner.valorPremio.toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#FF6B35', mb: 1, fontWeight: 'bold' }}>
                      Información del Ganador:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ fontSize: 16, mr: 1, color: '#FF6B35' }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {winner.comprador.nombre}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email sx={{ fontSize: 16, mr: 1, color: '#FF6B35' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {winner.comprador.email}
                      </Typography>
                    </Box>
                    
                    {winner.comprador.telefono && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone sx={{ fontSize: 16, mr: 1, color: '#FF6B35' }} />
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {winner.comprador.telefono}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: '#FF6B35' }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {winner.comprador.estadoCiudad}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ConfirmationNumber sx={{ fontSize: 16, mr: 1, color: '#FF6B35' }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Ticket Ganador: #{winner.numeroTicket}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    p: 1, 
                    backgroundColor: 'rgba(255, 107, 53, 0.1)', 
                    borderRadius: 1,
                    border: '1px solid rgba(255, 107, 53, 0.3)'
                  }}>
                    <Typography variant="caption" sx={{ color: '#FF6B35', fontStyle: 'italic' }}>
                      Fecha del sorteo: {new Date(winner.fechaSorteo).toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              {index < winners.length - 1 && (
                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              )}
            </Box>
          ))}
        </List>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', py: 2, px: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#FF6B35',
            color: 'white',
            '&:hover': {
              backgroundColor: '#FF8E53',
            },
            px: 4
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalMultiplesGanadores;