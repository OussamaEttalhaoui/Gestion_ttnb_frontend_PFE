import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Badge, Box, List, ListItem, ListItemText } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../pages/Auth';
import { useNavigate } from 'react-router-dom';
import fetchWithAuth from '../utils/api';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [profileData, setProfileData] = useState(null); // <- infos complètes
  const stompClientRef = useRef(null);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  // 🔔 STOMP notifications
  useEffect(() => {
    if (stompClientRef.current) return;
    const socket = new SockJS('http://localhost:8036/ws');
    const client = over(socket);
    stompClientRef.current = client;

    client.connect(
      {},
      () => client.subscribe('/topic/notifications', (message) => {
        if (message.body) setNotifications((prev) => [...prev, message.body]);
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
        const response = await fetchWithAuth('http://localhost:8036/api/utilisateurs/profile');
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
        <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose}>
          <List sx={{ minWidth: 300 }}>
            {notifications.length === 0 ? (
              <ListItem><ListItemText primary="Aucune notification" /></ListItem>
            ) : (
              notifications.map((notif, idx) => (
                <ListItem key={idx}><ListItemText primary={notif} /></ListItem>
              ))
            )}
          </List>
        </Menu>

        {/* 👤 Profil avec nom complet et rôle */}
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

        {/* Menu  */}
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







// import React, { useState } from 'react'
// import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Badge, Box } from '@mui/material'
// import NotificationsIcon from '@mui/icons-material/Notifications'
// import AccountCircle from '@mui/icons-material/AccountCircle'

// export default function Navbar() {
//   const [anchorEl, setAnchorEl] = useState(null)
//   const open = Boolean(anchorEl)

//   const handleMenu = (event) => {
//     setAnchorEl(event.currentTarget)
//   }
//   const handleClose = () => {
//     setAnchorEl(null)
//   }

//   return (
//     <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)' }}>
//       <Toolbar>
//         <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
//           Gestion TTNB
//         </Typography>
//         <IconButton color="inherit" sx={{ mr: 2 }}>
//           <Badge badgeContent={3} color="error">
//             <NotificationsIcon />
//           </Badge>
//         </IconButton>
//         <Box>
//           <IconButton
//             size="large"
//             edge="end"
//             color="inherit"
//             onClick={handleMenu}
//           >
//             <Avatar sx={{ bgcolor: '#fff', color: '#1976d2', width: 32, height: 32 }}>U</Avatar>
//           </IconButton>
//           <Menu
//             anchorEl={anchorEl}
//             open={open}
//             onClose={handleClose}
//             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//           >
//             <MenuItem onClick={handleClose}>Profil</MenuItem>
//             <MenuItem onClick={handleClose}>Paramètres</MenuItem>
//             <MenuItem onClick={() => { handleClose(); /* Ajoute ici ta logique de logout */ }}>Déconnexion</MenuItem>
//           </Menu>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   )
// }