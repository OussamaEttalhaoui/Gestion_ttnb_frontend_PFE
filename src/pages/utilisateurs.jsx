import React, { useState } from 'react';
import {
  Paper, Box, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Toolbar, TableSortLabel, TablePagination, 
  InputAdornment, Tooltip, alpha, Chip, Fade, Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, Person } from '@mui/icons-material';
import { useAuth } from './Auth'; 
import { useUserManagement } from '../hooks/useUserManagement'; 
import { UserFormDialog } from '../components/UserFormDialog'; 

// ------------------------- UTILS -------------------------

function descendingComparator(a, b, orderBy) { /* ... inchangé ... */
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) { /* ... inchangé ... */
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) { /* ... inchangé ... */
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

// ------------------------- COMPOSANT PRINCIPAL -------------------------

export default function Utilisateurs() {
  const { user } = useAuth();
  
  // ⬅️ Récupération de toute la logique et de l'état du hook
  const {
    users, form, error, successMessage, openDialog, isEditMode, search, 
    setSearch, handleSubmit, handleDelete, handleChange, handlePermissionChange, 
    handleCloseDialog, handleOpenAddDialog, handleEdit
  } = useUserManagement();

  // États locaux pour le tri et la pagination
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nom');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8); 

  // Handlers locaux pour le tri et la pagination
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

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const searchTerm = search.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(searchTerm) ||
      user.prenom?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.telephone?.toLowerCase().includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchTerm)
    );
  });

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 400 }}>
          <Typography variant="h6" color="error" fontWeight={700}>Accès non autorisé</Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>Seuls les administrateurs peuvent gérer les utilisateurs.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* En-tête (inchangé) */}
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
          Gestion des Utilisateurs
        </Typography>
      </Box>

      {/* Messages d'alerte */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

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
            placeholder="Rechercher par nom, email, rôle..."
            value={search}
            onChange={e => setSearch(e.target.value)} // Appel au setter du hook
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
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog} 
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
            Ajouter un utilisateur
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
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={{ fontWeight: 700, color: '#1976d2' }}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                      sx={{
                        '&.MuiTableSortLabel-root': { color: '#1976d2' },
                        '&.Mui-active': { color: '#1976d2' },
                        '& .MuiTableSortLabel-icon': { color: '#1976d2 !important' }
                      }}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(filteredUsers, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => (
                  <Fade in key={user.id} timeout={300 + index * 50}>
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
                          <Typography fontWeight={600}>{user.nom}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.prenom}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.telephone}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'ADMIN' ? 'error' : 'primary'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier" arrow>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(user)} // Appel au handler du hook
                            aria-label="Modifier"
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha('#1976d2', 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer" arrow>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(user.id)} // Appel au handler du hook
                            aria-label="Supprimer"
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha('#d32f2f', 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      Aucun utilisateur trouvé
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Vérifiez votre recherche ou ajoutez un nouvel utilisateur
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </Paper>

      {/* ⬅️ Appel du composant Dialogue (UserFormDialog) */}
      <UserFormDialog
        open={openDialog}
        isEditMode={isEditMode}
        form={form}
        error={error}
        handleChange={handleChange}
        handlePermissionChange={handlePermissionChange}
        handleCloseDialog={handleCloseDialog}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
}
