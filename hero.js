import { updateStatsAndAttributesUI } from './ui.js';
import { game, inventory, shop, skillTree } from './main.js';
import { updatePlayerHealth } from './ui.js';
import { createCombatText } from './combat.js';
import { handleSavedData } from './functions.js';

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
};
export const BASE_ATTACK_RATING_PERCENT = 0;
export const BASE_DAMAGE_PERCENT = 0;

export const ATTRIBUTES = {
  strength: {
    tooltip: 'Each point increases:\n• Damage by 2\n• Every 5 points adds 1% to total damage',
    effects: {
      damagePerPoint: 2,
      damagePercentPer: {
        points: 5,
        value: 0.01,
      },
    },
  },
  agility: {
    tooltip:
      'Each point increases:\n• Attack Rating by 10\n• Every 5 points adds 1% to total attack rating\n• Every 25 points adds 1% attack speed',
    effects: {
      attackRatingPerPoint: 10,
      attackRatingPercentPer: {
        points: 5,
        value: 0.01,
      },
      attackSpeedPer: {
        points: 25,
        value: 0.01,
      },
    },
  },
  vitality: {
    tooltip:
      'Each point increases:\n• Health by 10\n• Every 5 points adds 1% to total health\n• Every 10 points adds 1% health regeneration',
    effects: {
      healthPerPoint: 10,
      healthPercentPer: {
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        points: 10,
        value: 0.01,
      },
    },
  },
  wisdom: {
    tooltip:
      'Each point increases:\n• Mana by 5\n• Every 5 points adds 1% to total mana\n• Every 10 points adds 1% mana regeneration',
    effects: {
      manaPerPoint: 5,
      manaPercentPer: {
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        points: 10,
        value: 0.01,
      },
    },
  },
  endurance: {
    tooltip: 'Each point increases:\n• Armor by 1\n• Every 5 points adds 1% to total armor',
    effects: {
      armorPerPoint: 1,
      armorPercentPer: {
        points: 5,
        value: 0.01,
      },
    },
  },
  dexterity: {
    tooltip:
      'Each point increases:\n• Every 25 points adds 1% critical strike chance\n• Every 10 points adds 1% critical strike damage',
    effects: {
      critChancePer: {
        points: 25,
        value: 0.01,
      },
      critDamagePer: {
        points: 10,
        value: 0.01,
      },
    },
  },
};

export default class Hero {
  constructor(savedData = null) {
    this.setBaseStats(savedData);
  }

  setBaseStats(savedData = null) {
    this.level = 1;
    this.gold = 123123012123;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 20;

    this.statPoints = 0;
    this.souls = 0;
    this.highestZone = 1;

    this.startingZone = 1;
    this.startingGold = 0;

    this.primaryStats = {
      strength: 0,
      agility: 0,
      vitality: 0,
      wisdom: 0,
      endurance: 0,
      dexterity: 0,
    };

    // Gets recalculated every time something changes
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
      attackRatingPercent: BASE_ATTACK_RATING_PERCENT,
      damagePercent: BASE_DAMAGE_PERCENT,
    };

    handleSavedData(savedData, this);
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
    return this.primaryStats[stat] + inventory.equipmentBonuses[stat] + skillTree.pathBonuses[stat] || 0;
  }

  recalculateFromAttributes() {
    inventory.updateItemBonuses();
    skillTree.updateSkillBonuses();
    shop.updateShopBonuses();

    // Calculate attribute bonuses using ATTRIBUTES constant
    const str = this.primaryStats.strength + inventory.equipmentBonuses.strength;
    const agi = this.primaryStats.agility + inventory.equipmentBonuses.agility;
    const vit = this.primaryStats.vitality + inventory.equipmentBonuses.vitality;
    const wis = this.primaryStats.wisdom + inventory.equipmentBonuses.wisdom;
    const end = this.primaryStats.endurance + inventory.equipmentBonuses.endurance;
    const dex = this.primaryStats.dexterity + inventory.equipmentBonuses.dexterity;

    // Strength
    const strDamageFlat = str * ATTRIBUTES.strength.effects.damagePerPoint;
    const strDamagePercent =
      Math.floor(str / ATTRIBUTES.strength.effects.damagePercentPer.points) *
      ATTRIBUTES.strength.effects.damagePercentPer.value;

    // Agility
    const agiAttackRatingFlat = agi * ATTRIBUTES.agility.effects.attackRatingPerPoint;
    const agiAttackRatingPercent =
      Math.floor(agi / ATTRIBUTES.agility.effects.attackRatingPercentPer.points) *
      ATTRIBUTES.agility.effects.attackRatingPercentPer.value;
    const agiAttackSpeed =
      Math.floor(agi / ATTRIBUTES.agility.effects.attackSpeedPer.points) *
      ATTRIBUTES.agility.effects.attackSpeedPer.value;

    // Vitality
    const vitHealthFlat = vit * ATTRIBUTES.vitality.effects.healthPerPoint;
    const vitHealthPercent =
      Math.floor(vit / ATTRIBUTES.vitality.effects.healthPercentPer.points) *
      ATTRIBUTES.vitality.effects.healthPercentPer.value;
    const vitRegenPercent =
      Math.floor(vit / ATTRIBUTES.vitality.effects.regenPercentPer.points) *
      ATTRIBUTES.vitality.effects.regenPercentPer.value;

    // Wisdom
    const wisManaFlat = wis * ATTRIBUTES.wisdom.effects.manaPerPoint;
    const wisManaPercent =
      Math.floor(wis / ATTRIBUTES.wisdom.effects.manaPercentPer.points) *
      ATTRIBUTES.wisdom.effects.manaPercentPer.value;
    const wisRegenPercent =
      Math.floor(wis / ATTRIBUTES.wisdom.effects.regenPercentPer.points) *
      ATTRIBUTES.wisdom.effects.regenPercentPer.value;

    // Endurance
    const endArmorFlat = end * ATTRIBUTES.endurance.effects.armorPerPoint;
    const endArmorPercent =
      Math.floor(end / ATTRIBUTES.endurance.effects.armorPercentPer.points) *
      ATTRIBUTES.endurance.effects.armorPercentPer.value;

    // Dexterity
    const dexCritChance =
      Math.floor(dex / ATTRIBUTES.dexterity.effects.critChancePer.points) *
      ATTRIBUTES.dexterity.effects.critChancePer.value;
    const dexCritDamage =
      Math.floor(dex / ATTRIBUTES.dexterity.effects.critDamagePer.points) *
      ATTRIBUTES.dexterity.effects.critDamagePer.value;

    // Damage
    this.stats.damage =
      (BASE_DAMAGE + strDamageFlat + shop.shopBonuses.damage + DAMAGE_ON_LEVEL_UP * this.level - DAMAGE_ON_LEVEL_UP) *
      (1 + strDamagePercent);

    // Attack Speed
    this.stats.attackSpeed = BASE_ATTACK_SPEED + shop.shopBonuses.attackSpeed + agiAttackSpeed;

    // Attack Rating
    this.stats.attackRating =
      (BASE_ATTACK_RATING + agiAttackRatingFlat + ATTACK_RATING_ON_LEVEL_UP * this.level) *
      (1 + agiAttackRatingPercent + this.stats.attackRatingPercent / 100);

    // Max Health
    this.stats.maxHealth =
      (BASE_HEALTH + vitHealthFlat + shop.shopBonuses.health + HEALTH_ON_LEVEL_UP * this.level - HEALTH_ON_LEVEL_UP) *
      (1 + vitHealthPercent);

    // Life Regen
    this.stats.lifeRegen =
      (BASE_LIFE_REGEN + shop.shopBonuses.healthRegen + inventory.equipmentBonuses.lifeRegen) * (1 + vitRegenPercent);

    // Max Mana
    this.stats.maxMana =
      (BASE_MANA + wisManaFlat + shop.shopBonuses.mana + MANA_ON_LEVEL_UP * this.level - MANA_ON_LEVEL_UP) *
      (1 + wisManaPercent);

    // Mana Regen
    this.stats.manaRegen =
      (BASE_MANA_REGEN + shop.shopBonuses.manaRegen + inventory.equipmentBonuses.manaRegen) * (1 + wisRegenPercent);

    // Armor
    this.stats.armor = (BASE_ARMOR + endArmorFlat + shop.shopBonuses.armor) * (1 + endArmorPercent);

    // Crit Chance
    this.stats.critChance = BASE_CRIT_CHANCE + shop.shopBonuses.critChance + dexCritChance * 100;

    // Crit Damage
    this.stats.critDamage = BASE_CRIT_DAMAGE + shop.shopBonuses.critDamage + dexCritDamage;

    this.stats.attackRatingPercent = BASE_ATTACK_RATING_PERCENT;
    this.stats.damagePercent = BASE_DAMAGE_PERCENT;

    this.stats.fireDamage = BASE_ELEMENTAL_DAMAGE.fire;
    this.stats.coldDamage = BASE_ELEMENTAL_DAMAGE.cold;
    this.stats.lightningDamage = BASE_ELEMENTAL_DAMAGE.lightning;
    this.stats.waterDamage = BASE_ELEMENTAL_DAMAGE.water;

    // Apply skill, equipment, and path bonuses
    Object.entries(skillTree.skillBonuses).forEach(([stat, bonus]) => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] += bonus;
      }
    });

    Object.entries(inventory.equipmentBonuses).forEach(([stat, bonus]) => {
      if (this.stats[stat] !== undefined) {
        this.stats[stat] += bonus;
      }
    });

    Object.entries(skillTree.pathBonuses).forEach(([stat, bonus]) => {
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

    // Cap critical chance at 100%
    if (this.stats.critChance > 100) {
      this.stats.critChance = 100;
    }

    // Cap attack speed
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
      this.stats.fireDamage + this.stats.coldDamage + this.stats.lightningDamage + this.stats.waterDamage;

    return baseDamage + elementalDamage;
  }
}
