import { useState, useEffect, useCallback } from 'react';
import fetchWithAuth from '../utils/api'; // Assurez-vous que le chemin est correct
import { useAuth } from '../pages/Auth';  // Assurez-vous que le chemin est correct
import API_BASE_URL from '../utils/apiConfig';

const initialFormState = {
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    roleName: 'USER',
    permissions: [],
};

export const useUserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [search, setSearch] = useState('');
    
    // ----------------------------------------------------
    // API FUNCTIONS
    // ----------------------------------------------------

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/utilisateurs`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                throw new Error('Erreur lors de la récupération des utilisateurs');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            setError(error.message || 'Échec du chargement des utilisateurs.');
        }
    }, []);

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchUsers();
        }
    }, [user, fetchUsers]);


    const handleCloseDialog = () => {
        setOpenDialog(false);
        setIsEditMode(false);
        setSelectedUserId(null);
        setForm(initialFormState); // Réinitialiser le formulaire
        setError(null);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        
        try {
            const url = isEditMode ? `${API_BASE_URL}/api/utilisateurs/${selectedUserId}` : `${API_BASE_URL}/auth/register`;
            const method = isEditMode ? 'PUT' : 'POST';

            // Corps de la requête
            const requestBody = {
                nom: form.nom,
                prenom: form.prenom,
                email: form.email,
                telephone: form.telephone,
                roleName: form.roleName,
                permissions: form.permissions,
            };
            if (form.motDePasse || !isEditMode) {
                requestBody.motDePasse = form.motDePasse;
            }

            const res = await fetchWithAuth(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData?.message || 'Erreur lors de l\'enregistrement';
                throw new Error(errorMessage);
            }
            
            const action = isEditMode ? 'modifié' : 'créé';
            setSuccessMessage(`L'utilisateur ${form.nom} ${form.prenom} a été ${action} avec succès!`);
            
            handleCloseDialog();
            fetchUsers(); // Rafraîchir la liste

        } catch (error) {
            console.error(error);
            setError(error.message || 'Erreur lors de l\'opération sur l\'utilisateur.');
        }
    };

    const handleDelete = async (id) => {
        try {
            const userToDelete = users.find(u => u.id === id);
            if (!userToDelete) {
                setError("Utilisateur non trouvé.");
                return;
            }
            if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.nom} ${userToDelete.prenom}?`)) {
                return;
            }

            const res = await fetchWithAuth(`${API_BASE_URL}/api/utilisateurs/${id}`, {
                method: 'DELETE',
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData?.message || 'Erreur lors de la suppression';
                throw new Error(errorMessage);
            }
            
            setSuccessMessage(`L'utilisateur ${userToDelete.nom} ${userToDelete.prenom} a été supprimé avec succès!`);
            fetchUsers();
            
        } catch (error) {
            console.error(error);
            setError(error.message || 'Erreur lors de la suppression de l\'utilisateur.');
        }
    };

    // ----------------------------------------------------
    // DIALOG & FORM HANDLERS
    // ----------------------------------------------------

    const handleOpenAddDialog = () => {
        setIsEditMode(false);
        setOpenDialog(true);
    };

    const handleEdit = (userToEdit) => {
        setIsEditMode(true);
        setSelectedUserId(userToEdit.id);
        setForm({
            nom: userToEdit.nom,
            prenom: userToEdit.prenom,
            email: userToEdit.email,
            motDePasse: '', // Ne pas pré-remplir le mot de passe
            telephone: userToEdit.telephone,
            roleName: userToEdit.role,
            permissions: userToEdit.permissions ? userToEdit.permissions.map(p => p.name) : [],
        });
        setOpenDialog(true);
    };
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        setForm(prev => {
            const newPermissions = checked
                ? [...prev.permissions, value]
                : prev.permissions.filter(p => p !== value);
            return { ...prev, permissions: newPermissions };
        });
    };

    return {
        // States
        users, form, error, successMessage, openDialog, isEditMode, search, 
        // Setters
        setSearch, 
        // Handlers
        handleSubmit, handleDelete,
        handleChange, handlePermissionChange, 
        handleCloseDialog, handleOpenAddDialog, handleEdit,
    };
};