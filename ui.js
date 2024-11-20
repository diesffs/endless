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
    updatePlayerStatsUI(game.hero.stats);
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
  if (
    typeof stats.currentHealth !== "number" ||
    typeof stats.maxHealth !== "number" ||
    isNaN(stats.currentHealth) ||
    isNaN(stats.maxHealth)
  ) {
    stats.maxHealth = stats.maxHealth || 100;
    stats.currentHealth = stats.maxHealth;
  }
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

export function updatePlayerStatsUI(stats) {
  const statsGrid = document.querySelector(".stats-grid");
  if (!statsGrid) return;

  statsGrid.innerHTML = `
      <div><strong>Level:</strong> ${stats.level || 1}</div>
      <div><strong>EXP:</strong> ${stats.exp || 0}/${
    stats.expToNextLevel || 100
  }</div>
      <div><strong>Gold:</strong> ${stats.gold || 0}</div>
      <div><strong>Damage:</strong> ${
        stats.stats.damage ? stats.stats.damage.toFixed(0) : 10
      }</div>
      <div><strong>Attack Speed:</strong> ${
        stats.stats.attackSpeed
          ? stats.stats.attackSpeed.toFixed(2).replace(".", ",")
          : "1,00"
      } attacks/sec</div>
      <div><strong>Crit Chance:</strong> ${
        stats.stats.critChance
          ? stats.stats.critChance.toFixed(1).replace(".", ",")
          : "5,0"
      }%</div>
      <div><strong>Crit Damage:</strong> ${
        stats.stats.critDamage
          ? stats.stats.critDamage.toFixed(2).replace(".", ",")
          : "1,50"
      }x</div>
      <div><strong>Health:</strong> ${
        stats.stats.health ? stats.stats.health.toFixed(0) : 100
      }</div>
      <div><strong>Armor:</strong> ${stats.stats.armor || 0} (${
    stats.calculateArmorReduction
      ? stats.calculateArmorReduction().toFixed(2).replace(".", ",")
      : "0,00"
  }% reduction)</div>
  `;
}

export function updateZoneUI(zone) {
  const zoneDisplay = document.getElementById("zone-display");
  if (zoneDisplay) {
    zoneDisplay.textContent = `Zone: ${zone}`;
  }
}
