// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: 'Crystal Lab',
    description: 'Generates crystals over time.',
    icon: '💎',
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 'hour' },
    cost: 1000,
    maxLevel: 500,
    bonusType: 'crystal',
    bonusAmount: 1,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    name: 'Gold Mine',
    description: 'Produces gold every few minutes.',
    icon: '⛏️',
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 'minute' },
    cost: 500,
    maxLevel: 1000,
    bonusType: 'gold',
    bonusAmount: 10,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    name: 'Soul Forge',
    description: 'Converts resources into souls.',
    icon: '🔥',
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 1, interval: '10min' },
    cost: 2000,
    maxLevel: 300,
    bonusType: 'soul',
    bonusAmount: 1,
    unlockRequirements: {},
  },
  // Add more buildings as needed
};
