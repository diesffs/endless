class Enemy {
  constructor(level) {
    this.rarity = this.generateRarity(); // Assign rarity based on weighted probabilities
    this.color = this.getRarityColor(this.rarity); // Assign color based on rarity
    this.maxHealth = this.calculateHealth(level, this.rarity);
    this.currentHealth = this.maxHealth;
    this.name = `Enemy Lvl ${level} (${this.rarity})`;
    this.damage = this.calculateDamage(level, this.rarity);
    this.attackSpeed = this.calculateAttackSpeed(this.rarity);
    this.lastAttack = Date.now();

    // Get enemy section element
    const enemySection = document.querySelector('.enemy-section');

    // Remove any existing rarity classes
    enemySection.classList.remove('gray', 'blue', 'purple', 'orange', 'red');

    // Add the new color class
    enemySection.classList.add(this.color);
  }

  generateRarity() {
    const random = Math.random() * 100;
    if (random < 80) return 'normal';
    if (random < 90) return 'rare';
    if (random < 96) return 'epic';
    if (random < 99) return 'legendary';
    return 'mythic';
  }

  getRarityColor(rarity) {
    const colors = {
      normal: 'gray',
      rare: 'blue',
      epic: 'purple',
      legendary: 'orange',
      mythic: 'red',
    };
    return colors[rarity] || 'white'; // Default to white if no color is found
  }

  calculateHealth(level, rarity) {
    const baseHealth = 49 + Math.pow(level, 1.5);
    switch (rarity) {
      case 'rare':
        return baseHealth * 1.2; // 20% more health
      case 'epic':
        return baseHealth * 1.5; // 50% more health
      case 'legendary':
        return baseHealth * 2; // 100% more health
      case 'mythic':
        return baseHealth * 3; // 200% more health
      default: // "normal"
        return baseHealth;
    }
  }

  calculateDamage(level, rarity) {
    const baseDamage = 5 + level * 2;
    switch (rarity) {
      case 'rare':
        return baseDamage * 1.2; // 20% more damage
      case 'epic':
        return baseDamage * 1.5; // 50% more damage
      case 'legendary':
        return baseDamage * 2; // 100% more damage
      case 'mythic':
        return baseDamage * 3; // 200% more damage
      default: // "normal"
        return baseDamage;
    }
  }

  calculateAttackSpeed(rarity) {
    const baseAttackSpeed = 1; // 1 attack per second
    switch (rarity) {
      case 'rare':
        return baseAttackSpeed * 0.9; // 10% faster attack speed
      case 'epic':
        return baseAttackSpeed * 0.8; // 20% faster attack speed
      case 'legendary':
        return baseAttackSpeed * 0.7; // 30% faster attack speed
      case 'mythic':
        return baseAttackSpeed * 0.5; // 50% faster attack speed
      default: // "normal"
        return baseAttackSpeed;
    }
  }

  canAttack(currentTime) {
    return currentTime - this.lastAttack >= this.attackSpeed * 1000; // Convert to ms
  }

  resetHealth() {
    this.currentHealth = this.maxHealth;
  }

  getItemDropChances() {
    const baseChances = {
      normal: 70,
      magic: 20,
      rare: 9,
      unique: 1,
    };

    switch (this.rarity) {
      case 'rare':
        baseChances.rare += 5; // Increase rare item drop chance
        baseChances.unique += 1; // Increase unique item drop chance
        break;
      case 'epic':
        baseChances.rare += 10; // Increase rare item drop chance
        baseChances.unique += 3; // Increase unique item drop chance
        break;
      case 'legendary':
        baseChances.rare += 15; // Increase rare item drop chance
        baseChances.unique += 5; // Increase unique item drop chance
        break;
      case 'mythic':
        baseChances.rare += 20; // Increase rare item drop chance
        baseChances.unique += 10; // Increase unique item drop chance
        break;
      default: // "normal"
        break;
    }

    return baseChances;
  }
}

export default Enemy;
