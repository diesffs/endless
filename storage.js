import { hero } from "./main.js";

export const saveGame = () => {
  const saveData = {
    hero: {
      stats: {
        level: hero.stats.level,
        gold: hero.stats.gold,
        crystals: hero.stats.crystals,
        exp: hero.stats.exp,
        expToNextLevel: hero.stats.expToNextLevel,
        primaryStats: hero.stats.primaryStats,
        statPoints: hero.stats.statPoints,
        stats: hero.stats.stats,
        upgradeCosts: hero.stats.upgradeCosts,
        upgradeLevels: hero.stats.upgradeLevels,
        souls: hero.stats.souls, // Save total souls
        prestigeProgress: hero.stats.prestigeProgress,
        highestZone: hero.stats.highestZone, // Save the highest zone
      },
    },
    zone: hero.zone,
    inventory: {
      equippedItems: hero.inventory.equippedItems, // Access inventory from hero
      inventoryItems: hero.inventory.inventoryItems, // Access inventory from hero
    },
  };

  localStorage.setItem("gameProgress", JSON.stringify(saveData));
};

export const loadGame = () => {
  const savedData = localStorage.getItem("gameProgress");
  if (savedData) {
    const parsedData = JSON.parse(savedData);

    // Restore upgrade levels and costs
    if (parsedData.hero && parsedData.hero.stats) {
      const stats = parsedData.hero.stats;
      stats.upgradeLevels = stats.upgradeLevels || {}; // Ensure default if missing
      stats.upgradeCosts = stats.upgradeCosts || {}; // Ensure default if missing
      stats.souls = stats.souls || 0; // Default to 0 if undefined
      stats.prestigeProgress = stats.prestigeProgress || 0;
      stats.highestZone = stats.highestZone || 1;
    }

    return parsedData;
  }
  return null;
};

export const clearSave = () => {
  localStorage.removeItem("gameProgress");
};
