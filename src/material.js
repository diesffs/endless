// Material definitions
export const MATERIALS = {
  EXPERIENCE_POTION: {
    id: 'experience_potion',
    name: 'Experience Potion',
    icon: '🧪',
    description: 'Grants experience when used.',
    dropChance: 5,
    onUse: (hero, qty = 1) => {
      hero.gainExp(100 * qty);
    },
  },
  GOLD_COINS: {
    id: 'gold_coins',
    name: 'Gold Coins',
    icon: '🪙',
    description: 'Adds gold to your total.',
    dropChance: 5,
    onUse: (hero, qty = 1) => {
      hero.gold += 100 * qty;
    },
  },
  ELIXIR: {
    id: 'elixir',
    name: 'Elixir',
    icon: '🥤',
    description: 'Grants skill points.',
    dropChance: 1,
    onUse: (hero, qty = 1) => {
      hero.skillPoints = (hero.skillPoints || 0) + 1 * qty;
    },
  },
  CRYSTALIZED_ROCK: {
    id: 'crystalized_rock',
    name: 'Crystalized Rock',
    icon: '💎',
    description: 'Gives crystals.',
    dropChance: 2,
    onUse: (hero, qty = 1) => {
      hero.crystals += 1 * qty;
    },
  },
  POTION_OF_POWER: {
    id: 'potion_of_power',
    name: 'Potion of Power',
    icon: '💥',
    description: 'Permanently increases strength.',
    dropChance: 10,
    onUse: (hero, qty = 1) => {
      hero.stats.strength += 1 * qty;
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
