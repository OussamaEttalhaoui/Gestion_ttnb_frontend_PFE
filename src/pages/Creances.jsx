import React from 'react';
import {
  Paper, Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, TableSortLabel, TablePagination,
  Tooltip, alpha, Chip, Fade
} from '@mui/material';
import { Edit, Delete, CalendarToday } from '@mui/icons-material';

import { useAuth } from './Auth'; 
import { useCreancesLogic } from '../hooks/useCreancesLogic'; 

// Composants importés
import CreanceFormDialog from '../components/Creances_components/CreanceFormDialog';
import TauxZoneDialog from '../components/Creances_components/TauxZoneDialog';
import CalculTaxeDialog from '../components/Creances_components/CalculTaxeDialog';
import CreancesToolbar from '../components/Creances_components/CreancesToolbar'; 
import CreancesAlerts from '../components/Creances_components/CreancesAlerts';   

// ------------------------- Constantes et Fonctions Utils -------------------------

const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

// [NOTE]: Les fonctions getBienIdentifier, descendingComparator et getComparator
// sont conservées ici car elles sont passées au hook, mais leur logique est la même.

function descendingComparator(a, b, orderBy) {
  let aValue, bValue;
  switch (orderBy) {
    case 'identifiantBien':
      aValue = a.recensement?.bien?.numeroTitreFoncier || a.recensement?.bien?.numeroCertificatPropriete || a.recensement?.bien?.numeroInterne || '';
      bValue = b.recensement?.bien?.numeroTitreFoncier || b.recensement?.bien?.numeroCertificatPropriete || b.recensement?.bien?.numeroInterne || '';
      break;
    case 'dateConstatation':
      aValue = a.dateConstatation || '';
      bValue = b.dateConstatation || '';
      break;
    case 'avecDeclaration':
      aValue = a.avecDeclaration ? 1 : 0;
      bValue = b.avecDeclaration ? 1 : 0;
      break;
    case 'exercices':
      aValue = a.exercices?.join(', ') || '';
      bValue = b.exercices?.join(', ') || '';
      break;
    case 'montantTaxe':
      aValue = a.montantTaxe || 0;
      bValue = b.montantTaxe || 0;
      break;
    default:
      aValue = a[orderBy];
      bValue = b[orderBy];
      break;
  }
  
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function getBienIdentifier(creance) {
  const bien = creance.recensement?.bien;
  if (!bien) return 'N/A';

  const configs = {
    numeroTitreFoncier: { label: 'TF', color: 'success', prefix: 'Titre Foncier' },
    numeroCertificatPropriete: { label: 'Req', color: 'warning', prefix: 'Réquisition' },
    numeroInterne: { label: 'Int', color: 'error', prefix: 'Numéro Interne' }
  };

  for (const [key, config] of Object.entries(configs)) {
    if (bien[key]) {
      return (
        <Tooltip title={`${config.prefix}: ${bien[key]}`} arrow>
          <Chip
            label={`${config.label}: ${bien[key]}`}
            color={config.color}
            size="small"
            sx={{ 
              fontWeight: 600,
              '&:hover': { transform: 'scale(1.05)' },
              transition: 'transform 0.2s'
            }}
          />
        </Tooltip>
      );
    }
  }
  return <Chip label="N/A" size="small" variant="outlined" />;
}

// ------------------------- COMPOSANT PRINCIPAL (Rendu) -------------------------

export default function Creances() {
  const { user } = useAuth(); 
  
  // Utilisation unique du Hook et Destructuration de toutes les valeurs et fonctions
  const {
    search, setSearch,
    handleOpen, handleSubmit, handleDelete, handleClose, handleChange, handleDateChange, handleExercicesChange,
    open, selected, form, errorMessage,
    openTaux, handleOpenTaux, handleCloseTaux, handleTauxChange, handleSaveTaux,
    tauxZones, // <--- AJOUTÉ : Récupération de l'état "tauxZones"
    openCalculTaxe, calculTaxeForm, calculTaxeResult, handleOpenCalculTaxe, handleCloseCalculTaxe, handleCalculerTaxe, handleCalculTaxeChange, handleCalculTaxeExercicesChange,
    openAdminAlert, setOpenAdminAlert, openAlertDialog, alert, handleCloseAlertDialog,
    displayCreances, handleRequestSort, orderBy, order,
    handleChangePage, handleChangeRowsPerPage, page, rowsPerPage, filteredCreancesLength
  } = useCreancesLogic(user, getComparator, getBienIdentifier);


  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* En-tête */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Gestion des Créances
        </Typography>
      </Box>

      {/* Barre de recherche et actions */}
      <CreancesToolbar
        search={search}
        setSearch={setSearch}
        handleOpenTaux={handleOpenTaux}
        handleOpenCalculTaxe={handleOpenCalculTaxe}
        handleOpenCreate={() => handleOpen()} 
      />

      {/* Tableau (Le JSX est conservé ici) */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
                {[
                  { id: 'identifiantBien', label: 'Identifiant Bien' },
                  { id: 'dateConstatation', label: 'Date Constatation' },
                  { id: 'avecDeclaration', label: 'Déclaration' },
                  { id: 'exercices', label: 'Exercices' },
                  { id: 'montantTaxe', label: 'Montant Taxe' },
                ].map(column => (
                  <TableCell 
                    key={column.id}
                    sx={{ fontWeight: 700, color: primaryColor }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                      sx={{
                        '&.MuiTableSortLabel-root': { color: primaryColor },
                        '&.Mui-active': { color: primaryColor },
                        '& .MuiTableSortLabel-icon': { color: `${primaryColor} !important` }
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700, color: primaryColor }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayCreances.map((c, index) => (
                  <Fade in key={c.id} timeout={300 + index * 50}>
                    <TableRow 
                      hover
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(primaryColor, 0.02),
                          transform: 'scale(1.001)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <TableCell>{getBienIdentifier(c)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<CalendarToday sx={{ fontSize: 16 }} />}
                          label={c.dateConstatation}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.avecDeclaration ? 'Oui' : 'Non'}
                          size="small"
                          color={c.avecDeclaration ? 'success' : 'error'}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{c.exercices?.join(', ')}</TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="text.primary">
                          {c.montantTaxe ? `${c.montantTaxe.toFixed(2)} DH` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier" arrow>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpen(c)}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha(primaryColor, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer" arrow>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(c.id)}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha('#d32f2f', 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              {displayCreances.length === 0 && ( 
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      Aucune créance trouvée
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Essayez de modifier vos critères de recherche
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[4, 8, 12]}
          component="div"
          count={filteredCreancesLength} 
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </Paper>

      {/* -------------------- Composants Dialogues -------------------- */}
      
      {/* 1. Formulaire Ajout/Modification de Créance */}
      <CreanceFormDialog 
        open={open}
        selected={selected}
        form={form}
        errorMessage={errorMessage}
        handleClose={handleClose}
        handleChange={handleChange}
        handleDateChange={handleDateChange}
        handleExercicesChange={handleExercicesChange}
        handleSubmit={handleSubmit}
        user={user}
      />

      {/* 2. Définir Taux par Zone */}
      <TauxZoneDialog
        open={openTaux}
        tauxZones={tauxZones} 
        handleCloseTaux={handleCloseTaux}
        handleTauxChange={handleTauxChange}
        handleSaveTaux={handleSaveTaux}
      />

      {/* 3. Calculer Taxe */}
      <CalculTaxeDialog
        open={openCalculTaxe}
        calculTaxeForm={calculTaxeForm}
        calculTaxeResult={calculTaxeResult}
        errorMessage={errorMessage}
        handleCloseCalculTaxe={handleCloseCalculTaxe}
        handleCalculerTaxe={handleCalculerTaxe}
        handleCalculTaxeChange={handleCalculTaxeChange}
        handleCalculTaxeExercicesChange={handleCalculTaxeExercicesChange}
      />

      {/* 4. Dialogues d'alerte */}
      <CreancesAlerts
        openAdminAlert={openAdminAlert}
        setOpenAdminAlert={setOpenAdminAlert}
        openAlertDialog={openAlertDialog}
        alert={alert}
        handleCloseAlertDialog={handleCloseAlertDialog}
      />
    </Box>
  );
}

// import React, { useState, useEffect } from 'react';
// import {
//   Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
//   TextField, Toolbar, Alert, Grid, TableSortLabel, TablePagination,
//   InputAdornment, Tooltip, alpha, Chip, Fade
// } from '@mui/material';
// import { Edit, Delete, Add, Search, CalendarToday, AttachMoney } from '@mui/icons-material';
// import dayjs from 'dayjs';
// import { useNavigate } from 'react-router-dom';
// import fetchWithAuth from '../utils/api';
// import { useAuth } from './Auth'; 

// // Importation des composants externes et NOUVEAUX composants internes
// import CreanceFormDialog from '../components/Creances_components/CreanceFormDialog';
// import TauxZoneDialog from '../components/Creances_components/TauxZoneDialog';
// import CalculTaxeDialog from '../components/Creances_components/CalculTaxeDialog';
// import CreancesToolbar from '../components/Creances_components/CreancesToolbar'; // NOUVEAU
// import CreancesAlerts from '../components/Creances_components/CreancesAlerts';   // NOUVEAU

// const exercicesPossibles = [2021, 2022, 2023, 2024, 2025];
// const primaryColor = '#1976d2';
// const secondaryColor = '#42a5f5';

// // ------------------------- FONCTIONS DE UTILS ET STYLES (Conservées) -------------------------

// function descendingComparator(a, b, orderBy) {
//   // ... (Code de descendingComparator inchangé)
//   let aValue, bValue;

//   switch (orderBy) {
//     case 'identifiantBien':
//       aValue = a.recensement?.bien?.numeroTitreFoncier || a.recensement?.bien?.numeroCertificatPropriete || a.recensement?.bien?.numeroInterne || '';
//       bValue = b.recensement?.bien?.numeroTitreFoncier || b.recensement?.bien?.numeroCertificatPropriete || b.recensement?.bien?.numeroInterne || '';
//       break;
//     case 'dateConstatation':
//       aValue = a.dateConstatation || '';
//       bValue = b.dateConstatation || '';
//       break;
//     case 'avecDeclaration':
//       aValue = a.avecDeclaration ? 1 : 0;
//       bValue = b.avecDeclaration ? 1 : 0;
//       break;
//     case 'exercices':
//       aValue = a.exercices?.join(', ') || '';
//       bValue = b.exercices?.join(', ') || '';
//       break;
//     case 'montantTaxe':
//       aValue = a.montantTaxe || 0;
//       bValue = b.montantTaxe || 0;
//       break;
//     default:
//       aValue = a[orderBy];
//       bValue = a[orderBy]; // Correction: bValue doit utiliser b[orderBy]
//       bValue = b[orderBy];
//       break;
//   }
  
//   if (aValue < bValue) return -1;
//   if (aValue > bValue) return 1;
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// function getBienIdentifier(creance) {
//   // ... (Code de getBienIdentifier inchangé)
//   const bien = creance.recensement?.bien;
//   if (!bien) return 'N/A';

//   const configs = {
//     numeroTitreFoncier: { label: 'TF', color: 'success', prefix: 'Titre Foncier' },
//     numeroCertificatPropriete: { label: 'Req', color: 'warning', prefix: 'Réquisition' },
//     numeroInterne: { label: 'Int', color: 'error', prefix: 'Numéro Interne' }
//   };

//   for (const [key, config] of Object.entries(configs)) {
//     if (bien[key]) {
//       return (
//         <Tooltip title={`${config.prefix}: ${bien[key]}`} arrow>
//           <Chip
//             label={`${config.label}: ${bien[key]}`}
//             color={config.color}
//             size="small"
//             sx={{ 
//               fontWeight: 600,
//               '&:hover': { transform: 'scale(1.05)' },
//               transition: 'transform 0.2s'
//             }}
//           />
//         </Tooltip>
//       );
//     }
//   }

//   return <Chip label="N/A" size="small" variant="outlined" />;
// }

// // ------------------------- COMPOSANT PRINCIPAL -------------------------

// export default function Creances() {
//   const [creances, setCreances] = useState([]);
//   const [open, setOpen] = useState(false); // Formulaire Créance
//   const [selected, setSelected] = useState(null);
//   const [search, setSearch] = useState('');
//   const [biens, setBiens] = useState([]);
//   const navigate = useNavigate();
//   const [errorMessage, setErrorMessage] = useState('');
  
//   const [openTaux, setOpenTaux] = useState(false); // Taux Zone
//   const [tauxZones, setTauxZones] = useState({});
  
//   const { user } = useAuth(); 
//   const [openAdminAlert, setOpenAdminAlert] = useState(false); 
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' }); 
//   const [openAlertDialog, setOpenAlertDialog] = useState(false); // Alerte Générale
  

//   // Form state
//   const [form, setForm] = useState({
//     identifiantBien: '',
//     dateConstatation: dayjs(),
//     avecDeclaration: false,
//     exercices: [],
//     montantTaxe: 0,
//   });

//   // Sorting state
//   const [order, setOrder] = useState('asc');
//   const [orderBy, setOrderBy] = useState('identifiantBien');

//   // Pagination state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(4); // Lignes par page initialisées à 4

//   // Calculate Tax state
//   const [openCalculTaxe, setOpenCalculTaxe] = useState(false);
//   const [calculTaxeForm, setCalculTaxeForm] = useState({
//     superficie: 0,
//     taux: 0,
//     exercices: [],
//     avecDeclaration: false,
//     dateConstatation: dayjs(),
//   });
//   const [calculTaxeResult, setCalculTaxeResult] = useState(null);

//   // --- Fonctions de Fetch ---

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await fetchCreances(); 
//         await fetchBiens();
//         await fetchTauxZones();
//       } catch (error) {
//         console.error("Erreur lors de la récupération des données:", error);
//       }
//     };
    
//     // La correction de timing
//     if (user !== null) {
//         fetchData();
//     }
    
//   }, [user]);

//   const fetchCreances = async () => { /* ... */
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/creances');
//       const data = await res.json();
//       setCreances(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchBiens = async () => { /* ... */
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/biens');
//       const data = await res.json();
//       setBiens(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchTauxZones = async () => { /* ... */
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/taux-zones');
//       const data = await res.json();
//       const tauxMap = {};
//       data.forEach(item => {
//         tauxMap[item.zone] = item.taux;
//       });
//       setTauxZones(tauxMap);
//     } catch (error) {
//       console.error("Erreur lors de la récupération des taux de zone:", error);
//     }
//   };

//   // --- Fonctions du Formulaire Créance (handleOpen, handleClose, etc.) ---

//   const handleOpen = (creance = null) => {
//     const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true
//     const hasCreatePermission = user?.permissions?.includes('CREATE') === true

//     if (creance && !hasUpdatePermission) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier cette créance.", severity: 'error' })
//       setOpenAlertDialog(true)
//       return
//     }
//     if (!creance && !hasCreatePermission) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer une créance.", severity: 'error' })
//       setOpenAlertDialog(true)
//       return
//     }

//     setSelected(creance);
//     setForm(creance ? {
//       ...creance,
//       dateConstatation: creance.dateConstatation ? dayjs(creance.dateConstatation) : null,
//       identifiantBien: creance.recensement?.bien?.numeroTitreFoncier || creance.recensement?.bien?.numeroCertificatPropriete || creance.recensement?.bien?.numeroInterne || ''
//     } : {
//       identifiantBien: '',
//       dateConstatation: dayjs(),
//       avecDeclaration: false,
//       exercices: [],
//       montantTaxe: 0,
//     });
//     setOpen(true);
//     setErrorMessage('');
//   };

//   const handleClose = () => {
//     setSelected(null);
//     setOpen(false);
//     setErrorMessage('');
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleDateChange = (date) => {
//     setForm(prev => ({
//       ...prev,
//       dateConstatation: date
//     }));
//   };

//   const handleExercicesChange = (e) => {
//     setForm(prev => ({
//       ...prev,
//       exercices: e.target.value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');

//     const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true
//     const hasCreatePermission = user?.permissions?.includes('CREATE') === true

//     if (selected && !hasUpdatePermission) return;
//     if (!selected && !hasCreatePermission) return;

//     try {
//       const dataToSend = {
//         ...form,
//         dateConstatation: form.dateConstatation ? form.dateConstatation.format('YYYY-MM-DD') : null,
//       };

//       let res;
//       if (selected) {
//         // Modification
//         res = await fetchWithAuth(`http://localhost:8036/api/creances/pdf/${selected.id}?identifiantBien=${form.identifiantBien}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(dataToSend),
//         });
//       } else {
//         // Création
//         res = await fetchWithAuth(`http://localhost:8036/api/creances/pdf?identifiantBien=${form.identifiantBien}`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(dataToSend),
//         });
//       }

//       if (!res.ok) {
//         let errorText = await res.text();
//         try {
//           const errorJson = JSON.parse(errorText);
//           errorText = errorJson.message || errorText;
//         } catch (e) { }
//         setErrorMessage(errorText || `Erreur ${res.status} lors de l'opération.`);
//         return; 
//       }

//       // Téléchargement du PDF
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `Creance_${form.identifiantBien}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);

//       fetchCreances();
//       handleClose();
//     } catch (error) {
//       console.error("Erreur lors de la création de la créance:", error);
//       setErrorMessage(error.message);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!user?.permissions?.includes('DELETE')) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer cette créance.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     if (window.confirm('Supprimer cette créance ?')) {
//       try {
//         await fetchWithAuth(`http://localhost:8036/api/creances/${id}`, {
//           method: 'DELETE',
//         });
//         fetchCreances();
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   };

//   // --- Fonctions Taux Zone ---

//   const handleOpenTaux = () => {
//     if (user && user.role !== 'ADMIN') {
//       setOpenAdminAlert(true);
//       return;
//     }
//     setOpenTaux(true);
//   };

//   const handleCloseTaux = () => {
//     setOpenTaux(false);
//   };

//   const handleTauxChange = (zone, taux) => {
//     setTauxZones(prev => ({ ...prev, [zone]: taux }));
//   };

//   const handleSaveTaux = async () => {
//     try {
//       for (const zone in tauxZones) {
//         await fetchWithAuth('http://localhost:8036/api/taux-zones', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ zone: zone, taux: tauxZones[zone] }),
//         });
//       }
//       handleCloseTaux();
//       fetchTauxZones(); 
//     } catch (error) {
//       console.error("Erreur lors de l'enregistrement des taux de zone:", error);
//     }
//   };

//   // --- Fonctions Calcul Taxe ---

//   const handleOpenCalculTaxe = () => {
//     if (!user?.permissions?.includes('CREATE')) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de calculer la taxe.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     setCalculTaxeForm({
//       superficie: 0,
//       taux: 0,
//       exercices: [],
//       avecDeclaration: false,
//       dateConstatation: dayjs(),
//     });
//     setCalculTaxeResult(null);
//     setErrorMessage('');
//     setOpenCalculTaxe(true);
//   };

//   const handleCloseCalculTaxe = () => {
//     setOpenCalculTaxe(false);
//     setCalculTaxeResult(null);
//   };

//   const handleCalculerTaxe = async () => {
//     setErrorMessage('');
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/creances/calcul', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...calculTaxeForm,
//           dateConstatation: calculTaxeForm.dateConstatation
//             ? calculTaxeForm.dateConstatation.format('YYYY-MM-DD')
//             : null,
//         }),
//       });

//       if (!res.ok) {
//         let errorText = await res.text();
//         try {
//           const errorJson = JSON.parse(errorText);
//           errorText = errorJson.message || errorText;
//         } catch (e) { }
//         setErrorMessage(errorText || `Erreur ${res.status} lors du calcul de la taxe.`);
//         setCalculTaxeResult(null);
//         return;
//       }

//       const data = await res.json();
//       setCalculTaxeResult(data);
//       setErrorMessage('');
//     } catch (error) {
//       console.error("Erreur lors du calcul de la taxe:", error);
//       setErrorMessage(`Erreur lors du calcul de la taxe: ${error.message}`);
//     }
//   };

//   const handleCalculTaxeChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setCalculTaxeForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleCalculTaxeExercicesChange = (e) => {
//     setCalculTaxeForm(prev => ({
//       ...prev,
//       exercices: e.target.value
//     }));
//   };

//   const handleCloseAlertDialog = () => {
//     setOpenAlertDialog(false);
//     setAlert({ ...alert, open: false });
//   };

//   // --- Fonctions d'affichage, de tri et de pagination ---

//   const filteredCreances = creances.filter(c => {
//     // Logique de filtrage inchangée
//     const identifiantBien = c.recensement?.bien?.numeroTitreFoncier || c.recensement?.bien?.numeroCertificatPropriete || c.recensement?.bien?.numeroInterne || '';
//     return identifiantBien.toLowerCase().includes(search.toLowerCase()) ||
//       (c.avecDeclaration ? 'oui' : 'non').includes(search.toLowerCase()) ||
//       c.exercices?.join(', ').toLowerCase().includes(search.toLowerCase()) ||
//       c.montantTaxe?.toString().includes(search);
//   });
  
//   const handleRequestSort = (property) => {
//     const isAsc = orderBy === property && order === 'asc';
//     setOrder(isAsc ? 'desc' : 'asc');
//     setOrderBy(property);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const sortedCreances = [...filteredCreances].sort(getComparator(order, orderBy));
//   const displayCreances = sortedCreances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


//   return (
//     <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
//       {/* En-tête */}
//       <Box sx={{ mb: 2 }}>
//         <Typography 
//           variant="h4" 
//           sx={{ 
//             fontWeight: 800,
//             background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
//             backgroundClip: 'text',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             mb: 1
//           }}
//         >
//           Gestion des Créances
//         </Typography>
//       </Box>

//       {/* Barre de recherche et actions (Utilisation du composant isolé) */}
//       <CreancesToolbar
//         search={search}
//         setSearch={setSearch}
//         handleOpenTaux={handleOpenTaux}
//         handleOpenCalculTaxe={handleOpenCalculTaxe}
//         handleOpenCreate={() => handleOpen()} 
//       />

//       {/* Tableau  */}
//       <Paper 
//         elevation={0}
//         sx={{ 
//           borderRadius: 3,
//           border: '1px solid',
//           borderColor: 'divider',
//           overflow: 'hidden'
//         }}
//       >
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
//                 {[
//                   { id: 'identifiantBien', label: 'Identifiant Bien' },
//                   { id: 'dateConstatation', label: 'Date Constatation' },
//                   { id: 'avecDeclaration', label: 'Déclaration' },
//                   { id: 'exercices', label: 'Exercices' },
//                   { id: 'montantTaxe', label: 'Montant Taxe' },
//                 ].map(column => (
//                   <TableCell 
//                     key={column.id}
//                     sx={{ fontWeight: 700, color: primaryColor }}
//                     sortDirection={orderBy === column.id ? order : false}
//                   >
//                     <TableSortLabel
//                       active={orderBy === column.id}
//                       direction={orderBy === column.id ? order : 'asc'}
//                       onClick={() => handleRequestSort(column.id)}
//                       sx={{
//                         '&.MuiTableSortLabel-root': { color: primaryColor },
//                         '&.Mui-active': { color: primaryColor },
//                         '& .MuiTableSortLabel-icon': { color: `${primaryColor} !important` }
//                       }}
//                     >
//                       {column.label}
//                     </TableSortLabel>
//                   </TableCell>
//                 ))}
//                 <TableCell align="right" sx={{ fontWeight: 700, color: primaryColor }}>
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {displayCreances.map((c, index) => (
//                   <Fade in key={c.id} timeout={300 + index * 50}>
//                     <TableRow 
//                       hover
//                       sx={{ 
//                         '&:hover': { 
//                           bgcolor: alpha(primaryColor, 0.02),
//                           transform: 'scale(1.001)'
//                         },
//                         transition: 'all 0.2s'
//                       }}
//                     >
//                       <TableCell>{getBienIdentifier(c)}</TableCell>
//                       <TableCell>
//                         <Chip
//                           icon={<CalendarToday sx={{ fontSize: 16 }} />}
//                           label={c.dateConstatation}
//                           size="small"
//                           variant="outlined"
//                           color="primary"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={c.avecDeclaration ? 'Oui' : 'Non'}
//                           size="small"
//                           color={c.avecDeclaration ? 'success' : 'error'}
//                           variant="filled"
//                           sx={{ fontWeight: 600 }}
//                         />
//                       </TableCell>
//                       <TableCell>{c.exercices?.join(', ')}</TableCell>
//                       <TableCell>
//                         <Typography fontWeight={600} color="text.primary">
//                           {c.montantTaxe ? `${c.montantTaxe.toFixed(2)} DH` : 'N/A'}
//                         </Typography>
//                       </TableCell>
//                       <TableCell align="right">
//                         <Tooltip title="Modifier" arrow>
//                           <IconButton 
//                             color="primary" 
//                             onClick={() => handleOpen(c)}
//                             sx={{ 
//                               '&:hover': { 
//                                 bgcolor: alpha(primaryColor, 0.1),
//                                 transform: 'scale(1.1)'
//                               },
//                               transition: 'all 0.2s'
//                             }}
//                           >
//                             <Edit />
//                           </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Supprimer" arrow>
//                           <IconButton 
//                             color="error" 
//                             onClick={() => handleDelete(c.id)}
//                             sx={{ 
//                               '&:hover': { 
//                                 bgcolor: alpha('#d32f2f', 0.1),
//                                 transform: 'scale(1.1)'
//                               },
//                               transition: 'all 0.2s'
//                             }}
//                           >
//                             <Delete />
//                           </IconButton>
//                         </Tooltip>
//                       </TableCell>
//                     </TableRow>
//                   </Fade>
//                 ))}
//               {sortedCreances.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
//                     <Typography variant="h6" color="text.secondary" fontWeight={600}>
//                       Aucune créance trouvée
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                       Essayez de modifier vos critères de recherche
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         <TablePagination
//           rowsPerPageOptions={[4, 8, 12]}
//           component="div"
//           count={filteredCreances.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           labelRowsPerPage="Lignes par page:"
//           labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
//           sx={{ borderTop: '1px solid', borderColor: 'divider' }}
//         />
//       </Paper>

//       {/* -------------------- Composants Dialogues -------------------- */}
      
//       {/* 1. Formulaire Ajout/Modification de Créance */}
//       <CreanceFormDialog 
//         open={open}
//         selected={selected}
//         form={form}
//         errorMessage={errorMessage}
//         handleClose={handleClose}
//         handleChange={handleChange}
//         handleDateChange={handleDateChange}
//         handleExercicesChange={handleExercicesChange}
//         handleSubmit={handleSubmit}
//         user={user}
//       />

//       {/* 2. Définir Taux par Zone */}
//       <TauxZoneDialog
//         open={openTaux}
//         tauxZones={tauxZones}
//         handleCloseTaux={handleCloseTaux}
//         handleTauxChange={handleTauxChange}
//         handleSaveTaux={handleSaveTaux}
//       />

//       {/* 3. Calculer Taxe */}
//       <CalculTaxeDialog
//         open={openCalculTaxe}
//         calculTaxeForm={calculTaxeForm}
//         calculTaxeResult={calculTaxeResult}
//         errorMessage={errorMessage}
//         handleCloseCalculTaxe={handleCloseCalculTaxe}
//         handleCalculerTaxe={handleCalculerTaxe}
//         handleCalculTaxeChange={handleCalculTaxeChange}
//         handleCalculTaxeExercicesChange={handleCalculTaxeExercicesChange}
//       />

//       {/* 4. Dialogues d'alerte (Utilisation du composant isolé) */}
//       <CreancesAlerts
//         openAdminAlert={openAdminAlert}
//         setOpenAdminAlert={setOpenAdminAlert}
//         openAlertDialog={openAlertDialog}
//         alert={alert}
//         handleCloseAlertDialog={handleCloseAlertDialog}
//       />
//     </Box>
//   );
// }













// import React, { useState, useEffect } from 'react';
// import {
//   Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Toolbar,
//   FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, FormControlLabel, Alert, Grid,
//   TableSortLabel, TablePagination
// } from '@mui/material';
// import { Edit, Delete, Add, Search } from '@mui/icons-material';
// import { DatePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import dayjs from 'dayjs';
// import { useNavigate } from 'react-router-dom';
// import fetchWithAuth from '../utils/api';
// import { useAuth } from './Auth'; // Import useAuth

// const exercicesPossibles = [2021, 2022, 2023, 2024, 2025];

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// export default function Creances() {
//   const [creances, setCreances] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [search, setSearch] = useState('');
//   const [biens, setBiens] = useState([]);
//   const navigate = useNavigate();
//   const [errorMessage, setErrorMessage] = useState('');
//   const [openTaux, setOpenTaux] = useState(false);
//   const [tauxZones, setTauxZones] = useState({});
//   const { user } = useAuth(); // Use useAuth hook
//   const [openAdminAlert, setOpenAdminAlert] = useState(false); // State for admin alert dialog
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' }); // State pour contrôler l'ouverture de la boîte de dialogue d'alerte
//   const [openAlertDialog, setOpenAlertDialog] = useState(false); // State pour contrôler l'ouverture de la boîte de dialogue d'alerte


//   // Form state
//   const [form, setForm] = useState({
//     identifiantBien: '',
//     dateConstatation: dayjs(),
//     avecDeclaration: false,
//     exercices: [],
//     montantTaxe: 0,
//   });

//   // Sorting state
//   const [order, setOrder] = useState('asc');
//   const [orderBy, setOrderBy] = useState('identifiantBien');

//   // Pagination state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(4);

//   // Calculate Tax
//   const [openCalculTaxe, setOpenCalculTaxe] = useState(false);
//   const [calculTaxeForm, setCalculTaxeForm] = useState({
//     superficie: 0,
//     taux: 0,
//     exercices: [],
//     avecDeclaration: false,
//     dateConstatation: dayjs(),
//   });
//   const [calculTaxeResult, setCalculTaxeResult] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await fetchCreances();
//         await fetchBiens();
//         await fetchTauxZones();
//       } catch (error) {
//         console.error("Erreur lors de la récupération des données:", error);
//         // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
//       }
//     };
//     fetchData();
//   }, []);

//   const fetchCreances = async () => {
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/creances');
//       const data = await res.json();
//       setCreances(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchBiens = async () => {
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/biens');
//       const data = await res.json();
//       setBiens(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchTauxZones = async () => {
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/taux-zones');
//       const data = await res.json();
//       const tauxMap = {};
//       data.forEach(item => {
//         tauxMap[item.zone] = item.taux;
//       });
//       setTauxZones(tauxMap);
//     } catch (error) {
//       console.error("Erreur lors de la récupération des taux de zone:", error);
//     }
//   };

//   const handleOpen = (creance = null) => {
//     setSelected(creance);
//     setForm(creance ? {
//       ...creance,
//       dateConstatation: creance.dateConstatation ? dayjs(creance.dateConstatation) : null,
//       identifiantBien: creance.recensement?.bien?.numeroTitreFoncier || creance.recensement?.bien?.numeroCertificatPropriete || creance.recensement?.bien?.numeroInterne || ''
//     } : {
//       identifiantBien: '',
//       dateConstatation: dayjs(),
//       avecDeclaration: false,
//       exercices: [],
//       montantTaxe: 0,
//     });
//     setOpen(true);
//     setErrorMessage('');
//   };

//   const handleClose = () => {
//     setSelected(null);
//     setOpen(false);
//     setErrorMessage('');
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleDateChange = (date) => {
//     setForm(prev => ({
//       ...prev,
//       dateConstatation: date
//     }));
//   };

//   const handleExercicesChange = (e) => {
//     setForm(prev => ({
//       ...prev,
//       exercices: e.target.value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');

//     try {
//       const dataToSend = {
//         ...form,
//         dateConstatation: form.dateConstatation ? form.dateConstatation.format('YYYY-MM-DD') : null,
//       };

//       let res;
//       if (selected) {
//         // Modification
//         if (!user?.permissions?.includes('UPDATE')) {
//           setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier cette créance.", severity: 'error' });
//           setOpenAlertDialog(true);
//           return;
//         }
//         res = await fetchWithAuth(`http://localhost:8036/api/creances/pdf/${selected.id}?identifiantBien=${form.identifiantBien}`, {
//           method: 'PUT',
//           body: JSON.stringify(dataToSend),
//         });
//       } else {
//         // Création
//         if (!user?.permissions?.includes('CREATE')) {
//           setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer cette créance.", severity: 'error' });
//           setOpenAlertDialog(true);
//           return;
//         }
//         res = await fetchWithAuth(`http://localhost:8036/api/creances/pdf?identifiantBien=${form.identifiantBien}`, {
//           method: 'POST',
//           body: JSON.stringify(dataToSend),
//         });
//       }

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `Creance_${form.identifiantBien}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);

//       fetchCreances();
//       handleClose();
//     } catch (error) {
//       console.error("Erreur lors de la création de la créance:", error);
//       setErrorMessage(error.message);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!user?.permissions?.includes('DELETE')) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer cette créance.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     if (window.confirm('Supprimer cette créance ?')) {
//       try {
//         await fetchWithAuth(`http://localhost:8036/api/creances/${id}`, {
//           method: 'DELETE',
//         });
//         fetchCreances();
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   };

//   const zonesPossibles = [
//     { value: 'IMMEUBLES', label: 'Zone Immeubles' },
//     { value: 'VILLAS', label: 'Zone Villas' },
//     { value: 'HABITAT', label: 'Zone Habitat' },
//     { value: 'SECTEUR_BIEN_EQUIPEE', label: 'Secteur Bien Equipée' },
//     { value: 'SECTEUR_MOYEN_EQUIPEE', label: 'Secteur Moyennement Equipée' },
//     { value: 'SECTEUR_MAL_EQUIPEE', label: 'Secteur Mal Equipée' },
//     { value: 'AUTRE', label: 'Autre Zone' },
//   ];

//   const filteredCreances = creances.filter(c => {
//     const identifiantBien = c.recensement?.bien?.numeroTitreFoncier || c.recensement?.bien?.numeroCertificatPropriete || c.recensement?.bien?.numeroInterne || '';
//     return identifiantBien.toLowerCase().includes(search.toLowerCase()) ||
//       (c.avecDeclaration ? 'oui' : 'non').includes(search.toLowerCase()) ||
//       c.exercices?.join(', ').toLowerCase().includes(search.toLowerCase()) ||
//       c.montantTaxe?.toString().includes(search);
//   });

//   const handleOpenTaux = () => {
//     if (user && user.role !== 'ADMIN') {
//       setOpenAdminAlert(true); // Open the admin alert dialog
//       return;
//     }
//     setOpenTaux(true);
//   };

//   const handleCloseTaux = () => {
//     setOpenTaux(false);
//   };

//   const handleTauxChange = (zone, taux) => {
//     setTauxZones(prev => ({ ...prev, [zone]: taux }));
//   };

//   const handleSaveTaux = async () => {
//     try {
//       for (const zone in tauxZones) {
//         await fetchWithAuth('http://localhost:8036/api/taux-zones', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ zone: zone, taux: tauxZones[zone] }),
//         });
//       }
//       handleCloseTaux();
//       fetchTauxZones(); // Refresh tauxZones after saving
//     } catch (error) {
//       console.error("Erreur lors de l'enregistrement des taux de zone:", error);
//     }
//   };

//   const handleRequestSort = (property) => {
//     const isAsc = orderBy === property && order === 'asc';
//     setOrder(isAsc ? 'desc' : 'asc');
//     setOrderBy(property);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const sortedCreances = [...filteredCreances].sort((a, b) => {
//     let aValue, bValue;

//     switch (orderBy) {
//       case 'identifiantBien':
//         aValue = a.recensement?.bien?.numeroTitreFoncier || a.recensement?.bien?.numeroCertificatPropriete || a.recensement?.bien?.numeroInterne || '';
//         bValue = b.recensement?.bien?.numeroTitreFoncier || b.recensement?.bien?.numeroCertificatPropriete || b.recensement?.bien?.numeroInterne || '';
//         break;
//       case 'dateConstatation':
//         aValue = a.dateConstatation || '';
//         bValue = b.dateConstatation || '';
//         break;
//       case 'avecDeclaration':
//         aValue = a.avecDeclaration ? 'oui' : 'non';
//         bValue = b.avecDeclaration ? 'oui' : 'non';
//         break;
//       case 'exercices':
//         aValue = a.exercices?.join(', ') || '';
//         bValue = b.exercices?.join(', ') || '';
//         break;
//       case 'montantTaxe':
//         aValue = a.montantTaxe || 0;
//         bValue = b.montantTaxe || 0;
//         break;
//       default:
//         aValue = '';
//         bValue = '';
//     }

//     if (order === 'asc') {
//       if (typeof aValue === 'number' && typeof bValue === 'number') {
//         return aValue - bValue;
//       }
//       return String(aValue).localeCompare(String(bValue));
//     } else {
//       if (typeof aValue === 'number' && typeof bValue === 'number') {
//         return bValue - aValue;
//       }
//       return String(bValue).localeCompare(String(aValue));
//     }
//   });

//   // Calculate Tax functions
//   const handleOpenCalculTaxe = () => {
//     if (!user?.permissions?.includes('CREATE')) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de calculer la taxe.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     setOpenCalculTaxe(true);
//   };

//   const handleCloseCalculTaxe = () => {
//     setOpenCalculTaxe(false);
//     setCalculTaxeResult(null);
//   };

//   const handleCalculTaxeChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setCalculTaxeForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleCalculTaxeExercicesChange = (e) => {
//     setCalculTaxeForm(prev => ({
//       ...prev,
//       exercices: e.target.value
//     }));
//   };

//   const handleCalculerTaxe = async () => {
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/api/creances/calcul', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         // body: JSON.stringify(calculTaxeForm),
//         body: JSON.stringify({
//           ...calculTaxeForm,
//           dateConstatation: calculTaxeForm.dateConstatation
//             ? calculTaxeForm.dateConstatation.format('YYYY-MM-DD')
//             : null,
//         }),
//       });

//       if (!res.ok) {
//         console.error("Erreur lors du calcul de la taxe:", res.status, res.statusText);
//         setErrorMessage(`Erreur lors du calcul de la taxe: ${res.status} ${res.statusText}`);
//         return;
//       }

//       const data = await res.json();
//       setCalculTaxeResult(data);
//       setErrorMessage('');
//     } catch (error) {
//       console.error("Erreur lors du calcul de la taxe:", error);
//       setErrorMessage(`Erreur lors du calcul de la taxe: ${error.message}`);
//     }
//   };

//   const handleCloseAlertDialog = () => {
//     setOpenAlertDialog(false);
//     setAlert({ ...alert, open: false });
//   };

//   return (
//     <Box className="p-4">
//       <Typography variant="h4" className="mb-4 font-bold text-blue-700">Créances</Typography>
//       <Paper sx={{ mb: 2, mt: 3 }}>
//         <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Search color="action" />
//             <TextField
//               label="Recherche"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               size="small"
//               sx={{ minWidth: 220 }}
//             />
//           </Box>
//           <Box>
//             <Button
//               variant="contained"
//               onClick={handleOpenTaux}
//               sx={{ mr: 2, borderRadius: 2 }}
//             >
//               Définir le taux
//             </Button>
//             <Button
//               variant="contained"
//               onClick={handleOpenCalculTaxe}
//               sx={{ mr: 2, borderRadius: 2 }}
//             >
//               Calculer Taxe
//             </Button>
//             <Button
//               variant="contained"
//               startIcon={<Add />}
//               color="primary"
//               onClick={() => {
//                 if (!user?.permissions?.includes('CREATE')) {
//                   setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer cette créance.", severity: 'error' });
//                   setOpenAlertDialog(true);
//                   return;
//                 }
//                 handleOpen()
//               }}
//               sx={{ borderRadius: 2 }}
//             >
//               Ajouter une créance
//             </Button>
//           </Box>
//         </Toolbar>
//       </Paper>

//       <TableContainer component={Paper} className="shadow-lg">
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell sortDirection={orderBy === 'identifiantBien' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'identifiantBien'}
//                   direction={orderBy === 'identifiantBien' ? order : 'asc'}
//                   onClick={() => handleRequestSort('identifiantBien')}
//                 >
//                   Identifiant Bien
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sortDirection={orderBy === 'dateConstatation' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'dateConstatation'}
//                   direction={orderBy === 'dateConstatation' ? order : 'asc'}
//                   onClick={() => handleRequestSort('dateConstatation')}
//                 >
//                   Date Constatation
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sortDirection={orderBy === 'avecDeclaration' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'avecDeclaration'}
//                   direction={orderBy === 'avecDeclaration' ? order : 'asc'}
//                   onClick={() => handleRequestSort('avecDeclaration')}
//                 >
//                   défaut de declaration
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sortDirection={orderBy === 'exercices' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'exercices'}
//                   direction={orderBy === 'exercices' ? order : 'asc'}
//                   onClick={() => handleRequestSort('exercices')}
//                 >
//                   Exercices
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sortDirection={orderBy === 'montantTaxe' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'montantTaxe'}
//                   direction={orderBy === 'montantTaxe' ? order : 'asc'}
//                   onClick={() => handleRequestSort('montantTaxe')}
//                 >
//                   Montant Taxe
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {sortedCreances
//               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//               .map(c => (
//                 <TableRow key={c.id}>
//                   <TableCell>{c.recensement?.bien?.numeroTitreFoncier || c.recensement?.bien?.numeroCertificatPropriete || c.recensement?.bien?.numeroInterne}</TableCell>
//                   <TableCell>{c.dateConstatation}</TableCell>
//                   <TableCell>{c.avecDeclaration ? 'Oui' : 'Non'}</TableCell>
//                   <TableCell>{c.exercices?.join(', ')}</TableCell>
//                   <TableCell>{c.montantTaxe}</TableCell>
//                   <TableCell align="right">
//                     <IconButton color="primary" onClick={() => handleOpen(c)}><Edit /></IconButton>
//                     <IconButton color="error" onClick={() => handleDelete(c.id)}><Delete /></IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         rowsPerPageOptions={[4, 8, 12]}
//         component="div"
//         count={filteredCreances.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//         labelRowsPerPage="Lignes par page:"
//         labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
//       />

//       <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//         <DialogTitle>{selected ? 'Modifier Créance' : 'Ajouter Créance'}</DialogTitle>
//         <DialogContent>
//           {errorMessage && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {errorMessage}
//             </Alert>
//           )}
//           <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <TextField
//               label="Identifiant du bien"
//               name="identifiantBien"
//               value={form.identifiantBien}
//               onChange={handleChange}
//               fullWidth
//               required
//             />

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Date Constatation"
//                 value={form.dateConstatation}
//                 onChange={handleDateChange}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </LocalizationProvider>

//             <FormControlLabel
//               control={<Checkbox checked={form.avecDeclaration} onChange={handleChange} name="avecDeclaration" />}
//               label="défaut de declaration , declaration déposé hors delai."
//             />

//             <FormControl fullWidth>
//               <InputLabel id="exercices-label">Exercices</InputLabel>
//               <Select
//                 labelId="exercices-label"
//                 id="exercices"
//                 multiple
//                 name="exercices"
//                 value={form.exercices}
//                 onChange={handleExercicesChange}
//                 renderValue={(selected) => selected.join(', ')}
//                 label="Exercices"
//               >
//                 {exercicesPossibles.map((annee) => (
//                   <MenuItem key={annee} value={annee}>
//                     <Checkbox checked={form.exercices.indexOf(annee) > -1} />
//                     <ListItemText primary={annee} />
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Annuler</Button>
//           <Button type="submit" onClick={handleSubmit} variant="contained" color="primary">
//             Enregistrer
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTaux} onClose={handleCloseTaux} maxWidth="sm" fullWidth>
//         <DialogTitle>Définir les taux par zone</DialogTitle>
//         <DialogContent sx={{ pt: 4 }}> {/* Ajout de paddingTop */}
//           <Grid container spacing={2} pt={2}>
//             {zonesPossibles.map(zone => (
//               <Grid item xs={12} key={zone.value}>
//                 <TextField
//                   label={zone.label}
//                   type="number"
//                   fullWidth
//                   value={tauxZones[zone.value] || ''}
//                   onChange={(e) => handleTauxChange(zone.value, e.target.value)}
//                 />
//               </Grid>
//             ))}
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTaux}>Annuler</Button>
//           <Button onClick={handleSaveTaux} variant="contained" color="primary">
//             Enregistrer
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Admin Alert Dialog */}
//       <Dialog
//         open={openAdminAlert}
//         onClose={() => setOpenAdminAlert(false)}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">{"Accès Refusé"}</DialogTitle>
//         <DialogContent>
//           <Typography id="alert-dialog-description">
//             Seuls les administrateurs peuvent définir les taux.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenAdminAlert(false)}>OK</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Calcul Taxe Dialog */}
//       <Dialog open={openCalculTaxe} onClose={handleCloseCalculTaxe} maxWidth="md" fullWidth>
//         <DialogTitle>Calculer Taxe TNB</DialogTitle>
//         <DialogContent>
//           <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <TextField
//               label="Superficie"
//               name="superficie"
//               type="number"
//               value={calculTaxeForm.superficie}
//               onChange={handleCalculTaxeChange}
//               fullWidth
//             />
//             <TextField
//               label="Taux"
//               name="taux"
//               type="number"
//               value={calculTaxeForm.taux}
//               onChange={handleCalculTaxeChange}
//               fullWidth
//             />
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//              <DatePicker
//                label="Date de constatation"
//                value={calculTaxeForm.dateConstatation}
//                onChange={(date) => setCalculTaxeForm(prev => ({ ...prev, dateConstatation: date }))}
//                renderInput={(params) => <TextField {...params} fullWidth />}
//              />
//             </LocalizationProvider>
//             <FormControl fullWidth>
//               <InputLabel id="calcul-exercices-label">Exercices</InputLabel>
//               <Select
//                 labelId="calcul-exercices-label"
//                 id="calcul-exercices"
//                 multiple
//                 name="exercices"
//                 value={calculTaxeForm.exercices}
//                 onChange={handleCalculTaxeExercicesChange}
//                 renderValue={(selected) => selected.join(', ')}
//                 label="Exercices"
//               >
//                 {exercicesPossibles.map((annee) => (
//                   <MenuItem key={annee} value={annee}>
//                     <Checkbox checked={calculTaxeForm.exercices.indexOf(annee) > -1} />
//                     <ListItemText primary={annee} />
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//             <FormControlLabel
//               control={<Checkbox checked={calculTaxeForm.avecDeclaration} onChange={handleCalculTaxeChange} name="avecDeclaration" />}
//               label="Avec déclaration"
//             />
//           </Box>
//           {calculTaxeResult && (
//             <Box mt={3}>
//               <Typography variant="h6">Résultats du calcul :</Typography>
//               <TableContainer component={Paper}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Exercice</TableCell>
//                       <TableCell>Principale</TableCell>
//                       <TableCell>défaut de declaration</TableCell>
//                       <TableCell>Taxe TNB</TableCell>
//                       <TableCell>Pénalité</TableCell>
//                       <TableCell>Majoration</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {calculTaxeResult.details.map((detail) => (
//                       <TableRow key={detail.annee}>
//                         <TableCell>{detail.annee}</TableCell>
//                         <TableCell>{calculTaxeForm.superficie * calculTaxeForm.taux}</TableCell>
//                         <TableCell>{detail.defautDeclaration}</TableCell>
//                         <TableCell>{detail.taxeTnb}</TableCell>
//                         <TableCell>{detail.penalite}</TableCell>
//                         <TableCell>{detail.majoration}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <Typography variant="subtitle1" mt={2}>Montant total : {calculTaxeResult.montantTotal.toFixed(2)}</Typography>
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseCalculTaxe}>Annuler</Button>
//           <Button onClick={handleCalculerTaxe} variant="contained" color="primary">
//             Calculer
//           </Button>
//         </DialogActions>
//       </Dialog>
//       {/* Dialogue d'alerte */}
//       <Dialog
//         open={openAlertDialog}
//         onClose={handleCloseAlertDialog}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">{alert.severity === 'error' ? "Erreur" : "Information"}</DialogTitle>
//         <DialogContent>
//           <DialogContent>
//             {alert.message}
//           </DialogContent>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseAlertDialog}>OK</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
