import { game, hero } from './main.js';

export const saveGame = () => {
  const saveData = {
    hero: hero,
    inventory: game.inventory,
  };

  localStorage.setItem('gameProgress', JSON.stringify(saveData));
};

export const loadGame = () => {
  const savedData = localStorage.getItem('gameProgress');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    return parsedData;
  }
  return null;
};

export const clearSave = () => {
  localStorage.removeItem('gameProgress');
};
