// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 10,
    training: { available: true, cost: 80, bonus: 10 },
    item: { min: 30, max: 75, scaling: 'full' },
    itemTags: ['defense'],
    showInUI: true,
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 10, scaling: 'full' },
    itemTags: ['pants'],
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 50, bonus: 2 },
    item: { min: 15, max: 50, scaling: 'full' },
    itemTags: ['defense'],
    showInUI: true,
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 15, scaling: 'full' },
    itemTags: ['armor'],
  },
  // BLOCK CHANCE
  blockChance: {
    base: 0,
    decimalPlaces: 1,
    training: { available: true, cost: 150, bonus: 0.1 },
    item: { min: 2, max: 6, scaling: 'capped' },
    itemTags: ['shield'],
    showInUI: true,
  },
  blockChancePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // LIFE REGEN
  lifeRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { available: true, cost: 80, bonus: 0.1 },
    item: { min: 1, max: 10, scaling: 'full' },
    itemTags: ['belt'],
    showInUI: true,
  },
  lifeRegenPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // THORNS
  thornsDamage: {
    base: 0,
    decimalPlaces: 0,
  },
  thornsDamagePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // RESURRECTION
  resurrectionChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 5, scaling: 'capped' },
    itemTags: ['amulet'],
  },
  reflectFireDamage: {
    base: 0,
    decimalPlaces: 0,
  },
};
