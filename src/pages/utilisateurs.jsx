import React, { useState, useEffect } from 'react';
import {
  Paper, Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  Grid, FormControl, InputLabel, Select, MenuItem, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, Toolbar, TableSortLabel,
  TablePagination, Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import fetchWithAuth from '../utils/api';
import { useAuth } from './Auth';

const permissionsList = ["CREATE", "READ", "UPDATE", "DELETE"];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'nom', label: 'Nom' },
  { id: 'prenom', label: 'Prénom' },
  { id: 'email', label: 'Email' },
  { id: 'telephone', label: 'Téléphone' },
  { id: 'role', label: 'Rôle' },
];

export default function Utilisateurs() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    roleName: 'USER',
    permissions: [],
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nom');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      console.warn("Accès non autorisé : L'utilisateur n'est pas un administrateur.");
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchWithAuth('http://localhost:8036/api/utilisateurs');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          console.error('Erreur lors de la récupération des utilisateurs');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => {
      const newPermissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value);
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const url = isEditMode ? `http://localhost:8036/api/utilisateurs/${selectedUserId}` : 'http://localhost:8036/auth/register';
      const method = isEditMode ? 'PUT' : 'POST';

      const requestBody = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse,
        telephone: form.telephone,
        roleName: form.roleName,
        permissions: form.permissions,
      };

      const res = await fetchWithAuth(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData?.message || 'Erreur lors de l\'enregistrement';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const action = isEditMode ? 'modifié' : 'créé';
      setSuccessMessage(`L'utilisateur ${form.nom} ${form.prenom} a été ${action} avec succès!`);
      setForm({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        telephone: '',
        roleName: 'USER',
        permissions: [],
      });
      handleCloseDialog();
      
      const fetchUsers = async () => {
        try {
          const res = await fetchWithAuth('http://localhost:8036/api/utilisateurs');
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          } else {
            console.error('Erreur lors de la récupération des utilisateurs');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
      };
      fetchUsers();
    } catch (error) {
      console.error(error);
      setError(error.message || 'Erreur lors de la création de l\'utilisateur.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const userToDelete = users.find(user => user.id === id);
      if (!userToDelete) {
        setError("Utilisateur non trouvé.");
        return;
      }
      const res = await fetchWithAuth(`http://localhost:8036/api/utilisateurs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData?.message || 'Erreur lors de la suppression';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      setSuccessMessage(`L'utilisateur ${userToDelete.nom} ${userToDelete.prenom} a été supprimé avec succès!`);
      
      const fetchUsers = async () => {
        try {
          const res = await fetchWithAuth('http://localhost:8036/api/utilisateurs');
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          } else {
            console.error('Erreur lors de la récupération des utilisateurs');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des utilisateurs:', error);
        }
      };
      fetchUsers();
    } catch (error) {
      console.error(error);
      setError(error.message || 'Erreur lors de la suppression de l\'utilisateur.');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditMode(false);
    setSelectedUserId(null);
    setForm({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      telephone: '',
      roleName: 'USER',
      permissions: [],
    });
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    setForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      roleName: user.role,
      permissions: user.permissions ? user.permissions.map(p => p.name) : [],
    });
    handleOpenDialog();
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user => {
    const searchTerm = search.toLowerCase();
    return (
      user.nom.toLowerCase().includes(searchTerm) ||
      user.prenom.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.telephone.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  });

  if (!user || user.role !== 'ADMIN') {
    return <Typography variant="h6">Accès non autorisé.</Typography>;
  }

  return (
    <Box className="p-4">
      <Typography variant="h4" className="mb-4 font-bold text-blue-700">
        Gestion des utilisateurs
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Paper sx={{ mb: 2, mt: 3  }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon color="action" />
            <TextField
              label="Rechercher un utilisateur"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleOpenDialog}
            sx={{ borderRadius: 2 }}
          >
            Ajouter un utilisateur
          </Button>
        </Toolbar>
      </Paper>

      <TableContainer component={Paper} className="shadow-lg">
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stableSort(filteredUsers, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nom}</TableCell>
                  <TableCell>{user.prenom}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telephone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(user)} aria-label="Modifier">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(user.id)} aria-label="Supprimer">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ padding: '16px' }}>
          <Typography variant="h6" fontWeight="bold" color="#333">
            {isEditMode ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Prénom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mot de passe"
                  type="password"
                  name="motDePasse"
                  value={form.motDePasse}
                  onChange={handleChange}
                  fullWidth
                  required={!isEditMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Téléphone"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="role-label">Rôle</InputLabel>
                  <Select
                    labelId="role-label"
                    id="roleName"
                    name="roleName"
                    value={form.roleName}
                    onChange={handleChange}
                    label="Rôle"
                  >
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  Permissions
                </Typography>
                <Grid container spacing={2}>
                  {permissionsList.map((permission) => (
                    <Grid item xs={12} sm={6} md={3} key={permission}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            value={permission}
                            checked={form.permissions.includes(permission)}
                            onChange={handlePermissionChange}
                            name={permission}
                          />
                        }
                        label={permission}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ mr: 1 }}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
            {isEditMode ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// import React, { useState, useEffect } from 'react';
// import {
//   Paper, Box, Typography, TextField, Button, Checkbox, FormControlLabel,
//   Grid, FormControl, InputLabel, Select, MenuItem, ListItemText, Alert
// } from '@mui/material';
// import fetchWithAuth from '../utils/api';
// import { useAuth } from './Auth';

// const permissionsList = ["CREATE", "READ", "UPDATE", "DELETE"];

// export default function Utilisateurs() {
//   const [form, setForm] = useState({
//     nom: '',
//     prenom: '',
//     email: '',
//     motDePasse: '',
//     telephone: '',
//     roleName: 'USER',
//     permissions: [],
//   });
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const { user } = useAuth();

//   useEffect(() => {
//     // Vérifier si l'utilisateur est un administrateur
//     if (user && user.role !== 'ADMIN') {
//       // Rediriger ou afficher un message d'erreur si l'utilisateur n'est pas autorisé
//       console.warn("Accès non autorisé : L'utilisateur n'est pas un administrateur.");
//       // Vous pouvez également rediriger l'utilisateur vers une autre page ici
//     }
//   }, [user]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handlePermissionChange = (e) => {
//     const { value, checked } = e.target;
//     setForm(prev => {
//       const newPermissions = checked
//         ? [...prev.permissions, value]
//         : prev.permissions.filter(p => p !== value);
//       return { ...prev, permissions: newPermissions };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMessage(null);
//     try {
//       const res = await fetchWithAuth('http://localhost:8036/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) {
//         const errorData = await res.json();
//         const errorMessage = errorData?.message || 'Erreur lors de l\'enregistrement';
//         setError(errorMessage);
//         throw new Error(errorMessage);
//       }
//       setSuccessMessage('Utilisateur créé avec succès!');
//       setForm({
//         nom: '',
//         prenom: '',
//         email: '',
//         motDePasse: '',
//         telephone: '',
//         roleName: 'USER',
//         permissions: [],
//       }); // Réinitialiser le formulaire
//     } catch (error) {
//       console.error(error);
//       setError(error.message || 'Erreur lors de la création de l\'utilisateur.');
//     }
//   };

//   if (!user || user.role !== 'ADMIN') {
//     return <Typography variant="h6">Accès non autorisé.</Typography>;
//   }

//   return (
//     <Box className="p-4">
//       <Typography variant="h4" className="mb-6 font-bold text-blue-700">
//         Gestion des utilisateurs
//       </Typography>
//       <Paper sx={{ p: 3 }}>
//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}
//         {successMessage && (
//           <Alert severity="success" sx={{ mb: 2 }}>
//             {successMessage}
//           </Alert>
//         )}
//         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Nom"
//                 name="nom"
//                 value={form.nom}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Prénom"
//                 name="prenom"
//                 value={form.prenom}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 label="Email"
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 label="Mot de passe"
//                 type="password"
//                 name="motDePasse"
//                 value={form.motDePasse}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 label="Téléphone"
//                 name="telephone"
//                 value={form.telephone}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <FormControl fullWidth>
//                 <InputLabel id="role-label">Rôle</InputLabel>
//                 <Select
//                   labelId="role-label"
//                   id="roleName"
//                   name="roleName"
//                   value={form.roleName}
//                   onChange={handleChange}
//                   label="Rôle"
//                 >
//                   <MenuItem value="USER">USER</MenuItem>
//                   <MenuItem value="ADMIN">ADMIN</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12}>
//               <Typography>Permissions:</Typography>
//               <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                 {permissionsList.map((permission) => (
//                   <FormControlLabel
//                     key={permission}
//                     control={
//                       <Checkbox
//                         value={permission}
//                         checked={form.permissions.includes(permission)}
//                         onChange={handlePermissionChange}
//                         name={permission}
//                       />
//                     }
//                     label={permission}
//                   />
//                 ))}
//               </Box>
//             </Grid>
//             <Grid item xs={12}>
//               <Button type="submit" variant="contained" color="primary">
//                 Créer un utilisateur
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }