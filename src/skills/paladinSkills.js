import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../skillTree.js';

// Paladin skills extracted from skills.js
export const PALADIN_SKILLS = {
  // Tier 1 Skills
  holyLight: {
    id: 'holyLight',
    name: () => 'Holy Light',
    type: () => 'instant',
    manaCost: (level) => 10 + level * 2,
    cooldown: (level) => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'light',
    description: () => 'A burst of holy light that heals allies and damages enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: level * 16,
    }),
  },
  shieldBash: {
    id: 'shieldBash',
    name: () => 'Shield Bash',
    type: () => 'instant',
    manaCost: (level) => 3 + level * 1,
    cooldown: (level) => 1400,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'bash',
    description: () => 'Bashes an enemy with your shield, stunning them.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 12,
    }),
  },
  divineProtection: {
    id: 'divineProtection',
    name: () => 'Divine Protection',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'protection',
    description: () => 'Greatly increases armor and block chance.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 15,
      blockChance: level * 0.2,
      thornsDamage: level * 1,
      thornsDamagePercent: level * 3,
    }),
  },

  // Tier 10 Skills
  consecration: {
    id: 'consecration',
    name: () => 'Consecration',
    type: () => 'buff',
    manaCost: (level) => 25 + level * 3,
    cooldown: (level) => 10000,
    duration: (level) => 60000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'consecration',
    description: () => 'Blesses the ground, dealing holy damage to enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 30,
    }),
  },
  greaterHealing: {
    id: 'greaterHealing',
    name: () => 'Greater Healing',
    type: () => 'instant',
    manaCost: (level) => 30 + level * 3,
    cooldown: (level) => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'heal',
    description: () => 'Heals a large amount of life instantly.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      life: level * 100,
    }),
  },

  // Tier 25 Skills
  divineShield: {
    id: 'divineShield',
    name: () => 'Divine Shield',
    type: () => 'buff',
    manaCost: (level) => 40 + level * 4,
    cooldown: (level) => 15000,
    duration: (level) => 5000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-shield',
    description: () => 'Creates a shield that absorbs damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      blockChance: level * 0.5,
    }),
  },
  auraOfLight: {
    id: 'auraOfLight',
    name: () => 'Aura of Light',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'holy-aura',
    description: () => 'Increases healing effects and reduces damage taken.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifePercent: level * 5,
      armorPercent: level * 2,
    }),
  },

  // Tier 50 Skills
  wrathOfTheHeavens: {
    id: 'wrathOfTheHeavens',
    name: () => 'Wrath of the Heavens',
    type: () => 'instant',
    manaCost: (level) => 50,
    cooldown: (level) => 6000,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'wrath',
    description: () => 'Calls down holy energy to smite enemies.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 20,
      fireDamage: level * 10,
      airDamage: level * 10,
    }),
  },
  beaconOfFaith: {
    id: 'beaconOfFaith',
    name: () => 'Beacon of Faith',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'beacon',
    description: () => 'Increases healing done.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: level * 3,
      lifeRegenPercent: level * 1,
    }),
  },

  // Tier 75 Skills
  holyBarrier: {
    id: 'holyBarrier',
    name: () => 'Holy Barrier',
    type: () => 'buff',
    manaCost: (level) => 60,
    cooldown: (level) => 20000,
    duration: (level) => 8000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'barrier',
    description: () => 'Creates a holy barrier that absorbs damage.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: level * 8,
      life: level * 10,
    }),
  },

  // Tier 100 Skills
  divineWrath: {
    id: 'divineWrath',
    name: () => 'Divine Wrath',
    type: () => 'toggle',
    manaCost: (level) => 40,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'wrath',
    description: () => 'Unleashes divine energy to increase damage and healing.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 10,
      lifePerHit: level * 20,
    }),
  },
  guardianAngel: {
    id: 'guardianAngel',
    name: () => 'Guardian Angel',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'angel',
    description: () => 'Provides a chance to resurrect with maximum life upon death',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      resurrectionChance: level * 0.5,
    }),
  },

  // Tier 200 Skills
  ascension: {
    id: 'ascension',
    name: () => 'Ascension',
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'ascension',
    description: () => 'Grants significant bonuses to all attributes.',
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: level * 5,
      vitality: level * 5,
      attackRating: level * 20,
      attackRatingPercent: level * 2,
      wisdom: level * 10,
      mana: level * 10,
      manaPercent: level * 2,
    }),
  },
};
