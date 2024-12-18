import { game, hero } from './main.js';

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

export const SKILL_LEVEL_TIERS = [10, 25, 50, 100, 200, 300, 400, 500];

export const SKILL_TREES = {
  WARRIOR: {
    bash: {
      name: 'Bash',
      type: 'active',
      requiredLevel: 10,
      icon: 'war-axe',
      description: 'A powerful strike that deals extra damage',
      effect: (level) => ({
        damage: level * 5,
      }),
    },
    toughness: {
      name: 'Toughness',
      type: 'passive',
      requiredLevel: 10,
      icon: 'aura',
      description: 'Increases armor and health',
      effect: (level) => ({
        armor: level * 3,
        maxHealth: level * 10,
      }),
    },
    doubleStrike: {
      name: 'Double Strike',
      type: 'active',
      requiredLevel: 50,
      icon: 'double-strike',
      description: 'Attack twice in quick succession',
      effect: (level) => ({
        attackSpeed: level * 0.05,
        damage: level * 3,
      }),
    },
    // Add more skills with their required levels...
  },
  // Other class paths...
};

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.selectedPath = null;
    this.unlockedSkills = {};
    this.skillLevels = {};
    this.skillEffects = {};
    this.activeSkillSlots = {};

    if (savedData) {
      this.skillPoints = savedData.skillPoints;
      this.selectedPath = savedData.selectedPath;
      this.unlockedSkills = savedData.unlockedSkills || {};
      this.skillLevels = savedData.skillLevels || {};
      this.skillEffects = savedData.skillEffects || {};
      this.activeSkillSlots = savedData.activeSkillSlots || {};
    }
    this.updateActionBar();
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
    const baseStats = CLASS_PATHS[pathName].baseStats;

    Object.entries(baseStats).forEach(([stat, value]) => {
      hero.pathBonuses[stat] += value;
    });

    hero.recalculateFromAttributes();

    game.saveGame();
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
    return this.skillPoints >= 1 && currentLevel < 10 && hero.level >= skill.requiredLevel;
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

    if (skill.type === 'active') {
      const nextSlot = Object.keys(this.activeSkillSlots).length + 1;
      this.activeSkillSlots[nextSlot] = skillId;
      this.updateActionBar();
    }

    this.skillPoints -= requiredPoints;
    this.skillLevels[skillId] = currentLevel + 1;
    this.unlockedSkills[skillId] = true;

    // Update skill effects
    this.skillEffects[skillId] = skill.effect(currentLevel + 1);
    hero.recalculateFromAttributes();

    return true;
  }

  updateActionBar() {
    const skillSlotsContainer = document.querySelector('.skill-slots');
    if (!skillSlotsContainer) return;

    skillSlotsContainer.innerHTML = '';
    Object.entries(this.activeSkillSlots).forEach(([slot, skillId]) => {
      const skillSlot = document.createElement('div');
      skillSlot.className = 'skill-slot';
      skillSlot.dataset.key = slot;
      skillSlot.dataset.skillId = skillId;

      const skill = SKILL_TREES[this.selectedPath][skillId];
      const html = String.raw;
      if (skill) {
        skillSlot.innerHTML = html`<div
          class="skill-icon"
          style="background-image: url('assets/skills/${skill.icon}.png')"
        ></div>`;
      }

      skillSlotsContainer.appendChild(skillSlot);
    });
  }
}
