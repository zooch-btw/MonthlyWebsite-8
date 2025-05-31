/* Galaxy BattleForge - Enhanced Marvel turn-based strategy game */
/* Dependencies: Bootstrap 5.3.2, Animate.css, game.html */
/* Integrates with menu.js for hero selection via localStorage */
/* Uses sounds: achievement, attack, background, defeat, levelUp, moreinfo, select, special, victory */

// Asset mappings for warrior and enemy images with fallback
const warriorImageMap = new Map(window.players.map(p => [p.realName, p.photo]));
const enemyImageMap = new Map([
    ['Overlord Zarkon', 'imgs/zarkon.png'], ['Void Drone', 'imgs/drone.png'], ['Abyssal Stalker', 'imgs/abyss.png'],
    ['Wave Invader', 'imgs/wave.png'], ['Cosmic Phantom', 'imgs/cosmic.png'], ['Nebula Phantom', 'imgs/phantom.png'],
    ['Thanos', 'imgs/thanos.png']
]);
const placeholderImage = 'imgs/fallback.png';

// Sound effects manager with lazy loading and error handling
const soundEffects = {
    achievement: null, attack: null, background: null, defeat: null, levelUp: null,
    moreinfo: null, select: null, special: null, victory: null,
    async load() {
        try {
            this.achievement = await loadSound('achievement', 'sounds/achievement.mp3');
            this.attack = await loadSound('attack', 'sounds/attack.mp3');
            this.background = await loadSound('background', 'sounds/background.mp3');
            this.defeat = await loadSound('defeat', 'sounds/defeat.mp3');
            this.levelUp = await loadSound('levelUp', 'sounds/levelup.mp3');
            this.moreinfo = await loadSound('moreinfo', 'sounds/moreinfo.mp3');
            this.select = await loadSound('select', 'sounds/select.mp3');
            this.special = await loadSound('special', 'sounds/special.mp3');
            this.victory = await loadSound('victory', 'sounds/victory.mp3');
            this.background.loop = true;
            this.background.volume = parseFloat(localStorage.getItem('soundVolume') || '50') / 100 * 0.5;
            this.background.play().catch(() => console.warn('[soundEffects] Background playback failed'));
        } catch (e) {
            console.warn('[soundEffects.load] Failed to load sounds:', e);
        }
    }
};

async function loadSound(key, src) {
    if (!soundEffects[key]) {
        const audio = new Audio(src);
        audio.onerror = () => console.warn(`[loadSound] Failed to load sound: ${src}`);
        audio.volume = parseFloat(localStorage.getItem('soundVolume') || '50') / 100;
        audio.preload = 'auto';
        return audio;
    }
    return soundEffects[key];
}

// Base stats for warriors based on character traits
const warriorBaseStats = Object.fromEntries(window.players.map(p => {
    const stats = {
        'Tony Stark': { health: 100, attack: 20, mana: 50 }, 'Steve Rogers': { health: 120, attack: 18, mana: 45 },
        'Thor Odinson': { health: 130, attack: 25, mana: 40 }, 'Natasha Romanoff': { health: 80, attack: 15, mana: 60 },
        'Clint Barton': { health: 90, attack: 17, mana: 55 }, 'Peter Parker': { health: 95, attack: 16, mana: 50 },
        'Stephen Strange': { health: 85, attack: 14, mana: 70 }, 'T’Challa': { health: 110, attack: 20, mana: 45 },
        'Wanda Maximoff': { health: 90, attack: 18, mana: 65 }, 'Scott Lang': { health: 85, attack: 15, mana: 50 },
        'James Howlett/Logan': { health: 140, attack: 22, mana: 30 }, 'Ororo Munroe': { health: 95, attack: 16, mana: 60 },
        'Scott Summers': { health: 100, attack: 18, mana: 50 }, 'Jean Grey Summers': { health: 90, attack: 17, mana: 65 },
        'Henry McCoy': { health: 120, attack: 19, mana: 40 }, 'Remy LeBeau': { health: 95, attack: 16, mana: 55 },
        'Anna Marie': { health: 110, attack: 18, mana: 45 }, 'Wade Wilson': { health: 100, attack: 20, mana: 50 },
        'Eddie Brock': { health: 130, attack: 22, mana: 40 }, 'Max Eisenhardt': { health: 100, attack: 20, mana: 60 },
        'Victor Von Doom': { health: 110, attack: 21, mana: 55 }, 'Thanos': { health: 150, attack: 25, mana: 50 },
        'Loki Laufeyson': { health: 90, attack: 17, mana: 65 }, 'Ultron': { health: 120, attack: 20, mana: 50 },
        'Johann Schmidt': { health: 100, attack: 18, mana: 45 }, 'Norman Osborn': { health: 95, attack: 19, mana: 50 },
        'Wilson Fisk': { health: 130, attack: 20, mana: 40 }, 'Felicia Hardy': { health: 85, attack: 16, mana: 55 },
        'Quentin Beck': { health: 90, attack: 15, mana: 60 }, 'Aleksei Sytsevich': { health: 140, attack: 22, mana: 30 },
        'Flint Marko': { health: 120, attack: 18, mana: 40 }, 'Max Dillon': { health: 95, attack: 17, mana: 55 },
        'Otto Octavius': { health: 100, attack: 19, mana: 50 }, 'Sergei Kravinoff': { health: 110, attack: 20, mana: 45 },
        'Herman Schultz': { health: 95, attack: 16, mana: 50 }, 'Mac Gargan': { health: 100, attack: 18, mana: 45 },
        'Adrian Toomes': { health: 90, attack: 17, mana: 50 }, 'Bruce Banner': { health: 150, attack: 30, mana: 30 },
        'Lester': { health: 90, attack: 18, mana: 50 }, 'Bucky Barnes': { health: 100, attack: 19, mana: 50 }
    };
    return [p.realName, stats[p.realName] || { health: 100, attack: 15, mana: 50 }];
}));

// Special abilities based on player specials
const specialAbilities = Object.fromEntries(window.players.map(p => [p.realName, {
    name: p.special.split(':')[0].trim(),
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior, game) => {
        let damage = 40;
        let tempCritChance = warrior.critChance;
        switch (p.realName) {
            case 'Tony Stark': target.takeDamage(damage); break;
            case 'Steve Rogers': target.takeDamage(damage); target.addStatusEffect('stun', 1); break;
            case 'Thor Odinson': damage = 50; target.takeDamage(damage); break;
            case 'Natasha Romanoff': tempCritChance += 0.2; warrior.critChance = tempCritChance; target.takeDamage(damage); warrior.critChance = tempCritChance - 0.2; break;
            case 'Clint Barton': game.enemies.forEach(e => e.takeDamage(damage * 0.5)); break;
            case 'Peter Parker': target.takeDamage(damage); target.addStatusEffect('freeze', 1); break;
            case 'Stephen Strange': warrior.health = warrior.maxHealth; break;
            case 'T’Challa': target.takeDamage(damage); warrior.health = Math.min(warrior.maxHealth, warrior.health + 20); break;
            case 'Wanda Maximoff': target.attack = Math.round(target.attack * 0.8); target.takeDamage(damage); break;
            case 'Scott Lang': damage = 60; target.takeDamage(damage); break;
            case 'James Howlett/Logan': target.takeDamage(damage); target.takeDamage(damage * 0.5); break;
            case 'Ororo Munroe': game.enemies.forEach(e => e.addStatusEffect('stun', 1)); break;
            case 'Scott Summers': game.enemies.forEach(e => e.takeDamage(damage * 0.6)); break;
            case 'Jean Grey Summers': damage = target.health * 0.3; target.takeDamage(damage); break;
            case 'Henry McCoy': target.takeDamage(damage); warrior.dodgeChance = Math.min(0.3, warrior.dodgeChance + 0.1); break;
            case 'Remy LeBeau': damage = 50; target.takeDamage(damage); break;
            case 'Anna Marie': target.takeDamage(damage); warrior.health = Math.min(warrior.maxHealth, warrior.health + 20); break;
            case 'Wade Wilson': target.takeDamage(damage); if (Math.random() < 0.3) target.addStatusEffect('burn', 2); break;
            case 'Eddie Brock': game.enemies.forEach(e => e.takeDamage(damage * 0.7)); break;
            case 'Max Eisenhardt': damage = 50; target.takeDamage(damage); break;
            case 'Victor Von Doom': target.addStatusEffect('burn', 3); break;
            case 'Thanos': if (target.health < target.maxHealth * 0.2) target.health = 0; else target.takeDamage(damage); break;
            case 'Loki Laufeyson': warrior.dodgeChance += 0.5; setTimeout(() => warrior.dodgeChance -= 0.5, 1000); break;
            case 'Ultron': target.attack = Math.round(target.attack * 0.9); target.takeDamage(damage); break;
            case 'Johann Schmidt': game.warriors.forEach(w => w.attack = Math.round(w.attack * 1.1)); break;
            case 'Norman Osborn': game.enemies.forEach(e => e.takeDamage(damage * 0.4)); break;
            case 'Wilson Fisk': damage = 50; target.takeDamage(damage); break;
            case 'Felicia Hardy': tempCritChance += 0.3; warrior.critChance = tempCritChance; target.takeDamage(damage); warrior.critChance = tempCritChance - 0.3; break;
            case 'Quentin Beck': game.enemies.forEach(e => e.attack = Math.round(e.attack * 0.8)); break;
            case 'Aleksei Sytsevich': game.enemies.slice(0, 2).forEach(e => e.takeDamage(damage)); break;
            case 'Flint Marko': game.enemies.forEach(e => e.attack = Math.round(e.attack * 0.7)); break;
            case 'Max Dillon': game.enemies.slice(0, 2).forEach(e => e.takeDamage(damage * 0.6)); break;
            case 'Otto Octavius': game.enemies.slice(0, 3).forEach(e => e.takeDamage(damage * 0.5)); break;
            case 'Sergei Kravinoff': target.takeDamage(damage); target.addStatusEffect('freeze', 2); break;
            case 'Herman Schultz': game.enemies.forEach(e => e.addStatusEffect('stun', 1)); break;
            case 'Mac Gargan': target.takeDamage(damage); target.addStatusEffect('poison', 3); break;
            case 'Adrian Toomes': damage = 50; target.takeDamage(damage); break;
            case 'Bruce Banner': game.enemies.forEach(e => e.takeDamage(damage)); warrior.attack = Math.round(warrior.attack * 1.2); break;
            case 'Lester': damage = 60; target.takeDamage(damage); break;
            case 'Bucky Barnes': target.takeDamage(damage); target.addStatusEffect('stun', 1); break;
        }
        game.log(`${warrior.name} used ${p.special.split(':')[0].trim()}!`);
        return damage;
    }
}]));

// Team-up abilities
const teamUpAbilities = {
    'Avengers Assemble': {
        heroes: ['Tony Stark', 'Steve Rogers', 'Thor Odinson', 'Bruce Banner'],
        name: 'Avengers Assemble',
        manaCost: 50,
        cooldown: 4,
        effect: (target, game) => {
            const damage = 70;
            game.enemies.forEach(e => e.takeDamage(damage));
            game.log('Avengers Assemble! All enemies take 70 damage!');
            return damage;
        }
    },
    'X-Men Unity': {
        heroes: ['James Howlett/Logan', 'Ororo Munroe', 'Scott Summers', 'Jean Grey Summers'],
        name: 'X-Men Unity',
        manaCost: 60,
        cooldown: 5,
        effect: (target, game) => {
            const damage = 80;
            target.takeDamage(damage);
            game.warriors.forEach(w => w.health = Math.min(w.maxHealth, w.health + 20));
            game.log('X-Men Unity! Target takes 80 damage and team heals 20 health!');
            return damage;
        }
    },
    'Spider-Verse Strike': {
        heroes: ['Peter Parker', 'Eddie Brock'],
        name: 'Spider-Verse Strike',
        manaCost: 40,
        cooldown: 3,
        effect: (target, game) => {
            const damage = 50;
            target.takeDamage(damage);
            if (Math.random() < 0.5) target.addStatusEffect('freeze', 2);
            game.log('Spider-Verse Strike! Target takes 50 damage and may be frozen!');
            return damage;
        }
    },
    'Masters of Magic': {
        heroes: ['Stephen Strange', 'Wanda Maximoff'],
        name: 'Masters of Magic',
        manaCost: 55,
        cooldown: 4,
        effect: (target, game) => {
            const damage = 60;
            target.takeDamage(damage);
            game.warriors.forEach(w => w.mana = Math.min(w.maxMana, w.mana + 20));
            game.log('Masters of Magic! Target takes 60 damage and team restores 20 mana!');
            return damage;
        }
    },
    'Asgardian Might': {
        heroes: ['Thor Odinson', 'Loki Laufeyson'],
        name: 'Asgardian Might',
        manaCost: 45,
        cooldown: 3,
        effect: (target, game) => {
            const damage = 55;
            target.takeDamage(damage);
            if (Math.random() < 0.4) target.addStatusEffect('stun', 2);
            game.log('Asgardian Might! Target takes 55 damage and may be stunned!');
            return damage;
        }
    },
    'Tech Titans': {
        heroes: ['Tony Stark', 'Victor Von Doom'],
        name: 'Tech Titans',
        manaCost: 50,
        cooldown: 4,
        effect: (target, game) => {
            const damage = 65;
            target.takeDamage(damage);
            game.warriors.forEach(w => w.attack = Math.round(w.baseAttack * 1.15));
            game.log('Tech Titans! Target takes 65 damage and team attack boosted by 15%!');
            return damage;
        }
    },
    'Street Enforcers': {
        heroes: ['Wade Wilson', 'Wilson Fisk'],
        name: 'Street Enforcers',
        manaCost: 45,
        cooldown: 3,
        effect: (target, game) => {
            const damage = 50;
            target.takeDamage(damage);
            game.warriors.forEach(w => w.health = Math.min(w.maxHealth, w.health + 15));
            game.log('Street Enforcers! Target takes 50 damage and team heals 15 health!');
            return damage;
        }
    },
    'Sinister Syndicate': {
        heroes: ['Norman Osborn', 'Otto Octavius', 'Max Dillon'],
        name: 'Sinister Syndicate',
        manaCost: 60,
        cooldown: 5,
        effect: (target, game) => {
            const damage = 75;
            game.enemies.forEach(e => e.takeDamage(damage));
            if (Math.random() < 0.3) game.enemies.forEach(e => e.addStatusEffect('burn', 2));
            game.log('Sinister Syndicate! All enemies take 75 damage and may be burned!');
            return damage;
        }
    },
    'Pym Particle Power': {
        heroes: ['Scott Lang', 'Henry McCoy'],
        name: 'Pym Particle Power',
        manaCost: 40,
        cooldown: 3,
        effect: (target, game) => {
            const damage = 50;
            target.takeDamage(damage);
            game.warriors.forEach(w => w.dodgeChance = Math.min(0.3, w.dodgeChance + 0.1));
            game.log('Pym Particle Power! Target takes 50 damage and team dodge chance increased!');
            return damage;
        }
    },
    'S.H.I.E.L.D. Strategy': {
        heroes: ['Natasha Romanoff', 'Clint Barton', 'Bucky Barnes'],
        name: 'S.H.I.E.L.D. Strategy',
        manaCost: 50,
        cooldown: 4,
        effect: (target, game) => {
            const damage = 60;
            target.takeDamage(damage);
            game.warriors.forEach(w => w.mana = Math.min(w.maxMana, w.mana + 15));
            game.log('S.H.I.E.L.D. Strategy! Target takes 60 damage and team restores 15 mana!');
            return damage;
        }
    },
    'Cosmic Surge': {
        heroes: ['Thanos', 'Loki Laufeyson'],
        name: 'Cosmic Surge',
        manaCost: 55,
        cooldown: 4,
        effect: (target, game) => {
            const damage = 65;
            game.enemies.forEach(e => e.takeDamage(damage));
            game.log('Cosmic Surge! All enemies take 65 damage!');
            return damage;
        }
    }
};

// Synergies
const synergies = {
    'Avengers': {
        heroes: ['Tony Stark', 'Steve Rogers', 'Thor Odinson', 'Natasha Romanoff', 'Clint Barton', 'Bruce Banner'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.attack = Math.round(w.baseAttack * 1.1);
                    w.health = Math.min(w.maxHealth, w.health + 10);
                }
            });
            game.log('Avengers Synergy: +10% attack and +10 health for Avengers!');
        }
    },
    'X-Men': {
        heroes: ['James Howlett/Logan', 'Ororo Munroe', 'Scott Summers', 'Jean Grey Summers', 'Henry McCoy', 'Remy LeBeau', 'Anna Marie'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.mana = Math.min(w.maxMana, w.mana + 15);
                    w.critChance = Math.min(0.3, w.critChance + 0.05);
                }
            });
            game.log('X-Men Synergy: +15 mana and +5% crit chance for X-Men!');
        }
    },
    'Spider-Verse': {
        heroes: ['Peter Parker', 'Eddie Brock', 'Felicia Hardy'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.dodgeChance = Math.min(0.25, w.dodgeChance + 0.1);
                }
            });
            game.log('Spider-Verse Synergy: +10% dodge chance for Spider-Verse heroes!');
        }
    },
    'Mystic Masters': {
        heroes: ['Stephen Strange', 'Wanda Maximoff'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.maxMana += 20;
                    w.mana = Math.min(w.maxMana, w.mana + 20);
                }
            });
            game.log('Mystic Masters Synergy: +20 max mana for Mystic Masters!');
        }
    },
    'Asgardians': {
        heroes: ['Thor Odinson', 'Loki Laufeyson'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.health = Math.min(w.maxHealth, w.health + 20);
                    w.shield = Math.max(0.85, w.shield * 0.85);
                }
            });
            game.log('Asgardians Synergy: +20 health and 15% damage reduction!');
        }
    },
    'Tech Geniuses': {
        heroes: ['Tony Stark', 'Victor Von Doom', 'Ultron'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.attack = Math.round(w.baseAttack * 1.15);
                }
            });
            game.log('Tech Geniuses Synergy: +15% attack for Tech Geniuses!');
        }
    },
    'Street Fighters': {
        heroes: ['Wade Wilson', 'Wilson Fisk', 'Felicia Hardy'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.health = Math.min(w.maxHealth, w.health + 15);
                    w.critChance = Math.min(0.3, w.critChance + 0.05);
                }
            });
            game.log('Street Fighters Synergy: +15 health and +5% crit chance!');
        }
    },
    'Sinister Six': {
        heroes: ['Norman Osborn', 'Otto Octavius', 'Max Dillon', 'Aleksei Sytsevich', 'Flint Marko', 'Adrian Toomes'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.attack = Math.round(w.baseAttack * 1.1);
                    if (Math.random() < 0.2) game.enemies.forEach(e => e.addStatusEffect('burn', 1));
                }
            });
            game.log('Sinister Six Synergy: +10% attack and 20% chance to burn enemies!');
        }
    },
    'S.H.I.E.L.D.': {
        heroes: ['Natasha Romanoff', 'Clint Barton', 'Bucky Barnes'],
        effect: (game) => {
            game.warriors.forEach(w => {
                if (this.heroes.includes(w.name)) {
                    w.mana = Math.min(w.maxMana, w.mana + 10);
                    w.critChance = Math.min(0.3, w.critChance + 0.05);
                }
            });
            game.log('S.H.I.E.L.D. Synergy: +10 mana and +5% crit chance!');
        }
    }
};

// Warrior class
class Warrior {
    constructor(name, health, attack, mana, specialAbility, image) {
        this.name = name || 'Unknown';
        this.maxHealth = parseInt(health) || 100;
        this.health = this.maxHealth;
        this.baseAttack = parseInt(attack) || 10;
        this.attack = this.baseAttack;
        this.maxMana = parseInt(mana) || 50;
        this.mana = this.maxMana;
        this.specialAbility = specialAbility || { name: 'None', manaCost: 0, cooldown: 0, effect: () => 0 };
        this.image = image || placeholderImage;
        this.isAlive = true;
        this.cooldown = 0;
        this.stunTimer = 0;
        this.buffTimer = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.critChance = 0.1;
        this.dodgeChance = 0.05;
        this.shield = 1;
        this.statusEffects = [];
        this.comboCount = 0;
        this.passive = this.getPassive();
        this.teamUpCooldown = 0;
    }

    getPassive() {
        const player = window.players.find(p => p.realName === this.name);
        if (!player) return { name: 'None', description: 'No passive', effect: () => {} };
        const passives = {
            'Tony Stark': { name: 'Genius Inventor', description: '10% chance to regen 10 mana', effect: () => { if (Math.random() < 0.1) { this.mana = Math.min(this.maxMana, this.mana + 10); window.Game.log(`${this.name}'s Genius Inventor regenerates 10 mana!`); } } },
            'Steve Rogers': { name: 'Tactical Leadership', description: 'Boosts team attack by 5%', effect: () => { window.Game.warriors.forEach(w => w.attack = Math.round(w.baseAttack * 1.05)); window.Game.log(`${this.name}'s Leadership boosts team attack!`); } },
            'Thor Odinson': { name: 'Storm Summoning', description: '10% chance to stun enemy', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('stun', 1)); } },
            'Natasha Romanoff': { name: 'Master Espionage', description: 'Increases dodge chance by 15%', effect: () => { this.dodgeChance = Math.min(0.2, this.dodgeChance + 0.15); } },
            'Clint Barton': { name: 'Precision Aim', description: 'Increases crit chance by 5%', effect: () => { this.critChance = Math.min(0.3, this.critChance + 0.05); } },
            'Peter Parker': { name: 'Spider-Sense', description: 'Increases dodge chance by 15%', effect: () => { this.dodgeChance = Math.min(0.2, this.dodgeChance + 0.15); } },
            'Stephen Strange': { name: 'Dimensional Manipulation', description: '10% chance to reduce damage by 20%', effect: () => { if (Math.random() < 0.1) this.shield = Math.max(0.8, this.shield * 0.8); } },
            'T’Challa': { name: 'Kinetic Energy Absorption', description: 'Reduces damage by 10%', effect: () => { this.shield = Math.max(0.9, this.shield * 0.9); } },
            'Wanda Maximoff': { name: 'Reality Warping', description: '10% chance to restore 10 mana', effect: () => { if (Math.random() < 0.1) this.mana = Math.min(this.maxMana, this.mana + 10); } },
            'Scott Lang': { name: 'Size Manipulation', description: 'Increases dodge chance by 10%', effect: () => { this.dodgeChance = Math.min(0.15, this.dodgeChance + 0.1); } },
            'James Howlett/Logan': { name: 'Berserker Rage', description: 'Regenerates 5 health per turn', effect: () => { this.health = Math.min(this.maxHealth, this.health + 5); } },
            'Ororo Munroe': { name: 'Atmospheric Control', description: '10% chance to stun enemies', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('stun', 1)); } },
            'Scott Summers': { name: 'Energy Beam Precision', description: 'Increases crit chance by 5%', effect: () => { this.critChance = Math.min(0.3, this.critChance + 0.05); } },
            'Jean Grey Summers': { name: 'Psychic Overload', description: '10% chance to restore team mana', effect: () => { if (Math.random() < 0.1) window.Game.warriors.forEach(w => w.mana = Math.min(w.maxMana, w.mana + 10)); } },
            'Henry McCoy': { name: 'Scientific Expertise', description: 'Increases attack by 5%', effect: () => { this.attack = Math.round(this.baseAttack * 1.05); } },
            'Remy LeBeau': { name: 'Kinetic Charge', description: '10% chance to add burn effect', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('burn', 2)); } },
            'Anna Marie': { name: 'Memory Assimilation', description: '10% chance to heal 10 health', effect: () => { if (Math.random() < 0.1) this.health = Math.min(this.maxHealth, this.health + 10); } },
            'Wade Wilson': { name: 'Fourth Wall Break', description: 'Regenerates 5 health per turn', effect: () => { this.health = Math.min(this.maxHealth, this.health + 5); } },
            'Eddie Brock': { name: 'Symbiote Morph', description: 'Increases attack by 5%', effect: () => { this.attack = Math.round(this.baseAttack * 1.05); } },
            'Max Eisenhardt': { name: 'Electromagnetic Pulse', description: '10% chance to reduce damage by 15%', effect: () => { if (Math.random() < 0.1) this.shield = Math.max(0.85, this.shield * 0.85); } },
            'Victor Von Doom': { name: 'Mystic-Tech Fusion', description: 'Reduces damage by 25%', effect: () => { this.shield = Math.max(0.75, this.shield * 0.75); } },
            'Thanos': { name: 'Cosmic Domination', description: '10% chance to deal 10% extra damage', effect: () => { if (Math.random() < 0.1) this.attack = Math.round(this.baseAttack * 1.1); } },
            'Loki Laufeyson': { name: 'Shape-shifting', description: 'Increases dodge chance by 15%', effect: () => { this.dodgeChance = Math.min(0.2, this.dodgeChance + 0.15); } },
            'Ultron': { name: 'Network Hijacking', description: '10% chance to stun enemies', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('stun', 1)); } },
            'Johann Schmidt': { name: 'Strategic Manipulation', description: 'Increases team attack by 10%', effect: () => { window.Game.warriors.forEach(w => w.attack = Math.round(w.baseAttack * 1.1)); } },
            'Norman Osborn': { name: 'Insanity Inducing Gas', description: '10% chance to burn enemies', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('burn', 2)); } },
            'Wilson Fisk': { name: 'Criminal Overlord', description: 'Increases attack by 10%', effect: () => { this.attack = Math.round(this.baseAttack * 1.1); } },
            'Felicia Hardy': { name: 'Probability Shift', description: 'Increases crit chance by 10%', effect: () => { this.critChance = Math.min(0.3, this.critChance + 0.1); } },
            'Quentin Beck': { name: 'Holographic Deception', description: 'Increases dodge chance by 5%', effect: () => { this.dodgeChance = Math.min(0.15, this.dodgeChance + 0.05); } },
            'Aleksei Sytsevich': { name: 'Unstoppable Charge', description: 'Reduces damage by 10%', effect: () => { this.shield = Math.max(0.9, this.shield * 0.9); } },
            'Flint Marko': { name: 'Sand Reformation', description: 'Increases dodge chance by 5%', effect: () => { this.dodgeChance = Math.min(0.15, this.dodgeChance + 0.05); } },
            'Max Dillon': { name: 'Power Surge', description: '10% chance to stun enemies', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('stun', 1)); } },
            'Otto Octavius': { name: 'Multitasking Mastery', description: 'Increases crit chance by 5%', effect: () => { this.critChance = Math.min(0.3, this.critChance + 0.05); } },
            'Sergei Kravinoff': { name: 'Predator Instinct', description: 'Increases attack by 5%', effect: () => { this.attack = Math.round(this.baseAttack * 1.05); } },
            'Herman Schultz': { name: 'Shockwave Burst', description: '10% chance to burn enemies', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('burn', 2)); } },
            'Mac Gargan': { name: 'Venomous Sting', description: '10% chance to poison enemies', effect: () => { if (Math.random() < 0.1) window.Game.enemies.forEach(e => e.addStatusEffect('poison', 2)); } },
            'Adrian Toomes': { name: 'Aerial Assault', description: 'Increases dodge chance by 5%', effect: () => { this.dodgeChance = Math.min(0.15, this.dodgeChance + 0.05); } },
            'Bruce Banner': { name: 'Rage Empowerment', description: 'Regenerates 5 health per turn', effect: () => { this.health = Math.min(this.maxHealth, this.health + 5); } },
            'Lester': { name: 'Perfect Aim', description: 'Increases crit chance by 5%', effect: () => { this.critChance = Math.min(0.3, this.critChance + 0.05); } },
            'Bucky Barnes': { name: 'Stealth Operations', description: 'Increases dodge chance by 10%', effect: () => { this.dodgeChance = Math.min(0.15, this.dodgeChance + 0.1); } }
        };
        return passives[player.realName] || { name: 'None', description: 'No passive ability', effect: () => {} };
    }

    takeDamage(damage) {
        if (Math.random() < this.dodgeChance) {
            window.Game.log(`${this.name} dodged the attack!`);
            window.Game.dodges++;
            window.Game.achievements.dodgeMaster.count++;
            window.Game.checkAchievements();
            return 0;
        }
        const actualDamage = Math.round(damage * this.shield);
        this.health = Math.max(0, this.health - actualDamage);
        this.isAlive = this.health > 0;
        window.Game.log(`${this.name} took ${actualDamage} damage! Health: ${this.health}`);
        if (!this.isAlive) window.Game.log(`${this.name} has been defeated!`);
        return actualDamage;
    }

    addStatusEffect(type, turns) {
        this.statusEffects.push({ type, turns });
        window.Game.log(`${this.name} is ${type} for ${turns} turn(s)!`);
        window.Game.statusEffectsApplied++;
        window.Game.achievements.statusMaster.count++;
        window.Game.checkAchievements();
    }

    regenerateMana() {
        this.mana = Math.min(this.maxMana, this.mana + 10);
    }

    gainXP(xp) {
        this.xp += xp;
        window.Game.log(`${this.name} gained ${xp} XP!`);
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.2);
        this.maxHealth = Math.round(this.maxHealth * 1.1);
        this.health = this.maxHealth;
        this.baseAttack = Math.round(this.baseAttack * 1.05);
        this.attack = this.baseAttack;
        this.maxMana = Math.round(this.maxMana * 1.1);
        this.mana = this.maxMana;
        window.Game.log(`${this.name} leveled up to ${this.level}! Stats improved!`);
        window.Game.achievements.levelFive.count = Math.max(window.Game.achievements.levelFive.count, this.level >= 5 ? 1 : 0);
        window.Game.achievements.levelTen.count = Math.max(window.Game.achievements.levelTen.count, this.level >= 10 ? 1 : 0);
        window.Game.checkAchievements();
        soundEffects.levelUp?.play()?.catch(() => {});
        const card = document.querySelector(`[data-warrior-id="${window.players.find(p => p.realName === this.name).id}"]`);
        if (card) {
            card.classList.add('animate__pulse');
            setTimeout(() => card.classList.remove('animate__pulse'), 1000);
        }
    }

    updateStatusEffects() {
        this.statusEffects = this.statusEffects.filter(e => {
            e.turns--;
            if (e.type === 'burn') {
                this.takeDamage(5);
            } else if (e.type === 'poison') {
                this.takeDamage(3);
            } else if (e.type === 'stun' || e.type === 'freeze') {
                this.stunTimer = e.turns;
            }
            return e.turns > 0;
        });
        this.cooldown = Math.max(0, this.cooldown - 1);
        this.teamUpCooldown = Math.max(0, this.teamUpCooldown - 1);
        this.buffTimer = Math.max(0, this.buffTimer - 1);
        if (this.buffTimer === 0) {
            this.attack = this.baseAttack;
        }
        this.passive.effect?.();
    }
}

// Enemy class
class Enemy {
    constructor(name, health, attack, image, difficultyMultiplier = 1.0) {
        this.name = name || 'Unknown';
        this.maxHealth = Math.round(health * difficultyMultiplier) || 100;
        this.health = this.maxHealth;
        this.attack = Math.round(attack * difficultyMultiplier) || 10;
        this.image = image || placeholderImage;
        this.isAlive = true;
        this.stunTimer = 0;
        this.statusEffects = [];
    }

    takeDamage(damage) {
        const actualDamage = Math.round(damage);
        this.health = Math.max(0, this.health - actualDamage);
        this.isAlive = this.health > 0;
        window.Game.log(`${this.name} took ${actualDamage} damage! Health: ${this.health}`);
        if (!this.isAlive) {
            window.Game.log(`${this.name} has been defeated!`);
            window.Game.enemiesDefeated++;
            window.Game.achievements.firstBlood.count = Math.min(1, window.Game.achievements.firstBlood.count + 1);
            window.Game.checkAchievements();
        }
        return actualDamage;
    }

    addStatusEffect(type, turns) {
        this.statusEffects.push({ type, turns });
        window.Game.log(`${this.name} is ${type} for ${turns} turn(s)!`);
        window.Game.statusEffectsApplied++;
        window.Game.achievements.statusMaster.count++;
        window.Game.checkAchievements();
    }

    updateStatusEffects() {
        this.statusEffects = this.statusEffects.filter(e => {
            e.turns--;
            if (e.type === 'burn') {
                this.takeDamage(5);
            } else if (e.type === 'poison') {
                this.takeDamage(3);
            } else if (e.type === 'stun' || e.type === 'freeze') {
                this.stunTimer = e.turns;
            }
            return e.turns > 0;
        });
        this.stunTimer = Math.max(0, this.stunTimer - 1);
    }

    attackTarget(warriors) {
        if (this.stunTimer > 0 || !this.isAlive) return;
        const aliveWarriors = warriors.filter(w => w.isAlive);
        if (aliveWarriors.length === 0) return;
        const target = aliveWarriors[Math.floor(Math.random() * aliveWarriors.length)];
        const damage = this.attack;
        target.takeDamage(damage);
        window.Game.log(`${this.name} attacks ${target.name} for ${damage} damage!`);
    }
}

// Item class
class Item {
    constructor(name, description, effect, target = 'warrior') {
        this.name = name;
        this.description = description;
        this.effect = effect;
        this.target = target;
    }
}

// Game class
class Game {
    constructor() {
        this.warriors = [];
        this.enemies = [];
        this.wave = 1;
        this.score = 0;
        this.gameMode = 'infinite';
        this.isGameOver = false;
        this.selectedWarrior = null;
        this.selectedEnemy = null;
        this.selectedAction = 'none';
        this.selectedItem = null;
        this.consecutiveKills = 0;
        this.itemsUsed = [];
        this.teamUpsUsed = [];
        this.inventory = [
            new Item('Health Potion', 'Restores 50 health to a warrior', (target) => {
                if (target?.isAlive) {
                    target.health = Math.min(target.maxHealth, target.health + 50);
                    this.log(`${target.name} restored 50 health!`);
                }
            }),
            new Item('Mana Potion', 'Restores 30 mana to a warrior', (target) => {
                if (target?.isAlive) {
                    target.mana = Math.min(target.maxMana, target.mana + 30);
                    this.log(`${target.name} restored 30 mana!`);
                }
            }),
            new Item('Attack Boost', 'Increases attack by 20% for 3 turns', (target) => {
                if (target?.isAlive) {
                    target.attack = Math.round(target.baseAttack * 1.2);
                    target.buffTimer = 3;
                    this.log(`${target.name} gained 20% attack for 3 turns!`);
                }
            }),
            new Item('Synergy Boost', 'Activates a random synergy effect', (target, game) => {
                const synergyKeys = Object.keys(synergies);
                const randomSynergy = synergies[synergyKeys[Math.floor(Math.random() * synergyKeys.length)]];
                randomSynergy.effect(game);
                this.log(`Synergy Boost activated: ${randomSynergy.name}!`);
            })
        ];
        this.achievements = {
            firstBlood: { name: 'First Blood', description: 'Defeat an enemy', count: 0, target: 1, reward: () => { this.score += 100; }, rewarded: false },
            waveMaster: { name: 'Wave Master', description: 'Complete 5 waves', count: 0, target: 5, reward: () => { this.score += 500; }, rewarded: false },
            levelFive: { name: 'Rising Star', description: 'Reach level 5 with a hero', count: 0, target: 1, reward: () => { this.score += 200; }, rewarded: false },
            levelTen: { name: 'Elite Warrior', description: 'Reach level 10 with a hero', count: 0, target: 1, reward: () => { this.score += 400; }, rewarded: false },
            comboKing: { name: 'Combo King', description: 'Perform 5 combo attacks', count: 0, target: 5, reward: () => { this.score += 300; }, rewarded: false },
            statusMaster: { name: 'Status Master', description: 'Apply 10 status effects', count: 0, target: 10, reward: () => { this.score += 350; }, rewarded: false },
            dodgeMaster: { name: 'Dodge Master', description: 'Dodge 5 attacks', count: 0, target: 5, reward: () => { this.score += 250; }, rewarded: false },
            teamUpMaster: { name: 'Team-Up Titan', description: 'Use 5 team-up abilities', count: 0, target: 5, reward: () => { this.score += 400; }, rewarded: false },
            synergySavant: { name: 'Synergy Savant', description: 'Activate 5 different synergies', count: 0, target: 5, reward: () => { this.score += 500; }, rewarded: false },
            thanosSnap: { name: 'Infinity Slayer', description: 'Use Thanos\' Infinity Snap', count: 0, target: 1, reward: () => { this.score += 1000; }, rewarded: false }
        };
        this.difficulty = localStorage.getItem('difficulty') || 'normal';
        this.difficultyMultipliers = { easy: 0.8, normal: 1, hard: 1.2 };
        this.powerUps = [
            { name: 'Health Boost', effect: () => { this.warriors.forEach(w => { w.maxHealth += 20; w.health = w.maxHealth; }); this.log('All warriors gained +20 max health!'); } },
            { name: 'Attack Boost', effect: () => { this.warriors.forEach(w => { w.attack += 5; }); this.log('All warriors gained +5 attack!'); } },
            { name: 'Mana Boost', effect: () => { this.warriors.forEach(w => { w.maxMana += 10; w.mana = w.maxMana; }); this.log('All warriors gained +10 max mana!'); } }
        ];
        this.startTime = Date.now();
        this.criticalHits = 0;
        this.dodges = 0;
        this.statusEffectsApplied = 0;
        this.enemiesDefeated = 0;
        this.activeSynergies = new Set();
        this.teamUpsPerformed = new Set();
        window.Game = this;
    }

    async initialize() {
        try {
            await soundEffects.load();
            this.loadSettings();
            this.loadGame();
            this.setupEventListeners();
            this.loadWarriors();
            this.applySynergies();
            this.startWave();
            this.updateHUD();
            this.updateInventory();
            this.updateAchievements();
        } catch (e) {
            this.showErrorToast('Failed to initialize game! Please check console for details or try refreshing.');
            console.error('[Game.initialize]', e);
        }
    }

    applySynergies() {
        Object.entries(synergies).forEach(([name, synergy]) => {
            const hasSynergy = synergy.heroes.every(hero => this.warriors.some(w => w.name === hero && w.isAlive));
            if (hasSynergy) {
                synergy.effect(this);
                this.activeSynergies.add(name);
                this.achievements.synergySavant.count = this.activeSynergies.size;
                this.checkAchievements();
            }
        });
    }

    loadSettings() {
        const soundVolume = localStorage.getItem('soundVolume') || '50';
        const soundVolumeInput = document.getElementById('soundVolume');
        if (soundVolumeInput) soundVolumeInput.value = soundVolume;
        this.difficulty = localStorage.getItem('difficulty') || 'normal';
        const difficultySelect = document.getElementById('difficultySelect');
        if (difficultySelect) difficultySelect.value = this.difficulty;
        Object.values(soundEffects).forEach(sound => { if (sound) sound.volume = parseFloat(soundVolume) / 100; });
        if (soundEffects.background) soundEffects.background.volume *= 0.5;
    }

    saveSettings() {
        const soundVolumeInput = document.getElementById('soundVolume');
        const difficultySelect = document.getElementById('difficultySelect');
        if (!soundVolumeInput || !difficultySelect) return;
        const soundVolume = soundVolumeInput.value;
        const difficulty = difficultySelect.value;
        localStorage.setItem('soundVolume', soundVolume);
        localStorage.setItem('difficulty', difficulty);
        this.difficulty = difficulty;
        Object.values(soundEffects).forEach(sound => { if (sound) sound.volume = parseFloat(soundVolume) / 100; });
        if (soundEffects.background) soundEffects.background.volume *= 0.5;
        this.log('Settings saved!');
        const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (settingsModal) settingsModal.hide();
    }

    loadWarriors() {
        const selectedWarriors = JSON.parse(localStorage.getItem('selectedWarriors')) || ['Tony Stark', 'Steve Rogers', 'Thor Odinson'];
        this.warriors = selectedWarriors
            .filter(w => w !== 'none')
            .map(name => {
                const stats = warriorBaseStats[name] || { health: 100, attack: 20, mana: 50 };
                return new Warrior(
                    name,
                    stats.health,
                    stats.attack,
                    stats.mana,
                    specialAbilities[name],
                    warriorImageMap.get(name) || placeholderImage
                );
            });
        this.renderWarriors();
    }

    saveGame() {
        const gameState = {
            warriors: this.warriors.map(w => ({
                name: w.name,
                health: w.health,
                maxHealth: w.maxHealth,
                attack: w.attack,
                mana: w.mana,
                maxMana: w.maxMana,
                level: w.level,
                xp: w.xp,
                xpToNextLevel: w.xpToNextLevel
            })),
            wave: this.wave,
            score: this.score,
            gameMode: this.gameMode,
            inventory: this.inventory.map(i => i.name),
            achievements: Object.fromEntries(Object.entries(this.achievements).map(([k, v]) => [k, { ...v, reward: undefined }])),
            activeSynergies: Array.from(this.activeSynergies),
            teamUpsPerformed: Array.from(this.teamUpsPerformed)
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
        this.log('Game saved!');
        const saveGameModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('saveGameModal'));
        saveGameModal.show();
    }

    loadGame() {
        const savedState = JSON.parse(localStorage.getItem('gameState'));
        if (savedState) {
            this.warriors = savedState.warriors.map(w => {
                const warrior = new Warrior(
                    w.name,
                    w.maxHealth,
                    w.attack,
                    w.maxMana,
                    specialAbilities[w.name],
                    warriorImageMap.get(w.name) || placeholderImage
                );
                warrior.health = w.health;
                warrior.mana = w.mana;
                warrior.level = w.level;
                warrior.xp = w.xp;
                warrior.xpToNextLevel = w.xpToNextLevel;
                return warrior;
            });
            this.wave = savedState.wave;
            this.score = savedState.score;
            this.gameMode = savedState.gameMode;
            this.inventory = savedState.inventory.map(name =>
                this.inventory.find(i => i.name === name) || new Item(name, 'Unknown Item', () => {})
            );
            Object.entries(savedState.achievements || {}).forEach(([key, value]) => {
                if (this.achievements[key]) {
                    this.achievements[key].count = value.count;
                    this.achievements[key].rewarded = value.rewarded;
                }
            });
            this.activeSynergies = new Set(savedState.activeSynergies || []);
            this.teamUpsPerformed = new Set(savedState.teamUpsPerformed || []);
            this.renderWarriors();
            this.updateHUD();
            this.updateInventory();
            this.updateAchievements();
            this.log('Game loaded!');
        }
    }

    startWave() {
        this.enemies = [];
        const enemyNames = Array.from(enemyImageMap.keys()).filter(e => e !== 'Thanos');
        const enemyCount = Math.min(3, Math.floor(this.wave / 2) + 1);
        for (let i = 0; i < enemyCount; i++) {
            const name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
            const baseHealth = 100 + this.wave * 10 * this.difficultyMultipliers[this.difficulty];
            const baseAttack = 10 + this.wave * 2 * this.difficultyMultipliers[this.difficulty];
            this.enemies.push(new Enemy(
                name,
                baseHealth,
                baseAttack,
                enemyImageMap.get(name) || placeholderImage,
                this.difficultyMultipliers[this.difficulty]
            ));
        }
        if (this.wave % 10 === 0) {
            this.enemies.push(new Enemy(
                'Thanos',
                500 * this.difficultyMultipliers[this.difficulty],
                30 * this.difficultyMultipliers[this.difficulty],
                enemyImageMap.get('Thanos') || placeholderImage,
                this.difficultyMultipliers[this.difficulty]
            ));
        }
        this.renderEnemies();
        this.log(`Wave ${this.wave} started with ${this.enemies.length} enemies!`);
        this.applySynergies();
        this.updateHUD();
    }

    renderWarriors() {
        const warriorContainer = document.getElementById('warriorContainer');
        if (!warriorContainer) return;
        warriorContainer.innerHTML = '';
        this.warriors.forEach((warrior, index) => {
            if (!warrior.isAlive) return;
            const player = window.players.find(p => p.realName === warrior.name);
            const card = document.createElement('div');
            card.className = 'card warrior-card animate__animated animate__fadeIn';
            card.dataset.warriorId = player?.id || `warrior-${index}`;
            card.innerHTML = `
                <img src="${warrior.image}" alt="${warrior.name}" class="card-img-top" onerror="this.src='${placeholderImage}'">
                <div class="card-body">
                    <h5 class="card-title">${warrior.name}</h5>
                    <p>Health: <span class="health">${warrior.health}/${warrior.maxHealth}</span></p>
                    <p>Mana: <span class="mana">${warrior.mana}/${warrior.maxMana}</span></p>
                    <p>Attack: <span class="attack">${warrior.attack}</span></p>
                    <p>Level: <span class="level">${warrior.level}</span></p>
                    <button class="btn btn-primary btn-sm btn-select-warrior" data-warrior-id="${index}" aria-label="Select ${warrior.name}">Select</button>
                    <button class="btn btn-success btn-sm btn-special-ability" data-warrior-id="${index}" ${warrior.cooldown > 0 || warrior.mana < warrior.specialAbility.manaCost ? 'disabled' : ''} aria-label="Use ${warrior.specialAbility.name}">Special</button>
                    <button class="btn btn-info btn-sm btn-team-up" data-warrior-id="${index}" ${warrior.teamUpCooldown > 0 ? 'disabled' : ''} aria-label="Use Team-Up">Team-Up</button>
                    <button class="btn btn-secondary btn-sm btn-more-info" data-warrior-id="${index}" aria-label="More Info on ${warrior.name}">Info</button>
                </div>
            `;
            warriorContainer.appendChild(card);
        });
    }

    renderEnemies() {
        const enemyContainer = document.getElementById('enemyContainer');
        if (!enemyContainer) return;
        enemyContainer.innerHTML = '';
        this.enemies.forEach((enemy, index) => {
            if (!enemy.isAlive) return;
            const card = document.createElement('div');
            card.className = 'card enemy-card animate__animated animate__fadeIn';
            card.dataset.enemyId = index;
            card.innerHTML = `
                <img src="${enemy.image}" alt="${enemy.name}" class="card-img-top" onerror="this.src='${placeholderImage}'">
                <div class="card-body">
                    <h5 class="card-title">${enemy.name}</h5>
                    <p>Health: <span class="health">${enemy.health}/${enemy.maxHealth}</span></p>
                    <p>Attack: <span class="attack">${enemy.attack}</span></p>
                    <button class="btn btn-danger btn-sm btn-select-enemy" data-enemy-id="${index}" aria-label="Target ${enemy.name}">Target</button>
                </div>
            `;
            enemyContainer.appendChild(card);
        });
    }

    updateHUD() {
        const waveDisplay = document.getElementById('waveDisplay');
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (waveDisplay) waveDisplay.textContent = `Wave: ${this.wave}`;
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.score}`;
    }

    updateInventory() {
        const inventoryList = document.getElementById('inventoryList');
        if (!inventoryList) return;
        inventoryList.innerHTML = '';
        this.inventory.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `
                ${item.name}: ${item.description}
                <button class="btn btn-sm btn-primary btn-use-item" data-item-id="${index}" aria-label="Use ${item.name}">Use</button>
            `;
            inventoryList.appendChild(li);
        });
    }

    updateAchievements() {
        const achievementList = document.getElementById('achievementList');
        if (!achievementList) return;
        achievementList.innerHTML = '';
        Object.entries(this.achievements).forEach(([_, ach]) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${ach.name}: ${ach.description} (${ach.count}/${ach.target}) ${ach.rewarded ? '[Rewarded]' : ''}`;
            achievementList.appendChild(li);
        });
    }

    log(message) {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;
        const logEntry = document.createElement('p');
        logEntry.textContent = message;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    showErrorToast(message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast bg-danger text-white';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-header">
                <strong>Error</strong>
                <button class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        toastContainer.appendChild(toast);
        const bootstrapToast = new bootstrap.Toast(toast);
        bootstrapToast.show();
    }

    checkAchievements() {
        Object.entries(this.achievements).forEach(([key, ach]) => {
            if (!ach.rewarded && ach.count >= ach.target) {
                ach.reward();
                ach.rewarded = true;
                this.log(`Achievement Unlocked: ${ach.name}!`);
                soundEffects.achievement?.play()?.catch(() => {});
                const achievementModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('achievementModal'));
                document.getElementById('achievementModalLabel').textContent = ach.name;
                document.getElementById('achievementModalBody').textContent = ach.description;
                achievementModal.show();
            }
        });
    }

    setupEventListeners() {
        let clickTimeout = null;
        const handleClick = (e) => {
            if (clickTimeout) return;
            clickTimeout = setTimeout(() => {
                if (e.target.classList.contains('btn-select-warrior')) {
                    const warriorId = parseInt(e.target.dataset.warriorId);
                    this.selectedWarrior = this.warriors[warriorId];
                    this.log(`Selected: ${this.selectedWarrior.name}`);
                    soundEffects.select?.play()?.catch(() => {});
                } else if (e.target.classList.contains('btn-select-enemy')) {
                    const enemyId = parseInt(e.target.dataset.enemyId);
                    this.selectedEnemy = this.enemies[enemyId];
                    this.log(`Targeted: ${this.selectedEnemy.name}`);
                    soundEffects.select?.play()?.catch(() => {});
                    if (this.selectedWarrior && this.selectedAction !== 'none') {
                        this.executeAction();
                    }
                } else if (e.target.classList.contains('btn-special-ability')) {
                    const warriorId = parseInt(e.target.dataset.warriorId);
                    this.selectedWarrior = this.warriors[warriorId];
                    this.selectedAction = 'special';
                    this.log(`Selected ${this.selectedWarrior.specialAbility.name}`);
                    soundEffects.special?.play()?.catch(() => {});
                } else if (e.target.classList.contains('btn-team-up')) {
                    const warriorId = parseInt(e.target.dataset.warriorId);
                    this.selectedWarrior = this.warriors[warriorId];
                    this.selectedAction = 'teamUp';
                    this.log(`Selected Team-Up for ${this.selectedWarrior.name}`);
                    soundEffects.select?.play()?.catch(() => {});
                } else if (e.target.classList.contains('btn-use-item')) {
                    const itemId = parseInt(e.target.dataset.itemId);
                    this.selectedAction = 'item';
                    this.selectedItem = this.inventory[itemId];
                    this.log(`Selected Item: ${this.selectedItem.name}`);
                    soundEffects.select?.play()?.catch(() => {});
                } else if (e.target.classList.contains('btn-more-info')) {
                    const warriorId = parseInt(e.target.dataset.warriorId);
                    const warrior = this.warriors[warriorId];
                    const player = window.players.find(p => p.realName === warrior.name);
                    this.log(`Viewing info for ${warrior.name}`);
                    soundEffects.moreinfo?.play()?.catch(() => {});
                    const infoModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('infoModal'));
                    document.getElementById('infoModalLabel').textContent = warrior.name;
                    document.getElementById('infoModalBody').innerHTML = `
                        <p><strong>Weapon:</strong> ${player?.weapon || 'Unknown'}</p>
                        <p><strong>Skill:</strong> ${player?.skill || 'Unknown'}</p>
                        <p><strong>Special:</strong> ${player?.special || 'Unknown'}</p>
                        <p><strong>Passive:</strong> ${warrior.passive.description}</p>
                    `;
                    infoModal.show();
                }
                clickTimeout = null;
            }, 200);
        };

        document.addEventListener('click', handleClick);
    }

    executeAction() {
        if (!this.selectedWarrior || !this.selectedEnemy || this.selectedWarrior.stunTimer > 0) return;
        let damage = 0;
        if (this.selectedAction === 'special') {
            if (this.selectedWarrior.mana >= this.selectedWarrior.specialAbility.manaCost && this.selectedWarrior.cooldown === 0) {
                damage = this.selectedWarrior.specialAbility.effect(this.selectedEnemy, this.selectedWarrior, this);
                this.selectedWarrior.mana -= this.selectedWarrior.specialAbility.manaCost;
                this.selectedWarrior.cooldown = this.selectedWarrior.specialAbility.cooldown;
                this.achievements.thanosSnap.count = this.selectedWarrior.name === 'Thanos' && this.selectedEnemy.health === 0 ? 1 : this.achievements.thanosSnap.count;
                soundEffects.special?.play()?.catch(() => {});
            }
        } else if (this.selectedAction === 'teamUp') {
            const teamUp = Object.values(teamUpAbilities).find(t => t.heroes.includes(this.selectedWarrior.name) && this.warriors.filter(w => t.heroes.includes(w.name) && w.isAlive).length === t.heroes.length);
            if (teamUp && this.selectedWarrior.teamUpCooldown === 0) {
                damage = teamUp.effect(this.selectedEnemy, this);
                this.warriors.forEach(w => { if (teamUp.heroes.includes(w.name)) w.teamUpCooldown = teamUp.cooldown; });
                this.teamUpsPerformed.add(teamUp.name);
                this.achievements.teamUpMaster.count = this.teamUpsPerformed.size;
                soundEffects.special?.play()?.catch(() => {});
            }
        } else if (this.selectedAction === 'item') {
            if (this.selectedItem) {
                this.selectedItem.effect(this.selectedWarrior, this);
                this.itemsUsed.push(this.selectedItem.name);
                const itemIndex = this.inventory.findIndex(i => i.name === this.selectedItem.name);
                if (itemIndex !== -1) this.inventory.splice(itemIndex, 1);
                this.updateInventory();
                soundEffects.select?.play()?.catch(() => {});
            }
        } else {
            damage = this.selectedWarrior.attack;
            if (Math.random() < this.selectedWarrior.critChance) {
                damage *= 2;
                this.criticalHits++;
                this.log('Critical Hit!');
            }
            this.selectedEnemy.takeDamage(damage);
            this.selectedWarrior.comboCount++;
            if (this.selectedWarrior.comboCount >= 3) {
                this.achievements.comboKing.count++;
                this.log('Combo Bonus!');
                damage *= 1.2;
            }
            soundEffects.attack?.play()?.catch(() => {});
        }
        this.selectedWarrior.regenerateMana();
        this.selectedWarrior.updateStatusEffects();
        this.enemies.forEach(e => e.updateStatusEffects());
        this.enemies.filter(e => e.isAlive).forEach(e => e.attackTarget(this.warriors));
        this.warriors.forEach(w => w.updateStatusEffects());
        this.score += Math.round(damage);
        this.renderWarriors();
        this.renderEnemies();
        this.updateHUD();
        this.checkAchievements();
        this.selectedAction = 'none';
        this.selectedItem = null;
        setTimeout(() => this.checkWaveStatus(), 100);
    }

    checkWaveStatus() {
        if (this.enemies.every(e => !e.isAlive)) {
            this.wave++;
            this.score += 100 * this.wave;
            this.achievements.waveMaster.count = Math.min(this.wave, 5);
            this.warriors.forEach(w => w.gainXP(50));
            this.log(`Wave ${this.wave - 1} cleared!`);
            soundEffects.victory?.play()?.catch(() => {});
            if (Math.random() < 0.3) {
                const powerUp = this.powerUps[Math.floor(Math.random() * this.powerUps.length)];
                powerUp.effect();
            }
            this.startWave();
        } else if (this.warriors.every(w => !w.isAlive)) {
            this.isGameOver = true;
            this.log('Game Over!');
            soundEffects.defeat?.play()?.catch(() => {});
            const gameOverModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('gameOverModal'));
            gameOverModal.show();
        }
    }
}

// Initialize game
const game = new Game();
game.initialize();