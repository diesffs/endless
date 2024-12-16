import { updateStatsAndAttributesUI } from './ui.js';
import { game, inventory, skillTree } from './main.js';
import { updatePlayerHealth } from './ui.js';
import { createCombatText } from './combat.js';

// Keep all the constants at the top
export const BASE_DAMAGE = 10;
export const BASE_HEALTH = 100;
export const BASE_ARMOR = 0;
export const BASE_ATTACK_SPEED = 1.0;
export const BASE_CRIT_CHANCE = 5;
export const BASE_CRIT_DAMAGE = 1.5;
export const BASE_BLOCK_CHANCE = 0;
export const BASE_ATTACK_RATING = 100;
export const BASE_MANA = 50;
export const BASE_MANA_REGEN = 1;
export const BASE_LIFE_REGEN = 1;

export const DAMAGE_ON_UPGRADE = 1;
export const ATTACK_SPEED_ON_UPGRADE = 0.01;
export const ARMOR_ON_UPGRADE = 1;
export const CRIT_CHANCE_ON_UPGRADE = 0.1;
export const CRIT_DAMAGE_ON_UPGRADE = 0.01;
export const HEALTH_ON_UPGRADE = 10;
export const MANA_ON_UPGRADE = 5;
export const HEALTH_REGEN_ON_UPGRADE = 0.1;
export const MANA_REGEN_ON_UPGRADE = 0.1;

export const DAMAGE_ON_LEVEL_UP = 1;
export const HEALTH_ON_LEVEL_UP = 10;
export const STATS_ON_LEVEL_UP = 3;
export const ATTACK_RATING_ON_LEVEL_UP = 0;
export const MANA_ON_LEVEL_UP = 5;

export const BASE_LIFE_STEAL = 0;
export const BASE_ELEMENTAL_DAMAGE = {
  fire: 0,
  cold: 0,
  lightning: 0,
  water: 0,
  air: 0,
  earth: 0,
};
export const BASE_ATTACK_RATING_PERCENT = 0;
export const BASE_DAMAGE_PERCENT = 0;

export const BASE_UPGRADE_COSTS = {
  damage: 100,
  attackSpeed: 200,
  health: 150,
  armor: 250,
  critChance: 300,
  critDamage: 400,
  mana: 200,
  healthRegen: 200,
  manaRegen: 200,
};

export default class Hero {
  constructor(savedData = null) {
    this.setBaseStats(savedData);
  }

  setBaseStats(savedData = null) {
    this.level = 1;
    this.gold = 1231230;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 20;
    this.primaryStats = { strength: 0, agility: 0, vitality: 0 };
    this.statPoints = 0;
    this.souls = 0;
    this.prestigeProgress = 0;
    this.highestZone = 1;

    this.startingZone = 1;
    this.startingGold = 0;

    this.pathBonuses = {
      damage: 0,
      armor: 0,
      strength: 0,
      agility: 0,
      vitality: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      maxHealth: 0,
      blockChance: 0,
      maxMana: 0,
      manaRegen: 0,
      lifeRegen: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      lightningDamage: 0,
      waterDamage: 0,
      airDamage: 0,
      earthDamage: 0,
      attackRatingPercent: 0,
      damagePercent: 0,
    };

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
      blockChance: 0,
      maxMana: 0,
      manaRegen: 0,
      lifeRegen: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      lightningDamage: 0,
      waterDamage: 0,
      airDamage: 0,
      earthDamage: 0,
      attackRatingPercent: 0,
      damagePercent: 0,
    };

    this.skillBonuses = {
      damage: 0,
      armor: 0,
      strength: 0,
      agility: 0,
      vitality: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      maxHealth: 0,
      blockChance: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      lightningDamage: 0,
      waterDamage: 0,
      airDamage: 0,
      earthDamage: 0,
      attackRatingPercent: 0,
      damagePercent: 0,
    };

    this.stats = {
      damage: BASE_DAMAGE,
      attackSpeed: BASE_ATTACK_SPEED,
      critChance: BASE_CRIT_CHANCE,
      critDamage: BASE_CRIT_DAMAGE,
      currentHealth: BASE_HEALTH,
      maxHealth: BASE_HEALTH,
      armor: BASE_ARMOR,
      blockChance: BASE_BLOCK_CHANCE,
      attackRating: BASE_ATTACK_RATING,
      currentMana: BASE_MANA,
      maxMana: BASE_MANA,
      manaRegen: BASE_MANA_REGEN,
      lifeRegen: BASE_LIFE_REGEN,
      lifeSteal: BASE_LIFE_STEAL,
      fireDamage: BASE_ELEMENTAL_DAMAGE.fire,
      coldDamage: BASE_ELEMENTAL_DAMAGE.cold,
      lightningDamage: BASE_ELEMENTAL_DAMAGE.lightning,
      waterDamage: BASE_ELEMENTAL_DAMAGE.water,
      airDamage: BASE_ELEMENTAL_DAMAGE.air,
      earthDamage: BASE_ELEMENTAL_DAMAGE.earth,
      attackRatingPercent: BASE_ATTACK_RATING_PERCENT,
      damagePercent: BASE_DAMAGE_PERCENT,
    };

    this.upgradeCosts = { ...BASE_UPGRADE_COSTS };

    this.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
      mana: 0,
      healthRegen: 0,
      manaRegen: 0,
    };

    this.crystalUpgrades = {
      startingZone: 0,
      startingGold: 0,
      continuousPlay: false,
    };

    if (savedData) {
      Object.keys(this).forEach((key) => {
        if (savedData.hasOwnProperty(key)) {
          if (typeof this[key] === 'object' && !Array.isArray(this[key])) {
            this[key] = { ...this[key], ...savedData[key] };
          } else {
            this[key] = savedData[key];
          }
        }
      });
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
    this.statPoints += STATS_ON_LEVEL_UP;
    this.expToNextLevel += this.level * 40 - 20;
    this.recalculateFromAttributes();
    this.stats.currentHealth = this.stats.maxHealth; // Full heal on level up

    // Add level up notification
    createCombatText(`LEVEL UP! (${this.level})`);

    skillTree.addSkillPoints(1); // Add 1 skill point per level

    updatePlayerHealth();
    updateStatsAndAttributesUI();
    game.saveGame();
  }

  allocateStat(stat) {
    if (this.statPoints > 0 && this.primaryStats[stat] !== undefined) {
      this.primaryStats[stat]++;
      this.statPoints--;
      this.recalculateFromAttributes();
      if (stat === 'vitality' && !game.gameStarted) {
        this.stats.currentHealth = this.stats.maxHealth;
      }
      game.saveGame();
      return true;
    }
    return false;
  }

  getStat(stat) {
    return this.primaryStats[stat] + this.equipmentBonuses[stat] + this.pathBonuses[stat] || 0;
  }

  recalculateFromAttributes() {
    inventory.updateItemBonuses();
    skillTree.updateSkillBonuses();

    this.stats.damage =
      BASE_DAMAGE +
      (this.primaryStats.strength + this.equipmentBonuses.strength) * 2 +
      this.upgradeLevels.damage * DAMAGE_ON_UPGRADE +
      DAMAGE_ON_LEVEL_UP * this.level -
      DAMAGE_ON_LEVEL_UP;

    this.stats.attackSpeed = BASE_ATTACK_SPEED + this.upgradeLevels.attackSpeed * ATTACK_SPEED_ON_UPGRADE;

    this.stats.attackRating =
      (BASE_ATTACK_RATING +
        (this.primaryStats.agility + this.equipmentBonuses.agility) * 10 +
        ATTACK_RATING_ON_LEVEL_UP * this.level) *
      (1 + this.stats.attackRatingPercent / 100);

    this.stats.maxHealth =
      BASE_HEALTH +
      (this.primaryStats.vitality + this.equipmentBonuses.vitality) * 10 +
      this.upgradeLevels.health * HEALTH_ON_UPGRADE +
      HEALTH_ON_LEVEL_UP * this.level -
      HEALTH_ON_LEVEL_UP;

    this.stats.armor = BASE_ARMOR + this.upgradeLevels.armor * ARMOR_ON_UPGRADE;

    this.stats.critChance = BASE_CRIT_CHANCE + this.upgradeLevels.critChance * CRIT_CHANCE_ON_UPGRADE;

    this.stats.critDamage = BASE_CRIT_DAMAGE + this.upgradeLevels.critDamage * CRIT_DAMAGE_ON_UPGRADE;

    this.stats.blockChance = 0;

    this.stats.maxMana =
      BASE_MANA + this.upgradeLevels.mana * MANA_ON_UPGRADE + MANA_ON_LEVEL_UP * this.level - MANA_ON_LEVEL_UP;

    this.stats.manaRegen =
      BASE_MANA_REGEN + this.upgradeLevels.manaRegen * MANA_REGEN_ON_UPGRADE + this.equipmentBonuses.manaRegen;

    this.stats.lifeRegen =
      BASE_LIFE_REGEN + this.upgradeLevels.healthRegen * HEALTH_REGEN_ON_UPGRADE + this.equipmentBonuses.lifeRegen;

    this.stats.lifeSteal = BASE_LIFE_STEAL;
    this.stats.fireDamage = BASE_ELEMENTAL_DAMAGE.fire;
    this.stats.coldDamage = BASE_ELEMENTAL_DAMAGE.cold;
    this.stats.lightningDamage = BASE_ELEMENTAL_DAMAGE.lightning;
    this.stats.waterDamage = BASE_ELEMENTAL_DAMAGE.water;
    this.stats.airDamage = BASE_ELEMENTAL_DAMAGE.air;
    this.stats.earthDamage = BASE_ELEMENTAL_DAMAGE.earth;
    this.stats.attackRatingPercent = BASE_ATTACK_RATING_PERCENT;
    this.stats.damagePercent = BASE_DAMAGE_PERCENT;

    Object.entries(this.skillBonuses).forEach(([stat, bonus]) => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] += bonus;
      }
    });

    Object.entries(this.equipmentBonuses).forEach(([stat, bonus]) => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] += bonus;
      }
    });

    Object.entries(this.pathBonuses).forEach(([stat, bonus]) => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] += bonus;
      }
    });

    // Add damage bonus from souls
    const damageBonusFromSouls = Math.floor(this.stats.damage * (this.souls * 0.01));
    this.stats.damage += damageBonusFromSouls;

    // Cap block chance at 75%
    if (this.stats.blockChance > 75) {
      this.stats.blockChance = 75;
    }

    if (this.stats.critChance > 100) {
      this.stats.critChance = 100;
    }

    if (this.stats.attackSpeed > 5) {
      this.stats.attackSpeed = 5;
    }

    updatePlayerHealth();
    updateStatsAndAttributesUI();
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    const constant = 100 + this.level * 10;
    const reduction = (armor / (armor + constant)) * 100;
    return Math.min(reduction, 95); // Changed cap to 95%
  }

  regenerate() {
    this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + this.stats.lifeRegen);
    this.stats.currentMana = Math.min(this.stats.maxMana, this.stats.currentMana + this.stats.manaRegen);
    updatePlayerHealth();
  }

  calculateTotalDamage(isCritical) {
    let baseDamage = this.stats.damage * (1 + this.stats.damagePercent / 100);
    if (isCritical) baseDamage *= this.stats.critDamage;

    const elementalDamage =
      this.stats.fireDamage +
      this.stats.coldDamage +
      this.stats.lightningDamage +
      this.stats.waterDamage +
      this.stats.airDamage +
      this.stats.earthDamage;

    return baseDamage + elementalDamage;
  }
}
