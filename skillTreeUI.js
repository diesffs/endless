import { skillTree } from './main.js';
import { CLASS_PATHS, SKILL_TREES } from './skillTreeData.js';

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
}
function showClassSelection() {
  const classSelection = document.getElementById('class-selection');
  classSelection.innerHTML = '';

  Object.entries(CLASS_PATHS).forEach(([pathId, pathData]) => {
    const pathElement = document.createElement('div');
    pathElement.className = 'class-path';
    pathElement.innerHTML = `
      <h3>${pathData.name}</h3>
      <p>${pathData.description}</p>
      <div class="base-stats">
        ${Object.entries(pathData.baseStats)
          .map(([stat, value]) => `<div>${stat}: +${value}</div>`)
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

function showSkillTree() {
  const container = document.getElementById('skill-tree-container');
  container.innerHTML = '';

  const skills = SKILL_TREES[skillTree.selectedPath];
  const rows = {};

  // Group skills by row
  Object.entries(skills).forEach(([skillId, skillData]) => {
    if (!rows[skillData.row]) rows[skillData.row] = [];
    rows[skillData.row].push({ id: skillId, ...skillData });
  });

  // Create row elements
  Object.entries(rows).forEach(([rowNum, rowSkills]) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'skill-row';

    rowSkills.forEach((skill) => {
      const skillElement = createSkillElement(skill);
      rowElement.appendChild(skillElement);
    });

    container.appendChild(rowElement);
  });
}

function createSkillElement(skill) {
  const skillElement = document.createElement('div');
  skillElement.className = 'skill-node';
  skillElement.dataset.skillId = skill.id;

  const currentLevel = skillTree.skillLevels[skill.id] || 0;
  const isUnlocked = skillTree.unlockedSkills[skill.id];
  const canUnlock = skillTree.canUnlockSkill(skill.id);

  skillElement.innerHTML = `
    <div class="skill-icon">${skill.name}</div>
    <div class="skill-level">${currentLevel}/10</div>
    <div class="skill-description">${skill.description}</div>
  `;

  if (canUnlock) {
    skillElement.classList.add('available');
  }
  if (isUnlocked) {
    skillElement.classList.add('unlocked');
  }

  skillElement.addEventListener('click', () => {
    if (skillTree.unlockSkill(skill.id)) {
      showSkillTree(); // Refresh the display
    }
  });

  return skillElement;
}
