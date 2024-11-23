import Hero from "./hero.js";
import Game from "./game.js";
import Shop from "./shop.js";
import { updateResources } from "./ui.js";
import { loadGame } from "./storage.js";
import Prestige from "./prestige.js";

window.log = console.log;

// Initialize game with saved data or new game
const savedData = loadGame();

// Initialize hero and game with saved data or create new instances
export const hero = savedData ? new Hero(savedData?.hero?.stats) : new Hero();
export const game = new Game(hero, null, savedData); // Game initialized without Prestige first

// Initialize Prestige and assign it to the game
export const prestige = new Prestige(game); // Pass the fully initialized game instance
game.prestige = prestige;

// Initialize Shop
export const shop = new Shop(hero, game); // Shop depends on hero and game

// Initialize the Prestige UI and update resources
prestige.initializePrestigeUI();
hero.displayStats();
game.resetAllHealth();
updateResources(hero.stats, game); // Update UI with initialized resources

// Game loop
let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);

console.log("Initialized game:", game);

