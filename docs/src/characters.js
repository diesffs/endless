import { state, saveStateToLocalStorage } from "./state.js";

export function initializeCharacters() {
  state.characters = state.characters.map((character, index) => ({
    ...character,
    isUnlocked: index === 0, // Unlock the first character by default
  }));
}

export function getCharacterCost(character) {
  return Math.floor(
    character.cost * Math.pow(character.costMultiplier, character.level)
  );
}

// Helper function to calculate DPS with multiplier
function getCharacterDPS(character) {
  const multiplier = Math.pow(2.5, Math.floor(character.level / 10));
  return character.baseDps * character.level * multiplier;
}

export function levelUpCharacter(character) {
  const cost = getCharacterCost(character);
  if (state.gold >= cost) {
    state.gold -= cost;
    character.level++;
    calculateTotalDPS(); // Recalculate DPS after leveling
    updateCharacterUI(); // Update UI to reflect new level
    saveStateToLocalStorage(); // Save the updated state
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
      state.lastUnlockedCharacter = character.id; // Update the last unlocked character
    }
  });
}

// Update the UI for each character
export function updateCharacterUI() {
  unlockNextCharacter();

  // Define firstLockedCharacterIndex here
  const firstLockedCharacterIndex = state.characters.findIndex(
    (character) => !character.isUnlocked
  );

  state.characters.forEach((character, index) => {
    const cost = getCharacterCost(character);
    const canAfford = state.gold >= cost;
    const dps = getCharacterDPS(character);

    let characterElem = document.getElementById(`character-${character.id}`);

    const isUnlocked = character.isUnlocked;
    const isNextToUnlock = index === firstLockedCharacterIndex;

    // Display the character if it's unlocked or if it's the next character to unlock
    const shouldDisplay = isUnlocked || isNextToUnlock;

    if (!shouldDisplay) {
      if (characterElem) {
        characterElem.style.display = "none";
      }
      return;
    }

    if (characterElem) {
      characterElem.style.display = ""; // Ensure visibility
      characterElem.className = `character ${canAfford ? "can-afford" : ""}`;
      characterElem.querySelector(
        ".character-level"
      ).textContent = `Level: ${character.level}`;
      characterElem.querySelector(
        ".character-dps"
      ).textContent = `DPS: ${dps.toFixed(1)}`;
      characterElem.querySelector(
        ".character-cost"
      ).textContent = `Cost: ${Math.floor(cost)} gold`;

      // Ensure the button triggers level up for this character
      const levelUpButton = characterElem.querySelector("button");
      levelUpButton.disabled = !canAfford;
      levelUpButton.onclick = () => levelUpCharacter(character);
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
          <h3>${character.id} - ${character.name}</h3>
          <p class="character-level">Level: ${character.level}</p>
          <p class="character-dps">DPS: ${dps.toFixed(1)}</p>
          <p class="character-cost">Cost: ${Math.floor(cost)} gold</p>
          <button ${canAfford ? "" : "disabled"}>Level Up</button>
        </div>
      `;

      const levelUpButton = elem.querySelector("button");
      levelUpButton.onclick = () => levelUpCharacter(character);
      container.appendChild(elem);
    }
  });
}
