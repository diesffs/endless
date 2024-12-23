import Enemy from './enemy.js';
import { game, hero, prestige, skillTree } from './main.js';
import { calculateHitChance } from './combat.js';
import { CLASS_PATHS, REQ_LEVEL_FOR_SKILL_TREE, SKILL_LEVEL_TIERS, SKILL_TREES } from './skillTree.js';
import { ATTRIBUTES } from './hero.js';

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

  // Update highest zone if displayed
  const highestZoneElement = document.getElementById('highest-zone');
  if (highestZoneElement) {
    highestZoneElement.textContent = `Highest Zone: ${hero.highestZone || 1}`;
  }

  // Update other stats
  document.getElementById('gold').textContent = hero.gold || 0;
}

export function updatePlayerHealth() {
  const stats = hero.stats;
  const healthPercentage = (stats.currentHealth / stats.maxHealth) * 100;
  document.getElementById('health-fill').style.width = `${healthPercentage}%`;
  document.getElementById('health-text').textContent = `${Math.max(0, Math.floor(stats.currentHealth))}/${Math.floor(
    stats.maxHealth
  )}`;

  const manaPercentage = (stats.currentMana / stats.maxMana) * 100;
  document.getElementById('mana-fill').style.width = `${manaPercentage}%`;
  document.getElementById('mana-text').textContent = `${Math.max(0, Math.floor(stats.currentMana))}/${Math.floor(
    stats.maxMana
  )}`;
}

export function updateEnemyHealth() {
  const enemy = game.currentEnemy;
  const healthPercentage = (enemy.currentHealth / enemy.maxHealth) * 100;
  document.getElementById('enemy-health-fill').style.width = `${healthPercentage}%`;
  document.getElementById('enemy-health-text').textContent = `${Math.max(
    0,
    Math.floor(enemy.currentHealth)
  )}/${Math.floor(enemy.maxHealth)}`;
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
      </div>
      <div><strong>Highest Zone:</strong><span id="highest-zone-value">${hero.highestZone}</span></div>

      <!-- OFFENSE -->

      <hr style="margin: 5px 1px" />
      <div><strong>Damage:</strong> <span id="damage-value">${hero.stats.damage.toFixed(0)}</span></div>

      <div>
        <strong>Attack Speed:</strong>
        <span id="attack-speed-value">${hero.stats.attackSpeed.toFixed(2).replace(/\./g, ',')}</span> attacks/sec
      </div>

      <div>
        <strong>Attack Rating:</strong>
        <span id="attack-rating-value">${hero.stats.attackRating.toFixed(0)}</span> (<span id="hit-chance-value">
          ${calculateHitChance(hero.stats.attackRating, game.zone).toFixed(1)}%</span
        >)
      </div>

      <div>
        <strong>Crit Chance:</strong>
        <span id="crit-chance-value">${hero.stats.critChance.toFixed(1).replace(/\./g, ',')}%</span>
      </div>

      <div>
        <strong>Crit Damage:</strong>
        <span id="crit-damage-value">${hero.stats.critDamage.toFixed(2).replace(/\./g, ',')}x</span>
      </div>

      <div><strong>Life Steal:</strong> <span id="life-steal-value">${hero.stats.lifeSteal.toFixed(1)}%</span></div>
      <div class="elemental-damage">
        <div><strong>🔥 Fire Damage:</strong> <span id="fire-damage-value">${hero.stats.fireDamage}</span></div>
        <div><strong>❄️ Cold Damage:</strong> <span id="cold-damage-value">${hero.stats.coldDamage}</span></div>
        <div>
          <strong>⚡ Lightning Damage:</strong> <span id="lightning-damage-value">${hero.stats.lightningDamage}</span>
        </div>
        <div><strong>💧 Water Damage:</strong> <span id="water-damage-value">${hero.stats.waterDamage}</span></div>
      </div>

      <!-- DEFENSE -->
      <hr style="margin: 5px 1px" />

      <div><strong>Health:</strong> <span id="max-health-value">${hero.stats.maxHealth}</span></div>
      <div>
        <strong>Health Regen:</strong>
        <span id="health-regen-value">${hero.stats.lifeRegen.toFixed(1).replace(/\./g, ',')}</span>/s
      </div>
      <div><strong>Mana:</strong> <span id="max-mana-value">${hero.stats.maxMana.toFixed(0)}</span></div>
      <div>
        <strong>Mana Regen:</strong>
        <span id="mana-regen-value">${hero.stats.manaRegen.toFixed(1).replace(/\./g, ',')}</span>/s
      </div>

      <div>
        <strong>Armor:</strong> <span id="armor-value">${hero.stats.armor || 0}</span> (
        <span id="armor-reduction-value"> ${hero.calculateArmorReduction().toFixed(2).replace(/\./g, ',')} </span>
        reduction)
      </div>

      <div>
        <strong>Block Chance:</strong>
        <span id="block-chance-value">${hero.stats.blockChance.toFixed(1).replace(/\./g, ',')}%</span>
      </div>
    `;
    statsGrid.appendChild(statsContainer);
  } else {
    // Update dynamic stats values
    document.getElementById('level-value').textContent = hero.level || 1;
    document.getElementById('exp-value').textContent = hero.exp || 0;
    document.getElementById('exp-to-next-level-value').textContent = hero.expToNextLevel || 100;
    document.getElementById('highest-zone-value').textContent = hero.highestZone;
    document.getElementById('damage-value').textContent = hero.stats.damage.toFixed(0);
    document.getElementById('attack-speed-value').textContent = hero.stats.attackSpeed.toFixed(2).replace(/\./g, ',');
    document.getElementById('attack-rating-value').textContent = hero.stats.attackRating.toFixed(0);
    document.getElementById('hit-chance-value').textContent =
      calculateHitChance(hero.stats.attackRating, game.zone).toFixed(1) + '%';
    document.getElementById('crit-chance-value').textContent =
      hero.stats.critChance.toFixed(1).replace(/\./g, ',') + '%';
    document.getElementById('crit-damage-value').textContent =
      hero.stats.critDamage.toFixed(2).replace(/\./g, ',') + 'x';
    document.getElementById('max-health-value').textContent = hero.stats.maxHealth;
    document.getElementById('health-regen-value').textContent = hero.stats.lifeRegen.toFixed(1).replace(/\./g, ',');
    document.getElementById('max-mana-value').textContent = hero.stats.maxMana.toFixed(0);
    document.getElementById('mana-regen-value').textContent = hero.stats.manaRegen.toFixed(1).replace(/\./g, ',');
    document.getElementById('armor-value').textContent = hero.stats.armor || 0;
    document.getElementById('armor-reduction-value').textContent =
      hero.calculateArmorReduction().toFixed(2).replace(/\./g, ',') + '%';
    document.getElementById('block-chance-value').textContent =
      hero.stats.blockChance.toFixed(1).replace(/\./g, ',') + '%';
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
        <span id="${stat}-value">${hero.getStat(stat)}</span>
        <div class="attribute-description">${ATTRIBUTES[stat].tooltip}</div>
      </div>
    `
        )
        .join('')}
    `;

    attributesContainer.querySelectorAll('.attribute-row').forEach((row) => {
      row.addEventListener('mousemove', (e) => {
        const tooltip = row.querySelector('.attribute-description');
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
      });
    });

    statsGrid.appendChild(attributesContainer);

    // Attach event listeners for allocation buttons (only once)
    attributesContainer.querySelectorAll('.allocate-btn').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        const stat = e.target.dataset.stat;
        hero.allocateStat(stat);
        updateStatsAndAttributesUI();
      });
    });
  } else {
    document.getElementById(`attributes`).textContent = `Attributes (+${hero.statPoints})`;
    // Update dynamic attribute values
    document.getElementById('strength-value').textContent = hero.getStat('strength');
    document.getElementById('agility-value').textContent = hero.getStat('agility');
    document.getElementById('vitality-value').textContent = hero.getStat('vitality');
    document.getElementById('wisdom-value').textContent = hero.getStat('wisdom');
    document.getElementById('endurance-value').textContent = hero.getStat('endurance');
    document.getElementById('dexterity-value').textContent = hero.getStat('dexterity');
  }

  if (hero.level >= REQ_LEVEL_FOR_SKILL_TREE) {
    const skillTreeTab = document.querySelector('[data-tab="skilltree"]');
    skillTreeTab.classList.remove('hidden');
  }
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
    button.textContent = 'Choose Path';
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

function initializeSkillTreeStructure() {
  const container = document.getElementById('skill-tree-container');
  container.innerHTML = '';

  const skillPointsHeader = document.createElement('div');
  skillPointsHeader.className = 'skill-points-header';
  container.appendChild(skillPointsHeader);

  const skills = SKILL_TREES[skillTree.selectedPath.name];
  const levelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
    if (level <= hero.level) {
      acc[level] = [];
    }
    return acc;
  }, {});

  Object.entries(skills).forEach(([skillId, skillData]) => {
    if (skillData.requiredLevel <= hero.level && levelGroups[skillData.requiredLevel]) {
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
}

export function updateSkillTreeValues() {
  const container = document.getElementById('skill-tree-container');

  const skillPointsHeader = container.querySelector('.skill-points-header');
  skillPointsHeader.textContent = `Available Skill Points: ${skillTree.skillPoints}`;

  container.querySelectorAll('.skill-node').forEach((node) => {
    const skillId = node.dataset.skillId;
    const currentLevel = skillTree.skills[skillId]?.level || 0;
    const canUnlock = skillTree.canUnlockSkill(skillId);

    const levelDisplay = node.querySelector('.skill-level');
    const skill = SKILL_TREES[skillTree.selectedPath.name][skillId];
    levelDisplay.textContent = `${currentLevel}/${skill.maxLevel}`;

    node.classList.toggle('available', canUnlock);
    node.classList.toggle('unlocked', !!skillTree.skills[skillId]);
  });

  // Update buff indicators
  container.querySelectorAll('.skill-node[data-skill-type="buff"]').forEach((node) => {
    const skillId = node.dataset.skillId;
    const skill = skillTree.skills[skillId];
    const cooldownOverlay = node.querySelector('.cooldown-overlay');

    if (skill?.cooldownEndTime) {
      const remaining = skill.cooldownEndTime - Date.now();
      if (remaining > 0) {
        const percentage = (remaining / skill.cooldown) * 100;
        cooldownOverlay.style.height = `${percentage}%`;
        cooldownOverlay.classList.add('active');
      } else {
        cooldownOverlay.classList.remove('active');
      }
    }
  });
}

function showSkillTree() {
  const container = document.getElementById('skill-tree-container');
  if (!container.children.length) {
    initializeSkillTreeStructure();
  }
  updateSkillTreeValues();
}

function createSkillElement(skill) {
  const skillElement = document.createElement('div');
  skillElement.className = 'skill-node';
  skillElement.dataset.skillId = skill.id;
  skillElement.dataset.skillType = skill.type;

  const currentLevel = skillTree.skills[skill.id]?.level || 0;
  const canUnlock = skillTree.canUnlockSkill(skill.id);

  skillElement.innerHTML = html`
    <div class="skill-icon" style="background-image: url('assets/skills/${skill.icon}.png')"></div>
    <div class="skill-level">${currentLevel}/${skill.maxLevel}</div>
    <div class="skill-description">
      ${skill.name} [${skill.type.toUpperCase()}]
      <br />
      ${skill.description}
    </div>
  `;

  if (canUnlock) skillElement.classList.add('available');
  if (skillTree.skills[skill.id]) skillElement.classList.add('unlocked');

  skillElement.addEventListener('mousemove', (e) => {
    const tooltip = skillElement.querySelector('.skill-description');
    const rect = skillElement.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = rect.bottom + 10 + 'px';
  });

  skillElement.addEventListener('click', () => {
    if (skillTree.unlockSkill(skill.id)) {
      updateSkillTreeValues();
    }
  });

  if (skill.type === 'buff') {
    const cooldownOverlay = document.createElement('div');
    cooldownOverlay.className = 'cooldown-overlay';
    skillElement.appendChild(cooldownOverlay);
  }

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

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.innerHTML = createSkillTooltip(skillId);
    skillSlot.appendChild(tooltip);

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
    tooltip += `<div>${stat}: +${value}</div>`;
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
