/**
 * Manages boss properties and state.
 */
import { BOSSES } from './constants/bosses.js';
import { statistics, game } from './globals.js';
import { selectBoss } from './ui/bossUi.js';

class Boss {
  /**
   * Create a new Boss instance based on level definition.
   * @param {number} level Boss level to load.
   */
  constructor(level) {
    const def = BOSSES.find((b) => b.level === level) || BOSSES[BOSSES.length - 1];
    this.level = def.level;
    this.id = def.id;
    this.name = def.name;
    this.image = def.image;
    // Multipliers
    this.lifeMultiplier = def.lifeMultiplier || 1;
    this.damageMultiplier = def.damageMultiplier || 1;
    this.xpMultiplier = def.xpMultiplier || 1;
    this.goldMultiplier = def.goldMultiplier || 1;
    this.itemDropMultiplier = def.itemDropMultiplier || 1;
    this.materialDropMultiplier = def.materialDropMultiplier || 1;
    this.materialDropWeights = def.materialDropWeights || {};
    // Base stats
    this.baseLife = 3000;
    this.baseDamage = 20;
    // Scaled stats
    this.life = (this.baseLife + this.level * 677) * this.lifeMultiplier;
    this.currentLife = this.life;
    this.damage = (this.baseDamage + this.level * 17) * this.damageMultiplier;
    // Attack timing for boss combat
    this.attackSpeed = def.attackSpeed || 1; // attacks per second
    this.lastAttack = Date.now();
    this.reward = def.reward;
  }

  /**
   * Inflict damage to the boss.
   * @param {number} amount Amount of damage.
   * @returns {boolean} True if boss is dead after damage.
   */
  takeDamage(amount) {
    this.currentLife = Math.max(this.currentLife - amount, 0);
    // On death
    if (this.currentLife === 0) {
      // Track kill and bump boss level
      statistics.increment('bossesKilled', null, 1);
      const nextLevel = this.level + 1;
      game.bossLevel = nextLevel;
      // Auto-select next boss
      selectBoss(game, nextLevel);
      return true;
    }
    return false;
  }

  /**
   * Reset boss life to full.
   */
  resetLife() {
    this.currentLife = this.life;
  }

  /**
   * Get life percentage for UI display.
   * @returns {number} Percentage of life remaining.
   */
  getLifePercent() {
    return (this.currentLife / this.life) * 100;
  }

  /**
   * Whether boss can attack again based on attackSpeed.
   * @param {number} currentTime Timestamp in ms
   * @returns {boolean}
   */
  canAttack(currentTime) {
    return currentTime - this.lastAttack >= this.attackSpeed * 1000;
  }
}

export default Boss;
