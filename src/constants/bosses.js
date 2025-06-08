/**
 * List of boss definitions for the Arena.
 * Each boss has a level, unique id, display name, image path, stats, and rewards.
 */
export const BOSSES = [
  {
    level: 1,
    id: 'goblin-king',
    name: 'Goblin King',
    image: 'enemies/goblin-king.jpg',
    attackSpeed: 1, // attacks per second
    // Multipliers for scaling
    lifeMultiplier: 1,
    damageMultiplier: 1,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1,
    materialDropWeights: {},
    reward: { crystals: 1, gold: 100, materials: [{ id: 'experience_potion', qty: 1 }] },
  },
  {
    level: 2,
    id: 'stone-golem',
    name: 'Stone Golem',
    image: 'enemies/obsidian-golem.jpg',
    attackSpeed: 1, // attacks per second
    // Multipliers for scaling
    lifeMultiplier: 1,
    damageMultiplier: 1,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1,
    materialDropWeights: {},
    reward: { crystals: 2, gold: 250, materials: [{ id: 'crystalized_rock', qty: 1 }] },
  },
  {
    level: 3,
    id: 'fire-drake',
    name: 'Fire Drake',
    image: 'enemies/ember-drake.jpg',
    attackSpeed: 1, // attacks per second
    // Multipliers for scaling
    lifeMultiplier: 1,
    damageMultiplier: 1,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1,
    materialDropWeights: {},
    reward: { crystals: 5, gold: 1000, materials: [{ id: 'elixir', qty: 1 }] },
  },
];
