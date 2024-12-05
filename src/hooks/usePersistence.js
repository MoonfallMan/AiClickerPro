import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const SAVE_INTERVAL = 5000; // Save every 5 seconds
const STORAGE_KEY = 'aiClickerSave';
const SAVE_VERSION = '1.0.0';

// List of state keys we want to persist
const PERSIST_KEYS = ['game', 'research'];

// Export save data as a file
export const exportSave = () => {
  try {
    const save = localStorage.getItem(STORAGE_KEY);
    if (!save) return;

    const blob = new Blob([save], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tycoon-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exporting save:', err);
  }
};

// Import save data from a file
export const importSave = async (file) => {
  try {
    const text = await file.text();
    const save = JSON.parse(text);
    
    // Validate save data
    if (!save._timestamp || !save.game || !save.research) {
      throw new Error('Invalid save file format');
    }
    
    localStorage.setItem(STORAGE_KEY, text);
    window.location.reload(); // Reload to apply imported save
  } catch (err) {
    console.error('Error importing save:', err);
    alert('Failed to import save file. Make sure it\'s a valid save file.');
  }
};

export const loadGameState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return undefined;
    }
    
    const savedState = JSON.parse(serializedState);
    const timestamp = savedState._timestamp;
    
    // If the save is older than 1 hour, don't process offline progress
    const processOfflineProgress = Date.now() - timestamp < 3600000;
    
    // Remove the timestamp from the saved state
    delete savedState._timestamp;
    
    return {
      state: savedState,
      timestamp,
      processOfflineProgress
    };
  } catch (err) {
    console.error('Error loading saved game:', err);
    return undefined;
  }
};

export const saveGameState = (state) => {
  try {
    // Only save the keys we want to persist
    const persistState = PERSIST_KEYS.reduce((acc, key) => {
      acc[key] = state[key];
      return acc;
    }, {});
    
    // Add timestamp to the save
    persistState._timestamp = Date.now();
    
    const serializedState = JSON.stringify(persistState);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving game:', err);
  }
};

// Calculate offline progress
export const calculateOfflineProgress = (state, lastTimestamp) => {
  const elapsedSeconds = Math.floor((Date.now() - lastTimestamp) / 1000);
  const maxOfflineSeconds = 3600; // Max 1 hour of offline progress
  const secondsToProcess = Math.min(elapsedSeconds, maxOfflineSeconds);
  
  // Deep clone the state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state));
  
  // Calculate offline earnings and progress
  if (newState.game) {
    // Process resources
    const resourcesPerSecond = {
      money: (newState.game.resources.computePower || 0) * 0.1,
      computePower: 1,
      dataQuality: 0.5
    };

    Object.entries(resourcesPerSecond).forEach(([resource, perSecond]) => {
      if (newState.game.resources[resource] !== undefined) {
        newState.game.resources[resource] += perSecond * secondsToProcess;
      }
    });
  }
  
  return newState;
};

// Hook for auto-saving game state
export default function usePersistence() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  // Save game periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameState(state);
    }, SAVE_INTERVAL);

    // Also save when the window is closed
    const handleBeforeUnload = () => {
      saveGameState(state);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state]);

  return null;
}
