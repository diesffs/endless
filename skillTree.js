import { createDamageNumber } from './combat.js';
import { handleSavedData } from './functions.js';
import { game, hero } from './main.js';
import {
  showManaWarning,
  showToast,
  updateActionBar,
  updateEnemyHealth,
  updatePlayerHealth,
  updateSkillTreeValues,
} from './ui.js';

export const SKILL_LEVEL_TIERS = [1, 10, 25, 50, 75, 100, 200];
export const DEFAULT_MAX_SKILL_LEVEL = 100;
export const REQ_LEVEL_FOR_SKILL_TREE = 10;

export const CLASS_PATHS = {
  WARRIOR: {
    name: 'Warrior',
    baseStats: {
      strength: 15,
      vitality: 10,
      armor: 50,
      health: 200,
    },
    description: 'A mighty warrior specializing in heavy armor and raw strength',
  },
  ROGUE: {
    name: 'Rogue',
    baseStats: {
      agility: 25,
      critChance: 5,
      attackSpeed: 0.3,
      damage: 30,
    },
    description: 'Swift and deadly, focusing on critical hits and attack speed',
  },
  VAMPIRE: {
    name: 'Vampire',
    baseStats: {
      lifeSteal: 3,
      critDamage: 0.5,
      attackSpeed: 0.2,
      damage: 25,
    },
    description: 'Master of life-stealing and critical strikes',
  },
  PALADIN: {
    name: 'Paladin',
    baseStats: {
      blockChance: 10,
      armor: 100,
      vitality: 30,
      health: 300,
    },
    description: 'Holy warrior specializing in defense and vitality',
  },
  BERSERKER: {
    name: 'Berserker',
    baseStats: {
      damage: 45,
      attackSpeed: 0.3,
      strength: 15,
      critChance: 5,
    },
    description: 'Frenzied fighter focusing on raw damage output',
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    baseStats: {
      fireDamage: 40,
      airDamage: 40,
      coldDamage: 40,
      earthDamage: 40,
    },
    description: 'Master of elemental damage types',
  },
};

export const SKILL_TREES = {
  WARRIOR: {
    // Level 1 Skills
    bash: {
      id: 'bash',
      name: 'Bash',
      type: 'toggle',
      manaCost: 10,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'war-axe',
      description: 'While active, increases damage but costs mana per attack',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 3,
      }),
    },
    toughness: {
      id: 'toughness',
      name: 'Toughness',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'shield',
      description: 'Permanently increases armor',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 3,
      }),
    },

    experienceBoost: {
      id: 'experienceBoost',
      name: 'Experience Boost',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'book',
      description: 'Increases experience gained from battles',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        expBonus: level * 5,
      }),
    },

    // Level 10 Skills
    powerStrike: {
      id: 'powerStrike',
      name: 'Power Strike',
      type: 'instant',
      manaCost: 20,
      cooldown: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'sword',
      description: 'A powerful strike that deals increased damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 12,
      }),
    },
    ironWill: {
      id: 'ironWill',
      name: 'Iron Will',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'helmet',
      description: 'Increases resistance to damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 0.5,
        vitality: level * 0.5,
      }),
    },

    // Level 25 Skills
    battleCry: {
      id: 'battleCry',
      name: 'Battle Cry',
      type: 'buff',
      manaCost: 40,
      cooldown: 15000,
      duration: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'cry',
      description: 'Temporarily increases damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 5,
      }),
    },
    fortitude: {
      id: 'fortitude',
      name: 'Fortitude',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'armor',
      description: 'Increases health regeneration',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        healthRegen: level * 0.5,
      }),
    },

    // Level 50 Skills
    groundSlam: {
      id: 'groundSlam',
      name: 'Ground Slam',
      type: 'instant',
      manaCost: 25,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'slam',
      description: 'Deals instant damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
      }),
    },
    goldRush: {
      id: 'goldRush',
      name: 'Gold Rush',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'coin',
      description: 'Increases gold gained from battles by %',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        goldBonus: level * 25,
      }),
    },

    // Level 75 Skills
    shieldWall: {
      id: 'shieldWall',
      name: 'Shield Wall',
      type: 'buff',
      manaCost: 50,
      cooldown: 20000,
      duration: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'wall',
      description: 'Increases armor and block chance temporarily',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 5,
        blockChance: level * 2,
      }),
    },

    // Level 100 Skills
    berserk: {
      id: 'berserk',
      name: 'Berserk',
      type: 'toggle',
      manaCost: 30,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'berserk',
      description: 'Increases attack speed and damage at the cost of defense',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        attackSpeed: level * 0.05,
        damage: level * 4,
        armor: -level * 1,
      }),
    },

    lastStand: {
      id: 'lastStand',
      name: 'Last Stand',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'last-stand',
      description: 'Greatly increases damage, life steal, and attack speed',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
        lifeSteal: level * 0.1,
        attackSpeed: level * 0.1,
      }),
    },

    // Level 200 Skills
    warlord: {
      id: 'warlord',
      name: 'Warlord',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'warlord',
      description: 'Increases all attributes significantly',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        strength: level * 10,
        vitality: level * 10,
        agility: level * 10,
        wisdom: level * 10,
        endurance: level * 10,
        dexterity: level * 10,
      }),
    },
  },

  ROGUE: {
    // Example skills for Rogue
    shadowStrike: {
      id: 'shadowStrike',
      name: 'Shadow Strike',
      type: 'instant',
      manaCost: 15,
      cooldown: 4000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'dagger',
      description: 'A quick strike from the shadows, dealing extra damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 8,
      }),
    },
    evasion: {
      id: 'evasion',
      name: 'Evasion',
      type: 'buff',
      manaCost: 20,
      cooldown: 12000,
      duration: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'dodge',
      description: 'Increases dodge chance temporarily',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        dodgeChance: level * 2,
      }),
    },
    // Add more Rogue skills...
  },
  VAMPIRE: {
    // Example skills for Vampire
    bloodSiphon: {
      id: 'bloodSiphon',
      name: 'Blood Siphon',
      type: 'toggle',
      manaCost: 5,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'blood',
      description: 'Steal life from enemies with each attack',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 1.5,
      }),
    },
    nightStalker: {
      id: 'nightStalker',
      name: 'Night Stalker',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'moon',
      description: 'Increases damage at night',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 2,
      }),
    },
    // Add more Vampire skills...
  },
  PALADIN: {
    // Example skills for Paladin
    holyShield: {
      id: 'holyShield',
      name: 'Holy Shield',
      type: 'buff',
      manaCost: 30,
      cooldown: 10000,
      duration: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'shield',
      description: 'Increases armor and block chance',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 4,
        blockChance: level * 1.5,
      }),
    },
    smite: {
      id: 'smite',
      name: 'Smite',
      type: 'instant',
      manaCost: 20,
      cooldown: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'hammer',
      description: 'Deals holy damage to an enemy',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 12,
      }),
    },
    // Add more Paladin skills...
  },
  BERSERKER: {
    // Example skills for Berserker
    frenzy: {
      id: 'frenzy',
      name: 'Frenzy',
      type: 'toggle',
      manaCost: 10,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'rage',
      description: 'Increases attack speed and damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        attackSpeed: level * 0.05,
        damage: level * 3,
      }),
    },
    warCry: {
      id: 'warCry',
      name: 'War Cry',
      type: 'buff',
      manaCost: 25,
      cooldown: 15000,
      duration: 7000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'shout',
      description: 'Boosts morale, increasing damage for a short time',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 4,
      }),
    },
    // Add more Berserker skills...
  },
  ELEMENTALIST: {
    // Example skills for Elementalist
    fireball: {
      id: 'fireball',
      name: 'Fireball',
      type: 'instant',
      manaCost: 20,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'fire',
      description: 'Launches a fireball that deals fire damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamage: level * 10,
      }),
    },
    iceArmor: {
      id: 'iceArmor',
      name: 'Ice Armor',
      type: 'buff',
      manaCost: 30,
      cooldown: 12000,
      duration: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'ice',
      description: 'Encases the caster in ice, increasing armor',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 5,
      }),
    },
    // Add more Elementalist skills...
  },
};

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.selectedPath = null;
    this.skills = {};

    handleSavedData(savedData, this);
    // always empty at start
    this.activeBuffs = new Map();
  }

  getPathBonuses() {
    return CLASS_PATHS[this.selectedPath?.name]?.baseStats || {};
  }

  getAllSkillTreeBonuses() {
    const pathBonuses = this.getPathBonuses();
    const passiveBonuses = this.calculatePassiveBonuses();
    const activeBuffEffects = this.getActiveBuffEffects();

    const allBonuses = {};

    // Combine path bonuses
    Object.entries(pathBonuses).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    // Combine passive bonuses
    Object.entries(passiveBonuses).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    // Combine active buff effects
    Object.entries(activeBuffEffects).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    return allBonuses;
  }

  calculatePassiveBonuses() {
    const bonuses = {};
    // Add skill bonuses
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name][skillId];
      if (skill.type === 'passive') {
        const effects = skill.effect(skillData.level);
        Object.entries(effects).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
      }
    });

    return bonuses;
  }

  calculateActiveSkillEffects() {
    const effects = {};

    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name][skillId];
      if (skill.type === 'toggle' && this.isSkillActive(skillId)) {
        const skillEffects = skill.effect(skillData.level);
        Object.entries(skillEffects).forEach(([stat, value]) => {
          effects[stat] = (effects[stat] || 0) + value;
        });
      }
    });

    return effects;
  }

  isSkillActive(skillId) {
    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    return skill && (skill.type === 'toggle' || skill.type === 'buff') && this.skills[skillId]?.active;
  }

  addSkillPoints(points) {
    this.skillPoints += points;
    updateSkillTreeValues();
  }

  selectPath(pathName) {
    if (this.selectedPath) return false;
    if (!CLASS_PATHS[pathName]) return false;
    if (hero.level < REQ_LEVEL_FOR_SKILL_TREE) {
      showToast(`Reach level ${REQ_LEVEL_FOR_SKILL_TREE} to select a class path!`, 'warning');
      return false;
    }

    this.selectedPath = {
      name: pathName,
      baseStats: CLASS_PATHS[pathName].baseStats,
    };
    hero.recalculateFromAttributes();
    game.saveGame();
    return true;
  }

  getSkillsForPath(pathName) {
    return SKILL_TREES[pathName] || [];
  }

  canUnlockSkill(skillId) {
    if (!this.selectedPath) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    if (!skill) return false;

    const currentLevel = this.skills[skillId]?.level || 0;
    return this.skillPoints >= 1 && currentLevel < 10 && hero.level >= skill.requiredLevel;
  }

  arePrerequisitesMet(skill) {
    if (skill.row === 1) return true;

    return skill.prerequisites.some((preReqId) => {
      const preReqLevel = this.skills[preReqId]?.level || 0;
      return preReqLevel > 0;
    });
  }

  unlockSkill(skillId) {
    if (!this.canUnlockSkill(skillId)) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const currentLevel = this.skills[skillId]?.level || 0;
    const nextLevel = currentLevel + 1;

    this.skills[skillId] = {
      ...skill,
      level: nextLevel,
      effect: skill.effect(nextLevel),
      active: false,
      slot: skill.type !== 'passive' ? Object.keys(this.skills).length + 1 : null,
    };

    this.skillPoints -= 1;
    hero.recalculateFromAttributes();

    if (skill.type !== 'passive') {
      updateActionBar();
    }

    // Trigger tooltip update
    updateSkillTreeValues(); // Ensure this function updates the tooltip content

    return true;
  }

  toggleSkill(skillId) {
    if (!this.skills[skillId]) return;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];

    // Handle different skill types
    switch (skill.type) {
      case 'buff':
        this.activateSkill(skillId);
        break;
      case 'toggle':
        this.skills[skillId].active = !this.skills[skillId].active;
        hero.recalculateFromAttributes();
        break;
      case 'instant':
        this.useInstantSkill(skillId);
        break;
    }

    updateActionBar();
  }

  useInstantSkill(skillId) {
    if (!game.gameStarted) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const skillData = this.skills[skillId];

    if (hero.stats.currentMana < skill.manaCost) {
      showManaWarning();
      return false;
    }

    if (skillData.cooldownEndTime && skillData.cooldownEndTime > Date.now()) return false;

    // Apply instant effect
    hero.stats.currentMana -= skill.manaCost;
    const damage = this.calculateInstantDamage(skillId);
    game.currentEnemy.currentHealth -= damage;

    // Set cooldown
    skillData.cooldownEndTime = Date.now() + skill.cooldown;

    // Update UI
    updateEnemyHealth();
    updatePlayerHealth();
    createDamageNumber(damage, false, false, false, false, true); // Add parameter for instant skill visual

    return true;
  }

  calculateInstantDamage(skillId) {
    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const skillData = this.skills[skillId];
    const baseEffect = skill.effect(skillData.level);

    // Scale with hero's damage bonuses
    return baseEffect.damage * (1 + hero.stats.damagePercent / 100);
  }

  applyToggleEffects(type = 'attack') {
    let effects = {};

    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name][skillId];
      if (skill.type === 'toggle' && skillData.active) {
        if (hero.stats.currentMana >= skill.manaCost) {
          hero.stats.currentMana -= skill.manaCost;
          effects = { ...effects, ...skill.effect(skillData.level) };
        } else {
          showManaWarning();
          // Deactivate if not enough mana
          skillData.active = false;
          updateActionBar();
        }
      }
    });

    return effects;
  }

  activateSkill(skillId) {
    if (!game.gameStarted) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const skillData = this.skills[skillId];

    if (skill.type !== 'buff') return false;
    if (hero.stats.currentMana < skill.manaCost) {
      showManaWarning();
      return false;
    }

    // Check if skill is on cooldown
    if (skillData.cooldownEndTime && skillData.cooldownEndTime > Date.now()) return false;

    // Apply buff
    hero.stats.currentMana -= skill.manaCost;
    const buffEndTime = Date.now() + skill.duration;
    const cooldownEndTime = Date.now() + skill.cooldown;

    // Store buff data
    this.activeBuffs.set(skillId, {
      endTime: buffEndTime,
      effects: skill.effect(skillData.level),
    });

    // Set cooldown and active state
    this.skills[skillId].cooldownEndTime = cooldownEndTime;
    this.skills[skillId].active = true;

    // Apply buff effects
    hero.recalculateFromAttributes();
    updateActionBar();

    return true;
  }

  deactivateSkill(skillId) {
    if (this.activeBuffs.has(skillId)) {
      this.activeBuffs.delete(skillId);
      // Reset the active state when buff expires
      if (this.skills[skillId]) {
        this.skills[skillId].active = false;
      }
      hero.recalculateFromAttributes();
      updateActionBar(); // Update UI to reflect deactivated state
    }
  }

  getActiveBuffEffects() {
    const effects = {};

    this.activeBuffs.forEach((buffData, skillId) => {
      if (buffData.endTime <= Date.now()) {
        this.deactivateSkill(skillId);
        return;
      }

      Object.entries(buffData.effects).forEach(([stat, value]) => {
        effects[stat] = (effects[stat] || 0) + value;
      });
    });

    return effects;
  }

  stopAllBuffs() {
    this.activeBuffs.clear();
    Object.values(this.skills).forEach((skill) => {
      if (skill.cooldownEndTime) {
        skill.cooldownEndTime = 0;
      }
      skill.active = false; // Reset active state
    });
    hero.recalculateFromAttributes();
    updateActionBar(); // Update UI to reset all visual states
  }
}
