// Fichier : src/components/RecensementStats.jsx

import React from 'react';
import { Card, CardContent, Box, Typography, Grid } from '@mui/material';
import { Home, CalendarToday, FilterList } from '@mui/icons-material';

// Composant de carte individuelle
function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}25`
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ fontSize: 32, color }} />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Composant principal de statistiques
export default function RecensementStats({ stats }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <StatsCard 
          icon={Home} 
          label="Total Recensements" 
          value={stats.total} 
          color="#1976d2"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatsCard 
          icon={CalendarToday} 
          label="Ce mois" 
          value={stats.thisMonth} 
          color="#2e7d32"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatsCard 
          icon={FilterList} 
          label="Zones actives" 
          value={stats.zones} 
          color="#ed6c02"
        />
      </Grid>
    </Grid>
  );
}