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
  updateStageUI,
  showConfirmDialog,
} from './ui.js';
import Prestige from './prestige.js';
import Inventory from './inventory.js';
import SkillTree from './skillTree.js';
import { createDebugUI, createModifyUI } from './functions.js';
import Statistics from './statistics.js';
import { apiFetch, loadGameData, saveGameData } from './api.js';
import { game, hero, inventory, shop, skillTree, prestige, statistics, setGlobals } from './globals.js';
import crypt from './encrypt.js';
import './region.js';
import { initializeRegionSystem, updateRegionUI } from './region.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;
window.log = console.log;

export let dev = false;

// Wrap initialization in an async IIFE to avoid top-level await error
(async () => {
  const _game = new Game();
  const savedData = await _game.loadGame();
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

  game.stage = hero?.startingStage || 1;

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
  updateStageUI();
  updateEnemyHealth();

  window.addEventListener('DOMContentLoaded', () => {
    initializeRegionSystem();
    updateRegionUI();
  });

  game.saveGame();

  let isRunning = false;
  setInterval(() => {
    if (!isRunning) {
      isRunning = true;
      game.gameLoop();
      isRunning = false;
    }
  }, 100);

  setInterval(() => {
    statistics.update();
    game.saveGame();
  }, 60000);

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
  const cloudLoadBtn = document.getElementById('cloud-load-btn');
  let lastCloudSave = null;
  let userSession = null;
  const isLocal = import.meta.env.VITE_IS_LOCAL || false;
  const gameName = import.meta.env.VITE_GAME_NAME || 'endless';

  async function checkSession() {
    try {
      const res = await apiFetch(`/user/session`, { credentials: 'include' });
      if (!res.ok) throw new Error('Not logged in');
      userSession = (await res.json()).user;

      // Fetch cloud save and compare with local
      let cloudInfo = null;
      let updatedAt = null;
      try {
        const cloudResult = await loadGameData(userSession.id, userSession.token);

        cloudInfo = cloudResult?.data?.hero;
        updatedAt = cloudResult?.updated_at || cloudResult?.data?.updated_at;
      } catch (e) {
        console.error('Failed to load cloud data:', e);
      }

      const localHero = hero;
      let statusMsg = 'Ready to save to cloud';
      const formatDateWithTimezone = (dateStr) => {
        if (!dateStr) return 'unknown';
        const date = new Date(dateStr);
        const options = {
          year: 'numeric',
          month: 'short', // e.g., "May"
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        };
        return date.toLocaleString(undefined, options);
      };
      if (cloudInfo && (cloudInfo.exp !== localHero.exp || cloudInfo.gold !== localHero.gold)) {
        statusMsg = `Local !== Cloud (Last cloud save: ${formatDateWithTimezone(updatedAt)})`;
      } else if (updatedAt) {
        statusMsg = `Last cloud save: ${formatDateWithTimezone(updatedAt)}`;
      } else if (!updatedAt) {
        statusMsg = 'Ready to save to cloud';
      }

      cloudSaveStatus.textContent = statusMsg;
      cloudSaveStatus.className = '';
      cloudSaveBtn.disabled = false;
      cloudSaveBtn.classList.remove('disabled');
      cloudLoadBtn.disabled = false;
      cloudLoadBtn.classList.remove('disabled');
    } catch (error) {
      userSession = null;
      let loginUrl = '/login';
      if (isLocal) {
        loginUrl = 'http://localhost:5173/login';
      }
      cloudSaveStatus.innerHTML =
        '<span class="login-status">Not logged in</span><div><a href="' +
        loginUrl +
        '" class="login-link" target="_blank">Log in</a></div>';
      cloudSaveStatus.className = 'not-logged-in';
      cloudSaveBtn.disabled = true;
      cloudSaveBtn.classList.add('disabled');
      cloudLoadBtn.disabled = true;
      cloudLoadBtn.classList.add('disabled');
    }
  }

  cloudSaveBtn.addEventListener('click', async () => {
    if (!userSession) return;
    cloudSaveBtn.disabled = true;
    cloudSaveStatus.textContent = 'Saving...';
    cloudSaveStatus.className = 'saving';
    try {
      await saveGameData(
        userSession.id,
        {
          data_json: crypt.encrypt(JSON.stringify({ hero, skillTree, prestige, shop, inventory, statistics })),
          game_name: gameName,
        },
        userSession.token
      );
      lastCloudSave = Date.now();
      cloudSaveStatus.textContent = `Last cloud save: ${new Date(lastCloudSave).toLocaleTimeString()}`;
    } catch (e) {
      cloudSaveStatus.textContent = 'Cloud save failed';
      cloudSaveStatus.className = 'failed';
    } finally {
      cloudSaveBtn.disabled = !userSession;
    }
  });

  cloudLoadBtn.addEventListener('click', async () => {
    if (!userSession) return;
    cloudLoadBtn.disabled = true;
    cloudLoadBtn.textContent = 'Loading...';
    try {
      const { data: cloudData } = await loadGameData(userSession.id, userSession.token);

      if (!cloudData) throw new Error('No cloud save found');
      // Extract info for confirmation
      const info = cloudData.hero || {};
      const msg = `Cloud Save Info:\n\nLevel: ${info.level || 1}\nGold: ${info.gold || 0}\nCrystals: ${
        info.crystals || 0
      }\nSouls: ${
        info.souls || 0
      }\n\nAre you sure you want to overwrite your local save with this cloud save? This cannot be undone.`;
      const confirmed = await showConfirmDialog(msg);
      if (confirmed) {
        localStorage.setItem('gameProgress', JSON.stringify({ ...cloudData, lastUpdated: Date.now() }));
        window.location.reload();
      }
    } catch (e) {
      alert('Failed to load from cloud: ' + (e.message || e));
    } finally {
      cloudLoadBtn.disabled = !userSession;
      cloudLoadBtn.textContent = 'Load from Cloud';
    }
  });

  // Check session on load and every 60m
  checkSession();
  setInterval(checkSession, 60000 * 60); // 60 minutes
})();
