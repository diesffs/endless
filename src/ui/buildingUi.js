// UI logic for buildings tab
// This file will handle rendering and updating the buildings tab UI.

import { buildingsData } from '../constants/buildings.js';
import { Building } from '../building.js';
import { buildings, dataManager } from '../globals.js';
import { createModal, closeModal } from './modal.js';

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

function showBuildingInfoModal(building, onUpgrade) {
  const canUpgrade = building.level < building.maxLevel;
  const nextLevel = canUpgrade ? building.level + 1 : building.level;
  const nextBonus = canUpgrade ? building.bonusAmount * nextLevel : building.bonusAmount * building.level;
  const upgradeCost = canUpgrade ? building.cost * nextLevel : null;
  const content = `
    <div class="building-modal-content">
      <button class="modal-close">×</button>
      <div class="building-info-modal-header">
        <img src="${
          import.meta.env.BASE_URL + building.image
        }" class="building-map-img building-map-img-inset building-map-img-large" style="margin-bottom: 10px;" />
        <div class="building-name" style="font-size:1.3rem;">${building.icon || ''} ${building.name}</div>
        <div class="building-desc">${building.description}</div>
      </div>
      <div class="building-info-modal-body">
        <div>Level: <b>${building.level}</b> / ${building.maxLevel}</div>
        <div>Current Bonus: <b>${building.bonusAmount * building.level} ${building.bonusType}</b></div>
        <div>Next Level Bonus: <b>${nextBonus} ${building.bonusType}</b></div>
        <div>Upgrade Cost (per level): <b>${building.cost}</b></div>
      </div>
      <div class="building-info-modal-upgrade">
        <div style="margin: 10px 0 6px 0;">Upgrade Amount:</div>
        <div class="building-upgrade-amounts">
          <button data-amt="1">+1</button>
          <button data-amt="10">+10</button>
          <button data-amt="50">+50</button>
          <button data-amt="max">Max</button>
        </div>
        <button class="building-upgrade-btn" style="margin-top:12px;" ${canUpgrade ? '' : 'disabled'}>Upgrade</button>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'building-info-modal',
    className: 'building-modal building-info-modal',
    content,
    onClose: null,
  });
  let upgradeAmount = 1;
  modal.querySelectorAll('.building-upgrade-amounts button').forEach((btn) => {
    btn.onclick = () => {
      upgradeAmount = btn.dataset.amt === 'max' ? building.maxLevel - building.level : parseInt(btn.dataset.amt);
    };
  });
  modal.querySelector('.building-upgrade-btn').onclick = () => {
    let amt = Math.min(upgradeAmount, building.maxLevel - building.level);
    let upgraded = false;
    for (let i = 0; i < amt; ++i) {
      if (building.level < building.maxLevel) {
        if (buildings.upgradeBuilding) buildings.upgradeBuilding(building.id);
        upgraded = true;
      }
    }
    if (upgraded && typeof onUpgrade === 'function') onUpgrade();
    if (dataManager) dataManager.saveGame();
    closeModal('building-info-modal');
  };
}

function showBuildingsMapModal() {
  const content = `
    <div class="building-modal-content">
      <button class="modal-close">×</button>
      <div class="building-map-container">
        <img src="${import.meta.env.BASE_URL}/buildings/building-map.jpg" class="building-map-img" draggable="false" />
        <div class="building-map-placeholders"></div>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'building-map-modal',
    className: 'building-modal building-map-modal',
    content,
    onClose: null,
    closeOnOutsideClick: false,
  });
  const mapContainer = modal.querySelector('.building-map-container');
  const mapImg = modal.querySelector('.building-map-img');
  const phContainer = modal.querySelector('.building-map-placeholders');
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
  const placeholders = [
    { left: 120, top: 180 },
    { left: 400, top: 350 },
    { left: 700, top: 90 },
  ];
  function renderPlaceholders() {
    phContainer.innerHTML = '';
    const placed = buildings.getPlacedBuildings();
    placeholders.forEach((pos, idx) => {
      const ph = document.createElement('div');
      ph.className = 'building-map-placeholder';
      ph.style.left = pos.left + 'px';
      ph.style.top = pos.top + 'px';
      ph.title = placed[idx] ? placed[idx].name : `Place building #${idx + 1}`;
      ph.style.position = 'absolute';
      ph.style.pointerEvents = 'auto';
      if (placed[idx]) {
        ph.classList.add('building-map-has-building');
        const img = document.createElement('img');
        img.src = import.meta.env.BASE_URL + placed[idx].image;
        img.alt = placed[idx].name;
        img.className = 'building-map-img building-map-img-inset building-map-img-large';
        img.style.cursor = 'pointer';
        img.style.pointerEvents = 'auto';
        ph.style.pointerEvents = 'auto';
        img.onclick = (e) => {
          e.stopPropagation();
          showBuildingInfoModal(placed[idx], renderPlaceholders);
        };
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
  mapImg.onload = () => {
    renderPlaceholders();
  };
  if (mapImg.complete) mapImg.onload();
}

function showChooseBuildingModal(placeholderIdx, onChoose) {
  const content = `
    <div class="building-choose-modal-content">
      <button class="modal-close">×</button>
      <h3>Choose a building to place</h3>
      <div class="choose-building-list"></div>
    </div>
  `;
  const modal = createModal({
    id: 'building-choose-modal',
    className: 'building-modal building-choose-building-modal',
    content,
    onClose: null,
  });
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
      buildings.placeBuilding(building.id, placeholderIdx);
      closeModal('building-choose-modal');
      if (typeof onChoose === 'function') onChoose();
      if (dataManager) dataManager.saveGame();
    };
    list.appendChild(el);
  });
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

// Add similar save after upgrade logic wherever upgrade is handled
