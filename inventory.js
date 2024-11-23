import { EQUIPMENT_SLOTS, SLOT_REQUIREMENTS } from './equipment-slots.js';
import Item, { ITEM_TYPES, RARITY } from './item.js';

export default class Inventory {
    constructor(game) {
        this.game = game;
        this.equippedItems = {};
        this.inventoryItems = new Array(200).fill(null);
        this.initializeInventoryUI();
    }

    initializeInventoryUI () {
        const inventoryGrid = document.querySelector('.inventory-grid');
        this.setupEquipmentSlots();

        const gridContainer = document.querySelector('.grid-container');
        // Create 200 empty cells (10x20 grid)
        for (let i = 0; i < 200; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gridContainer.appendChild(cell);
        }
        this.setupDragAndDrop();


        // TEST
        document.getElementById('spawn-sword').addEventListener('click', () => {
            const sword = this.createItem(ITEM_TYPES.SWORD, this.game.zone);
            this.addItemToInventory(sword);
            console.log('Created sword:', sword);
        });

        document.getElementById('spawn-armor').addEventListener('click', () => {
            const armor = this.createItem(ITEM_TYPES.ARMOR, this.game.zone);
            this.addItemToInventory(armor);
            console.log('Created armor:', armor);
        });

        document.getElementById('spawn-helmet').addEventListener('click', () => {
            const helmet = this.createItem(ITEM_TYPES.HELMET, this.game.zone);
            this.addItemToInventory(helmet);
            console.log('Created helmet:', helmet);
        });
    }

    setupInventoryDrag () {
        this.removeExistingListeners();
        const items = document.querySelectorAll('.inventory-item');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', item.dataset.itemId);
                this.cleanupTooltips(); // Also clean tooltips on drag start
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                document.querySelectorAll('.equipment-slot').forEach(slot => {
                    slot.classList.remove('valid-target', 'invalid-target');
                });
            });
        });
    }

    setupDragAndDrop () {
        this.setupInventoryDrag();
        // this.setupEquipmentSlots();
        this.setupGridCells();
    }

    setupGridCells () {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.addEventListener('dragover', this.handleDragOver.bind(this));
            cell.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    setupEquipmentSlots () {
        const slots = document.querySelectorAll('.equipment-slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', this.handleDragOver.bind(this));
            slot.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragOver (e) {
        e.preventDefault();
    }

    handleDrop (e) {
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
                    const sourceIndex = Array.from(draggedItemElement.parentNode.parentNode.children)
                        .indexOf(draggedItemElement.parentNode);

                    // Swap positions
                    this.inventoryItems[targetIndex] = this.inventoryItems[sourceIndex];
                    this.inventoryItems[sourceIndex] = null;

                    this.updateInventoryGrid();
                    this.updateEquipmentSlots();
                    this.setupItemDragAndTooltip();
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
        this.updateEquipmentSlots();
        this.setupItemDragAndTooltip();
    }

    moveItemToPosition (item, newPosition) {
        // Get current position of item
        const currentPosition = this.inventoryItems.findIndex(i => i && i.id === item.id);

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
    }

    unequipItem (item) {
        if (!item) return;

        // Remove from equipped items
        for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
            if (equippedItem.id === item.id) {
                delete this.equippedItems[slot];
                const emptySlot = this.inventoryItems.findIndex(slot => slot === null);
                if (emptySlot !== -1) {
                    this.inventoryItems[emptySlot] = item;
                }
                break;
            }
        }
    }

    getEquippedItemById (id) {
        for (const [slot, item] of Object.entries(this.equippedItems)) {
            if (item.id === id) return item;
        }
        return null;
    }

    createItem (type, level, rarity = this.generateRarity()) {
        return new Item(type, level, rarity);
    }

    generateRarity () {
        const rand = Math.random() * 100;
        let total = 0;

        for (const [rarity, config] of Object.entries(RARITY)) {
            total += config.chance;
            if (rand <= total) return rarity;
        }
        return 'NORMAL';
    }

    addItemToInventory (item, specificPosition = null) {
        if (!item) {
            console.error('Attempted to add null item to inventory');
            return;
        }

        if (specificPosition !== null && specificPosition < 200 && !this.inventoryItems[specificPosition]) {
            this.inventoryItems[specificPosition] = item;
        } else {
            const emptySlot = this.inventoryItems.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
                this.inventoryItems[emptySlot] = item;
            }
        }
        this.updateInventoryGrid();
    }

    updateInventoryGrid () {
        this.cleanupTooltips();
        this.removeExistingListeners();

        const items = document.querySelectorAll('.inventory-item');
        items.forEach(item => item.remove());

        this.inventoryItems
            .filter(item => item !== null)
            .forEach((item, index) => {
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

        this.setupDragAndDrop();
    }

    removeExistingListeners () {
        const items = document.querySelectorAll('.inventory-item');
        items.forEach(item => {
            const clone = item.cloneNode(true);
            item.parentNode.replaceChild(clone, item);
        });
    }

    setupItemDragAndTooltip () {
        this.removeExistingListeners();

        const items = document.querySelectorAll('.inventory-item');
        let activeTooltip = null;

        const removeTooltip = () => {
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }
        };

        items.forEach(item => {
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

            item.addEventListener('mouseleave', removeTooltip);

            // Clean up tooltip when mouse moves out of window
            window.addEventListener('mouseout', (e) => {
                if (e.relatedTarget === null) removeTooltip();
            });
        });
    }

    cleanupTooltips () {
        const tooltips = document.querySelectorAll('.item-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }

    canEquipInSlot (item, slotName) {
        return SLOT_REQUIREMENTS[slotName].includes(item.type);
    }

    getItemById (id) {
        if (!id) {
            console.error('Attempted to get item with null id');
            return null;
        }

        const inventoryItem = this.inventoryItems.find(item => item && item.id === id);
        if (inventoryItem) return inventoryItem;

        return Object.values(this.equippedItems).find(i => i && i.id === id);
    }

    equipItem (item, slot) {
        const currentPosition = this.inventoryItems.findIndex(i => i && i.id === item.id);

        // Handle existing equipped item
        if (this.equippedItems[slot]) {
            const oldItem = this.equippedItems[slot];
            if (currentPosition !== -1) {
                // Put old item where new item was
                this.inventoryItems[currentPosition] = oldItem;
            } else {
                // Find first empty slot
                const emptySlot = this.inventoryItems.findIndex(slot => slot === null);
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
        this.updateCharacterStats();
    }

    updateCharacterStats () {
        // Will be implemented in Stats Integration step
    }

    updateEquipmentSlots () {
        Object.entries(this.equippedItems).forEach(([slot, item]) => {
            const slotElement = document.querySelector(`[data-slot="${slot}"]`);
            if (slotElement) {
                slotElement.innerHTML = `
                    <div class="inventory-item" 
                         draggable="true" 
                         data-item-id="${item.id}"
                         style="border-color: ${RARITY[item.rarity].color}">
                        ${item.type.charAt(0)}
                    </div>
                `;
            }
        });
        this.setupItemDragAndTooltip();
    }

    updateCharacterStats () {
        // Reset equipment bonuses
        Object.keys(this.game.stats.equipmentBonuses).forEach(stat => {
            this.game.stats.equipmentBonuses[stat] = 0;
        });

        // Calculate bonuses from all equipped items
        Object.values(this.equippedItems).forEach(item => {
            Object.entries(item.stats).forEach(([stat, value]) => {
                if (this.game.stats.equipmentBonuses[stat] !== undefined) {
                    this.game.stats.equipmentBonuses[stat] += value;
                }
            });
        });

        // Recalculate all stats
        this.game.stats.recalculateStats();

        // Update UI
        this.game.hero.displayStats();
    }
}