import { initializeSkillTreeStructure, updateStatsAndAttributesUI } from './ui.js';
import { game, inventory, shop, skillTree, statistics } from './globals.js';
import { updatePlayerHealth } from './ui.js';
import { createCombatText } from './combat.js';
import { handleSavedData } from './functions.js';
import { ELEMENT_OPPOSITES } from './enemy.js';
import { updateRegionUI } from './region.js';

const html = String.raw;

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
  air: 0,
  earth: 0,
};
export const BASE_ATTACK_RATING_PERCENT = 0;
export const BASE_DAMAGE_PERCENT = 0;

export const STAT_DECIMAL_PLACES = {
  damage: 0,
  attackSpeed: 2,
  critChance: 2,
  critDamage: 2,
  health: 0,
  armor: 0,
  blockChance: 1,
  attackRating: 0,
  lifeSteal: 2,
  mana: 0,
  manaRegen: 1,
  lifeRegen: 1,
  fireDamage: 0,
  coldDamage: 0,
  airDamage: 0,
  earthDamage: 0,
  bonusGold: 0,
  bonusExperience: 0,
};

export const ATTRIBUTES = {
  strength: {
    effects: {
      damagePerPoint: 1,
      damagePercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
    },
  },
  agility: {
    effects: {
      attackRatingPerPoint: 10,
      attackRatingPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
      attackSpeedPer: {
        enabled: false,
        points: 25,
        value: 0.01,
      },
    },
  },
  vitality: {
    effects: {
      healthPerPoint: 10,
      healthPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        enabled: false,
        points: 10,
        value: 0.01,
      },
    },
  },
  wisdom: {
    effects: {
      manaPerPoint: 5,
      manaPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        enabled: false,
        points: 10,
        value: 0.1,
      },
    },
  },
  endurance: {
    effects: {
      armorPerPoint: 3,
      armorPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
    },
  },
  dexterity: {
    effects: {
      critDamagePerPoint: 0.01,
      critChancePer: {
        enabled: false,
        points: 25,
        value: 0.01,
      },
      critDamagePer: {
        enabled: false,
        points: 10,
        value: 0.01,
      },
    },
  },
};

export const ATTRIBUTE_TOOLTIPS = {
  getStrengthTooltip: () => html`
    <strong>Strength</strong><br />
    Each point increases:<br />
    • Damage by ${ATTRIBUTES.strength.effects.damagePerPoint}<br />
    ${ATTRIBUTES.strength.effects.damagePercentPer.enabled
      ? `• Every ${ATTRIBUTES.strength.effects.damagePercentPer.points} points adds ${
          ATTRIBUTES.strength.effects.damagePercentPer.value * 100
        }% to total damage`
      : ''}
  `,

  getAgilityTooltip: () => html`
    <strong>Agility</strong><br />
    Each point increases:<br />
    • Attack Rating by ${ATTRIBUTES.agility.effects.attackRatingPerPoint}<br />
    ${ATTRIBUTES.agility.effects.attackRatingPercentPer.enabled
      ? `• Every ${ATTRIBUTES.agility.effects.attackRatingPercentPer.points} points adds ${
          ATTRIBUTES.agility.effects.attackRatingPercentPer.value * 100
        }% to total attack rating`
      : ''}
    ${ATTRIBUTES.agility.effects.attackSpeedPer.enabled
      ? `• Every ${ATTRIBUTES.agility.effects.attackSpeedPer.points} points adds ${
          ATTRIBUTES.agility.effects.attackSpeedPer.value * 100
        }% attack speed`
      : ''}
  `,

  getVitalityTooltip: () => html`
    <strong>Vitality</strong><br />
    Each point increases:<br />
    • Health by ${ATTRIBUTES.vitality.effects.healthPerPoint}<br />
    ${ATTRIBUTES.vitality.effects.healthPercentPer.enabled
      ? `• Every ${ATTRIBUTES.vitality.effects.healthPercentPer.points} points adds ${
          ATTRIBUTES.vitality.effects.healthPercentPer.value * 100
        }% to total health`
      : ''}
    ${ATTRIBUTES.vitality.effects.regenPercentPer.enabled
      ? `• Every ${ATTRIBUTES.vitality.effects.regenPercentPer.points} points adds ${
          ATTRIBUTES.vitality.effects.regenPercentPer.value * 100
        }% health regeneration`
      : ''}
  `,

  getWisdomTooltip: () => html`
    <strong>Wisdom</strong><br />
    Each point increases:<br />
    • Mana by ${ATTRIBUTES.wisdom.effects.manaPerPoint}<br />
    ${ATTRIBUTES.wisdom.effects.manaPercentPer.enabled
      ? `• Every ${ATTRIBUTES.wisdom.effects.manaPercentPer.points} points adds ${
          ATTRIBUTES.wisdom.effects.manaPercentPer.value * 100
        }% to total mana`
      : ''}
    ${ATTRIBUTES.wisdom.effects.regenPercentPer.enabled
      ? `• Every ${ATTRIBUTES.wisdom.effects.regenPercentPer.points} points adds ${
          ATTRIBUTES.wisdom.effects.regenPercentPer.value * 100
        }% mana regeneration`
      : ''}
  `,

  getEnduranceTooltip: () => html`
    <strong>Endurance</strong><br />
    Each point increases:<br />
    • Armor by ${ATTRIBUTES.endurance.effects.armorPerPoint}<br />
    ${ATTRIBUTES.endurance.effects.armorPercentPer.enabled
      ? `• Every ${ATTRIBUTES.endurance.effects.armorPercentPer.points} points adds ${
          ATTRIBUTES.endurance.effects.armorPercentPer.value * 100
        }% to total armor`
      : ''}
  `,

  getDexterityTooltip: () => html`
    <strong>Dexterity</strong><br />
    Each point increases:<br />
    • Critical Damage by ${ATTRIBUTES.dexterity.effects.critDamagePerPoint}<br />
    ${ATTRIBUTES.dexterity.effects.critChancePer.enabled
      ? `• Every ${ATTRIBUTES.dexterity.effects.critChancePer.points} points adds ${
          ATTRIBUTES.dexterity.effects.critChancePer.value * 100
        }% critical strike chance`
      : ''}
    ${ATTRIBUTES.dexterity.effects.critDamagePer.enabled
      ? `• Every ${ATTRIBUTES.dexterity.effects.critDamagePer.points} points adds ${
          ATTRIBUTES.dexterity.effects.critDamagePer.value * 100
        }% critical strike damage`
      : ''}
  `,

  getElementalDamageTooltip: () => html`
    <strong>Elemental Damage</strong><br />
    Effectiveness against enemy elements:<br />
    • 200% damage vs opposite element<br />
    • 0% damage vs same element<br />
    • 25% damage vs other elements<br /><br />
    Element Strengths:<br />
    🔥 Fire → ☁️ Air<br />
    🌍 Earth → ❄️ Cold<br />
    ❄️ Cold → 🔥 Fire<br />
    ☁️ Air → 🌍 Earth
  `,

  getDamageTooltip: () => html`
    <strong>Damage</strong><br />
    Base physical damage dealt to enemies.<br />
    Increased by Strength and equipment.
  `,

  getAttackSpeedTooltip: () => html`
    <strong>Attack Speed</strong><br />
    Number of attacks per second.<br />
    Maximum: 5 attacks/second
  `,

  getAttackRatingTooltip: () => html`
    <strong>Attack Rating</strong><br />
    Determines hit chance against enemies.<br />
    Higher stages require more Attack Rating.
  `,

  getCritChanceTooltip: () => html`
    <strong>Critical Strike Chance</strong><br />
    Chance to deal critical damage.<br />
    Maximum: 100%
  `,

  getCritDamageTooltip: () => html`
    <strong>Critical Strike Damage</strong><br />
    Damage multiplier on critical hits.<br />
    Base: 1.5x damage
  `,

  getLifeStealTooltip: () => html`
    <strong>Life Steal</strong><br />
    Percentage of damage dealt recovered as health.
  `,

  getMaxHealthTooltip: () => html`
    <strong>Health</strong><br />
    Maximum health points.<br />
    Increased by Vitality and level ups.
  `,

  getHealthRegenTooltip: () => html`
    <strong>Health Regeneration</strong><br />
    Amount of health recovered per second.
  `,

  getMaxManaTooltip: () => html`
    <strong>Mana</strong><br />
    Maximum mana points.<br />
    Increased by Wisdom and level ups.
  `,

  getManaRegenTooltip: () => html`
    <strong>Mana Regeneration</strong><br />
    Amount of mana recovered per second.
  `,

  getArmorTooltip: () => html`
    <strong>Armor</strong><br />
    Reduces incoming damage.<br />
    Effectiveness decreases in higher stages.
  `,

  getBlockChanceTooltip: () => html`
    <strong>Block Chance</strong><br />
    Chance to block incoming attacks.<br />
    Maximum: 75%
  `,
};
export default class Hero {
  constructor(savedData = null) {
    this.setBaseStats(savedData);
  }

  setBaseStats(savedData = null) {
    this.level = 1;
    this.gold = 0;
    this.crystals = 0;
    this.exp = 0;
    this.expToNextLevel = 20;

    this.statPoints = 0;
    this.souls = 0;
    this.highestStage = 1;

    this.startingStage = 1;
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
      health: BASE_HEALTH,
      armor: BASE_ARMOR,
      blockChance: BASE_BLOCK_CHANCE,
      attackRating: BASE_ATTACK_RATING,
      currentMana: BASE_MANA,
      mana: BASE_MANA,
      manaRegen: BASE_MANA_REGEN,
      lifeRegen: BASE_LIFE_REGEN,
      lifeSteal: BASE_LIFE_STEAL,
      fireDamage: BASE_ELEMENTAL_DAMAGE.fire,
      coldDamage: BASE_ELEMENTAL_DAMAGE.cold,
      airDamage: BASE_ELEMENTAL_DAMAGE.air,
      earthDamage: BASE_ELEMENTAL_DAMAGE.earth,
      attackRatingPercent: BASE_ATTACK_RATING_PERCENT,
      damagePercent: BASE_DAMAGE_PERCENT,
      strength: 0,
      agility: 0,
      vitality: 0,
      wisdom: 0,
      endurance: 0,
      dexterity: 0,
      bonusGold: 0,
      bonusExperience: 0,
      healthPercent: 0,
      manaPercent: 0,
      armorPercent: 0,
      elementalDamagePercent: 0,
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

  gainGold(amount) {
    statistics.increment('totalGoldEarned', null, amount);
    this.gold += amount;
  }

  levelUp() {
    this.exp -= this.expToNextLevel;
    this.level++;
    this.statPoints += STATS_ON_LEVEL_UP;
    this.expToNextLevel += this.level * 20 - 20;
    this.recalculateFromAttributes();
    this.stats.currentHealth = this.stats.health; // Full heal on level up
    this.stats.currentMana = this.stats.mana; // Full heal on level up

    // Add level up notification
    createCombatText(`LEVEL UP! (${this.level})`);

    skillTree.addSkillPoints(1); // Add 1 skill point per level

    updatePlayerHealth();
    updateStatsAndAttributesUI();
    initializeSkillTreeStructure();
    game.saveGame();
    updateRegionUI(); // Update region UI to unlock new regions if level requirement is met
  }

  allocateStat(stat) {
    if (this.statPoints > 0 && this.primaryStats[stat] !== undefined) {
      this.primaryStats[stat]++;
      this.statPoints--;
      this.recalculateFromAttributes();
      if (stat === 'vitality' && !game.gameStarted) {
        this.stats.currentHealth = this.stats.health;
      }
      game.saveGame();
      return true;
    }
    return false;
  }

  recalculateFromAttributes() {
    inventory.updateItemBonuses();
    shop.updateShopBonuses();

    const skillTreeBonuses = skillTree.getAllSkillTreeBonuses();

    this.calculatePrimaryStats(skillTreeBonuses);
    const attributeEffects = this.calculateAttributeEffects();
    const flatValues = this.calculateFlatValues(attributeEffects, skillTreeBonuses);
    const percentBonuses = this.calculatePercentBonuses(attributeEffects, skillTreeBonuses);

    this.applyFinalCalculations(flatValues, percentBonuses, attributeEffects);

    updatePlayerHealth();
    updateStatsAndAttributesUI();
  }

  calculatePrimaryStats(skillTreeBonuses) {
    this.stats.strength =
      this.primaryStats.strength + (inventory.equipmentBonuses.strength || 0) + (skillTreeBonuses.strength || 0);
    this.stats.agility =
      this.primaryStats.agility + (inventory.equipmentBonuses.agility || 0) + (skillTreeBonuses.agility || 0);
    this.stats.vitality =
      this.primaryStats.vitality + (inventory.equipmentBonuses.vitality || 0) + (skillTreeBonuses.vitality || 0);
    this.stats.wisdom =
      this.primaryStats.wisdom + (inventory.equipmentBonuses.wisdom || 0) + (skillTreeBonuses.wisdom || 0);
    this.stats.endurance =
      this.primaryStats.endurance + (inventory.equipmentBonuses.endurance || 0) + (skillTreeBonuses.endurance || 0);
    this.stats.dexterity =
      this.primaryStats.dexterity + (inventory.equipmentBonuses.dexterity || 0) + (skillTreeBonuses.dexterity || 0);
  }

  calculateAttributeEffects() {
    return {
      damageFlat: this.stats.strength * ATTRIBUTES.strength.effects.damagePerPoint,
      damagePercent: ATTRIBUTES.strength.effects.damagePercentPer.enabled
        ? Math.floor(this.stats.strength / ATTRIBUTES.strength.effects.damagePercentPer.points) *
          ATTRIBUTES.strength.effects.damagePercentPer.value
        : 0,
      attackRatingFlat: this.stats.agility * ATTRIBUTES.agility.effects.attackRatingPerPoint,
      attackRatingPercent: ATTRIBUTES.agility.effects.attackRatingPercentPer.enabled
        ? Math.floor(this.stats.agility / ATTRIBUTES.agility.effects.attackRatingPercentPer.points) *
          ATTRIBUTES.agility.effects.attackRatingPercentPer.value
        : 0,
      attackSpeed: ATTRIBUTES.agility.effects.attackSpeedPer.enabled
        ? Math.floor(this.stats.agility / ATTRIBUTES.agility.effects.attackSpeedPer.points) *
          ATTRIBUTES.agility.effects.attackSpeedPer.value
        : 0,
      healthFlat: this.stats.vitality * ATTRIBUTES.vitality.effects.healthPerPoint,
      healthPercent: ATTRIBUTES.vitality.effects.healthPercentPer.enabled
        ? Math.floor(this.stats.vitality / ATTRIBUTES.vitality.effects.healthPercentPer.points) *
          ATTRIBUTES.vitality.effects.healthPercentPer.value
        : 0,
      lifeRegenPercent: ATTRIBUTES.vitality.effects.regenPercentPer.enabled
        ? Math.floor(this.stats.vitality / ATTRIBUTES.vitality.effects.regenPercentPer.points) *
          ATTRIBUTES.vitality.effects.regenPercentPer.value
        : 0,
      manaFlat: this.stats.wisdom * ATTRIBUTES.wisdom.effects.manaPerPoint,
      manaPercent: ATTRIBUTES.wisdom.effects.manaPercentPer.enabled
        ? Math.floor(this.stats.wisdom / ATTRIBUTES.wisdom.effects.manaPercentPer.points) *
          ATTRIBUTES.wisdom.effects.manaPercentPer.value
        : 0,
      manaRegenPercent: ATTRIBUTES.wisdom.effects.regenPercentPer.enabled
        ? Math.floor(this.stats.wisdom / ATTRIBUTES.wisdom.effects.regenPercentPer.points) *
          ATTRIBUTES.wisdom.effects.regenPercentPer.value
        : 0,
      armorFlat: this.stats.endurance * ATTRIBUTES.endurance.effects.armorPerPoint,
      armorPercent: ATTRIBUTES.endurance.effects.armorPercentPer.enabled
        ? Math.floor(this.stats.endurance / ATTRIBUTES.endurance.effects.armorPercentPer.points) *
          ATTRIBUTES.endurance.effects.armorPercentPer.value
        : 0,
      critChance: ATTRIBUTES.dexterity.effects.critChancePer.enabled
        ? Math.floor(this.stats.dexterity / ATTRIBUTES.dexterity.effects.critChancePer.points) *
          ATTRIBUTES.dexterity.effects.critChancePer.value
        : 0,
      critDamage:
        this.stats.dexterity * ATTRIBUTES.dexterity.effects.critDamagePerPoint +
        (ATTRIBUTES.dexterity.effects.critDamagePer.enabled
          ? Math.floor(this.stats.dexterity / ATTRIBUTES.dexterity.effects.critDamagePer.points) *
            ATTRIBUTES.dexterity.effects.critDamagePer.value
          : 0),
    };
  }

  calculateFlatValues(attributeEffects, skillTreeBonuses) {
    return {
      fireDamage:
        BASE_ELEMENTAL_DAMAGE.fire +
        (shop.shopBonuses.fireDamage || 0) +
        (inventory.equipmentBonuses.fireDamage || 0) +
        (skillTreeBonuses.fireDamage || 0),
      coldDamage:
        BASE_ELEMENTAL_DAMAGE.cold +
        (shop.shopBonuses.coldDamage || 0) +
        (inventory.equipmentBonuses.coldDamage || 0) +
        (skillTreeBonuses.coldDamage || 0),
      airDamage:
        BASE_ELEMENTAL_DAMAGE.air +
        (shop.shopBonuses.airDamage || 0) +
        (inventory.equipmentBonuses.airDamage || 0) +
        (skillTreeBonuses.airDamage || 0),
      earthDamage:
        BASE_ELEMENTAL_DAMAGE.earth +
        (shop.shopBonuses.earthDamage || 0) +
        (inventory.equipmentBonuses.earthDamage || 0) +
        (skillTreeBonuses.earthDamage || 0),
      damage:
        BASE_DAMAGE +
        attributeEffects.damageFlat +
        DAMAGE_ON_LEVEL_UP * (this.level - 1) +
        (shop.shopBonuses.damage || 0) +
        (inventory.equipmentBonuses.damage || 0) +
        (skillTreeBonuses.damage || 0),
      attackSpeed:
        BASE_ATTACK_SPEED +
        attributeEffects.attackSpeed +
        (shop.shopBonuses.attackSpeed || 0) +
        (inventory.equipmentBonuses.attackSpeed || 0) +
        (skillTreeBonuses.attackSpeed || 0),
      critChance:
        BASE_CRIT_CHANCE +
        attributeEffects.critChance * 100 +
        (shop.shopBonuses.critChance || 0) +
        (inventory.equipmentBonuses.critChance || 0) +
        (skillTreeBonuses.critChance || 0),
      critDamage:
        BASE_CRIT_DAMAGE +
        attributeEffects.critDamage +
        (shop.shopBonuses.critDamage || 0) +
        (inventory.equipmentBonuses.critDamage || 0) +
        (skillTreeBonuses.critDamage || 0),
      attackRating:
        BASE_ATTACK_RATING +
        attributeEffects.attackRatingFlat +
        ATTACK_RATING_ON_LEVEL_UP * (this.level - 1) +
        (shop.shopBonuses.attackRating || 0) +
        (inventory.equipmentBonuses.attackRating || 0) +
        (skillTreeBonuses.attackRating || 0),
      health:
        BASE_HEALTH +
        attributeEffects.healthFlat +
        HEALTH_ON_LEVEL_UP * (this.level - 1) +
        (shop.shopBonuses.health || 0) +
        (inventory.equipmentBonuses.health || 0) +
        (skillTreeBonuses.health || 0),
      mana:
        BASE_MANA +
        attributeEffects.manaFlat +
        MANA_ON_LEVEL_UP * (this.level - 1) +
        (shop.shopBonuses.mana || 0) +
        (inventory.equipmentBonuses.mana || 0) +
        (skillTreeBonuses.mana || 0),
      armor:
        BASE_ARMOR +
        attributeEffects.armorFlat +
        (shop.shopBonuses.armor || 0) +
        (inventory.equipmentBonuses.armor || 0) +
        (skillTreeBonuses.armor || 0),
      lifeSteal:
        BASE_LIFE_STEAL +
        (shop.shopBonuses.lifeSteal || 0) +
        (inventory.equipmentBonuses.lifeSteal || 0) +
        (skillTreeBonuses.lifeSteal || 0),
      bonusExperience:
        (shop.shopBonuses.bonusExperience || 0) +
        (inventory.equipmentBonuses.bonusExperience || 0) +
        (skillTreeBonuses.expBonus || 0),
      bonusGold:
        (shop.shopBonuses.bonusGold || 0) +
        (inventory.equipmentBonuses.bonusGold || 0) +
        (skillTreeBonuses.bonusGold || 0),
      lifeRegen:
        BASE_LIFE_REGEN +
        (shop.shopBonuses.lifeRegen || 0) +
        (inventory.equipmentBonuses.lifeRegen || 0) +
        (skillTreeBonuses.lifeRegen || 0),
      manaRegen:
        BASE_MANA_REGEN +
        (shop.shopBonuses.manaRegen || 0) +
        (inventory.equipmentBonuses.manaRegen || 0) +
        (skillTreeBonuses.manaRegen || 0),
      blockChance:
        BASE_BLOCK_CHANCE +
        (shop.shopBonuses.blockChance || 0) +
        (inventory.equipmentBonuses.blockChance || 0) +
        (skillTreeBonuses.blockChance || 0),
    };
  }

  calculatePercentBonuses(attributeEffects, skillTreeBonuses) {
    const percentBonuses = {};
    const statsWithPercentages = ['damage', 'attackRating', 'health', 'armor', 'mana'];

    statsWithPercentages.forEach((stat) => {
      percentBonuses[stat] =
        (attributeEffects[`${stat}Percent`] || 0) +
        (this.stats[`${stat}Percent`] || 0) / 100 +
        (skillTreeBonuses[`${stat}Percent`] || 0) / 100 +
        (inventory.equipmentBonuses[`${stat}Percent`] || 0) / 100;
    });

    this.stats.elementalDamagePercent =
      (skillTreeBonuses.elementalDamagePercent || 0) + (inventory.equipmentBonuses.elementalDamagePercent || 0);

    return percentBonuses;
  }

  applyFinalCalculations(flatValues, percentBonuses, attributeEffects) {
    this.stats.damage = Math.floor(flatValues.damage * (1 + percentBonuses.damage + this.souls * 0.01));
    this.stats.attackRating = Math.floor(flatValues.attackRating * (1 + percentBonuses.attackRating));
    this.stats.health = Math.floor(flatValues.health * (1 + percentBonuses.health));
    this.stats.mana = Math.floor(flatValues.mana * (1 + percentBonuses.mana));
    this.stats.armor = Math.floor(flatValues.armor * (1 + percentBonuses.armor));

    this.stats.lifeRegen = Number(
      (flatValues.lifeRegen * (1 + attributeEffects.lifeRegenPercent)).toFixed(STAT_DECIMAL_PLACES.lifeRegen)
    );
    this.stats.manaRegen = Number(
      (flatValues.manaRegen * (1 + attributeEffects.manaRegenPercent)).toFixed(STAT_DECIMAL_PLACES.manaRegen)
    );

    // percentage calculations
    this.stats.fireDamage = Math.floor(flatValues.fireDamage * (1 + this.stats.elementalDamagePercent / 100));
    this.stats.coldDamage = Math.floor(flatValues.coldDamage * (1 + this.stats.elementalDamagePercent / 100));
    this.stats.airDamage = Math.floor(flatValues.airDamage * (1 + this.stats.elementalDamagePercent / 100));
    this.stats.earthDamage = Math.floor(flatValues.earthDamage * (1 + this.stats.elementalDamagePercent / 100));

    // gold & xp (they ARE % bonuses)
    this.stats.bonusExperience = flatValues.bonusExperience;
    this.stats.bonusGold = flatValues.bonusGold;

    this.stats.attackSpeed = Number(flatValues.attackSpeed.toFixed(STAT_DECIMAL_PLACES.attackSpeed));
    this.stats.critChance = Number(flatValues.critChance.toFixed(STAT_DECIMAL_PLACES.critChance));
    this.stats.critDamage = Number(flatValues.critDamage.toFixed(STAT_DECIMAL_PLACES.critDamage));
    this.stats.lifeSteal = Number(flatValues.lifeSteal.toFixed(STAT_DECIMAL_PLACES.lifeSteal));
    this.stats.blockChance = Number(flatValues.blockChance.toFixed(STAT_DECIMAL_PLACES.blockChance));

    this.stats.blockChance = Math.min(this.stats.blockChance, 75);
    this.stats.critChance = Math.min(this.stats.critChance, 100);
    this.stats.attackSpeed = Math.min(this.stats.attackSpeed, 5);
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    const stageScaling = 1 + (game.stage - 1) * 0.1; // Linear 10% increase per stage, matching attack rating
    const constant = 100 * stageScaling;
    const reduction = (armor / (armor + constant)) * 100;
    return Math.min(reduction, 95); // Keep the 95% cap
  }

  regenerate() {
    this.stats.currentHealth = Math.min(this.stats.health, this.stats.currentHealth + this.stats.lifeRegen / 10);
    this.stats.currentMana = Math.min(this.stats.mana, this.stats.currentMana + this.stats.manaRegen / 10);
    updatePlayerHealth();
  }

  calculateTotalDamage(bonusDamage = 0) {
    // Hit - existing damage calculation code
    const isCritical = Math.random() * 100 < this.stats.critChance;
    // Calculate physical damage
    let physicalDamage = this.stats.damage * (1 + this.stats.damagePercent / 100);

    // Calculate elemental damage with type effectiveness
    let elementalDamage = 0;
    const enemyElement = game.currentEnemy.element;

    // Calculate each element type
    const elements = {
      fire: this.stats.fireDamage,
      cold: this.stats.coldDamage,
      air: this.stats.airDamage,
      earth: this.stats.earthDamage,
    };

    // Add toggle skill effects
    const toggleEffects = skillTree.applyToggleEffects();
    if (toggleEffects.damage) {
      physicalDamage += toggleEffects.damage;
    }
    // Add toggle elemental effects before the element calculations
    if (toggleEffects.fireDamage) elements.fire += toggleEffects.fireDamage;
    if (toggleEffects.coldDamage) elements.cold += toggleEffects.coldDamage;
    if (toggleEffects.airDamage) elements.air += toggleEffects.airDamage;
    if (toggleEffects.earthDamage) elements.earth += toggleEffects.earthDamage;

    Object.entries(elements).forEach(([elementType, damage]) => {
      if (damage > 0) {
        if (ELEMENT_OPPOSITES[elementType] === enemyElement) {
          // Double damage against opposite element
          elementalDamage += damage * 2;
        } else if (elementType === enemyElement) {
          // No damage against same element
          elementalDamage += 0;
        } else {
          // 25% damage against non-opposite elements
          elementalDamage += damage * 0.25;
        }
      }
    });

    // Calculate total damage before crit
    const totalDamage = physicalDamage + elementalDamage + bonusDamage;

    // Apply crit at the end to total damage
    return {
      damage: isCritical ? totalDamage * this.stats.critDamage : totalDamage,
      isCritical,
    };
  }

  calculateBlockHealing() {
    // Get evasion skill level if it exists
    const evasionSkill = skillTree.skills['evasion'];
    if (evasionSkill) {
      // Heal 5% of max health when blocking
      const healAmount = this.stats.health * 0.05;
      this.stats.currentHealth = Math.min(this.stats.health, this.stats.currentHealth + healAmount);
      return healAmount;
    }
    return 0;
  }
}
