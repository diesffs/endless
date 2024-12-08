import Enemy from './enemy.js';
import { game, hero, prestige } from './main.js';
import { calculateHitChance } from './combat.js';

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
  document.getElementById('health-text').textContent = `${Math.max(
    0,
    Math.floor(stats.currentHealth)
  )}/${Math.floor(stats.maxHealth)}`;

  const manaPercentage = (stats.currentMana / stats.maxMana) * 100;
  document.getElementById('mana-fill').style.width = `${manaPercentage}%`;
  document.getElementById('mana-text').textContent = `${Math.max(
    0,
    Math.floor(stats.currentMana)
  )}/${Math.floor(stats.maxMana)}`;
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
    statsContainer.innerHTML = `
          <div><strong>Level:</strong> <span id="level-value">${hero.level || 1}</span></div>
          <div><strong>EXP:</strong> <span id="exp-value">${
            hero.exp || 0
          }</span> / <span id="exp-to-next-level-value">${hero.expToNextLevel || 100}</span></div>
          <div><strong>Highest Zone:</strong> <span id="highest-zone-value">${
            hero.highestZone
          }</span></div>
          <hr style="margin: 5px 1px"></hr>
          <div><strong>Damage:</strong> <span id="damage-value">${hero.stats.damage.toFixed(
            0
          )}</span></div>
          <div><strong>Attack Speed:</strong> <span id="attack-speed-value">${hero.stats.attackSpeed
            .toFixed(2)
            .replace(/\./g, ',')}</span> attacks/sec</div>
          <div><strong>Attack Rating:</strong> <span id="attack-rating-value">${hero.stats.attackRating.toFixed(
            0
          )}</span> (<span id="hit-chance-value">
          ${calculateHitChance(hero.stats.attackRating, game.zone).toFixed(1)}%</span>)</div>
          <div><strong>Crit Chance:</strong> <span id="crit-chance-value">${hero.stats.critChance
            .toFixed(1)
            .replace(/\./g, ',')}%</span></div>
          <div><strong>Crit Damage:</strong> <span id="crit-damage-value">${hero.stats.critDamage
            .toFixed(2)
            .replace(/\./g, ',')}x</span></div> 
          <hr style="margin: 5px 1px"></hr>
          <div><strong>Health:</strong> <span id="max-health-value">${
            hero.stats.maxHealth
          }</span></div>
          <div><strong>Health Regen:</strong> <span id="health-regen-value">${hero.stats.lifeRegen
            .toFixed(1)
            .replace(/\./g, ',')}</span>/s</div>
          <div><strong>Mana:</strong> <span id="max-mana-value">${hero.stats.maxMana}</span></div>
          <div><strong>Mana Regen:</strong> <span id="mana-regen-value">${hero.stats.manaRegen
            .toFixed(1)
            .replace(/\./g, ',')}</span>/s</div>
          <div><strong>Armor:</strong> <span id="armor-value">${hero.stats.armor || 0}</span> 
          (<span id="armor-reduction-value">${hero
            .calculateArmorReduction()
            .toFixed(2)
            .replace(/\./g, ',')}%</span> reduction)
          </div>
          <div><strong>Block Chance:</strong> <span id="block-chance-value">${hero.stats.blockChance
            .toFixed(1)
            .replace(/\./g, ',')}%</span></div>
      `;
    statsGrid.appendChild(statsContainer);
  } else {
    // Update dynamic stats values
    document.getElementById('level-value').textContent = hero.level || 1;
    document.getElementById('exp-value').textContent = hero.exp || 0;
    document.getElementById('exp-to-next-level-value').textContent = hero.expToNextLevel || 100;
    document.getElementById('highest-zone-value').textContent = hero.highestZone;
    document.getElementById('damage-value').textContent = hero.stats.damage.toFixed(0);
    document.getElementById('attack-speed-value').textContent = hero.stats.attackSpeed
      .toFixed(2)
      .replace(/\./g, ',');
    document.getElementById('attack-rating-value').textContent = hero.stats.attackRating.toFixed(0);
    document.getElementById('hit-chance-value').textContent =
      calculateHitChance(hero.stats.attackRating, game.zone).toFixed(1) + '%';
    document.getElementById('crit-chance-value').textContent =
      hero.stats.critChance.toFixed(1).replace(/\./g, ',') + '%';
    document.getElementById('crit-damage-value').textContent =
      hero.stats.critDamage.toFixed(2).replace(/\./g, ',') + 'x';
    document.getElementById('max-health-value').textContent = hero.stats.maxHealth;
    document.getElementById('health-regen-value').textContent = hero.stats.lifeRegen
      .toFixed(1)
      .replace(/\./g, ',');
    document.getElementById('max-mana-value').textContent = hero.stats.maxMana;
    document.getElementById('mana-regen-value').textContent = hero.stats.manaRegen
      .toFixed(1)
      .replace(/\./g, ',');
    document.getElementById('armor-value').textContent = hero.stats.armor || 0;
    document.getElementById('armor-reduction-value').textContent =
      hero.calculateArmorReduction().toFixed(2).replace(/\./g, ',') + '%';
    document.getElementById('block-chance-value').textContent =
      hero.stats.blockChance.toFixed(1).replace(/\./g, ',') + '%';
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    attributesContainer.innerHTML = `
          <h3 id="attributes">Attributes (+${hero.statPoints})</h3>
          <div>
              <strong>Strength:</strong> <span id="strength-value">${hero.getStat(
                'strength'
              )}</span>
              <button class="allocate-btn" data-stat="strength">+</button>
          </div>
          <div>
              <strong>Agility:</strong> <span id="agility-value">${hero.getStat('agility')}</span>
              <button class="allocate-btn" data-stat="agility">+</button>
          </div>
          <div>
              <strong>Vitality:</strong> <span id="vitality-value">${hero.getStat(
                'vitality'
              )}</span>
              <button class="allocate-btn" data-stat="vitality">+</button>
          </div>
      `;
    statsGrid.appendChild(attributesContainer);

    // Attach event listeners for allocation buttons (only once)
    attributesContainer.querySelectorAll('.allocate-btn').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        const stat = btn.dataset.stat;

        // Initial click allocation
        if (hero.allocateStat(stat)) {
          document.getElementById(`${stat}-value`).textContent = hero.getStat(stat);
          updateStatsAndAttributesUI();
          updatePlayerHealth();
        }

        let intervalId;
        let holdingTimeout;

        const startHolding = () => {
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            if (hero.allocateStat(stat)) {
              document.getElementById(`${stat}-value`).textContent = hero.getStat(stat);
              updateStatsAndAttributesUI();
              updatePlayerHealth();
            }
          }, 100); // Allocate every 100ms while holding
        };

        const stopHolding = () => {
          clearTimeout(holdingTimeout);
          clearInterval(intervalId);
          document.removeEventListener('mouseup', stopHolding);
          document.removeEventListener('mouseleave', stopHolding);
        };

        // Start holding after 500ms
        holdingTimeout = setTimeout(startHolding, 500);

        // Add event listeners to stop holding
        document.addEventListener('mouseup', stopHolding);
        document.addEventListener('mouseleave', stopHolding);
      });
    });
  } else {
    document.getElementById(`attributes`).textContent = `Attributes (+${hero.statPoints})`;
    // Update dynamic attribute values
    document.getElementById('strength-value').textContent = hero.getStat('strength');
    document.getElementById('agility-value').textContent = hero.getStat('agility');
    document.getElementById('vitality-value').textContent = hero.getStat('vitality');
  }
}

export function updateZoneUI() {
  const zone = game.zone;
  const zoneDisplay = document.getElementById('zone-display');
  if (zoneDisplay) {
    zoneDisplay.textContent = `Zone: ${zone}`;
  }
}
