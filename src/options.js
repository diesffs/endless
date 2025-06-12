import { game } from './globals.js';
import { showConfirmDialog } from './ui/ui.js';

/**
 * Initialize the Options tab UI and logic.
 */
export function initializeOptionsUI() {
  const resetButton = document.getElementById('reset-progress');
  if (resetButton) {
    resetButton.onclick = async () => {
      try {
        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset all progress? This cannot be undone!'
        );
        if (confirmed) {
          game.resetAllProgress();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error resetting progress:', error);
        alert('An error occurred while resetting progress.');
      }
    };
  }
  // No logic needed for Discord link (handled by HTML)
}
