// src/components/ConfirmationModal.jsx - ACTUALIZADO
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Warning, CheckCircle, Error } from '@mui/icons-material';

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  severity = "warning"
}) => {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'error':
        return {
          color: '#f44336',
          icon: <Error sx={{ color: '#f44336', fontSize: 32 }} />,
          buttonColor: '#f44336'
        };
      case 'success':
        return {
          color: '#4CAF50',
          icon: <CheckCircle sx={{ color: '#4CAF50', fontSize: 32 }} />,
          buttonColor: '#4CAF50'
        };
      case 'warning':
      default:
        return {
          color: '#FF9800',
          icon: <Warning sx={{ color: '#FF9800', fontSize: 32 }} />,
          buttonColor: '#FF6B35'
        };
    }
  };

  const severityConfig = getSeverityConfig();

  // Función para renderizar el mensaje (puede ser string o React element)
  const renderMessage = () => {
    if (typeof message === 'string') {
      return <Typography variant="body1">{message}</Typography>;
    }
    return message;
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {severityConfig.icon}
          <Typography variant="h6" sx={{ ml: 1, color: severityConfig.color }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {renderMessage()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            borderColor: '#9E9E9E',
            color: '#9E9E9E',
            '&:hover': {
              borderColor: '#757575',
              backgroundColor: 'rgba(117, 117, 117, 0.04)'
            }
          }}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
          sx={{
            backgroundColor: severityConfig.buttonColor,
            '&:hover': {
              backgroundColor: severityConfig.buttonColor,
              opacity: 0.9
            },
            '&:disabled': {
              backgroundColor: '#BDBDBD'
            }
          }}
        >
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;