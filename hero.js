import Stats from "./stats.js";
import { updatePlayerStatsUI } from "./ui.js";

export default class Hero {
  constructor() {
    this.stats = new Stats();
  }

  displayStats() {
    updatePlayerStatsUI(this.stats);
  }
}
