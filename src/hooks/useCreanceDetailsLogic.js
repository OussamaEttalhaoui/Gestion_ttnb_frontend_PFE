import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import fetchWithAuth from '../utils/api'; // Assurez-vous que le chemin est correct
import { saveAs } from 'file-saver'; // FileSaver.js pour les téléchargements

const API_BASE_URL = 'http://localhost:8036/api/creances';

export const useCreanceDetailsLogic = () => {
    const { id } = useParams();
    const [creance, setCreance] = useState(null);
    const [openQuittanceDialog, setOpenQuittanceDialog] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [numeroQuittance, setNumeroQuittance] = useState('');
    const [selectedEtat, setSelectedEtat] = useState('');
    const [referenceInternet, setReferenceInternet] = useState('');
    const [anchorElSituationFiscale, setAnchorElSituationFiscale] = useState(null);

    // ----------------------------------------------------
    // CHARGEMENT INITIAL & RECHARGEMENT
    // ----------------------------------------------------

    const fetchCreanceData = useCallback(async (creanceId) => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/${creanceId}/details`);
            if (!res.ok) {
                throw new Error('Erreur lors de la récupération des détails de la créance.');
            }
            const data = await res.json();
            setCreance(data);
            return data;
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de la créance:", error);
            // On pourrait ajouter une gestion d'alerte ici si nécessaire
            return null;
        }
    }, []);

    useEffect(() => {
        fetchCreanceData(id);
    }, [id, fetchCreanceData]);


    // ----------------------------------------------------
    // HANDLERS D'ÉTAT (Dialogues et Menus)
    // ----------------------------------------------------

    const handleOpenSituationFiscaleMenu = (event) => {
      setAnchorElSituationFiscale(event.currentTarget);
    };

    const handleCloseSituationFiscaleMenu = () => {
      setAnchorElSituationFiscale(null);
    };

    const handleCloseQuittanceDialog = () => {
      setOpenQuittanceDialog(false);
      setSelectedDetailId(null);
      setNumeroQuittance('');
      setReferenceInternet('');
      setSelectedEtat('');
    };

    // ----------------------------------------------------
    // LOGIQUE DE MISE À JOUR DE L'ÉTAT
    // ----------------------------------------------------

    const updateCreanceDetailEtat = useCallback(async (detailId, etat, onSuccess) => {
        try {
            // Logique de réinitialisation si l'état est "VALIDEE"
            if (etat === 'VALIDEE') {
                await fetchWithAuth(`${API_BASE_URL}/details/${detailId}/quittance?numeroQuittance=`, { method: 'PUT' });
                await fetchWithAuth(`${API_BASE_URL}/details/${detailId}/reference-internet?reference=`, { method: 'PUT' });
            }

            const res = await fetchWithAuth(`${API_BASE_URL}/details/${detailId}/etat?etat=${etat}`, {
                method: 'PUT',
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la mise à jour de l\'état de la créance.');
            }

            // Rafraîchir les données de la créance après la mise à jour de l'état
            const updatedCreance = await fetchCreanceData(id);

            // Mise à jour du localStorage pour la liste des recherches (si nécessaire)
            const rechercheCreanceResultats = JSON.parse(localStorage.getItem('rechercheCreanceResultats')) || [];
            const updatedResultats = rechercheCreanceResultats.map(creanceResultat => {
                if (updatedCreance && creanceResultat.id === updatedCreance.id) {
                    return { ...creanceResultat, etat: etat };
                }
                return creanceResultat;
            });
            localStorage.setItem('rechercheCreanceResultats', JSON.stringify(updatedResultats));

            alert('État de la créance mis à jour avec succès !');
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'état de la créance:", error);
            alert('Erreur lors de la mise à jour de l\'état de la créance.');
        }
    }, [id, fetchCreanceData]);

    const handleEtatChange = useCallback((detailId, newEtat) => {
        setSelectedDetailId(detailId);
        setSelectedEtat(newEtat);

        if (newEtat === 'SOLDEE' || newEtat === 'SOLDEE_PAR_INTERNET') {
            setOpenQuittanceDialog(true);
            setNumeroQuittance(''); // Réinitialisation par précaution
            setReferenceInternet(''); // Réinitialisation par précaution
        } else {
            updateCreanceDetailEtat(detailId, newEtat);
        }
    }, [updateCreanceDetailEtat]);

    const handleQuittanceOrReferenceSubmit = async () => {
        if ((selectedEtat === 'SOLDEE' && !numeroQuittance) || (selectedEtat === 'SOLDEE_PAR_INTERNET' && !referenceInternet)) {
            alert("Veuillez saisir les informations requises.");
            return;
        }

        try {
            if (selectedEtat === 'SOLDEE') {
                await fetchWithAuth(
                    `${API_BASE_URL}/details/${selectedDetailId}/quittance?numeroQuittance=${numeroQuittance}`,
                    { method: 'PUT' }
                );
            } else if (selectedEtat === 'SOLDEE_PAR_INTERNET') {
                await fetchWithAuth(
                    `${API_BASE_URL}/details/${selectedDetailId}/reference-internet?reference=${referenceInternet}`,
                    { method: 'PUT' }
                );
            }

            // Après la mise à jour de la quittance/référence, mettez à jour l'état
            await updateCreanceDetailEtat(selectedDetailId, selectedEtat, handleCloseQuittanceDialog);

        } catch (error) {
            console.error("Erreur lors de la mise à jour :", error);
            alert('Erreur lors de la mise à jour de la quittance/référence.');
        }
    };
    
    // ----------------------------------------------------
    // LOGIQUE DATE DE QUITTANCE
    // ----------------------------------------------------
    
    const handleDateQuittanceChange = async (detailId, newDate) => {
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL}/details/${detailId}/date-quittance?date=${newDate}`,
                { method: 'PUT' }
            );

            if (!res.ok) {
                throw new Error("Erreur lors de la mise à jour de la date de quittance.");
            }

            await fetchCreanceData(id);
            alert("Date de quittance mise à jour !");
        } catch (error) {
            console.error("Erreur update date quittance:", error);
            alert("Erreur serveur lors de la mise à jour de la date de quittance.");
        }
    };

    // ----------------------------------------------------
    // LOGIQUE DES ACTIONS (Rafraîchir/Imprimer)
    // ----------------------------------------------------

    const handleRefreshCreance = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/${id}/refresh`, { method: 'PUT' });
            if (!res.ok) {
                throw new Error('Erreur lors du rafraîchissement de la créance.');
            }
            await res.json();
            await fetchCreanceData(id); 
            alert('Créance rafraîchie avec succès !');
        } catch (error) {
            console.error("Erreur lors du rafraîchissement de la créance:", error);
            alert('Erreur lors du rafraîchissement de la créance.');
        }
    };

    const handlePrintBulletin = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/${id}/pdf`, { method: 'GET' });
            if (!res.ok) {
                throw new Error('Erreur lors de la récupération du PDF.');
            }
            const blob = await res.blob();
            saveAs(blob, `Creance_${id}.pdf`);
        } catch (error) {
            console.error("Erreur lors de l'impression du bulletin:", error);
            alert('Erreur lors de l\'impression du bulletin.');
        }
    };

    const handlePrintSituationFiscale = async (type) => {
        handleCloseSituationFiscaleMenu();
        try {
            let endpoint = `${API_BASE_URL}/${id}/situation-fiscale/pdf?type=${type}`;
            const res = await fetchWithAuth(endpoint, { method: 'GET' });
            if (!res.ok) {
                throw new Error('Erreur lors de la récupération du PDF de la situation fiscale.');
            }
            const blob = await res.blob();
            saveAs(blob, `SituationFiscale_${creance?.debiteur?.cin || 'N_A'}_${type}.pdf`);
        } catch (error) {
            console.error("Erreur lors de l'impression de la situation fiscale:", error);
            alert('Erreur lors de l\'impression de la situation fiscale.');
        }
    };

    return {
        creance,
        // États pour les dialogues et menus
        openQuittanceDialog, selectedDetailId, numeroQuittance, setNumeroQuittance,
        selectedEtat, referenceInternet, setReferenceInternet,
        anchorElSituationFiscale, openSituationFiscaleMenu: Boolean(anchorElSituationFiscale),

        // Handlers d'API
        handleEtatChange, handleQuittanceOrReferenceSubmit, handleRefreshCreance, 
        handlePrintBulletin, handlePrintSituationFiscale, handleDateQuittanceChange,

        // Handlers d'état
        handleOpenSituationFiscaleMenu, handleCloseSituationFiscaleMenu, handleCloseQuittanceDialog,
    };
};