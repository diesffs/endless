import {
  updateResources,
  updateZoneUI,
  updatePlayerHealth,
  updateEnemyHealth,
} from "./ui.js";
import { clearSave, saveGame } from "./storage.js";
import { BASE_ARMOR, BASE_ATTACK_SPEED, BASE_CRIT_CHANCE, BASE_CRIT_DAMAGE, BASE_DAMAGE, BASE_HEALTH, BASE_UPGRADE_COSTS } from "./stats.js";

export default class Prestige {
  constructor(game) {
    this.game = game;
  }

  // Calculate the number of souls earned based on zones cleared
  calculateSouls () {
    return Math.floor(this.game.zone / 50); // 1 soul per 50 zones
  }

  // Perform the prestige action
  performPrestige () {
    const earnedSouls = this.calculateSouls();
    this.game.stats.souls += earnedSouls; // Add earned souls to the player's total
    this.resetGame(); // Reset the game
    saveGame(this.game); // Save the reset state
  }

  // Reset the game to its initial state
  resetGame () {
    this.game.zone = 1;
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

    updateResources(this.game.stats);
    updatePlayerHealth(this.game.stats.stats);
    this.game.currentEnemy.resetHealth();
    updateEnemyHealth(this.game.currentEnemy);

    clearSave(); // Clear saved progress
  }

  // Initialize the prestige UI
  async initializePrestigeUI () {
    const prestigeTab = document.querySelector("#prestige");
    if (!prestigeTab || !this.game.stats) return;

    const earnedSouls = this.calculateSouls();
    const damageBonus = Math.floor(this.game.stats.souls * 0.1);

    // Fetch HTML template
    const response = await fetch('prestige.html');
    const templateText = await response.text();

    // Create a DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(templateText, 'text/html');

    // Safely update the dynamic content
    const damageDisplay = doc.querySelector('.damage-display .bonus');
    const soulsDisplay = doc.querySelector('.earned-souls-display .bonus');

    if (damageDisplay) damageDisplay.textContent = `+${damageBonus}%`;
    if (soulsDisplay) soulsDisplay.textContent = `+${earnedSouls}`;

    // Clear existing content and append new elements
    prestigeTab.textContent = '';
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
