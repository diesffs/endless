import Hero from './hero.js';
import Game from './game.js';
import Training from './training.js';
import {
  initializeSkillTreeUI,
  initializeUI,
  updateEnemyStats,
  updatePlayerLife,
  updateResources,
  updateStageUI,
  showConfirmDialog,
  updateTabIndicators,
} from './ui/ui.js';
import CrystalShop from './crystalShop.js';
import Inventory from './inventory.js';
import SkillTree from './skillTree.js';
import { createDebugUI, createModifyUI, crypt } from './functions.js';
import Statistics from './statistics.js';
import QuestTracker from './quest.js';
import { QUEST_DEFINITIONS } from './constants/quests.js';
import { apiFetch, loadGameData, saveGameData } from './api.js';
import {
  game,
  hero,
  inventory,
  training,
  skillTree,
  crystalShop,
  statistics,
  setGlobals,
  soulShop,
} from './globals.js';
import { initializeRegionSystem, updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ENEMY_LIST } from './constants/enemies.js';
import SoulShop from './soulShop.js';
import { initializeOptionsUI } from './options.js';

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
  const _crystalShop = new CrystalShop(savedData?.crystalShop);
  const _training = new Training(savedData?.training);
  const _statistics = new Statistics(savedData?.statistics);
  const _quests = new QuestTracker(QUEST_DEFINITIONS, savedData?.quests);
  const _soulShop = new SoulShop(savedData?.soulShop);

  setGlobals({
    game: _game,
    hero: _hero,
    inventory: _inventory,
    training: _training,
    skillTree: _skillTree,
    crystalShop: _crystalShop,
    statistics: _statistics,
    quests: _quests,
    soulShop: _soulShop,
  });

  game.stage = hero?.startingStage || 1;

  initializeUI();
  crystalShop.initializeCrystalShopUI();
  soulShop.initializeSoulShopUI();
  statistics.initializeStatisticsUI();
  initializeSkillTreeUI();

  updateResources();
  hero.recalculateFromAttributes();
  game.healPlayer(hero.stats.life);
  hero.stats.currentMana = hero.stats.mana;

  updatePlayerLife();
  updateStatsAndAttributesUI();
  updateStageUI();
  updateEnemyStats();
  updateTabIndicators();

  // Preload all enemy avatar images to warm browser cache
  preloadEnemyImages();

  window.addEventListener('DOMContentLoaded', () => {
    initializeRegionSystem();
    updateRegionUI();
    initializeOptionsUI();
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
    log('Dev mode is enabled.');
    document.body.classList.add('dev-active');
    createDebugUI();
    createModifyUI();
  } else {
    document.body.classList.remove('dev-active');
    const debugDiv = document.querySelector('.debug-ui');
    const modifyUI = document.querySelector('.modify-ui');
    if (debugDiv) {
      debugDiv.remove();
    }
    if (modifyUI) {
      modifyUI.remove();
    }
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
        document.body.classList.add('dev-active');
        createDebugUI();
        createModifyUI();
      } else {
        document.body.classList.remove('dev-active');
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
  const isLocal = import.meta.env.VITE_IS_LOCAL === 'true';
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
        };
        return date.toLocaleString(undefined, options);
      };
      if (cloudInfo && (cloudInfo.exp !== localHero.exp || cloudInfo.gold !== localHero.gold)) {
        statusMsg = `Last save: ${formatDateWithTimezone(updatedAt)}`;
      } else if (updatedAt) {
        statusMsg = `Last save: ${formatDateWithTimezone(updatedAt)}`;
      } else if (!updatedAt) {
        statusMsg = 'Ready to save';
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
          data_json: crypt.encrypt(JSON.stringify({ hero, skillTree, crystalShop, training, inventory, statistics })),
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

  // Preload function for enemy images
  function preloadEnemyImages() {
    const baseUrl = import.meta.env.BASE_URL || '';
    const urls = Array.from(new Set(ENEMY_LIST.map((e) => baseUrl + e.image)));
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }
})();
