// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    levelUpBonus: 1,
    shop: { available: true, cost: 60, bonus: 1 },
    item: { min: 3, max: 10, scaling: 'full' },
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    item: { min: 2, max: 8, scaling: 'capped' },
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1.0,
    decimalPlaces: 2,
    levelUpBonus: 0,
    shop: { available: true, cost: 200, bonus: 0.01 },
    item: { min: 0.05, max: 0.2, scaling: 'capped' },
  },
  attackSpeedPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // CRIT CHANCE
  critChance: {
    base: 5,
    decimalPlaces: 2,
    levelUpBonus: 0,
    shop: { available: true, cost: 140, bonus: 0.1 },
    item: { min: 0.5, max: 1.5, scaling: 'capped' },
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.5,
    decimalPlaces: 2,
    levelUpBonus: 0,
    shop: { available: true, cost: 200, bonus: 0.01 },
    item: { min: 0.02, max: 0.1, scaling: 'full' },
  },
  critDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // ATTACK RATING
  attackRating: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 0,
    shop: { available: true, cost: 60, bonus: 10 },
    item: { min: 50, max: 150, scaling: 'full' },
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    levelUpBonus: 0,
    shop: { available: true, cost: 500, bonus: 0.01 },
    item: { min: 0.01, max: 0.1, scaling: 'capped' },
  },
  lifeStealPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  lifePerHit: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  lifePerHitPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // FIRE DAMAGE
  fireDamage: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    shop: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
  },
  fireDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    shop: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
  },
  coldDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    shop: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
  },
  airDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    shop: { available: true, cost: 30, bonus: 1 },
    item: { min: 20, max: 50, scaling: 'full' },
  },
  earthDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // DOUBLE DAMAGE
  doubleDamageChance: {
    base: 0,
    decimalPlaces: 1,
    levelUpBonus: 0,
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
};
