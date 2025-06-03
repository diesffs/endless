import { QUEST_DEFINITIONS } from './constants/quests.js';
import { hero, game } from './globals.js';
import { showToast, updateResources } from './ui/ui.js';

export class Quest {
  constructor({ id, title, description, type, target, reward, icon }, progress = 0, claimed = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.target = target;
    this.reward = reward;
    this.icon = icon;
    this.progress = progress;
    this.claimed = claimed;
  }

  isComplete() {
    return this.progress >= this.target;
  }

  addProgress(amount) {
    if (this.claimed) return;
    this.progress = Math.min(this.progress + amount, this.target);
  }

  claim() {
    if (!this.isComplete() || this.claimed) return null;
    this.claimed = true;
    // apply rewards
    if (this.reward.gold) hero.gainGold(this.reward.gold);
    if (this.reward.exp) hero.gainExp(this.reward.exp);
    if (this.reward.souls) hero.gainSoul(this.reward.souls);
    showToast(`Quest "${this.title}" claimed!`, 'normal');
    updateResources();
    return this.reward;
  }

  toJSON() {
    return { progress: this.progress, claimed: this.claimed };
  }

  static fromJSON(def, data = {}) {
    return new Quest(def, data.progress || 0, data.claimed || false);
  }
}

export default class QuestTracker {
  constructor(definitions = QUEST_DEFINITIONS, savedData = null) {
    this.definitions = definitions;
    this.quests = definitions.map((def) => Quest.fromJSON(def, savedData?.[def.id]));
  }

  addProgress(type, amount) {
    this.quests.forEach((q) => {
      if (q.type === type && !q.claimed) q.addProgress(amount);
    });
  }

  claim(id) {
    const q = this.quests.find((quest) => quest.id === id);
    return q ? q.claim() : null;
  }

  toJSON() {
    const data = {};
    this.quests.forEach((q) => {
      data[q.id] = q.toJSON();
    });
    return data;
  }

  // Reset all quest progress and claimed status
  reset() {
    this.quests = this.definitions.map((def) => Quest.fromJSON(def));
  }
}
