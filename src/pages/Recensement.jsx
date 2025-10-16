import React from 'react';
import {
  Paper, Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, TableSortLabel, Toolbar, TablePagination, Chip, InputAdornment, Fade,
  Tooltip, alpha
} from '@mui/material';
import { Edit, Delete, Add, Search, CalendarToday, Person } from '@mui/icons-material';
import RecensementForm from '../components/Recensement_components/RecensementForm';
import RecensementStats from '../components/Recensement_components/RecensementStats'; 
import { useRecensementLogic } from '../hooks/useRecensementLogic'; 
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
