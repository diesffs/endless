import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS } from './constants/items.js';
import { REGION_TIER_BONUSES } from './constants/regions.js';
import { STATS } from './constants/stats/stats.js';
import { formatStatName } from './ui/ui.js';

// Dynamically generate AVAILABLE_STATS from STATS
export const AVAILABLE_STATS = Object.fromEntries(
  Object.entries(STATS)
    .filter(([_, config]) => config.item)
    .map(([stat, config]) => [stat, config.item])
);

export default class Item {
  constructor(type, level, rarity, tier = 1, existingStats = null) {
    this.type = type;
    this.level = level;
    this.rarity = rarity.toUpperCase();
    this.tier = tier;
    // Only generate new stats if no existing stats provided
    this.stats = existingStats || this.generateStats();
    this.id = crypto.randomUUID();
  }

  getLevelScale(level) {
    // Stats double every 250 levels, starting from level 1
    return 2 ** ((level - 1) / 250);
  }

  getTierBonus() {
    return 1 + REGION_TIER_BONUSES[this.tier].itemBaseBonus * (this.tier - 1);
  }

  calculateStatValue({ baseValue, tierBonus, multiplier, scale, stat }) {
    const decimals = STATS[stat].decimalPlaces || 0;
    return Number((baseValue * tierBonus * multiplier * scale).toFixed(decimals));
  }

  generateStats() {
    const stats = {};
    const itemPool = ITEM_STAT_POOLS[this.type];
    const multiplier = ITEM_RARITY[this.rarity].statMultiplier;
    const totalStatsNeeded = ITEM_RARITY[this.rarity].totalStats;
    const tierBonus = this.getTierBonus();
    const calculateStatValue = (stat, baseValue) => {
      const scaling = AVAILABLE_STATS[stat].scaling;
      const scale = scaling === 'capped' ? Math.min(this.getLevelScale(this.level), 2) : this.getLevelScale(this.level);
      return this.calculateStatValue({ baseValue, tierBonus, multiplier, scale, stat });
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
        <div class="item-level">Level ${this.level}, Tier ${this.tier}</div>
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

  /**
   * Reverse-engineer the base (unscaled) stat values for this item.
   * @returns {Object} base stat values keyed by stat name
   */
  getBaseStatValues() {
    const baseValues = {};
    for (const stat of Object.keys(this.stats)) {
      const statConfig = AVAILABLE_STATS[stat];
      if (!statConfig) continue;
      const scaling = statConfig.scaling;
      const multiplier = ITEM_RARITY[this.rarity].statMultiplier;
      const value = this.stats[stat];
      if (scaling === 'capped') {
        // value = base * multiplier * Math.min(1 + level * (1/200), 2)
        const scale = Math.min(1 + this.level * (1 / 200), 2);
        baseValues[stat] = value / (multiplier * scale);
      } else {
        // value = base * multiplier * (1 + level * 0.03)
        const scale = 1 + this.level * 0.03;
        baseValues[stat] = value / (multiplier * scale);
      }
    }
    return baseValues;
  }

  /**
   * Apply a new level to the item, scaling all stats from the provided base values.
   * @param {Object} baseValues - base stat values keyed by stat name
   * @param {number} newLevel
   */
  applyLevelToStats(baseValues, newLevel) {
    const tierBonus = this.getTierBonus();
    for (const stat of Object.keys(this.stats)) {
      const scaling = AVAILABLE_STATS[stat].scaling;
      const scale = scaling === 'capped' ? Math.min(this.getLevelScale(newLevel), 2) : this.getLevelScale(newLevel);
      const multiplier = ITEM_RARITY[this.rarity].statMultiplier;
      this.stats[stat] = this.calculateStatValue({ baseValue: baseValues[stat], tierBonus, multiplier, scale, stat });
    }
    this.level = newLevel;
  }
}
