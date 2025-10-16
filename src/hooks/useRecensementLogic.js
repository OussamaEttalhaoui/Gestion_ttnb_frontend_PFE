import { useState, useEffect, useCallback } from 'react';
import fetchWithAuth from '../utils/api'; // Assurez-vous que le chemin est correct
import { useAuth } from '../pages/Auth'; // Assurez-vous que le chemin est correct
import API_BASE_URL from '../utils/apiConfig';

// Fonction utilitaire déplacée dans le hook, car elle est nécessaire pour le filtrage
function getNumeroBien(bien) {
  if (!bien) return '';
  if (bien.numeroTitreFoncier) return bien.numeroTitreFoncier;
  if (bien.numeroCertificatPropriete) return bien.numeroCertificatPropriete;
  if (bien.numeroInterne) return bien.numeroInterne;
  return '';
}

export const useRecensementLogic = () => {
  const [recensements, setRecensements] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nom');
  const { user } = useAuth();
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'error' });
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const apiUrl = `${API_BASE_URL}/api/recensements`;
  
  // ----------------------------------------------------
  // LOGIQUE DE CHARGEMENT INITIALE
  // ----------------------------------------------------
  useEffect(() => {
    const fetchRecensements = async () => {
      try {
        const res = await fetchWithAuth(apiUrl);
        if (res.ok) {
          const data = await res.json();
          setRecensements(data);
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de lire les recensements.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la récupération des recensements.", severity: 'error' });
          setOpenAlertDialog(true);
          setRecensements([]);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
        setRecensements([]);
      }
    };

    fetchRecensements();
  }, [apiUrl]);

  // ----------------------------------------------------
  // HANDLERS D'ÉTAT
  // ----------------------------------------------------
  const handleCloseAlertDialog = useCallback(() => {
    setOpenAlertDialog(false);
    setAlert({ ...alert, open: false });
  }, [alert]);

  const handleChangePage = useCallback((event, newPage) => setPage(newPage), []);
  
  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleRequestSort = useCallback((property) => {
    setOrder(prevOrder => (orderBy === property && prevOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(property);
  }, [orderBy]);
  
  // ----------------------------------------------------
  // HANDLERS CRUD
  // ----------------------------------------------------
  const handleOpen = useCallback((recensement = null) => {
    const hasUpdatePermission = user?.permissions?.includes('UPDATE');
    const hasCreatePermission = user?.permissions?.includes('CREATE');

    if (recensement && !hasUpdatePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    if (!recensement && !hasCreatePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    setSelected(recensement);
    setOpen(true);
  }, [user]);

  const handleClose = useCallback(() => {
    setSelected(null);
    setOpen(false);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const hasDeletePermission = user?.permissions?.includes('DELETE');

    if (!hasDeletePermission) {
      setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer ce recensement.", severity: 'error' });
      setOpenAlertDialog(true);
      return;
    }
    if (window.confirm('Supprimer ce recensement ?')) {
      try {
        const res = await fetchWithAuth(`${apiUrl}/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setRecensements(prev => prev.filter(r => r.id !== id));
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de supprimer ce recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la suppression du recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
      }
    }
  }, [user, apiUrl]);

  const handleSave = useCallback(async (formData) => {
    const hasUpdatePermission = user?.permissions?.includes('UPDATE');
    const hasCreatePermission = user?.permissions?.includes('CREATE');
    
    // Modification
    if (selected) {
      if (!hasUpdatePermission) {
        setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
        setOpenAlertDialog(true);
        return;
      }
      try {
        const res = await fetchWithAuth(`${apiUrl}/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setRecensements(prev => prev.map(r => r.id === selected.id ? updated : r));
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de modifier ce recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la modification du recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
      }
    } 
    // Ajout
    else {
      if (!hasCreatePermission) {
        setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
        setOpenAlertDialog(true);
        return;
      }
      try {
        const res = await fetchWithAuth(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const newRecensement = await res.json();
          setRecensements(prev => [...prev, newRecensement]);
        } else if (res.status === 403) {
          setAlert({ open: true, message: "Vous n'avez pas l'autorisation de créer un recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        } else {
          setAlert({ open: true, message: "Erreur lors de la création du recensement.", severity: 'error' });
          setOpenAlertDialog(true);
        }
      } catch (error) {
        console.error(error);
        setAlert({ open: true, message: "Erreur de connexion.", severity: 'error' });
        setOpenAlertDialog(true);
      }
    }
    handleClose();
  }, [selected, user, handleClose, apiUrl]);

  // ----------------------------------------------------
  // LOGIQUE DE FILTRAGE ET TRI
  // ----------------------------------------------------
  const filtered = recensements.filter(r =>
    r.debiteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    r.debiteur?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    r.bien?.adresse?.toLowerCase().includes(search.toLowerCase()) ||
    getNumeroBien(r.bien).toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aValue, bValue;
    switch (orderBy) {
      case 'nom':
        aValue = a.debiteur?.nom || '';
        bValue = b.debiteur?.nom || '';
        break;
      case 'prenom':
        aValue = a.debiteur?.prenom || '';
        bValue = b.debiteur?.prenom || '';
        break;
      case 'adresse':
        aValue = a.bien?.adresse || '';
        bValue = b.bien?.adresse || '';
        break;
      case 'dateRecensement':
        aValue = a.dateRecensement || '';
        bValue = b.dateRecensement || '';
        break;
      default:
        aValue = '';
        bValue = '';
    }
    return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
  
  // Calcul des statistiques
  const stats = {
    total: recensements.length,
    thisMonth: recensements.filter(r => {
      const date = new Date(r.dateRecensement);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    zones: new Set(recensements.map(r => r.bien?.zone).filter(Boolean)).size
  };

  return {
    // États
    recensements, open, selected, search, order, orderBy, alert, openAlertDialog, 
    page, rowsPerPage, user,
    // Données Traitées
    sortedRecensements: sorted,
    paginatedRecensements: sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    stats,
    totalCount: filtered.length,
    // Méthodes de mise à jour/Handlers
    setSearch, handleRequestSort, handleChangePage, handleChangeRowsPerPage,
    handleOpen, handleClose, handleDelete, handleSave, handleCloseAlertDialog,
  };
};