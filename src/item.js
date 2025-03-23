import { STAT_DECIMAL_PLACES } from './hero.js';

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
  NORMAL: { name: 'NORMAL', color: '#ffffff', chance: 66.5, statMultiplier: 1, totalStats: 3 },
  MAGIC: { name: 'MAGIC', color: '#4287f5', chance: 20, statMultiplier: 1.5, totalStats: 3 },
  RARE: { name: 'RARE', color: '#ffd700', chance: 9, statMultiplier: 2, totalStats: 4 },
  UNIQUE: { name: 'UNIQUE', color: '#ff8c00', chance: 3, statMultiplier: 3, totalStats: 5 },
  LEGENDARY: { name: 'LEGENDARY', color: '#e65a27', chance: 1, statMultiplier: 3.5, totalStats: 6 },
  MYTHIC: { name: 'MYTHIC', color: '#ff0033', chance: 0.5, statMultiplier: 4, totalStats: 7 },
};

export const RARITY_ORDER = [
  ITEM_RARITY.NORMAL.name,
  ITEM_RARITY.MAGIC.name,
  ITEM_RARITY.RARE.name,
  ITEM_RARITY.UNIQUE.name,
  ITEM_RARITY.LEGENDARY.name,
  ITEM_RARITY.MYTHIC.name,
];

export const DECIMAL_STATS = ['critDamage', 'attackSpeed', 'critChance'];

export const AVAILABLE_STATS = {
  damage: { min: 3, max: 10, scaling: 'full' },
  armor: { min: 3, max: 10, scaling: 'full' },
  strength: { min: 1, max: 5, scaling: 'full' },
  agility: { min: 1, max: 5, scaling: 'full' },
  vitality: { min: 1, max: 5, scaling: 'full' },
  critChance: { min: 0.5, max: 1.5, scaling: 'capped' },
  critDamage: { min: 0.02, max: 0.1, scaling: 'full' },
  attackSpeed: { min: 0.05, max: 0.2, scaling: 'capped' },
  health: { min: 30, max: 75, scaling: 'full' },
  blockChance: { min: 2, max: 6, scaling: 'capped' },
  attackRating: { min: 50, max: 150, scaling: 'full' },
  lifeSteal: { min: 0.01, max: 0.1, scaling: 'capped' },
  fireDamage: { min: 10, max: 30, scaling: 'full' },
  coldDamage: { min: 10, max: 30, scaling: 'full' },
  airDamage: { min: 10, max: 30, scaling: 'full' },
  earthDamage: { min: 10, max: 30, scaling: 'full' },
  attackRatingPercent: { min: 5, max: 15, scaling: 'capped' },
  damagePercent: { min: 2, max: 8, scaling: 'capped' },

  wisdom: { min: 1, max: 5, scaling: 'full' },
  endurance: { min: 1, max: 5, scaling: 'full' },
  dexterity: { min: 1, max: 5, scaling: 'full' },
  mana: { min: 5, max: 15, scaling: 'capped' },
  manaRegen: { min: 0.5, max: 2, scaling: 'capped' },
  lifeRegen: { min: 0.5, max: 1.5, scaling: 'full' },
  healthPercent: { min: 2, max: 8, scaling: 'capped' },
  manaPercent: { min: 2, max: 5, scaling: 'capped' },
  armorPercent: { min: 3, max: 8, scaling: 'capped' },
  elementalDamagePercent: { min: 5, max: 10, scaling: 'capped' },
  bonusGold: { min: 5, max: 15, scaling: 'capped' },
  bonusExperience: { min: 5, max: 15, scaling: 'capped' },
};

const DEFENSIVE_STATS = [
  'armor',
  'strength',
  'agility',
  'vitality',
  'wisdom',
  'endurance',
  'dexterity',
  'health',
  'lifeRegen',
  'endurance',
  'armorPercent',
  'mana',
  'manaRegen',
  'manaPercent',
  'healthPercent',
  'strength',
  'agility',
  'dexterity',
];

const OFFENSIVE_STATS = [
  'critChance',
  'critDamage',
  'attackSpeed',
  'attackRating',
  'damagePercent',
  'attackRatingPercent',
  'lifeSteal',
];

const ELEMENTAL_STATS = ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage', 'elementalDamagePercent'];

const JEWELRY_STATS = [...OFFENSIVE_STATS, ...DEFENSIVE_STATS, ...ELEMENTAL_STATS, 'bonusGold', 'bonusExperience'];

export const ITEM_STAT_POOLS = {
  HELMET: {
    mandatory: [],
    possible: [...DEFENSIVE_STATS, 'blockChance'],
  },
  ARMOR: {
    mandatory: ['armor'],
    possible: [...DEFENSIVE_STATS],
  },
  BELT: {
    mandatory: [],
    possible: [...DEFENSIVE_STATS],
  },
  PANTS: {
    mandatory: ['armor'],
    possible: [...DEFENSIVE_STATS],
  },
  BOOTS: {
    mandatory: [],
    possible: [...DEFENSIVE_STATS, 'attackSpeed', 'agility'],
  },
  SWORD: {
    mandatory: ['damage'],
    possible: [...OFFENSIVE_STATS, ...ELEMENTAL_STATS],
  },
  AXE: {
    mandatory: ['damage', 'damagePercent'],
    possible: [...OFFENSIVE_STATS],
  },
  MACE: {
    mandatory: ['damage', 'strength'],
    possible: [...OFFENSIVE_STATS],
  },
  SHIELD: {
    mandatory: ['armor', 'blockChance'],
    possible: [...DEFENSIVE_STATS],
  },
  GLOVES: {
    mandatory: [],
    possible: [...OFFENSIVE_STATS, ...DEFENSIVE_STATS, ...ELEMENTAL_STATS],
  },
  AMULET: {
    mandatory: [],
    possible: [...JEWELRY_STATS],
  },
  RING: {
    mandatory: [],
    possible: [...JEWELRY_STATS],
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

      const decimals = STAT_DECIMAL_PLACES[stat] || 0;
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

    // Helper function to convert camelCase to Title Case with spaces
    const formatStatName = (stat) => {
      // Handle special cases first
      if (stat === 'critChance') return 'Crit Chance';
      if (stat === 'critDamage') return 'Crit Damage';
      if (stat === 'lifeSteal') return 'Life Steal';
      if (stat === 'attackSpeed') return 'Attack Speed';
      if (stat === 'attackRating') return 'Attack Rating';
      if (stat === 'attackRatingPercent') return 'Attack Rating';
      if (stat === 'damagePercent') return 'Damage';
      if (stat === 'healthPercent') return 'Health';
      if (stat === 'manaPercent') return 'Mana';
      if (stat === 'armorPercent') return 'Armor';
      if (stat === 'elementalDamagePercent') return 'Elemental Damage';
      if (stat === 'lifeRegen') return 'Life Regeneration';
      if (stat === 'manaRegen') return 'Mana Regeneration';
      if (stat === 'bonusGold') return 'Bonus Gold';
      if (stat === 'bonusExperience') return 'Bonus Experience';
      if (stat === 'blockChance') return 'Block Chance';
      if (stat === 'fireDamage') return 'Fire Damage';
      if (stat === 'coldDamage') return 'Cold Damage';
      if (stat === 'airDamage') return 'Air Damage';
      if (stat === 'earthDamage') return 'Earth Damage';

      return stat.charAt(0).toUpperCase() + stat.slice(1);
    };

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
              const decimals = STAT_DECIMAL_PLACES[stat] || 0;
              const formattedValue = value.toFixed(decimals);
              return `<div>${formatStatName(stat)}: ${formattedValue}${isPercentStat(stat) ? '%' : ''}</div>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }
}
