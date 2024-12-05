import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Memory as GpuIcon, Speed as SpeedIcon, Bolt as PowerIcon } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { updateResources, purchaseUpgrade } from '../features/gameSlice';

const GPU_TYPES = {
  rtx3060: {
    name: 'RTX 3060',
    computePower: 10,
    powerUsage: 170,
    price: 2000,
    color: '#76b900',
    cores: 3584,
  },
  rtx3070: {
    name: 'RTX 3070',
    computePower: 20,
    powerUsage: 220,
    price: 5000,
    color: '#76b900',
    cores: 5888,
  },
  rtx3080: {
    name: 'RTX 3080',
    computePower: 40,
    powerUsage: 320,
    price: 10000,
    color: '#76b900',
    cores: 8704,
  },
  rtx4090: {
    name: 'RTX 4090',
    computePower: 100,
    powerUsage: 450,
    price: 25000,
    color: '#76b900',
    cores: 16384,
  },
};

// Animations
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const flow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GpuCard = styled(Card)(({ theme, active, color }) => ({
  position: 'relative',
  minHeight: 200,
  background: active 
    ? `linear-gradient(-45deg, ${color}40, ${theme.palette.background.paper}, ${color}40)`
    : theme.palette.background.paper,
  backgroundSize: '400% 400%',
  animation: active ? `${flow} 3s ease infinite` : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 0 15px ${color}40`,
  },
}));

const CoreGrid = styled(Box)(({ active, color }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: 2,
  padding: 8,
  '& .core': {
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: color,
    opacity: 0.3,
  },
  '& .active': {
    animation: `${pulse} 1.5s ease-in-out infinite`,
    opacity: 1,
  },
}));

const TemperatureBar = styled(LinearProgress)(({ value }) => ({
  height: 6,
  borderRadius: 3,
  '& .MuiLinearProgress-bar': {
    backgroundColor: value > 80 ? '#ff4444' : value > 60 ? '#ffaa00' : '#00aa00',
  },
}));

function GpuComponent({ type, index }) {
  const gpu = GPU_TYPES[type];
  const [temperature, setTemperature] = useState(30);
  const [activeCores, setActiveCores] = useState(0);

  useEffect(() => {
    // Simulate GPU temperature and core usage
    const interval = setInterval(() => {
      setTemperature(30 + Math.random() * 40);
      setActiveCores(Math.floor(Math.random() * gpu.cores));
    }, 2000);

    return () => clearInterval(interval);
  }, [gpu.cores]);

  return (
    <GpuCard active={true} color={gpu.color}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {gpu.name} #{index + 1}
        </Typography>
        
        <CoreGrid>
          {[...Array(32)].map((_, i) => (
            <div 
              key={i} 
              className={`core ${i < (activeCores / gpu.cores) * 32 ? 'active' : ''}`}
            />
          ))}
        </CoreGrid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Temperature: {Math.round(temperature)}°C
          </Typography>
          <TemperatureBar 
            variant="determinate" 
            value={temperature} 
            sx={{ mt: 1 }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Power Usage: {gpu.powerUsage}W
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Compute Power: +{gpu.computePower}/tick
          </Typography>
        </Box>
      </CardContent>
    </GpuCard>
  );
}

export default function GpuFarm() {
  const dispatch = useDispatch();
  const { money } = useSelector((state) => state.game.resources);
  const gpus = useSelector((state) => state.game.upgrades.gpus);
  const [showStore, setShowStore] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState(null);

  const handlePurchase = (type) => {
    const gpu = GPU_TYPES[type];
    if (money >= gpu.price) {
      dispatch(updateResources({ money: money - gpu.price }));
      dispatch(purchaseUpgrade({ type: 'gpus', amount: 1 }));
      setShowStore(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">GPU Farm</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowStore(true)}
        >
          Purchase GPU
        </Button>
      </Box>

      <Grid container spacing={3}>
        {[...Array(gpus)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <GpuComponent 
              type={Object.keys(GPU_TYPES)[Math.min(
                Math.floor(index / 2),
                Object.keys(GPU_TYPES).length - 1
              )]} 
              index={index}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={showStore} onClose={() => setShowStore(false)} maxWidth="md">
        <DialogTitle>GPU Store</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Object.entries(GPU_TYPES).map(([type, gpu]) => (
              <Grid item xs={12} sm={6} key={type}>
                <Card 
                  sx={{ 
                    cursor: money >= gpu.price ? 'pointer' : 'not-allowed',
                    opacity: money >= gpu.price ? 1 : 0.7,
                  }}
                  onClick={() => money >= gpu.price && setSelectedGpu(type)}
                >
                  <CardContent>
                    <Typography variant="h6">{gpu.name}</Typography>
                    <Typography color="textSecondary">
                      Price: ${gpu.price.toLocaleString()}
                    </Typography>
                    <Typography>
                      Compute Power: +{gpu.computePower}/tick
                    </Typography>
                    <Typography>
                      CUDA Cores: {gpu.cores.toLocaleString()}
                    </Typography>
                    <Typography>
                      Power Usage: {gpu.powerUsage}W
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStore(false)}>Cancel</Button>
          <Button 
            onClick={() => handlePurchase(selectedGpu)}
            disabled={!selectedGpu || money < GPU_TYPES[selectedGpu]?.price}
            variant="contained"
          >
            Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
