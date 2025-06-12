// src/buildings.js
// Core logic for buildings: state, construction, offline bonus, persistence

import { BUILDINGS as BUILDING_DEFS } from './constants/buildings.js';
import { hero } from './globals.js';
import { showToast, showConfirmDialog, updateResources } from './ui/ui.js';
import { createModal, closeModal } from './ui/modal.js';

// State: how many of each building the player owns
export let playerBuildings = BUILDING_DEFS.map((b) => ({ ...b, owned: 0 }));
export let lastOnline = Date.now();
let buildingsInterval = null;

export function buildBuilding(idx) {
  const b = playerBuildings[idx];
  // Check resources
  if (b.cost.gold && hero.gold < b.cost.gold) return false;
  if (b.cost.crystals && hero.crystals < b.cost.crystals) return false;
  if (b.cost.souls && hero.souls < b.cost.souls) return false;
  // Deduct resources
  if (b.cost.gold) hero.gold -= b.cost.gold;
  if (b.cost.crystals) hero.crystals -= b.cost.crystals;
  if (b.cost.souls) hero.souls -= b.cost.souls;
  b.owned++;
  saveBuildings();
  return true;
}

export function saveBuildings() {
  localStorage.setItem('buildings', JSON.stringify({ playerBuildings, lastOnline: Date.now() }));
}

export function loadBuildings() {
  const data = JSON.parse(localStorage.getItem('buildings'));
  if (data) {
    playerBuildings.forEach((b, i) => {
      b.owned = data.playerBuildings[i]?.owned || 0;
    });
    lastOnline = data.lastOnline || Date.now();
  }
}

export function calculateOfflineBonus() {
  const now = Date.now();
  const minutes = Math.floor((now - lastOnline) / 60000);
  let gold = 0,
    crystals = 0,
    souls = 0;
  playerBuildings.forEach((b) => {
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
  lastOnline = now;
  saveBuildings();
  return { minutes, gold, crystals, souls };
}

export function startBuildingsGeneration() {
  if (buildingsInterval) clearInterval(buildingsInterval);
  buildingsInterval = setInterval(() => {
    let gold = 0,
      crystals = 0,
      souls = 0;
    playerBuildings.forEach((b) => {
      if (b.bonus.goldPerMinute) gold += (b.bonus.goldPerMinute * b.owned) / 60;
      if (b.bonus.crystalsPerMinute) crystals += (b.bonus.crystalsPerMinute * b.owned) / 60;
      if (b.bonus.soulsPerMinute) souls += (b.bonus.soulsPerMinute * b.owned) / 60;
    });
    // Only add if at least 1 whole resource is generated
    if (gold >= 1) hero.gold += Math.floor(gold);
    if (crystals >= 1) hero.crystals += Math.floor(crystals);
    if (souls >= 1) hero.souls += Math.floor(souls);
    saveBuildings();
  }, 1000); // every second
}

export function stopBuildingsGeneration() {
  if (buildingsInterval) clearInterval(buildingsInterval);
  buildingsInterval = null;
}

export function showOfflineBonusDialog(bonus) {
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

export function resetBuildings() {
  playerBuildings.forEach((b) => (b.owned = 0));
  lastOnline = Date.now();
  saveBuildings();
}
