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

const API_BASE_URL = 'http://localhost:8036';


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
        <Box sx={{ display: 'flex', alignItems: 'center', pb: 3, borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <Avatar sx={{ 
            width: 70, 
            height: 70, 
            bgcolor: theme.palette.primary.main, 
            mr: 3,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
          }}>
            <AccountCircleIcon sx={{ fontSize: 50, color: 'white' }} /> 
          </Avatar>
          
          <Box>
            <Typography 
              variant="h5" 
              sx={{ fontWeight: 800, color: theme.palette.primary.dark, lineHeight: 1.2 }}
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
                color: 'white'
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

// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Paper, Avatar, Divider, TextField, Grid } from '@mui/material';
// import { useAuth } from '../pages/Auth';
// import fetchWithAuth from '../utils/api';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// const Profile = () => {
//   const { user } = useAuth();
//   const [profileData, setProfileData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetchWithAuth(`http://localhost:8036/api/utilisateurs/profile`);
//         if (!response.ok) throw new Error(`Erreur lors de la récupération du profil: ${response.status}`);
//         const data = await response.json();
//         setProfileData(data);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, []);

//   if (loading) return <Typography>Chargement du profil...</Typography>;
//   if (error) return <Typography color="error">Erreur: {error}</Typography>;
//   if (!profileData) return <Typography>Aucune information de profil disponible.</Typography>;

//   const attributes = [
//     { label: 'Nom', value: profileData.nom },
//     { label: 'Prénom', value: profileData.prenom },
//     { label: 'Email', value: profileData.email },
//     { label: 'Téléphone', value: profileData.telephone },
//     { label: 'Rôle', value: profileData.role },
//   ];

//   return (
//     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 4 }}>
//       <Paper elevation={3} sx={{ p: 4, maxWidth: 700, width: '100%', borderRadius: 3 }}>
//         {/* Haut : Avatar + Nom/Email */}
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <Avatar sx={{ width: 90, height: 90, bgcolor: 'primary.main', mr: 3 }}>
//             <AccountCircleIcon sx={{ fontSize: 50, color: 'white' }} />
//           </Avatar>
//           <Box>
//             <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
//               {profileData.nom} {profileData.prenom}
//             </Typography>
//             <Typography variant="body1" color="textSecondary">
//               {profileData.email}
//             </Typography>
//           </Box>
//         </Box>

//         <Divider sx={{ mb: 3 }} />

//         {/* Infos du profil organisées */}
//         <Grid container spacing={2}>
//           {attributes.map((attr, index) => {
//             if (index % 2 === 0) {
//               return (
//                 <React.Fragment key={index}>
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{attr.label}:</Typography>
//                     <TextField
//                       fullWidth
//                       value={attr.value}
//                       InputProps={{ readOnly: true }}
//                       variant="outlined"
//                       size="small"
//                     />
//                   </Grid>
//                   {attributes[index + 1] && (
//                     <Grid item xs={12} sm={6}>
//                       <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{attributes[index + 1].label}:</Typography>
//                       <TextField
//                         fullWidth
//                         value={attributes[index + 1].value}
//                         InputProps={{ readOnly: true }}
//                         variant="outlined"
//                         size="small"
//                       />
//                     </Grid>
//                   )}
//                 </React.Fragment>
//               );
//             }
//             return null;
//           })}
//         </Grid>
//       </Paper>
//     </Box>
//   );
// };

// export default Profile;