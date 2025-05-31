import { game, hero, training, skillTree, statistics } from './globals.js';
import {
  updateStageUI,
  updateResources,
  updatePlayerLife,
  updateStatsAndAttributesUI,
  positionTooltip,
  showTooltip,
  hideTooltip,
  initializeSkillTreeUI,
  updateActionBar,
  updateSkillTreeValues,
  showConfirmDialog,
} from './ui.js';
import Enemy from './enemy.js';
import { showToast } from './ui.js';
import { handleSavedData } from './functions.js';
import { updateRegionUI } from './region.js';

const html = String.raw;

const CRYSTAL_UPGRADE_CONFIG = {
  startingStage: {
    label: 'Starting Stage',
    bonus: 1,
    baseCost: 2,
  },
  // startingGold: {
  //   label: 'Starting Gold',
  //   bonus: 1000,
  //   baseCost: 1,
  // },
  continuousPlay: {
    label: 'Continuous Play',
    bonus: 'Auto-continue after death',
    baseCost: 50,
    oneTime: true, // Add this to mark as one-time purchase
  },
  autoSpellCast: {
    label: 'Auto Spell Cast',
    bonus: 'Automatically casts instant and buff skills',
    baseCost: 100,
    oneTime: true,
  },
  resetSkillTree: {
    label: 'Reset Skill Tree',
    bonus: 'Refund all skill points and reset path',
    baseCost: 10,
    multiple: true,
  },
};

export default class Prestige {
  constructor(savedData = null) {
    this.crystalUpgrades = {
      startingStage: 0,
      startingGold: 0,
      continuousPlay: false,
    };

    handleSavedData(savedData, this);
  }

  calculateSouls() {
    const souls = Math.floor(hero.highestStage / 5); // Example: 1 soul per 5 stages
    return souls;
  }

  performPrestige() {
    statistics.increment('prestigeCount', null, 1);

    const earnedSouls = this.calculateSouls();

    // Store crystal-related values before reset
    const savedValues = {
      crystals: hero.crystals,
      startingStage: hero.startingStage,
      startingGold: hero.startingGold,
      crystalUpgrades: {
        startingStage: this.crystalUpgrades.startingStage,
        startingGold: this.crystalUpgrades.startingGold,
        continuousPlay: this.crystalUpgrades.continuousPlay,
      },
    };

    const currentSouls = hero.souls;
    hero.setBaseStats(null);
    hero.souls += currentSouls + earnedSouls;

    // Reset skill tree
    skillTree.skillPoints = 0;
    skillTree.selectedPath = null;
    skillTree.skills = {};

    // reset training
    training.reset();

    // Restore crystal-related values
    hero.crystals = savedValues.crystals;
    hero.startingStage = savedValues.startingStage;
    hero.startingGold = savedValues.startingGold;
    this.crystalUpgrades.startingStage = savedValues.crystalUpgrades.startingStage;
    this.crystalUpgrades.startingGold = savedValues.crystalUpgrades.startingGold;
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
      startBtn.textContent = 'Start';
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
    hero.gold = hero.startingGold;
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
    const earnedSouls = this.calculateSouls();
    const prestigeTab = document.querySelector('#prestige');
    if (!prestigeTab) return;

    // Update existing DOM values
    const damageDisplay = prestigeTab.querySelector('.damage-display .bonus');

    if (damageDisplay) {
      const damageBonus = Math.floor(hero.souls * 1);
      damageDisplay.textContent = `+${damageBonus}%`;
    }

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
    this.setupPrestigeButton();
    this.setupCrystalUpgradeHandlers();
  }

  createCrystalUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    let alreadyPurchased = isOneTime && this.crystalUpgrades[stat];
    const level = isOneTime || isMultiple ? '' : `(Lvl ${this.crystalUpgrades[stat] || 0})`;
    const bonus =
      isOneTime || isMultiple ? config.bonus : `+${config.bonus * (this.crystalUpgrades[stat] || 0)} ${config.label}`;

    const cost = isOneTime || isMultiple ? config.baseCost : config.baseCost * (this.crystalUpgrades[stat] + 1);
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
      config.oneTime || config.multiple ? config.baseCost : config.baseCost * (this.crystalUpgrades[stat] + 1);

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
        hero.startingStage = 1 + this.crystalUpgrades[stat];
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
  updateUI() {
    const damageDisplay = document.querySelector('.damage-display');
    const soulsDisplay = document.querySelector('.earned-souls-display .bonus');

    if (damageDisplay) {
      const damageBonus = Math.floor(hero.souls * 1);
      const bonusText = damageDisplay.querySelector('.bonus');
      if (bonusText) {
        bonusText.textContent = `+${damageBonus}%`;
      }

      // Add tooltip for damageDisplay
      damageDisplay.addEventListener('mouseenter', (e) => {
        const tooltipContent = this.createDamageTooltip(damageBonus);
        showTooltip(tooltipContent, e);
      });
      damageDisplay.addEventListener('mousemove', positionTooltip);
      damageDisplay.addEventListener('mouseleave', hideTooltip);
    }

    if (soulsDisplay) {
      soulsDisplay.textContent = `+${this.calculateSouls()} souls`;
    }

    const modalSoulsAmount = document.getElementById('modal-souls-amount');
    if (modalSoulsAmount) {
      modalSoulsAmount.textContent = `${this.calculateSouls()}`;
    }
  }

  // to create the tooltip content
  createDamageTooltip(damageBonus) {
    return html`
      <div class="tooltip-header">Damage Bonus</div>
      <div class="tooltip-content">Each soul provides 1% total bonus damage.</div>
    `;
  }

  setupPrestigeButton() {
    const prestigeButton = document.getElementById('prestige-btn');
    const modal = document.getElementById('prestige-modal');
    const confirmButton = document.getElementById('confirm-prestige');
    const cancelButton = document.getElementById('cancel-prestige');

    if (!prestigeButton || !modal || !confirmButton || !cancelButton) {
      return;
    }

    // Open modal on Prestige button click with level check
    prestigeButton.onclick = () => {
      if (hero.level < 50) {
        showToast('Level 50 required to prestige!', 'error');
        return;
      }

      const earnedSouls = this.calculateSouls();
      const modalSoulsAmount = document.getElementById('modal-souls-amount');
      if (modalSoulsAmount) {
        modalSoulsAmount.textContent = `${earnedSouls}`;
      }
      modal.classList.remove('hidden');
    };

    // Confirm Prestige action
    confirmButton.onclick = () => {
      closeModal('prestige-modal');
      this.performPrestige(); // Perform the prestige logic
      this.initializePrestigeUI(); // Re-initialize UI to reflect reset
    };

    // Cancel Prestige action
    cancelButton.onclick = () => {
      closeModal('prestige-modal');
    };

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) closeModal('prestige-modal');
    };
  }

  hasAutoSpellCastUpgrade() {
    return !!this.crystalUpgrades.autoSpellCast;
  }
}
