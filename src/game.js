import {
  updatePlayerLife,
  updateEnemyStats,
  updateStageUI,
  updateResources,
  updateBuffIndicators,
  showToast,
  initializeSkillTreeUI,
} from './ui/ui.js';
import { playerAttack, enemyAttack, playerDeath, defeatEnemy } from './combat.js';
import { game, hero, inventory, crystalShop, training, skillTree, statistics, quests, soulShop } from './globals.js';
import Enemy from './enemy.js';
import { ITEM_SLOTS, MATERIALS_SLOTS } from './inventory.js';
import { updateInventoryGrid } from './ui/inventoryUi.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateQuestsUI } from './ui/questUi.js';
import { updateBossUI } from './ui/bossUi.js';
import { updateRegionUI } from './region.js';

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
    }

    updateStageUI();
    updateResources(); // Update resources to reflect new crystal count
  }

  damagePlayer(damage) {
    hero.stats.currentLife -= damage;
    if (hero.stats.currentLife <= 0) {
      // check if ressurection will proc
      if (!hero.willRessurect()) {
        hero.stats.currentLife = 0;
        playerDeath();
      }
    }
    updatePlayerLife();
  }

  healPlayer(heal) {
    hero.stats.currentLife += heal;
    if (hero.stats.currentLife > hero.stats.life) {
      hero.stats.currentLife = hero.stats.life;
    }
    updatePlayerLife();
  }

  restoreMana(mana) {
    hero.stats.currentMana += mana;
    if (hero.stats.currentMana > hero.stats.mana) {
      hero.stats.currentMana = hero.stats.mana;
    }
    updatePlayerLife();
  }

  damageEnemy(damage) {
    damage = Math.floor(damage); // Ensure damage is an integer
    if (game.fightMode === 'arena' && this.currentEnemy) {
      // Boss damage flow
      const isDead = this.currentEnemy.takeDamage(damage);

      if (isDead) {
        defeatEnemy();
      }
      updateEnemyStats();
      // Refresh boss UI
      updateBossUI(this.currentEnemy);
      return;
    }
    // Regular enemy flow
    if (this.currentEnemy) {
      // Only update highestDamageDealt if damage is greater than the current value
      if (damage > statistics.highestDamageDealt) {
        statistics.set('highestDamageDealt', null, damage);
      }
      this.currentEnemy.currentLife -= damage;
      if (this.currentEnemy.currentLife < 0) this.currentEnemy.currentLife = 0;
      updateEnemyStats();

      if (this.currentEnemy.currentLife <= 0) {
        defeatEnemy();
      }
    }
  }

  resetAllLife() {
    hero.stats.currentLife = hero.stats.life;
    hero.stats.currentMana = hero.stats.mana;
    updatePlayerLife();
    this.currentEnemy.resetLife();
    updateEnemyStats();

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

    // Regenerate life and mana every 100 ms
    if (currentTime - this.lastRegen >= 100) {
      hero.regenerate();
      this.lastRegen = currentTime;
    }

    // Only update CrystalShop UI after stage progression
    if (this.stageChanged) {
      this.stageChanged = false; // Reset flag
      crystalShop.initializeCrystalShopUI(); // Update CrystalShop UI
    }

    if (currentTime % 30000 < 16) {
      game.saveGame();
    }

    // Auto-cast logic: run every game loop
    skillTree.autoCastEligibleSkills();
  }

  toggle() {
    this.gameStarted = !this.gameStarted;

    if (this.gameStarted) {
      this.currentEnemy.lastAttack = Date.now();
      // Reset life and update resources
      this.resetAllLife();
      updateResources();
      updateEnemyStats();
    } else {
      // Stop all active buffs when combat ends
      skillTree.stopAllBuffs();
      updateBuffIndicators();

      // Reset stage and enemy for Explore mode
      this.stage = hero.startingStage;
      updateStageUI();
      updateStatsAndAttributesUI();
      if (game.fightMode === 'arena' && game.currentEnemy) {
        this.currentEnemy = game.currentEnemy;
      } else {
        this.currentEnemy = new Enemy(this.stage);
      }

      hero.stats.currentLife = hero.stats.life; // Reset player life
      hero.stats.currentMana = hero.stats.mana; // Reset player mana
      this.currentEnemy.resetLife(); // Reset enemy life
      updatePlayerLife();
      updateEnemyStats();
    }
  }

  saveGame() {
    statistics.updateStatisticsUI();
    const saveData = {
      hero: hero,
      skillTree: skillTree,
      crystalShop: crystalShop,
      training: training,
      inventory: inventory,
      statistics: statistics,
      quests: quests,
      soulShop: soulShop,
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

  /**
   * Resets hero stats, stage, and enemy to initial state.
   * Updates UI and saves the game.
   */
  resetCoreGameState() {
    // Reset hero and stage-related progress
    hero.setBaseStats(null);

    game.stage = hero.startingStage;
    game.gameStarted = false;
    game.currentEnemy = new Enemy(game.stage);
    game.currentEnemy.resetLife();

    updateStageUI();
    updateResources();
    updatePlayerLife();
    updateEnemyStats();
  }

  /**
   * Resets all player progress, inventory, shops, skills, and statistics.
   * Updates all relevant UI and saves the reset state.
   */
  resetAllProgress() {
    // Reset inventory and equipped items
    inventory.equippedItems = {};
    inventory.inventoryItems = new Array(ITEM_SLOTS).fill(null);
    inventory.materials = new Array(MATERIALS_SLOTS).fill(null);
    updateInventoryGrid();

    soulShop.resetSoulShop();
    training.reset();
    statistics.resetStatistics();
    quests.reset();
    crystalShop.resetCrystalShop();
    crystalShop.initializeCrystalShopUI();
    skillTree.resetSkillTree();
    skillTree.skillPoints = 0; // reset permanent bonuses
    initializeSkillTreeUI();

    // Reset core game state (stage, enemy, player stats, UI, save)
    this.resetCoreGameState();
    hero.recalculateFromAttributes();

    // Update additional UI
    updateStatsAndAttributesUI();
    updateRegionUI();
    updateQuestsUI();
    training.updateTrainingUI('gold-upgrades');
    training.updateTrainingUI('crystal-upgrades');
    statistics.updateStatisticsUI();

    // Reset start button UI
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Fight';
      startBtn.style.backgroundColor = '#059669';
    }

    showToast('All progress has been reset!');
    this.saveGame();
  }
}

export default Game;
