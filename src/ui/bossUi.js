import Boss from '../boss.js';
import { hero } from '../globals.js';

/**
 * Handle boss instantiation and display.
 * @param {Object} game Global game instance.
 */
export function selectBoss(game) {
  game.currentEnemy = new Boss();
  updateBossUI(game.currentEnemy);
  const display = document.getElementById('stage-display');
  if (display) display.textContent = `Boss Level: ${hero.bossLevel}`;
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

    // Use Vite's BASE_URL if available, else fallback
    let baseUrl = '';
    try {
      baseUrl = import.meta.env.BASE_URL || '';
    } catch (e) {}

    img.src = baseUrl + boss.image;
    img.alt = boss.name;
    avatar.appendChild(img);
  }

  // Name
  const nameElem = document.querySelector('#arena-panel .enemy-name');
  if (nameElem) nameElem.textContent = boss.name;

  // Life bar
  const lifeFill = document.querySelector('#arena-panel #enemy-life-fill');
  if (lifeFill) lifeFill.style.width = `${boss.getLifePercent()}%`;

  const lifeText = document.querySelector('#arena-panel #enemy-life-text');
  if (lifeText) {
    const currentLife = Math.floor(boss.currentLife);
    const totalLife = Math.floor(boss.life);
    lifeText.textContent = `${currentLife}/${totalLife}`;
  }

  // Damage value
  const dmgVal = document.querySelector('#arena-panel #enemy-damage-value');
  if (dmgVal) dmgVal.textContent = Math.floor(boss.damage);
}
