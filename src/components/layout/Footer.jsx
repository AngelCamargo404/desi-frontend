import React from 'react';
import { 
  Box, 
  Typography, 
  Link, 
  IconButton,
  Container 
} from '@mui/material';
import { Instagram } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          // Centrado para dispositivos móviles
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            textAlign: 'center'
          }
        }}>
          <Typography 
            variant="body2" 
            color="white"
            sx={{
              '@media (max-width: 768px)': {
                order: 2 // Cambia el orden para móviles
              }
            }}
          >
            © 2025 Gana con Desi. Todos los derechos reservados.
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              '@media (max-width: 768px)': {
                order: 1, // Cambia el orden para móviles
                justifyContent: 'center'
              }
            }}
          >
            <IconButton 
              href="https://instagram.com" 
              target="_blank"
              sx={{ color: 'white' }}
            >
              <Instagram />
            </IconButton>
            
            <Link 
              href="/terminos" 
              color="inherit" 
              underline="hover"
              sx={{ color: 'white' }}
            >
              Términos y Condiciones
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;