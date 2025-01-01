import { ITEM_TYPES } from './item.js';

export const ENEMY_RARITY = {
  NORMAL: {
    type: 'NORMAL',
    itemDropChance: 5,
    color: 'gray',
    threshold: 80,
    healthBonus: 1,
    bonusDamage: 1,
    bonusAttackSpeed: 1,
  },
  RARE: {
    type: 'RARE',
    itemDropChance: 2,
    color: 'blue',
    threshold: 90,
    healthBonus: 1.2,
    bonusDamage: 1.2,
    bonusAttackSpeed: 0.9,
  },
  EPIC: {
    type: 'EPIC',
    itemDropChance: 3,
    color: 'purple',
    threshold: 96,
    healthBonus: 1.5,
    bonusDamage: 1.5,
    bonusAttackSpeed: 0.8,
  },
  LEGENDARY: {
    type: 'LEGENDARY',
    itemDropChance: 5,
    color: 'orange',
    threshold: 99,
    healthBonus: 2,
    bonusDamage: 2,
    bonusAttackSpeed: 0.7,
  },
  MYTHIC: {
    type: 'MYTHIC',
    itemDropChance: 10,
    color: 'red',
    threshold: 100,
    healthBonus: 3,
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

const ENEMY_NAMES = [
  'Shadowclaw',
  'Dreadfang',
  'Grimspike',
  'Steelcrusher',
  'Stormbringer',
  'Frostbite',
  'Bloodthorn',
  'Nightshade',
  'Ironhide',
  'Thunderfist',
  'Voidweaver',
  'Darkspell',
  'Flamereaper',
  'Soulrender',
  'Mistwalker',
  'Doomhammer',
  'Skullcrusher',
  'Stormrage',
  'Frostweaver',
  'Shadowmend',
  'Lightbane',
  'Deathwhisper',
  'Bloodseeker',
  'Wraithborn',
  'Cinderlord',
  'Thornheart',
  'Grimreaper',
  'Steelborn',
  'Frostfury',
  'Stormlord',
  'Netherbane',
  'Darkweaver',
  'Flamelord',
  'Soulkeeper',
  'Mistrunner',
  'Dreadlord',
  'Skullreaver',
  'Stormcaller',
  'Frostlord',
  'Shadowkeeper',
  'Lightslayer',
  'Deathbringer',
  'Bloodlord',
  'Wraithkeeper',
  'Cinderborn',
  'Thornlord',
  'Grimwalker',
  'Steelfury',
  'Frostborn',
  'Stormkeeper',
];

class Enemy {
  constructor(zone) {
    this.rarity = this.generateRarity();
    this.color = this.getRarityColor(this.rarity);
    this.health = this.calculateHealth(zone, this.rarity);
    this.currentHealth = this.health;
    this.damage = this.calculateDamage(zone, this.rarity);
    this.attackSpeed = this.calculateAttackSpeed(this.rarity);
    this.lastAttack = Date.now();
    this.element = this.generateElement();
    const randomName = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
    const elementIcon = ELEMENTS[this.element].icon;
    this.name = `${elementIcon} ${randomName}`;
    this.setEnemyName();

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
  }

  generateElement() {
    // Return the element ID instead of the whole object
    return Object.keys(ELEMENTS)[Math.floor(Math.random() * Object.keys(ELEMENTS).length)];
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

  calculateHealth(zone, rarity) {
    const baseHealth = 49 + Math.pow(zone, 2);
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.healthBonus,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.healthBonus,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.healthBonus,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.healthBonus,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.healthBonus,
    };

    return baseHealth * (rarityMap[rarity] || ENEMY_RARITY.NORMAL.healthBonus);
  }

  calculateDamage(zone, rarity) {
    const baseDamage = 4 + Math.pow(zone, 1.10);
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

  resetHealth() {
    this.currentHealth = this.health;
  }

  calculateDropChance() {
    const enemyConst = ENEMY_RARITY[this.rarity];
    return enemyConst.itemDropChance;
  }

  calculateItemLevel(zone) {
    return Math.max(1, Math.floor(zone * 0.7));
  }

  rollForDrop() {
    const dropChance = this.calculateDropChance();
    return Math.random() * 100 <= dropChance;
  }

  getRandomItemType() {
    const types = Object.values(ITEM_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }
}
export default Enemy;
