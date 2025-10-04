import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People'; // Importez une icône pour les utilisateurs
import { useAuth } from '../pages/Auth'; // Importez le hook useAuth

const menuItems = [
  { label: 'Recensement', path: '/recensement', icon: <AssignmentIcon /> },
  { label: 'Créances', path: '/creances', icon: <AccountBalanceIcon /> },
  { label: 'Déclaration', path: '/declaration', icon: <DescriptionIcon /> },
  { label: 'Exonération', path: '/exoneration', icon: <GavelIcon /> },
  { label: 'Situation fiscale', path: '/recherche-creance', icon: <AccountBalanceIcon /> },
  { label: 'Situation map', path: '/situation-map', icon: <MapIcon /> },

  // { label: 'Rechercher une créance', path: '/recherche-creance', icon: <SearchIcon /> }, // Ajout du bouton "Rechercher une créance"
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth(); // Utilisez le hook useAuth pour accéder aux informations de l'utilisateur

  return (
    <Box
      sx={{
        width: 240,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: '#f7f7fa',
        boxShadow: 2,
        pt: 2,
        zIndex: 1200,
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: 22, letterSpacing: 1, color: '#444', mb: 1 }}>
          TTNB
        </Box>
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
                mx: 1,
                my: 0.5,
                borderRadius: 1,
                color: '#222',
                '&.Mui-selected': {
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
        {/* Afficher le lien "Gestion des utilisateurs" uniquement pour l'administrateur */}
        {user && user.role === 'ADMIN' && (
          <ListItem key="utilisateurs" disablePadding>
            <ListItemButton
              component={Link}
              to="/utilisateurs"
              selected={location.pathname === '/utilisateurs'}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 1,
                color: '#222',
                '&.Mui-selected': {
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <PeopleIcon /> {/* Utilisez une icône appropriée */}
              </ListItemIcon>
              <ListItemText primary="Utilisateurs" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );
}
