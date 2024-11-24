import {
  updatePlayerHealth,
  updateEnemyHealth,
  updateResources,
  updateZoneUI,
} from "./ui.js";
import Enemy from "./enemy.js";
import {
  calculateItemLevel,
  getRandomItemType,
  rollForDrop,
} from "./loot-table.js";
import { RARITY } from "./item.js";

const BASE_ATTACK_SPEED = 1; // 1 attack per second
const MIN_ATTACK_DELAY = 1000; // Minimum 1 second between attacks

// Helper function to check if enough time has passed for an attack
function canAttack(lastAttackTime, attackSpeed, currentTime) {
  const timeBetweenAttacks = 1000 / attackSpeed; // Convert attacks/sec to ms
  return currentTime - lastAttackTime >= timeBetweenAttacks;
}

export function enemyAttack(game, currentTime) {
  if (!game || !game.stats || !game.currentEnemy) return;

  // Initialize lastAttack if it doesn't exist
  if (game.currentEnemy.lastAttack === undefined) {
    game.currentEnemy.lastAttack = currentTime;
    return; // Skip first attack frame
  }

  // Force minimum delay between attacks
  if (currentTime - game.currentEnemy.lastAttack < MIN_ATTACK_DELAY) {
    return;
  }

  if (
    canAttack(
      game.currentEnemy.lastAttack,
      game.currentEnemy.attackSpeed,
      currentTime
    )
  ) {
    const armor = game.stats.stats.armor;
    const damageReduction = armor / (100 + armor);
    const effectiveDamage = game.currentEnemy.damage * (1 - damageReduction);

    game.stats.stats.currentHealth -= effectiveDamage;
    if (game.stats.stats.currentHealth <= 0) {
      game.stats.stats.currentHealth = 0;
      playerDeath(game);
      return;
    }

    createDamageNumber(Math.floor(effectiveDamage), true);
    updatePlayerHealth(game.stats.stats);
    game.currentEnemy.lastAttack = currentTime;
  }
}

export function playerAttack(game, currentTime) {
  if (!game || !game.currentEnemy) return;

  // Initialize lastAttack if it doesn't exist
  if (!game.lastPlayerAttack) {
    game.lastPlayerAttack = currentTime;
    return;
  }

  // Force minimum delay between attacks
  if (currentTime - game.lastPlayerAttack < MIN_ATTACK_DELAY) {
    return;
  }

  if (
    canAttack(game.lastPlayerAttack, game.stats.stats.attackSpeed, currentTime)
  ) {
    if (game.currentEnemy.currentHealth > 0) {
      const isCritical = Math.random() * 100 < game.stats.stats.critChance;
      const damage = isCritical
        ? game.stats.stats.damage * game.stats.stats.critDamage
        : game.stats.stats.damage;

      game.currentEnemy.currentHealth -= damage;
      createDamageNumber(Math.floor(damage), false, isCritical);
      updateEnemyHealth(game.currentEnemy);

      if (game.currentEnemy.currentHealth <= 0) {
        game.currentEnemy.currentHealth = 0;
        defeatEnemy(game);
      }
    }
    game.lastPlayerAttack = currentTime;
  }
}

// Remove any duplicate definitions and keep this single version
export function playerDeath(game) {
  if (!game) {
    console.error("Game is not properly initialized in playerDeath.");
    return;
  }

  game.gameStarted = false;
  resetCombatTimers(game, Date.now());

  // Reset button state
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.textContent = "Start";
    startBtn.style.backgroundColor = "#059669";
  }

  // Reset the zone and update the UI
  game.zone = 1;
  updateZoneUI(game.zone);
  game.currentEnemy = new Enemy(game.zone);

  // Reset player and enemy health
  game.resetAllHealth();

  // Update UI elements
  updatePlayerHealth(game.stats.stats);
  if (game.currentEnemy) {
    updateEnemyHealth(game.currentEnemy);
  }

  // Update resources for UI consistency
  updateResources(game.stats, game);
}

function defeatEnemy(game) {
  if (!game) {
    console.error("Game is undefined in defeatEnemy");
    return;
  }

  const expGained = 20 + game.zone * 5;
  const goldGained = 10 + game.zone * 5;

  // Gain gold and experience
  game.stats.gold += goldGained;
  game.stats.gainExp(expGained);

  // Update "Prestige for" progress (but NOT total souls)
  const newPrestigeSouls = Math.floor(game.zone / 50); // 1 soul per 50 zones
  game.stats.prestigeProgress = newPrestigeSouls;

  // Increment zone and spawn a new enemy
  game.incrementZone();
  game.hero.displayStats();
  game.currentEnemy = new Enemy(game.zone);
  resetCombatTimers(game, Date.now());
  game.currentEnemy.lastAttack = Date.now();
  // Update the UI
  updateResources(game.stats, game);
  updateEnemyHealth(game.currentEnemy);

  // Roll for item drop
  if (rollForDrop(game.zone)) {
    const itemLevel = calculateItemLevel(game.zone);
    const itemType = getRandomItemType();
    const newItem = game.inventory.createItem(itemType, itemLevel);
    game.inventory.addItemToInventory(newItem);

    // Show loot notification
    showLootNotification(newItem);
  }
}

export function resetCombatTimers(game, currentTime) {
  if (!game) return;
  const timestamp = currentTime || Date.now();
  game.lastPlayerAttack = timestamp;
  if (game.currentEnemy) {
    game.currentEnemy.lastAttack = timestamp;
  }
}

export function stopBattle(game) {
  if (!game) return;
  game.gameStarted = false;
  // Clear the combat timers
  game.lastPlayerAttack = 0;
  if (game.currentEnemy) {
    game.currentEnemy.lastAttack = 0;
  }
}

export function startBattle(game) {
  if (!game) return;
  const currentTime = Date.now();
  game.gameStarted = true;
  // Initialize combat timers
  game.lastPlayerAttack = currentTime;
  if (game.currentEnemy) {
    game.currentEnemy.lastAttack = currentTime;
  }
}

function showLootNotification(item) {
  const notification = document.createElement("div");
  notification.className = "loot-notification";
  notification.style.color = RARITY[item.rarity].color;
  notification.textContent = `Found: ${item.getDisplayName()}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
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
