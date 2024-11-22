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
    }

    return parsedData;
  }
  return null;
};

export const clearSave = () => {
  localStorage.removeItem("gameProgress");
};
