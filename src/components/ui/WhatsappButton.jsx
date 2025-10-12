import React from 'react';
import { Fab } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = '1234567890'; // Reemplazar con número real
    const message = 'Hola, estoy interesado en la rifa';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Fab
      color="success"
      aria-label="whatsapp"
      onClick={handleWhatsAppClick}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        backgroundColor: '#25D366',
        '&:hover': {
          backgroundColor: '#128C7E'
        }
      }}
    >
      <WhatsApp />
    </Fab>
  );
};

export default WhatsAppButton;