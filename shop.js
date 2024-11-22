import { updateResources, updatePlayerHealth } from "./ui.js";

export default class Shop {
  constructor(hero) {
    this.hero = hero;
    this.initializeShopUI();
  }

  initializeShopUI () {
    const shopGrid = document.querySelector(".shop-grid");
    if (!shopGrid) return;

    const { upgradeCosts, upgradeLevels } = this.hero.stats;
    shopGrid.innerHTML = `
      <button data-stat="damage">
        <span class="upgrade-name">Damage (Lvl ${upgradeLevels.damage})</span>
        <span class="upgrade-cost">${upgradeCosts.damage} Gold</span>
      </button>
      <button data-stat="attackSpeed">
        <span class="upgrade-name">Attack Speed (Lvl ${upgradeLevels.attackSpeed})</span>
        <span class="upgrade-cost">${upgradeCosts.attackSpeed} Gold</span>
      </button>
      <button data-stat="health">
        <span class="upgrade-name">Health (Lvl ${upgradeLevels.health})</span>
        <span class="upgrade-cost">${upgradeCosts.health} Gold</span>
      </button>
      <button data-stat="armor">
        <span class="upgrade-name">Armor (Lvl ${upgradeLevels.armor})</span>
        <span class="upgrade-cost">${upgradeCosts.armor} Gold</span>
      </button>
      <button data-stat="critChance">
        <span class="upgrade-name">Crit Chance (Lvl ${upgradeLevels.critChance})</span>
        <span class="upgrade-cost">${upgradeCosts.critChance} Gold</span>
      </button>
      <button data-stat="critDamage">
        <span class="upgrade-name">Crit Damage (Lvl ${upgradeLevels.critDamage})</span>
        <span class="upgrade-cost">${upgradeCosts.critDamage} Gold</span>
      </button>
    `;
    shopGrid.addEventListener("click", (event) => {
      const button = event.target.closest('button[data-stat]');
      if (button) {
        const stat = button.dataset.stat;
        this.buyUpgrade(stat);
      }
    });
  }

  buyUpgrade (stat) {
    if (this.hero.stats.buyUpgrade(stat)) {
      this.updateShopUI(stat); // Refresh the shop UI
      this.hero.displayStats(); // Refresh player stats
      updateResources(this.hero.stats); // Refresh resources like gold
      updatePlayerHealth(this.hero.stats.stats); // Refresh health bar
    } else {
      alert("Not enough gold!");
    }
  }

  updateShopUI (stat) {
    const button = document.querySelector(`button[data-stat="${stat}"]`);
    if (button) {
      button.innerHTML = `
            <span class="upgrade-name">${this.capitalize(stat)} (Lvl ${this.hero.stats.upgradeLevels[stat]})</span>
            <span class="upgrade-cost">${this.hero.stats.upgradeCosts[stat]} Gold</span>
        `;
    }
  }

  capitalize (stat) {
    return stat.charAt(0).toUpperCase() + stat.slice(1);
  }
}
