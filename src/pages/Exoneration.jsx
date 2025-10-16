import React, { useState } from 'react';
import {
  Box, Typography, Paper, FormControl, RadioGroup, FormControlLabel, Radio,
  TextField, Button, Alert, styled, InputLabel, Select, MenuItem, Stack, alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import fetchWithAuth from '../utils/api';
import dayjs from 'dayjs';
import { Save as SaveIcon } from '@mui/icons-material';
import API_BASE_URL from '../utils/apiConfig'


// --- Styles cohérents avec le thème bleu/épuré ---
const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

const Exoneration = () => {
  const [exonerationTemporaire, setExonerationTemporaire] = useState('');
  const [ref, setRef] = useState('');
  const [periodeExoneration, setPeriodeExoneration] = useState('');
  const [dateDebutExoneration, setDateDebutExoneration] = useState(null);
  const [motifExoneration, setMotifExoneration] = useState('');
  const [identifiantBien, setIdentifiantBien] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const motifsExoneration = [
    'autorisation de construire',
    'autorisation de lotissement',
    "l'avocation agricole"
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!identifiantBien) {
      setErrorMessage("Veuillez entrer l'identifiant du bien.");
      return;
    }
    if (!exonerationTemporaire) {
      setErrorMessage("Veuillez choisir un type d'exonération temporaire.");
      return;
    }
    if (!ref || !periodeExoneration || !dateDebutExoneration) {
      setErrorMessage("Veuillez remplir tous les champs (conditions, période, date de début).");
      return;
    }
    if (exonerationTemporaire === 'autorisation' && !motifExoneration) {
      setErrorMessage("Veuillez choisir un motif pour l'autorisation.");
      return;
    }

    try {
      // Préparation des données pour la création
      const createParams = new URLSearchParams();
      createParams.append('identifiantBien', identifiantBien);
      createParams.append('conditions', ref);
      createParams.append('periode', periodeExoneration);
      createParams.append('dateDebut', dayjs(dateDebutExoneration).format('YYYY-MM-DD'));
      if (exonerationTemporaire === 'autorisation' && motifExoneration) {
        createParams.append('motif', motifExoneration);
      }

      // ✅ Étape 1 : Créer l’exonération
      const response = await fetchWithAuth(`${API_BASE_URL}/api/exonerations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: createParams.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de la création de l’exonération');
      }
      setSuccessMessage('✅ Exonération enregistrée avec succès.');

      // ✅ Étape 2 : Génération PDF
      const pdfParams = new URLSearchParams();
      pdfParams.append('conditions', ref);
      pdfParams.append('periode', periodeExoneration);
      pdfParams.append('dateDebut', dayjs(dateDebutExoneration).format('YYYY-MM-DD'));
      if (exonerationTemporaire === 'autorisation' && motifExoneration) {
        pdfParams.append('motif', motifExoneration);
      }

      const pdfResponse = await fetchWithAuth(
        `${API_BASE_URL}/api/attestations/bien/${identifiantBien}?${pdfParams.toString()}`,
        { method: 'GET' } 
      );

      if (!pdfResponse.ok) {
           const errorText = await pdfResponse.text();
           throw new Error(`Erreur HTTP ${pdfResponse.status}: ${errorText || 'Génération PDF échouée.'}`);
      }
      
      const blob = await pdfResponse.blob(); // C'est ici qu'on demande le blob
      const pdfUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `attestation_exoneration_${identifiantBien}.pdf`;
      link.click();
      window.URL.revokeObjectURL(pdfUrl);

    } catch (err) {
      console.error(err);
      setErrorMessage(`❌ Impossible d'enregistrer ou de générer le PDF : ${err.message}`);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        
        {/* Titre stylisé */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            textAlign: 'center'
          }}
        >
          Gestion des Exonérations Temporaires TNB
        </Typography>

        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            maxWidth: 900, // Augmenter la largeur pour accommoder les longs libellés
            mx: 'auto', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMessage}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMessage}</Alert>}

          <form onSubmit={handleSubmit}>
            
            {/* Identifiant du bien */}
            <TextField
              label="Identifiant du bien"
              placeholder="Saisir l'identifiant unique du bien"
              value={identifiantBien}
              onChange={(e) => setIdentifiantBien(e.target.value)}
              fullWidth
              size="medium"
              sx={{ mb: 2 }}
            />

            {/* Type d'exonération */}
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: primaryColor, 
                  mb: 1.5,
                  borderBottom: `2px solid ${alpha(primaryColor, 0.2)}`,
                  pb: 0.5
                }}
              >
                Type d'exonération temporaire
              </Typography>
              <RadioGroup
                // Retiré 'row' pour permettre aux longs libellés de s'afficher verticalement
                value={exonerationTemporaire}
                onChange={(e) => setExonerationTemporaire(e.target.value)}
              >
                {/* REMISE DES LIBELLÉS COMPLETS COMME DEMANDÉ */}
                <FormControlLabel 
                  value="nonRaccordable" 
                  control={<Radio sx={{ color: primaryColor }} />} 
                  label="Terrains non raccordables aux réseaux d'eau ou d'électricité" 
                />
                <FormControlLabel 
                  value="zoneNonConstructible" 
                  control={<Radio sx={{ color: primaryColor }} />} 
                  label="Terrains situés dans des zones où la construction est interdite" 
                />
                <FormControlLabel 
                  value="autorisation" 
                  control={<Radio sx={{ color: primaryColor }} />} 
                  label="Terrains ayant obtenu une autorisation de lotir ou de construire" 
                />
                <FormControlLabel 
                  value="amenagement" 
                  control={<Radio sx={{ color: primaryColor }} />} 
                  label="Terrains faisant l'objet d'opérations d'aménagement" 
                />
              </RadioGroup>
            </FormControl>

            {/* Conditions, Période et Date */}
            <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
              <TextField
                label="Conditions / Justificatif requis (Réf.)"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                fullWidth
                size="medium"
              />
              <TextField
                label="Période d'exonération (années)"
                value={periodeExoneration}
                onChange={(e) => setPeriodeExoneration(e.target.value)}
                fullWidth
                size="medium"
                type="number"
                inputProps={{ min: 1, max: 10 }}
              />
              <DatePicker
                label="À compter du"
                value={dateDebutExoneration}
                onChange={(date) => setDateDebutExoneration(date)}
                slotProps={{
                  textField: { fullWidth: true, size: 'medium' }
                }}
              />
            </Stack>

            {/* Motif pour "Autorisation" (Select) */}
            {exonerationTemporaire === 'autorisation' && (
              <FormControl fullWidth size="medium" sx={{ mt: 1, mb:1 }}>
                <InputLabel sx={{ color: primaryColor }}>Motif de l'autorisation</InputLabel>
                <Select
                  value={motifExoneration}
                  label="Motif de l'autorisation"
                  onChange={(e) => setMotifExoneration(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Choisir un motif</em>
                  </MenuItem>
                  {motifsExoneration.map((motif) => (
                    <MenuItem key={motif} value={motif}>{motif}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Bouton de Soumission */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                type="submit" 
                sx={{ 
                  mt: 2, 
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
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
                Enregistrer et générer l’attestation
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default Exoneration;
