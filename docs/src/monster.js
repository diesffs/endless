import { state, saveStateToLocalStorage } from "./state.js";

export function createMonster(zone) {
  const monsterTypes = [
    "adventurer",
    "avataaars",
    "bottts",
    "micah",
    "miniavs",
    "personas",
  ];
  const randomType =
    monsterTypes[Math.floor(Math.random() * monsterTypes.length)];

  // Base HP increase starts from 1, but overall starting HP is set to 10
  const baseIncrease = 1 + Math.floor(zone / 100);
  const baseHealth = 10 + zone * baseIncrease * Math.pow(1.0000001, zone);

  return {
    health: Math.ceil(baseHealth),
    maxHealth: Math.ceil(baseHealth),
    zone: zone,
    avatar: `${randomType}-${zone}-${state.monstersKilled}`,
  };
}

export function damageMonster(damage) {
  if (!state.currentMonster) return;

  state.currentMonster.health -= damage;

  if (state.currentMonster.health <= 0) {
    state.monstersKilled++;
    state.zone++;
    state.currentMonster = createMonster(state.zone);
    updateMonsterUI();
    saveStateToLocalStorage(); // Save the state here
  }
}

export function updateMonsterUI() {
  if (!state.currentMonster) return;

  const healthPercent =
    (state.currentMonster.health / state.currentMonster.maxHealth) * 100;
  document.getElementById("health-fill").style.width = `${healthPercent}%`;
  document.getElementById("current-health").textContent = Math.ceil(
    state.currentMonster.health
  );
  document.getElementById("max-health").textContent = Math.ceil(
    state.currentMonster.maxHealth
  );
  document.getElementById(
    "monster-image"
  ).src = `https://api.dicebear.com/7.x/${
    state.currentMonster.avatar.split("-")[0]
  }/svg?seed=${state.currentMonster.avatar}`;
}
