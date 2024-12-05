import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/gameSlice';
import researchReducer from '../features/researchSlice';
import { loadGameState, calculateOfflineProgress } from '../hooks/usePersistence';

// Load saved state if it exists
const savedGame = loadGameState();
let preloadedState = undefined;

if (savedGame) {
  preloadedState = savedGame.state;
  
  // Process offline progress if the save is recent enough
  if (savedGame.processOfflineProgress) {
    preloadedState = calculateOfflineProgress(preloadedState, savedGame.timestamp);
  }
}

const store = configureStore({
  reducer: {
    game: gameReducer,
    research: researchReducer
  },
  preloadedState
});

export default store;
