import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Paper, Box, Typography, TextField, Button, Grid } from '@mui/material';
import logoMaroc from '../assets/royaume_du_maroc.png';
import API_BASE_URL from '../utils/apiConfig'
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';


const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); 
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );
  const [user, setUser] = useState(() => {
    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        const decodedToken = jwtDecode(tokens.accessToken);
        return {
          ...decodedToken,
          role: decodedToken.role,
          permissions: decodedToken.permissions || [], // Récupérer les permissions depuis le token
        };
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
        return null;
      }
    }
    return null;
  });

  const loginUser = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthTokens(data);
        const decodedToken = jwtDecode(data.accessToken);
        console.log('Decoded Token:', decodedToken);
        setUser({
          ...decodedToken,
          role: decodedToken.role,
          permissions: decodedToken.permissions || [], // Récupérer les permissions depuis le token
        });
        localStorage.setItem('authTokens', JSON.stringify(data));
        return data;
      } else {
        console.error('Login failed:', response.status);
        alert('Login échoué. Veuillez vérifier vos informations d\'identification.');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Erreur lors de la connexion. Veuillez réessayer.');
      return null;
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };


const updateToken = async () => {
  if (!authTokens || !authTokens.refreshToken) {
    logoutAndRedirect();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh?refreshToken=${authTokens.refreshToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      setAuthTokens(data);
      const decodedToken = jwtDecode(data.accessToken);
      setUser({
        ...decodedToken,
        role: decodedToken.role,
        permissions: decodedToken.permissions || [],
      });
      localStorage.setItem('authTokens', JSON.stringify(data));
      return data;
    } else {
      // refresh token invalide ou expiré
      logoutAndRedirect();
      return null;
    }
  } catch (error) {
    console.error('Erreur lors du refresh du token:', error);
    logoutAndRedirect();
    return null;
  }
};

// 🔹 fonction utilitaire pour déconnexion + redirection
const logoutAndRedirect = () => {
  logoutUser();
  navigate('/login', { replace: true });
};


  // const updateToken = async () => {
  //   if (!authTokens || !authTokens.refreshToken) {
  //     logoutUser();
  //     return null;
  //   }

  //   try {
  //     const response = await fetch(`${API_BASE_URL}/auth/refresh?refreshToken=${authTokens.refreshToken}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setAuthTokens(data);
  //       const decodedToken = jwtDecode(data.accessToken);
  //       setUser({
  //         ...decodedToken,
  //         role: decodedToken.role,
  //         permissions: decodedToken.permissions || [], // Récupérer les permissions depuis le token
  //       });
  //       localStorage.setItem('authTokens', JSON.stringify(data));
  //       return data;
  //     } else {
  //       console.error('Failed to refresh token:', response.status);
  //       logoutUser();
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error('Error refreshing token:', error);
  //     logoutUser();
  //     return null;
  //   }
  // };

  useEffect(() => {
    const interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authTokens]);

  const contextData = {
    authTokens,
    user,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

const Auth = () => {
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 const theme = useTheme();
 const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const data = await loginUser(form);
    if (data) {
      // navigate('/home');
      navigate('/home', { replace: true });
    } else {
      setError('Identifiants invalides');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7f7fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: '100%',
          p: 2,
          bgcolor: '#f7f7fa',
          textAlign: 'center',
          mb: 4,
        }}
      >
        {/* Logo et "Royaume du Maroc" */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <img
            src={logoMaroc}
            alt="Royaume du Maroc"
            style={{ width: 80, height: 80 }} // Augmentation de la taille du logo
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Royaume du Maroc
          </Typography>
        </Box>

        {/* Paragraphes gauche et droite */}
        <Grid
  container
  justifyContent={isMobile ? 'center' : 'space-between'}
  alignItems="flex-start"
  spacing={isMobile ? 2 : 0}
  sx={{ px: isMobile ? 2 : 18, mb: 2 }}
>
  <Grid item xs={12} sm={4} sx={{ textAlign: isMobile ? 'center' : 'left' }}>
    <Typography variant={isMobile ? 'body2' : 'body2'} sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
      Ministère de l’Intérieur<br />
      Wilaya de la Région de Marrakech-Safi
    </Typography>
  </Grid>

  <Grid item xs={12} sm={4} sx={{ textAlign: isMobile ? 'center' : 'right', mt: isMobile ? 1 : 0 }}>
    <Typography variant={isMobile ? 'body2' : 'body2'} sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
      Cercle Al Ouidane<br />
      Caidat Al Ouidane
    </Typography>
  </Grid>
</Grid>


        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mt: 2, color: '#1976d2', fontSize: '1.5rem' }}>
          Commune AL OUIDANE
        </Typography>
        {/* Paragraphe "Gestion de la Taxe sur les Terrains Urbains Non Bâtis (TTNB)" */}
        <Typography variant="subtitle1" align="center" sx={{ mt: 1, color: '#444' }}>
          Gestion de la Taxe sur les Terrains Urbains Non Bâtis (TTNB)
        </Typography>
      </Box>

      {/* Formulaire de connexion centré */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={8} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 4 }}>
          <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            Connexion
          </Typography>
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Mot de passe"
              name="motDePasse"
              type="password"
              value={form.motDePasse}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }}
            >
              Se connecter
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Auth;