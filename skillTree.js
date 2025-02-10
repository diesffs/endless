import { createDamageNumber, defeatEnemy } from './combat.js';
import { handleSavedData } from './functions.js';
import { game, hero } from './main.js';
import {
  showManaWarning,
  showToast,
  updateActionBar,
  updateEnemyHealth,
  updatePlayerHealth,
  updateSkillTreeValues,
} from './ui.js';

export const SKILL_LEVEL_TIERS = [10, 20, 30, 50, 75, 100, 150];
export const DEFAULT_MAX_SKILL_LEVEL = 100;
export const REQ_LEVEL_FOR_SKILL_TREE = 10;

export const CLASS_PATHS = {
  WARRIOR: {
    name: 'Warrior',
    enabled: true,
    baseStats: {
      strength: 20,
      vitality: 20,
      armor: 60,
      health: 200,
    },
    description: 'A mighty warrior specializing in heavy armor and raw strength',
  },
  ROGUE: {
    name: 'Rogue',
    enabled: true,
    baseStats: {
      agility: 40,
      critChance: 5,
      attackSpeed: 0.3,
      damage: 50,
    },
    description: 'Swift and deadly, focusing on critical hits and attack speed',
  },
  VAMPIRE: {
    name: 'Vampire',
    enabled: false,
    baseStats: {
      lifeSteal: 3,
      critDamage: 0.5,
      attackSpeed: 0.2,
      damage: 25,
    },
    description: 'Master of life-stealing and critical strikes',
  },
  PALADIN: {
    name: 'Paladin',
    enabled: false,
    baseStats: {
      blockChance: 10,
      armor: 100,
      vitality: 30,
      health: 300,
    },
    description: 'Holy warrior specializing in defense and vitality',
  },
  BERSERKER: {
    name: 'Berserker',
    enabled: false,
    baseStats: {
      damage: 45,
      attackSpeed: 0.3,
      strength: 15,
      critChance: 5,
    },
    description: 'Frenzied fighter focusing on raw damage output',
  },
  ELEMENTALIST: {
    name: 'Elementalist',
    enabled: false,
    baseStats: {
      fireDamage: 40,
      airDamage: 40,
      coldDamage: 40,
      earthDamage: 40,
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
        expBonus: level * 5,
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
      description: 'Increases health regeneration',
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
        Additionally, when blocking, you also recover health equal to 5% of your maximum health.
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
        lifeSteal: level * 1.5,
        damage: level * 2,
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
        agility: level * 2,
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
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'bite',
      description: 'A powerful strike that restores health.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
        lifeSteal: level * 5,
      }),
    },
    darkAura: {
      id: 'darkAura',
      name: 'Dark Aura',
      type: 'buff',
      manaCost: 20,
      cooldown: 10000,
      duration: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'aura',
      description: 'Increases life steal and damage temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 2,
        damagePercent: level * 5,
      }),
    },

    // Tier 25 Skills
    drainingTouch: {
      id: 'drainingTouch',
      name: 'Draining Touch',
      type: 'instant',
      manaCost: 25,
      cooldown: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'drain',
      description: 'Drains life from enemies, restoring your health.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 8,
        health: level * 4,
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
        bonusExperience: level * 7,
        lifeSteal: level * 2,
      }),
    },

    // Tier 50 Skills
    crimsonBurst: {
      id: 'crimsonBurst',
      name: 'Crimson Burst',
      type: 'instant',
      manaCost: 30,
      cooldown: 12000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'burst',
      description: 'Unleashes a burst of crimson energy, damaging all enemies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 12,
        health: level * 5,
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
      cooldown: 15000,
      duration: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'pact',
      description: 'Increases life steal and health temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 3,
        healthPercent: level * 5,
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
      description: 'Permanently increases life steal and damage but reduces mana regen.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 5,
        damage: level * 10,
        manaRegen: -level * 1,
      }),
    },
    deathlyPresence: {
      id: 'deathlyPresence',
      name: 'Deathly Presence',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'presence',
      description: 'Increases life steal, damage, and health permanently.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        lifeSteal: level * 2,
        damagePercent: level * 5,
        healthPercent: level * 3,
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
        strength: level * 5,
        agility: level * 5,
        vitality: level * 10,
        lifeSteal: level * 3,
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
        healing: level * 5,
        damage: level * 3,
      }),
    },
    shieldBash: {
      id: 'shieldBash',
      name: 'Shield Bash',
      type: 'instant',
      manaCost: 15,
      cooldown: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'bash',
      description: 'Bashes an enemy with your shield, stunning them.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 4,
        stunDuration: level * 0.5,
      }),
    },
    divineProtection: {
      id: 'divineProtection',
      name: 'Divine Protection',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'protection',
      description: 'Permanently increases armor and block chance.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 3,
        blockChance: level * 2,
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
        holyDamage: level * 5,
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
      description: 'Heals a large amount of health instantly.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        healing: level * 10,
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
      icon: 'shield',
      description: 'Creates a shield that absorbs damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        shieldAmount: level * 15,
      }),
    },
    auraOfLight: {
      id: 'auraOfLight',
      name: 'Aura of Light',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'aura',
      description: 'Increases healing effects and reduces damage taken.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        healingPercent: level * 5,
        damageReduction: level * 2,
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
      }),
    },
    beaconOfFaith: {
      id: 'beaconOfFaith',
      name: 'Beacon of Faith',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'beacon',
      description: 'Increases healing done to allies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        healingPercent: level * 10,
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
      description: 'Creates a holy barrier that absorbs damage and heals allies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        shieldAmount: level * 20,
        healing: level * 10,
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
        damage: level * 15,
        healingPercent: level * 10,
      }),
    },
    guardianAngel: {
      id: 'guardianAngel',
      name: 'Guardian Angel',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'angel',
      description: 'Provides a chance to resurrect allies upon death.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        resurrectionChance: level * 2,
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
        wisdom: level * 10,
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
      icon: 'rage',
      description: 'Increases attack speed and damage while active.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        attackSpeed: level * 0.05,
        damage: level * 5,
      }),
    },
    toughSkin: {
      id: 'toughSkin',
      name: 'Tough Skin',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'armor',
      description: 'Increases armor and reduces damage taken.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        armor: level * 3,
        damageReduction: level * 2,
      }),
    },

    // Tier 10 Skills
    recklessSwing: {
      id: 'recklessSwing',
      name: 'Reckless Swing',
      type: 'instant',
      manaCost: 20,
      cooldown: 6000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'swing',
      description: 'A powerful strike that sacrifices health for damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 15,
        selfDamage: level * 3,
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
      icon: 'cry',
      description: 'Boosts damage and attack speed temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 8,
        attackSpeed: level * 0.1,
      }),
    },

    // Tier 25 Skills
    berserkersRage: {
      id: 'berserkersRage',
      name: `Berserker's Rage`,
      type: 'toggle',
      manaCost: 30,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'rage',
      description: 'Greatly increases damage but lowers defense.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 10,
        armor: -level * 2,
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
        attackSpeed: level * 0.1,
        damage: level * 7,
      }),
    },

    // Tier 50 Skills
    earthquake: {
      id: 'earthquake',
      name: 'Earthquake',
      type: 'instant',
      manaCost: 50,
      cooldown: 15000,
      requiredLevel: SKILL_LEVEL_TIERS[3],
      icon: 'earthquake',
      description: 'Smashes the ground, dealing area damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 20,
        radius: level * 2,
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
        critChance: level * 2,
        critDamage: level * 10,
      }),
    },

    // Tier 75 Skills
    bloodLust: {
      id: 'bloodLust',
      name: 'Blood Lust',
      type: 'buff',
      manaCost: 60,
      cooldown: 20000,
      duration: 7000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'bloodlust',
      description: 'Increases attack speed and life steal temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        attackSpeed: level * 0.2,
        lifeSteal: level * 5,
      }),
    },

    // Tier 100 Skills
    unbridledFury: {
      id: 'unbridledFury',
      name: 'Unbridled Fury',
      type: 'toggle',
      manaCost: 40,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'fury',
      description: 'Increases damage and attack speed at the cost of health.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        damage: level * 15,
        attackSpeed: level * 0.15,
        selfDamage: level * 5,
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
        survivalChance: level * 3,
        lifeRegen: level * 2,
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
        critChance: level * 5,
        attackSpeed: level * 0.1,
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
      manaCost: 20,
      cooldown: 5000,
      requiredLevel: SKILL_LEVEL_TIERS[0],
      icon: 'fireball',
      description: 'Launches a fireball that deals fire damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        fireDamage: level * 10,
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
        armor: level * 5,
        coldDamageReduction: level * 3,
      }),
    },

    // Tier 10 Skills
    lightningStrike: {
      id: 'lightningStrike',
      name: 'Lightning Strike',
      type: 'instant',
      manaCost: 25,
      cooldown: 7000,
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'lightning',
      description: 'Strikes an enemy with a bolt of lightning.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        airDamage: level * 15,
      }),
    },
    elementalMastery: {
      id: 'elementalMastery',
      name: 'Elemental Mastery',
      type: 'passive',
      requiredLevel: SKILL_LEVEL_TIERS[1],
      icon: 'mastery',
      description: 'Increases all elemental damage.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        elementalDamagePercent: level * 5,
      }),
    },

    // Tier 25 Skills
    blizzard: {
      id: 'blizzard',
      name: 'Blizzard',
      type: 'buff',
      manaCost: 40,
      cooldown: 15000,
      duration: 7000,
      requiredLevel: SKILL_LEVEL_TIERS[2],
      icon: 'blizzard',
      description: 'Summons a blizzard, dealing cold damage to all enemies.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        coldDamage: level * 8,
        slowEffect: level * 2,
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
        mana: level * 15,
        manaRegen: level * 3,
      }),
    },

    // Tier 50 Skills
    elementalStorm: {
      id: 'elementalStorm',
      name: 'Elemental Storm',
      type: 'instant',
      manaCost: 60,
      cooldown: 20000,
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
        fireResistance: level * 5,
        coldResistance: level * 5,
        airResistance: level * 5,
      }),
    },

    // Tier 75 Skills
    arcanePulse: {
      id: 'arcanePulse',
      name: 'Arcane Pulse',
      type: 'buff',
      manaCost: 70,
      cooldown: 25000,
      duration: 8000,
      requiredLevel: SKILL_LEVEL_TIERS[4],
      icon: 'pulse',
      description: 'Increases spell power and reduces cooldowns temporarily.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        spellPower: level * 10,
        cooldownReduction: level * 5,
      }),
    },

    // Tier 100 Skills
    elementalOverload: {
      id: 'elementalOverload',
      name: 'Elemental Overload',
      type: 'toggle',
      manaCost: 50,
      requiredLevel: SKILL_LEVEL_TIERS[5],
      icon: 'overload',
      description: 'Boosts all elemental damage at the cost of mana regeneration.',
      maxLevel: DEFAULT_MAX_SKILL_LEVEL,
      effect: (level) => ({
        elementalDamagePercent: level * 10,
        manaRegen: -level * 2,
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
        fireDamage: level * 5,
        coldDamage: level * 5,
        airDamage: level * 5,
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
        wisdom: level * 10,
      }),
    },
  },
};

export default class SkillTree {
  constructor(savedData = null) {
    this.skillPoints = 0;
    this.selectedPath = null;
    this.skills = {};

    handleSavedData(savedData, this);
    // always empty at start
    this.activeBuffs = new Map();
  }

  getPathBonuses() {
    return CLASS_PATHS[this.selectedPath?.name]?.baseStats || {};
  }

  getAllSkillTreeBonuses() {
    const pathBonuses = this.getPathBonuses();
    const passiveBonuses = this.calculatePassiveBonuses();
    const activeBuffEffects = this.getActiveBuffEffects();

    const allBonuses = {};

    // Combine path bonuses
    Object.entries(pathBonuses).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    // Combine passive bonuses
    Object.entries(passiveBonuses).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    // Combine active buff effects
    Object.entries(activeBuffEffects).forEach(([stat, value]) => {
      allBonuses[stat] = (allBonuses[stat] || 0) + value;
    });

    return allBonuses;
  }

  calculatePassiveBonuses() {
    const bonuses = {};
    // Add skill bonuses
    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name][skillId];
      if (skill.type === 'passive') {
        const effects = skill.effect(skillData.level);
        Object.entries(effects).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
      }
    });

    return bonuses;
  }

  calculateActiveSkillEffects() {
    const effects = {};

    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name][skillId];
      if (skill.type === 'toggle' && this.isSkillActive(skillId)) {
        const skillEffects = skill.effect(skillData.level);
        Object.entries(skillEffects).forEach(([stat, value]) => {
          effects[stat] = (effects[stat] || 0) + value;
        });
      }
    });

    return effects;
  }

  isSkillActive(skillId) {
    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    return skill && (skill.type === 'toggle' || skill.type === 'buff') && this.skills[skillId]?.active;
  }

  addSkillPoints(points) {
    this.skillPoints += points;
    updateSkillTreeValues();
  }

  selectPath(pathName) {
    if (this.selectedPath) return false;
    if (!CLASS_PATHS[pathName] || !CLASS_PATHS[pathName].enabled) return false;
    if (hero.level < REQ_LEVEL_FOR_SKILL_TREE) {
      showToast(`Reach level ${REQ_LEVEL_FOR_SKILL_TREE} to select a class path!`, 'warning');
      return false;
    }

    this.selectedPath = {
      name: pathName,
      baseStats: CLASS_PATHS[pathName].baseStats,
    };
    hero.recalculateFromAttributes();
    game.saveGame();
    return true;
  }

  getSkillsForPath(pathName) {
    return SKILL_TREES[pathName] || [];
  }

  canUnlockSkill(skillId) {
    if (!this.selectedPath) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    if (!skill) return false;

    const currentLevel = this.skills[skillId]?.level || 0;
    return (
      this.skillPoints >= 1 &&
      currentLevel < (skill.maxLevel || DEFAULT_MAX_SKILL_LEVEL) &&
      hero.level >= skill.requiredLevel
    );
  }

  arePrerequisitesMet(skill) {
    if (skill.row === 1) return true;

    return skill.prerequisites.some((preReqId) => {
      const preReqLevel = this.skills[preReqId]?.level || 0;
      return preReqLevel > 0;
    });
  }

  unlockSkill(skillId) {
    if (!this.canUnlockSkill(skillId)) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const currentLevel = this.skills[skillId]?.level || 0;
    const nextLevel = currentLevel + 1;

    this.skills[skillId] = {
      ...skill,
      level: nextLevel,
      effect: skill.effect(nextLevel),
      active: false,
      slot: skill.type !== 'passive' ? Object.keys(this.skills).length + 1 : null,
    };

    this.skillPoints -= 1;
    hero.recalculateFromAttributes();

    if (skill.type !== 'passive') {
      updateActionBar();
    }

    // Trigger tooltip update
    updateSkillTreeValues(); // Ensure this function updates the tooltip content

    return true;
  }

  toggleSkill(skillId) {
    if (!this.skills[skillId]) return;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];

    // Handle different skill types
    switch (skill.type) {
      case 'buff':
        this.activateSkill(skillId);
        break;
      case 'toggle':
        this.skills[skillId].active = !this.skills[skillId].active;
        hero.recalculateFromAttributes();
        break;
      case 'instant':
        this.useInstantSkill(skillId);
        break;
    }

    updateActionBar();
  }

  useInstantSkill(skillId) {
    if (!game.gameStarted) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const skillData = this.skills[skillId];

    if (hero.stats.currentMana < skill.manaCost) {
      showManaWarning();
      return false;
    }

    if (skillData.cooldownEndTime && skillData.cooldownEndTime > Date.now()) return false;

    // Apply instant effect
    hero.stats.currentMana -= skill.manaCost;
    const damage = this.calculateInstantDamage(skillId);
    game.currentEnemy.currentHealth -= damage;

    if (game.currentEnemy.currentHealth <= 0) {
      defeatEnemy();
    }

    // Set cooldown
    skillData.cooldownEndTime = Date.now() + skill.cooldown;

    // Update UI
    updateEnemyHealth();
    updatePlayerHealth();
    createDamageNumber(damage, false, false, false, false, true); // Add parameter for instant skill visual

    return true;
  }

  calculateInstantDamage(skillId) {
    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const skillData = this.skills[skillId];
    const baseEffect = skill.effect(skillData.level);

    // Scale with hero's damage bonuses
    return hero.stats.damage + baseEffect.damage;
  }

  applyToggleEffects() {
    let effects = {};

    Object.entries(this.skills).forEach(([skillId, skillData]) => {
      const skill = SKILL_TREES[this.selectedPath?.name][skillId];
      if (skill.type === 'toggle' && skillData.active) {
        if (hero.stats.currentMana >= skill.manaCost) {
          hero.stats.currentMana -= skill.manaCost;
          effects = { ...effects, ...skill.effect(skillData.level) };
        } else {
          showManaWarning();
          // Deactivate if not enough mana
          skillData.active = false;
          updateActionBar();
        }
      }
    });

    return effects;
  }

  activateSkill(skillId) {
    if (!game.gameStarted) return false;

    const skill = SKILL_TREES[this.selectedPath?.name][skillId];
    const skillData = this.skills[skillId];

    if (skill.type !== 'buff') return false;
    if (hero.stats.currentMana < skill.manaCost) {
      showManaWarning();
      return false;
    }

    // Check if skill is on cooldown
    if (skillData.cooldownEndTime && skillData.cooldownEndTime > Date.now()) return false;

    // Apply buff
    hero.stats.currentMana -= skill.manaCost;
    const buffEndTime = Date.now() + skill.duration;
    const cooldownEndTime = Date.now() + skill.cooldown;

    // Store buff data
    this.activeBuffs.set(skillId, {
      endTime: buffEndTime,
      effects: skill.effect(skillData.level),
    });

    // Set cooldown and active state
    this.skills[skillId].cooldownEndTime = cooldownEndTime;
    this.skills[skillId].active = true;

    // Apply buff effects
    hero.recalculateFromAttributes();
    updateActionBar();

    return true;
  }

  deactivateSkill(skillId) {
    if (this.activeBuffs.has(skillId)) {
      this.activeBuffs.delete(skillId);
      // Reset the active state when buff expires
      if (this.skills[skillId]) {
        this.skills[skillId].active = false;
      }
      hero.recalculateFromAttributes();
      updateActionBar(); // Update UI to reflect deactivated state
    }
  }

  getActiveBuffEffects() {
    const effects = {};

    this.activeBuffs.forEach((buffData, skillId) => {
      if (buffData.endTime <= Date.now()) {
        this.deactivateSkill(skillId);
        return;
      }

      Object.entries(buffData.effects).forEach(([stat, value]) => {
        effects[stat] = (effects[stat] || 0) + value;
      });
    });

    return effects;
  }

  stopAllBuffs() {
    this.activeBuffs.clear();
    Object.values(this.skills).forEach((skill) => {
      if (skill.cooldownEndTime) {
        skill.cooldownEndTime = 0;
      }
      skill.active = false; // Reset active state
    });
    hero.recalculateFromAttributes();
    updateActionBar(); // Update UI to reset all visual states
  }
}
