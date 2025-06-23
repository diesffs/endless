// UI logic for buildings tab
// This file will handle rendering and updating the buildings tab UI.

import { buildings, dataManager } from '../globals.js';
import { createModal, closeModal } from './modal.js';

function formatEffectCurrent(effect, level) {
  if (!effect || typeof effect !== 'object') return '';
  let interval = effect.interval ? ` per ${effect.interval}` : '';
  return `+${effect.amount * level} ${effect.type}${interval}`;
}

function createBuildingCard(building) {
  const el = document.createElement('div');
  el.className = 'building-card';
  el.innerHTML = `
    <div class="building-image"><img src="${import.meta.env.BASE_URL + building.image}" alt="${
    building.name
  }" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" /></div>
    <div class="building-info">
      <div class="building-name">${building.name}</div>
      <div class="building-effect">${formatEffectCurrent(building.effect, building.level)}</div>
    </div>
  `;
  return el;
}

function showBuildingInfoModal(building, onUpgrade) {
  const refundPercent = 0.9;
  const canUpgrade = building.level < building.maxLevel;
  const refundAmount = Math.floor(refundPercent * (building.cost * ((building.level * (building.level + 1)) / 2)));
  let upgradeAmount = 1;
  let modal;

  function getMaxUpgradeAmount() {
    return building.maxLevel - building.level;
  }

  function getTotalUpgradeCost(amount) {
    // Cost for next N levels: sum of (cost * (currentLevel + 1 .. currentLevel + amount))
    let total = 0;
    for (let i = 1; i <= amount; ++i) {
      total += building.cost * (building.level + i);
    }
    return total;
  }

  function getTotalBonus(amount) {
    return building.bonusAmount * (building.level + amount) - building.bonusAmount * building.level;
  }

  function renderModalContent() {
    const maxAmt = getMaxUpgradeAmount();
    const totalCost = getTotalUpgradeCost(upgradeAmount);
    const totalBonus = getTotalBonus(upgradeAmount);
    return `
      <div class="building-modal-content">
        <button class="modal-close">×</button>
        <div class="building-info-modal-header">
          <img src="${
            import.meta.env.BASE_URL + building.image
          }" class="building-map-img building-map-img-inset building-map-img-large" style="margin-bottom: 10px;" />
          <div>
          <div class="building-name" style="font-size:1.3rem;">${building.icon || ''} ${building.name}</div>
          <div class="building-desc">${building.description}</div>
          </div>
        </div>
        <div class="building-info-modal-body">
          <div>Level: <b>${building.level}</b> / ${building.maxLevel}</div>
          <div>Current Bonus: <b>${building.bonusAmount * building.level} ${building.bonusType}</b></div>
          <div>Upgrade Amount: <b>${upgradeAmount}</b></div>
          <div>Total Upgrade Cost: <b>${totalCost}</b></div>
          <div>Bonus After Upgrade: <b>${building.bonusAmount * (building.level + upgradeAmount)} ${
      building.bonusType
    }</b> <span style="color:#aaa;font-size:0.95em;">(+${totalBonus})</span></div>
        </div>
        <div class="building-info-modal-upgrade">
          <div style="margin: 10px 0 6px 0;">Upgrade Amount:</div>
          <div class="building-upgrade-amounts">
            <button data-amt="1" class="upgrade-amt-btn${upgradeAmount === 1 ? ' selected' : ''}">+1</button>
            <button data-amt="10" class="upgrade-amt-btn${upgradeAmount === 10 ? ' selected' : ''}" ${
      maxAmt < 10 ? 'disabled' : ''
    }>+10</button>
            <button data-amt="50" class="upgrade-amt-btn${upgradeAmount === 50 ? ' selected' : ''}" ${
      maxAmt < 50 ? 'disabled' : ''
    }>+50</button>
            <button data-amt="max" class="upgrade-amt-btn${upgradeAmount === maxAmt ? ' selected' : ''}">Max</button>
          </div>
          <button class="building-upgrade-btn" style="margin-top:12px;" ${canUpgrade ? '' : 'disabled'}>Upgrade</button>
          <button class="building-sell-btn" style="margin-top:12px;background:#c84e4e; color:#fff; width:100%; border:none; border-radius:6px; padding:12px 0; font-size:1rem; font-weight:bold; cursor:pointer; box-shadow:0 2px 8px rgba(200,78,78,0.15);">Sell / Refund (+${refundAmount} gold)</button>
        </div>
      </div>
    `;
  }

  function rerenderModal() {
    modal.innerHTML = renderModalContent();
    // Re-attach event listeners
    modal.querySelectorAll('.upgrade-amt-btn').forEach((btn) => {
      btn.onclick = () => {
        let amt = btn.dataset.amt === 'max' ? getMaxUpgradeAmount() : parseInt(btn.dataset.amt);
        upgradeAmount = Math.max(1, Math.min(getMaxUpgradeAmount(), amt));
        rerenderModal();
      };
    });
    modal.querySelector('.building-upgrade-btn').onclick = () => {
      let amt = Math.min(upgradeAmount, getMaxUpgradeAmount());
      let upgraded = false;
      for (let i = 0; i < amt; ++i) {
        if (building.level < building.maxLevel) {
          if (buildings.upgradeBuilding) buildings.upgradeBuilding(building.id);
          upgraded = true;
        }
      }
      if (upgraded) renderPurchasedBuildings();
      if (upgraded && typeof onUpgrade === 'function') onUpgrade();
      if (dataManager) dataManager.saveGame();
      closeModal('building-info-modal');
    };
    modal.querySelector('.building-sell-btn').onclick = () => {
      if (typeof buildings.unplaceBuilding === 'function') buildings.unplaceBuilding(building.id);
      building.level = 0;
      if (typeof window.addGold === 'function') window.addGold(refundAmount);
      if (dataManager) dataManager.saveGame();
      renderPurchasedBuildings();
      closeModal('building-info-modal');
    };
    modal.querySelector('.modal-close').onclick = () => closeModal('building-info-modal');
  }

  modal = createModal({
    id: 'building-info-modal',
    className: 'building-modal building-info-modal',
    content: renderModalContent(),
    onClose: null,
  });
  rerenderModal();
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

function renderPurchasedBuildings() {
  const purchased = document.getElementById('purchased-buildings');
  if (!purchased) return;
  purchased.innerHTML = '';
  Object.values(buildings.buildings)
    .filter((building) => building.placedAt !== null)
    .forEach((building) => {
      purchased.appendChild(createBuildingCard(building));
    });
}

export function initializeBuildingsUI() {
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML =
    '<button id="open-buildings-map" class="building-open-map-btn">Open Buildings Map</button><div id="purchased-buildings"></div>';
  renderPurchasedBuildings();
  // Open map modal
  tab.querySelector('#open-buildings-map').onclick = showBuildingsMapModal;
}
