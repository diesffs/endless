import { game, hero, statistics } from './globals.js';
import { updateResources, showConfirmDialog, showToast } from './ui/ui.js';
import { handleSavedData } from './functions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';

const html = String.raw;

const SOUL_UPGRADE_CONFIG = {
  // One-time purchase
  extraLife: {
    label: 'Extra Life',
    bonus: 'Gain 1 resurrection per run',
    baseCost: 100,
    oneTime: true,
  },
  // Multi-purchase, fixed cost
  bonusGold: {
    label: 'Bonus Gold',
    bonus: 0.05, // +5% gold per level
    baseCost: 50,
    multiple: true,
  },
  // Increasing cost
  damageBoost: {
    label: 'Damage Boost',
    bonus: 2, // +2 damage per level
    baseCost: 20,
    costIncrement: 10, // +10 souls per level
  },
};

export default class SoulShop {
  constructor(savedData = null) {
    this.soulUpgrades = {};
    handleSavedData(savedData, this);
  }

  async initializeSoulShopUI() {
    const soulShopTab = document.querySelector('#soul-shop');
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
  }

  createSoulUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    let alreadyPurchased = isOneTime && this.soulUpgrades[stat];
    const level = isOneTime || isMultiple ? '' : `(Lvl ${this.soulUpgrades[stat] || 0})`;
    const bonus =
      isOneTime || isMultiple ? config.bonus : `+${config.bonus * (this.soulUpgrades[stat] || 0)} ${config.label}`;
    const cost =
      isOneTime || isMultiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * (this.soulUpgrades[stat] || 0);
    return `
      <button class="crystal-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}">
        <span class="upgrade-name">${config.label} ${level}</span>
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
        this.buySoulUpgrade(stat);
      });
    });
  }

  async buySoulUpgrade(stat) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    const cost =
      config.oneTime || config.multiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * (this.soulUpgrades[stat] || 0);

    if (config.oneTime && this.soulUpgrades[stat]) {
      showToast('Already purchased!', 'info');
      return;
    }

    if (hero.souls >= cost) {
      if (config.oneTime) {
        this.soulUpgrades[stat] = true;
      } else {
        this.soulUpgrades[stat] = (this.soulUpgrades[stat] || 0) + 1;
      }

      // Apply upgrade effects
      if (stat === 'extraLife') {
        // Example: add resurrection chance
        hero.permaStats.resurrectionChance = (hero.permaStats.resurrectionChance || 0) + 5;
        updateStatsAndAttributesUI();
      } else if (stat === 'bonusGold') {
        // Example: add bonus gold percent
        hero.permaStats.bonusGold = (hero.permaStats.bonusGold || 0) + 5;
        updateStatsAndAttributesUI();
      } else if (stat === 'damageBoost') {
        hero.permaStats.damage = (hero.permaStats.damage || 0) + config.bonus;
        updateStatsAndAttributesUI();
      }

      hero.souls -= cost;
      updateResources();
      this.initializeSoulShopUI();
      game.saveGame();
    } else {
      showToast(`Need ${cost} souls for this upgrade`, 'error');
    }
  }
}
