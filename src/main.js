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
import Statistics from './statistics.js';
import { apiFetch, saveGameData } from './api.js';
import { game, hero, inventory, shop, skillTree, prestige, statistics, setGlobals } from './globals.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;

export let dev = false;

// After creating all instances:
const _game = new Game();
const savedData = _game.loadGame();
const _hero = new Hero(savedData?.hero);
const _inventory = new Inventory(savedData?.inventory);
const _skillTree = new SkillTree(savedData?.skillTree);
const _prestige = new Prestige(savedData?.prestige);
const _shop = new Shop(savedData?.shop);
const _statistics = new Statistics(savedData?.statistics);

setGlobals({
  game: _game,
  hero: _hero,
  inventory: _inventory,
  shop: _shop,
  skillTree: _skillTree,
  prestige: _prestige,
  statistics: _statistics,
});

game.zone = hero?.startingZone || 1;

initializeUI();
prestige.initializePrestigeUI();
statistics.initializeStatisticsUI();
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

// Cloud Save UI logic
const cloudSaveStatus = document.getElementById('cloud-save-status');
const cloudSaveBtn = document.getElementById('cloud-save-btn');
let lastCloudSave = null;
let userSession = null;

async function checkSession() {
  try {
    const res = await apiFetch(`user/session`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not logged in');
    userSession = await res.json();
    cloudSaveStatus.textContent = lastCloudSave
      ? `Last cloud save: ${new Date(lastCloudSave).toLocaleTimeString()}`
      : 'Ready to save to cloud';
    cloudSaveBtn.disabled = false;
    cloudSaveBtn.classList.remove('disabled');
  } catch (error) {
    userSession = null;
    cloudSaveStatus.textContent = 'Not logged in';
    cloudSaveBtn.disabled = true;
    cloudSaveBtn.classList.add('disabled');
  }
}

cloudSaveBtn.addEventListener('click', async () => {
  if (!userSession) return;
  cloudSaveBtn.disabled = true;
  cloudSaveStatus.textContent = 'Saving...';
  try {
    // Save local game data to cloud
    await saveGameData(
      userSession.userId,
      {
        hero,
        skillTree,
        prestige,
        shop,
        inventory,
        statistics,
      },
      userSession.token
    );
    lastCloudSave = Date.now();
    cloudSaveStatus.textContent = `Last cloud save: ${new Date(lastCloudSave).toLocaleTimeString()}`;
  } catch (e) {
    cloudSaveStatus.textContent = 'Cloud save failed';
  } finally {
    cloudSaveBtn.disabled = !userSession;
  }
});

// Check session on load and every 60s
checkSession();
setInterval(checkSession, 60000);
