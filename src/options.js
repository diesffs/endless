import { game } from './globals.js';
import { showConfirmDialog } from './ui/ui.js';

/**
 * Initialize the Options tab UI and logic.
 */
export function initializeOptionsUI() {
  // Create options UI structure dynamically
  const optionsTab = document.getElementById('options');
  if (!optionsTab) return;
  optionsTab.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'options-container';
  container.innerHTML = `
    <button id="reset-progress">Reset All Progress</button>
    <div class="options-section">
      <a
        href="https://discord.gg/pvCxff4s"
        target="_blank"
        rel="noopener noreferrer"
        class="discord-link"
        aria-label="Join our Discord"
      >
        <span>Join our Discord</span>
      </a>
    </div>
  `;
  optionsTab.appendChild(container);

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
