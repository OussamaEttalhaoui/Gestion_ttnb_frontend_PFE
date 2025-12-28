import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import fetchWithAuth from '../utils/api'; 
import API_BASE_URL from '../utils/apiConfig';

export function useCreancesLogic(user, getComparator, getBienIdentifier) {
  // ------------------------- Déclarations des États (State) -------------------------
  const [creances, setCreances] = useState([]);
  const [open, setOpen] = useState(false); // Formulaire Créance
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [biens, setBiens] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [openTaux, setOpenTaux] = useState(false); // Taux Zone
  const [tauxZones, setTauxZones] = useState({});
  
  const [openAdminAlert, setOpenAdminAlert] = useState(false); 
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' }); 
  const [openAlertDialog, setOpenAlertDialog] = useState(false); // Alerte Générale
  

  // Form state
  const [form, setForm] = useState({
    identifiantBien: '',
    dateConstatation: dayjs(),
    avecDeclaration: false,
    exercices: [],
    tauxParExercice: {}, // <-- AJOUT
    montantTaxe: 0,
  });

  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('identifiantBien');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4); 

  // Calculate Tax state
  const [openCalculTaxe, setOpenCalculTaxe] = useState(false);
  const [calculTaxeForm, setCalculTaxeForm] = useState({
    superficie: 0,
    taux: 0,
    exercices: [],
    avecDeclaration: false,
    dateConstatation: dayjs(),
  });
  const [calculTaxeResult, setCalculTaxeResult] = useState(null);

  // ------------------------- Fonctions de Fetch (API) -------------------------

  const fetchCreances = useCallback(async () => { 
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/creances`);
      const data = await res.json();
      setCreances(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchBiens = useCallback(async () => { 
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/biens`);
      const data = await res.json();
      setBiens(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchTauxZones = useCallback(async () => { 
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/taux-zones`);
      const data = await res.json();
      const tauxMap = {};
      data.forEach(item => {
        tauxMap[item.zone] = item.taux;
      });
      setTauxZones(tauxMap);
    } catch (error) {
      console.error("Erreur lors de la récupération des taux de zone:", error);
    }
  }, []);

  // ------------------------- Effet d'Initialisation -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCreances(); 
        await fetchBiens();
        await fetchTauxZones();
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };
    
    if (user !== null) {
        fetchData();
    }
    
  }, [user, fetchCreances, fetchBiens, fetchTauxZones]);


  // ------------------------- Handlers CRUD Creance -------------------------

  const handleOpen = useCallback((creance = null) => {
    const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true
    const hasCreatePermission = user?.permissions?.includes('CREATE') === true

    if (creance && !hasUpdatePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier cette créance.", severity: 'error' })
      setOpenAlertDialog(true)
      return
    }
    if (!creance && !hasCreatePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer une créance.", severity: 'error' })
      setOpenAlertDialog(true)
      return
    }

    setSelected(creance);
    setForm(creance ? {
      ...creance,
      dateConstatation: creance.dateConstatation ? dayjs(creance.dateConstatation) : null,
      identifiantBien: creance.recensement?.bien?.numeroTitreFoncier || creance.recensement?.bien?.numeroCertificatPropriete || creance.recensement?.bien?.numeroInterne || ''
    } : {
      identifiantBien: '',
      dateConstatation: dayjs(),
      avecDeclaration: false,
      exercices: [],
      montantTaxe: 0,
    });
    setOpen(true);
    setErrorMessage('');
  }, [user]);

  const handleClose = useCallback(() => {
    setSelected(null);
    setOpen(false);
    setErrorMessage('');
  }, []);

  // const handleChange = useCallback((e) => {
  //   const { name, value, type, checked } = e.target;
  //   setForm(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value
  //   }));
  // }, []);
  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setForm(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

  

  const handleDateChange = useCallback((date) => {
    setForm(prev => ({
      ...prev,
      dateConstatation: date
    }));
  }, []);

  // const handleExercicesChange = useCallback((e) => {
  //   setForm(prev => ({
  //     ...prev,
  //     exercices: e.target.value
  //   }));
  // }, []);
  const handleExercicesChange = (event) => {
    const { value } = event.target;
    const selectedExercices = typeof value === 'string' ? value.split(',') : value;
  
    setForm(prev => {
      const updatedTaux = { ...prev.tauxParExercice };
  
      // Ajouter un taux par défaut pour les nouveaux exercices
      selectedExercices.forEach(ex => {
        if (!(ex in updatedTaux)) {
          updatedTaux[ex] = 0;
        }
      });
  
      // Supprimer les taux des exercices non sélectionnés
      Object.keys(updatedTaux).forEach(ex => {
        if (!selectedExercices.includes(parseInt(ex))) {
          delete updatedTaux[ex];
        }
      });
  
      return {
        ...prev,
        exercices: selectedExercices,
        tauxParExercice: updatedTaux
      };
    });
  };


  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const hasUpdatePermission = user?.permissions?.includes('UPDATE') === true
    const hasCreatePermission = user?.permissions?.includes('CREATE') === true

    if (selected && !hasUpdatePermission) return;
    if (!selected && !hasCreatePermission) return;

    try {
      // const dataToSend = {
      //   ...form,
      //   dateConstatation: form.dateConstatation ? form.dateConstatation.format('YYYY-MM-DD') : null,
      // };
      const exercicesTauxEntries = Object.entries(form.tauxParExercice)
  .filter(([_, taux]) => taux !== 0 && taux !== null && taux !== undefined)
  .map(([annee, taux]) => ({ annee: Number(annee), taux }));

const dataToSend = {
  ...form,
  dateConstatation: form.dateConstatation ? form.dateConstatation.format('YYYY-MM-DD') : null,
  ...(exercicesTauxEntries.length > 0 && { exercicesTaux: exercicesTauxEntries }) // <-- envoyer seulement si non vide
};



      let res;
      // Logique d'appel API pour Création/Modification (avec téléchargement PDF)
      if (selected) {
        res = await fetchWithAuth(`${API_BASE_URL}/api/creances/pdf/${selected.id}?identifiantBien=${form.identifiantBien}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
      } else {
        res = await fetchWithAuth(`${API_BASE_URL}/api/creances/pdf?identifiantBien=${form.identifiantBien}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
      }

      if (!res.ok) {
        // ... Gestion d'erreur
        let errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.message || errorText;
        } catch (e) { }
        setErrorMessage(errorText || `Erreur ${res.status} lors de l'opération.`);
        return; 
      }

      // ... Logique de téléchargement du PDF
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Creance_${form.identifiantBien}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      fetchCreances();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'opération de créance:", error);
      setErrorMessage(error.message);
    }
  }, [user, selected, form, fetchCreances, handleClose]);

  const handleDelete = useCallback(async (id) => {
    if (!user?.permissions?.includes('DELETE')) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer cette créance.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    if (window.confirm('Supprimer cette créance ?')) {
      try {
        await fetchWithAuth(`${API_BASE_URL}/api/creances/${id}`, {
          method: 'DELETE',
        });
        fetchCreances();
      } catch (error) {
        console.error(error);
      }
    }
  }, [user, fetchCreances]);

  // ------------------------- Handlers Taux Zone -------------------------

  const handleOpenTaux = useCallback(() => {
    if (user && user.role !== 'ADMIN') {
      setOpenAdminAlert(true);
      return;
    }
    setOpenTaux(true);
  }, [user]);

  const handleCloseTaux = useCallback(() => {
    setOpenTaux(false);
  }, []);

//   const handleTauxChange = useCallback((zone, taux) => {
//     setTauxZones(prev => ({ ...prev, [zone]: taux }));
//   }, []);
const handleTauxChange = useCallback((zone, taux) => {
    // Si l'input est de type 'number', la valeur est déjà gérée comme une chaîne.
    // On peut simplifier l'enregistrement de l'état.
    setTauxZones(prev => ({ 
        ...prev, 
        // Enregistrez la valeur brute (chaîne) de l'input
        [zone]: taux 
    }));
  }, []);

  const handleSaveTaux = useCallback(async () => {
    try {
      // Logique d'appel API pour l'enregistrement des taux
      for (const zone in tauxZones) {
        await fetchWithAuth(`${API_BASE_URL}/api/taux-zones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone: zone, taux: tauxZones[zone] }),
        });
      }
      handleCloseTaux();
      fetchTauxZones(); 
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des taux de zone:", error);
    }
  }, [tauxZones, handleCloseTaux, fetchTauxZones]);

  // ------------------------- Handlers Calcul Taxe -------------------------

  const handleOpenCalculTaxe = useCallback(() => {
    if (!user?.permissions?.includes('CREATE')) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de calculer la taxe.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    setCalculTaxeForm({
      superficie: 0,
      taux: 0,
      exercices: [],
      avecDeclaration: false,
      dateConstatation: dayjs(),
    });
    setCalculTaxeResult(null);
    setErrorMessage('');
    setOpenCalculTaxe(true);
  }, [user]);

  const handleCloseCalculTaxe = useCallback(() => {
    setOpenCalculTaxe(false);
    setCalculTaxeResult(null);
  }, []);

  const handleCalculerTaxe = useCallback(async () => {
    setErrorMessage('');
    try {
      // Logique d'appel API pour le calcul
      const res = await fetchWithAuth(`${API_BASE_URL}/api/creances/calcul`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...calculTaxeForm,
          dateConstatation: calculTaxeForm.dateConstatation
            ? calculTaxeForm.dateConstatation.format('YYYY-MM-DD')
            : null,
        }),
      });

      if (!res.ok) {
        // ... Gestion d'erreur
        let errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.message || errorText;
        } catch (e) { }
        setErrorMessage(errorText || `Erreur ${res.status} lors du calcul de la taxe.`);
        setCalculTaxeResult(null);
        return;
      }

      const data = await res.json();
      setCalculTaxeResult(data);
      setErrorMessage('');
    } catch (error) {
      console.error("Erreur lors du calcul de la taxe:", error);
      setErrorMessage(`Erreur lors du calcul de la taxe: ${error.message}`);
    }
  }, [calculTaxeForm]);

  const handleCalculTaxeChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setCalculTaxeForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleCalculTaxeExercicesChange = useCallback((e) => {
    setCalculTaxeForm(prev => ({
      ...prev,
      exercices: e.target.value
    }));
  }, []);

  // ------------------------- Handlers Alertes -------------------------

  const handleCloseAlertDialog = useCallback(() => {
    setOpenAlertDialog(false);
    setAlert({ ...alert, open: false });
  }, [alert]);

  // ------------------------- Logique de Tableau (Memoized) -------------------------

  const filteredCreances = useMemo(() => {
    return creances.filter(c => {
      const identifiantBien = c.recensement?.bien?.numeroTitreFoncier || c.recensement?.bien?.numeroCertificatPropriete || c.recensement?.bien?.numeroInterne || '';
      return identifiantBien.toLowerCase().includes(search.toLowerCase()) ||
        (c.avecDeclaration ? 'oui' : 'non').includes(search.toLowerCase()) ||
        c.exercices?.join(', ').toLowerCase().includes(search.toLowerCase()) ||
        c.montantTaxe?.toString().includes(search);
    });
  }, [creances, search]);
  
  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const sortedCreances = useMemo(() => {
    // getComparator doit être passé en prop ou importé
    if (!getComparator) return filteredCreances;
    return [...filteredCreances].sort(getComparator(order, orderBy));
  }, [filteredCreances, order, orderBy, getComparator]);

  const displayCreances = useMemo(() => {
    return sortedCreances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedCreances, page, rowsPerPage]);


  // ------------------------- Retour du Hook -------------------------

  return {
    // Données principales
    creances, biens, tauxZones,
    // États et Setters de la toolbar/recherche
    search, setSearch,
    // États et Setters du formulaire/modal Créance
    open, selected, form, errorMessage,
    handleOpen, handleClose, handleChange, handleDateChange, handleExercicesChange, handleSubmit, handleDelete,
    // États et Handlers Taux Zone
    openTaux, handleOpenTaux, handleCloseTaux, handleTauxChange, handleSaveTaux,
    // États et Handlers Calcul Taxe
    openCalculTaxe, calculTaxeForm, calculTaxeResult,
    handleOpenCalculTaxe, handleCloseCalculTaxe, handleCalculerTaxe, handleCalculTaxeChange, handleCalculTaxeExercicesChange,
    // États et Handlers Alertes
    openAdminAlert, setOpenAdminAlert, openAlertDialog, alert, handleCloseAlertDialog,
    // Logique de tableau
    displayCreances,
    handleRequestSort, orderBy, order,
    handleChangePage, handleChangeRowsPerPage, page, rowsPerPage,
    filteredCreancesLength: filteredCreances.length,
  };
}