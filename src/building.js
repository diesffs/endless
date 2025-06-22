// Game logic and persistent state for buildings
import { buildingsData } from './constants/buildings.js';

// Represents a single building instance (with state)
export class Building {
  constructor({ id, level = 1, placedAt = null }) {
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
    this.unlockStage = data.unlockStage;
    this.cost = data.cost;
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
    };
  }
}

// Manages all buildings and their placement/state
export class BuildingManager {
  constructor(saved = null) {
    // All building instances (by id)
    this.buildings = {};
    // Map: placeholderIdx -> buildingId (or null)
    this.placedBuildings = [null, null, null];
    // Initialize from save or defaults
    for (const id in buildingsData) {
      const bSave = saved?.buildings?.[id];
      this.buildings[id] = new Building({
        id,
        level: bSave?.level || 1,
        placedAt: bSave?.placedAt ?? null,
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

  // Serialize state for saving
  toJSON() {
    const out = { buildings: {}, placedBuildings: [...this.placedBuildings] };
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
