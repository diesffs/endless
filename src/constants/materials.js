// Material definitions
export const MATERIALS = {
  EXPERIENCE_POTION: {
    id: 'experience_potion',
    name: 'Experience Potion',
    icon: '🧪',
    description: 'Grants 1000 experience when used.',
    dropChance: 30,
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
  FREAKY_GOLD_COINS: {
    id: 'freaky_gold_coins',
    name: 'Freaky Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${5000000} gold per coin to your total.`;
    },
    dropChance: 0.01,
    sort: 60,
    onUse: (hero, qty = 1) => {
      hero.gainGold(5000000 * qty);
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
      hero.permaStats.skillPoints = hero.permaStats.skillPoints + 1 * qty;
      skillTree.addSkillPoints(1 * qty);
    },
  },
  CRYSTALIZED_ROCK: {
    id: 'crystalized_rock',
    name: 'Crystalized Rock',
    icon: '💎',
    description: 'Gives 1 crystal.',
    dropChance: 30,
    sort: 80,
    onUse: (hero, qty = 1) => {
      hero.crystals += 1 * qty;
    },
  },
  POTION_OF_STRENGTH: {
    id: 'potion_of_strength',
    name: 'Potion of Strength',
    icon: '💥',
    description: 'Increases strength by 1.',
    dropChance: 5,
    sort: 90,
    onUse: (hero, qty = 1) => {
      hero.permaStats.strength += 1 * qty;
    },
  },
  POTION_OF_AGILITY: {
    id: 'potion_of_agility',
    name: 'Potion of Agility',
    icon: '🏃',
    description: 'Increases agility by 1.',
    dropChance: 5,
    sort: 100,
    onUse: (hero, qty = 1) => {
      hero.permaStats.agility += 1 * qty;
    },
  },
  POTION_OF_VITALITY: {
    id: 'potion_of_vitality',
    name: 'Potion of Vitality',
    icon: '❤️',
    description: 'Increases vitality by 1.',
    dropChance: 5,
    sort: 110,
    onUse: (hero, qty = 1) => {
      hero.permaStats.vitality += 1 * qty;
    },
  },
  POTION_OF_ENDURANCE: {
    id: 'potion_of_endurance',
    name: 'Potion of Endurance',
    icon: '🛡️',
    description: 'Increases endurance by 1.',
    dropChance: 5,
    sort: 120,
    onUse: (hero, qty = 1) => {
      hero.permaStats.endurance += 1 * qty;
    },
  },
  POTION_OF_WISDOM: {
    id: 'potion_of_wisdom',
    name: 'Potion of Wisdom',
    icon: '🧠',
    description: 'Increases wisdom by 1.',
    dropChance: 5,
    sort: 130,
    onUse: (hero, qty = 1) => {
      hero.permaStats.wisdom += 1 * qty;
    },
  },
  POTION_OF_DEXTERITY: {
    id: 'potion_of_dexterity',
    name: 'Potion of Dexterity',
    icon: '🎯',
    description: 'Increases dexterity by 1.',
    dropChance: 5,
    sort: 140,
    onUse: (hero, qty = 1) => {
      hero.permaStats.dexterity += 1 * qty;
    },
  },
};
