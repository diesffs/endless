// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['offense'],
    showInUI: true,
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 20, scaling: 'capped' },
    itemTags: ['mace'],
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1.0,
    decimalPlaces: 2,
    training: { available: true, cost: 200, bonus: 0.01 },
    item: { min: 0.05, max: 0.2, scaling: 'capped' },
    itemTags: ['offense', 'gloves'],
    showInUI: true,
  },
  attackSpeedPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // CRIT CHANCE
  critChance: {
    base: 5,
    decimalPlaces: 2,
    training: { available: true, cost: 140, bonus: 0.1 },
    item: { min: 0.5, max: 1.5, scaling: 'capped' },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.5,
    decimalPlaces: 2,
    training: { available: true, cost: 200, bonus: 0.01 },
    item: { min: 0.02, max: 0.1, scaling: 'full' },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  critDamagePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // ATTACK RATING
  attackRating: {
    base: 100,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 10 },
    item: { min: 50, max: 150, scaling: 'full' },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['offense', 'gloves'],
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    training: { available: true, cost: 500, bonus: 0.01 },
    item: { min: 0.05, max: 0.2, scaling: 'capped' },
    itemTags: ['axe'],
    showInUI: true,
  },
  lifeStealPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // LIFE PER HIT
  lifePerHit: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 1, max: 8, scaling: 'capped' },
    itemTags: ['axe'],
  },
  lifePerHitPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // FIRE DAMAGE
  fireDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  fireDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 6, scaling: 'full' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  coldDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 6, scaling: 'full' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  airDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 6, scaling: 'full' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 5, max: 25, scaling: 'full' },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  earthDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 6, scaling: 'full' },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // DOUBLE DAMAGE
  doubleDamageChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.2, max: 2, scaling: 'capped' },
    itemTags: ['offense', 'gloves'],
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.5, max: 4, scaling: 'full' },
    itemTags: ['offense', 'jewelry', 'gloves'],
  },
};
