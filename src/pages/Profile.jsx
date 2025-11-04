import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Avatar, Divider, TextField, Grid, 
  CircularProgress, Alert, Chip, alpha, useTheme 
} from '@mui/material';
import { useAuth } from '../pages/Auth';
import fetchWithAuth from '../utils/api';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import API_BASE_URL from '../utils/apiConfig'



const Profile = () => {
  const { user } = useAuth();
  const theme = useTheme(); 
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/utilisateurs/profile`);
        if (!response.ok) throw new Error(`Erreur lors de la récupération du profil: ${response.status}`);
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Chargement du profil...</Typography>
      </Box>
    );
  }

  if (error || !profileData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {error || "Aucune information de profil disponible."}
        </Alert>
      </Box>
    );
  }

  const infoFields = [
    { id: 'nom', label: 'Nom ', value: profileData.nom, icon: <PersonIcon /> },
    { id: 'prenom', label: 'Prénom', value: profileData.prenom, icon: <PersonIcon /> },
    { id: 'email', label: 'Email', value: profileData.email, icon: <EmailIcon /> },
    { id: 'telephone', label: 'Téléphone', value: profileData.telephone, icon: <PhoneIcon /> },
  ];

  const roleColor = profileData.role === 'ADMIN' ? 'error' : 'primary';


  return (
    <Box 
        sx={{ 
            height: '100vh', 
            p: 4, 
            bgcolor: '#f8fafc', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            pt: 4, 
            overflow: 'hidden' 
        }}
    >
      <Paper 
        elevation={4} 
        sx={{ 
          p: 5, 
          maxWidth: 800, 
          width: '100%', 
          borderRadius: 3,
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          maxHeight: 'calc(100vh - 100px)', 
          overflowY: 'auto' 
        }}
      >
        
        {/* En-tête de Profil */}
        <Box
           sx={{
             display: 'flex',
             alignItems: 'center',
             pb: 3,
             borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
             flexDirection: { xs: 'column', sm: 'row' }, // ← responsive
             textAlign: { xs: 'center', sm: 'left' } // centrer sur mobile
           }}
         >
           <Avatar
             sx={{
               width: 70,
               height: 70,
               bgcolor: theme.palette.primary.main,
               mr: { xs: 0, sm: 3 },
               mb: { xs: 1, sm: 0 }, // espace en bas sur mobile
               boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
             }}
           >
             <AccountCircleIcon sx={{ fontSize: 50, color: 'white' }} /> 
           </Avatar>
           
           <Box>
             <Typography
               variant="h5"
               sx={{
                 fontWeight: 800,
                 color: theme.palette.primary.dark,
                 lineHeight: 1.2,
                 wordBreak: 'break-word' // ← permet le retour à la ligne si le nom est long
               }}
             >
               {profileData.prenom} {profileData.nom}
             </Typography>
             <Chip
               icon={<WorkIcon />}
               label={profileData.role}
               color={roleColor}
               variant="filled"
               size="small"
               sx={{
                 mt: 1,
                 fontWeight: 700,
                 bgcolor: roleColor === 'error' ? theme.palette.error.main : theme.palette.primary.main,
                 color: 'white',
                 width: { xs: '100%', sm: 'auto' } // ← chip prend toute la largeur sur mobile
               }}
             />
           </Box>
         </Box>


        <Typography 
          variant="h6" 
          sx={{ fontWeight: 600, mt: 4, mb: 3, color: theme.palette.text.primary }}
        >
          Informations du Compte
        </Typography>

        <Grid container spacing={4}>
          {infoFields.map((field) => (
            <Grid item xs={12} md={6} key={field.id}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 0.5, 
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {field.icon} {field.label}
              </Typography>
              <TextField
                fullWidth
                value={field.value || 'N/A'}
                InputProps={{ 
                    readOnly: true,
                    style: { fontWeight: 500, color: theme.palette.text.primary }
                }}
                variant="outlined"
                size="medium"
                sx={{ 
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                    }
                }}
              />
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ mt: 5, mb: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                Ces informations ne peuvent être modifiées que par un administrateur.
            </Typography>
        </Box>

      </Paper>
    </Box>
  );
};

export default Profile;
