// Quest UI logic moved from ui.js
import { showTooltip, hideTooltip, positionTooltip } from './ui.js';
import { quests, statistics } from '../globals.js';

export function updateQuestsUI() {
  const panel = document.getElementById('quests');
  panel.innerHTML = '';

  // Gather unique categories from quests
  const categories = Array.from(new Set(quests.quests.map((q) => q.category)));
  // Use a static variable to remember selected tab
  if (!updateQuestsUI.selectedCategory || !categories.includes(updateQuestsUI.selectedCategory)) {
    updateQuestsUI.selectedCategory = categories[0];
  }
  const selectedCategory = updateQuestsUI.selectedCategory;

  // Create tabs
  const tabs = document.createElement('div');
  tabs.className = 'quest-tabs';
  categories.forEach((cat) => {
    const tab = document.createElement('button');
    tab.className = 'quest-tab' + (cat === selectedCategory ? ' active' : '');
    tab.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    tab.onclick = () => {
      updateQuestsUI.selectedCategory = cat;
      updateQuestsUI();
    };
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  // Filter quests by selected category
  const list = document.createElement('div');
  list.className = 'quest-list';
  quests.quests
    .filter((q) => q.category === selectedCategory)
    .forEach((q) => {
      const progress = q.getProgress(statistics);
      const item = document.createElement('div');
      item.className = 'quest-item';
      if (q.isComplete(statistics) && !q.claimed) item.classList.add('ready');
      if (q.claimed) item.classList.add('claimed');
      item.innerHTML = `
      <span class="quest-icon">${q.icon}</span>
      <span class="quest-title">${q.title}</span>
      <span class="quest-progress">${progress}/${q.target}</span>
    `;
      item.title = q.description;
      // Show tooltip on hover
      item.addEventListener('mouseenter', (e) => showTooltip(q.description, e));
      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);
      // Always open modal on click
      item.addEventListener('click', () => openQuestModal(q));
      list.appendChild(item);
    });
  panel.appendChild(list);
}

export function openQuestModal(quest) {
  // Remove any existing modal
  let modal = document.getElementById('quest-modal');
  if (modal) modal.remove();

  // Use the same modal structure as training-modal for consistent centering
  modal = document.createElement('div');
  modal.id = 'quest-modal';
  modal.className = 'modal training-modal'; // Use both classes for styling/position
  modal.innerHTML = `
    <div class="training-modal-content">
      <button class="training-modal-close">&times;</button>
      <h2 id="quest-modal-title"></h2>
      <div id="quest-modal-category" style="color:#38bdf8;font-size:1em;"></div>
      <p id="quest-modal-desc"></p>
      <p id="quest-modal-reward"></p>
      <button id="quest-claim-btn" class="modal-btn">Claim Reward</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Set quest info
  modal.querySelector('#quest-modal-title').textContent = quest.title;
  if (modal.querySelector('#quest-modal-category')) {
    modal.querySelector('#quest-modal-category').textContent = quest.category
      ? `Category: ${quest.category.charAt(0).toUpperCase() + quest.category.slice(1)}`
      : '';
  }
  modal.querySelector('#quest-modal-desc').textContent = quest.description;
  // Add progress display in green
  const progress = quest.getProgress(statistics);
  const progressHtml = `<span style=\"color:#22c55e;font-weight:bold;\">${progress}/${quest.target}</span>`;
  // Add reward display: gold in yellow, crystals in blue, others default
  let rewardParts = [];
  for (const [k, v] of Object.entries(quest.reward)) {
    let color = '';
    if (k === 'gold') color = '#FFD700';
    else if (k === 'crystals') color = '#38bdf8';
    else color = '#fff';
    rewardParts.push(
      `<span style=\"color:${color};font-weight:bold;\">${v} ${k.charAt(0).toUpperCase() + k.slice(1)}</span>`
    );
  }
  const rewardHtml = rewardParts.join(', ');
  modal.querySelector('#quest-modal-reward').innerHTML = `Progress: ${progressHtml}<br>Reward: ${rewardHtml}`;

  // Claim button logic
  const claimBtn = modal.querySelector('#quest-claim-btn');
  claimBtn.disabled = !quest.isComplete(statistics) || quest.claimed;
  if (quest.claimed) {
    claimBtn.textContent = 'Claimed';
    claimBtn.style.backgroundColor = '#22c55e'; // green
    claimBtn.disabled = true;
  } else {
    claimBtn.textContent = 'Claim Reward';
    claimBtn.style.backgroundColor = '';
    claimBtn.disabled = !quest.isComplete(statistics);
  }
  claimBtn.onclick = () => {
    if (!quest.isComplete(statistics) || quest.claimed) return;
    quest.claim(statistics);
    modal.classList.add('hidden');
    updateQuestsUI();
  };

  // Close button logic
  modal.querySelector('.training-modal-close').onclick = () => modal.classList.add('hidden');

  // Close modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Show modal
  modal.classList.remove('hidden');
}
