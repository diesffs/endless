import { updatePlayerHealth, updateEnemyHealth, updateResources, updateZoneUI } from './ui.js';
import Enemy from './enemy.js';
import { calculateItemLevel, getRandomItemType, rollForDrop } from './loot-table.js';
import { ITEM_RARITY } from './item.js';
import { hero, game } from './main.js';
import { saveGame } from './storage.js';

export function enemyAttack(game, currentTime) {
  if (!game || !hero || !game.currentEnemy) return;
  if (game.currentEnemy.canAttack(currentTime)) {
    // Calculate armor reduction
    const armor = hero.stats.armor;
    const damageReduction = armor / (100 + armor); // Example formula
    const effectiveDamage = game.currentEnemy.damage * (1 - damageReduction);

    // Apply reduced damage to player's health
    hero.stats.currentHealth -= effectiveDamage;
    if (hero.stats.currentHealth < 0) hero.stats.currentHealth = 0;

    // Show the damage number (rounded down for clarity)
    createDamageNumber(Math.floor(effectiveDamage), true);

    // Update player health UI
    updatePlayerHealth(hero.stats);

    // Record the enemy's last attack time
    game.currentEnemy.lastAttack = currentTime;

    // Handle player death if health drops to 0
    if (hero.stats.currentHealth <= 0) playerDeath(game);
  }
}

export function playerAttack(game, currentTime) {
  if (!game || !game.currentEnemy) return;
  const timeBetweenAttacks = 1000 / hero.stats.attackSpeed; // Convert attacks/sec to ms
  if (currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    if (game.currentEnemy.currentHealth > 0) {
      // Calculate critical hit
      const isCritical = Math.random() * 100 < hero.stats.critChance; // Compare random number to critChance
      const damage = isCritical
        ? hero.stats.damage * hero.stats.critDamage // Critical hit: apply multiplier
        : hero.stats.damage; // Normal damage

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

// Remove any duplicate definitions and keep this single version
export function playerDeath(game) {
  if (!game) {
    console.error('Game is not properly initialized in playerDeath.');
    return;
  }

  game.gameStarted = false;

  // Reset button state
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.textContent = 'Start';
    startBtn.style.backgroundColor = '#059669';
  }

  // Reset the zone and update the UI
  game.zone = 1;
  updateZoneUI(game.zone);
  game.currentEnemy = new Enemy(game.zone);

  // Reset player and enemy health
  game.resetAllHealth();

  // Update UI elements
  updatePlayerHealth(hero.stats);
  if (game.currentEnemy) {
    updateEnemyHealth(game.currentEnemy);
  }

  // Update resources for UI consistency
  updateResources(hero, game);
}

function defeatEnemy(game) {
  const enemy = game.currentEnemy;
  // const droppedItem = dropLoot(enemy);

  if (!game) {
    console.error('Game is undefined in defeatEnemy');
    return;
  }

  const expGained = 20 + game.zone * 5;
  const goldGained = 10 + game.zone * 5;

  hero.gold += goldGained;
  hero.gainExp(expGained);

  const newPrestigeSouls = Math.floor(game.zone / 50);
  hero.prestigeProgress = newPrestigeSouls;

  if (rollForDrop(enemy)) {
    const itemLevel = calculateItemLevel(game.zone);
    const itemType = getRandomItemType();
    const newItem = game.inventory.createItem(itemType, itemLevel);
    game.inventory.addItemToInventory(newItem);

    showLootNotification(newItem);
  }

  game.incrementZone();
  hero.displayStats();
  game.currentEnemy = new Enemy(game.zone);
  game.currentEnemy.lastAttack = Date.now();

  updateResources(hero, game);
  updateEnemyHealth(game.currentEnemy);

  saveGame();
}

function showLootNotification(item) {
  const notification = document.createElement('div');
  notification.className = 'loot-notification';
  notification.style.color = ITEM_RARITY[item.rarity].color;
  notification.textContent = `Found: ${item.getDisplayName()}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

function createDamageNumber(damage, isPlayer, isCritical = false) {
  const target = isPlayer ? '.character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  const damageEl = document.createElement('div');
  damageEl.className = isCritical ? 'damage-number critical' : 'damage-number'; // Add "critical" class for critical hits
  damageEl.textContent = isCritical ? `CRIT! -${Math.floor(damage)}` : `-${Math.floor(damage)}`;
  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;
  damageEl.style.setProperty('--x', `${randomX}px`);
  damageEl.style.setProperty('--y', `${randomY}px`);
  avatar.appendChild(damageEl);
  setTimeout(() => damageEl.remove(), 1000);
}
