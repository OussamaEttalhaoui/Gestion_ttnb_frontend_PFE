// src/components/CreancesToolbar.jsx

import React from 'react';
import {
  Paper, Box, Button, TextField, Toolbar, InputAdornment, alpha
} from '@mui/material';
import { Add, Search, AttachMoney } from '@mui/icons-material';

const primaryColor = '#1976d2';
const secondaryColor = '#42a5f5';

export default function CreancesToolbar({
  search, 
  setSearch, 
  handleOpenTaux, 
  handleOpenCalculTaxe, 
  handleOpenCreate
}) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 3, 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 2,
        py: 2,
        px: 3,
        flexWrap: 'wrap'
      }}>
        <TextField
          placeholder="Rechercher par identifiant, montant, exercice..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: 350 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleOpenTaux}
            sx={{ 
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha('#2e7d32', 0.5),
              color: '#2e7d32',
              '&:hover': {
                bgcolor: alpha('#2e7d32', 0.05),
                borderColor: '#2e7d32',
              }
            }}
          >
            Définir Taux
          </Button>
          <Button
            variant="outlined"
            onClick={handleOpenCalculTaxe}
            startIcon={<AttachMoney />}
            sx={{ 
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha(primaryColor, 0.5),
              color: primaryColor,
              '&:hover': {
                bgcolor: alpha(primaryColor, 0.05),
                borderColor: primaryColor,
              }
            }}
          >
            Calculer Taxe
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              '&:hover': {
                boxShadow: `0 6px 20px ${alpha(primaryColor, 0.4)}`,
                background: `linear-gradient(135deg, #1565c0 0%, #1976d2 100%)`,
              }
            }}
          >
            Ajouter une créance
          </Button>
        </Box>
      </Toolbar>
    </Paper>
  );
}