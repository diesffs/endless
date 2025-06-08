import { game, hero, training, skillTree, statistics } from './globals.js';
import {
  updateStageUI,
  updateResources,
  updatePlayerLife,
  positionTooltip,
  showTooltip,
  hideTooltip,
  initializeSkillTreeUI,
  updateActionBar,
  updateSkillTreeValues,
  showConfirmDialog,
  showToast,
} from './ui/ui.js';
import Enemy from './enemy.js';
import { handleSavedData } from './functions.js';
import { updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';

const html = String.raw;

const CRYSTAL_UPGRADE_CONFIG = {
  startingStage: {
    label: 'Starting Stage',
    bonus: 1,
    baseCost: 2,
    costIncrement: 0, // specify cost increase per level
  },
  continuousPlay: {
    label: 'Continuous Play',
    bonus: 'Auto-continue after death',
    baseCost: 20,
    oneTime: true, // Add this to mark as one-time purchase
  },
  autoSpellCast: {
    label: 'Auto Spell Cast',
    bonus: 'Automatically casts instant and buff skills',
    baseCost: 40,
    oneTime: true,
  },
  resetSkillTree: {
    label: 'Reset Skill Tree',
    bonus: 'Refund all skill points and reset path',
    baseCost: 10,
    multiple: true,
  },
  resetAttributes: {
    label: 'Reset Attributes',
    bonus: 'Refund all allocated attribute points',
    baseCost: 10,
    multiple: true,
  },
};

export default class Prestige {
  constructor(savedData = null) {
    this.crystalUpgrades = {};

    handleSavedData(savedData, this);
  }

  performPrestige() {
    statistics.increment('prestigeCount', null, 1);

    // Store crystal-related values before reset
    const savedValues = {
      crystals: hero.crystals,
      startingStage: hero.startingStage,
      crystalUpgrades: {
        startingStage: this.crystalUpgrades.startingStage,
        continuousPlay: this.crystalUpgrades.continuousPlay,
      },
    };

    hero.setBaseStats(null);
    hero.souls = 0;

    // Reset skill tree
    skillTree.skillPoints = 0;
    skillTree.selectedPath = null;
    skillTree.skills = {};

    // reset training
    training.reset();

    // Restore crystal-related values
    hero.crystals = savedValues.crystals;
    hero.startingStage = savedValues.startingStage;
    this.crystalUpgrades.startingStage = savedValues.crystalUpgrades.startingStage;
    this.crystalUpgrades.continuousPlay = savedValues.crystalUpgrades.continuousPlay;

    // Reset skill tree
    skillTree.skillPoints = 0;
    skillTree.selectedPath = null;
    skillTree.skills = {};
    initializeSkillTreeUI(); // to show path selection

    this.resetGame();
    hero.recalculateFromAttributes();
    updateStatsAndAttributesUI(); // Update stats and attributes UI
    updateResources(); // Update resources UI
    updatePlayerLife(); // Update life bar dynamically
    updateRegionUI();
    game.resetAllLife();

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Fight';
      startBtn.style.backgroundColor = '#059669';
    }

    game.saveGame();

    this.initializePrestigeUI(); // Ensure UI reflects reset state

    training.updateTrainingUI('gold-upgrades');
    training.updateTrainingUI('crystal-upgrades');
    statistics.updateStatisticsUI();
  }

  resetGame() {
    if (!game || typeof game.stage !== 'number') {
      console.error('Game is not properly initialized in resetGame:', game);
      return;
    }

    game.stage = hero.startingStage;
    game.gameStarted = false;
    game.currentEnemy = new Enemy(game.stage);
    updateStageUI();

    // RARITY_ORDER.forEach((rarity) => inventory.salvageItemsByRarity(rarity));

    // Update UI and save game
    updateResources();
    updatePlayerLife();
    game.saveGame();
    this.initializePrestigeUI(); // Ensure UI reflects reset state
  }

  async initializePrestigeUI() {
    const prestigeTab = document.querySelector('#prestige');
    if (!prestigeTab) return;

    // Update crystal upgrades
    const upgradesContainer = prestigeTab.querySelector('.prestige-upgrades-container');
    if (upgradesContainer) {
      upgradesContainer.innerHTML = `
        <div class="crystal-upgrades-grid">
          ${Object.entries(CRYSTAL_UPGRADE_CONFIG)
            .map(([stat, config]) => this.createCrystalUpgradeButton(stat, config))
            .join('')}
        </div>
      `;
    }

    // Setup event listeners
    this.setupCrystalUpgradeHandlers();
  }

  createCrystalUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    let alreadyPurchased = isOneTime && this.crystalUpgrades[stat];
    const level = isOneTime || isMultiple ? '' : `(Lvl ${this.crystalUpgrades[stat] || 0})`;
    const bonus =
      isOneTime || isMultiple ? config.bonus : `+${config.bonus * (this.crystalUpgrades[stat] || 0)} ${config.label}`;

    const cost =
      isOneTime || isMultiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * this.crystalUpgrades[stat];
    return `
      <button class="crystal-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}">
        <span class="upgrade-name">${config.label} ${level}</span>
        <span class="upgrade-bonus">${bonus}</span>
        <span class="upgrade-cost">${alreadyPurchased ? 'Purchased' : `${cost} Crystals`}</span>
      </button>
    `;
  }

  setupCrystalUpgradeHandlers() {
    const buttons = document.querySelectorAll('.crystal-upgrade-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const stat = button.dataset.stat;
        this.buyCrystalUpgrade(stat);
      });
    });
  }

  async buyCrystalUpgrade(stat) {
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    const cost =
      config.oneTime || config.multiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * this.crystalUpgrades[stat];

    // prevent startingStage upgrade from exceeding 75% of highestStage
    if (stat === 'startingStage') {
      const nextLevel = (this.crystalUpgrades[stat] || 0) + 1;
      const cap = Math.floor(hero.highestStage * 0.75);
      const newStage = 1 + nextLevel;
      if (newStage > cap) {
        showToast(`Cannot increase starting stage above ${cap}`, 'error');
        return;
      }
    }

    if (config.oneTime && this.crystalUpgrades[stat]) {
      showToast('Already purchased!', 'info');
      return;
    }

    if (hero.crystals >= cost) {
      if (config.oneTime) {
        this.crystalUpgrades[stat] = true;
      } else {
        this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
      }

      if (stat === 'startingStage') {
        hero.setStartingStage(1 + this.crystalUpgrades[stat]);
      } else if (stat === 'resetSkillTree') {
        if (!skillTree.selectedPath) {
          showToast('No skill path selected to reset!', 'error');
          return;
        }

        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset your class and refund all skill points?<br>This will cost <strong>10 crystals</strong> and cannot be undone.'
        );
        if (confirmed) {
          skillTree.resetSkillTree();
          updateSkillTreeValues();
          updateActionBar();
          initializeSkillTreeUI();
          updateResources();
          showToast('Class has been reset and all points refunded.', 'success');
        }
      } else if (stat === 'resetAttributes') {
        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset all allocated attribute points?\nThis will cost <strong>10 crystals</strong> and cannot be undone.'
        );
        if (confirmed) {
          hero.resetAttributes();
          updateStatsAndAttributesUI();
          updateResources();
          showToast('All attribute points have been refunded.', 'success');
        }
      }

      // No extra logic needed for autoSpellCast or continuousPlay, just purchase

      hero.crystals -= cost;
      updateResources();
      this.initializePrestigeUI();
      game.saveGame();
    } else {
      showToast(`Need ${cost} crystals for this upgrade`, 'error');
    }
  }

  hasAutoSpellCastUpgrade() {
    return !!this.crystalUpgrades.autoSpellCast;
  }
}
