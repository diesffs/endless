import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateStageUI,
  updateResources,
  updateBuffIndicators,
  showToast,
  initializeSkillTreeUI,
} from './ui.js';
import { playerAttack, enemyAttack, playerDeath, defeatEnemy } from './combat.js';
import { game, hero, inventory, prestige, shop, skillTree, statistics } from './globals.js';
import Enemy from './enemy.js';

class Game {
  constructor() {
    this.gameStarted = false;
    this.currentEnemy = null;
    this.stage = 1;
    this.lastPlayerAttack = Date.now();
    this.lastRegen = Date.now();
  }

  incrementStage() {
    this.stage += 1;
    if (this.stage > hero.highestStage) {
      if (statistics.highestStageReached < this.stage) {
        statistics.set('highestStageReached', null, this.stage);
      }
      hero.highestStage = this.stage;
      hero.crystals += 1; // Award 1 crystal for increasing highest stage
    }

    updateStageUI();
    updateResources(); // Update resources to reflect new crystal count
  }

  damagePlayer(damage) {
    hero.stats.currentHealth -= damage;
    if (hero.stats.currentHealth <= 0) {
      hero.stats.currentHealth = 0;
      playerDeath();
    }
    updatePlayerHealth();
  }

  damageEnemy(damage) {
    if (this.currentEnemy) {
      // Only update highestDamageDealt if damage is greater than the current value
      if (damage > statistics.highestDamageDealt) {
        statistics.set('highestDamageDealt', null, damage);
      }
      this.currentEnemy.currentHealth -= damage;
      if (this.currentEnemy.currentHealth < 0) this.currentEnemy.currentHealth = 0;
      updateEnemyHealth();

      if (this.currentEnemy.currentHealth <= 0) {
        defeatEnemy();
      }
    }
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

    const deltaSeconds = 0.1; // gameLoop runs every 100ms
    statistics.addFightTime(deltaSeconds);

    // Regenerate health and mana every 100 ms
    if (currentTime - this.lastRegen >= 100) {
      hero.regenerate();
      this.lastRegen = currentTime;
    }

    // Only update Prestige UI after stage progression
    if (this.stageChanged) {
      this.stageChanged = false; // Reset flag
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

      this.stage = hero.startingStage; // Reset stage
      updateStageUI();
      this.currentEnemy = new Enemy(this.stage);

      hero.stats.currentHealth = hero.stats.health; // Reset player health
      hero.stats.currentMana = hero.stats.mana; // Reset player mana
      this.currentEnemy.resetHealth(); // Reset enemy health
      updatePlayerHealth();
      updateEnemyHealth();
    }
  }

  saveGame() {
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

  /**
   * Loads the latest game data from localStorage.
   * The cloud save/load logic is now handled manually in main.js.
   * This function is no longer used for cloud sync and only loads from localStorage.
   * @returns {object|null} The latest save data
   */
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
    hero.highestStage = 1; // needed to reset souls
    hero.souls = 0;
    hero.crystals = 0;
    hero.startingStage = 1;
    hero.startingGold = 0;
    // reset prestige upgrades
    prestige.crystalUpgrades = {
      startingStage: 0,
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
    this.saveGame(); // Save the reset progress
  }
}

export default Game;
