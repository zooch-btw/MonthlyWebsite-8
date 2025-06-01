/**
 * Core game logic for Galaxy BattleForge, a Marvel-themed turn-based strategy game.
 * Manages heroes, enemies, game modes, UI, achievements, synergies, and mechanics.
 */

/**
 * Image mappings for heroes.
 * @type {Object.<string, string>}
 */
const warriorImageMap = {
    'Iron Man': 'imgs/ironman.png', 'Captain America': 'imgs/capam.png', 'Thor': 'imgs/thor.png',
    'Black Widow': 'imgs/widow.png', 'Hawkeye': 'imgs/hawkeye.png', 'Spider-Man': 'imgs/spiderman.png',
    'Doctor Strange': 'imgs/strange.png', 'Black Panther': 'imgs/panther.png', 'Scarlet Witch': 'imgs/witch.png',
    'Ant-Man': 'imgs/antman.png', 'Wolverine': 'imgs/bub.png', 'Storm': 'imgs/storm.png',
    'Cyclops': 'imgs/scott.png', 'Jean Grey': 'imgs/jean.png', 'Beast': 'imgs/beast.png',
    'Gambit': 'imgs/gambit.png', 'Rogue': 'imgs/rogue.png', 'Deadpool': 'imgs/wade.png',
    'Venom': 'imgs/venom.png', 'Magneto': 'imgs/max.png', 'Doctor Doom': 'imgs/doom.png',
    'Thanos': 'imgs/thanos.png', 'Loki': 'imgs/loki.png', 'Ultron': 'imgs/ai.png',
    'Red Skull': 'imgs/skull.png', 'Green Goblin': 'imgs/osborn.png', 'Kingpin': 'imgs/fisk.png',
    'Black Cat': 'imgs/cat.png', 'Mysterio': 'imgs/illusion.png', 'Rhino': 'imgs/rhino.png',
    'Sandman': 'imgs/sand.png', 'Electro': 'imgs/dillon.png', 'Doctor Octopus': 'imgs/ock.png',
    'Kraven the Hunter': 'imgs/hunt.png', 'Shocker': 'imgs/shock.png', 'Scorpion': 'imgs/sting.png',
    'Vulture': 'imgs/prey.png', 'Hulk': 'imgs/hulk.png', 'Bullseye': 'imgs/bullseye.png',
    'Winter Soldier': 'imgs/winter.png'
};

/**
 * Image mappings for enemies.
 * @type {Object.<string, string>}
 */
const enemyImageMap = {
    'Void Drone': 'imgs/drone.png', 'Abyssal Stalker': 'imgs/abyss.png',
    'Wave Invader': 'imgs/wave.png', 'Cosmic Tyrant': 'imgs/cosmic.png',
    'Nebula Wraith': 'imgs/wraith.png', 'Galactic Devourer': 'imgs/cosmic.png',
    'Quantum Marauder': 'imgs/cosmic.png', 'Cosmic Overlord': 'imgs/zarkon.png'
};

/**
 * Sound effects for immersive gameplay.
 * @type {Object.<string, HTMLAudioElement>}
 */
const soundEffects = {
    achievement: new Audio('sounds/achievement.mp3'),
    attack: new Audio('sounds/attack.mp3'),
    defeat: new Audio('sounds/defeat.mp3'),
    background: new Audio('sounds/background.mp3'),
    levelUp: new Audio('sounds/levelup.mp3'),
    moreInfo: new Audio('sounds/moreinfo.mp3'),
    select: new Audio('sounds/select.mp3'),
    special: new Audio('sounds/special.mp3'),
    victory: new Audio('sounds/victory.mp3')
};

/**
 * Special abilities for all heroes.
 * @type {Object.<string, {name: string, manaCost: number, cooldown: number, effect: Function}>}
 */
const specialAbilities = {
    'Iron Man': { name: 'Repulsor Barrage', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Captain America': { name: 'Shield Throw', manaCost: 15, cooldown: 3, effect: (target) => { target.debuff = { active: true, turns: 2, type: 'attack' }; target.attack *= 0.8; return 40; } },
    'Thor': { name: 'Mjolnir Strike', manaCost: 25, cooldown: 5, effect: () => 60 },
    'Black Widow': { name: 'Widow’s Bite', manaCost: 15, cooldown: 3, effect: (target) => { target.stunTurns = 1; return 30; } },
    'Hawkeye': { name: 'Trick Arrow', manaCost: 10, cooldown: 2, effect: () => 35 },
    'Spider-Man': { name: 'Web Barrage', manaCost: 20, cooldown: 4, effect: (target) => { target.dodgeChance = Math.max(0, target.dodgeChance - 0.1); return 45; } },
    'Doctor Strange': { name: 'Crimson Bands', manaCost: 25, cooldown: 5, effect: (target) => { target.stunTurns = 2; return 50; } },
    'Black Panther': { name: 'Kinetic Burst', manaCost: 20, cooldown: 4, effect: () => 55 },
    'Scarlet Witch': { name: 'Hex Bolt', manaCost: 30, cooldown: 6, effect: () => 65 },
    'Ant-Man': { name: 'Pym Swarm', manaCost: 15, cooldown: 3, effect: () => 40 },
    'Wolverine': { name: 'Berserker Rage', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Storm': { name: 'Thunderstrike', manaCost: 25, cooldown: 5, effect: (target, _, game) => { game.enemies.forEach(e => e.dealDamage(20)); return 1; } },
    'Cyclops': { name: 'Optic Blast', manaCost: 20, cooldown: 3, effect: () => 45 },
    'Jean Grey': { name: 'Phoenix Flame', manaCost: 30, cooldown: 6, effect: () => 70 },
    'Beast': { name: 'Feral Charge', manaCost: 15, cooldown: 3, effect: () => 40 },
    'Gambit': { name: 'Card Cascade', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Rogue': { name: 'Power Drain', manaCost: 25, cooldown: 5, effect: (target, self) => { self.health += 20; return 45; } },
    'Deadpool': { name: 'Chimichanga Chaos', manaCost: 20, cooldown: 4, effect: () => 55 },
    'Venom': { name: 'Symbiote Strike', manaCost: 25, cooldown: 5, effect: () => 60 },
    'Magneto': { name: 'Magnetic Crush', manaCost: 30, cooldown: 6, effect: () => 65 },
    'Doctor Doom': { name: 'Doom’s Decree', manaCost: 30, cooldown: 6, effect: (target, _, game) => { game.warriors.forEach(w => w.dealDamage(15)); return 50; } },
    'Thanos': { name: 'Infinity Snap', manaCost: 35, cooldown: 7, effect: () => 80 },
    'Loki': { name: 'Illusion Strike', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Ultron': { name: 'Digital Overload', manaCost: 25, cooldown: 5, effect: () => 60 },
    'Red Skull': { name: 'HYDRA Command', manaCost: 20, cooldown: 4, effect: (target) => { target.debuff = { active: true, turns: 2, type: 'attack' }; target.attack *= 0.7; return 45; } },
    'Green Goblin': { name: 'Pumpkin Bomb', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Kingpin': { name: 'Crime Lord’s Wrath', manaCost: 25, cooldown: 5, effect: () => 55 },
    'Black Cat': { name: 'Bad Luck Charm', manaCost: 15, cooldown: 3, effect: (target) => { target.critChance = Math.max(0, target.critChance - 0.1); return 40; } },
    'Mysterio': { name: 'Illusion Trap', manaCost: 20, cooldown: 4, effect: (target) => { target.stunTurns = 1; return 45; } },
    'Rhino': { name: 'Stampede', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Sandman': { name: 'Sandstorm', manaCost: 25, cooldown: 5, effect: () => 55 },
    'Electro': { name: 'Volt Surge', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Doctor Octopus': { name: 'Tentacle Crush', manaCost: 25, cooldown: 5, effect: () => 60 },
    'Kraven the Hunter': { name: 'Predator’s Strike', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Shocker': { name: 'Shockwave', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Scorpion': { name: 'Venom Sting', manaCost: 20, cooldown: 4, effect: (target) => { target.debuff = { active: true, turns: 2, type: 'attack' }; target.attack *= 0.8; return 45; } },
    'Vulture': { name: 'Aerial Assault', manaCost: 20, cooldown: 4, effect: () => 50 },
    'Hulk': { name: 'Gamma Smash', manaCost: 30, cooldown: 6, effect: () => 70 },
    'Bullseye': { name: 'Deadly Precision', manaCost: 15, cooldown: 3, effect: () => 40 },
    'Winter Soldier': { name: 'Bionic Strike', manaCost: 20, cooldown: 4, effect: () => 50 }
};

/**
 * Team synergy definitions for hero combinations.
 * @type {Object.<string, {heroes: string[], description: string, effect: Function}>}
 */
const teamSynergies = {
    AvengersLeadership: {
        heroes: ['Iron Man', 'Captain America', 'Thor'],
        description: 'Avengers Assemble: +20% attack for all heroes.',
        effect: (warriors) => warriors.forEach(w => w.attack *= 1.2)
    },
    TechTriumvirate: {
        heroes: ['Iron Man', 'Black Panther', 'Doctor Doom'],
        description: 'Tech Supremacy: +15% crit chance for tech heroes.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Iron Man', 'Black Panther', 'Doctor Doom'].includes(w.name)) w.critChance += 0.15;
        })
    },
    MysticMasters: {
        heroes: ['Doctor Strange', 'Scarlet Witch', 'Loki'],
        description: 'Arcane Alliance: +25% mana regen.',
        effect: (warriors) => warriors.forEach(w => w.mana += w.maxMana * 0.25)
    },
    XMenUnity: {
        heroes: ['Wolverine', 'Storm', 'Cyclops', 'Jean Grey'],
        description: 'Mutant Brotherhood: +10% health for X-Men.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Wolverine', 'Storm', 'Cyclops', 'Jean Grey', 'Beast', 'Gambit', 'Rogue'].includes(w.name)) {
                w.maxHealth *= 1.1;
                w.health *= 1.1;
            }
        })
    },
    PhoenixForce: {
        heroes: ['Jean Grey', 'Cyclops'],
        description: 'Phoenix Bond: +20% damage for Jean Grey.',
        effect: (warriors) => {
            const jean = warriors.find(w => w.name === 'Jean Grey');
            if (jean) jean.attack += 20;
        }
    },
    WebWarriors: {
        heroes: ['Spider-Man', 'Venom', 'Black Cat'],
        description: 'Web of Fate: +15% dodge chance.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Spider-Man', 'Venom', 'Black Cat'].includes(w.name)) w.dodgeChance += 0.15;
        })
    },
    SinisterSix: {
        heroes: ['Green Goblin', 'Doctor Octopus', 'Electro', 'Mysterio', 'Rhino', 'Vulture'],
        description: 'Villainous Pact: +10% attack per Sinister Six member.',
        effect: (warriors) => {
            const count = warriors.filter(w => ['Green Goblin', 'Doctor Octopus', 'Electro', 'Mysterio', 'Rhino', 'Vulture'].includes(w.name)).length;
            warriors.forEach(w => w.attack *= (1 + count * 0.1));
        }
    },
    CosmicConquerors: {
        heroes: ['Thanos', 'Ultron', 'Magneto'],
        description: 'Universal Domination: +20% shield strength.',
        effect: (warriors) => warriors.forEach(w => w.shield = 0.8)
    },
    StreetFighters: {
        heroes: ['Kingpin', 'Bullseye', 'Deadpool'],
        description: 'Underworld Grit: +15% health regen.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Kingpin', 'Bullseye', 'Deadpool'].includes(w.name)) {
                w.health = Math.min(w.maxHealth, w.health + 15);
            }
        })
    },
    AsgardianMight: {
        heroes: ['Thor', 'Loki'],
        description: 'Godly Kinship: +25% special ability damage.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Thor', 'Loki'].includes(w.name)) w.specialAbilityDamage *= 1.25;
        })
    },
    SHIELDOperatives: {
        heroes: ['Black Widow', 'Hawkeye', 'Winter Soldier'],
        description: 'Covert Ops: +10% crit damage.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Black Widow', 'Hawkeye', 'Winter Soldier'].includes(w.name)) {
                w.critDamage = (w.critDamage || 2) * 1.1;
            }
        })
    },
    PymTech: {
        heroes: ['Ant-Man'],
        description: 'Size Matters: +20% dodge when below 50% health.',
        effect: (warriors) => warriors.forEach(w => {
            if (w.name === 'Ant-Man' && w.health / w.maxHealth < 0.5) w.dodgeChance += 0.2;
        })
    },
    RogueAbsorption: {
        heroes: ['Rogue', 'Gambit'],
        description: 'Cajun Connection: Rogue heals 10% of damage dealt.',
        effect: (warriors) => {
            const rogue = warriors.find(w => w.name === 'Rogue');
            if (rogue) rogue.onDamage = (damage) => rogue.health = Math.min(rogue.maxHealth, rogue.health + damage * 0.1);
        }
    },
    HulkRage: {
        heroes: ['Hulk', 'Beast'],
        description: 'Primal Fury: +15% attack when below 30% health.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Hulk', 'Beast'].includes(w.name) && w.health / w.maxHealth <= 0.3) w.attack *= 1.15;
        })
    },
    MastersOfIllusion: {
        heroes: ['Mysterio', 'Loki'],
        description: 'Trickster’s Gambit: +10% dodge for all.',
        effect: (warriors) => warriors.forEach(w => w.dodgeChance += 0.1)
    },
    TechVillains: {
        heroes: ['Ultron', 'Green Goblin', 'Doctor Octopus'],
        description: 'Mechanical Mayhem: +15% attack speed.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Ultron', 'Green Goblin', 'Doctor Octopus'].includes(w.name)) {
                w.attackCooldown = Math.max(0.5, (w.attackCooldown || 1) * 0.85);
            }
        })
    },
    HunterPredators: {
        heroes: ['Kraven the Hunter', 'Scorpion', 'Vulture'],
        description: 'Predatory Instinct: +10% crit chance.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Kraven the Hunter', 'Scorpion', 'Vulture'].includes(w.name)) w.critChance += 0.1;
        })
    },
    ElementalChaos: {
        heroes: ['Electro', 'Sandman', 'Storm'],
        description: 'Nature’s Wrath: +15% special ability damage.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Electro', 'Sandman', 'Storm'].includes(w.name)) w.specialAbilityDamage *= 1.15;
        })
    },
    RedSkullCommand: {
        heroes: ['Red Skull', 'Winter Soldier'],
        description: 'HYDRA Loyalty: +10% team attack.',
        effect: (warriors) => warriors.forEach(w => w.attack *= 1.1)
    },
    DoomSupreme: {
        heroes: ['Doctor Doom', 'Magneto'],
        description: 'Tyrant’s Might: +20% health for both.',
        effect: (warriors) => warriors.forEach(w => {
            if (['Doctor Doom', 'Magneto'].includes(w.name)) {
                w.maxHealth *= 1.2;
                w.health *= 1.2;
            }
        })
    }
};

/**
 * Power-ups offered after waves.
 * @type {Array.<{name: string, effect: Function}>}
 */
const powerUps = [
    { name: 'Attack Surge', effect: (game) => game.warriors.forEach(w => w.attack *= 1.15) },
    { name: 'Mana Surge', effect: (game) => game.warriors.forEach(w => w.maxMana *= 1.2) },
    { name: 'Health Boost', effect: (game) => game.warriors.forEach(w => { w.maxHealth *= 1.2; w.health = w.maxHealth; }) },
    { name: 'Crit Boost', effect: (game) => game.warriors.forEach(w => w.critChance += 0.1) },
    { name: 'Dodge Mastery', effect: (game) => game.warriors.forEach(w => w.dodgeChance += 0.1) },
    { name: 'Cooldown Reduction', effect: (game) => game.warriors.forEach(w => w.cooldown = Math.max(0, w.cooldown - 1)) },
    { name: 'Shield Enhance', effect: (game) => game.warriors.forEach(w => w.shield = Math.max(0.7, w.shield * 0.9)) }
];

/**
 * Warrior class for playable heroes.
 */
class Warrior {
    /**
     * Creates a new warrior with specified attributes.
     * @param {string} name - Hero name.
     * @param {number} health - Maximum health.
     * @param {number} attack - Base attack power.
     * @param {number} mana - Maximum mana.
     * @param {Object} specialAbility - Special ability data.
     * @param {string} image - Image path.
     */
    constructor(name, health, attack, mana, specialAbility, image) {
        this.name = name || 'Unknown Hero';
        this.health = health || 100;
        this.maxHealth = health;
        this.attack = attack || 10;
        this.baseAttack = attack;
        this.mana = mana || 50;
        this.maxMana = mana;
        this.specialAbility = specialAbility || { name: 'None', manaCost: 0, cooldown: 0, effect: () => 0 };
        this.image = image || 'imgs/default.png';
        if (!image && name) console.warn(`[game.js] Image not found for ${name}`);
        this.isAlive = true;
        this.cooldown = 0;
        this.stunTurns = 0;
        this.buff = { active: false, turns: 0, type: null };
        this.debuff = { active: false, turns: 0, type: null };
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.critChance = 0.15;
        this.dodgeChance = 0.1;
        this.shield = 1;
        this.passive = this.getPassive();
        this.comboPoints = 0;
        this.specialAbilityDamage = 1;
        this.critDamage = 2;
        this.attackCooldown = 1;
        this.onDamage = () => { };
    }

    /**
     * Assigns passive abilities based on hero.
     * @returns {Object|null} Passive ability or null if none.
     */
    getPassive() {
        const passives = {
            'Iron Man': { name: 'Arc Reactor', effect: () => { if (Math.random() < 0.6) this.mana = Math.min(this.maxMana, this.mana + 5); } },
            'Captain America': { name: 'Indomitable Spirit', effect: () => { this.shield = Math.max(0.85, this.shield); } },
            'Thor': { name: 'Asgardian Might', effect: () => { if (this.health < this.maxHealth * 0.3) this.attack *= 1.2; } },
            'Black Widow': { name: 'Espionage', effect: () => { this.critChance += 0.05; } },
            'Spider-Man': { name: 'Spider-Sense', effect: () => { this.dodgeChance = Math.min(0.5, this.dodgeChance + 0.05); } },
            'Doctor Strange': { name: 'Mystic Shield', effect: () => { this.shield = Math.max(0.7, this.shield); } },
            'Black Panther': { name: 'Vibranium Weave', effect: () => { this.shield = Math.max(0.8, this.shield); } },
            'Scarlet Witch': { name: 'Chaos Magic', effect: () => { if (Math.random() < 0.1) this.attack += 5; } },
            'Wolverine': { name: 'Regeneration', effect: () => { this.health = Math.min(this.maxHealth, this.health + 10); } },
            'Deadpool': { name: 'Regenerative Quirk', effect: () => { this.health = Math.min(this.maxHealth, this.health + 8); } },
            'Hulk': { name: 'Gamma Fury', effect: () => { this.attack += Math.floor((1 - this.health / this.maxHealth) * 30); } },
            'Storm': { name: 'Weather Control', effect: () => { if (Math.random() < 0.2) this.mana += 10; } },
            'Cyclops': { name: 'Tactical Leader', effect: () => { this.critChance += 0.05; } },
            'Jean Grey': { name: 'Phoenix Spark', effect: () => { if (this.health < 50) this.attack += 20; } },
            'Beast': { name: 'Agile Reflexes', effect: () => { this.dodgeChance += 0.1; } },
            'Gambit': { name: 'Kinetic Charge', effect: () => { if (Math.random() < 0.15) this.critChance += 0.05; } },
            'Rogue': { name: 'Power Siphon', effect: () => { if (Math.random() < 0.1) this.health += 5; } },
            'Venom': { name: 'Symbiote Resilience', effect: () => { this.shield = Math.max(0.7, this.shield); } },
            'Magneto': { name: 'Magnetic Barrier', effect: () => { this.shield = Math.max(0.7, this.shield); } },
            'Doctor Doom': { name: 'Sorcerous Might', effect: () => { this.mana += 15; } },
            'Thanos': { name: 'Titan’s Will', effect: () => { this.maxHealth += 10; this.health += 10; } },
            'Loki': { name: 'Trickster', effect: () => { this.dodgeChance += 0.05; } },
            'Ultron': { name: 'Adaptive Code', effect: () => { this.critChance += 0.05; } },
            'Ant-Man': { name: 'Pym Agility', effect: () => { if (this.health < 50) this.dodgeChance += 0.1; } },
            'Hawkeye': { name: 'Precision Aim', effect: () => { this.critChance += 0.05; } },
            'Black Cat': { name: 'Feline Grace', effect: () => { this.dodgeChance += 0.05; } },
            'Red Skull': { name: 'HYDRA Zeal', effect: () => { this.attack += 5; } },
            'Green Goblin': { name: 'Goblin Frenzy', effect: () => { if (this.health < 30) this.critChance += 0.1; } },
            'Kingpin': { name: 'Crime Lord', effect: () => { this.maxHealth += 15; } },
            'Mysterio': { name: 'Illusion Veil', effect: () => { this.dodgeChance += 0.05; } },
            'Rhino': { name: 'Thick Hide', effect: () => { this.shield = Math.max(0.8, this.shield); } },
            'Sandman': { name: 'Sand Shift', effect: () => { this.dodgeChance += 0.05; } },
            'Electro': { name: 'Electric Charge', effect: () => { this.critChance += 0.05; } },
            'Doctor Octopus': { name: 'Mechanical Mind', effect: () => { this.mana += 10; } },
            'Kraven the Hunter': { name: 'Hunter’s Instinct', effect: () => { this.critChance += 0.05; } },
            'Shocker': { name: 'Vibration Pulse', effect: () => { this.attack += 5; } },
            'Scorpion': { name: 'Venomous Tail', effect: () => { this.critChance += 0.05; } },
            'Vulture': { name: 'Aerial Agility', effect: () => { this.dodgeChance += 0.05; } },
            'Bullseye': { name: 'Perfect Aim', effect: () => { this.critChance += 0.05; } },
            'Winter Soldier': { name: 'Bionic Resilience', effect: () => { this.shield = Math.max(0.8, this.shield); } }
        };
        return passives[this.name] || null;
    }

    /**
     * Performs basic attack on target.
     * @param {Object} target - Target enemy.
     * @returns {number} Damage dealt.
     */
    attackTarget(target) {
        if (!this.isAlive || this.stunTurns > 0 || this.attackCooldown > 0) return 0;
        const crit = Math.random() < this.critChance;
        const damage = Math.round(this.attack * (crit ? this.critDamage : 1) * (0.9 + Math.random() * 0.2) * window.Game.comboMultiplier);
        const mitigatedDamage = target.dealDamage(damage);
        if (mitigatedDamage) {
            this.gainXP(20);
            this.comboPoints = Math.min(5, this.comboPoints + 1);
            window.Game.updateUI();
            if (this.onDamage) this.onDamage(mitigatedDamage);
            this.logAction(`${this.name} strikes ${target.name} for ${mitigatedDamage} damage${crit ? ' (Critical!)' : ''}!`);
            soundEffects.attack.play().catch(() => { });
            if (this.passive) this.passive.effect(this);
            window.Game.gameAchievements.criticals.count += crit ? 1 : 0;
            window.Game.checkAchievements();
            this.attackCooldown = 1;
        }
        return mitigatedDamage;
    }

    /**
     * Uses special ability on target.
     * @param {Object} target - Target enemy.
     * @param {Object} game - Game instance.
     * @returns {number} Damage dealt.
     */
    useSpecial(target, game) {
        if (!this.isAlive || this.mana < this.specialAbility.manaCost || this.cooldown > 0 || this.stunTurns > 0) return 0;
        let damage = this.specialAbility.effect(target, this, game) || 0;
        damage *= this.specialAbilityDamage;
        this.mana -= this.specialAbility.manaCost;
        this.cooldown = this.specialAbility.cooldown;
        this.gainXP(50);
        this.comboPoints = Math.min(5, this.comboPoints + 2);
        window.Game.updateUI();
        if (this.onDamage && damage) this.onDamage(damage);
        this.logAction(`${this.name} unleashes ${this.specialAbility.name} for ${damage} damage!`);
        soundEffects.special.play().catch(() => { });
        game.gameAchievements.specialist.count++;
        game.specialAchievements.specialMaster.count++;
        game.checkAchievements();
        game.checkSpecialAchievements();
        if (this.passive) this.passive.effect(this);
        return damage;
    }

    /**
     * Receives damage with dodge chance.
     * @param {number} damage - Incoming damage.
     * @returns {number} Mitigated damage.
     */
    dealDamage(damage) {
        if (Math.random() < this.dodgeChance) {
            this.logAction(`${this.name} dodges the attack!`);
            window.Game.flawlessWave = true;
            window.Game.gameAchievements.dodgeCount.count++;
            window.Game.checkAchievements();
            return 0;
        }
        const mitigatedDamage = Math.round(damage * this.shield);
        this.health = Math.max(0, this.health - mitigatedDamage);
        window.Game.flawlessWave = false;
        if (!this.health) {
            this.isAlive = false;
            this.logAction(`${this.name} has fallen!`);
            window.Game.checkGameOver();
        }
        return mitigatedDamage;
    }

    /**
     * Regenerates resources and updates status effects.
     */
    regenerate() {
        this.mana = Math.min(this.maxMana, this.mana + (5 + this.level * 2));
        if (this.cooldown > 0) this.cooldown--;
        if (this.stunTurns > 0) this.stunTurns--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.buff.active) {
            this.buff.turns--;
            if (this.buff.turns <= 0 && this.buff.turns !== Infinity) {
                this.buff.active = false;
                this.resetBuff();
            }
        }
        if (this.debuff.active) {
            this.debuff.turns--;
            if (this.debuff.turns <= 0) {
                this.debuff.active = false;
                this.resetDebuff();
            }
        }
        if (this.passive) this.passive.effect(this);
    }

    /**
     * Resets buffs to default values.
     */
    resetBuff() {
        if (this.buff.type === 'attack') this.attack = this.baseAttack;
        if (this.buff.type === 'crit') this.critChance = 0.15;
        if (this.buff.type === 'shield') this.shield = 1;
        if (this.buff.type === 'dodge') this.dodgeChance = 0.1;
        this.buff.type = '';
    }

    /**
     * Resets debuffs to default values.
     */
    resetDebuff() {
        if (this.debuff.type === 'attack') this.attack = this.baseAttack;
        if (this.debuff.type === 'stun') this.stunTurns = 0;
        this.debuff.type = null;
    }

    /**
     * Gains experience points and levels up if threshold met.
     * @param {number} amount - XP amount.
     */
    gainXP(amount) {
        this.xp += amount * window.Game.xpMultiplier;
        while (this.xp >= this.xpToNextLevel && this.level < 20) {
            this.levelUp();
        }
    }

    /**
     * Levels up hero with enhanced stats.
     */
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.5);
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.baseAttack += 5;
        this.attack = this.baseAttack;
        this.maxMana += 10;
        this.mana = Math.min(this.maxMana, this.mana + 10);
        this.critChance += 0.02;
        this.dodgeChance += 0.01;
        this.logAction(`${this.name} ascends to Level ${this.level}!`);
        soundEffects.levelUp.play().catch(() => { });
        window.Game.gameAchievements.levelUp.count++;
        window.Game.specialAchievements.levelMaster.count++;
        if (this.level === 20) {
            window.Game.gameAchievements.maxLevel.count++;
            window.Game.specialAchievements.legendaryHeroes.count++;
        }
        window.Game.checkAchievements();
        window.Game.checkSpecialAchievements();
    }

    /**
     * Logs action to battle log.
     * @param {string} message - Log message.
     */
    logAction(message) {
        const log = document.getElementById('gameLog');
        if (log) {
            const entry = document.createElement('p');
            entry.textContent = message;
            entry.classList.add('animate__animated', 'animate__fadeIn');
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }
    }

    /**
     * Revives the warrior to full health.
     */
    revive() {
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        this.isAlive = true;
        this.cooldown = 0;
        this.stunTurns = 0;
        this.attackCooldown = 0;
        this.logAction(`${this.name} has been revived!`);
    }
}

/**
 * Enemy class for opponents.
 */
class Enemy {
    /**
     * Creates a new enemy with specified attributes.
     * @param {string} name - Enemy name.
     * @param {number} health - Maximum health.
     * @param {number} attack - Base attack.
     * @param {string} image - Image path.
     * @param {Object} [specialAbility] - Special ability.
     */
    constructor(name, health, attack, image, specialAbility) {
        this.name = name || 'Unknown Enemy';
        this.health = health || 50;
        this.maxHealth = health;
        this.attack = attack || 10;
        this.baseAttack = attack;
        this.image = image || 'imgs/default.png';
        if (!image && name) console.warn(`[game.js] Image not found for ${name}`);
        this.specialAbility = specialAbility || { name: '', cooldown: 0, effect: () => 0 };
        this.isAlive = true;
        this.stunTurns = 0;
        this.debuff = { active: false, turns: 0, type: null };
        this.cooldown = 0;
        this.critChance = 0.1;
        this.dodgeChance = 0.05;
        this.shield = 1;
    }

    /**
     * Performs attack on target.
     * @param {Object} target - Target warrior.
     * @returns {number} Damage dealt.
     */
    attackTarget(target) {
        if (!this.isAlive || this.stunTurns > 0) return 0;
        const crit = Math.random() < this.critChance;
        const damage = Math.round(this.attack * (crit ? 1.5 : 1) * (0.9 + Math.random() * 0.2));
        const mitigatedDamage = target.dealDamage(damage);
        if (mitigatedDamage) {
            this.logAction(`${this.name} hits ${target.name} for ${mitigatedDamage} damage${crit ? ' (Critical!)' : ''}!`);
            soundEffects.attack.play().catch(() => { });
        }
        return mitigatedDamage;
    }

    /**
     * Uses special ability on target.
     * @param {Object} target - Target warrior.
     * @param {Object} game - Game instance.
     * @returns {number} Damage dealt.
     */
    useSpecial(target, game) {
        if (!this.specialAbility.name || this.cooldown > 0 || this.stunTurns > 0) return 0;
        const damage = this.specialAbility.effect(target, this, game) || 0;
        this.cooldown = this.specialAbility.cooldown || 3;
        if (damage) {
            this.logAction(`${this.name} uses ${this.specialAbility.name} for ${damage} damage!`);
            soundEffects.special.play().catch(() => { });
        }
        return damage;
    }

    /**
     * Takes damage with dodge chance.
     * @param {number} damage - Incoming damage.
     * @returns {number} Mitigated damage.
     */
    dealDamage(damage) {
        if (Math.random() < this.dodgeChance) {
            this.logAction(`${this.name} dodges the attack!`);
            return 0;
        }
        const mitigatedDamage = Math.round(damage * this.shield);
        this.health = Math.max(0, this.health - mitigatedDamage);
        if (!this.health) {
            this.isAlive = false;
            this.logAction(`${this.name} is defeated!`);
            window.Game.addScore(100);
            window.Game.gameAchievements.defeatEnemies.count++;
            window.Game.specialAchievements.enemyCrusher.count++;
            window.Game.checkAchievements();
            window.Game.checkSpecialAchievements();
        }
        return mitigatedDamage;
    }

    /**
     * Updates status effects.
     */
    update() {
        if (this.stunTurns > 0) this.stunTurns--;
        if (this.debuff.active) {
            this.debuff.turns--;
            if (this.debuff.turns <= 0) {
                this.debuff.active = false;
                if (this.debuff.type === 'attack') this.attack = this.baseAttack;
                this.debuff.type = null;
            }
        }
        if (this.cooldown > 0) this.cooldown--;
    }

    /**
     * Logs action to battle log.
     * @param {string} message - Log message.
     */
    logAction(message) {
        const log = document.getElementById('gameLog');
        if (log) {
            const entry = document.createElement('p');
            entry.textContent = message;
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }
    }
}

/**
 * Game manager (global instance).
 * @namespace
 */
window.Game = {
    wave: 1,
    score: 0,
    warriors: [],
    enemies: [],
    gameMode: 'infinite',
    isGameOver: false,
    selectedEnemyIndex: null,
    comboMultiplier: 1,
    xpMultiplier: 1,
    flawlessWave: false,
    turnStartTime: null,
    settings: { theme: 'light' },
    activeSynergies: [],
    gameAchievements: {
        defeatEnemies: { count: 0, goal: 50, name: 'Enemy Slayer', description: 'Defeat 50 enemies', reward: () => { window.Game.xpMultiplier *= 1.05; }, unlocked: false },
        cosmicChampion: { count: 0, goal: 5000, name: 'Cosmic Champion', description: 'Reach 5,000 points', reward: () => { window.Game.addScore(1000); }, unlocked: false },
        levelUp: { count: 0, goal: 5, name: 'Hero Ascendant', description: 'Level up 5 times', reward: () => { window.Game.warriors.forEach(w => { w.maxHealth *= 1.1; w.health = w.maxHealth; }); }, unlocked: false },
        specialist: { count: 0, goal: 10, name: 'Specialist', description: 'Use 10 special abilities', reward: () => { window.Game.warriors.forEach(w => w.maxMana *= 1.1); }, unlocked: false },
        waveMaster: { count: 0, goal: 10, name: 'Wave Master', description: 'Survive 10 waves', reward: () => { window.Game.warriors.forEach(w => { w.health = w.maxHealth; w.mana = w.maxMana; }); }, unlocked: false },
        maxLevel: { count: 0, goal: 1, name: 'Ultimate Hero', description: 'Reach level 20 with a hero', reward: () => { window.Game.warriors.forEach(w => { w.attack += 10; w.critChance += 0.05; }); }, unlocked: false },
        perfectWave: { count: 0, goal: 1, name: 'Perfect Wave', description: 'Clear wave without damage', reward: () => { window.Game.warriors.forEach(w => w.shield = Math.max(0.8, w.shield * 0.9)); }, unlocked: false },
        speedTitan: { count: 0, goal: 5, name: 'Speed Titan', description: 'Clear 5 waves under 25s', reward: () => { window.Game.warriors.forEach(w => w.critChance += 0.05); }, unlocked: false },
        bossSlayer: { count: 0, goal: 1, name: 'Boss Slayer', description: 'Defeat a boss', reward: () => { window.Game.warriors.filter(w => !w.isAlive)[0]?.revive(); }, unlocked: false },
        mirrorMaster: { count: 0, goal: 1, name: 'Mirror Master', description: 'Win Mirror Mode', reward: () => { window.Game.warriors.forEach(w => w.critChance += 0.1); }, unlocked: false },
        comboMaster: { count: 0, goal: 1, name: 'Combo Master', description: 'Reach x5 combo', reward: () => { window.Game.comboMultiplier *= 1.2; }, unlocked: false },
        teamSynergy: { count: 0, goal: 1, name: 'Team Synergy', description: 'Activate a synergy', reward: () => { window.Game.warriors.forEach(w => w.mana += w.maxMana * 0.2); }, unlocked: false },
        tripleThreat: { count: 0, goal: 3, name: 'Triple Threat', description: 'Field 3 unique heroes', reward: () => { window.Game.warriors.forEach(w => { w.maxHealth *= 1.1; w.health = w.maxHealth; }); }, unlocked: false },
        criticals: { count: 0, goal: 50, name: 'Critical Hits', description: 'Land 50 critical hits', reward: () => { window.Game.warriors.forEach(w => w.critChance += 0.1); }, unlocked: false },
        dodgeCount: { count: 0, goal: 20, name: 'Dodge Master', description: 'Dodge 20 times', reward: () => { window.Game.warriors.forEach(w => w.dodgeChance += 0.05); }, unlocked: false }
    },
    specialAchievements: {
        enemyCrusher: { count: 0, goal: 100, name: 'Enemy Annihilator', description: 'Crush 100 enemies', reward: () => { window.Game.warriors.forEach(w => { w.maxHealth *= 1.2; w.health = w.maxHealth; }); }, unlocked: false },
        scoreMaster: { count: 0, goal: 20000, name: 'Score Titan', description: 'Score 20,000 points', reward: () => { window.Game.addScore(5000); }, unlocked: false },
        levelMaster: { count: 0, goal: 50, name: 'Level Legend', description: 'Level up 50 times', reward: () => { window.Game.warriors.forEach(w => w.attack += 20); }, unlocked: false },
        waveConqueror: { count: 0, goal: 50, name: 'Wave Conqueror', description: 'Survive 50 waves', reward: () => { window.Game.warriors.forEach(w => w.shield = Math.max(0.7, w.shield * 0.9)); }, unlocked: false },
        specialMaster: { count: 0, goal: 20, name: 'Special Master', description: 'Use 20 special abilities', reward: () => { window.Game.warriors.forEach(w => w.cooldown = Math.max(0, w.cooldown - 1)); }, unlocked: false },
        legendaryHeroes: { count: 0, goal: 5, name: 'Legendary Heroes', description: 'Five heroes to level 5', reward: () => { window.Game.warriors.forEach(w => { w.attack += 15; w.critChance += 0.05; }); }, unlocked: false },
        flawlessMaster: { count: 0, goal: 5, name: 'Flawless Master', description: 'Five perfect waves', reward: () => { window.Game.warriors.forEach(w => w.shield = Math.max(0.6, w.shield * 0.9)); }, unlocked: false },
        comboLegend: { count: 0, goal: 10, name: 'Combo Legend', description: 'Reach x5 combo 10 times', reward: () => { window.Game.comboMultiplier *= 2; }, unlocked: false },
        synergyMaster: { count: 0, goal: 5, name: 'Synergy Master', description: 'Activate five synergies', reward: () => { window.Game.warriors.forEach(w => w.maxMana *= 1.2); }, unlocked: false },
        modeMaster: { count: 0, goal: 3, name: 'Mode Master', description: 'Win all modes', reward: () => { window.Game.warriors.forEach(w => { w.maxHealth *= 1.15; w.health = w.maxHealth; w.critChance += 0.05; }); }, unlocked: false }
    },

    /**
     * Initializes the game state.
     */
    initialize() {
        try {
            this.loadGame();
            this.bindEvents();
            this.populateHowToPlay();
            this.applyTeamSynergies();
            this.startWave();
            this.updateUI();
            this.log('Game initialized. Command your heroes!');
            soundEffects.background.loop = true;
            soundEffects.background.play().catch(() => { });
            if (this.warriors.length === 3) {
                this.gameAchievements.tripleThreat.count++;
                this.checkAchievements();
            }
        } catch (error) {
            console.error('[game.js] Initialization error:', error);
            this.showError('Initialization failed. Starting default team.');
            this.warriors = [
                new Warrior('Iron Man', 100, 20, 50, specialAbilities['Iron Man'], warriorImageMap['Iron Man']),
                new Warrior('Captain America', 120, 15, 40, specialAbilities['Captain America'], warriorImageMap['Captain America']),
                new Warrior('Thor', 110, 18, 45, specialAbilities['Thor'], warriorImageMap['Thor'])
            ];
            this.applyTeamSynergies();
            this.startWave();
            this.updateUI();
            this.gameAchievements.tripleThreat.count++;
            this.checkAchievements();
        }
    },

    /**
     * Loads saved game state from localStorage.
     */
    loadGame() {
        try {
            const saved = localStorage.getItem('galaxyBattleForge');
            if (saved) {
                const data = JSON.parse(saved);
                this.wave = data.wave || 1;
                this.score = data.score || 0;
                this.gameMode = data.gameMode || 'infinite';
                this.settings.theme = data.settings?.theme || 'light';
                if (data.warriors?.length) {
                    this.warriors = data.warriors.map(w => {
                        const warrior = new Warrior(
                            w.name,
                            w.maxHealth,
                            w.baseAttack,
                            w.maxMana,
                            specialAbilities[w.name] || { name: 'None', manaCost: 0, cooldown: 0, effect: () => 0 },
                            warriorImageMap[w.name] || 'imgs/default.png'
                        );
                        warrior.health = w.health;
                        warrior.mana = w.mana;
                        warrior.level = w.level || 1;
                        warrior.xp = w.xp || 0;
                        warrior.xpToNextLevel = w.xpToNextLevel || 100;
                        warrior.isAlive = w.isAlive ?? true;
                        warrior.cooldown = w.cooldown || 0;
                        warrior.stunTurns = w.stunTurns || 0;
                        warrior.critChance = w.critChance || 0.15;
                        warrior.dodgeChance = w.dodgeChance || 0.1;
                        warrior.shield = w.shield || 1;
                        warrior.comboPoints = w.comboPoints || 0;
                        return warrior;
                    });
                } else {
                    const heroes = window.players || ['Iron Man', 'Captain America', 'Thor'];
                    this.warriors = heroes.map(name => new Warrior(
                        name,
                        100,
                        15,
                        50,
                        specialAbilities[name] || { name: 'None', manaCost: 0, cooldown: 0, effect: () => 0 },
                        warriorImageMap[name] || 'imgs/default.png'
                    )).slice(0, 3);
                }
                document.body.classList.toggle('dark', this.settings.theme === 'dark');
                const themeBtn = document.getElementById('theme-toggle');
                if (themeBtn) themeBtn.textContent = `Toggle Theme: ${this.settings.theme.charAt(0).toUpperCase() + this.settings.theme.slice(1)}`;
                this.log('Game loaded successfully.');
            }
        } catch (error) {
            console.error('[game.js] Error loading game:', error);
            this.showError('Failed to load game. Starting new game.');
        }
    },

    /**
     * Saves game state to localStorage.
     */
    saveGame() {
        try {
            const data = {
                wave: this.wave,
                score: this.score,
                gameMode: this.gameMode,
                warriors: this.warriors.map(w => ({
                    name: w.name,
                    health: w.health,
                    maxHealth: w.maxHealth,
                    baseAttack: w.baseAttack,
                    mana: w.mana,
                    maxMana: w.maxMana,
                    level: w.level,
                    xp: w.xp,
                    xpToNextLevel: w.xpToNextLevel,
                    isAlive: w.isAlive,
                    cooldown: w.cooldown,
                    stunTurns: w.stunTurns,
                    critChance: w.critChance,
                    dodgeChance: w.dodgeChance,
                    shield: w.shield,
                    comboPoints: w.comboPoints
                })),
                settings: this.settings,
                gameAchievements: this.gameAchievements,
                specialAchievements: this.specialAchievements
            };
            localStorage.setItem('galaxyBattleForge', JSON.stringify(data));
            this.log('Game saved successfully!');
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('saveGameModal'));
            if (modal) modal.show();
        } catch (error) {
            console.error('[game.js] Error saving game:', error);
            this.showError('Failed to save game: Storage limit reached.');
        }
    },

    /**
     * Binds UI event listeners.
     */
    bindEvents() {
        const saveBtn = document.getElementById('saveGameBtn');
        const restartBtn = document.getElementById('restartGameBtn');
        const themeBtn = document.getElementById('theme-toggle');
        const achievementsBtn = document.getElementById('achievementsBtn');
        const specialAchievementsBtn = document.getElementById('specialAchievementsBtn');
        const gameModeBtn = document.getElementById('gameModeBtn');
        const howToPlayBtn = document.getElementById('howToPlayBtn');

        if (saveBtn) saveBtn.onclick = () => this.saveGame();
        if (restartBtn) restartBtn.onclick = () => this.restartGame();
        if (themeBtn) themeBtn.onclick = () => this.toggleTheme();
        if (achievementsBtn) achievementsBtn.onclick = () => this.showAchievements();
        if (specialAchievementsBtn) specialAchievementsBtn.onclick = () => this.showSpecialAchievements();
        if (gameModeBtn) {
            gameModeBtn.onclick = () => {
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('gameModeModal'));
                if (modal) modal.show();
            };
        }
        if (howToPlayBtn) {
            howToPlayBtn.onclick = () => {
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('howToPlayModal'));
                if (modal) modal.show();
                soundEffects.moreInfo.play().catch(() => { });
            };
        }

        // Bind game mode selection buttons
        ['infinite', 'final', 'mirror'].forEach(mode => {
            const btn = document.getElementById(`select-${mode}`);
            if (btn) {
                btn.onclick = () => {
                    this.gameMode = mode;
                    this.restartGame();
                    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('gameModeModal'));
                    if (modal) modal.hide();
                };
            }
        });
    },

    /**
     * Populates the How to Play modal content.
     */
    populateHowToPlay() {
        const modalBody = document.getElementById('howToPlayModalBody');
        if (modalBody) {
            modalBody.innerHTML = `
        <h4>Welcome to Galaxy BattleForge!</h4>
        <p>Lead Marvel heroes to defend the galaxy against cosmic threats.</p>
        <h5>Gameplay Basics</h5>
        <ul>
          <li><strong>Team Selection</strong>: Choose up to 3 heroes with unique abilities.</li>
          <li><strong>Combat</strong>: Attack enemies using basic attacks or special abilities.</li>
          <li><strong>Turn Order</strong>: Your team acts first, then enemies counterattack.</li>
          <li><strong>Progress Bars</strong>: Monitor health, mana, and XP on hero cards.</li>
          <li><strong>Game Modes</strong>:
            <ul>
              <li><em>Infinite</em>: Survive endless enemy waves.</li>
              <li><em>Final Battle</em>: Defeat a powerful boss.</li>
              <li><em>Mirror Mode</em>: Fight mirror versions of your team.</li>
            </ul>
          </li>
        </ul>
        <h5>Mechanics</h5>
        <ul>
          <li><strong>Synergies</strong>: Hero combinations grant bonuses.</li>
          <li><strong>Achievements</strong>: Earn rewards for challenges.</li>
          <li><strong>Power-Ups</strong>: Choose upgrades every 3 waves.</li>
          <li><strong>Combo Multiplier</strong>: Chain attacks to boost damage.</li>
        </ul>
        <h5>Tips</h5>
        <ul>
          <li>Balance team with tank, damage, and support roles.</li>
          <li>Use special abilities strategically.</li>
          <li>Prioritize high-threat enemies.</li>
          <li>Save frequently to preserve progress.</li>
        </ul>
      `;
        }
    },

    /**
     * Applies team synergies based on warrior composition.
     */
    applyTeamSynergies() {
        this.activeSynergies = [];
        const warriorNames = this.warriors.map(w => w.name);
        for (const [name, synergy] of Object.entries(teamSynergies)) {
            if (synergy.heroes.every(h => warriorNames.includes(h))) {
                this.activeSynergies.push(name);
                synergy.effect(this.warriors);
                this.log(`Synergy activated: ${synergy.description}`);
                this.gameAchievements.teamSynergy.count++;
                this.specialAchievements.synergyMaster.count++;
                this.checkAchievements();
                this.checkSpecialAchievements();
            }
        }
    },

    /**
     * Starts a new wave with enemies based on game mode.
     */
    startWave() {
        try {
            this.comboMultiplier = 1;
            this.turnStartTime = Date.now();
            this.flawlessWave = true;
            this.enemies = [];

            if (this.gameMode === 'infinite') {
                const enemyCount = Math.min(5, 1 + Math.floor(this.wave / 3));
                const enemyTypes = ['Void Drone', 'Abyssal Stalker', 'Wave Invader', 'Nebula Wraith', 'Quantum Marauder'];
                for (let i = 0; i < enemyCount; i++) {
                    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                    const health = 50 + this.wave * 50;
                    const attack = 10 + this.wave * 2;
                    const special = {
                        'Void Drone': { name: 'Pulse Wave', cooldown: 3, effect: (target) => { target.stunTurns = 1; return 20; } },
                        'Abyssal Stalker': { name: 'Shadow Strike', cooldown: 4, effect: () => 30 },
                        'Wave Invader': { name: 'Energy Surge', cooldown: 3, effect: (target) => { target.debuff = { active: true, turns: 2, type: 'attack' }; target.attack *= 0.8; return 25; } },
                        'Nebula Wraith': { name: 'Spectral Drain', cooldown: 5, effect: (target, self) => { self.health += 20; return 35; } },
                        'Quantum Marauder': { name: 'Quantum Rift', cooldown: 4, effect: (target, _, game) => { game.warriors.forEach(w => w.dealDamage(10)); return 20; } }
                    }[type];
                    this.enemies.push(new Enemy(type, health, attack, enemyImageMap[type], special));
                }
                if (this.wave % 5 === 0) {
                    this.enemies.push(new Enemy(
                        'Cosmic Tyrant',
                        100 + this.wave * 100,
                        20 + this.wave * 5,
                        enemyImageMap['Cosmic Tyrant'],
                        { name: 'Cosmic Surge', cooldown: 5, effect: (target) => { target.debuff = { active: true, turns: 2, type: 'attack' }; target.attack *= 0.8; return 30 + this.wave * 10; } }
                    ));
                }
            } else if (this.gameMode === 'final') {
                this.enemies.push(new Enemy(
                    'Galactic Devourer',
                    1000,
                    50,
                    enemyImageMap['Galactic Devourer'],
                    { name: 'Void Crush', cooldown: 4, effect: (target, _, game) => { game.warriors.forEach(w => w.dealDamage(30)); return 60; } }
                ));
            } else if (this.gameMode === 'mirror') {
                this.enemies = this.warriors.map(w => new Enemy(
                    `Mirror ${w.name}`,
                    w.maxHealth * 1.2,
                    w.baseAttack * 1.2,
                    w.image,
                    w.specialAbility
                ));
            }

            this.log(`Wave ${this.wave} - Enemies: ${this.enemies.map(e => e.name).join(', ')}`);

            const waveTransition = document.getElementById('waveTransition');
            if (waveTransition) {
                waveTransition.textContent = `Wave ${this.wave}`;
                waveTransition.style.display = 'block';
                setTimeout(() => { waveTransition.style.display = 'none'; }, 2000);
            }

            this.warriors.forEach(w => w.regenerate());
            this.updateUI();
        } catch (error) {
            console.error('[game.js] startWave error:', error);
            this.showError('Failed to start wave. Restarting.');
            this.restartGame();
        }
    },

    /**
     * Updates the game UI with current state.
     */
    updateUI() {
        try {
            const scoreDisplay = document.getElementById('scoreDisplay');
            const waveDisplay = document.getElementById('waveDisplay');
            if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.score}`;
            if (waveDisplay) waveDisplay.textContent = `Wave ${this.wave}`;

            const warriorContainer = document.getElementById('warriors');
            if (warriorContainer) {
                warriorContainer.innerHTML = '';
                this.warriors.forEach((warrior, index) => {
                    const card = document.createElement('div');
                    card.className = 'character-card';
                    card.innerHTML = `
            <img class="character-img" src="${warrior.image || 'placeholder.png'}" alt="${warrior.name}" onerror="this.src='placeholder.png'; this.alt='Image not found'" />
            <div class="status-bars">
              <h3>${warrior.name} (Lv ${warrior.level})</h3>
              <div class="progress">
                <div class="progress-bar progress-bar-health" style="width: ${(warrior.health / warrior.maxHealth * 100)}%;" role="progressbar" aria-label="Health" aria-valuenow="${warrior.health}" aria-valuemin="0" aria-valuemax="${warrior.maxHealth}"></div>
              </div>
              <div>Health: ${Math.floor(warrior.health)} / ${warrior.maxHealth}</div>
              <div class="progress">
                <div class="progress-bar progress-bar-mana" style="width: ${(warrior.mana / warrior.maxMana * 100)}%;"></div>
              </div>
              <div>Mana: ${Math.floor(warrior.mana)} / ${warrior.maxMana}</div>
              <div class="progress">
                <div class="progress-bar progress-bar-xp" style="width: ${(warrior.xp / warrior.xpToNextLevel * 100)}%;"></div>
              </div>
              <div>XP: ${Math.floor(warrior.xp)} / ${warrior.xpToNextLevel}</div>
              <div class="stats-modal" id="statsModal${index}">
                <p>Attack: ${warrior.attack}</p>
                <p>Crit: ${Math.round(warrior.critChance * 100)}%</p>
                <p>Dodge: ${Math.round(warrior.dodgeChance * 100)}%</p>
                <p>Shield: ${Math.round((1 - warrior.shield) * 100)}% DMG Reduction</p>
                ${warrior.passive ? `<p>Passive: ${warrior.passive.name}</p>` : ''}
                ${warrior.buff.active ? `<p>Buff: ${warrior.buff.type}</p>` : ''}
                ${warrior.debuff.active ? `<p>Debuff: ${warrior.debuff.type}</p>` : ''}
              </div>
            </div>
            <div class="action-buttons">
              <button class="btn btn-action" id="attackBtn_${index}" ${!warrior.isAlive || warrior.stunTurns > 0 || warrior.attackCooldown > 0 ? 'disabled' : ''}>Attack</button>
              <button class="btn btn-action" id="specialBtn_${index}" ${!warrior.isAlive || warrior.mana < warrior.specialAbility.manaCost || warrior.cooldown > 0 || warrior.stunTurns > 0 ? 'disabled' : ''}>Special (${warrior.specialAbility.name})</button>
            </div>
          `;
                    warriorContainer.appendChild(card);

                    // Bind attack button
                    document.getElementById(`attackBtn_${index}`).addEventListener('click', () => {
                        if (this.selectedEnemyIndex !== null && warrior.isAlive && warrior.stunTurns === 0 && warrior.attackCooldown === 0) {
                            const target = this.enemies[this.selectedEnemyIndex];
                            if (target && target.isAlive) {
                                warrior.attackTarget(target);
                                this.endPlayerTurn();
                                this.updateUI();
                            }
                        } else {
                            this.showError('Select an enemy to attack!');
                        }
                    });

                    // Bind special button
                    document.getElementById(`specialBtn_${index}`).addEventListener('click', () => {
                        if (this.selectedEnemyIndex !== null && warrior.isAlive && warrior.mana >= warrior.specialAbility.manaCost && warrior.cooldown === 0 && warrior.stunTurns === 0) {
                            const target = this.enemies[this.selectedEnemyIndex];
                            if (target && target.isAlive) {
                                warrior.useSpecial(target, this);
                                this.endPlayerTurn();
                                this.updateUI();
                            }
                        } else {
                            this.showError('Cannot use special: check mana, cooldown!');
                        }
                    });
                });
            }

            const enemyContainer = document.getElementById('enemyGrid');
            if (enemyContainer) {
                enemyContainer.innerHTML = '';
                this.enemies.forEach((enemy, index) => {
                    const card = document.createElement('div');
                    card.className = `character-card ${this.selectedEnemyIndex === index ? 'selected-enemy' : ''}`;
                    card.innerHTML = `
            <img class="character-img" src="${enemy.image || 'placeholder.png'}" alt="${enemy.name}" onerror="this.src='placeholder.png'; this.alt='Image not found'" />
            <div class="status-bars">
              <h3>${enemy.name}</h3>
              <div class="progress">
                <div class="progress-bar progress-bar-health" style="width: ${(enemy.health / enemy.maxHealth * 100)}%;"></div>
              </div>
              <div>Health: ${Math.floor(enemy.health)} / ${enemy.maxHealth}</div>
            </div>
          `;
                    card.onclick = () => {
                        this.selectedEnemyIndex = index;
                        soundEffects.select.play().catch(() => { });
                        this.updateUI();
                    };
                    enemyContainer.appendChild(card);
                });
            }

            const synergyDisplay = document.getElementById('synergyDisplay');
            if (synergyDisplay) {
                synergyDisplay.innerHTML = this.activeSynergies.length
                    ? this.activeSynergies.map(s => `<span>${teamSynergies[s].description}</span>`).join('<br>')
                    : 'No active synergies.';
            }

            this.updateComboMeter();
        } catch (error) {
            console.error('[game.js] UI update error:', error);
            this.showError('Failed to update UI.');
        }
    },

    /**
     * Ends player turn and processes enemy actions with delays.
     */
    endPlayerTurn() {
        if (this.isGameOver) return;

        if (this.enemies.every(e => !e.isAlive)) {
            this.waveCompleted();
            return;
        }

        let delay = 0;
        const aliveWarriors = this.warriors.filter(w => w.isAlive);
        if (!aliveWarriors.length) {
            this.checkGameOver();
            return;
        }

        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                setTimeout(() => {
                    if (this.isGameOver) return;
                    const target = aliveWarriors[Math.floor(Math.random() * aliveWarriors.length)];
                    if (enemy.specialAbility.name && !enemy.cooldown && Math.random() < 0.3) {
                        enemy.useSpecial(target, this);
                    } else {
                        enemy.attackTarget(target);
                    }
                    enemy.update();
                    this.updateUI();
                }, delay);
                delay += 500;
            }
        });

        setTimeout(() => {
            if (this.isGameOver) return;
            if (this.enemies.every(e => !e.isAlive)) {
                this.waveCompleted();
            } else if (this.warriors.every(w => !w.isAlive)) {
                this.checkGameOver();
            } else {
                this.updateUI();
            }
        }, delay);
    },

    /**
     * Handles wave completion logic.
     */
    waveCompleted() {
        try {
            this.addScore(500 * this.wave);
            this.gameAchievements.waveMaster.count++;

            if (this.flawlessWave) {
                this.gameAchievements.perfectWave.count++;
                this.specialAchievements.flawlessMaster.count++;
            }

            const waveTime = (Date.now() - this.turnStartTime) / 1000;
            if (waveTime < 25) this.gameAchievements.speedTitan.count++;

            this.checkAchievements();
            this.checkSpecialAchievements();

            if (this.wave % 5 === 0 && this.enemies.some(e => e.name === 'Cosmic Tyrant')) {
                this.gameAchievements.bossSlayer.count++;
                this.checkAchievements();
            }

            if (this.gameMode === 'final' && this.enemies.some(e => e.name === 'Galactic Devourer')) {
                this.victory();
                return;
            }

            if (this.gameMode === 'mirror' && this.enemies.every(e => e.name.startsWith('Mirror'))) {
                this.gameAchievements.mirrorMaster.count++;
                this.specialAchievements.modeMaster.count++;
                this.checkAchievements();
                this.checkSpecialAchievements();
                this.victory();
                return;
            }

            if (this.wave % 3 === 0) {
                this.offerPowerUp();
            } else {
                this.wave++;
                this.startWave();
            }
        } catch (error) {
            console.error('[game.js] Wave completion error:', error);
            this.showError('Error completing wave.');
        }
    },

    /**
     * Offers power-up selection after every 3 waves.
     */
    offerPowerUp() {
        try {
            const options = [];
            while (options.length < 3) {
                const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
                if (!options.includes(powerUp)) options.push(powerUp);
            }

            const modalBody = document.getElementById('powerUpModalBody');
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('powerUpModal'));
            if (modalBody) {
                modalBody.innerHTML = `
          <h5>Choose a Power-Up</h5>
          ${options.map((option, index) => `
            <div class='power-up-option'>
              <h6>${option.name}</h6>
              <button class='btn btn-primary' id='powerUpBtn_${index}'>Select</button>
            </div>
          `).join('')}
        `;
            }

            if (modal) modal.show();

            options.forEach((option, index) => {
                const btn = document.getElementById(`powerUpBtn_${index}`);
                if (btn) {
                    btn.onclick = () => {
                        option.effect(this);
                        this.log(`Power-Up selected: ${option.name}`);
                        if (modal) modal.hide();
                        this.wave++;
                        this.startWave();
                    };
                }
            });
        } catch (error) {
            console.error('[game.js] Power-up offer error:', error);
            this.showError('Failed to offer power-up.');
            this.wave++;
            this.startWave();
        }
    },

    /**
     * Handles game over state.
     */
    checkGameOver() {
        if (this.warriors.every(w => !w.isAlive)) {
            this.isGameOver = true;
            this.log('Game Over! Your heroes have fallen.');
            soundEffects.defeat.play().catch(() => { });
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('gameOverModal'));
            if (modal) modal.show();
        }
    },

    /**
     * Handles victory state.
     */
    victory() {
        this.isGameOver = true;
        this.log('Victory! The galaxy is saved!');
        soundEffects.victory.play().catch(() => { });
        this.specialAchievements.modeMaster.count++;
        this.checkSpecialAchievements();
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('victoryModal'));
        if (modal) modal.show();
    },

    /**
     * Adds score and updates UI.
     * @param {number} points - Points to add.
     */
    addScore(points) {
        this.score += points * this.comboMultiplier;
        this.gameAchievements.cosmicChampion.count = this.score;
        this.specialAchievements.scoreMaster.count = this.score;
        this.checkAchievements();
        this.checkSpecialAchievements();
        this.updateUI();
    },

    /**
     * Displays error message to user.
     * @param {string} message - Error message.
     */
    showError(message) {
        this.log(`Error: ${message}`);
        const errorDisplay = document.getElementById('errorMessage');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
            setTimeout(() => { errorDisplay.style.display = 'none'; }, 3000);
        }
    },

    /**
     * Logs message to battle log.
     * @param {string} message - Log message.
     */
    log(message) {
        const log = document.getElementById('gameLog');
        if (log) {
            const entry = document.createElement('p');
            entry.textContent = message;
            entry.classList.add('animate__animated', 'animate__fadeIn');
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }
    },

    /**
     * Restarts the game with fresh state.
     */
    restartGame() {
        this.wave = 1;
        this.score = 0;
        this.isGameOver = false;
        this.enemies = [];
        this.selectedEnemyIndex = null;
        this.comboMultiplier = 1;
        this.xpMultiplier = 1;
        this.flawlessWave = false;
        this.turnStartTime = null;
        this.warriors.forEach(w => {
            w.health = w.maxHealth;
            w.mana = w.maxMana;
            w.isAlive = true;
            w.cooldown = 0;
            w.stunTurns = 0;
            w.attackCooldown = 0;
            w.buff = { active: false, turns: 0, type: null };
            w.debuff = { active: false, turns: 0, type: null };
            w.xp = 0;
            w.level = 1;
            w.xpToNextLevel = 100;
        });
        this.applyTeamSynergies();
        this.startWave();
        this.updateUI();
        this.log('Game restarted. Lead your heroes to victory!');
    },

    /**
     * Toggles between light and dark themes.
     */
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark');
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.textContent = `Toggle Theme: ${this.settings.theme.charAt(0).toUpperCase() + this.settings.theme.slice(1)}`;
        this.saveGame();
        this.log(`Theme switched to ${this.settings.theme}`);
    },

    /**
     * Displays achievements in a modal.
     */
    showAchievements() {
        const modalBody = document.getElementById('achievementsModalBody');
        if (modalBody) {
            modalBody.innerHTML = `
        <h5>Achievements</h5>
        <ul>
          ${Object.values(this.gameAchievements).map(ach => `
            <li class="${ach.unlocked ? 'unlocked' : ''}">
              ${ach.name}: ${ach.description} (${ach.count}/${ach.goal}) ${ach.unlocked ? '[Unlocked]' : ''}
            </li>
          `).join('')}
        </ul>
      `;
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('achievementsModal'));
            if (modal) modal.show();
        }
    },

    /**
     * Displays special achievements in a modal.
     */
    showSpecialAchievements() {
        const modalBody = document.getElementById('specialAchievementsModalBody');
        if (modalBody) {
            modalBody.innerHTML = `
        <h5>Special Achievements</h5>
        <ul>
          ${Object.values(this.specialAchievements).map(ach => `
            <li class="${ach.unlocked ? 'unlocked' : ''}">
              ${ach.name}: ${ach.description} (${ach.count}/${ach.goal}) ${ach.unlocked ? '[Unlocked]' : ''}
            </li>
          `).join('')}
        </ul>
      `;
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('specialAchievementsModal'));
            if (modal) modal.show();
        }
    },

    /**
     * Checks and unlocks achievements.
     */
    checkAchievements() {
        Object.values(this.gameAchievements).forEach(ach => {
            if (!ach.unlocked && ach.count >= ach.goal) {
                ach.unlocked = true;
                this.log(`Achievement Unlocked: ${ach.name} - ${ach.description}`);
                soundEffects.achievement.play().catch(() => { });
                ach.reward();
                const toast = document.createElement('div');
                toast.className = 'achievement-toast';
                toast.textContent = `${ach.name} Unlocked!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }
        });
        const achievementCount = document.getElementById('achievementCount');
        if (achievementCount) achievementCount.textContent = Object.values(this.gameAchievements).filter(ach => ach.unlocked).length;
    },

    /**
     * Checks and unlocks special achievements.
     */
    checkSpecialAchievements() {
        Object.values(this.specialAchievements).forEach(ach => {
            if (!ach.unlocked && ach.count >= ach.goal) {
                ach.unlocked = true;
                this.log(`Special Achievement Unlocked: ${ach.name} - ${ach.description}`);
                soundEffects.achievement.play().catch(() => { });
                ach.reward();
                const toast = document.createElement('div');
                toast.className = 'achievement-toast';
                toast.textContent = `${ach.name} Unlocked!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 4000);
            }
        });
    },

    /**
     * Updates combo meter based on warrior points.
     */
    updateComboMeter() {
        const totalPoints = this.warriors.reduce((sum, w) => sum + w.comboPoints, 0);
        this.comboMultiplier = 1 + (totalPoints / 5);
        const meter = document.getElementById('comboMeter');
        if (meter) {
            meter.textContent = `Combo: x${this.comboMultiplier.toFixed(1)}`;
            meter.style.width = `${Math.min(100, totalPoints / 5 * 100)}%`;
            if (totalPoints >= 5) {
                this.gameAchievements.comboMaster.count++;
                this.specialAchievements.comboLegend.count++;
                this.checkAchievements();
                this.checkSpecialAchievements();
            }
        }
    }
};

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => window.Game.initialize());