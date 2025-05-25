import { OFFENSE_STATS } from './stats/offenseStats.js';
import { DEFENSE_STATS } from './stats/defenseStats.js';
import { MISC_STATS } from './stats/miscStats.js';

export const STATS = {
  ...OFFENSE_STATS,
  ...DEFENSE_STATS,
  ...MISC_STATS,
};
