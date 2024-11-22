
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
        upgradeLevels: game.stats.upgradeLevels
      }
    },
    zone: game.zone
  };

  localStorage.setItem('gameProgress', JSON.stringify(saveData));
};

export const loadGame = () => {
  const savedData = localStorage.getItem('gameProgress');
  return savedData ? JSON.parse(savedData) : null;
};

export const clearSave = () => {
  localStorage.removeItem('gameProgress');
};
