// Define quest definitions
export const QUEST_DEFINITIONS = [
  {
    id: 'kill10',
    title: 'First Blood',
    description: 'Defeat 10 enemies.',
    type: 'kill',
    target: 10,
    reward: { gold: 100, crystals: 1 },
    icon: '⚔️',
  },
  {
    id: 'kill100',
    title: 'Rampage',
    description: 'Defeat 100 enemies.',
    type: 'kill',
    target: 100,
    reward: { gold: 500 },
    icon: '💥',
  },
  {
    id: 'kill1000',
    title: 'Rampage',
    description: 'Defeat 1000 enemies.',
    type: 'kill',
    target: 1000,
    reward: { gold: 5000 },
    icon: '💥',
  },
];
