import React from 'react';
import { Box, Container, Paper, Typography, AppBar, Toolbar } from '@mui/material';
import ResourceDisplay from './ResourceDisplay';

export default function GameLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Startup Tycoon
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <ResourceDisplay />
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            mt: 2,
            minHeight: '60vh',
            backgroundColor: 'background.paper' 
          }}
        >
          {children}
        </Paper>
      </Container>
      
      <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Build your AI Empire! 🚀
        </Typography>
      </Box>
    </Box>
  );
}
