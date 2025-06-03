// Define quest definitions
export const QUEST_DEFINITIONS = [
  {
    id: 'kill10',
    title: 'First Blood',
    description: 'Defeat 10 enemies.',
    type: 'kill',
    target: 10,
    reward: { gold: 100 },
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
];
