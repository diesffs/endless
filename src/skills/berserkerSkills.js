import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../skillTree.js';

// Berserker skills extracted from skills.js
export const BERSERKER_SKILLS = {
  // Tier 1 Skills
  frenzy: {
    id: 'frenzy',
    name: () => 'Frenzy',
    type: () => 'toggle',
    manaCost: (level) => 3 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frenzy',
    description: () => 'Increases attack speed and damage while active.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 12,
      lifePerHit: level * -1,
    }),
  },
  toughSkin: {
    id: 'toughSkin',
    name: () => 'Tough Skin',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'tough-skin',
    description: () => 'Increases armor and reduces damage taken.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 18,
      armorPercent: level * 2,
    }),
  },

  // Tier 10 Skills
  recklessSwing: {
    id: 'recklessSwing',
    name: () => 'Reckless Swing',
    type: () => 'instant',
    manaCost: (level) => 6 + level * 0.1,
    cooldown: (level) => 1000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'swing',
    description: () => 'A powerful strike that sacrifices life for damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 100,
      lifePerHit: level * -7.5,
    }),
  },
  battleCry: {
    id: 'battleCry',
    name: () => 'Battle Cry',
    type: () => 'buff',
    manaCost: (level) => 8 + level * 0.2,
    cooldown: (level) => 12000,
    duration: (level) => 6000 + level * 500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'battle-cry',
    description: () => 'Boosts damage and attack speed temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damagePercent: level * 0.5,
      attackSpeed: level * 0.01,
      lifeSteal: level * 0.01,
    }),
  },

  // Tier 25 Skills
  berserkersRage: {
    id: 'berserkersRage',
    name: () => `Berserker's Rage`,
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'berserker-rage',
    description: () => 'Greatly increases damage but lowers defense.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: level * 30,
      airDamage: level * 30,
      doubleDamageChance: level * 0.2,
    }),
  },
  greaterFrenzy: {
    id: 'greaterFrenzy',
    name: () => 'Greater Frenzy',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'greater-rage',
    description: () => 'Further enhances attack speed and damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: level * 0.01,
      lifePerHit: level * 5,
    }),
  },

  // Tier 50 Skills
  earthquake: {
    id: 'earthquake',
    name: () => 'Earthquake',
    type: () => 'instant',
    manaCost: (level) => 14 + level * 0.3,
    cooldown: (level) => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'earthquake',
    description: () => 'Smashes the ground, dealing earth damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 30,
      earthDamage: level * 150,
    }),
  },
  rageMastery: {
    id: 'rageMastery',
    name: () => 'Rage Mastery',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'mastery',
    description: () => 'Increases critical chance and critical damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: level * 0.1,
      critDamage: level * 0.01,
      doubleDamageChance: level * 0.1,
      attackRating: level * 300,
    }),
  },

  // Tier 75 Skills
  bloodLust: {
    id: 'bloodLust',
    name: () => 'Blood Lust',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.25,
    cooldown: (level) => 20000,
    duration: (level) => 20000 + level * 300,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'bloodlust',
    description: () => 'Increases attack speed and life steal temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackSpeed: level * 0.01,
      lifeSteal: level * 0.02,
      lifePercent: level * 3,
    }),
  },

  // Tier 100 Skills
  unbridledFury: {
    id: 'unbridledFury',
    name: () => 'Unbridled Fury',
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'fury',
    description: () => 'Increases damage and restores resources.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 20,
      manaPerHit: level * 0.4,
      lifePerHit: level * 8,
    }),
  },
  undyingRage: {
    id: 'undyingRage',
    name: () => 'Undying Rage',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'undying',
    description: () => 'Provides a chance to survive fatal damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: level * 0.25,
      lifeRegen: level * 10,
    }),
  },

  // Tier 200 Skills
  warlord: {
    id: 'warlord',
    name: () => 'Warlord',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'warlord',
    description: () => 'Significantly increases all combat stats.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: level * 10,
      strengthPercent: level * 2,
      critChance: level * 0.2,
      attackSpeed: level * 0.01,
      damage: level * 10,
    }),
  },
};
