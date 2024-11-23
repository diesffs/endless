export const saveGame = (game) => {
  const saveData = {
    hero: {
      stats: {
        level: game.stats.level,
        gold: game.stats.gold,
        souls: game.stats.souls,
        crystals: game.stats.crystals,
        exp: game.stats.exp,
        expToNextLevel: game.stats.expToNextLevel,
        primaryStats: game.stats.primaryStats,
        statPoints: game.stats.statPoints,
        stats: game.stats.stats,
        upgradeCosts: game.stats.upgradeCosts,
        upgradeLevels: game.stats.upgradeLevels,
        souls: game.stats.souls, // Save total souls
        prestigeProgress: game.stats.prestigeProgress,
        highestZone: game.stats.highestZone, // Save the highest zone
      },
    },
    zone: game.zone,
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
