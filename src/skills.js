import { WARRIOR_SKILLS } from './skills/warriorSkills.js';
import { ROGUE_SKILLS } from './skills/rogueSkills.js';
import { VAMPIRE_SKILLS } from './skills/vampireSkills.js';
import { PALADIN_SKILLS } from './skills/paladinSkills.js';
import { BERSERKER_SKILLS } from './skills/berserkerSkills.js';
import { ELEMENTALIST_SKILLS } from './skills/elementalistSkills.js';

export const CLASS_PATHS = {
  WARRIOR: {
    name: 'Warrior',
    enabled: true,
    avatar: 'warrior-avatar.jpg',
    baseStats: {
      strength: 20,
      vitality: 20,
      armor: 60,
      lifePercent: 30,
    },
    description: 'A mighty warrior specializing in heavy armor and raw strength',
  },
  ROGUE: {
    name: 'Rogue',
    enabled: true,
    avatar: 'rogue-avatar.jpg',
    baseStats: {
      agility: 40,
      critChance: 5,
      attackSpeed: 0.3,
      damage: 30,
    },
    description: 'Swift and deadly, focusing on critical hits and attack speed',
  },
  VAMPIRE: {
    name: 'Vampire',
    enabled: true,
    avatar: 'vampire-avatar.jpg',
    baseStats: {
      lifeSteal: 1,
      critDamage: 0.5,
      attackSpeed: 0.2,
      damage: 25,
    },
    description: 'Master of life-stealing and critical strikes',
  },
  PALADIN: {
    name: 'Paladin',
    enabled: true,
    avatar: 'paladin-avatar.jpg',
    baseStats: {
      blockChance: 10,
      armor: 100,
      vitality: 50,
      lifePercent: 20,
    },
    description: 'Holy warrior specializing in defense and vitality',
  },
  BERSERKER: {
    name: 'Berserker',
    enabled: true,
    avatar: 'berserker-avatar.jpg',
    baseStats: {
      damage: 50,
      attackSpeed: 0.5,
      damagePercent: 20,
      lifePercent: -30,
    },
    description: 'Frenzied fighter focusing on raw damage output',
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    enabled: true,
    avatar: 'elementalist-avatar.jpg',
    baseStats: {
      fireDamage: 100,
      airDamage: 100,
      coldDamage: 100,
      earthDamage: 100,
    },
    description: 'Master of elemental damage types',
  },
};

export const SKILL_TREES = {
  WARRIOR: WARRIOR_SKILLS,

  ROGUE: ROGUE_SKILLS,

  VAMPIRE: VAMPIRE_SKILLS,

  PALADIN: PALADIN_SKILLS,

  BERSERKER: BERSERKER_SKILLS,

  ELEMENTALIST: ELEMENTALIST_SKILLS,
};
