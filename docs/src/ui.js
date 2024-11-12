import { state } from "./state.js";
import { updateCharacterUI } from "./characters.js";
import { updateMonsterUI } from "./monster.js";

export function updateUI() {
  document.getElementById("gold").textContent = Math.floor(
    state.gold
  ).toLocaleString();
  document.getElementById("income").textContent = state.income
    .toFixed(0)
    .toLocaleString();
  document.getElementById("total-dps").textContent = state.dps.toFixed(0).toLocaleString();
  document.getElementById("current-zone").textContent =
    state.zone.toLocaleString();

  updateMonsterUI();
  updateCharacterUI();
}
