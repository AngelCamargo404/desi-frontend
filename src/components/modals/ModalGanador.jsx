// src/components/ModalGanador.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Celebration, EmojiEvents } from '@mui/icons-material';

const ModalGanador = ({ open, onClose, winner }) => {
  if (!winner) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ¡GANADOR SELECCIONADO!
            </Typography>
            <Typography variant="body1">
              Rifa: {winner.rifa?.titulo}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          {/* Número ganador destacado */}
          <Box sx={{ 
            backgroundColor: '#FFD700', 
            color: '#000',
            borderRadius: 2,
            py: 3,
            mb: 3,
            border: '3px solid #FF6B35'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              NÚMERO GANADOR
            </Typography>
            <Typography variant="h1" sx={{ 
              fontWeight: 'bold',
              fontSize: '4rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              #{winner.numeroTicket}
            </Typography>
          </Box>

          {/* Información del comprador */}
          <Card sx={{ mb: 3, border: '2px solid #4CAF50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#4CAF50', fontWeight: 'bold' }}>
                INFORMACIÓN DEL GANADOR
              </Typography>
              
              <Grid container spacing={2} sx={{ textAlign: 'left' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Nombre:</strong> {winner.comprador.nombre}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {winner.comprador.email}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Teléfono:</strong> {winner.comprador.telefono || 'No proporcionado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Estado/Ciudad:</strong> {winner.comprador.estadoCiudad}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Cédula:</strong> {winner.comprador.cedula || 'No proporcionada'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Premio:</strong> {winner.premio}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card sx={{ backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                <strong>Fecha del sorteo:</strong> {new Date(winner.fechaSorteo).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', mt: 1 }}>
                <strong>Ticket ID:</strong> {winner.ticket?._id || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{ 
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#45a049'
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalGanador;