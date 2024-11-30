import { ENEMY_RARITY } from './enemy.js';
import { ITEM_TYPES } from './item.js';

export function calculateDropChance(enemy) {
  const enemyConst = ENEMY_RARITY[enemy.rarity];
  return enemyConst.itemDropChance;
}

export function calculateItemLevel(zone) {
  return Math.max(1, Math.floor(zone * 0.7));
}

export function rollForDrop(enemy) {
  const dropChance = calculateDropChance(enemy);
  return Math.random() * 100 <= dropChance;
}

export function getRandomItemType() {
  const types = Object.values(ITEM_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}
