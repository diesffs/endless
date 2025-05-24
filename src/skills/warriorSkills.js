import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../skillTree.js';

// Warrior skills extracted from skills.js
export const WARRIOR_SKILLS = {
  // Tier 0 Skills
  bash: {
    id: 'bash',
    name: 'Bash',
    type: 'toggle',
    manaCost: (level) => 5,
    requiredLevel: SKILL_LEVEL_TIERS[0],
    icon: 'war-axe',
    description: 'While active, increases damage but costs mana per attack',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 15,
    }),
  },
  toughness: {
    id: 'toughness',
    name: 'Toughness',
    type: 'passive',
    requiredLevel: SKILL_LEVEL_TIERS[0],
    icon: 'shield',
    description: 'Permanently increases armor',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 30,
    }),
  },

  // Tier 1 Skills
  powerStrike: {
    id: 'powerStrike',
    name: 'Power Strike',
    type: 'instant',
    manaCost: (level) => 20,
    cooldown: (level) => 4000,
    requiredLevel: SKILL_LEVEL_TIERS[1],
    icon: 'sword',
    description: 'A powerful strike that deals increased damage',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 80,
    }),
  },
  ironWill: {
    id: 'ironWill',
    name: 'Iron Will',
    type: 'passive',
    requiredLevel: SKILL_LEVEL_TIERS[1],
    icon: 'helmet',
    description: 'Increases resistance to damage',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 15,
      vitality: level * 5,
      lifeRegen: level * 1,
    }),
  },

  // Tier 2 Skills
  battleCry: {
    id: 'battleCry',
    name: 'Battle Cry',
    type: 'buff',
    manaCost: (level) => 40,
    cooldown: (level) => 60000,
    duration: (level) => 45000,
    requiredLevel: SKILL_LEVEL_TIERS[2],
    icon: 'cry',
    description: 'Temporarily increases damage',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 30,
    }),
  },
  fortitude: {
    id: 'fortitude',
    name: 'Fortitude',
    type: 'passive',
    requiredLevel: SKILL_LEVEL_TIERS[2],
    icon: 'armor',
    description: 'Increases life regeneration',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lifeRegen: level * 5,
    }),
  },

  // Tier 3 Skills
  groundSlam: {
    id: 'groundSlam',
    name: 'Ground Slam',
    type: 'instant',
    manaCost: (level) => 25,
    cooldown: (level) => 5000,
    requiredLevel: SKILL_LEVEL_TIERS[3],
    icon: 'slam',
    description: 'Deals instant damage',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 180,
    }),
  },

  // Tier 4 Skills
  shieldWall: {
    id: 'shieldWall',
    name: 'Shield Wall',
    type: 'buff',
    manaCost: (level) => 50,
    cooldown: (level) => 60000,
    duration: (level) => 50000,
    requiredLevel: SKILL_LEVEL_TIERS[4],
    icon: 'wall',
    description: 'Increases armor and block chance temporarily',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: level * 100,
      blockChance: level * 0.2,
    }),
  },

  // Tier 5 Skills
  berserk: {
    id: 'berserk',
    name: 'Berserk',
    type: 'toggle',
    manaCost: (level) => 25,
    requiredLevel: SKILL_LEVEL_TIERS[5],
    icon: 'berserk',
    description: 'Gives huge amounts of physical and fire damage',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 40,
      fireDamage: level * 160,
    }),
  },

  lastStand: {
    id: 'lastStand',
    name: 'Last Stand',
    type: 'passive',
    requiredLevel: SKILL_LEVEL_TIERS[5],
    icon: 'last-stand',
    description: 'Greatly increases offensive stats',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      damage: level * 10,
      lifeSteal: level * 0.02,
      attackSpeed: level * 0.01,
      attackRating: level * 200,
    }),
  },

  // Tier 6 Skills
  warlord: {
    id: 'warlord',
    name: 'Warlord',
    type: 'passive',
    requiredLevel: SKILL_LEVEL_TIERS[6],
    icon: 'warlord',
    description: 'Increases all attributes significantly',
    maxLevel: DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      strength: level * 8,
      vitality: level * 8,
      agility: level * 8,
      wisdom: level * 8,
      endurance: level * 8,
      dexterity: level * 8,
    }),
  },
};
