import { game } from "./main.js";
import { saveGame } from "./storage.js";

export const BASE_DAMAGE = 10;
export const BASE_HEALTH = 100;
export const BASE_ARMOR = 0;
export const BASE_ATTACK_SPEED = 1.0;
export const BASE_CRIT_CHANCE = 5;
export const BASE_CRIT_DAMAGE = 1.5;

export const DAMAGE_ON_UPGRADE = 1;
export const ATTACK_SPEED_ON_UPGRADE = 0.01;
export const HEALTH_ON_UPGRADE = 10;
export const ARMOR_ON_UPGRADE = 1;
export const CRIT_CHANCE_ON_UPGRADE = 0.1;
export const CRIT_DAMAGE_ON_UPGRADE = 0.01;

export const DAMAGE_ON_LEVEL_UP = 1;
export const HEALTH_ON_LEVEL_UP = 10;

export const BASE_UPGRADE_COSTS = {
  damage: 100,
  attackSpeed: 200,
  health: 150,
  armor: 250,
  critChance: 300,
  critDamage: 400,
};

export default class Stats {
  constructor(level = 1, gold = 0, savedData = null) {
    this.level = level;
    this.gold = gold;
    this.souls = 0;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 100;
    this.primaryStats = { strength: 0, agility: 0, vitality: 0 };
    this.statPoints = 0;

    // Default stats
    this.stats = {
      damage: 10,
      bonusDamage: 0,
      attackSpeed: 1.0,
      critChance: 5,
      critDamage: 1.5,
      currentHealth: 100,
      maxHealth: 100,
      armor: 0,
    };

    // Default upgrade costs and levels
    this.upgradeCosts = {
      damage: BASE_UPGRADE_COSTS.damage,
      attackSpeed: BASE_UPGRADE_COSTS.attackSpeed,
      health: BASE_UPGRADE_COSTS.health,
      armor: BASE_UPGRADE_COSTS.armor,
      critChance: BASE_UPGRADE_COSTS.critChance,
      critDamage: BASE_UPGRADE_COSTS.critDamage,
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
    this.stats.currentHealth = this.stats.maxHealth;
    this.recalculateFromAttributes();
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

  recalculateFromAttributes() {
    this.stats.damage =
      BASE_DAMAGE +
      this.primaryStats.strength * 2 +
      this.upgradeLevels.damage * DAMAGE_ON_UPGRADE + 
      DAMAGE_ON_LEVEL_UP * this.level - DAMAGE_ON_LEVEL_UP;

    this.stats.attackSpeed =
      BASE_ATTACK_SPEED +
      this.primaryStats.agility * 0.05 +
      this.upgradeLevels.attackSpeed * ATTACK_SPEED_ON_UPGRADE;

    this.stats.maxHealth =
      BASE_HEALTH +
      this.primaryStats.vitality * 10 +
      this.upgradeLevels.health * HEALTH_ON_UPGRADE + 
      HEALTH_ON_LEVEL_UP * this.level - HEALTH_ON_LEVEL_UP;

    this.stats.armor = BASE_ARMOR + this.upgradeLevels.armor * ARMOR_ON_UPGRADE;

    this.stats.critChance =
      BASE_CRIT_CHANCE + this.upgradeLevels.critChance * CRIT_CHANCE_ON_UPGRADE;

    this.stats.critDamage =
      BASE_CRIT_DAMAGE + this.upgradeLevels.critDamage * CRIT_DAMAGE_ON_UPGRADE;
  }

  buyUpgrade(stat) {
    if (this.upgradeCosts[stat] && this.gold >= this.upgradeCosts[stat]) {
      this.gold -= this.upgradeCosts[stat];
      this.upgradeLevels[stat]++;
      this.upgradeCosts[stat] =
        BASE_UPGRADE_COSTS[stat] +
        BASE_UPGRADE_COSTS[stat] * this.upgradeLevels[stat]; // Increase cost

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
