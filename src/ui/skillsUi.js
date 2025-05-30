import { STATS } from '../stats.js';
import { CLASS_PATHS, SKILL_TREES } from '../skills.js';
import { REQ_LEVEL_FOR_SKILL_TREE, SKILL_LEVEL_TIERS } from '../skillTree.js';
import { skillTree, hero } from '../globals.js';
import {
  formatStatName,
  hideTooltip,
  positionTooltip,
  showConfirmDialog,
  showToast,
  showTooltip,
  updateResources,
} from '../ui.js';

const html = String.raw;

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
      resetBtn.textContent = 'Reset Class (Cost: 10 💎)';
      resetBtn.onclick = async () => {
        if (hero.crystals < 10) {
          showToast('Not enough crystals to reset class!', 'warning');
          return;
        }
        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset your class and refund all skill points?<br>This will cost <strong>10 crystals</strong> and cannot be undone.'
        );
        if (confirmed) {
          hero.crystals -= 10;
          skillTree.resetSkillTree();
          initializeSkillTreeUI();
          updateResources();
          showToast('Class has been reset and all points refunded.', 'success');
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
          src="${import.meta.env.BASE_URL}avatars/${pathData.avatar()}"
          alt="${pathData.name()} Avatar"
          style="width: 72px; height: 72px; border-radius: 8px; object-fit: cover; background: #222;"
        />
        <div style="flex: 1;">
          <h3>${pathData.name()}</h3>
          <p>${pathData.description()}</p>
        </div>
      </div>
      <div class="base-stats" style="margin-top: 15px;">
        ${Object.entries(pathData.baseStats())
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
    if (noLvlRestriction || (skillData.requiredLevel() <= hero.level && levelGroups[skillData.requiredLevel()])) {
      levelGroups[skillData.requiredLevel()].push({ id: skillId, ...skillData });
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
  // --- Auto-cast toggles for instant/buff skills ---
  renderAutoCastToggles();
  // --- Slot Display Toggles ---
  renderDisplayToggles();
}

function renderAutoCastToggles() {
  const container = document.getElementById('skill-tree-container');
  let autoCastSection = document.getElementById('auto-cast-section');
  if (autoCastSection) autoCastSection.remove();

  // Only show if there are any instant/buff skills unlocked
  const eligibleSkills = Object.entries(skillTree.skills)
    .filter(([skillId, skill]) => {
      const base = skillTree.getSkill(skillId);
      return base && (base.type() === 'instant' || base.type() === 'buff') && skill.level > 0;
    })
    .map(([skillId, skill]) => {
      const base = skillTree.getSkill(skillId);
      return { ...base, id: skillId };
    });

  if (eligibleSkills.length === 0) return;

  autoCastSection = document.createElement('div');
  autoCastSection.id = 'auto-cast-section';
  autoCastSection.style.marginTop = '32px';
  autoCastSection.innerHTML = `<h3 style="margin-bottom:8px;">Auto-Cast Settings</h3>`;

  eligibleSkills.forEach((skill) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'auto-cast-switch';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '6px';

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.width = '28px';
    icon.style.height = '28px';
    icon.style.backgroundImage = `url('${import.meta.env.BASE_URL}skills/${skill.icon()}.jpg')`;
    icon.style.marginRight = '8px';
    wrapper.appendChild(icon);

    const label = document.createElement('label');
    label.textContent = skill.name();
    label.style.marginRight = '8px';
    wrapper.appendChild(label);

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = skillTree.isAutoCastEnabled(skill.id);
    toggle.addEventListener('change', (e) => {
      skillTree.setAutoCast(skill.id, e.target.checked);
    });
    wrapper.appendChild(toggle);

    autoCastSection.appendChild(wrapper);
  });

  container.appendChild(autoCastSection);
}

// --- Slot Display Toggles ---
function renderDisplayToggles() {
  const container = document.getElementById('skill-tree-container');
  let displaySection = document.getElementById('display-section');
  if (displaySection) displaySection.remove();

  const eligibleSkills = Object.entries(skillTree.skills)
    .filter(([id, data]) => {
      const base = skillTree.getSkill(id);
      return base && base.type() !== 'passive' && data.level > 0;
    })
    .map(([id]) => ({ ...skillTree.getSkill(id), id }));
  if (eligibleSkills.length === 0) return;

  displaySection = document.createElement('div');
  displaySection.id = 'display-section';
  displaySection.innerHTML = `<h3 style="margin-bottom:8px;">Slot Display Settings</h3>`;

  eligibleSkills.forEach((skill) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'display-switch';
    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.width = '28px';
    icon.style.height = '28px';
    icon.style.backgroundImage = `url('${import.meta.env.BASE_URL}skills/${skill.icon()}.jpg')`;
    icon.style.marginRight = '8px';
    wrapper.appendChild(icon);
    const label = document.createElement('label');
    label.textContent = skill.name();
    label.style.marginRight = '8px';
    wrapper.appendChild(label);
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = skillTree.isDisplayEnabled(skill.id);
    toggle.addEventListener('change', (e) => {
      skillTree.setDisplay(skill.id, e.target.checked);
      updateActionBar();
    });
    wrapper.appendChild(toggle);
    displaySection.appendChild(wrapper);
  });
  container.appendChild(displaySection);
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

  const selectedPath = skillTree.getSelectedPath();
  if (characterAvatarEl && selectedPath?.avatar) {
    // Remove any previous img
    let img = characterAvatarEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = selectedPath.name() + ' avatar';
      characterAvatarEl.innerHTML = '';
      characterAvatarEl.appendChild(img);
    }
    img.src = `${import.meta.env.BASE_URL}avatars/${selectedPath.avatar()}`;
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
    const skill = skillTree.getSkill(skillId);

    levelDisplay.textContent = skill.maxLevel() == Infinity ? `${currentLevel}` : `${currentLevel}/${skill.maxLevel()}`;

    node.classList.toggle('available', canUnlock);
    node.classList.toggle('unlocked', !!skillTree.skills[skillId]);
  });

  // --- Auto-cast toggles for instant/buff skills ---
  renderAutoCastToggles();
  // --- Slot display toggles ---
  renderDisplayToggles();
}

function showSkillTree() {
  const container = document.getElementById('skill-tree-container');
  if (!container.children.length) {
    initializeSkillTreeStructure();
  } else {
    updateSkillTreeValues();
  }
}

let skillModal;
let currentSkillId;
let selectedSkillQty = 1;

// Helper to calculate SP cost for buying qty levels from currentLevel
function calculateSkillPointCost(currentLevel, qty) {
  let cost = 0;
  for (let i = 0; i < qty; i++) {
    cost += 1 + Math.floor((currentLevel + i) / 50);
  }
  return cost;
}
// Calculate max levels you can afford given SP and maxLevel
function calculateMaxPurchasable(currentLevel, availableSP, maxLevel) {
  let n = 0,
    total = 0;
  while (currentLevel + n < maxLevel) {
    const c = 1 + Math.floor((currentLevel + n) / 50);
    if (total + c > availableSP) break;
    total += c;
    n++;
  }
  return n;
}

function initializeSkillModal() {
  if (skillModal) return;
  skillModal = document.createElement('div');
  skillModal.id = 'skill-modal';
  skillModal.className = 'skill-modal hidden';
  skillModal.innerHTML = html`
    <div class="skill-modal-content">
      <span class="skill-modal-close">&times;</span>
      <div class="modal-skill-icon"></div>
      <h2 class="modal-skill-name"></h2>
      <p class="modal-skill-desc"></p>
      <div class="modal-skill-stats">
        <p>Level: <span class="modal-level"></span>/<span class="modal-max-level"></span></p>
        <p>Available Points: <span class="modal-available-points"></span></p>
        <p>Skill Point Cost: <span class="modal-sp-cost"></span></p>
        <p class="modal-mana-row">
          Mana Cost: <span class="modal-current-mana-cost"></span> (<span class="modal-next-mana-cost"></span>)
        </p>
        <p class="modal-cooldown-row">
          Cooldown: <span class="modal-current-cooldown"></span> (<span class="modal-next-cooldown"></span>)
        </p>
        <p class="modal-duration-row">
          Duration: <span class="modal-current-duration"></span> (<span class="modal-next-duration"></span>)
        </p>
      </div>
      <div class="modal-skill-effects">
        <h3>Effects</h3>
        <div class="effects-list"></div>
      </div>
      <div class="modal-controls">
        <button data-qty="1">+1</button>
        <button data-qty="5">+5</button>
        <button data-qty="10">+10</button>
        <button class="max-btn" data-qty="max">Max</button>
      </div>
      <button class="modal-buy">Buy</button>
    </div>
  `;
  document.body.appendChild(skillModal);
  skillModal.querySelector('.skill-modal-close').onclick = closeSkillModal;
  skillModal.addEventListener('click', (e) => {
    if (e.target === skillModal) closeSkillModal();
  });
  skillModal.querySelectorAll('.modal-controls button').forEach((btn) => {
    btn.onclick = () => {
      selectedSkillQty = btn.dataset.qty;
      updateSkillModalDetails();
    };
  });
  skillModal.querySelector('.modal-buy').onclick = () => buySkillBulk();
}

function openSkillModal(skillId) {
  initializeSkillModal();
  currentSkillId = skillId;
  const skill = skillTree.getSkill(skillId);

  // Set skill icon in modal
  const iconEl = skillModal.querySelector('.modal-skill-icon');
  iconEl.style.backgroundImage = `url('${import.meta.env.BASE_URL}skills/${skill.icon()}.jpg')`;

  const currentLevel = skillTree.skills[skillId]?.level || 0;
  const nextLevel = currentLevel + 1;
  skillModal.querySelector('.modal-skill-name').textContent = skill.name();
  skillModal.querySelector('.modal-skill-desc').innerHTML = skill.description().replace(/\n/g, '<br>');
  skillModal.querySelector('.modal-level').textContent = currentLevel;
  skillModal.querySelector('.modal-max-level').textContent = skill.maxLevel() === Infinity ? '∞' : skill.maxLevel();
  skillModal.querySelector('.modal-available-points').textContent = skillTree.skillPoints;
  const currMana = skillTree.getSkillManaCost(skill, currentLevel);
  const nextMana = skillTree.getSkillManaCost(skill, nextLevel);
  skillModal.querySelector('.modal-current-mana-cost').textContent = currMana;
  skillModal.querySelector('.modal-next-mana-cost').textContent = nextMana;
  const currCd = skillTree.getSkillCooldown(skill, currentLevel);
  const nextCd = skillTree.getSkillCooldown(skill, nextLevel);
  skillModal.querySelector('.modal-current-cooldown').textContent = currCd / 1000 + 's';
  skillModal.querySelector('.modal-next-cooldown').textContent = nextCd / 1000 + 's';
  const currDur = skillTree.getSkillDuration(skill, currentLevel);
  const nextDur = skillTree.getSkillDuration(skill, nextLevel);
  skillModal.querySelector('.modal-current-duration').textContent = currDur / 1000 + 's';
  skillModal.querySelector('.modal-next-duration').textContent = nextDur / 1000 + 's';

  // Show or hide mana cost row
  const manaRow = skillModal.querySelector('.modal-mana-row');
  if (skill.manaCost) {
    manaRow.style.display = '';
  } else {
    manaRow.style.display = 'none';
  }

  // Show or hide cooldown row
  const cdRow = skillModal.querySelector('.modal-cooldown-row');
  if (skill.cooldown) {
    cdRow.style.display = '';
  } else {
    cdRow.style.display = 'none';
  }

  // Show or hide duration row
  const durRow = skillModal.querySelector('.modal-duration-row');
  if (skill.duration) {
    durRow.style.display = '';
  } else {
    durRow.style.display = 'none';
  }

  // Populate effects
  const effectsCurrent = skillTree.getSkillEffect(skillId, currentLevel);
  const effectsNext = skillTree.getSkillEffect(skillId, nextLevel);
  const effectsEl = skillModal.querySelector('.effects-list');
  effectsEl.innerHTML = '';
  Object.entries(effectsNext).forEach(([stat, nextVal]) => {
    const currVal = effectsCurrent[stat] || 0;
    const diff = nextVal - currVal;
    const decimals = STATS[stat].decimalPlaces || 0;
    effectsEl.innerHTML += `
      <p>${formatStatName(stat)}: ${currVal.toFixed(decimals)} (${diff >= 0 ? '+' : ''}${diff.toFixed(decimals)})</p>
    `;
  });

  selectedSkillQty = 1;
  updateSkillModalDetails();
  skillModal.classList.remove('hidden');
}

function closeSkillModal() {
  if (skillModal) skillModal.classList.add('hidden');
}

function updateSkillModalDetails() {
  const qty = selectedSkillQty === 'max' ? Infinity : parseInt(selectedSkillQty, 10);
  const currentLevel = skillTree.skills[currentSkillId]?.level || 0;
  const skill = skillTree.getSkill(currentSkillId);
  const maxLevel = skill.maxLevel() || Infinity;
  const availableSP = skillTree.skillPoints;
  const maxQty = calculateMaxPurchasable(currentLevel, availableSP, maxLevel);
  const actualQty = selectedSkillQty === 'max' ? maxQty : Math.min(qty, maxQty);
  const futureLevel = currentLevel + actualQty;

  // Update modal fields
  skillModal.querySelector('.modal-level').textContent = currentLevel;
  skillModal.querySelector('.modal-max-level').textContent = maxLevel === Infinity ? '∞' : maxLevel;
  skillModal.querySelector('.modal-available-points').textContent = skillTree.skillPoints;

  // Update SP cost display and button labels
  const totalCost = calculateSkillPointCost(currentLevel, actualQty);
  skillModal.querySelector('.modal-sp-cost').textContent = totalCost + ' SP';
  skillModal.querySelectorAll('.modal-controls button').forEach((btn) => {
    const v = btn.dataset.qty;
    let btnQty;
    if (v === 'max') btnQty = maxQty;
    else btnQty = Math.min(parseInt(v, 10), maxQty);
    const btnCost = calculateSkillPointCost(currentLevel, btnQty);
    btn.textContent = (v === 'max' ? 'Max' : '+' + v) + ' (' + btnCost + ' SP)';
  });

  // Update cost and stats
  const currMana = skillTree.getSkillManaCost(skill, currentLevel);
  const nextMana = skillTree.getSkillManaCost(skill, futureLevel);
  skillModal.querySelector('.modal-current-mana-cost').textContent = currMana;
  skillModal.querySelector('.modal-next-mana-cost').textContent = nextMana;

  // Show or hide mana cost row
  const manaRow = skillModal.querySelector('.modal-mana-row');
  if (skill.manaCost) {
    manaRow.style.display = '';
  } else {
    manaRow.style.display = 'none';
  }

  // Cooldown
  const currCd = skillTree.getSkillCooldown(skill, currentLevel) / 1000;
  const nextCd = skillTree.getSkillCooldown(skill, futureLevel) / 1000;
  skillModal.querySelector('.modal-current-cooldown').textContent = currCd + 's';
  skillModal.querySelector('.modal-next-cooldown').textContent = nextCd + 's';

  // Duration
  const currDur = skillTree.getSkillDuration(skill, currentLevel) / 1000;
  const nextDur = skillTree.getSkillDuration(skill, futureLevel) / 1000;
  skillModal.querySelector('.modal-current-duration').textContent = currDur + 's';
  skillModal.querySelector('.modal-next-duration').textContent = nextDur + 's';

  // Effects list
  const effectsCurrent = skillTree.getSkillEffect(currentSkillId, currentLevel);
  const effectsFuture = skillTree.getSkillEffect(currentSkillId, futureLevel);
  const effectsEl = skillModal.querySelector('.effects-list');
  effectsEl.innerHTML = '';
  Object.entries(effectsFuture).forEach(([stat, futureVal]) => {
    const currVal = effectsCurrent[stat] || 0;
    const diff = futureVal - currVal;
    const decimals = STATS[stat].decimalPlaces || 0;
    effectsEl.innerHTML += `<p>${formatStatName(stat)}: ${currVal.toFixed(decimals)} (${
      diff >= 0 ? '+' : ''
    }${diff.toFixed(decimals)})</p>`;
  });

  // Update buy button
  const buyBtn = skillModal.querySelector('.modal-buy');
  buyBtn.disabled = actualQty <= 0;
  buyBtn.textContent = `Buy ${actualQty} for ${totalCost} SP`;
}

function buySkillBulk() {
  let count = selectedSkillQty === 'max' ? Infinity : parseInt(selectedSkillQty, 10);
  const currentLevel = skillTree.skills[currentSkillId]?.level || 0;
  const maxLevel = skillTree.getSkill(currentSkillId).maxLevel() || Infinity;
  const toBuy = Math.min(
    skillTree.skillPoints,
    maxLevel - currentLevel,
    count === Infinity ? skillTree.skillPoints : count
  );
  for (let i = 0; i < toBuy; i++) {
    skillTree.unlockSkill(currentSkillId);
  }
  // After leveling up in bulk
  if (typeof gtag === 'function') {
    gtag('event', 'skill_leveled_up_bulk', {
      event_category: 'SkillTree',
      event_label: currentSkillId,
      value: toBuy, // total levels gained in this action
      final_level: currentLevel + toBuy, // you can add custom params like this
    });
  }
  updateSkillTreeValues();
  updateActionBar();
  updateSkillModalDetails(); // <-- Ensure modal updates live after purchase
}

function createSkillElement(baseSkill) {
  let skill = skillTree.getSkill(baseSkill.id);

  const skillElement = document.createElement('div');
  skillElement.className = 'skill-node';
  skillElement.dataset.skillId = skill.id;
  skillElement.dataset.skillType = skill.type;

  skillElement.innerHTML = html`
    <div
      class="skill-icon"
      style="background-image: url('${import.meta.env.BASE_URL}skills/${skill.icon()}.jpg')"
    ></div>
    <div class="skill-level">
      ${skillTree.skills[skill.id]?.level || 0}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}
    </div>
  `;

  skillElement.addEventListener('mouseenter', (e) => showTooltip(updateTooltipContent(skill.id), e));
  skillElement.addEventListener('mousemove', positionTooltip);
  skillElement.addEventListener('mouseleave', hideTooltip);

  skillElement.addEventListener('click', (e) => {
    openSkillModal(skill.id);
  });

  return skillElement;
}

const updateTooltipContent = (skillId) => {
  // get fresh skill data
  let skill = skillTree.getSkill(skillId);

  const currentLevel = skillTree.skills[skill.id]?.level || 0;
  const canUnlock = skillTree.canUnlockSkill(skill.id);

  // Calculate effects at current level
  const effectsCurrent = skillTree.getSkillEffect(skill.id);

  // Calculate effects at next level (if not maxed out)
  const nextLevel = currentLevel < skill.maxLevel() ? currentLevel + 1 : currentLevel;
  const effectsNext = skillTree.getSkillEffect(skill.id, nextLevel);

  let skillDescription = `
      <strong>${skill.name()} [${skill.type().toUpperCase()}]</strong><br>
      ${skill
        .description()
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line)
        .join('<br>')}
      <br>
      Level: ${currentLevel}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}
    `;

  const skillManaCost = skillTree.getSkillManaCost(skill);
  const skillManaCostNextLevel = skillTree.getSkillManaCost(skill, nextLevel);
  if (skillManaCost) {
    skillDescription += `<br />Mana Cost: ${skillManaCost} (+${skillManaCostNextLevel - skillManaCost})`;
  }
  const skillCooldown = skillTree.getSkillCooldown(skill);
  const skillCooldownNextLevel = skillTree.getSkillCooldown(skill, nextLevel);

  if (skillCooldown) {
    skillDescription += `<br />Cooldown: ${skillCooldown / 1000}s (${
      (skillCooldownNextLevel - skillCooldown) / 1000
    }s)`;
  }
  const skillDuration = skillTree.getSkillDuration(skill);
  const skillDurationNextLevel = skillTree.getSkillDuration(skill, nextLevel);
  if (skillDuration) {
    skillDescription += `<br />Duration: ${skillDuration / 1000}s (+${
      (skillDurationNextLevel - skillDuration) / 1000
    }s)`;
  }

  // Calculate effects at current level
  if (effectsCurrent && Object.keys(effectsCurrent).length > 0) {
    skillDescription += '<br /><u>Current Effects:</u><br />';
    Object.entries(effectsCurrent).forEach(([stat, value]) => {
      const decimals = STATS[stat].decimalPlaces || 0;
      const formattedValue = value.toFixed(decimals);
      const prefix = value > 0 ? '+' : '';
      skillDescription += `${formatStatName(stat)}: ${prefix}${formattedValue}<br />`;
    });
  }

  // If not at max level, show next level effects and the bonus
  if (currentLevel < skill.maxLevel() || skill.maxLevel() === Infinity) {
    skillDescription += '<br /><u>Next Level Effects:</u><br />';
    Object.entries(effectsNext).forEach(([stat, value]) => {
      const decimals = STATS[stat].decimalPlaces || 0;
      const currentValue = effectsCurrent[stat] || 0;
      const difference = value - currentValue;
      const valuePrefix = value >= 0 ? '+' : '';
      const diffPrefix = difference >= 0 ? '+' : '';
      skillDescription += `${formatStatName(stat)}: ${valuePrefix}${value.toFixed(
        decimals
      )} <span class="bonus">(${diffPrefix}${difference.toFixed(decimals)})</span><br />`;
    });
  }

  return skillDescription;
};

export function updateActionBar() {
  const skillSlotsContainer = document.querySelector('.skill-slots');
  if (!skillSlotsContainer) return;

  skillSlotsContainer.innerHTML = '';
  let slotNumber = 1;

  Object.entries(skillTree.skills).forEach(([skillId, skill]) => {
    if (skill.type() === 'passive' || !skillTree.isDisplayEnabled(skillId)) return;

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
    iconDiv.style.backgroundImage = `url('${import.meta.env.BASE_URL}skills/${skill.icon()}.jpg')`;
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
  const skill = skillTree.getSkill(skillId);
  const level = skill?.level || 0;
  const effects = skillTree.getSkillEffect(skillId, level);

  let tooltip = `
      <div class="tooltip-header">${skill.name()}</div>
      <div class="tooltip-type">${skill.type().toUpperCase()}</div>
      <div class="tooltip-level">Level: ${level}</div>
      <div class="tooltip-mana">Mana Cost: ${skillTree.getSkillManaCost(skill)}</div>
  `;

  // Add effects
  tooltip += '<div class="tooltip-effects">';
  Object.entries(effects).forEach(([stat, value]) => {
    const decimals = STATS[stat].decimalPlaces || 0;
    const formattedValue = value.toFixed(decimals);
    const prefix = value > 0 ? '+' : '';
    tooltip += `<div>${formatStatName(stat)}: ${prefix}${formattedValue}</div>`;
  });
  tooltip += '</div>';

  // Add cooldown/duration for applicable skills
  if (skillTree.getSkillCooldown(skill)) {
    tooltip += `<div class="tooltip-cooldown">Cooldown: ${skillTree.getSkillCooldown(skill) / 1000}s</div>`;
  }
  if (skillTree.getSkillDuration(skill)) {
    tooltip += `<div class="tooltip-duration">Duration: ${skillTree.getSkillDuration(skill) / 1000}s</div>`;
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
    const skill = skillTree.getSkill(skillId);
    const cooldownOverlay = slot.querySelector('.cooldown-overlay');

    // Handle active states for all skill types
    const isActive =
      (skill.type() === 'buff' && skillTree.activeBuffs.has(skillId)) || (skill.type() === 'toggle' && skill.active);

    slot.classList.toggle('active', isActive);

    // Show cooldown for both buff and instant skills
    if ((skill.type() === 'buff' || skill.type() === 'instant') && skill?.cooldownEndTime) {
      const remaining = skill.cooldownEndTime - Date.now();
      if (remaining > 0) {
        const percentage = (remaining / skillTree.getSkillCooldown(skill)) * 100;
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
