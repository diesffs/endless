import { QUEST_DEFINITIONS } from './constants/quests.js';
import { hero, game } from './globals.js';
import { showToast, updateResources } from './ui/ui.js';

export class Quest {
  constructor({ id, title, description, type, target, reward, icon, category, rarity, resource }, claimed = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.target = target;
    this.reward = reward;
    this.icon = icon;
    this.category = category;
    this.rarity = rarity;
    this.resource = resource;
    this.claimed = claimed;
  }

  // Progress is now computed from statistics, not stored
  getProgress(statistics) {
    if (this.type === 'kill') {
      return Math.min(statistics.enemiesKilled.total, this.target);
    }
    if (this.type === 'kill_rarity' && this.rarity) {
      const rarityKey = this.rarity.toLowerCase();
      return Math.min(statistics.enemiesKilled[rarityKey] || 0, this.target);
    }
    if (this.type === 'resource' && this.resource) {
      // For gold, use statistics.totalGoldEarned; for crystals, use hero.crystals
      if (this.resource === 'totalGoldEarned') {
        return Math.min(statistics.totalGoldEarned, this.target);
      }
      if (this.resource === 'crystals') {
        return Math.min(hero.crystals, this.target);
      }
    }
    if (this.type === 'level') {
      return Math.min(hero.level, this.target);
    }
    if (this.type === 'stage') {
      return Math.min(statistics.highestStageReached, this.target);
    }
    if (this.type === 'damage') {
      return Math.min(statistics.highestDamageDealt, this.target);
    }
    return 0;
  }

  isComplete(statistics) {
    return this.getProgress(statistics) >= this.target;
  }

  claim(statistics) {
    if (!this.isComplete(statistics) || this.claimed) return null;
    this.claimed = true;

    // apply rewards
    if (this.reward.gold) hero.gainGold(this.reward.gold);
    if (this.reward.exp) hero.gainExp(this.reward.exp);
    if (this.reward.crystals) hero.gainCrystals(this.reward.crystals);

    showToast(`Quest "${this.title}" claimed!`, 'normal');
    updateResources();
    return this.reward;
  }

  toJSON() {
    return { claimed: this.claimed };
  }

  static fromJSON(def, data = {}) {
    return new Quest(def, data.claimed || false);
  }
}

export default class QuestTracker {
  constructor(definitions = QUEST_DEFINITIONS, savedData = null) {
    this.definitions = definitions;
    this.quests = definitions.map((def) => Quest.fromJSON(def, savedData?.[def.id]));
  }

  claim(id, statistics) {
    const q = this.quests.find((quest) => quest.id === id);
    return q ? q.claim(statistics) : null;
  }

  toJSON() {
    const data = {};
    this.quests.forEach((q) => {
      data[q.id] = q.toJSON();
    });
    return data;
  }

  // Reset all quest claimed status
  reset() {
    this.quests = this.definitions.map((def) => Quest.fromJSON(def));
  }
}
