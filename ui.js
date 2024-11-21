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

export function updateStatsAndAttributesUI(stats) {
  const statsGrid = document.querySelector(".stats-grid");

  if (!statsGrid) return;

  // Ensure sections exist; create them only if they don't
  let statsContainer = document.querySelector(".stats-container");
  let attributesContainer = document.querySelector(".attributes-container");

  if (!statsContainer) {
    statsContainer = document.createElement("div");
    statsContainer.className = "stats-container";
    statsContainer.innerHTML = `
          <h3>Stats</h3>
          <div><strong>Level:</strong> <span id="level-value">${
            stats.level || 1
          }</span></div>
          <div><strong>EXP:</strong> <span id="exp-value">${
            stats.exp || 0
          }</span> / <span id="exp-to-next-level-value">${
      stats.expToNextLevel || 100
    }</span></div>
          <div><strong>Gold:</strong> <span id="gold-value">${
            stats.gold || 0
          }</span></div>
          <div><strong>Damage:</strong> <span id="damage-value">${stats.stats.damage.toFixed(
            0
          )}</span></div>
          <div><strong>Attack Speed:</strong> <span id="attack-speed-value">${stats.stats.attackSpeed
            .toFixed(2)
            .replace(".", ",")}</span> attacks/sec</div>
          <div><strong>Crit Chance:</strong> <span id="crit-chance-value">${stats.stats.critChance
            .toFixed(1)
            .replace(".", ",")}%</span></div>
          <div><strong>Crit Damage:</strong> <span id="crit-damage-value">${stats.stats.critDamage
            .toFixed(2)
            .replace(".", ",")}x</span></div>
          <div><strong>Health:</strong> <span id="health-value">${
            stats.stats.currentHealth
          }</span> / <span id="max-health-value">${
      stats.stats.maxHealth
    }</span></div>
          <div><strong>Armor:</strong> <span id="armor-value">${
            stats.stats.armor || 0
          }</span> (<span id="armor-reduction-value">${stats
      .calculateArmorReduction()
      .toFixed(2)
      .replace(".", ",")}%</span> reduction)</div>
      `;
    statsGrid.appendChild(statsContainer);
  } else {
    // Update dynamic stats values
    document.getElementById("level-value").textContent = stats.level || 1;
    document.getElementById("exp-value").textContent = stats.exp || 0;
    document.getElementById("exp-to-next-level-value").textContent =
      stats.expToNextLevel || 100;
    document.getElementById("gold-value").textContent = stats.gold || 0;
    document.getElementById("damage-value").textContent =
      stats.stats.damage.toFixed(0);
    document.getElementById("attack-speed-value").textContent =
      stats.stats.attackSpeed.toFixed(2).replace(".", ",");
    document.getElementById("crit-chance-value").textContent =
      stats.stats.critChance.toFixed(1).replace(".", ",") + "%";
    document.getElementById("crit-damage-value").textContent =
      stats.stats.critDamage.toFixed(2).replace(".", ",") + "x";
    document.getElementById("health-value").textContent =
      stats.stats.currentHealth;
    document.getElementById("max-health-value").textContent =
      stats.stats.maxHealth;
    document.getElementById("armor-value").textContent = stats.stats.armor || 0;
    document.getElementById("armor-reduction-value").textContent =
      stats.calculateArmorReduction().toFixed(2).replace(".", ",") + "%";
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement("div");
    attributesContainer.className = "attributes-container";
    attributesContainer.innerHTML = `
          <h3>Attributes</h3>
          <div>
              <strong>Strength:</strong> <span id="strength-value">${stats.primaryStats.strength}</span>
              <button class="allocate-btn" data-stat="strength">+</button>
          </div>
          <div>
              <strong>Agility:</strong> <span id="agility-value">${stats.primaryStats.agility}</span>
              <button class="allocate-btn" data-stat="agility">+</button>
          </div>
          <div>
              <strong>Vitality:</strong> <span id="vitality-value">${stats.primaryStats.vitality}</span>
              <button class="allocate-btn" data-stat="vitality">+</button>
          </div>
      `;
    statsGrid.appendChild(attributesContainer);

    // Attach event listeners for allocation buttons (only once)
    attributesContainer.querySelectorAll(".allocate-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const stat = btn.dataset.stat;
        if (stats.allocateStat(stat)) {
          // Update only the specific stat value
          document.getElementById(`${stat}-value`).textContent =
            stats.primaryStats[stat];
          updateStatsAndAttributesUI(stats); // Refresh all stats
          updatePlayerHealth(stats.stats); // Update health bar dynamically
        }
      });
    });
  } else {
    // Update dynamic attribute values
    document.getElementById("strength-value").textContent =
      stats.primaryStats.strength;
    document.getElementById("agility-value").textContent =
      stats.primaryStats.agility;
    document.getElementById("vitality-value").textContent =
      stats.primaryStats.vitality;
  }
}

export function updateZoneUI(zone) {
  const zoneDisplay = document.getElementById("zone-display");
  if (zoneDisplay) {
    zoneDisplay.textContent = `Zone: ${zone}`;
  }
}
