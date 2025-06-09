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
import { createModal } from './ui/modal.js';

const html = String.raw;

const CRYSTAL_UPGRADE_CONFIG = {
  startingStage: {
    label: 'Starting Stage',
    bonus: 1,
    baseCost: 2,
    costIncrement: 0,
    // Not oneTime or multiple:true, so treat as multi-level upgrade
  },
  continuousPlay: {
    label: 'Continuous Play',
    bonus: 'Auto-continue after death',
    baseCost: 20,
    oneTime: true,
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
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = 1;
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
    this.setupCrystalUpgradeHandlers();
    if (!this.modal) this.createUpgradeModal();
  }

  createCrystalUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    let alreadyPurchased = isOneTime && this.crystalUpgrades[stat];
    // For multiple:true, do not show level
    const level = isOneTime || isMultiple ? undefined : this.crystalUpgrades[stat] || 0;
    const bonus =
      isOneTime || isMultiple ? config.bonus : `+${config.bonus * (this.crystalUpgrades[stat] || 0)} ${config.label}`;
    const cost =
      isOneTime || isMultiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * (this.crystalUpgrades[stat] || 0);
    return `
      <button class="crystal-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}" ${
      alreadyPurchased ? 'disabled' : ''
    }>
        <span class="upgrade-name">${config.label} ${isOneTime ? '' : isMultiple ? '' : `(Lvl ${level})`}</span>
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
        this.openUpgradeModal(stat);
      });
    });
  }

  createUpgradeModal() {
    const content = html`
      <div class="training-modal-content">
        <button class="training-modal-close" aria-label="Close">&times;</button>
        <h2 class="modal-title"></h2>
        <div class="modal-fields"></div>
        <div class="modal-controls" style="display:none;"></div>
        <button class="modal-buy">Buy</button>
      </div>
    `;
    this.modal = createModal({
      id: 'prestige-modal',
      className: 'training-modal hidden',
      content,
      onClose: () => this.closeModal(),
    });
    this.modal.querySelector('.training-modal-close').onclick = () => this.closeModal();
    this.modal.querySelector('.modal-buy').onclick = () => this.buyBulk(this.currentStat, this.selectedQty);
  }

  openUpgradeModal(stat) {
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    if (!config) return;
    this.currentStat = stat;
    const m = this.modal;
    m.querySelector('.modal-title').textContent = config.label;
    const fields = m.querySelector('.modal-fields');
    const controls = m.querySelector('.modal-controls');
    const buyBtn = m.querySelector('.modal-buy');
    this.selectedQty = 1;
    // Multi-level (like training.js): startingStage only
    if (stat === 'startingStage') {
      // Show all fields and quantity controls
      fields.innerHTML = `
        <p>Current Level: <span class="modal-level"></span></p>
        <p>Current Bonus: <span class="modal-bonus"></span></p>
        <p>Next Level Bonus: <span class="modal-next-bonus"></span></p>
        <p>Total Bonus: <span class="modal-total-bonus"></span></p>
        <p>Total Cost: <span class="modal-total-cost"></span> Crystals (<span class="modal-qty">1</span>)</p>
      `;
      controls.style.display = '';
      controls.innerHTML = `
        <button data-qty="1">+1</button>
        <button data-qty="10">+10</button>
        <button data-qty="50">+50</button>
        <button data-qty="max">Max</button>
      `;
      controls.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          this.selectedQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          this.updateModalDetails();
        };
      });
      buyBtn.style.display = '';
      this.updateModalDetails();
    } else if (config.oneTime) {
      // One-time: description, cost, buy button, or Purchased
      controls.style.display = 'none';
      const purchased = !!this.crystalUpgrades[stat];
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Crystals</p>
        <div class="modal-status">${
          purchased ? '<span style="color:#10b981;font-weight:bold;">Purchased</span>' : ''
        }</div>
      `;
      buyBtn.style.display = purchased ? 'none' : '';
      buyBtn.disabled = purchased;
    } else if (config.multiple) {
      // Multiple: like oneTime, but always buyable, never 'Purchased'
      controls.style.display = 'none';
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Crystals</p>
      `;
      buyBtn.style.display = '';
      buyBtn.disabled = false;
    }
    m.classList.remove('hidden');
    if (stat === 'startingStage') this.updateModalDetails();
  }

  updateModalDetails() {
    if (!this.currentStat) return;
    const stat = this.currentStat;
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    const m = this.modal;
    const q = (sel) => m.querySelector(sel);
    if (stat === 'startingStage') {
      // Multi-level modal logic (like training.js)
      const baseLevel = this.crystalUpgrades[stat] || 0;
      const crystalsAvailable = hero.crystals;
      let qty = this.selectedQty === 'max' ? 0 : this.selectedQty;
      let totalCost = 0;
      if (this.selectedQty === 'max') {
        let lvl = baseLevel;
        let crystals = crystalsAvailable;
        while (true) {
          const cost = config.baseCost + (config.costIncrement || 0) * lvl;
          if (crystals < cost) break;
          crystals -= cost;
          totalCost += cost;
          lvl++;
          qty++;
        }
      } else {
        for (let i = 0; i < qty; i++) {
          const cost = config.baseCost + (config.costIncrement || 0) * (baseLevel + i);
          totalCost += cost;
        }
      }
      const bonusValue = (config.bonus || 0) * qty;
      const decimals = 0;
      if (q('.modal-qty')) q('.modal-qty').textContent = qty;
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = totalCost;
      if (q('.modal-total-bonus'))
        q('.modal-total-bonus').textContent = `+${bonusValue.toFixed(decimals)} ${config.label}`;
      if (q('.modal-level')) q('.modal-level').textContent = baseLevel;
      if (q('.modal-bonus')) q('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);
      if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);
      const buyBtn = q('.modal-buy');
      if (buyBtn) buyBtn.disabled = qty <= 0 || totalCost > crystalsAvailable;
    }
  }

  /**
   * Returns the bonus text for a given upgrade and level.
   * @param {string} stat
   * @param {object} config
   * @param {number} level
   * @returns {string}
   */
  getBonusText(stat, config, level) {
    if (config.oneTime) return '';
    const baseBonus = config.bonus || 0;
    const bonus = baseBonus * level;
    return `+${bonus} ${config.label}`;
  }

  /**
   * Closes the prestige modal dialog.
   */
  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  /**
   * Handles purchasing upgrades in bulk or single, depending on upgrade type.
   * @param {string} stat
   * @param {number|string} qty
   */
  async buyBulk(stat, qty) {
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    if (!config) return;
    if (stat === 'startingStage') {
      let count = 0;
      let totalCost = 0;
      if (qty === 'max') {
        let level = this.crystalUpgrades[stat] || 0;
        while (true) {
          const cost = config.baseCost + (config.costIncrement || 0) * level;
          if (hero.crystals < cost) break;
          hero.crystals -= cost;
          totalCost += cost;
          level++;
          count++;
        }
        this.crystalUpgrades[stat] = level;
      } else {
        for (let i = 0; i < qty; i++) {
          const cost = config.baseCost + (config.costIncrement || 0) * ((this.crystalUpgrades[stat] || 0) + i);
          if (hero.crystals < cost) break;
          hero.crystals -= cost;
          totalCost += cost;
          this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
          count++;
        }
      }
      game.saveGame();
      updateResources();
      this.updateModalDetails();
      this.initializePrestigeUI();
      // Do NOT close the modal for multi-level upgrades
      showToast(`Upgraded ${config.label} by ${count} levels!`, count > 0 ? 'success' : 'error');
      return;
    }
    if (config.oneTime) {
      if (this.crystalUpgrades[stat]) return;
      const cost = config.baseCost;
      if (hero.crystals < cost) {
        showToast('Not enough crystals!', 'error');
        return;
      }
      hero.crystals -= cost;
      this.crystalUpgrades[stat] = true;
      game.saveGame();
      updateResources();
      this.initializePrestigeUI();
      this.closeModal();
      showToast(`Purchased ${config.label}!`, 'success');
      return;
    }
    if (config.multiple) {
      const cost = config.baseCost;
      if (hero.crystals < cost) {
        showToast('Not enough crystals!', 'error');
        return;
      }
      hero.crystals -= cost;
      this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
      game.saveGame();
      updateResources();
      this.initializePrestigeUI();
      this.closeModal();
      showToast(`Purchased ${config.label}!`, 'success');
      return;
    }
  }
}
