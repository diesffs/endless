import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateResources,
} from "./ui.js";
import Enemy from "./enemy.js";

export function playerAttack(game, currentTime) {
  const timeBetweenAttacks = 1000 / game.stats.stats.attackSpeed; // Convert attacks/sec to ms
  if (currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    if (game.currentEnemy.currentHealth > 0) {
      // Calculate critical hit
      const isCritical = Math.random() * 100 < game.stats.stats.critChance; // Compare random number to critChance
      const damage = isCritical
        ? game.stats.stats.damage * game.stats.stats.critDamage // Critical hit: apply multiplier
        : game.stats.stats.damage; // Normal damage

      // Apply damage to the enemy
      game.currentEnemy.currentHealth -= damage;

      // Display the damage with a critical marker if applicable
      createDamageNumber(damage, false, isCritical);
      updateEnemyHealth(game.currentEnemy);

      // Check if the enemy is defeated
      if (game.currentEnemy.currentHealth <= 0) defeatEnemy(game);
    }
    game.lastPlayerAttack = currentTime; // Record attack time
    if (game.hero && game.hero.displayStats) game.hero.displayStats();
  }
}

export function enemyAttack(game, currentTime) {
  if (game.currentEnemy.canAttack(currentTime)) {
    // Calculate armor reduction
    const armor = game.stats.stats.armor;
    const damageReduction = armor / (100 + armor); // Example formula
    const effectiveDamage = game.currentEnemy.damage * (1 - damageReduction);

    // Apply reduced damage to player's health
    game.stats.stats.currentHealth -= effectiveDamage;
    if (game.stats.stats.currentHealth < 0) game.stats.stats.currentHealth = 0;

    // Show the damage number (rounded down for clarity)
    createDamageNumber(Math.floor(effectiveDamage), true);

    // Update player health UI
    updatePlayerHealth(game.stats.stats);

    // Record the enemy's last attack time
    game.currentEnemy.lastAttack = currentTime;

    // Handle player death if health drops to 0
    if (game.stats.stats.currentHealth <= 0) playerDeath(game);
  }
}

function playerDeath(game) {
  game.gameStarted = false;
  const startBtn = document.getElementById("start-btn");
  startBtn.textContent = "Start";
  startBtn.style.backgroundColor = "#059669";
  updateResources(game.stats);
  game.resetAllHealth();
}

function defeatEnemy(game) {
  const expGained = 20 + game.stats.level * 5;
  const soulsGained = 1;
  game.stats.gold += 10 + game.stats.level * 5;
  game.stats.souls += soulsGained;
  game.stats.gainExp(expGained);
  game.incrementZone();
  game.hero.displayStats();
  game.currentEnemy = new Enemy(game.stats.level);
  updateResources(game.stats);
  updateEnemyHealth(game.currentEnemy);
}

function createDamageNumber(damage, isPlayer, isCritical = false) {
  const target = isPlayer ? ".character-avatar" : ".enemy-avatar";
  const avatar = document.querySelector(target);
  const damageEl = document.createElement("div");
  damageEl.className = isCritical ? "damage-number critical" : "damage-number"; // Add "critical" class for critical hits
  damageEl.textContent = isCritical
    ? `CRIT! -${Math.floor(damage)}`
    : `-${Math.floor(damage)}`;
  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;
  damageEl.style.setProperty("--x", `${randomX}px`);
  damageEl.style.setProperty("--y", `${randomY}px`);
  avatar.appendChild(damageEl);
  setTimeout(() => damageEl.remove(), 1000);
}
