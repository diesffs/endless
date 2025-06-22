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

// Track which building is placed at each placeholder index
const placedBuildings = [null, null, null]; // index: placeholderIdx, value: buildingId

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

  const mapContainer = modal.querySelector('.building-map-container');
  const mapImg = modal.querySelector('.building-map-img');
  const phContainer = modal.querySelector('.building-map-placeholders');

  // Make map draggable
  let isDragging = false,
    startX,
    startY;
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

  // Placeholders: pixel positions relative to the map image
  const placeholders = [
    { left: 120, top: 180 }, // px
    { left: 400, top: 350 },
    { left: 700, top: 90 },
  ];

  // Helper to render placeholders (with building icons if placed)
  function renderPlaceholders() {
    phContainer.innerHTML = '';
    placeholders.forEach((pos, idx) => {
      const ph = document.createElement('div');
      ph.className = 'building-map-placeholder';
      ph.style.left = pos.left + 'px';
      ph.style.top = pos.top + 'px';
      ph.title = placedBuildings[idx] ? buildings.buildings[placedBuildings[idx]].name : `Place building #${idx + 1}`;
      ph.style.position = 'absolute';
      ph.style.pointerEvents = 'auto';
      // If a building is placed, show its image and remove the placeholder background
      if (placedBuildings[idx]) {
        ph.classList.add('building-map-has-building');
        ph.style.pointerEvents = 'none';
        const img = document.createElement('img');
        img.src = import.meta.env.BASE_URL + buildings.buildings[placedBuildings[idx]].image;
        img.alt = buildings.buildings[placedBuildings[idx]].name;
        img.className = 'building-map-img building-map-img-inset building-map-img-large';
        ph.appendChild(img);
      } else {
        ph.addEventListener('click', (e) => {
          e.stopPropagation();
          showChooseBuildingModal(idx, renderPlaceholders);
        });
      }
      phContainer.appendChild(ph);
    });
  }

  // Wait for image to load to get natural size
  mapImg.onload = () => {
    phContainer.style.width = mapImg.naturalWidth + 'px';
    phContainer.style.height = mapImg.naturalHeight + 'px';
    phContainer.style.position = 'absolute';
    phContainer.style.top = '0';
    phContainer.style.left = '0';
    phContainer.style.pointerEvents = 'none';
    renderPlaceholders();
  };
  // If already loaded (cache), trigger manually
  if (mapImg.complete) mapImg.onload();

  // Close modal
  modal.querySelector('.building-modal-close').onclick = () => modal.remove();
  // Remove closing on background click
  // modal.onclick = (e) => {
  //   if (e.target === modal) modal.remove();
  // };
}

function showChooseBuildingModal(placeholderIdx, onChoose) {
  let modal = document.createElement('div');
  modal.className = 'building-modal building-choose-building-modal';
  modal.innerHTML = `
    <div class="building-choose-modal-content">
      <button class="building-choose-modal-close">×</button>
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
      // Place building at placeholderIdx
      placedBuildings[placeholderIdx] = building.id;
      modal.remove();
      if (typeof onChoose === 'function') onChoose();
    };
    list.appendChild(el);
  });
  modal.querySelector('.building-choose-modal-close').onclick = () => modal.remove();
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
