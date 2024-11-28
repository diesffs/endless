import {
  initializeUI,
  updatePlayerHealth,
  updateEnemyHealth,
  updateZoneUI,
  updateResources,
} from "./ui.js";
import { playerAttack, enemyAttack } from "./combat.js";
import { saveGame } from "./storage.js";
import Inventory from "./inventory.js";
import { hero } from "./main.js";

class Game {
  constructor(prestige = null, savedData) {
    this.gameStarted = false;
    this.currentEnemy = null;
    this.lastPlayerAttack = 0;
    this.zone = 1;
    this.inventory = new Inventory(this, savedData?.inventory);

    this.prestige = prestige;

    initializeUI(this);
    this.lastPlayerAttack = Date.now();
  }

  incrementZone() {
    this.zone += 1;
    console.log(hero.stats.crystals);
    if (this.zone > hero.stats.highestZone) {
      hero.stats.highestZone = this.zone;
      hero.stats.crystals += 1; // Award 1 crystal for increasing highest zone
    }

    updateZoneUI(this.zone);
    updateResources(hero.stats, this); // Update resources to reflect new crystal count
  }

  resetAllHealth() {
    hero.stats.stats.currentHealth = hero.stats.stats.maxHealth;
    updatePlayerHealth(hero.stats.stats);
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
}

export default Game;
