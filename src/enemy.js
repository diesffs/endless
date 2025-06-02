import { ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion } from './region.js';

export const ENEMY_RARITY = {
  NORMAL: {
    type: 'NORMAL',
    itemDropChance: 1,
    color: 'gray',
    threshold: 80,
    lifeBonus: 1,
    bonusDamage: 1,
    bonusAttackSpeed: 1,
  },
  RARE: {
    type: 'RARE',
    itemDropChance: 1,
    color: 'blue',
    threshold: 90,
    lifeBonus: 1.2,
    bonusDamage: 1.2,
    bonusAttackSpeed: 0.9,
  },
  EPIC: {
    type: 'EPIC',
    itemDropChance: 2,
    color: 'purple',
    threshold: 96,
    lifeBonus: 1.5,
    bonusDamage: 1.5,
    bonusAttackSpeed: 0.8,
  },
  LEGENDARY: {
    type: 'LEGENDARY',
    itemDropChance: 2,
    color: 'orange',
    threshold: 99.5,
    lifeBonus: 2,
    bonusDamage: 2,
    bonusAttackSpeed: 0.7,
  },
  MYTHIC: {
    type: 'MYTHIC',
    itemDropChance: 3,
    color: 'red',
    threshold: 100,
    lifeBonus: 3,
    bonusDamage: 3,
    bonusAttackSpeed: 0.5,
  },
};

const ELEMENTS = {
  fire: {
    id: 'fire',
    icon: '🔥',
  },
  cold: {
    id: 'cold',
    icon: '❄️',
  },
  air: {
    id: 'air',
    icon: '☁️',
  },
  earth: {
    id: 'earth',
    icon: '🌍',
  },
};

export const ELEMENT_OPPOSITES = {
  [ELEMENTS.fire.id]: ELEMENTS.air.id,
  [ELEMENTS.earth.id]: ELEMENTS.cold.id,
  [ELEMENTS.cold.id]: ELEMENTS.fire.id,
  [ELEMENTS.air.id]: ELEMENTS.earth.id,
};

class Enemy {
  static ENEMY_LIST = [
    {
      name: 'Abyssal Wraith',
      icon: '👻',
      element: 'cold',
      image: 'public/enemies/Abyssal Wraith.jpg',
      hpBonus: 1.2,
      dmgBonus: 1.1,
    },
    {
      name: 'Boglurker',
      icon: '🐸',
      element: 'earth',
      image: 'public/enemies/Boglurker.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.0,
    },
    {
      name: 'Cloudstrider',
      icon: '☁️',
      element: 'air',
      image: 'public/enemies/Cloudstrider.jpg',
      hpBonus: 1.0,
      dmgBonus: 1.2,
    },
    {
      name: 'Crystal Golem',
      icon: '🪨',
      element: 'earth',
      image: 'public/enemies/Crystal Golem.jpg',
      hpBonus: 1.4,
      dmgBonus: 0.9,
    },
    {
      name: 'Dreadfang',
      icon: '🐺',
      element: 'air',
      image: 'public/enemies/Dreadfang.jpg',
      hpBonus: 1.0,
      dmgBonus: 1.3,
    },
    {
      name: 'Dunewraith',
      icon: '💀',
      element: 'earth',
      image: 'public/enemies/Dunewraith.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.1,
    },
    {
      name: 'Frostbite',
      icon: '❄️',
      element: 'cold',
      image: 'public/enemies/Frostbite.jpg',
      hpBonus: 1.0,
      dmgBonus: 1.2,
    },
    {
      name: 'Frostfury',
      icon: '🧊',
      element: 'cold',
      image: 'public/enemies/Frostfury.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.1,
    },
    {
      name: 'Frostweaver',
      icon: '🕸️',
      element: 'cold',
      image: 'public/enemies/Frostweaver.jpg',
      hpBonus: 1.2,
      dmgBonus: 1.0,
    },
    {
      name: 'Gem Guardian',
      icon: '💎',
      element: 'earth',
      image: 'public/enemies/Gem Guardian.jpg',
      hpBonus: 1.3,
      dmgBonus: 1.0,
    },
    {
      name: 'Grimspike',
      icon: '🦔',
      element: 'earth',
      image: 'public/enemies/Grimspike.jpg',
      hpBonus: 1.2,
      dmgBonus: 1.1,
    },
    {
      name: 'Sandstalker',
      icon: '🦂',
      element: 'earth',
      image: 'public/enemies/Sandstalker.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.2,
    },
    {
      name: 'Shadowclaw',
      icon: '🐾',
      element: 'air',
      image: 'public/enemies/Shadowclaw.jpg',
      hpBonus: 1.0,
      dmgBonus: 1.3,
    },
    {
      name: 'Shardling',
      icon: '🔹',
      element: 'earth',
      image: 'public/enemies/Shardling.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.1,
    },
    {
      name: 'Stormbringer',
      icon: '⚡',
      element: 'air',
      image: 'public/enemies/Stormbringer.jpg',
      hpBonus: 1.0,
      dmgBonus: 1.3,
    },
    {
      name: 'Stormsoul',
      icon: '🌩️',
      element: 'air',
      image: 'public/enemies/Stormsoul.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.2,
    },
    {
      name: 'Thunderwing',
      icon: '🦅',
      element: 'air',
      image: 'public/enemies/Thunderwing.jpg',
      hpBonus: 1.0,
      dmgBonus: 1.3,
    },
    {
      name: 'Toxictoad',
      icon: '🐸',
      element: 'earth',
      image: 'public/enemies/Toxictoad.jpg',
      hpBonus: 1.2,
      dmgBonus: 1.0,
    },
    {
      name: 'Venomspitter',
      icon: '🕷️',
      element: 'earth',
      image: 'public/enemies/Venomspitter.jpg',
      hpBonus: 1.1,
      dmgBonus: 1.1,
    },
  ];

  constructor(stage) {
    // Pick a unique enemy
    const enemyData = Enemy.ENEMY_LIST[Math.floor(Math.random() * Enemy.ENEMY_LIST.length)];
    this.enemyData = enemyData;
    this.name = `${enemyData.icon} ${enemyData.name}`;
    this.element = enemyData.element;
    this.image = enemyData.image;
    this.hpBonus = enemyData.hpBonus;
    this.dmgBonus = enemyData.dmgBonus;

    // REGION-AWARE ENEMY GENERATION
    const region = getCurrentRegion();
    this.rarity = this.generateRarity();
    this.color = this.getRarityColor(this.rarity);
    // Use region multipliers for life and damage, and apply unique enemy bonuses
    this.life = this.calculateLife(stage, this.rarity) * (region.enemyLifeMultiplier || 1) * this.hpBonus;
    this.currentLife = this.life;
    this.damage = this.calculateDamage(stage, this.rarity) * (region.enemyDamageMultiplier || 1) * this.dmgBonus;
    this.attackSpeed = this.calculateAttackSpeed(this.rarity);
    this.lastAttack = Date.now();
    this.setEnemyName();
    this.updateEnemyStats();

    // Store region drop/reward multipliers
    this.xpMultiplier = region.xpMultiplier || 1.0;
    this.goldMultiplier = region.goldMultiplier || 1.0;
    this.itemDropMultiplier = region.itemDropMultiplier || 1.0;
    this.materialDropMultiplier = region.materialDropMultiplier || 1.0;
    this.materialWeights = region.materialDropWeights || {};

    // Get enemy section element
    const enemySection = document.querySelector('.enemy-section');

    // Remove any existing rarity classes
    enemySection.classList.remove(
      ENEMY_RARITY.NORMAL.color,
      ENEMY_RARITY.RARE.color,
      ENEMY_RARITY.EPIC.color,
      ENEMY_RARITY.LEGENDARY.color,
      ENEMY_RARITY.MYTHIC.color
    );
    // Add the new color class
    enemySection.classList.add(this.color);
  }

  setEnemyName() {
    const enemyNameElement = document.querySelector('.enemy-name');
    enemyNameElement.textContent = this.name;
    // Optionally set the enemy image if an element exists
    const enemyImg = document.querySelector('.enemy-image');
    if (enemyImg) enemyImg.src = this.image;
  }

  updateEnemyStats() {
    // Update the right-side stats (damage, extensible)
    const dmg = document.getElementById('enemy-damage-value');
    if (dmg) dmg.textContent = Math.round(this.damage);
    // Add more stats here as needed
  }

  generateElement(allowedElements) {
    // No longer used, element is now set per unique enemy
    return this.element;
  }

  generateRarity() {
    const random = Math.random() * 100;
    if (random < ENEMY_RARITY.NORMAL.threshold) return ENEMY_RARITY.NORMAL.type;
    if (random < ENEMY_RARITY.RARE.threshold) return ENEMY_RARITY.RARE.type;
    if (random < ENEMY_RARITY.EPIC.threshold) return ENEMY_RARITY.EPIC.type;
    if (random < ENEMY_RARITY.LEGENDARY.threshold) return ENEMY_RARITY.LEGENDARY.type;
    return ENEMY_RARITY.MYTHIC.type;
  }

  getRarityColor(rarity) {
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.color,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.color,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.color,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.color,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.color,
    };
    return rarityMap[rarity] || 'white';
  }

  calculateLife(stage, rarity) {
    // Arithmetic progression scaling: initial 49, increment grows every 10 levels
    let life = 40;
    const segLen = 10,
      initialInc = 10,
      incStep = 5;
    for (let lvl = 1; lvl <= stage; lvl++) {
      life += initialInc + Math.floor((lvl - 1) / segLen) * incStep;
    }
    const baseLife = life;
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.lifeBonus,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.lifeBonus,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.lifeBonus,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.lifeBonus,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.lifeBonus,
    };

    return baseLife * (rarityMap[rarity] || ENEMY_RARITY.NORMAL.lifeBonus);
  }

  calculateDamage(stage, rarity) {
    // Arithmetic progression scaling: initial 4, increment grows every 10 levels
    let dmgVal = 4;
    const segLenDmg = 10,
      initialIncDmg = 0.3,
      incStepDmg = 0.1;
    for (let lvl = 1; lvl <= stage; lvl++) {
      dmgVal += initialIncDmg + Math.floor((lvl - 1) / segLenDmg) * incStepDmg;
    }
    const baseDamage = dmgVal;
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.bonusDamage,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.bonusDamage,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.bonusDamage,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.bonusDamage,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.bonusDamage,
    };

    return baseDamage * (rarityMap[rarity] || ENEMY_RARITY.NORMAL.bonusDamage);
  }

  calculateAttackSpeed(rarity) {
    const baseAttackSpeed = 1;
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.bonusAttackSpeed,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.bonusAttackSpeed,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.bonusAttackSpeed,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.bonusAttackSpeed,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.bonusAttackSpeed,
    };

    return baseAttackSpeed * (rarityMap[rarity] || ENEMY_RARITY.NORMAL.bonusAttackSpeed);
  }
  canAttack(currentTime) {
    return currentTime - this.lastAttack >= this.attackSpeed * 1000; // Convert to ms
  }

  resetLife() {
    this.currentLife = this.life;
  }

  calculateDropChance() {
    const enemyConst = ENEMY_RARITY[this.rarity];
    // Apply region item drop multiplier
    return enemyConst.itemDropChance * this.itemDropMultiplier;
  }

  // Calculate item level based on stage (no effect at the moment)
  calculateItemLevel(stage) {
    return Math.max(1, Math.floor(stage * 1));
  }

  rollForDrop() {
    const dropChance = this.calculateDropChance();
    return Math.random() * 100 <= dropChance;
  }

  getRandomItemType() {
    const types = Object.values(ITEM_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  rollForMaterialDrop() {
    const baseChance = 0.025;
    return Math.random() < baseChance * this.materialDropMultiplier;
  }
}
export default Enemy;
