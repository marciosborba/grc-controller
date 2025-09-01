// Auto-loader for user colors on app startup
import { loadUserColorsOnStartup } from './directColorApplicator';

// Function to run immediately when the module is loaded
export const initializeUserColors = () => {
  // Run on DOMContentLoaded to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStoredColors);
  } else {
    // DOM is already loaded
    loadStoredColors();
  }
};

// Load stored colors function
const loadStoredColors = () => {
  try {
    const applied = loadUserColorsOnStartup();
    if (applied) {
      console.log('🎨 User colors loaded automatically on startup');
    }
  } catch (error) {
    console.error('Error loading user colors:', error);
  }
};

// Auto-initialize when module is imported
initializeUserColors();