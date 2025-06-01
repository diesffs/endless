import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../skillTree.js';

// Vampire skills extracted from skills.js
export const VAMPIRE_SKILLS = {
  // Tier 1 Skills
  bloodSiphon: {
    id: 'bloodSiphon',
    name: () => 'Blood Siphon',
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.1,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'blood',
    description: () => 'Steal life from enemies with each attack.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePerHit: level * 1,
      damage: level * 3,
    }),
  },
  nightStalker: {
    id: 'nightStalker',
    name: () => 'Night Stalker',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'moon',
    description: () => 'Increases damage at night.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 2,
      agility: level * 6,
    }),
  },

  // Tier 10 Skills
  vampiricStrike: {
    id: 'vampiricStrike',
    name: () => 'Vampiric Strike',
    type: () => 'instant',
    manaCost: (level) => 10 + level * 0.4,
    cooldown: (level) => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'bite',
    description: () => 'A powerful strike that restores life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 12,
      lifePerHit: level * 3,
    }),
  },
  darkAura: {
    id: 'darkAura',
    name: () => 'Dark Aura',
    type: () => 'buff',
    manaCost: (level) => 20 + level * 2,
    cooldown: (level) => 40000,
    duration: (level) => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'blood-aura',
    description: () => 'Increases life steal and damage temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeSteal: level * 0.05,
      damagePercent: level * 1,
    }),
  },

  // Tier 25 Skills
  drainingTouch: {
    id: 'drainingTouch',
    name: () => 'Draining Touch',
    type: () => 'instant',
    manaCost: (level) => 0 + level * 0.1,
    cooldown: (level) => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'drain',
    description: () => 'Drains life from enemies, restoring your life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: level * 30,
      manaPerHit: level * 1,
    }),
  },
  greaterBloodHunger: {
    id: 'greaterBloodHunger',
    name: () => 'Greater Blood Hunger',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'bloodlust',
    description: () => 'Increases strength and vitality.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: level * 10,
      vitality: level * 10,
    }),
  },

  // Tier 50 Skills
  crimsonBurst: {
    id: 'crimsonBurst',
    name: () => 'Crimson Burst',
    type: () => 'instant',
    manaCost: (level) => 10 + level * 0.5,
    cooldown: (level) => 2500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'burst',
    description: () => 'Unleashes a burst of crimson energy, greatly damaging the enemy at the cost of life.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 100,
      lifePerHit: level * -5,
    }),
  },

  // Tier 75 Skills
  bloodPact: {
    id: 'bloodPact',
    name: () => 'Blood Pact',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.2,
    cooldown: (level) => 60000,
    duration: (level) => 120000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pact',
    description: () => 'Increases life steal and life temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: level * 4,
    }),
  },

  // Tier 100 Skills
  eternalThirst: {
    id: 'eternalThirst',
    name: () => 'Eternal Thirst',
    type: () => 'toggle',
    manaCost: (level) => 5 + level * 1,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'thirst',
    description: () => 'Increases life steal and damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 25,
      lifePerHit: level * 10,
    }),
  },
  deathlyPresence: {
    id: 'deathlyPresence',
    name: () => 'Deathly Presence',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'presence',
    description: () => 'Increases life greatly, and strength mildly.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: level * 1,
      strengthPercent: level * 1,
      vitalityPercent: level * 1,
    }),
  },

  // Tier 200 Skills
  lordOfNight: {
    id: 'lordOfNight',
    name: () => 'Lord of Night',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'lord',
    description: () => 'Greatly increases all attributes and gives resurrection.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strengthPercent: level * 3,
      vitalityPercent: level * 2,
      resurrectionChance: level * 0.4,
      wisdom: level * 10,
      wisdomPercent: level * 2,
    }),
  },
};
