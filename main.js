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
import { createDebugUI, createModifyUI } from './functions.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;

export let dev = false;

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
  document.addEventListener('DOMContentLoaded', () => {
    // Create debug UI
    createDebugUI();
    createModifyUI();
  });
}

let keySequence = [];
const toggleSequence = ['e', 'd', 'e', 'v'];

document.addEventListener('keydown', (event) => {
  keySequence.push(event.key.toLowerCase());
  if (keySequence.length > toggleSequence.length) {
    keySequence.shift();
  }
  if (keySequence.join('') === toggleSequence.join('')) {
    dev = !dev;
    console.log(`Dev mode is now ${dev ? 'enabled' : 'disabled'}.`);
    if (dev) {
      createDebugUI();
      createModifyUI();
    } else {
      const debugDiv = document.querySelector('.debug-ui');
      const modifyUI = document.querySelector('.modify-ui');
      if (debugDiv) {
        debugDiv.remove();
      }
      if (modifyUI) {
        modifyUI.remove();
      }
    }
  }
});
