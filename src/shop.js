import { formatStatName, updateResources, updateStatsAndAttributesUI } from './ui.js';

import { showToast } from './ui.js';
import { game, hero } from './globals.js';
import { handleSavedData } from './functions.js';
import { STATS } from './stats.js';
import { OFFENSE_STATS } from './stats/offenseStats.js';
import { DEFENSE_STATS } from './stats/defenseStats.js';
import { MISC_STATS } from './stats/miscStats.js';

const html = String.raw;

const SECTION_DEFS = [
  { key: 'offense', label: 'Offense', stats: Object.keys(OFFENSE_STATS) },
  { key: 'defense', label: 'Defense', stats: Object.keys(DEFENSE_STATS) },
  { key: 'misc', label: 'Misc', stats: Object.keys(MISC_STATS) },
];

export default class Shop {
  constructor(savedData = null) {
    this.upgradeLevels = {};
    this.shopBonuses = {};
    Object.entries(STATS).forEach(([stat, config]) => {
      if (config.shop && config.shop.available) {
        this.upgradeLevels[stat] = 0;
        this.shopBonuses[stat] = 0;
      }
    });

    handleSavedData(savedData, this);
    this.activeSection = SECTION_DEFS[0].key;
    this.initializeShopUI();
  }

  reset() {
    Object.keys(this.upgradeLevels).forEach((stat) => {
      this.upgradeLevels[stat] = 0;
    });
    Object.keys(this.shopBonuses).forEach((stat) => {
      this.shopBonuses[stat] = 0;
    });
  }

  initializeShopUI() {
    const shopGrid = document.querySelector('.shop-grid');
    if (!shopGrid) return;

    // Section navigation
    let nav = document.querySelector('.shop-section-nav');
    if (!nav) {
      nav = document.createElement('div');
      nav.className = 'shop-section-nav';
      nav.style.display = 'flex';
      nav.style.gap = '8px';
      nav.style.marginBottom = '12px';
      shopGrid.parentElement.insertBefore(nav, shopGrid);
    }
    nav.innerHTML = SECTION_DEFS.map(
      (sec) => `
      <button class="shop-section-btn${this.activeSection === sec.key ? ' active' : ''}" data-section="${sec.key}">${
        sec.label
      }</button>
    `
    ).join('');
    nav.querySelectorAll('button[data-section]').forEach((btn) => {
      btn.onclick = () => {
        this.activeSection = btn.dataset.section;
        this.updateShopUI('gold-upgrades');
        nav.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

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
    const section = SECTION_DEFS.find((s) => s.key === this.activeSection);
    shopGrid.innerHTML = Object.entries(STATS)
      .filter(([stat, config]) => config.shop && config.shop.available && section.stats.includes(stat))
      .map(([stat, config]) => this.createUpgradeButton(stat, config))
      .join('');
  }

  createUpgradeButton(stat, config) {
    const level = this.upgradeLevels[stat] || 0;
    const cost = this.getUpgradeCost(stat);
    const bonus = this.getBonusText(stat, config.shop, level);

    return html`
      <button data-stat="${stat}">
        <span class="upgrade-name">${formatStatName(stat)} (Lvl ${level})</span>
        <span class="upgrade-bonus"> ${bonus} </span>
        <span class="upgrade-cost">${cost} ${'Gold'}</span>
      </button>
    `;
  }
  getBonusText(stat, config, level) {
    const value = config.bonus * level;
    const decimals = STATS[stat].decimalPlaces || 0;
    const formattedValue = value.toFixed(decimals);
    return `+${formattedValue}${config.suffix || ''} ${formatStatName(stat)}`;
  }

  getUpgradeCost(stat) {
    const level = this.upgradeLevels[stat] || 0;
    const cost = STATS[stat].shop ? STATS[stat].shop.cost * (level + 1) : 0;
    return cost;
  }

  buyUpgrade(stat) {
    const currency = 'gold';
    const cost = this.getUpgradeCost(stat);

    // Check if player has enough currency
    if (hero[currency] < cost) {
      showToast(`Not enough ${currency}!`, 'error');
      return;
    }

    // Deduct cost and increase level
    hero[currency] -= cost;
    this.upgradeLevels[stat] = (this.upgradeLevels[stat] || 0) + 1;

    // Update UI
    this.updateShopUI('gold-upgrades');
    hero.recalculateFromAttributes();
    updateStatsAndAttributesUI();
    updateResources();
    game.saveGame();
  }

  updateShopBonuses() {
    // Reset equipment bonuses
    Object.keys(this.shopBonuses).forEach((stat) => {
      this.shopBonuses[stat] = 0;
    });

    // Only calculate bonuses for upgrades defined in UPGRADE_CONFIG
    Object.keys(STATS).forEach((upg) => {
      if (this.shopBonuses[upg] !== undefined && this.upgradeLevels[upg] !== undefined) {
        this.shopBonuses[upg] += this.upgradeLevels[upg] * STATS[upg].shop?.bonus;
      }
    });
  }
}
