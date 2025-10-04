import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Badge, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../pages/Auth'; // Importez le hook useAuth
import { useNavigate } from 'react-router-dom'; // Importez useNavigate

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { logoutUser } = useAuth(); // Utilisez le hook useAuth pour accéder à la fonction logoutUser
  const navigate = useNavigate(); // Initialisez useNavigate

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logoutUser(); // Appelez la fonction logoutUser pour déconnecter l'utilisateur
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/profile'); // Redirige vers la page de profil
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
          Gestion TTNB
        </Typography>
        <IconButton color="inherit" sx={{ mr: 2 }}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Box>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMenu}
          >
            <Avatar sx={{ bgcolor: '#fff', color: '#1976d2', width: 32, height: 32 }}>U</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleProfileClick}>Profil</MenuItem> {/* Utilisez la fonction handleProfileClick */}
            <MenuItem onClick={handleClose}>Paramètres</MenuItem>
            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem> {/* Utilisez la fonction handleLogout */}
          </Menu>
        </Box>
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