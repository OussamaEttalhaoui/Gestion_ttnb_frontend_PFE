import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Grid, Checkbox, FormGroup, FormControlLabel,
  Divider, alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import fetchWithAuth from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from '@mui/icons-material';
import API_BASE_URL from '../utils/apiConfig'


// Styles cohérents avec le thème bleu/épuré
const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

const zonesPossibles = [
  { value: 'IMMEUBLES', label: 'Zone Immeubles' },
  { value: 'VILLAS', label: 'Zone Villas' },
  { value: 'HABITAT', label: 'Zone Habitat' },
  { value: 'SECTEUR_BIEN_EQUIPEE', label: 'Secteur Bien Équipée' },
  { value: 'SECTEUR_MOYEN_EQUIPEE', label: 'Secteur Moyennement Équipée' },
  { value: 'SECTEUR_MAL_EQUIPEE', label: 'Secteur Mal Équipée' },
  { value: 'AUTRE', label: 'Autre Zone' },
];

const Section = ({ title, children }) => (
  <Paper 
    elevation={4} 
    sx={{ 
      p: 4, 
      mb: 4, 
      borderRadius: 3, 
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'box-shadow 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
      }
    }}
  >
    <Typography 
      variant="h5" 
      sx={{ 
        fontWeight: 700, 
        background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 2
      }}
    >
      {title}
    </Typography>
    <Divider sx={{ mb: 3, bgcolor: alpha(primaryColor, 0.3) }} />
    <Grid container spacing={3}>
      {children}
    </Grid>
  </Paper>
);

const RechercheCreance = () => {
  const [anneeImposition, setAnneeImposition] = useState('');
  const [dateConstatationFrom, setDateConstatationFrom] = useState(null);
  const [dateConstatationTo, setDateConstatationTo] = useState(null);
  const [zone, setZone] = useState('');
  const [etat, setEtat] = useState(''); 

  const [identifiantBien, setIdentifiantBien] = useState('');
  const [adresseBien, setAdresseBien] = useState('');

  const [personnePhysique, setPersonnePhysique] = useState(false);
  const [personneMoralePrivee, setPersonneMoralePrivee] = useState(false);
  const [personnePhysiqueEtranger, setPersonnePhysiqueEtranger] = useState(false);
  const [autrePersonne, setAutrePersonne] = useState(false);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [cin, setCin] = useState('');
  const [raisonSociale, setRaisonSociale] = useState('');
  const [registreCommerce, setRegistreCommerce] = useState('');
  const [identifiantFiscal, setIdentifiantFiscal] = useState('');


  const navigate = useNavigate();

  const handleRecherche = async () => {
    try {
      const criteria = {
        anneeExercice: anneeImposition ? parseInt(anneeImposition) : null,
        dateConstatationFrom: dateConstatationFrom ? dateConstatationFrom.format('YYYY-MM-DD') : null,
        dateConstatationTo: dateConstatationTo ? dateConstatationTo.format('YYYY-MM-DD') : null,
        zone: zone || null,
        identifiantBien: identifiantBien || null,
        adresseBien: adresseBien || null,
        nom: nom || null,
        prenom: prenom || null,
        cin: cin || null,
        raisonSociale: raisonSociale || null,
        registreCommerce: registreCommerce || null,
        identifiantFiscal: identifiantFiscal || null,
        etat: etat || null,
      };

      const res = await fetchWithAuth(`${API_BASE_URL}/api/creances/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      if (!res.ok) {
        console.error('Erreur lors de la recherche:', res.status, res.statusText);
        return;
      }

      const data = await res.json();
      localStorage.setItem('rechercheCreanceResultats', JSON.stringify(data));
      navigate('/recherche-creance-resultats');
    } catch (error) {
      console.error("Erreur lors de la recherche des créances:", error);
    }
  };

  const handleDebiteurTypeChange = (type) => {
    // Utilisation d'un objet temporaire pour évaluer les états actuels de manière sûre
    const currentState = {
        personnePhysique,
        personneMoralePrivee,
        personnePhysiqueEtranger,
        autrePersonne,
    };
    
    // Si l'état actuel du type est vrai, cela signifie qu'on veut le désélectionner (toggle)
    const isChecked = !currentState[type]; 

    // Réinitialiser tous les types à false
    setPersonnePhysique(false);
    setPersonneMoralePrivee(false);
    setPersonnePhysiqueEtranger(false);
    setAutrePersonne(false);

    // Activer uniquement le type sélectionné si l'action n'était pas de le désélectionner
    if (isChecked) {
        if (type === 'personnePhysique') setPersonnePhysique(true);
        if (type === 'personneMoralePrivee') setPersonneMoralePrivee(true);
        if (type === 'personnePhysiqueEtranger') setPersonnePhysiqueEtranger(true);
        if (type === 'autrePersonne') setAutrePersonne(true);
    }

    // Effacer les champs de texte
    setNom('');
    setPrenom('');
    setCin('');
    setRaisonSociale('');
    setRegistreCommerce('');
    setIdentifiantFiscal('');
};


  // Style des TextField/Select uniformisé
  const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* En-tête de page */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Rechercher une créance
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Utilisez les critères ci-dessous pour filtrer et trouver des créances spécifiques.
        </Typography>
      </Box>

      {/* Références de la créance */}
      <Section title="Critères de la créance">
        <Grid item xs={12} sm={6} md={4}>
          <TextField 
            label="Année d'imposition" 
            value={anneeImposition} 
            onChange={(e) => setAnneeImposition(e.target.value)} 
            fullWidth 
            size="small" 
            variant="outlined"
            sx={inputStyle}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={8}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontWeight: "600", color: 'text.secondary' }}>Date de constatation :</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Du"
                value={dateConstatationFrom}
                onChange={(date) => setDateConstatationFrom(date)}
                slotProps={{ 
                  textField: { 
                    size: "small",
                    variant: "outlined",
                    sx: inputStyle
                  }
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Au"
                value={dateConstatationTo}
                onChange={(date) => setDateConstatationTo(date)}
                slotProps={{ 
                  textField: { 
                    size: "small",
                    variant: "outlined",
                    sx: inputStyle
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          {/* Correction: Retrait de size="small" pour permettre au label de s'afficher correctement en mode outlined */}
          <FormControl fullWidth variant="outlined" sx={inputStyle}>
            <InputLabel id="zone-label">Type de zone</InputLabel>
            <Select
              labelId="zone-label"
              id="zone-select"
              value={zone || "none"}
              onChange={(e) => setZone(e.target.value === "none" ? "" : e.target.value)}
              label="Type de zone"
            >
              <MenuItem value="none"><em>Aucun</em></MenuItem>
              {zonesPossibles.map((z) => (
                <MenuItem key={z.value} value={z.value}>{z.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          {/* Correction: Retrait de size="small" pour permettre au label de s'afficher correctement en mode outlined */}
          <FormControl fullWidth variant="outlined" sx={inputStyle}>
            <InputLabel id="etat-label">État de la créance</InputLabel>
            <Select
              labelId="etat-label"
              id="etat-select"
              value={etat || "none"}
              onChange={(e) => setEtat(e.target.value === "none" ? "" : e.target.value)}
              label="État de la créance"
            >
              <MenuItem value="none"><em>Aucun</em></MenuItem>
              <MenuItem value="SOLDEE_PAR_INTERNET">Soldée en ligne e-service</MenuItem>
              <MenuItem value="SOLDEE">Soldée Régie</MenuItem>
              <MenuItem value="VALIDEE">Validée</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Section>

      {/* Références du bien */}
      <Section title="Références du bien immobilier">
        <Grid item xs={12} sm={6} md={6}>
          <TextField 
            label="Identifiant du bien (TF/NI/REQ)" 
            value={identifiantBien} 
            onChange={(e) => setIdentifiantBien(e.target.value)} 
            fullWidth 
            size="small" 
            variant="outlined"
            sx={inputStyle}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField 
            label="Adresse du bien" 
            value={adresseBien} 
            onChange={(e) => setAdresseBien(e.target.value)} 
            fullWidth 
            size="small" 
            variant="outlined"
            sx={inputStyle}
          />
        </Grid>
      </Section>

      {/* Références du débiteur */}
      <Section title="Informations du débiteur">
        <Grid item xs={12}>
          <FormControl component="fieldset" fullWidth>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Type de débiteur :</Typography>
            <FormGroup row>
              {["personnePhysique", "personneMoralePrivee", "personnePhysiqueEtranger", "autrePersonne"].map((type, i) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      // Remplacez eval(type) par l'accès direct aux variables d'état
                      checked={
                        (type === 'personnePhysique' && personnePhysique) ||
                        (type === 'personneMoralePrivee' && personneMoralePrivee) ||
                        (type === 'personnePhysiqueEtranger' && personnePhysiqueEtranger) ||
                        (type === 'autrePersonne' && autrePersonne)
                      }
                      onChange={() => handleDebiteurTypeChange(type)}
                      color="primary"
                    />
                  }
                  label={[
                    "Personne Physique", 
                    "Personne Morale Privée", 
                    "Personne Physique Étranger", 
                    "Autre Personne"
                  ][i]}
                  sx={{ mr: 4 }}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Champs dynamiques en sous-bloc stylisé */}
        {(personnePhysique || personnePhysiqueEtranger || personneMoralePrivee || autrePersonne) && (
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mt: 2, 
                bgcolor: alpha(primaryColor, 0.05), 
                borderRadius: 2,
                border: `1px solid ${alpha(primaryColor, 0.2)}`
              }}
            >
              <Grid container spacing={3}>
                {personnePhysique && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="CIN" value={cin} onChange={(e) => setCin(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                  </>
                )}

                {personneMoralePrivee && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Raison sociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Registre de commerce" value={registreCommerce} onChange={(e) => setRegistreCommerce(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                  </>
                )}

                {personnePhysiqueEtranger && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                  </>
                )}

                {autrePersonne && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Raison sociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Registre de commerce" value={registreCommerce} onChange={(e) => setRegistreCommerce(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" variant="outlined" sx={inputStyle} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Section>

      {/* Bouton de recherche */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={handleRecherche} 
          startIcon={<SearchIcon />}
          sx={{ 
            px: 6, 
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 10px 25px ${alpha(primaryColor, 0.5)}`,
              transform: 'translateY(-1px)'
            }
          }}
        >
          Lancer la recherche
        </Button>
      </Box>
    </Box>
  );
};

export default RechercheCreance;
