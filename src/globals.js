// Global singletons for the game
export let game = null;
export let hero = null;
export let inventory = null;
export let shop = null;
export let skillTree = null;
export let prestige = null;
export let statistics = null;

// Setters for initialization in main.js
export function setGlobals({ game: g, hero: h, inventory: i, shop: s, skillTree: st, prestige: p, statistics: stat }) {
  game = g;
  hero = h;
  inventory = i;
  shop = s;
  skillTree = st;
  prestige = p;
  statistics = stat;
}
