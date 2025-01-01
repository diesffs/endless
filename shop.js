import { updateResources, updateStatsAndAttributesUI } from './ui.js';

import { showToast } from './ui.js';
import { game, hero } from './main.js';
import { handleSavedData } from './functions.js';

const UPGRADE_CONFIG = {
  // Existing stats
  damage: { label: 'Damage', bonus: 1 },
  attackSpeed: { label: 'Attack Speed', bonus: 0.01, fixed: 2 },
  health: { label: 'Health', bonus: 10 },
  armor: { label: 'Armor', bonus: 1 },
  critChance: { label: 'Crit Chance', bonus: 0.1, fixed: 2, suffix: '%' },
  critDamage: { label: 'Crit Damage', bonus: 0.01, fixed: 2, suffix: '%' },
  mana: { label: 'Mana', bonus: 5 },
  lifeRegen: { label: 'Health Regen', bonus: 0.1, fixed: 1 },
  manaRegen: { label: 'Mana Regen', bonus: 0.1, fixed: 1 },

  // New stats to add
  blockChance: { label: 'Block Chance', bonus: 0.1, fixed: 2, suffix: '%' },
  attackRating: { label: 'Attack Rating', bonus: 10 },
  lifeSteal: { label: 'Life Steal', bonus: 0.01, fixed: 2, suffix: '%' },
  fireDamage: { label: 'Fire Damage', bonus: 1 },
  coldDamage: { label: 'Cold Damage', bonus: 1 },
  airDamage: { label: 'Air Damage', bonus: 1 },
  earthDamage: { label: 'Earth Damage', bonus: 1 },
};

export const BASE_UPGRADE_COSTS = {
  damage: 50,
  attackSpeed: 200,
  health: 75,
  armor: 125,
  critChance: 150,
  critDamage: 200,
  mana: 100,
  lifeRegen: 50,
  manaRegen: 50,
  blockChance: 150,
  attackRating: 50,
  lifeSteal: 500,
  fireDamage: 75,
  coldDamage: 75,
  airDamage: 75,
  earthDamage: 75,
};
export default class Shop {
  constructor(savedData = null) {
    this.upgradeCosts = { ...BASE_UPGRADE_COSTS };
    this.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
      mana: 0,
      lifeRegen: 0,
      manaRegen: 0,

      blockChance: 0,
      attackRating: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      airDamage: 0,
      earthDamage: 0,
    };

    this.shopBonuses = {
      ...this.upgradeLevels,
    };

    handleSavedData(savedData, this);

    this.initializeShopUI();
  }

  reset() {
    this.upgradeCosts = { ...BASE_UPGRADE_COSTS };
    this.upgradeLevels = {
      damage: 0,
      attackSpeed: 0,
      health: 0,
      armor: 0,
      critChance: 0,
      critDamage: 0,
      mana: 0,
      lifeRegen: 0,
      manaRegen: 0,

      blockChance: 0,
      attackRating: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      airDamage: 0,
      earthDamage: 0,
    };

    this.shopBonuses = {
      ...this.upgradeLevels,
    };
  }

  initializeShopUI() {
    const shopGrid = document.querySelector('.shop-grid');
    if (!shopGrid) return;

    const goldGrid = document.querySelector('#gold-upgrades .shop-grid');
    if (goldGrid) this.attachGridListeners(goldGrid);
    this.updateShopUI('gold-upgrades');
  }

  attachGridListeners(grid) {
    grid.addEventListener('mousedown', (e) => {
      const button = e.target.closest('button[data-stat]');
      if (button) {
        const stat = button.dataset.stat;
        this.buyUpgrade(stat);

        let intervalId;
        let holdingTimeout;

        const startHolding = () => {
          // Clear any existing interval to prevent multiple timers
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            this.buyUpgrade(stat);
          }, 100); // Adjust the interval as needed
        };

        const stopHolding = () => {
          // Clear both the interval and the timeout
          clearTimeout(holdingTimeout);
          clearInterval(intervalId);
          document.removeEventListener('mouseup', stopHolding);
          document.removeEventListener('mouseleave', stopHolding);
        };

        // Set up the timeout for holding
        holdingTimeout = setTimeout(startHolding, 500); // Start holding after 500ms

        // Add event listeners to stop holding
        document.addEventListener('mouseup', stopHolding);
        document.addEventListener('mouseleave', stopHolding);
      }
    });
  }

  switchSubTab(subTab) {
    document.querySelectorAll('.sub-tab-btn').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.sub-tab-panel').forEach((panel) => panel.classList.remove('active'));

    document.querySelector(`button[data-sub-tab="${subTab}"]`).classList.add('active');
    document.getElementById(subTab).classList.add('active');

    this.updateShopUI(subTab);
  }

  updateShopUI(subTab) {
    const shopGrid = document.querySelector(`#${subTab} .shop-grid`);
    if (!shopGrid) return;

    shopGrid.innerHTML = Object.entries(UPGRADE_CONFIG)
      .map(([stat, config]) => this.createUpgradeButton(stat, config))
      .join('');
  }

  createUpgradeButton(stat, config) {
    const cost = this.upgradeCosts[stat] || 0;
    const level = this.upgradeLevels[stat] || 0;
    const bonus = this.getBonusText(config, level);

    return `
      <button data-stat="${stat}">
        <span class="upgrade-name">${config.label} (Lvl ${level})</span>
        <span class="upgrade-bonus"> ${bonus}
        </span>
        <span class="upgrade-cost">${cost} ${'Gold'}</span>
      </button>
    `;
  }

  buyUpgrade(stat) {
    const currency = 'gold';
    const cost = this.upgradeCosts[stat];

    // Check if player has enough currency
    if (hero[currency] < cost) {
      showToast(`Not enough ${currency}!`, 'error');
      return;
    }

    // Deduct cost and increase level
    hero[currency] -= cost;
    this.upgradeLevels[stat] = (this.upgradeLevels[stat] || 0) + 1;
    this.upgradeCosts[stat] += BASE_UPGRADE_COSTS[stat];

    // Update UI
    this.updateShopUI('gold-upgrades');
    hero.recalculateFromAttributes();
    updateStatsAndAttributesUI();
    updateResources();
    game.saveGame();
  }

  getBonusText(config, level) {
    const value = config.bonus * level;
    const formattedValue = config.fixed ? value.toFixed(config.fixed) : value;
    return `+${formattedValue}${config.suffix || ''} ${config.label}`;
  }

  updateShopBonuses() {
    // Reset equipment bonuses
    Object.keys(this.shopBonuses).forEach((stat) => {
      this.shopBonuses[stat] = 0;
    });

    // Calculate bonuses from all equipped items
    Object.keys(this.upgradeLevels).forEach((upg) => {
      if (this.shopBonuses[upg] !== undefined) {
        this.shopBonuses[upg] += this.upgradeLevels[upg] * UPGRADE_CONFIG[upg].bonus;
      }
    });
  }
}
