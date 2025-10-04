import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Grid, Checkbox, FormGroup, FormControlLabel,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import fetchWithAuth from '../utils/api';
import { useNavigate } from 'react-router-dom';

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
  <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
      {title}
    </Typography>
    <Divider sx={{ mb: 3 }} />
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
      };

      const res = await fetchWithAuth('http://localhost:8036/api/creances/search', {
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
    setPersonnePhysique(type === 'personnePhysique');
    setPersonneMoralePrivee(type === 'personneMoralePrivee');
    setPersonnePhysiqueEtranger(type === 'personnePhysiqueEtranger');
    setAutrePersonne(type === 'autrePersonne');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        Rechercher une créance
      </Typography>

      {/* Références de la créance */}
      <Section title="Références de la créance">
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Année d'imposition" value={anneeImposition} onChange={(e) => setAnneeImposition(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontWeight: "500" }}>Date de constatation :</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Du"
                value={dateConstatationFrom}
                onChange={(date) => setDateConstatationFrom(date)}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Au"
                value={dateConstatationTo}
                onChange={(date) => setDateConstatationTo(date)}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="zone-label">Type de zone</InputLabel>
            <Select
              labelId="zone-label"
              id="zone-select"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
            >
              <MenuItem value=""><em>Aucun</em></MenuItem>
              {zonesPossibles.map((z) => (
                <MenuItem key={z.value} value={z.value}>{z.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Section>

      {/* Références du bien */}
      <Section title="Références du bien">
        <Grid item xs={12} sm={6} md={6}>
          <TextField label="Identifiant du bien (TF/NI/REQ)" value={identifiantBien} onChange={(e) => setIdentifiantBien(e.target.value)} fullWidth size="small" />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField label="Adresse du bien" value={adresseBien} onChange={(e) => setAdresseBien(e.target.value)} fullWidth size="small" />
        </Grid>
      </Section>

      {/* Références du débiteur */}
      <Section title="Références du débiteur">
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormGroup row>
              {["Personne Physique", "Personne Morale Privée", "Personne Physique Étranger", "Autre Personne"].map((label, i) => (
                <FormControlLabel
                  key={label}
                  control={
                    <Checkbox
                      checked={[
                        personnePhysique,
                        personneMoralePrivee,
                        personnePhysiqueEtranger,
                        autrePersonne,
                      ][i]}
                      onChange={() =>
                        handleDebiteurTypeChange(
                          ["personnePhysique", "personneMoralePrivee", "personnePhysiqueEtranger", "autrePersonne"][i]
                        )
                      }
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Champs dynamiques en sous-bloc */}
        {(personnePhysique || personnePhysiqueEtranger || personneMoralePrivee || autrePersonne) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
              <Grid container spacing={2}>
                {personnePhysique && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="CIN" value={cin} onChange={(e) => setCin(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" />
                    </Grid>
                  </>
                )}

                {personneMoralePrivee && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Raison sociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Registre de commerce" value={registreCommerce} onChange={(e) => setRegistreCommerce(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" />
                    </Grid>
                  </>
                )}

                {personnePhysiqueEtranger && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" />
                    </Grid>
                  </>
                )}

                {autrePersonne && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Raison sociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Registre de commerce" value={registreCommerce} onChange={(e) => setRegistreCommerce(e.target.value)} fullWidth size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Identifiant fiscal" value={identifiantFiscal} onChange={(e) => setIdentifiantFiscal(e.target.value)} fullWidth size="small" />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Section>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" color="primary" size="large" onClick={handleRecherche} sx={{ px: 5, py: 1.5 }}>
          Rechercher
        </Button>
      </Box>
    </Box>
  );
};

export default RechercheCreance;
