// Game logic and persistent state for buildings
import { buildingsData } from './constants/buildings.js';
import { dataManager, hero } from './globals.js';
import { updateResources } from './ui/ui.js';
import { showOfflineBonusesModal } from './ui/buildingUi.js';

// Represents a single building instance (with state)
export class Building {
  constructor({ id, level = 0, placedAt = null, lastBonusTime = null }) {
    const data = buildingsData[id];
    if (!data) throw new Error(`Unknown building id: ${id}`);
    this.id = id;
    this.level = level;
    this.placedAt = placedAt; // index of map placeholder, or null if not placed
    // Copy static data
    this.name = data.name;
    this.description = data.description;
    this.icon = data.icon;
    this.image = data.image;
    this.effect = data.effect;
    this.maxLevel = data.maxLevel;
    this.bonusType = data.bonusType;
    this.bonusAmount = data.bonusAmount;
    this.cost = data.cost;
    // Track last bonus time for this building
    this.lastBonusTime = lastBonusTime || Date.now();
  }

  upgrade() {
    if (this.level < this.maxLevel) {
      this.level++;
      return true;
    }
    return false;
  }

  // Returns the current effect value based on level
  getEffectValue() {
    // Example: effect scales linearly with level
    return this.bonusAmount * this.level;
  }

  // Returns a serializable object
  toJSON() {
    return {
      id: this.id,
      level: this.level,
      placedAt: this.placedAt,
      lastBonusTime: this.lastBonusTime,
    };
  }
}

// Helper to convert interval string to ms
function intervalToMs(interval) {
  if (!interval) return 0;
  if (interval === 'minute') return 60 * 1000;
  if (interval === 'hour') return 60 * 60 * 1000;
  if (interval.endsWith('min')) return parseInt(interval) * 60 * 1000;
  if (interval.endsWith('sec')) return parseInt(interval) * 1000;
  return 0;
}

export class BuildingManager {
  constructor(saved = null) {
    // All building instances (by id)
    this.buildings = {};
    // Map: placeholderIdx -> buildingId (or null)
    this.placedBuildings = [null, null, null];
    // Track last active time for offline bonus
    this.lastActive = saved?.lastActive || Date.now();
    for (const id in buildingsData) {
      const bSave = saved?.buildings?.[id];
      this.buildings[id] = new Building({
        id,
        level: bSave?.level || 1,
        placedAt: bSave?.placedAt ?? null,
        lastBonusTime: bSave?.lastBonusTime || this.lastActive,
      });
      if (this.buildings[id].placedAt !== null) {
        this.placedBuildings[this.buildings[id].placedAt] = id;
      }
    }
  }

  // Place a building at a map placeholder (returns true if successful)
  placeBuilding(buildingId, placeholderIdx) {
    // Remove any building currently at this spot
    const prevId = this.placedBuildings[placeholderIdx];
    if (prevId) this.buildings[prevId].placedAt = null;
    // Remove this building from any previous spot
    const b = this.buildings[buildingId];
    if (b.placedAt !== null) this.placedBuildings[b.placedAt] = null;
    b.placedAt = placeholderIdx;
    this.placedBuildings[placeholderIdx] = buildingId;
    // Set lastBonusTime to now when placed
    b.lastBonusTime = Date.now();
  }

  // Remove a building from the map
  unplaceBuilding(buildingId) {
    const b = this.buildings[buildingId];
    if (b.placedAt !== null) {
      this.placedBuildings[b.placedAt] = null;
      b.placedAt = null;
    }
  }

  // Upgrade a building
  upgradeBuilding(buildingId) {
    return this.buildings[buildingId].upgrade();
  }

  // Get building at a map placeholder
  getBuildingAt(placeholderIdx) {
    const id = this.placedBuildings[placeholderIdx];
    return id ? this.buildings[id] : null;
  }

  // Get all placed buildings
  getPlacedBuildings() {
    return this.placedBuildings.map((id, idx) => (id ? this.buildings[id] : null));
  }

  // Get all buildings (array)
  getAllBuildings() {
    return Object.values(this.buildings);
  }

  // --- Bonus collection logic ---
  collectBonuses({ showOfflineModal = false } = {}) {
    const now = Date.now();
    let offlineBonuses = [];
    const isFirstCollect = showOfflineModal;
    for (const b of this.getPlacedBuildings()) {
      if (!b || b.level <= 0) continue;
      const intervalMs = intervalToMs(b.effect?.interval);
      if (!intervalMs) continue;
      let times = Math.floor((now - b.lastBonusTime) / intervalMs);
      if (times > 0) {
        const totalBonus = b.effect.amount * b.level * times;
        if (isFirstCollect) {
          offlineBonuses.push({
            name: b.name,
            type: b.effect.type,
            amount: totalBonus,
            times,
            interval: b.effect.interval,
            icon: b.icon,
            building: b,
            timesRaw: times,
            intervalMs,
          });
        } else {
          // Online collection: add instantly
          if (b.effect.type === 'gold') hero.gainGold(totalBonus);
          else if (b.effect.type === 'crystal') hero.gainCrystals(totalBonus);
          else if (b.effect.type === 'soul') hero.gainSouls(totalBonus);
          b.lastBonusTime += times * intervalMs;
        }
      }
    }
    if (isFirstCollect && offlineBonuses.length > 0) {
      // Only show modal if there are actual bonuses to collect
      showOfflineBonusesModal(offlineBonuses, () => {
        // On collect: actually add the bonuses and update lastBonusTime
        for (const b of offlineBonuses) {
          if (b.type === 'gold') hero.gainGold(b.amount);
          else if (b.type === 'crystal') hero.gainCrystals(b.amount);
          else if (b.type === 'soul') hero.gainSouls(b.amount);
          b.building.lastBonusTime += b.timesRaw * b.intervalMs;
        }
        this.lastActive = Date.now();
        updateResources();
      });
    } else if (!isFirstCollect) {
      this.lastActive = now;
      updateResources();
    }
    dataManager.saveGame(); // Save after collecting bonuses
  }

  // Serialize state for saving
  toJSON() {
    const out = { buildings: {}, placedBuildings: [...this.placedBuildings], lastActive: this.lastActive };
    for (const id in this.buildings) {
      out.buildings[id] = this.buildings[id].toJSON();
    }
    return out;
  }

  // Static: load from JSON
  static fromJSON(json) {
    return new BuildingManager(json);
  }
}

// You can add more helpers for effects, collection, etc. as needed.
