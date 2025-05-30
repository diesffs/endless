// Material definitions
export const MATERIALS = {
  EXPERIENCE_POTION: {
    id: 'experience_potion',
    name: 'Experience Potion',
    icon: '🧪',
    description: 'Grants 1000 experience when used.',
    dropChance: 5,
    sort: 10,
    onUse: (hero, qty = 1) => {
      hero.gainExp(1000 * qty);
    },
  },
  MEDIUM_GOLD_COINS: {
    id: 'medium_gold_coins',
    name: 'Medium Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${1000} gold per coin to your total.`;
    },
    dropChance: 40,
    sort: 40,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000 * qty);
    },
  },
  LARGE_GOLD_COINS: {
    id: 'large_gold_coins',
    name: 'Large Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${10000} gold per coin to your total.`;
    },
    dropChance: 20,
    sort: 50,
    onUse: (hero, qty = 1) => {
      hero.gainGold(10000 * qty);
    },
  },
  ENORMOUS_GOLD_COINS: {
    id: 'enormous_gold_coins',
    name: 'Enormous Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${50000} gold per coin to your total.`;
    },
    dropChance: 1,
    sort: 60,
    onUse: (hero, qty = 1) => {
      hero.gainGold(50000 * qty);
    },
  },
  ELIXIR: {
    id: 'elixir',
    name: 'Elixir',
    icon: '🥤',
    description: 'Grants 1 skill point.',
    dropChance: 1,
    sort: 70,
    onUse: (hero, qty = 1) => {
      hero.skillPoints = (hero.skillPoints || 0) + 1 * qty;
    },
  },
  CRYSTALIZED_ROCK: {
    id: 'crystalized_rock',
    name: 'Crystalized Rock',
    icon: '💎',
    description: 'Gives 1 crystal.',
    dropChance: 40,
    sort: 80,
    onUse: (hero, qty = 1) => {
      hero.crystals += 1 * qty;
    },
  },
  POTION_OF_POWER: {
    id: 'potion_of_power',
    name: 'Potion of Power',
    icon: '💥',
    description: 'Increases strength by 1.',
    dropChance: 10,
    sort: 90,
    onUse: (hero, qty = 1) => {
      hero.permaStats.strength += 1 * qty;
    },
  },
};

import { getCurrentRegion } from './region.js';

/* Utility to get a random material (weighted by dropChance) */
export function getRandomMaterial() {
  const region = getCurrentRegion();
  const materials = Object.values(MATERIALS).filter((m) => m.dropChance > 0);
  const multiplier = region.materialDropMultiplier || 1.0;
  const weights = region.materialDropWeights || {};
  // Calculate total weighted drop chances
  const total = materials.reduce((sum, m) => sum + m.dropChance * multiplier * (weights[m.id] || 1), 0);
  let roll = Math.random() * total;
  for (const mat of materials) {
    const weight = mat.dropChance * multiplier * (weights[mat.id] || 1);
    if (roll < weight) return mat;
    roll -= weight;
  }
  // fallback
  return materials[0];
}
