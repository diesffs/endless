import Hero from "./hero.js";
import Game from "./game.js";
import Shop from "./shop.js";
import { updateResources } from "./ui.js";
import { loadGame } from './storage.js';

window.log = console.log;

let hero;
export let game;
let shop;

// Initialize game with saved data or new game
const savedData = loadGame();

if (savedData) {
    hero = new Hero(savedData.hero.stats); // Pass saved stats to Hero constructor
    game = new Game(hero);
} else {
    hero = new Hero();
    game = new Game(hero);
}

// Initialize shop after game is loaded/created
shop = new Shop(hero);

// Rest of your main.js code
hero.displayStats();
game.resetAllHealth();
updateResources(hero.stats);

let isRunning = false;
setInterval(() => {
    if (!isRunning) {
        isRunning = true;
        game.gameLoop();
        isRunning = false;
    }
}, 100);
