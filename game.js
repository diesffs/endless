import { updatePlayerHealth, updateEnemyHealth, updateZoneUI, updateResources, updateBuffIndicators } from './ui.js';
import { playerAttack, enemyAttack } from './combat.js';
import { game, hero, inventory, prestige, shop, skillTree } from './main.js';
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
      hero.highestZone = this.zone;
      hero.crystals += 1; // Award 1 crystal for increasing highest zone
    }

    updateZoneUI();
    updateResources(); // Update resources to reflect new crystal count
  }

  resetAllHealth() {
    hero.stats.currentHealth = hero.stats.maxHealth;
    hero.stats.currentMana = hero.stats.maxMana;
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

    // Regenerate health and mana every second
    if (currentTime - this.lastRegen >= 1000) {
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

      hero.stats.currentHealth = hero.stats.maxHealth; // Reset player health
      hero.stats.currentMana = hero.stats.maxMana; // Reset player mana
      this.currentEnemy.resetHealth(); // Reset enemy health
      updatePlayerHealth();
      updateEnemyHealth();
    }
  }

  saveGame() {
    const saveData = {
      hero: hero,
      skillTree: skillTree,
      prestige: prestige,
      shop: shop,
      inventory: inventory,
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
}

export default Game;
