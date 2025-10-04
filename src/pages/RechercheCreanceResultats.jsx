import React, { useState } from 'react';
import {
  Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button,
  TableSortLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

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

const RechercheCreanceResultats = () => {
  const resultats = JSON.parse(localStorage.getItem('rechercheCreanceResultats')) || [];
  const navigate = useNavigate();

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('numeroBV');

  const handleCreanceClick = (creance) => {
    navigate(`/creance-details/${creance.id}`);
  };

  const handleDownloadExcel = () => {
    const sortedData = stableSort(resultats, getComparator(order, orderBy));
    const data = sortedData.map(creance => ({
      'Num BV': creance.numeroBV,
      'Types Foncier': creance.typeFoncier,
      'Référence du bien': creance.referenceBien,
      'Principale': creance.principale,
      'Montant total': creance.montantTotal,
      "Année d'imposition": creance.anneeImposition,
      'Tiers': creance.tiers,
      'CIN': creance.cin,
      'État': creance.etat,
      'Date Etat': creance.dateConstatation ? dayjs(creance.dateConstatation).format('DD/MM/YYYY') : '',
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

  return (
    <Box className="p-4">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" className="font-bold text-blue-700">
          Résultats de la recherche de créances
        </Typography>
        <Button variant="contained" color="primary" onClick={handleDownloadExcel}>
          Télécharger en Excel
        </Button>
      </Box>
      
      {resultats.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 'numeroBV' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'numeroBV'}
                    direction={orderBy === 'numeroBV' ? order : 'asc'}
                    onClick={() => handleRequestSort('numeroBV')}
                  >
                    Num BV
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'typeFoncier' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'typeFoncier'}
                    direction={orderBy === 'typeFoncier' ? order : 'asc'}
                    onClick={() => handleRequestSort('typeFoncier')}
                  >
                    Types Foncier
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'referenceBien' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'referenceBien'}
                    direction={orderBy === 'referenceBien' ? order : 'asc'}
                    onClick={() => handleRequestSort('referenceBien')}
                  >
                    Référence du bien
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'principale' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'principale'}
                    direction={orderBy === 'principale' ? order : 'asc'}
                    onClick={() => handleRequestSort('principale')}
                  >
                    Principale
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'montantTotal' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'montantTotal'}
                    direction={orderBy === 'montantTotal' ? order : 'asc'}
                    onClick={() => handleRequestSort('montantTotal')}
                  >
                    Montant total
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'anneeImposition' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'anneeImposition'}
                    direction={orderBy === 'anneeImposition' ? order : 'asc'}
                    onClick={() => handleRequestSort('anneeImposition')}
                  >
                    Année d'imposition
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'tiers' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'tiers'}
                    direction={orderBy === 'tiers' ? order : 'asc'}
                    onClick={() => handleRequestSort('tiers')}
                  >
                    Tiers
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'cin' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'cin'}
                    direction={orderBy === 'cin' ? order : 'asc'}
                    onClick={() => handleRequestSort('cin')}
                  >
                    CIN
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'etat' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'etat'}
                    direction={orderBy === 'etat' ? order : 'asc'}
                    onClick={() => handleRequestSort('etat')}
                  >
                    État
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'dateConstatation' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'dateConstatation'}
                    direction={orderBy === 'dateConstatation' ? order : 'asc'}
                    onClick={() => handleRequestSort('dateConstatation')}
                  >
                    Date Etat
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedResultats.map((creance, index) => (
                <TableRow
                  key={`${creance.numeroBV}-${index}`} // Clé plus unique
                  onClick={() => handleCreanceClick(creance)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{creance.numeroBV}</TableCell>
                  <TableCell>{creance.typeFoncier}</TableCell>
                  <TableCell>{creance.referenceBien}</TableCell>
                  <TableCell>{creance.principale}</TableCell>
                  <TableCell>{creance.montantTotal}</TableCell>
                  <TableCell>{creance.anneeImposition}</TableCell>
                  <TableCell>{creance.tiers}</TableCell>
                  <TableCell>{creance.cin}</TableCell>
                  <TableCell>{creance.etat}</TableCell>
                  <TableCell>
                    {creance.dateConstatation ? dayjs(creance.dateConstatation).format('DD/MM/YYYY') : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>Aucun résultat trouvé.</Typography>
      )}
    </Box>
  );
};

export default RechercheCreanceResultats;