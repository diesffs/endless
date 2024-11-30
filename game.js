import { updatePlayerHealth, updateEnemyHealth, updateZoneUI, updateResources } from './ui.js';
import { playerAttack, enemyAttack } from './combat.js';
import { saveGame } from './storage.js';
import Inventory from './inventory.js';
import { hero } from './main.js';
import Enemy from './enemy.js';

class Game {
  constructor(prestige = null, savedData) {
    this.gameStarted = false;
    this.currentEnemy = null;
    this.zone = 1;
    this.inventory = new Inventory(savedData?.inventory);
    this.prestige = prestige;
    this.lastPlayerAttack = Date.now();
  }

  incrementZone() {
    this.zone += 1;
    if (this.zone > hero.highestZone) {
      hero.highestZone = this.zone;
      hero.crystals += 1; // Award 1 crystal for increasing highest zone
    }

    updateZoneUI(this.zone);
    updateResources(hero, this); // Update resources to reflect new crystal count
  }

  resetAllHealth() {
    hero.stats.currentHealth = hero.stats.maxHealth;
    updatePlayerHealth(hero.stats);
    this.currentEnemy.resetHealth();
    updateEnemyHealth(this.currentEnemy);

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

    const currentTime = Date.now();
    playerAttack(this, currentTime);
    enemyAttack(this, currentTime);

    // Only update Prestige UI after zone progression
    if (this.zoneChanged) {
      this.zoneChanged = false; // Reset flag
      this.prestige.initializePrestigeUI(); // Update Prestige UI
    }

    if (currentTime % 30000 < 16) {
      saveGame();
    }
  }
  toggle() {
    this.gameStarted = !this.gameStarted;

    if (this.gameStarted) {
      this.currentEnemy.lastAttack = Date.now();
      // When the game starts, reset health and update resources
      this.resetAllHealth();
      updateResources(hero, this); // Pass game here
    } else {
      this.zone = 1; // Reset zone
      updateZoneUI(this.zone);
      this.currentEnemy = new Enemy(this.zone);

      hero.stats.currentHealth = hero.stats.maxHealth; // Reset player health
      this.currentEnemy.resetHealth(); // Reset enemy health
      updatePlayerHealth(hero.stats);
      updateEnemyHealth(this.currentEnemy);
    }
  }
}

export default Game;
