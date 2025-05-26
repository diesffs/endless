import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../skillTree.js';

// Elementalist skills extracted from skills.js
export const ELEMENTALIST_SKILLS = {
  // Tier 1 Skills
  fireball: {
    id: 'fireball',
    name: () => 'Fireball',
    type: () => 'instant',
    manaCost: (level) => Math.round(10 * Math.pow(1.18, level - 1)),
    cooldown: (level) => 800,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'fireball',
    description: () => 'Launches a fireball that deals fire damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: level * 50,
    }),
  },
  frostArmor: {
    id: 'frostArmor',
    name: () => 'Frost Armor',
    type: () => 'buff',
    manaCost: (level) => Math.round(30 * Math.pow(1.18, level - 1)),
    cooldown: (level) => 8000,
    duration: (level) => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frost-armor',
    description: () => 'Encases the caster in frost, increasing armor.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 50,
    }),
  },

  warmth: {
    id: 'warmth',
    name: () => 'Warmth',
    type: () => 'passive',
    cooldown: (level) => 8000,
    duration: (level) => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'storm',
    description: () => 'Increases mana and mana regeneration',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: level * 10,
      manaRegen: level * 0.5,
      wisdom: level * 2,
    }),
  },

  // Tier 10 Skills
  lightningStrike: {
    id: 'lightningStrike',
    name: () => 'Lightning Strike',
    type: () => 'instant',
    manaCost: (level) => Math.round(25 * Math.pow(1.18, level - 1)),
    cooldown: (level) => 1500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'lightning',
    description: () => 'Strikes an enemy with a bolt of lightning.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      airDamage: level * 86,
    }),
  },
  elementalMastery: {
    id: 'elementalMastery',
    name: () => 'Elemental Mastery',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'elemental-mastery',
    description: () => 'Increases all elemental damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: level * 2,
    }),
  },

  // Tier 25 Skills
  blizzard: {
    id: 'blizzard',
    name: () => 'Blizzard',
    type: () => 'buff',
    manaCost: (level) => Math.round(40 * Math.pow(1.18, level - 1)),
    cooldown: (level) => 15000,
    duration: (level) => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'blizzard',
    description: () => 'Summons a blizzard, covering the battlefield in frost.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: level * 8,
      airDamagePercent: level * 8,
    }),
  },
  arcaneWisdom: {
    id: 'arcaneWisdom',
    name: () => 'Arcane Wisdom',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'wisdom',
    description: () => 'Increases mana and mana regeneration.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaPercent: level * 1,
      manaRegen: level * 1,
    }),
  },

  // Tier 50 Skills
  elementalStorm: {
    id: 'elementalStorm',
    name: () => 'Elemental Storm',
    type: () => 'instant',
    manaCost: (level) => 60,
    cooldown: (level) => 2000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'storm',
    description: () => 'Unleashes a storm of fire, ice, and lightning.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: level * 12,
      coldDamage: level * 12,
      airDamage: level * 12,
    }),
  },
  elementalAffinity: {
    id: 'elementalAffinity',
    name: () => 'Elemental Affinity',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'affinity',
    description: () => 'Increases resistance to elemental damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: level * 4,
      coldDamagePercent: level * 4,
      airDamagePercent: level * 4,
    }),
  },

  // Tier 75 Skills
  arcanePulse: {
    id: 'arcanePulse',
    name: () => 'Arcane Pulse',
    type: () => 'buff',
    manaCost: (level) => 70,
    cooldown: (level) => 30000,
    duration: (level) => 60000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pulse',
    description: () => 'Increases buffs duration and reduces cooldowns temporarily.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      cooldownReductionPercent: level * 5,
      buffDurationPercent: level * 5,
    }),
  },

  // Tier 100 Skills
  elementalOverload: {
    id: 'elementalOverload',
    name: () => 'Elemental Overload',
    type: () => 'toggle',
    manaCost: (level) => 0,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'overload',
    description: () => 'Boosts all elemental damage at the cost of mana regeneration.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaPerHit: level * 25,
    }),
  },
  primordialControl: {
    id: 'primordialControl',
    name: () => 'Primordial Control',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'control',
    description: () => 'Grants control over elemental forces, increasing all stats.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamage: level * 100,
      mana: level * 20,
    }),
  },

  // Tier 200 Skills
  avatarOfTheElements: {
    id: 'avatarOfTheElements',
    name: () => 'Avatar of the Elements',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-elements',
    description: () => 'Transforms the caster into a being of pure elemental power.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: level * 15,
      coldDamage: level * 15,
      airDamage: level * 15,
      earthDamage: level * 30,
      earthDamagePercent: level * 15,
      wisdom: level * 10,
    }),
  },
};
