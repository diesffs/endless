import { updateStatsAndAttributesUI } from './ui.js';
import { game } from './main.js';
import { saveGame } from './storage.js';
import { updatePlayerHealth, updateResources } from './ui.js';

// Keep all the constants at the top
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
export const STATS_ON_LEVEL_UP = 3;

export const BASE_UPGRADE_COSTS = {
  damage: 100,
  attackSpeed: 200,
  health: 150,
  armor: 250,
  critChance: 300,
  critDamage: 400,
};

export default class Hero {
  constructor(savedData = null) {
    if (savedData) {
      Object.assign(this, savedData);
      return;
    }

    this.level = 1;
    this.gold = 1234123412340;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 20;
    this.primaryStats = { strength: 0, agility: 0, vitality: 0 };
    this.statPoints = 0;
    this.souls = 0;
    this.prestigeProgress = 0;
    this.highestZone = 1;

    this.equipmentBonuses = {
      damage: 0,
      armor: 0,
      strength: 0,
      agility: 0,
      vitality: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      maxHealth: 0,
    };

    this.stats = {
      damage: BASE_DAMAGE,
      attackSpeed: BASE_ATTACK_SPEED,
      critChance: BASE_CRIT_CHANCE,
      critDamage: BASE_CRIT_DAMAGE,
      currentHealth: BASE_HEALTH,
      maxHealth: BASE_HEALTH,
      armor: 0,
    };

    this.upgradeCosts = { ...BASE_UPGRADE_COSTS };
    this.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
    };
  }

  displayStats() {
    updateStatsAndAttributesUI(this);
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
    this.statPoints += STATS_ON_LEVEL_UP;
    this.expToNextLevel += this.level * 20 - 20;
    this.recalculateFromAttributes();
    this.stats.currentHealth = this.stats.maxHealth; // Ensure current health is set to max health
    updatePlayerHealth(this.stats); // Update health bar dynamically
    updateStatsAndAttributesUI(this); // Update stats and attributes UI
    saveGame();
  }

  allocateStat(stat) {
    if (this.statPoints > 0 && this.primaryStats[stat] !== undefined) {
      this.primaryStats[stat]++;
      this.statPoints--;
      this.recalculateFromAttributes();
      if (stat === 'vitality' && !game.gameStarted) {
        this.stats.currentHealth = this.stats.maxHealth;
      }
      saveGame();
      return true;
    }
    return false;
  }

  getStat(stat) {
    return this.primaryStats[stat] + this.equipmentBonuses[stat] || 0;
  }

  recalculateFromAttributes() {
    game.inventory.updateItemBonuses();

    this.stats.damage =
      BASE_DAMAGE +
      (this.primaryStats.strength + this.equipmentBonuses.strength) * 2 +
      this.upgradeLevels.damage * DAMAGE_ON_UPGRADE +
      DAMAGE_ON_LEVEL_UP * this.level -
      DAMAGE_ON_LEVEL_UP;

    this.stats.attackSpeed =
      BASE_ATTACK_SPEED +
      (this.primaryStats.agility + this.equipmentBonuses.agility) * 0.05 +
      this.upgradeLevels.attackSpeed * ATTACK_SPEED_ON_UPGRADE +
      this.equipmentBonuses.attackSpeed;

    this.stats.maxHealth =
      BASE_HEALTH +
      (this.primaryStats.vitality + this.equipmentBonuses.vitality) * 10 +
      this.upgradeLevels.health * HEALTH_ON_UPGRADE +
      HEALTH_ON_LEVEL_UP * this.level -
      HEALTH_ON_LEVEL_UP;

    this.stats.armor = BASE_ARMOR + this.upgradeLevels.armor * ARMOR_ON_UPGRADE;

    this.stats.critChance =
      BASE_CRIT_CHANCE + this.upgradeLevels.critChance * CRIT_CHANCE_ON_UPGRADE;

    this.stats.critDamage =
      BASE_CRIT_DAMAGE + this.upgradeLevels.critDamage * CRIT_DAMAGE_ON_UPGRADE;

    // had to be after stats are calculated, to just add bonuses
    game.inventory.updateItemBonuses();

    Object.entries(this.equipmentBonuses).forEach(([stat, bonus]) => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] += bonus;
      }
    });

    // Add damage bonus from souls
    const damageBonusFromSouls = Math.floor(this.stats.damage * (this.souls * 0.01));
    this.stats.damage += damageBonusFromSouls;

    updatePlayerHealth(this.stats);
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    return (armor / (100 + armor)) * 100;
  }
}
