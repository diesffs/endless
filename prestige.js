import { game, hero, inventory, shop } from './main.js';
import {
  updateZoneUI,
  updateResources,
  updatePlayerHealth,
  updateStatsAndAttributesUI,
} from './ui.js';
import { saveGame } from './storage.js';
import Shop from './shop.js';
import { RARITY_ORDER } from './item.js';
import Enemy from './enemy.js';
import { showToast } from './toast.js';

const CRYSTAL_UPGRADE_CONFIG = {
  startingZone: {
    label: 'Starting Zone',
    bonus: 1,
    baseCost: 2,
  },
  startingGold: {
    label: 'Starting Gold',
    bonus: 1000,
    baseCost: 1,
  },
  continuousPlay: {
    label: 'Continuous Play',
    bonus: 'Auto-continue after death',
    baseCost: 50,
    oneTime: true, // Add this to mark as one-time purchase
  },
};

export default class Prestige {
  constructor() {}

  calculateSouls() {
    if (!game || typeof hero.highestZone !== 'number') {
      console.warn('Game or highestZone is not properly initialized.');
      return 0;
    }

    const souls = Math.floor(hero.highestZone / 5); // Example: 1 soul per 5 zones
    return souls;
  }

  performPrestige() {
    const earnedSouls = this.calculateSouls();

    // Store crystal-related values before reset
    const savedValues = {
      crystals: hero.crystals,
      startingZone: hero.startingZone,
      startingGold: hero.startingGold,
      crystalUpgrades: {
        startingZone: hero.crystalUpgrades.startingZone,
        startingGold: hero.crystalUpgrades.startingGold,
        continuousPlay: hero.crystalUpgrades.continuousPlay,
      },
    };

    const currentSouls = hero.souls;
    hero.setBaseStats(null);
    hero.souls += currentSouls + earnedSouls;

    // Reset skill tree
    skillTree.skillPoints = 0;
    skillTree.selectedPath = null;
    skillTree.unlockedSkills = {};
    skillTree.skillLevels = {};

    // Restore crystal-related values
    hero.crystals = savedValues.crystals;
    hero.startingZone = savedValues.startingZone;
    hero.startingGold = savedValues.startingGold;
    hero.crystalUpgrades.startingZone = savedValues.crystalUpgrades.startingZone;
    hero.crystalUpgrades.startingGold = savedValues.crystalUpgrades.startingGold;
    hero.crystalUpgrades.continuousPlay = savedValues.crystalUpgrades.continuousPlay;

    this.resetGame();
    hero.recalculateFromAttributes();
    updateStatsAndAttributesUI(); // Update stats and attributes UI
    updateResources(); // Update resources UI
    updatePlayerHealth(); // Update health bar dynamically
    game.resetAllHealth();

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = 'Start';
      startBtn.style.backgroundColor = '#059669';
    }

    saveGame();

    this.initializePrestigeUI(); // Ensure UI reflects reset state

    shop.updateShopUI('gold-upgrades');
    shop.updateShopUI('crystal-upgrades');
  }

  resetGame() {
    if (!game || typeof game.zone !== 'number') {
      console.error('Game is not properly initialized in resetGame:', game);
      return;
    }

    game.zone = hero.startingZone;
    hero.gold = hero.startingGold;
    game.gameStarted = false;
    game.currentEnemy = new Enemy(game.zone);
    updateZoneUI();

    // RARITY_ORDER.forEach((rarity) => inventory.salvageItemsByRarity(rarity));

    // Update UI and save game
    updateResources();
    updatePlayerHealth();
    saveGame();
    this.initializePrestigeUI(); // Ensure UI reflects reset state
  }

  async initializePrestigeUI() {
    try {
      const earnedSouls = this.calculateSouls();
      const prestigeTab = document.querySelector('#prestige');
      if (!prestigeTab) return;

      // Load template first
      const response = await fetch('prestige.html');
      if (!response.ok) throw new Error(`Failed to fetch template: ${response.statusText}`);

      const templateText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(templateText, 'text/html');

      // Update template values
      const damageDisplay = doc.querySelector('.damage-display .bonus');
      const soulsDisplay = doc.querySelector('.earned-souls-display .bonus');

      if (damageDisplay) {
        const damageBonus = Math.floor(hero.souls * 1);
        damageDisplay.textContent = `+${damageBonus}%`;
      }

      if (soulsDisplay) {
        soulsDisplay.textContent = `+${earnedSouls}`;
      }

      // Clear and append template
      prestigeTab.textContent = '';
      prestigeTab.appendChild(doc.body.firstChild);

      // Add crystal upgrades to the dedicated container
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
    } catch (error) {
      console.error('Error initializing Prestige UI:', error);
    }
  }

  createCrystalUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const alreadyPurchased = isOneTime && hero.crystalUpgrades[stat];
    const level = isOneTime ? '' : `(Lvl ${hero.crystalUpgrades[stat] || 0})`;
    const bonus = isOneTime
      ? config.bonus
      : `+${config.bonus * (hero.crystalUpgrades[stat] || 0)} ${config.label}`;

    const cost = isOneTime ? config.baseCost : config.baseCost * (hero.crystalUpgrades[stat] + 1);
    return `
      <button class="crystal-upgrade-btn ${
        alreadyPurchased ? 'purchased' : ''
      }" data-stat="${stat}">
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

  buyCrystalUpgrade(stat) {
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    const cost = config.oneTime
      ? config.baseCost
      : config.baseCost * (hero.crystalUpgrades[stat] + 1);

    if (config.oneTime && hero.crystalUpgrades[stat]) {
      showToast('Already purchased!', 'info');
      return;
    }

    if (hero.crystals >= cost) {
      hero.crystals -= cost;
      if (config.oneTime) {
        hero.crystalUpgrades[stat] = true;
      } else {
        hero.crystalUpgrades[stat] = (hero.crystalUpgrades[stat] || 0) + 1;
      }

      if (stat === 'startingZone') {
        hero.startingZone = 1 + hero.crystalUpgrades[stat];
      } else if (stat === 'startingGold') {
        hero.startingGold = hero.crystalUpgrades[stat] * 1000;
      }

      updateResources();
      this.initializePrestigeUI();
      saveGame();
    } else {
      showToast(`Need ${cost} crystals for this upgrade`, 'error');
    }
  }

  updateUI() {
    const damageDisplay = document.querySelector('.damage-display .bonus');
    const soulsDisplay = document.querySelector('.earned-souls-display .bonus');

    if (damageDisplay) {
      const damageBonus = Math.floor(hero.souls * 1);
      damageDisplay.textContent = `+${damageBonus}%`;
    }

    if (soulsDisplay) {
      soulsDisplay.textContent = `+${this.calculateSouls()}`;
    }

    const modalSoulsAmount = document.getElementById('modal-souls-amount');
    if (modalSoulsAmount) {
      modalSoulsAmount.textContent = `${this.calculateSouls()}`;
    }
  }

  setupPrestigeButton() {
    const prestigeButton = document.getElementById('prestige-btn');
    const modal = document.getElementById('prestige-modal');
    const confirmButton = document.getElementById('confirm-prestige');
    const cancelButton = document.getElementById('cancel-prestige');

    if (!prestigeButton || !modal || !confirmButton || !cancelButton) {
      console.error('Prestige modal or buttons are missing.');
      return;
    }

    // Open modal on Prestige button click
    prestigeButton.onclick = () => {
      const earnedSouls = this.calculateSouls(); // Recalculate to sync with UI
      const modalSoulsAmount = document.getElementById('modal-souls-amount');
      if (modalSoulsAmount) {
        modalSoulsAmount.textContent = `${earnedSouls}`;
      }
      modal.style.display = 'block'; // Show the modal
    };

    // Confirm Prestige action
    confirmButton.onclick = () => {
      modal.style.display = 'none';
      this.performPrestige(); // Perform the prestige logic
      this.initializePrestigeUI(); // Re-initialize UI to reflect reset
    };

    // Cancel Prestige action
    cancelButton.onclick = () => {
      modal.style.display = 'none';
    };

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  }
}
