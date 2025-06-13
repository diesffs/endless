// src/ui/buildingUi.js
// Building system for Endless
// Handles building construction, offline bonus calculation, and UI

import { showToast, showConfirmDialog, updateResources } from './ui.js';
import { createModal, closeModal } from './modal.js';
import { BUILDINGS } from '../constants/buildings.js';
import { hero, building } from '../globals.js';

// Number of spots on the map
const NUM_SPOTS = 3;

// --- Persistence helpers for map spots/positions ---
function saveBuildingMapState(mapSpots, spotPositions) {
  building.mapSpots = mapSpots;
  building.spotPositions = spotPositions;
  building.save();
}
function loadBuildingMapState() {
  building.load();
  return {
    mapSpots: building.mapSpots,
    spotPositions: building.spotPositions,
  };
}

export function initializeBuildingsUI() {
  const { mapSpots, spotPositions } = loadBuildingMapState();
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML = `
    <div id="buildings-bonus-summary"></div>
    <button id="open-building-map-btn" class="open-map-btn">Open Building Map</button>
  `;
  renderBuildingsBonusSummary();
  document.getElementById('open-building-map-btn').onclick = () => showBuildingsMapModal(mapSpots, spotPositions);
}

function renderBuildingsBonusSummary() {
  let totalGold = 0,
    totalCrystals = 0,
    totalSouls = 0;
  building.playerBuildings.forEach((b) => {
    if (b.bonus.goldPerMinute) totalGold += b.bonus.goldPerMinute * b.owned;
    if (b.bonus.crystalsPerMinute) totalCrystals += b.bonus.crystalsPerMinute * b.owned;
    if (b.bonus.soulsPerMinute) totalSouls += b.bonus.soulsPerMinute * b.owned;
  });
  // List of buildings built
  const builtList = building.playerBuildings
    .map((b) =>
      b.owned > 0
        ? `<div class="built-building-row"><span class="built-building-name">${b.name}</span> <span class="built-building-level">Lv. ${b.owned}</span></div>`
        : ''
    )
    .filter(Boolean)
    .join('');
  const summary = `
    <div class="bonus-summary">
      <b>Current Bonuses:</b>
      <span class="bonus-gold gold-color">+${totalGold} gold/min</span>
      <span class="bonus-crystals crystals-color">+${totalCrystals.toFixed(2)} crystals/min</span>
      <span class="bonus-souls souls-color">+${totalSouls.toFixed(2)} souls/min</span>
    </div>
    <div class="built-buildings-list">
      ${builtList || '<span class="built-building-none">No buildings constructed yet.</span>'}
    </div>
  `;
  document.getElementById('buildings-bonus-summary').innerHTML = summary;
}

function showBuildingsMapModal(mapSpots, spotPositions) {
  // Defensive copy for modal session
  mapSpots = mapSpots ? [...mapSpots] : [];
  spotPositions = spotPositions ? [...spotPositions] : [];
  // Remove all empty spots before opening (keep only placed buildings)
  for (let i = mapSpots.length - 1; i >= 0; i--) {
    if (mapSpots[i] === null) {
      mapSpots.splice(i, 1);
      spotPositions.splice(i, 1);
    }
  }
  const content = `
    <div id="buildings-map-modal-content">
      <button class="modal-close" style="float:right">&times;</button>
      <h2>Building Map</h2>
      <button id="add-empty-spot-btn" class="add-spot-btn">Add Empty Spot</button>
      <div id="buildings-map-outer">
        <div id="buildings-map-container">
          <div id="buildings-map"></div>
        </div>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'buildings-map-modal',
    className: 'building-modal',
    content,
    onClose: () => {
      // Remove all empty spots when closing
      for (let i = mapSpots.length - 1; i >= 0; i--) {
        if (mapSpots[i] === null) {
          mapSpots.splice(i, 1);
          spotPositions.splice(i, 1);
        }
      }
      saveBuildingMapState(mapSpots, spotPositions);
    },
  });
  document.getElementById('add-empty-spot-btn').onclick = () => {
    // Add a new empty spot at center
    mapSpots.push(null);
    spotPositions.push({ left: 50, top: 50 });
    renderBuildingsMap(mapSpots, spotPositions);
  };
  enableMapDragScroll();
  renderBuildingsMap(mapSpots, spotPositions);
  modal.querySelector('.modal-close').onclick = () => closeModal('buildings-map-modal');
}

function renderBuildingsMap(mapSpots, spotPositions) {
  const map = document.getElementById('buildings-map');
  map.innerHTML = '';
  spotPositions.forEach((spot, i) => {
    const buildingIdx = mapSpots[i];
    const div = document.createElement('div');
    div.className = 'building-spot';
    div.style.left = spot.left + '%';
    div.style.top = spot.top + '%';
    div.setAttribute('data-spot-idx', i);
    div.style.position = 'absolute';
    div.draggable = false;
    if (buildingIdx != null) {
      // Occupied spot: no drag, only click
      const b = building.playerBuildings[buildingIdx];
      const def = BUILDINGS[buildingIdx];
      div.title = b.name;
      div.onclick = (ev) => {
        if (!div._dragging) showBuildingModal(buildingIdx, i, mapSpots, spotPositions);
      };
      // ...existing code for displaying image, placeholder, badge, etc...
    } else {
      // ...existing code for empty spot...
    }
    map.appendChild(div);
  });
  // Save map state after rendering (in case of changes)
  saveBuildingMapState(mapSpots, spotPositions);
}
