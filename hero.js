import { initializeSkillTreeStructure, updateStatsAndAttributesUI } from './ui.js';
import { game, inventory, shop, skillTree } from './main.js';
import { updatePlayerHealth } from './ui.js';
import { createCombatText } from './combat.js';
import { handleSavedData } from './functions.js';
import { ELEMENT_OPPOSITES } from './enemy.js';

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
    tooltip: html`
      <strong>Strength</strong><br />
      Each point increases:<br />
      • Damage by 1<br />
      • Every 5 points adds 1% to total damage
    `,
    effects: {
      damagePerPoint: 1,
      damagePercentPer: {
        points: 5,
        value: 0.01,
      },
    },
  },
  agility: {
    tooltip: html`
      <strong>Agility</strong><br />
      Each point increases:<br />
      • Attack Rating by 10<br />
      • Every 5 points adds 1% to total attack rating<br />
      • Every 25 points adds 1% attack speed
    `,
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
    tooltip: html`
      <strong>Vitality</strong><br />
      Each point increases:<br />
      • Health by 10<br />
      • Every 5 points adds 1% to total health<br />
      • Every 10 points adds 1% health regeneration
    `,
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
    tooltip: html`
      <strong>Wisdom</strong><br />
      Each point increases:<br />
      • Mana by 5<br />
      • Every 5 points adds 1% to total mana<br />
      • Every 10 points adds 10% mana regeneration
    `,
    effects: {
      manaPerPoint: 5,
      manaPercentPer: {
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        points: 10,
        value: 0.1,
      },
    },
  },
  endurance: {
    tooltip: html`
      <strong>Endurance</strong><br />
      Each point increases:<br />
      • Armor by 3<br />
      • Every 5 points adds 1% to total armor
    `,
    effects: {
      armorPerPoint: 3,
      armorPercentPer: {
        points: 5,
        value: 0.01,
      },
    },
  },
  dexterity: {
    tooltip: html`
      <strong>Dexterity</strong><br />
      Each point increases:<br />
      • Damage by 1<br />
      • Every 25 points adds 1% critical strike chance<br />
      • Every 10 points adds 1% critical strike damage
    `,
    effects: {
      damagePerPoint: 1,
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
    this.gold = 0;
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
      damageFlat:
        this.stats.strength * ATTRIBUTES.strength.effects.damagePerPoint +
        this.stats.dexterity * ATTRIBUTES.dexterity.effects.damagePerPoint,
      damagePercent:
        Math.floor(this.stats.strength / ATTRIBUTES.strength.effects.damagePercentPer.points) *
        ATTRIBUTES.strength.effects.damagePercentPer.value,
      attackRatingFlat: this.stats.agility * ATTRIBUTES.agility.effects.attackRatingPerPoint,
      attackRatingPercent:
        Math.floor(this.stats.agility / ATTRIBUTES.agility.effects.attackRatingPercentPer.points) *
        ATTRIBUTES.agility.effects.attackRatingPercentPer.value,
      attackSpeed:
        Math.floor(this.stats.agility / ATTRIBUTES.agility.effects.attackSpeedPer.points) *
        ATTRIBUTES.agility.effects.attackSpeedPer.value,
      healthFlat: this.stats.vitality * ATTRIBUTES.vitality.effects.healthPerPoint,
      healthPercent:
        Math.floor(this.stats.vitality / ATTRIBUTES.vitality.effects.healthPercentPer.points) *
        ATTRIBUTES.vitality.effects.healthPercentPer.value,
      lifeRegenPercent:
        Math.floor(this.stats.vitality / ATTRIBUTES.vitality.effects.regenPercentPer.points) *
        ATTRIBUTES.vitality.effects.regenPercentPer.value,
      manaFlat: this.stats.wisdom * ATTRIBUTES.wisdom.effects.manaPerPoint,
      manaPercent:
        Math.floor(this.stats.wisdom / ATTRIBUTES.wisdom.effects.manaPercentPer.points) *
        ATTRIBUTES.wisdom.effects.manaPercentPer.value,
      manaRegenPercent:
        Math.floor(this.stats.wisdom / ATTRIBUTES.wisdom.effects.regenPercentPer.points) *
        ATTRIBUTES.wisdom.effects.regenPercentPer.value,
      armorFlat: this.stats.endurance * ATTRIBUTES.endurance.effects.armorPerPoint,
      armorPercent:
        Math.floor(this.stats.endurance / ATTRIBUTES.endurance.effects.armorPercentPer.points) *
        ATTRIBUTES.endurance.effects.armorPercentPer.value,
      critChance:
        Math.floor(this.stats.dexterity / ATTRIBUTES.dexterity.effects.critChancePer.points) *
        ATTRIBUTES.dexterity.effects.critChancePer.value,
      critDamage:
        Math.floor(this.stats.dexterity / ATTRIBUTES.dexterity.effects.critDamagePer.points) *
        ATTRIBUTES.dexterity.effects.critDamagePer.value,
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
        (skillTreeBonuses.goldBonus || 0),
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
    const zoneScaling = 1 + (game.zone - 1) * 0.1; // Linear 10% increase per zone, matching attack rating
    const constant = 100 * zoneScaling;
    const reduction = (armor / (armor + constant)) * 100;
    return Math.min(reduction, 95); // Keep the 95% cap
  }

  regenerate() {
    this.stats.currentHealth = Math.min(this.stats.health, this.stats.currentHealth + this.stats.lifeRegen / 10);
    this.stats.currentMana = Math.min(this.stats.mana, this.stats.currentMana + this.stats.manaRegen / 10);
    updatePlayerHealth();
  }

  calculateTotalDamage(isCritical) {
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
    const totalDamage = physicalDamage + elementalDamage;

    // Apply crit at the end to total damage
    return isCritical ? totalDamage * this.stats.critDamage : totalDamage;
  }
}
