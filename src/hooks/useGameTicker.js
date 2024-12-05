import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateResources, updateModel, updateStats, checkAchievements } from '../features/gameSlice';
import { updateResearchProgress, RESEARCH_TREE_DATA } from '../features/researchSlice';

const TICK_RATE = 1000; // 1 second

export default function useGameTicker() {
  const dispatch = useDispatch();
  const { resources, models, upgrades, stats, activeBoosts } = useSelector((state) => state.game);
  const { currentResearch, bonuses } = useSelector((state) => state.research);

  useEffect(() => {
    const ticker = setInterval(() => {
      // Update elapsed time
      dispatch(updateStats({
        timeElapsed: stats.timeElapsed + 1
      }));

      // Update research progress
      if (currentResearch) {
        const research = RESEARCH_TREE_DATA[currentResearch];
        const progressIncrement = (100 / research.researchTime);
        dispatch(updateResearchProgress(progressIncrement));
      }

      // Calculate researcher bonus (10% faster per researcher)
      const researcherBonus = 1 + (upgrades.researchers * 0.1);
      // Apply research speed and boost bonuses
      const totalSpeedBonus = researcherBonus * bonuses.trainingSpeed * activeBoosts.trainingSpeed;

      // Update model training progress
      models.forEach((model) => {
        if (model.status === 'training') {
          const progressIncrement = (100 / model.trainingTime) * totalSpeedBonus;
          const newProgress = model.progress + progressIncrement;
          
          if (newProgress >= 100) {
            dispatch(updateModel({
              id: model.id,
              progress: 100,
              status: 'complete'
            }));
          } else {
            dispatch(updateModel({
              id: model.id,
              progress: newProgress
            }));
          }
        }
      });

      // Calculate passive income from completed models with revenue boost
      const modelIncome = models
        .filter(model => model.status === 'complete')
        .reduce((sum, model) => sum + model.revenuePerTick, 0) * activeBoosts.revenueMultiplier;

      // Calculate resource generation from upgrades with compute efficiency boost
      const computeGeneration = upgrades.gpus * 10;
      const dataGeneration = upgrades.datasets * 5;

      // Apply compute efficiency boost to resource costs
      const computeEfficiencyMultiplier = activeBoosts.computeEfficiency;

      // Update resources
      dispatch(updateResources({
        money: resources.money + modelIncome,
        computePower: Math.min(
          resources.computePower + computeGeneration * computeEfficiencyMultiplier,
          1000000
        ),
        dataQuality: Math.min(resources.dataQuality + dataGeneration, 1000000),
      }));

      // Check achievements
      dispatch(checkAchievements());
      
    }, TICK_RATE);

    return () => clearInterval(ticker);
  }, [dispatch, resources, models, upgrades, stats, currentResearch, bonuses, activeBoosts]);
}
