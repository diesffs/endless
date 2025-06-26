// Scaling multiplier for all defense stats
export const DEFENSE_SCALING_MULTIPLIER = 0.035;
// Generic scaling function for all defense stats
export const defenseScaling = (level, scaling = DEFENSE_SCALING_MULTIPLIER, base = 1) => {
  return base + level * scaling;
};

// Defense stats
export const DEFENSE_STATS = {
  // LIFE
  life: {
    base: 100,
    decimalPlaces: 0,
    levelUpBonus: 1,
    training: { cost: 80, bonus: 5, max: Infinity },
    item: { min: 30, max: 80, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense'],
    showInUI: true,
  },
  lifePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 10, scaling: (level) => defenseScaling(level) },
    itemTags: ['pants'],
  },
  // ARMOR
  armor: {
    base: 0,
    decimalPlaces: 0,
    training: { cost: 100, bonus: 3, max: Infinity },
    item: { min: 10, max: 30, scaling: (level) => defenseScaling(level) },
    itemTags: ['defense'],
    showInUI: true,
  },
  armorPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 2, max: 9, scaling: (level) => defenseScaling(level) },
    itemTags: ['armor'],
  },
  // BLOCK CHANCE
  blockChance: {
    base: 0,
    decimalPlaces: 1,
    training: { cost: 400, bonus: 0.1, max: Infinity },
    item: { min: 2, max: 6, scaling: (level) => defenseScaling(level) },
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
    training: { cost: 200, bonus: 0.1, max: Infinity },
    item: { min: 1, max: 10, scaling: (level) => defenseScaling(level) },
    itemTags: ['belt'],
    showInUI: true,
  },
  lifeRegenPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // THORNS
  thornsDamage: {
    base: 0,
    decimalPlaces: 1,
  },
  thornsDamagePercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // RESURRECTION
  resurrectionChance: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 1, max: 5, scaling: (level) => defenseScaling(level) },
    itemTags: ['amulet'],
    showInUI: true,
  },
  reflectFireDamage: {
    base: 0,
    decimalPlaces: 0,
  },
};
