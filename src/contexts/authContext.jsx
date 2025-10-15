// src/contexts/AuthContext.jsx - CORREGIDO
import React, { createContext, useState, useContext, useEffect } from 'react';
import loginApi from '../services/loginApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('adminUser');
      
      console.log('🔍 AuthContext - checkAuth:', { 
        token: !!token, 
        userData: !!userData 
      });
      
      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ AuthContext - User loaded from localStorage:', user);
        setUser(user);
      } else {
        console.log('❌ AuthContext - No auth data in localStorage');
      }
    } catch (error) {
      console.error('❌ AuthContext - Error in checkAuth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
      console.log('🏁 AuthContext - checkAuth completed, loading:', false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext - Starting login...');
      const response = await loginApi.login(credentials);
      console.log('📨 AuthContext - Login response:', response);
      
      if (response.success) {
        // IMPORTANTE: Usar la estructura exacta de tu API
        const { token, usuario } = response.data;
        
        console.log('💾 AuthContext - Saving to localStorage:', { 
          token: !!token, 
          usuario 
        });
        
        // Guardar exactamente como lo hace tu Login component
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(usuario));
        
        setUser(usuario);
        console.log('✅ AuthContext - Login successful, user set:', usuario);
        
        return { success: true };
      } else {
        console.log('❌ AuthContext - Login failed:', response.message);
        return { 
          success: false, 
          message: response.message || 'Error en el login' 
        };
      }
    } catch (error) {
      console.error('❌ AuthContext - Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Error en el login' 
      };
    }
  };

  const logout = async () => {
    try {
      await loginApi.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      clearAuthData();
      console.log('🚪 AuthContext - Logout completed');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user && (user.rol === 'admin' || user.rol === 'superadmin')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;