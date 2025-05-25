// Material definitions
export const MATERIALS = {
  EXPERIENCE_POTION: {
    id: 'experience_potion',
    name: 'Experience Potion',
    icon: '🧪',
    description: 'Grants 100 experience when used.',
    dropChance: 5,
    sort: 10,
    onUse: (hero, qty = 1) => {
      hero.gainExp(100 * qty);
    },
  },
  TINY_GOLD_COINS: {
    id: 'tiny_gold_coins',
    name: 'Tiny Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${100} gold per coin to your total.`;
    },
    dropChance: 100,
    sort: 20,
    onUse: (hero, qty = 1) => {
      hero.gainGold(100 * qty);
    },
  },
  SMALL_GOLD_COINS: {
    id: 'small_gold_coins',
    name: 'Small Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${500} gold per coin to your total.`;
    },
    dropChance: 50,
    sort: 30,
    onUse: (hero, qty = 1) => {
      hero.gainGold(500 * qty);
    },
  },
  MEDIUM_GOLD_COINS: {
    id: 'medium_gold_coins',
    name: 'Medium Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${1000} gold per coin to your total.`;
    },
    dropChance: 20,
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
      return `Adds ${5000} gold per coin to your total.`;
    },
    dropChance: 10,
    sort: 50,
    onUse: (hero, qty = 1) => {
      hero.gainGold(5000 * qty);
    },
  },
  ENORMOUS_GOLD_COINS: {
    id: 'enormous_gold_coins',
    name: 'Enormous Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${50000} gold per coin to your total.`;
    },
    dropChance: 2,
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

// Utility to get a random material (weighted by dropChance)
export function getRandomMaterial() {
  const materials = Object.values(MATERIALS).filter((m) => m.dropChance > 0);
  const total = materials.reduce((sum, m) => sum + m.dropChance, 0);
  let roll = Math.random() * total;
  for (const mat of materials) {
    if (roll < mat.dropChance) return mat;
    roll -= mat.dropChance;
  }
  // fallback (shouldn't happen)
  return materials[0];
}
