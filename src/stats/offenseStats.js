// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 1 },
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['offense', 'weapon'],
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 8, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'axe'],
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1.0,
    decimalPlaces: 2,
    training: { available: true, cost: 200, bonus: 0.01 },
    item: { min: 0.05, max: 0.2, scaling: 'capped' },
    itemTags: ['offense', 'weapon'],
  },
  attackSpeedPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.01, max: 0.05, scaling: 'capped' },
    itemTags: ['offense', 'weapon'],
  },
  // CRIT CHANCE
  critChance: {
    base: 5,
    decimalPlaces: 2,
    training: { available: true, cost: 140, bonus: 0.1 },
    item: { min: 0.5, max: 1.5, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.5,
    decimalPlaces: 2,
    training: { available: true, cost: 200, bonus: 0.01 },
    item: { min: 0.02, max: 0.1, scaling: 'full' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  critDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.01, max: 0.05, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  // ATTACK RATING
  attackRating: {
    base: 100,
    decimalPlaces: 0,
    training: { available: true, cost: 60, bonus: 10 },
    item: { min: 50, max: 150, scaling: 'full' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    training: { available: true, cost: 500, bonus: 0.01 },
    item: { min: 0.01, max: 0.1, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  lifeStealPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.01, max: 0.05, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  // LIFE PER HIT
  lifePerHit: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 1, max: 5, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  lifePerHitPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  // FIRE DAMAGE
  fireDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
    itemTags: ['elemental', 'offense', 'weapon', 'jewelry'],
  },
  fireDamagePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
    itemTags: ['elemental', 'offense', 'weapon', 'jewelry'],
  },
  coldDamagePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
    itemTags: ['elemental', 'offense', 'weapon', 'jewelry'],
  },
  airDamagePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
    itemTags: ['elemental', 'offense', 'weapon', 'jewelry'],
  },
  earthDamagePercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // DOUBLE DAMAGE
  doubleDamageChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.1, max: 1, scaling: 'capped' },
    itemTags: ['offense', 'weapon', 'jewelry'],
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['elemental', 'offense', 'weapon', 'jewelry'],
  },
};
