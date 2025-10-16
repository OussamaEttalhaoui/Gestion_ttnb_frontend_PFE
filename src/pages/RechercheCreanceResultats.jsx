import React, { useState } from 'react';
import {
  Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button,
  TableSortLabel, alpha, Chip, Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';

dayjs.locale('fr');

// Styles cohérents avec le thème bleu/épuré
const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

function descendingComparator(a, b, orderBy) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Gestion des valeurs nulles ou undefined
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  // Tri spécifique pour les dates
  if (orderBy === 'dateConstatation') {
    const dateA = aValue ? dayjs(aValue) : null;
    const dateB = bValue ? dayjs(bValue) : null;

    if (dateA && dateB) {
      if (dateA.isBefore(dateB)) return 1; // Inversé pour descending
      if (dateA.isAfter(dateB)) return -1; // Inversé pour descending
      return 0;
    }
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    return 0;
  }

  // Tri spécifique pour les nombres (montantTotal, anneeImposition)
  if (orderBy === 'montantTotal' || orderBy === 'anneeImposition') {
    const numA = Number(aValue) || 0;
    const numB = Number(bValue) || 0;
    return numB - numA; // Descending order pour les nombres
  }

  // Tri par défaut (alphanumérique) - convertir en string pour éviter les erreurs
  const strA = String(aValue || '').toLowerCase();
  const strB = String(bValue || '').toLowerCase();
  
  return strB.localeCompare(strA); // Descending order pour les strings
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Fonction utilitaire pour stabiliser le tri
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Maintient l'ordre original en cas d'égalité
  });
  return stabilizedThis.map((el) => el[0]);
}

// RETRAIT de la colonne 'actions' de la liste des entêtes
const headCells = [
  { id: 'numeroBV', label: 'Num BV' },
  { id: 'typeFoncier', label: 'Type Foncier' }, // Raccourcissement du label
  { id: 'referenceBien', label: 'Réf. Bien' }, // Raccourcissement du label
  { id: 'principale', label: 'Princ.' }, // Raccourcissement du label
  { id: 'montantTotal', label: 'Montant Total' }, // Raccourcissement du label
  { id: 'anneeImposition', label: 'Année Imposition' }, // Raccourcissement du label
  { id: 'tiers', label: 'Tiers' },
  { id: 'cin', label: 'CIN' },
  { id: 'etat', label: 'État' },
  { id: 'dateConstatation', label: 'Date État' },
];

// Styles personnalisés pour les cellules du tableau
const tableCellBaseStyle = {
    p: '6px', 
    fontSize: '0.75rem',
};

// Style pour les cellules d'en-tête (permet le saut de ligne)
const tableHeadCellStyle = {
    ...tableCellBaseStyle,
    fontWeight: 700,
    color: primaryColor,
    // Permet le saut de ligne si le titre est trop long
    whiteSpace: 'normal', 
    lineHeight: 1.2, 
};

// Fonction d'aide pour la coloration des jetons d'état
const getStatusChip = (etat) => {
  let color = 'default';
  let label = etat;
  switch (etat) {
    case 'SOLDEE':
    case 'SOLDEE_PAR_INTERNET':
      color = 'success';
      label = etat.replace('_PAR_INTERNET', ' Internet');
      break;
    case 'VALIDEE':
      color = 'primary';
      break;
    default:
      color = 'default';
  }
  return <Chip label={label} size="small" color={color} sx={{ fontWeight: 600, fontSize: '0.7rem' }} />;
};

const RechercheCreanceResultats = () => {
  const resultats = JSON.parse(localStorage.getItem('rechercheCreanceResultats')) || [];
  const navigate = useNavigate();

  const [order, setOrder] = useState('desc'); // Tri initial par montant descendant
  const [orderBy, setOrderBy] = useState('montantTotal');

  const handleCreanceClick = (creance) => {
    // Fonction qui navigue vers la page de détails
    navigate(`/creance-details/${creance.id}`);
  };

  const handleDownloadExcel = () => {
    const sortedData = stableSort(resultats, getComparator(order, orderBy));
    const data = sortedData.map(creance => ({
      'Num BV': creance.numeroBV,
      'Type Foncier': creance.typeFoncier,
      'Réf. Bien': creance.referenceBien,
      'Principale': creance.principale,
      'Montant Total': creance.montantTotal,
      "Année Imposition": creance.anneeImposition,
      'Tiers': creance.tiers,
      'CIN': creance.cin,
      'État': creance.etat,
      'Date État': creance.dateConstatation ? dayjs(creance.dateConstatation).format('DD/MM/YYYY') : '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Résultats Recherche Créances');
    XLSX.writeFile(wb, 'resultats_recherche_creances.xlsx');
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedResultats = React.useMemo(() => {
    return stableSort(resultats, getComparator(order, orderBy));
  }, [resultats, order, orderBy]);
  
  // Formatage du montant en devise (ex: 1 234,56 MAD)
  const formatMontant = (montant) => {
    if (montant == null) return '';
    return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(montant);
  };

  // Styles pour les cellules du corps du tableau (Data)
  const getBodyCellStyle = (headCellId) => {
      // Pour les petites colonnes importantes, on force le "nowrap"
      const nowrapColumns = ['numeroBV', 'cin', 'dateConstatation'];
      // Pour les colonnes numériques, on aligne à droite et on garde le nowrap
      const numericColumns = ['principale', 'montantTotal', 'anneeImposition'];

      return {
          ...tableCellBaseStyle,
          whiteSpace: nowrapColumns.includes(headCellId) || numericColumns.includes(headCellId) ? 'nowrap' : 'normal',
      };
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* En-tête et actions */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Résultats de la recherche de créances
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadExcel}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(primaryColor, 0.4)}`,
              background: `linear-gradient(135deg, #1565c0 0%, ${primaryColor} 100%)`,
            }
          }}
        >
          Télécharger en Excel
        </Button>
      </Box>
      
      {/* Affichage des résultats */}
      {resultats.length > 0 ? (
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 3, 
            // Important: retire overflowX pour forcer l'ajustement
            overflow: 'hidden', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <TableContainer>
            {/* Retrait de minWidth sur la table pour laisser le navigateur ajuster au mieux */}
            <Table size="small"> 
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={['principale', 'montantTotal', 'anneeImposition'].includes(headCell.id) ? 'right' : 'left'}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={tableHeadCellStyle} // Application du nouveau style d'en-tête
                    >
                      {headCell.disableSorting ? (
                        headCell.label
                      ) : (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(headCell.id)}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: primaryColor },
                            '&.Mui-active': { color: primaryColor },
                            '& .MuiTableSortLabel-icon': { color: `${primaryColor} !important` },
                            // Assurer que le label du tri peut s'enrouler
                            '& .MuiTableSortLabel-root, .MuiTableSortLabel-root.Mui-active': { whiteSpace: 'normal' }
                          }}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResultats.map((creance, index) => (
                  <Fade in key={`${creance.numeroBV}-${index}`} timeout={300 + index * 50}>
                    <TableRow
                      hover
                      onClick={() => handleCreanceClick(creance)}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: alpha(primaryColor, 0.05),
                          transform: 'scale(1.001)'
                        },
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={getBodyCellStyle('numeroBV')}>{creance.numeroBV}</TableCell>
                      <TableCell sx={getBodyCellStyle('typeFoncier')}>{creance.typeFoncier}</TableCell>
                      {/* La référence du bien est autorisée à s'enrouler si elle est longue */}
                      <TableCell sx={getBodyCellStyle('referenceBien')}>{creance.referenceBien}</TableCell>
                      <TableCell align="right" sx={getBodyCellStyle('principale')}>{creance.principale}</TableCell>
                      <TableCell align="right" sx={{ ...getBodyCellStyle('montantTotal'), fontWeight: 600 }}>
                        {formatMontant(creance.montantTotal)}
                      </TableCell>
                      <TableCell align="right" sx={getBodyCellStyle('anneeImposition')}>{creance.anneeImposition}</TableCell>
                      <TableCell sx={getBodyCellStyle('tiers')}>{creance.tiers}</TableCell>
                      <TableCell sx={getBodyCellStyle('cin')}>{creance.cin}</TableCell>
                      <TableCell sx={getBodyCellStyle('etat')}>
                        {getStatusChip(creance.etat)}
                      </TableCell>
                      <TableCell sx={getBodyCellStyle('dateConstatation')}>
                        {creance.dateConstatation ? dayjs(creance.dateConstatation).format('DD/MM/YYYY') : '-'}
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Aucun résultat trouvé.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Veuillez ajuster vos critères de recherche.
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 3, borderRadius: 2, textTransform: 'none' }}
            onClick={() => navigate('/')} 
          >
            Retourner à la recherche
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default RechercheCreanceResultats;
