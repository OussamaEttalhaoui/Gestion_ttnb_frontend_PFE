import React from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, 
  Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, 
  Alert, Box, Divider, Typography, Checkbox, FormControlLabel, InputAdornment, Chip
} from '@mui/material';
import { Key, Phone } from '@mui/icons-material';

const permissionsList = ["CREATE", "READ", "UPDATE", "DELETE"];

export const UserFormDialog = ({
    open,
    isEditMode,
    form,
    error,
    handleChange,
    handlePermissionChange,
    handleCloseDialog,
    handleSubmit,
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={handleCloseDialog} 
            fullWidth 
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ 
                fontWeight: 700, 
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                py: 2.5
            }}>
                {isEditMode ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nom"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Prénom"
                                name="prenom"
                                value={form.prenom}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={isEditMode ? "Nouveau Mot de passe (Laisser vide pour ne pas changer)" : "Mot de passe"}
                                type="password"
                                name="motDePasse"
                                value={form.motDePasse}
                                onChange={handleChange}
                                fullWidth
                                required={!isEditMode}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Key color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Téléphone"
                                name="telephone"
                                value={form.telephone}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                <InputLabel id="role-label">Rôle</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="roleName"
                                    name="roleName"
                                    value={form.roleName}
                                    onChange={handleChange}
                                    label="Rôle"
                                >
                                    <MenuItem value="USER">USER</MenuItem>
                                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}
                            >
                                Permissions
                            </Typography>
                            <Grid container spacing={2}>
                                {permissionsList.map((permission) => (
                                    <Grid item xs={12} sm={6} md={3} key={permission}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    value={permission}
                                                    checked={form.permissions.includes(permission)}
                                                    onChange={handlePermissionChange}
                                                    name={permission}
                                                    color="primary"
                                                />
                                            }
                                            label={<Chip label={permission} size="small" variant="outlined" sx={{ fontWeight: 600 }} />}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                    onClick={handleCloseDialog} 
                    sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 600
                    }}
                >
                    Annuler
                </Button>
                <Button 
                    type="submit" 
                    variant="contained" 
                    onClick={handleSubmit}
                    sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        }
                    }}
                >
                    {isEditMode ? 'Modifier l\'utilisateur' : 'Ajouter l\'utilisateur'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};