import { createSlice } from '@reduxjs/toolkit';

const ACHIEVEMENTS = {
  firstModel: {
    id: 'firstModel',
    title: 'Hello AI World!',
    description: 'Train your first AI model',
    reward: 5000,
    condition: (state) => state.stats.totalModels >= 1,
    achieved: false
  },
  moneyMaker: {
    id: 'moneyMaker',
    title: 'Money Maker',
    description: 'Earn $100,000 in total',
    reward: 10000,
    condition: (state) => state.stats.totalEarnings >= 100000,
    achieved: false
  },
  aiFactory: {
    id: 'aiFactory',
    title: 'AI Factory',
    description: 'Have 5 models running simultaneously',
    reward: 15000,
    condition: (state) => state.models.filter(m => m.status === 'complete').length >= 5,
    achieved: false
  },
  researcher: {
    id: 'researcher',
    title: 'Lead Researcher',
    description: 'Hire 3 researchers',
    reward: 20000,
    condition: (state) => state.upgrades.researchers >= 3,
    achieved: false
  },
  datacenter: {
    id: 'datacenter',
    title: 'Data Center Owner',
    description: 'Own 10 GPU clusters',
    reward: 25000,
    condition: (state) => state.upgrades.gpus >= 10,
    achieved: false
  }
};

const initialState = {
  resources: {
    money: 1000,
    computePower: 100,
    dataQuality: 50,
    reputation: 0
  },
  models: [],
  upgrades: {
    gpus: 1,
    datasets: 1,
    researchers: 1
  },
  stats: {
    totalEarnings: 0,
    totalModels: 0,
    timeElapsed: 0,
    highestEarningRate: 0,
    totalSpent: 0,
    history: {
      earnings: [],
      models: [],
      upgrades: []
    }
  },
  achievements: Object.keys(ACHIEVEMENTS).reduce((acc, key) => {
    acc[key] = { ...ACHIEVEMENTS[key] };
    return acc;
  }, {}),
  activeBoosts: {
    revenueMultiplier: 1,
    computeEfficiency: 1,
    trainingSpeed: 1,
    expiryTimes: {}, // Timestamps for when boosts expire
  }
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateResources: (state, action) => {
      const oldMoney = state.resources.money;
      state.resources = { ...state.resources, ...action.payload };
      
      // Track earnings
      const earnings = state.resources.money - oldMoney;
      if (earnings > 0) {
        state.stats.totalEarnings += earnings;
        state.stats.highestEarningRate = Math.max(
          state.stats.highestEarningRate,
          earnings
        );
        
        // Keep last 60 earnings records (1 minute)
        state.stats.history.earnings.push(earnings);
        if (state.stats.history.earnings.length > 60) {
          state.stats.history.earnings.shift();
        }
      }
    },
    addModel: (state, action) => {
      state.models.push(action.payload);
      state.stats.totalModels += 1;
      state.stats.history.models.push({
        timestamp: Date.now(),
        type: action.payload.type
      });
    },
    updateModel: (state, action) => {
      const index = state.models.findIndex(model => model.id === action.payload.id);
      if (index !== -1) {
        const oldStatus = state.models[index].status;
        state.models[index] = { ...state.models[index], ...action.payload };
        
        // Track completed models
        if (oldStatus === 'training' && action.payload.status === 'complete') {
          state.stats.modelsCompleted += 1;
        }
      }
    },
    purchaseUpgrade: (state, action) => {
      const { type, amount, cost } = action.payload;
      if (state.resources.money >= cost) {
        state.upgrades[type] += amount;
        state.resources.money -= cost;
        state.stats.upgradesPurchased += 1;
        state.stats.totalSpent += cost;
        
        state.stats.history.upgrades.push({
          timestamp: Date.now(),
          type,
          cost
        });
      }
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    checkAchievements: (state) => {
      Object.keys(state.achievements).forEach(key => {
        const achievement = state.achievements[key];
        if (!achievement.achieved && achievement.condition(state)) {
          achievement.achieved = true;
          state.resources.money += achievement.reward;
          state.resources.reputation += 10;
        }
      });
    },
    applyBoost: (state, action) => {
      const { boostType, multiplier, duration } = action.payload;
      state.activeBoosts[boostType] = multiplier;
      state.activeBoosts.expiryTimes[boostType] = Date.now() + (duration * 1000);
    },
    checkBoosts: (state) => {
      const currentTime = Date.now();
      Object.entries(state.activeBoosts.expiryTimes).forEach(([boostType, expiryTime]) => {
        if (currentTime >= expiryTime) {
          state.activeBoosts[boostType] = 1;
          delete state.activeBoosts.expiryTimes[boostType];
        }
      });
    }
  }
});

export const {
  updateResources,
  addModel,
  updateModel,
  purchaseUpgrade,
  updateStats,
  checkAchievements,
  applyBoost,
  checkBoosts
} = gameSlice.actions;

export default gameSlice.reducer;
