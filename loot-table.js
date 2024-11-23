import { ITEM_TYPES, RARITY } from './item.js';

export const ZONE_MULTIPLIER = 1.2; // Each zone increases drop chances

export function calculateDropChance(zone) {
    return Math.min(5 + (zone * 0.5), 50); // 5% base chance, max 50%
}

export function calculateItemLevel(zone) {
    return Math.max(1, Math.floor(zone * 0.7));
}

export function rollForDrop(zone) {
    const dropChance = calculateDropChance(zone);
    return Math.random() * 100 <= dropChance;
}

export function getRandomItemType() {
    const types = Object.values(ITEM_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}
