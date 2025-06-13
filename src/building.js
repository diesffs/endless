// src/buildings.js
// Core logic for buildings: state, construction, offline bonus, persistence

import { BUILDINGS as BUILDING_DEFS } from './constants/buildings.js';
import { hero } from './globals.js';
import { showToast, showConfirmDialog, updateResources } from './ui/ui.js';
import { createModal, closeModal } from './ui/modal.js';

export default class Building {
  constructor(data) {
    data = data || {};
    this.playerBuildings = BUILDING_DEFS.map((b, i) => ({ ...b, owned: data.playerBuildings?.[i]?.owned || 0 }));
    this.lastOnline = data.lastOnline || Date.now();
    this.mapSpots = data.mapSpots || [];
    this.spotPositions = data.spotPositions || [];
    this.interval = null;
  }

  buildBuilding(idx) {
    const b = this.playerBuildings[idx];
    // Check resources
    if (b.cost.gold && hero.gold < b.cost.gold) return false;
    if (b.cost.crystals && hero.crystals < b.cost.crystals) return false;
    if (b.cost.souls && hero.souls < b.cost.souls) return false;
    // Deduct resources
    if (b.cost.gold) hero.gold -= b.cost.gold;
    if (b.cost.crystals) hero.crystals -= b.cost.crystals;
    if (b.cost.souls) hero.souls -= b.cost.souls;
    b.owned++;
    this.save();
    return true;
  }

  save() {
    localStorage.setItem(
      'buildings',
      JSON.stringify({
        playerBuildings: this.playerBuildings.map((b) => ({ owned: b.owned })),
        lastOnline: this.lastOnline,
        mapSpots: this.mapSpots,
        spotPositions: this.spotPositions,
      })
    );
  }

  load() {
    const data = JSON.parse(localStorage.getItem('buildings'));
    if (data) {
      this.playerBuildings.forEach((b, i) => {
        b.owned = data.playerBuildings?.[i]?.owned || 0;
      });
      this.lastOnline = data.lastOnline || Date.now();
      this.mapSpots = data.mapSpots || [];
      this.spotPositions = data.spotPositions || [];
    }
  }

  calculateOfflineBonus() {
    const now = Date.now();
    const minutes = Math.floor((now - this.lastOnline) / 60000);
    let gold = 0,
      crystals = 0,
      souls = 0;
    this.playerBuildings.forEach((b) => {
      if (b.bonus.goldPerMinute) gold += b.bonus.goldPerMinute * b.owned * minutes;
      if (b.bonus.crystalsPerMinute) crystals += b.bonus.crystalsPerMinute * b.owned * minutes;
      if (b.bonus.soulsPerMinute) souls += b.bonus.soulsPerMinute * b.owned * minutes;
    });
    // Only add if at least 1 whole resource is generated
    gold = Math.floor(gold);
    crystals = Math.floor(crystals);
    souls = Math.floor(souls);
    hero.gold += gold;
    hero.crystals += crystals;
    hero.souls += souls;
    this.lastOnline = now;
    this.save();
    return { minutes, gold, crystals, souls };
  }

  startGeneration() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      let gold = 0,
        crystals = 0,
        souls = 0;
      this.playerBuildings.forEach((b) => {
        if (b.bonus.goldPerMinute) gold += (b.bonus.goldPerMinute * b.owned) / 60;
        if (b.bonus.crystalsPerMinute) crystals += (b.bonus.crystalsPerMinute * b.owned) / 60;
        if (b.bonus.soulsPerMinute) souls += (b.bonus.soulsPerMinute * b.owned) / 60;
      });
      // Only add if at least 1 whole resource is generated
      if (gold >= 1) hero.gold += Math.floor(gold);
      if (crystals >= 1) hero.crystals += Math.floor(crystals);
      if (souls >= 1) hero.souls += Math.floor(souls);
      this.save();
    }, 1000); // every second
  }

  stopGeneration() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  showOfflineBonusDialog(bonus) {
    if (!bonus) return;
    const { minutes, gold, crystals, souls } = bonus;
    if (minutes <= 0 || (gold === 0 && crystals === 0 && souls === 0)) return;
    const content = `
      <div class="building-modal-content">
        <h2>Welcome Back!</h2>
        <p>While you were away (${minutes} min):</p>
        <p style="font-size:1.2em;margin:18px 0;">
          <span class="bonus-gold">+${Math.floor(gold)} gold</span><br>
          <span class="bonus-crystals">+${crystals.toFixed(2)} crystals</span><br>
          <span class="bonus-souls">+${souls.toFixed(2)} souls</span><br>
        </p>
        <button class="collect-btn">Collect</button>
      </div>
    `;
    const modal = createModal({
      id: 'offline-bonus-modal',
      className: 'building-modal',
      content,
      onClose: () => {},
    });
    modal.querySelector('.collect-btn').onclick = () => {
      closeModal('offline-bonus-modal');
      updateResources();
    };
  }

  reset() {
    this.playerBuildings.forEach((b) => (b.owned = 0));
    this.lastOnline = Date.now();
    this.mapSpots = [];
    this.spotPositions = [];
    this.save();
  }
}

export const buildings = new Building();
