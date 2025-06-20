import {
  updatePlayerLife,
  updateEnemyStats,
  updateResources,
  updateStageUI,
  updateBuffIndicators,
  updateTabIndicators,
  showToast,
} from './ui/ui.js';
import Enemy from './enemy.js';
import { hero, game, inventory, crystalShop, statistics, skillTree, dataManager } from './globals.js';
import { ITEM_RARITY } from './constants/items.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateQuestsUI } from './ui/questUi.js';
import { updateBossUI } from './ui/bossUi.js';
import { getCurrentRegion } from './region.js';

export function enemyAttack(currentTime) {
  if (!game || !hero || !game.currentEnemy) return;
  if (game.currentEnemy.canAttack(currentTime)) {
    // Check for block first
    const isBlocked = Math.random() * 100 < hero.stats.blockChance;

    if (isBlocked) {
      // Calculate and apply block healing
      const healAmount = hero.calculateBlockHealing();

      // Show "BLOCKED" text instead of damage number
      createDamageNumber({ text: 'BLOCKED', isPlayer: true, color: '#66bd02' });
      if (healAmount > 0) {
        createDamageNumber({ text: `+${Math.floor(healAmount)}`, isPlayer: true, color: '#4CAF50' });
      }
    } else {
      // Calculate armor reduction
      const damageReduction = hero.calculateArmorReduction() / 100;
      const effectiveDamage = Math.floor(game.currentEnemy.damage * (1 - damageReduction));

      const thornsDamage = hero.calculateTotalThornsDamage(game.currentEnemy.damage);
      // only if there is some thorns damage to deal, only paladin
      if (thornsDamage - game.currentEnemy.damage > 1) {
        game.damageEnemy(thornsDamage);
        createDamageNumber({ text: `${thornsDamage}` });
      }

      // check currently applied buffs and if fireShield is active, return its damage to the attacker.
      if (skillTree.activeBuffs.has('fireShield')) {
        const fireReflect = Math.floor(hero.stats.reflectFireDamage || 0);
        if (fireReflect > 0) {
          game.damageEnemy(fireReflect);
          createDamageNumber({ text: `${fireReflect}` });
          updateEnemyStats();
        }
      }

      game.damagePlayer(effectiveDamage);
      createDamageNumber({ text: `-${Math.floor(effectiveDamage)}`, isPlayer: true });
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
      const hitChance = hero.calculateHitChance();
      const roll = Math.random() * 100;

      if (roll > hitChance) {
        // to take up mana even when missing. (for toggle skills)
        skillTree.applyToggleEffects();
        createDamageNumber({ text: 'MISS', color: '#888888' });
      } else {
        const { damage, isCritical } = hero.calculateTotalDamage();
        const lifeStealAmount = damage * (hero.stats.lifeSteal / 100);
        const lifePerHitAmount = hero.stats.lifePerHit * (1 + (hero.stats.lifePerHitPercent || 0) / 100);
        game.healPlayer(lifeStealAmount + lifePerHitAmount);
        game.restoreMana(hero.stats.manaPerHit * (1 + (hero.stats.manaPerHitPercent || 0) / 100) || 0);
        game.damageEnemy(damage);
        createDamageNumber({ text: isCritical ? ` -${Math.floor(damage)}` : `-${Math.floor(damage)}`, isCritical });
      }
      if (game.fightMode === 'arena') {
        updateBossUI(game.currentEnemy);
      }
    }
    game.lastPlayerAttack = currentTime;
  }
}

// Remove any duplicate definitions and keep this single version
export function playerDeath() {
  const shouldContinue = crystalShop.crystalUpgrades.continuousPlay;

  if (!shouldContinue) {
    game.gameStarted = false;
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Fight';
      startBtn.style.backgroundColor = '#059669';
    }
  }

  if (game.fightMode === 'arena') {
    // If in arena, reset boss state and player health
    game.currentEnemy.resetLife();
    game.resetAllLife(); // <-- Ensure player health is reset
    updateBossUI(game.currentEnemy);
  } else if (game.fightMode === 'explore') {
    // Reset everything regardless of continue state
    game.stage = game.getStartingStage();
    updateStageUI();
    game.currentEnemy = new Enemy(game.stage);
    game.resetAllLife();
  }

  // reset ressurect counts
  game.resurrectCount = 0;
  game.soulShopResurrectCount = 0;

  // Update all UI elements
  if (game.currentEnemy) {
    updateEnemyStats();
  }
  updateResources();
  updateStatsAndAttributesUI();
  updatePlayerLife();

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

export async function defeatEnemy() {
  const enemy = game.currentEnemy;
  let baseExpGained = 1; // overwritten
  let baseGoldGained = 1; // overwritten

  // Add 500ms delay between monster kills
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (game.fightMode === 'arena') {
    baseExpGained = Math.floor(12 + hero.bossLevel * 2.25);
    baseGoldGained = 10 + hero.bossLevel * 4;

    const { crystals, gold, materials, souls } = game.currentEnemy.reward;
    let text = `Boss defeated! `;
    if (gold) {
      hero.gainGold(gold);
      text += `+${gold} gold, `;
    }
    if (crystals) {
      hero.gainCrystals(crystals);
      text += `+${crystals} crystals, `;
    }
    if (souls) {
      hero.gainSouls(souls + Math.floor(hero.bossLevel * 0.01)); // +1% per boss level
      text += `+${souls + Math.floor(hero.bossLevel * 0.01)} souls, `;
    }
    if (materials && materials.length) {
      materials.forEach(({ id, qty }) => inventory.addMaterial({ id, qty }));
    }
    showToast(text, 'success');
    hero.bossLevel++;
    updateResources();
  } else if (game.fightMode === 'explore') {
    baseExpGained = Math.floor(6 + game.stage * 1.5);
    baseGoldGained = 5 + game.stage * 4;

    if (enemy.rollForDrop()) {
      const itemLevel = enemy.calculateItemLevel(game.stage);
      const itemType = enemy.getRandomItemType();
      const region = getCurrentRegion();
      const newItem = inventory.createItem(itemType, itemLevel, undefined, region.tier);
      inventory.addItemToInventory(newItem);

      showLootNotification(newItem);
    }

    if (enemy.rollForMaterialDrop) {
      if (enemy.rollForMaterialDrop()) {
        const mat = inventory.getRandomMaterial();
        inventory.addMaterial({ id: mat.id, icon: mat.icon, qty: 1 });
        showMaterialNotification(mat);

        // Extra material drop logic: each extra drop is a new random material
        const extraChance = hero.stats.extraMaterialDropPercent * 100 || 0;
        let extraRolls = 0;
        const maxExtraRolls = hero.stats.extraMaterialDropMax;
        while (Math.random() * 100 < extraChance) {
          extraRolls++;
          const extraMat = inventory.getRandomMaterial();
          inventory.addMaterial({ id: extraMat.id, icon: extraMat.icon, qty: 1 });
          showMaterialNotification(extraMat);
          if (extraRolls >= maxExtraRolls) break;
        }
      }
    }

    game.incrementStage();
    game.currentEnemy = new Enemy(game.stage);

    statistics.increment('enemiesKilled', 'total');
    statistics.increment('enemiesKilled', enemy.rarity.toLowerCase());
  }
  // END EXPLORE REGION

  // empty object when vs boss
  const rarityData = ENEMY_RARITY[enemy.rarity] || {};

  // Apply bonus experience and gold (include region multipliers)
  const expGained = Math.floor(
    baseExpGained *
      (1 + hero.stats.bonusExperiencePercent / 100) *
      (enemy.xpMultiplier || 1) *
      (rarityData.xpBonus || 1)
  );
  const goldGained = Math.floor(
    baseGoldGained * (1 + hero.stats.bonusGoldPercent / 100) * (enemy.goldMultiplier || 1) * (rarityData.goldBonus || 1)
  );

  hero.gainGold(goldGained);
  hero.gainExp(expGained);

  game.currentEnemy.lastAttack = Date.now();

  updateQuestsUI();

  // Update tab indicators for new items/materials dropped
  updateTabIndicators();

  // Continue existing UI updates
  updateResources();
  updateEnemyStats();
  updateStatsAndAttributesUI();

  dataManager.saveGame();
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

export function createDamageNumber({ text = '', isPlayer = false, isCritical = false, color = '' } = {}) {
  const target = isPlayer ? '#character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  // Use parent container for positioning
  const parent = avatar.parentElement;
  // Make sure parent is positioned
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  const damageEl = document.createElement('div');
  damageEl.className = isCritical ? 'damage-number critical' : 'damage-number';
  damageEl.textContent = isCritical ? `💥 ${text}` : text;
  if (color) {
    damageEl.style.color = color;
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
