import { hero } from './main.js';
import { CLASS_PATHS, SKILL_TREES } from './skillTreeData.js';

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
