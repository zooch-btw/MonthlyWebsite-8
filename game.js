/* JS: Core logic for Galaxy BattleForge, a Marvel turn-based game. Manages heroes, enemies, game modes, UI, and achievements. */

/* JS: Maps hero names to image paths for UI display. */
const warriorImageMap = {
    'Iron Man': 'imgs/iron_man.png',
    'Captain America': 'imgs/captain_america.png',
    'Thor': 'imgs/thor.png',
    'Black Widow': 'imgs/black_widow.png',
    'Hawkeye': 'imgs/hawkeye.png',
    'Spider-Man': 'imgs/spiderman.png',
    'Doctor Strange': 'imgs/doctor_strange.png',
    'Black Panther': 'imgs/black_panther.png',
    'Scarlet Witch': 'imgs/scarlet_witch.png',
    'Ant-Man': 'imgs/antman.png',
    'Wolverine': 'imgs/wolverine.png',
    'Storm': 'imgs/storm.png',
    'Cyclops': 'imgs/cyclops.png',
    'Jean Grey': 'imgs/jean_grey.png',
    'Beast': 'imgs/beast.png',
    'Gambit': 'imgs/gambit.png',
    'Rogue': 'imgs/rogue.png',
    'Deadpool': 'imgs/deadpool.png',
    'Venom': 'imgs/venom.png',
    'Magneto': 'imgs/magneto.png',
    'Doctor Doom': 'imgs/doctor_doom.png',
    'Thanos': 'imgs/thanos.png',
    'Loki': 'imgs/loki.png',
    'Ultron': 'imgs/ultron.png',
    'Red Skull': 'imgs/red_skull.png',
    'Green Goblin': 'imgs/green_goblin.png',
    'Kingpin': 'imgs/kingpin.png',
    'Black Cat': 'imgs/black_cat.png',
    'Mysterio': 'imgs/mysterio.png',
    'Rhino': 'imgs/rhino.png',
    'Sandman': 'imgs/sandman.png',
    'Electro': 'imgs/electro.png',
    'Doctor Octopus': 'imgs/doctor_octopus.png',
    'Kraven': 'imgs/kraven.png',
    'Shocker': 'imgs/shocker.png',
    'Scorpion': 'imgs/scorpion.png',
    'Vulture': 'imgs/vulture.png'
};

/* JS: Maps enemy names to image paths for UI display. */
const enemyImageMap = {
  'Overlord Zarkon': 'imgs/overlord_zarkon.png',
  'Void Drone': 'imgs/void_drone.png',
  'Abyssal Stalker': 'imgs/abyssal_stalker.png',
  'Wave Invader': 'imgs/wave_invader.png'
};

/* Balanced special abilities for warriors */
const specialAbilities = {
  'Tony Stark': {
    name: 'Repulsor Barrage', description: 'Fires a focused energy blast.', manaCost: 30, cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.5);
      target.takeDamage(damage);
      return damage;
    }
  },
  'Steve Rogers': {
    name: 'Shield Bash', description: 'Stuns an enemy for one turn.', manaCost: 25, cooldown: 3,
    effect: (target, warrior) => {
      const damage = warrior.attack;
      target.takeDamage(damage);
      target.stunTurns = 1;
      return damage;
    }
  },
  'Thor Odinson': {
    name: 'Thunder Strike', description: 'Deals heavy lightning damage.', manaCost: 35, cooldown: 3,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.8);
      target.takeDamage(damage);
      return damage;
    }
  },
  'Natasha Romanoff': {
    name: 'Stealth Strike', description: 'High critical chance attack.', manaCost: 20, cooldown: 2,
    effect: (target, warrior) => {
      const crit = Math.random() < 0.5;
      const damage = Math.round(warrior.attack * (crit ? 2 : 1));
      target.takeDamage(damage);
      return damage;
    }
  },
  'Clint Barton': {
    name: 'Explosive Arrow', description: 'Damages all enemies.', manaCost: 30, cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.8);
      game.enemies.filter(e => e.isAlive).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  // ... (similarly balanced abilities for all 37 warriors, abbreviated for brevity)
  'Adrian Toomes': {
    name: 'Talon Dive', description: 'Strikes with high damage.', manaCost: 25, cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.5);
      target.takeDamage(damage);
      return damage;
    }
  }
};

/* JS: Warrior class representing a playable hero. */
class Warrior {
    /* JS: Initialize warrior with stats and abilities.
     * @param {string} name - Hero name (e.g., 'Iron Man').
     * @param {number} health - Base health points.
     * @param {number} attack - Base attack damage.
     * @param {number} mana - Base mana points.
     * @param {object} specialAbility - Special ability object from warriorAbilitiesAndStats.js.
     * @param {string} image - Path to hero image.
     */
    constructor(name, health, attack, mana, specialAbility, image) {
        this.name = name || 'Unknown';
        this.health = health || 100;
        this.maxHealth = health || 100;
        this.attack = attack || 10;
        this.baseAttack = attack || 10;
        this.mana = mana || 50;
        this.maxMana = mana || 50;
        this.specialAbility = specialAbility || { name: 'None', manaCost: 0, cooldown: 0, effect: () => 0 };
        this.image = image || '';
        this.isAlive = true;
        this.cooldown = 0;
        this.stunTurns = 0;
        this.buffTurns = 0;
        this.debuffTurns = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.critChance = 0.1;
        this.dodgeChance = 0.05;
        this.shield = 1;
        this.passive = this.getPassive();
    }

    /* JS: Assign passive abilities based on hero name.
     * @returns {object|null} Passive ability object or null.
     */
    getPassive() {
        if (this.name === 'Iron Man') {
            return { name: 'Arc Reactor', effect: () => { if (Math.random() < 0.1) this.mana = Math.min(this.maxMana, this.mana + 10); } };
        }
        if (this.name === 'Wolverine') {
            return { name: 'Regeneration', effect: () => { this.health = Math.min(this.maxHealth, this.health + 5); } };
        }
        return null;
    }

    /* JS: Perform basic attack on a target.
     * @param {Enemy} target - Enemy to attack.
     * @returns {number} Damage dealt.
     */
    attackTarget(target) {
        if (!this.isAlive || this.stunTurns > 0) return 0;
        const crit = Math.random() < this.critChance;
        const damage = Math.round(this.attack * (crit ? 2 : 1) * (0.8 + Math.random() * 0.4));
        target.takeDamage(damage);
        this.gainXP(15);
        this.logAction(`${this.name} attacks ${target.name} for ${damage} damage${crit ? ' (Critical Hit!)' : ''}!`);
        soundEffects.attack.play().catch(() => {});
        if (this.passive) this.passive.effect();
        window.Game.processEnemyTurn(); // Trigger enemy turn
        window.Game.checkWaveStatus(); // Check if wave is complete
        return damage;
    }

    /* JS: Use special ability on a target.
     * @param {Enemy} target - Enemy to target.
     * @param {object} game - Game manager instance.
     * @returns {number|boolean} Damage dealt or false if unusable.
     */
    useSpecial(target, game) {
        if (!this.isAlive || this.mana < this.specialAbility.manaCost || this.cooldown > 0 || this.stunTurns > 0) return false;
        const damage = this.specialAbility.effect(target, this, game);
        this.mana -= this.specialAbility.manaCost;
        this.cooldown = this.specialAbility.cooldown;
        this.gainXP(30);
        this.logAction(`${this.name} unleashes ${this.specialAbility.name} for ${damage} damage!`);
        soundEffects.special.play().catch(() => {});
        game.achievements.useSpecials.count++;
        game.checkAchievements();
        if (this.passive) this.passive.effect();
        game.processEnemyTurn(); // Trigger enemy turn
        game.checkWaveStatus(); // Check if wave is complete
        return damage;
    }

    /* JS: Take damage from an attack.
     * @param {number} damage - Raw damage value.
     * @returns {number} Mitigated damage dealt.
     */
    takeDamage(damage) {
        if (Math.random() < this.dodgeChance) {
            this.logAction(`${this.name} dodges the attack!`);
            return 0;
        }
        const mitigatedDamage = Math.round(damage * this.shield);
        this.health = Math.max(0, this.health - mitigatedDamage);
        if (this.health === 0) {
            this.isAlive = false;
            this.logAction(`${this.name} has been defeated!`);
            window.Game.checkGameOver();
        }
        return mitigatedDamage;
    }

    /* JS: Regenerate mana and update status effects each turn. */
    regenerateMana() {
        this.mana = Math.min(this.maxMana, this.mana + 10 + this.level);
        if (this.cooldown > 0) this.cooldown--;
        if (this.stunTurns > 0) this.stunTurns--;
        if (this.buffTurns > 0) {
            this.buffTurns--;
            if (this.buffTurns === 0) {
                this.attack = this.baseAttack;
                this.critChance = 0.1;
                this.dodgeChance = 0.05;
                this.shield = 1;
            }
        }
        if (this.debuffTurns > 0) {
            this.debuffTurns--;
            if (this.debuffTurns === 0) this.attack = this.baseAttack;
        }
        if (this.passive) this.passive.effect();
    }

    /* JS: Gain experience points.
     * @param {number} amount - XP to gain.
     */
    gainXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNextLevel && this.level < 20) {
            this.levelUp();
        }
    }

    /* JS: Level up the warrior, increasing stats. */
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.round(this.xpToNextLevel * 1.4);
        this.maxHealth += 15;
        this.health = Math.min(this.health + 30, this.maxHealth);
        this.baseAttack += 3;
        this.attack = this.baseAttack;
        this.maxMana += 5;
        this.mana = Math.min(this.mana + 15, this.maxMana);
        this.critChance += 0.02;
        this.logAction(`${this.name} leveled up to Level ${this.level}!`);
        soundEffects.levelUp.play().catch(() => {});
        window.Game.achievements.levelUp5.count++;
        window.Game.achievements.levelUp20.count++;
        if (this.level === 20) window.Game.achievements.maxLevel.count++;
        window.Game.checkAchievements();
    }

    /* JS: Log action to battle log UI.
     * @param {string} message - Message to display.
     */
    logAction(message) {
        const log = document.getElementById('gameLog');
        if (log) {
            const entry = document.createElement('p');
            entry.textContent = message;
            entry.className = 'animate__animated animate__fadeIn';
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }
    }
}

/* JS: Enemy class representing a non-playable opponent. */
class Enemy {
    /* JS: Initialize enemy with stats and abilities.
     * @param {string} name - Enemy name (e.g., 'Void Drone').
     * @param {number} health - Base health points.
     * @param {number} attack - Base attack damage.
     * @param {string} image - Path to enemy image.
     * @param {object|null} specialAbility - Special ability object or null.
     */
    constructor(name, health, attack, image, specialAbility = null) {
        this.name = name || 'Unknown';
        this.health = health || 50;
        this.maxHealth = health || 50;
        this.attack = attack || 10;
        this.baseAttack = attack || 10;
        this.image = image || '';
        this.specialAbility = specialAbility;
        this.isAlive = true;
        this.stunTurns = 0;
        this.debuffTurns = 0;
        this.cooldown = 0;
        this.critChance = 0.1;
        this.dodgeChance = 0.05;
        this.shield = 1;
    }

    /* JS: Perform basic attack on a target.
     * @param {Warrior} target - Warrior to attack.
     * @returns {number} Damage dealt.
     */
    attackTarget(target) {
        if (!this.isAlive || this.stunTurns > 0) return 0;
        const crit = Math.random() < this.critChance;
        const damage = Math.round(this.attack * (crit ? 2 : 1) * (0.8 + Math.random() * 0.4));
        const mitigatedDamage = target.takeDamage(damage);
        this.logAction(`${this.name} attacks ${target.name} for ${mitigatedDamage} damage${crit ? ' (Critical Hit!)' : ''}!`);
        soundEffects.attack.play().catch(() => {});
        return mitigatedDamage;
    }

    /* JS: Use special ability on a target.
     * @param {Warrior} target - Warrior to target.
     * @param {object} game - Game manager instance.
     * @returns {number|boolean} Damage dealt or false if unusable.
     */
    useSpecial(target, game) {
        if (!this.specialAbility || this.cooldown > 0 || this.stunTurns > 0) return false;
        const damage = this.specialAbility.effect(target, this, game);
        this.cooldown = this.specialAbility.cooldown;
        this.logAction(`${this.name} unleashes ${this.specialAbility.name} for ${damage} damage!`);
        soundEffects.special.play().catch(() => {});
        return damage;
    }

    /* JS: Take damage from an attack.
     * @param {number} damage - Raw damage value.
     * @returns {number} Mitigated damage dealt.
     */
    takeDamage(damage) {
        if (Math.random() < this.dodgeChance) {
            this.logAction(`${this.name} dodges the attack!`);
            return 0;
        }
        const mitigatedDamage = Math.round(damage * this.shield);
        this.health = Math.max(0, this.health - mitigatedDamage);
        if (this.health === 0) {
            this.isAlive = false;
            this.logAction(`${this.name} has been defeated!`);
            window.Game.addScore(50);
            window.Game.achievements.defeatEnemies10.count++;
            window.Game.achievements.defeatEnemies50.count++;
            window.Game.checkAchievements();
            window.Game.checkWaveStatus();
        }
        return mitigatedDamage;
    }

    /* JS: Update status effects each turn. */
    updateStatus() {
        if (this.stunTurns > 0) this.stunTurns--;
        if (this.debuffTurns > 0) {
            this.debuffTurns--;
            if (this.debuffTurns === 0) {
                this.attack = this.baseAttack;
                this.critChance = 0.1;
                this.dodgeChance = 0.05;
                this.shield = 1;
            }
        }
        if (this.cooldown > 0) this.cooldown--;
    }

    /* JS: Log action to battle log UI.
     * @param {string} message - Message to display.
     */
    logAction(message) {
        const log = document.getElementById('gameLog');
        if (log) {
            const entry = document.createElement('p');
            entry.textContent = message;
            entry.className = 'animate__animated animate__fadeIn';
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }
    }
}

/* JS: Game manager handling game state and logic (exposed globally). */
window.Game = {
    /* JS: Game state properties. */
    wave: 1, // Current wave number
    score: 0, // Player score
    warriors: [], // Array of Warrior instances
    enemies: [], // Array of Enemy instances
    gameMode: 'infinite', // Game mode: 'infinite', 'final', or 'mirror'
    isGameOver: false, // Game over state
    selectedEnemyIndex: 0, // Index of currently targeted enemy

    /* JS: Achievements tracking player progress. */
    achievements: {
        defeatEnemies10: {
            count: 0,
            goal: 10,
            name: 'Enemy Slayer',
            description: 'Defeat 10 enemies',
            reward: '50 XP',
            unlocked: false
        },
        defeatEnemies50: {
            count: 0,
            goal: 50,
            name: 'Cosmic Conqueror',
            description: 'Defeat 50 enemies',
            reward: 'Health Surge',
            unlocked: false
        },
        highScore1000: {
            count: 0,
            goal: 1000,
            name: 'High Roller',
            description: 'Reach 1000 points',
            reward: '100 points',
            unlocked: false
        },
        highScore5000: {
            count: 0,
            goal: 5000,
            name: 'Legendary Score',
            description: 'Reach 5000 points',
            reward: 'Mana Surge',
            unlocked: false
        },
        levelUp5: {
            count: 0,
            goal: 5,
            name: 'Hero Ascendant',
            description: 'Level up 5 times',
            reward: 'Attack Overdrive',
            unlocked: false
        },
        levelUp20: {
            count: 0,
            goal: 20,
            name: 'God of Heroes',
            description: 'Level up 20 times',
            reward: 'Shield Aura',
            unlocked: false
        },
        finalBoss: {
            count: 0,
            goal: 1,
            name: 'Boss Conqueror',
            description: 'Defeat Final Boss',
            reward: 'Revive',
            unlocked: false
        },
        mirrorWin: {
            count: 0,
            goal: 1,
            name: 'Mirror Master',
            description: 'Win Mirror Mode',
            reward: 'Critical Boost',
            unlocked: false
        },
        useSpecials: {
            count: 0,
            goal: 25,
            name: 'Specialist',
            description: 'Use 25 specials',
            reward: 'Mana reduction',
            unlocked: false
        },
        surviveWaves: {
            count: 0,
            goal: 10,
            name: 'Wave Survivor',
            description: 'Survive 10 waves',
            reward: 'XP multiplier',
            unlocked: false
        },
        teamSynergy: {
            count: 0,
            goal: 1,
            name: 'Team Player',
            description: 'Use synergistic heroes',
            reward: 'Team Heal',
            unlocked: false
        },
        perfectWave: {
            count: 0,
            goal: 1,
            name: 'Flawless Victory',
            description: 'Clear wave without damage',
            reward: 'Shield',
            unlocked: false
        },
        quickWin: {
            count: 0,
            goal: 5,
            name: 'Speed Demon',
            description: 'Clear 5 waves fast',
            reward: 'Speed Boost',
            unlocked: false
        },
        maxLevel: {
            count: 0,
            goal: 1,
            name: 'Ultimate Hero',
            description: 'Reach level 20',
            reward: 'Legendary Power-Up',
            unlocked: false
        },
        powerUpCombo: {
            count: 0,
            goal: 3,
            name: 'Combo Master',
            description: 'Use 3 power-ups',
            reward: 'Combo Power-Up',
            unlocked: false
        }
    },

    /* JS: Set game mode and initialize game.
     * @param {string} mode - Game mode ('infinite', 'final', 'mirror').
     */
    setGameMode(mode) {
        try {
            this.gameMode = ['infinite', 'final', 'mirror'].includes(mode) ? mode : 'infinite';
            localStorage.setItem('gameMode', this.gameMode);
            const modal = document.getElementById('gameModeModal');
            if (modal) bootstrap.Modal.getInstance(modal)?.hide();
            this.init();
        } catch (e) {
            console.error('Error setting game mode:', e);
            this.showError('Failed to set game mode. Defaulting to Infinite.');
            this.gameMode = 'infinite';
            this.init();
        }
    },

    /* JS: Initialize game state and UI. */
    init() {
        try {
            this.gameMode = localStorage.getItem('gameMode') || 'infinite';
            this.loadWarriors();
            this.bindEvents();
            this.startWave();
            this.updateUI();
            this.log('Galaxy BattleForge: Assemble your heroes!');
            soundEffects.background.play().catch(() => {});
            soundEffects.background.loop = true;
        } catch (e) {
            console.error('Error initializing game:', e);
            this.showError('Failed to initialize game. Please reload.');
            this.log('Error starting game. Default team deployed.');
            this.warriors = [new Warrior('Iron Man', 100, 20, 50, specialAbilities['Iron Man'], warriorImageMap['Iron Man'])];
            this.startWave();
        }
    },

    /* JS: Bind event listeners to control buttons. */
    bindEvents() {
        try {
            const buttons = [
                { id: 'saveGameBtn', handler: () => this.saveGame() },
                { id: 'restartGameBtn', handler: () => this.restartGame() },
                { id: 'themeToggle', handler: () => this.toggleTheme() },
                { id: 'achievementsBtn', handler: () => this.showAchievements() }
            ];
            buttons.forEach(({ id, handler }) => {
                const btn = document.getElementById(id);
                if (btn) btn.addEventListener('click', handler);
            });
        } catch (e) {
            console.error('Error binding events:', e);
            this.showError('Failed to bind controls.');
        }
    },

    /* JS: Load selected warriors from localStorage. */
    loadWarriors() {
        try {
            let selectedWarriors = JSON.parse(localStorage.getItem('selectedWarriors') || '[]');
            if (!Array.isArray(selectedWarriors) || selectedWarriors.length === 0) {
                selectedWarriors = ['Iron Man'];
                this.log('No warriors selected. Defaulting to Iron Man.');
            }
            this.warriors = selectedWarriors.map(name => {
                if (!warriorBaseStats[name] || !specialAbilities[name] || !warriorImageMap[name]) {
                    this.log(`Invalid warrior: ${name}. Using default.`);
                    return new Warrior('Iron Man', 100, 20, 50, specialAbilities['Iron Man'], warriorImageMap['Iron Man']);
                }
                return new Warrior(
                    name,
                    warriorBaseStats[name].health,
                    warriorBaseStats[name].attack,
                    warriorBaseStats[name].mana,
                    specialAbilities[name],
                    warriorImageMap[name]
                );
            });
            if (new Set(this.warriors.map(w => w.name)).size >= 2) {
                this.achievements.teamSynergy.count++;
                this.checkAchievements();
            }
        } catch (e) {
            console.error('Error loading warriors:', e);
            this.warriors = [new Warrior('Iron Man', 100, 20, 50, specialAbilities['Iron Man'], warriorImageMap['Iron Man'])];
            this.showError('Error loading team. Using default warrior.');
        }
    },

    /* JS: Start a new wave with enemies. */
    startWave() {
        try {
            this.enemies = this.generateEnemies();
            const waveTransition = document.getElementById('waveTransition');
            if (waveTransition) {
                waveTransition.textContent = `Wave ${this.wave}`;
                waveTransition.style.display = 'flex';
                setTimeout(() => waveTransition.style.display = 'none', 2000);
            }
            this.updateUI();
            this.log(`Wave ${this.wave} begins!`);
        } catch (e) {
            console.error('Error starting wave:', e);
            this.showError('Failed to start wave.');
        }
    },

    /* JS: Generate enemies based on game mode.
     * @returns {Enemy[]} Array of Enemy instances.
     */
    generateEnemies() {
        try {
            const enemies = [];
            const waveScaling = Math.min(this.wave * 0.1, 3);
            if (this.gameMode === 'final') {
                enemies.push(new Enemy(
                    'Overlord Zarkon',
                    500 + this.wave * 50,
                    40 + this.wave * 5,
                    enemyImageMap['Overlord Zarkon'],
                    {
                        name: 'Cosmic Blast',
                        manaCost: 0,
                        cooldown: 2,
                        effect: (target, enemy) => {
                            const damage = Math.round(enemy.attack * 2);
                            target.takeDamage(damage);
                            return damage;
                        }
                    }
                ));
            } else if (this.gameMode === 'mirror') {
                this.warriors.forEach((w, i) => {
                    enemies.push(new Enemy(
                        `Mirror ${w.name} #${i + 1}`,
                        w.maxHealth * 1.2,
                        w.attack * 1.1,
                        w.image,
                        w.specialAbility
                    ));
                });
            } else {
                const count = Math.min(5, 1 + Math.floor(this.wave / 2));
                const enemyTypes = ['Void Drone', 'Abyssal Stalker', 'Wave Invader', 'Cosmic Tyrant', 'Nebula Wraith'];
                for (let i = 0; i < count; i++) {
                    const name = enemyTypes[i % enemyTypes.length];
                    const health = Math.round((80 + this.wave * 15) * waveScaling);
                    const attack = Math.round((15 + this.wave * 4) * waveScaling);
                    enemies.push(new Enemy(
                        `${name} #${i + 1}`,
                        health,
                        attack,
                        enemyImageMap[name],
                        {
                            name: 'Dark Pulse',
                            manaCost: 0,
                            cooldown: 3,
                            effect: (target, enemy) => {
                                const damage = Math.round(enemy.attack * (1.2 + this.wave * 0.05));
                                target.takeDamage(damage);
                                return damage;
                            }
                        }
                    ));
                }
            }
            return enemies;
        } catch (e) {
            console.error('Error generating enemies:', e);
            this.showError('Failed to generate enemies.');
            return [new Enemy('Void Drone', 80, 15, enemyImageMap['Void Drone'])];
        }
    },

    /* JS: Advance to the next wave. */
    startNextWave() {
        try {
            this.wave++;
            this.warriors.forEach(w => w.regenerateMana());
            this.achievements.surviveWaves.count = this.wave;
            this.achievements.quickWin.count += (this.wave % 2 === 0) ? 1 : 0; // Fast wave clear simulation
            this.checkAchievements();
            this.showPowerupSelection();
        } catch (e) {
            console.error('Error starting next wave:', e);
            this.showError('Failed to advance wave.');
        }
    },

    /* JS: Show power-up selection modal. */
    showPowerupSelection() {
        try {
            const powerUps = [
                { name: 'Health Surge', description: 'Restores 50 health', effect: w => w.health = Math.min(w.maxHealth, w.health + 50) },
                { name: 'Attack Overdrive', description: 'Boosts attack', effect: w => { w.attack += 10; w.buffTurns = 3; } },
                { name: 'Mana Surge', description: 'Restores mana', effect: w => w.mana = w.maxMana },
                { name: 'Critical Boost', description: 'Increases crit chance', effect: w => { w.critChance += 0.2; w.buffTurns = 3; } },
                { name: 'Shield Aura', description: 'Reduces damage', effect: w => { w.shield = 0.8; w.buffTurns = 3; } },
                { name: 'Revive', description: 'Revives warrior', effect: w => { if (!w.isAlive) { w.isAlive = true; w.health = w.maxHealth * 0.5; } } },
                { name: 'Team Heal', description: 'Heals all', effect: w => w.health = Math.min(w.maxHealth, w.health + 30) },
                { name: 'Enemy Debuff', effect: (w, enemies) => enemies.forEach(e => { e.debuffTurns = 3; e.attack *= 0.8; }) },
                { name: 'Legendary Combo', description: 'Health + Shield', effect: w => { w.health += 50; w.shield = 0.7; w.buffTurns = 5; } }
            ];
            const choices = document.getElementById('powerupChoices');
            if (!choices) throw new Error('Power-up choices element missing.');
            choices.innerHTML = '';
            const selectedPowerUps = powerUps.sort(() => Math.random() - 0.5).slice(0, 3);
            selectedPowerUps.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-marvel mb-2 w-100';
                btn.textContent = p.name;
                btn.title = p.description || '';
                btn.onclick = () => {
                    this.applyPowerup(p.effect);
                    const modal = document.getElementById('powerupModal');
                    if (modal) bootstrap.Modal.getInstance(modal)?.hide();
                    this.achievements.powerUpCombo.count++;
                    this.checkAchievements();
                    this.startWave();
                };
                choices.appendChild(btn);
            });
            const modal = document.getElementById('powerupModal');
            if (modal) new bootstrap.Modal(modal).show();
        } catch (e) {
            console.error('Error showing power-up selection:', e);
            this.showError('Failed to show power-ups.');
            this.startWave();
        }
    },

    /* JS: Apply selected power-up to warriors or enemies.
     * @param {function} effect - Power-up effect function.
     */
    applyPowerup(effect) {
        try {
            this.warriors.forEach(w => effect(w, this.enemies));
            this.log('Power-up applied!');
        } catch (e) {
            console.error('Error applying power-up:', e);
            this.showError('Failed to apply power-up.');
        }
    },

    /* JS: Add points to the score.
     * @param {number} amount - Points to add.
     */
    addScore(amount) {
        try {
            this.score += amount;
            this.achievements.highScore1000.count = this.score;
            this.achievements.highScore5000.count = this.score;
            this.checkAchievements();
        } catch (e) {
            console.error('Error adding score:', e);
            this.showError('Failed to update score.');
        }
    },

    /* JS: Check and unlock achievements. */
    checkAchievements() {
        try {
            for (const [key, stat] of Object.entries(this.achievements)) {
                if (stat.count >= stat.goal && !stat.unlocked) {
                    stat.unlocked = true;
                    this.showAchievement(stat);
                    this.applyReward(stat);
                }
            }
            const count = document.getElementById('achievementCount');
            if (count) count.textContent = Object.values(this.achievements).filter(a => a.unlocked).length;
        } catch (e) {
            console.error('Error checking achievements:', e);
            this.showError('Failed to check achievements.');
        }
    },

    /* JS: Apply achievement rewards.
     * @param {object} achievement - Achievement object.
     */
    applyReward(achievement) {
        try {
            switch (achievement.name) {
                case 'Enemy Slayer':
                    this.warriors.forEach(w => w.gainXP(50));
                    break;
                case 'Cosmic Conqueror':
                    this.warriors.forEach(w => w.health = Math.min(w.maxHealth, w.health + 50));
                    break;
                case 'High Roller':
                    this.addScore(100);
                    break;
                case 'Legendary Score':
                    this.warriors.forEach(w => w.mana = w.maxMana);
                    break;
                case 'Hero Ascendant':
                    this.warriors.forEach(w => { w.attack += 5; w.buffTurns = 3; });
                    break;
                case 'God of Heroes':
                    this.warriors.forEach(w => { w.shield = 0.8; w.buffTurns = 3; });
                    break;
                case 'Boss Conqueror':
                    this.warriors.forEach(w => { if (!w.isAlive) { w.isAlive = true; w.health = w.maxHealth * 0.5; } });
                    break;
                case 'Mirror Master':
                    this.warriors.forEach(w => { w.critChance += 0.1; w.buffTurns = 3; });
                    break;
                case 'Specialist':
                    this.warriors.forEach(w => w.specialAbility.manaCost = Math.max(10, w.specialAbility.manaCost - 5));
                    break;
                case 'Wave Survivor':
                    this.warriors.forEach(w => w.gainXP(100));
                    break;
                case 'Team Player':
                    this.warriors.forEach(w => w.health = Math.min(w.maxHealth, w.health + 30));
                    break;
                case 'Flawless Victory':
                    this.warriors.forEach(w => { w.shield = 0.7; w.buffTurns = 2; });
                    break;
                case 'Speed Demon':
                    this.warriors.forEach(w => { w.critChance += 0.05; w.buffTurns = 2; });
                    break;
                case 'Ultimate Hero':
                    this.warriors.forEach(w => { w.attack += 10; w.health += 20; w.buffTurns = 5; });
                    break;
                case 'Combo Master':
                    this.warriors.forEach(w => { w.health += 30; w.attack += 5; w.buffTurns = 3; });
                    break;
            }
            soundEffects.achievement.play().catch(() => {});
        } catch (e) {
            console.error('Error applying reward:', e);
            this.showError('Failed to apply achievement reward.');
        }
    },

    /* JS: Show achievement toast notification.
     * @param {object} achievement - Achievement object.
     */
    showAchievement(achievement) {
        try {
            const toast = document.createElement('div');
            toast.className = 'achievement-toast';
            toast.textContent = `Achievement Unlocked: ${achievement.name}!`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
        } catch (e) {
            console.error('Error showing achievement:', e);
        }
    },

    /* JS: Save game state to localStorage. */
    saveGame() {
        try {
            const saveData = {
                wave: this.wave,
                score: this.score,
                warriors: this.warriors.map(w => ({
                    name: w.name,
                    health: w.health,
                    level: w.level,
                    xp: w.xp
                })),
                gameMode: this.gameMode,
                achievements: this.achievements
            };
            localStorage.setItem('gameSave', JSON.stringify(saveData));
            this.log('Game saved successfully!');
        } catch (e) {
            console.error('Error saving game:', e);
            this.showError('Failed to save game.');
        }
    },

    /* JS: Restart the game, resetting state. */
    restartGame() {
        try {
            this.wave = 1;
            this.score = 0;
            this.enemies = [];
            this.isGameOver = false;
            this.loadWarriors();
            this.startWave();
            localStorage.removeItem('gameMode');
            window.location.reload();
        } catch (e) {
            console.error('Error restarting game:', e);
            this.showError('Failed to restart game.');
        }
    },

    /* JS: Toggle between light and dark themes. */
    toggleTheme() {
        try {
            document.body.classList.toggle('light-theme');
            const themeBtn = document.getElementById('themeToggle');
            if (themeBtn) themeBtn.textContent = document.body.classList.contains('light-theme') ? 'Theme: Light' : 'Theme: Dark';
        } catch (e) {
            console.error('Error toggling theme:', e);
            this.showError('Failed to toggle theme.');
        }
    },

    /* JS: Show achievements modal with progress. */
    showAchievements() {
        try {
            const list = document.getElementById('achievementList');
            if (!list) throw new Error('Achievement list element missing.');
            list.innerHTML = '';
            for (const stat of Object.values(this.achievements)) {
                const item = document.createElement('div');
                item.textContent = `${stat.name}: ${stat.description} (${stat.unlocked ? 'Unlocked' : `${stat.count}/${stat.goal}`})`;
                list.appendChild(item);
            }
            const modal = document.getElementById('achievementsModal');
            if (modal) new bootstrap.Modal(modal).show();
        } catch (e) {
            console.error('Error showing achievements:', e);
            this.showError('Failed to show achievements.');
        }
    },

    /* JS: Update game UI with current state. */
    updateUI() {
        try {
            const playerGrid = document.getElementById('playerHeroesGrid');
            const enemyGrid = document.getElementById('enemyGrid');
            if (!playerGrid || !enemyGrid) throw new Error('Grid elements missing.');

            playerGrid.innerHTML = '';
            this.warriors.forEach((w, i) => {
                const card = document.createElement('div');
                card.className = `character-card ${w.level >= 5 ? 'level-5' : ''} ${w.level >= 10 ? 'level-10' : ''} ${w.level >= 20 ? 'level-20' : ''}`;
                card.innerHTML = `
                    <img class="character-img" src="${w.image || ''}" alt="${w.name}">
                    <div class="status-bars">
                        <div>HP: ${w.health}/${w.maxHealth}</div>
                        <div class="progress"><div class="progress-bar progress-bar-health" style="width: ${w.health / w.maxHealth * 100}%"></div></div>
                        <div>Mana: ${w.mana}/${w.maxMana}</div>
                        <div class="progress"><div class="progress-bar progress-bar-mana" style="width: ${w.mana / w.maxMana * 100}%"></div></div>
                        <div>XP: ${w.xp}/${w.xpToNextLevel}</div>
                        <div class="progress"><div class="progress-bar progress-bar-xp" style="width: ${w.xp / w.xpToNextLevel * 100}%"></div></div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-action" onclick="window.Game.warriors[${i}].attackTarget(window.Game.enemies[window.Game.selectedEnemyIndex] || window.Game.enemies[0])" ${!w.isAlive || this.isGameOver || !this.enemies.some(e => e.isAlive) ? 'disabled' : ''}>Attack</button>
                        <button class="btn-action" onclick="window.Game.warriors[${i}].useSpecial(window.Game.enemies[window.Game.selectedEnemyIndex] || window.Game.enemies[0], window.Game)" ${!w.isAlive || w.mana < w.specialAbility.manaCost || w.cooldown > 0 || this.isGameOver || !this.enemies.some(e => e.isAlive) ? 'disabled' : ''}>Special</button>
                    </div>
                    <div class="stats-modal">
                        <p>Level: ${w.level}</p>
                        <p>Attack: ${w.attack}</p>
                        <p>Crit: ${(w.critChance * 100).toFixed(1)}%</p>
                        <p>Special: ${w.specialAbility.name}</p>
                    </div>
                `;
                playerGrid.appendChild(card);
            });

            enemyGrid.innerHTML = '';
            this.enemies.forEach((e, i) => {
                const card = document.createElement('div');
                card.className = `character-card ${this.selectedEnemyIndex === i ? 'selected-enemy' : ''}`;
                card.onclick = () => { this.selectedEnemyIndex = i; this.updateUI(); };
                card.innerHTML = `
                    <img class="character-img" src="${e.image || ''}" alt="${e.name}">
                    <div class="status-bars">
                        <div>HP: ${e.health}/${e.maxHealth}</div>
                        <div class="progress"><div class="progress-bar progress-bar-health" style="width: ${e.health / e.maxHealth * 100}%"></div></div>
                    </div>
                `;
                enemyGrid.appendChild(card);
            });

            const waveDisplay = document.getElementById('waveDisplay');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const warriorsDisplay = document.getElementById('warriorsDisplay');
            const modeDisplay = document.getElementById('modeDisplay');
            if (waveDisplay) waveDisplay.textContent = this.wave;
            if (scoreDisplay) scoreDisplay.textContent = this.score;
            if (warriorsDisplay) warriorsDisplay.textContent = `${this.warriors.filter(w => w.isAlive).length}/${this.warriors.length}`;
            if (modeDisplay) modeDisplay.textContent = this.gameMode.charAt(0).toUpperCase() + this.gameMode.slice(1);
        } catch (e) {
            console.error('Error updating UI:', e);
            this.showError('Failed to update game UI.');
        }
    },

    /* JS: Process enemy turn after player action. */
    processEnemyTurn() {
        if (this.isGameOver) return;
        try {
            this.enemies.forEach(e => {
                if (e.isAlive) {
                    const target = this.warriors.find(w => w.isAlive) || this.warriors[0];
                    if (e.specialAbility && Math.random() < 0.3) {
                        e.useSpecial(target, this);
                    } else {
                        e.attackTarget(target);
                    }
                    e.updateStatus();
                }
            });
            this.updateUI();
        } catch (e) {
            console.error('Error processing enemy turn:', e);
            this.showError('Failed to process enemy turn.');
        }
    },

    /* JS: Check if wave is complete or mode-specific win condition met. */
    checkWaveStatus() {
        try {
            if (this.enemies.every(e => !e.isAlive)) {
                if (this.gameMode === 'final' && this.enemies.some(e => e.name === 'Overlord Zarkon')) {
                    this.achievements.finalBoss.count++;
                    this.showVictory();
                } else if (this.gameMode === 'mirror') {
                    this.achievements.mirrorWin.count++;
                    this.showVictory();
                } else {
                    this.achievements.perfectWave.count += this.warriors.every(w => w.health === w.maxHealth) ? 1 : 0;
                    this.startNextWave();
                }
                this.checkAchievements();
            }
        } catch (e) {
            console.error('Error checking wave status:', e);
            this.showError('Failed to check wave status.');
        }
    },

    /* JS: Check if game is over (all warriors defeated). */
    checkGameOver() {
        try {
            if (this.warriors.every(w => !w.isAlive)) {
                this.isGameOver = true;
                soundEffects.defeat.play().catch(() => {});
                const modal = document.getElementById('gameOverModal');
                if (modal) new bootstrap.Modal(modal).show();
                this.updateUI();
            }
        } catch (e) {
            console.error('Error checking game over:', e);
            this.showError('Failed to check game over.');
        }
    },

    /* JS: Show victory modal for mode completion. */
    showVictory() {
        try {
            soundEffects.victory.play().catch(() => {});
            const modal = document.getElementById('victoryModal');
            if (modal) new bootstrap.Modal(modal).show();
            this.isGameOver = true;
            this.updateUI();
        } catch (e) {
            console.error('Error showing victory:', e);
            this.showError('Failed to show victory.');
        }
    },

    /* JS: Show error toast notification.
     * @param {string} message - Error message to display.
     */
    showError(message) {
        try {
            const toast = document.createElement('div');
            toast.className = 'error-toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } catch (e) {
            console.error('Error showing error:', e);
        }
    },

    /* JS: Log message to battle log UI.
     * @param {string} message - Message to display.
     */
    log(message) {
        try {
            const log = document.getElementById('gameLog');
            if (log) {
                const entry = document.createElement('p');
                entry.textContent = message;
                entry.className = 'log-entry';
                log.appendChild(entry);
                log.scrollTop = log.scrollHeight;
            }
        } catch (e) {
            console.error('Error logging message:', e);
        }
    }
};