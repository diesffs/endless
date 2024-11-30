export const ENEMY_RARITY_NORMAL = {
  type: 'NORMAL',
  itemDropChance: 1,
  color: 'gray',
  threshold: 80,
  healthBonus: 1,
  bonusDamage: 1,
  bonusAttackSpeed: 1,
};

export const ENEMY_RARITY_RARE = {
  type: 'RARE',
  itemDropChance: 0.1,
  color: 'blue',
  threshold: 90,
  healthBonus: 1.2,
  bonusDamage: 1.2,
  bonusAttackSpeed: 0.9,
};

export const ENEMY_RARITY_EPIC = {
  type: 'EPIC',
  itemDropChance: 0.06,
  color: 'purple',
  threshold: 96,
  healthBonus: 1.5,
  bonusDamage: 1.5,
  bonusAttackSpeed: 0.8,
};

export const ENEMY_RARITY_LEGENDARY = {
  type: 'LEGENDARY',
  itemDropChance: 0.03,
  color: 'orange',
  threshold: 99,
  healthBonus: 2,
  bonusDamage: 2,
  bonusAttackSpeed: 0.7,
};

export const ENEMY_RARITY_MYTHIC = {
  type: 'MYTHIC',
  itemDropChance: 0.01,
  color: 'red',
  threshold: 100,
  healthBonus: 3,
  bonusDamage: 3,
  bonusAttackSpeed: 0.5,
};
class Enemy {
  constructor(zone) {
    this.rarity = this.generateRarity(); // Assign rarity based on weighted probabilities
    this.color = this.getRarityColor(this.rarity); // Assign color based on rarity
    this.maxHealth = this.calculateHealth(zone, this.rarity);
    this.currentHealth = this.maxHealth;
    this.name = `Enemy Lvl ${zone} (${this.rarity})`;
    this.damage = this.calculateDamage(zone, this.rarity);
    this.attackSpeed = this.calculateAttackSpeed(this.rarity);
    this.lastAttack = Date.now();

    // Get enemy section element
    const enemySection = document.querySelector('.enemy-section');

    // Remove any existing rarity classes
    enemySection.classList.remove(
      ENEMY_RARITY_NORMAL.color,
      ENEMY_RARITY_RARE.color,
      ENEMY_RARITY_EPIC.color,
      ENEMY_RARITY_LEGENDARY.color,
      ENEMY_RARITY_MYTHIC.color
    );
    // Add the new color class
    enemySection.classList.add(this.color);
  }

  generateRarity() {
    const random = Math.random() * 100;
    if (random < ENEMY_RARITY_NORMAL.threshold) return ENEMY_RARITY_NORMAL.type;
    if (random < ENEMY_RARITY_RARE.threshold) return ENEMY_RARITY_RARE.type;
    if (random < ENEMY_RARITY_EPIC.threshold) return ENEMY_RARITY_EPIC.type;
    if (random < ENEMY_RARITY_LEGENDARY.threshold) return ENEMY_RARITY_LEGENDARY.type;
    return ENEMY_RARITY_MYTHIC.type;
  }

  getRarityColor(rarity) {
    const rarityMap = {
      [ENEMY_RARITY_NORMAL.type]: ENEMY_RARITY_NORMAL.color,
      [ENEMY_RARITY_RARE.type]: ENEMY_RARITY_RARE.color,
      [ENEMY_RARITY_EPIC.type]: ENEMY_RARITY_EPIC.color,
      [ENEMY_RARITY_LEGENDARY.type]: ENEMY_RARITY_LEGENDARY.color,
      [ENEMY_RARITY_MYTHIC.type]: ENEMY_RARITY_MYTHIC.color,
    };
    return rarityMap[rarity] || 'white';
  }

  calculateHealth(zone, rarity) {
    const baseHealth = 49 + Math.pow(zone, 1.5);
    const rarityMap = {
      [ENEMY_RARITY_NORMAL.type]: ENEMY_RARITY_NORMAL.healthBonus,
      [ENEMY_RARITY_RARE.type]: ENEMY_RARITY_RARE.healthBonus,
      [ENEMY_RARITY_EPIC.type]: ENEMY_RARITY_EPIC.healthBonus,
      [ENEMY_RARITY_LEGENDARY.type]: ENEMY_RARITY_LEGENDARY.healthBonus,
      [ENEMY_RARITY_MYTHIC.type]: ENEMY_RARITY_MYTHIC.healthBonus,
    };

    return baseHealth * (rarityMap[rarity] || ENEMY_RARITY_NORMAL.healthBonus);
  }

  calculateDamage(zone, rarity) {
    const baseDamage = 5 + zone * 2;
    const rarityMap = {
      [ENEMY_RARITY_NORMAL.type]: ENEMY_RARITY_NORMAL.bonusDamage,
      [ENEMY_RARITY_RARE.type]: ENEMY_RARITY_RARE.bonusDamage,
      [ENEMY_RARITY_EPIC.type]: ENEMY_RARITY_EPIC.bonusDamage,
      [ENEMY_RARITY_LEGENDARY.type]: ENEMY_RARITY_LEGENDARY.bonusDamage,
      [ENEMY_RARITY_MYTHIC.type]: ENEMY_RARITY_MYTHIC.bonusDamage,
    };

    return baseDamage * (rarityMap[rarity] || ENEMY_RARITY_NORMAL.bonusDamage);
  }

  calculateAttackSpeed(rarity) {
    const baseAttackSpeed = 1;
    const rarityMap = {
      [ENEMY_RARITY_NORMAL.type]: ENEMY_RARITY_NORMAL.bonusAttackSpeed,
      [ENEMY_RARITY_RARE.type]: ENEMY_RARITY_RARE.bonusAttackSpeed,
      [ENEMY_RARITY_EPIC.type]: ENEMY_RARITY_EPIC.bonusAttackSpeed,
      [ENEMY_RARITY_LEGENDARY.type]: ENEMY_RARITY_LEGENDARY.bonusAttackSpeed,
      [ENEMY_RARITY_MYTHIC.type]: ENEMY_RARITY_MYTHIC.bonusAttackSpeed,
    };

    return baseAttackSpeed * (rarityMap[rarity] || ENEMY_RARITY_NORMAL.bonusAttackSpeed);
  }

  canAttack(currentTime) {
    return currentTime - this.lastAttack >= this.attackSpeed * 1000; // Convert to ms
  }

  resetHealth() {
    this.currentHealth = this.maxHealth;
  }
}
export default Enemy;
