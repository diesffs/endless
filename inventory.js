import { SLOT_REQUIREMENTS } from './equipment-slots.js';
import Item, { ITEM_RARITY, RARITY_ORDER } from './item.js';
import { hero } from './main.js';
import { saveGame } from './storage.js';
import { showToast } from './toast.js';

export default class Inventory {
  constructor(savedData = null) {
    this.equippedItems = savedData?.equippedItems || {};
    this.inventoryItems = savedData?.inventoryItems || new Array(200).fill(null);

    if (savedData) {
      // Restore equipped items
      Object.entries(this.equippedItems).forEach(([slot, item]) => {
        if (item) {
          this.equippedItems[slot] = new Item(item.type, item.level, item.rarity, item.stats);
          this.equippedItems[slot].id = item.id;
        }
      });

      // Restore inventory items
      this.inventoryItems = this.inventoryItems.map((item) => {
        if (item) {
          const restoredItem = new Item(item.type, item.level, item.rarity, item.stats);
          restoredItem.id = item.id;
          return restoredItem;
        }
        return null;
      });
    }

    this.initializeInventoryUI();

    this.removeTooltip = this.removeTooltip.bind(this);
    window.addEventListener('mouseout', (e) => {
      if (e.relatedTarget === null) this.removeTooltip();
    });
  }

  initializeInventoryUI() {
    const gridContainer = document.querySelector('.grid-container');
    // Create 200 empty cells (10x20 grid)
    for (let i = 0; i < 200; i++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      gridContainer.appendChild(cell);
    }
    this.updateInventoryGrid();

    document.getElementById('salvage-normal').addEventListener('click', () => {
      this.salvageItemsByRarity(ITEM_RARITY.NORMAL.name);
      this.sortInventory();
    });
    document.getElementById('salvage-magic').addEventListener('click', () => {
      this.salvageItemsByRarity(ITEM_RARITY.MAGIC.name);
      this.sortInventory();
    });
    document.getElementById('salvage-rare').addEventListener('click', () => {
      this.salvageItemsByRarity(ITEM_RARITY.RARE.name);
      this.sortInventory();
    });
    document.getElementById('salvage-unique').addEventListener('click', () => {
      this.salvageItemsByRarity(ITEM_RARITY.UNIQUE.name);
      this.sortInventory();
    });
  }

  salvageItemsByRarity(rarity) {
    let salvagedItems = 0;
    const salvageRarities = RARITY_ORDER.slice(0, RARITY_ORDER.indexOf(rarity) + 1);

    this.inventoryItems = this.inventoryItems.map((item) => {
      if (item && salvageRarities.includes(item.rarity)) {
        salvagedItems++;
        return null;
      }
      return item;
    });

    if (salvagedItems > 0) {
      showToast(`Salvaged ${salvagedItems} ${rarity.toLowerCase()} or lower items`, 'success');
      this.updateInventoryGrid();
      saveGame();
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

    if (!item) {
      if (cell) {
        const targetIndex = Array.from(cell.parentNode.children).indexOf(cell);
        const draggedItemElement = document.querySelector('.dragging');
        if (draggedItemElement) {
          const sourceIndex = Array.from(draggedItemElement.parentNode.parentNode.children).indexOf(
            draggedItemElement.parentNode
          );

          // Swap positions
          this.inventoryItems[targetIndex] = this.inventoryItems[sourceIndex];
          this.inventoryItems[sourceIndex] = null;

          this.updateInventoryGrid();
        }
      }
      return;
    }

    if (slot) {
      if (this.canEquipInSlot(item, slot.dataset.slot)) {
        this.equipItem(item, slot.dataset.slot);
      }
    } else if (cell) {
      const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
      this.moveItemToPosition(item, cellIndex);
    }

    this.updateInventoryGrid();
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
    saveGame(); // Add save
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

    if (
      specificPosition !== null &&
      specificPosition < 200 &&
      !this.inventoryItems[specificPosition]
    ) {
      this.inventoryItems[specificPosition] = item;
    } else {
      const emptySlot = this.inventoryItems.findIndex((slot) => slot === null);
      if (emptySlot !== -1) {
        this.inventoryItems[emptySlot] = item;
      }
    }
    this.updateInventoryGrid();
    saveGame(); // Add save
  }

  updateInventoryGrid() {
    this.cleanupTooltips();

    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach((cell) => (cell.innerHTML = ''));

    const items = document.querySelectorAll('.inventory-item');
    items.forEach((item) => item.remove());

    this.inventoryItems.forEach((item, index) => {
      const cell = document.querySelector(`.grid-cell:nth-child(${index + 1})`);
      if (cell && item) {
        cell.innerHTML = `
          <div class="inventory-item rarity-${item.rarity.toLowerCase()}" 
               draggable="true" 
               data-item-id="${item.id}">
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
    let activeTooltip = null;

    items.forEach((item) => {
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

        const tooltipContainer = document.createElement('div');
        tooltipContainer.style.position = 'absolute';
        tooltipContainer.style.left = `${e.pageX + 10}px`;
        tooltipContainer.style.top = `${e.pageY + 10}px`;
        tooltipContainer.style.display = 'flex';
        tooltipContainer.style.gap = '10px';

        // Main item tooltip
        const mainTooltip = document.createElement('div');
        mainTooltip.innerHTML = itemData.getTooltipHTML();
        tooltipContainer.appendChild(mainTooltip);

        // Find matching equipped items based on type
        const equippedItems = [];
        for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
          if (SLOT_REQUIREMENTS[slot].includes(itemData.type)) {
            equippedItems.push(equippedItem);
          }
        }

        // Add equipped items tooltips
        if (equippedItems.length > 0) {
          equippedItems.forEach((equippedItem) => {
            if (equippedItem && equippedItem.id !== itemData.id) {
              const equippedTooltip = document.createElement('div');
              equippedTooltip.innerHTML = equippedItem.getTooltipHTML(true);
              tooltipContainer.appendChild(equippedTooltip);
            }
          });
        }

        document.body.appendChild(tooltipContainer);
      });

      item.addEventListener('mouseleave', () => this.removeTooltip());
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
    saveGame(); // Add save
  }

  updateItemBonuses() {
    // Reset equipment bonuses
    Object.keys(hero.equipmentBonuses).forEach((stat) => {
      hero.equipmentBonuses[stat] = 0;
    });

    // Calculate bonuses from all equipped items
    Object.values(this.equippedItems).forEach((item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (hero.equipmentBonuses[stat] !== undefined) {
          hero.equipmentBonuses[stat] += value;
        }
      });
    });
  }

  sortInventory() {
    // Filter out null values and sort items
    const items = this.inventoryItems.filter((item) => item !== null);

    // Sort by rarity (UNIQUE -> NORMAL) and then by level
    items.sort((a, b) => {
      // Compare rarity first
      const rarityA = RARITY_ORDER.indexOf(a.rarity);
      const rarityB = RARITY_ORDER.indexOf(b.rarity);

      if (rarityA !== rarityB) {
        // Higher rarity (lower index) comes first
        return -(rarityA - rarityB);
      }

      // If same rarity, sort by level (higher level first)
      return b.level - a.level;
    });

    // Fill sorted items back into inventory, with nulls at the end
    this.inventoryItems = [...items, ...new Array(200 - items.length).fill(null)];

    // Update the UI
    this.updateInventoryGrid();
    saveGame();
  }
}
