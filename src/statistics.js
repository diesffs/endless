import { game } from './globals.js';
import { handleSavedData } from './functions.js';
import { showConfirmDialog } from './ui/ui.js';

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
    this.timeSinceLastPrestige = 0;
    this.totalTimePlayed = 0; // New: total time played (resets on reset)
    this.prestigeCount = 0;
    this.highestStageReached = 0;
    this.totalTimeInFights = 0; // Track total time spent in fights

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
    this.timeSinceLastPrestige = 0;
    this.totalTimePlayed = 0; // Reset total time played
    this.prestigeCount = 0;
    this.highestStageReached = 0;
    this.totalTimeInFights = 0; // Reset total time in fights
    this.updateStatisticsUI();
  }

  initializeStatisticsUI() {
    const resetButton = document.getElementById('reset-progress');
    // Show confirm dialog for resetting progress
    resetButton.onclick = async () => {
      const confirmed = await showConfirmDialog('Are you sure you want to reset all progress? This cannot be undone!');
      if (confirmed) {
        game.resetAllProgress();
      }
    };

    this.updateStatisticsUI();
  }

  updateStatisticsUI() {
    // Total Time Played (resets on reset)
    const totalTime = document.getElementById('stat-total-time-played');
    if (totalTime) {
      const seconds = Math.floor(this.totalTimePlayed);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      totalTime.textContent = `Total Time Played: ${hours}h ${minutes}m`;
    }

    // Current Session Time Played (not reset until reload)
    const sessionTime = document.getElementById('stat-time-played');
    if (sessionTime) {
      const seconds = Math.floor(this.timeSinceLastPrestige);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      sessionTime.textContent = `Time Since Last Prestige: ${hours}h ${minutes}m`;
    }

    // Total Enemies Killed
    const enemiesKilled = document.getElementById('stat-enemies-killed');
    if (enemiesKilled) {
      enemiesKilled.textContent = `Total Enemies Killed: ${this.enemiesKilled.total || 0}`;
    }

    // Highest Damage Dealt
    const highestDamage = document.getElementById('stat-highest-damage');
    if (highestDamage) {
      highestDamage.textContent = `Highest Damage Dealt: ${Math.floor(this.highestDamageDealt) || 0}`;
    }

    // Total Gold Earned
    const totalGold = document.getElementById('stat-total-gold');
    if (totalGold) {
      totalGold.textContent = `Total Gold Earned: ${this.totalGoldEarned || 0}`;
    }

    // Total Items Found
    const itemsFound = document.getElementById('stat-items-found');
    if (itemsFound) {
      itemsFound.textContent = `Total Items Found: ${this.totalItemsFound || 0}`;
    }

    // Prestige Count
    const prestigeCount = document.getElementById('stat-prestige-count');
    if (prestigeCount) {
      prestigeCount.textContent = `Prestige Count: ${this.prestigeCount || 0}`;
    }

    // Highest Stage Reached
    const highestStage = document.getElementById('stat-highest-stage');
    if (highestStage) {
      highestStage.textContent = `Highest Stage Reached: ${this.highestStageReached || 1}`;
    }

    // Total Time In Fights
    const timeInFights = document.getElementById('stat-total-time-in-fights');
    if (timeInFights) {
      const seconds = Math.floor(this.totalTimeInFights);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      timeInFights.textContent = `Total Time In Fights: ${hours}h ${minutes}m ${seconds % 60}s`;
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
    this.updateStatisticsUI();
  }

  set(category, subcategory = null, value) {
    if (subcategory) {
      if (this[category]) {
        this[category][subcategory] = value;
      }
    } else {
      this[category] = value;
    }
    this.updateStatisticsUI();
  }

  update() {
    const now = Date.now();
    const deltaSeconds = (now - this.lastUpdate) / 1000;
    this.timeSinceLastPrestige += deltaSeconds;
    this.totalTimePlayed += deltaSeconds;
    this.lastUpdate = now;
    this.updateStatisticsUI();
  }

  // Add a method to increment totalTimeInFights
  addFightTime(seconds) {
    this.totalTimeInFights += seconds;
    this.updateStatisticsUI();
  }
}
