export const CLASS_PATHS = {
  WARRIOR: {
    name: 'Warrior',
    baseStats: {
      strength: 5,
      vitality: 3,
      armor: 10,
      maxHealth: 50
    },
    description: 'A mighty warrior specializing in heavy armor and raw strength'
  },
  ROGUE: {
    name: 'Rogue',
    baseStats: {
      agility: 5,
      critChance: 5,
      attackSpeed: 0.1,
      damage: 5
    },
    description: 'Swift and deadly, focusing on critical hits and attack speed'
  },
  VAMPIRE: {
    name: 'Vampire',
    baseStats: {
      lifeSteal: 5,
      nightDamage: 10,
      critDamage: 0.2,
      maxHealth: 30
    },
    description: 'Master of life-stealing and night powers'
  },
  PALADIN: {
    name: 'Paladin',
    baseStats: {
      blockChance: 10,
      armor: 15,
      holyDamage: 10,
      maxHealth: 40
    },
    description: 'Holy warrior specializing in defense and divine power'
  },
  BERSERKER: {
    name: 'Berserker',
    baseStats: {
      damage: 15,
      attackSpeed: 0.2,
      rageDamage: 10,
      strength: 3
    },
    description: 'Frenzied fighter that gets stronger as health decreases'
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    baseStats: {
      elementalDamage: 20,
      critChance: 3,
      spellPower: 10,
      maxHealth: 20
    },
    description: 'Master of elemental magic and devastating spells'
  }
};


export const SKILL_TREES = {
  WARRIOR: {
    // Row 1
    'bash': {
      name: 'Bash',
      row: 1,
      description: 'A powerful strike that deals extra damage',
      prerequisites: [],
      effect: (level) => ({
        damage: level * 5
      })
    },
    'toughness': {
      name: 'Toughness',
      row: 1,
      description: 'Increases armor and health',
      prerequisites: [],
      effect: (level) => ({
        armor: level * 3,
        maxHealth: level * 10
      })
    },
    // Row 2 skills would require Row 1 skills
    'doubleStrike': {
      name: 'Double Strike',
      row: 2,
      description: 'Attack twice in quick succession',
      prerequisites: ['bash'],
      effect: (level) => ({
        attackSpeed: level * 0.05,
        damage: level * 3
      })
    }
    // Add more skills...
  },
  // Add other class paths...
};
