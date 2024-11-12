import { state, saveStateToLocalStorage } from "./state.js";

const preloadedImages = [];
const totalImages = 50; // Define the exact number of images to preload
let imageIndex = 0; // To cycle through preloaded images

// Function to preload images into memory
function preloadImages() {
  const monsterTypes = [
    "adventurer",
    "avataaars",
    "bottts",
    "micah",
    "miniavs",
    "personas",
  ];
  for (let i = 0; i < totalImages; i++) {
    const randomType =
      monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
    const imageUrl = `https://api.dicebear.com/7.x/${randomType}/svg?seed=${randomType}-${i}`;

    // Create a new Image object to cache in memory
    const img = new Image();
    img.src = imageUrl;
    preloadedImages.push(img); // Store the Image object, not just the URL
  }
}

// Call this once at the start of the game to preload images
preloadImages();

// Function to create a new monster using a preloaded image
export function createMonster(zone) {
  const baseIncrease = 1 + Math.floor(zone / 100);
  const baseHealth = 10 + zone * baseIncrease * Math.pow(1.1, zone);

  // Use a preloaded image from the array
  const avatarImage = preloadedImages[imageIndex];
  imageIndex = (imageIndex + 1) % totalImages; // Cycle through preloaded images

  return {
    health: Math.ceil(baseHealth),
    maxHealth: Math.ceil(baseHealth),
    zone: zone,
    avatarImage: avatarImage, // Store the Image object directly
  };
}

// Function to apply damage to the current monster
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

// Function to update the monster UI
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

  // Set the monster image directly from the preloaded Image object
  const monsterImageElement = document.getElementById("monster-image");
  monsterImageElement.src = state.currentMonster.avatarImage.src;
}

// Initial setup: create the first monster when the game starts
if (!state.currentMonster) {
  state.currentMonster = createMonster(state.zone);
  updateMonsterUI();
}
