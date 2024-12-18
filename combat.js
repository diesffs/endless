import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateResources,
  updateZoneUI,
  updateStatsAndAttributesUI,
} from './ui.js';
import Enemy from './enemy.js';
import { ITEM_RARITY } from './item.js';
import { hero, game, inventory } from './main.js';

export function enemyAttack(game, currentTime) {
  if (!game || !hero || !game.currentEnemy) return;
  if (game.currentEnemy.canAttack(currentTime)) {
    // Check for block first
    const isBlocked = Math.random() * 100 < hero.stats.blockChance;

    if (isBlocked) {
      // Show "BLOCKED" text instead of damage number
      createDamageNumber('BLOCKED', true, false, true);
    } else {
      // Calculate armor reduction
      const armor = hero.stats.armor;
      const damageReduction = armor / (100 + armor);
      const effectiveDamage = game.currentEnemy.damage * (1 - damageReduction);

      // Apply reduced damage to player's health
      hero.stats.currentHealth -= effectiveDamage;
      if (hero.stats.currentHealth < 0) hero.stats.currentHealth = 0;

      // Show the damage number
      createDamageNumber(Math.floor(effectiveDamage), true);

      // Update player health UI
      updatePlayerHealth();

      // Handle player death if health drops to 0
      if (hero.stats.currentHealth <= 0) playerDeath(game);
    }

    // Record the enemy's last attack time
    game.currentEnemy.lastAttack = currentTime;
  }
}

export function playerAttack(game, currentTime) {
  if (!game || !game.currentEnemy) return;
  const timeBetweenAttacks = 1000 / hero.stats.attackSpeed;

  if (currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    if (game.currentEnemy.currentHealth > 0) {
      // Calculate if attack hits
      const hitChance = calculateHitChance(hero.stats.attackRating, game.zone);
      const roll = Math.random() * 100;

      if (roll > hitChance) {
        // Miss
        createDamageNumber('MISS', false, false, false, true);
      } else {
        // Hit - existing damage calculation code
        const isCritical = Math.random() * 100 < hero.stats.critChance;
        const damage = hero.calculateTotalDamage(isCritical);
        const lifeStealAmount = damage * (hero.stats.lifeSteal / 100);
        hero.stats.currentHealth = Math.min(hero.stats.maxHealth, hero.stats.currentHealth + lifeStealAmount);

        game.currentEnemy.currentHealth -= damage;
        createDamageNumber(damage, false, isCritical);
      }

      updateEnemyHealth();

      if (game.currentEnemy.currentHealth <= 0) {
        defeatEnemy();
      }
    }
    game.lastPlayerAttack = currentTime;
  }
}

// Remove any duplicate definitions and keep this single version
export function playerDeath(game) {
  if (!game) {
    console.error('Game is not properly initialized in playerDeath.');
    return;
  }

  const shouldContinue = hero.crystalUpgrades.continuousPlay;

  if (!shouldContinue) {
    game.gameStarted = false;
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Start';
      startBtn.style.backgroundColor = '#059669';
    }
  }

  // Reset everything regardless of continue state
  game.zone = hero.startingZone;
  updateZoneUI();
  game.currentEnemy = new Enemy(game.zone);
  game.resetAllHealth();

  // Update all UI elements
  updatePlayerHealth();
  if (game.currentEnemy) {
    updateEnemyHealth();
  }
  updateResources();
  updateStatsAndAttributesUI();

  // If continuing, restart the game state
  if (shouldContinue) {
    game.gameStarted = true;
    game.lastPlayerAttack = Date.now();
    if (game.currentEnemy) {
      game.currentEnemy.lastAttack = Date.now();
    }
  }
}

function defeatEnemy() {
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

  if (enemy.rollForDrop()) {
    const itemLevel = enemy.calculateItemLevel(game.zone);
    const itemType = enemy.getRandomItemType();
    const newItem = inventory.createItem(itemType, itemLevel);
    inventory.addItemToInventory(newItem);

    showLootNotification(newItem);
  }

  game.incrementZone();
  game.currentEnemy = new Enemy(game.zone);
  game.currentEnemy.lastAttack = Date.now();

  updateResources();
  updateEnemyHealth();
  updateStatsAndAttributesUI();

  game.saveGame();
}

function showLootNotification(item) {
  const notification = document.createElement('div');
  notification.className = 'loot-notification';
  notification.style.color = ITEM_RARITY[item.rarity].color;
  notification.textContent = `Found: ${item.getDisplayName()}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

function createDamageNumber(damage, isPlayer, isCritical = false, isBlocked = false, isMiss = false) {
  const target = isPlayer ? '.character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  const damageEl = document.createElement('div');

  if (isBlocked) {
    damageEl.className = 'damage-number blocked';
    damageEl.textContent = 'BLOCKED';
    damageEl.style.color = '#4CAF50';
  } else if (isMiss) {
    damageEl.className = 'damage-number miss';
    damageEl.textContent = 'MISS';
    damageEl.style.color = '#888888';
  } else {
    damageEl.className = isCritical ? 'damage-number critical' : 'damage-number';
    damageEl.textContent = isCritical ? `CRIT! -${Math.floor(damage)}` : `-${Math.floor(damage)}`;
  }

  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;
  damageEl.style.setProperty('--x', `${randomX}px`);
  damageEl.style.setProperty('--y', `${randomY}px`);
  avatar.appendChild(damageEl);
  setTimeout(() => damageEl.remove(), 1000);
}

export function createCombatText(text) {
  const target = '.character-avatar';
  const avatar = document.querySelector(target);
  const textEl = document.createElement('div');

  textEl.className = 'damage-number level-up';
  textEl.textContent = text;
  textEl.style.color = '#FFD700';

  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;
  textEl.style.setProperty('--x', `${randomX}px`);
  textEl.style.setProperty('--y', `${randomY}px`);
  avatar.appendChild(textEl);
  setTimeout(() => textEl.remove(), 1000);
}

export function calculateHitChance(attackRating, zone) {
  const zoneScaling = Math.pow(1.05, zone - 1);
  const baseChance = (attackRating / (attackRating + 15 * zoneScaling)) * 100; // Reduced from 50 to 15
  return Math.min(Math.max(baseChance, 5), 95);
}
