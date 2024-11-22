import { game } from "./main.js";
import { saveGame } from "./storage.js";

export const BASE_DAMAGE = 10;
export const BASE_HEALTH = 100;
export const BASE_ARMOR = 0;
export const BASE_ATTACK_SPEED = 1.0;

export default class Stats {
  constructor(level = 1, gold = 10000000, savedData = null) {
    this.level = level;
    this.gold = gold;
    this.souls = 0;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 100;
    this.primaryStats = { strength: 1, agility: 1, vitality: 1 };
    this.statPoints = 110;

    // Default stats
    this.stats = {
      damage: 10,
      bonusDamage: 0,
      attackSpeed: 1.0,
      critChance: 50,
      critDamage: 2,
      health: 100,
      currentHealth: 100,
      maxHealth: 100,
      armor: 0,
    };

    // Default upgrade costs and levels
    this.upgradeCosts = {
      damage: 100,
      attackSpeed: 200,
      health: 150,
      armor: 250,
      critChance: 300,
      critDamage: 400,
    };
    this.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
    };

    // Apply saved data, if any
    if (savedData) {
      Object.assign(this, savedData);
    }

    this.calculateStatsFromLevel();
  }

  gainSoul(amount) {
    this.souls += amount;
  }

  gainExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expToNextLevel) {
      this.levelUp();
    }
  }
  levelUp() {
    this.exp -= this.expToNextLevel;
    this.level++;
    this.statPoints += 3;
    this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);
    this.stats.damage += Math.round(this.level * 0.5);
    this.stats.maxHealth += Math.round(this.level * 5);
    this.stats.currentHealth = this.stats.maxHealth;

    // Save after level up
    saveGame(game);
  }

  allocateStat(stat) {
    if (this.statPoints > 0 && this.primaryStats[stat] !== undefined) {
      this.primaryStats[stat]++;
      this.statPoints--;
      this.recalculateFromAttributes();
      if (stat === "vitality" && !game.gameStarted) {
        this.stats.currentHealth = this.stats.maxHealth;
      }

      // Save after stat allocation
      saveGame(game);
      return true;
    }
    return false;
  }
  calculateStatsFromLevel() {
    this.stats.damage += Math.round(this.level * 0.01);
    this.stats.health = Math.round(this.stats.health + this.level * 0.01);
    this.stats.maxHealth = Math.round(this.stats.health);
    this.stats.currentHealth = Math.round(this.stats.maxHealth);
  }

  recalculateFromAttributes() {
    this.stats.damage =
      BASE_DAMAGE -
      2 +
      this.primaryStats.strength * 2 +
      this.upgradeLevels.damage * 1;
    this.stats.attackSpeed =
      BASE_ATTACK_SPEED -
      0.05 +
      this.primaryStats.agility * 0.05 +
      this.upgradeLevels.attackSpeed * 0.05;
    this.stats.maxHealth =
      BASE_HEALTH -
      10 +
      this.primaryStats.vitality * 10 +
      this.upgradeLevels.health * 10;
    this.stats.armor = BASE_ARMOR + this.upgradeLevels.armor * 1;
    this.stats.critChance = 50 + this.upgradeLevels.critChance * 1;
    this.stats.critDamage = 2 + this.upgradeLevels.critDamage * 1;
  }

  buyUpgrade(stat) {
    if (this.upgradeCosts[stat] && this.gold >= this.upgradeCosts[stat]) {
      this.gold -= this.upgradeCosts[stat];
      this.upgradeLevels[stat]++;
      this.upgradeCosts[stat] = Math.floor(this.upgradeCosts[stat] * 1.15); // Increase cost

      this.recalculateFromAttributes();
      return true;
    }
    return false;
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    return (armor / (100 + armor)) * 100;
  }
}
  