import { initializeSkillTreeStructure, updateStatsAndAttributesUI } from './ui.js';
import { game, inventory, shop, skillTree, statistics } from './globals.js';
import { updatePlayerLife } from './ui.js';
import { createCombatText } from './combat.js';
import { handleSavedData } from './functions.js';
import { ELEMENT_OPPOSITES } from './enemy.js';
import { updateRegionUI } from './region.js';
import { STATS } from './stats.js';

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
      lifePerPoint: 10,
      lifePercentPer: {
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
      critDamagePerPoint: 0.005,
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

export const STATS_ON_LEVEL_UP = 3;
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

    // persistent stats, that are not being reset (usually from elixirs, achievements, etc.)
    this.permaStats = {};
    for (const [stat, config] of Object.entries(STATS)) {
      this.permaStats[stat] = 0;
    }

    // Gets recalculated every time something changes
    this.stats = {};
    for (const [stat, config] of Object.entries(STATS)) {
      this.stats[stat] = config.base;
    }
    // Optionally, set currentLife and currentMana to their max values:
    this.stats.currentLife = this.stats.life;
    this.stats.currentMana = this.stats.mana;

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
    this.stats.currentLife = this.stats.life; // Full heal on level up
    this.stats.currentMana = this.stats.mana; // Full heal on level up

    // Add level up notification
    createCombatText(`LEVEL UP! (${this.level})`);

    skillTree.addSkillPoints(1); // Add 1 skill point per level

    updatePlayerLife();
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
        this.stats.currentLife = this.stats.life;
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
    const equipmentBonuses = inventory.equipmentBonuses;

    this.calculatePrimaryStats(skillTreeBonuses, equipmentBonuses);
    const attributeEffects = this.calculateAttributeEffects();
    const flatValues = this.calculateFlatValues(attributeEffects, skillTreeBonuses, equipmentBonuses);
    const percentBonuses = this.calculatePercentBonuses(attributeEffects, skillTreeBonuses, equipmentBonuses);

    this.applyFinalCalculations(flatValues, percentBonuses);

    updatePlayerLife();
    updateStatsAndAttributesUI();
  }

  calculatePrimaryStats(skillTreeBonuses, equipmentBonuses) {
    this.stats.strength =
      this.primaryStats.strength +
      this.permaStats.strength +
      (equipmentBonuses.strength || 0) +
      (skillTreeBonuses.strength || 0);
    this.stats.agility =
      this.primaryStats.agility +
      this.permaStats.agility +
      (equipmentBonuses.agility || 0) +
      (skillTreeBonuses.agility || 0);
    this.stats.vitality =
      this.primaryStats.vitality +
      this.permaStats.vitality +
      (equipmentBonuses.vitality || 0) +
      (skillTreeBonuses.vitality || 0);
    this.stats.wisdom =
      this.primaryStats.wisdom +
      this.permaStats.wisdom +
      (equipmentBonuses.wisdom || 0) +
      (skillTreeBonuses.wisdom || 0);
    this.stats.endurance =
      this.primaryStats.endurance +
      this.permaStats.endurance +
      (equipmentBonuses.endurance || 0) +
      (skillTreeBonuses.endurance || 0);
    this.stats.dexterity =
      this.primaryStats.dexterity +
      this.permaStats.dexterity +
      (equipmentBonuses.dexterity || 0) +
      (skillTreeBonuses.dexterity || 0);
  }

  calculateAttributeEffects() {
    const effects = {};

    // Loop through all stats in STATS
    for (const stat in STATS) {
      // Flat bonuses: look for {stat}Flat in attribute effects
      let flatBonus = 0;
      let percentBonus = 0;

      // Check each attribute for contributions to this stat
      for (const attr in ATTRIBUTES) {
        const attrEffects = ATTRIBUTES[attr].effects;

        // Flat per-point bonus (e.g., damagePerPoint, lifePerPoint, etc.)
        const flatKey = stat + 'PerPoint';
        if (flatKey in attrEffects) {
          flatBonus += (this.stats[attr] || 0) * attrEffects[flatKey];
        }

        // Percent per N points bonus (e.g., damagePercentPer, lifePercentPer, etc.)
        const percentKey = stat + 'PercentPer';
        if (percentKey in attrEffects && attrEffects[percentKey].enabled) {
          percentBonus +=
            Math.floor((this.stats[attr] || 0) / attrEffects[percentKey].points) * attrEffects[percentKey].value;
        }
      }

      // Assign to effects object
      if (flatBonus !== 0) effects[stat] = flatBonus;
      if (percentBonus !== 0) effects[stat + 'Percent'] = percentBonus;
    }

    // Special handling for critDamage, which can have both per-point and per-N-points
    if ('dexterity' in this.stats && ATTRIBUTES.dexterity?.effects?.critDamagePerPoint) {
      effects.critDamage =
        (effects.critDamage || 0) + this.stats.dexterity * ATTRIBUTES.dexterity.effects.critDamagePerPoint;
    }

    return effects;
  }

  calculateFlatValues(attributeEffects, skillTreeBonuses, equipmentBonuses) {
    const flatValues = {};

    for (const stat in STATS) {
      // Sum all sources for each stat
      flatValues[stat] =
        (this.primaryStats[stat] ?? 0) +
        (this.permaStats[stat] ?? 0) +
        (STATS[stat].base ?? 0) +
        (attributeEffects[stat] ?? 0) +
        (STATS[stat].levelUpBonus ?? 0) * (this.level - 1) +
        (shop.shopBonuses[stat] ?? 0) +
        (equipmentBonuses[stat] ?? 0) +
        (skillTreeBonuses[stat] ?? 0);
    }

    return flatValues;
  }

  calculatePercentBonuses(attributeEffects, skillTreeBonuses, equipmentBonuses) {
    const percentBonuses = {};

    for (const stat in STATS) {
      if (stat.endsWith('Percent')) {
        percentBonuses[stat] =
          (attributeEffects[stat] || 0) +
          (this.permaStats[stat] || 0) / 100 +
          (skillTreeBonuses[stat] || 0) / 100 +
          (equipmentBonuses[stat] || 0) / 100 +
          (shop.shopBonuses[stat] || 0) / 100;
      }
    }

    return percentBonuses;
  }

  applyFinalCalculations(flatValues, percentBonuses) {
    // Apply percent bonuses to all stats that have them
    for (const stat in STATS) {
      if (!stat.endsWith('Percent')) {
        // Souls bonus only applies to damage
        let percent = percentBonuses[stat + 'Percent'] || 0;
        if (stat === 'damage') percent += this.souls * 0.01;

        // Use Math.floor for integer stats, Number.toFixed for decimals
        let value = flatValues[stat];
        if (percent) value *= 1 + percent;

        // Diminishing returns for attackSpeed
        if (stat === 'attackSpeed') {
          const flatAttackSpeedBonus = flatValues.attackSpeed - STATS.attackSpeed.base;
          const maxBonus = 3;
          const scale = 7;
          value =
            STATS.attackSpeed.base +
            (flatAttackSpeedBonus > 0 ? maxBonus * (1 - Math.exp(-flatAttackSpeedBonus / scale)) : 0);
        }

        // Apply decimal places
        const decimals = STATS[stat].decimalPlaces ?? 0;
        value = decimals > 0 ? Number(value.toFixed(decimals)) : Math.floor(value);

        // Apply caps
        if (stat === 'blockChance') value = Math.min(value, 75);
        if (stat === 'critChance') value = Math.min(value, 100);
        if (stat === 'attackSpeed') value = Math.min(value, 5);

        this.stats[stat] = value;
      } else {
        // add percent bonuses to stats, mainly for elemental damage
        this.stats[stat] = percentBonuses[stat] || 0;
      }
    }
    // Special handling for elemental damages
    this.stats.fireDamage = Math.floor(
      flatValues.fireDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.fireDamagePercent)
    );
    this.stats.coldDamage = Math.floor(
      flatValues.coldDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.coldDamagePercent)
    );
    this.stats.airDamage = Math.floor(
      flatValues.airDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.airDamagePercent)
    );
    this.stats.earthDamage = Math.floor(
      flatValues.earthDamage * (1 + this.stats.elementalDamagePercent + percentBonuses.earthDamagePercent)
    );
    this.stats.reflectFireDamage = (() => {
      const base = flatValues.fireDamage + flatValues.reflectFireDamage;
      return Math.floor(base * (1 + this.stats.elementalDamagePercent + percentBonuses.fireDamagePercent));
    })();
  }

  calculateArmorReduction() {
    const armor = this.stats.armor;
    const stageScaling = 1 + (game.stage - 1) * 0.1; // Linear 10% increase per stage, matching attack rating
    const constant = 100 * stageScaling;
    const reduction = (armor / (armor + constant)) * 100;
    return Math.min(reduction, 95); // Keep the 95% cap
  }

  regenerate() {
    this.stats.currentLife = Math.min(this.stats.life, this.stats.currentLife + this.stats.lifeRegen / 10);
    this.stats.currentMana = Math.min(this.stats.mana, this.stats.currentMana + this.stats.manaRegen / 10);
    updatePlayerLife();
  }

  // calculated when hit is successful
  calculateTotalDamage(bonusDamage = 0) {
    // Hit - existing damage calculation code
    const isCritical = Math.random() * 100 < this.stats.critChance;
    // Calculate physical damage
    let physicalDamage = this.stats.damage * (1 + this.stats.damagePercent / 100);

    // Calculate elemental damage with type effectiveness
    const enemyElement = game.currentEnemy.element;

    // Calculate total damage before crit
    let totalDamage = physicalDamage + bonusDamage; // more dmg added later

    // Add toggle skill effects
    const toggleEffects = skillTree.applyToggleEffects();
    let elementalDamage = 0;

    // Calculate each element type
    const elements = {
      fire: this.stats.fireDamage,
      cold: this.stats.coldDamage,
      air: this.stats.airDamage,
      earth: this.stats.earthDamage,
    };

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

    totalDamage += elementalDamage;

    if (toggleEffects.damage) {
      totalDamage += toggleEffects.damage;
    }
    if (toggleEffects.lifePerHit) {
      game.healPlayer(toggleEffects.lifePerHit);
    }
    if (toggleEffects.manaPerHit) {
      game.restoreMana(toggleEffects.manaPerHit);
    }

    if (toggleEffects.doubleDamageChance) {
      const doubleDamageChance = Math.random() * 100;
      if (doubleDamageChance < toggleEffects.doubleDamageChance) {
        totalDamage *= 2;
      }
    }

    // Apply crit at the end to total damage
    return {
      damage: isCritical ? totalDamage * this.stats.critDamage : totalDamage,
      isCritical,
    };
  }

  calculateTotalThornsDamage(enemyDamage) {
    const damage = (this.stats.thornsDamage + enemyDamage) * (1 + this.stats.thornsDamagePercent / 100);
    return damage || 0;
  }

  willRessurect() {
    if (this.stats.resurrectionChance > 0) {
      const roll = Math.random() * 100;
      if (roll < this.stats.resurrectionChance) {
        this.stats.currentLife = this.stats.life;
        this.stats.currentMana = this.stats.mana;
        return true;
      }
    }
    return false;
  }

  calculateBlockHealing() {
    // Get evasion skill level if it exists
    const evasionSkill = skillTree.skills['evasion'];
    if (evasionSkill) {
      // Heal 5% of max life when blocking
      const healAmount = this.stats.life * 0.05;
      game.healPlayer(healAmount);
      return healAmount;
    }
    return 0;
  }
}
