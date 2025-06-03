import Enemy from '../enemy.js';
import { game, hero, prestige } from '../globals.js';
import { updateQuestsUI } from './questUi.js';
import { updateStatsAndAttributesUI } from './statsAndAttributesUi.js';
export {
  initializeSkillTreeUI,
  initializeSkillTreeStructure,
  updateSkillTreeValues,
  updateActionBar,
  updateBuffIndicators,
  showManaWarning,
} from './skillsUi.js';

const html = String.raw;

export function initializeUI() {
  game.currentEnemy = new Enemy(game.stage);
  game.activeTab = 'inventory';
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(game, btn.dataset.tab));
  });
  document.getElementById('start-btn').addEventListener('click', () => toggleGame());

  // Add tooltips to resource icons
  const resourceTooltips = [
    {
      selector: '.resource-gold',
      tooltip: () => `
        <div class="tooltip-header">Gold <span class="icon">💰</span></div>
        <div class="tooltip-desc">Used to buy upgrades and items.</div>
        <div class="tooltip-note">Earned from defeating enemies and selling items.</div>
      `,
    },
    {
      selector: '.resource-crystal',
      tooltip: () => `
        <div class="tooltip-header">Crystals <span class="icon">💎</span></div>
        <div class="tooltip-desc">Rare currency for powerful upgrades and skill resets.</div>
        <div class="tooltip-note">Obtained by reaching a new highest stage.</div>
      `,
    },
    {
      selector: '.resource-souls',
      tooltip: () => `
        <div class="tooltip-header">Souls <span class="icon">👻</span></div>
        <div class="tooltip-desc">Earned from prestige, used for permanent upgrades.</div>
        <div class="tooltip-note">Prestige to collect more souls and unlock new bonuses.</div>
      `,
    },
  ];
  resourceTooltips.forEach(({ selector, tooltip }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('tooltip-target');
      el.addEventListener('mouseenter', (e) => showTooltip(tooltip(), e));
      el.addEventListener('mousemove', positionTooltip);
      el.addEventListener('mouseleave', hideTooltip);
    }
  });

  updateStageUI();
  updateQuestsUI();
}

export function switchTab(game, tabName) {
  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'stats') {
    updateStatsAndAttributesUI();
  }
  if (tabName === 'quests') {
    updateQuestsUI();
  }

  game.activeTab = tabName;
}

export function updateResources() {
  if (!game || typeof game.stage !== 'number') {
    console.error('Game is not initialized properly:', game);
    return;
  }

  prestige.updateUI();

  // Update ghost icon (total souls)
  document.getElementById('souls').textContent = hero.souls || 0;
  document.getElementById('crystals').textContent = hero.crystals || 0;

  // Update other stats
  document.getElementById('gold').textContent = hero.gold || 0;
}

export function updatePlayerLife() {
  const stats = hero.stats;
  if (!game.gameStarted) {
    stats.currentLife = stats.life;
  }
  const lifePercentage = (stats.currentLife / stats.life) * 100;
  document.getElementById('life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('life-text').textContent = `${Math.max(0, Math.floor(stats.currentLife))}/${Math.floor(
    stats.life
  )}`;

  const manaPercentage = (stats.currentMana / stats.mana) * 100;
  document.getElementById('mana-fill').style.width = `${manaPercentage}%`;
  document.getElementById('mana-text').textContent = `${Math.max(0, Math.floor(stats.currentMana))}/${Math.floor(
    stats.mana
  )}`;
}

export function updateEnemyLife() {
  const enemy = game.currentEnemy;
  const lifePercentage = (enemy.currentLife / enemy.life) * 100;
  document.getElementById('enemy-life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('enemy-life-text').textContent = `${Math.max(0, Math.floor(enemy.currentLife))}/${Math.floor(
    enemy.life
  )}`;
}

export function toggleGame() {
  const startBtn = document.getElementById('start-btn');

  game.toggle();

  startBtn.textContent = game.gameStarted ? 'Stop' : 'Start';
  startBtn.style.backgroundColor = game.gameStarted ? '#DC2626' : '#059669';
}

export function updateStageUI() {
  const stage = game.stage;
  const stageDisplay = document.getElementById('stage-display');
  if (stageDisplay) {
    stageDisplay.textContent = `Stage: ${stage}`;
  }
}

export function showToast(message, type = 'normal', duration = 3000) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // Add to DOM
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Function to show the tooltip
export function showTooltip(content, event, classes = '') {
  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = content;
  tooltip.className = `tooltip show ${classes}`; // Add custom classes here
  positionTooltip(event);
}

// Function to hide the tooltip
export function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.classList.remove('show');
  tooltip.classList.add('hidden');
}

// Function to position the tooltip
export function positionTooltip(event) {
  const tooltip = document.getElementById('tooltip');
  const tooltipRect = tooltip.getBoundingClientRect();
  const offset = 10; // Offset from the mouse pointer

  let top = event.clientY + offset;
  let left = event.clientX + offset;

  // Adjust position if tooltip goes off-screen
  if (top + tooltipRect.height > window.innerHeight) {
    top = event.clientY - tooltipRect.height - offset;
  }
  if (left + tooltipRect.width > window.innerWidth) {
    left = event.clientX - tooltipRect.width - offset;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

// Example usage: Attach event listeners to elements that need tooltips
document.querySelectorAll('.tooltip-target').forEach((element) => {
  element.addEventListener('mouseenter', (e) => showTooltip('Your tooltip content here', e));
  element.addEventListener('mousemove', positionTooltip);
  element.addEventListener('mouseleave', hideTooltip);
});

// ###########################
// Custom Confirm Dialog
// ###########################

export function showConfirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    let dialog = document.getElementById('custom-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'custom-confirm-dialog';
      dialog.innerHTML = `
        <div class="confirm-backdrop"></div>
        <div class="confirm-content">
          <div class="confirm-message"></div>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-yes">Yes</button>
            <button class="confirm-btn confirm-no">No</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }
    dialog.querySelector('.confirm-message').innerHTML = message.replace(/\n/g, '<br>');
    dialog.style.display = 'flex';
    dialog.classList.add('show');

    const yesBtn = dialog.querySelector('.confirm-yes');
    const noBtn = dialog.querySelector('.confirm-no');
    const cleanup = () => {
      dialog.classList.remove('show');
      setTimeout(() => {
        dialog.style.display = 'none';
      }, 200);
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
      dialog.querySelector('.confirm-backdrop').removeEventListener('click', onNo);
    };
    const onYes = () => {
      cleanup();
      resolve(true);
    };
    const onNo = () => {
      cleanup();
      resolve(false);
    };
    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
    dialog.querySelector('.confirm-backdrop').addEventListener('click', onNo);
  });
}

// Add some basic styles for the dialog if not present
if (!document.getElementById('custom-confirm-dialog-style')) {
  const style = document.createElement('style');
  style.id = 'custom-confirm-dialog-style';
  style.textContent = `
    #custom-confirm-dialog {
      position: fixed;
      left: 0; top: 0; right: 0; bottom: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: inherit;
    }
    #custom-confirm-dialog.show { display: flex; }
    #custom-confirm-dialog .confirm-backdrop {
      position: absolute;
      left: 0; top: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
    }
    #custom-confirm-dialog .confirm-content {
      position: relative;
      background: #222;
      color: #fff;
      border-radius: 8px;
      padding: 24px 32px;
      min-width: 300px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      z-index: 1;
      text-align: center;
      animation: popin 0.2s;
    }
    #custom-confirm-dialog .confirm-message {
      margin-bottom: 18px;
      font-size: 1.1em;
      line-height: 1.5;
    }
    #custom-confirm-dialog .confirm-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    #custom-confirm-dialog .confirm-btn {
      padding: 8px 24px;
      border: none;
      border-radius: 4px;
      font-size: 1em;
      cursor: pointer;
      background: #059669;
      color: #fff;
      transition: background 0.2s;
    }
    #custom-confirm-dialog .confirm-btn.confirm-no {
      background: #DC2626;
    }
    #custom-confirm-dialog .confirm-btn:hover {
      filter: brightness(1.1);
    }
    @keyframes popin {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Helper function to convert camelCase to Title Case with spaces
export const formatStatName = (stat) => {
  // Handle special cases first
  if (stat === 'critChance') return 'Crit Chance';
  if (stat === 'critDamage') return 'Crit Damage';
  if (stat === 'lifeSteal') return 'Life Steal';
  if (stat === 'attackSpeed') return 'Attack Speed';
  if (stat === 'attackRating') return 'Attack Rating';
  if (stat === 'attackRatingPercent') return 'Attack Rating';
  if (stat === 'damagePercent') return 'Damage';
  if (stat === 'lifePercent') return 'Life %';
  if (stat === 'manaPercent') return 'Mana %';
  if (stat === 'armorPercent') return 'Armor';
  if (stat === 'elementalDamagePercent') return 'Elemental Damage %';
  if (stat === 'lifeRegen') return 'Life Regeneration';
  if (stat === 'manaRegen') return 'Mana Regeneration';
  if (stat === 'bonusGold') return 'Bonus Gold';
  if (stat === 'bonusExperience') return 'Bonus Experience';
  if (stat === 'blockChance') return 'Block Chance';
  if (stat === 'fireDamage') return 'Fire Damage';
  if (stat === 'coldDamage') return 'Cold Damage';
  if (stat === 'airDamage') return 'Air Damage';
  if (stat === 'earthDamage') return 'Earth Damage';
  if (stat === 'fireDamagePercent') return 'Fire Damage %';
  if (stat === 'coldDamagePercent') return 'Cold Damage %';
  if (stat === 'airDamagePercent') return 'Air Damage %';
  if (stat === 'earthDamagePercent') return 'Earth Damage %';
  if (stat === 'strength') return 'Strength';
  if (stat === 'strengthPercent') return 'Strength %';
  if (stat === 'agility') return 'Agility';
  if (stat === 'agilityPercent') return 'Agility %';
  if (stat === 'vitality') return 'Vitality';
  if (stat === 'vitalityPercent') return 'Vitality %';
  if (stat === 'wisdom') return 'Wisdom';
  if (stat === 'wisdomPercent') return 'Wisdom %';
  if (stat === 'endurance') return 'Endurance';
  if (stat === 'endurancePercent') return 'Endurance %';
  if (stat === 'dexterity') return 'Dexterity';
  if (stat === 'dexterityPercent') return 'Dexterity %';
  if (stat === 'lifePerHit') return 'Life Per Hit';
  if (stat === 'lifePerHitPercent') return 'Life Per Hit %';
  if (stat === 'manaPerHit') return 'Mana Per Hit';
  if (stat === 'manaPerHitPercent') return 'Mana Per Hit %';
  if (stat === 'thornsDamage') return 'Thorns Damage';
  if (stat === 'thornsDamagePercent') return 'Thorns Damage %';
  if (stat === 'cooldownReductionPercent') return 'Cooldown Reduction %';
  if (stat === 'manaCostReductionPercent') return 'Mana Cost Reduction %';
  if (stat === 'buffDurationPercent') return 'Buff Duration %';
  if (stat === 'itemBonusesPercent') return 'Item Bonuses %';
  if (stat === 'doubleDamageChance') return 'Double Damage Chance';
  if (stat === 'resurrectionChance') return 'Resurrection Chance';
  if (stat === 'reflectFireDamage') return 'Reflect Fire Damage';
  if (stat === 'skillPoints') return 'Bonus Skill Points';

  // Fallback: convert camelCase to Title Case with spaces
  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Percent$/, '%')
    .trim();
};
