import { state, saveStateToLocalStorage } from "./state.js";

const PRELOADED_IMAGES_COUNT = 99; // Number of images to preload
const monsterTypes = [
  "adventurer",
  "avataaars",
  "bottts",
  "micah",
  "miniavs",
  "personas",
];
const preloadedImages = []; // Array to store preloaded Image elements

// Preload Image elements at the start
function preloadMonsterImages() {
  for (let i = 0; i < PRELOADED_IMAGES_COUNT; i++) {
    const randomType =
      monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const imageUrl = `https://api.dicebear.com/7.x/${randomType}/svg?seed=${randomType}-${i}`;

    const img = new Image();
    img.src = imageUrl; // Set the src to start loading
    preloadedImages.push(img); // Store the Image element
  }
}

// Call this function to preload images on page load
preloadMonsterImages();

// Function to create a monster, cycling through the preloaded images
export function createMonster(zone) {
  // Cycle through the preloaded images array
  const avatarIndex = state.monstersKilled % PRELOADED_IMAGES_COUNT;
  const preloadedImage = preloadedImages[avatarIndex];

  // Base HP increase starts from 1, but overall starting HP is set to 10
  const baseIncrease = 1 + Math.floor(zone / 100);
  const baseHealth = 10 + zone * baseIncrease * Math.pow(1.0000001, zone);

  return {
    health: Math.ceil(baseHealth),
    maxHealth: Math.ceil(baseHealth),
    zone: zone,
    avatarElement: preloadedImage, // Store the preloaded Image element
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
    saveStateToLocalStorage();
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

  // Directly use the preloaded Image element for this monster
  const monsterImageElement = document.getElementById("monster-image");
  monsterImageElement.src = state.currentMonster.avatarElement.src;
}
