import Hero from './hero.js';
import Game from './game.js';
import Shop from './shop.js';
import {
  initializeSkillTreeUI,
  initializeUI,
  updateEnemyHealth,
  updatePlayerHealth,
  updateResources,
  updateStatsAndAttributesUI,
  updateZoneUI,
} from './ui.js';
import Prestige from './prestige.js';
import Inventory from './inventory.js';
import SkillTree from './skillTree.js';
import { createDebugUI } from './functions.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;

export const dev = false;

export const game = new Game();
const savedData = game.loadGame();

export const hero = new Hero(savedData?.hero);
export const inventory = new Inventory(savedData?.inventory);
export const skillTree = new SkillTree(savedData?.skillTree);
export const prestige = new Prestige(savedData?.prestige);
export const shop = new Shop(savedData?.shop);

game.zone = hero?.startingZone || 1;

initializeUI();
prestige.initializePrestigeUI();
initializeSkillTreeUI();

updateResources();
hero.recalculateFromAttributes();
hero.stats.currentHealth = hero.stats.health;
hero.stats.currentMana = hero.stats.mana;

updatePlayerHealth();
updateStatsAndAttributesUI();
updateZoneUI();
updateEnemyHealth();

game.saveGame();

let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);

if (dev) {
  hero.gold = 1000000;
  updateResources();
  // Create debug UI
  createDebugUI();
}
