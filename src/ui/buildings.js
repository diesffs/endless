// src/ui/buildings.js
// Buildings system for Endless
// Handles building construction, offline bonus calculation, and UI

import { showToast, showConfirmDialog, updateResources } from './ui.js';
import { createModal, closeModal } from './modal.js';
import { BUILDINGS } from '../constants/buildings.js';
import { hero, buildings } from '../globals.js';

// Number of spots on the map
const NUM_SPOTS = 3;
// Use the buildings class for mapSpots and spotPositions
let mapSpots = buildings.mapSpots;
let spotPositions = buildings.spotPositions;

// --- Persistence helpers for map spots/positions ---
function saveBuildingMapState() {
  buildings.mapSpots = mapSpots;
  buildings.spotPositions = spotPositions;
  buildings.save();
}
function loadBuildingMapState() {
  buildings.load();
  mapSpots = buildings.mapSpots;
  spotPositions = buildings.spotPositions;
}

export function initializeBuildingsUI() {
  loadBuildingMapState();
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML = `
    <div id="buildings-bonus-summary"></div>
    <button id="open-building-map-btn" class="open-map-btn">Open Building Map</button>
  `;
  renderBuildingsBonusSummary();
  document.getElementById('open-building-map-btn').onclick = showBuildingsMapModal;
}

function renderBuildingsBonusSummary() {
  let totalGold = 0,
    totalCrystals = 0,
    totalSouls = 0;
  buildings.playerBuildings.forEach((b) => {
    if (b.bonus.goldPerMinute) totalGold += b.bonus.goldPerMinute * b.owned;
    if (b.bonus.crystalsPerMinute) totalCrystals += b.bonus.crystalsPerMinute * b.owned;
    if (b.bonus.soulsPerMinute) totalSouls += b.bonus.soulsPerMinute * b.owned;
  });
  // List of buildings built
  const builtList = buildings.playerBuildings
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

function showBuildingsMapModal() {
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
    },
  });
  document.getElementById('add-empty-spot-btn').onclick = () => {
    // Add a new empty spot at center
    mapSpots.push(null);
    spotPositions.push({ left: 50, top: 50 });
    renderBuildingsMap();
  };
  enableMapDragScroll();
  renderBuildingsMap();
  modal.querySelector('.modal-close').onclick = () => closeModal('buildings-map-modal');
}

function renderBuildingsMap() {
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
      const b = buildings.playerBuildings[buildingIdx];
      const def = BUILDINGS[buildingIdx];
      div.title = b.name;
      div.onclick = (ev) => {
        if (!div._dragging) showBuildingModal(buildingIdx, i);
      };
      if (b.owned > 0) {
        const img = document.createElement('img');
        img.src = def.image;
        img.alt = b.name;
        img.className = 'building-img';
        div.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'building-placeholder';
        placeholder.textContent = '?';
        div.appendChild(placeholder);
      }
      if (b.owned > 0) {
        const badge = document.createElement('span');
        badge.className = 'building-level-badge';
        badge.textContent = b.owned;
        div.appendChild(badge);
      }
    } else {
      // Empty spot: allow drag and build
      div.title = 'Empty spot';
      // Drag/click logic
      let dragStarted = false;
      let moved = false;
      let startX = 0,
        startY = 0;
      const threshold = 5; // px
      div.onmousedown = (e) => {
        dragStarted = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        function onMove(ev) {
          if (!dragStarted) return;
          const dx = (ev.clientX || 0) - startX;
          const dy = (ev.clientY || 0) - startY;
          if (!moved && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
            moved = true;
            startSpotDrag(e, i);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
          }
        }
        function onUp(ev) {
          if (!moved) {
            showBuildSelectorModal(i);
          }
          dragStarted = false;
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      };
      div.ontouchstart = (e) => {
        dragStarted = true;
        moved = false;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        function onMove(ev) {
          if (!dragStarted) return;
          const t = ev.touches[0];
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          if (!moved && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
            moved = true;
            startSpotDrag(e, i);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
          }
        }
        function onUp(ev) {
          if (!moved) {
            showBuildSelectorModal(i);
          }
          dragStarted = false;
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onUp);
        }
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onUp);
      };
      const plus = document.createElement('div');
      plus.className = 'building-placeholder';
      plus.textContent = '+';
      div.appendChild(plus);
    }
    map.appendChild(div);
  });
  // Save map state after rendering (in case of changes)
  saveBuildingMapState();
}

function enableMapDragScroll() {
  const outer = document.getElementById('buildings-map-outer');
  let isDown = false;
  let startX, startY, scrollLeft, scrollTop;
  outer.addEventListener('mousedown', (e) => {
    isDown = true;
    outer.classList.add('active');
    startX = e.pageX - outer.offsetLeft;
    startY = e.pageY - outer.offsetTop;
    scrollLeft = outer.scrollLeft;
    scrollTop = outer.scrollTop;
  });
  outer.addEventListener('mouseleave', () => {
    isDown = false;
    outer.classList.remove('active');
  });
  outer.addEventListener('mouseup', () => {
    isDown = false;
    outer.classList.remove('active');
  });
  outer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - outer.offsetLeft;
    const y = e.pageY - outer.offsetTop;
    const walkX = (x - startX) * 1.2;
    const walkY = (y - startY) * 1.2;
    outer.scrollLeft = scrollLeft - walkX;
    outer.scrollTop = scrollTop - walkY;
  });
  // Touch support
  let touchStartX = 0,
    touchStartY = 0,
    touchScrollLeft = 0,
    touchScrollTop = 0;
  outer.addEventListener('touchstart', (e) => {
    isDown = true;
    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;
    touchScrollLeft = outer.scrollLeft;
    touchScrollTop = outer.scrollTop;
  });
  outer.addEventListener('touchend', () => {
    isDown = false;
  });
  outer.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    const walkX = (x - touchStartX) * 1.2;
    const walkY = (y - touchStartY) * 1.2;
    outer.scrollLeft = touchScrollLeft - walkX;
    outer.scrollTop = touchScrollTop - walkY;
  });
}

function startSpotDrag(e, spotIdx) {
  e.preventDefault();
  const map = document.getElementById('buildings-map');
  const spot = map.querySelector(`[data-spot-idx='${spotIdx}']`);
  spot._dragging = true;
  // Disable map drag scroll while dragging a spot
  const mapOuter = document.getElementById('buildings-map-outer');
  mapOuter.style.pointerEvents = 'none';
  let startX, startY, startLeft, startTop;
  if (e.touches) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else {
    startX = e.clientX;
    startY = e.clientY;
  }
  startLeft = spotPositions[spotIdx].left;
  startTop = spotPositions[spotIdx].top;

  function onMove(ev) {
    let clientX, clientY;
    if (ev.touches) {
      clientX = ev.touches[0].clientX;
      clientY = ev.touches[0].clientY;
    } else {
      clientX = ev.clientX;
      clientY = ev.clientY;
    }
    const dx = clientX - startX;
    const dy = clientY - startY;
    // Convert pixel movement to percent of map size
    const mapW = map.offsetWidth;
    const mapH = map.offsetHeight;
    let newLeft = startLeft + (dx / mapW) * 100;
    let newTop = startTop + (dy / mapH) * 100;
    // Clamp to [0, 100]
    newLeft = Math.max(0, Math.min(100, newLeft));
    newTop = Math.max(0, Math.min(100, newTop));
    spotPositions[spotIdx] = { left: newLeft, top: newTop };
    renderBuildingsMap();
  }
  function onUp(ev) {
    spot._dragging = false;
    // Re-enable map drag scroll
    mapOuter.style.pointerEvents = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('touchend', onUp);
}

function showBuildSelectorModal(spotIdx) {
  // Only show buildings not already assigned to a spot
  const assigned = new Set(mapSpots.filter((x) => x !== null));
  let options = BUILDINGS.map((b, i) =>
    !assigned.has(i)
      ? `<button class="build-choice-btn" data-idx="${i}"><img src="${b.image}" alt="${b.name}" style="width:32px;height:32px;vertical-align:middle;margin-right:8px;">${b.name}</button>`
      : ''
  ).join('');
  if (!options) options = '<div style="color:#888">All buildings placed</div>';
  const content = `
    <div class="building-modal-content">
      <button class="modal-close" style="float:right">&times;</button>
      <h2>Select Building</h2>
      <div style="margin:18px 0;">${options}</div>
    </div>
  `;
  const modal = createModal({
    id: 'build-choice-modal',
    className: 'building-modal',
    content,
    onClose: () => {},
  });
  modal.querySelectorAll('.build-choice-btn').forEach((btn) => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx, 10);
      closeModal('build-choice-modal');
      showBuildingModal(idx, spotIdx, true); // pass true to indicate this is a new placement
    };
  });
  modal.querySelector('.modal-close').onclick = () => closeModal('build-choice-modal');
}

function showBuildingModal(idx, spotIdx, isPlacing = false) {
  const b = buildings.playerBuildings[idx];
  const def = BUILDINGS[idx];
  let purchased = false;
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
      <button id="remove-building-btn" class="remove-building-btn" style="margin-top:18px;">Remove Building (75% refund)</button>
    </div>
  `;
  const modal = createModal({
    id: 'building-modal',
    className: 'building-modal',
    content,
    onClose: () => {
      // Only assign to spot if at least 1 was purchased during this modal session
      if (isPlacing && purchased && typeof spotIdx === 'number') {
        mapSpots[spotIdx] = idx;
        renderBuildingsMap();
      }
    },
  });
  modal.querySelectorAll('.modal-controls button').forEach((btn) => {
    btn.onclick = () => {
      let qty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
      const before = b.owned;
      handleBulkBuild(idx, qty);
      if (b.owned > before) {
        purchased = true;
        if (isPlacing && typeof spotIdx === 'number') {
          closeModal('building-modal'); // close immediately after purchase
        } else {
          renderBuildingsMap();
        }
      }
    };
  });
  modal.querySelector('.modal-close').onclick = () => closeModal('building-modal');
  // Remove building logic
  const removeBtn = modal.querySelector('#remove-building-btn');
  if (removeBtn) {
    removeBtn.onclick = () => {
      if (b.owned > 0 && typeof spotIdx === 'number') {
        // Calculate total cost for all levels
        let refund = { gold: 0, crystals: 0, souls: 0 };
        for (const [k, v] of Object.entries(b.cost)) {
          refund[k] = Math.floor(v * b.owned * 0.75);
        }
        // Refund resources
        if (refund.gold) playerBuildings[idx].gold = (playerBuildings[idx].gold || 0) + refund.gold;
        if (refund.crystals) playerBuildings[idx].crystals = (playerBuildings[idx].crystals || 0) + refund.crystals;
        if (refund.souls) playerBuildings[idx].souls = (playerBuildings[idx].souls || 0) + refund.souls;
        // Actually, refund to hero
        if (refund.gold) hero.gold += refund.gold;
        if (refund.crystals) hero.crystals += refund.crystals;
        if (refund.souls) hero.souls += refund.souls;
        // Reset building
        b.owned = 0;
        // Remove from map
        mapSpots[spotIdx] = null;
        closeModal('building-modal');
        renderBuildingsMap();
        showToast(
          `Building removed. Refunded: ${refund.gold || 0} gold, ${refund.crystals || 0} crystals, ${
            refund.souls || 0
          } souls.`,
          'normal'
        );
        updateResources && updateResources();
      }
    };
  }
}

// Bulk build handler for modal controls
function handleBulkBuild(idx, qty) {
  const b = buildings.playerBuildings[idx];
  let built = 0;
  let maxQty = qty === 'max' ? 9999 : qty;
  for (let i = 0; i < maxQty; i++) {
    // Try to build, stop if not enough resources
    if (!buildings.buildBuilding(idx)) break;
    built++;
  }
  if (built > 0) {
    showToast(`Built ${built} ${b.name}${built > 1 ? 's' : ''}.`, 'normal');
    updateResources && updateResources();
    renderBuildingsBonusSummary();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadBuildingMapState();
});
