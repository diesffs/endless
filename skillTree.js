import { createDamageNumber } from './combat.js';
import { game, hero } from './main.js';
import { updateEnemyHealth } from './ui.js';

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
    // Toggle skill - costs mana per attack
    bash: {
      name: 'Bash',
      type: 'toggle',
      manaCost: 10, // Mana cost per attack
      requiredLevel: 10,
      icon: 'war-axe',
      description: 'While active, increases damage but costs mana per attack',
      effect: (level) => ({
        damage: level * 3,
      }),
    },

    // Instant active skill with cooldown
    groundSlam: {
      name: 'Ground Slam',
      type: 'instant',
      manaCost: 25,
      cooldown: 5000,
      requiredLevel: 15,
      icon: 'slam',
      description: 'Deals instant area damage',
      effect: (level) => ({
        damage: level * 10,
      }),
    },

    // Buff skill with duration and cooldown
    battleCry: {
      name: 'Battle Cry',
      type: 'buff',
      manaCost: 40,
      cooldown: 15000,
      duration: 5000,
      requiredLevel: 20,
      icon: 'cry',
      description: 'Temporarily increases damage',
      effect: (level) => ({
        damage: level * 5,
      }),
    },

    // Passive skill
    toughness: {
      name: 'Toughness',
      type: 'passive',
      requiredLevel: 10,
      icon: 'shield',
      description: 'Permanently increases armor',
      effect: (level) => ({
        armor: level * 3,
      }),
    },
  },
};

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.selectedPath = null;
    this.unlockedSkills = {};
    this.skillLevels = {};
    this.skillEffects = {};
    this.activeSkillSlots = {};
    this.activeSkillStates = {}; // Tracks which skills are toggled on

    if (savedData) {
      this.skillPoints = savedData.skillPoints;
      this.selectedPath = savedData.selectedPath;
      this.unlockedSkills = savedData.unlockedSkills || {};
      this.skillLevels = savedData.skillLevels || {};
      this.skillEffects = savedData.skillEffects || {};
      this.activeSkillSlots = savedData.activeSkillSlots || {};
      this.activeSkillStates = savedData.activeSkillStates || {};
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
      if (skill && skill.type !== 'passive') {
        skillSlot.innerHTML = `<div class="skill-icon" style="background-image: url('assets/skills/${skill.icon}.png')"></div>`;

        // Add click handler for toggling
        skillSlot.addEventListener('click', () => this.toggleSkill(skillId));

        // Show active state if skill is toggled on
        if (this.activeSkillStates[skillId]) {
          skillSlot.classList.add('active');
        }
      }

      skillSlotsContainer.appendChild(skillSlot);
    });
  }

  toggleSkill(skillId) {
    if (!this.unlockedSkills[skillId]) return;

    const skill = SKILL_TREES[this.selectedPath][skillId];
    if (skill.type !== 'active' && skill.type !== 'toggle') return;

    this.activeSkillStates[skillId] = !this.activeSkillStates[skillId];

    // Update UI to show toggled state
    const skillSlot = document.querySelector(`.skill-slot[data-skill-id="${skillId}"]`);
    if (skillSlot) {
      skillSlot.classList.toggle('active', this.activeSkillStates[skillId]);
    }
  }

  activateSkill(skillId) {
    const skill = SKILL_TREES[this.selectedPath][skillId];
    const skillLevel = this.skillLevels[skillId] || 0;
    const effects = skill.effect(skillLevel);

    switch (skill.type) {
      case 'instant':
        this.handleInstantSkill(skillId, effects);
        break;
      case 'buff':
        this.handleBuffSkill(skillId, effects);
        break;
      case 'toggle':
        // Toggle skills are handled during combat
        break;
      case 'passive':
        // Passive skills are applied automatically when learned
        break;
    }
  }
  handleInstantSkill(skillId, effects) {
    if (hero.stats.currentMana >= SKILL_TREES[this.selectedPath][skillId].manaCost) {
      // Apply instant effect (like damage)
      Object.entries(effects).forEach(([stat, value]) => {
        if (stat === 'damage') {
          const damage = value * hero.calculateTotalDamage(false);
          game.currentEnemy.currentHealth -= damage;
          createDamageNumber(damage, false, false, false, false, true);
          updateEnemyHealth();
        }
      });

      hero.stats.currentMana -= SKILL_TREES[this.selectedPath][skillId].manaCost;
      updatePlayerHealth();
    }
  }

  handleBuffSkill(skillId, effects) {
    const skill = SKILL_TREES[this.selectedPath][skillId];
    if (hero.stats.currentMana >= skill.manaCost) {
      // Apply buff effects
      Object.entries(effects).forEach(([stat, value]) => {
        if (hero.skillBonuses[stat] !== undefined) {
          hero.skillBonuses[stat] += value;
        }
      });

      hero.recalculateFromAttributes();
      hero.stats.currentMana -= skill.manaCost;
      updatePlayerHealth();

      // Remove buff after duration
      setTimeout(() => {
        Object.entries(effects).forEach(([stat, value]) => {
          if (hero.skillBonuses[stat] !== undefined) {
            hero.skillBonuses[stat] -= value;
          }
        });
        hero.recalculateFromAttributes();
      }, skill.duration);
    }
  }
}
