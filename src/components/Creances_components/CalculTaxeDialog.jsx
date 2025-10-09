import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, 
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, 
  FormControlLabel, Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, InputAdornment, Paper, alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const orangeColor = '#ed6c02';
const orangeSecondaryColor = '#ff9800';
const exercicesPossibles = [2021, 2022, 2023, 2024, 2025];

export default function CalculTaxeDialog({
  open, calculTaxeForm, calculTaxeResult, errorMessage, handleCloseCalculTaxe, 
  handleCalculTaxeChange, handleCalculTaxeExercicesChange, handleCalculerTaxe 
}) {
  return (
    <Dialog 
      open={open} 
      onClose={handleCloseCalculTaxe} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        fontSize: '1.5rem',
        background: `linear-gradient(135deg, ${orangeColor} 0%, ${orangeSecondaryColor} 100%)`,
        color: 'white',
        py: 2.5
      }}>
        Calculer Taxe TNB
      </DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Superficie"
            name="superficie"
            type="number"
            value={calculTaxeForm.superficie}
            onChange={handleCalculTaxeChange}
            fullWidth
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">m²</InputAdornment> }}
          />
          <TextField
            label="Taux de la Zone (DH/m²)"
            name="taux"
            type="number"
            value={calculTaxeForm.taux}
            onChange={handleCalculTaxeChange}
            fullWidth
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">DH</InputAdornment> }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date de constatation"
              value={calculTaxeForm.dateConstatation}
              onChange={(date) => handleCalculTaxeChange({ target: { name: 'dateConstatation', value: date } })}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
            />
          </LocalizationProvider>
          <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <InputLabel id="calcul-exercices-label">Exercices</InputLabel>
            <Select
              labelId="calcul-exercices-label"
              id="calcul-exercices"
              multiple
              name="exercices"
              value={calculTaxeForm.exercices}
              onChange={handleCalculTaxeExercicesChange}
              renderValue={(selected) => selected.join(', ')}
              label="Exercices"
            >
              {exercicesPossibles.map((annee) => (
                <MenuItem key={annee} value={annee}>
                  <Checkbox checked={calculTaxeForm.exercices.indexOf(annee) > -1} />
                  <ListItemText primary={annee} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox checked={calculTaxeForm.avecDeclaration} onChange={handleCalculTaxeChange} name="avecDeclaration" color="primary" />}
            label="Défaut de déclaration (déclaration déposée hors délai)"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        {calculTaxeResult && (
          <Box mt={3} p={2} sx={{ bgcolor: alpha(orangeColor, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(orangeColor, 0.3) }}>
            <Typography variant="h6" fontWeight={700} color={orangeColor} mb={2}>
              Résultats du calcul
            </Typography>
            <TableContainer component={Paper} elevation={1}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(orangeColor, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Exercice</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Principale</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Défaut Décl.</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Taxe TNB</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pénalité</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Majoration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculTaxeResult.details.map((detail) => (
                    <TableRow key={detail.annee}>
                      <TableCell>{detail.annee}</TableCell>
                      <TableCell>{(calculTaxeForm.superficie * calculTaxeForm.taux).toFixed(2)}</TableCell>
                      <TableCell>{detail.defautDeclaration.toFixed(2)}</TableCell>
                      <TableCell>{detail.taxeTnb.toFixed(2)}</TableCell>
                      <TableCell>{detail.penalite.toFixed(2)}</TableCell>
                      <TableCell>{detail.majoration.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="h6" mt={2} fontWeight={700} color={orangeColor}>
              Montant total : {calculTaxeResult.montantTotal.toFixed(2)} DH
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCloseCalculTaxe} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
          Annuler
        </Button>
        <Button 
          onClick={handleCalculerTaxe} 
          variant="contained" 
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${orangeColor} 0%, ${orangeSecondaryColor} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, #e65100 0%, ${orangeColor} 100%)`,
            }
          }}
        >
          Calculer
        </Button>
      </DialogActions>
    </Dialog>
  );
}