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
import { hero } from "./main.js";

export default class Prestige {
  constructor(game) {
    if (!game || typeof game.zone !== "number") {
      console.error("Invalid game object passed to Prestige:", game);
      throw new Error("Game or zone is not properly initialized.");
    }

    this.game = game; // Assign the game object
    this.hero = game.hero; // Use the hero object from the game
  }

  calculateSouls () {
    if (!this.game || typeof hero.stats.highestZone !== "number") {
      console.warn("Game or highestZone is not properly initialized.");
      return 0;
    }

    const souls = Math.floor(hero.stats.highestZone / 5); // Example: 1 soul per 5 zones
    return souls;
  }

  performPrestige () {
    const earnedSouls = this.calculateSouls();
    hero.stats.souls += earnedSouls;
    hero.stats.highestZone = 1;
    hero.stats.prestigeProgress = 0;

    this.resetGame();
    saveGame();

    this.initializePrestigeUI(); // Ensure UI reflects reset state
  }

  resetGame () {
    if (!this.game || typeof this.game.zone !== "number") {
      console.error(
        "Game is not properly initialized in resetGame:",
        this.game
      );
      return;
    }

    this.game.zone = 1;
    hero.stats.highestZone = 1;
    hero.stats.prestigeProgress = 0;
    updateZoneUI(this.game.zone);

    hero.stats.level = 1;
    hero.stats.exp = 0;
    hero.stats.expToNextLevel = 20;
    hero.stats.gold = 0;
    hero.stats.primaryStats = { strength: 0, agility: 0, vitality: 0 };
    hero.stats.statPoints = 0;
    hero.stats.stats = {
      damage: BASE_DAMAGE,
      attackSpeed: BASE_ATTACK_SPEED,
      critChance: BASE_CRIT_CHANCE,
      critDamage: BASE_CRIT_DAMAGE,
      currentHealth: BASE_HEALTH,
      maxHealth: BASE_HEALTH,
      armor: BASE_ARMOR,
    };
    hero.stats.upgradeCosts = {
      damage: BASE_UPGRADE_COSTS.damage,
      attackSpeed: BASE_UPGRADE_COSTS.attackSpeed,
      health: BASE_UPGRADE_COSTS.health,
      armor: BASE_UPGRADE_COSTS.armor,
      critChance: BASE_UPGRADE_COSTS.critChance,
      critDamage: BASE_UPGRADE_COSTS.critDamage,
    };
    hero.stats.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
    };

    updateResources(hero.stats, this.game); // Pass the game instance here
    updatePlayerHealth(hero.stats.stats);
    this.game.currentEnemy.resetHealth();
    updateEnemyHealth(this.game.currentEnemy);

    clearSave();
  }

  // Initialize the prestige UI
  async initializePrestigeUI () {
    try {
      const earnedSouls = this.calculateSouls();

      // Update the modal display
      const modalDisplay = document.querySelector(".prestige-modal-display");
      if (modalDisplay) {
        modalDisplay.textContent = `${earnedSouls} Souls`;
      }

      // Update the "Prestige for" display in the main UI
      const prestigeDisplay = document.querySelector(
        ".earned-souls-display .bonus"
      );
      if (prestigeDisplay) {
        prestigeDisplay.textContent = `${earnedSouls}`;
      }

      // Also update the modal-specific earned souls value
      const modalSoulsAmount = document.getElementById("modal-souls-amount");
      if (modalSoulsAmount) {
        modalSoulsAmount.textContent = `${earnedSouls}`;
      }

      // Ensure the Prestige tab is set up correctly
      const prestigeTab = document.querySelector("#prestige");
      if (!prestigeTab) return;

      if (!prestigeTab.querySelector(".earned-souls-display")) {
        const earnedSoulsDisplay = document.createElement("div");
        earnedSoulsDisplay.className = "earned-souls-display";
        earnedSoulsDisplay.innerHTML = `<span class="bonus">+0</span>`;
        prestigeTab.appendChild(earnedSoulsDisplay);
      }

      // Fetch and load HTML template for dynamic content
      const response = await fetch("prestige.html");
      if (!response.ok)
        throw new Error(
          `Failed to fetch Prestige template: ${response.statusText}`
        );

      const templateText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateText, "text/html");

      // Update template content with dynamic values
      const damageDisplay = doc.querySelector(".damage-display .bonus");
      const soulsDisplay = doc.querySelector(".earned-souls-display .bonus");

      if (damageDisplay) {
        const damageBonus = Math.floor(hero.stats.souls * 0.1);
        damageDisplay.textContent = `+${damageBonus}%`;
      }

      if (soulsDisplay) {
        soulsDisplay.textContent = `+${earnedSouls}`;
      }

      // Clear existing content in the Prestige tab and append the new template
      prestigeTab.textContent = "";
      prestigeTab.appendChild(doc.body.firstChild);

      // Set up event listeners for the Prestige button and modal actions
      this.setupPrestigeButton();
    } catch (error) {
      console.error("Error initializing Prestige UI:", error);
    }
  }

  updateUI () {
    const damageDisplay = document.querySelector(".damage-display .bonus");
    const soulsDisplay = document.querySelector(".earned-souls-display .bonus");

    if (damageDisplay) {
      const damageBonus = Math.floor(hero.stats.souls * 0.1);
      damageDisplay.textContent = `+${damageBonus}%`;
    }

    if (soulsDisplay) {
      soulsDisplay.textContent = `+${this.calculateSouls()}`;
    }

    const modalSoulsAmount = document.getElementById("modal-souls-amount");
    if (modalSoulsAmount) {
      modalSoulsAmount.textContent = `${this.calculateSouls()}`;
    }
  }

  setupPrestigeButton () {
    const prestigeButton = document.getElementById("prestige-btn");
    const modal = document.getElementById("prestige-modal");
    const confirmButton = document.getElementById("confirm-prestige");
    const cancelButton = document.getElementById("cancel-prestige");

    if (!prestigeButton || !modal || !confirmButton || !cancelButton) {
      console.error("Prestige modal or buttons are missing.");
      return;
    }

    // Open modal on Prestige button click
    prestigeButton.onclick = () => {
      const earnedSouls = this.calculateSouls(); // Recalculate to sync with UI
      const modalSoulsAmount = document.getElementById("modal-souls-amount");
      if (modalSoulsAmount) {
        modalSoulsAmount.textContent = `${earnedSouls}`;
      }
      modal.style.display = "block"; // Show the modal
    };

    // Confirm Prestige action
    confirmButton.onclick = () => {
      modal.style.display = "none";
      this.performPrestige(); // Perform the prestige logic
      this.initializePrestigeUI(); // Re-initialize UI to reflect reset
    };

    // Cancel Prestige action
    cancelButton.onclick = () => {
      modal.style.display = "none";
    };

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }
}
