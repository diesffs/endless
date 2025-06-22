// UI logic for buildings tab
// This file will handle rendering and updating the buildings tab UI.

import { buildingsData } from '../constants/buildings.js';
import { Building } from '../building.js';
import { buildings } from '../globals.js';

function createBuildingCard(building) {
  const el = document.createElement('div');
  el.className = 'building-card';
  el.innerHTML = `
    <div class="building-icon">${building.icon || ''}</div>
    <div class="building-info">
      <div class="building-name">${building.name}</div>
      <div class="building-desc">${building.description}</div>
      <div class="building-effect">${building.effect || ''}</div>
      <div class="building-bonus">Bonus: <b>${building.bonusAmount} ${building.bonusType}</b></div>
      <div class="building-level">Level: ${building.level || 1} / ${building.maxLevel}</div>
    </div>
  `;
  return el;
}

function showBuildingsMapModal() {
  let modal = document.createElement('div');
  modal.className = 'building-modal building-map-modal';
  modal.innerHTML = `
    <div class="building-modal-content">
      <button class="building-modal-close">×</button>
      <div class="building-map-container">
        <img src="${import.meta.env.BASE_URL}/buildings/building-map.jpg" class="building-map-img" draggable="false" />
        <div class="building-map-placeholders"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Make map draggable
  const mapContainer = modal.querySelector('.building-map-container');
  let isDragging = false,
    startX,
    startY,
    scrollLeft,
    scrollTop;
  mapContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - mapContainer.offsetLeft;
    startY = e.pageY - mapContainer.offsetTop;
    mapContainer.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapContainer.scrollLeft -= e.movementX;
    mapContainer.scrollTop -= e.movementY;
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    mapContainer.style.cursor = '';
  });

  // Add placeholders (example positions)
  const placeholders = [
    { left: '20%', top: '30%' },
    { left: '50%', top: '60%' },
    { left: '70%', top: '20%' },
  ];
  const phContainer = modal.querySelector('.building-map-placeholders');
  placeholders.forEach((pos, idx) => {
    const ph = document.createElement('div');
    ph.className = 'building-map-placeholder';
    ph.style.left = pos.left;
    ph.style.top = pos.top;
    ph.title = `Place building #${idx + 1}`;
    ph.addEventListener('click', (e) => {
      e.stopPropagation();
      showChooseBuildingModal(idx);
    });
    phContainer.appendChild(ph);
  });

  // Close modal
  modal.querySelector('.building-modal-close').onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

function showChooseBuildingModal(placeholderIdx) {
  let modal = document.createElement('div');
  modal.className = 'building-modal choose-building-modal';
  modal.innerHTML = `
    <div class="building-modal-content">
      <button class="building-modal-close">×</button>
      <h3>Choose a building to place</h3>
      <div class="choose-building-list"></div>
    </div>
  `;
  document.body.appendChild(modal);
  const list = modal.querySelector('.choose-building-list');
  Object.values(buildings.buildings).forEach((building) => {
    const el = document.createElement('div');
    el.className = 'building-card';
    el.innerHTML = `
      <div class="building-icon">${building.icon || ''}</div>
      <div class="building-info">
        <div class="building-name">${building.name}</div>
        <div class="building-desc">${building.description}</div>
      </div>
    `;
    el.onclick = () => {
      // TODO: Place building at placeholderIdx
      modal.remove();
    };
    list.appendChild(el);
  });
  modal.querySelector('.building-modal-close').onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}

export function initializeBuildingsUI() {
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML =
    '<h2>Buildings</h2><div id="purchased-buildings"></div><button id="open-buildings-map" class="building-open-map-btn">Open Buildings Map</button>';
  const purchased = document.getElementById('purchased-buildings');
  // Show purchased buildings (for now, show all as example)
  Object.values(buildings.buildings).forEach((building) => {
    purchased.appendChild(createBuildingCard(building));
  });
  // Open map modal
  tab.querySelector('#open-buildings-map').onclick = showBuildingsMapModal;
}
