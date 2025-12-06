import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Badge, Box, 
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../pages/Auth';
import { useNavigate } from 'react-router-dom';
import fetchWithAuth from '../utils/api';
import API_BASE_URL from '../utils/apiConfig';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function Navbar({ handleDrawerToggle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null); 
  const stompClientRef = useRef(null);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  // 🔔 STOMP notifications
  useEffect(() => {
    if (stompClientRef.current) return;
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const client = over(socket);
    stompClientRef.current = client;

    client.connect(
      {},
      () => client.subscribe('/topic/notifications', (message) => {
        if (message.body) {
          let messageText = "Contenu de la notification introuvable";
          try {
            const notificationContent = JSON.parse(message.body);
            if (typeof notificationContent === 'string') messageText = notificationContent;
            else if (notificationContent.content) messageText = notificationContent.content;
            else if (notificationContent.message) messageText = notificationContent.message;
            else if (notificationContent.text) messageText = notificationContent.text;
            else if (notificationContent.data) messageText = notificationContent.data;
          } catch (e) {
            messageText = message.body;
          }
          const newNotif = {
              id: Date.now(),
              message: messageText,
              timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          setNotifications((prev) => [newNotif, ...prev]);
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

  // 🔹 Récupérer le profil complet
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
  const handleMarkAllRead = () => { setNotifications([]); handleNotifClose(); };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)' }}>
      <Toolbar sx={{ px: isMobile ? 1 : 2 }}>
        
        {isMobile && (
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography 
          variant="h6" 
          noWrap
          sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}
        >
          Gestion TTNB
        </Typography>

        {/* 🔔 Notifications */}
        <IconButton color="inherit" onClick={handleNotifClick} sx={{ mr: isMobile ? 1 : 2 }}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon fontSize={isMobile ? 'small' : 'medium'} />
          </Badge>
        </IconButton>

        <Menu 
          anchorEl={notifAnchor} 
          open={Boolean(notifAnchor)} 
          onClose={handleNotifClose}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: isMobile ? 250 : 350,
              maxWidth: isMobile ? 300 : 400,
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight="bold">
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
                <ListItem sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Aucune nouvelle notification." 
                      secondary="Vos mises à jour s'afficheront ici." 
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                    />
                </ListItem>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <ListItem 
                    key={notif.id}
                    sx={{ 
                        bgcolor: 'rgba(25, 118, 210, 0.05)', 
                        borderBottom: '1px solid #eee',
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                        cursor: 'pointer',
                        px: 2,
                        py: 1,
                    }}
                    onClick={handleNotifClose}
                  >
                    <ListItemText 
                      primary={
                          <Typography variant="body2" fontWeight="medium" noWrap>
                              {notif.message}
                          </Typography>
                      } 
                      secondary={
                        <Typography variant="caption" noWrap>
                          {notif.timestamp}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
        </Menu>

        {/* 👤 Profil */}
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: 1 }} 
          onClick={handleMenu}
        >
          <Avatar sx={{ bgcolor: '#1976d2', width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, mr: 1 }}>
            <AccountCircleIcon sx={{ fontSize: isMobile ? 20 : 28, color: 'white' }} />
          </Avatar>
          {!isMobile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 100 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white', lineHeight: 1.1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {profileData ? `${profileData.prenom} ${profileData.nom}` : 'Utilisateur'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#e0e0e0', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profileData?.role || 'role'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Menu profil */}
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


