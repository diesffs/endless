// Miscellaneous stats
export const MISC_STATS = {
  // MANA
  mana: {
    base: 50,
    decimalPlaces: 0,
    levelUpBonus: 5,
    shop: { available: true, cost: 100, bonus: 5 },
    item: { min: 5, max: 15, scaling: 'capped' },
  },
  manaPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    item: { min: 2, max: 5, scaling: 'capped' },
  },
  // MANA REGEN
  manaRegen: {
    base: 0,
    decimalPlaces: 1,
    levelUpBonus: 0,
    shop: { available: true, cost: 80, bonus: 0.1 },
    item: { min: 0.5, max: 2, scaling: 'capped' },
  },
  manaRegenPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // MANA PER HIT
  manaPerHit: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  manaPerHitPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // STATS
  strength: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  strengthPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  agility: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  agilityPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  vitality: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  vitalityPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  wisdom: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    item: { min: 1, max: 5, scaling: 'full' },
  },
  wisdomPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  endurance: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  endurancePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  dexterity: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  dexterityPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // BONUS GOLD
  bonusGold: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
  },
  bonusGoldPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // BONUS EXPERIENCE
  bonusExperience: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
    item: { min: 5, max: 15, scaling: 'capped' },
  },
  bonusExperiencePercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // COOLDOWN REDUCTION
  cooldownReductionPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // MANA COST REDUCTION
  manaCostReductionPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // BUFF DURATION
  buffDurationPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
  // ITEM BONUSES
  itemBonusesPercent: {
    base: 0,
    decimalPlaces: 0,
    levelUpBonus: 0,
  },
};
