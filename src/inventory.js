import { handleSavedData } from './functions.js';
import Item, { ITEM_RARITY, RARITY_ORDER, SLOT_REQUIREMENTS } from './item.js';
import { game, hero } from './globals.js';
import { hideTooltip, positionTooltip, showToast, showTooltip, updateResources } from './ui.js';
import { MATERIALS } from './material.js';

const ITEM_SLOTS = 200;
const PERSISTENT_SLOTS = 30;
const MATERIALS_SLOTS = 50;

export default class Inventory {
  constructor(savedData = null) {
    this.equipmentBonuses = {
      damage: 0,
      armor: 0,
      strength: 0,
      agility: 0,
      vitality: 0,
      wisdom: 0,
      endurance: 0,
      dexterity: 0,
      critChance: 0,
      critDamage: 0,
      attackSpeed: 0,
      health: 0,
      blockChance: 0,
      mana: 0,
      manaRegen: 0,
      lifeRegen: 0,
      lifeSteal: 0,
      fireDamage: 0,
      coldDamage: 0,
      airDamage: 0,
      earthDamage: 0,
      attackRatingPercent: 0,
      attackRating: 0,
      damagePercent: 0,
      bonusGold: 0,
      bonusExperience: 0,
      healthPercent: 0,
      manaPercent: 0,
      armorPercent: 0,
      elementalDamagePercent: 0,
    };

    this.equippedItems = savedData?.equippedItems || {};
    this.inventoryItems = savedData?.inventoryItems || new Array(ITEM_SLOTS).fill(null);
    this.materials = savedData?.materials || new Array(MATERIALS_SLOTS).fill(null);

    if (savedData) {
      // Restore equipped items
      this.equippedItems = {};
      Object.entries(savedData.equippedItems).forEach(([slot, item]) => {
        if (item) {
          // Pass existing stats when creating item
          this.equippedItems[slot] = new Item(item.type, item.level, item.rarity, item.stats);
          this.equippedItems[slot].id = item.id;
        }
      });

      // Restore inventory items
      this.inventoryItems = savedData.inventoryItems.map((item) => {
        if (item) {
          // Pass existing stats when creating item
          const restoredItem = new Item(item.type, item.level, item.rarity, item.stats);
          restoredItem.id = item.id;
          return restoredItem;
        }
        return null;
      });
      this.materials = savedData.materials
        ? savedData.materials.map((mat) => (mat ? { ...mat } : null))
        : new Array(MATERIALS_SLOTS).fill(null);
    } else {
      this.equippedItems = {};
      this.inventoryItems = new Array(ITEM_SLOTS).fill(null);
      this.materials = new Array(MATERIALS_SLOTS).fill(null);
    }

    this.initializeInventoryUI();

    this.removeTooltip = this.removeTooltip.bind(this);
    window.addEventListener('mouseout', (e) => {
      if (e.relatedTarget === null) this.removeTooltip();
    });
  }

  initializeInventoryUI() {
    const gridContainer = document.querySelector('.grid-container');
    // Create ITEM_SLOTS empty cells (10x20 grid)
    for (let i = 0; i < ITEM_SLOTS; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      if (i < PERSISTENT_SLOTS) {
        cell.classList.add('persistent');
      }
      gridContainer.appendChild(cell);
    }
    this.updateInventoryGrid();

    const sortBtn = document.getElementById('sort-inventory');
    const itemsTab = document.getElementById('items-tab');
    const materialsTab = document.getElementById('materials-tab');
    const materialsGrid = document.querySelector('.materials-grid');

    // Update button text on tab switch
    function updateSortBtnText() {
      if (itemsTab.classList.contains('active')) {
        sortBtn.textContent = 'Sort Items';
      } else {
        sortBtn.textContent = 'Sort Materials';
      }
    }
    updateSortBtnText();

    if (itemsTab && materialsTab && gridContainer && materialsGrid) {
      itemsTab.addEventListener('click', () => {
        itemsTab.classList.add('active');
        materialsTab.classList.remove('active');
        gridContainer.style.display = '';
        materialsGrid.style.display = 'none';
        updateSortBtnText();
      });
      materialsTab.addEventListener('click', () => {
        materialsTab.classList.add('active');
        itemsTab.classList.remove('active');
        gridContainer.style.display = 'none';
        materialsGrid.style.display = '';
        this.updateMaterialsGrid();
        updateSortBtnText();
      });
    }

    // Sort button sorts only the visible tab
    sortBtn.addEventListener('click', () => {
      if (itemsTab.classList.contains('active')) {
        this.sortInventory();
        showToast(`Sorted items by rarity, then level`, 'success');
      } else {
        this.sortMaterials();
        showToast(`Sorted materials by quantity, then id`, 'success');
      }
    });

    // Add event listeners for salvage options
    document.querySelectorAll('.salvage-options div').forEach((option) => {
      option.addEventListener('click', () => {
        const rarity = option.dataset.rarity;
        this.salvageItemsByRarity(rarity);
        this.sortInventory();
      });
    });

    const materialsContainer = document.querySelector('.materials-container');
    if (materialsContainer) {
      materialsContainer.innerHTML = '';
      for (let i = 0; i < MATERIALS_SLOTS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('materials-cell');
        materialsContainer.appendChild(cell);
      }
    }
  }

  sortMaterials() {
    // Sort by quantity descending, then by sort prop ascending, then by id ascending
    const nonNullMaterials = this.materials.filter((mat) => mat !== null);
    nonNullMaterials.sort((a, b) => {
      if (b.qty !== a.qty) return b.qty - a.qty;
      // Get sort prop from MATERIALS definition
      const aDef = Object.values(MATERIALS).find((m) => m.id === a.id);
      const bDef = Object.values(MATERIALS).find((m) => m.id === b.id);
      const aSort = aDef?.sort ?? 9999;
      const bSort = bDef?.sort ?? 9999;
      if (aSort !== bSort) return aSort - bSort;
      return a.id.localeCompare(b.id);
    });
    // Fill up to MATERIALS_SLOTS with nulls
    this.materials = [...nonNullMaterials, ...new Array(MATERIALS_SLOTS - nonNullMaterials.length).fill(null)];
    this.updateMaterialsGrid();
    game.saveGame();
  }

  updateMaterialsGrid() {
    const materialsContainer = document.querySelector('.materials-container');
    if (!materialsContainer) return;
    materialsContainer.innerHTML = '';
    for (let i = 0; i < MATERIALS_SLOTS; i++) {
      const mat = this.materials[i];
      const cell = document.createElement('div');
      cell.classList.add('materials-cell');
      if (mat) {
        // Get full material definition for tooltip
        const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};
        // Show only first 2 digits, and "9+" if >9
        let qtyDisplay = mat.qty > 9 ? '+' : String(mat.qty).padStart(2, ' ');
        cell.innerHTML = `<div class="material-item" data-mat-id="${mat.id}" title="${matDef.name || mat.name || ''}">
          ${mat.icon || '🔹'}
          <span class="mat-qty">${qtyDisplay}</span>
        </div>`;
        const materialItem = cell.querySelector('.material-item');
        // Tooltip on hover (show name and amount)
        materialItem.addEventListener('mouseenter', (e) => {
          let tooltipContent = `<div class="item-tooltip"><b>${matDef.icon || mat.icon || '🔹'} ${
            matDef.name || mat.name || ''
          } &times; ${mat.qty}</b>`;
          if (matDef.description) tooltipContent += `<div style="margin-top:4px;">${matDef.description}</div>`;
          tooltipContent += `</div>`;
          showTooltip(tooltipContent, e, 'flex-tooltip');
        });
        materialItem.addEventListener('mousemove', positionTooltip);
        materialItem.addEventListener('mouseleave', hideTooltip);
        // Click to use
        materialItem.addEventListener('click', () => {
          this.openMaterialDialog(mat);
        });
      }
      materialsContainer.appendChild(cell);
    }
  }

  addMaterial(material) {
    // material: { id, icon, qty }
    let slot = this.materials.findIndex((m) => m && m.id === material.id);
    if (slot !== -1) {
      this.materials[slot].qty += material.qty;
    } else {
      slot = this.materials.findIndex((m) => m === null);
      if (slot !== -1) {
        // Default to qty or 1
        this.materials[slot] = { ...material, qty: material.qty || 1 };
      }
    }
    this.updateMaterialsGrid();
    game.saveGame();
  }

  openMaterialDialog(mat) {
    // Remove any existing dialog
    let dialog = document.getElementById('material-use-dialog');
    if (dialog) dialog.remove();

    // Always get the full definition from MATERIALS
    const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};

    dialog = document.createElement('div');
    dialog.id = 'material-use-dialog';
    dialog.style.position = 'fixed';
    dialog.style.left = '50%';
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = '#222';
    dialog.style.color = '#fff';
    dialog.style.padding = '24px 32px';
    dialog.style.borderRadius = '10px';
    dialog.style.zIndex = 10000;
    dialog.style.boxShadow = '0 4px 32px #000a';

    dialog.innerHTML = `
      <div style="font-size:2em;text-align:center;">${matDef.icon || mat.icon || '🔹'}</div>
      <div style="font-size:1.2em;margin-bottom:8px;text-align:center;">${matDef.name || mat.name || ''}</div>
      <div style="margin-bottom:8px;text-align:center;">${matDef.description || ''}</div>
      <div style="margin-bottom:8px;text-align:center;">You have <b>${mat.qty}</b></div>
      <input id="material-use-qty" type="number" min="1" max="${mat.qty}" value="${
      mat.qty
    }" style="width:60px;text-align:center;">
      <button id="material-use-btn" style="margin-left:10px;">Use</button>
      <button id="material-use-cancel" style="margin-left:10px;">Cancel</button>
    `;

    document.body.appendChild(dialog);

    // Focus input
    const qtyInput = dialog.querySelector('#material-use-qty');
    qtyInput.focus();
    qtyInput.select();

    // Use button
    dialog.querySelector('#material-use-btn').onclick = () => {
      let useQty = parseInt(qtyInput.value, 10);
      if (isNaN(useQty) || useQty < 1) useQty = 1;
      if (useQty > mat.qty) useQty = mat.qty;

      if (matDef && typeof matDef.onUse === 'function') {
        matDef.onUse(hero, useQty);
      }
      mat.qty -= useQty;
      if (mat.qty <= 0) {
        // Remove from inventory
        const idx = this.materials.findIndex((m) => m && m.id === mat.id);
        if (idx !== -1) this.materials[idx] = null;
      }
      this.updateMaterialsGrid();
      game.saveGame();
      updateResources(); // <-- update the UI after using a material
      dialog.remove();
      showToast(`Used ${useQty} ${matDef.name || mat.name || ''}${useQty > 1 ? 's' : ''}`, 'success');
    };

    // Cancel button
    dialog.querySelector('#material-use-cancel').onclick = () => {
      dialog.remove();
    };
  }

  salvageItemsByRarity(rarity) {
    let salvagedItems = 0;
    let goldGained = 0;
    let crystalsGained = 0;
    const salvageRarities = RARITY_ORDER.slice(0, RARITY_ORDER.indexOf(rarity) + 1);

    // Skip first PERSISTENT_SLOTS slots when salvaging
    this.inventoryItems = this.inventoryItems.map((item, index) => {
      if (index < PERSISTENT_SLOTS) return item; // Preserve persistent slots
      if (item && salvageRarities.includes(item.rarity)) {
        salvagedItems++;
        // Give gold based on rarity and level (customize as needed)
        goldGained += 10 * (item.level + 1) * (RARITY_ORDER.indexOf(item.rarity) + 1);
        // If mythic, give a crystal
        if (item.rarity === 'MYTHIC') {
          crystalsGained++;
        }
        return null;
      }
      return item;
    });

    if (salvagedItems > 0) {
      if (goldGained > 0) hero.gold = (hero.gold || 0) + goldGained;
      if (crystalsGained > 0) hero.crystals = (hero.crystals || 0) + crystalsGained;
      let msg = `Salvaged ${salvagedItems} ${rarity.toLowerCase()} or lower items`;
      if (goldGained > 0) msg += `, gained ${goldGained} gold`;
      if (crystalsGained > 0) msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
      showToast(msg, 'success');
      this.updateInventoryGrid();
      this.updateMaterialsGrid();
      updateResources(); // <-- update the UI after using a material
      game.saveGame();
    } else {
      showToast(`No ${rarity.toLowerCase()} or lower items to salvage`, 'info');
    }
  }

  setupDragAndDrop() {
    // Remove existing listeners first
    this.removeExistingListeners();

    // Setup new listeners
    this.setupGridCells();
    this.setupEquipmentSlots();
    this.setupItemDragAndTooltip();

    // Add trash drop logic
    const trash = document.querySelector('.inventory-trash');
    if (trash) {
      trash.addEventListener('dragover', (e) => {
        e.preventDefault();
        trash.classList.add('drag-over');
      });
      trash.addEventListener('dragleave', () => {
        trash.classList.remove('drag-over');
      });
      trash.addEventListener('drop', (e) => {
        e.preventDefault();
        trash.classList.remove('drag-over');
        const itemId = e.dataTransfer.getData('text/plain');
        const item = this.getItemById(itemId);
        if (!item) return;
        // Only allow inventory/equipped items, not materials
        let removed = false;
        const invIdx = this.inventoryItems.findIndex((i) => i && i.id === item.id);
        if (invIdx !== -1) {
          this.inventoryItems[invIdx] = null;
          removed = true;
        } else {
          for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
            if (equippedItem && equippedItem.id === item.id) {
              delete this.equippedItems[slot];
              removed = true;
              break;
            }
          }
        }
        if (removed) {
          // Salvage logic (reuse your salvage reward logic)
          let goldGained = 10 * (item.level + 1) * (RARITY_ORDER.indexOf(item.rarity) + 1);
          let crystalsGained = item.rarity === 'MYTHIC' ? 1 : 0;
          if (goldGained > 0) hero.gold = (hero.gold || 0) + goldGained;
          if (crystalsGained > 0) hero.crystals = (hero.crystals || 0) + crystalsGained;
          let msg = `Salvaged 1 ${item.rarity.toLowerCase()} item`;
          if (goldGained > 0) msg += `, gained ${goldGained} gold`;
          if (crystalsGained > 0) msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
          showToast(msg, 'success');
          this.updateInventoryGrid();
          game.saveGame();
        }
      });

      // --- ADVANCED TOOLTIP LOGIC ---
      trash.addEventListener('mouseenter', (e) => {
        const tooltipContent = `
      <div class="item-tooltip" style="text-align:center;">
        <div style="font-size:2em;">🗑️</div>
        <b>Salvage Item</b>
        <div style="margin-top:4px;font-size:0.95em;">
          Drag and drop an item here to salvage it.
        </div>
      </div>
    `;
        showTooltip(tooltipContent, e, 'flex-tooltip');
      });
      trash.addEventListener('mousemove', positionTooltip);
      trash.addEventListener('mouseleave', hideTooltip);
    }
  }

  setupGridCells() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach((cell) => {
      cell.addEventListener('dragover', this.handleDragOver.bind(this));
      cell.addEventListener('drop', this.handleDrop.bind(this));
    });
  }

  setupEquipmentSlots() {
    const slots = document.querySelectorAll('.equipment-slot');
    slots.forEach((slot) => {
      slot.addEventListener('dragover', this.handleDragOver.bind(this));
      slot.addEventListener('drop', this.handleDrop.bind(this));
    });
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e) {
    e.preventDefault();
    this.cleanupTooltips();
    const itemId = e.dataTransfer.getData('text/plain');
    const item = this.getItemById(itemId);
    const slot = e.target.closest('.equipment-slot');
    const cell = e.target.closest('.grid-cell');

    if (!item) return;

    if (slot) {
      // Add this check to prevent dropping on current slot
      const currentSlot = Object.entries(this.equippedItems).find(
        ([_, equippedItem]) => equippedItem?.id === item.id
      )?.[0];

      if (currentSlot === slot.dataset.slot) {
        return; // Exit if trying to drop on same slot
      }
      // Special handling for ring slots
      if (slot.dataset.slot === 'ring1' || slot.dataset.slot === 'ring2') {
        this.handleRingSlotDrop(item, slot.dataset.slot);
      } else if (this.canEquipInSlot(item, slot.dataset.slot)) {
        this.equipItem(item, slot.dataset.slot);
      }
    } else if (cell) {
      const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
      this.moveItemToPosition(item, cellIndex);
    }

    this.updateInventoryGrid();
  }

  handleRingSlotDrop(draggedRing, targetSlot) {
    // Find which slot the dragged ring is currently equipped in
    const currentSlot =
      this.equippedItems.ring1?.id === draggedRing.id
        ? 'ring1'
        : this.equippedItems.ring2?.id === draggedRing.id
        ? 'ring2'
        : null;

    if (currentSlot) {
      // Ring is being moved between ring slots
      const targetRing = this.equippedItems[targetSlot];

      if (targetRing) {
        // Swap rings
        this.equippedItems[currentSlot] = targetRing;
        this.equippedItems[targetSlot] = draggedRing;
      } else {
        // Move ring to empty slot
        delete this.equippedItems[currentSlot];
        this.equippedItems[targetSlot] = draggedRing;
      }
    } else {
      // Ring is coming from inventory
      const inventoryIndex = this.inventoryItems.findIndex((item) => item?.id === draggedRing.id);
      if (inventoryIndex !== -1) {
        // Remove from inventory
        this.inventoryItems[inventoryIndex] = this.equippedItems[targetSlot] || null;
        // Equip in target slot
        this.equippedItems[targetSlot] = draggedRing;
      }
    }

    hero.recalculateFromAttributes();
    game.saveGame();
  }

  moveItemToPosition(item, newPosition) {
    // Get current position of item
    const currentPosition = this.inventoryItems.findIndex((i) => i && i.id === item.id);

    // If there's an item in the target position, swap them
    const targetItem = this.inventoryItems[newPosition];

    if (currentPosition !== -1) {
      // Item is in inventory
      this.inventoryItems[currentPosition] = targetItem;
      this.inventoryItems[newPosition] = item;
    } else {
      // Item is equipped, handle unequipping to specific position
      for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
        if (equippedItem.id === item.id) {
          delete this.equippedItems[slot];
          if (targetItem) {
            // If target position has an item, try to equip it
            if (this.canEquipInSlot(targetItem, slot)) {
              this.equippedItems[slot] = targetItem;
              this.inventoryItems[newPosition] = item;
            }
          } else {
            this.inventoryItems[newPosition] = item;
          }
          break;
        }
      }
    }
    this.updateInventoryGrid();
    hero.recalculateFromAttributes();
    game.saveGame(); // Add save
  }

  getEquippedItemById(id) {
    for (const [slot, item] of Object.entries(this.equippedItems)) {
      if (item.id === id) return item;
    }
    return null;
  }

  createItem(type, level, rarity = this.generateRarity()) {
    return new Item(type, level, rarity);
  }

  generateRarity() {
    const rand = Math.random() * 100;
    let total = 0;

    for (const [rarity, config] of Object.entries(ITEM_RARITY)) {
      total += config.chance;
      if (rand <= total) return rarity;
    }
    return ITEM_RARITY.NORMAL.name;
  }

  addItemToInventory(item, specificPosition = null) {
    if (!item) {
      console.error('Attempted to add null item to inventory');
      return;
    }

    if (specificPosition !== null && specificPosition < ITEM_SLOTS && !this.inventoryItems[specificPosition]) {
      this.inventoryItems[specificPosition] = item;
    } else {
      // Find first empty slot after persistent slots (40)
      const emptySlot = this.inventoryItems.findIndex((slot, index) => slot === null && index >= PERSISTENT_SLOTS);
      if (emptySlot !== -1) {
        this.inventoryItems[emptySlot] = item;
      }
    }
    this.updateInventoryGrid();
    game.saveGame(); // Add save
  }

  updateInventoryGrid() {
    this.cleanupTooltips();

    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach((cell) => (cell.innerHTML = ''));

    const items = document.querySelectorAll('.inventory-item');
    items.forEach((item) => item.remove());

    this.inventoryItems.forEach((item, index) => {
      const cell = document.querySelector(`.grid-cell:nth-child(${index + 1})`);
      const html = String.raw;
      if (cell && item) {
        cell.innerHTML = html`
          <div class="inventory-item rarity-${item.rarity.toLowerCase()}" draggable="true" data-item-id="${item.id}">
            <div class="item-icon">${item.getIcon()}</div>
          </div>
        `;
      }
    });

    Object.entries(this.equippedItems).forEach(([slot, item]) => {
      const slotElement = document.querySelector(`[data-slot="${slot}"]`);
      if (slotElement && item) {
        const newItem = document.createElement('div');
        newItem.className = 'inventory-item';
        newItem.draggable = true;
        newItem.dataset.itemId = item.id;
        newItem.style.borderColor = ITEM_RARITY[item.rarity].color;
        newItem.innerHTML = `<div class="item-icon">${item.getIcon()}</div>`;

        const existingItem = slotElement.querySelector('.inventory-item');
        if (existingItem) {
          slotElement.replaceChild(newItem, existingItem);
        } else {
          slotElement.appendChild(newItem);
        }
      }
    });

    this.setupDragAndDrop();
    this.updateMaterialsGrid();
  }

  removeExistingListeners() {
    // Remove grid cell listeners
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach((cell) => {
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);
    });

    // Remove equipment slot listeners
    const slots = document.querySelectorAll('.equipment-slot');
    slots.forEach((slot) => {
      const newSlot = slot.cloneNode(true);
      slot.parentNode.replaceChild(newSlot, slot);
    });
  }

  removeTooltip() {
    const tooltips = document.querySelectorAll('.item-tooltip');
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  setupItemDragAndTooltip() {
    const items = document.querySelectorAll('.inventory-item');

    items.forEach((item) => {
      // Add double-click handler
      item.addEventListener('dblclick', (e) => {
        const itemData = this.getItemById(item.dataset.itemId);
        if (!itemData) return;

        // Check if item is currently equipped
        const equippedSlot = Object.entries(this.equippedItems).find(
          ([slot, equippedItem]) => equippedItem?.id === itemData.id
        )?.[0];

        if (equippedSlot) {
          // Unequip item
          const emptySlot = this.inventoryItems.findIndex((slot) => slot === null);
          if (emptySlot !== -1) {
            this.inventoryItems[emptySlot] = itemData;
            delete this.equippedItems[equippedSlot];
            hero.recalculateFromAttributes();
            this.updateInventoryGrid();
            game.saveGame();
          }
          return;
        }

        // Existing equip logic for inventory items
        for (const [slot, requirements] of Object.entries(SLOT_REQUIREMENTS)) {
          if (requirements.includes(itemData.type)) {
            if (!this.equippedItems[slot] || this.canEquipInSlot(itemData, slot)) {
              this.equipItem(itemData, slot);
              hero.recalculateFromAttributes();
              this.updateInventoryGrid();
              return;
            }
          }
        }
      });

      // Add dragstart event listener
      item.addEventListener('dragstart', (e) => {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.dataset.itemId);
        this.cleanupTooltips(); // Also clean tooltips on drag start
      });

      item.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.equipment-slot').forEach((slot) => {
          slot.classList.remove('valid-target', 'invalid-target');
        });
      });

      // Tooltip events
      item.addEventListener('mouseenter', (e) => {
        if (item.classList.contains('dragging')) return;

        const itemData = this.getItemById(item.dataset.itemId);
        if (!itemData) return;

        // Create tooltip content
        let tooltipContent = `<div>${itemData.getTooltipHTML()}</div>`;

        // Check if the item is in the inventory
        const isInInventory = this.inventoryItems.some((inventoryItem) => inventoryItem?.id === itemData.id);

        // Find matching equipped items based on type
        const equippedItems = [];
        for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
          if (SLOT_REQUIREMENTS[slot].includes(itemData.type) && isInInventory) {
            equippedItems.push(equippedItem);
          }
        }

        // Add equipped items tooltips
        if (equippedItems.length > 0) {
          equippedItems.forEach((equippedItem) => {
            if (equippedItem && equippedItem.id !== itemData.id) {
              tooltipContent += `<div>${equippedItem.getTooltipHTML(true)}</div>`;
            }
          });
        }

        showTooltip(tooltipContent, e, 'flex-tooltip');
      });

      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);
    });
  }

  cleanupTooltips() {
    const tooltips = document.querySelectorAll('.item-tooltip');
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  canEquipInSlot(item, slotName) {
    return SLOT_REQUIREMENTS[slotName].includes(item.type);
  }

  getItemById(id) {
    if (!id) {
      console.error('Attempted to get item with null id');
      return null;
    }

    const inventoryItem = this.inventoryItems.find((item) => item && item.id === id);
    if (inventoryItem) return inventoryItem;

    return Object.values(this.equippedItems).find((i) => i && i.id === id);
  }

  equipItem(item, slot) {
    const currentPosition = this.inventoryItems.findIndex((i) => i && i.id === item.id);

    // Handle existing equipped item
    if (this.equippedItems[slot]) {
      const oldItem = this.equippedItems[slot];
      if (currentPosition !== -1) {
        // Put old item where new item was
        this.inventoryItems[currentPosition] = oldItem;
      } else {
        // Find first empty slot
        const emptySlot = this.inventoryItems.findIndex((slot) => slot === null);
        if (emptySlot !== -1) {
          this.inventoryItems[emptySlot] = oldItem;
        }
      }
    } else if (currentPosition !== -1) {
      // Clear the inventory slot the item came from
      this.inventoryItems[currentPosition] = null;
    }

    // Equip the new item
    this.equippedItems[slot] = item;
    hero.recalculateFromAttributes();
    game.saveGame(); // Add save
  }

  updateItemBonuses() {
    // Reset equipment bonuses
    Object.keys(this.equipmentBonuses).forEach((stat) => {
      this.equipmentBonuses[stat] = 0;
    });

    // Calculate bonuses from all equipped items
    Object.values(this.equippedItems).forEach((item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (this.equipmentBonuses[stat] !== undefined) {
          this.equipmentBonuses[stat] += value;
        }
      });
    });
  }

  sortInventory() {
    // Separate persistent and non-persistent items
    const persistentItems = this.inventoryItems.slice(0, PERSISTENT_SLOTS);
    const nonPersistentItems = this.inventoryItems.slice(PERSISTENT_SLOTS).filter((item) => item !== null);

    // Sort only non-persistent items by rarity and level
    nonPersistentItems.sort((a, b) => {
      const rarityA = RARITY_ORDER.indexOf(a.rarity);
      const rarityB = RARITY_ORDER.indexOf(b.rarity);

      if (rarityA !== rarityB) {
        return -(rarityA - rarityB);
      }
      return b.level - a.level;
    });

    // Combine persistent items with sorted non-persistent items and remaining nulls
    this.inventoryItems = [
      ...persistentItems,
      ...nonPersistentItems,
      ...new Array(ITEM_SLOTS - PERSISTENT_SLOTS - nonPersistentItems.length).fill(null),
    ];

    // Update the UI
    this.updateInventoryGrid();
    game.saveGame();
  }
}
