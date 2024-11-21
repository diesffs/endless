import Stats from "./stats.js";
import { updateStatsAndAttributesUI } from "./ui.js";

export default class Hero {
  constructor() {
    this.stats = new Stats();
  }

  displayStats() {
    updateStatsAndAttributesUI(this.stats);
  }
}
