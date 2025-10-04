import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Divider, TextField, Grid } from '@mui/material';
import { useAuth } from '../pages/Auth';
import fetchWithAuth from '../utils/api';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:8036/api/utilisateurs/profile`);
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

  if (loading) return <Typography>Chargement du profil...</Typography>;
  if (error) return <Typography color="error">Erreur: {error}</Typography>;
  if (!profileData) return <Typography>Aucune information de profil disponible.</Typography>;

  const attributes = [
    { label: 'Nom', value: profileData.nom },
    { label: 'Prénom', value: profileData.prenom },
    { label: 'Email', value: profileData.email },
    { label: 'Téléphone', value: profileData.telephone },
    { label: 'Rôle', value: profileData.role },
  ];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, width: '100%', borderRadius: 3 }}>
        {/* Haut : Avatar + Nom/Email */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 90, height: 90, bgcolor: 'primary.main', mr: 3 }}>
            <AccountCircleIcon sx={{ fontSize: 50, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {profileData.nom} {profileData.prenom}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {profileData.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Infos du profil organisées */}
        <Grid container spacing={2}>
          {attributes.map((attr, index) => {
            if (index % 2 === 0) {
              return (
                <React.Fragment key={index}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{attr.label}:</Typography>
                    <TextField
                      fullWidth
                      value={attr.value}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  {attributes[index + 1] && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{attributes[index + 1].label}:</Typography>
                      <TextField
                        fullWidth
                        value={attributes[index + 1].value}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;