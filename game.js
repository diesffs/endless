import Enemy from "./enemy.js";
import Hero from "./hero.js";
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

let gameInstance = null;

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
    this.inventory = new Inventory(this);
    this.stats.highestZone = savedData?.highestZone || 1;

    this.prestige = prestige;

    initializeUI(this);
    this.resetAllHealth();
    this.lastPlayerAttack = Date.now();
  }

  toggleBattle() {
    if (this.gameStarted) {
      stopBattle(this);
    } else {
      this.resetAllHealth();
      this.lastPlayerAttack = Date.now(); // Reset timer explicitly
      startBattle(this);
    }
  }

  update(currentTime) {
    if (!this.gameStarted) return;

    // Handle combat
    playerAttack(this, currentTime);
    enemyAttack(this, currentTime);
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
      saveGame(this);
    }
  }
}

export default Game;
