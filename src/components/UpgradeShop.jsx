import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Memory as GpuIcon,
  Storage as DataIcon,
  Person as ResearcherIcon,
} from '@mui/icons-material';
import { purchaseUpgrade } from '../features/gameSlice';

const UPGRADES = {
  gpus: {
    name: 'GPU Cluster',
    description: 'Increases compute power generation',
    icon: GpuIcon,
    basePrice: 5000,
    priceMultiplier: 1.5,
    benefit: '+10 compute power per second',
    color: 'primary',
  },
  datasets: {
    name: 'Dataset Collection',
    description: 'Improves data quality generation',
    icon: DataIcon,
    basePrice: 3000,
    priceMultiplier: 1.4,
    benefit: '+5 data quality per second',
    color: 'secondary',
  },
  researchers: {
    name: 'AI Researcher',
    description: 'Accelerates model training',
    icon: ResearcherIcon,
    basePrice: 10000,
    priceMultiplier: 1.6,
    benefit: '-10% training time',
    color: 'success',
  },
};

const UpgradeCard = ({ type, stats }) => {
  const dispatch = useDispatch();
  const resources = useSelector((state) => state.game.resources);
  const upgrades = useSelector((state) => state.game.upgrades);
  const upgrade = UPGRADES[type];
  
  const currentLevel = upgrades[type];
  const cost = Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, currentLevel));
  const canAfford = resources.money >= cost;

  const handlePurchase = () => {
    dispatch(purchaseUpgrade({
      type,
      amount: 1,
      cost,
    }));
  };

  const Icon = upgrade.icon;

  return (
    <Grid item xs={12} md={4}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Icon color={upgrade.color} sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              {upgrade.name}
            </Typography>
          </Box>

          <Typography color="textSecondary" variant="body2" gutterBottom>
            {upgrade.description}
          </Typography>

          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Current Level: {currentLevel}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Benefit: {upgrade.benefit}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cost: ${cost.toLocaleString()}
            </Typography>
          </Box>

          <Tooltip title={!canAfford ? 'Not enough money' : ''}>
            <span>
              <Button
                variant="contained"
                color={upgrade.color}
                fullWidth
                disabled={!canAfford}
                onClick={handlePurchase}
              >
                Purchase Upgrade
              </Button>
            </span>
          </Tooltip>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default function UpgradeShop() {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upgrade Shop
      </Typography>
      <Grid container spacing={3}>
        {Object.keys(UPGRADES).map((type) => (
          <UpgradeCard key={type} type={type} />
        ))}
      </Grid>
    </Box>
  );
}
