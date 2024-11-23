import Enemy from "./enemy.js";
import {
  initializeUI,
  updatePlayerHealth,
  updateEnemyHealth,
  updateZoneUI,
} from "./ui.js";
import { playerAttack, enemyAttack } from "./combat.js";
import { saveGame } from "./storage.js";

class Game {
  constructor(hero) {
    if (!hero)
      throw new Error("Hero object is required for Game initialization.");
    this.gameStarted = false;
    this.hero = hero;
    this.stats = this.hero.stats;
    this.currentEnemy = new Enemy(this.stats.level);
    this.lastPlayerAttack = 0;
    this.zone = 1;

    initializeUI(this);
    this.resetAllHealth();
  }

  incrementZone () {
    this.zone += 1;
    // Update highest zone if current zone is higher
    if (this.zone > this.stats.highestZone) {
      this.stats.highestZone = this.zone;
    }
    updateZoneUI(this.zone);
  }

  resetAllHealth () {
    this.stats.stats.currentHealth = this.stats.stats.maxHealth;
    updatePlayerHealth(this.stats.stats);
    this.currentEnemy.resetHealth();
    updateEnemyHealth(this.currentEnemy);
  }

  // Add auto-save functionality to gameLoop
  gameLoop () {
    if (!this.gameStarted) return;

    const currentTime = Date.now();
    playerAttack(this, currentTime);
    enemyAttack(this, currentTime);

    // Auto-save every 30 seconds
    if (currentTime % 30000 < 16) {
      saveGame(this);
    }
  }
}

export default Game;
