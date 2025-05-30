import { calculateHitChance } from '../combat.js';
import { hero, game } from '../globals.js';
import { ATTRIBUTES } from '../hero.js';
import { STATS } from '../stats.js';
import { hideTooltip, positionTooltip, showTooltip } from '../ui.js';
import { OFFENSE_STATS } from '../stats/offenseStats.js';
import { DEFENSE_STATS } from '../stats/defenseStats.js';
import { MISC_STATS } from '../stats/miscStats.js';
import { formatStatName } from '../ui.js';

const html = String.raw;

// allocation mode selector (global for attribute buttons)
let allocationMode = 1;

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

  getLifeTooltip: () => html`
    <strong>Life</strong><br />
    Maximum life points.<br />
    Increased by Vitality and level ups.
  `,

  getLifeRegenerationTooltip: () => html`
    <strong>Life Regeneration</strong><br />
    Amount of life recovered per second.
  `,

  getManaTooltip: () => html`
    <strong>Mana</strong><br />
    Maximum mana points.<br />
    Increased by Wisdom and level ups.
  `,

  getManaRegenerationTooltip: () => html`
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

export function updateStatsAndAttributesUI() {
  const statsGrid = document.querySelector('.stats-grid');

  if (!statsGrid) return;

  // Ensure sections exist; create them only if they don't
  let statsContainer = document.querySelector('.stats-container');
  let attributesContainer = document.querySelector('.attributes-container');

  if (!statsContainer) {
    statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    // Header: level, EXP, highest stage
    const headerHtml = html`
      <div><strong>Level:</strong> <span id="level-value">${hero.level || 1}</span></div>
      <div>
        <strong>EXP:</strong> <span id="exp-value">${hero.exp || 0}</span> /
        <span id="exp-to-next-level-value">${hero.expToNextLevel || 100}</span>
        (<span id="exp-progress">${((hero.exp / hero.expToNextLevel) * 100).toFixed(1)}%</span>)
      </div>
      <div><strong>Highest Stage:</strong><span id="highest-stage-value">${hero.highestStage}</span></div>
      <hr style="border: none; border-top: 1px solid #fff; margin: 10px 0;" />
    `;
    // Create tab buttons
    const tabsHtml = html`
      <div class="stats-tabs">
        <button class="subtab-btn active" data-subtab="offense">Offense</button>
        <button class="subtab-btn" data-subtab="defense">Defense</button>
        <button class="subtab-btn" data-subtab="misc">Misc</button>
      </div>
    `;
    // Combine header and tabs
    statsContainer.innerHTML = headerHtml + tabsHtml;
    // Create panels
    const createPanel = (name) => {
      const panel = document.createElement('div');
      panel.className = 'stats-panel';
      if (name === 'offense') panel.classList.add('active');
      panel.id = `${name}-panel`;
      return panel;
    };
    const offensePanel = createPanel('offense');
    const defensePanel = createPanel('defense');
    const miscPanel = createPanel('misc');
    // Populate panels based on showInUI flags
    const addStatsToPanel = (panel, statsDef) => {
      const elementalKeys = ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage'];
      const collectedElementals = [];
      Object.keys(statsDef).forEach((key) => {
        if (!statsDef[key].showInUI) return;
        // Collect elementals separately for offense panel
        if (panel === offensePanel && elementalKeys.includes(key)) {
          collectedElementals.push(key);
          return;
        }
        const row = document.createElement('div');
        row.className = 'stat-row';
        const lbl = document.createElement('span');
        lbl.className = 'stat-label';
        lbl.textContent = formatStatName(key);
        const span = document.createElement('span');
        span.id = `${key}-value`;
        let val = hero.stats[key];
        if (typeof val === 'number' && statsDef[key].decimalPlaces !== undefined) {
          val = val.toFixed(statsDef[key].decimalPlaces);
        }
        span.textContent = val;
        row.appendChild(lbl);
        row.appendChild(document.createTextNode(' '));
        row.appendChild(span);
        // Append computed stats in parentheses for special cases
        if (key === 'attackRating') {
          const hitPct = calculateHitChance(hero.stats.attackRating, game.stage).toFixed(2) + '%';
          row.appendChild(document.createTextNode(` (${hitPct})`));
        }
        if (key === 'armor') {
          const ar = hero.calculateArmorReduction().toFixed(2) + '%';
          row.appendChild(document.createTextNode(` (${ar})`));
        }
        panel.appendChild(row);
        // Add tooltip if defined (special-case elemental stats)
        const baseKey = lbl.textContent.replace(/[^a-zA-Z]/g, '');
        let tooltipFn = ATTRIBUTE_TOOLTIPS[`get${baseKey}Tooltip`];
        // For offense elementals override tooltip
        if (panel === offensePanel && ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage'].includes(key)) {
          tooltipFn = ATTRIBUTE_TOOLTIPS.getElementalDamageTooltip;
        }
        if (tooltipFn) {
          lbl.addEventListener('mouseenter', (e) => showTooltip(tooltipFn(), e));
          lbl.addEventListener('mousemove', positionTooltip);
          lbl.addEventListener('mouseleave', hideTooltip);
        }
      });
      // After other stats, render elemental grid in offense panel
      if (panel === offensePanel && collectedElementals.length) {
        const iconMap = { fireDamage: '🔥', coldDamage: '❄️', airDamage: '☁️', earthDamage: '🌍' };
        const grid = document.createElement('div');
        grid.className = 'elemental-stats-grid';
        ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage'].forEach((key) => {
          if (!collectedElementals.includes(key)) return;
          const row = document.createElement('div');
          row.className = 'elemental-row';
          const icon = document.createElement('span');
          icon.textContent = iconMap[key];
          const lbl = document.createElement('strong');
          lbl.textContent = formatStatName(key);
          // Add tooltip for elemental damage
          lbl.addEventListener('mouseenter', (e) => showTooltip(ATTRIBUTE_TOOLTIPS.getElementalDamageTooltip(), e));
          lbl.addEventListener('mousemove', positionTooltip);
          lbl.addEventListener('mouseleave', hideTooltip);
          const span = document.createElement('span');
          span.id = `${key}-value`;
          let val = hero.stats[key];
          span.textContent = val;
          row.appendChild(icon);
          row.appendChild(lbl);
          row.appendChild(document.createTextNode(' '));
          row.appendChild(span);
          grid.appendChild(row);
        });
        panel.appendChild(grid);
      }
    };
    addStatsToPanel(offensePanel, OFFENSE_STATS);
    addStatsToPanel(defensePanel, DEFENSE_STATS);
    addStatsToPanel(miscPanel, MISC_STATS);
    statsContainer.appendChild(offensePanel);
    statsContainer.appendChild(defensePanel);
    statsContainer.appendChild(miscPanel);
    // Tab switching logic
    statsContainer.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // mark button active
        statsContainer.querySelectorAll('.subtab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const sub = btn.dataset.subtab;
        // toggle panels
        statsContainer.querySelectorAll('.stats-panel').forEach((p) => p.classList.remove('active'));
        const target = statsContainer.querySelector(`#${sub}-panel`);
        if (target) target.classList.add('active');
      });
    });
    statsGrid.appendChild(statsContainer);
  } else {
    // Update dynamic stats values
    document.getElementById('level-value').textContent = hero.level || 1;
    document.getElementById('exp-value').textContent = hero.exp || 0;
    document.getElementById('exp-progress').textContent = ((hero.exp / hero.expToNextLevel) * 100).toFixed(1) + '%';
    document.getElementById('exp-to-next-level-value').textContent = hero.expToNextLevel || 100;
    document.getElementById('highest-stage-value').textContent = hero.highestStage;
    document.getElementById('damage-value').textContent = hero.stats.damage;
    document.getElementById('attackSpeed-value').textContent = hero.stats.attackSpeed
      .toFixed(STATS.attackSpeed.decimalPlaces)
      .replace(/\./g, ',');
    document.getElementById('attackRating-value').textContent = hero.stats.attackRating;
    document.getElementById('critChance-value').textContent =
      hero.stats.critChance.toFixed(STATS.critChance.decimalPlaces).replace(/\./g, ',') + '%';
    document.getElementById('critDamage-value').textContent =
      hero.stats.critDamage.toFixed(STATS.critDamage.decimalPlaces).replace(/\./g, ',') + 'x';

    document.getElementById('lifeSteal-value').textContent =
      hero.stats.lifeSteal.toFixed(STATS.lifeSteal.decimalPlaces).replace(/\./g, ',') + '%';
    document.getElementById('fireDamage-value').textContent = hero.stats.fireDamage;
    document.getElementById('coldDamage-value').textContent = hero.stats.coldDamage;
    document.getElementById('airDamage-value').textContent = hero.stats.airDamage;
    document.getElementById('earthDamage-value').textContent = hero.stats.earthDamage;

    document.getElementById('life-value').textContent = hero.stats.life;
    document.getElementById('lifeRegen-value').textContent = hero.stats.lifeRegen
      .toFixed(STATS.lifeRegen.decimalPlaces)
      .replace(/\./g, ',');
    document.getElementById('mana-value').textContent = hero.stats.mana;
    document.getElementById('manaRegen-value').textContent = hero.stats.manaRegen
      .toFixed(STATS.manaRegen.decimalPlaces)
      .replace(/\./g, ',');
    document.getElementById('armor-value').textContent = hero.stats.armor || 0;
    document.getElementById('blockChance-value').textContent =
      hero.stats.blockChance.toFixed(STATS.blockChance.decimalPlaces).replace(/\./g, ',') + '%';
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    attributesContainer.innerHTML = html`
      <div class="attributes-header">
        <h3 id="attributes">Attributes (+${hero.statPoints})</h3>
        <div class="allocate-modes" style="margin-bottom:8px;">
          <button class="mode-btn" data-amount="1">+1</button>
          <button class="mode-btn" data-amount="30">+30</button>
          <button class="mode-btn" data-amount="60">+60</button>
          <button class="mode-btn" data-amount="120">+120</button>
          <button class="mode-btn" data-amount="max">MAX</button>
        </div>
      </div>
      <div class="attributes-body">
        ${Object.entries(hero.stats)
          .map(([stat, value]) => {
            if (!ATTRIBUTES[stat]) return '';
            const displayName = stat.charAt(0).toUpperCase() + stat.slice(1);
            return `
            <div class="attribute-row">
              <button class="allocate-btn" data-stat="${stat}">+</button>
              <strong>${displayName}:</strong>
              <span id="${stat}-value">${hero.stats[stat]}</span>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    // mode button handlers
    attributesContainer.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        allocationMode = btn.dataset.amount;
        attributesContainer.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // set default active mode
    attributesContainer.querySelector(`.mode-btn[data-amount="${allocationMode}"]`).classList.add('active');

    attributesContainer.querySelectorAll('.attribute-row').forEach((row) => {
      const stat = row.querySelector('button').dataset.stat;
      row.addEventListener('mouseenter', (e) =>
        showTooltip(ATTRIBUTE_TOOLTIPS[`get${stat.charAt(0).toUpperCase() + stat.slice(1)}Tooltip`](), e)
      );
      row.addEventListener('mousemove', positionTooltip);
      row.addEventListener('mouseleave', hideTooltip);
    });

    // attach allocate handler
    attributesContainer.querySelectorAll('.allocate-btn').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        const stat = e.target.dataset.stat;
        // allocate based on allocationMode
        if (allocationMode === 'max') {
          while (hero.statPoints > 0) hero.allocateStat(stat);
        } else {
          const count = parseInt(allocationMode, 10) || 1;
          for (let i = 0; i < count && hero.statPoints > 0; i++) {
            hero.allocateStat(stat);
          }
        }
        updateStatsAndAttributesUI();

        let intervalId, holdingTimeout;
        const startHolding = () => {
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            if (hero.statPoints > 0) {
              if (allocationMode === 'max') {
                while (hero.statPoints > 0) hero.allocateStat(stat);
              } else {
                for (let i = 0; i < (parseInt(allocationMode, 10) || 1) && hero.statPoints > 0; i++) {
                  hero.allocateStat(stat);
                }
              }
              updateStatsAndAttributesUI();
            } else stopHolding();
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

    // Add attributes container to the grid
    statsGrid.appendChild(attributesContainer);
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
