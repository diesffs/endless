import { ITEM_TYPES, RARITY } from './item.js';
import Enemy from './enemy.js';
import Item from './item.js';

export const ZONE_MULTIPLIER = 1.2;

export function calculateDropChance(zone) {
  return Math.min(5 + zone * 0.5, 50);
}

export function calculateItemLevel(zone) {
  return Math.max(1, Math.floor(zone * 0.7));
}

export function rollForDrop(zone) {
  const dropChance = calculateDropChance(zone);
  return Math.random() * 100 <= dropChance;
}

export function getRandomItem(rarityChances) {
  const random = Math.random() * 100;
  let cumulativeChance = 0;

  for (const [rarity, chance] of Object.entries(rarityChances)) {
    cumulativeChance += chance;
    if (random < cumulativeChance) {
      return rarity.toUpperCase();
    }
  }

  return 'NORMAL';
}

export function dropLoot(enemy) {
  const rarityChances = enemy.getItemDropChances();
  const itemRarity = getRandomItem(rarityChances);
  const itemType = getRandomItemType();

  const item = new Item(itemType, enemy.level, itemRarity);
  return item;
}

export function getRandomItemType() {
  const types = Object.values(ITEM_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

const enemy = new Enemy(10);
const droppedItem = dropLoot(enemy);
