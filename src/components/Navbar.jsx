import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Badge, Box, 
  List, ListItem, ListItemText, Divider, // Ajout de Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../pages/Auth';
import { useNavigate } from 'react-router-dom';
import fetchWithAuth from '../utils/api';
import API_BASE_URL from '../utils/apiConfig';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null); 
  const stompClientRef = useRef(null);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  // 🔔 STOMP notifications (LOGIQUE DE PARSING CORRIGÉE)
  useEffect(() => {
    if (stompClientRef.current) return;
    // const socket = new SockJS(`${API_BASE_URL}/ws`);
    const socket = new SockJS(`${API_BASE_URL.replace(/^http/, 'https')}/ws`);
    const client = over(socket);
    stompClientRef.current = client;

    client.connect(
      {},
      () => client.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          let messageText = "Contenu de la notification introuvable"; // Message par défaut en cas d'échec d'extraction
          
          try {
            const notificationContent = JSON.parse(message.body);
            
            // Tenter d'extraire le message avec les clés les plus communes dans l'objet JSON
            if (typeof notificationContent === 'string') {
                 // Si c'était une chaîne (vieux format ou JSON simple), on l'utilise
                 messageText = notificationContent;
            } else if (notificationContent.content) {
                 messageText = notificationContent.content;
            } else if (notificationContent.message) {
                 messageText = notificationContent.message;
            } else if (notificationContent.text) { 
                 messageText = notificationContent.text;
            } else if (notificationContent.data) { 
                 messageText = notificationContent.data;
            } else {
                 console.warn("Format JSON inattendu sans clé de contenu standard:", notificationContent);
            }

          } catch (e) {
            // Si le parsing JSON a échoué (car c'était une simple chaîne non-JSON), 
            // on utilise le corps brut du message.
            messageText = message.body;
          }

          // Création de l'objet notification standardisé
          const newNotif = {
              id: Date.now(),
              message: messageText, // Utilise le texte extrait
              timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          setNotifications((prev) => [newNotif, ...prev]); // Afficher les nouvelles en premier
        }
      }),
      (error) => console.error('STOMP connection error:', error)
    );

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() => console.log('STOMP disconnected'));
      }
    };
  }, []);

  // 🔹 Récupérer le profil complet (Logique inchangée)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/utilisateurs/profile`);
        if (!response.ok) throw new Error('Impossible de récupérer le profil');
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleNotifClick = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { handleClose(); logoutUser(); };
  const handleProfileClick = () => { handleClose(); navigate('/profile'); };
  
  // Fonction pour marquer toutes les notifications comme lues
  const handleMarkAllRead = () => {
      setNotifications([]);
      handleNotifClose();
  };


  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
          Gestion TTNB
        </Typography>

        {/* 🔔 Notifications */}
        <IconButton color="inherit" onClick={handleNotifClick} sx={{ mr: 2 }}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        {/* --- MENU DE NOTIFICATIONS AMÉLIORÉ --- */}
        <Menu 
          anchorEl={notifAnchor} 
          open={Boolean(notifAnchor)} 
          onClose={handleNotifClose}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 350, // Largeur plus agréable
              maxWidth: 400,
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            {/* Titre du Popup */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Notifications ({notifications.length})
                </Typography>
                <Typography 
                    variant="caption" 
                    color="primary" 
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={handleMarkAllRead}
                >
                    Tout marquer comme lu
                </Typography>
            </Box>
            <Divider />

            <List sx={{ maxHeight: 350, overflowY: 'auto', p: 0 }}>
              {notifications.length === 0 ? (
                <ListItem sx={{ py: 2 }}>
                    <ListItemText primary="Aucune nouvelle notification." secondary="Vos mises à jour s'afficheront ici." />
                </ListItem>
              ) : (
                notifications.slice(0, 5).map((notif) => ( // Limite à 5 pour l'esthétique
                  <ListItem 
                    key={notif.id}
                    // Style pour différencier les notifications non lues (toutes ici)
                    sx={{ 
                        bgcolor: 'rgba(25, 118, 210, 0.05)', 
                        borderBottom: '1px solid #eee',
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                        cursor: 'pointer',
                        px: 2,
                        py: 1.5,
                    }}
                    onClick={handleNotifClose} // Ferme la popup après le clic
                  >
                    <ListItemText 
                      primary={
                          <Typography variant="body2" fontWeight="medium">
                              {notif.message}
                          </Typography>
                      } 
                      secondary={notif.timestamp}
                    />
                  </ListItem>
                ))
              )}
            </List>
            
            {/* Pied de page du Popup (pour l'effet) */}
            {notifications.length > 0 && (
                <Box sx={{ p: 1, borderTop: '1px solid #eee', textAlign: 'center' }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                        Voir toutes les notifications
                    </Typography>
                </Box>
            )}

        </Menu>
        {/* --- FIN MENU DE NOTIFICATIONS AMÉLIORÉ --- */}


        {/* 👤 Profil avec nom complet et rôle (Logique inchangée) */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenu}>
          <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36, mr: 1 }}>
            <AccountCircleIcon sx={{ fontSize: 28, color: 'white' }} />
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white', lineHeight: 1.2 }}>
              {profileData ? `${profileData.prenom} ${profileData.nom}` : 'Utilisateur'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#e0e0e0', textTransform: 'capitalize' }}>
              {profileData?.role || 'role'}
            </Typography>
          </Box>
        </Box>

        {/* Menu (Logique inchangée) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 180,
              bgcolor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '& .MuiMenuItem-root': {
                px: 2.5,
                py: 1.2,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileClick}>
            <AccountCircleIcon sx={{ fontSize: 22, mr: 1, color: '#1976d2' }} />
            Profil
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <i className="fas fa-cog" style={{ marginRight: 10, color: '#42a5f5' }}></i>
            Paramètres
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" style={{ marginRight: 10, color: '#ef5350' }}></i>
            Déconnexion
          </MenuItem>
        </Menu>
        
      </Toolbar>
    </AppBar>
  );
}