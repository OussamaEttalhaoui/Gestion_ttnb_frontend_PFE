import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, 
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, 
  FormControlLabel, Box,alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';
const exercicesPossibles = [2023, 2024, 2025, 2026, 2027,2028,2029,2030,2031,2032];

export default function CreanceFormDialog({
  open, selected, form, errorMessage, handleClose, handleChange, handleDateChange, 
  handleExercicesChange, handleSubmit, user
}) {
  const isCreation = !selected;
  
  // Validation des permissions (à des fins d'affichage, la validation est aussi dans handleSubmit)
  const canSubmit = isCreation ? user?.permissions?.includes('CREATE') : user?.permissions?.includes('UPDATE');

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        fontSize: '1.5rem',
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        color: 'white',
        py: 2.5
      }}>
        {isCreation ? 'Ajouter Créance' : 'Modifier Créance'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {!canSubmit && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            Vous n'avez pas la permission de {isCreation ? 'créer' : 'modifier'} cette créance.
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Identifiant du bien (TF/Req/Int)"
            name="identifiantBien"
            value={form.identifiantBien || ''}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            disabled={!canSubmit}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date Constatation"
              value={form.dateConstatation}
              onChange={handleDateChange}
              disabled={!canSubmit}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
            />
          </LocalizationProvider>

          <FormControlLabel
            control={<Checkbox checked={form.avecDeclaration} onChange={handleChange} name="avecDeclaration" color="primary" disabled={!canSubmit} />}
            label="Défaut de déclaration (déclaration déposée hors délai)"
            sx={{ fontWeight: 600 }}
          />

          <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <InputLabel id="exercices-label">Exercices</InputLabel>
            <Select
              labelId="exercices-label"
              id="exercices"
              multiple
              name="exercices"
              value={form.exercices}
              onChange={handleExercicesChange}
              renderValue={(selected) => selected.join(', ')}
              label="Exercices"
              disabled={!canSubmit}
            >
              {exercicesPossibles.map((annee) => (
                <MenuItem key={annee} value={annee}>
                  <Checkbox checked={form.exercices.indexOf(annee) > -1} />
                  <ListItemText primary={annee} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!canSubmit}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(primaryColor, 0.4)}`,
              background: `linear-gradient(135deg, #1565c0 0%, #1976d2 100%)`,
            }
          }}
        >
          {isCreation ? 'Enregistrer & Générer PDF' : 'Modifier & Générer PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}