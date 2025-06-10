import { game, hero } from './globals.js';
import { updateResources, showToast } from './ui/ui.js';
import { handleSavedData } from './functions.js';
import { createModal } from './ui/modal.js';

const html = String.raw;

export const SOUL_UPGRADE_CONFIG = {
  // One-time purchase
  extraLife: {
    label: 'Extra Life',
    bonus: 'Gain 1 resurrection per run',
    baseCost: 1000,
    oneTime: true,
  },
  bonusGold: {
    label: 'Bonus Gold',
    bonus: 0.05,
    baseCost: 3,
    costIncrement: 0,
    stat: 'bonusGold',
  },
  bonusExperience: {
    label: 'Bonus Experience',
    bonus: 0.05,
    baseCost: 3,
    costIncrement: 0,
    stat: 'bonusExperience',
  },
  damageBoost: {
    label: 'Damage Boost',
    bonus: 0.03,
    baseCost: 5,
    costIncrement: 0,
    stat: 'damagePercent',
  },
  lifeBoost: {
    label: 'Life Boost',
    bonus: 0.03,
    baseCost: 5,
    costIncrement: 0,
    stat: 'lifePercent',
  },
  manaBoost: {
    label: 'Mana Boost',
    bonus: 0.03,
    baseCost: 10,
    costIncrement: 0,
    stat: 'manaPercent',
  },
  /**
   * Extra Material Drop Chance
   * Each level increases the chance to gain an additional material drop.
   */
  extraMaterialDropPercent: {
    label: 'Extra Material Drop Chance',
    bonus: 0.01, // 1% per level
    baseCost: 10,
    costIncrement: 1,
    stat: 'extraMaterialDropPercent',
    suffix: '%',
  },
};

export default class SoulShop {
  constructor(savedData = null) {
    this.soulUpgrades = {};
    handleSavedData(savedData, this);
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = 1;
  }

  async initializeSoulShopUI() {
    const soulShopTab = document.querySelector('#soulshop');
    if (!soulShopTab) return;
    const upgradesContainer = soulShopTab.querySelector('.soul-shop-upgrades-container');
    if (upgradesContainer) {
      upgradesContainer.innerHTML = `
        <div class="crystal-upgrades-grid">
          ${Object.entries(SOUL_UPGRADE_CONFIG)
            .map(([stat, config]) => this.createSoulUpgradeButton(stat, config))
            .join('')}
        </div>
      `;
    }
    this.setupSoulUpgradeHandlers();
    if (!this.modal) this.createUpgradeModal();
  }

  resetSoulShop() {
    this.soulUpgrades = {};
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = 1;
  }

  createSoulUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    let alreadyPurchased = isOneTime && this.soulUpgrades[stat];
    // For multiple:true, do not show level
    const level = isOneTime || isMultiple ? undefined : this.soulUpgrades[stat] || 0;
    let bonus;
    if (isOneTime || isMultiple) {
      bonus = config.bonus;
    } else if (isMultiLevel) {
      const value = Math.floor(config.bonus * (this.soulUpgrades[stat] || 0) * 100);
      bonus = `+${value}${config.suffix || '%'} ${config.label}`;
    } else {
      bonus = `+${config.bonus * (this.soulUpgrades[stat] || 0)} ${config.label}`;
    }
    const cost =
      isOneTime || isMultiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * (this.soulUpgrades[stat] || 0);
    return `
      <button class="crystal-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}" ${
      alreadyPurchased ? 'disabled' : ''
    }>
        <span class="upgrade-name">${config.label} ${isOneTime ? '' : isMultiple ? '' : `(Lvl ${level})`}</span>
        <span class="upgrade-bonus">${bonus}</span>
        <span class="upgrade-cost">${alreadyPurchased ? 'Purchased' : `${cost} Souls`}</span>
      </button>
    `;
  }

  setupSoulUpgradeHandlers() {
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
      id: 'soulshop-modal',
      className: 'training-modal hidden',
      content,
      onClose: () => this.closeModal(),
    });
    this.modal.querySelector('.training-modal-close').onclick = () => this.closeModal();
    this.modal.querySelector('.modal-buy').onclick = () => this.buyBulk(this.currentStat, this.selectedQty);
  }

  openUpgradeModal(stat) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return;
    this.currentStat = stat;
    const m = this.modal;
    m.querySelector('.modal-title').textContent = config.label;
    const fields = m.querySelector('.modal-fields');
    const controls = m.querySelector('.modal-controls');
    const buyBtn = m.querySelector('.modal-buy');
    this.selectedQty = 1;
    // Multi-level (increasing cost): any with numeric bonus and not oneTime
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      fields.innerHTML = `
        <p>Current Level: <span class="modal-level"></span></p>
        <p>Current Bonus: <span class="modal-bonus"></span></p>
        <p>Next Level Bonus: <span class="modal-next-bonus"></span></p>
        <p>Total Bonus: <span class="modal-total-bonus"></span></p>
        <p>Total Cost: <span class="modal-total-cost"></span> Souls (<span class="modal-qty">1</span>)</p>
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
      controls.style.display = 'none';
      const purchased = !!this.soulUpgrades[stat];
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Souls</p>
        <div class="modal-status">${
          purchased ? '<span style="color:#10b981;font-weight:bold;">Purchased</span>' : ''
        }</div>
      `;
      buyBtn.style.display = purchased ? 'none' : '';
      buyBtn.disabled = purchased;
    } else if (config.multiple) {
      controls.style.display = 'none';
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Souls</p>
      `;
      buyBtn.style.display = '';
      buyBtn.disabled = false;
    }
    m.classList.remove('hidden');
    if (isMultiLevel) this.updateModalDetails();
  }

  updateModalDetails() {
    if (!this.currentStat) return;
    const stat = this.currentStat;
    const config = SOUL_UPGRADE_CONFIG[stat];
    const m = this.modal;
    const q = (sel) => m.querySelector(sel);
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      const baseLevel = this.soulUpgrades[stat] || 0;
      const soulsAvailable = hero.souls;
      let qty = this.selectedQty === 'max' ? 0 : this.selectedQty;
      let totalCost = 0;
      if (this.selectedQty === 'max') {
        let lvl = baseLevel;
        let souls = soulsAvailable;
        while (true) {
          const cost = config.baseCost + (config.costIncrement || 0) * lvl;
          if (souls < cost) break;
          souls -= cost;
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
      if (buyBtn) buyBtn.disabled = qty <= 0 || totalCost > soulsAvailable;
    }
  }

  getBonusText(stat, config, level) {
    if (typeof config.bonus === 'string') return config.bonus;
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      const value = Math.floor(config.bonus * level * 100);
      return `+${value}${config.suffix || '%'} ${config.label}`;
    }
    const value = config.bonus * level;
    return `+${value}${config.suffix || ''} ${config.label}`;
  }

  async buyBulk(stat, qty) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return;
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      let count = 0;
      let totalCost = 0;
      if (qty === 'max') {
        let level = this.soulUpgrades[stat] || 0;
        while (true) {
          const cost = config.baseCost + (config.costIncrement || 0) * level;
          if (hero.souls < cost) break;
          hero.souls -= cost;
          totalCost += cost;
          level++;
          count++;
        }
        this.soulUpgrades[stat] = level;
      } else {
        for (let i = 0; i < qty; i++) {
          const cost = config.baseCost + (config.costIncrement || 0) * ((this.soulUpgrades[stat] || 0) + i);
          if (hero.souls < cost) break;
          hero.souls -= cost;
          totalCost += cost;
          this.soulUpgrades[stat] = (this.soulUpgrades[stat] || 0) + 1;
          count++;
        }
      }
      game.saveGame();
      updateResources();
      this.updateModalDetails();
      this.initializeSoulShopUI();
      // Do NOT close the modal for multi-level upgrades
      showToast(`Upgraded ${config.label} by ${count} levels!`, count > 0 ? 'success' : 'error');
      return;
    }
    if (config.oneTime) {
      if (this.soulUpgrades[stat]) return;
      const cost = config.baseCost;
      if (hero.souls < cost) {
        showToast('Not enough souls!', 'error');
        return;
      }
      hero.souls -= cost;
      this.soulUpgrades[stat] = true;
    }
    if (config.multiple) {
      const cost = config.baseCost;
      if (hero.souls < cost) {
        showToast('Not enough souls!', 'error');
        return;
      }
      hero.souls -= cost;
      this.soulUpgrades[stat] = (this.soulUpgrades[stat] || 0) + 1;
    }
    game.saveGame();
    updateResources();
    this.initializeSoulShopUI();
    this.closeModal();
    showToast(`Purchased ${config.label}!`, 'success');
  }

  /**
   * Closes the soul shop modal dialog.
   */
  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }
}
