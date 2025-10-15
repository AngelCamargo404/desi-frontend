// src/pages/admin/CreateUser.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { PersonAdd, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import userApi from '../../services/userApi';

const CreateUser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'admin'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Usar la API de usuarios para crear el usuario
      const result = await userApi.crearUsuario({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol
      });

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Usuario creado exitosamente' 
        });
        // Resetear el formulario
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'admin'
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al crear usuario' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/raffles')}
          sx={{ color: '#FF6B35' }}
        >
          Volver
        </Button>
        <PersonAdd sx={{ fontSize: 40, color: '#FF6B35' }} />
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'white',
            fontWeight: 'bold'
          }}>
            Crear Nuevo Usuario
          </Typography>
          <Typography variant="subtitle1" color="white">
            Complete el formulario para registrar un nuevo usuario administrador
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Formulario */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            {message.text && (
              <Alert severity={message.type} sx={{ mb: 3 }}>
                {message.text}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiInputLabel-root': { color: '#FFD700' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#FF6B35' },
                        '&:hover fieldset': { borderColor: '#FFD700' },
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                      },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiInputLabel-root': { color: '#FFD700' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#FF6B35' },
                        '&:hover fieldset': { borderColor: '#FFD700' },
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                      },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiInputLabel-root': { color: '#FFD700' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#FF6B35' },
                        '&:hover fieldset': { borderColor: '#FFD700' },
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                      },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiInputLabel-root': { color: '#FFD700' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#FF6B35' },
                        '&:hover fieldset': { borderColor: '#FFD700' },
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' }
                      },
                      '& .MuiInputBase-input': { color: 'white' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#FFD700' }}>Rol</InputLabel>
                    <Select
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      required
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FF6B35' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' }
                      }}
                    >
                      <MenuItem value="admin">Administrador</MenuItem>
                      {user?.rol === 'superadmin' && (
                        <MenuItem value="superadmin">Super Administrador</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<PersonAdd />}
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B35, #FFD700)',
                      color: 'white',
                      fontWeight: 'bold',
                      py: 1.5,
                      px: 4,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FFD700, #FF6B35)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
                      },
                      '&:disabled': {
                        background: 'gray'
                      }
                    }}
                  >
                    {loading ? 'Creando Usuario...' : 'Crear Usuario'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Información lateral */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid #FF6B35' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                Información Importante
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
                <strong>Permisos de Administrador:</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                • Crear y gestionar rifas
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                • Ver reportes y estadísticas
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
                • Gestionar tickets y participantes
              </Typography>

              {user?.rol === 'superadmin' && (
                <>
                  <Typography variant="body2" sx={{ color: '#FF6B35', mb: 2 }}>
                    <strong>Super Administrador adicionalmente puede:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    • Crear otros administradores
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreateUser;