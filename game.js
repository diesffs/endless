import Enemy from "./enemy.js";
import {
  initializeUI,
  updateResources,
  updatePlayerHealth,
  updateEnemyHealth,
  updateZoneUI,
} from "./ui.js";
import { playerAttack, enemyAttack } from "./combat.js";

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

  incrementZone() {
    this.zone += 1;
    updateZoneUI(this.zone);
  }

  resetAllHealth() {
    this.stats.stats.currentHealth = this.stats.stats.maxHealth;
    updatePlayerHealth(this.stats.stats);
    this.currentEnemy.resetHealth();
    updateEnemyHealth(this.currentEnemy);
  }

  gameLoop() {
    if (!this.gameStarted) return;

    const currentTime = Date.now();
    playerAttack(this, currentTime); // Dynamically respects attack speed
    enemyAttack(this, currentTime); // Adjust enemy attack timing similarly if needed
  }
}

export default Game;
