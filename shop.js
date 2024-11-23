import { updateResources, updatePlayerHealth } from "./ui.js";
import { saveGame } from "./storage.js";
import { ARMOR_ON_UPGRADE, ATTACK_SPEED_ON_UPGRADE, CRIT_CHANCE_ON_UPGRADE, CRIT_DAMAGE_ON_UPGRADE, DAMAGE_ON_UPGRADE, HEALTH_ON_UPGRADE } from "./stats.js";
import { showToast } from "./toast.js";

const UPGRADE_CONFIG = {
  damage: { label: 'Damage', bonus: DAMAGE_ON_UPGRADE },
  attackSpeed: { label: 'Attack Speed', bonus: ATTACK_SPEED_ON_UPGRADE, fixed: 2 },
  health: { label: 'Health', bonus: HEALTH_ON_UPGRADE },
  armor: { label: 'Armor', bonus: ARMOR_ON_UPGRADE },
  critChance: { label: 'Crit Chance', bonus: CRIT_CHANCE_ON_UPGRADE, fixed: 2, suffix: '%' },
  critDamage: { label: 'Crit Damage', bonus: CRIT_DAMAGE_ON_UPGRADE, fixed: 2, suffix: '%' }
};

export default class Shop {
  constructor(hero, game) {
    this.hero = hero;
    this.game = game;
    this.initializeShopUI();
  }

  initializeShopUI () {
    const shopGrid = document.querySelector(".shop-grid");
    if (!shopGrid) return;

    shopGrid.innerHTML = Object.entries(UPGRADE_CONFIG).map(([stat, config]) => this.createUpgradeButton(stat)).join('');
    shopGrid.addEventListener("click", (e) => {
      const button = e.target.closest("button[data-stat]");
      if (button) this.buyUpgrade(button.dataset.stat);
    });
  }

  createUpgradeButton (stat) {
    const { upgradeCosts, upgradeLevels } = this.hero.stats;
    return `
      <button data-stat="${stat}">
        <span class="upgrade-name">${UPGRADE_CONFIG[stat].label} (Lvl ${upgradeLevels[stat]})</span>
        <span class="upgrade-bonus">${this.getBonusText(stat, upgradeLevels[stat])}</span>
        <span class="upgrade-cost">${upgradeCosts[stat]} Gold</span>
      </button>
    `;
  }

  buyUpgrade (stat) {
    if (!this.hero.stats.buyUpgrade(stat)) {
      showToast('Not enough gold!', 'error');
      return;
    }

    this.updateShopUI(stat);
    this.hero.displayStats();
    updateResources(this.hero.stats, this.game);

    if (stat === "health") {
      this.hero.stats.stats.currentHealth = this.hero.stats.stats.maxHealth;
      updatePlayerHealth(this.hero.stats.stats);
    }

    saveGame(this.game);
  }

  updateShopUI (stat) {
    const button = document.querySelector(`button[data-stat="${stat}"]`);
    if (button) button.innerHTML = this.createUpgradeButton(stat).match(/<button[^>]*>(.*?)<\/button>/s)[1];
  }

  getBonusText (stat, level) {
    const config = UPGRADE_CONFIG[stat];
    const value = config.bonus * level;
    const formattedValue = config.fixed ? value.toFixed(config.fixed) : value;
    return `+${formattedValue}${config.suffix || ''} ${config.label}`;
  }
}
