// import React, { useState } from 'react';
// import { Paper, Box, Typography, TextField, Button } from '@mui/material';
// import { Link, useNavigate } from 'react-router-dom';
// import logoMaroc from '../assets/royaume_du_maroc.png'; // Importez le logo

// export default function Register() {
//   const [form, setForm] = useState({
//     nom: '',
//     prenom: '',
//     email: '',
//     motDePasse: '',
//     telephone: '',
//   });
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     try {
//       const res = await fetch('http://localhost:8036/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) {
//         const errorData = await res.json();
//         const errorMessage = errorData?.message || 'Erreur lors de l\'enregistrement';
//         setError(errorMessage); // Utilisez le state error pour afficher l'erreur
//         throw new Error(errorMessage);
//       }
//       // Rediriger vers la page de connexion après l'enregistrement
//       navigate('/login');
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         bgcolor: '#f7f7fa',
//         position: 'relative',
//       }}
//     >
//       {/* Titre à gauche */}
//       <Box
//         sx={{
//           position: 'absolute',
//           top: 32,
//           left: 32,
//         }}
//       >
//         <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
//           Gestion de la TTNB
//         </Typography>
//       </Box>

//       {/* Logo + titres institutionnels à droite */}
//       <Box
//         sx={{
//           position: 'absolute',
//           top: 32,
//           right: 32,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 2,
//         }}
//       >
//         <img
//           src={logoMaroc}
//           alt="Royaume du Maroc"
//           style={{ width: 56, height: 56 }}
//         />
//         <Box>
//           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2', lineHeight: 1.2 }}>
//             Ministère de l’Intérieur<br />
//             Wilaya de la Région de Marrakech-Safi
//           </Typography>
//           <Typography variant="body2" sx={{ color: '#444', mt: 0.5 }}>
//             Commune AL OUIDANE
//           </Typography>
//         </Box>
//       </Box>

//       {/* Formulaire d'inscription centré */}
//       <Box
//         sx={{
//           minHeight: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <Paper elevation={8} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 4 }}>
//           <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
//             Inscription
//           </Typography>
//           {error && (
//             <Typography color="error" align="center">
//               {error}
//             </Typography>
//           )}
//           <Box component="form" onSubmit={handleSubmit} noValidate>
//             <TextField
//               label="Nom"
//               name="nom"
//               value={form.nom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               required
//             />
//             <TextField
//               label="Prénom"
//               name="prenom"
//               value={form.prenom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               required
//             />
//             <TextField
//               label="Email"
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               required
//             />
//             <TextField
//               label="Mot de passe"
//               type="password"
//               name="motDePasse"
//               value={form.motDePasse}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               required
//             />
//             <TextField
//               label="Téléphone"
//               name="telephone"
//               value={form.telephone}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               required
//             />
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               fullWidth
//               sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }}
//             >
//               S'inscrire
//             </Button>
//             <Typography variant="body2" align="center" sx={{ mt: 2 }}>
//               Déjà un compte ? <Link to="/login">Connectez-vous</Link>
//             </Typography>
//           </Box>
//         </Paper>
//       </Box>
//     </Box>
//   );
// }