import { EQUIPMENT_SLOTS, SLOT_REQUIREMENTS } from './equipment-slots.js';
import Item, { ITEM_TYPES, RARITY } from './item.js';
import { game, hero } from './main.js';
import { saveGame } from './storage.js';
import { showToast } from './toast.js';

export default class Inventory {
  constructor(game = null, savedData = null) {
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

    document
      .getElementById('salvage-normal')
      .addEventListener('click', () => this.salvageAllItems('NORMAL'));
    document
      .getElementById('salvage-magic')
      .addEventListener('click', () => this.salvageAllItems('MAGIC'));
    document
      .getElementById('salvage-rare')
      .addEventListener('click', () => this.salvageAllItems('RARE'));
    document
      .getElementById('salvage-unique')
      .addEventListener('click', () => this.salvageAllItems('UNIQUE'));
    document
      .getElementById('salvage-all')
      .addEventListener('click', () => this.salvageAllItems('ALL'));
  }

  salvageAllItems(rarity) {
    let salvagedItems = 0;
    this.inventoryItems = this.inventoryItems.map((item) => {
      if (item && (rarity === 'ALL' || item.rarity === rarity)) {
        salvagedItems++;
        return null;
      }
      return item;
    });

    if (salvagedItems > 0) {
      const message = rarity === 'ALL' ? 'all items' : `${rarity.toLowerCase()} items`;
      showToast(`Salvaged ${salvagedItems} ${message}`, 'success');
      this.updateInventoryGrid();
      saveGame();
    } else {
      const message = rarity === 'ALL' ? 'items' : `${rarity.toLowerCase()} items`;
      showToast(`No ${message} to salvage`, 'info');
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

  removeGridListeners() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach((cell) => {
      cell.removeEventListener('dragover', this.boundHandleDragOver);
      cell.removeEventListener('drop', this.boundHandleDrop);
    });
  }

  setupEquipmentSlots() {
    const slots = document.querySelectorAll('.equipment-slot');
    slots.forEach((slot) => {
      slot.addEventListener('dragover', this.handleDragOver.bind(this));
      slot.addEventListener('drop', this.handleDrop.bind(this));
    });
  }

  removeEquipmentListeners() {
    const slots = document.querySelectorAll('.equipment-slot');
    slots.forEach((slot) => {
      slot.removeEventListener('dragover', this.boundHandleDragOver);
      slot.removeEventListener('drop', this.boundHandleDrop);
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

    for (const [rarity, config] of Object.entries(RARITY)) {
      total += config.chance;
      if (rand <= total) return rarity;
    }
    return 'NORMAL';
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
                            <div class="item-icon">${item.type.charAt(0)}</div>
                            <div class="item-level">Lvl ${item.level}</div>
                        </div>
                    `;
      }
    });

    Object.entries(this.equippedItems).forEach(([slot, item]) => {
      const slotElement = document.querySelector(`[data-slot="${slot}"]`);
      if (slotElement) {
        // Find existing inventory-item if any
        const existingItem = slotElement.querySelector('.inventory-item');

        // Create new item element
        const newItem = document.createElement('div');
        newItem.className = 'inventory-item';
        newItem.draggable = true;
        newItem.dataset.itemId = item.id;
        newItem.style.borderColor = RARITY[item.rarity].color;
        newItem.textContent = item.type.charAt(0);

        // Replace or append
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

        activeTooltip = document.createElement('div');
        activeTooltip.innerHTML = itemData.getTooltipHTML();
        activeTooltip.style.position = 'absolute';
        activeTooltip.style.left = `${e.pageX + 10}px`;
        activeTooltip.style.top = `${e.pageY + 10}px`;
        document.body.appendChild(activeTooltip);
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

  updateCharacterStats() {
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
}
