import { updateResources, updatePlayerStatsUI } from "./ui.js";

export default class Shop {
  constructor(hero) {
    this.hero = hero;
    this.initializeShopUI();
  }

  initializeShopUI() {
    const shopGrid = document.querySelector(".shop-grid");
    if (!shopGrid) return;

    const { upgradeCosts } = this.hero.stats;
    shopGrid.innerHTML = `
      <button data-stat="damage">Upgrade Damage (${upgradeCosts.damage} Gold)</button>
      <button data-stat="attackSpeed">Upgrade Attack Speed (${upgradeCosts.attackSpeed} Gold)</button>
      <button data-stat="health">Upgrade Health (${upgradeCosts.health} Gold)</button>
      <button data-stat="armor">Upgrade Armor (${upgradeCosts.armor} Gold)</button>
      <button data-stat="critChance">Upgrade Crit Chance (${upgradeCosts.critChance} Gold)</button>
      <button data-stat="critDamage">Upgrade Crit Damage (${upgradeCosts.critDamage} Gold)</button>
    `;
    shopGrid.addEventListener("click", (event) => {
      const stat = event.target.dataset.stat;
      if (stat) this.buyUpgrade(stat);
    });
  }

  buyUpgrade(stat) {
    if (this.hero.stats.buyUpgrade(stat)) {
      this.updateShopUI(stat);
      this.hero.displayStats();
      updateResources(this.hero.stats);
      updatePlayerStatsUI(this.hero.stats);
    } else {
      alert("Not enough gold!");
    }
  }

  updateShopUI(stat) {
    const button = document.querySelector(`button[data-stat="${stat}"]`);
    if (button) {
      button.textContent = `Upgrade ${this.capitalize(stat)} (${
        this.hero.stats.upgradeCosts[stat]
      } Gold)`;
    }
  }

  capitalize(stat) {
    return stat.charAt(0).toUpperCase() + stat.slice(1);
  }
}
