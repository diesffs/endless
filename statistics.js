import { handleSavedData } from './functions.js';
import { game, hero } from './main.js';

export default class Statistics {
  constructor(savedData = null) {
    this.enemiesKilled = {
      total: 0,
      normal: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.highestDamageDealt = 0;
    this.totalGoldEarned = 0;
    this.totalItemsFound = 0;
    this.timePlayedInSeconds = 0;
    this.prestigeCount = 0;
    this.highestZoneReached = 0;

    handleSavedData(savedData, this);
    this.lastUpdate = Date.now();
  }

  resetStatistics() {
    this.enemiesKilled = {
      total: 0,
      normal: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.highestDamageDealt = 0;
    this.totalGoldEarned = 0;
    this.totalItemsFound = 0;
    this.timePlayedInSeconds = 0;
    this.prestigeCount = 0;
    this.highestZoneReached = 0;
  }

  // Add to the constructor or in a separate initUI method
  initializeStatisticsUI() {
    const resetButton = document.getElementById('reset-progress');
    const modal = document.getElementById('reset-modal');
    const confirmButton = document.getElementById('confirm-reset');
    const cancelButton = document.getElementById('cancel-reset');

    if (resetButton && modal && confirmButton && cancelButton) {
      // Open modal on Reset button click
      resetButton.onclick = () => {
        modal.style.display = 'block';
      };

      // Confirm Reset action
      confirmButton.onclick = () => {
        modal.style.display = 'none';
        game.resetAllProgress();
      };

      // Cancel Reset action
      cancelButton.onclick = () => {
        modal.style.display = 'none';
      };

      // Close modal when clicking outside
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
    }

    this.updateStatisticsUI();
  }

  updateStatisticsUI() {
    // Update total enemies killed
    const enemiesKilled = document.getElementById('stat-enemies-killed');
    if (enemiesKilled) {
      enemiesKilled.textContent = `Total Enemies killed: ${this.enemiesKilled.total || 0}`;
    }

    // Update highest zone if displayed
    const highestZone = document.getElementById('stat-highest-zone');
    if (highestZone) {
      highestZone.textContent = `Highest Zone Reached: ${this.highestZoneReached || 1}`;
    }
  }

  increment(category, subcategory = null, amount = 1) {
    if (subcategory) {
      if (!this[category][subcategory]) {
        this[category][subcategory] = 0;
      }
      this[category][subcategory] += amount;
    } else {
      if (!this[category]) {
        this[category] = 0;
      }
      this[category] += amount;
    }
  }

  //TODO: use it
  update() {
    const now = Date.now();
    this.timePlayedInSeconds += (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;
  }
}
