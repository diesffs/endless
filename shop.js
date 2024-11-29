import { updateResources, updatePlayerHealth } from './ui.js';
import { saveGame } from './storage.js';
import {
  ARMOR_ON_UPGRADE,
  ATTACK_SPEED_ON_UPGRADE,
  CRIT_CHANCE_ON_UPGRADE,
  CRIT_DAMAGE_ON_UPGRADE,
  DAMAGE_ON_UPGRADE,
  HEALTH_ON_UPGRADE,
  BASE_UPGRADE_COSTS, // Import BASE_UPGRADE_COSTS
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
};

const CRYSTAL_UPGRADE_CONFIG = {
  // Define crystal upgrades here
  crystalDamage: { label: 'Crystal Damage', bonus: DAMAGE_ON_UPGRADE * 2 },
  crystalHealth: { label: 'Crystal Health', bonus: HEALTH_ON_UPGRADE * 2 },
  // Add more crystal upgrades as needed
};

export default class Shop {
  constructor() {
    this.initializeShopUI();
  }

  initializeShopUI() {
    const shopGrid = document.querySelector('.shop-grid');
    if (!shopGrid) return;

    this.updateShopUI('gold-upgrades');

    const shopSubTabs = document.querySelector('.shop-sub-tabs');
    shopSubTabs.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-sub-tab]');
      if (button) {
        this.switchSubTab(button.dataset.subTab);
      }
    });

    shopGrid.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-stat]');
      if (button) this.buyUpgrade(button.dataset.stat);
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

    const config = subTab === 'gold-upgrades' ? UPGRADE_CONFIG : CRYSTAL_UPGRADE_CONFIG;
    shopGrid.innerHTML = Object.entries(config)
      .map(([stat, config]) => this.createUpgradeButton(stat, config))
      .join('');
  }

  createUpgradeButton(stat, config) {
    return `
      <button data-stat="${stat}">
        <span class="upgrade-name">${config.label} (Lvl ${hero.upgradeLevels[stat] || 0})</span>
        <span class="upgrade-bonus">${this.getBonusText(
          stat,
          config,
          upgradeLevels[stat] || 0
        )}</span>
        <span class="upgrade-cost">${upgradeCosts[stat] || 0} ${
      stat.startsWith('crystal') ? 'Crystals' : 'Gold'
    }</span>
      </button>
    `;
  }

  buyUpgrade(stat) {
    const isCrystalUpgrade = stat.startsWith('crystal');
    const currency = isCrystalUpgrade ? 'crystals' : 'gold';
    const cost = hero.upgradeCosts[stat];

    if (hero[currency] < cost) {
      showToast(`Not enough ${currency}!`, 'error');
      return;
    }

    hero[currency] -= cost;
    hero.upgradeLevels[stat] = (hero.upgradeLevels[stat] || 0) + 1;
    hero.upgradeCosts[stat] += BASE_UPGRADE_COSTS[stat]; // Increase cost by base value

    this.updateShopUI(isCrystalUpgrade ? 'crystal-upgrades' : 'gold-upgrades');
    hero.displayStats();
    hero.recalculateFromAttributes();
    updateResources(hero, game);

    if (stat === 'health' || stat === 'crystalHealth') {
      hero.stats.currentHealth = hero.stats.maxHealth;
      updatePlayerHealth(hero.stats);
    }

    saveGame();
  }

  getBonusText(stat, config, level) {
    const value = config.bonus * level;
    const formattedValue = config.fixed ? value.toFixed(config.fixed) : value;
    return `+${formattedValue}${config.suffix || ''} ${config.label}`;
  }
}
