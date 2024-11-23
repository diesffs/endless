import {
  updateResources,
  updateZoneUI,
  updatePlayerHealth,
  updateEnemyHealth,
} from "./ui.js";
import { clearSave, saveGame } from "./storage.js";
import {
  BASE_ARMOR,
  BASE_ATTACK_SPEED,
  BASE_CRIT_CHANCE,
  BASE_CRIT_DAMAGE,
  BASE_DAMAGE,
  BASE_HEALTH,
  BASE_UPGRADE_COSTS,
} from "./stats.js";

export default class Prestige {
  constructor(game) {
    if (!game || typeof game.zone !== "number") {
      console.error("Invalid game object passed to Prestige:", game);
      throw new Error("Game or zone is not properly initialized.");
    }
    this.game = game;
  }

  // Calculate the number of souls earned based on zones cleared
  calculateSouls() {
    if (!this.game || typeof this.game.zone !== "number") {
      console.warn("Game or zone is not properly initialized.");
      return 0; // Default to 0 if game or zone is unavailable
    }
    console.log(this.game.highestZone);
    return Math.floor(this.game.highestZone / 1); // 1 soul per 50 zones
  }

  performPrestige() {
    const earnedSouls = this.calculateSouls(); // Souls earned in this run
    this.game.stats.souls += earnedSouls; // Add to total souls
    this.game.stats.prestigeProgress = 0; // Reset prestige progress

    this.resetGame(); // Reset the game state
    saveGame(this.game); // Save the new state
  }

  resetGame() {
    if (!this.game || typeof this.game.zone !== "number") {
      console.error(
        "Game is not properly initialized in resetGame:",
        this.game
      );
      return;
    }

    this.game.zone = 1;
    this.game.stats.prestigeProgress = 0;
    updateZoneUI(this.game.zone);

    this.game.stats.level = 1;
    this.game.stats.exp = 0;
    this.game.stats.expToNextLevel = 20;
    this.game.stats.gold = 0;
    this.game.stats.primaryStats = { strength: 0, agility: 0, vitality: 0 };
    this.game.stats.statPoints = 0;
    this.game.stats.stats = {
      damage: BASE_DAMAGE,
      attackSpeed: BASE_ATTACK_SPEED,
      critChance: BASE_CRIT_CHANCE,
      critDamage: BASE_CRIT_DAMAGE,
      currentHealth: BASE_HEALTH,
      maxHealth: BASE_HEALTH,
      armor: BASE_ARMOR,
    };
    this.game.stats.upgradeCosts = {
      damage: BASE_UPGRADE_COSTS.damage,
      attackSpeed: BASE_UPGRADE_COSTS.attackSpeed,
      health: BASE_UPGRADE_COSTS.health,
      armor: BASE_UPGRADE_COSTS.armor,
      critChance: BASE_UPGRADE_COSTS.critChance,
      critDamage: BASE_UPGRADE_COSTS.critDamage,
    };
    this.game.stats.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
    };

    updateResources(this.game.stats, this.game); // Pass the game instance here
    updatePlayerHealth(this.game.stats.stats);
    this.game.currentEnemy.resetHealth();
    updateEnemyHealth(this.game.currentEnemy);

    clearSave();
  }

  // Initialize the prestige UI
  async initializePrestigeUI() {
    const prestigeTab = document.querySelector("#prestige");
    if (!prestigeTab || !this.game.stats) return;

    if (!prestigeTab.querySelector(".earned-souls-display")) {
      const earnedSoulsDisplay = document.createElement("div");
      earnedSoulsDisplay.className = "earned-souls-display";
      earnedSoulsDisplay.innerHTML = `<span class="bonus">+0</span>`;
      prestigeTab.appendChild(earnedSoulsDisplay);
    }

    const earnedSouls = this.calculateSouls();
    const damageBonus = Math.floor(this.game.stats.souls * 0.1);

    // Fetch HTML template
    const response = await fetch("prestige.html");
    const templateText = await response.text();

    // Create a DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateText, "text/html");

    // Safely update the dynamic content
    const damageDisplay = doc.querySelector(".damage-display .bonus");
    const soulsDisplay = doc.querySelector(".earned-souls-display .bonus");

    if (damageDisplay) damageDisplay.textContent = `+${damageBonus}%`;
    if (soulsDisplay) soulsDisplay.textContent = `+${earnedSouls}`;

    // Clear existing content and append new elements
    prestigeTab.textContent = "";
    prestigeTab.appendChild(doc.body.firstChild);

    // Add event listener for the Prestige button
    // Replace the prestige button event listener with:
    document.getElementById("prestige-btn").addEventListener("click", () => {
      const modal = document.getElementById("prestige-modal");
      const earnedSouls = this.calculateSouls();

      // Update souls amount in modal
      document.getElementById("modal-souls-amount").textContent = earnedSouls;

      // Show modal
      modal.style.display = "block";

      // Handle confirm
      document.getElementById("confirm-prestige").onclick = () => {
        modal.style.display = "none";
        this.performPrestige();
        this.initializePrestigeUI();
      };

      // Handle cancel
      document.getElementById("cancel-prestige").onclick = () => {
        modal.style.display = "none";
      };

      // Close modal when clicking outside
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      };
    });
  }
}
