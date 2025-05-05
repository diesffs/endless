import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateResources,
  updateStageUI,
  updateStatsAndAttributesUI,
} from './ui.js';
import Enemy from './enemy.js';
import { ITEM_RARITY } from './item.js';
import { hero, game, inventory, prestige, statistics } from './globals.js';

export function enemyAttack(currentTime) {
  if (!game || !hero || !game.currentEnemy) return;
  if (game.currentEnemy.canAttack(currentTime)) {
    // Check for block first
    const isBlocked = Math.random() * 100 < hero.stats.blockChance;

    if (isBlocked) {
      // Calculate and apply block healing
      const healAmount = hero.calculateBlockHealing();

      // Show "BLOCKED" text instead of damage number
      createDamageNumber('BLOCKED', true, false, true);
      if (healAmount > 0) {
        createDamageNumber(`+${Math.floor(healAmount)}`, true, false, false, false, true);
      }
    } else {
      // Calculate armor reduction
      const damageReduction = hero.calculateArmorReduction() / 100;
      const effectiveDamage = Math.floor(game.currentEnemy.damage * (1 - damageReduction));

      // Apply reduced damage to player's health
      hero.stats.currentHealth -= effectiveDamage;
      if (hero.stats.currentHealth < 0) hero.stats.currentHealth = 0;

      // Show the damage number
      createDamageNumber(Math.floor(effectiveDamage), true);

      // Update player health UI
      updatePlayerHealth();

      // Handle player death if health drops to 0
      if (hero.stats.currentHealth <= 0) playerDeath();
    }

    // Record the enemy's last attack time
    game.currentEnemy.lastAttack = currentTime;
  }
}

export function playerAttack(currentTime) {
  if (!game || !game.currentEnemy) return;
  const timeBetweenAttacks = 1000 / hero.stats.attackSpeed;

  if (currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    if (game.currentEnemy.currentHealth > 0) {
      // Calculate if attack hits
      const hitChance = calculateHitChance(hero.stats.attackRating, game.stage);
      const roll = Math.random() * 100;

      if (roll > hitChance) {
        // Miss
        createDamageNumber('MISS', false, false, false, true);
      } else {
        // Hit - existing damage calculation code
        const isCritical = Math.random() * 100 < hero.stats.critChance;
        const damage = hero.calculateTotalDamage(isCritical);
        const lifeStealAmount = damage * (hero.stats.lifeSteal / 100);
        hero.stats.currentHealth = Math.min(hero.stats.health, hero.stats.currentHealth + lifeStealAmount);

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
export function playerDeath() {
  const shouldContinue = prestige.crystalUpgrades.continuousPlay;

  if (!shouldContinue) {
    game.gameStarted = false;
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Start';
      startBtn.style.backgroundColor = '#059669';
    }
  }

  // Reset everything regardless of continue state
  game.stage = hero.startingStage;
  updateStageUI();
  game.currentEnemy = new Enemy(game.stage);
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

export function defeatEnemy() {
  const enemy = game.currentEnemy;
  // const droppedItem = dropLoot(enemy);

  const baseExpGained = game.stage * 5;
  const baseGoldGained = 10 + game.stage * 8;

  // Apply bonus experience and gold
  const expGained = Math.floor(baseExpGained * (1 + hero.stats.bonusExperience / 100));
  const goldGained = Math.floor(baseGoldGained * (1 + hero.stats.bonusGold / 100));

  hero.gold += goldGained;
  hero.gainExp(expGained);

  if (enemy.rollForDrop()) {
    const itemLevel = enemy.calculateItemLevel(game.stage);
    const itemType = enemy.getRandomItemType();
    const newItem = inventory.createItem(itemType, itemLevel);
    inventory.addItemToInventory(newItem);

    showLootNotification(newItem);
  }

  game.incrementStage();
  game.currentEnemy = new Enemy(game.stage);
  game.currentEnemy.lastAttack = Date.now();

  statistics.increment('enemiesKilled', 'total');
  statistics.increment('enemiesKilled', enemy.rarity.toLowerCase());

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

export function createDamageNumber(damage, isPlayer, isCritical = false, isBlocked = false, isMiss = false) {
  // Add to existing function
  const enemyElement = game.currentEnemy.element;
  const elementClass = `element-${enemyElement}`;

  // Add element class to enemy section
  const enemySection = document.querySelector('.enemy-section');
  enemySection.classList.add(elementClass);

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

export function calculateHitChance(attackRating, stage) {
  const stageScaling = 1 + (stage - 1) * 0.1; // Linear 10% increase per stage
  const baseChance = (attackRating / (attackRating + 25 * stageScaling)) * 100;
  return Math.min(Math.max(baseChance, 10), 100);
}
