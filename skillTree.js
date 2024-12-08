import { hero } from './main';

export default class SkillTree {
  constructor() {
    this.skillPoints = 0;
    this.unlockedSkills = new Set();

    // Define skill tree structure
    this.skills = {
      // Strength Path
      strengthMastery: {
        id: 'strengthMastery',
        name: 'Strength Mastery',
        maxLevel: 5,
        currentLevel: 0,
        path: 'strength',
        cost: 1,
        effect: (level) => ({
          strength: level * 2,
          damage: level * 5,
        }),
        requires: null,
      },

      // Agility Path
      agilityMastery: {
        id: 'agilityMastery',
        name: 'Agility Mastery',
        maxLevel: 5,
        currentLevel: 0,
        path: 'agility',
        cost: 1,
        effect: (level) => ({
          agility: level * 2,
          attackSpeed: level * 0.02,
        }),
        requires: null,
      },

      // Vitality Path
      vitalityMastery: {
        id: 'vitalityMastery',
        name: 'Vitality Mastery',
        maxLevel: 5,
        currentLevel: 0,
        path: 'vitality',
        cost: 1,
        effect: (level) => ({
          vitality: level * 2,
          maxHealth: level * 20,
        }),
        requires: null,
      },
    };
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

  // For loading saved data
  loadSkillTree(savedData) {
    if (!savedData) return;

    this.skillPoints = savedData.skillPoints;
    this.unlockedSkills = new Set(savedData.unlockedSkills);

    Object.entries(savedData.skills).forEach(([skillId, data]) => {
      if (this.skills[skillId]) {
        this.skills[skillId].currentLevel = data.currentLevel;
      }
    });
  }

  // For saving data
  getSaveData() {
    return {
      skillPoints: this.skillPoints,
      unlockedSkills: Array.from(this.unlockedSkills),
      skills: Object.fromEntries(
        Object.entries(this.skills).map(([id, skill]) => [
          id,
          { currentLevel: skill.current + Level },
        ])
      ),
    };
  }
}
