import { state, saveStateToLocalStorage } from "./src/state.js";
import { createMonster, damageMonster } from "./src/monster.js";
import { calculateTotalDPS } from "./src/characters.js";
import { updateUI } from "./src/ui.js";

function gameLoop() {
  if (!state.currentMonster) {
    state.currentMonster = createMonster(state.zone);
  }

  damageMonster(state.dps / 10);
  state.gold += state.zone / 10;

  updateUI();
  saveStateToLocalStorage(); // Save state each loop iteration
}

function init() {
  state.currentMonster = createMonster(state.zone);
  calculateTotalDPS();
  updateUI();

  setInterval(gameLoop, 100);
}

init();
