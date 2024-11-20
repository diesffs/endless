class Enemy {
  constructor(level) {
    this.maxHealth = 50 + level * 10;
    this.currentHealth = this.maxHealth;
    this.name = `Enemy Lvl ${level}`;
    this.damage = 5 + level * 2;
    this.attackSpeed = 1500;
    this.lastAttack = 0;
  }

  canAttack(currentTime) {
    return currentTime - this.lastAttack >= this.attackSpeed;
  }

  resetHealth() {
    this.currentHealth = this.maxHealth;
  }
}

export default Enemy;
