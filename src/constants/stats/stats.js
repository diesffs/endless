import { OFFENSE_STATS } from './offenseStats.js';
import { DEFENSE_STATS } from './defenseStats.js';
import { MISC_STATS } from './miscStats.js';

export const STATS = {
  ...OFFENSE_STATS,
  ...DEFENSE_STATS,
  ...MISC_STATS,
};
