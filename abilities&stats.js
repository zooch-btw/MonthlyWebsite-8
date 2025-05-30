/* JS: Defines special abilities and base stats for all 40 heroes in Galaxy BattleForge using hero names. */

/* JS: Special abilities for each hero, reflecting their Marvel lore and role. */
const specialAbilities = {
    /* JS: Iron Man - Tech-based DPS with single-target burst. */
    'Iron Man': {
        name: 'Repulsor Barrage',
        description: 'Fires a focused energy blast at one enemy.',
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
        description: 'Stuns a single enemy for one turn.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.0 + warrior.level * 0.03));
            target.takeDamage(damage);
            target.stunTurns = 1;
            return damage;
        }
    },
    /* JS: Thor - High-damage AOE with godly power. */
    'Thor': {
        name: 'Thunder Strike',
        description: 'Deals heavy damage to one enemy with a lightning bolt.',
        manaCost: 35,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.8 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Black Widow - Agile support with critical strikes. */
    'Black Widow': {
        name: 'Stealth Strike',
        description: 'Attacks with increased critical chance.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            const critMultiplier = Math.random() < 0.4 ? 2 : 1;
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.02) * critMultiplier);
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Hawkeye - Precise ranged AOE DPS. */
    'Hawkeye': {
        name: 'Explosive Arrow',
        description: 'Damages all enemies in a small area.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.9 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Spider-Man - Agile DPS with crowd control. */
    'Spider-Man': {
        name: 'Web Trap',
        description: 'Immobilizes an enemy, preventing their next action.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior) => {
            target.stunTurns = 2;
            const damage = Math.round(warrior.attack * (0.7 + warrior.level * 0.02));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Doctor Strange - Mystic support with healing utility. */
    'Doctor Strange': {
        name: 'Time Loop',
        description: 'Resets health of one ally to its starting value.',
        manaCost: 40,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const ally = game.warriors.find(w => w.isAlive);
            if (ally) {
                ally.health = ally.maxHealth;
            }
            return 0;
        }
    },
    /* JS: Black Panther - Balanced melee with self-healing. */
    'Black Panther': {
        name: 'Vibranium Slash',
        description: 'Deals damage and absorbs some for self-healing.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.3 + warrior.level * 0.03));
            target.takeDamage(damage);
            warrior.health = Math.min(warrior.maxHealth, warrior.health + Math.round(damage * 0.2));
            return damage;
        }
    },
    /* JS: Scarlet Witch - High-risk mystic AOE. */
    'Scarlet Witch': {
        name: 'Hex Bolt',
        description: 'Randomly reduces an enemy’s attack or health.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.random() < 0.5 ? Math.round(warrior.attack * (1.5 + warrior.level * 0.03)) : 0;
            if (damage) {
                target.takeDamage(damage);
            } else {
                target.attack = Math.round(target.attack * 0.8);
                target.debuffTurns = 2;
            }
            return damage;
        }
    },
    /* JS: Ant-Man - Utility with high single-target damage. */
    'Ant-Man': {
        name: 'Giant Stomp',
        description: 'Deals massive damage to one enemy.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.8 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Wolverine - Tanky brawler with multi-hit attacks. */
    'Wolverine': {
        name: 'Adamantium Frenzy',
        description: 'Attacks multiple times in one turn.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.03));
            target.takeDamage(damage);
            target.takeDamage(damage * 0.6);
            return damage;
        }
    },
    /* JS: Storm - Mystic AOE with crowd control. */
    'Storm': {
        name: 'Tornado Blast',
        description: 'Pushes back all enemies, delaying their actions.',
        manaCost: 35,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.8 + warrior.level * 0.02));
            game.enemies.forEach(e => {
                e.takeDamage(damage);
                e.stunTurns = 1;
            });
            return damage;
        }
    },
    /* JS: Cyclops - Precise ranged AOE DPS. */
    'Cyclops': {
        name: 'Optic Barrage',
        description: 'Hits all enemies with reduced damage.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.8 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Phoenix - Powerful mystic with health-based damage. */
    'Phoenix': {
        name: 'Mind Crush',
        description: 'Deals damage based on target’s remaining health.',
        manaCost: 35,
        cooldown: 4,
        effect: (target, warrior) => {
            const damage = Math.round(target.health * (0.3 + warrior.level * 0.01));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Beast - Tanky support with team buffs. */
    'Beast': {
        name: 'Primal Leap',
        description: 'Attacks and boosts own agility for one turn.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.03));
            target.takeDamage(damage);
            warrior.dodgeChance += 0.15;
            warrior.buffTurns = 2;
            return damage;
        }
    },
    /* JS: Gambit - Risky DPS with high single-target potential. */
    'Gambit': {
        name: 'Ace of Spades',
        description: 'Throws a single card for high damage.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.6 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Rogue - Versatile with health steal. */
    'Rogue': {
        name: 'Power Drain',
        description: 'Steals health from an enemy to heal self.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.0 + warrior.level * 0.03));
            target.takeDamage(damage);
            warrior.health = Math.min(warrior.maxHealth, warrior.health + damage);
            return damage;
        }
    },
    /* JS: Deadpool - Chaotic DPS with random effects. */
    'Deadpool': {
        name: 'Chimichanga Bomb',
        description: 'Explosive attack with random extra effects.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1.4 + warrior.level * 0.03));
            target.takeDamage(damage);
            if (Math.random() < 0.3) {
                game.enemies.forEach(e => e.takeDamage(damage * 0.5));
            }
            return damage;
        }
    },
    /* JS: Venom - Tanky brawler with AOE tendrils. */
    'Venom': {
        name: 'Tendril Assault',
        description: 'Attacks all enemies with symbiote tendrils.',
        manaCost: 35,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.9 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Magneto - Mystic controller with single-target burst. */
    'Magneto': {
        name: 'Metal Storm',
        description: 'Crushes one enemy with magnetic force.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.7 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Doctor Doom - Mystic tank with damage-over-time. */
    'Doctor Doom': {
        name: 'Doom’s Curse',
        description: 'Applies a damage-over-time effect to one enemy.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (0.6 + warrior.level * 0.02));
            target.takeDamage(damage);
            target.debuffTurns = 3;
            return damage;
        }
    },
    /* JS: Thanos - Ultimate tank with instant-kill potential. */
    'Thanos': {
        name: 'Infinity Snap',
        description: 'Instantly defeats a weakened enemy.',
        manaCost: 50,
        cooldown: 5,
        effect: (target, warrior) => {
            if (target.health < target.maxHealth * 0.2) {
                target.health = 0;
                target.isAlive = false;
                return target.maxHealth;
            }
            const damage = Math.round(warrior.attack * (2.0 + warrior.level * 0.05));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Loki - Trickster with defensive utility. */
    'Loki': {
        name: 'Illusionary Double',
        description: 'Creates a decoy to absorb one attack.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            warrior.dodgeChance += 0.2;
            warrior.buffTurns = 2;
            return 0;
        }
    },
    /* JS: Ultron - Tech-based AOE with debuffs. */
    'Ultron': {
        name: 'Data Corruption',
        description: 'Reduces an enemy’s attack permanently.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.1 + warrior.level * 0.03));
            target.takeDamage(damage);
            target.attack = Math.round(target.attack * 0.8);
            target.debuffTurns = 3;
            return damage;
        }
    },
    /* JS: Red Skull - Tactical support with ally buffs. */
    'Red Skull': {
        name: 'Cube Surge',
        description: 'Boosts all allies’ attack for one turn.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.warriors.forEach(w => {
                w.attack = Math.round(w.attack * 1.2);
                w.buffTurns = 2;
            });
            return 0;
        }
    },
    /* JS: Green Goblin - Chaotic AOE with random targets. */
    'Green Goblin': {
        name: 'Pumpkin Barrage',
        description: 'Throws multiple bombs at random enemies.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.8 + warrior.level * 0.02));
            game.enemies.forEach(e => {
                if (Math.random() < 0.6) e.takeDamage(damage);
            });
            return damage;
        }
    },
    /* JS: Kingpin - Tanky brawler with single-target burst. */
    'Kingpin': {
        name: 'Crushing Blow',
        description: 'Deals high damage to one enemy.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.5 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Black Cat - Agile support with critical debuffs. */
    'Black Cat': {
        name: 'Lucky Strike',
        description: 'Guarantees a critical hit on one enemy.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.5 + warrior.level * 0.03) * 2);
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Mysterio - Illusionist with team utility. */
    'Mysterio': {
        name: 'Smoke and Mirrors',
        description: 'Confuses all enemies, reducing accuracy.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.enemies.forEach(e => {
                e.critChance = Math.max(0, e.critChance - 0.1);
                e.debuffTurns = 2;
            });
            return 0;
        }
    },
    /* JS: Rhino - Tanky charger with high single-target damage. */
    'Rhino': {
        name: 'Rhino Rush',
        description: 'Charges through, damaging multiple enemies.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1.0 + warrior.level * 0.03));
            game.enemies.slice(0, 3).forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Sand Man - Tanky with enemy debuffs. */
    'Sand Man': {
        name: 'Sandstorm',
        description: 'Blinds enemies, reducing their attack.',
        manaCost: 25,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.enemies.forEach(e => {
                e.attack = Math.round(e.attack * 0.8);
                e.debuffTurns = 2;
            });
            return 0;
        }
    },
    /* JS: Electro - High-damage AOE with chain attacks. */
    'Electro': {
        name: 'Volt Surge',
        description: 'Chains lightning to hit multiple enemies.',
        manaCost: 35,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.9 + warrior.level * 0.02));
            game.enemies.forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Doctor Octopus - Tactical with multi-target attacks. */
    'Doctor Octopus': {
        name: 'Tentacle Slam',
        description: 'Attacks up to three enemies at once.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (0.9 + warrior.level * 0.03));
            game.enemies.slice(0, 3).forEach(e => e.takeDamage(damage));
            return damage;
        }
    },
    /* JS: Kraven the Hunter - Hunter with crowd control. */
    'Kraven the Hunter': {
        name: 'Hunter’s Trap',
        description: 'Immobilizes one enemy for two turns.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            target.stunTurns = 2;
            const damage = Math.round(warrior.attack * (0.8 + warrior.level * 0.02));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Shocker - Ranged AOE with crowd control. */
    'Shocker': {
        name: 'Vibro-Pulse',
        description: 'Disrupts all enemies, delaying their actions.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior, game) => {
            game.enemies.forEach(e => e.stunTurns = 1);
            return 0;
        }
    },
    /* JS: Scorpion - Aggressive DPS with poison. */
    'Scorpion': {
        name: 'Toxic Tail',
        description: 'Poisons one enemy, dealing damage over time.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (0.6 + warrior.level * 0.02));
            target.takeDamage(damage);
            target.debuffTurns = 3;
            return damage;
        }
    },
    /* JS: Vulture - Mobile DPS with armor-piercing attacks. */
    'Vulture': {
        name: 'Talon Dive',
        description: 'Strikes one enemy, ignoring their defenses.',
        manaCost: 20,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.4 + warrior.level * 0.03));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Hulk - Tanky brawler with AOE and self-buffs. */
    'Hulk': {
        name: 'Gamma Smash',
        description: 'Damages all enemies and boosts own attack.',
        manaCost: 35,
        cooldown: 4,
        effect: (target, warrior, game) => {
            const damage = Math.round(warrior.attack * (1.2 + warrior.level * 0.03));
            game.enemies.forEach(e => e.takeDamage(damage));
            warrior.attack = Math.round(warrior.attack * 1.2);
            warrior.buffTurns = 2;
            return damage;
        }
    },
    /* JS: Bullseye - Precise ranged DPS with high damage. */
    'Bullseye': {
        name: 'Deadly Throw',
        description: 'Targets a single enemy for massive damage.',
        manaCost: 25,
        cooldown: 2,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.6 + warrior.level * 0.04));
            target.takeDamage(damage);
            return damage;
        }
    },
    /* JS: Winter Soldier - Versatile DPS with crowd control. */
    'Winter Soldier': {
        name: 'Bionic Arm Strike',
        description: 'Delivers a powerful blow, stunning the enemy.',
        manaCost: 30,
        cooldown: 3,
        effect: (target, warrior) => {
            const damage = Math.round(warrior.attack * (1.3 + warrior.level * 0.03));
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
    'Black Widow': { health: 90, attack: 18, mana: 45 },
    /* JS: Hawkeye - Precise ranged DPS. */
    'Hawkeye': { health: 95, attack: 20, mana: 40 },
    /* JS: Spider-Man - Agile DPS. */
    'Spider-Man': { health: 100, attack: 18, mana: 45 },
    /* JS: Doctor Strange - Mystic support. */
    'Doctor Strange': { health: 80, attack: 15, mana: 60 },
    /* JS: Black Panther - Balanced melee DPS. */
    'Black Panther': { health: 110, attack: 20, mana: 45 },
    /* JS: Scarlet Witch - High-risk mystic. */
    'Scarlet Witch': { health: 85, attack: 22, mana: 55 },
    /* JS: Ant-Man - Agile utility. */
    'Ant-Man': { health: 95, attack: 17, mana: 45 },
    /* JS: Wolverine - Durable brawler. */
    'Wolverine': { health: 140, attack: 20, mana: 35 },
    /* JS: Storm - Mystic AOE. */
    'Storm': { health: 100, attack: 18, mana: 50 },
    /* JS: Cyclops - Ranged DPS. */
    'Cyclops': { health: 95, attack: 20, mana: 45 },
    /* JS: Phoenix - Powerful mystic. */
    'Phoenix': { health: 90, attack: 22, mana: 55 },
    /* JS: Beast - Tanky support. */
    'Beast': { health: 120, attack: 18, mana: 40 },
    /* JS: Gambit - Risky DPS. */
    'Gambit': { health: 100, attack: 20, mana: 45 },
    /* JS: Rogue - Versatile absorber. */
    'Rogue': { health: 110, attack: 18, mana: 40 },
    /* JS: Deadpool - Chaotic healer. */
    'Deadpool': { health: 120, attack: 20, mana: 40 },
    /* JS: Venom - Tanky melee. */
    'Venom': { health: 140, attack: 22, mana: 35 },
    /* JS: Magneto - Mystic controller. */
    'Magneto': { health: 110, attack: 20, mana: 50 },
    /* JS: Doctor Doom - Tanky mystic. */
    'Doctor Doom': { health: 120, attack: 18, mana: 50 },
    /* JS: Thanos - Ultimate tank. */
    'Thanos': { health: 200, attack: 30, mana: 50 },
    /* JS: Loki - Trickster support. */
    'Loki': { health: 90, attack: 18, mana: 50 },
    /* JS: Ultron - Tech-based AOE. */
    'Ultron': { health: 130, attack: 20, mana: 45 },
    /* JS: Red Skull - Tactical debuffer. */
    'Red Skull': { health: 100, attack: 18, mana: 40 },
    /* JS: Green Goblin - Chaotic DPS. */
    'Green Goblin': { health: 95, attack: 20, mana: 40 },
    /* JS: Kingpin - Tanky enforcer. */
    'Kingpin': { health: 150, attack: 20, mana: 35 },
    /* JS: Black Cat - Agile support. */
    'Black Cat': { health: 85, attack: 18, mana: 45 },
    /* JS: Mysterio - Illusionist support. */
    'Mysterio': { health: 90, attack: 15, mana: 50 },
    /* JS: Rhino - Tanky charger. */
    'Rhino': { health: 160, attack: 22, mana: 30 },
    /* JS: Sand Man - Tanky mitigator. */
    'Sand Man': { health: 140, attack: 18, mana: 35 },
    /* JS: Electro - High-damage AOE. */
    'Electro': { health: 95, attack: 22, mana: 45 },
    /* JS: Doctor Octopus - Tactical multi-target. */
    'Doctor Octopus': { health: 110, attack: 20, mana: 40 },
    /* JS: Kraven the Hunter - Hunter DPS. */
    'Kraven the Hunter': { health: 105, attack: 20, mana: 40 },
    /* JS: Shocker - Ranged crowd control. */
    'Shocker': { health: 100, attack: 18, mana: 40 },
    /* JS: Scorpion - Poison DPS. */
    'Scorpion': { health: 110, attack: 20, mana: 35 },
    /* JS: Vulture - Mobile DPS. */
    'Vulture': { health: 95, attack: 18, mana: 40 },
    /* JS: Hulk - Tanky brawler with high health. */
    'Hulk': { health: 180, attack: 25, mana: 35 },
    /* JS: Bullseye - Precise ranged DPS. */
    'Bullseye': { health: 90, attack: 22, mana: 40 },
    /* JS: Winter Soldier - Versatile DPS. */
    'Winter Soldier': { health: 110, attack: 20, mana: 40 }
};