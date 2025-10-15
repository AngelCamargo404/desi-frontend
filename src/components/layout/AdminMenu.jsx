// src/components/layout/AdminMenu.jsx
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography
} from '@mui/material';
import {
  Dashboard,
  Casino,
  List as ListIcon,
  ExpandLess,
  ExpandMore,
  Create
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(true);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin',
      exact: true
    },
    {
      text: 'Rifas',
      icon: <Casino />,
      children: [
        {
          text: 'Crear Rifa',
          icon: <Create />,
          path: '/admin/create-raffle'
        },
        {
          text: 'Gestionar Rifas',
          icon: <ListIcon />,
          path: '/admin/raffles'
        }
      ]
    }
  ];

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleAdminToggle = () => {
    setAdminOpen(!adminOpen);
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderMenuItems = (items, level = 0) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <Box key={index}>
            <ListItemButton 
              onClick={handleAdminToggle}
              sx={{ 
                pl: 2 + level * 2,
                backgroundColor: adminOpen ? 'rgba(255, 107, 53, 0.1)' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ color: '#FF6B35', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2D3748' }}>
                    {item.text}
                  </Typography>
                } 
              />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(item.children, level + 1)}
              </List>
            </Collapse>
          </Box>
        );
      }

      return (
        <ListItem 
          key={index} 
          disablePadding
          sx={{ 
            backgroundColor: isActive(item.path, item.exact) ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
            borderRight: isActive(item.path, item.exact) ? '3px solid #FF6B35' : 'none'
          }}
        >
          <ListItemButton 
            onClick={() => handleMenuClick(item)}
            sx={{ pl: 2 + level * 2 }}
          >
            <ListItemIcon sx={{ color: isActive(item.path, item.exact) ? '#FF6B35' : '#718096', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isActive(item.path, item.exact) ? 'bold' : 'medium',
                    color: isActive(item.path, item.exact) ? '#FF6B35' : '#2D3748'
                  }}
                >
                  {item.text}
                </Typography>
              } 
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="caption" 
        sx={{ 
          px: 2, 
          py: 1, 
          color: '#718096', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.7rem'
        }}
      >
        Administración
      </Typography>
      <List sx={{ py: 0 }}>
        {renderMenuItems(menuItems)}
      </List>
    </Box>
  );
};

export default AdminMenu;