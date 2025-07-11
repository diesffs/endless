import { ITEM_TYPES } from './constants/items.js';
import { getCurrentRegion } from './region.js';
import { ENEMY_LIST, ENEMY_RARITY } from './constants/enemies.js';
import { ELEMENTS } from './constants/common.js';

class Enemy {
  constructor(stage) {
    const region = getCurrentRegion();
    // Select enemies by region tags
    const allowedTags = region.allowedTags;
    let regionEnemies = ENEMY_LIST.filter((e) => e.tags && allowedTags.some((tag) => e.tags.includes(tag)));
    const enemyData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    this.enemyData = enemyData;
    this.name = `${ELEMENTS[enemyData.element].icon} ${enemyData.name}`;
    this.element = enemyData.element;
    this.image = enemyData.image;

    // Combine multipliers (region * enemy)
    this.lifeMultiplier = (region.lifeMultiplier || 1) * (enemyData.lifeMultiplier || 1);
    this.damageMultiplier = (region.damageMultiplier || 1) * (enemyData.damageMultiplier || 1);
    this.xpMultiplier = (region.xpMultiplier || 1) * (enemyData.xpMultiplier || 1);
    this.goldMultiplier = (region.goldMultiplier || 1) * (enemyData.goldMultiplier || 1);
    this.itemDropMultiplier = (region.itemDropMultiplier || 1) * (enemyData.itemDropMultiplier || 1);
    this.materialDropMultiplier = (region.materialDropMultiplier || 1) * (enemyData.materialDropMultiplier || 1);

    this.rarity = this.generateRarity();
    this.color = this.getRarityColor(this.rarity);
    this.life = this.calculateLife(stage, this.rarity);
    this.currentLife = this.life;
    this.damage = this.calculateDamage(stage, this.rarity);
    this.attackSpeed = this.calculateAttackSpeed(this.rarity);
    this.lastAttack = Date.now();
  }

  setEnemyName() {
    const enemyNameElement = document.querySelector('.enemy-name');
    enemyNameElement.textContent = this.name;
    // Set the enemy image in .enemy-avatar (like hero)
    const enemyAvatar = document.querySelector('.enemy-avatar');
    if (enemyAvatar) {
      let img = enemyAvatar.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = this.name + ' avatar';
        enemyAvatar.innerHTML = '';
        enemyAvatar.appendChild(img);
      }
      // Use Vite's BASE_URL if available, else fallback
      let baseUrl = '';
      try {
        baseUrl = import.meta.env.BASE_URL || '';
      } catch (e) {}
      img.src = baseUrl + this.image;
    }
  }

  setEnemyColor() {
    // Get enemy section element
    const enemySection = document.querySelector('.enemy-section');
    if (!enemySection) {
      return;
    }

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
    // Arithmetic progression scaling: initial 20, increment grows every 10 levels
    let life = 20;
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

    return baseLife * (rarityMap[rarity] || ENEMY_RARITY.NORMAL.lifeBonus) * this.lifeMultiplier;
  }

  calculateDamage(stage, rarity) {
    // Arithmetic progression scaling: initial 3, increment grows every 10 levels
    let dmgVal = 3;
    const segLenDmg = 10,
      initialIncDmg = 0.3,
      incStepDmg = 0.1;
    for (let lvl = 1; lvl <= stage; lvl++) {
      dmgVal += initialIncDmg + Math.floor((lvl - 1) / segLenDmg) * incStepDmg;
    }
    const baseDamage = dmgVal;
    const rarityMap = {
      [ENEMY_RARITY.NORMAL.type]: ENEMY_RARITY.NORMAL.damageBonus,
      [ENEMY_RARITY.RARE.type]: ENEMY_RARITY.RARE.damageBonus,
      [ENEMY_RARITY.EPIC.type]: ENEMY_RARITY.EPIC.damageBonus,
      [ENEMY_RARITY.LEGENDARY.type]: ENEMY_RARITY.LEGENDARY.damageBonus,
      [ENEMY_RARITY.MYTHIC.type]: ENEMY_RARITY.MYTHIC.damageBonus,
    };

    return baseDamage * (rarityMap[rarity] || ENEMY_RARITY.NORMAL.damageBonus) * this.damageMultiplier;
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
    const baseChance = 0.025; // Base chance of 2.5%
    return Math.random() < baseChance * this.materialDropMultiplier;
  }
}
export default Enemy;
