import { state, saveStateToLocalStorage } from "./src/state.js";
import { createMonster, damageMonster } from "./src/monster.js";
import { updateUI } from "./src/ui.js";
import { initializeCharacters } from "./src/state.js"; // Import initializeCharacters

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
  initializeCharacters(); // Initialize characters and load state
  state.currentMonster = createMonster(state.zone);
  updateUI();

  setInterval(gameLoop, 100);
}

init();
