import Hero from "./hero.js";
import Game from "./game.js";
import Shop from "./shop.js";
import { updateResources } from "./ui.js";
import { loadGame } from "./storage.js";
import Prestige from "./prestige.js";

window.log = console.log;

let hero;
export let game;
let shop;
let prestige;

// Initialize game with saved data or new game
const savedData = loadGame();

if (savedData) {
  hero = new Hero(savedData.hero.stats);
  game = new Game(hero); // Initialize game with saved hero
} else {
  hero = new Hero();
  game = new Game(hero); // Initialize game with new hero
}

shop = new Shop(hero, game); // Initialize shop with game and hero
prestige = new Prestige(game); // Pass the fully initialized game instance
prestige.initializePrestigeUI();

// Rest of your main.js code
hero.displayStats();
game.resetAllHealth();
prestige.initializePrestigeUI().then(() => {
  // Call updateResources only after the Prestige UI is initialized
  updateResources(hero.stats, game);
});

let isRunning = false;
setInterval(() => {
  if (!isRunning) {
    isRunning = true;
    game.gameLoop();
    isRunning = false;
  }
}, 100);

console.log("Initialized game:", game);
