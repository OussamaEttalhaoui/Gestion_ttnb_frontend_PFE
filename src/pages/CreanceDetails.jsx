import React from 'react';
import {
    Box, Typography, Paper, Divider, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button,
    FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    Menu, ListItemIcon, ListItemText, alpha
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ArrowDropDown, Refresh, Print, Description } from '@mui/icons-material';
import { useCreanceDetailsLogic } from '../hooks/useCreanceDetailsLogic'; // ⬅️ IMPORT DU HOOK

dayjs.locale('fr');

// Styles
const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

// Composant InfoSection (inchangé)
const InfoSection = ({ title, children, sx = {} }) => (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3, 
        overflow: 'hidden',
        height: '100%', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
        },
        ...sx
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          color: primaryColor,
          mb: 2
        }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 2, bgcolor: alpha(primaryColor, 0.3) }} />
      {children}
    </Paper>
);

const CreanceDetails = () => {
    // ⬅️ UTILISATION DU HOOK POUR LA LOGIQUE ET LES DONNÉES
    const {
        creance, openQuittanceDialog, selectedDetailId, numeroQuittance, setNumeroQuittance,
        selectedEtat, referenceInternet, setReferenceInternet,
        anchorElSituationFiscale, openSituationFiscaleMenu,

        handleEtatChange, handleQuittanceOrReferenceSubmit, handleRefreshCreance, 
        handlePrintBulletin, handlePrintSituationFiscale, handleDateQuittanceChange,
        handleOpenSituationFiscaleMenu, handleCloseSituationFiscaleMenu, handleCloseQuittanceDialog,
    } = useCreanceDetailsLogic();

    // Styles
    const infoTextStyle = {
      display: 'flex', 
      mb: 1,
      '& > *:first-of-type': { 
          fontWeight: 'bold', 
          mr: 1, 
          color: primaryColor 
      },
      '& > *:last-child': { 
          color: 'text.primary' 
      }
    };
    const tableCellStyle = { p: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' };
    const tableHeadCellStyle = { 
      fontWeight: 700, 
      color: primaryColor, 
      p: '8px', 
      fontSize: '0.8rem', 
      whiteSpace: 'normal', 
    };


    if (!creance) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Chargement des détails de la créance...
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>

        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Détails de la créance
        </Typography>

        <Grid container spacing={3} alignItems="stretch">

          {/* Colonne 1: Références de la créance */}
          <Grid item xs={12} md={4}>
            <InfoSection title="Références de la créance">
              {/* ... Affichage des infos de la créance (utilisant creance) ... */}
              <Box sx={infoTextStyle}>
                <Typography variant="subtitle2">Date de constatation:</Typography>
                <Typography>{dayjs(creance.dateConstatation).format('D MMMM YYYY')}</Typography>
              </Box>
              <Box sx={infoTextStyle}>
                <Typography variant="subtitle2">Zone:</Typography>
                <Typography>{creance.zone}</Typography>
              </Box>
              <Box sx={infoTextStyle}>
                <Typography variant="subtitle2">Taux:</Typography>
                <Typography>{creance.taux}</Typography>
              </Box>
              <Box sx={infoTextStyle}>
                <Typography variant="subtitle2">Avec sanction:</Typography>
                <Box>
                  <Typography component="span" sx={{ mr: 1, whiteSpace: 'normal', fontSize: '0.875rem' }}>défaut de déclaration, déclaration déposée hors délai.</Typography>
                  <Typography component="span">
                    {creance.avecDeclaration ? <CheckIcon color="success" sx={{ verticalAlign: 'middle', fontSize: '1.2rem' }} /> : <CloseIcon color="error" sx={{ verticalAlign: 'middle', fontSize: '1.2rem' }} />}
                  </Typography>
                </Box>
              </Box>
              <Box sx={infoTextStyle}>
                <Typography variant="subtitle2">Montant taxe:</Typography>
                <Typography>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(creance.montantTaxe)}</Typography>
              </Box>
            </InfoSection>
          </Grid>

          {/* Colonne 2: Références du débiteur */}
          <Grid item xs={12} md={4}>
            <InfoSection title="Références du débiteur">
              {/* ... Affichage des infos du débiteur ... */}
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Type débiteur:</Typography><Typography>{creance.debiteur.typeDebiteur}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Nom:</Typography><Typography>{creance.debiteur.nom}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Prénom:</Typography><Typography>{creance.debiteur.prenom}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">CIN:</Typography><Typography>{creance.debiteur.cin}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Téléphone:</Typography><Typography>{creance.debiteur.telephone}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Email:</Typography><Typography>{creance.debiteur.email}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Identifiant fiscal:</Typography><Typography>{creance.debiteur.identifiantFiscal}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Adresse:</Typography><Typography>{creance.debiteur.adresse}</Typography></Box>
            </InfoSection>
          </Grid>

          {/* Colonne 3: Références du bien immobilier */}
          <Grid item xs={12} md={4}>
            <InfoSection title="Références du bien immobilier">
              {/* ... Affichage des infos du bien ... */}
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Type bien:</Typography><Typography>{creance.bien.typeBien}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Adresse:</Typography><Typography>{creance.bien.adresse}</Typography></Box>
              <Box sx={infoTextStyle}><Typography variant="subtitle2">Superficie:</Typography><Typography>{creance.bien.superficie} m²</Typography></Box>
            </InfoSection>
          </Grid>
        </Grid>

        {/* Tableau des détails de la créance (par année) */}
        <InfoSection title="Détails de la créance (par année)" sx={{ mt: 3 }}>
          <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
                  <TableCell sx={tableHeadCellStyle}>Année</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Numéro BV</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Principale</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Défaut Déclaration</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Pénalité</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Majoration</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Taxe TNB</TableCell>
                  <TableCell sx={tableHeadCellStyle}>État</TableCell> 
                  <TableCell sx={tableHeadCellStyle}>Numéro Quittance</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Réf. Internet</TableCell>
                  <TableCell sx={tableHeadCellStyle}>Date Quittance</TableCell> 
                </TableRow>
              </TableHead>
              <TableBody>
                {creance.details.map((detail) => (
                  <TableRow key={detail.id} hover>
                    <TableCell sx={tableCellStyle}>{detail.annee}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.numeroBV}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.principale}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.defautDeclaration}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.penalite}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.majoration}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.taxeTnb}</TableCell>
                    
                    <TableCell sx={{ ...tableCellStyle, minWidth: 120 }}>
                      <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id={`etat-select-label-${detail.id}`}>État</InputLabel>
                        <Select
                          labelId={`etat-select-label-${detail.id}`}
                          id={`etat-select-${detail.id}`}
                          value={detail.etat || ''}
                          label="État"
                          onChange={(e) => handleEtatChange(detail.id, e.target.value)}
                          sx={{ 
                              '& .MuiSelect-select': { py: 1.25, fontSize: '0.8rem' },
                              '& .MuiInputLabel-root': { transform: 'translate(14px, 12px) scale(1)', fontSize: '0.8rem' },
                              '& .MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)' }
                          }}
                        >
                          <MenuItem value="SOLDEE">Soldée (Quittance)</MenuItem>
                          <MenuItem value="VALIDEE">Validée</MenuItem>
                          <MenuItem value="SOLDEE_PAR_INTERNET">Soldée par Internet</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell sx={tableCellStyle}>{detail.numeroQuittance || '-'}</TableCell>
                    <TableCell sx={tableCellStyle}>{detail.referenceInternet || '-'}</TableCell>

                    <TableCell sx={{ ...tableCellStyle, minWidth: 140 }}>
                      {detail.numeroQuittance || detail.referenceInternet ? (
                        <TextField
                          type="date"
                          size="small"
                          value={detail.dateQuittance ? dayjs(detail.dateQuittance).format('YYYY-MM-DD') : ''}
                          onChange={(e) => handleDateQuittanceChange(detail.id, e.target.value)}
                          sx={{ 
                              width: '100%', 
                              '& .MuiInputBase-input': { 
                                  p: '8px 10px', 
                                  fontSize: '0.8rem' 
                              } 
                          }}
                        />
                      ) : (
                        detail.dateQuittance ? dayjs(detail.dateQuittance).format('DD/MM/YYYY') : '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </InfoSection>

        {/* Boutons d'action rapides */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<Refresh />}
            onClick={handleRefreshCreance}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600, 
              textTransform: 'none',
              bgcolor: '#ff9800', 
              '&:hover': { bgcolor: '#f57c00' }
            }}
          >
            Rafraîchir Majoration
          </Button>

          <Button 
            variant="contained" 
            startIcon={<Print />}
            onClick={handlePrintBulletin}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600, 
              textTransform: 'none',
              bgcolor: '#4caf50', 
              '&:hover': { bgcolor: '#388e3c' }
            }}
          >
            Imprimer Bulletin de Versement
          </Button>

          <Button
            variant="contained"
            color="info"
            onClick={handleOpenSituationFiscaleMenu}
            endIcon={<ArrowDropDown />}
            startIcon={<Description />}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Situation fiscale
          </Button>
          <Menu
            id="menu-situation-fiscale"
            anchorEl={anchorElSituationFiscale}
            open={openSituationFiscaleMenu}
            onClose={handleCloseSituationFiscaleMenu}
          >
            <MenuItem onClick={() => handlePrintSituationFiscale('RAR')}>
              <ListItemText>RAR (État Validé)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handlePrintSituationFiscale('EtatPaiement')}>
              <ListItemText>État de Paiement (État Soldée)</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Dialogue pour saisir le numéro de quittance ou reference internet */}
        <Dialog open={openQuittanceDialog} onClose={handleCloseQuittanceDialog} PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: primaryColor, color: 'white' }}>
            {selectedEtat === 'SOLDEE' ? "Saisir le Numéro de Quittance" : "Saisir la Référence Internet"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedEtat === 'SOLDEE' ? (
              <TextField
                autoFocus
                margin="dense"
                label="Numéro de quittance"
                fullWidth
                variant="outlined"
                value={numeroQuittance}
                onChange={(e) => setNumeroQuittance(e.target.value)}
                sx={{ mt: 1 }}
              />
            ) : (
              <TextField
                autoFocus
                margin="dense"
                label="Référence internet"
                fullWidth
                variant="outlined"
                value={referenceInternet}
                onChange={(e) => setReferenceInternet(e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQuittanceDialog} variant="outlined" sx={{ borderRadius: 2 }}>Annuler</Button>
            <Button 
              onClick={handleQuittanceOrReferenceSubmit} 
              variant="contained" 
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              Valider
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
};

export default CreanceDetails;

// import React, { useState, useEffect } from 'react';
// import {
//   Box, Typography, Paper, Divider, Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button,
//   FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
//   Menu, ListItemIcon, ListItemText
// } from '@mui/material';
// import { useParams } from 'react-router-dom';
// import fetchWithAuth from '../utils/api';
// import dayjs from 'dayjs';
// import 'dayjs/locale/fr';
// import { saveAs } from 'file-saver';
// import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';
// import { ArrowDropDown } from '@mui/icons-material';

// dayjs.locale('fr');

// const CreanceDetails = () => {
//   const { id } = useParams();
//   const [creance, setCreance] = useState(null);
//   const [openQuittanceDialog, setOpenQuittanceDialog] = useState(false);
//   const [selectedDetailId, setSelectedDetailId] = useState(null);
//   const [numeroQuittance, setNumeroQuittance] = useState('');
//   const [selectedEtat, setSelectedEtat] = useState('');
//   const [referenceInternet, setReferenceInternet] = useState('');


//   const [anchorElSituationFiscale, setAnchorElSituationFiscale] = useState(null);
//   const openSituationFiscaleMenu = Boolean(anchorElSituationFiscale);

//   useEffect(() => {
//     const fetchCreanceDetails = async () => {
//       try {
//         const res = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
//         if (!res.ok) {
//           console.error('Erreur lors de la récupération des détails de la créance:', res.status, res.statusText);
//           return;
//         }
//         const data = await res.json();
//         setCreance(data);
//       } catch (error) {
//         console.error("Erreur lors de la récupération des détails de la créance:", error);
//       }
//     };

//     fetchCreanceDetails();
//   }, [id]);

//   const handleEtatChange = (detailId, newEtat) => {
//   setSelectedDetailId(detailId);
//   setSelectedEtat(newEtat);

//   if (newEtat === 'SOLDEE') {
//     setOpenQuittanceDialog(true);
//   } else if (newEtat === 'SOLDEE_PAR_INTERNET') {
//     setOpenQuittanceDialog(true); // On réutilise le même dialog mais pour la référence
//   } else {
//     updateCreanceDetailEtat(detailId, newEtat);
//   }
// };

//   const updateCreanceDetailEtat = async (detailId, etat) => {
//     try {
//       // Si l'état est "VALIDEE", mettre à jour le numéro de quittance et la date de quittance à null
//       if (etat === 'VALIDEE') {
//         await fetchWithAuth(`http://localhost:8036/api/creances/details/${detailId}/quittance?numeroQuittance=`, {
//           method: 'PUT',
//         });
//       }

//       const res = await fetchWithAuth(`http://localhost:8036/api/creances/details/${detailId}/etat?etat=${etat}`, {
//         method: 'PUT',
//       });

//       if (!res.ok) {
//         console.error('Erreur lors de la mise à jour de l\'état de la créance:', res.status, res.statusText);
//         alert('Erreur lors de la mise à jour de l\'état de la créance.');
//         return;
//       }

//       // Récupérer les détails de la créance mis à jour
//       const resDetails = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
//       if (!resDetails.ok) {
//         console.error('Erreur lors de la récupération des détails de la créance:', resDetails.status, resDetails.statusText);
//         return;
//       }
//       const updatedCreance = await resDetails.json();

//       // Mettre à jour l'état local de la créance
//       setCreance(updatedCreance);

//       // Mettre à jour le localStorage
//       const rechercheCreanceResultats = JSON.parse(localStorage.getItem('rechercheCreanceResultats')) || [];
//       const updatedResultats = rechercheCreanceResultats.map(creanceResultat => {
//         if (creanceResultat.id === updatedCreance.id) {
//           // Mettre à jour l'état de la créance avec le nouvel état
//           return { ...creanceResultat, etat: etat };
//         }
//         return creanceResultat;
//       });
//       localStorage.setItem('rechercheCreanceResultats', JSON.stringify(updatedResultats));
//       console.log('localStorage après mise à jour:', JSON.parse(localStorage.getItem('rechercheCreanceResultats')));
//       alert('État de la créance mis à jour avec succès !');
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour de l'état de la créance:", error);
//       alert('Erreur lors de la mise à jour de l\'état de la créance.');
//     }
//   };

  
//   const handleQuittanceOrReferenceSubmit = async () => {
//     try {
//       if (selectedEtat === 'SOLDEE') {
//         // Cas quittance classique
//         await fetchWithAuth(
//           `http://localhost:8036/api/creances/details/${selectedDetailId}/quittance?numeroQuittance=${numeroQuittance}`,
//           { method: 'PUT' }
//         );
//       } else if (selectedEtat === 'SOLDEE_PAR_INTERNET') {
//         await fetchWithAuth(
//           `http://localhost:8036/api/creances/details/${selectedDetailId}/reference-internet?reference=${referenceInternet}`,
//           { method: 'PUT' }
//         );
//         setCreance((prev) => ({
//           ...prev,
//           details: prev.details.map((detail) =>
//             detail.id === selectedDetailId ? { ...detail, referenceInternet: referenceInternet } : detail
//           ),
//         }));
//       }
  
//       await updateCreanceDetailEtat(selectedDetailId, selectedEtat);
//       setOpenQuittanceDialog(false);
//       setNumeroQuittance('');
//       setReferenceInternet('');
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour :", error);
//       alert('Erreur lors de la mise à jour.');
//     }
//   };

//   const handleRefreshCreance = async () => {
//     try {
//       const res = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/refresh`, {
//         method: 'PUT',
//       });
//       if (!res.ok) {
//         console.error('Erreur lors du rafraîchissement de la créance:', res.status, res.statusText);
//         return;
//       }
//       const data = await res.json();
//       setCreance(data); // Mettre à jour l'état avec les nouvelles données de la créance
//       alert('Créance rafraîchie avec succès !');
//     } catch (error) {
//       console.error("Erreur lors du rafraîchissement de la créance:", error);
//       alert('Erreur lors du rafraîchissement de la créance.');
//     }
//   };

//   const handlePrintBulletin = async () => {
//     try {
//       const res = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/pdf`, {
//         method: 'GET',
//       });
//       if (!res.ok) {
//         console.error('Erreur lors de la récupération du PDF:', res.status, res.statusText);
//         return;
//       }
//       const blob = await res.blob();
//       saveAs(blob, `Creance_${id}.pdf`); // Utilisation de FileSaver.js pour télécharger le PDF
//     } catch (error) {
//       console.error("Erreur lors de l'impression du bulletin:", error);
//       alert('Erreur lors de l\'impression du bulletin.');
//     }
//   };

//   const handleOpenSituationFiscaleMenu = (event) => {
//     setAnchorElSituationFiscale(event.currentTarget);
//   };

//   const handleCloseSituationFiscaleMenu = () => {
//     setAnchorElSituationFiscale(null);
//   };

//   const handlePrintSituationFiscale = async (type) => {
//     handleCloseSituationFiscaleMenu();
//     try {
//       let endpoint = `http://localhost:8036/api/creances/${id}/situation-fiscale/pdf?type=${type}`;
//       const res = await fetchWithAuth(endpoint, {
//         method: 'GET',
//       });
//       if (!res.ok) {
//         console.error('Erreur lors de la récupération du PDF de la situation fiscale:', res.status, res.statusText);
//         return;
//       }
//       const blob = await res.blob();
//       saveAs(blob, `SituationFiscale_${id}.pdf`); // Utilisation de FileSaver.js pour télécharger le PDF
//     } catch (error) {
//       console.error("Erreur lors de l'impression de la situation fiscale:", error);
//       alert('Erreur lors de l\'impression de la situation fiscale.');
//     }
//   };

//   const handleCloseQuittanceDialog = () => {
//     setOpenQuittanceDialog(false);
//     setSelectedDetailId(null);
//     setNumeroQuittance('');
//     setSelectedEtat('');
//   };


//   const handleDateQuittanceChange = async (detailId, newDate) => {
//   try {
//     const res = await fetchWithAuth(
//       `http://localhost:8036/api/creances/details/${detailId}/date-quittance?date=${newDate}`,
//       { method: 'PUT' }
//     );

//     if (!res.ok) {
//       alert("Erreur lors de la mise à jour de la date de quittance.");
//       return;
//     }

//     // Recharger les détails mis à jour
//     const resDetails = await fetchWithAuth(`http://localhost:8036/api/creances/${id}/details`);
//     const updatedCreance = await resDetails.json();
//     setCreance(updatedCreance);

//     alert("Date de quittance mise à jour !");
//   } catch (error) {
//     console.error("Erreur update date quittance:", error);
//     alert("Erreur serveur lors de la mise à jour de la date de quittance.");
//   }
// };



//   if (!creance) {
//     return <Typography>Chargement des détails de la créance...</Typography>;
//   }

//   return (
//     <Box className="p-4">
//       <Typography variant="h4" className="mb-4 font-bold text-blue-700">Détails de la créance</Typography>

//       <Paper sx={{ p: 3, mb: 3, mt:3 }}>
//         <Typography variant="h6" className="mb-2 font-bold text-gray-700">Références de la créance</Typography>
//         <Divider sx={{ mb: 2 }} />
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Date de constatation:</Typography>
//           <Typography>{dayjs(creance.dateConstatation).format('D MMMM YYYY')}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Zone:</Typography>
//           <Typography>{creance.zone}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Taux:</Typography>
//           <Typography>{creance.taux}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>avec sanction: </Typography>
//           <Typography variant="subtitle2" sx={{ mr: 1 }}>défaut de declaration , declaration déposé hors delai.</Typography>
//           <Typography>
//             {creance.avecDeclaration ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Montant taxe:</Typography>
//           <Typography>{creance.montantTaxe}</Typography>
//         </Box>
//         {/* Ajoutez ici les autres informations de la créance */}
//       </Paper>

//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Typography variant="h6" className="mb-2 font-bold text-gray-700">Références du débiteur</Typography>
//         <Divider sx={{ mb: 2 }} />
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Type débiteur:</Typography>
//           <Typography>{creance.debiteur.typeDebiteur}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Nom:</Typography>
//           <Typography>{creance.debiteur.nom}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Prénom:</Typography>
//           <Typography>{creance.debiteur.prenom}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>CIN:</Typography>
//           <Typography>{creance.debiteur.cin}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Téléphone:</Typography>
//           <Typography>{creance.debiteur.telephone}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Email:</Typography>
//           <Typography>{creance.debiteur.email}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Identifiant fiscal:</Typography>
//           <Typography>{creance.debiteur.identifiantFiscal}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Adresse:</Typography>
//           <Typography>{creance.debiteur.adresse}</Typography>
//         </Box>
//         {/* Ajoutez ici les autres informations du débiteur */}
//       </Paper>

//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Typography variant="h6" className="mb-2 font-bold text-gray-700">Références du bien</Typography>
//         <Divider sx={{ mb: 2 }} />
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Type bien:</Typography>
//           <Typography>{creance.bien.typeBien}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Adresse:</Typography>
//           <Typography>{creance.bien.adresse}</Typography>
//         </Box>
//         <Box sx={{ display: 'flex', mb: 1 }}>
//           <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>Superficie:</Typography>
//           <Typography>{creance.bien.superficie}</Typography>
//         </Box>
//         {/* Ajoutez ici les autres informations du bien */}
//       </Paper>

//       <Paper sx={{ p: 3 }}>
//         <Typography variant="h6" className="mb-2 font-bold text-gray-700">Détails de la créance (par année)</Typography>
//         <Divider sx={{ mb: 2 }} />
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Année</TableCell>
//                 <TableCell>Numéro BV</TableCell>
//                 <TableCell>Principale</TableCell>
//                 <TableCell>Défaut Déclaration</TableCell>
//                 <TableCell>Pénalité</TableCell>
//                 <TableCell>Majoration</TableCell>
//                 <TableCell>Taxe TNB</TableCell>
//                 <TableCell>État</TableCell>
//                 <TableCell>Numéro Quittance</TableCell>
//                 <TableCell>Numéro Référence</TableCell>
//                 <TableCell>Date Quittance</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {creance.details.map((detail) => (
//                 <TableRow key={detail.id}>
//                   <TableCell>{detail.annee}</TableCell>
//                   <TableCell>{detail.numeroBV}</TableCell>
//                   <TableCell>{detail.principale}</TableCell>
//                   <TableCell>{detail.defautDeclaration}</TableCell>
//                   <TableCell>{detail.penalite}</TableCell>
//                   <TableCell>{detail.majoration}</TableCell>
//                   <TableCell>{detail.taxeTnb}</TableCell>
//                   <TableCell>
//                     <FormControl fullWidth size="small" variant="outlined">
//                       <InputLabel id={`etat-select-label-${detail.id}`}>État</InputLabel>
//                       <Select
//                         labelId={`etat-select-label-${detail.id}`}
//                         id={`etat-select-${detail.id}`}
//                         value={detail.etat || ''}
//                         label="État"
//                         onChange={(e) => handleEtatChange(detail.id, e.target.value)}
//                         sx={{ minWidth: 100 }} // <-- empêche la coupure du label
//                       >
//                         <MenuItem value="SOLDEE">Soldée</MenuItem>
//                         <MenuItem value="VALIDEE">Validée</MenuItem>
//                         <MenuItem value="SOLDEE_PAR_INTERNET">Soldée par Internet</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </TableCell>

//                   <TableCell>{detail.numeroQuittance}</TableCell>
//                   <TableCell>{detail.referenceInternet || ''}</TableCell>
//                   {/* <TableCell>{detail.dateQuittance ? dayjs(detail.dateQuittance).format('DD/MM/YYYY') : ''}</TableCell> */}
//                   <TableCell>
//                     {detail.numeroQuittance || detail.referenceInternet ? (
//                       <TextField
//                         type="date"
//                         size="small"
//                         value={detail.dateQuittance ? dayjs(detail.dateQuittance).format('YYYY-MM-DD') : ''}
//                         onChange={(e) => handleDateQuittanceChange(detail.id, e.target.value)}
//                       />
//                     ) : (
//                       detail.dateQuittance ? dayjs(detail.dateQuittance).format('DD/MM/YYYY') : ''
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* Affichage des boutons en bas de la page */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
//         <Button variant="contained" color="primary" onClick={handleRefreshCreance}>
//           Rafraîchir Majoration
//         </Button>
//         <Button variant="contained" color="success" onClick={handlePrintBulletin}>
//           Imprimer Bulletin de Versement
//         </Button>
//         <Button
//           variant="contained"
//           color="info"
//           onClick={handleOpenSituationFiscaleMenu}
//           endIcon={<ArrowDropDown />}
//         >
//           Imprimer la situation fiscale
//         </Button>
//         <Menu
//           id="menu-situation-fiscale"
//           anchorEl={anchorElSituationFiscale}
//           open={openSituationFiscaleMenu}
//           onClose={handleCloseSituationFiscaleMenu}
//           MenuListProps={{
//             'aria-labelledby': 'button',
//           }}
//         >
//           <MenuItem onClick={() => handlePrintSituationFiscale('RAR')}>
//             <ListItemText>RAR (État Validé)</ListItemText>
//           </MenuItem>
//           <MenuItem onClick={() => handlePrintSituationFiscale('EtatPaiement')}>
//             <ListItemText>État de Paiement (État Soldée)</ListItemText>
//           </MenuItem>
//         </Menu>
//       </Box>

//       {/* Dialogue pour saisir le numéro de quittance ou reference internet */}
//       <Dialog open={openQuittanceDialog} onClose={handleCloseQuittanceDialog}>
//         <DialogTitle>
//           {selectedEtat === 'SOLDEE' ? "Saisir le numéro de quittance" : "Saisir la référence internet"}
//         </DialogTitle>
//         <DialogContent>
//           {selectedEtat === 'SOLDEE' ? (
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Numéro de quittance"
//               fullWidth
//               value={numeroQuittance}
//               onChange={(e) => setNumeroQuittance(e.target.value)}
//             />
//           ) : (
//             <TextField
//               autoFocus
//               margin="dense"
//               label="Référence internet"
//               fullWidth
//               value={referenceInternet}
//               onChange={(e) => setReferenceInternet(e.target.value)}
//             />
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseQuittanceDialog}>Annuler</Button>
//           <Button onClick={handleQuittanceOrReferenceSubmit}>Valider</Button>
//         </DialogActions>
//       </Dialog>

//     </Box>
//   );
// };

// export default CreanceDetails;



