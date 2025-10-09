// src/components/CreancesAlerts.jsx

import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button
} from '@mui/material';

const primaryColor = '#1976d2';

export default function CreancesAlerts({
  openAdminAlert,
  setOpenAdminAlert,
  openAlertDialog,
  alert,
  handleCloseAlertDialog
}) {
  return (
    <>
      {/* Dialogue d'alerte (Admin Taux) */}
      <Dialog
        open={openAdminAlert}
        onClose={() => setOpenAdminAlert(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f' }}>
          Accès Refusé
        </DialogTitle>
        <DialogContent>
          <Typography>
            Seuls les administrateurs peuvent définir les taux.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenAdminAlert(false)} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue d'alerte (Permissions) */}
      <Dialog
        open={openAlertDialog}
        onClose={handleCloseAlertDialog}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          color: alert.severity === 'error' ? '#d32f2f' : primaryColor
        }}>
          {alert.severity === 'error' ? "Erreur d'autorisation" : "Information"}
        </DialogTitle>
        <DialogContent>
          <Typography>{alert.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseAlertDialog}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}