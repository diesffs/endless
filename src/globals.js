// Global singletons for the game
export let game = null;
export let hero = null;
export let inventory = null;
export let training = null;
export let skillTree = null;
export let prestige = null;
export let statistics = null;
export let quests = null; // Export quests tracker
export let soulShop = null;

// Setters for initialization in main.js
export function setGlobals({
  game: g,
  hero: h,
  inventory: i,
  training: s,
  skillTree: st,
  prestige: p,
  statistics: stat,
  quests: q,
  soulShop: ss,
}) {
  game = g;
  hero = h;
  inventory = i;
  training = s;
  skillTree = st;
  prestige = p;
  statistics = stat;
  quests = q;
  soulShop = ss;
}
