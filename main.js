import Hero from './hero.js';
import Game from './game.js';
import Shop from './shop.js';
import {
  initializeUI,
  updateEnemyHealth,
  updatePlayerHealth,
  updateResources,
  updateStatsAndAttributesUI,
  updateZoneUI,
} from './ui.js';
import { loadGame, saveGame } from './storage.js';
import Prestige from './prestige.js';
import Inventory from './inventory.js';
import SkillTree from './skillTree.js';
import { initializeSkillTreeUI } from './skillTreeUI.js';

window.log = console.log;

const savedData = loadGame();

export const game = new Game();
export const hero = new Hero(savedData?.hero);
export const inventory = new Inventory(savedData?.inventory);
export const skillTree = new SkillTree(savedData?.skillTree);
export const prestige = new Prestige();
export const shop = new Shop();

game.zone = hero?.startingZone || 1;
initializeUI();
prestige.initializePrestigeUI();
updateResources();
hero.recalculateFromAttributes();
hero.stats.currentHealth = hero.stats.maxHealth;
updatePlayerHealth();
updateStatsAndAttributesUI();
updateZoneUI();
updateEnemyHealth();

initializeSkillTreeUI();

saveGame();

let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);
