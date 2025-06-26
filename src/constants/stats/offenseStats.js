// Scaling multiplier for all offense stats
const OFFENSE_SCALING_MULTIPLIER = 0.035;
const PERCENT_MULTIPLIER = 0.005;
const CHANCE_MULTIPLIER = 0.001;
// Generic scaling function for all offense stats
const offenseScaling = (level, scaling = OFFENSE_SCALING_MULTIPLIER, base = 1) => {
  return base + level * scaling;
};

// Offense stats
export const OFFENSE_STATS = {
  // DAMAGE
  damage: {
    base: 10,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 1, max: Infinity },
    item: { min: 3, max: 10, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense'],
    showInUI: true,
  },
  damagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 10, max: 25, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['mace'],
  },
  // ATTACK SPEED
  attackSpeed: {
    base: 1.0,
    decimalPlaces: 2,
    training: { cost: 350, bonus: 0.01, max: Infinity },
    item: { min: 0.05, max: 0.2, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'gloves'],
    showInUI: true,
  },
  attackSpeedPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // CRIT CHANCE
  critChance: {
    base: 5,
    decimalPlaces: 2,
    training: { cost: 250, bonus: 0.1, max: Infinity },
    item: { min: 1, max: 5, scaling: (level) => Math.min(offenseScaling(level, CHANCE_MULTIPLIER), 30) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  critChancePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // CRIT DAMAGE
  critDamage: {
    base: 1.5,
    decimalPlaces: 2,
    training: { cost: 500, bonus: 0.01, max: Infinity },
    item: { min: 0.02, max: 0.1, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  critDamagePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // ATTACK RATING
  attackRating: {
    base: 100,
    decimalPlaces: 0,
    training: { cost: 90, bonus: 10, max: Infinity },
    item: { min: 50, max: 150, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'jewelry', 'gloves'],
    showInUI: true,
  },
  attackRatingPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 10, max: 10, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'gloves'],
  },
  // LIFE STEAL
  lifeSteal: {
    base: 0,
    decimalPlaces: 2,
    training: { cost: 600, bonus: 0.01, max: Infinity },
    item: { min: 0.05, max: 0.2, scaling: (level) => offenseScaling(level) },
    itemTags: ['axe'],
    showInUI: true,
  },
  lifeStealPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // LIFE PER HIT
  lifePerHit: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 8, scaling: (level) => offenseScaling(level) },
    itemTags: ['axe'],
    showInUI: true,
  },
  lifePerHitPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // FIRE DAMAGE
  fireDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 60, bonus: 1, max: Infinity },
    item: { min: 5, max: 25, scaling: (level) => offenseScaling(level) },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  fireDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 12, max: 28, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // COLD DAMAGE
  coldDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 60, bonus: 1, max: Infinity },
    item: { min: 5, max: 25, scaling: (level) => offenseScaling(level) },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  coldDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 12, max: 28, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // AIR DAMAGE
  airDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 60, bonus: 1, max: Infinity },
    item: { min: 5, max: 25, scaling: (level) => offenseScaling(level) },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  airDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 12, max: 28, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // EARTH DAMAGE
  earthDamage: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 60, bonus: 1, max: Infinity },
    item: { min: 5, max: 25, scaling: (level) => offenseScaling(level) },
    itemTags: ['sword', 'gloves'],
    showInUI: true,
  },
  earthDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 12, max: 28, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['sword', 'jewelry', 'gloves'],
  },
  // DOUBLE DAMAGE
  doubleDamageChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.2, max: 1.5, scaling: (level) => offenseScaling(level) },
    itemTags: ['offense', 'gloves'],
    showInUI: true,
  },
  // ELEMENTAL DAMAGE PERCENT
  elementalDamagePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 6, max: 15, scaling: (level) => offenseScaling(level, PERCENT_MULTIPLIER) },
    itemTags: ['offense', 'jewelry', 'gloves'],
  },
};
