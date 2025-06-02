import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS } from './constants/items.js';
import { STATS } from './constants/stats/stats.js';
import { formatStatName } from './ui/ui.js';

// Dynamically generate AVAILABLE_STATS from STATS
export const AVAILABLE_STATS = Object.fromEntries(
  Object.entries(STATS)
    .filter(([_, config]) => config.item)
    .map(([stat, config]) => [stat, config.item])
);

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
