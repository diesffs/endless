import {
  initializeSkillTreeUI,
  initializeUI,
  updateEnemyStats,
  updatePlayerLife,
  updateResources,
  updateStageUI,
  updateTabIndicators,
} from './ui/ui.js';
import { initDebugging } from './functions.js';
import { game, hero, crystalShop, statistics, setGlobals, soulShop, options, dataManager } from './globals.js';
import { initializeRegionSystem, updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;
window.log = console.log;

// Wrap initialization in an async IIFE to avoid top-level await error
(async () => {
  await setGlobals();

  game.stage = game.getStartingStage() || 1;

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

  initializeRegionSystem();
  updateRegionUI();

  initDebugging();

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
    dataManager.saveGame();
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
})();
