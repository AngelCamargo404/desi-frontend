// src/components/auth/ProtectedRoute.jsx - MEJORADO
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../contexts/authContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Depuración detallada
  React.useEffect(() => {
    console.log('🛡️ ProtectedRoute - State Update:', {
      path: location.pathname,
      user: user ? { id: user._id, email: user.email, rol: user.rol } : null,
      loading,
      isAuthenticated,
      isAdmin,
      requireAdmin,
      localStorage: {
        adminToken: localStorage.getItem('adminToken') ? 'PRESENT' : 'MISSING',
        adminUser: localStorage.getItem('adminUser') ? 'PRESENT' : 'MISSING'
      }
    });
  }, [user, loading, isAuthenticated, isAdmin, location.pathname, requireAdmin]);

  if (loading) {
    console.log('🔄 ProtectedRoute - Showing loading spinner');
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress sx={{ color: '#FF6B35' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - NOT authenticated, redirecting to login');
    console.log('📍 Redirecting from:', location.pathname, 'to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('⛔ ProtectedRoute - NOT admin, redirecting to home');
    console.log('📍 User role:', user.rol, 'Required: admin/superadmin');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - Access GRANTED');
  return children;
};

export default ProtectedRoute;