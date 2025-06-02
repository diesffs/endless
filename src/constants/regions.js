import { ENEMY_LIST } from './enemies.js';

export const REGIONS = [
  {
    id: 'forest',
    unlockLevel: 1,
    name: 'Enchanted Forest',
    description: 'A mystical forest teeming with elemental creatures.',
    allowedTags: ['forest'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('forest')).map((e) => e.name);
    },
    lifeMultiplier: 1.0,
    damageMultiplier: 1.0,
    xpMultiplier: 1.0,
    goldMultiplier: 1.3,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      crystalized_rock: 1,
    },
  },
  {
    id: 'crystal_cave',
    unlockLevel: 25,
    name: 'Crystal Cave',
    description: 'A shimmering cave filled with crystalized rocks.',
    allowedTags: ['cave', 'crystal'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('cave')).map((e) => e.name);
    },
    lifeMultiplier: 1.5,
    damageMultiplier: 1.2,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.2,
    materialDropWeights: {
      crystalized_rock: 4,
    },
  },
  {
    id: 'tundra',
    unlockLevel: 50,
    name: 'Frozen Tundra',
    description: 'A land of ice and snow, home to cold and air enemies.',
    allowedTags: ['tundra', 'ice'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('tundra')).map((e) => e.name);
    },
    lifeMultiplier: 1.8,
    damageMultiplier: 1.4,
    xpMultiplier: 1.7,
    goldMultiplier: 1.0,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
    },
  },
  {
    id: 'desert',
    unlockLevel: 150,
    name: 'Scorching Desert',
    description: 'A vast desert with relentless heat and dangerous creatures.',
    allowedTags: ['desert', 'sand'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('desert')).map((e) => e.name);
    },
    lifeMultiplier: 2.2,
    damageMultiplier: 1.5,
    xpMultiplier: 1.5,
    goldMultiplier: 2,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      elixir: 5,
    },
  },
  {
    id: 'swamp',
    unlockLevel: 350,
    name: 'Murky Swamp',
    description: 'A dark and damp swamp filled with poisonous creatures.',
    allowedTags: ['swamp', 'poison'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('swamp')).map((e) => e.name);
    },
    lifeMultiplier: 2.5,
    damageMultiplier: 1.8,
    xpMultiplier: 2,
    goldMultiplier: 1.0,
    itemDropMultiplier: 3,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
    },
  },
  {
    id: 'skyrealm',
    unlockLevel: 660,
    name: 'Skyrealm Peaks',
    description: 'A floating realm high above the clouds, home to air and lightning creatures.',
    allowedTags: ['sky', 'air'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('sky')).map((e) => e.name);
    },
    lifeMultiplier: 4.0,
    damageMultiplier: 2.0,
    xpMultiplier: 2.5,
    goldMultiplier: 1.8,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 2.0,
    materialDropWeights: {
      potion_of_dexterity: 5,
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
    },
  },
  {
    id: 'abyss',
    unlockLevel: 1000,
    name: 'Abyssal Depths',
    description: 'A dark and mysterious region filled with ancient horrors.',
    allowedTags: ['abyss', 'dark'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('abyss')).map((e) => e.name);
    },
    lifeMultiplier: 5.0,
    damageMultiplier: 2.5,
    xpMultiplier: 5.0,
    goldMultiplier: 4.0,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      freaky_gold_coins: 15,
    },
  },
];
