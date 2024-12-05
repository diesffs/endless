import Hero from './hero.js';
import Game from './game.js';
import Shop from './shop.js';
import { initializeUI, updateEnemyHealth, updatePlayerHealth, updateResources } from './ui.js';
import { loadGame, saveGame } from './storage.js';
import Prestige from './prestige.js';

window.log = console.log;

const savedData = loadGame();

export const hero = savedData ? new Hero(savedData?.hero) : new Hero();
export const game = new Game(null, savedData);

initializeUI(game);

export const prestige = new Prestige(game);
game.prestige = prestige;

export const shop = new Shop();

prestige.initializePrestigeUI();
updateResources(hero, game);
hero.stats.currentHealth = hero.stats.maxHealth;
hero.recalculateFromAttributes();
hero.displayStats();
updatePlayerHealth(hero.stats);
updateEnemyHealth(game.currentEnemy);

saveGame();

let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);
