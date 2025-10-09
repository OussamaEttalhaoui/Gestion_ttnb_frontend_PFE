import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControlLabel, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions, alpha
} from '@mui/material';
import { saveAs } from 'file-saver';
import fetchWithAuth from '../utils/api';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Download as DownloadIcon } from '@mui/icons-material';

// --- Styles cohérents avec le thème bleu/épuré ---
const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

export default function Declaration() {
  const [declarationId, setDeclarationId] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('possession'); // 'possession' ou 'mutation'
  const [dateMutation, setDateMutation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State pour contrôler l'ouverture du dialogue
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDownloadDeclaration = async () => {
    // Vérification de l'Identifiant du bien
    if (!declarationId) {
        setDialogMessage("Veuillez saisir l'Identifiant du bien.");
        setOpenDialog(true);
        return;
    }
    // Vérification de la date si mutation est sélectionnée
    if (selectedType === 'mutation' && !dateMutation) {
        setDialogMessage("Veuillez sélectionner une date de mutation.");
        setOpenDialog(true);
        return;
    }

    try {
      const params = new URLSearchParams();
      params.append('type', selectedType);
      if (selectedType === 'mutation' && dateMutation) {
        params.append('dateMutation', dayjs(dateMutation).format('YYYY-MM-DD'));
      }

      const res = await fetchWithAuth(`http://localhost:8036/api/declaration/${declarationId}/pdf?${params.toString()}`, {
        method: 'GET',
        responseType: 'blob',
      });

      if (!res.ok) {
        console.error('Erreur lors de la récupération du PDF de déclaration:', res.status, res.statusText);
        setError(`Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`);

        if (res.status === 404) {
          // L'identifiant du bien n'existe pas
          setDialogMessage("L'identifiant du bien n'existe pas. Merci de vérifier l'identifiant saisi.");
          setOpenDialog(true);
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
      setDialogMessage("Erreur inattendue. Veuillez réessayer.");
      setOpenDialog(true);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === 'possession') {
      setDateMutation(null); // Réinitialiser dateMutation
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Fermer le dialogue
    setDialogMessage(''); // Réinitialiser le message
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        
        {/* Titre stylisé */}
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

        {/* Conteneur principal (Paper stylisé) */}
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            maxWidth: 500, 
            mx: 'auto', // Centrer le formulaire
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* <Typography variant="h6" sx={{ color: primaryColor, mb: 3, fontWeight: 600 }}>
              Recherche et Téléchargement
          </Typography> */}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'stretch' }}>
            
            {/* Champ Identifiant */}
            <TextField
              label="Identifiant du bien"
              placeholder="Saisir l'identifiant du bien"
              value={declarationId}
              onChange={(e) => setDeclarationId(e.target.value)}
              fullWidth
              variant="outlined"
            />
            
            {/* Checkbox Possession */}
            <FormControlLabel
              control={<Checkbox 
                          checked={selectedType === 'possession'} 
                          onChange={() => handleTypeChange('possession')} 
                          sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                      />}
              label={<Typography fontWeight={500}>Possession</Typography>}
            />
            
            {/* Checkbox Mutation */}
            <FormControlLabel
              control={<Checkbox 
                          checked={selectedType === 'mutation'} 
                          onChange={() => handleTypeChange('mutation')} 
                          sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                      />}
              label={<Typography fontWeight={500}>Mutation</Typography>}
            />
            
            {/* DatePicker Mutation (si sélectionné) */}
            {selectedType === 'mutation' && (
              <DatePicker
                label="Date de mutation"
                value={dateMutation}
                onChange={(date) => setDateMutation(date)}
                slotProps={{ 
                    textField: { fullWidth: true, size: 'medium' } 
                }}
              />
            )}
            
            {/* Bouton de Téléchargement */}
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={handleDownloadDeclaration}
              sx={{ 
                mt: 1,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: `0 4px 10px ${alpha(primaryColor, 0.4)}`,
                '&:hover': {
                    background: `linear-gradient(90deg, #1565c0 0%, ${primaryColor} 100%)`,
                    boxShadow: `0 6px 15px ${alpha(primaryColor, 0.6)}`,
                }
              }}
            >
              Télécharger déclaration (PDF)
            </Button>
          </Box>
          
          {/* Affichage des erreurs non modales */}
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>
          )}
        </Paper>
      </Box>

      {/* Dialogue d'erreur/information stylisé */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: primaryColor, color: 'white', fontWeight: 600 }}>
            Information
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mt: 1 }}>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained"
            sx={{ 
                borderRadius: 2, 
                bgcolor: primaryColor,
                '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}