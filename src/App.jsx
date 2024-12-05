import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme, Tabs, Tab, Box, Container } from '@mui/material';
import {
  Science as TrainingIcon,
  Store as ShopIcon,
  Timeline as StatsIcon,
  Psychology as ResearchIcon,
} from '@mui/icons-material';
import GameLayout from './components/GameLayout';
import ModelTraining from './components/ModelTraining';
import UpgradeShop from './components/UpgradeShop';
import StatsPage from './components/StatsPage';
import Research from './components/Research';
import TabPanel from './components/TabPanel';
import Boosts from './components/Boosts';
import useGameTicker from './hooks/useGameTicker';
import { useDispatch } from 'react-redux';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
    success: {
      main: '#66bb6a',
    },
    warning: {
      main: '#ffa726',
    },
  },
});

function App() {
  useGameTicker();
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const boostChecker = setInterval(() => {
      dispatch(checkBoosts());
    }, 1000);

    return () => clearInterval(boostChecker);
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameLayout>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="game sections"
          >
            <Tab icon={<TrainingIcon />} label="Training" />
            <Tab icon={<ResearchIcon />} label="Research" />
            <Tab icon={<ShopIcon />} label="Upgrades" />
            <Tab icon={<StatsIcon />} label="Stats" />
            <Tab label="Boosts " />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ModelTraining />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Research />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <UpgradeShop />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <StatsPage />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Boosts />
        </TabPanel>
      </GameLayout>
    </ThemeProvider>
  );
}

export default App;
