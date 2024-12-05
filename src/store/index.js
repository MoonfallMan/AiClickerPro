import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/gameSlice';
import researchReducer from '../features/researchSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    research: researchReducer
  },
});
