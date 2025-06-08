import Boss from '../boss.js';
import { BOSSES } from '../constants/bosses.js';

/**
 * Initialize boss UI: randomly select a boss for the Arena.
 * @param {Object} game Global game instance.
 */
export function initializeBossUI(game) {
  const randomIndex = Math.floor(Math.random() * BOSSES.length);
  const level = BOSSES[randomIndex].level;
  selectBoss(game, level);
}

/**
 * Handle boss instantiation and display.
 * @param {Object} game Global game instance.
 * @param {number} level Boss level to load.
 */
export function selectBoss(game, level) {
  game.currentBoss = new Boss(level);
  updateBossUI(game.currentBoss);
  const display = document.getElementById('stage-display');
  if (display) display.textContent = `Boss Level: ${game.currentBoss.level}`;
}

/**
 * Refresh boss stats in the Arena panel.
 * @param {Boss} boss Current boss instance.
 */
export function updateBossUI(boss) {
  // Avatar
  const avatar = document.querySelector('#arena-panel .enemy-avatar');
  if (avatar) {
    avatar.innerHTML = '';
    const img = document.createElement('img');
    img.src = boss.image;
    img.alt = boss.name;
    avatar.appendChild(img);
  }

  // Name
  const nameElem = document.querySelector('#arena-panel .boss-name');
  if (nameElem) nameElem.textContent = boss.name;

  // Life bar
  const lifeFill = document.querySelector('#arena-panel #enemy-life-fill');
  if (lifeFill) lifeFill.style.width = `${boss.getLifePercent()}%`;

  const lifeText = document.querySelector('#arena-panel #enemy-life-text');
  if (lifeText) lifeText.textContent = `${boss.currentLife}/${boss.life}`;

  // Damage value
  const dmgVal = document.querySelector('#arena-panel #enemy-damage-value');
  if (dmgVal) dmgVal.textContent = boss.damage;
}
