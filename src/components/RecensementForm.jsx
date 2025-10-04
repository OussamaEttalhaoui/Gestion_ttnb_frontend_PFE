import React, { useState, useEffect } from 'react'
import {
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Paper,
  Typography,
  Box,
  IconButton
} from '@mui/material'
import { getNames } from 'country-list'
import MenuItem from '@mui/material/MenuItem'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import fetchWithAuth from '../utils/api';

const typesDebiteur = [
  { value: 'physique', label: 'Personne physique' },
  { value: 'etranger', label: 'Personne physique Résident étranger' },
  { value: 'morale', label: 'Personne morale privée' },
  { value: 'autre', label: 'Autre personne' },
]

const typesBien = [
  { value: 'immatricule', label: 'Immatriculé' },
  { value: 'enCours', label: "En cours d'immatriculation" },
  { value: 'nonImmatricule', label: 'Non immatriculé' },
]

const countries = getNames()

  const searchDebiteur = async (type, value) => {
  const res = await fetchWithAuth(`http://localhost:8036/api/debiteurs/search?type=${type}&value=${value}`)
  if (!res.ok) return null
  return res.json()
  }


const zonesAffectation = [
  { value: 'IMMEUBLES', label: 'Zone Immeubles' },
  { value: 'VILLAS', label: 'Zone Villas' },
  { value: 'HABITAT', label: 'Zone Habitat' },
  { value: 'SECTEUR_BIEN_EQUIPEE', label: 'Secteur Bien Equipée' },
  { value: 'SECTEUR_MOYEN_EQUIPEE', label: 'Secteur Moyennement Equipée' },
  { value: 'SECTEUR_MAL_EQUIPEE', label: 'Secteur Mal Equipée' },
  { value: 'AUTRE', label: 'Autre Zone' },
];



export default function RecensementForm({ initialValues, onSave, onCancel }) {
  const [form, setForm] = useState({
    debiteur: {
      typeDebiteur: 'physique',
      cin: '',
      numeroPermis: '',
      nom: '',
      prenom: '',
      identInterne: '',
      telephone: '',
      email: '',
      identifiantFiscal: '',
      adresse: '',
      numeroPasseport: '',
      carteSejour: '',
      pays: '',
      cnss: '',
      registreCommerce: '',
      raisonSociale: '',
      villeRc: '',
      type: '',
      numero: '',
    },
    bien: {
      typeBien: 'immatricule',
      numeroTitreFoncier: '',
      adresse: '',
      quottePart: '',
      superficie: '',
      dateAcquisition: '',
      numeroCertificatPropriete: '',
      numeroInterne: '',
      coordonneeX: '', 
      coordonneeY: '',
    },
    dateRecensement: '',
  })


  
  const [openDialog, setOpenDialog] = useState(false)

  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => setOpenDialog(false)


  const [openDialogUnique, setOpenDialogUnique] = useState(false);

  const handleOpenDialogUnique = () => setOpenDialogUnique(true);
  const handleCloseDialogUnique = () => setOpenDialogUnique(false);


  // Pour les débiteurs en corporation
  const [debiteurCorpForm, setDebiteurCorpForm] = useState({
    typeDebiteur: 'physique',
    cin: '',
    numeroPermis: '',
    nom: '',
    prenom: '',
    identInterne: '',
    telephone: '',
    email: '',
    identifiantFiscal: '',
    adresse: '',
    numeroPasseport: '',
    carteSejour: '',
    pays: '',
    cnss: '',
    registreCommerce: '',
    raisonSociale: '',
    villeRc: '',
    type: '',
    numero: '',
    quotePart: '',
  })
  const [debiteursCorporation, setDebiteursCorporation] = useState([])


  const mapTypeDebiteurFromBackend = (type) => {
  if (type === 'physique') return 'physique'
  if (type === 'physiqueEtranger') return 'etranger'
  if (type === 'moralePrivee') return 'morale'
  if (type === 'autre') return 'autre'
  return 'physique' // fallback
}


  // Remplir le formulaire si initialValues existe (modification)
  // useEffect(() => {
  //   if (initialValues) {
  //     setForm({
  //       debiteur: { ...form.debiteur, ...initialValues.debiteur },
  //       bien: { ...form.bien, ...initialValues.bien },
  //       dateRecensement: initialValues.dateRecensement || '',
  //     })
  //     setDebiteursCorporation(initialValues.debiteursCorporation || [])
  //   }
  //   // eslint-disable-next-line
  // }, [initialValues])
  useEffect(() => {
  if (initialValues) {
    setForm({
      debiteur: { 
        ...form.debiteur, 
        ...initialValues.debiteur,
        typeDebiteur: mapTypeDebiteurFromBackend(initialValues.debiteur.typeDebiteur) // 👈 ici
      },
      bien: { ...form.bien, ...initialValues.bien },
      dateRecensement: initialValues.dateRecensement || '',
    })
    setDebiteursCorporation(initialValues.debiteursCorporation || [])
  }
  // eslint-disable-next-line
}, [initialValues])


  const handleChange = (e, section = null) => {
    const { name, value, type, checked } = e.target
    if (section) {
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: type === 'checkbox' ? checked : value,
        },
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Gestion du débiteur corporation
  const handleCorpChange = (e) => {
    const { name, value, type, checked } = e.target
    setDebiteurCorpForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAddDebiteurCorporation = () => {
  if (debiteurCorpForm.nom && debiteurCorpForm.quotePart) {
    setDebiteursCorporation([
      ...debiteursCorporation,
      {
        debiteur: {
          ...debiteurCorpForm,
          quotePart: undefined // On retire quotePart du debiteur
        },
        quotePart: debiteurCorpForm.quotePart
      }
    ])
    setDebiteurCorpForm({
      typeDebiteur: 'physique',
      cin: '',
      numeroPermis: '',
      nom: '',
      prenom: '',
      identInterne: '',
      telephone: '',
      email: '',
      identifiantFiscal: '',
      adresse: '',
      numeroPasseport: '',
      carteSejour: '',
      pays: '',
      cnss: '',
      registreCommerce: '',
      raisonSociale: '',
      villeRc: '',
      type: '',
      numero: '',
      quotePart: '',
    })
  }
}

  const handleDeleteDebiteurCorporation = (idx) => {
    setDebiteursCorporation(debiteursCorporation.filter((_, i) => i !== idx))
  }

  // Champs à afficher selon le type de débiteur
  const renderDebiteurFields = () => {
    const t = form.debiteur.typeDebiteur
    switch (t) {
      case 'physique':
        return (
          <>
            {/* <Grid item xs={12} sm={6}><TextField label="N° CIN *" name="cin" value={form.debiteur.cin} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid> */}
            <Grid item xs={12} sm={6}>
                <TextField
                 label="N° CIN *"
                 name="cin"
                 value={form.debiteur.cin}
                 onChange={e => handleChange(e, 'debiteur')}
                 onBlur={async (e) => {
                   const cinValue = e.target.value.trim();
                   if (!cinValue) return;
                   try {
                     const debiteurData = await searchDebiteur("cin", cinValue);
                     console.log("Debiteur trouvé:", debiteurData); 
                     if (debiteurData) {
                       setForm(prev => ({
                         ...prev,
                         debiteur: {
                           ...prev.debiteur,
                           ...debiteurData, // remplissage automatique
                           typeDebiteur: debiteurData.typeDebiteur || prev.debiteur.typeDebiteur
                         }
                       }));
                     }
                   } catch (error) {
                     console.error("Erreur lors de la recherche du débiteur:", error);
                   }
                  }}

                 fullWidth
                 required
               />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Numéro permis *" name="numeroPermis" value={form.debiteur.numeroPermis} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Nom *" name="nom" value={form.debiteur.nom} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Prénom *" name="prenom" value={form.debiteur.prenom} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Ident interne" name="identInterne" value={form.debiteur.identInterne} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Téléphone" name="telephone" value={form.debiteur.telephone} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Email" name="email" value={form.debiteur.email} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={form.debiteur.identifiantFiscal} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Adresse *" name="adresse" value={form.debiteur.adresse} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
          </>
        )
      case 'etranger':
        return (
          <>
            <Grid item xs={12}><FormControlLabel control={<Checkbox checked readOnly />} label="Résident étranger" /></Grid>
            {/* <Grid item xs={12} sm={6}><TextField label="Numéro de passeport" name="numeroPasseport" value={form.debiteur.numeroPasseport} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro de passeport"
                name="numeroPasseport"
                value={form.debiteur.numeroPasseport}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const debiteurData = await searchDebiteur("passeport", value);
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }));
                  }
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Carte séjour" name="carteSejour" value={form.debiteur.carteSejour} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Numéro permis *" name="numeroPermis" value={form.debiteur.numeroPermis} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Nom *" name="nom" value={form.debiteur.nom} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Prénom *" name="prenom" value={form.debiteur.prenom} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Ident interne" name="identInterne" value={form.debiteur.identInterne} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Pays" name="pays" value={form.debiteur.pays} onChange={e => handleChange(e, 'debiteur')} fullWidth required MenuProps={{ container: document.body, PaperProps: { style: { maxHeight: 300, zIndex: 2000 } } }}>{countries.map((country) => (<MenuItem key={country} value={country}>{country}</MenuItem>))}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField label="Téléphone" name="telephone" value={form.debiteur.telephone} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Email" name="email" value={form.debiteur.email} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={form.debiteur.identifiantFiscal} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Adresse *" name="adresse" value={form.debiteur.adresse} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
          </>
        )
      case 'morale':
        return (
          <>
            {/* <Grid item xs={12} sm={6}><TextField label="CNSS *" name="cnss" value={form.debiteur.cnss} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="CNSS *"
                name="cnss"
                value={form.debiteur.cnss}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const debiteurData = await searchDebiteur("cnss", value);
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }));
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Identifiant fiscal *" name="identifiantFiscal" value={form.debiteur.identifiantFiscal} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            {/* <Grid item xs={12} sm={6}><TextField label="Registre de commerce *" name="registreCommerce" value={form.debiteur.registreCommerce} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Registre de commerce *"
                name="registreCommerce"
                value={form.debiteur.registreCommerce}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const debiteurData = await searchDebiteur("rc", value);
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }));
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Téléphone" name="telephone" value={form.debiteur.telephone} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Raison sociale *" name="raisonSociale" value={form.debiteur.raisonSociale} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Ville RC *" name="villeRc" value={form.debiteur.villeRc} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12}><TextField label="Adresse *" name="adresse" value={form.debiteur.adresse} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12}><TextField label="Email" name="email" value={form.debiteur.email} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
          </>
        )
      case 'autre':
        return (
          <>
            <Grid item xs={12} sm={6}><TextField label="Type *" name="type" value={form.debiteur.type} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            {/* <Grid item xs={12} sm={6}><TextField label="Numéro *" name="numero" value={form.debiteur.numero} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid> */}
            <Grid item xs={12} sm={6}>
                <TextField
                  label="Numéro *"
                  name="numero"
                  value={form.debiteur.numero}
                  onChange={e => handleChange(e, 'debiteur')}
                  onBlur={async (e) => {
                    const value = e.target.value.trim();
                    if (!value) return;
                    const debiteurData = await searchDebiteur("numero", value);
                    if (debiteurData) {
                      setForm(prev => ({
                        ...prev,
                        debiteur: { ...prev.debiteur, ...debiteurData }
                      }));
                    }
                  }}
                  fullWidth
                  required
                />
            </Grid>
            {/* <Grid item xs={12} sm={6}><TextField label="CNSS" name="cnss" value={form.debiteur.cnss} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="CNSS *"
                name="cnss"
                value={form.debiteur.cnss}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const debiteurData = await searchDebiteur("cnss", value);
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }));
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={form.debiteur.identifiantFiscal} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            {/* <Grid item xs={12} sm={6}><TextField label="Registre de commerce" name="registreCommerce" value={form.debiteur.registreCommerce} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Registre de commerce *"
                name="registreCommerce"
                value={form.debiteur.registreCommerce}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim();
                  if (!value) return;
                  const debiteurData = await searchDebiteur("rc", value);
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }));
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField select label="Pays" name="pays" value={form.debiteur.pays} onChange={e => handleChange(e, 'debiteur')} fullWidth required MenuProps={{ container: document.body, PaperProps: { style: { maxHeight: 300, zIndex: 2000 } } }}>{countries.map((country) => (<MenuItem key={country} value={country}>{country}</MenuItem>))}</TextField></Grid>
            <Grid item xs={12} sm={6}><TextField label="Téléphone" name="telephone" value={form.debiteur.telephone} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Raison sociale *" name="raisonSociale" value={form.debiteur.raisonSociale} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Ville RC" name="villeRc" value={form.debiteur.villeRc} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12}><TextField label="Adresse *" name="adresse" value={form.debiteur.adresse} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12}><TextField label="Email" name="email" value={form.debiteur.email} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
          </>
        )
      default:
        return null
    }
  }

  // Champs à afficher selon le type de bien
  const renderBienFields = () => {
    const t = form.bien.typeBien
    if (t === 'immatricule') {
      return (
        <>
          <Grid item xs={12} sm={6}><TextField label="Numéro titre foncier" name="numeroTitreFoncier" value={form.bien.numeroTitreFoncier} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Adresse" name="adresse" value={form.bien.adresse} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Superficie (m²)" name="superficie" value={form.bien.superficie} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField select label="Type de zone" name="zone" value={form.bien.zone || ''} onChange={e => handleChange(e, 'bien')} fullWidth> {zonesAffectation.map((zone) => ( <MenuItem key={zone.value} value={zone.value}>{zone.label}</MenuItem> ))} </TextField></Grid>
          <Grid item xs={12} sm={6}><TextField label="Date d'acquisition" name="dateAcquisition" type="date" value={form.bien.dateAcquisition} onChange={e => handleChange(e, 'bien')} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="coordonnée X" name="coordonneeX" value={form.bien.coordonneeX} onChange={e => handleChange(e, 'bien')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="coordonnée Y" name="coordonneeY" value={form.bien.coordonneeY} onChange={e => handleChange(e, 'bien')} fullWidth />
          </Grid>
        </>
      )
    }
    if (t === 'enCours') {
      return (
        <>
          <Grid item xs={12} sm={6}><TextField label="N° Certificat de propriété" name="numeroCertificatPropriete" value={form.bien.numeroCertificatPropriete} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Adresse" name="adresse" value={form.bien.adresse} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Superficie (m²)" name="superficie" value={form.bien.superficie} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField select label="Type de zone" name="zone" value={form.bien.zone || ''} onChange={e => handleChange(e, 'bien')} fullWidth> {zonesAffectation.map((zone) => ( <MenuItem key={zone.value} value={zone.value}>{zone.label}</MenuItem> ))} </TextField></Grid>
          <Grid item xs={12} sm={6}><TextField label="Date d'acquisition" name="dateAcquisition" type="date" value={form.bien.dateAcquisition} onChange={e => handleChange(e, 'bien')} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="coordonnée X" name="coordonneeX" value={form.bien.coordonneeX} onChange={e => handleChange(e, 'bien')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="coordonnée Y" name="coordonneeY" value={form.bien.coordonneeY} onChange={e => handleChange(e, 'bien')} fullWidth />
          </Grid>
        </>
      )
    }
    if (t === 'nonImmatricule') {
      return (
        <>
          <Grid item xs={12} sm={6}><TextField label="Numéro interne" name="numeroInterne" value={form.bien.numeroInterne} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Adresse" name="adresse" value={form.bien.adresse} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Superficie (m²)" name="superficie" value={form.bien.superficie} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField select label="Type de zone" name="zone" value={form.bien.zone || ''} onChange={e => handleChange(e, 'bien')} fullWidth> {zonesAffectation.map((zone) => ( <MenuItem key={zone.value} value={zone.value}>{zone.label}</MenuItem> ))} </TextField></Grid>
          <Grid item xs={12} sm={6}><TextField label="Date d'acquisition" name="dateAcquisition" type="date" value={form.bien.dateAcquisition} onChange={e => handleChange(e, 'bien')} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="coordonnée X" name="coordonneeX" value={form.bien.coordonneeX} onChange={e => handleChange(e, 'bien')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="coordonnée Y" name="coordonneeY" value={form.bien.coordonneeY} onChange={e => handleChange(e, 'bien')} fullWidth />
          </Grid>
        </>
      )
    }
    return null
  }

  const mapTypeDebiteur = (type) => {
    if (type === 'physique') return 'physique'
    if (type === 'etranger') return 'physiqueEtranger'
    if (type === 'morale') return 'moralePrivee'
    if (type === 'autre') return 'autre'
    return type
  }

  const mapTypeBien = (type) => {
    if (type === 'immatricule') return 'immatricule'
    if (type === 'enCours') return 'enCours'
    if (type === 'nonImmatricule') return 'nonImmatricule'
    return type
  }

  // Appelée à la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSend = {
      debiteur: {
        ...form.debiteur,
        typeDebiteur: mapTypeDebiteur(form.debiteur.typeDebiteur),
      },
      bien: {
        ...form.bien,
        typeBien: mapTypeBien(form.bien.typeBien),
      },
      dateRecensement: form.dateRecensement,
      debiteursCorporation: debiteursCorporation,
    }
    if (onSave) onSave(dataToSend)
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, margin: 'auto', mt: 4, zIndex: 1300 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
         <FormLabel component="legend" sx={{ mb: 2 }}>Ajouter un débiteur</FormLabel>
         <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
           <Button variant="outlined" onClick={handleOpenDialogUnique}>
             Propriétaire unique
           </Button>
         
           <Button variant="outlined" onClick={() => setOpenDialog(true)}>
             Propriétaire en indivision
           </Button>
         </Box>


      <Dialog open={openDialogUnique} onClose={handleCloseDialogUnique} maxWidth="lg" fullWidth>
         <DialogTitle>Ajouter un propriétaire unique</DialogTitle>
         <DialogContent dividers>
           <RadioGroup
             row
             name="typeDebiteur"
             value={form.debiteur.typeDebiteur}
             onChange={e => handleChange(e, 'debiteur')}
             sx={{ mb: 2 }}
           >
             {typesDebiteur.map(type => (
               <FormControlLabel key={type.value} value={type.value} control={<Radio />} label={type.label} />
             ))}
           </RadioGroup>
       
           <Grid container spacing={2}>
             {renderDebiteurFields()}
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleCloseDialogUnique} color="secondary">Annuler</Button>
           <Button onClick={handleCloseDialogUnique} variant="contained" color="primary">OK</Button>
         </DialogActions>
      </Dialog>



        {/* Section débiteurs en corporation */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            Liste des propriétaires en indivision
          </Typography> 
          {/* Liste des débiteurs ajoutés */}
          {debiteursCorporation.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {debiteursCorporation.map((corp, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography>
                    {corp.debiteur.typeDebiteur === 'physique' && `${corp.debiteur.nom} ${corp.debiteur.prenom}`}
                    {corp.debiteur.typeDebiteur === 'morale' && `${corp.debiteur.raisonSociale}`}
                    {corp.debiteur.typeDebiteur === 'autre' && `${corp.debiteur.type} ${corp.debiteur.numero}`}
                    {corp.debiteur.typeDebiteur === 'etranger' && `${corp.debiteur.nom} ${corp.debiteur.prenom}`}
                    {" - Quote-part : " + corp.quotePart}
                  </Typography>
                  <IconButton color="error" onClick={() => handleDeleteDebiteurCorporation(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </Box>


        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
         <DialogTitle>Ajouter un débiteur en corporation</DialogTitle>
         <DialogContent dividers>
           <RadioGroup
             row
             name="typeDebiteur"
             value={debiteurCorpForm.typeDebiteur}
             onChange={handleCorpChange}
             sx={{ mb: 2 }}
           >
             {typesDebiteur.map(type => (
               <FormControlLabel key={type.value} value={type.value} control={<Radio />} label={type.label} />
             ))}
           </RadioGroup>
        
           <Grid container spacing={2}>
             {(() => {
              switch (debiteurCorpForm.typeDebiteur) {
                case 'physique':
                  return (
                    <>
                      <Grid item xs={12} sm={3}><TextField label="Nom *" name="nom" value={debiteurCorpForm.nom} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Prénom *" name="prenom" value={debiteurCorpForm.prenom} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="CIN" name="cin" value={debiteurCorpForm.cin} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Numéro permis" name="numeroPermis" value={debiteurCorpForm.numeroPermis} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Ident interne" name="identInterne" value={debiteurCorpForm.identInterne} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Téléphone" name="telephone" value={debiteurCorpForm.telephone} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Email" name="email" value={debiteurCorpForm.email} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={debiteurCorpForm.identifiantFiscal} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Adresse" name="adresse" value={debiteurCorpForm.adresse} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Quote-part *" name="quotePart" value={debiteurCorpForm.quotePart} onChange={handleCorpChange} fullWidth required /></Grid>
                    </>
                  )
                case 'etranger':
                  return (
                    <>
                      <Grid item xs={12} sm={3}><TextField label="Nom *" name="nom" value={debiteurCorpForm.nom} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Prénom *" name="prenom" value={debiteurCorpForm.prenom} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Numéro passeport" name="numeroPasseport" value={debiteurCorpForm.numeroPasseport} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Carte séjour" name="carteSejour" value={debiteurCorpForm.carteSejour} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Ident interne" name="identInterne" value={debiteurCorpForm.identInterne} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField select label="Pays" name="pays" value={debiteurCorpForm.pays} onChange={handleCorpChange} fullWidth>
                        {countries.map((country) => (<MenuItem key={country} value={country}>{country}</MenuItem>))}
                      </TextField></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Téléphone" name="telephone" value={debiteurCorpForm.telephone} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Email" name="email" value={debiteurCorpForm.email} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={debiteurCorpForm.identifiantFiscal} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Adresse" name="adresse" value={debiteurCorpForm.adresse} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Quote-part *" name="quotePart" value={debiteurCorpForm.quotePart} onChange={handleCorpChange} fullWidth required /></Grid>
                    </>
                  )
                case 'morale':
                  return (
                    <>
                      <Grid item xs={12} sm={3}><TextField label="Raison sociale *" name="raisonSociale" value={debiteurCorpForm.raisonSociale} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Ville RC *" name="villeRc" value={debiteurCorpForm.villeRc} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="CNSS" name="cnss" value={debiteurCorpForm.cnss} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Registre de commerce" name="registreCommerce" value={debiteurCorpForm.registreCommerce} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Téléphone" name="telephone" value={debiteurCorpForm.telephone} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Email" name="email" value={debiteurCorpForm.email} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={debiteurCorpForm.identifiantFiscal} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Adresse" name="adresse" value={debiteurCorpForm.adresse} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Quote-part *" name="quotePart" value={debiteurCorpForm.quotePart} onChange={handleCorpChange} fullWidth required /></Grid>
                    </>
                  )
                case 'autre':
                  return (
                    <>
                      <Grid item xs={12} sm={3}><TextField label="Type *" name="type" value={debiteurCorpForm.type} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Numéro *" name="numero" value={debiteurCorpForm.numero} onChange={handleCorpChange} fullWidth required /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="CNSS" name="cnss" value={debiteurCorpForm.cnss} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Registre de commerce" name="registreCommerce" value={debiteurCorpForm.registreCommerce} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField select label="Pays" name="pays" value={debiteurCorpForm.pays} onChange={handleCorpChange} fullWidth>
                        {countries.map((country) => (<MenuItem key={country} value={country}>{country}</MenuItem>))}
                      </TextField></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Raison sociale" name="raisonSociale" value={debiteurCorpForm.raisonSociale} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Ville RC" name="villeRc" value={debiteurCorpForm.villeRc} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Téléphone" name="telephone" value={debiteurCorpForm.telephone} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Email" name="email" value={debiteurCorpForm.email} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={debiteurCorpForm.identifiantFiscal} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Adresse" name="adresse" value={debiteurCorpForm.adresse} onChange={handleCorpChange} fullWidth /></Grid>
                      <Grid item xs={12} sm={3}><TextField label="Quote-part *" name="quotePart" value={debiteurCorpForm.quotePart} onChange={handleCorpChange} fullWidth required /></Grid>
                    </>
                  )
                default:
                  return null
              }
            })()}
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setOpenDialog(false)} color="secondary">Annuler</Button>
           <Button
             onClick={() => {
               handleAddDebiteurCorporation()
               setOpenDialog(false)
             }}
             variant="contained"
             color="primary"
           >
             Ajouter
           </Button>
         </DialogActions>
        </Dialog>


  

        <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
          <FormLabel component="legend" sx={{ mb: 2 }}>Références du bien</FormLabel>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            Titre foncier :
          </Typography>
          <RadioGroup
            row
            name="typeBien"
            value={form.bien.typeBien}
            onChange={e => handleChange(e, 'bien')}
            sx={{ mb: 2 }}
          >
            {typesBien.map(type => (
              <FormControlLabel key={type.value} value={type.value} control={<Radio />} label={type.label} />
            ))}
          </RadioGroup>
          <Grid container spacing={2}>
            {renderBienFields()}
          </Grid>
        </FormControl>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date Recensement"
              type="date"
              name="dateRecensement"
              value={form.dateRecensement}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Enregistrer
        </Button>
      </Box>
    </Paper>
  )
}
