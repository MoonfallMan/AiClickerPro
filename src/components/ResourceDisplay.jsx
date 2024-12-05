import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { AttachMoney, Memory, Storage, Star } from '@mui/icons-material';

const ResourceItem = ({ icon, label, value, color = 'primary' }) => (
  <Grid item xs={6} sm={3}>
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        {icon}
      </Box>
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="h6" color={`${color}.main`}>
        {value}
      </Typography>
    </Paper>
  </Grid>
);

export default function ResourceDisplay() {
  const resources = useSelector((state) => state.game.resources);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        <ResourceItem
          icon={<AttachMoney color="primary" />}
          label="Money"
          value={`$${resources.money.toLocaleString()}`}
        />
        <ResourceItem
          icon={<Memory color="secondary" />}
          label="Compute Power"
          value={resources.computePower}
        />
        <ResourceItem
          icon={<Storage color="success" />}
          label="Data Quality"
          value={resources.dataQuality}
        />
        <ResourceItem
          icon={<Star color="warning" />}
          label="Reputation"
          value={resources.reputation}
        />
      </Grid>
    </Box>
  );
}
