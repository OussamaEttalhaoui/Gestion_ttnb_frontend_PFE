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
      const response = await fetchWithAuth(`http://localhost:8036/api/exonerations/create`, {
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
        `http://localhost:8036/api/attestations/bien/${identifiantBien}?${pdfParams.toString()}`,
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




// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   FormControl,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   TextField,
//   Button,
//   Alert,
//   styled,
//   InputLabel,
//   Select,
//   MenuItem,
//   Stack
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs from 'dayjs';

// // Styled components
// const StyledPaper = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(3),
//   borderRadius: theme.spacing(1),
//   boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
// }));

// const StyledFormControl = styled(FormControl)(({ theme }) => ({
//   marginBottom: theme.spacing(3),
//   width: '100%',
// }));

// const StyledTypography = styled(Typography)(({ theme }) => ({
//   fontWeight: 'bold',
//   color: theme.palette.primary.main,
//   marginBottom: theme.spacing(1),
// }));

// const Exoneration = () => {
//   const [typeExoneration, setTypeExoneration] = useState('');
//   const [exonerationPermanente, setExonerationPermanente] = useState('');
//   const [exonerationTemporaire, setExonerationTemporaire] = useState('');
//   const [ref, setRef] = useState('');
//   const [periodeExoneration, setPeriodeExoneration] = useState('');
//   const [dateDebutExoneration, setDateDebutExoneration] = useState(null);
//   const [motifExoneration, setMotifExoneration] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const handleTypeExonerationChange = (event) => {
//     setTypeExoneration(event.target.value);
//     setExonerationPermanente('');
//     setExonerationTemporaire('');
//     setRef('');
//     setPeriodeExoneration('');
//     setDateDebutExoneration(null);
//     setMotifExoneration('');
//     setErrorMessage('');
//   };

//   const handleExonerationPermanenteChange = (event) => {
//     setExonerationPermanente(event.target.value);
//     setExonerationTemporaire('');
//     setRef('');
//     setPeriodeExoneration('');
//     setDateDebutExoneration(null);
//     setMotifExoneration('');
//     setErrorMessage('');
//   };

//   const handleExonerationTemporaireChange = (event) => {
//     setExonerationTemporaire(event.target.value);
//     setExonerationPermanente('');
//     setRef('');
//     setPeriodeExoneration('');
//     setDateDebutExoneration(null);
//     setMotifExoneration('');
//     setErrorMessage('');
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     setErrorMessage('');

//     if (typeExoneration === 'permanente' && !exonerationPermanente) {
//       setErrorMessage('Veuillez sélectionner une exonération permanente.');
//       return;
//     }

//     if (typeExoneration === 'temporaire' && !exonerationTemporaire) {
//       setErrorMessage('Veuillez sélectionner une exonération temporaire.');
//       return;
//     }

//     if ((exonerationTemporaire === 'nonRaccordable' || exonerationTemporaire === 'zoneNonConstructible') && !ref) {
//       setErrorMessage('Veuillez entrer une référence.');
//       return;
//     }

//     if (exonerationTemporaire === 'autorisation' && (!ref || !periodeExoneration || !dateDebutExoneration || !motifExoneration)) {
//       setErrorMessage('Veuillez remplir tous les champs pour l\'exonération temporaire (autorisation).');
//       return;
//     }

//     // Submit logic
//     console.log('Form submitted:', {
//       typeExoneration,
//       exonerationPermanente,
//       exonerationTemporaire,
//       ref,
//       periodeExoneration,
//       dateDebutExoneration,
//       motifExoneration,
//     });
//   };

//   const motifsExoneration = [
//     'autorisation de construire',
//     'autorisation de lotissement',
//     'l\'avocation agricole'
//   ];

//   // Helper component pour les champs temporaires
//   const TemporaireFields = () => (
//     <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
//       <TextField
//         label="Conditions / justificatif requis"
//         value={ref}
//         onChange={(e) => setRef(e.target.value)}
//         fullWidth
//         size="small"
//         variant="outlined"
//       />
//       <TextField
//         label="Période d'exonération (années)"
//         value={periodeExoneration}
//         onChange={(e) => setPeriodeExoneration(e.target.value)}
//         fullWidth
//         size="small"
//         variant="outlined"
//       />
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <DatePicker
//           label="À compter du"
//           value={dateDebutExoneration}
//           onChange={(date) => setDateDebutExoneration(date)}
//           slotProps={{
//             textField: { fullWidth: true, size: 'small', variant: 'outlined' }
//           }}
//         />
//       </LocalizationProvider>
//     </Stack>
//   );

//   return (
//     <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
//       <Typography variant="h4" gutterBottom sx={{ color: '#333', textAlign: 'center' }}>
//         Exonérations de la taxe sur les terrains urbains non bâtis (TNB)
//       </Typography>

//       <StyledPaper>
//         {errorMessage && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {errorMessage}
//           </Alert>
//         )}

//         <form onSubmit={handleSubmit}>
//           {/* Type d'exonération */}
//           <StyledFormControl component="fieldset">
//             <StyledTypography variant="subtitle1">Type d'exonération</StyledTypography>
//             <RadioGroup
//               aria-label="typeExoneration"
//               name="typeExoneration"
//               value={typeExoneration}
//               onChange={handleTypeExonerationChange}
//               row
//             >
//               <FormControlLabel value="permanente" control={<Radio />} label="Exonération permanente" />
//               <FormControlLabel value="temporaire" control={<Radio />} label="Exonération temporaire" />
//             </RadioGroup>
//           </StyledFormControl>

//           {/* Exonérations permanentes */}
//           {typeExoneration === 'permanente' && (
//             <StyledFormControl component="fieldset">
//               <StyledTypography variant="subtitle1">Exonérations permanentes</StyledTypography>
//               <RadioGroup
//                 aria-label="exonerationPermanente"
//                 name="exonerationPermanente"
//                 value={exonerationPermanente}
//                 onChange={handleExonerationPermanenteChange}
//               >
//                 <FormControlLabel
//                   value="etat"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Les terrains appartenant à l'État, aux collectivités territoriales et à leurs établissements publics.
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="habous"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Les terrains habous publics (waqf).
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="collectifs"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Les terrains collectifs (terres des communautés) et terres Guich.
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="institutions"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Les terrains appartenant à des institutions publiques, sociales ou caritatives et utilisés conformément à leur objet.
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="utilitePublique"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Les terrains affectés à l'utilité publique ou intégrés dans des projets de logement social (conventionnés).
//                     </Typography>
//                   }
//                 />
//               </RadioGroup>
//             </StyledFormControl>
//           )}

//           {/* Exonérations temporaires */}
//           {typeExoneration === 'temporaire' && (
//             <StyledFormControl component="fieldset">
//               <StyledTypography variant="subtitle1">Exonérations temporaires</StyledTypography>
//               <RadioGroup
//                 aria-label="exonerationTemporaire"
//                 name="exonerationTemporaire"
//                 value={exonerationTemporaire}
//                 onChange={handleExonerationTemporaireChange}
//               >
//                 <FormControlLabel
//                   value="nonRaccordable"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Terrains non raccordables aux réseaux d'eau ou d'électricité (certificat administratif requis).
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="zoneNonConstructible"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Terrains situés dans des zones où la construction est interdite ou réservées par les documents d'urbanisme.
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="autorisation"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Terrains ayant obtenu une autorisation de lotir ou de construire
//                     </Typography>
//                   }
//                 />
//                 <FormControlLabel
//                   value="amenagement"
//                   control={<Radio />}
//                   label={
//                     <Typography variant="body2" sx={{ display: 'block' }}>
//                       Terrains faisant l'objet d'opérations d'aménagement
//                     </Typography>
//                   }
//                 />
//               </RadioGroup>
//             </StyledFormControl>
//           )}

//           {/* Champs conditionnels */}
//           {(exonerationTemporaire === 'nonRaccordable' || exonerationTemporaire === 'zoneNonConstructible' || exonerationTemporaire === 'amenagement') && <TemporaireFields />}

//           {exonerationTemporaire === 'autorisation' && (
//             <Stack spacing={2}>
//               <TemporaireFields />
//               <FormControl fullWidth size="small">
//                 <InputLabel id="motif-exoneration-label">Motif d'exonération</InputLabel>
//                 <Select
//                   labelId="motif-exoneration-label"
//                   id="motifExoneration"
//                   value={motifExoneration}
//                   onChange={(e) => setMotifExoneration(e.target.value)}
//                   label="Motif d'exonération"
//                 >
//                   {motifsExoneration.map((motif) => (
//                     <MenuItem key={motif} value={motif}>
//                       {motif}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Stack>
//           )}

//           <Button variant="contained" color="primary" type="submit" sx={{ mt: 3 }}>
//             Soumettre
//           </Button>
//         </form>
//       </StyledPaper>
//     </Box>
//   );
// };

// export default Exoneration;
