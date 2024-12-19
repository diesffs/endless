import Hero from './hero.js';
import Game from './game.js';
import Shop from './shop.js';
import {
  initializeSkillTreeUI,
  initializeUI,
  updateEnemyHealth,
  updatePlayerHealth,
  updateResources,
  updateStatsAndAttributesUI,
  updateZoneUI,
} from './ui.js';
import Prestige from './prestige.js';
import Inventory from './inventory.js';
import SkillTree from './skillTree.js';

window.log = console.log;

export const game = new Game();
const savedData = game.loadGame();
export const hero = new Hero(savedData?.hero);
export const inventory = new Inventory(savedData?.inventory);
export const skillTree = new SkillTree(savedData?.skillTree);
export const prestige = new Prestige();
export const shop = new Shop();

game.zone = hero?.startingZone || 1;

initializeUI();
prestige.initializePrestigeUI();
initializeSkillTreeUI();

updateResources();
hero.recalculateFromAttributes();
hero.stats.currentHealth = hero.stats.maxHealth;
hero.stats.currentMana = hero.stats.maxMana;
updatePlayerHealth();
updateStatsAndAttributesUI();
updateZoneUI();
updateEnemyHealth();

game.saveGame();

let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);

// asdasdasd


function createDebugUI() {
  const indentPx = 10;
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.bottom = '0';
  debugDiv.style.left = '0';
  debugDiv.style.backgroundColor = 'black';
  debugDiv.style.color = 'white'; // For readability
  debugDiv.style.border = '1px solid black';
  debugDiv.style.padding = '10px';
  debugDiv.style.maxHeight = '400px';
  debugDiv.style.overflowY = 'scroll';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.fontFamily = 'monospace';
  debugDiv.style.fontSize = '12px';
  document.body.appendChild(debugDiv);

  const expandedState = new Map();

  // Helper function to render nested objects and arrays with spacing
  function renderObject(obj, parent, path = '', level = 0) {
    if (typeof obj !== 'object' || obj === null) {
      // Display primitive values
      const span = document.createElement('span');
      span.style.marginLeft = `${level * indentPx}px`; // Indentation for levels
      span.textContent = JSON.stringify(obj);
      parent.appendChild(span);
      return;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const fullPath = `${path}.${key}`;

        if (typeof value === 'object' && value !== null) {
          // Create expandable details for objects and arrays
          const details = document.createElement('details');
          details.style.marginLeft = `${level * indentPx}px`; // Indentation for levels

          // Preserve expansion state
          if (expandedState.has(fullPath)) {
            details.open = expandedState.get(fullPath);
          } else {
            details.open = true; // Default: Expanded
          }

          // Track changes to the expansion state
          details.addEventListener('toggle', () => {
            expandedState.set(fullPath, details.open);
          });

          const summary = document.createElement('summary');
          summary.textContent = key;
          details.appendChild(summary);

          // Recursively render child objects
          renderObject(value, details, fullPath, level + 1);
          parent.appendChild(details);
        } else {
          // Display primitive properties as plain text
          const span = document.createElement('span');
          span.style.marginLeft = `${(level + 1) * indentPx}px`; // Indentation for properties
          span.textContent = `${key}: ${JSON.stringify(value)}`;
          parent.appendChild(span);
          parent.appendChild(document.createElement('br'));
        }
      }
    }
  }

  // Function to update the UI
  function updateDebugUI() {
    debugDiv.innerHTML = ''; // Clear current UI

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value;
      try {
        value = JSON.parse(localStorage.getItem(key));
      } catch {
        value = localStorage.getItem(key); // Non-JSON values
      }

      const fullPath = key;
      const details = document.createElement('details');

      // Preserve expansion state
      if (expandedState.has(fullPath)) {
        details.open = expandedState.get(fullPath);
      } else {
        details.open = true; // Default: Expanded
      }

      // Track changes to the expansion state
      details.addEventListener('toggle', () => {
        expandedState.set(fullPath, details.open);
      });

      const summary = document.createElement('summary');
      summary.textContent = key;
      details.appendChild(summary);

      // Render the nested object or value
      renderObject(value, details, fullPath, 0);
      debugDiv.appendChild(details);
    }
  }

  // Initial update and monitor changes
  updateDebugUI();
  setInterval(updateDebugUI, 1000);
}

createDebugUI();
