// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: 'Crystal Lab',
    description: 'Generates crystals over time.',
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 'hour' },
    cost: { gold: 3000, crystal: 10 }, // Changed to cost crystals
    maxLevel: 50000,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    name: 'Gold Mine',
    description: 'Produces gold every few minutes.',
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 'minute' },
    cost: { gold: 15000 }, // Changed to cost gold
    maxLevel: 100000,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    name: 'Soul Forge',
    description: 'Converts resources into souls.',
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 5, interval: 'hour' },
    cost: { gold: 15000, soul: 40 }, // Changed to cost gold and souls
    maxLevel: 30000,
    unlockRequirements: {},
  },
  // Add more buildings as needed
};
