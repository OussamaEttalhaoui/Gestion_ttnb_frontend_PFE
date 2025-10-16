import React from 'react';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from './Auth'; 
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100%',
          width: '100%',
          backgroundColor: '#f7f7fa', // Gris ciel
        },
        html: {
          height: '100%',
          width: '100%',
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
      },
    },
  },
});

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (route) => {
    navigate(route);
  };

  const menuItems = [
    { icon: AssignmentIcon, label: 'Recensement', route: '/recensement' },
    { icon: AssessmentIcon, label: 'Créances', route: '/creances' },
    { icon: DescriptionIcon, label: 'Déclaration', route: '/declaration' },
    { icon: GavelIcon, label: 'Exonération', route: '/exoneration' },
    { icon: AccountBalanceIcon, label: 'Situation Fiscale', route: '/recherche-creance' },
    { icon: MapIcon, label: 'Situation Map', route: '/situation-map' },
  ];

  // Ajouter l'item "Gestion des utilisateurs" seulement si l'utilisateur est un admin
  if (user && user.role === 'ADMIN') {
    menuItems.push({ icon: PeopleIcon, label: 'Utilisateurs', route: '/utilisateurs' });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100vh',
          width: '100vw',
          bgcolor: '#f7f7fa', // Gris ciel
          textAlign: 'center',
          padding: 4,
          pt: 8, // Ajoute du padding en haut pour l'espace
          margin: 0,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
          Gestion de la Taxe sur les Terrains Urbains
          <br />
          Non Bâtis (TTNB)
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, maxWidth: 600 }}>
          Conformément aux dispositions de la loi n°07.20 en date du 31 décembre 2020 modifiant et complétant la loi n° 47.06 relative à la fiscalité des collectivités locales, notamment les articles 39-49.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Cartes */}
          {menuItems.map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                <IconButton onClick={() => handleNavigation(item.route)}>
                  <item.icon color="primary" sx={{ fontSize: 40 }} />
                </IconButton>
                <Typography variant="subtitle1">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;