
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, 
  InputAdornment, alpha
} from '@mui/material';

const primaryColor = '#1976d2';
const successColor = '#2e7d32';
const successSecondaryColor = '#4caf50';

const zonesPossibles = [
  { value: 'IMMEUBLES', label: 'Zone Immeubles' },
  { value: 'VILLAS', label: 'Zone Villas' },
  { value: 'HABITAT', label: 'Zone Habitat' },
  { value: 'SECTEUR_BIEN_EQUIPEE', label: 'Secteur Bien Equipée' },
  { value: 'SECTEUR_MOYEN_EQUIPEE', label: 'Secteur Moyennement Equipée' },
  { value: 'SECTEUR_MAL_EQUIPEE', label: 'Secteur Mal Equipée' },
  { value: 'AUTRE', label: 'Autre Zone' },
];

export default function TauxZoneDialog({ open, tauxZones, handleCloseTaux, handleTauxChange, handleSaveTaux }) {
  return (
    <Dialog 
      open={open} 
      onClose={handleCloseTaux} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        fontSize: '1.5rem',
        background: `linear-gradient(135deg, ${successColor} 0%, ${successSecondaryColor} 100%)`, 
        color: 'white',
        py: 2.5
      }}>
        Définir les taux par zone
      </DialogTitle>
      <DialogContent sx={{ pt: 4 }}> 
        <Grid container spacing={2} pt={2}>
          {zonesPossibles.map(zone => (
            <Grid xs={12} key={zone.value}>
              <TextField
                label={zone.label}
                type="number"
                fullWidth
                
                // 💎 NOUVELLE CORRECTION DE VALUE: Simplification maximale
                // Assure que si la valeur existe, elle est affichée comme chaîne.
                // Sinon, c'est une chaîne vide.
                value={
                    tauxZones[zone.value] === null || tauxZones[zone.value] === undefined 
                        ? '' 
                        : String(tauxZones[zone.value])
                }
                
                onChange={(e) => handleTauxChange(zone.value, e.target.value)}
                variant="outlined"
                InputProps={{ endAdornment: <InputAdornment position="end">DH</InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCloseTaux} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Annuler
        </Button>
        <Button 
          onClick={handleSaveTaux} 
          variant="contained" 
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${successColor} 0%, ${successSecondaryColor} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, #1b5e20 0%, ${successColor} 100%)`,
            }
          }}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}