// Global singletons for the game
export let game = null;
export let hero = null;
export let inventory = null;
export let training = null;
export let skillTree = null;
export let crystalShop = null;
export let statistics = null;
export let quests = null; // Export quests tracker
export let soulShop = null;
export let building = null; // Export building tracker

// Setters for initialization in main.js
export function setGlobals({
  game: g,
  hero: h,
  inventory: i,
  training: s,
  skillTree: st,
  crystalShop: p,
  statistics: stat,
  quests: q,
  soulShop: ss,
  building: b,
}) {
  game = g;
  hero = h;
  inventory = i;
  training = s;
  skillTree = st;
  crystalShop = p;
  statistics = stat;
  quests = q;
  soulShop = ss;
  building = b;
}
