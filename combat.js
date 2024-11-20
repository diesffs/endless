import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateResources,
} from "./ui.js";
import Enemy from "./enemy.js";

export function playerAttack(game, currentTime) {
  if (currentTime - game.lastPlayerAttack >= game.playerAttackSpeed) {
    if (game.currentEnemy.currentHealth > 0) {
      game.currentEnemy.currentHealth -= game.stats.stats.damage;
      createDamageNumber(game.stats.stats.damage, false);
      updateEnemyHealth(game.currentEnemy);
      if (game.currentEnemy.currentHealth <= 0) defeatEnemy(game);
    }
    game.lastPlayerAttack = currentTime;
    if (game.hero && game.hero.displayStats) game.hero.displayStats();
  }
}

export function enemyAttack(game, currentTime) {
  if (game.currentEnemy.canAttack(currentTime)) {
    game.stats.stats.currentHealth -= game.currentEnemy.damage;
    if (game.stats.stats.currentHealth < 0) game.stats.stats.currentHealth = 0;
    createDamageNumber(game.currentEnemy.damage, true);
    updatePlayerHealth(game.stats.stats);
    game.currentEnemy.lastAttack = currentTime;
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

function createDamageNumber(damage, isPlayer) {
  const target = isPlayer ? ".character-avatar" : ".enemy-avatar";
  const avatar = document.querySelector(target);
  const damageEl = document.createElement("div");
  damageEl.className = "damage-number";
  damageEl.textContent = `-${Math.floor(damage)}`;
  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;
  damageEl.style.setProperty("--x", `${randomX}px`);
  damageEl.style.setProperty("--y", `${randomY}px`);
  avatar.appendChild(damageEl);
  setTimeout(() => damageEl.remove(), 1000);
}
