class Enemy {
  constructor(level) {
    this.rarity = this.generateRarity(); // Assign rarity based on weighted probabilities
    this.color = this.getRarityColor(this.rarity); // Assign color based on rarity
    this.maxHealth = this.calculateHealth(level, this.rarity);
    this.currentHealth = this.maxHealth;
    this.name = `Enemy Lvl ${level} (${this.rarity})`;
    this.damage = this.calculateDamage(level, this.rarity);
    this.attackSpeed = this.calculateAttackSpeed(this.rarity);
    this.lastAttack = Date.now() + this.attackSpeed;
  }

  generateRarity() {
    const random = Math.random() * 100;
    if (random < 60) return "normal";
    if (random < 80) return "rare";
    if (random < 90) return "epic";
    if (random < 98) return "legendary";
    return "mythic";
  }

  getRarityColor(rarity) {
    const colors = {
      normal: "gray",
      rare: "blue",
      epic: "purple",
      legendary: "orange",
      mythic: "red",
    };
    return colors[rarity] || "white"; // Default to white if no color is found
  }

  calculateHealth(level, rarity) {
    const baseHealth = 50 + level * 10;
    switch (rarity) {
      case "rare":
        return baseHealth * 1.2; // 20% more health
      case "epic":
        return baseHealth * 1.5; // 50% more health
      case "legendary":
        return baseHealth * 2; // 100% more health
      case "mythic":
        return baseHealth * 3; // 200% more health
      default: // "normal"
        return baseHealth;
    }
  }

  calculateDamage(level, rarity) {
    const baseDamage = 5 + level * 2;
    switch (rarity) {
      case "rare":
        return baseDamage * 1.2; // 20% more damage
      case "epic":
        return baseDamage * 1.5; // 50% more damage
      case "legendary":
        return baseDamage * 2; // 100% more damage
      case "mythic":
        return baseDamage * 3; // 200% more damage
      default: // "normal"
        return baseDamage;
    }
  }

  calculateAttackSpeed(rarity) {
    const baseAttackSpeed = 1500;
    switch (rarity) {
      case "rare":
        return baseAttackSpeed * 0.9; // 10% faster attack speed
      case "epic":
        return baseAttackSpeed * 0.8; // 20% faster attack speed
      case "legendary":
        return baseAttackSpeed * 0.7; // 30% faster attack speed
      case "mythic":
        return baseAttackSpeed * 0.5; // 50% faster attack speed
      default: // "normal"
        return baseAttackSpeed;
    }
  }

  canAttack(currentTime) {
    return currentTime - this.lastAttack >= this.attackSpeed;
  }

  resetHealth() {
    this.currentHealth = this.maxHealth;
  }
}

export default Enemy;
