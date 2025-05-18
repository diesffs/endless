export const SKILL_LEVEL_TIERS = [10, 20, 30, 50, 75, 100, 150];
export const DEFAULT_MAX_SKILL_LEVEL = 100;
export const REQ_LEVEL_FOR_SKILL_TREE = 10;

export const CLASS_PATHS = {
  WARRIOR: {
    name: 'Warrior',
    enabled: true,
    avatar: 'warrior-avatar.jpg',
    baseStats: {
      strength: 20,
      vitality: 20,
      armor: 60,
      lifePercent: 30,
    },
    description: 'A mighty warrior specializing in heavy armor and raw strength',
  },
  ROGUE: {
    name: 'Rogue',
    enabled: true,
    avatar: 'rogue-avatar.jpg',
    baseStats: {
      agility: 40,
      critChance: 5,
      attackSpeed: 0.3,
      damage: 30,
    },
    description: 'Swift and deadly, focusing on critical hits and attack speed',
  },
  VAMPIRE: {
    name: 'Vampire',
    enabled: true,
    avatar: 'vampire-avatar.jpg',
    baseStats: {
      lifeSteal: 1,
      critDamage: 0.5,
      attackSpeed: 0.2,
      damage: 25,
    },
    description: 'Master of life-stealing and critical strikes',
  },
  PALADIN: {
    name: 'Paladin',
    enabled: true,
    avatar: 'paladin-avatar.jpg',
    baseStats: {
      blockChance: 10,
      armor: 100,
      vitality: 50,
      lifePercent: 20,
    },
    description: 'Holy warrior specializing in defense and vitality',
  },
  BERSERKER: {
    name: 'Berserker',
    enabled: true,
    avatar: 'berserker-avatar.jpg',
    baseStats: {
      damage: 50,
      attackSpeed: 0.5,
      damagePercent: 20,
      lifePercent: -30,
    },
    description: 'Frenzied fighter focusing on raw damage output',
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    enabled: true,
    avatar: 'elementalist-avatar.jpg',
    baseStats: {
      fireDamage: 100,
      airDamage: 100,
      coldDamage: 100,
      earthDamage: 100,
    },
    description: 'Master of elemental damage types',
  },
};

export const SKILL_TREES = {
  WARRIOR: {
    // Tier 0 Skills
    bash: {
      id: 'bash',
      name: 'Bash',
      type: 'toggle',
      manaCost: 5,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'war-axe',
      description: 'While active, increases damage but costs mana per attack',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 15,
      }),
    },
    toughness: {
      id: 'toughness',
      name: 'Toughness',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'shield',
      description: 'Permanently increases armor',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 30,
      }),
    },

    experienceBoost: {
      id: 'experienceBoost',
      name: 'Experience Boost',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'book',
      description: 'Increases experience gained from battles',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        bonusExperience: level * 5,
      }),
    },

    // Tier 1 Skills
    powerStrike: {
      id: 'powerStrike',
      name: 'Power Strike',
      type: 'instant',
      manaCost: 20,
      cooldown: 4000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'sword',
      description: 'A powerful strike that deals increased damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 80,
      }),
    },
    ironWill: {
      id: 'ironWill',
      name: 'Iron Will',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'helmet',
      description: 'Increases resistance to damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 15,
        vitality: level * 5,
        lifeRegen: level * 1,
      }),
    },

    // Tier 2 Skills
    battleCry: {
      id: 'battleCry',
      name: 'Battle Cry',
      type: 'buff',
      manaCost: 40,
      cooldown: 60000,
      duration: 45000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'cry',
      description: 'Temporarily increases damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 30,
      }),
    },
    fortitude: {
      id: 'fortitude',
      name: 'Fortitude',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'armor',
      description: 'Increases life regeneration',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeRegen: level * 5,
      }),
    },

    // Tier 3 Skills
    groundSlam: {
      id: 'groundSlam',
      name: 'Ground Slam',
      type: 'instant',
      manaCost: 25,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'slam',
      description: 'Deals instant damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 180,
      }),
    },
    goldRush: {
      id: 'goldRush',
      name: 'Gold Rush',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'coin',
      description: 'Increases gold gained from battles by %',
      maxLevel: Infinity,
      effect: (level) => ({
        bonusGold: level * 10,
      }),
    },

    // Tier 4 Skills
    shieldWall: {
      id: 'shieldWall',
      name: 'Shield Wall',
      type: 'buff',
      manaCost: 50,
      cooldown: 60000,
      duration: 50000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'wall',
      description: 'Increases armor and block chance temporarily',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 100,
        blockChance: level * 0.2,
      }),
    },

    // Tier 5 Skills
    berserk: {
      id: 'berserk',
      name: 'Berserk',
      type: 'toggle',
      manaCost: 25,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'berserk',
      description: 'Gives huge amounts of physical and fire damage',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 40,
        fireDamage: level * 160,
      }),
    },

    lastStand: {
      id: 'lastStand',
      name: 'Last Stand',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'last-stand',
      description: 'Greatly increases offensive stats',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
        lifeSteal: level * 0.02,
        attackSpeed: level * 0.01,
        attackRating: level * 200,
      }),
    },

    // Tier 6 Skills
    warlord: {
      id: 'warlord',
      name: 'Warlord',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'warlord',
      description: 'Increases all attributes significantly',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        strength: level * 8,
        vitality: level * 8,
        agility: level * 8,
        wisdom: level * 8,
        endurance: level * 8,
        dexterity: level * 8,
      }),
    },
  },

  ROGUE: {
    // Tier 0 Skills
    shadowDance: {
      id: 'shadowDance',
      name: 'Shadow Dance',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'dagger',
      description: 'A quick dance from the shadows, increasing your damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 5,
        critChance: level * 0.1,
        agility: level * 3,
      }),
    },
    evasion: {
      id: 'evasion',
      name: 'Evasion',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'dodge',
      description: `
        Increases armor and block chance. 
        Additionally, when blocking, you also recover life equal to 5% of your maximum life.
        `,
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        blockChance: level * 0.2,
        armor: level * 10,
      }),
    },
    quickLearner: {
      id: 'quickLearner',
      name: 'Quick Learner',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'book',
      description: 'Increases experience gained from battles.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        bonusExperience: level * 5,
      }),
    },

    // Tier 1 Skills
    poisonDagger: {
      id: 'poisonDagger',
      name: 'Poison Dagger',
      type: 'toggle',
      manaCost: 5,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'poison',
      description: 'Applies physical damage to your attacks.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 25,
      }),
    },
    shadowForm: {
      id: 'shadowForm',
      name: 'Shadow Form',
      type: 'buff',
      manaCost: 20,
      cooldown: 60000,
      duration: 45000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'stealth',
      description: 'Shadow form increases crit chance, life steal and dexterity (crit damage).',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        critChance: level * 0.1,
        lifeSteal: level * 0.02,
        dexterity: level * 10,
      }),
    },

    // Tier 2 Skills
    flurry: {
      id: 'flurry',
      name: 'Flurry',
      type: 'instant',
      manaCost: 25,
      cooldown: 3000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'flurry',
      description: 'Unleash a series of rapid attacks, dealing bonus damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 150,
      }),
    },
    precision: {
      id: 'precision',
      name: 'Precision',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'agility',
      description: 'Significantly increases agility.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        agility: level * 40,
      }),
    },

    // Tier 3 Skills
    backstab: {
      id: 'backstab',
      name: 'Backstab',
      type: 'instant',
      manaCost: 40,
      cooldown: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'backstab',
      description: 'A devastating attack from behind, dealing massive damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 400,
      }),
    },
    goldRush: {
      id: 'goldRush',
      name: 'Gold Rush',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'coin',
      description: 'Increases gold gained from battles.',
      maxLevel: Infinity,
      effect: (level) => ({
        bonusGold: level * 10,
      }),
    },

    // Tier 4 Skills
    darkPact: {
      id: 'darkPact',
      name: 'Dark Pact',
      type: 'buff',
      manaCost: 50,
      cooldown: 66000,
      duration: 40000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'dark-pact',
      description: 'Massively increases crit damage temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        critDamage: level * 0.5,
      }),
    },

    // Tier 5 Skills
    assassination: {
      id: 'assassination',
      name: 'Assassination',
      type: 'toggle',
      manaCost: 30,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'assassination',
      description: 'Greatly increases damage per hit.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 150,
      }),
    },

    deadlyPrecision: {
      id: 'deadlyPrecision',
      name: 'Deadly Precision',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'precision',
      description: 'Permanently increases crit chance and crit damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        critDamage: level * 0.3,
        attackRating: level * 100,
        attackRatingPercent: level * 5,
      }),
    },

    // Tier 6 Skills
    masterThief: {
      id: 'masterThief',
      name: 'Master Thief',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'master',
      description: 'Greatly increases attributes and gold gains.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        agility: level * 15,
        dexterity: level * 10,
        strength: level * 10,
        wisdom: level * 5,
        bonusGold: level * 25,
      }),
    },
  },

  VAMPIRE: {
    // Tier 1 Skills
    bloodSiphon: {
      id: 'bloodSiphon',
      name: 'Blood Siphon',
      type: 'toggle',
      manaCost: 5,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'blood',
      description: 'Steal life from enemies with each attack.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifePerHit: level * 1,
        damage: level * 3,
      }),
    },
    nightStalker: {
      id: 'nightStalker',
      name: 'Night Stalker',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'moon',
      description: 'Increases damage at night.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 3,
        agility: level * 6,
      }),
    },
    bloodHunger: {
      id: 'bloodHunger',
      name: 'Blood Hunger',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'fangs',
      description: 'Increases experience gained from enemies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        bonusExperience: level * 5,
      }),
    },

    // Tier 10 Skills
    vampiricStrike: {
      id: 'vampiricStrike',
      name: 'Vampiric Strike',
      type: 'instant',
      manaCost: 15,
      cooldown: 3000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'bite',
      description: 'A powerful strike that restores life.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 12,
      }),
    },
    darkAura: {
      id: 'darkAura',
      name: 'Dark Aura',
      type: 'buff',
      manaCost: 20,
      cooldown: 40000,
      duration: 40000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'blood-aura',
      description: 'Increases life steal and damage temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 0.05,
        damagePercent: level * 2,
      }),
    },

    // Tier 25 Skills
    drainingTouch: {
      id: 'drainingTouch',
      name: 'Draining Touch',
      type: 'instant',
      manaCost: 25,
      cooldown: 2000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'drain',
      description: 'Drains life from enemies, restoring your life.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 8,
        lifePerHit: level * 15,
      }),
    },
    greaterBloodHunger: {
      id: 'greaterBloodHunger',
      name: 'Greater Blood Hunger',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'bloodlust',
      description: 'Greatly increases experience gained and life steal.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        strength: level * 5,
        vitality: level * 10,
      }),
    },

    // Tier 50 Skills
    crimsonBurst: {
      id: 'crimsonBurst',
      name: 'Crimson Burst',
      type: 'instant',
      manaCost: 30,
      cooldown: 3000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'burst',
      description: 'Unleashes a burst of crimson energy, greatly damaging the enemy at the cost of life.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 50,
        lifePerHit: level * -20,
      }),
    },
    treasureHunter: {
      id: 'treasureHunter',
      name: 'Treasure Hunter',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'gold',
      description: 'Increases gold gained from battles.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        bonusGold: level * 25,
      }),
    },

    // Tier 75 Skills
    bloodPact: {
      id: 'bloodPact',
      name: 'Blood Pact',
      type: 'buff',
      manaCost: 50,
      cooldown: 60000,
      duration: 120000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'pact',
      description: 'Increases life steal and life temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifePercent: level * 4,
      }),
    },

    // Tier 100 Skills
    eternalThirst: {
      id: 'eternalThirst',
      name: 'Eternal Thirst',
      type: 'toggle',
      manaCost: 35,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'thirst',
      description: 'Increases life steal and damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 0.1,
        damage: level * 10,
        earthDamage: level * 50,
      }),
    },
    deathlyPresence: {
      id: 'deathlyPresence',
      name: 'Deathly Presence',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'presence',
      description: 'Increases life steal, damage, and life permanently.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damagePercent: level * 1,
        lifePercent: level * 1,
        strengthPercent: level * 1,
        vitalityPercent: level * 1,
      }),
    },

    // Tier 200 Skills
    lordOfNight: {
      id: 'lordOfNight',
      name: 'Lord of Night',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'lord',
      description: 'Greatly increases all attributes and life steal.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        strength: level * 10,
        vitality: level * 10,
        wisdom: level * 10,
        wisdomPercent: level * 2,
      }),
    },
  },

  PALADIN: {
    // Tier 1 Skills
    holyLight: {
      id: 'holyLight',
      name: 'Holy Light',
      type: 'instant',
      manaCost: 10,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'light',
      description: 'A burst of holy light that heals allies and damages enemies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        life: level * 5,
        damage: level * 3,
      }),
    },
    shieldBash: {
      id: 'shieldBash',
      name: 'Shield Bash',
      type: 'instant',
      manaCost: 10,
      cooldown: 1400,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'bash',
      description: 'Bashes an enemy with your shield, stunning them.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 20,
      }),
    },
    divineProtection: {
      id: 'divineProtection',
      name: 'Divine Protection',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'protection',
      description: 'Greatly increases armor and block chance.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 10,
        blockChance: level * 0.3,
      }),
    },

    // Tier 10 Skills
    consecration: {
      id: 'consecration',
      name: 'Consecration',
      type: 'buff',
      manaCost: 25,
      cooldown: 10000,
      duration: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'consecration',
      description: 'Blesses the ground, dealing holy damage to enemies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 5,
      }),
    },
    greaterHealing: {
      id: 'greaterHealing',
      name: 'Greater Healing',
      type: 'instant',
      manaCost: 30,
      cooldown: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'heal',
      description: 'Heals a large amount of life instantly.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        life: level * 10,
      }),
    },

    // Tier 25 Skills
    divineShield: {
      id: 'divineShield',
      name: 'Divine Shield',
      type: 'buff',
      manaCost: 40,
      cooldown: 15000,
      duration: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'holy-shield',
      description: 'Creates a shield that absorbs damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        blockChance: level * 15,
      }),
    },
    auraOfLight: {
      id: 'auraOfLight',
      name: 'Aura of Light',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'holy-aura',
      description: 'Increases healing effects and reduces damage taken.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifePercent: level * 5,
        armorPercent: level * 2,
      }),
    },

    // Tier 50 Skills
    wrathOfTheHeavens: {
      id: 'wrathOfTheHeavens',
      name: 'Wrath of the Heavens',
      type: 'instant',
      manaCost: 50,
      cooldown: 12000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'wrath',
      description: 'Calls down holy energy to smite enemies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 20,
        fireDamage: level * 10,
        airDamage: level * 10,
      }),
    },
    beaconOfFaith: {
      id: 'beaconOfFaith',
      name: 'Beacon of Faith',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'beacon',
      description: 'Increases healing done.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeRegen: level * 3,
        lifeRegenPercent: level * 1,
      }),
    },

    // Tier 75 Skills
    holyBarrier: {
      id: 'holyBarrier',
      name: 'Holy Barrier',
      type: 'buff',
      manaCost: 60,
      cooldown: 20000,
      duration: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'barrier',
      description: 'Creates a holy barrier that absorbs damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeRegen: level * 8,
        life: level * 10,
      }),
    },

    // Tier 100 Skills
    divineWrath: {
      id: 'divineWrath',
      name: 'Divine Wrath',
      type: 'toggle',
      manaCost: 40,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'wrath',
      description: 'Unleashes divine energy to increase damage and healing.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
        lifePerHit: level * 20,
      }),
    },
    guardianAngel: {
      id: 'guardianAngel',
      name: 'Guardian Angel',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'angel',
      description: 'Provides a chance to resurrect with maximum life upon death',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        resurrectionChance: level * 0.5,
      }),
    },

    // Tier 200 Skills
    ascension: {
      id: 'ascension',
      name: 'Ascension',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'ascension',
      description: 'Grants significant bonuses to all attributes.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        strength: level * 5,
        vitality: level * 5,
        attackRating: level * 20,
        attackRatingPercent: level * 2,
        wisdom: level * 10,
        mana: level * 10,
        manaPercent: level * 5,
        manaPercent: level * 2,
      }),
    },
  },

  BERSERKER: {
    // Tier 1 Skills
    frenzy: {
      id: 'frenzy',
      name: 'Frenzy',
      type: 'toggle',
      manaCost: 10,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'frenzy',
      description: 'Increases attack speed and damage while active.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 16,
        lifePerHit: level * -1,
      }),
    },
    toughSkin: {
      id: 'toughSkin',
      name: 'Tough Skin',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'tough-skin',
      description: 'Increases armor and reduces damage taken.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 18,
        armorPercent: level * 2,
      }),
    },

    // Tier 10 Skills
    recklessSwing: {
      id: 'recklessSwing',
      name: 'Reckless Swing',
      type: 'instant',
      manaCost: 20,
      cooldown: 1000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'swing',
      description: 'A powerful strike that sacrifices life for damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 100,
        lifePerHit: level * -10,
      }),
    },
    battleCry: {
      id: 'battleCry',
      name: 'Battle Cry',
      type: 'buff',
      manaCost: 25,
      cooldown: 12000,
      duration: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'battle-cry',
      description: 'Boosts damage and attack speed temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damagePercent: level * 1,
        attackSpeed: level * 0.02,
        lifeSteal: level * 0.03,
      }),
    },

    // Tier 25 Skills
    berserkersRage: {
      id: 'berserkersRage',
      name: `Berserker's Rage`,
      type: 'toggle',
      manaCost: 30,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'berserker-rage',
      description: 'Greatly increases damage but lowers defense.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamage: level * 60,
        coldDamage: level * 60,
        doubleDamageChance: level * 0.2,
      }),
    },
    greaterFrenzy: {
      id: 'greaterFrenzy',
      name: 'Greater Frenzy',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'greater-rage',
      description: 'Further enhances attack speed and damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        attackSpeed: level * 0.01,
        lifePerHit: level * 5,
      }),
    },

    // Tier 50 Skills
    earthquake: {
      id: 'earthquake',
      name: 'Earthquake',
      type: 'instant',
      manaCost: 50,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'earthquake',
      description: 'Smashes the ground, dealing earth damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 20,
        earthDamage: level * 150,
      }),
    },
    rageMastery: {
      id: 'rageMastery',
      name: 'Rage Mastery',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'mastery',
      description: 'Increases critical chance and critical damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        critChance: level * 0.1,
        critDamage: level * 0.01,
        doubleDamageChance: level * 0.1,
        attackRating: level * 30,
      }),
    },

    // Tier 75 Skills
    bloodLust: {
      id: 'bloodLust',
      name: 'Blood Lust',
      type: 'buff',
      manaCost: 60,
      cooldown: 20000,
      duration: 20000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'bloodlust',
      description: 'Increases attack speed and life steal temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        attackSpeed: level * 0.01,
        lifeSteal: level * 0.02,
        lifePercent: level * 5,
      }),
    },

    // Tier 100 Skills
    unbridledFury: {
      id: 'unbridledFury',
      name: 'Unbridled Fury',
      type: 'toggle',
      manaCost: 0,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'fury',
      description: 'Increases damage and attack speed at the cost of life.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
        manaPerHit: level * 3,
      }),
    },
    undyingRage: {
      id: 'undyingRage',
      name: 'Undying Rage',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'undying',
      description: 'Provides a chance to survive fatal damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        resurrectionChance: level * 0.25,
        lifeRegen: level * 8,
      }),
    },

    // Tier 200 Skills
    warlord: {
      id: 'warlord',
      name: 'Warlord',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'warlord',
      description: 'Significantly increases all combat stats.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        strength: level * 10,
        strengthPercent: level * 2,
        critChance: level * 0.2,
        attackSpeed: level * 0.01,
        damage: level * 20,
      }),
    },
  },

  ELEMENTALIST: {
    // Tier 1 Skills
    fireball: {
      id: 'fireball',
      name: 'Fireball',
      type: 'instant',
      manaCost: 10,
      cooldown: 800,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'fireball',
      description: 'Launches a fireball that deals fire damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamage: level * 50,
      }),
    },
    frostArmor: {
      id: 'frostArmor',
      name: 'Frost Armor',
      type: 'buff',
      manaCost: 30,
      cooldown: 8000,
      duration: 10000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'frost-armor',
      description: 'Encases the caster in frost, increasing armor.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 50,
      }),
    },

    warmth: {
      id: 'warmth',
      name: 'Warmth',
      type: 'passive',
      manaCost: 30,
      cooldown: 8000,
      duration: 10000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'storm', // TODO: change
      description: 'Increases mana and mana regeneration',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        mana: level * 10,
        manaRegen: level * 0.5,
        wisdom: level * 2,
      }),
    },

    // Tier 10 Skills
    lightningStrike: {
      id: 'lightningStrike',
      name: 'Lightning Strike',
      type: 'instant',
      manaCost: 25,
      cooldown: 1500,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'lightning',
      description: 'Strikes an enemy with a bolt of lightning.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        airDamage: level * 86,
      }),
    },
    elementalMastery: {
      id: 'elementalMastery',
      name: 'Elemental Mastery',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'elemental-mastery',
      description: 'Increases all elemental damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        elementalDamagePercent: level * 2,
      }),
    },

    // Tier 25 Skills
    blizzard: {
      id: 'blizzard',
      name: 'Blizzard',
      type: 'buff',
      manaCost: 40,
      cooldown: 15000,
      duration: 20000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'blizzard',
      description: 'Summons a blizzard, covering the battlefield in frost.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        coldDamagePercent: level * 8,
        airDamagePercent: level * 8,
      }),
    },
    arcaneWisdom: {
      id: 'arcaneWisdom',
      name: 'Arcane Wisdom',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'wisdom',
      description: 'Increases mana and mana regeneration.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        manaPercent: level * 1,
        manaRegen: level * 1,
      }),
    },

    // Tier 50 Skills
    elementalStorm: {
      id: 'elementalStorm',
      name: 'Elemental Storm',
      type: 'instant',
      manaCost: 60,
      cooldown: 2000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'storm',
      description: 'Unleashes a storm of fire, ice, and lightning.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamage: level * 12,
        coldDamage: level * 12,
        airDamage: level * 12,
      }),
    },
    elementalAffinity: {
      id: 'elementalAffinity',
      name: 'Elemental Affinity',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'affinity',
      description: 'Increases resistance to elemental damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamagePercent: level * 4,
        coldDamagePercent: level * 4,
        airDamagePercent: level * 4,
      }),
    },

    // Tier 75 Skills
    arcanePulse: {
      id: 'arcanePulse',
      name: 'Arcane Pulse',
      type: 'buff',
      manaCost: 70,
      cooldown: 30000,
      duration: 60000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'pulse',
      description: 'Increases buffs duration and reduces cooldowns temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        cooldownReductionPercent: level * 5,
        buffDurationPercent: level * 5,
      }),
    },

    // Tier 100 Skills
    elementalOverload: {
      id: 'elementalOverload',
      name: 'Elemental Overload',
      type: 'toggle',
      manaCost: 0,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'overload',
      description: 'Boosts all elemental damage at the cost of mana regeneration.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        manaPerHit: level * 25,
      }),
    },
    primordialControl: {
      id: 'primordialControl',
      name: 'Primordial Control',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'control',
      description: 'Grants control over elemental forces, increasing all stats.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        earthDamage: level * 100,
        mana: level * 20,
      }),
    },

    // Tier 200 Skills
    avatarOfTheElements: {
      id: 'avatarOfTheElements',
      name: 'Avatar of the Elements',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[6],
      icon: 'avatar-of-elements',
      description: 'Transforms the caster into a being of pure elemental power.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamage: level * 15,
        coldDamage: level * 15,
        airDamage: level * 15,
        earthDamage: level * 30,
        earthDamagePercent: level * 15,
        wisdom: level * 10,
      }),
    },
  },
};
