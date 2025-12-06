import React, { useState } from 'react';
import {
  Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, ListItemIcon,
  Divider, Box, Typography, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../pages/Auth';
import { useTheme } from '@mui/material/styles';

const menuItems = [
  { label: 'Recensement', path: '/recensement', icon: <AssignmentIcon /> },
  { label: 'Créances', path: '/creances', icon: <AccountBalanceIcon /> },
  { label: 'Déclaration', path: '/declaration', icon: <DescriptionIcon /> },
  { label: 'Exonération', path: '/exoneration', icon: <GavelIcon /> },
  { label: 'Situation fiscale', path: '/recherche-creance', icon: <AccountBalanceIcon /> },
  { label: 'Situation map', path: '/situation-map', icon: <MapIcon /> },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const drawerContent = (
    <Box sx={{ width: 240, bgcolor: '#f7f7fa', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>TTNB</Typography>
        <Divider />
      </Box>
      <List>
        {menuItems.map(({ label, path, icon }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton
              component={Link}
              to={path}
              selected={location.pathname === path}
              sx={{
                mx: 1, my: 0.5, borderRadius: 1,
                '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1976d2' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
        {user?.role === 'ADMIN' && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/utilisateurs"
              selected={location.pathname === '/utilisateurs'}
              sx={{
                mx: 1, my: 0.5, borderRadius: 1,
                '&.Mui-selected': { bgcolor: '#e3f2fd', color: '#1976d2' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Utilisateurs" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: 240 } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 240,
            position: 'fixed',
            height: '100vh',
            borderRight: '1px solid #ddd',
            bgcolor: '#f7f7fa',
            p: 1
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
}

