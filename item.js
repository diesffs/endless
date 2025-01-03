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
  NORMAL: { name: 'NORMAL', color: '#ffffff', chance: 70, statMultiplier: 1, totalStats: 3 },
  MAGIC: { name: 'MAGIC', color: '#4287f5', chance: 20, statMultiplier: 1.5, totalStats: 3 },
  RARE: { name: 'RARE', color: '#ffd700', chance: 9, statMultiplier: 2, totalStats: 4 },
  UNIQUE: { name: 'UNIQUE', color: '#ff8c00', chance: 1, statMultiplier: 3, totalStats: 5 },
};

export const RARITY_ORDER = [
  ITEM_RARITY.NORMAL.name,
  ITEM_RARITY.MAGIC.name,
  ITEM_RARITY.RARE.name,
  ITEM_RARITY.UNIQUE.name,
];

export const DECIMAL_STATS = ['critDamage', 'attackSpeed', 'critChance'];

export const AVAILABLE_STATS = {
  damage: { min: 5, max: 15, scaling: 'full' },
  armor: { min: 3, max: 10, scaling: 'full' },
  strength: { min: 1, max: 5, scaling: 'full' },
  agility: { min: 1, max: 5, scaling: 'full' },
  vitality: { min: 1, max: 5, scaling: 'full' },
  critChance: { min: 0.5, max: 3, scaling: 'capped' },
  critDamage: { min: 0.02, max: 0.1, scaling: 'full' },
  attackSpeed: { min: 0.05, max: 0.2, scaling: 'capped' },
  health: { min: 5, max: 25, scaling: 'full' },
  blockChance: { min: 2, max: 6, scaling: 'capped' },
  attackRating: { min: 50, max: 300, scaling: 'full' },
  lifeSteal: { min: 0.01, max: 0.1, scaling: 'capped' },
  fireDamage: { min: 3, max: 10, scaling: 'full' },
  coldDamage: { min: 3, max: 10, scaling: 'full' },
  airDamage: { min: 3, max: 10, scaling: 'full' },
  earthDamage: { min: 3, max: 10, scaling: 'full' },
  attackRatingPercent: { min: 5, max: 15, scaling: 'capped' },
  damagePercent: { min: 2, max: 8, scaling: 'capped' },
};

export const ITEM_STAT_POOLS = {
  HELMET: {
    mandatory: ['armor'],
    possible: ['vitality', 'health', 'strength', 'agility', 'critChance', 'blockChance'],
  },
  ARMOR: {
    mandatory: ['armor'],
    possible: ['vitality', 'health', 'strength', 'blockChance', 'critDamage'],
  },
  BELT: {
    mandatory: ['armor'],
    possible: ['vitality', 'strength', 'health', 'agility', 'critChance'],
  },
  PANTS: {
    mandatory: ['armor'],
    possible: ['vitality', 'health', 'agility', 'strength', 'critDamage'],
  },
  BOOTS: {
    mandatory: ['armor'],
    possible: ['agility', 'health', 'attackSpeed', 'strength', 'vitality'],
  },
  SWORD: {
    mandatory: ['damage'],
    possible: [
      'strength',
      'critChance',
      'critDamage',
      'attackSpeed',
      'agility',
      'attackRating',
      'damagePercent',
      'attackRatingPercent',
      'fireDamage',
      'coldDamage',
      'airDamage',
      'earthDamage',
    ],
  },
  AXE: {
    mandatory: ['damage'],
    possible: ['strength', 'critDamage', 'attackSpeed', 'vitality', 'health', 'attackRating', 'lifeSteal'],
  },
  MACE: {
    mandatory: ['damage'],
    possible: ['strength', 'armor', 'critChance', 'health', 'vitality'],
  },
  SHIELD: {
    mandatory: ['armor', 'blockChance'],
    possible: ['vitality', 'health', 'strength', 'critChance', 'agility'],
  },
  GLOVES: {
    mandatory: ['armor'],
    possible: ['attackSpeed', 'critChance', 'strength', 'agility', 'critDamage', 'attackRating', 'lifeSteal'],
  },
  AMULET: {
    mandatory: [],
    possible: [
      'strength',
      'agility',
      'vitality',
      'critChance',
      'health',
      'critDamage',
      'attackRating',
      'fireDamage',
      'coldDamage',
      'airDamage',
      'earthDamage',
      'attackRatingPercent',
    ],
  },
  RING: {
    mandatory: [],
    possible: [
      'critChance',
      'critDamage',
      'attackSpeed',
      'strength',
      'agility',
      'vitality',
      'attackRating',
      'fireDamage',
      'coldDamage',
      'airDamage',
      'earthDamage',
      'damagePercent',
      'attackRatingPercent',
    ],
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
          ? baseValue * multiplier * Math.min(1 + this.level * 0.01, 2)
          : baseValue * multiplier * (1 + this.level * 0.1);

      return DECIMAL_STATS.includes(stat) ? Number(value.toFixed(2)) : Math.round(value);
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
    return html`
      <div class="item-tooltip">
        <div class="item-name" style="color: ${ITEM_RARITY[this.rarity].color};">
          ${isEquipped ? '(Equipped) ' : ''}${this.getDisplayName()}
        </div>
        <div class="item-level">Level ${this.level}</div>
        <div class="item-stats">
          ${Object.entries(this.stats)
            .map(([stat, value]) => {
              const formattedValue = DECIMAL_STATS.includes(stat) ? value.toFixed(2) : value;
              return `<div>${stat}: ${formattedValue}</div>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }
}
