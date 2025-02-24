import Enemy from './enemy.js';
import { game, hero, prestige, skillTree } from './main.js';
import { calculateHitChance } from './combat.js';
import { CLASS_PATHS, REQ_LEVEL_FOR_SKILL_TREE, SKILL_LEVEL_TIERS, SKILL_TREES } from './skillTree.js';
import { ATTRIBUTE_TOOLTIPS, STAT_DECIMAL_PLACES } from './hero.js';

const html = String.raw;

export function initializeUI() {
  game.currentEnemy = new Enemy(game.zone);
  game.activeTab = 'inventory';
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(game, btn.dataset.tab));
  });
  document.getElementById('start-btn').addEventListener('click', () => toggleGame());

  updateZoneUI();
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
  if (!game || typeof game.zone !== 'number') {
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

export function updatePlayerHealth() {
  const stats = hero.stats;
  const healthPercentage = (stats.currentHealth / stats.health) * 100;
  document.getElementById('health-fill').style.width = `${healthPercentage}%`;
  document.getElementById('health-text').textContent = `${Math.max(0, Math.floor(stats.currentHealth))}/${Math.floor(
    stats.health
  )}`;

  const manaPercentage = (stats.currentMana / stats.mana) * 100;
  document.getElementById('mana-fill').style.width = `${manaPercentage}%`;
  document.getElementById('mana-text').textContent = `${Math.max(0, Math.floor(stats.currentMana))}/${Math.floor(
    stats.mana
  )}`;
}

export function updateEnemyHealth() {
  const enemy = game.currentEnemy;
  const healthPercentage = (enemy.currentHealth / enemy.health) * 100;
  document.getElementById('enemy-health-fill').style.width = `${healthPercentage}%`;
  document.getElementById('enemy-health-text').textContent = `${Math.max(
    0,
    Math.floor(enemy.currentHealth)
  )}/${Math.floor(enemy.health)}`;
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
      <!-- xp, lvl, zone -->
      <div><strong>Level:</strong> <span id="level-value">${hero.level || 1}</span></div>
      <div>
        <strong>EXP:</strong> <span id="exp-value">${hero.exp || 0}</span> /
        <span id="exp-to-next-level-value">${hero.expToNextLevel || 100}</span>
        (<span id="exp-progress">${((hero.exp / hero.expToNextLevel) * 100).toFixed(1)}%</span>)
      </div>

      <div><strong>Highest Zone:</strong><span id="highest-zone-value">${hero.highestZone}</span></div>

      <!-- OFFENSE -->

      <hr style="margin: 5px 1px" />
      <div><strong>Damage:</strong> <span id="damage-value">${hero.stats.damage}</span></div>

      <div>
        <strong>Attack Speed:</strong>
        <span id="attack-speed-value"
          >${hero.stats.attackSpeed.toFixed(STAT_DECIMAL_PLACES.attackSpeed).replace(/\./g, ',')}</span
        >
        attacks/sec
      </div>

      <div>
        <strong>Attack Rating:</strong>
        <span id="attack-rating-value">${hero.stats.attackRating}</span> (<span id="hit-chance-value">
          ${calculateHitChance(hero.stats.attackRating, game.zone).toFixed(2)}%</span
        >)
      </div>

      <div>
        <strong>Crit Chance:</strong>
        <span id="crit-chance-value"
          >${hero.stats.critChance.toFixed(STAT_DECIMAL_PLACES.critChance).replace(/\./g, ',')}%</span
        >
      </div>

      <div>
        <strong>Crit Damage:</strong>
        <span id="crit-damage-value"
          >${hero.stats.critDamage.toFixed(STAT_DECIMAL_PLACES.critDamage).replace(/\./g, ',')}x</span
        >
      </div>

      <div>
        <strong>Life Steal:</strong>
        <span id="life-steal-value">${hero.stats.lifeSteal.toFixed(STAT_DECIMAL_PLACES.lifeSteal)}%</span>
      </div>
      <div class="elemental-damage">
        <div><strong>🔥 Fire Damage:</strong> <span id="fire-damage-value">${hero.stats.fireDamage}</span></div>
        <div><strong>❄️ Cold Damage:</strong> <span id="cold-damage-value">${hero.stats.coldDamage}</span></div>
        <div><strong>☁️ Air Damage:</strong> <span id="air-damage-value">${hero.stats.airDamage}</span></div>
        <div><strong>🌍 Earth Damage:</strong> <span id="earth-damage-value">${hero.stats.earthDamage}</span></div>
      </div>

      <!-- DEFENSE -->
      <hr style="margin: 5px 1px" />

      <div><strong>Health:</strong> <span id="max-health-value">${hero.stats.health}</span></div>
      <div>
        <strong>Health Regen:</strong>
        <span id="health-regen-value"
          >${hero.stats.lifeRegen.toFixed(STAT_DECIMAL_PLACES.lifeRegen).replace(/\./g, ',')}</span
        >/s
      </div>
      <div><strong>Mana:</strong> <span id="max-mana-value">${hero.stats.mana}</span></div>
      <div>
        <strong>Mana Regen:</strong>
        <span id="mana-regen-value"
          >${hero.stats.manaRegen.toFixed(STAT_DECIMAL_PLACES.manaRegen).replace(/\./g, ',')}</span
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
          >${hero.stats.blockChance.toFixed(STAT_DECIMAL_PLACES.blockChance).replace(/\./g, ',')}%</span
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
      statsContainer.querySelector('#max-health-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getMaxHealthTooltip
    );
    addTooltipToElement(
      statsContainer.querySelector('#health-regen-value').previousElementSibling,
      ATTRIBUTE_TOOLTIPS.getHealthRegenTooltip
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
    document.getElementById('exp-to-next-level-value').textContent = hero.expToNextLevel || 100;
    document.getElementById('highest-zone-value').textContent = hero.highestZone;
    document.getElementById('damage-value').textContent = hero.stats.damage;
    document.getElementById('attack-speed-value').textContent = hero.stats.attackSpeed
      .toFixed(STAT_DECIMAL_PLACES.attackSpeed)
      .replace(/\./g, ',');
    document.getElementById('attack-rating-value').textContent = hero.stats.attackRating;
    document.getElementById('hit-chance-value').textContent =
      calculateHitChance(hero.stats.attackRating, game.zone).toFixed(2) + '%';
    document.getElementById('crit-chance-value').textContent =
      hero.stats.critChance.toFixed(STAT_DECIMAL_PLACES.critChance).replace(/\./g, ',') + '%';
    document.getElementById('crit-damage-value').textContent =
      hero.stats.critDamage.toFixed(STAT_DECIMAL_PLACES.critDamage).replace(/\./g, ',') + 'x';

    document.getElementById('life-steal-value').textContent =
      hero.stats.lifeSteal.toFixed(STAT_DECIMAL_PLACES.lifeSteal) + '%';
    document.getElementById('fire-damage-value').textContent = hero.stats.fireDamage;
    document.getElementById('cold-damage-value').textContent = hero.stats.coldDamage;
    document.getElementById('air-damage-value').textContent = hero.stats.airDamage;
    document.getElementById('earth-damage-value').textContent = hero.stats.earthDamage;

    document.getElementById('max-health-value').textContent = hero.stats.health;
    document.getElementById('health-regen-value').textContent = hero.stats.lifeRegen
      .toFixed(STAT_DECIMAL_PLACES.lifeRegen)
      .replace(/\./g, ',');
    document.getElementById('max-mana-value').textContent = hero.stats.mana;
    document.getElementById('mana-regen-value').textContent = hero.stats.manaRegen
      .toFixed(STAT_DECIMAL_PLACES.manaRegen)
      .replace(/\./g, ',');
    document.getElementById('armor-value').textContent = hero.stats.armor || 0;
    document.getElementById('armor-reduction-value').textContent =
      hero.calculateArmorReduction().toFixed(2).replace(/\./g, ',') + '%';
    document.getElementById('block-chance-value').textContent =
      hero.stats.blockChance.toFixed(STAT_DECIMAL_PLACES.blockChance).replace(/\./g, ',') + '%';
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    attributesContainer.innerHTML = html`
      <h3 id="attributes">Attributes (+${hero.statPoints})</h3>
      ${Object.entries(hero.primaryStats)
        .map(
          ([stat, value]) => `
      <div class="attribute-row">
        <button class="allocate-btn" data-stat="${stat}">+</button>
        <strong>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</strong>
        <span id="${stat}-value">${hero.stats[stat]}</span>
      </div>
    `
        )
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

export function updateZoneUI() {
  const zone = game.zone;
  const zoneDisplay = document.getElementById('zone-display');
  if (zoneDisplay) {
    zoneDisplay.textContent = `Zone: ${zone}`;
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

  if (!skillTree.selectedPath) {
    classSelection.classList.remove('hidden');
    skillTreeContainer.classList.add('hidden');
    showClassSelection();
  } else {
    classSelection.classList.add('hidden');
    skillTreeContainer.classList.remove('hidden');
    showSkillTree();
  }

  updateActionBar();
}

function showClassSelection() {
  const classSelection = document.getElementById('class-selection');
  classSelection.innerHTML = '';

  Object.entries(CLASS_PATHS).forEach(([pathId, pathData]) => {
    if (!pathData.enabled) return;
    const pathElement = document.createElement('div');
    pathElement.className = 'class-path';
    pathElement.innerHTML = html`
      <h3>${pathData.name}</h3>
      <p>${pathData.description}</p>
      <div class="base-stats">
        ${Object.entries(pathData.baseStats)
          .map(([stat, value]) => {
            const readableStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            return `<div>${readableStat}: +${value}</div>`;
          })
          .join('')}
      </div>
    `;

    const button = document.createElement('button');
    button.textContent =
      hero.level < REQ_LEVEL_FOR_SKILL_TREE ? `Requires Level ${REQ_LEVEL_FOR_SKILL_TREE}` : 'Choose Path';
    // button.disabled = hero.level < REQ_LEVEL_FOR_SKILL_TREE;
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
  if (!skillTree.selectedPath) {
    return;
  }
  const container = document.getElementById('skill-tree-container');

  const skillPointsHeader = container.querySelector('.skill-points-header');
  skillPointsHeader.textContent = `Available Skill Points: ${skillTree.skillPoints}`;

  container.querySelectorAll('.skill-node').forEach((node) => {
    const skillId = node.dataset.skillId;
    const currentLevel = skillTree.skills[skillId]?.level || 0;
    const canUnlock = skillTree.canUnlockSkill(skillId);

    const levelDisplay = node.querySelector('.skill-level');
    const skill = SKILL_TREES[skillTree.selectedPath.name][skillId];
    levelDisplay.textContent = skill.maxLevel === Infinity ? `${currentLevel}` : `${currentLevel}/${skill.maxLevel}`;

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
        const decimals = STAT_DECIMAL_PLACES[stat] || 0;
        const formattedValue = value.toFixed(decimals);
        skillDescription += `${stat}: +${formattedValue}<br />`;
      });
    }

    // If not at max level, show next level effects and the bonus
    if (currentLevel < skill.maxLevel || skill.maxLevel === Infinity) {
      skillDescription += '<br /><u>Next Level Effects:</u><br />';
      Object.entries(effectsNext).forEach(([stat, value]) => {
        const decimals = STAT_DECIMAL_PLACES[stat] || 0;
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
    <div class="skill-icon" style="background-image: url('assets/skills/${skill.icon}.png')"></div>
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
    iconDiv.style.backgroundImage = `url('assets/skills/${skill.icon}.png')`;
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
    const decimals = STAT_DECIMAL_PLACES[stat] || 0;
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
