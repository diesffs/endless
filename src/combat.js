import {
  updatePlayerLife,
  updateEnemyLife,
  updateResources,
  updateStageUI,
  updateBuffIndicators,
  updateTabIndicators,
} from './ui/ui.js';
import Enemy from './enemy.js';
import { hero, game, inventory, prestige, statistics, skillTree, quests } from './globals.js';
import { ITEM_RARITY } from './constants/items.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateQuestsUI } from './ui/questUi.js';

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

      const thornsDamage = hero.calculateTotalThornsDamage(game.currentEnemy.damage);
      // only if there is some thorns damage to deal, only paladin
      if (thornsDamage - game.currentEnemy.damage > 1) {
        game.damageEnemy(thornsDamage);
        createDamageNumber(thornsDamage, false);
      }

      // check currently applied buffs and if fireShield is active, return its damage to the attacker.
      if (skillTree.activeBuffs.has('fireShield')) {
        const fireReflect = hero.stats.reflectFireDamage || 0;
        if (fireReflect > 0) {
          game.damageEnemy(fireReflect);
          createDamageNumber(fireReflect, false);
          updateEnemyLife();
        }
      }

      game.damagePlayer(effectiveDamage);
      createDamageNumber(Math.floor(effectiveDamage), true);
    }

    // Record the enemy's last attack time
    game.currentEnemy.lastAttack = currentTime;
  }
}

export function playerAttack(currentTime) {
  if (!game || !game.currentEnemy) return;
  const timeBetweenAttacks = 1000 / hero.stats.attackSpeed;

  if (currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    if (game.currentEnemy.currentLife > 0) {
      // Calculate if attack hits
      const hitChance = calculateHitChance(hero.stats.attackRating, game.stage);
      const roll = Math.random() * 100;

      if (roll > hitChance) {
        // to take up mana even when missing. (for toggle skills)
        skillTree.applyToggleEffects();
        createDamageNumber('MISS', false, false, false, true);
      } else {
        const { damage, isCritical } = hero.calculateTotalDamage();
        const lifeStealAmount = damage * (hero.stats.lifeSteal / 100);
        const lifePerHitAmount = hero.stats.lifePerHit * (1 + (hero.stats.lifePerHitPercent || 0) / 100);
        game.healPlayer(lifeStealAmount + lifePerHitAmount);
        game.damageEnemy(damage);
        createDamageNumber(damage, false, isCritical);
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
  game.resetAllLife();

  // Update all UI elements
  updatePlayerLife();
  if (game.currentEnemy) {
    updateEnemyLife();
  }
  updateResources();
  updateStatsAndAttributesUI();

  // Reset buffs and indicators
  skillTree.stopAllBuffs();
  updateBuffIndicators();

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
  const rarityData = ENEMY_RARITY[enemy.rarity] || {};
  // const droppedItem = dropLoot(enemy);

  const baseExpGained = Math.floor(10 + game.stage * 2.25);
  const baseGoldGained = 10 + game.stage * 4;

  // Apply bonus experience and gold (include region multipliers)
  const expGained = Math.floor(
    baseExpGained * (1 + hero.stats.bonusExperience / 100) * (enemy.xpMultiplier || 1) * (rarityData.xpBonus || 1)
  );
  const goldGained = Math.floor(
    baseGoldGained * (1 + hero.stats.bonusGold / 100) * (enemy.goldMultiplier || 1) * (rarityData.goldBonus || 1)
  );

  hero.gainGold(goldGained);
  hero.gainExp(expGained);

  if (enemy.rollForDrop()) {
    const itemLevel = enemy.calculateItemLevel(game.stage);
    const itemType = enemy.getRandomItemType();
    const newItem = inventory.createItem(itemType, itemLevel);
    inventory.addItemToInventory(newItem);

    showLootNotification(newItem);
  }
  // Drop material (new, separate chance)
  const materialDropRolls = Math.floor(game.stage / 30) + 1;
  if (enemy.rollForMaterialDrop) {
    for (let i = 0; i < materialDropRolls; i++) {
      if (enemy.rollForMaterialDrop()) {
        const mat = inventory.getRandomMaterial();
        inventory.addMaterial({ id: mat.id, icon: mat.icon, qty: 1 });
        showMaterialNotification(mat);
      }
    }
  }

  game.incrementStage();
  game.currentEnemy = new Enemy(game.stage);
  game.currentEnemy.lastAttack = Date.now();

  statistics.increment('enemiesKilled', 'total');
  statistics.increment('enemiesKilled', enemy.rarity.toLowerCase());
  updateQuestsUI();

  // Update tab indicators for new items/materials dropped
  updateTabIndicators();

  // Continue existing UI updates
  updateResources();
  updateEnemyLife();
  updateStatsAndAttributesUI();

  game.saveGame();
}

function showMaterialNotification(mat) {
  const notification = document.createElement('div');
  notification.className = 'loot-notification';
  notification.style.color = '#FFD700';
  notification.textContent = `Found: ${mat.icon} ${mat.name}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
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
  const enemyElement = game.currentEnemy.element;
  const elementClass = `element-${enemyElement}`;
  const enemySection = document.querySelector('.enemy-section');
  enemySection.classList.add(elementClass);

  const target = isPlayer ? '#character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  // Use parent container for positioning
  const parent = avatar.parentElement;
  // Make sure parent is positioned
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

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
    damageEl.textContent = isCritical ? `💥 -${Math.floor(damage)}` : `-${Math.floor(damage)}`;
  }

  // Get avatar's position relative to parent
  const avatarRect = avatar.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const offsetX = avatarRect.left - parentRect.left;
  const offsetY = avatarRect.top - parentRect.top;

  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;

  damageEl.style.position = 'absolute';
  damageEl.style.left = `${offsetX + avatar.offsetWidth / 2 + randomX}px`;
  damageEl.style.top = `${offsetY + avatar.offsetHeight / 2 + randomY}px`;

  parent.appendChild(damageEl);
  setTimeout(() => damageEl.remove(), 1000);
}

export function createCombatText(text, isPlayer = true) {
  // Allow targeting enemy or player
  const target = isPlayer ? '#character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  const parent = avatar.parentElement;
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  const textEl = document.createElement('div');
  textEl.className = 'damage-number level-up';
  textEl.textContent = text;
  textEl.style.color = '#FFD700';

  const avatarRect = avatar.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const offsetX = avatarRect.left - parentRect.left;
  const offsetY = avatarRect.top - parentRect.top;

  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;

  textEl.style.position = 'absolute';
  textEl.style.left = `${offsetX + avatar.offsetWidth / 2 + randomX}px`;
  textEl.style.top = `${offsetY + avatar.offsetHeight / 2 + randomY}px`;

  parent.appendChild(textEl);
  setTimeout(() => textEl.remove(), 1000);
}

export function calculateHitChance(attackRating, stage) {
  const stageScaling = 1 + (stage - 1) * 0.25; // Linear 25% increase per stage
  const baseChance = (attackRating / (attackRating + 25 * stageScaling)) * 100;
  return Math.min(Math.max(baseChance, 10), 100);
}
