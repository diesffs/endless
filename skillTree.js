import { createDamageNumber } from './combat.js';
import { handleSavedData } from './functions.js';
import { game, hero } from './main.js';
import {
  showManaWarning,
  updateActionBar,
  updateEnemyHealth,
  updatePlayerHealth,
  updateSkillTreeValues,
} from './ui.js';

export const CLASS_PATHS = {
  WARRIOR: {
    name: 'Warrior',
    baseStats: {
      strength: 5,
      vitality: 3,
      armor: 10,
      maxHealth: 50,
    },
    description: 'A mighty warrior specializing in heavy armor and raw strength',
  },
  ROGUE: {
    name: 'Rogue',
    baseStats: {
      agility: 5,
      critChance: 5,
      attackSpeed: 0.1,
      damage: 5,
    },
    description: 'Swift and deadly, focusing on critical hits and attack speed',
  },
  VAMPIRE: {
    name: 'Vampire',
    baseStats: {
      lifeSteal: 5,
      critDamage: 0.3,
      attackSpeed: 0.1,
      damage: 8,
    },
    description: 'Master of life-stealing and critical strikes',
  },
  PALADIN: {
    name: 'Paladin',
    baseStats: {
      blockChance: 10,
      armor: 15,
      vitality: 4,
      maxHealth: 40,
    },
    description: 'Holy warrior specializing in defense and vitality',
  },
  BERSERKER: {
    name: 'Berserker',
    baseStats: {
      damage: 15,
      attackSpeed: 0.2,
      strength: 3,
      critChance: 3,
    },
    description: 'Frenzied fighter focusing on raw damage output',
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    baseStats: {
      fireDamage: 8,
      lightningDamage: 8,
      coldDamage: 8,
      critChance: 3,
    },
    description: 'Master of elemental damage types',
  },
};

export const SKILL_LEVEL_TIERS = [1, 10, 25, 50, 100, 200, 300, 400, 500];
export const DEFAULT_MAX_SKILL_LEVEL = 100;

export const SKILL_TREES = {
  WARRIOR: {
    // Toggle skill - costs mana per attack
    bash: {
      id: 'bash',
      name: 'Bash',
      type: 'toggle',
      manaCost: 10, // Mana cost per attack
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'war-axe',
      description: 'While active, increases damage but costs mana per attack',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 3,
      }),
    },

    // Instant active skill with cooldown
    groundSlam: {
      id: 'groundSlam',
      name: 'Ground Slam',
      type: 'instant',
      manaCost: 25,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'slam',
      description: 'Deals instant damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
      }),
    },

    // Buff skill with duration and cooldown
    battleCry: {
      id: 'battleCry',
      name: 'Battle Cry',
      type: 'buff',
      manaCost: 40,
      cooldown: 15000,
      duration: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'cry',
      description: 'Temporarily increases damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 5,
      }),
    },

    // Passive skill
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
  },
};

export const REQ_LEVEL_FOR_SKILL_TREE = 1;

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
