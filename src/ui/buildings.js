// src/ui/buildings.js
// Buildings system for Endless
// Handles building construction, offline bonus calculation, and UI

import { hero } from '../globals.js';
import {
  playerBuildings,
  buildBuilding as coreBuildBuilding,
  calculateOfflineBonus as coreCalculateOfflineBonus,
} from '../buildings.js';
import { showToast, showConfirmDialog, updateResources } from './ui.js';
import { createModal, closeModal } from './modal.js';
import { BUILDINGS } from '../constants/buildings.js';

export function initializeBuildingsUI() {
  // Find the buildings tab panel in the main content
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML = `<h2>Buildings</h2><div id="buildings-list"></div><div id="offline-bonus"></div>`;
  renderBuildings();
  renderOfflineBonus();
}

function renderBuildings() {
  const list = document.getElementById('buildings-list');
  list.innerHTML = '';
  playerBuildings.forEach((b, idx) => {
    const btn = document.createElement('button');
    btn.textContent = `Build ${b.name} (${b.owned})`;
    btn.classList.add(b.id); // Add class for color styling
    btn.onclick = () => showBuildingModal(idx);
    list.appendChild(btn);
  });
}

function showBuildingModal(idx) {
  const b = playerBuildings[idx];
  const def = BUILDINGS[idx];
  // Calculate current and next level bonuses (show as hourly rate)
  let currentBonus = '';
  let nextBonus = '';
  if (b.bonus.goldPerMinute) {
    currentBonus += `+${b.bonus.goldPerMinute * b.owned * 60} gold/hour`;
    nextBonus += `+${b.bonus.goldPerMinute * (b.owned + 1) * 60} gold/hour`;
  }
  if (b.bonus.crystalsPerMinute) {
    currentBonus += `${currentBonus ? ', ' : ''}+${(b.bonus.crystalsPerMinute * b.owned * 60).toFixed(
      2
    )} crystals/hour`;
    nextBonus += `${nextBonus ? ', ' : ''}+${(b.bonus.crystalsPerMinute * (b.owned + 1) * 60).toFixed(
      2
    )} crystals/hour`;
  }
  if (b.bonus.soulsPerMinute) {
    currentBonus += `${currentBonus ? ', ' : ''}+${(b.bonus.soulsPerMinute * b.owned * 60).toFixed(2)} souls/hour`;
    nextBonus += `${nextBonus ? ', ' : ''}+${(b.bonus.soulsPerMinute * (b.owned + 1) * 60).toFixed(2)} souls/hour`;
  }
  let costStr = Object.entries(b.cost)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');

  const content = `
    <div class="building-modal-content ${b.id}">
      <button class="modal-close" style="float:right">&times;</button>
      <h2>${b.name}</h2>
      <p><i>${def.description || ''}</i></p>
      <p><b>Current Bonus:</b> ${currentBonus || 'None yet'}</p>
      <p><b>Next Level Bonus:</b> ${nextBonus}</p>
      <p><b>Cost:</b> ${costStr}</p>
      <p><b>Level:</b> ${b.owned}</p>
      <div class="modal-controls">
        <button data-qty="1">Build 1</button>
        <button data-qty="10">Build 10</button>
        <button data-qty="50">Build 50</button>
        <button data-qty="max">Build Max</button>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'building-modal',
    className: 'building-modal',
    content,
    onClose: () => {},
  });
  modal.querySelectorAll('.modal-controls button').forEach((btn) => {
    btn.onclick = () => {
      let qty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
      handleBulkBuild(idx, qty);
      closeModal('building-modal');
      renderBuildings();
    };
  });
}

function handleBulkBuild(idx, qty) {
  let built = 0;
  for (let i = 0; i < (qty === 'max' ? 9999 : qty); i++) {
    if (!coreBuildBuilding(idx)) break;
    built++;
    if (qty === 'max' && built > 9999) break;
  }
  if (built > 0) {
    showToast(`Built ${built} ${playerBuildings[idx].name}${built > 1 ? 's' : ''}!`, 'normal');
    updateResources();
  } else {
    showToast('Not enough resources!', 'error');
  }
}

function renderOfflineBonus() {
  const bonus = coreCalculateOfflineBonus();
  document.getElementById(
    'offline-bonus'
  ).textContent = `While you were away (${bonus.minutes} min): +${bonus.gold} gold, +${bonus.crystals} crystals, +${bonus.souls} souls`;
}
