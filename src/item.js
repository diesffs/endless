import { STATS } from './stats.js';
import { formatStatName } from './ui.js';

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

// Dynamically generate AVAILABLE_STATS from STATS
export const AVAILABLE_STATS = Object.fromEntries(
  Object.entries(STATS)
    .filter(([_, config]) => config.item)
    .map(([stat, config]) => [stat, config.item])
);

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

export default class Item {
  constructor(type, level, rarity, existingStats = null) {
    this.type = type;
    this.level = level;
    this.rarity = rarity.toUpperCase();
    // Only generate new stats if no existing stats provided
    this.stats = existingStats || this.generateStats();
    this.id = crypto.randomUUID();
  }

  generateStats() {
    const stats = {};
    const itemPool = ITEM_STAT_POOLS[this.type];
    const multiplier = ITEM_RARITY[this.rarity].statMultiplier;
    const totalStatsNeeded = ITEM_RARITY[this.rarity].totalStats;

    const calculateStatValue = (stat, baseValue) => {
      const scaling = AVAILABLE_STATS[stat].scaling;
      const value =
        scaling === 'capped'
          ? baseValue * multiplier * Math.min(1 + this.level * (1 / 200), 2)
          : baseValue * multiplier * (1 + this.level * 0.03);

      const decimals = STATS[stat].decimalPlaces || 0;
      return Number(value.toFixed(decimals));
    };

    // Add mandatory stats first
    itemPool.mandatory.forEach((stat) => {
      const range = AVAILABLE_STATS[stat];
      const baseValue = Math.random() * (range.max - range.min) + range.min;
      stats[stat] = calculateStatValue(stat, baseValue);
    });

    // Add random stats from possible pool until totalStatsNeeded
    const remainingStats = totalStatsNeeded - itemPool.mandatory.length;
    const availableStats = [...itemPool.possible].filter((stat) => !itemPool.mandatory.includes(stat));

    for (let i = 0; i < remainingStats && availableStats.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableStats.length);
      const stat = availableStats.splice(randomIndex, 1)[0];
      const range = AVAILABLE_STATS[stat];
      console.log(`Generating stat ${stat} with range:`, range);

      const baseValue = Math.random() * (range.max - range.min) + range.min;
      stats[stat] = calculateStatValue(stat, baseValue);
    }

    return stats;
  }

  getIcon() {
    return ITEM_ICONS[this.type] || '❓';
  }

  getDisplayName() {
    return `${ITEM_RARITY[this.rarity].name} ${this.type}`;
  }

  getTooltipHTML(isEquipped = false) {
    const html = String.raw;

    const isPercentStat = (stat) => {
      return stat.endsWith('Percent') || stat === 'critChance' || stat === 'blockChance' || stat === 'lifeSteal';
    };

    return html`
      <div class="item-tooltip">
        <div class="item-name" style="color: ${ITEM_RARITY[this.rarity].color};">
          ${isEquipped ? '(Equipped) ' : ''}${this.getDisplayName()}
        </div>
        <div class="item-level">Level ${this.level}</div>
        <div class="item-stats">
          ${Object.entries(this.stats)
            .map(([stat, value]) => {
              const decimals = STATS[stat].decimalPlaces || 0;
              const formattedValue = value.toFixed(decimals);
              return `<div>${formatStatName(stat)}: ${formattedValue}${isPercentStat(stat) ? '%' : ''}</div>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }
}
