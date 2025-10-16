import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Link, 
  IconButton,
  Container 
} from '@mui/material';
import { Instagram } from '@mui/icons-material';
import TermsModal from '../modals/TermsModal';

const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <>
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
                  order: 2
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
                  order: 1,
                  justifyContent: 'center'
                }
              }}
            >
              <IconButton 
                href="https://www.instagram.com/rifasdesi" 
                target="_blank"
                sx={{ color: 'white' }}
              >
                <Instagram />
              </IconButton>
              
              <Link 
                component="button"
                variant="body2"
                onClick={handleOpenModal}
                color="inherit" 
                underline="hover"
                sx={{ color: 'white', cursor: 'pointer' }}
              >
                Términos y Condiciones
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      <TermsModal open={modalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default Footer;