import { updatePlayerHealth } from "./ui.js";

export default class Stats {
  constructor(level = 1, gold = 10000) {
    this.level = level;
    this.gold = gold;
    this.souls = 0;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 100;
    this.primaryStats = { strength: 1, agility: 1, vitality: 1 };
    this.statPoints = 110;
    this.stats = {
      damage: 10,
      attackSpeed: 5.0,
      critChance: 5,
      critDamage: 1.5,
      health: 100,
      currentHealth: 100,
      maxHealth: 100,
      armor: 0,
    };
    this.upgradeCosts = {
      damage: 100,
      attackSpeed: 200,
      health: 150,
      armor: 250,
      critChance: 300,
      critDamage: 400,
    };
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
    this.statPoints += 3; // Add stat points on level-up
    this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);

    // Recalculate stats based on level
    this.stats.damage += Math.round(this.level * 0.5);
    this.stats.maxHealth += Math.round(this.level * 5);
    this.stats.currentHealth = this.stats.maxHealth; // Sync current health
  }

  allocateStat(stat) {
    if (this.statPoints > 0 && this.primaryStats[stat] !== undefined) {
      this.primaryStats[stat]++;
      this.statPoints--;
      this.recalculateFromAttributes();
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
    this.stats.damage += this.primaryStats.strength * 2;
    this.stats.attackSpeed += this.primaryStats.agility * 0.05;
    this.stats.maxHealth += this.primaryStats.vitality * 10;
    this.stats.currentHealth = this.stats.maxHealth;
  }

  buyUpgrade(stat) {
    if (this.upgradeCosts[stat] && this.gold >= this.upgradeCosts[stat]) {
      this.gold -= this.upgradeCosts[stat];

      switch (stat) {
        case "damage":
          this.stats.damage += 1; // Increment damage
          break;
        case "attackSpeed":
          this.stats.attackSpeed += 0.05; // Increment attack speed
          break;
        case "health":
          this.stats.maxHealth += 5; // Increment max health
          this.stats.currentHealth = this.stats.maxHealth; // Sync current health
          break;
        case "armor":
          this.stats.armor += 1; // Increment armor
          break;
        case "critChance":
          if (this.stats.critChance < 100) this.stats.critChance += 0.1; // Increment crit chance
          break;
        case "critDamage":
          this.stats.critDamage += 0.05; // Increment crit damage
          break;
      }

      this.upgradeCosts[stat] = Math.floor(this.upgradeCosts[stat] * 1.15); // Increase cost
      return true;
    }
    return false;
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    return (armor / (100 + armor)) * 100;
  }
}
