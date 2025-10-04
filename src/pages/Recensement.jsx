import React, { useEffect, useState } from 'react'
import {
  Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TableSortLabel, Toolbar,
  TablePagination, Alert
} from '@mui/material'
import { Edit, Delete, Add, Search } from '@mui/icons-material'
import RecensementForm from '../components/RecensementForm'
import fetchWithAuth from '../utils/api';
import { useAuth } from './Auth'; // Import useAuth


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function getNumeroBien(bien) {
  if (!bien) return ''

  if (bien.numeroTitreFoncier) {
    return bien.numeroTitreFoncier
  }
  if (bien.numeroCertificatPropriete) {
    return bien.numeroCertificatPropriete
  }
  if (bien.numeroInterne) {
    return bien.numeroInterne
  }
  return ''
}


function getLabelledNumeroBien(bien) {
  if (!bien) return null

  if (bien.numeroTitreFoncier) {
    return (
      <span>
        <span style={{ color: 'green' }}>Num TF :</span> {bien.numeroTitreFoncier}
      </span>
    )
  }
  if (bien.numeroCertificatPropriete) {
    return (
      <span>
        <span style={{ color: 'orange' }}>Num Req :</span> {bien.numeroCertificatPropriete}
      </span>
    )
  }
  if (bien.numeroInterne) {
    return (
      <span>
        <span style={{ color: 'red' }}>Num Int :</span> {bien.numeroInterne}
      </span>
    )
  }
  return null
}



export default function Recensement() {
  const [recensements, setRecensements] = useState([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('nom')
  const { user } = useAuth(); // Use useAuth hook
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' });
  const [openAlertDialog, setOpenAlertDialog] = useState(false); // State pour contrôler l'ouverture de la boîte de dialogue d'alerte

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(4) // Afficher seulement 4 éléments par page

  useEffect(() => {
    const fetchRecensements = async () => {
      try {
        const res = await fetchWithAuth('http://localhost:8036/api/recensements');
        if (res.ok) {
          const data = await res.json();
          setRecensements(data);
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de lire les recensements.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la récupération des recensements.", severity: 'error' });
          setOpenAlertDialog(true);
          setRecensements([]);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
        setRecensements([]);
      }
    };

    fetchRecensements();
  }, []);


  const filtered = recensements.filter(r =>
    r.debiteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    r.debiteur?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    r.bien?.adresse?.toLowerCase().includes(search.toLowerCase()) ||
    getNumeroBien(r.bien).toLowerCase().includes(search.toLowerCase())
  )

  // Tri
  const sorted = [...filtered].sort((a, b) => {
    let aValue, bValue

    switch (orderBy) {
      case 'nom':
        aValue = a.debiteur?.nom || ''
        bValue = b.debiteur?.nom || ''
        break
      case 'prenom':
        aValue = a.debiteur?.prenom || ''
        bValue = b.debiteur?.prenom || ''
        break
      case 'adresse':
        aValue = a.bien?.adresse || ''
        bValue = b.bien?.adresse || ''
        break
      case 'dateRecensement':
        aValue = a.dateRecensement || ''
        bValue = b.dateRecensement || ''
        break
      default:
        aValue = ''
        bValue = ''
    }
    if (order === 'asc') return aValue.localeCompare(bValue)
    else return bValue.localeCompare(aValue)
  })

  // Pagination : gestion du changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // Pagination : gestion du changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // Retourner à la première page lors du changement du nombre de lignes
  }

  // Ouvrir le popup pour ajouter/modifier
  const handleOpen = (recensement = null) => {
    const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true;
    const hasCreatePermission = user?.permissions?.includes('CREATE') === true;

    if (recensement && !hasUpdatePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    if (!recensement && !hasCreatePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    setSelected(recensement)
    setOpen(true)
  }

  const handleClose = () => {
    setSelected(null)
    setOpen(false)
  }

  // Suppression
  const handleDelete = async (id) => {
    const hasDeletePermission = user?.permissions?.includes('DELETE') === true;

    if (!hasDeletePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer ce recensement.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    if (window.confirm('Supprimer ce recensement ?')) {
      try {
        const res = await fetchWithAuth(`http://localhost:8036/api/recensements/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setRecensements(recensements.filter(r => r.id !== id));
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer ce recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la suppression du recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
      }
    }
  }

  // Ajout ou modification
  const handleSave = async (formData) => {
    const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true;
    const hasCreatePermission = user?.permissions?.includes('CREATE') === true;

    if (selected) {
      if (!hasUpdatePermission) {
        setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
        setOpenAlertDialog(true);
        return;
      }
      // Modification
      try {
        const res = await fetchWithAuth(`http://localhost:8036/api/recensements/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setRecensements(recensements.map(r => r.id === selected.id ? updated : r));
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la modification du recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
      }
    } else {
      if (!hasCreatePermission) {
        setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
        setOpenAlertDialog(true);
        return;
      }
      // Ajout
      try {
        const res = await fetchWithAuth('http://localhost:8036/api/recensements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const newRecensement = await res.json();
          setRecensements([...recensements, newRecensement]);
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la création du recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
      }
    }
    handleClose()
  }

  // Gestion du tri
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleCloseAlertDialog = () => {
    setOpenAlertDialog(false);
    setAlert({ ...alert, open: false });
  };


  return (
    <Box className="p-4">
      <Typography variant="h4" className="mb-4 font-bold text-blue-700">Recensements</Typography>
      <Paper sx={{ mb: 2, mt: 3 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Search color="action" />
            <TextField
              label="Recherche"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
            onClick={() => handleOpen()}
            sx={{ borderRadius: 2 }}
          >
            Ajouter Redevable/Propriété
          </Button>
        </Toolbar>
      </Paper>
      <TableContainer component={Paper} className="shadow-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'nom' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'nom'}
                  direction={orderBy === 'nom' ? order : 'asc'}
                  onClick={() => handleRequestSort('nom')}
                >
                  Nom
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'prenom' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'prenom'}
                  direction={orderBy === 'prenom' ? order : 'asc'}
                  onClick={() => handleRequestSort('prenom')}
                >
                  Prénom
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'adresse' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'adresse'}
                  direction={orderBy === 'adresse' ? order : 'asc'}
                  onClick={() => handleRequestSort('adresse')}
                >
                  Adresse
                </TableSortLabel>
              </TableCell>
              <TableCell>Numéro Bien</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell sortDirection={orderBy === 'dateRecensement' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'dateRecensement'}
                  direction={orderBy === 'dateRecensement' ? order : 'asc'}
                  onClick={() => handleRequestSort('dateRecensement')}
                >
                  Date Recensement
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Pagination : afficher seulement les éléments de la page courante
              .map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.debiteur?.nom}</TableCell>
                  <TableCell>{r.debiteur?.prenom}</TableCell>
                  <TableCell>{r.bien?.adresse}</TableCell>
                  <TableCell>{getLabelledNumeroBien(r.bien)}</TableCell>
                  <TableCell>{r.bien?.zone}</TableCell>
                  <TableCell>{r.dateRecensement?.slice(0, 10)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(r)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(r.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">Aucun recensement trouvé</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[4, 8, 12]} // Options pour le nombre de lignes par page
        component="div"
        count={sorted.length} // Nombre total d'éléments
        rowsPerPage={rowsPerPage} // Nombre d'éléments par page
        page={page} // Page actuelle
        onPageChange={handleChangePage} // Fonction pour gérer le changement de page
        onRowsPerPageChange={handleChangeRowsPerPage} // Fonction pour gérer le changement du nombre de lignes par page
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />

      {/* Popup ajout/modification */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        {/* <DialogTitle>{selected ? 'Modifier le recensement' : 'Ajouter un recensement'}</DialogTitle> */}
        <DialogTitle>{selected ? 'Modifier Redevable/Propiété' : 'Ajouter Redevable/Propiété'}</DialogTitle>
        <DialogContent>
          <RecensementForm initialValues={selected} onSave={handleSave} onCancel={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'alerte */}
      <Dialog
        open={openAlertDialog}
        onClose={handleCloseAlertDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{alert.severity === 'error' ? "Erreur" : "Information"}</DialogTitle>
        <DialogContent>
          <DialogContent>
            {alert.message}
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlertDialog}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}


// import React, { useEffect, useState } from 'react'
// import {
//   Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TableSortLabel, Toolbar,
//   TablePagination
// } from '@mui/material'
// import { Edit, Delete, Add, Search } from '@mui/icons-material'
// import RecensementForm from '../components/RecensementForm'
// import fetchWithAuth from '../utils/api';


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
//   if (!bien) return null

//   if (bien.numeroTitreFoncier) {
//     return (
//       <span>
//         <span style={{ color: 'green' }}>Num TF :</span> {bien.numeroTitreFoncier}
//       </span>
//     )
//   }
//   if (bien.numeroCertificatPropriete) {
//     return (
//       <span>
//         <span style={{ color: 'orange' }}>Num Req :</span> {bien.numeroCertificatPropriete}
//       </span>
//     )
//   }
//   if (bien.numeroInterne) {
//     return (
//       <span>
//         <span style={{ color: 'red' }}>Num Int :</span> {bien.numeroInterne}
//       </span>
//     )
//   }
//   return null
// }



// export default function Recensement() {
//   const [recensements, setRecensements] = useState([])
//   const [open, setOpen] = useState(false)
//   const [selected, setSelected] = useState(null)
//   const [search, setSearch] = useState('')
//   const [order, setOrder] = useState('asc')
//   const [orderBy, setOrderBy] = useState('nom')

//   // Pagination
//   const [page, setPage] = useState(0)
//   const [rowsPerPage, setRowsPerPage] = useState(4) // Afficher seulement 4 éléments par page

//   useEffect(() => {
//     fetchWithAuth('http://localhost:8036/api/recensements')
//       .then(res => res.json())
//       .then(data => setRecensements(data))
//       .catch(() => setRecensements([]))
//   }, [])


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
//     setSelected(recensement)
//     setOpen(true)
//   }

//   const handleClose = () => {
//     setSelected(null)
//     setOpen(false)
//   }

//   // Suppression
//   const handleDelete = async (id) => {
//     if (window.confirm('Supprimer ce recensement ?')) {
//       await fetchWithAuth(`http://localhost:8036/api/recensements/${id}`, { method: 'DELETE' })
//       setRecensements(recensements.filter(r => r.id !== id))
//     }
//   }

//   // Ajout ou modification
//   const handleSave = async (formData) => {
//     if (selected) {
//       // Modification
//       const res = await fetchWithAuth(`http://localhost:8036/api/recensements/${selected.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })
//       const updated = await res.json()
//       setRecensements(recensements.map(r => r.id === selected.id ? updated : r))
//     } else {
//       // Ajout
//       const res = await fetchWithAuth('http://localhost:8036/api/recensements', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })
//       const newRecensement = await res.json()
//       setRecensements([...recensements, newRecensement])
//     }
//     handleClose()
//   }

//   // Gestion du tri
//   const handleRequestSort = (property) => {
//     const isAsc = orderBy === property && order === 'asc'
//     setOrder(isAsc ? 'desc' : 'asc')
//     setOrderBy(property)
//   }



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
//     </Box>
//   )
// }