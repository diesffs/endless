// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 10,
    training: { available: true, cost: 80, bonus: 10 },
    item: { min: 30, max: 75, scaling: 'full' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 8, scaling: 'capped' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['defense', 'armor', 'shield'],
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 8, scaling: 'capped' },
    itemTags: ['defense', 'armor', 'shield'],
  },
  // BLOCK CHANCE
  blockChance: {
    base: 0,
    decimalPlaces: 1,
    training: { available: true, cost: 150, bonus: 0.1 },
    item: { min: 2, max: 6, scaling: 'capped' },
    itemTags: ['defense', 'shield'],
  },
  blockChancePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['defense', 'shield'],
  },
  // LIFE REGEN
  lifeRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { available: true, cost: 80, bonus: 0.1 },
    item: { min: 0.5, max: 1.5, scaling: 'full' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  lifeRegenPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  // THORNS
  thornsDamage: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 1, max: 5, scaling: 'capped' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  thornsDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  // RESURRECTION
  resurrectionChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.1, max: 1, scaling: 'capped' },
    itemTags: ['defense', 'armor', 'jewelry'],
  },
  reflectFireDamage: {
    base: 0,
    decimalPlaces: 0,
  },
};
