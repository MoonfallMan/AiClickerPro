import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { addModel, updateResources } from '../features/gameSlice';
import { RESEARCH_TREE_DATA } from '../features/researchSlice';

const BASE_MODEL_TYPES = {
  chatbot: {
    name: 'Chatbot',
    cost: 1000,
    computeCost: 50,
    dataCost: 20,
    baseTime: 30,
    revenuePerTick: 100,
  },
  imageGen: {
    name: 'Image Generator',
    cost: 2500,
    computeCost: 100,
    dataCost: 40,
    baseTime: 60,
    revenuePerTick: 250,
  },
  codeAssistant: {
    name: 'Code Assistant',
    cost: 5000,
    computeCost: 200,
    dataCost: 80,
    baseTime: 90,
    revenuePerTick: 500,
  },
};

export default function ModelTraining() {
  const dispatch = useDispatch();
  const resources = useSelector((state) => state.game.resources);
  const models = useSelector((state) => state.game.models);
  const researched = useSelector((state) => state.research.researched);
  const computeCostMultiplier = useSelector((state) => state.research.bonuses.computeCost);
  const [selectedModel, setSelectedModel] = useState('chatbot');

  // Combine base models with researched models
  const availableModels = useMemo(() => {
    const researchedModels = Object.entries(RESEARCH_TREE_DATA)
      .filter(([id]) => researched.includes(id))
      .reduce((acc, [_, research]) => {
        if (research.unlocks.type === 'model') {
          acc[research.unlocks.model.name.toLowerCase().replace(/\s+/g, '')] = research.unlocks.model;
        }
        return acc;
      }, {});

    return { ...BASE_MODEL_TYPES, ...researchedModels };
  }, [researched]);

  // Calculate how many of each type exist
  const modelCounts = models.reduce((acc, model) => {
    acc[model.type] = (acc[model.type] || 0) + 1;
    return acc;
  }, {});

  // Cost scaling formula
  const calculateScaledCost = (baseValue, count, scalingFactor = 1.15) => {
    return Math.round(baseValue * Math.pow(scalingFactor, count || 0));
  };

  const canAffordModel = (type) => {
    const model = availableModels[type];
    const count = modelCounts[type] || 0;
    const adjustedComputeCost = calculateScaledCost(model.computeCost, count) * computeCostMultiplier;
    const adjustedCost = calculateScaledCost(model.cost, count);
    const adjustedDataCost = calculateScaledCost(model.dataCost, count);

    return (
      resources.money >= adjustedCost &&
      resources.computePower >= adjustedComputeCost &&
      resources.dataQuality >= adjustedDataCost
    );
  };

  const startTraining = () => {
    const model = availableModels[selectedModel];
    const count = modelCounts[selectedModel] || 0;
    
    if (canAffordModel(selectedModel)) {
      const adjustedComputeCost = calculateScaledCost(model.computeCost, count) * computeCostMultiplier;
      const adjustedCost = calculateScaledCost(model.cost, count);
      const adjustedDataCost = calculateScaledCost(model.dataCost, count);

      const newModel = {
        id: Date.now(),
        type: selectedModel,
        name: model.name,
        progress: 0,
        trainingTime: model.baseTime,
        revenuePerTick: model.revenuePerTick,
        status: 'training',
      };

      dispatch(addModel(newModel));
      dispatch(
        updateResources({
          money: resources.money - adjustedCost,
          computePower: resources.computePower - adjustedComputeCost,
          dataQuality: resources.dataQuality - adjustedDataCost,
        })
      );
    }
  };

  // Group models by type and status
  const groupedModels = models.reduce((acc, model) => {
    const key = `${model.type}-${model.status}`;
    if (!acc[key]) {
      acc[key] = {
        ...model,
        count: 1,
        totalRevenue: model.revenuePerTick
      };
    } else {
      acc[key].count++;
      acc[key].totalRevenue += model.revenuePerTick;
    }
    return acc;
  }, {});

  // Separate training and completed models
  const trainingModels = Object.values(groupedModels).filter(
    model => model.status === 'training'
  );
  const completedModels = Object.values(groupedModels).filter(
    model => model.status === 'complete'
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Train New AI Model
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Model Type</InputLabel>
                <Select
                  value={selectedModel}
                  label="Model Type"
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {Object.entries(availableModels).map(([key, model]) => (
                    <MenuItem key={key} value={key}>
                      {model.name} - ${model.cost}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                {(() => {
                  const count = modelCounts[selectedModel] || 0;
                  const model = availableModels[selectedModel];
                  const baseCost = model.cost;
                  const baseComputeCost = model.computeCost;
                  const baseDataCost = model.dataCost;
                  const adjustedCost = calculateScaledCost(baseCost, count);
                  const adjustedComputeCost = calculateScaledCost(baseComputeCost, count);
                  const adjustedDataCost = calculateScaledCost(baseDataCost, count);

                  return (
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Cost: ${adjustedCost}
                        {count > 0 && (
                          <Chip 
                            label={`+${Math.round((adjustedCost/baseCost - 1) * 100)}%`}
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Compute Cost: {Math.round(adjustedComputeCost * computeCostMultiplier)}
                        {(count > 0 || computeCostMultiplier !== 1) && (
                          <Chip 
                            label={`${computeCostMultiplier < 1 ? '-' : '+'}${Math.abs(Math.round((adjustedComputeCost * computeCostMultiplier/baseComputeCost - 1) * 100))}%`}
                            color={(adjustedComputeCost * computeCostMultiplier) < baseComputeCost ? 'success' : 'error'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Data Cost: {adjustedDataCost}
                        {count > 0 && (
                          <Chip 
                            label={`+${Math.round((adjustedDataCost/baseDataCost - 1) * 100)}%`}
                            color="error"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Revenue per Tick: ${model.revenuePerTick}
                      </Typography>
                      {count > 0 && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
                          You have {count} {model.name}(s) - Costs increase with each built
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={startTraining}
                disabled={!canAffordModel(selectedModel)}
              >
                Start Training
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Training Models - Show individual panels */}
          {models.filter(model => model.status === 'training').map((model) => (
            <Grid item xs={12} key={model.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{model.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      ID: {model.id}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={model.progress}
                    sx={{ my: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Training in Progress... {Math.round(model.progress)}%
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Expected Revenue: ${model.revenuePerTick}/tick
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Completed Models - Show combined cards */}
          {completedModels.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Active Models
              </Typography>
              <Grid container spacing={2}>
                {completedModels.map((model) => (
                  <Grid item xs={12} sm={6} md={4} key={`${model.type}-complete`}>
                    <Card sx={{ 
                      bgcolor: 'success.light', 
                      '&:hover': { 
                        bgcolor: 'success.main',
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" color="white">{model.name}</Typography>
                          <Chip 
                            label={`×${model.count}`} 
                            color="primary"
                            sx={{ 
                              bgcolor: 'white',
                              fontWeight: 'bold',
                              fontSize: '1.1em'
                            }}
                          />
                        </Box>
                        <Typography variant="body1" color="white" sx={{ mt: 2 }}>
                          Total Revenue: ${model.totalRevenue}/tick
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          ${model.revenuePerTick} per model
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
