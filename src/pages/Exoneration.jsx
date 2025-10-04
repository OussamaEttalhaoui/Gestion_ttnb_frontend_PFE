import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Alert,
  styled,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const Exoneration = () => {
  const [typeExoneration, setTypeExoneration] = useState('');
  const [exonerationPermanente, setExonerationPermanente] = useState('');
  const [exonerationTemporaire, setExonerationTemporaire] = useState('');
  const [ref, setRef] = useState('');
  const [periodeExoneration, setPeriodeExoneration] = useState('');
  const [dateDebutExoneration, setDateDebutExoneration] = useState(null);
  const [motifExoneration, setMotifExoneration] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTypeExonerationChange = (event) => {
    setTypeExoneration(event.target.value);
    setExonerationPermanente('');
    setExonerationTemporaire('');
    setRef('');
    setPeriodeExoneration('');
    setDateDebutExoneration(null);
    setMotifExoneration('');
    setErrorMessage('');
  };

  const handleExonerationPermanenteChange = (event) => {
    setExonerationPermanente(event.target.value);
    setExonerationTemporaire('');
    setRef('');
    setPeriodeExoneration('');
    setDateDebutExoneration(null);
    setMotifExoneration('');
    setErrorMessage('');
  };

  const handleExonerationTemporaireChange = (event) => {
    setExonerationTemporaire(event.target.value);
    setExonerationPermanente('');
    setRef('');
    setPeriodeExoneration('');
    setDateDebutExoneration(null);
    setMotifExoneration('');
    setErrorMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (typeExoneration === 'permanente' && !exonerationPermanente) {
      setErrorMessage('Veuillez sélectionner une exonération permanente.');
      return;
    }

    if (typeExoneration === 'temporaire' && !exonerationTemporaire) {
      setErrorMessage('Veuillez sélectionner une exonération temporaire.');
      return;
    }

    if ((exonerationTemporaire === 'nonRaccordable' || exonerationTemporaire === 'zoneNonConstructible') && !ref) {
      setErrorMessage('Veuillez entrer une référence.');
      return;
    }

    if (exonerationTemporaire === 'autorisation' && (!ref || !periodeExoneration || !dateDebutExoneration || !motifExoneration)) {
      setErrorMessage('Veuillez remplir tous les champs pour l\'exonération temporaire (autorisation).');
      return;
    }

    // Submit logic
    console.log('Form submitted:', {
      typeExoneration,
      exonerationPermanente,
      exonerationTemporaire,
      ref,
      periodeExoneration,
      dateDebutExoneration,
      motifExoneration,
    });
  };

  const motifsExoneration = [
    'autorisation de construire',
    'autorisation de lotissement',
    'l\'avocation agricole'
  ];

  // Helper component pour les champs temporaires
  const TemporaireFields = () => (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
      <TextField
        label="Conditions / justificatif requis"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        fullWidth
        size="small"
        variant="outlined"
      />
      <TextField
        label="Période d'exonération (années)"
        value={periodeExoneration}
        onChange={(e) => setPeriodeExoneration(e.target.value)}
        fullWidth
        size="small"
        variant="outlined"
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="À compter du"
          value={dateDebutExoneration}
          onChange={(date) => setDateDebutExoneration(date)}
          slotProps={{
            textField: { fullWidth: true, size: 'small', variant: 'outlined' }
          }}
        />
      </LocalizationProvider>
    </Stack>
  );

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#333', textAlign: 'center' }}>
        Exonérations de la taxe sur les terrains urbains non bâtis (TNB)
      </Typography>

      <StyledPaper>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Type d'exonération */}
          <StyledFormControl component="fieldset">
            <StyledTypography variant="subtitle1">Type d'exonération</StyledTypography>
            <RadioGroup
              aria-label="typeExoneration"
              name="typeExoneration"
              value={typeExoneration}
              onChange={handleTypeExonerationChange}
              row
            >
              <FormControlLabel value="permanente" control={<Radio />} label="Exonération permanente" />
              <FormControlLabel value="temporaire" control={<Radio />} label="Exonération temporaire" />
            </RadioGroup>
          </StyledFormControl>

          {/* Exonérations permanentes */}
          {typeExoneration === 'permanente' && (
            <StyledFormControl component="fieldset">
              <StyledTypography variant="subtitle1">Exonérations permanentes</StyledTypography>
              <RadioGroup
                aria-label="exonerationPermanente"
                name="exonerationPermanente"
                value={exonerationPermanente}
                onChange={handleExonerationPermanenteChange}
              >
                <FormControlLabel
                  value="etat"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Les terrains appartenant à l'État, aux collectivités territoriales et à leurs établissements publics.
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="habous"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Les terrains habous publics (waqf).
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="collectifs"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Les terrains collectifs (terres des communautés) et terres Guich.
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="institutions"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Les terrains appartenant à des institutions publiques, sociales ou caritatives et utilisés conformément à leur objet.
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="utilitePublique"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Les terrains affectés à l'utilité publique ou intégrés dans des projets de logement social (conventionnés).
                    </Typography>
                  }
                />
              </RadioGroup>
            </StyledFormControl>
          )}

          {/* Exonérations temporaires */}
          {typeExoneration === 'temporaire' && (
            <StyledFormControl component="fieldset">
              <StyledTypography variant="subtitle1">Exonérations temporaires</StyledTypography>
              <RadioGroup
                aria-label="exonerationTemporaire"
                name="exonerationTemporaire"
                value={exonerationTemporaire}
                onChange={handleExonerationTemporaireChange}
              >
                <FormControlLabel
                  value="nonRaccordable"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Terrains non raccordables aux réseaux d'eau ou d'électricité (certificat administratif requis).
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="zoneNonConstructible"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Terrains situés dans des zones où la construction est interdite ou réservées par les documents d'urbanisme.
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="autorisation"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Terrains ayant obtenu une autorisation de lotir ou de construire
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="amenagement"
                  control={<Radio />}
                  label={
                    <Typography variant="body2" sx={{ display: 'block' }}>
                      Terrains faisant l'objet d'opérations d'aménagement
                    </Typography>
                  }
                />
              </RadioGroup>
            </StyledFormControl>
          )}

          {/* Champs conditionnels */}
          {(exonerationTemporaire === 'nonRaccordable' || exonerationTemporaire === 'zoneNonConstructible' || exonerationTemporaire === 'amenagement') && <TemporaireFields />}

          {exonerationTemporaire === 'autorisation' && (
            <Stack spacing={2}>
              <TemporaireFields />
              <FormControl fullWidth size="small">
                <InputLabel id="motif-exoneration-label">Motif d'exonération</InputLabel>
                <Select
                  labelId="motif-exoneration-label"
                  id="motifExoneration"
                  value={motifExoneration}
                  onChange={(e) => setMotifExoneration(e.target.value)}
                  label="Motif d'exonération"
                >
                  {motifsExoneration.map((motif) => (
                    <MenuItem key={motif} value={motif}>
                      {motif}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}

          <Button variant="contained" color="primary" type="submit" sx={{ mt: 3 }}>
            Soumettre
          </Button>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default Exoneration;
