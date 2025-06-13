// src/constants/buildings.js
// Building definitions for Endless

export const BUILDINGS = [
  {
    id: 'gold-mine',
    name: 'Gold Mine',
    description: 'Produces gold automatically over time. More mines = more gold.',
    cost: { gold: 1000 },
    bonus: { goldPerMinute: 10 },
    image: 'buildings/gold-mine.png',
  },
  {
    id: 'crystal-lab',
    name: 'Crystal Lab',
    description: 'Generates rare crystals every minute. Essential for advanced upgrades.',
    cost: { crystals: 10 },
    bonus: { crystalsPerMinute: 0.1 },
    image: 'buildings/crystal-lab.png',
  },
  {
    id: 'soul-forge',
    name: 'Soul Forge',
    description: 'Harvests souls from the void, even while you are away.',
    cost: { souls: 5 },
    bonus: { soulsPerMinute: 0.05 },
    image: 'buildings/soul-forge.png',
  },
  // Add more buildings as needed
];
