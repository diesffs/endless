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
  updateTabIndicators,
} from './ui/ui.js';
import CrystalShop from './crystalShop.js';
import Inventory from './inventory.js';
import SkillTree from './skillTree.js';
import { initDebugging } from './functions.js';
import Statistics from './statistics.js';
import QuestTracker from './quest.js';
import { game, hero, crystalShop, statistics, setGlobals, soulShop, options } from './globals.js';
import { initializeRegionSystem, updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ENEMY_LIST } from './constants/enemies.js';
import SoulShop from './soulShop.js';
import { Options } from './options.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;
window.log = console.log;

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
  const _quests = new QuestTracker(savedData?.quests);
  const _soulShop = new SoulShop(savedData?.soulShop);
  const _options = new Options(savedData?.options);

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
    options: _options,
  });

  game.stage = hero.getStartingStage() || 1;

  initializeUI();
  crystalShop.initializeCrystalShopUI();
  soulShop.initializeSoulShopUI();
  statistics.initializeStatisticsUI();
  options.initializeOptionsUI();
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

  initializeRegionSystem();
  updateRegionUI();
  window.addEventListener('DOMContentLoaded', () => {});

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

  // Sidebar toggle logic for responsive sidebar
  (function () {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    function openSidebar() {
      sidebar.classList.add('sidebar-visible');
      backdrop.classList.add('sidebar-backdrop-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('sidebar-visible');
      backdrop.classList.remove('sidebar-backdrop-visible');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // Optional: close sidebar on resize if > 1100px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100) {
        closeSidebar();
      }
    });
  })();

  initDebugging();

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
