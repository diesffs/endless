import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';

// Elementalist skills extracted from skills.js
export const ELEMENTALIST_SKILLS = {
  // Tier 1 Skills
  fireball: {
    id: 'fireball',
    name: () => 'Fireball',
    type: () => 'instant',
    manaCost: (level) => 6 + level * 0.1,
    cooldown: (level) => 2500,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'fireball',
    description: () => 'Launches a fireball that deals fire damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: level * 20,
    }),
  },
  frostArmor: {
    id: 'frostArmor',
    name: () => 'Frost Armor',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 3,
    cooldown: (level) => 20000,
    duration: (level) => 10000 + level * 1000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frost-armor',
    description: () => 'Encases the caster in frost, increasing armor.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 40,
    }),
  },

  warmth: {
    id: 'warmth',
    name: () => 'Warmth',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'storm',
    description: () => 'Increases mana and mana regeneration',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      mana: level * 10,
      manaRegen: level * 0.2,
      wisdom: level * 1,
    }),
  },

  // Tier 10 Skills
  lightningStrike: {
    id: 'lightningStrike',
    name: () => 'Lightning Strike',
    type: () => 'instant',
    manaCost: (level) => 12 + level * 0.2,
    cooldown: (level) => 1500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'lightning',
    description: () => 'Strikes an enemy with a bolt of lightning.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      airDamage: level * 36,
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
    manaCost: (level) => 40 + level * 4,
    cooldown: (level) => 15000,
    duration: (level) => 20000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'blizzard',
    description: () => 'Summons a blizzard, covering the battlefield in frost.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: level * 5,
      airDamagePercent: level * 5,
    }),
  },
  fireShield: {
    id: 'fireShield',
    name: () => 'Fire Shield',
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.4,
    cooldown: (level) => 5000,
    duration: (level) => 60000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'fire-shield',
    description: () => 'Surrounds the caster with a shield of fire. Deals only fire damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      reflectFireDamage: level * 38,
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
      manaPercent: level * 2,
      manaRegen: level * 0.2,
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
      fireDamage: level * 40,
      coldDamage: level * 40,
      airDamage: level * 40,
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
      fireDamagePercent: level * 3,
      coldDamagePercent: level * 3,
      airDamagePercent: level * 3,
    }),
  },

  // Tier 75 Skills
  arcanePulse: {
    id: 'arcanePulse',
    name: () => 'Arcane Pulse',
    type: () => 'buff',
    manaCost: (level) => 40 + level * 0.6,
    cooldown: (level) => 30000,
    duration: (level) => 60000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pulse',
    description: () => 'Increases attack rating and resource stealing.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRating: level * 150,
      lifePerHit: level * 5,
      manaPerHit: level * 0.5,
      attackSpeed: level * 0.02,
    }),
  },

  // Tier 100 Skills
  elementalOverload: {
    id: 'elementalOverload',
    name: () => 'Elemental Overload',
    type: () => 'toggle',
    manaCost: (level) => 1 + level * 0.3,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'overload',
    description: () => 'Boosts all elemental damage at the cost of mana regeneration.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamage: level * 100,
      coldDamage: level * 100,
      airDamage: level * 100,
      earthDamage: level * 100,
      manaPerHit: level * -0.2,
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
      vitality: level * 15,
      wisdom: level * 8,
      dexterity: level * 6,
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
      fireDamage: level * 40,
      coldDamage: level * 40,
      airDamage: level * 40,
      earthDamage: level * 40,
      elementalDamagePercent: level * 5,
    }),
  },
};
