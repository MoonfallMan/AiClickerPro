import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { applyBoost } from '../features/gameSlice';

// Mock ad API - replace with real ad network
const mockAdAPI = {
  isAdReady: () => Math.random() > 0.1, // 90% chance ad is ready
  showAd: () => new Promise((resolve) => {
    console.log('Showing mock ad...');
    setTimeout(() => {
      resolve(Math.random() > 0.1); // 90% chance ad completes successfully
    }, 2000);
  }),
};

const AVAILABLE_BOOSTS = {
  revenueMultiplier: {
    name: '2x Revenue',
    description: 'Double your revenue from all models',
    multiplier: 2,
    duration: 300, // 5 minutes
    icon: '💰',
  },
  computeEfficiency: {
    name: 'Compute Efficiency',
    description: '50% reduced compute costs',
    multiplier: 0.5,
    duration: 300,
    icon: '⚡',
  },
  trainingSpeed: {
    name: 'Fast Training',
    description: '2x training speed for all models',
    multiplier: 2,
    duration: 300,
    icon: '🚀',
  },
};

export default function Boosts() {
  const dispatch = useDispatch();
  const activeBoosts = useSelector((state) => state.game.activeBoosts);
  const [adDialog, setAdDialog] = useState({ open: false, boost: null });
  const [adStatus, setAdStatus] = useState('');

  const getRemainingTime = (boostType) => {
    const expiryTime = activeBoosts.expiryTimes[boostType];
    if (!expiryTime) return 0;
    return Math.max(0, Math.round((expiryTime - Date.now()) / 1000));
  };

  const handleBoostClick = (boostType) => {
    if (mockAdAPI.isAdReady()) {
      setAdDialog({ open: true, boost: boostType });
    } else {
      setAdStatus('Ad not ready. Please try again in a moment.');
    }
  };

  const handleWatchAd = async () => {
    setAdStatus('Loading ad...');
    try {
      const success = await mockAdAPI.showAd();
      if (success) {
        const boost = AVAILABLE_BOOSTS[adDialog.boost];
        dispatch(applyBoost({
          boostType: adDialog.boost,
          multiplier: boost.multiplier,
          duration: boost.duration,
        }));
        setAdStatus('Boost activated!');
      } else {
        setAdStatus('Ad failed to load. Please try again.');
      }
    } catch (error) {
      setAdStatus('Error playing ad. Please try again.');
    }
    setAdDialog({ ...adDialog, open: false });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Watch Ads for Boosts
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Watch a short ad to receive temporary boosts for your AI startup!
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(AVAILABLE_BOOSTS).map(([boostType, boost]) => {
          const remainingTime = getRemainingTime(boostType);
          const isActive = remainingTime > 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={boostType}>
              <Card 
                sx={{ 
                  bgcolor: isActive ? 'success.light' : 'background.paper',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: isActive ? 'none' : 'scale(1.02)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h3" sx={{ mr: 2 }}>{boost.icon}</Typography>
                    <Box>
                      <Typography variant="h6" color={isActive ? 'white' : 'textPrimary'}>
                        {boost.name}
                      </Typography>
                      <Typography variant="body2" color={isActive ? 'white' : 'textSecondary'}>
                        {boost.description}
                      </Typography>
                    </Box>
                  </Box>

                  {isActive ? (
                    <Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(remainingTime / boost.duration) * 100}
                        sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.3)' }}
                      />
                      <Typography variant="body2" color="white">
                        {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')} remaining
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBoostClick(boostType)}
                      sx={{ mt: 1 }}
                    >
                      Watch Ad
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={adDialog.open} onClose={() => setAdDialog({ open: false, boost: null })}>
        <DialogTitle>Watch Ad for Boost</DialogTitle>
        <DialogContent>
          {adStatus ? (
            <Typography color={adStatus.includes('Error') ? 'error' : 'textPrimary'}>
              {adStatus}
            </Typography>
          ) : (
            <Typography>
              Watch a short ad to receive {adDialog.boost && AVAILABLE_BOOSTS[adDialog.boost].name} 
              for {adDialog.boost && AVAILABLE_BOOSTS[adDialog.boost].duration / 60} minutes!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdDialog({ open: false, boost: null })}>Cancel</Button>
          <Button onClick={handleWatchAd} variant="contained" disabled={!!adStatus}>
            Watch Ad
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
