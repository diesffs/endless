import { game, hero, inventory, training, skillTree, dataManager } from './globals.js';
import { MATERIALS } from './constants/materials.js';
import SimpleCrypto from 'simple-crypto-js';
import { showToast, updatePlayerLife, updateResources, updateStageUI } from './ui/ui.js';
import { ITEM_RARITY, ITEM_TYPES } from './constants/items.js';

export const crypt = new SimpleCrypto(import.meta.env.VITE_ENCRYPT_KEY);

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

export function initDebugging() {
  let dev = false; // Track if dev mode is active
  let keySequence = [];
  const toggleSequence = ['e', 'd', 'e', 'v'];

  document.addEventListener('keydown', (event) => {
    keySequence.push(event.key.toLowerCase());
    if (keySequence.length > toggleSequence.length) {
      keySequence.shift();
    }
    if (keySequence.join('') === toggleSequence.join('')) {
      dev = !dev;
      console.log(`Dev mode is now ${dev ? 'enabled' : 'disabled'}.`);
      if (dev) {
        document.body.classList.add('dev-active');
        createDebugUI();
        createModifyUI();
      } else {
        document.body.classList.remove('dev-active');
        const debugDiv = document.querySelector('.debug-ui');
        const modifyUI = document.querySelector('.modify-ui');
        if (debugDiv) {
          debugDiv.remove();
        }
        if (modifyUI) {
          modifyUI.remove();
        }
      }
    }
  });
}

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
      if (key !== 'gameProgress') continue;

      try {
        value = crypt.decrypt(localStorage.getItem('gameProgress'));
      } catch {
        console.error('Failed to decrypt game progress');
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
  setInterval(dataManager.saveGame, 1000);
}

export function createModifyUI() {
  const modifyDiv = document.createElement('div');
  modifyDiv.className = 'modify-panel modify-ui';
  document.body.appendChild(modifyDiv);

  // Example: Add buttons to modify hero stats
  const heroSection = document.createElement('div');
  heroSection.innerHTML = `<h3>Hero</h3>`;
  modifyDiv.appendChild(heroSection);

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

  // Button to set highest stage to 100000
  const setHighestStageBtn = document.createElement('button');
  setHighestStageBtn.textContent = 'Set Highest Stage to 100000';
  setHighestStageBtn.addEventListener('click', () => {
    hero.highestStage = 100000;
    updateStageUI();
    dataManager.saveGame();
    showToast('Set highest stage to 100000!');
  });
  heroSection.appendChild(setHighestStageBtn);

  // Button to give experience for level up
  const giveExpBtn = document.createElement('button');
  giveExpBtn.textContent = 'Give Experience for Level Up';
  giveExpBtn.addEventListener('click', () => {
    hero.levelUp(1);
  });
  heroSection.appendChild(giveExpBtn);

  // Button to give experience for 10 level ups
  const giveExp10Btn = document.createElement('button');
  giveExp10Btn.textContent = 'Give Experience for 10 Level Ups';
  giveExp10Btn.addEventListener('click', () => {
    hero.levelUp(10);
    showToast(`Gave experience for 10 level ups!`);
  });
  heroSection.appendChild(giveExp10Btn);

  // Button to give experience for 100 level ups
  const giveExp100Btn = document.createElement('button');
  giveExp100Btn.textContent = 'Give Experience for 100 Level Ups';
  giveExp100Btn.addEventListener('click', () => {
    hero.levelUp(100);
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
    hero.gainCrystals(crystalsAmount);
    updateResources(); // Assuming there's a function to update the UI
    showToast(`Added ${crystalsAmount} crystals!`);
  });
  heroSection.appendChild(addCrystalsBtn);

  // Button to add souls
  const addSoulsBtn = document.createElement('button');
  addSoulsBtn.textContent = 'Add Souls';
  addSoulsBtn.addEventListener('click', () => {
    const soulsAmount = 1000; // Amount of souls to add
    hero.gainSouls(soulsAmount);
    updateResources(); // Assuming there's a function to update the UI
    showToast(`Added ${soulsAmount} souls!`);
  });
  heroSection.appendChild(addSoulsBtn);

  // Example: Add buttons to modify inventory
  const inventorySection = document.createElement('div');
  inventorySection.innerHTML = `<h3>Inventory</h3>`;
  modifyDiv.appendChild(inventorySection);

  // --- Add Random Item with controls ---
  const addItemControlsDiv = document.createElement('div');
  addItemControlsDiv.style.display = 'flex';
  addItemControlsDiv.style.flexDirection = 'row';
  addItemControlsDiv.style.alignItems = 'center';
  addItemControlsDiv.style.flexWrap = 'wrap';

  // Helper to group label+input compactly
  function makeControl(labelText, inputElem) {
    const group = document.createElement('div');
    group.style.display = 'flex';
    group.style.flexDirection = 'column';
    group.style.alignItems = 'flex-start';
    group.style.margin = '0 4px';
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.fontSize = '11px';
    label.style.marginBottom = '2px';
    group.appendChild(label);
    group.appendChild(inputElem);
    return group;
  }

  // Item type
  const itemTypeSelect = document.createElement('select');
  itemTypeSelect.id = 'item-type-select';
  Object.keys(ITEM_TYPES).forEach((type) => {
    const option = document.createElement('option');
    option.value = ITEM_TYPES[type];
    option.textContent = ITEM_TYPES[type];
    itemTypeSelect.appendChild(option);
  });
  addItemControlsDiv.appendChild(makeControl('Type', itemTypeSelect));

  // Item level
  const itemLevelInput = document.createElement('input');
  itemLevelInput.type = 'number';
  itemLevelInput.min = '1';
  itemLevelInput.max = '100';
  itemLevelInput.value = '1';
  itemLevelInput.id = 'item-level-input';
  itemLevelInput.style.width = '45px';
  addItemControlsDiv.appendChild(makeControl('Lvl', itemLevelInput));

  // Item rarity
  const raritySelect = document.createElement('select');
  raritySelect.id = 'item-rarity-select';
  Object.keys(ITEM_RARITY).forEach((rarityKey) => {
    const option = document.createElement('option');
    option.value = ITEM_RARITY[rarityKey].name;
    option.textContent = ITEM_RARITY[rarityKey].name;
    raritySelect.appendChild(option);
  });
  addItemControlsDiv.appendChild(makeControl('Rarity', raritySelect));

  // Item tier
  const tierInput = document.createElement('input');
  tierInput.type = 'number';
  tierInput.min = '1';
  tierInput.max = '12';
  tierInput.value = '1';
  tierInput.id = 'item-tier-input';
  tierInput.style.width = '45px';
  addItemControlsDiv.appendChild(makeControl('Tier', tierInput));

  // Add Random Item button
  const addItemBtn = document.createElement('button');
  addItemBtn.textContent = 'Add Random Item';
  addItemBtn.addEventListener('click', () => {
    const itemType = itemTypeSelect.value;
    const itemLevel = parseInt(itemLevelInput.value, 10) || 1;
    const rarity = raritySelect.value;
    const tier = parseInt(tierInput.value, 10) || 1;
    const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
    inventory.addItemToInventory(newItem);
    showToast(`Added ${itemType} (level ${itemLevel}, ${rarity}, tier ${tier}) to inventory`);
  });
  addItemControlsDiv.appendChild(addItemBtn);

  // Add 10x Items button (levels increment by 100)
  const add10ItemsBtn = document.createElement('button');
  add10ItemsBtn.textContent = 'Add 10x Items (+100 Lvl each)';
  add10ItemsBtn.addEventListener('click', () => {
    const itemType = itemTypeSelect.value;
    const baseLevel = parseInt(itemLevelInput.value, 10) || 1;
    const rarity = raritySelect.value;
    const tier = parseInt(tierInput.value, 10) || 1;
    for (let i = 0; i < 10; i++) {
      const itemLevel = baseLevel + i * 100;
      const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
      inventory.addItemToInventory(newItem);
    }
    showToast(
      `Added 10x ${itemType} (levels ${baseLevel} to ${baseLevel + 900}, ${rarity}, tier ${tier}) to inventory`
    );
  });
  addItemControlsDiv.appendChild(add10ItemsBtn);

  // Generate full gear button
  const generateFullGearBtn = document.createElement('button');
  generateFullGearBtn.textContent = 'Generate full gear';
  generateFullGearBtn.addEventListener('click', () => {
    const itemLevel = parseInt(itemLevelInput.value, 10) || 1;
    const rarity = raritySelect.value;
    const tier = parseInt(tierInput.value, 10) || 1;
    let count = 0;
    Object.values(ITEM_TYPES).forEach((itemType) => {
      if (itemType === 'RING') {
        for (let i = 0; i < 2; i++) {
          const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
          inventory.addItemToInventory(newItem);
          count++;
        }
      } else {
        const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
        inventory.addItemToInventory(newItem);
        count++;
      }
    });
    showToast(`Generated full gear set (${count} items, level ${itemLevel}, ${rarity}, tier ${tier})`);
  });
  addItemControlsDiv.appendChild(generateFullGearBtn);

  inventorySection.appendChild(addItemControlsDiv);

  // --- Add Material Buttons ---
  // Add Random Material
  const addRandomMaterialBtn = document.createElement('button');
  addRandomMaterialBtn.textContent = 'Add Random Material';
  addRandomMaterialBtn.addEventListener('click', () => {
    const mat = inventory.getRandomMaterial();
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
  addSkillPointBtn.textContent = 'Add 100 Skill Points';
  addSkillPointBtn.addEventListener('click', () => {
    skillTree.addSkillPoints(100);
  });
  skillTreeSection.appendChild(addSkillPointBtn);

  // Example: Add buttons to modify training
  const trainingSection = document.createElement('div');
  trainingSection.innerHTML = `<h3>Training</h3>`;
  modifyDiv.appendChild(trainingSection);

  const resetTrainingBtn = document.createElement('button');
  resetTrainingBtn.textContent = 'Reset Training';
  resetTrainingBtn.addEventListener('click', () => {
    training.reset();
    training.updateTrainingUI('gold-upgrades');
    training.updateTrainingUI('crystal-upgrades');
    hero.recalculateFromAttributes();
    updatePlayerLife();
  });
  trainingSection.appendChild(resetTrainingBtn);

  // Button to reset all progress
  const resetProgressBtn = document.createElement('button');
  resetProgressBtn.textContent = 'Reset All Progress';
  resetProgressBtn.addEventListener('click', () => {
    game.resetAllProgress();
  });
  modifyDiv.appendChild(resetProgressBtn);

  // Example: Add buttons to modify training
  const dataManagementSection = document.createElement('div');
  dataManagementSection.innerHTML = `<h3>Data Management</h3>`;
  modifyDiv.appendChild(dataManagementSection);

  // Button: Copy Decrypted Save to Clipboard
  const copyDecryptedBtn = document.createElement('button');
  copyDecryptedBtn.textContent = 'Copy Decrypted Save';
  copyDecryptedBtn.title = 'Decrypts your current save and copies the JSON to clipboard.';
  copyDecryptedBtn.addEventListener('click', async () => {
    try {
      const encrypted = localStorage.getItem('gameProgress');
      if (!encrypted) {
        showToast('No save found in localStorage', 'error');
        return;
      }
      const decrypted = crypt.decrypt(encrypted);
      await navigator.clipboard.writeText(JSON.stringify(decrypted, null, 2));
      showToast('Decrypted save copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy decrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(copyDecryptedBtn);

  // Button: Paste Decrypted Save from Clipboard (encrypts and saves)
  const pasteDecryptedBtn = document.createElement('button');
  pasteDecryptedBtn.textContent = 'Paste Decrypted Save';
  pasteDecryptedBtn.title = 'Reads decrypted JSON from clipboard, encrypts it, and saves to localStorage.';
  pasteDecryptedBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast('Clipboard is empty', 'error');
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        showToast('Clipboard does not contain valid JSON', 'error');
        return;
      }
      const encrypted = crypt.encrypt(JSON.stringify(parsed));
      localStorage.setItem('gameProgress', encrypted);
      window.location.reload();
      showToast('Decrypted save encrypted and saved to localStorage!');
    } catch (e) {
      showToast('Failed to paste decrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(pasteDecryptedBtn);

  // Button: Copy Encrypted Save to Clipboard (with quotes)
  const copyEncryptedWithQuotesBtn = document.createElement('button');
  copyEncryptedWithQuotesBtn.textContent = 'Copy Encrypted Save (with quotes)';
  copyEncryptedWithQuotesBtn.title = 'Copies the encrypted save from localStorage to clipboard, wrapped in quotes.';
  copyEncryptedWithQuotesBtn.addEventListener('click', async () => {
    try {
      const encrypted = localStorage.getItem('gameProgress');
      if (!encrypted) {
        showToast('No save found in localStorage', 'error');
        return;
      }
      await navigator.clipboard.writeText('"' + encrypted + '"');
      showToast('Encrypted save (with quotes) copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy encrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(copyEncryptedWithQuotesBtn);

  // Button: Paste Encrypted Save from Clipboard (saves directly)
  const pasteEncryptedBtn = document.createElement('button');
  pasteEncryptedBtn.textContent = 'Paste Encrypted Save';
  pasteEncryptedBtn.title = 'Reads encrypted text from clipboard and saves it directly to localStorage.';
  pasteEncryptedBtn.addEventListener('click', async () => {
    try {
      let encrypted = await navigator.clipboard.readText();
      if (!encrypted) {
        showToast('Clipboard is empty', 'error');
        return;
      }
      // Remove quotes if present at start and end
      if (encrypted.length > 1 && encrypted.startsWith('"') && encrypted.endsWith('"')) {
        encrypted = encrypted.slice(1, -1);
      }
      localStorage.setItem('gameProgress', encrypted);
      window.location.reload();
      showToast('Encrypted save pasted to localStorage!');
    } catch (e) {
      showToast('Failed to paste encrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(pasteEncryptedBtn);
}
