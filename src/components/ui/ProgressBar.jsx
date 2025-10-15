import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography,
  Paper 
} from '@mui/material';

const ProgressBar = ({ progress = 65 }) => {
  // Función para formatear números con máximo 2 decimales
  const formatPercentage = (value) => {
    return Number(value).toFixed(2);
  };

  const formattedProgress = formatPercentage(progress);
  const formattedRemaining = formatPercentage(100 - progress);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
        Progreso de la Rifa
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 20, 
              borderRadius: 10,
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FFD700',
                borderRadius: 10
              }
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: '#333', fontWeight: 'bold', minWidth: 40 }}>
          {formattedProgress}%
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#666' }}>
        {formattedRemaining}% de tickets disponibles
      </Typography>
    </Paper>
  );
};

export default ProgressBar;