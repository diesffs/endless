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
import { game, hero, inventory, prestige, training, skillTree, statistics, quests, soulShop } from './globals.js';
import Enemy from './enemy.js';
import { ITEM_SLOTS, MATERIALS_SLOTS } from './inventory.js';
import { updateInventoryGrid } from './ui/inventoryUi.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateQuestsUI } from './ui/questUi.js';
import { updateBossUI } from './ui/bossUi.js';

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

    // Only update Prestige UI after stage progression
    if (this.stageChanged) {
      this.stageChanged = false; // Reset flag
      prestige.initializePrestigeUI(); // Update Prestige UI
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
      prestige: prestige,
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

  resetAllProgress() {
    hero.highestStage = 1; // needed to reset souls
    hero.souls = 0;
    hero.crystals = 0;
    hero.startingStage = 1;
    // reset prestige upgrades
    prestige.crystalUpgrades = {
      startingStage: 0,
    };
    skillTree.resetSkillTree();

    // Reset inventory and equipped items
    inventory.equippedItems = {};
    inventory.inventoryItems = new Array(ITEM_SLOTS).fill(null);
    inventory.materials = new Array(MATERIALS_SLOTS).fill(null);
    updateInventoryGrid();

    soulShop.resetSoulShop(); // Reset soul shop

    prestige.performPrestige(); // Use the existing functionality to reset progress
    statistics.resetStatistics();
    quests.reset();
    initializeSkillTreeUI(); // to show path selection
    showToast('All progress has been reset!');
    updateQuestsUI();
    this.saveGame(); // Save the reset progress
  }
}

export default Game;
