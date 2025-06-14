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
export let options = null; // Export options tracker

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
  options: o,
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
  options = o;
}

export function getGlobals() {
  return {
    game,
    hero,
    inventory,
    training,
    skillTree,
    crystalShop,
    statistics,
    quests,
    soulShop,
    options,
  };
}
