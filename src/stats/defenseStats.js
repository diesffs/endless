// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 10,
    shop: { available: true, cost: 80, bonus: 10 },
    item: { min: 30, max: 75, scaling: 'full' },
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 8, scaling: 'capped' },
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    shop: { available: true, cost: 60, bonus: 1 },
    item: { min: 3, max: 10, scaling: 'full' },
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 8, scaling: 'capped' },
  },
  // BLOCK CHANCE
  blockChance: {
    base: 0,
    decimalPlaces: 1,
    shop: { available: true, cost: 150, bonus: 0.1 },
    item: { min: 2, max: 6, scaling: 'capped' },
  },
  blockChancePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // LIFE REGEN
  lifeRegen: {
    base: 0,
    decimalPlaces: 1,
    shop: { available: true, cost: 80, bonus: 0.1 },
    item: { min: 0.5, max: 1.5, scaling: 'full' },
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
  },
};
