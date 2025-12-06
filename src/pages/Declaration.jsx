import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControlLabel, Checkbox, Dialog,
  DialogTitle, DialogContent, DialogActions, alpha, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { saveAs } from 'file-saver';
import fetchWithAuth from '../utils/api';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Download as DownloadIcon } from '@mui/icons-material';
import API_BASE_URL from '../utils/apiConfig';

const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

export default function Declaration() {
  const [declarationId, setDeclarationId] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('possession');
  const [dateMutation, setDateMutation] = useState(null);


  // ✅ Nouveau propriétaire (mutation)
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouvelleAdresse, setNouvelleAdresse] = useState('');
  const [nouveauCin, setNouveauCin] = useState('');
  const [nouveauTelephone, setNouveauTelephone] = useState('');


  // ✅ États pour changement de situation
  const [isChangement, setIsChangement] = useState(false);
  const [qualiteDeclarant, setQualiteDeclarant] = useState('');
  const [typeChangement, setTypeChangement] = useState('');
  const [dateChangement, setDateChangement] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDownloadDeclaration = async () => {
    if (!declarationId) {
      setDialogMessage("Veuillez saisir l'Identifiant du bien.");
      setOpenDialog(true);
      return;
    }

    const params = new URLSearchParams();
    params.append('type', selectedType);

    if (selectedType === 'mutation') {
      if (!dateMutation || !nouveauNom || !nouvelleAdresse || !nouveauCin || !nouveauTelephone) {
        setDialogMessage("Veuillez remplir tous les champs du nouveau propriétaire.");
        setOpenDialog(true);
        return;
      }
      params.append('dateMutation', dayjs(dateMutation).format('YYYY-MM-DD'));
      params.append('nouveauNom', nouveauNom);
      params.append('nouvelleAdresse', nouvelleAdresse);
      params.append('nouveauCin', nouveauCin);
      params.append('nouveauTelephone', nouveauTelephone);
    }


    // ✅ Si changement de situation coché
    if (isChangement) {
      if (!qualiteDeclarant || !typeChangement || !dateChangement) {
        setDialogMessage("Veuillez remplir tous les champs du changement de situation.");
        setOpenDialog(true);
        return;
      }
      params.append('isChangement', true);
      params.append('qualiteDeclarant', qualiteDeclarant);
      params.append('typeChangement', typeChangement);
      params.append('dateChangement', dayjs(dateChangement).format('YYYY-MM-DD'));
    }

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/declaration/${declarationId}/pdf?${params.toString()}`,
        { method: 'GET', responseType: 'blob' }
      );

      if (!res.ok) {
        const message = res.status === 404
          ? "L'identifiant du bien n'existe pas."
          : `Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`;
        setDialogMessage(message);
        setOpenDialog(true);
        return;
      }

      const blob = await res.blob();
      saveAs(blob, `declaration_bien_${declarationId}.pdf`);
      setError('');
    } catch (error) {
      console.error("Erreur lors du téléchargement de la déclaration:", error);
      setDialogMessage("Erreur inattendue. Veuillez réessayer.");
      setOpenDialog(true);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === 'possession') setDateMutation(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Déclaration de Taxe
        </Typography>

        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Identifiant du bien"
              value={declarationId}
              onChange={(e) => setDeclarationId(e.target.value)}
              fullWidth
            />

            <FormControlLabel
             control={
               <Checkbox
                 checked={selectedType === 'possession'}
                 onChange={() => {
                   handleTypeChange('possession');
                   setIsChangement(false);
                 }}
                 sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
               />
             }
             label="Possession"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedType === 'mutation'}
                  onChange={() => {
                    handleTypeChange('mutation');
                    setIsChangement(false);
                  }}
                  sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                />
              }
              label="Mutation"
            />

            {/* {selectedType === 'mutation' && (
              <DatePicker
                label="Date de mutation"
                value={dateMutation}
                onChange={setDateMutation}
                slotProps={{ textField: { fullWidth: true } }}
              />
            )} */}
            
            {selectedType === 'mutation' && (
              <>
                <DatePicker
                  label="Date de mutation"
                  value={dateMutation}
                  onChange={setDateMutation}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                  Informations du nouveau propriétaire :
                </Typography>
                <TextField
                  label="Nom et prénom / Raison sociale"
                  value={nouveauNom}
                  onChange={(e) => setNouveauNom(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Adresse complète"
                  value={nouvelleAdresse}
                  onChange={(e) => setNouvelleAdresse(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="CIN / RC / IF"
                  value={nouveauCin}
                  onChange={(e) => setNouveauCin(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Téléphone"
                  value={nouveauTelephone}
                  onChange={(e) => setNouveauTelephone(e.target.value)}
                  fullWidth
                />
              </>
            )}

            {/* ✅ Checkbox changement de situation */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChangement}
                  onChange={(e) => {
                    setIsChangement(e.target.checked);
                    if (e.target.checked) {
                      setSelectedType('');
                    }
                  }}
                  sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                />
              }
              label="Changement de situation"
            />


            {isChangement && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Qualité du déclarant</InputLabel>
                  <Select
                    value={qualiteDeclarant}
                    onChange={(e) => setQualiteDeclarant(e.target.value)}
                    label="Qualité du déclarant"
                  >
                    <MenuItem value="Attributaire">Attributaire</MenuItem>
                    <MenuItem value="Exploitant">Exploitant</MenuItem>
                    <MenuItem value="Propriétaire">Propriétaire</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Type de changement</InputLabel>
                  <Select
                    value={typeChangement}
                    onChange={(e) => setTypeChangement(e.target.value)}
                    label="Type de changement"
                  >
                    <MenuItem value="Viabilisation">Viabilisation</MenuItem>
                    <MenuItem value="Morcellement">Morcellement</MenuItem>
                    <MenuItem value="Renforcement">Renforcement</MenuItem>
                    <MenuItem value="Aménagement">Aménagement</MenuItem>
                    <MenuItem value="Construction">Construction</MenuItem>
                  </Select>
                </FormControl>

                <DatePicker
                  label="Date du changement"
                  value={dateChangement}
                  onChange={setDateChangement}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </>
            )}

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadDeclaration}
              sx={{
                mt: 1,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
              }}
            >
              Télécharger déclaration (PDF)
            </Button>
          </Box>
        </Paper>

        {/* Dialogue d'information */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ bgcolor: primaryColor, color: 'white' }}>Information</DialogTitle>
          <DialogContent><Typography>{dialogMessage}</Typography></DialogContent>
          <DialogActions><Button onClick={() => setOpenDialog(false)}>OK</Button></DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

