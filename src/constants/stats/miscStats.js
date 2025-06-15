// Miscellaneous stats
export const MISC_STATS = {
  // MANA
  mana: {
    base: 50,
    decimalPlaces: 0,
    levelUpBonus: 0,
    training: { available: true, cost: 100, bonus: 5 },
    item: { min: 1, max: 3, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.5, max: 2, scaling: 'capped' },
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
    decimalPlaces: 1,
    item: { min: 0.2, max: 1, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  manaPerHitPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  // STATS
  strength: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['misc', 'stat'],
  },
  strengthPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.5, max: 3, scaling: 'capped' },
    itemTags: ['misc'],
  },
  agility: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['misc', 'stat'],
  },
  agilityPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.5, max: 3, scaling: 'capped' },
    itemTags: ['misc'],
  },
  vitality: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['misc', 'stat'],
  },
  vitalityPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.5, max: 3, scaling: 'capped' },
    itemTags: ['misc'],
  },
  wisdom: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  wisdomPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.5, max: 3, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  endurance: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  endurancePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 0.5, max: 3, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  dexterity: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 3, max: 10, scaling: 'full' },
    itemTags: ['misc', 'jewelry', 'stat'],
  },
  dexterityPercent: {
    base: 0,
    decimalPlaces: 0,
    item: { min: 0.5, max: 3, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
  },
  // BONUS GOLD
  bonusGoldPercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  // BONUS EXPERIENCE
  bonusExperiencePercent: {
    base: 0,
    decimalPlaces: 1,
    item: { min: 5, max: 15, scaling: 'capped' },
    itemTags: ['misc', 'jewelry'],
    showInUI: true,
  },
  // COOLDOWN REDUCTION
  cooldownReductionPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // MANA COST REDUCTION
  manaCostReductionPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // BUFF DURATION
  buffDurationPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // ITEM BONUSES
  itemBonusesPercent: {
    base: 0,
    decimalPlaces: 1,
  },
  // Only from materials. permanent skill points
  skillPoints: {
    base: 0,
    decimalPlaces: 0,
    showInUI: true,
  },
  /**
   * Chance (%) to drop extra materials on enemy kill.
   * Only increased via Soul Shop.
   */
  extraMaterialDropPercent: {
    base: 0,
    decimalPlaces: 0,
  },
  /**
   * Max number of extra materials dropped per enemy kill.
   * Only increased via Soul Shop.
   */
  extraMaterialDropMax: {
    base: 1,
    decimalPlaces: 0,
  },
};
