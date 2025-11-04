
import React, { useState, useEffect } from 'react'
import {
  TextField, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Checkbox, Button, Paper, Typography, Box, IconButton, Divider,
  Card, CardContent, alpha, Chip, Fade
} from '@mui/material'
import { getNames } from 'country-list'
import MenuItem from '@mui/material/MenuItem'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import { Person, Business, Public, Category, Home, LocationOn, Landscape } from '@mui/icons-material'
import fetchWithAuth from '../../utils/api'
import API_BASE_URL from '../../utils/apiConfig'

const typesDebiteur = [
  { value: 'physique', label: 'Personne physique', icon: Person },
  { value: 'etranger', label: 'Personne physique Résident étranger', icon: Public },
  { value: 'morale', label: 'Personne morale privée', icon: Business },
  { value: 'autre', label: 'Autre personne', icon: Category },
]

const typesBien = [
  { value: 'immatricule', label: 'Immatriculé', icon: Home },
  { value: 'enCours', label: "En cours d'immatriculation", icon: LocationOn },
  { value: 'nonImmatricule', label: 'Non immatriculé', icon: Landscape },
]

const countries = getNames()

const searchDebiteur = async (type, value) => {
  const res = await fetchWithAuth(`${API_BASE_URL}/api/debiteurs/search?type=${type}&value=${value}`)
  if (!res.ok) return null
  return res.json()
}

const zonesAffectation = [
  { value: 'IMMEUBLES', label: 'Zone Immeubles' },
  { value: 'VILLAS', label: 'Zone Villas' },
  { value: 'HABITAT', label: 'Zone Habitat' },
  { value: 'SECTEUR_BIEN_EQUIPEE', label: 'Secteur Bien Equipé' },
  { value: 'SECTEUR_MOYEN_EQUIPEE', label: 'Secteur Moyennement Equipé' },
  { value: 'SECTEUR_MAL_EQUIPEE', label: 'Secteur Non Equipé' },
  { value: 'AUTRE', label: 'Autre Zone' },
]

export default function RecensementForm({ initialValues, onSave, onCancel }) {
  const [form, setForm] = useState({
    debiteur: {
      typeDebiteur: 'physique',
      cin: '', numeroPermis: '', nom: '', prenom: '', identInterne: '',
      telephone: '', email: '', identifiantFiscal: '', adresse: '',
      numeroPasseport: '', carteSejour: '', pays: '', cnss: '',
      registreCommerce: '', raisonSociale: '', villeRc: '', type: '', numero: '',
    },
    bien: {
      typeBien: 'immatricule',
      numeroTitreFoncier: '', adresse: '', quottePart: '', superficie: '',
      dateAcquisition: '', numeroCertificatPropriete: '', numeroInterne: '',
      coordonneeX: '', coordonneeY: '',
    },
    dateRecensement: '',
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [openDialogUnique, setOpenDialogUnique] = useState(false)
  const [debiteurCorpForm, setDebiteurCorpForm] = useState({
    typeDebiteur: 'physique',
    cin: '', numeroPermis: '', nom: '', prenom: '', identInterne: '',
    telephone: '', email: '', identifiantFiscal: '', adresse: '',
    numeroPasseport: '', carteSejour: '', pays: '', cnss: '',
    registreCommerce: '', raisonSociale: '', villeRc: '', type: '', numero: '',
    quotePart: '',
  })
  const [debiteursCorporation, setDebiteursCorporation] = useState([])

  const mapTypeDebiteurFromBackend = (type) => {
    if (type === 'physique') return 'physique'
    if (type === 'physiqueEtranger') return 'etranger'
    if (type === 'moralePrivee') return 'morale'
    if (type === 'autre') return 'autre'
    return 'physique'
  }

  useEffect(() => {
    if (initialValues) {
      setForm({
        debiteur: { 
          ...form.debiteur, 
          ...initialValues.debiteur,
          typeDebiteur: mapTypeDebiteurFromBackend(initialValues.debiteur.typeDebiteur)
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
            quotePart: undefined
          },
          quotePart: debiteurCorpForm.quotePart
        }
      ])
      setDebiteurCorpForm({
        typeDebiteur: 'physique',
        cin: '', numeroPermis: '', nom: '', prenom: '', identInterne: '',
        telephone: '', email: '', identifiantFiscal: '', adresse: '',
        numeroPasseport: '', carteSejour: '', pays: '', cnss: '',
        registreCommerce: '', raisonSociale: '', villeRc: '', type: '', numero: '',
        quotePart: '',
      })
    }
  }

  const handleDeleteDebiteurCorporation = (idx) => {
    setDebiteursCorporation(debiteursCorporation.filter((_, i) => i !== idx))
  }

  const renderDebiteurFields = () => {
    const t = form.debiteur.typeDebiteur
    switch (t) {
      case 'physique':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                label="N° CIN *"
                name="cin"
                value={form.debiteur.cin}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const cinValue = e.target.value.trim()
                  if (!cinValue) return
                  try {
                    const debiteurData = await searchDebiteur("cin", cinValue)
                    if (debiteurData) {
                      setForm(prev => ({
                        ...prev,
                        debiteur: {
                          ...prev.debiteur,
                          ...debiteurData,
                          typeDebiteur: debiteurData.typeDebiteur || prev.debiteur.typeDebiteur
                        }
                      }))
                    }
                  } catch (error) {
                    console.error("Erreur lors de la recherche du débiteur:", error)
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro de passeport"
                name="numeroPasseport"
                value={form.debiteur.numeroPasseport}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim()
                  if (!value) return
                  const debiteurData = await searchDebiteur("passeport", value)
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }))
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="CNSS *"
                name="cnss"
                value={form.debiteur.cnss}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim()
                  if (!value) return
                  const debiteurData = await searchDebiteur("cnss", value)
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }))
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Identifiant fiscal *" name="identifiantFiscal" value={form.debiteur.identifiantFiscal} onChange={e => handleChange(e, 'debiteur')} fullWidth required /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Registre de commerce *"
                name="registreCommerce"
                value={form.debiteur.registreCommerce}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim()
                  if (!value) return
                  const debiteurData = await searchDebiteur("rc", value)
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }))
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Numéro *"
                name="numero"
                value={form.debiteur.numero}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim()
                  if (!value) return
                  const debiteurData = await searchDebiteur("numero", value)
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }))
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CNSS *"
                name="cnss"
                value={form.debiteur.cnss}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim()
                  if (!value) return
                  const debiteurData = await searchDebiteur("cnss", value)
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }))
                  }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Identifiant fiscal" name="identifiantFiscal" value={form.debiteur.identifiantFiscal} onChange={e => handleChange(e, 'debiteur')} fullWidth /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Registre de commerce *"
                name="registreCommerce"
                value={form.debiteur.registreCommerce}
                onChange={e => handleChange(e, 'debiteur')}
                onBlur={async (e) => {
                  const value = e.target.value.trim()
                  if (!value) return
                  const debiteurData = await searchDebiteur("rc", value)
                  if (debiteurData) {
                    setForm(prev => ({
                      ...prev,
                      debiteur: { ...prev.debiteur, ...debiteurData }
                    }))
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

  const renderBienFields = () => {
    const t = form.bien.typeBien
    const commonFields = (
      <>
        <Grid item xs={12} sm={6}><TextField label="Superficie (m²)" name="superficie" value={form.bien.superficie} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
        <Grid item xs={12} sm={6}>
          <TextField select label="Type de zone" name="zone" value={form.bien.zone || ''} onChange={e => handleChange(e, 'bien')} fullWidth 
            SelectProps={{displayEmpty: true}}
            InputLabelProps={{shrink: true}}> 
            <MenuItem value=""><em>type de zone</em></MenuItem>
            {zonesAffectation.map((zone) => (
              <MenuItem key={zone.value} value={zone.value}>{zone.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}><TextField label="Date d'acquisition" name="dateAcquisition" type="date" value={form.bien.dateAcquisition} onChange={e => handleChange(e, 'bien')} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
        <Grid item xs={12} sm={6}><TextField label="coordonnée X" name="coordonneeX" value={form.bien.coordonneeX} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
        <Grid item xs={12} sm={6}><TextField label="coordonnée Y" name="coordonneeY" value={form.bien.coordonneeY} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
      </>
    )

    if (t === 'immatricule') {
      return (
        <>
          <Grid item xs={12} sm={6}><TextField label="Numéro titre foncier" name="numeroTitreFoncier" value={form.bien.numeroTitreFoncier} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Adresse" name="adresse" value={form.bien.adresse} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          {commonFields}
        </>
      )
    }
    if (t === 'enCours') {
      return (
        <>
          <Grid item xs={12} sm={6}><TextField label="N° Certificat de propriété" name="numeroCertificatPropriete" value={form.bien.numeroCertificatPropriete} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Adresse" name="adresse" value={form.bien.adresse} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          {commonFields}
        </>
      )
    }
    if (t === 'nonImmatricule') {
      return (
        <>
          <Grid item xs={12} sm={6}><TextField label="Numéro interne" name="numeroInterne" value={form.bien.numeroInterne} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Adresse" name="adresse" value={form.bien.adresse} onChange={e => handleChange(e, 'bien')} fullWidth /></Grid>
          {commonFields}
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
      dateRecensement: form.dateRecensement || new Date().toISOString().split('T')[0],
      debiteursCorporation: debiteursCorporation,
    }
    if (onSave) onSave(dataToSend)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 2 }}>
      {/* Section Débiteur */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Informations du Propriétaire
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => setOpenDialogUnique(true)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              }}
            >
              Propriétaire unique
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setOpenDialog(true)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Propriétaires en indivision
            </Button>
          </Box>

          {/* Liste des propriétaires en indivision */}
          {debiteursCorporation.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
                Liste des propriétaires en indivision
              </Typography>
              {debiteursCorporation.map((corp, idx) => (
                <Fade in key={idx} timeout={300}>
                  <Card sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha('#1976d2', 0.03), border: '1px solid', borderColor: alpha('#1976d2', 0.2) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha('#1976d2', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Person sx={{ color: '#1976d2' }} />
                      </Box>
                      <Box>
                        <Typography fontWeight={600}>
                          {corp.debiteur.typeDebiteur === 'physique' && `${corp.debiteur.nom} ${corp.debiteur.prenom}`}
                          {corp.debiteur.typeDebiteur === 'morale' && `${corp.debiteur.raisonSociale}`}
                          {corp.debiteur.typeDebiteur === 'autre' && `${corp.debiteur.type} ${corp.debiteur.numero}`}
                          {corp.debiteur.typeDebiteur === 'etranger' && `${corp.debiteur.nom} ${corp.debiteur.prenom}`}
                        </Typography>
                        <Chip label={`Quote-part: ${corp.quotePart}`} size="small" color="primary" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <IconButton color="error" onClick={() => handleDeleteDebiteurCorporation(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Fade>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Section Bien */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Home /> Références du bien
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
            Titre foncier :
          </Typography>
          <RadioGroup
            row
            name="typeBien"
            value={form.bien.typeBien}
            onChange={e => handleChange(e, 'bien')}
            sx={{ mb: 3 }}
          >
            {typesBien.map(type => (
              <FormControlLabel 
                key={type.value} 
                value={type.value} 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <type.icon sx={{ fontSize: 20 }} />
                    {type.label}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
          <Grid container spacing={2}>
            {renderBienFields()}
          </Grid>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        size="large"
        sx={{ 
          mt: 2,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
          }
        }}
      >
        Enregistrer
      </Button>

      {/* Dialog Propriétaire Unique */}
      <Dialog 
        open={openDialogUnique} 
        onClose={() => setOpenDialogUnique(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          fontSize: '1.3rem',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Person /> Ajouter un propriétaire unique
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
            Type de personne
          </Typography>
          <RadioGroup
            row
            name="typeDebiteur"
            value={form.debiteur.typeDebiteur}
            onChange={e => handleChange(e, 'debiteur')}
            sx={{ mb: 3 }}
          >
            {typesDebiteur.map(type => (
              <FormControlLabel 
                key={type.value} 
                value={type.value} 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <type.icon sx={{ fontSize: 20 }} />
                    {type.label}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
          <Grid container spacing={2}>
            {renderDebiteurFields()}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDialogUnique(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={() => setOpenDialogUnique(false)} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Propriétaire en Indivision */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          fontSize: '1.3rem',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Person /> Ajouter un débiteur en corporation
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
            Type de personne
          </Typography>
          <RadioGroup
            row
            name="typeDebiteur"
            value={debiteurCorpForm.typeDebiteur}
            onChange={handleCorpChange}
            sx={{ mb: 3 }}
          >
            {typesDebiteur.map(type => (
              <FormControlLabel 
                key={type.value} 
                value={type.value} 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <type.icon sx={{ fontSize: 20 }} />
                    {type.label}
                  </Box>
                }
              />
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
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              handleAddDebiteurCorporation()
              setOpenDialog(false)
            }}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

