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
  constructor(hero, prestige = null, savedData) {
    if (!hero)
      throw new Error("Hero object is required for Game initialization.");
    this.gameStarted = false;
    this.hero = hero;
    this.stats = this.hero.stats;
    this.currentEnemy = new Enemy(this.stats.level);
    this.lastPlayerAttack = 0;
    this.zone = 1;
    this.stats.highestZone = savedData?.highestZone || 1;

    this.prestige = prestige;

    initializeUI(this);
    this.resetAllHealth();
  }

  incrementZone() {
    this.zone += 1;

    if (this.zone > this.stats.highestZone) {
      this.stats.highestZone = this.zone;
    }

    console.log(
      "Zone Incremented: Current Zone =",
      this.zone,
      "Highest Zone =",
      this.stats.highestZone
    );

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
