// Business/game logic for buildings
// This file will contain the Building class and related logic for how buildings work in the game.

import { buildingsData } from './constants/buildings.js';

export class Building {
  constructor({ id, name, description, icon, ...props }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    Object.assign(this, props);
  }

  // Example: upgrade logic
  upgrade() {
    // Implement upgrade logic here
  }

  // Example: collect resource logic
  collect() {
    // Implement resource collection logic here
  }
}

// Singleton to manage all player buildings and their state
export class BuildingManager {
  constructor(savedBuildings = null) {
    // Initialize buildings from data or saved state
    this.buildings = {};
    for (const [id, data] of Object.entries(buildingsData)) {
      // If saved data exists, merge it
      this.buildings[id] = new Building({ ...data, ...(savedBuildings?.[id] || {}) });
    }
  }

  get(id) {
    return this.buildings[id];
  }

  toJSON() {
    // Serialize only relevant state (not methods)
    const out = {};
    for (const [id, building] of Object.entries(this.buildings)) {
      out[id] = { ...building };
      // Remove methods from serialization
      delete out[id].upgrade;
      delete out[id].collect;
    }
    return out;
  }
}

// You can add more building-related logic and helpers here.
