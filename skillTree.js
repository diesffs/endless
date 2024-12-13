import { hero } from './main.js';

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
      nightDamage: 10,
      critDamage: 0.2,
      maxHealth: 30,
    },
    description: 'Master of life-stealing and night powers',
  },
  PALADIN: {
    name: 'Paladin',
    baseStats: {
      blockChance: 10,
      armor: 15,
      holyDamage: 10,
      maxHealth: 40,
    },
    description: 'Holy warrior specializing in defense and divine power',
  },
  BERSERKER: {
    name: 'Berserker',
    baseStats: {
      damage: 15,
      attackSpeed: 0.2,
      rageDamage: 10,
      strength: 3,
    },
    description: 'Frenzied fighter that gets stronger as health decreases',
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    baseStats: {
      elementalDamage: 20,
      critChance: 3,
      spellPower: 10,
      maxHealth: 20,
    },
    description: 'Master of elemental magic and devastating spells',
  },
};

export const SKILL_TREES = {
  WARRIOR: {
    // Row 1
    bash: {
      name: 'Bash',
      row: 1,
      description: 'A powerful strike that deals extra damage',
      prerequisites: [],
      effect: (level) => ({
        damage: level * 5,
      }),
    },
    toughness: {
      name: 'Toughness',
      row: 1,
      description: 'Increases armor and health',
      prerequisites: [],
      effect: (level) => ({
        armor: level * 3,
        maxHealth: level * 10,
      }),
    },
    // Row 2 skills would require Row 1 skills
    doubleStrike: {
      name: 'Double Strike',
      row: 2,
      description: 'Attack twice in quick succession',
      prerequisites: ['bash'],
      effect: (level) => ({
        attackSpeed: level * 0.05,
        damage: level * 3,
      }),
    },
    // Add more skills...
  },
  // Add other class paths...
};

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.selectedPath = null;
    this.unlockedSkills = {};
    this.skillLevels = {};
    this.skillEffects = {};

    if (savedData) {
      this.skillPoints = savedData.skillPoints;
      this.selectedPath = savedData.selectedPath;
      this.unlockedSkills = savedData.unlockedSkills || {};
      this.skillLevels = savedData.skillLevels || {};
      this.recalculateAllSkillEffects();
    }
  }

  updateSkillBonuses() {
    // Reset hero's skill bonuses
    Object.keys(hero.skillBonuses).forEach((stat) => {
      hero.skillBonuses[stat] = 0;
    });

    // Apply all active skill effects
    Object.entries(this.skillEffects).forEach(([skillId, effects]) => {
      Object.entries(effects).forEach(([stat, value]) => {
        if (hero.skillBonuses[stat] !== undefined) {
          hero.skillBonuses[stat] += value;
        }
      });
    });
  }

  recalculateAllSkillEffects() {
    this.skillEffects = {};
    Object.entries(this.skillLevels).forEach(([skillId, level]) => {
      if (level > 0) {
        const skill = SKILL_TREES[this.selectedPath][skillId];
        this.skillEffects[skillId] = skill.effect(level);
      }
    });
  }

  addSkillPoints(points) {
    this.skillPoints += points;
  }

  selectPath(pathName) {
    if (this.selectedPath) return false;
    if (!CLASS_PATHS[pathName]) return false;

    this.selectedPath = pathName;
    // Apply base stats from the selected path
    const baseStats = CLASS_PATHS[pathName].baseStats;
    Object.entries(baseStats).forEach(([stat, value]) => {
      if (hero.stats[stat] !== undefined) {
        hero.stats[stat] += value;
      }
    });

    hero.recalculateFromAttributes();
    return true;
  }

  getSkillsForPath(pathName) {
    return SKILL_TREES[pathName] || [];
  }

  canUnlockSkill(skillId) {
    if (!this.selectedPath) return false;

    const skill = SKILL_TREES[this.selectedPath][skillId];
    if (!skill) return false;

    const currentLevel = this.skillLevels[skillId] || 0;
    const requiredPoints = skill.row === 1 ? 1 : skill.row * 2;

    return (
      this.skillPoints >= requiredPoints && currentLevel < 10 && this.arePrerequisitesMet(skill)
    );
  }

  arePrerequisitesMet(skill) {
    if (skill.row === 1) return true;

    return skill.prerequisites.some((preReqId) => {
      const preReqLevel = this.skillLevels[preReqId] || 0;
      return preReqLevel > 0;
    });
  }

  unlockSkill(skillId) {
    if (!this.canUnlockSkill(skillId)) return false;

    const skill = SKILL_TREES[this.selectedPath][skillId];
    const currentLevel = this.skillLevels[skillId] || 0;
    const requiredPoints = skill.row === 1 ? 1 : skill.row * 2;

    this.skillPoints -= requiredPoints;
    this.skillLevels[skillId] = currentLevel + 1;
    this.unlockedSkills[skillId] = true;

    // Update skill effects
    this.skillEffects[skillId] = skill.effect(currentLevel + 1);
    hero.recalculateFromAttributes();

    return true;
  }
}
