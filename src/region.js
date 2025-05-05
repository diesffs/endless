// Region system for the game
// Handles region data, selection, unlocking, and UI

import { game, hero } from './globals.js';
import { showConfirmDialog } from './ui.js';
import Enemy from './enemy.js';
// Tooltip imports
import { showTooltip, positionTooltip, hideTooltip } from './ui.js';

export const REGIONS = [
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'A mystical forest teeming with elemental creatures.',
    allowedElements: ['fire', 'cold', 'air', 'earth'],
    enemyNames: [
      'Shadowclaw',
      'Dreadfang',
      'Grimspike',
      'Stormbringer',
      'Frostbite',
      'Mistwalker',
      'Stormrage',
      'Frostweaver',
      'Stormcaller',
      'Frostlord',
    ],
    unlockLevel: 1, // Always unlocked
    enemyHealthMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    xpMultiplier: 1.0,
    goldMultiplier: 1.3,
    itemDropMultiplier: 1.0,
  },
  {
    id: 'volcano',
    name: 'Molten Volcano',
    description: 'A fiery region with powerful fire and earth enemies.',
    allowedElements: ['fire', 'earth'],
    enemyNames: [
      'Flamereaper',
      'Cinderlord',
      'Flamelord',
      'Cinderborn',
      'Doomhammer',
      'Skullcrusher',
      'Stormlord',
      'Grimreaper',
    ],
    unlockLevel: 25, // Unlocked at hero level 20
    enemyHealthMultiplier: 1.4,
    enemyDamageMultiplier: 1.2,
    xpMultiplier: 1.5,
    goldMultiplier: 1.3,
    itemDropMultiplier: 1.1,
  },
  {
    id: 'tundra',
    name: 'Frozen Tundra',
    description: 'A land of ice and snow, home to cold and air enemies.',
    allowedElements: ['cold', 'air'],
    enemyNames: [
      'Frostbite',
      'Frostfury',
      'Frostweaver',
      'Frostlord',
      'Frostborn',
      'Stormbringer',
      'Stormkeeper',
      'Stormcaller',
    ],
    unlockLevel: 50, // Unlocked at hero level 50
    enemyHealthMultiplier: 1.7,
    enemyDamageMultiplier: 1.3,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 2,
  },
  {
    id: 'desert',
    name: 'Scorching Desert',
    description: 'A vast desert with relentless heat and dangerous creatures.',
    allowedElements: ['fire', 'air'],
    enemyNames: [
      'Sandstalker',
      'Dunewraith',
      'Sunflare',
      'Heatwave',
      'Dustbringer',
      'Blazewalker',
      'Ashcaller',
      'Inferno',
    ],
    unlockLevel: 90, // Unlocked at hero level 35
    enemyHealthMultiplier: 2.2,
    enemyDamageMultiplier: 1.5,
    xpMultiplier: 1.8,
    goldMultiplier: 1.8,
    itemDropMultiplier: 2.5,
  },
  {
    id: 'swamp',
    name: 'Murky Swamp',
    description: 'A dark and damp swamp filled with poisonous creatures.',
    allowedElements: ['earth', 'cold'],
    enemyNames: [
      'Boglurker',
      'Swampfang',
      'Venomspitter',
      'Mirestalker',
      'Rotclaw',
      'Sludgeborn',
      'Mudreaper',
      'Poisonfang',
    ],
    unlockLevel: 150, // Unlocked at hero level 10
    enemyHealthMultiplier: 2,
    enemyDamageMultiplier: 1.8,
    xpMultiplier: 4,
    goldMultiplier: 1.5,
    itemDropMultiplier: 1,
  },
  {
    id: 'skyrealm',
    name: 'Skyrealm Peaks',
    description: 'A floating realm high above the clouds, home to air and lightning creatures.',
    allowedElements: ['air'],
    enemyNames: [
      'Cloudstrider',
      'Thunderwing',
      'Stormsoul',
      'Skywarden',
      'Zephyrblade',
      'Lightningcaller',
      'Tempestlord',
      'Aetherborn',
    ],
    unlockLevel: 250, // Unlocked at hero level 60
    enemyHealthMultiplier: 4,
    enemyDamageMultiplier: 1.5,
    xpMultiplier: 2,
    goldMultiplier: 11,
    itemDropMultiplier: 1,
  },
];

let currentRegionId = null;

export async function setCurrentRegion(regionId) {
  if (regionId === currentRegionId) return;
  // Show confirm dialog before changing region
  const confirmed = await showConfirmDialog(
    'Are you sure you want to change region? That will reset your stage progress and will find you a new enemy'
  );
  if (!confirmed) return;
  currentRegionId = regionId;
  // Reset stage progress and enemy as if the hero died
  if (game) {
    game.stage = game.hero?.startingStage || 1;
    game.currentEnemy = new Enemy(game.stage);
    game.resetAllHealth();
    if (typeof game.saveGame === 'function') game.saveGame();
  }
  updateRegionUI();
}

export function getCurrentRegion() {
  return REGIONS.find((r) => r.id === currentRegionId) || REGIONS[0];
}

export function getUnlockedRegions(hero) {
  return REGIONS.filter((region) => hero.level >= region.unlockLevel);
}

export function loadRegionSelection() {
  currentRegionId = REGIONS[0].id;
}

// Helper to get emoji for element
const ELEMENT_EMOJIS = {
  fire: '🔥',
  cold: '❄️',
  air: '☁️',
  earth: '🌍',
};

function getRegionTooltip(region) {
  const html = String.raw;
  return html`
    <div class="tooltip-header">${region.name}</div>
    <div class="tooltip-content">${region.description}</div>
    <div><strong>Unlock Level:</strong> ${region.unlockLevel}</div>
    <div>
      <strong>Elements:</strong> ${region.allowedElements
        .map((el) => `${ELEMENT_EMOJIS[el] || ''} ${el.charAt(0).toUpperCase() + el.slice(1)}`)
        .join(', ')}
    </div>
    ${region.xpMultiplier != 1
      ? `<div><strong>XP bonus:</strong> ${((region.xpMultiplier - 1) * 100).toFixed(0)}%</div>`
      : ''}
    ${region.goldMultiplier != 1
      ? `<div><strong>Gold bonus:</strong> ${((region.goldMultiplier - 1) * 100).toFixed(0)}%</div>`
      : ''}
    ${region.itemDropMultiplier != 1
      ? `<div><strong>Item Drop bonus:</strong> ${((region.itemDropMultiplier - 1) * 100).toFixed(0)}%</div>`
      : ''}
  `;
}

export function updateRegionUI() {
  const container = document.getElementById('region-selector');
  if (!container) return;
  container.innerHTML = '';
  const unlocked = getUnlockedRegions(hero);
  REGIONS.forEach((region) => {
    const btn = document.createElement('button');
    btn.className = 'region-btn' + (region.id === currentRegionId ? ' selected' : '');
    btn.textContent = region.name;
    btn.disabled = !unlocked.includes(region);
    btn.onclick = () => setCurrentRegion(region.id);
    // Tooltip events
    btn.addEventListener('mouseenter', (e) => showTooltip(getRegionTooltip(region), e));
    btn.addEventListener('mousemove', positionTooltip);
    btn.addEventListener('mouseleave', hideTooltip);
    container.appendChild(btn);
  });
}

export function initializeRegionSystem() {
  loadRegionSelection();
  updateRegionUI();
}
