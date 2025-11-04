import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControlLabel, Checkbox, Dialog,
  DialogTitle, DialogContent, DialogActions, alpha, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { saveAs } from 'file-saver';
import fetchWithAuth from '../utils/api';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Download as DownloadIcon } from '@mui/icons-material';
import API_BASE_URL from '../utils/apiConfig';

const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

export default function Declaration() {
  const [declarationId, setDeclarationId] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('possession');
  const [dateMutation, setDateMutation] = useState(null);


  // ✅ Nouveau propriétaire (mutation)
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouvelleAdresse, setNouvelleAdresse] = useState('');
  const [nouveauCin, setNouveauCin] = useState('');
  const [nouveauTelephone, setNouveauTelephone] = useState('');


  // ✅ États pour changement de situation
  const [isChangement, setIsChangement] = useState(false);
  const [qualiteDeclarant, setQualiteDeclarant] = useState('');
  const [typeChangement, setTypeChangement] = useState('');
  const [dateChangement, setDateChangement] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const handleDownloadDeclaration = async () => {
    if (!declarationId) {
      setDialogMessage("Veuillez saisir l'Identifiant du bien.");
      setOpenDialog(true);
      return;
    }

    const params = new URLSearchParams();
    params.append('type', selectedType);

    if (selectedType === 'mutation') {
      if (!dateMutation || !nouveauNom || !nouvelleAdresse || !nouveauCin || !nouveauTelephone) {
        setDialogMessage("Veuillez remplir tous les champs du nouveau propriétaire.");
        setOpenDialog(true);
        return;
      }
      params.append('dateMutation', dayjs(dateMutation).format('YYYY-MM-DD'));
      params.append('nouveauNom', nouveauNom);
      params.append('nouvelleAdresse', nouvelleAdresse);
      params.append('nouveauCin', nouveauCin);
      params.append('nouveauTelephone', nouveauTelephone);
    }


    // ✅ Si changement de situation coché
    if (isChangement) {
      if (!qualiteDeclarant || !typeChangement || !dateChangement) {
        setDialogMessage("Veuillez remplir tous les champs du changement de situation.");
        setOpenDialog(true);
        return;
      }
      params.append('isChangement', true);
      params.append('qualiteDeclarant', qualiteDeclarant);
      params.append('typeChangement', typeChangement);
      params.append('dateChangement', dayjs(dateChangement).format('YYYY-MM-DD'));
    }

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/declaration/${declarationId}/pdf?${params.toString()}`,
        { method: 'GET', responseType: 'blob' }
      );

      if (!res.ok) {
        const message = res.status === 404
          ? "L'identifiant du bien n'existe pas."
          : `Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`;
        setDialogMessage(message);
        setOpenDialog(true);
        return;
      }

      const blob = await res.blob();
      saveAs(blob, `declaration_bien_${declarationId}.pdf`);
      setError('');
    } catch (error) {
      console.error("Erreur lors du téléchargement de la déclaration:", error);
      setDialogMessage("Erreur inattendue. Veuillez réessayer.");
      setOpenDialog(true);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === 'possession') setDateMutation(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Déclaration de Taxe
        </Typography>

        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Identifiant du bien"
              value={declarationId}
              onChange={(e) => setDeclarationId(e.target.value)}
              fullWidth
            />

            <FormControlLabel
             control={
               <Checkbox
                 checked={selectedType === 'possession'}
                 onChange={() => {
                   handleTypeChange('possession');
                   setIsChangement(false);
                 }}
                 sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
               />
             }
             label="Possession"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedType === 'mutation'}
                  onChange={() => {
                    handleTypeChange('mutation');
                    setIsChangement(false);
                  }}
                  sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                />
              }
              label="Mutation"
            />

            {/* {selectedType === 'mutation' && (
              <DatePicker
                label="Date de mutation"
                value={dateMutation}
                onChange={setDateMutation}
                slotProps={{ textField: { fullWidth: true } }}
              />
            )} */}
            
            {selectedType === 'mutation' && (
              <>
                <DatePicker
                  label="Date de mutation"
                  value={dateMutation}
                  onChange={setDateMutation}
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
                  Informations du nouveau propriétaire :
                </Typography>
                <TextField
                  label="Nom et prénom / Raison sociale"
                  value={nouveauNom}
                  onChange={(e) => setNouveauNom(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Adresse complète"
                  value={nouvelleAdresse}
                  onChange={(e) => setNouvelleAdresse(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="CIN / RC / IF"
                  value={nouveauCin}
                  onChange={(e) => setNouveauCin(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Téléphone"
                  value={nouveauTelephone}
                  onChange={(e) => setNouveauTelephone(e.target.value)}
                  fullWidth
                />
              </>
            )}

            {/* ✅ Checkbox changement de situation */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChangement}
                  onChange={(e) => {
                    setIsChangement(e.target.checked);
                    if (e.target.checked) {
                      setSelectedType('');
                    }
                  }}
                  sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
                />
              }
              label="Changement de situation"
            />


            {isChangement && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Qualité du déclarant</InputLabel>
                  <Select
                    value={qualiteDeclarant}
                    onChange={(e) => setQualiteDeclarant(e.target.value)}
                    label="Qualité du déclarant"
                  >
                    <MenuItem value="Attributaire">Attributaire</MenuItem>
                    <MenuItem value="Exploitant">Exploitant</MenuItem>
                    <MenuItem value="Propriétaire">Propriétaire</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Type de changement</InputLabel>
                  <Select
                    value={typeChangement}
                    onChange={(e) => setTypeChangement(e.target.value)}
                    label="Type de changement"
                  >
                    <MenuItem value="Viabilisation">Viabilisation</MenuItem>
                    <MenuItem value="Morcellement">Morcellement</MenuItem>
                    <MenuItem value="Renforcement">Renforcement</MenuItem>
                    <MenuItem value="Aménagement">Aménagement</MenuItem>
                    <MenuItem value="Construction">Construction</MenuItem>
                  </Select>
                </FormControl>

                <DatePicker
                  label="Date du changement"
                  value={dateChangement}
                  onChange={setDateChangement}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </>
            )}

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadDeclaration}
              sx={{
                mt: 1,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
              }}
            >
              Télécharger déclaration (PDF)
            </Button>
          </Box>
        </Paper>

        {/* Dialogue d'information */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ bgcolor: primaryColor, color: 'white' }}>Information</DialogTitle>
          <DialogContent><Typography>{dialogMessage}</Typography></DialogContent>
          <DialogActions><Button onClick={() => setOpenDialog(false)}>OK</Button></DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}


// import React, { useState } from 'react';
// import {
//   Box, Paper, Typography, TextField, Button, FormControlLabel, Checkbox,
//   Dialog, DialogTitle, DialogContent, DialogActions, alpha
// } from '@mui/material';
// import { saveAs } from 'file-saver';
// import fetchWithAuth from '../utils/api';
// import { DatePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import dayjs from 'dayjs';
// import { Download as DownloadIcon } from '@mui/icons-material';
// import API_BASE_URL from '../utils/apiConfig'


// // --- Styles cohérents avec le thème bleu/épuré ---
// const primaryColor = '#1976d2';
// const secondaryColor = '#42a5f5';

// export default function Declaration() {
//   const [declarationId, setDeclarationId] = useState('');
//   const [error, setError] = useState('');
//   const [selectedType, setSelectedType] = useState('possession'); // 'possession' ou 'mutation'
//   const [dateMutation, setDateMutation] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false); // State pour contrôler l'ouverture du dialogue
//   const [dialogMessage, setDialogMessage] = useState('');

//   const handleDownloadDeclaration = async () => {
//     // Vérification de l'Identifiant du bien
//     if (!declarationId) {
//         setDialogMessage("Veuillez saisir l'Identifiant du bien.");
//         setOpenDialog(true);
//         return;
//     }
//     // Vérification de la date si mutation est sélectionnée
//     if (selectedType === 'mutation' && !dateMutation) {
//         setDialogMessage("Veuillez sélectionner une date de mutation.");
//         setOpenDialog(true);
//         return;
//     }

//     try {
//       const params = new URLSearchParams();
//       params.append('type', selectedType);
//       if (selectedType === 'mutation' && dateMutation) {
//         params.append('dateMutation', dayjs(dateMutation).format('YYYY-MM-DD'));
//       }

//       const res = await fetchWithAuth(`${API_BASE_URL}/api/declaration/${declarationId}/pdf?${params.toString()}`, {
//         method: 'GET',
//         responseType: 'blob',
//       });

//       if (!res.ok) {
//         console.error('Erreur lors de la récupération du PDF de déclaration:', res.status, res.statusText);
//         setError(`Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`);

//         if (res.status === 404) {
//           // L'identifiant du bien n'existe pas
//           setDialogMessage("L'identifiant du bien n'existe pas. Merci de vérifier l'identifiant saisi.");
//           setOpenDialog(true);
//         } else {
//           setDialogMessage(`Erreur lors du téléchargement du PDF: ${res.status} ${res.statusText}`);
//           setOpenDialog(true);
//         }

//         return;
//       }

//       const blob = await res.blob();
//       saveAs(blob, `declaration_bien_${declarationId}.pdf`);
//       setError('');
//     } catch (error) {
//       console.error("Erreur lors du téléchargement de la déclaration:", error);
//       setError(`Erreur inattendue: ${error.message}`);
//       setDialogMessage("Erreur inattendue. Veuillez réessayer.");
//       setOpenDialog(true);
//     }
//   };

//   const handleTypeChange = (type) => {
//     setSelectedType(type);
//     if (type === 'possession') {
//       setDateMutation(null); // Réinitialiser dateMutation
//     }
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false); // Fermer le dialogue
//     setDialogMessage(''); // Réinitialiser le message
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        
//         {/* Titre stylisé */}
//         <Typography 
//           variant="h5" 
//           sx={{ 
//             fontWeight: 800,
//             background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
//             backgroundClip: 'text',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             mb: 4
//           }}
//         >
//             Déclaration de Taxe
//         </Typography>

//         {/* Conteneur principal (Paper stylisé) */}
//         <Paper 
//           elevation={4} 
//           sx={{ 
//             p: 4, 
//             borderRadius: 3, 
//             maxWidth: 500, 
//             mx: 'auto', // Centrer le formulaire
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
//           }}
//         >
//           {/* <Typography variant="h6" sx={{ color: primaryColor, mb: 3, fontWeight: 600 }}>
//               Recherche et Téléchargement
//           </Typography> */}

//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'stretch' }}>
            
//             {/* Champ Identifiant */}
//             <TextField
//               label="Identifiant du bien"
//               placeholder="Saisir l'identifiant du bien"
//               value={declarationId}
//               onChange={(e) => setDeclarationId(e.target.value)}
//               fullWidth
//               variant="outlined"
//             />
            
//             {/* Checkbox Possession */}
//             <FormControlLabel
//               control={<Checkbox 
//                           checked={selectedType === 'possession'} 
//                           onChange={() => handleTypeChange('possession')} 
//                           sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
//                       />}
//               label={<Typography fontWeight={500}>Possession</Typography>}
//             />
            
//             {/* Checkbox Mutation */}
//             <FormControlLabel
//               control={<Checkbox 
//                           checked={selectedType === 'mutation'} 
//                           onChange={() => handleTypeChange('mutation')} 
//                           sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }}
//                       />}
//               label={<Typography fontWeight={500}>Mutation</Typography>}
//             />
            
//             {/* DatePicker Mutation (si sélectionné) */}
//             {selectedType === 'mutation' && (
//               <DatePicker
//                 label="Date de mutation"
//                 value={dateMutation}
//                 onChange={(date) => setDateMutation(date)}
//                 slotProps={{ 
//                     textField: { fullWidth: true, size: 'medium' } 
//                 }}
//               />
//             )}
            
//             {/* Bouton de Téléchargement */}
//             <Button 
//               variant="contained" 
//               startIcon={<DownloadIcon />}
//               onClick={handleDownloadDeclaration}
//               sx={{ 
//                 mt: 1,
//                 borderRadius: 2,
//                 px: 3,
//                 py: 1.5,
//                 textTransform: 'none',
//                 fontWeight: 600,
//                 background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
//                 boxShadow: `0 4px 10px ${alpha(primaryColor, 0.4)}`,
//                 '&:hover': {
//                     background: `linear-gradient(90deg, #1565c0 0%, ${primaryColor} 100%)`,
//                     boxShadow: `0 6px 15px ${alpha(primaryColor, 0.6)}`,
//                 }
//               }}
//             >
//               Télécharger déclaration (PDF)
//             </Button>
//           </Box>
          
//           {/* Affichage des erreurs non modales */}
//           {error && (
//             <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>
//           )}
//         </Paper>
//       </Box>

//       {/* Dialogue d'erreur/information stylisé */}
//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         PaperProps={{ sx: { borderRadius: 3 } }}
//       >
//         <DialogTitle sx={{ bgcolor: primaryColor, color: 'white', fontWeight: 600 }}>
//             Information
//         </DialogTitle>
//         <DialogContent sx={{ pt: 2 }}>
//           <Typography sx={{ mt: 1 }}>{dialogMessage}</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button 
//             onClick={handleCloseDialog} 
//             variant="contained"
//             sx={{ 
//                 borderRadius: 2, 
//                 bgcolor: primaryColor,
//                 '&:hover': { bgcolor: '#1565c0' }
//             }}
//           >
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </LocalizationProvider>
//   );
// }