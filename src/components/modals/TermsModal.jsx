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
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

const TermsModal = ({ open, onClose }) => {
  const terms = [
    "Los números disponibles solo por la compra de la página.",
    "Los tickets se enviarán en un lapso de 6 horas hábiles.",
    "Solo podrán participar personas naturales mayores de 18 años.",
    "Los premios deberán retirarse en persona en la ubicación designada.",
    "La compra mínima es de dos tickets.",
    "Para reclamar tu premio dispones de 24 horas.",
    "En caso de que no quiera alguno de los premios, se le enviará el equivalente por transferencia.",
    "Si no se vende el 85 % de tickets para la fecha pautada, se reprogramará una fecha cercana."
  ];

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
      <DialogTitle 
        sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)'
        }}
      >
        Términos y Condiciones
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
            Por favor, lea atentamente los siguientes términos y condiciones antes de participar en nuestras rifas.
          </Typography>
        </Box>

        <List dense>
          {terms.map((term, index) => (
            <ListItem key={index} sx={{ py: 1, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <FiberManualRecord 
                  sx={{ 
                    fontSize: '12px', 
                    color: 'primary.main' 
                  }} 
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.6
                    }}
                  >
                    {term}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
            Al participar en nuestras rifas, usted acepta automáticamente estos términos y condiciones. 
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', py: 2, px: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            px: 4
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsModal;