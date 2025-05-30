// Miscellaneous stats
export const MISC_STATS = {
  // MANA
  mana: {
    base: 50,
    decimalPlaces: 0,
    levelUpBonus: 5,
    training: { available: true, cost: 100, bonus: 5 },
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // MANA REGEN
  manaRegen: {
    base: 0,
    decimalPlaces: 1,
    training: { available: true, cost: 300, bonus: 0.1 },
    item: { min: 0.5, max: 2, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaRegenPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // MANA PER HIT
  manaPerHit: {
    base: 0,
    decimalPlaces: 0,
  },
  manaPerHitPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // STATS
  strength: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 5, scaling: 'capped' },
    itemTags: ['misc'],
  },
  strengthPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  agility: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 5, scaling: 'capped' },
    itemTags: ['misc'],
  },
  agilityPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  vitality: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 5, scaling: 'capped' },
    itemTags: ['misc'],
  },
  vitalityPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  wisdom: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 1, max: 5, scaling: 'full' },
    itemTags: ['misc', 'jewelry'],
  },
  wisdomPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  endurance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 2, max: 8, scaling: 'full' },
    itemTags: ['misc', 'jewelry'],
  },
  endurancePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  dexterity: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 1, max: 5, scaling: 'full' },
    itemTags: ['misc', 'jewelry'],
  },
  dexterityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // BONUS GOLD
  bonusGold: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  bonusGoldPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // BONUS EXPERIENCE
  bonusExperience: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  bonusExperiencePercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // COOLDOWN REDUCTION
  cooldownReductionPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // MANA COST REDUCTION
  manaCostReductionPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // BUFF DURATION
  buffDurationPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // ITEM BONUSES
  itemBonusesPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.1, max: 0.5, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
};
