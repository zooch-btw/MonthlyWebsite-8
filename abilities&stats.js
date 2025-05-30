/* JS: Defines special abilities and base stats for all 40 heroes in Galaxy BattleForge using hero names. */

/* JS: Special abilities for each hero, reflecting their Marvel lore and role. */
const specialAbilities = {
    /* JS: Iron Man - Tech-based DPS with AOE potential. */
    'Iron Man': {
        name: 'Repulsor Barrage',
        description: 'Fires a devastating energy blast at a single enemy.',
        manaCost: 30,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.5 + warrior.level * 0.05));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Captain America - Tanky leader with crowd control. */
    'Captain America': {
        name: 'Shield Bash',
        description: 'Stuns and damages an enemy with a vibranium shield strike.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1 + warrior.level * 0.03));
            target.takeDamage(damage);
            target.stunTurns = 1;
            return damage;
        }
    },
    /* JS: Thor - High-damage AOE with godly power. */
    'Thor': {
        name: 'Thunder Strike',
        description: 'Summons lightning to damage all enemies.',
        manaCost: 40,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Black Widow - Agile support with debuffs. */
    'Black Widow': {
        name: 'Widow’s Bite',
        description: 'Shocks an enemy, reducing their attack.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 0.8);
            target.takeDamage(damage);
            target.attack = Math.round(target.attack * 0.8);
            target.debuffTurns = 2;
            return damage;
        }
    },
    /* JS: Hawkeye - Precise ranged DPS. */
    'Hawkeye': {
        name: 'Explosive Arrow',
        description: 'Fires an arrow that explodes, damaging nearby enemies.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1 + warrior.level * 0.02));
            target.takeDamage(damage);
            game.enemies.filter(e => e !== target).forEach(e => e.takeDamage(damage * 0.5));
            return damage;
        }
    },
    /* JS: Spider-Man - Agile DPS with crowd control. */
    'Spider-Man': {
        name: 'Web Trap',
        description: 'Traps an enemy in webs, preventing action.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior) => {
            target.stunTurns = 2;
            const damage = Math.round(warrior.attack * 0.7);
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Doctor Strange - Mystic support with utility. */
    'Doctor Strange': {
        name: 'Crimson Bands',
        description: 'Binds an enemy, reducing damage taken by allies.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            target.stunTurns = 1;
            game.warriors.forEach(w => w.shield = 0.8);
            return 0;
        }
    },
    /* JS: Black Panther - Balanced melee DPS with buffs. */
    'Black Panther': {
        name: 'Vibranium Slash',
        description: 'Slashes with claws, boosting own attack.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.03));
            target.takeDamage(damage);
            warrior.attack = Math.round(warrior.attack * 1.2);
            warrior.buffTurns = 2;
            return damage;
        }
    },
    /* JS: Scarlet Witch - High-risk, high-reward mystic DPS. */
    'Scarlet Witch': {
        name: 'Chaos Wave',
        description: 'Unleashes chaotic energy, damaging all enemies randomly.',
        manaCost: 45,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.8 + Math.random() * 0.8));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Ant-Man - Utility with size-based mechanics. */
    'Ant-Man': {
        name: 'Pym Particle Strike',
        description: 'Shrinks to attack, increasing dodge chance.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 0.9);
            target.takeDamage(damage);
            warrior.dodgeChance += 0.1;
            warrior.buffTurns = 2;
            return damage;
        }
    },
    /* JS: Wolverine - Tanky brawler with regeneration. */
    'Wolverine': {
        name: 'Berserker Rage',
        description: 'Unleashes fury, healing self and damaging enemy.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.3 + warrior.level * 0.03));
            target.takeDamage(damage);
            warrior.health = Math.min(warrior.maxHealth, warrior.health + 20);
            return damage;
        }
    },
    /* JS: Storm - AOE mystic with weather control. */
    'Storm': {
        name: 'Tempest Blast',
        description: 'Summons a storm, damaging all enemies.',
        manaCost: 40,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Cyclops - Precise ranged DPS. */
    'Cyclops': {
        name: 'Optic Blast',
        description: 'Fires a powerful energy beam at one enemy.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.4 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Jean Grey - Powerful mystic with AOE and healing. */
    'Jean Grey': {
        name: 'Phoenix Flame',
        description: 'Burns enemies and heals allies.',
        manaCost: 45,
        cooldown: 5,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * 1.1);
            game.enemies.forEach(e => e.takeDamage(damage));
            game.warriors.forEach(w => w.health = Math.min(w.maxHealth, w.health + 15));
            return damage;
        }
    },
    /* JS: Beast - Tanky support with buffs. */
    'Beast': {
        name: 'Feral Roar',
        description: 'Boosts ally attack with a primal roar.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.warriors.forEach(w => {
                w.attack = Math.round(w.attack * 1.15);
                w.buffTurns = 2;
            });
            return 0;
        }
    },
    /* JS: Gambit - Risky DPS with explosive attacks. */
    'Gambit': {
        name: 'Kinetic Charge',
        description: 'Throws charged cards, with a chance for extra damage.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (Math.random() < 0.3 ? 2 : 1));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Rogue - Versatile with power absorption. */
    'Rogue': {
        name: 'Power Drain',
        description: 'Steals enemy health and mana.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 0.8);
            target.takeDamage(damage);
            warrior.health = Math.min(warrior.maxHealth, warrior.health + 10);
            warrior.mana = Math.min(warrior.maxMana, warrior.mana + 10);
            return damage;
        }
    },
    /* JS: Deadpool - Chaotic DPS with self-healing. */
    'Deadpool': {
        name: 'Maximum Effort',
        description: 'Wild attack with healing and random damage.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (0.8 + Math.random() * 0.8));
            target.takeDamage(damage);
            warrior.health = Math.min(warrior.maxHealth, warrior.health + 15);
            return damage;
        }
    },
    /* JS: Venom - Tanky brawler with debuffs. */
    'Venom': {
        name: 'Symbiote Slam',
        description: 'Slams enemy, reducing their defense.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 1.2);
            target.takeDamage(damage);
            target.shield = 1.2;
            target.debuffTurns = 2;
            return damage;
        }
    },
    /* JS: Magneto - Mystic controller with AOE. */
    'Magneto': {
        name: 'Magnetic Crush',
        description: 'Manipulates metal to damage all enemies.',
        manaCost: 40,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Doctor Doom - Mystic tank with utility. */
    'Doctor Doom': {
        name: 'Arcane Shield',
        description: 'Shields allies and damages an enemy.',
        manaCost: 35,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * 0.9);
            target.takeDamage(damage);
            game.warriors.forEach(w => w.shield = 0.7);
            return damage;
        }
    },
    /* JS: Thanos - Ultimate tank with devastating AOE. */
    'Thanos': {
        name: 'Infinity Snap',
        description: 'Decimates enemies with cosmic power.',
        manaCost: 50,
        cooldown: 5,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1.5 + warrior.level * 0.03));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Loki - Trickster with illusions and debuffs. */
    'Loki': {
        name: 'Illusionary Strike',
        description: 'Confuses an enemy, reducing accuracy.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 0.8);
            target.takeDamage(damage);
            target.critChance = Math.max(0, target.critChance - 0.1);
            target.debuffTurns = 2;
            return damage;
        }
    },
    /* JS: Ultron - Tech-based AOE with durability. */
    'Ultron': {
        name: 'Drone Swarm',
        description: 'Sends drones to attack all enemies.',
        manaCost: 40,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Red Skull - Tactical debuffer. */
    'Red Skull': {
        name: 'HYDRA Command',
        description: 'Weakens enemy attack and defense.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior) => {
            target.attack = Math.round(target.attack * 0.8);
            target.shield = 1.2;
            target.debuffTurns = 2;
            return 0;
        }
    },
    /* JS: Green Goblin - Chaotic DPS with bombs. */
    'Green Goblin': {
        name: 'Pumpkin Bomb',
        description: 'Throws explosive bombs at enemies.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * 1.1);
            game.enemies.forEach(e => e.takeDamage(damage * 0.7));
            return damage;
        }
    },
    /* JS: Kingpin - Tanky brawler with crowd control. */
    'Kingpin': {
        name: 'Crime Lord Slam',
        description: 'Smashes an enemy, stunning them.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 1.1);
            target.takeDamage(damage);
            target.stunTurns = 1;
            return damage;
        }
    },
    /* JS: Black Cat - Agile support with luck manipulation. */
    'Black Cat': {
        name: 'Bad Luck Charm',
        description: 'Curses an enemy, lowering crit chance.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            target.critChance = Math.max(0, target.critChance - 0.15);
            target.debuffTurns = 2;
            return 0;
        }
    },
    /* JS: Mysterio - Illusionist with debuffs. */
    'Mysterio': {
        name: 'Holo-Decoy',
        description: 'Creates illusions, boosting ally dodge.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.warriors.forEach(w => {
                w.dodgeChance += 0.1;
                w.buffTurns = 2;
            });
            return 0;
        }
    },
    /* JS: Rhino - Tanky charger with single-target damage. */
    'Rhino': {
        name: 'Rhino Charge',
        description: 'Charges an enemy, dealing massive damage.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.4 + warrior.level * 0.03));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Sandman - Tanky with damage mitigation. */
    'Sandman': {
        name: 'Sandstorm',
        description: 'Creates a sandstorm, reducing enemy accuracy.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.enemies.forEach(e => {
                e.critChance = Math.max(0, e.critChance - 0.1);
                e.debuffTurns = 2;
            });
            return 0;
        }
    },
    /* JS: Electro - High-damage AOE with energy attacks. */
    'Electro': {
        name: 'Volt Surge',
        description: 'Electrocutes all enemies.',
        manaCost: 40,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Doctor Octopus - Tactical with multi-target attacks. */
    'Doctor Octopus': {
        name: 'Tentacle Barrage',
        description: 'Strikes multiple enemies with mechanical arms.',
        manaCost: 35,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * 0.9);
            game.enemies.slice(0, 2).forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Kraven - Hunter with single-target focus. */
    'Kraven': {
        name: 'Hunter’s Strike',
        description: 'Targets a weak enemy for high damage.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.3 + (1 - target.health / target.maxHealth)));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Shocker - Ranged DPS with crowd control. */
    'Shocker': {
        name: 'Shockwave',
        description: 'Emits a shockwave, stunning enemies.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.enemies.forEach(e => e.stunTurns = 1);
            return 0;
        }
    },
    /* JS: Scorpion - Aggressive DPS with poison. */
    'Scorpion': {
        name: 'Venom Sting',
        description: 'Poisons an enemy, dealing damage over time.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 0.5);
            target.takeDamage(damage);
            target.debuffTurns = 3;
            // Note: Implement DoT in Warrior class if needed
            return damage;
        }
    },
    /* JS: Vulture - Mobile DPS with hit-and-run. */
    'Vulture': {
        name: 'Aerial Dive',
        description: 'Dives at an enemy, boosting dodge chance.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * 1.1);
            target.takeDamage(damage);
            warrior.dodgeChance += 0.1;
            warrior.buffTurns = 2;
            return damage;
        }
    },
    /* JS: Hulk - Tanky brawler with high damage and rage mechanics. */
    'Hulk': {
        name: 'Gamma Smash',
        description: 'Smashes the ground, damaging all enemies and increasing own attack.',
        manaCost: 35,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1.3 + warrior.level * 0.03));
            game.enemies.forEach(e => e.takeDamage(damage));
            warrior.attack = Math.round(warrior.attack * 1.2);
            warrior.buffTurns = 2;
            return damage;
        }
    },
    /* JS: Bullseye - Precise ranged DPS with deadly accuracy. */
    'Bullseye': {
        name: 'Deadly Throw',
        description: 'Throws a precise projectile, dealing high damage to a single enemy.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.5 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Winter Soldier - Versatile DPS with stealth and precision. */
    'Winter Soldier': {
        name: 'Bionic Arm Strike',
        description: 'Delivers a powerful strike with bionic arm, stunning the enemy.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.03));
            target.takeDamage(damage);
            target.stunTurns = 1;
            return damage;
        }
    }
};

/* JS: Base stats for each hero, reflecting their role and lore. */
const warriorBaseStats = {
    /* JS: Iron Man - Balanced tech DPS. */
    'Iron Man': { health: 100, attack: 20, mana: 50 },
    /* JS: Captain America - Tanky leader. */
    'Captain America': { health: 120, attack: 18, mana: 45 },
    /* JS: Thor - High-damage tank. */
    'Thor': { health: 150, attack: 25, mana: 40 },
    /* JS: Black Widow - Agile support. */
    'Black Widow': { health: 90, attack: 15, mana: 30 },
    /* JS: Hawkeye - Precise ranged DPS. */
    'Hawkeye': { health: 95, attack: 22, mana: 25 },
    /* JS: Spider-Man - Agile DPS. */
    'Spider-Man': { health: 100, attack: 18, mana: 30 },
    /* JS: Doctor Strange - Mystic support. */
    'Doctor Strange': { health: 80, attack: 15, mana: 60 },
    /* JS: Black Panther - Balanced melee DPS. */
    'Black Panther': { health: 110, attack: 20, mana: 45 },
    /* JS: Scarlet Witch - High-risk mystic. */
    'Scarlet Witch': { health: 85, attack: 25, mana: 55 },
    /* JS: Ant-Man - Agile utility. */
    'Ant-Man': { health: 90, attack: 15, mana: 30 },
    /* JS: Wolverine - Durable brawler. */
    'Wolverine': { health: 140, attack: 20, mana: 35 },
    /* JS: Storm - Mystic AOE. */
    'Storm': { health: 100, attack: 18, mana: 50 },
    /* JS: Cyclops - Ranged DPS. */
    'Cyclops': { health: 95, attack: 22, mana: 40 },
    /* JS: Jean Grey - Powerful mystic. */
    'Jean Grey': { health: 100, attack: 20, mana: 55 },
    /* JS: Beast - Tanky support. */
    'Beast': { health: 120, attack: 18, mana: 40 },
    /* JS: Gambit - Risky DPS. */
    'Gambit': { health: 100, attack: 20, mana: 35 },
    /* JS: Rogue - Versatile absorber. */
    'Rogue': { health: 110, attack: 18, mana: 40 },
    /* JS: Deadpool - Chaotic healer. */
    'Deadpool': { health: 100, attack: 20, mana: 40 },
    /* JS: Venom - Tanky melee. */
    'Venom': { health: 130, attack: 20, mana: 30 },
    /* JS: Magneto - Mystic controller. */
    'Magneto': { health: 110, attack: 15, mana: 50 },
    /* JS: Doctor Doom - Tanky mystic. */
    'Doctor Doom': { health: 120, attack: 18, mana: 50 },
    /* JS: Thanos - Ultimate tank. */
    'Thanos': { health: 200, attack: 25, mana: 45 },
    /* JS: Loki - Trickster support. */
    'Loki': { health: 90, attack: 15, mana: 45 },
    /* JS: Ultron - Tech-based AOE. */
    'Ultron': { health: 120, attack: 20, mana: 40 },
    /* JS: Red Skull - Tactical debuffer. */
    'Red Skull': { health: 100, attack: 15, mana: 35 },
    /* JS: Green Goblin - Chaotic DPS. */
    'Green Goblin': { health: 100, attack: 20, mana: 35 },
    /* JS: Kingpin - Tanky enforcer. */
    'Kingpin': { health: 150, attack: 18, mana: 30 },
    /* JS: Black Cat - Agile support. */
    'Black Cat': { health: 80, attack: 14, mana: 30 },
    /* JS: Mysterio - Illusionist support. */
    'Mysterio': { health: 90, attack: 12, mana: 40 },
    /* JS: Rhino - Tanky charger. */
    'Rhino': { health: 140, attack: 20, mana: 30 },
    /* JS: Sandman - Tanky mitigator. */
    'Sandman': { health: 130, attack: 15, mana: 35 },
    /* JS: Electro - High-damage AOE. */
    'Electro': { health: 95, attack: 22, mana: 40 },
    /* JS: Doctor Octopus - Tactical multi-target. */
    'Doctor Octopus': { health: 110, attack: 18, mana: 35 },
    /* JS: Kraven - Hunter DPS. */
    'Kraven': { health: 100, attack: 20, mana: 30 },
    /* JS: Shocker - Ranged crowd control. */
    'Shocker': { health: 95, attack: 18, mana: 35 },
    /* JS: Scorpion - Poison DPS. */
    'Scorpion': { health: 100, attack: 20, mana: 30 },
    /* JS: Vulture - Mobile DPS. */
    'Vulture': { health: 95, attack: 18, mana: 30 },
    /* JS: Hulk - Tanky brawler with high health and damage. */
    'Hulk': { health: 180, attack: 25, mana: 35 },
    /* JS: Bullseye - Precise ranged DPS with high attack. */
    'Bullseye': { health: 90, attack: 22, mana: 30 },
    /* JS: Winter Soldier - Versatile DPS with balanced stats. */
    'Winter Soldier': { health: 110, attack: 20, mana: 35 }
};