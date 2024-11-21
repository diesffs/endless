export function initializeUI(game) {
  game.activeTab = "inventory";
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(game, btn.dataset.tab));
  });
  document
    .getElementById("start-btn")
    .addEventListener("click", () => toggleGame(game));

  updateZoneUI(game.zone);
}

export function switchTab(game, tabName) {
  document
    .querySelectorAll(".tab-panel")
    .forEach((panel) => panel.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  if (tabName === "stats") {
    updateStatsAndAttributesUI(game.hero.stats);
  }

  game.activeTab = tabName;
}

export function updateResources(stats) {
  document.getElementById("gold").textContent = stats.gold;
  document.getElementById("crystals").textContent = stats.crystals;
  document.getElementById("souls").textContent = stats.souls;
  document.getElementById("level").textContent = stats.level;
}

export function updatePlayerHealth(stats) {
  const healthPercentage = (stats.currentHealth / stats.maxHealth) * 100;
  document.getElementById("health-fill").style.width = `${healthPercentage}%`;
  document.getElementById("health-text").textContent = `${Math.max(
    0,
    Math.floor(stats.currentHealth)
  )}/${Math.floor(stats.maxHealth)}`;
}

export function updateEnemyHealth(enemy) {
  const healthPercentage = (enemy.currentHealth / enemy.maxHealth) * 100;
  document.getElementById(
    "enemy-health-fill"
  ).style.width = `${healthPercentage}%`;
  document.getElementById("enemy-health-text").textContent = `${Math.max(
    0,
    Math.floor(enemy.currentHealth)
  )}/${Math.floor(enemy.maxHealth)}`;
}

function toggleGame(game) {
  const startBtn = document.getElementById("start-btn");
  game.gameStarted = !game.gameStarted;
  if (game.gameStarted) {
    game.resetAllHealth();
    updateResources(game.stats);
  } else {
    game.stats.stats.currentHealth = game.stats.stats.maxHealth;
    game.currentEnemy.resetHealth();
    updatePlayerHealth(game.stats.stats);
    updateEnemyHealth(game.currentEnemy);
  }
  startBtn.textContent = game.gameStarted ? "Stop" : "Start";
  startBtn.style.backgroundColor = game.gameStarted ? "#DC2626" : "#059669";
}

// ui.js
// ui.js
export function updateStatsAndAttributesUI(stats) {
  const statsGrid = document.querySelector(".stats-grid");

  if (!statsGrid) return;

  // Ensure sections exist; create them only if they don't
  let statsContainer = document.querySelector(".stats-container");
  let attributesContainer = document.querySelector(".attributes-container");

  if (!statsContainer) {
    statsContainer = document.createElement("div");
    statsContainer.className = "stats-container";
    statsGrid.appendChild(statsContainer);
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement("div");
    attributesContainer.className = "attributes-container";
    statsGrid.appendChild(attributesContainer);
  }

  // Update Stats Section (only values)
  statsContainer.innerHTML = `
      <h3>Stats</h3>
      <div><strong>Level:</strong> ${stats.level || 1}</div>
      <div><strong>EXP:</strong> ${stats.exp || 0}/${
    stats.expToNextLevel || 100
  }</div>
      <div><strong>Stat points:</strong> ${stats.statPoints || 0}</div>
      <div><strong>Gold:</strong> ${stats.gold || 0}</div>
      <div><strong>Damage:</strong> ${stats.stats.damage.toFixed(0)}</div>
      <div><strong>Attack Speed:</strong> ${stats.stats.attackSpeed
        .toFixed(2)
        .replace(".", ",")} attacks/sec</div>
      <div><strong>Crit Chance:</strong> ${stats.stats.critChance
        .toFixed(1)
        .replace(".", ",")}%</div>
      <div><strong>Crit Damage:</strong> ${stats.stats.critDamage
        .toFixed(2)
        .replace(".", ",")}x</div>
      <div><strong>Health:</strong>${stats.stats.maxHealth}</div>
      <div><strong>Armor:</strong> ${stats.stats.armor || 0} (${stats
    .calculateArmorReduction()
    .toFixed(2)
    .replace(".", ",")}% reduction)</div>
  `;

  // Update Attributes Section (only values)
  attributesContainer.innerHTML = `
      <h3>Attributes</h3>
      <div><strong>Strength:</strong> ${stats.primaryStats.strength} 
          <button class="allocate-btn" data-stat="strength" ${
            stats.statPoints === 0 ? "disabled" : ""
          }>+</button>
      </div>
      <div><strong>Agility:</strong> ${stats.primaryStats.agility} 
          <button class="allocate-btn" data-stat="agility" ${
            stats.statPoints === 0 ? "disabled" : ""
          }>+</button>
      </div>
      <div><strong>Vitality:</strong> ${stats.primaryStats.vitality} 
          <button class="allocate-btn" data-stat="vitality" ${
            stats.statPoints === 0 ? "disabled" : ""
          }>+</button>
      </div>
  `;

  // Attach event listeners for attribute buttons
  attributesContainer.querySelectorAll(".allocate-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const stat = btn.dataset.stat;
      if (stats.allocateStat(stat)) {
        updateStatsAndAttributesUI(stats); // Refresh attributes UI
        updatePlayerHealth(stats.stats); // Refresh health bar
        updateResources(stats); // Update resources if needed
      }
    });
  });
}

export function updateZoneUI(zone) {
  const zoneDisplay = document.getElementById("zone-display");
  if (zoneDisplay) {
    zoneDisplay.textContent = `Zone: ${zone}`;
  }
}
