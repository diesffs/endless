import { hero } from './main.js';

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.unlockedSkills = new Set();

    // Define skill tree structure
    this.skills = {
      
    };

    if (savedData) {
      Object.keys(this).forEach((key) => {
        if (savedData.hasOwnProperty(key)) {
          if (typeof this[key] === 'object' && !Array.isArray(this[key])) {
            this[key] = { ...this[key], ...savedData[key] };
          } else {
            this[key] = savedData[key];
          }
        }
      });
    }
  }

  addSkillPoints(points) {
    this.skillPoints += points;
  }

  canUnlockSkill(skillId) {
    const skill = this.skills[skillId];
    if (!skill) return false;

    return (
      this.skillPoints >= skill.cost &&
      skill.currentLevel < skill.maxLevel &&
      (!skill.requires || this.unlockedSkills.has(skill.requires))
    );
  }

  unlockSkill(skillId) {
    if (!this.canUnlockSkill(skillId)) return false;

    const skill = this.skills[skillId];
    skill.currentLevel++;
    this.skillPoints -= skill.cost;
    this.unlockedSkills.add(skillId);

    // Apply skill effects
    const effects = skill.effect(skill.currentLevel);
    this.applySkillEffects(effects);

    return true;
  }

  applySkillEffects(effects) {
    // Apply effects to hero stats
    Object.entries(effects).forEach(([stat, value]) => {
      if (hero.stats[stat] !== undefined) {
        hero.stats[stat] += value;
      } else if (hero.primaryStats[stat] !== undefined) {
        hero.primaryStats[stat] += value;
      }
    });

    hero.recalculateFromAttributes();
  }
}
