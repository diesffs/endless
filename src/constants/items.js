import { STATS } from './stats/stats.js';

export const EQUIPMENT_SLOTS = {
  HEAD: 'head',
  CHEST: 'chest',
  BELT: 'belt',
  LEGS: 'legs',
  BOOTS: 'boots',
  WEAPON: 'weapon',
  OFFHAND: 'offhand',
  GLOVES: 'gloves',
  AMULET: 'amulet',
  RING1: 'ring1',
  RING2: 'ring2',
};

export const SLOT_REQUIREMENTS = {
  head: ['HELMET'],
  chest: ['ARMOR'],
  belt: ['BELT'],
  legs: ['PANTS'],
  boots: ['BOOTS'],
  weapon: ['SWORD', 'AXE', 'MACE'],
  offhand: ['SHIELD'],
  gloves: ['GLOVES'],
  amulet: ['AMULET'],
  ring1: ['RING'],
  ring2: ['RING'],
};

export const ITEM_TYPES = {
  HELMET: 'HELMET',
  ARMOR: 'ARMOR',
  BELT: 'BELT',
  PANTS: 'PANTS',
  BOOTS: 'BOOTS',
  SWORD: 'SWORD',
  AXE: 'AXE',
  MACE: 'MACE',
  SHIELD: 'SHIELD',
  GLOVES: 'GLOVES',
  AMULET: 'AMULET',
  RING: 'RING',
};

export const ITEM_ICONS = {
  HELMET: '🪖',
  ARMOR: '👚',
  BELT: '🎗️',
  PANTS: '👖',
  BOOTS: '👢',
  SWORD: '⚔️',
  AXE: '🪓',
  MACE: '🔨',
  SHIELD: '🛡️',
  GLOVES: '🧤',
  AMULET: '📿',
  RING: '💍',
};

export const ITEM_RARITY = {
  NORMAL: { name: 'NORMAL', color: '#ffffff', chance: 130, statMultiplier: 1, totalStats: 3 },
  MAGIC: { name: 'MAGIC', color: '#4287f5', chance: 40, statMultiplier: 1.5, totalStats: 3 },
  RARE: { name: 'RARE', color: '#ffd700', chance: 18, statMultiplier: 2, totalStats: 4 },
  UNIQUE: { name: 'UNIQUE', color: '#ff8c00', chance: 6, statMultiplier: 3, totalStats: 5 },
  LEGENDARY: { name: 'LEGENDARY', color: '#e65a27', chance: 2, statMultiplier: 3.5, totalStats: 6 },
  MYTHIC: { name: 'MYTHIC', color: '#ff0033', chance: 1, statMultiplier: 4, totalStats: 7 },
};

export const RARITY_ORDER = [
  ITEM_RARITY.NORMAL.name,
  ITEM_RARITY.MAGIC.name,
  ITEM_RARITY.RARE.name,
  ITEM_RARITY.UNIQUE.name,
  ITEM_RARITY.LEGENDARY.name,
  ITEM_RARITY.MYTHIC.name,
];

export const ITEM_STAT_POOLS = {
  HELMET: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'helmet'])],
  },
  ARMOR: {
    mandatory: ['armor'],
    possible: [...getStatsByTags(['defense', 'armor'])],
  },
  BELT: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'belt', 'misc'])],
  },
  PANTS: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'pants'])],
  },
  BOOTS: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'boots'])],
  },
  SWORD: {
    mandatory: ['attackSpeed'],
    possible: [...getStatsByTags(['offense', 'sword'])],
  },
  AXE: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'axe'])],
  },
  MACE: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'mace'])],
  },
  SHIELD: {
    mandatory: ['blockChance'],
    possible: [...getStatsByTags(['defense', 'shield'])],
  },
  GLOVES: {
    mandatory: [],
    possible: [...getStatsByTags(['gloves'])],
  },
  AMULET: {
    mandatory: [],
    possible: [...getStatsByTags(['jewelry', 'amulet', 'misc'])],
  },
  RING: {
    mandatory: [],
    possible: [...getStatsByTags(['jewelry', 'ring', 'misc'])],
  },
};

// Helper to get stats by tag
function getStatsByTag(tag) {
  return Object.entries(STATS)
    .filter(([_, config]) => config.itemTags && config.itemTags.includes(tag) && config.item)
    .map(([stat]) => stat);
}

// Helper to get stats by multiple tags (union)
function getStatsByTags(tags) {
  const stats = new Set();
  tags.forEach((tag) => {
    getStatsByTag(tag).forEach((stat) => stats.add(stat));
  });
  return Array.from(stats);
}
