import Stats from "./stats.js";
import Inventory from "./inventory.js";
import { updateStatsAndAttributesUI } from "./ui.js";

export default class Hero {
  constructor(savedStats = null) {
    this.stats = savedStats
      ? new Stats(savedStats.level, savedStats.gold)
      : new Stats();
    if (savedStats) {
      Object.assign(this.stats, savedStats);
    }
    this.inventory = new Inventory(this, savedStats?.inventory); // Initialize inventory
  }

  displayStats() {
    updateStatsAndAttributesUI(this.stats);
  }
}
