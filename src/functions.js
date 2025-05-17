import { game, hero, inventory, prestige, shop, skillTree } from './globals.js';
import { showToast, updatePlayerLife, updateResources } from './ui.js';
import { MATERIALS, getRandomMaterial } from './material.js';

export const handleSavedData = (savedData, self) => {
  if (savedData) {
    Object.keys(self).forEach((key) => {
      if (savedData.hasOwnProperty(key)) {
        if (
          typeof self[key] === 'object' &&
          !Array.isArray(self[key]) &&
          self[key] !== null &&
          savedData[key] !== null
        ) {
          self[key] = { ...self[key], ...savedData[key] };
        } else {
          self[key] = savedData[key];
        }
      }
    });
  }
};

// Debugging

export function createDebugUI() {
  const indentPx = 10;
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.top = '0';
  debugDiv.style.left = '0';
  debugDiv.style.backgroundColor = 'black';
  debugDiv.style.color = 'white'; // For readability
  debugDiv.style.border = '1px solid black';
  debugDiv.style.padding = '10px';
  debugDiv.style.maxHeight = '100%';
  debugDiv.style.maxWidth = '350px';
  debugDiv.style.overflowY = 'scroll';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.fontFamily = 'monospace';
  debugDiv.style.fontSize = '12px';
  debugDiv.classList.add('debug-ui');
  document.body.appendChild(debugDiv);

  // Load saved expanded states
  const expandedState = new Map(JSON.parse(localStorage.getItem('debugUIState') || '[]'));

  // Save expanded state whenever it changes
  function saveExpandedState() {
    localStorage.setItem('debugUIState', JSON.stringify([...expandedState]));
  }

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

        if (obj instanceof Map) {
          // Convert Map to an object for display
          const mapObject = {};
          obj.forEach((value, key) => {
            mapObject[key] = value;
          });
          renderObject(mapObject, parent, path, level);
          return;
        }

        if (typeof obj !== 'object' || obj === null) {
          const span = document.createElement('span');
          span.style.marginLeft = `${level * indentPx}px`;
          span.textContent = JSON.stringify(obj);
          parent.appendChild(span);
          return;
        }

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
            saveExpandedState();
          });

          const summary = document.createElement('summary');
          summary.textContent = key;
          summary.style.cursor = 'pointer';
          summary.style.fontWeight = 'bold';
          summary.style.color = 'orange';
          if (Array.isArray(value)) {
            summary.textContent = key + '[]';
            summary.style.color = 'yellow';
          }

          if (level === 0) {
            summary.style.fontSize = '18px';
            summary.style.color = '#00ff00';
          }

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

      if (key === 'debugUIState') continue;

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
  setInterval(game.saveGame, 1000);
}

export function createModifyUI() {
  const modifyDiv = document.createElement('div');
  modifyDiv.className = 'modify-panel modify-ui';
  document.body.appendChild(modifyDiv);

  // Example: Add buttons to modify hero stats
  const heroSection = document.createElement('div');
  heroSection.innerHTML = `<h3>Hero</h3>`;
  modifyDiv.appendChild(heroSection);

  // Button to give free attribute points
  const giveStatsBtn = document.createElement('button');
  giveStatsBtn.textContent = 'Give 5 Attributes';
  giveStatsBtn.addEventListener('click', () => {
    const freePoints = 5; // Number of free attribute points to give
    hero.statPoints += freePoints;
    hero.recalculateFromAttributes();
    showToast(`Gave ${freePoints} attribute points!`);
  });
  heroSection.appendChild(giveStatsBtn);

  // Button to give 100 attribute points
  const give100StatsBtn = document.createElement('button');
  give100StatsBtn.textContent = 'Give 100 Attributes';
  give100StatsBtn.addEventListener('click', () => {
    const freePoints = 100;
    hero.statPoints += freePoints;
    hero.recalculateFromAttributes();
    showToast(`Gave ${freePoints} attribute points!`);
  });
  heroSection.appendChild(give100StatsBtn);

  // Button to give experience for level up
  const giveExpBtn = document.createElement('button');
  giveExpBtn.textContent = 'Give Experience for Level Up';
  giveExpBtn.addEventListener('click', () => {
    const expNeeded = hero.expToNextLevel - hero.exp;
    hero.gainExp(expNeeded);
    showToast(`Gave ${expNeeded} experience to level up!`);
  });
  heroSection.appendChild(giveExpBtn);

  // Button to give experience for level up
  const giveExp10Btn = document.createElement('button');
  giveExp10Btn.textContent = 'Give Experience for 10 Level Ups';
  giveExp10Btn.addEventListener('click', () => {
    for (let i = 0; i < 10; i++) {
      const expNeeded = hero.expToNextLevel - hero.exp;
      hero.gainExp(expNeeded);
    }
    showToast(`Gave experience for 10 level ups!`);
  });
  heroSection.appendChild(giveExp10Btn);

  // Button to give experience for 100 level ups
  const giveExp100Btn = document.createElement('button');
  giveExp100Btn.textContent = 'Give Experience for 100 Level Ups';
  giveExp100Btn.addEventListener('click', () => {
    for (let i = 0; i < 100; i++) {
      const expNeeded = hero.expToNextLevel - hero.exp;
      hero.gainExp(expNeeded);
    }
    showToast(`Gave experience for 100 level ups!`);
  });
  heroSection.appendChild(giveExp100Btn);

  // Button to add gold
  const addGoldBtn = document.createElement('button');
  addGoldBtn.textContent = 'Add Gold';
  addGoldBtn.addEventListener('click', () => {
    const goldAmount = 100000000; // Amount of gold to add
    hero.gainGold(goldAmount);
    updateResources(); // Assuming there's a function to update the UI
    showToast(`Added ${goldAmount} gold!`);
  });
  heroSection.appendChild(addGoldBtn);

  // Button to add crystals
  const addCrystalsBtn = document.createElement('button');
  addCrystalsBtn.textContent = 'Add Crystals';
  addCrystalsBtn.addEventListener('click', () => {
    const crystalsAmount = 1000; // Amount of crystals to add
    hero.crystals += crystalsAmount;
    updateResources(); // Assuming there's a function to update the UI
    showToast(`Added ${crystalsAmount} crystals!`);
  });
  heroSection.appendChild(addCrystalsBtn);

  // Example: Add buttons to modify inventory
  const inventorySection = document.createElement('div');
  inventorySection.innerHTML = `<h3>Inventory</h3>`;
  modifyDiv.appendChild(inventorySection);

  const addItemBtn = document.createElement('button');
  addItemBtn.textContent = 'Add Random Item';
  addItemBtn.addEventListener('click', () => {
    const itemType = game.currentEnemy.getRandomItemType();
    const newItem = inventory.createItem(itemType, Math.floor(Math.random() * 101), 'RARE');
    inventory.addItemToInventory(newItem);
    showToast(`Added ${itemType} to inventory`);
  });
  inventorySection.appendChild(addItemBtn);

  // --- Add Material Buttons ---
  // Add Random Material
  const addRandomMaterialBtn = document.createElement('button');
  addRandomMaterialBtn.textContent = 'Add Random Material';
  addRandomMaterialBtn.addEventListener('click', () => {
    const mat = getRandomMaterial();
    inventory.addMaterial({ id: mat.id, icon: mat.icon, qty: 1 });
    showToast(`Added 1 ${mat.name} to materials`);
  });
  inventorySection.appendChild(addRandomMaterialBtn);

  // Add Material by Dropdown
  const addMaterialByIdDiv = document.createElement('div');
  addMaterialByIdDiv.style.marginTop = '8px';

  // Create dropdown for all materials
  const materialSelect = document.createElement('select');
  materialSelect.id = 'material-id-select';
  Object.values(MATERIALS).forEach((mat) => {
    const option = document.createElement('option');
    option.value = mat.id;
    option.textContent = `${mat.icon} ${mat.name}`;
    materialSelect.appendChild(option);
  });

  // Quantity input
  const qtyInput = document.createElement('input');
  qtyInput.id = 'material-qty-input';
  qtyInput.type = 'number';
  qtyInput.min = '1';
  qtyInput.value = '1';
  qtyInput.style.width = '50px';

  // Add button
  const addBtn = document.createElement('button');
  addBtn.id = 'add-material-by-id-btn';
  addBtn.textContent = 'Add Material';

  addMaterialByIdDiv.appendChild(materialSelect);
  addMaterialByIdDiv.appendChild(qtyInput);
  addMaterialByIdDiv.appendChild(addBtn);
  inventorySection.appendChild(addMaterialByIdDiv);

  addBtn.onclick = () => {
    const id = materialSelect.value;
    const qty = parseInt(qtyInput.value, 10) || 1;
    const matDef = Object.values(MATERIALS).find((m) => m.id === id);
    if (matDef) {
      inventory.addMaterial({ id: matDef.id, icon: matDef.icon, qty });
      showToast(`Added ${qty} ${matDef.name}${qty > 1 ? 's' : ''} to materials`);
    } else {
      showToast('Invalid material ID', 'error');
    }
  };

  // Example: Add buttons to modify skill tree
  const skillTreeSection = document.createElement('div');
  skillTreeSection.innerHTML = `<h3>Skill Tree</h3>`;
  modifyDiv.appendChild(skillTreeSection);

  const addSkillPointBtn = document.createElement('button');
  addSkillPointBtn.textContent = 'Add Skill Point';
  addSkillPointBtn.addEventListener('click', () => {
    skillTree.addSkillPoints(1);
  });
  skillTreeSection.appendChild(addSkillPointBtn);

  // Example: Add buttons to modify shop
  const shopSection = document.createElement('div');
  shopSection.innerHTML = `<h3>Shop</h3>`;
  modifyDiv.appendChild(shopSection);

  const resetShopBtn = document.createElement('button');
  resetShopBtn.textContent = 'Reset Shop';
  resetShopBtn.addEventListener('click', () => {
    shop.reset();
    shop.updateShopUI('gold-upgrades');
    shop.updateShopUI('crystal-upgrades');
    hero.recalculateFromAttributes();
    updatePlayerLife();
  });
  shopSection.appendChild(resetShopBtn);

  // Button to reset all progress
  const resetProgressBtn = document.createElement('button');
  resetProgressBtn.textContent = 'Reset All Progress';
  resetProgressBtn.addEventListener('click', () => {
    game.resetAllProgress();
  });
  modifyDiv.appendChild(resetProgressBtn);
}
