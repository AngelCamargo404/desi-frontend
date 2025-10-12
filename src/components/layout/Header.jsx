import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box 
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import Logo from '../ui/Logo';

const Header = () => {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {/* Logo con borde circular */}
          <Logo size={50} borderWidth={3} borderColor="#FFD700" />
          
          <Box sx={{ ml: 2 }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                background: 'linear-gradient(45deg, #FFD700, #FF6B35)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                lineHeight: 1.1
              }}
            >
              Gana Con Desi
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#FFD700',
                fontSize: '0.8rem',
                opacity: 0.9
              }}
            >
              Gran Rifa
            </Typography>
          </Box>
        </Box>

        <EmojiEvents sx={{ 
          color: '#FF6B35',
          fontSize: 32
        }} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;