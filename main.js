import Hero from './hero.js';
import Game from './game.js';
import Shop from './shop.js';
import { initializeUI, updateEnemyHealth, updatePlayerHealth, updateResources } from './ui.js';
import { loadGame } from './storage.js';
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
hero.displayStats();
updateResources(hero, game);
hero.stats.currentHealth = hero.stats.maxHealth;
updatePlayerHealth(hero.stats);
updateEnemyHealth(game.currentEnemy);

let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);
