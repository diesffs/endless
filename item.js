export const ITEM_TYPES = {
    HELMET: 'HELMET',
    ARMOR: 'ARMOR',
    PANTS: 'PANTS',
    BOOTS: 'BOOTS',
    SWORD: 'SWORD',
    AXE: 'AXE',
    MACE: 'MACE',
    SHIELD: 'SHIELD',
    GLOVES: 'GLOVES',
    AMULET: 'AMULET',
    RING: 'RING'
};

export const RARITY = {
    NORMAL: { name: 'Normal', color: '#ffffff', chance: 70, statMultiplier: 1 },
    MAGIC: { name: 'Magic', color: '#4287f5', chance: 20, statMultiplier: 1.5 },
    RARE: { name: 'Rare', color: '#ffd700', chance: 9, statMultiplier: 2 },
    UNIQUE: { name: 'Unique', color: '#ff8c00', chance: 1, statMultiplier: 3 }
};

export default class Item {
    constructor(type, level, rarity) {
        this.type = type;
        this.level = level;
        this.rarity = rarity;
        this.stats = this.generateStats();
        this.id = crypto.randomUUID();
    }

    generateStats () {
        const baseStats = this.getBaseStats();
        const multiplier = RARITY[this.rarity].statMultiplier;

        return Object.entries(baseStats).reduce((stats, [stat, value]) => {
            stats[stat] = Math.round(value * multiplier * (1 + this.level * 0.1));
            return stats;
        }, {});
    }

    getBaseStats () {
        switch (this.type) {
            case ITEM_TYPES.HELMET:
                return {
                    armor: 5,
                    vitality: 2,
                    maxHealth: 10
                };
            case ITEM_TYPES.ARMOR:
                return {
                    armor: 10,
                    vitality: 3,
                    maxHealth: 20
                };
            case ITEM_TYPES.PANTS:
                return {
                    armor: 7,
                    vitality: 2,
                    maxHealth: 15
                };
            case ITEM_TYPES.BOOTS:
                return {
                    armor: 4,
                    agility: 2,
                    movementSpeed: 5
                };
            case ITEM_TYPES.SWORD:
                return {
                    damage: 10,
                    strength: 2,
                    critChance: 2
                };
            case ITEM_TYPES.AXE:
                return {
                    damage: 12,
                    strength: 3,
                    critDamage: 0.1
                };
            case ITEM_TYPES.MACE:
                return {
                    damage: 8,
                    strength: 4,
                    armor: 2
                };
            case ITEM_TYPES.SHIELD:
                return {
                    armor: 8,
                    vitality: 2,
                    blockChance: 5
                };
            case ITEM_TYPES.GLOVES:
                return {
                    armor: 3,
                    attackSpeed: 0.1,
                    critChance: 1
                };
            case ITEM_TYPES.AMULET:
                return {
                    strength: 2,
                    agility: 2,
                    vitality: 2
                };
            case ITEM_TYPES.RING:
                return {
                    critChance: 2,
                    critDamage: 0.1,
                    attackSpeed: 0.05
                };
            default:
                return {};
        }
    }


    getDisplayName () {
        return `${RARITY[this.rarity].name} ${this.type.toLowerCase()}`;
    }

    getTooltipHTML () {
        return `
            <div class="item-tooltip" style="color: ${RARITY[this.rarity].color}">
                <div class="item-name">${this.getDisplayName()}</div>
                <div class="item-level">Level ${this.level}</div>
                ${Object.entries(this.stats)
                .map(([stat, value]) => `<div class="item-stat">+${value} ${stat}</div>`)
                .join('')}
            </div>
        `;
    }
}
