import { updateResources, updatePlayerHealth, updateStatsAndAttributesUI } from './ui.js';
import { saveGame } from './storage.js';
import {
  ARMOR_ON_UPGRADE,
  ATTACK_SPEED_ON_UPGRADE,
  CRIT_CHANCE_ON_UPGRADE,
  CRIT_DAMAGE_ON_UPGRADE,
  DAMAGE_ON_UPGRADE,
  HEALTH_ON_UPGRADE,
  MANA_ON_UPGRADE,
  BASE_UPGRADE_COSTS,
} from './hero.js';
import { showToast } from './toast.js';
import { game, hero } from './main.js';

const UPGRADE_CONFIG = {
  damage: { label: 'Damage', bonus: DAMAGE_ON_UPGRADE },
  attackSpeed: {
    label: 'Attack Speed',
    bonus: ATTACK_SPEED_ON_UPGRADE,
    fixed: 2,
  },
  health: { label: 'Health', bonus: HEALTH_ON_UPGRADE },
  armor: { label: 'Armor', bonus: ARMOR_ON_UPGRADE },
  critChance: {
    label: 'Crit Chance',
    bonus: CRIT_CHANCE_ON_UPGRADE,
    fixed: 2,
    suffix: '%',
  },
  critDamage: {
    label: 'Crit Damage',
    bonus: CRIT_DAMAGE_ON_UPGRADE,
    fixed: 2,
    suffix: '%',
  },
  mana: { label: 'Mana', bonus: MANA_ON_UPGRADE },
};

export default class Shop {
  constructor() {
    this.initializeShopUI();
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
    document
      .querySelectorAll('.sub-tab-panel')
      .forEach((panel) => panel.classList.remove('active'));

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
    const cost = hero.upgradeCosts[stat] || 0;
    const level = hero.upgradeLevels[stat] || 0;
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
    const cost = hero.upgradeCosts[stat];

    // Check if player has enough currency
    if (hero[currency] < cost) {
      showToast(`Not enough ${currency}!`, 'error');
      return;
    }

    // Deduct cost and increase level
    hero[currency] -= cost;
    hero.upgradeLevels[stat] = (hero.upgradeLevels[stat] || 0) + 1;
    hero.upgradeCosts[stat] += BASE_UPGRADE_COSTS[stat];

    // Update UI
    this.updateShopUI('gold-upgrades');
    hero.recalculateFromAttributes();
    updateStatsAndAttributesUI();
    updateResources();
    saveGame();
  }

  getBonusText(config, level) {
    const value = config.bonus * level;
    const formattedValue = config.fixed ? value.toFixed(config.fixed) : value;
    return `+${formattedValue}${config.suffix || ''} ${config.label}`;
  }
}
