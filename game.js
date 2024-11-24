import {
  initializeUI,
  updatePlayerHealth,
  updateEnemyHealth,
  updateZoneUI,
} from "./ui.js";
import {
  playerAttack,
  enemyAttack,
  startBattle,
  stopBattle,
} from "./combat.js";
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

  toggleBattle () {
    if (this.gameStarted) {
      stopBattle(this);
    } else {
      this.resetAllHealth();
      this.lastPlayerAttack = Date.now(); // Reset timer explicitly
      startBattle(this);
    }
  }

  update (currentTime) {
    if (!this.gameStarted) return;

    // Handle combat
    playerAttack(this, currentTime);
    enemyAttack(this, currentTime);
  }

  incrementZone () {
    this.zone += 1;

    if (this.zone > hero.highestZone) {
      hero.highestZone = this.zone;
    }

    updateZoneUI(this.zone);
  }

  resetAllHealth () {
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
  gameLoop () {
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
      saveGame(this);
    }
  }
}

export default Game;
