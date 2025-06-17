import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Rogue skills extracted from skills.js
export const ROGUE_SKILLS = {
  // Tier 0 Skills
  shadowDance: {
    id: 'shadowDance',
    name: () => 'Shadow Dance',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dagger',
    description: () => 'A quick dance from the shadows, increasing your damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 1,
      critChance: level * 0.05,
      agility: level * 2,
    }),
  },
  evasion: {
    id: 'evasion',
    name: () => 'Evasion',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'dodge',
    description: () => `
        Increases armor and block chance. 
        Additionally, when blocking, you also recover life equal to 1% of your maximum life.
        `,
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      blockChance: level * 0.1,
      armor: level * 10,
    }),
  },

  // Tier 1 Skills
  poisonDagger: {
    id: 'poisonDagger',
    name: () => 'Poison Dagger',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.2,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'poison',
    description: () => 'Applies physical damage to your attacks.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 5,
    }),
  },
  shadowForm: {
    id: 'shadowForm',
    name: () => 'Shadow Form',
    type: () => 'buff',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: (level) => 60000,
    duration: (level) => 45000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'stealth',
    description: () => 'Shadow form increases crit chance, life steal and dexterity (crit damage).',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      critChance: level * 0.05,
      lifeSteal: level * 0.01,
      dexterity: level * 3,
    }),
  },

  // Tier 2 Skills
  flurry: {
    id: 'flurry',
    name: () => 'Flurry',
    type: () => 'instant',
    manaCost: (level) => 5 + level * 0.5,
    cooldown: (level) => 2000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'flurry',
    description: () => 'Unleash a series of rapid attacks, dealing bonus damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 15,
    }),
  },
  precision: {
    id: 'precision',
    name: () => 'Precision',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'agility',
    description: () => 'Significantly increases agility.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      agility: level * 15,
    }),
  },

  // Tier 3 Skills
  backstab: {
    id: 'backstab',
    name: () => 'Backstab',
    type: () => 'instant',
    manaCost: (level) => 5,
    cooldown: (level) => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'backstab',
    description: () => 'A devastating attack from behind, dealing massive damage and stealing resources.',
    maxLevel: () => 100,
    effect: (level) => ({
      damage: level * 6,
      lifePerHit: level * 2,
      manaPerHit: level * 1,
    }),
  },

  // Tier 4 Skills
  darkPact: {
    id: 'darkPact',
    name: () => 'Dark Pact',
    type: () => 'buff',
    manaCost: (level) => 14 + level * 0.3,
    cooldown: (level) => 30000,
    duration: (level) => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'dark-pact',
    description: () => 'Massively increases crit damage temporarily.',
    maxLevel: () => 500,
    effect: (level) => ({
      critDamage: level * 0.005,
    }),
  },

  // Tier 5 Skills
  assassination: {
    id: 'assassination',
    name: () => 'Assassination',
    type: () => 'toggle',
    manaCost: (level) => 2 + level * 0.4,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'assassination',
    description: () => 'Greatly increases damage',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 5,
      coldDamage: level * 10,
      airDamage: level * 10,
    }),
  },

  deadlyPrecision: {
    id: 'deadlyPrecision',
    name: () => 'Deadly Precision',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'precision',
    description: () => 'Permanently increases crit chance and crit damage.',
    maxLevel: () => 1000,
    effect: (level) => ({
      critChance: level * 0.05,
      critDamage: level * 0.01,
      attackRating: level * 40,
      attackRatingPercent: level * 1,
    }),
  },

  // Tier 6 Skills
  masterThief: {
    id: 'masterThief',
    name: () => 'Master Thief',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'master',
    description: () => 'Greatly increases attributes and gold gains.',
    maxLevel: () => 500,
    effect: (level) => ({
      damagePercent: level * 0.3,
      dexterity: level * 5,
      strength: level * 10,
      wisdom: level * 3,
      bonusGoldPercent: level * 0.5,
    }),
  },
};
