import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateZoneUI,
  updateResources,
  updateBuffIndicators,
  showToast,
  initializeSkillTreeUI,
} from './ui.js';
import { playerAttack, enemyAttack } from './combat.js';
import { game, hero, inventory, prestige, shop, skillTree, statistics } from './main.js';
import Enemy from './enemy.js';

class Game {
  constructor() {
    this.gameStarted = false;
    this.currentEnemy = null;
    this.zone = 1;
    this.lastPlayerAttack = Date.now();
    this.lastRegen = Date.now();
  }

  incrementZone() {
    this.zone += 1;
    if (this.zone > hero.highestZone) {
      if (statistics.highestZoneReached < this.zone) {
        statistics.set('highestZoneReached', null, this.zone);
      }
      hero.highestZone = this.zone;
      hero.crystals += 1; // Award 1 crystal for increasing highest zone
    }

    updateZoneUI();
    updateResources(); // Update resources to reflect new crystal count
  }

  resetAllHealth() {
    hero.stats.currentHealth = hero.stats.health;
    hero.stats.currentMana = hero.stats.mana;
    updatePlayerHealth();
    this.currentEnemy.resetHealth();
    updateEnemyHealth();

    // Reset combat timers
    const currentTime = Date.now();
    this.lastPlayerAttack = currentTime;
    if (this.currentEnemy) {
      this.currentEnemy.lastAttack = currentTime;
    }
  }

  // Add auto-save functionality to gameLoop
  gameLoop() {
    if (!this.gameStarted) return;

    // Update buff timers and effects
    skillTree.getActiveBuffEffects();
    updateBuffIndicators();

    const currentTime = Date.now();
    playerAttack(currentTime);
    enemyAttack(currentTime);

    // Regenerate health and mana every 100 ms
    if (currentTime - this.lastRegen >= 100) {
      hero.regenerate();
      this.lastRegen = currentTime;
    }

    // Only update Prestige UI after zone progression
    if (this.zoneChanged) {
      this.zoneChanged = false; // Reset flag
      prestige.initializePrestigeUI(); // Update Prestige UI
    }

    if (currentTime % 30000 < 16) {
      game.saveGame();
    }
  }

  toggle() {
    this.gameStarted = !this.gameStarted;

    if (this.gameStarted) {
      this.currentEnemy.lastAttack = Date.now();
      // When the game starts, reset health and update resources
      this.resetAllHealth();
      updateResources(); // Pass game here
    } else {
      // Stop all active buffs when combat ends
      skillTree.stopAllBuffs();
      updateBuffIndicators();

      this.zone = hero.startingZone; // Reset zone
      updateZoneUI();
      this.currentEnemy = new Enemy(this.zone);

      hero.stats.currentHealth = hero.stats.health; // Reset player health
      hero.stats.currentMana = hero.stats.mana; // Reset player mana
      this.currentEnemy.resetHealth(); // Reset enemy health
      updatePlayerHealth();
      updateEnemyHealth();
    }
  }

  saveGame() {
    // update statisticsa
    statistics.updateStatisticsUI();

    const saveData = {
      hero: hero,
      skillTree: skillTree,
      prestige: prestige,
      shop: shop,
      inventory: inventory,
      statistics: statistics,
    };

    localStorage.setItem('gameProgress', JSON.stringify(saveData));
  }

  loadGame() {
    const savedData = localStorage.getItem('gameProgress');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    return null;
  }

  clearSave() {
    localStorage.removeItem('gameProgress');
  }

  resetAllProgress() {
    hero.highestZone = 1; // needed to reset souls
    hero.souls = 0;
    hero.crystals = 0;
    hero.startingZone = 1;
    hero.startingGold = 0;
    // reset prestige upgrades
    prestige.crystalUpgrades = {
      startingZone: 0,
      startingGold: 0,
      continuousPlay: false,
    };
    // skill tree reset
    skillTree.selectedPath = null;

    // Reset inventory and equipped items
    inventory.equippedItems = {};
    inventory.inventoryItems = new Array(200).fill(null);
    inventory.updateInventoryGrid();

    prestige.performPrestige(); // Use the existing functionality to reset progress
    statistics.resetStatistics();
    initializeSkillTreeUI(); // to show path selection
    showToast('All progress has been reset!');
  }
}

export default Game;
