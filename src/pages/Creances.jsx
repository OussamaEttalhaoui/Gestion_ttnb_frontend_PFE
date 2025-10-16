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
