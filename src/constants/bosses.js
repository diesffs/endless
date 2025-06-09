/**
 * List of boss definitions for the Arena.
 * Each boss has a level, unique id, display name, image path, stats, and rewards.
 */
export const BOSSES = [
  {
    id: 'goblin-king',
    name: 'Goblin King',
    image: 'enemies/goblin-king.jpg',
    attackSpeed: 0.8, // attacks per second
    // Multipliers for scaling
    lifeMultiplier: 1,
    damageMultiplier: 1,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1,
    materialDropWeights: {},
    reward: { souls: 1, crystals: 1, gold: 10000, materials: [{ id: 'experience_potion', qty: 1 }] },
  },
  {
    id: 'stone-golem',
    name: 'Stone Golem',
    image: 'enemies/obsidian-golem.jpg',
    attackSpeed: 1, // attacks per second
    // Multipliers for scaling
    lifeMultiplier: 1.5,
    damageMultiplier: 1.3,
    xpMultiplier: 1.6,
    goldMultiplier: 1.2,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1,
    materialDropWeights: {},
    reward: { souls: 1, crystals: 2, gold: 25000, materials: [{ id: 'crystalized_rock', qty: 1 }] },
  },
  {
    id: 'fire-drake',
    name: 'Fire Drake',
    image: 'enemies/ember-drake.jpg',
    attackSpeed: 1.2, // attacks per second
    // Multipliers for scaling
    lifeMultiplier: 2,
    damageMultiplier: 1.5,
    xpMultiplier: 3,
    goldMultiplier: 1,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1,
    materialDropWeights: {},
    reward: { souls: 2, crystals: 5, gold: 50000, materials: [{ id: 'elixir', qty: 1 }] },
  },
];
