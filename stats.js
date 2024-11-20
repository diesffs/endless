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
    this.stats = {
      damage: 10,
      attackSpeed: 1.0,
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
    this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);
    this.calculateStatsFromLevel();
  }

  calculateStatsFromLevel() {
    this.stats.damage += Math.round(this.level * 0.01);
    this.stats.health = Math.round(this.stats.health + this.level * 0.01);
    this.stats.maxHealth = Math.round(this.stats.health);
    this.stats.currentHealth = Math.round(this.stats.maxHealth);
  }

  buyUpgrade(stat) {
    if (this.upgradeCosts[stat] && this.gold >= this.upgradeCosts[stat]) {
      this.gold -= this.upgradeCosts[stat];
      switch (stat) {
        case "damage":
          this.stats.damage += 1;
          break;
        case "attackSpeed":
          this.stats.attackSpeed += 0.01;
          break;
        case "health":
          this.stats.health += 5;
          this.stats.maxHealth = this.stats.health;
          this.stats.currentHealth = this.stats.maxHealth;
          updatePlayerHealth(this.stats);
          break;
        case "armor":
          this.stats.armor += 1;
          break;
        case "critChance":
          if (this.stats.critChance < 100) this.stats.critChance += 0.1;
          break;
        case "critDamage":
          this.stats.critDamage += 0.01;
          break;
      }
      this.upgradeCosts[stat] = Math.floor(this.upgradeCosts[stat] * 1.15);
      return true;
    }
    return false;
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    return (armor / (100 + armor)) * 100;
  }
}
