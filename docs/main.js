import { state, saveStateToLocalStorage } from "./src/state.js";
import { createMonster, damageMonster } from "./src/monster.js";
import { updateUI } from "./src/ui.js";
import { initializeCharacters } from "./src/state.js"; // Import initializeCharacters

// Function to handle switching panels
window.openPanel = function (panelId) {
  console.log(`Opening panel: ${panelId}`); // Debug line
  // Hide all panels
  const panels = document.querySelectorAll(".panel");
  panels.forEach((panel) => {
    panel.classList.add("hidden");
    panel.classList.remove("visible");
  });

  // Show the selected panel
  const selectedPanel = document.getElementById(panelId);
  if (selectedPanel) {
    selectedPanel.classList.remove("hidden");
    selectedPanel.classList.add("visible");
  }
};

// Game loop function to manage monster health and update UI
function gameLoop() {
  if (!state.currentMonster) {
    state.currentMonster = createMonster(state.zone);
  }

  damageMonster(state.dps / 10);

  // Calculate the base gain based on the current zone level
  function calculateBaseGain(zone) {
    return (
      zone / 10 +
      Math.floor(zone / 100) * 5 +
      Math.floor(zone / 1000) * 0.0123456789 * zone
    );
  }

  state.gold += calculateBaseGain(state.zone);
  state.income = calculateBaseGain(state.zone) * 10; // Adjust income as needed

  updateUI();
  saveStateToLocalStorage(); // Save state each loop iteration
}

// Initialization function to set up the game
function init() {
  initializeCharacters();
  state.currentMonster = createMonster(state.zone);
  updateUI();

  setInterval(gameLoop, 100); // Start the game loop
}

init();

// Set a timer to reload the page every hour (3,600,000 milliseconds)
setTimeout(() => {
  location.reload();
}, 3600000); // 1 hour in milliseconds
