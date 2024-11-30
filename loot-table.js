import { ITEM_TYPES, ITEM_RARITY } from './item.js';

export function calculateDropChance(enemy) {
  return 2;
}

export function calculateItemLevel(zone) {
  return Math.max(1, Math.floor(zone * 0.7));
}

export function rollForDrop(enemy) {
  const dropChance = calculateDropChance(enemy);
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

  return ITEM_RARITY.NORMAL.type;
}

export function getRandomItemType() {
  const types = Object.values(ITEM_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}
