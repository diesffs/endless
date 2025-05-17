import Enemy from './enemy.js';
import { game, hero, prestige, skillTree } from './globals.js';
import { calculateHitChance } from './combat.js';
import { STATS } from './stats.js';
import { ATTRIBUTES } from './hero.js';
import { CLASS_PATHS, REQ_LEVEL_FOR_SKILL_TREE, SKILL_LEVEL_TIERS, SKILL_TREES } from './skills.js';

const html = String.raw;

export const ATTRIBUTE_TOOLTIPS = {
  getStrengthTooltip: () => html`
    <strong>Strength</strong><br />
    Each point increases:<br />
    • Damage by ${ATTRIBUTES.strength.effects.damagePerPoint}<br />
    ${ATTRIBUTES.strength.effects.damagePercentPer.enabled
      ? `• Every ${ATTRIBUTES.strength.effects.damagePercentPer.points} points adds ${
          ATTRIBUTES.strength.effects.damagePercentPer.value * 100
        }% to total damage`
      : ''}
  `,

  getAgilityTooltip: () => html`
    <strong>Agility</strong><br />
    Each point increases:<br />
    • Attack Rating by ${ATTRIBUTES.agility.effects.attackRatingPerPoint}<br />
    ${ATTRIBUTES.agility.effects.attackRatingPercentPer.enabled
      ? `• Every ${ATTRIBUTES.agility.effects.attackRatingPercentPer.points} points adds ${
          ATTRIBUTES.agility.effects.attackRatingPercentPer.value * 100
        }% to total attack rating`
      : ''}
    ${ATTRIBUTES.agility.effects.attackSpeedPer.enabled
      ? `• Every ${ATTRIBUTES.agility.effects.attackSpeedPer.points} points adds ${
          ATTRIBUTES.agility.effects.attackSpeedPer.value * 100
        }% attack speed`
      : ''}
  `,

  getVitalityTooltip: () => html`
    <strong>Vitality</strong><br />
    Each point increases:<br />
    • Life by ${ATTRIBUTES.vitality.effects.lifePerPoint}<br />
    ${ATTRIBUTES.vitality.effects.lifePercentPer.enabled
      ? `• Every ${ATTRIBUTES.vitality.effects.lifePercentPer.points} points adds ${
          ATTRIBUTES.vitality.effects.lifePercentPer.value * 100
        }% to total life`
      : ''}
    ${ATTRIBUTES.vitality.effects.regenPercentPer.enabled
      ? `• Every ${ATTRIBUTES.vitality.effects.regenPercentPer.points} points adds ${
          ATTRIBUTES.vitality.effects.regenPercentPer.value * 100
        }% life regeneration`
      : ''}
  `,

  getWisdomTooltip: () => html`
    <strong>Wisdom</strong><br />
    Each point increases:<br />
    • Mana by ${ATTRIBUTES.wisdom.effects.manaPerPoint}<br />
    ${ATTRIBUTES.wisdom.effects.manaPercentPer.enabled
      ? `• Every ${ATTRIBUTES.wisdom.effects.manaPercentPer.points} points adds ${
          ATTRIBUTES.wisdom.effects.manaPercentPer.value * 100
        }% to total mana`
      : ''}
    ${ATTRIBUTES.wisdom.effects.regenPercentPer.enabled
      ? `• Every ${ATTRIBUTES.wisdom.effects.regenPercentPer.points} points adds ${
          ATTRIBUTES.wisdom.effects.regenPercentPer.value * 100
        }% mana regeneration`
      : ''}
  `,

  getEnduranceTooltip: () => html`
    <strong>Endurance</strong><br />
    Each point increases:<br />
    • Armor by ${ATTRIBUTES.endurance.effects.armorPerPoint}<br />
    ${ATTRIBUTES.endurance.effects.armorPercentPer.enabled
      ? `• Every ${ATTRIBUTES.endurance.effects.armorPercentPer.points} points adds ${
          ATTRIBUTES.endurance.effects.armorPercentPer.value * 100
        }% to total armor`
      : ''}
  `,

  getDexterityTooltip: () => html`
    <strong>Dexterity</strong><br />
    Each point increases:<br />
    • Critical Damage by ${ATTRIBUTES.dexterity.effects.critDamagePerPoint}<br />
    ${ATTRIBUTES.dexterity.effects.critChancePer.enabled
      ? `• Every ${ATTRIBUTES.dexterity.effects.critChancePer.points} points adds ${
          ATTRIBUTES.dexterity.effects.critChancePer.value * 100
        }% critical strike chance`
      : ''}
    ${ATTRIBUTES.dexterity.effects.critDamagePer.enabled
      ? `• Every ${ATTRIBUTES.dexterity.effects.critDamagePer.points} points adds ${
          ATTRIBUTES.dexterity.effects.critDamagePer.value * 100
        }% critical strike damage`
      : ''}
  `,

  getElementalDamageTooltip: () => html`
    <strong>Elemental Damage</strong><br />
    Effectiveness against enemy elements:<br />
    • 200% damage vs opposite element<br />
    • 0% damage vs same element<br />
    • 25% damage vs other elements<br /><br />
    Element Strengths:<br />
    🔥 Fire → ☁️ Air<br />
    🌍 Earth → ❄️ Cold<br />
    ❄️ Cold → 🔥 Fire<br />
    ☁️ Air → 🌍 Earth
  `,

  getDamageTooltip: () => html`
    <strong>Damage</strong><br />
    Base physical damage dealt to enemies.<br />
    Increased by Strength and equipment.
  `,

  getAttackSpeedTooltip: () => html`
    <strong>Attack Speed</strong><br />
    Number of attacks per second.<br />
    Maximum: 5 attacks/second
  `,

  getAttackRatingTooltip: () => html`
    <strong>Attack Rating</strong><br />
    Determines hit chance against enemies.<br />
    Higher stages require more Attack Rating.
  `,

  getCritChanceTooltip: () => html`
    <strong>Critical Strike Chance</strong><br />
    Chance to deal critical damage.<br />
    Maximum: 100%
  `,

  getCritDamageTooltip: () => html`
    <strong>Critical Strike Damage</strong><br />
    Damage multiplier on critical hits.<br />
    Base: 1.5x damage
  `,

  getLifeStealTooltip: () => html`
    <strong>Life Steal</strong><br />
    Percentage of damage dealt recovered as life.
  `,

  getMaxLifeTooltip: () => html`
    <strong>Life</strong><br />
    Maximum life points.<br />
    Increased by Vitality and level ups.
  `,

  getLifeRegenTooltip: () => html`
    <strong>Life Regeneration</strong><br />
    Amount of life recovered per second.
  `,

  getMaxManaTooltip: () => html`
    <strong>Mana</strong><br />
    Maximum mana points.<br />
    Increased by Wisdom and level ups.
  `,

  getManaRegenTooltip: () => html`
    <strong>Mana Regeneration</strong><br />
    Amount of mana recovered per second.
  `,

  getArmorTooltip: () => html`
    <strong>Armor</strong><br />
    Reduces incoming damage.<br />
    Effectiveness decreases in higher stages.
  `,

  getBlockChanceTooltip: () => html`
    <strong>Block Chance</strong><br />
    Chance to block incoming attacks.<br />
    Maximum: 75%
  `,
};

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
}

export function switchTab(game, tabName) {
  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'stats') {
    updateStatsAndAttributesUI();
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

export function updateStatsAndAttributesUI() {
  const statsGrid = document.querySelector('.stats-grid');

  if (!statsGrid) return;

  // Ensure sections exist; create them only if they don't
  let statsContainer = document.querySelector('.stats-container');
  let attributesContainer = document.querySelector('.attributes-container');

  if (!statsContainer) {
    statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    statsContainer.innerHTML = html`
      <!-- xp, lvl, stage -->
      <div><strong>Level:</strong> <span id="level-value">${hero.level || 1}</span></div>
      <div>
        <strong>EXP:</strong> <span id="exp-value">${hero.exp || 0}</span> /
        <span id="exp-to-next-level-value">${hero.expToNextLevel || 100}</span>
        (<span id="exp-progress">${((hero.exp / hero.expToNextLevel) * 100).toFixed(1)}%</span>)
      </div>

      <div><strong>Highest Stage:</strong><span id="highest-stage-value">${hero.highestStage}</span></div>

      <!-- OFFENSE -->

      <hr style="margin: 5px 1px" />
      <div><strong>Damage:</strong> <span id="damage-value">${hero.stats.damage}</span></div>

      <div>
        <strong>Attack Speed:</strong>
        <span id="attack-speed-value"
          >${hero.stats.attackSpeed.toFixed(STATS.attackSpeed.decimalPlaces).replace(/\./g, ',')}</span
        >
        attacks/sec
      </div>

      <div>
        <strong>Attack Rating:</strong>
        <span id="attack-rating-value">${hero.stats.attackRating}</span> (<span id="hit-chance-value">
          ${calculateHitChance(hero.stats.attackRating, game.stage).toFixed(2)}%</span
        >)
      </div>

      <div>
        <strong>Crit Chance:</strong>
        <span id="crit-chance-value"
          >${hero.stats.critChance.toFixed(STATS.critChance.decimalPlaces).replace(/\./g, ',')}%</span
        >
      </div>

      <div>
        <strong>Crit Damage:</strong>
        <span id="crit-damage-value"
          >${hero.stats.critDamage.toFixed(STATS.critDamage.decimalPlaces).replace(/\./g, ',')}x</span
        >
      </div>

      <div>
        <strong>Life Steal:</strong>
        <span id="life-steal-value"
          >${hero.stats.lifeSteal.toFixed(STATS.lifeSteal.decimalPlaces).replace(/\./g, ',')}%</span
        >
      </div>
      <div class="elemental-damage">
        <div><strong>🔥 Fire Damage:</strong> <span id="fire-damage-value">${hero.stats.fireDamage}</span></div>
        <div><strong>❄️ Cold Damage:</strong> <span id="cold-damage-value">${hero.stats.coldDamage}</span></div>
        <div><strong>☁️ Air Damage:</strong> <span id="air-damage-value">${hero.stats.airDamage}</span></div>
        <div><strong>🌍 Earth Damage:</strong> <span id="earth-damage-value">${hero.stats.earthDamage}</span></div>
      </div>

      <!-- DEFENSE -->
      <hr style="margin: 5px 1px" />

      <div><strong>Life:</strong> <span id="max-life-value">${hero.stats.life}</span></div>
      <div>
        <strong>Life Regen:</strong>
        <span id="life-regen-value"
          >${hero.stats.lifeRegen.toFixed(STATS.lifeRegen.decimalPlaces).replace(/\./g, ',')}</span
        >/s
      </div>
      <div><strong>Mana:</strong> <span id="max-mana-value">${hero.stats.mana}</span></div>
      <div>
        <strong>Mana Regen:</strong>
        <span id="mana-regen-value"
          >${hero.stats.manaRegen.toFixed(STATS.manaRegen.decimalPlaces).replace(/\./g, ',')}</span
        >/s
      </div>

      <div>
        <strong>Armor:</strong> <span id="armor-value">${hero.stats.armor || 0}</span> (
        <span id="armor-reduction-value"> ${hero.calculateArmorReduction().toFixed(2).replace(/\./g, ',')} </span>
        reduction)
      </div>

      <div>
        <strong>Block Chance:</strong>
        <span id="block-chance-value"
          >${hero.stats.blockChance.toFixed(STATS.blockChance.decimalPlaces).replace(/\./g, ',')}%</span
        >
      </div>
    `;

    const addTooltipToElement = (element, tooltipFunction) => {
      element.addEventListener('mouseenter', (e) => showTooltip(tooltipFunction(), e));
      element.addEventListener('mousemove', positionTooltip);
      element.addEventListener('mouseleave', hideTooltip);
    };

    // Combat stats
    addTooltipToElement(
      statsContainer.querySelector('#damage-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getDamageTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#attack-speed-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getAttackSpeedTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#attack-rating-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getAttackRatingTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#crit-chance-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getCritChanceTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#crit-damage-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getCritDamageTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#life-steal-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getLifeStealTooltip
    );

    // Elemental damage section
    addTooltipToElement(
      statsContainer.querySelector('.elemental-damage'),
      ATTRIBUTE_TOOLTIPS.getElementalDamageTooltip
    );

    // Defense stats
    addTooltipToElement(
      statsContainer.querySelector('#max-life-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getMaxLifeTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#life-regen-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getLifeRegenTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#max-mana-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getMaxManaTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#mana-regen-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getManaRegenTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#armor-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getArmorTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#block-chance-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getBlockChanceTooltip
    );

    statsGrid.appendChild(statsContainer);
  } else {
    // Update dynamic stats values
    document.getElementById('level-value').textContent = hero.level || 1;
    document.getElementById('exp-value').textContent = hero.exp || 0;
    document.getElementById('exp-progress').textContent = ((hero.exp / hero.expToNextLevel) * 100).toFixed(1) + '%';
    document.getElementById('exp-to-next-level-value').textContent = hero.expToNextLevel || 100;
    document.getElementById('highest-stage-value').textContent = hero.highestStage;
    document.getElementById('damage-value').textContent = hero.stats.damage;
    document.getElementById('attack-speed-value').textContent = hero.stats.attackSpeed
      .toFixed(STATS.attackSpeed.decimalPlaces)
      .replace(/\./g, ',');
    document.getElementById('attack-rating-value').textContent = hero.stats.attackRating;
    document.getElementById('hit-chance-value').textContent =
      calculateHitChance(hero.stats.attackRating, game.stage).toFixed(2) + '%';
    document.getElementById('crit-chance-value').textContent =
      hero.stats.critChance.toFixed(STATS.critChance.decimalPlaces).replace(/\./g, ',') + '%';
    document.getElementById('crit-damage-value').textContent =
      hero.stats.critDamage.toFixed(STATS.critDamage.decimalPlaces).replace(/\./g, ',') + 'x';

    document.getElementById('life-steal-value').textContent =
      hero.stats.lifeSteal.toFixed(STATS.lifeSteal.decimalPlaces).replace(/\./g, ',') + '%';
    document.getElementById('fire-damage-value').textContent = hero.stats.fireDamage;
    document.getElementById('cold-damage-value').textContent = hero.stats.coldDamage;
    document.getElementById('air-damage-value').textContent = hero.stats.airDamage;
    document.getElementById('earth-damage-value').textContent = hero.stats.earthDamage;

    document.getElementById('max-life-value').textContent = hero.stats.life;
    document.getElementById('life-regen-value').textContent = hero.stats.lifeRegen
      .toFixed(STATS.lifeRegen.decimalPlaces)
      .replace(/\./g, ',');
    document.getElementById('max-mana-value').textContent = hero.stats.mana;
    document.getElementById('mana-regen-value').textContent = hero.stats.manaRegen
      .toFixed(STATS.manaRegen.decimalPlaces)
      .replace(/\./g, ',');
    document.getElementById('armor-value').textContent = hero.stats.armor || 0;
    document.getElementById('armor-reduction-value').textContent =
      hero.calculateArmorReduction().toFixed(2).replace(/\./g, ',') + '%';
    document.getElementById('block-chance-value').textContent =
      hero.stats.blockChance.toFixed(STATS.blockChance.decimalPlaces).replace(/\./g, ',') + '%';
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    attributesContainer.innerHTML = html`
      <h3 id="attributes">Attributes (+${hero.statPoints})</h3>
      ${Object.entries(hero.primaryStats)
        .map(([stat, value]) => {
          return `
            <div class="attribute-row">
            <button class="allocate-btn" data-stat="${stat}">+</button>
            <strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</strong>
            <span id="${stat}-value">${hero.stats[stat]}</span>
            </div>
            `;
        })
        .join('')}
    `;

    attributesContainer.querySelectorAll('.attribute-row').forEach((row) => {
      const stat = row.querySelector('button').dataset.stat;
      row.addEventListener('mouseenter', (e) =>
        showTooltip(ATTRIBUTE_TOOLTIPS[`get${stat.charAt(0).toUpperCase() + stat.slice(1)}Tooltip`](), e)
      );
      row.addEventListener('mousemove', positionTooltip);
      row.addEventListener('mouseleave', hideTooltip);
    });

    statsGrid.appendChild(attributesContainer);

    // Attach event listeners for allocation buttons (only once)
    attributesContainer.querySelectorAll('.allocate-btn').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        const stat = e.target.dataset.stat;
        hero.allocateStat(stat);
        updateStatsAndAttributesUI();

        let intervalId;
        let holdingTimeout;

        const startHolding = () => {
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            if (hero.statPoints > 0) {
              hero.allocateStat(stat);
              updateStatsAndAttributesUI();
            } else {
              stopHolding();
            }
          }, 100);
        };

        const stopHolding = () => {
          clearTimeout(holdingTimeout);
          clearInterval(intervalId);
          document.removeEventListener('mouseup', stopHolding);
          document.removeEventListener('mouseleave', stopHolding);
        };

        holdingTimeout = setTimeout(startHolding, 500);

        document.addEventListener('mouseup', stopHolding);
        document.addEventListener('mouseleave', stopHolding);
      });
    });
  } else {
    document.getElementById(`attributes`).textContent = `Attributes (+${hero.statPoints})`;
    // Update dynamic attribute values
    document.getElementById('strength-value').textContent = hero.stats['strength'];
    document.getElementById('agility-value').textContent = hero.stats['agility'];
    document.getElementById('vitality-value').textContent = hero.stats['vitality'];
    document.getElementById('wisdom-value').textContent = hero.stats['wisdom'];
    document.getElementById('endurance-value').textContent = hero.stats['endurance'];
    document.getElementById('dexterity-value').textContent = hero.stats['dexterity'];
  }

  const skillTreeTab = document.querySelector('[data-tab="skilltree"]');
  skillTreeTab.classList.remove('hidden');
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

// ##########################################
//  #########################################
// ##########################################
// ##########################################
//  ########### SKILL TREE ##################
// ##########################################
// ##########################################
//  #########################################
// ##########################################
export function initializeSkillTreeUI() {
  const container = document.getElementById('skilltree');
  const classSelection = document.getElementById('class-selection');
  const skillTreeContainer = document.getElementById('skill-tree-container');

  // --- Only show Reset Skill Tree button if a path is selected ---
  let resetBtn = document.getElementById('reset-skill-tree-btn');
  if (skillTree.selectedPath) {
    if (!resetBtn) {
      resetBtn = document.createElement('button');
      resetBtn.id = 'reset-skill-tree-btn';
      resetBtn.className = 'danger-btn';
      resetBtn.style.margin = '12px auto 16px auto';
      resetBtn.style.display = 'block';
      resetBtn.textContent = 'Reset Skill Tree (Cost: 10 💎)';
      resetBtn.onclick = async () => {
        if (hero.crystals < 10) {
          showToast('Not enough crystals to reset skill tree!', 'warning');
          return;
        }
        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset your skill path and refund all skill points?<br>This will cost <strong>10 crystals</strong> and cannot be undone.'
        );
        if (confirmed) {
          hero.crystals -= 10;
          skillTree.resetSkillTree();
          initializeSkillTreeUI();
          updateResources();
          showToast('Skill tree has been reset and all points refunded.', 'success');
          updateSkillTreeValues();
        }
      };
      container.insertBefore(resetBtn, container.firstChild);
    }
    resetBtn.style.display = 'block';
  } else if (resetBtn) {
    resetBtn.style.display = 'none';
  }

  if (!skillTree.selectedPath) {
    classSelection.classList.remove('hidden');
    skillTreeContainer.classList.add('hidden');
    showClassSelection();
  } else {
    classSelection.classList.add('hidden');
    skillTreeContainer.classList.remove('hidden');
    showSkillTree();
  }

  updateSkillTreeValues();
  updateActionBar();
}

function showClassSelection() {
  const classSelection = document.getElementById('class-selection');
  classSelection.innerHTML = '';

  Object.entries(CLASS_PATHS).forEach(([pathId, pathData]) => {
    if (!pathData.enabled) return;
    const pathElement = document.createElement('div');
    pathElement.className = 'class-path';

    // Avatar + name/description row
    pathElement.innerHTML = html`
      <div style="display: flex; align-items: flex-start; gap: 18px;">
        <img
          src="${import.meta.env.BASE_URL}avatars/${pathData.avatar}"
          alt="${pathData.name} Avatar"
          style="width: 72px; height: 72px; border-radius: 8px; object-fit: cover; background: #222;"
        />
        <div style="flex: 1;">
          <h3>${pathData.name}</h3>
          <p>${pathData.description}</p>
        </div>
      </div>
      <div class="base-stats" style="margin-top: 15px;">
        ${Object.entries(pathData.baseStats)
          .map(([stat, value]) => {
            let readableStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            let displayValue = value;
            if (stat.endsWith('Percent')) {
              readableStat = readableStat.replace(/ Percent$/, '');
              displayValue = `${value}%`;
            }
            const prefix = value > 0 ? '+' : '';
            return `<div>${readableStat}: ${prefix}${displayValue}</div>`;
          })
          .join('')}
      </div>
    `;

    const button = document.createElement('button');
    button.textContent =
      hero.level < REQ_LEVEL_FOR_SKILL_TREE ? `Requires Level ${REQ_LEVEL_FOR_SKILL_TREE}` : 'Choose Path';
    button.addEventListener('click', () => selectClassPath(pathId));
    pathElement.appendChild(button);

    classSelection.appendChild(pathElement);
  });
}

function selectClassPath(pathId) {
  if (skillTree.selectPath(pathId)) {
    document.getElementById('class-selection').classList.add('hidden');
    document.getElementById('skill-tree-container').classList.remove('hidden');
    showSkillTree();
    initializeSkillTreeUI();
  }
}

export function initializeSkillTreeStructure() {
  if (!skillTree.selectedPath) return;
  const container = document.getElementById('skill-tree-container');
  container.innerHTML = '';

  const skillPointsHeader = document.createElement('div');
  skillPointsHeader.className = 'skill-points-header';
  container.appendChild(skillPointsHeader);

  const noLvlRestriction = false;

  const skills = SKILL_TREES[skillTree.selectedPath.name];
  const levelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
    if (level <= hero.level || noLvlRestriction) {
      acc[level] = [];
    }
    return acc;
  }, {});

  Object.entries(skills).forEach(([skillId, skillData]) => {
    if (noLvlRestriction || (skillData.requiredLevel <= hero.level && levelGroups[skillData.requiredLevel])) {
      levelGroups[skillData.requiredLevel].push({ id: skillId, ...skillData });
    }
  });

  Object.entries(levelGroups).forEach(([reqLevel, groupSkills]) => {
    if (groupSkills.length > 0) {
      const rowElement = document.createElement('div');
      rowElement.className = 'skill-row';

      const levelLabel = document.createElement('div');
      levelLabel.className = 'level-requirement';
      levelLabel.textContent = `Level ${reqLevel}`;
      container.appendChild(levelLabel);

      groupSkills.forEach((skill) => {
        const skillElement = createSkillElement(skill);
        rowElement.appendChild(skillElement);
      });

      container.appendChild(rowElement);
    }
  });
  updateSkillTreeValues();
}

export function updateSkillTreeValues() {
  const characterAvatarEl = document.getElementById('character-avatar');
  const characterNameEl = document.getElementById('character-name');

  if (!skillTree.selectedPath) {
    let img = characterAvatarEl.querySelector('img');
    img = document.createElement('img');
    img.alt = 'Peasant Avatar';
    characterAvatarEl.innerHTML = '';
    characterAvatarEl.appendChild(img);
    img.src = `${import.meta.env.BASE_URL}avatars/peasant-avatar.jpg`;

    // reset name
    characterNameEl.textContent = ``;
    return;
  }

  if (characterAvatarEl && skillTree.selectedPath?.avatar) {
    // Remove any previous img
    let img = characterAvatarEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = skillTree.selectedPath.name + ' avatar';
      characterAvatarEl.innerHTML = '';
      characterAvatarEl.appendChild(img);
    }
    img.src = `${import.meta.env.BASE_URL}avatars/${skillTree.selectedPath.avatar}`;
  }

  const characterName =
    skillTree.selectedPath.name.charAt(0).toUpperCase() + skillTree.selectedPath.name.slice(1).toLowerCase();
  characterNameEl.textContent = `${characterName}`;

  const container = document.getElementById('skill-tree-container');

  const skillPointsHeader = container.querySelector('.skill-points-header');
  skillPointsHeader.innerHTML = `
    <span class="skill-path-name">${characterName}</span> Available Skill Points: ${skillTree.skillPoints}`;

  container.querySelectorAll('.skill-node').forEach((node) => {
    const skillId = node.dataset.skillId;
    const currentLevel = skillTree.skills[skillId]?.level || 0;
    const canUnlock = skillTree.canUnlockSkill(skillId);

    const levelDisplay = node.querySelector('.skill-level');
    const skill = SKILL_TREES[skillTree.selectedPath.name][skillId];

    levelDisplay.textContent = skill.maxLevel == Infinity ? `${currentLevel}` : `${currentLevel}/${skill.maxLevel}`;

    node.classList.toggle('available', canUnlock);
    node.classList.toggle('unlocked', !!skillTree.skills[skillId]);
  });
}

function showSkillTree() {
  const container = document.getElementById('skill-tree-container');
  if (!container.children.length) {
    initializeSkillTreeStructure();
  } else {
    updateSkillTreeValues();
  }
}

function createSkillElement(skill) {
  const skillElement = document.createElement('div');
  skillElement.className = 'skill-node';
  skillElement.dataset.skillId = skill.id;
  skillElement.dataset.skillType = skill.type;

  const updateTooltipContent = () => {
    const currentLevel = skillTree.skills[skill.id]?.level || 0;
    const canUnlock = skillTree.canUnlockSkill(skill.id);

    // Calculate effects at current level
    const effectsCurrent = skill.effect(currentLevel);
    // Calculate effects at next level (if not maxed out)
    const nextLevel = currentLevel < skill.maxLevel ? currentLevel + 1 : currentLevel;
    const effectsNext = skill.effect(nextLevel);

    let skillDescription = `
    <strong>${skill.name} [${skill.type.toUpperCase()}]</strong><br>
    ${skill.description
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .join('<br>')}
    <br>
    Level: ${currentLevel}${skill.maxLevel !== Infinity ? `/${skill.maxLevel}` : ''}
  `;

    if (skill.manaCost) {
      skillDescription += `<br />Mana Cost: ${skill.manaCost}`;
    }
    if (skill.cooldown) {
      skillDescription += `<br />Cooldown: ${skill.cooldown / 1000}s`;
    }
    if (skill.duration) {
      skillDescription += `<br />Duration: ${skill.duration / 1000}s`;
    }

    // Calculate effects at current level
    if (effectsCurrent && Object.keys(effectsCurrent).length > 0) {
      skillDescription += '<br /><u>Current Effects:</u><br />';
      Object.entries(effectsCurrent).forEach(([stat, value]) => {
        const decimals = STATS[stat].decimalPlaces || 0;
        const formattedValue = value.toFixed(decimals);
        skillDescription += `${stat}: +${formattedValue}<br />`;
      });
    }

    // If not at max level, show next level effects and the bonus
    if (currentLevel < skill.maxLevel || skill.maxLevel === Infinity) {
      skillDescription += '<br /><u>Next Level Effects:</u><br />';
      Object.entries(effectsNext).forEach(([stat, value]) => {
        const decimals = STATS[stat].decimalPlaces || 0;
        const currentValue = effectsCurrent[stat] || 0;
        const difference = value - currentValue;
        skillDescription += `${stat}: +${value.toFixed(decimals)} <span class="bonus">(+${difference.toFixed(
          decimals
        )})</span><br />`;
      });
    }

    return skillDescription;
  };

  skillElement.innerHTML = html`
    <div class="skill-icon" style="background-image: url('${import.meta.env.BASE_URL}skills/${skill.icon}.jpg')"></div>
    <div class="skill-level">
      ${skillTree.skills[skill.id]?.level || 0}${skill.maxLevel !== Infinity ? `/${skill.maxLevel}` : ''}
    </div>
  `;

  skillElement.addEventListener('mouseenter', (e) => showTooltip(updateTooltipContent(), e));
  skillElement.addEventListener('mousemove', positionTooltip);
  skillElement.addEventListener('mouseleave', hideTooltip);

  skillElement.addEventListener('click', (e) => {
    if (skillTree.unlockSkill(skill.id)) {
      updateSkillTreeValues();
      // Update tooltip content after skill upgrade
      showTooltip(updateTooltipContent(), { clientX: e.clientX, clientY: e.clientY });
    }
  });

  return skillElement;
}

export function updateActionBar() {
  const skillSlotsContainer = document.querySelector('.skill-slots');
  if (!skillSlotsContainer) return;

  skillSlotsContainer.innerHTML = '';
  let slotNumber = 1;

  Object.entries(skillTree.skills).forEach(([skillId, skill]) => {
    if (skill.type === 'passive') return;

    const skillSlot = document.createElement('div');
    skillSlot.className = 'skill-slot';
    skillSlot.dataset.skillId = skillId;
    skillSlot.dataset.key = slotNumber;

    // Add key number indicator
    const keyIndicator = document.createElement('div');
    keyIndicator.className = 'key-indicator';
    skillSlot.appendChild(keyIndicator);

    // Add overlays for buff visualization
    const cooldownOverlay = document.createElement('div');
    cooldownOverlay.className = 'cooldown-overlay';
    skillSlot.appendChild(cooldownOverlay);

    // Add skill icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'skill-icon';
    iconDiv.style.backgroundImage = `url('${import.meta.env.BASE_URL}skills/${skill.icon}.jpg')`;
    skillSlot.appendChild(iconDiv);

    // Show active state
    if (skillTree.activeBuffs.has(skillId)) {
      skillSlot.classList.add('active');
    }

    // Use the reusable tooltip
    skillSlot.addEventListener('mouseenter', (e) => showTooltip(createSkillTooltip(skillId), e));
    skillSlot.addEventListener('mousemove', positionTooltip);
    skillSlot.addEventListener('mouseleave', hideTooltip);

    skillSlot.addEventListener('click', () => skillTree.toggleSkill(skillId));
    skillSlotsContainer.appendChild(skillSlot);
    slotNumber++;
  });

  // Update buff/cooldown indicators
  updateBuffIndicators();
  // Add keyboard listeners
  setupKeyboardShortcuts();
}

function createSkillTooltip(skillId) {
  const skill = SKILL_TREES[skillTree.selectedPath?.name][skillId];
  const skillData = skillTree.skills[skillId];
  const level = skillData?.level || 0;
  const effects = skill.effect(level);

  let tooltip = `
      <div class="tooltip-header">${skill.name}</div>
      <div class="tooltip-type">${skill.type.toUpperCase()}</div>
      <div class="tooltip-level">Level: ${level}</div>
      <div class="tooltip-mana">Mana Cost: ${skill.manaCost}</div>
  `;

  // Add effects
  tooltip += '<div class="tooltip-effects">';
  Object.entries(effects).forEach(([stat, value]) => {
    const decimals = STATS[stat].decimalPlaces || 0;
    const formattedValue = value.toFixed(decimals);
    tooltip += `<div>${stat}: +${formattedValue}</div>`;
  });
  tooltip += '</div>';

  // Add cooldown/duration for applicable skills
  if (skill.cooldown) {
    tooltip += `<div class="tooltip-cooldown">Cooldown: ${skill.cooldown / 1000}s</div>`;
  }
  if (skill.duration) {
    tooltip += `<div class="tooltip-duration">Duration: ${skill.duration / 1000}s</div>`;
  }

  return tooltip;
}

function setupKeyboardShortcuts() {
  document.removeEventListener('keydown', handleKeyPress); // Remove existing listener
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(e) {
  if (e.key >= '1' && e.key <= '9') {
    const slot = document.querySelector(`.skill-slot[data-key="${e.key}"]`);
    if (slot) {
      const skillId = slot.dataset.skillId;
      skillTree.toggleSkill(skillId);
    }
  }
}

export function updateBuffIndicators() {
  document.querySelectorAll('.skill-slot').forEach((slot) => {
    const skillId = slot.dataset.skillId;
    const skill = skillTree.skills[skillId];
    const cooldownOverlay = slot.querySelector('.cooldown-overlay');

    // Handle active states for all skill types
    const isActive =
      (skill.type === 'buff' && skillTree.activeBuffs.has(skillId)) || (skill.type === 'toggle' && skill.active);

    slot.classList.toggle('active', isActive);

    // Show cooldown for both buff and instant skills
    if ((skill.type === 'buff' || skill.type === 'instant') && skill?.cooldownEndTime) {
      const remaining = skill.cooldownEndTime - Date.now();
      if (remaining > 0) {
        const percentage = (remaining / SKILL_TREES[skillTree.selectedPath.name][skillId].cooldown) * 100;
        cooldownOverlay.style.height = `${percentage}%`;
        slot.classList.add('on-cooldown');
      } else {
        cooldownOverlay.style.height = '0';
        slot.classList.remove('on-cooldown');
      }
    }
  });
}

export function showManaWarning() {
  showToast('Not enough mana!', 'warning', 1500);
}

// ##########################################
//  #########################################
// ##########################################
// ##########################################
//  ########### SKILL TREE ##################
// ##########################################
// ##########################################
//  #########################################
// ##########################################

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
