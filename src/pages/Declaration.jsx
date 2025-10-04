import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControlLabel, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { saveAs } from 'file-saver';
import fetchWithAuth from '../utils/api';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export default function Declaration() {
  const [declarationId, setDeclarationId] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('possession'); // 'possession' ou 'mutation'
  const [dateMutation, setDateMutation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State pour contrôler l'ouverture du dialogue
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDownloadDeclaration = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', selectedType);
      if (selectedType === 'mutation' && dateMutation) {
        params.append('dateMutation', dateMutation.format('YYYY-MM-DD'));
      }

      const res = await fetchWithAuth(`http://localhost:8036/api/declaration/${declarationId}/pdf?${params.toString()}`, {
        method: 'GET',
        responseType: 'blob',
      });

      if (!res.ok) {
        console.error('Erreur lors de la récupération du PDF de déclaration:', res.status, res.statusText);
        setError(`Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`);

        if (res.status === 404) {
          // Si le statut est 404, cela signifie que l'identifiant du bien n'existe pas
          setDialogMessage("L'identifiant du bien n'existe pas. Merci de vérifier l'identifiant saisi.");
          setOpenDialog(true); // Ouvrir le dialogue
        } else {
          setDialogMessage(`Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`);
          setOpenDialog(true);
        }

        return;
      }

      const blob = await res.blob();
      saveAs(blob, `declaration_bien_${declarationId}.pdf`);
      setError('');
    } catch (error) {
      console.error("Erreur lors du téléchargement de la déclaration:", error);
      setError(`Erreur inattendue: ${error.message}`);
      setDialogMessage("L'identifiant du bien n'existe pas. Merci de vérifier l'identifiant saisi.");
      setOpenDialog(true);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === 'possession') {
      setDateMutation(null); // Reset dateMutation when switching to possession
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Fermer le dialogue
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Typography variant="h4" className="mb-4 font-bold text-blue-700">Déclaration</Typography>
        <Paper sx={{ p: 3, mb: 3,mt:3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'left' }}>
            <TextField
              label="Identifiant du bien"
              value={declarationId}
              onChange={(e) => setDeclarationId(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
            <FormControlLabel
              control={<Checkbox checked={selectedType === 'possession'} onChange={() => handleTypeChange('possession')} />}
              label="Possession"
            />
            <FormControlLabel
              control={<Checkbox checked={selectedType === 'mutation'} onChange={() => handleTypeChange('mutation')} />}
              label="Mutation"
            />
            {selectedType === 'mutation' && (
              <DatePicker
                label="Date de mutation"
                value={dateMutation}
                onChange={(date) => setDateMutation(date)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            )}
            <Button variant="contained" color="primary" onClick={handleDownloadDeclaration}>
              Télécharger déclaration format PDF
            </Button>
          </Box>
          {error && (
            <Typography color="error">{error}</Typography>
          )}
        </Paper>
      </Box>

      {/* Dialogue d'erreur */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Erreur</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}