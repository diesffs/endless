// Region system for the game
// Handles region data, selection, unlocking, and UI

import { game, hero } from './globals.js';
import { showConfirmDialog, toggleGame, updateStageUI } from './ui.js';
import Enemy from './enemy.js';
// Tooltip imports
import { showTooltip, positionTooltip, hideTooltip } from './ui.js';

export const REGIONS = [
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'A mystical forest teeming with elemental creatures.',
    allowedElements: ['fire', 'cold', 'air', 'earth'],
    enemyNames: ['Shadowclaw', 'Dreadfang', 'Grimspike', 'Stormbringer'],
    unlockLevel: 1,
    enemyLifeMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    xpMultiplier: 1.0,
    goldMultiplier: 1.3,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1,
    materialDropWeights: {
      crystalized_rock: 1,
    },
  },
  {
    id: 'crystal_cave',
    name: 'Crystal Cave',
    description: 'A shimmering cave filled with crystalized rocks.',
    allowedElements: ['earth'],
    enemyNames: ['Crystal Golem', 'Shardling', 'Gem Guardian'],
    unlockLevel: 25,
    enemyLifeMultiplier: 1.5,
    enemyDamageMultiplier: 1.2,
    xpMultiplier: 1,
    goldMultiplier: 1,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.2,
    materialDropWeights: {
      crystalized_rock: 4,
    },
  },
  {
    id: 'tundra',
    name: 'Frozen Tundra',
    description: 'A land of ice and snow, home to cold and air enemies.',
    allowedElements: ['cold', 'air'],
    enemyNames: ['Frostbite', 'Frostfury', 'Frostweaver'],
    unlockLevel: 50,
    enemyLifeMultiplier: 1.8,
    enemyDamageMultiplier: 1.4,
    xpMultiplier: 1.7,
    goldMultiplier: 1.0,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
    },
  },
  {
    id: 'desert',
    name: 'Scorching Desert',
    description: 'A vast desert with relentless heat and dangerous creatures.',
    allowedElements: ['fire', 'air'],
    enemyNames: ['Sandstalker', 'Dunewraith', 'Sunflare'],
    unlockLevel: 150,
    enemyLifeMultiplier: 2.2,
    enemyDamageMultiplier: 1.5,
    xpMultiplier: 1.5,
    goldMultiplier: 2,
    itemDropMultiplier: 1,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      elixir: 5,
    },
  },
  {
    id: 'swamp',
    name: 'Murky Swamp',
    description: 'A dark and damp swamp filled with poisonous creatures.',
    allowedElements: ['earth', 'cold'],
    enemyNames: ['Boglurker', 'Swampfang', 'Venomspitter'],
    unlockLevel: 350,
    enemyLifeMultiplier: 2.5,
    enemyDamageMultiplier: 1.8,
    xpMultiplier: 2,
    goldMultiplier: 1.0,
    itemDropMultiplier: 3,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
    },
  },
  {
    id: 'skyrealm',
    name: 'Skyrealm Peaks',
    description: 'A floating realm high above the clouds, home to air and lightning creatures.',
    allowedElements: ['air'],
    enemyNames: ['Cloudstrider', 'Thunderwing', 'Stormsoul'],
    unlockLevel: 660,
    enemyLifeMultiplier: 4.0,
    enemyDamageMultiplier: 2.0,
    xpMultiplier: 2.5,
    goldMultiplier: 1.8,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 2.0,
    materialDropWeights: {
      potion_of_dexterity: 5,
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
    },
  },
  {
    id: 'abyss',
    name: 'Abyssal Depths',
    description: 'A dark and mysterious region filled with ancient horrors.',
    allowedElements: ['dark'],
    enemyNames: ['Abyssal Wraith', 'Voidwalker', 'Shadowfiend'],
    unlockLevel: 1000,
    enemyLifeMultiplier: 5.0,
    enemyDamageMultiplier: 2.5,
    xpMultiplier: 5.0,
    goldMultiplier: 4.0,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      freaky_gold_coins: 15,
    },
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

  if (game.gameStarted) {
    toggleGame();
    updateRegionUI();
    return;
  }
  game.stage = game.hero?.startingStage || 1;
  game.currentEnemy = new Enemy(game.stage);
  game.resetAllLife();
  game.saveGame();

  updateStageUI();
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
    ${region.materialDropMultiplier && region.materialDropMultiplier != 1
      ? `<div><strong>Material Drop bonus:</strong> ${((region.materialDropMultiplier - 1) * 100).toFixed(0)}%</div>`
      : ''}
  `;
}

export function updateRegionUI() {
  const container = document.getElementById('region-selector');
  if (!container) return;
  container.innerHTML = '';
  const unlocked = getUnlockedRegions(hero);
  const nextLockedRegion = REGIONS.find((region) => !unlocked.includes(region) && hero.level < region.unlockLevel);
  const visibleRegions = [...unlocked];
  if (nextLockedRegion) visibleRegions.push(nextLockedRegion);

  visibleRegions.forEach((region) => {
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
