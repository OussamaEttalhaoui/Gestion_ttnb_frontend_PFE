import React from 'react';
import {
  Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, TableSortLabel, Toolbar, TablePagination, Chip, InputAdornment, Fade,
  Tooltip, alpha
} from '@mui/material';
import { Edit, Delete, Add, Search, CalendarToday, Person } from '@mui/icons-material';
import RecensementForm from '../components/Recensement_components/RecensementForm';
import RecensementStats from '../components/Recensement_components/RecensementStats'; // ⬅️ Nouveau composant Stats
import { useRecensementLogic } from '../hooks/useRecensementLogic'; // ⬅️ Nouveau Hook

// Fonctions utilitaires du tableau (elles peuvent rester ici ou dans un fichier utils)
function getLabelledNumeroBien(bien) {
  if (!bien) return <Chip label="N/A" size="small" variant="outlined" />;

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

export default function Recensement() {
  const {
    open, selected, search, order, orderBy, alert, openAlertDialog, 
    page, rowsPerPage, 
    paginatedRecensements, stats, totalCount,
    setSearch, handleRequestSort, handleChangePage, handleChangeRowsPerPage,
    handleOpen, handleClose, handleDelete, handleSave, handleCloseAlertDialog,
  } = useRecensementLogic(); // ⬅️ Appel du hook

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* En-tête */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Gestion des Recensements
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Gérez vos redevables et propriétés en toute simplicité
        </Typography>
      </Box>

      {/* Cartes de statistiques (Composant Isolé) */}
      <RecensementStats stats={stats} />

      {/* Barre de recherche et actions */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: 2,
          py: 2,
          px: 3,
          flexWrap: 'wrap'
        }}>
          <TextField
            placeholder="Rechercher par nom, prénom, adresse..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: 350 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.paper'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            Ajouter Redevable/Propriété
          </Button>
        </Toolbar>
      </Paper>

      {/* Tableau */}
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
              <TableRow sx={{ bgcolor: alpha('#1976d2', 0.05) }}>
                {[
                  { id: 'nom', label: 'Nom' },
                  { id: 'prenom', label: 'Prénom' },
                  { id: 'adresse', label: 'Adresse' },
                  { id: 'numero', label: 'Numéro Bien', sortable: false },
                  { id: 'zone', label: 'Zone', sortable: false },
                  { id: 'dateRecensement', label: 'Date Recensement' },
                ].map(column => (
                  <TableCell 
                    key={column.id}
                    sx={{ fontWeight: 700, color: '#1976d2' }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : column.label}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecensements.length > 0 ? (
                paginatedRecensements.map((r, index) => (
                  <Fade in key={r.id} timeout={300 + index * 100}>
                    <TableRow 
                      hover
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha('#1976d2', 0.02),
                          transform: 'scale(1.001)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%',
                              bgcolor: alpha('#1976d2', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Person sx={{ color: '#1976d2' }} />
                          </Box>
                          <Typography fontWeight={600}>{r.debiteur?.nom}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{r.debiteur?.prenom}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {r.bien?.adresse}
                        </Typography>
                      </TableCell>
                      <TableCell>{getLabelledNumeroBien(r.bien)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={r.bien?.zone} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CalendarToday sx={{ fontSize: 16 }} />}
                          label={r.dateRecensement?.slice(0, 10)}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier" arrow>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpen(r)}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha('#1976d2', 0.1),
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
                            onClick={() => handleDelete(r.id)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      Aucun recensement trouvé
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {/* Afficher un message différent si la recherche n'a rien donné */}
                      {search ? "Vérifiez vos critères de recherche." : "Essayez d'ajouter un nouveau recensement."}
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
          count={totalCount} // Utilisez le count filtré
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </Paper>

      {/* Dialog ajout/modification */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          fontSize: '1.5rem',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 2.5
        }}>
          {selected ? 'Modifier Redevable/Propriété' : 'Ajouter Redevable/Propriété'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* Note: RecensementForm doit utiliser handleSave et handleClose en props */}
          <RecensementForm initialValues={selected} onSave={handleSave} onCancel={handleClose} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'alerte */}
      <Dialog
        open={openAlertDialog}
        onClose={handleCloseAlertDialog}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          color: alert.severity === 'error' ? '#d32f2f' : '#1976d2'
        }}>
          {alert.severity === 'error' ? "Erreur" : "Information"}
        </DialogTitle>
        <DialogContent>
          <Typography>{alert.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseAlertDialog}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



// import React, { useEffect, useState } from 'react'
// import {
//   Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TableSortLabel, Toolbar,
//   TablePagination, Alert
// } from '@mui/material'
// import { Edit, Delete, Add, Search } from '@mui/icons-material'
// import RecensementForm from '../components/RecensementForm'
// import fetchWithAuth from '../utils/api';
// import { useAuth } from './Auth'; // Import useAuth


// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1
//   }
//   return 0
// }
// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy)
// }

// function getNumeroBien(bien) {
//   if (!bien) return ''

//   if (bien.numeroTitreFoncier) {
//     return bien.numeroTitreFoncier
//   }
//   if (bien.numeroCertificatPropriete) {
//     return bien.numeroCertificatPropriete
//   }
//   if (bien.numeroInterne) {
//     return bien.numeroInterne
//   }
//   return ''
// }


// function getLabelledNumeroBien(bien) {
//   if (!bien) return null;

//   const badgeStyle = {
//     display: 'inline-block',
//     padding: '6px 12px',
//     borderRadius: '16px',
//     fontWeight: 600,
//     color: 'white',
//     fontSize: '0.85rem',
//   };

//   if (bien.numeroTitreFoncier) {
//     return (
//       <span style={{ ...badgeStyle, backgroundColor: '#2e7d32' }}>
//         Num TF : {bien.numeroTitreFoncier}
//       </span>
//     );
//   }

//   if (bien.numeroCertificatPropriete) {
//     return (
//       <span style={{ ...badgeStyle, backgroundColor: '#ef6c00' }}>
//         Num Req : {bien.numeroCertificatPropriete}
//       </span>
//     );
//   }

//   if (bien.numeroInterne) {
//     return (
//       <span style={{ ...badgeStyle, backgroundColor: '#c62828' }}>
//         Num Int : {bien.numeroInterne}
//       </span>
//     );
//   }

//   return null;
// }





// export default function Recensement() {
//   const [recensements, setRecensements] = useState([])
//   const [open, setOpen] = useState(false)
//   const [selected, setSelected] = useState(null)
//   const [search, setSearch] = useState('')
//   const [order, setOrder] = useState('asc')
//   const [orderBy, setOrderBy] = useState('nom')
//   const { user } = useAuth(); // Use useAuth hook
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' });
//   const [openAlertDialog, setOpenAlertDialog] = useState(false); // State pour contrôler l'ouverture de la boîte de dialogue d'alerte

//   // Pagination
//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(4) // Afficher seulement 4 éléments par page

//   useEffect(() => {
//     const fetchRecensements = async () => {
//       try {
//         const res = await fetchWithAuth('http://localhost:8036/api/recensements');
//         if (res.ok) {
//           const data = await res.json();
//           setRecensements(data);
//         } else if (res.status === 403) {
//           setAlert({ open: true, message: "Vous n'avez pas l'autorisation de lire les recensements.", severity: 'error' });
//           setOpenAlertDialog(true);
//         } else {
//           setAlert({ open: true, message: "Erreur lors de la récupération des recensements.", severity: 'error' });
//           setOpenAlertDialog(true);
//           setRecensements([]);
//         }
//       } catch (error) {
//         console.error(error);
//         setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
//         setOpenAlertDialog(true);
//         setRecensements([]);
//       }
//     };

//     fetchRecensements();
//   }, []);


//   const filtered = recensements.filter(r =>
//     r.debiteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
//     r.debiteur?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
//     r.bien?.adresse?.toLowerCase().includes(search.toLowerCase()) ||
//     getNumeroBien(r.bien).toLowerCase().includes(search.toLowerCase())
//   )

//   // Tri
//   const sorted = [...filtered].sort((a, b) => {
//     let aValue, bValue

//     switch (orderBy) {
//       case 'nom':
//         aValue = a.debiteur?.nom || ''
//         bValue = b.debiteur?.nom || ''
//         break
//       case 'prenom':
//         aValue = a.debiteur?.prenom || ''
//         bValue = b.debiteur?.prenom || ''
//         break
//       case 'adresse':
//         aValue = a.bien?.adresse || ''
//         bValue = b.bien?.adresse || ''
//         break
//       case 'dateRecensement':
//         aValue = a.dateRecensement || ''
//         bValue = b.dateRecensement || ''
//         break
//       default:
//         aValue = ''
//         bValue = ''
//     }
//     if (order === 'asc') return aValue.localeCompare(bValue)
//     else return bValue.localeCompare(aValue)
//   })

//   // Pagination : gestion du changement de page
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage)
//   }

//   // Pagination : gestion du changement du nombre de lignes par page
//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10))
//     setPage(0) // Retourner à la première page lors du changement du nombre de lignes
//   }

//   // Ouvrir le popup pour ajouter/modifier
//   const handleOpen = (recensement = null) => {
//     const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true;
//     const hasCreatePermission = user?.permissions?.includes('CREATE') === true;

//     if (recensement && !hasUpdatePermission) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     if (!recensement && !hasCreatePermission) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     setSelected(recensement)
//     setOpen(true)
//   }

//   const handleClose = () => {
//     setSelected(null)
//     setOpen(false)
//   }

//   // Suppression
//   const handleDelete = async (id) => {
//     const hasDeletePermission = user?.permissions?.includes('DELETE') === true;

//     if (!hasDeletePermission) {
//       setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer ce recensement.", severity: 'error' });
//       setOpenAlertDialog(true);
//       return;
//     }
//     if (window.confirm('Supprimer ce recensement ?')) {
//       try {
//         const res = await fetchWithAuth(`http://localhost:8036/api/recensements/${id}`, { method: 'DELETE' });
//         if (res.ok) {
//           setRecensements(recensements.filter(r => r.id !== id));
//         } else if (res.status === 403) {
//           setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer ce recensement.", severity: 'error' });
//           setOpenAlertDialog(true);
//         } else {
//           setAlert({ open: true, message: "Erreur lors de la suppression du recensement.", severity: 'error' });
//           setOpenAlertDialog(true);
//         }
//       } catch (error) {
//         console.error(error);
//         setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
//         setOpenAlertDialog(true);
//       }
//     }
//   }

//   // Ajout ou modification
//   const handleSave = async (formData) => {
//     const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true;
//     const hasCreatePermission = user?.permissions?.includes('CREATE') === true;

//     if (selected) {
//       if (!hasUpdatePermission) {
//         setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
//         setOpenAlertDialog(true);
//         return;
//       }
//       // Modification
//       try {
//         const res = await fetchWithAuth(`http://localhost:8036/api/recensements/${selected.id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData)
//         });
//         if (res.ok) {
//           const updated = await res.json();
//           setRecensements(recensements.map(r => r.id === selected.id ? updated : r));
//         } else if (res.status === 403) {
//           setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
//           setOpenAlertDialog(true);
//         } else {
//           setAlert({ open: true, message: "Erreur lors de la modification du recensement.", severity: 'error' });
//           setOpenAlertDialog(true);
//         }
//       } catch (error) {
//         console.error(error);
//         setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
//         setOpenAlertDialog(true);
//       }
//     } else {
//       if (!hasCreatePermission) {
//         setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
//         setOpenAlertDialog(true);
//         return;
//       }
//       // Ajout
//       try {
//         const res = await fetchWithAuth('http://localhost:8036/api/recensements', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(formData)
//         });
//         if (res.ok) {
//           const newRecensement = await res.json();
//           setRecensements([...recensements, newRecensement]);
//         } else if (res.status === 403) {
//           setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
//           setOpenAlertDialog(true);
//         } else {
//           setAlert({ open: true, message: "Erreur lors de la création du recensement.", severity: 'error' });
//           setOpenAlertDialog(true);
//         }
//       } catch (error) {
//         console.error(error);
//         setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
//         setOpenAlertDialog(true);
//       }
//     }
//     handleClose()
//   }

//   // Gestion du tri
//   const handleRequestSort = (property) => {
//     const isAsc = orderBy === property && order === 'asc'
//     setOrder(isAsc ? 'desc' : 'asc')
//     setOrderBy(property)
//   }

//   const handleCloseAlertDialog = () => {
//     setOpenAlertDialog(false);
//     setAlert({ ...alert, open: false });
//   };


//   return (
//     <Box className="p-4">
//       <Typography variant="h4" className="mb-4 font-bold text-blue-700">Recensements</Typography>
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
//           <Button
//             variant="contained"
//             startIcon={<Add />}
//             color="primary"
//             onClick={() => handleOpen()}
//             sx={{ borderRadius: 2 }}
//           >
//             Ajouter Redevable/Propriété
//           </Button>
//         </Toolbar>
//       </Paper>
//       <TableContainer component={Paper} className="shadow-lg">
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell sortDirection={orderBy === 'nom' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'nom'}
//                   direction={orderBy === 'nom' ? order : 'asc'}
//                   onClick={() => handleRequestSort('nom')}
//                 >
//                   Nom
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sortDirection={orderBy === 'prenom' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'prenom'}
//                   direction={orderBy === 'prenom' ? order : 'asc'}
//                   onClick={() => handleRequestSort('prenom')}
//                 >
//                   Prénom
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell sortDirection={orderBy === 'adresse' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'adresse'}
//                   direction={orderBy === 'adresse' ? order : 'asc'}
//                   onClick={() => handleRequestSort('adresse')}
//                 >
//                   Adresse
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell>Numéro Bien</TableCell>
//               <TableCell>Zone</TableCell>
//               <TableCell sortDirection={orderBy === 'dateRecensement' ? order : false}>
//                 <TableSortLabel
//                   active={orderBy === 'dateRecensement'}
//                   direction={orderBy === 'dateRecensement' ? order : 'asc'}
//                   onClick={() => handleRequestSort('dateRecensement')}
//                 >
//                   Date Recensement
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell align="right">Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {sorted
//               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Pagination : afficher seulement les éléments de la page courante
//               .map(r => (
//                 <TableRow key={r.id}>
//                   <TableCell>{r.debiteur?.nom}</TableCell>
//                   <TableCell>{r.debiteur?.prenom}</TableCell>
//                   <TableCell>{r.bien?.adresse}</TableCell>
//                   <TableCell>{getLabelledNumeroBien(r.bien)}</TableCell>
//                   <TableCell>{r.bien?.zone}</TableCell>
//                   <TableCell>{r.dateRecensement?.slice(0, 10)}</TableCell>
//                   <TableCell align="right">
//                     <IconButton color="primary" onClick={() => handleOpen(r)}><Edit /></IconButton>
//                     <IconButton color="error" onClick={() => handleDelete(r.id)}><Delete /></IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             {sorted.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={5} align="center">Aucun recensement trouvé</TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Pagination */}
//       <TablePagination
//         rowsPerPageOptions={[4, 8, 12]} // Options pour le nombre de lignes par page
//         component="div"
//         count={sorted.length} // Nombre total d'éléments
//         rowsPerPage={rowsPerPage} // Nombre d'éléments par page
//         page={page} // Page actuelle
//         onPageChange={handleChangePage} // Fonction pour gérer le changement de page
//         onRowsPerPageChange={handleChangeRowsPerPage} // Fonction pour gérer le changement du nombre de lignes par page
//         labelRowsPerPage="Lignes par page:"
//         labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
//       />

//       {/* Popup ajout/modification */}
//       <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//         {/* <DialogTitle>{selected ? 'Modifier le recensement' : 'Ajouter un recensement'}</DialogTitle> */}
//         <DialogTitle>{selected ? 'Modifier Redevable/Propiété' : 'Ajouter Redevable/Propiété'}</DialogTitle>
//         <DialogContent>
//           <RecensementForm initialValues={selected} onSave={handleSave} onCancel={handleClose} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Annuler</Button>
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
//   )
// }

