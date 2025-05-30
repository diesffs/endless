import { calculateHitChance } from '../combat.js';
import { hero, game } from '../globals.js';
import { ATTRIBUTES } from '../hero.js';
import { STATS } from '../stats.js';
import { hideTooltip, positionTooltip, showTooltip } from '../ui.js';

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
      <div class="attributes-header">
        <h3 id="attributes">Attributes (+${hero.statPoints})</h3>
        <div class="allocate-modes" style="margin-bottom:8px;">
          <button class="mode-btn" data-amount="1">+1</button>
          <button class="mode-btn" data-amount="12">+12</button>
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
