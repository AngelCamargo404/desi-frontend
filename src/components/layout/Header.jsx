// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  EmojiEvents,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  AdminPanelSettings,
  List as ListIcon,
  Create,
  Dashboard,
  LocalMall,
  PersonAdd
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../contexts/authContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleAdminMenu = (path) => {
    navigate(path);
    handleClose();
    setMobileMenuOpen(false);
  };

  const adminMenuItems = [
    { text: 'Crear Rifa', icon: <Create />, path: '/admin/create-raffle' },
    { text: 'Gestionar Rifas', icon: <ListIcon />, path: '/admin/raffles' },
    { text: 'Ver Ganadores', icon: <EmojiEvents />, path: '/admin/winners' }, // NUEVA LÍNEA
    ...(user?.rol === 'superadmin' 
      ? [{ text: 'Crear Usuario', icon: <PersonAdd />, path: '/admin/create-user' }]
      : []
    )
  ];

   const mobileMenu = (
    <Box sx={{ 
      width: 280, 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Logo y título en el menú móvil */}
        <ListItem sx={{ py: 3, borderBottom: '1px solid rgba(255, 107, 53, 0.3)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo size={40} borderWidth={2} borderColor="#FFD700" />
            <Box sx={{ ml: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  background: 'linear-gradient(45deg, #FFD700, #FF6B35)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                Gana Con Desi
              </Typography>
            </Box>
          </Box>
        </ListItem>

        {/* Navegación principal */}
        <ListItem button onClick={() => {navigate('/'); setMobileMenuOpen(false);}} sx={{ py: 2 }}>
          <Dashboard sx={{ mr: 2, color: '#FF6B35' }} />
          <ListItemText 
            primary="Dashboard" 
            primaryTypographyProps={{ color: 'white', fontWeight: 'medium' }}
          />
        </ListItem>
        
        <ListItem button onClick={() => {navigate('/comprar'); setMobileMenuOpen(false);}} sx={{ py: 2 }}>
          <LocalMall sx={{ mr: 2, color: '#FF6B35' }} />
          <ListItemText 
            primary="Comprar Tickets" 
            primaryTypographyProps={{ color: 'white', fontWeight: 'medium' }}
          />
        </ListItem>
        
        {/* Menú de administración - CORREGIDO */}
        {isAdmin && (
          <>
            <ListItem sx={{ 
              backgroundColor: 'rgba(255, 107, 53, 0.2)', 
              py: 2,
              borderLeft: '4px solid #FF6B35'
            }}>
              <AdminPanelSettings sx={{ mr: 2, color: '#FFD700' }} />
              <ListItemText 
                primary="Administración" 
                primaryTypographyProps={{ 
                  fontWeight: 'bold',
                  color: '#FFD700'
                }}
              />
            </ListItem>
            
            {/* Renderizar todos los items del menú admin */}
            {adminMenuItems.map((item) => (
              <ListItem 
                key={item.path}
                button 
                onClick={() => handleAdminMenu(item.path)}
                sx={{ py: 1.5, pl: 4 }}
              >
                <Box sx={{ mr: 2, color: '#FF6B35' }}>{item.icon}</Box>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ color: 'white' }}
                />
              </ListItem>
            ))}
          </>
        )}
      </List>

      {/* Menú de usuario - SOLO para usuarios autenticados */}
      {user && (
        <Box sx={{ 
          borderTop: '1px solid rgba(255, 107, 53, 0.3)',
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          mt: 'auto'
        }}>
          <ListItem sx={{ py: 1 }}>
            <AccountCircle sx={{ mr: 2, color: '#FF6B35' }} />
            <ListItemText 
              primary={user.nombre || user.email} 
              secondary={`Rol: ${user.rol}`}
              primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
              secondaryTypographyProps={{ color: '#FF6B35', fontSize: '0.7rem' }}
            />
          </ListItem>
          <ListItem button onClick={handleLogout} sx={{ py: 1.5 }}>
            <ExitToApp sx={{ mr: 2, color: '#FF6B35' }} />
            <ListItemText 
              primary="Cerrar Sesión" 
              primaryTypographyProps={{ color: 'white' }}
            />
          </ListItem>
        </Box>
      )}
    </Box>
  );

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
        {/* Logo y título */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
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

        {/* Navegación Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 3 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ 
                color: 'white',
                fontWeight: 'medium',
                '&:hover': {
                  color: '#FF6B35'
                }
              }}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/comprar')}
              sx={{ 
                color: 'white',
                fontWeight: 'medium',
                '&:hover': {
                  color: '#FF6B35'
                }
              }}
            >
              Comprar Tickets
            </Button>

            {/* Menú de Administración Desktop - CORREGIDO */}
            {isAdmin && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                <AdminPanelSettings sx={{ color: '#FFD700' }} />
                {adminMenuItems.map((item) => (
                  <Button 
                    key={item.path}
                    color="inherit" 
                    onClick={() => navigate(item.path)}
                    sx={{ 
                      color: '#FFD700',
                      fontWeight: 'bold',
                      '&:hover': {
                        color: '#FF6B35'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Icono de usuario y menú Desktop - SOLO para usuarios autenticados */}
        {!isMobile && user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ color: 'white' }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: 'rgba(26, 26, 46, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  mt: 1.5
                }
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ color: '#FFD700' }}>
                  {user.nombre || user.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" sx={{ color: '#FF6B35', fontSize: '0.75rem' }}>
                  Rol: {user.rol}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1, color: '#FF6B35' }} />
                <Typography sx={{ color: 'white' }}>Cerrar Sesión</Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Menú Mobile */}
        {isMobile && (
          <>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              PaperProps={{
                sx: {
                  backgroundColor: 'transparent',
                  backdropFilter: 'blur(5px)'
                }
              }}
            >
              {mobileMenu}
            </Drawer>
          </>
        )}

        <EmojiEvents sx={{ 
          color: '#FF6B35',
          fontSize: 32
        }} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;