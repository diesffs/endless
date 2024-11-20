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
    this.playerAttackSpeed = 1000;
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
    if (
      typeof this.stats.stats.currentHealth !== "number" ||
      isNaN(this.stats.stats.currentHealth) ||
      typeof this.stats.stats.maxHealth !== "number" ||
      isNaN(this.stats.stats.maxHealth)
    ) {
      this.resetAllHealth();
    }
    const currentTime = Date.now();
    playerAttack(this, currentTime);
    enemyAttack(this, currentTime);
  }
}

export default Game;
