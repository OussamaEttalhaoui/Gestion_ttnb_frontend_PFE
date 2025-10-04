import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Divider, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Menu, ListItemIcon, ListItemText
} from '@mui/material';
import { useParams } from 'react-router-dom';
import fetchWithAuth from '../utils/api';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { saveAs } from 'file-saver';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ArrowDropDown } from '@mui/icons-material';

dayjs.locale('fr');

const CreanceDetails = () => {
  const { id } = useParams();
  const [creance, setCreance] = useState(null);
  const [openQuittanceDialog, setOpenQuittanceDialog] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [numeroQuittance, setNumeroQuittance] = useState('');
  const [selectedEtat, setSelectedEtat] = useState('');

  const [anchorElSituationFiscale, setAnchorElSituationFiscale] = useState(null);
  const openSituationFiscaleMenu = Boolean(anchorElSituationFiscale);

  useEffect(() => {
    const fetchCreanceDetails = async () => {
      try {
        const res = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
        if (!res.ok) {
          console.error('Erreur lors de la récupération des détails de la créance:', res.status, res.statusText);
          return;
        }
        const data = await res.json();
        setCreance(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la créance:", error);
      }
    };

    fetchCreanceDetails();
  }, [id]);

  const handleEtatChange = (detailId, newEtat) => {
    setSelectedDetailId(detailId);
    setSelectedEtat(newEtat);
    if (newEtat === 'SOLDEE') {
      setOpenQuittanceDialog(true);
    } else {
      updateCreanceDetailEtat(detailId, newEtat);
    }
  };

  const updateCreanceDetailEtat = async (detailId, etat) => {
    try {
      // Si l'état est "VALIDEE", mettre à jour le numéro de quittance et la date de quittance à null
      if (etat === 'VALIDEE') {
        await fetchWithAuth(`http://localhost:8036/api/creances/details/${detailId}/quittance?numeroQuittance=`, {
          method: 'PUT',
        });
      }

      const res = await fetchWithAuth(`http://localhost:8036/api/creances/details/${detailId}/etat?etat=${etat}`, {
        method: 'PUT',
      });

      if (!res.ok) {
        console.error('Erreur lors de la mise à jour de l\'état de la créance:', res.status, res.statusText);
        alert('Erreur lors de la mise à jour de l\'état de la créance.');
        return;
      }

      // Récupérer les détails de la créance mis à jour
      const resDetails = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
      if (!resDetails.ok) {
        console.error('Erreur lors de la récupération des détails de la créance:', resDetails.status, resDetails.statusText);
        return;
      }
      const updatedCreance = await resDetails.json();

      // Mettre à jour l'état local de la créance
      setCreance(updatedCreance);

      // Mettre à jour le localStorage
      const rechercheCreanceResultats = JSON.parse(localStorage.getItem('rechercheCreanceResultats')) || [];
      const updatedResultats = rechercheCreanceResultats.map(creanceResultat => {
        if (creanceResultat.id === updatedCreance.id) {
          // Mettre à jour l'état de la créance avec le nouvel état
          return { ...creanceResultat, etat: etat };
        }
        return creanceResultat;
      });
      localStorage.setItem('rechercheCreanceResultats', JSON.stringify(updatedResultats));
      console.log('localStorage après mise à jour:', JSON.parse(localStorage.getItem('rechercheCreanceResultats')));
      alert('État de la créance mis à jour avec succès !');
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état de la créance:", error);
      alert('Erreur lors de la mise à jour de l\'état de la créance.');
    }
  };

  const handleQuittanceSubmit = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:8036/api/creances/details/${selectedDetailId}/quittance?numeroQuittance=${numeroQuittance}`, {
        method: 'PUT',
      });

      if (!res.ok) {
        console.error('Erreur lors de la mise à jour du numéro de quittance:', res.status, res.statusText);
        alert('Erreur lors de la mise à jour du numéro de quittance.');
        return;
      }

      await updateCreanceDetailEtat(selectedDetailId, selectedEtat);

      // Récupérer les détails de la créance mis à jour
      const resDetails = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
      if (!resDetails.ok) {
        console.error('Erreur lors de la récupération des détails de la créance:', resDetails.status, resDetails.statusText);
        return;
      }
      const updatedCreance = await resDetails.json();

      setCreance(updatedCreance);
      setOpenQuittanceDialog(false);
      alert('Numéro de quittance mis à jour avec succès !');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du numéro de quittance:", error);
      alert('Erreur lors de la mise à jour du numéro de quittance.');
    }
  };

  const handleRefreshCreance = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/refresh`, {
        method: 'PUT',
      });
      if (!res.ok) {
        console.error('Erreur lors du rafraîchissement de la créance:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setCreance(data); // Mettre à jour l'état avec les nouvelles données de la créance
      alert('Créance rafraîchie avec succès !');
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la créance:", error);
      alert('Erreur lors du rafraîchissement de la créance.');
    }
  };

  const handlePrintBulletin = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/pdf`, {
        method: 'GET',
      });
      if (!res.ok) {
        console.error('Erreur lors de la récupération du PDF:', res.status, res.statusText);
        return;
      }
      const blob = await res.blob();
      saveAs(blob, `Creance_${id}.pdf`); // Utilisation de FileSaver.js pour télécharger le PDF
    } catch (error) {
      console.error("Erreur lors de l'impression du bulletin:", error);
      alert('Erreur lors de l\'impression du bulletin.');
    }
  };

  const handleOpenSituationFiscaleMenu = (event) => {
    setAnchorElSituationFiscale(event.currentTarget);
  };

  const handleCloseSituationFiscaleMenu = () => {
    setAnchorElSituationFiscale(null);
  };

  const handlePrintSituationFiscale = async (type) => {
    handleCloseSituationFiscaleMenu();
    try {
      let endpoint = `http://localhost:8036/api/creances/${id}/situation-fiscale/pdf?type=${type}`;
      const res = await fetchWithAuth(endpoint, {
        method: 'GET',
      });
      if (!res.ok) {
        console.error('Erreur lors de la récupération du PDF de la situation fiscale:', res.status, res.statusText);
        return;
      }
      const blob = await res.blob();
      saveAs(blob, `SituationFiscale_${id}.pdf`); // Utilisation de FileSaver.js pour télécharger le PDF
    } catch (error) {
      console.error("Erreur lors de l'impression de la situation fiscale:", error);
      alert('Erreur lors de l\'impression de la situation fiscale.');
    }
  };

  const handleCloseQuittanceDialog = () => {
    setOpenQuittanceDialog(false);
    setSelectedDetailId(null);
    setNumeroQuittance('');
    setSelectedEtat('');
  };


  const handleDateQuittanceChange = async (detailId, newDate) => {
  try {
    const res = await fetchWithAuth(
      `http://localhost:8036/api/creances/details/${detailId}/date-quittance?date=${newDate}`,
      { method: 'PUT' }
    );

    if (!res.ok) {
      alert("Erreur lors de la mise à jour de la date de quittance.");
      return;
    }

    // Recharger les détails mis à jour
    const resDetails = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
    const updatedCreance = await resDetails.json();
    setCreance(updatedCreance);

    alert("Date de quittance mise à jour !");
  } catch (error) {
    console.error("Erreur update date quittance:", error);
    alert("Erreur serveur lors de la mise à jour de la date de quittance.");
  }
};



  if (!creance) {
    return <Typography>Chargement des détails de la créance...</Typography>;
  }

  return (
    <Box className="p-4">
      <Typography variant="h4" className="mb-4 font-bold text-blue-700">Détails de la créance</Typography>

      <Paper sx={{ p: 3, mb: 3, mt:3 }}>
        <Typography variant="h6" className="mb-2 font-bold text-gray-700">Références de la créance</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Date de constatation:</Typography>
          <Typography>{dayjs(creance.dateConstatation).format('D MMMM YYYY')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Zone:</Typography>
          <Typography>{creance.zone}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Taux:</Typography>
          <Typography>{creance.taux}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>avec sanction: </Typography>
          <Typography variant="subtitle2" sx={{ mr: 1 }}>défaut de declaration , declaration déposé hors delai.</Typography>
          <Typography>
            {creance.avecDeclaration ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Montant taxe:</Typography>
          <Typography>{creance.montantTaxe}</Typography>
        </Box>
        {/* Ajoutez ici les autres informations de la créance */}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" className="mb-2 font-bold text-gray-700">Références du débiteur</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Type débiteur:</Typography>
          <Typography>{creance.debiteur.typeDebiteur}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Nom:</Typography>
          <Typography>{creance.debiteur.nom}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Prénom:</Typography>
          <Typography>{creance.debiteur.prenom}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>CIN:</Typography>
          <Typography>{creance.debiteur.cin}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Téléphone:</Typography>
          <Typography>{creance.debiteur.telephone}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Email:</Typography>
          <Typography>{creance.debiteur.email}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Identifiant fiscal:</Typography>
          <Typography>{creance.debiteur.identifiantFiscal}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Adresse:</Typography>
          <Typography>{creance.debiteur.adresse}</Typography>
        </Box>
        {/* Ajoutez ici les autres informations du débiteur */}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" className="mb-2 font-bold text-gray-700">Références du bien</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Type bien:</Typography>
          <Typography>{creance.bien.typeBien}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Adresse:</Typography>
          <Typography>{creance.bien.adresse}</Typography>
        </Box>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Superficie:</Typography>
          <Typography>{creance.bien.superficie}</Typography>
        </Box>
        {/* Ajoutez ici les autres informations du bien */}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" className="mb-2 font-bold text-gray-700">Détails de la créance (par année)</Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Année</TableCell>
                <TableCell>Numéro BV</TableCell>
                <TableCell>Principale</TableCell>
                <TableCell>Défaut Déclaration</TableCell>
                <TableCell>Pénalité</TableCell>
                <TableCell>Majoration</TableCell>
                <TableCell>Taxe TNB</TableCell>
                <TableCell>État</TableCell>
                <TableCell>Numéro Quittance</TableCell>
                <TableCell>Date Quittance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creance.details.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell>{detail.annee}</TableCell>
                  <TableCell>{detail.numeroBV}</TableCell>
                  <TableCell>{detail.principale}</TableCell>
                  <TableCell>{detail.defautDeclaration}</TableCell>
                  <TableCell>{detail.penalite}</TableCell>
                  <TableCell>{detail.majoration}</TableCell>
                  <TableCell>{detail.taxeTnb}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`etat-select-label-${detail.id}`}>État</InputLabel>
                      <Select
                        labelId={`etat-select-label-${detail.id}`}
                        id={`etat-select-${detail.id}`}
                        value={detail.etat || ''}
                        label="État"
                        onChange={(e) => handleEtatChange(detail.id, e.target.value)}
                      >
                        <MenuItem value={'SOLDEE'}>Soldée</MenuItem>
                        <MenuItem value={'VALIDEE'}>Validée</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{detail.numeroQuittance}</TableCell>
                  {/* <TableCell>{detail.dateQuittance ? dayjs(detail.dateQuittance).format('DD/MM/YYYY') : ''}</TableCell> */}
                  <TableCell>
                    {detail.numeroQuittance ? (
                      <TextField
                        type="date"
                        size="small"
                        value={detail.dateQuittance ? dayjs(detail.dateQuittance).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleDateQuittanceChange(detail.id, e.target.value)}
                      />
                    ) : (
                      detail.dateQuittance ? dayjs(detail.dateQuittance).format('DD/MM/YYYY') : ''
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Affichage des boutons en bas de la page */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleRefreshCreance}>
          Rafraîchir Majoration
        </Button>
        <Button variant="contained" color="success" onClick={handlePrintBulletin}>
          Imprimer Bulletin de Versement
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={handleOpenSituationFiscaleMenu}
          endIcon={<ArrowDropDown />}
        >
          Imprimer la situation fiscale
        </Button>
        <Menu
          id="menu-situation-fiscale"
          anchorEl={anchorElSituationFiscale}
          open={openSituationFiscaleMenu}
          onClose={handleCloseSituationFiscaleMenu}
          MenuListProps={{
            'aria-labelledby': 'button',
          }}
        >
          <MenuItem onClick={() => handlePrintSituationFiscale('RAR')}>
            <ListItemText>RAR (État Validé)</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handlePrintSituationFiscale('EtatPaiement')}>
            <ListItemText>État de Paiement (État Soldée)</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Dialogue pour saisir le numéro de quittance */}
      <Dialog open={openQuittanceDialog} onClose={handleCloseQuittanceDialog}>
        <DialogTitle>Saisir le numéro de quittance</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="numeroQuittance"
            label="Numéro de quittance"
            type="text"
            fullWidth
            value={numeroQuittance}
            onChange={(e) => setNumeroQuittance(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuittanceDialog}>Annuler</Button>
          <Button onClick={handleQuittanceSubmit}>Valider</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreanceDetails;



