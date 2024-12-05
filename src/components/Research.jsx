import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Science as ResearchIcon,
  Lock as LockIcon,
  CheckCircle as CompletedIcon,
  Timer as TimerIcon,
  Memory as ComputeIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';
import { startResearch, cancelResearch, RESEARCH_TREE_DATA } from '../features/researchSlice';

const ResearchCard = ({ id, research, isAvailable, isResearched, isActive, progress }) => {
  const dispatch = useDispatch();
  const resources = useSelector((state) => state.game.resources);
  const canAfford = resources.money >= research.cost;

  const handleClick = () => {
    if (isAvailable && !isResearched && !isActive && canAfford) {
      dispatch(startResearch(id));
    }
  };

  const getStatusColor = () => {
    if (isResearched) return 'success.main';
    if (isActive) return 'primary.main';
    if (isAvailable && canAfford) return 'warning.main';
    return 'text.disabled';
  };

  const getStatusIcon = () => {
    if (isResearched) return <CompletedIcon color="success" />;
    if (isActive) return <TimerIcon color="primary" />;
    if (!isAvailable) return <LockIcon color="disabled" />;
    return <ResearchIcon sx={{ color: canAfford ? 'warning.main' : 'text.disabled' }} />;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        opacity: !isAvailable ? 0.7 : 1,
        position: 'relative',
        cursor: isAvailable && !isResearched && !isActive && canAfford ? 'pointer' : 'default',
        '&:hover': {
          transform: isAvailable && !isResearched && !isActive && canAfford ? 'scale(1.02)' : 'none',
          transition: 'transform 0.2s'
        }
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="h6" color={getStatusColor()}>
            {research.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {research.description}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Cost: ${research.cost.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Research Time: {research.researchTime}s
          </Typography>
          
          {research.unlocks.type === 'model' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="primary">
                Unlocks: {research.unlocks.model.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Revenue: ${research.unlocks.model.revenuePerTick}/tick
              </Typography>
            </Box>
          )}
          
          {research.unlocks.type === 'bonus' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="primary">
                Bonus: {research.unlocks.effect.value > 1 ? '+' : '-'}
                {Math.abs((1 - research.unlocks.effect.value) * 100)}%{' '}
                {research.unlocks.effect.type === 'trainingSpeed' ? 'Training Speed' : 'Compute Cost'}
              </Typography>
            </Box>
          )}
        </Box>

        {isActive && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Progress: {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ResearchBonuses = () => {
  const bonuses = useSelector((state) => state.research.bonuses);
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BrainIcon color="primary" />
        Active Research Bonuses
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Training Speed Multiplier:
          </Typography>
          <Typography variant="h6" color="primary">
            {bonuses.trainingSpeed}x
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Compute Cost Multiplier:
          </Typography>
          <Typography variant="h6" color="success">
            {bonuses.computeCost}x
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default function Research() {
  const dispatch = useDispatch();
  const { researched, currentResearch, researchProgress } = useSelector((state) => state.research);
  
  const isResearched = (id) => researched.includes(id);
  const isAvailable = (research) => {
    return research.requirements.every(req => researched.includes(req));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ResearchIcon />
        Research Lab
      </Typography>

      <ResearchBonuses />

      {currentResearch && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Current Research</Typography>
            <Button 
              variant="outlined" 
              color="error" 
              size="small"
              onClick={() => dispatch(cancelResearch())}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        {Object.entries(RESEARCH_TREE_DATA).map(([id, research]) => (
          <Grid item xs={12} md={6} lg={4} key={id}>
            <ResearchCard
              id={id}
              research={research}
              isAvailable={isAvailable(research)}
              isResearched={isResearched(id)}
              isActive={currentResearch === id}
              progress={currentResearch === id ? researchProgress : 0}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
