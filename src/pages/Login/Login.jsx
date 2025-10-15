// ACTUALIZA tu componente Login para usar el AuthContext
import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Casino
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Usa el login del contexto
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Login - Starting authentication...');
      const result = await login(formData); // Usa el login del contexto

      if (result.success) {
        console.log('✅ Login - Successful, redirecting to /admin');
        navigate('/admin');
      } else {
        setError(result.message || 'Error en el login');
      }
    } catch (error) {
      console.error('❌ Login - Error:', error);
      setError(error.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}
    >
      <Card 
        sx={{ 
          width: '100%',
          maxWidth: 450,
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid #FF6B35',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            background: 'linear-gradient(45deg, #FF6B35 0%, #FF8E53 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3
          }}
        >
          <Casino sx={{ fontSize: 50, mb: 1, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Gana Con Desi
          </Typography>
          <Typography variant="h6">
            Panel de Administración
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 3,
              color: '#2D3748',
              fontWeight: 'bold'
            }}
          >
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                border: '1px solid'
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#FF6B35' }} />
                  </InputAdornment>
                ),
              }}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#FF6B35' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#FF6B35',
                '&:hover': { 
                  backgroundColor: '#FF8E53',
                  transform: 'translateY(-2px)'
                },
                borderRadius: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#718096' }}>
              ⚠️ Esta área es solo para administradores autorizados
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;