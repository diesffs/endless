import { state, saveStateToLocalStorage } from "./state.js";

// Initialize each character with `isUnlocked: false` by default, except the first character
state.characters = state.characters.map((character, index) => ({
  ...character,
  isUnlocked: index === 0, // Unlock the first character by default
}));

export function getCharacterCost(character) {
  return Math.floor(
    character.cost * Math.pow(character.costMultiplier, character.level)
  );
}

// Helper function to calculate DPS with multiplier
function getCharacterDPS(character) {
  // Calculate multiplier every 10 levels
  const multiplier = Math.pow(10, Math.floor(character.level / 10));
  return character.baseDps * character.level * multiplier;
}

export function levelUpCharacter(character) {
  const cost = getCharacterCost(character);
  if (state.gold >= cost) {
    state.gold -= cost;
    character.level++;
    calculateTotalDPS();
    updateCharacterUI();
    saveStateToLocalStorage(); // Save the state here
  }
}

export function calculateTotalDPS() {
  state.dps =
    1 +
    state.characters.reduce((total, char) => {
      return total + getCharacterDPS(char); // Use the updated DPS calculation
    }, 0);
}

// Unlocks the next character if the player can afford it plus a threshold
function unlockNextCharacter() {
  state.characters.forEach((character) => {
    if (
      !character.isUnlocked &&
      state.gold >= getCharacterCost(character) + 1
    ) {
      character.isUnlocked = true;
    }
  });
}

export function updateCharacterUI() {
  unlockNextCharacter(); // Ensure all affordable characters are unlocked before updating UI

  state.characters.forEach((character) => {
    const cost = getCharacterCost(character);
    const canAfford = state.gold >= cost;
    const dps = getCharacterDPS(character); // Use the new DPS function

    let characterElem = document.getElementById(`character-${character.id}`);

    if (!character.isUnlocked) {
      if (characterElem) {
        characterElem.style.display = "none"; // Hide the element if it exists but isn't unlocked
      }
      return;
    }

    // Create or update character element when unlocked
    if (characterElem) {
      characterElem.style.display = ""; // Show the element
      characterElem.className = `character ${canAfford ? "can-afford" : ""}`;
      characterElem.querySelector(
        ".character-level"
      ).textContent = `Level: ${character.level}`;
      characterElem.querySelector(
        ".character-dps"
      ).textContent = `DPS: ${dps.toFixed(1)}`; // Updated DPS display
      characterElem.querySelector(
        ".character-cost"
      ).textContent = `Cost: ${Math.floor(cost)} gold`;
      characterElem.querySelector("button").disabled = !canAfford;
    } else {
      const container = document.getElementById("character-list");
      const elem = document.createElement("div");
      elem.className = `character ${canAfford ? "can-afford" : ""}`;
      elem.id = `character-${character.id}`;
      elem.innerHTML = `
                <div class="character-image">
                    <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${
                      character.avatar
                    }" alt="${character.name}" />
                </div>
                <div class="character-info">
                    <h3>${character.name}</h3>
                    <p class="character-level">Level: ${character.level}</p>
                    <p class="character-dps">DPS: ${dps.toFixed(1)}</p>
                    <p class="character-cost">Cost: ${Math.floor(cost)} gold</p>
                    <button ${canAfford ? "" : "disabled"}>Level Up</button>
                </div>
            `;
      elem.querySelector("button").onclick = () => levelUpCharacter(character);
      container.appendChild(elem);
    }
  });
}
