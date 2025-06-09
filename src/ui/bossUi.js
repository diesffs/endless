import Boss from '../boss.js';

/**
 * Handle boss instantiation and display.
 * @param {Object} game Global game instance.
 * @param {number} level Boss level to load.
 */
export function selectBoss(game) {
  game.currentEnemy = new Boss(3); // change to actual level
  updateBossUI(game.currentEnemy);
  const display = document.getElementById('stage-display');
  if (display) display.textContent = `Boss Level: ${game.currentEnemy.level}`;
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
