import { updateStatsAndAttributesUI } from './ui.js';
import { game, inventory, shop, skillTree } from './main.js';
import { updatePlayerHealth } from './ui.js';
import { createCombatText } from './combat.js';
import { handleSavedData } from './functions.js';
import { ELEMENT_OPPOSITES } from './enemy.js';

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

export const ATTRIBUTES = {
  strength: {
    tooltip: 'Each point increases:\n• Damage by 1\n• Every 5 points adds 1% to total damage',
    effects: {
      damagePerPoint: 1,
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
      maxMana: BASE_MANA,
      manaRegen: BASE_MANA_REGEN,
      lifeRegen: BASE_LIFE_REGEN,
      lifeSteal: BASE_LIFE_STEAL,
      fireDamage: BASE_ELEMENTAL_DAMAGE.fire,
      coldDamage: BASE_ELEMENTAL_DAMAGE.cold,
      airDamage: BASE_ELEMENTAL_DAMAGE.air,
      earthDamage: BASE_ELEMENTAL_DAMAGE.earth,
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
    this.stats.currentHealth = this.stats.health; // Full heal on level up

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
        this.stats.currentHealth = this.stats.health;
      }
      game.saveGame();
      return true;
    }
    return false;
  }

  getStat(stat) {
    return this.primaryStats[stat] + inventory.equipmentBonuses[stat] + (skillTree.getPathBonuses()[stat] || 0);
  }

  recalculateFromAttributes() {
    inventory.updateItemBonuses();
    shop.updateShopBonuses();

    // Calculate all attribute-based effects first
    const attributeEffects = {
      // Strength
      strDamageFlat: this.getStat('strength') * ATTRIBUTES.strength.effects.damagePerPoint,
      strDamagePercent:
        Math.floor(this.getStat('strength') / ATTRIBUTES.strength.effects.damagePercentPer.points) *
        ATTRIBUTES.strength.effects.damagePercentPer.value,

      // Agility
      agiAttackRatingFlat: this.getStat('agility') * ATTRIBUTES.agility.effects.attackRatingPerPoint,
      agiAttackRatingPercent:
        Math.floor(this.getStat('agility') / ATTRIBUTES.agility.effects.attackRatingPercentPer.points) *
        ATTRIBUTES.agility.effects.attackRatingPercentPer.value,
      agiAttackSpeed:
        Math.floor(this.getStat('agility') / ATTRIBUTES.agility.effects.attackSpeedPer.points) *
        ATTRIBUTES.agility.effects.attackSpeedPer.value,

      // Vitality
      vitHealthFlat: this.getStat('vitality') * ATTRIBUTES.vitality.effects.healthPerPoint,
      vitHealthPercent:
        Math.floor(this.getStat('vitality') / ATTRIBUTES.vitality.effects.healthPercentPer.points) *
        ATTRIBUTES.vitality.effects.healthPercentPer.value,
      vitRegenPercent:
        Math.floor(this.getStat('vitality') / ATTRIBUTES.vitality.effects.regenPercentPer.points) *
        ATTRIBUTES.vitality.effects.regenPercentPer.value,

      // Wisdom
      wisManaFlat: this.getStat('wisdom') * ATTRIBUTES.wisdom.effects.manaPerPoint,
      wisManaPercent:
        Math.floor(this.getStat('wisdom') / ATTRIBUTES.wisdom.effects.manaPercentPer.points) *
        ATTRIBUTES.wisdom.effects.manaPercentPer.value,
      wisRegenPercent:
        Math.floor(this.getStat('wisdom') / ATTRIBUTES.wisdom.effects.regenPercentPer.points) *
        ATTRIBUTES.wisdom.effects.regenPercentPer.value,

      // Endurance
      endArmorFlat: this.getStat('endurance') * ATTRIBUTES.endurance.effects.armorPerPoint,
      endArmorPercent:
        Math.floor(this.getStat('endurance') / ATTRIBUTES.endurance.effects.armorPercentPer.points) *
        ATTRIBUTES.endurance.effects.armorPercentPer.value,

      // Dexterity
      dexCritChance:
        Math.floor(this.getStat('dexterity') / ATTRIBUTES.dexterity.effects.critChancePer.points) *
        ATTRIBUTES.dexterity.effects.critChancePer.value,
      dexCritDamage:
        Math.floor(this.getStat('dexterity') / ATTRIBUTES.dexterity.effects.critDamagePer.points) *
        ATTRIBUTES.dexterity.effects.critDamagePer.value,
    };

    // Get all bonus sources
    const passiveBonuses = skillTree.calculatePassiveBonuses();
    const buffEffects = skillTree.getActiveBuffEffects();
    const pathBonuses = skillTree.getPathBonuses();

    // Calculate flat values first
    const flatValues = {
      fireDamage:
        BASE_ELEMENTAL_DAMAGE.fire +
        (passiveBonuses.fireDamage || 0) +
        (shop.shopBonuses.fireDamage || 0) +
        (inventory.equipmentBonuses.fireDamage || 0) +
        (pathBonuses.fireDamage || 0) +
        (buffEffects.fireDamage || 0),

      coldDamage:
        BASE_ELEMENTAL_DAMAGE.cold +
        (passiveBonuses.coldDamage || 0) +
        (shop.shopBonuses.coldDamage || 0) +
        (inventory.equipmentBonuses.coldDamage || 0) +
        (pathBonuses.coldDamage || 0) +
        (buffEffects.coldDamage || 0),

      airDamage:
        BASE_ELEMENTAL_DAMAGE.air +
        (passiveBonuses.airDamage || 0) +
        (shop.shopBonuses.airDamage || 0) +
        (inventory.equipmentBonuses.airDamage || 0) +
        (pathBonuses.airDamage || 0) +
        (buffEffects.airDamage || 0),

      earthDamage:
        BASE_ELEMENTAL_DAMAGE.earth +
        (passiveBonuses.earthDamage || 0) +
        (shop.shopBonuses.earthDamage || 0) +
        (inventory.equipmentBonuses.earthDamage || 0) +
        (pathBonuses.earthDamage || 0) +
        (buffEffects.earthDamage || 0),

      damage:
        BASE_DAMAGE +
        attributeEffects.strDamageFlat +
        DAMAGE_ON_LEVEL_UP * (this.level - 1) +
        (passiveBonuses.damage || 0) +
        (shop.shopBonuses.damage || 0) +
        (inventory.equipmentBonuses.damage || 0) +
        (pathBonuses.damage || 0) +
        (buffEffects.damage || 0),

      attackSpeed:
        BASE_ATTACK_SPEED +
        attributeEffects.agiAttackSpeed +
        (passiveBonuses.attackSpeed || 0) +
        (shop.shopBonuses.attackSpeed || 0) +
        (inventory.equipmentBonuses.attackSpeed || 0) +
        (pathBonuses.attackSpeed || 0) +
        (buffEffects.attackSpeed || 0),

      critChance:
        BASE_CRIT_CHANCE +
        attributeEffects.dexCritChance * 100 +
        (passiveBonuses.critChance || 0) +
        (shop.shopBonuses.critChance || 0) +
        (inventory.equipmentBonuses.critChance || 0) +
        (pathBonuses.critChance || 0) +
        (buffEffects.critChance || 0),

      critDamage:
        BASE_CRIT_DAMAGE +
        attributeEffects.dexCritDamage +
        (passiveBonuses.critDamage || 0) +
        (shop.shopBonuses.critDamage || 0) +
        (inventory.equipmentBonuses.critDamage || 0) +
        (pathBonuses.critDamage || 0) +
        (buffEffects.critDamage || 0),

      attackRating:
        BASE_ATTACK_RATING +
        attributeEffects.agiAttackRatingFlat +
        ATTACK_RATING_ON_LEVEL_UP * (this.level - 1) +
        (passiveBonuses.attackRating || 0) +
        (shop.shopBonuses.attackRating || 0) +
        (inventory.equipmentBonuses.attackRating || 0) +
        (pathBonuses.attackRating || 0) +
        (buffEffects.attackRating || 0),

      health:
        BASE_HEALTH +
        attributeEffects.vitHealthFlat +
        HEALTH_ON_LEVEL_UP * (this.level - 1) +
        (passiveBonuses.health || 0) +
        (shop.shopBonuses.health || 0) +
        (inventory.equipmentBonuses.health || 0) +
        (pathBonuses.health || 0) +
        (buffEffects.health || 0),

      maxMana:
        BASE_MANA +
        attributeEffects.wisManaFlat +
        MANA_ON_LEVEL_UP * (this.level - 1) +
        (passiveBonuses.maxMana || 0) +
        (shop.shopBonuses.maxMana || 0) +
        (inventory.equipmentBonuses.maxMana || 0) +
        (pathBonuses.maxMana || 0) +
        (buffEffects.maxMana || 0),

      armor:
        BASE_ARMOR +
        attributeEffects.endArmorFlat +
        (passiveBonuses.armor || 0) +
        (shop.shopBonuses.armor || 0) +
        (inventory.equipmentBonuses.armor || 0) +
        (pathBonuses.armor || 0) +
        (buffEffects.armor || 0),

      lifeSteal:
        BASE_LIFE_STEAL +
        (passiveBonuses.lifeSteal || 0) +
        (shop.shopBonuses.lifeSteal || 0) +
        (inventory.equipmentBonuses.lifeSteal || 0) +
        (pathBonuses.lifeSteal || 0) +
        (buffEffects.lifeSteal || 0),
    };

    // Calculate percentage bonuses
    const percentBonuses = {
      damage: attributeEffects.strDamagePercent + this.stats.damagePercent / 100 + this.souls * 0.01,
      attackRating: attributeEffects.agiAttackRatingPercent + this.stats.attackRatingPercent / 100,
      health: attributeEffects.vitHealthPercent,
      armor: attributeEffects.endArmorPercent,
    };

    // Apply percentage bonuses to final values
    this.stats.damage = Math.floor(flatValues.damage * (1 + percentBonuses.damage));
    this.stats.attackRating = Math.floor(flatValues.attackRating * (1 + percentBonuses.attackRating));
    this.stats.health = Math.floor(flatValues.health * (1 + percentBonuses.health));
    this.stats.maxMana = Math.floor(flatValues.maxMana * (1 + attributeEffects.wisManaPercent));
    this.stats.armor = Math.floor(flatValues.armor * (1 + percentBonuses.armor));

    // Elemental damages
    this.stats.fireDamage = flatValues.fireDamage;
    this.stats.coldDamage = flatValues.coldDamage;
    this.stats.airDamage = flatValues.airDamage;
    this.stats.earthDamage = flatValues.earthDamage;

    // Add souls damage bonus last
    const damageBonusFromSouls = Math.floor(this.stats.damage * (this.souls * 0.01));
    this.stats.damage += damageBonusFromSouls;

    // Set other stats that don't need percentage calculations
    this.stats.attackSpeed = Number(flatValues.attackSpeed.toFixed(2));
    this.stats.critChance = Number(flatValues.critChance.toFixed(2));
    this.stats.critDamage = Number(flatValues.critDamage.toFixed(2));
    this.stats.lifeRegen =
      (BASE_LIFE_REGEN + inventory.equipmentBonuses.lifeRegen) * (1 + attributeEffects.vitRegenPercent);
    this.stats.manaRegen =
      (BASE_MANA_REGEN + inventory.equipmentBonuses.manaRegen) * (1 + attributeEffects.wisRegenPercent);
    this.stats.lifeSteal = Number(flatValues.lifeSteal.toFixed(2));

    // Cap values
    this.stats.blockChance = Math.min(this.stats.blockChance, 75);
    this.stats.critChance = Math.min(this.stats.critChance, 100);
    this.stats.attackSpeed = Math.min(this.stats.attackSpeed, 5);

    // Update UI
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
    this.stats.currentHealth = Math.min(this.stats.health, this.stats.currentHealth + this.stats.lifeRegen);
    this.stats.currentMana = Math.min(this.stats.maxMana, this.stats.currentMana + this.stats.manaRegen);
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
    const toggleEffects = skillTree.applyToggleEffects('attack');
    if (toggleEffects.damage) {
      physicalDamage += toggleEffects.damage;
    }

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
