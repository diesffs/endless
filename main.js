import Hero from "./hero.js";
import Game from "./game.js";
import Shop from "./shop.js";
import { updateResources } from "./ui.js";

const hero = new Hero();
const game = new Game(hero);
const shop = new Shop(hero);

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
