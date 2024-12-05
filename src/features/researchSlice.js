import { createSlice } from '@reduxjs/toolkit';

const RESEARCH_TREE = {
  // Basic Models
  enhancedChatbot: {
    id: 'enhancedChatbot',
    name: 'Enhanced Chatbot',
    description: 'Improved chatbot with better context understanding',
    cost: 25000,
    researchTime: 60,
    requirements: [],
    unlocks: {
      type: 'model',
      model: {
        name: 'Enhanced Chatbot',
        cost: 2000,
        computeCost: 75,
        dataCost: 30,
        baseTime: 45,
        revenuePerTick: 200,
      }
    }
  },
  multimodalAI: {
    id: 'multimodalAI',
    name: 'Multimodal AI',
    description: 'AI that can process both text and images',
    cost: 50000,
    researchTime: 120,
    requirements: ['enhancedChatbot'],
    unlocks: {
      type: 'model',
      model: {
        name: 'Multimodal Assistant',
        cost: 5000,
        computeCost: 150,
        dataCost: 60,
        baseTime: 90,
        revenuePerTick: 500,
      }
    }
  },
  
  // Advanced Models
  agentNetwork: {
    id: 'agentNetwork',
    name: 'AI Agent Network',
    description: 'Network of specialized AI agents working together',
    cost: 100000,
    researchTime: 180,
    requirements: ['multimodalAI'],
    unlocks: {
      type: 'model',
      model: {
        name: 'AI Agent Network',
        cost: 10000,
        computeCost: 300,
        dataCost: 120,
        baseTime: 120,
        revenuePerTick: 1000,
      }
    }
  },
  
  // Efficiency Improvements
  parallelTraining: {
    id: 'parallelTraining',
    name: 'Parallel Training',
    description: 'Train multiple models simultaneously faster',
    cost: 75000,
    researchTime: 90,
    requirements: ['enhancedChatbot'],
    unlocks: {
      type: 'bonus',
      effect: {
        type: 'trainingSpeed',
        value: 1.5
      }
    }
  },
  
  // Resource Management
  efficientCompute: {
    id: 'efficientCompute',
    name: 'Efficient Computing',
    description: 'Reduce compute costs for all models',
    cost: 60000,
    researchTime: 75,
    requirements: ['parallelTraining'],
    unlocks: {
      type: 'bonus',
      effect: {
        type: 'computeCost',
        value: 0.8
      }
    }
  }
};

const initialState = {
  researched: [],
  currentResearch: null,
  researchProgress: 0,
  bonuses: {
    trainingSpeed: 1,
    computeCost: 1,
  }
};

export const researchSlice = createSlice({
  name: 'research',
  initialState,
  reducers: {
    startResearch: (state, action) => {
      const research = RESEARCH_TREE[action.payload];
      if (research && !state.currentResearch) {
        state.currentResearch = action.payload;
        state.researchProgress = 0;
      }
    },
    updateResearchProgress: (state, action) => {
      if (state.currentResearch) {
        state.researchProgress = action.payload;
        if (state.researchProgress >= 100) {
          const completed = state.currentResearch;
          state.researched.push(completed);
          state.currentResearch = null;
          state.researchProgress = 0;
          
          // Apply bonuses if applicable
          const research = RESEARCH_TREE[completed];
          if (research.unlocks.type === 'bonus') {
            const { type, value } = research.unlocks.effect;
            state.bonuses[type] = value;
          }
        }
      }
    },
    cancelResearch: (state) => {
      state.currentResearch = null;
      state.researchProgress = 0;
    }
  }
});

export const { startResearch, updateResearchProgress, cancelResearch } = researchSlice.actions;
export const selectAvailableResearch = (state) => {
  return Object.entries(RESEARCH_TREE).reduce((acc, [id, research]) => {
    const isResearched = state.research.researched.includes(id);
    const requirementsMet = research.requirements.every(req => 
      state.research.researched.includes(req)
    );
    
    if (!isResearched && requirementsMet) {
      acc[id] = research;
    }
    return acc;
  }, {});
};

export const RESEARCH_TREE_DATA = RESEARCH_TREE;
export default researchSlice.reducer;
