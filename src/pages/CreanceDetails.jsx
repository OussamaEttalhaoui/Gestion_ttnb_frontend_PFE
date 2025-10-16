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
import { useCreanceDetailsLogic } from '../hooks/useCreanceDetailsLogic'; 

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
