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
          flexWrap: 'wrap'
        }}>
          <Typography variant="body2" color="white">
            © 2024 Lucky Raffle. Todos los derechos reservados.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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