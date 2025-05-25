/* Core game logic for Galaxy BattleForge, managing combat, warriors, enemies, and UI. 
 * Integrates 37 Marvel heroes as warriors fighting sci-fi enemies in a single-player campaign.
 * Compatible with provided HTML and init.js, using Bootstrap 5.3.2 for modals.
 */

/* Map warrior real names to image paths for character cards, sourced from window.players */
const warriorImageMap = {
  'Tony Stark': 'imgs/iron man.png',
  'Steve Rogers': 'imgs/capam.png',
  'Thor Odinson': 'imgs/thor.png',
  'Natasha Romanoff': 'imgs/widow.png',
  'Clint Barton': 'imgs/hawkeye.png',
  'Peter Parker': 'imgs/spiderman.png',
  'Stephen Strange': 'imgs/strange.png',
  'T’Challa': 'imgs/panther.png',
  'Wanda Maximoff': 'imgs/witch.png',
  'Scott Lang': 'imgs/antman.png',
  'James Howlett/Logan': 'imgs/bub.png',
  'Ororo Munroe': 'imgs/storm.png',
  'Scott Summers': 'imgs/scott.png',
  'Jean Grey Summers': 'imgs/jean.png',
  'Henry McCoy': 'imgs/beast.png',
  'Remy LeBeau': 'imgs/gambit.png',
  'Anna Marie': 'imgs/rogue.png',
  'Wade Wilson': 'imgs/wade.png',
  'Eddie Brock': 'imgs/venom.png',
  'Max Eisenhardt': 'imgs/max.png',
  'Victor Von Doom': 'imgs/doom.png',
  'Thanos': 'imgs/thanos.png',
  'Loki Laufeyson': 'imgs/loki.png',
  'Ultron': 'imgs/ai.png',
  'Johann Schmidt': 'imgs/skull.png',
  'Norman Osborn': 'imgs/osborn.png',
  'Wilson Fisk': 'imgs/fisk.png',
  'Felicia Hardy': 'imgs/cat.png',
  'Quentin Beck': 'imgs/illusion.png',
  'Aleksei Sytsevich': 'imgs/rhino.png',
  'Flint Marko': 'imgs/sand.png',
  'Max Dillon': 'imgs/dillon.png',
  'Otto Octavius': 'imgs/ock.png',
  'Sergei Kravinoff': 'imgs/hunt.png',
  'Herman Schultz': 'imgs/shock.png',
  'Mac Gargan': 'imgs/sting.png',
  'Adrian Toomes': 'imgs/prey.png'
};

/* Map enemy names to image paths for enemy cards */
const enemyImageMap = {
  'Overlord Zarkon': 'imgs/overlord_zarkon.png', // Final boss
  'Void Drone': 'imgs/void_drone.png', // Minion 1
  'Abyssal Stalker': 'imgs/abyssal_stalker.png', // Minion 2
  'Wave Invader': 'imgs/wave_invader.png' // Generic enemy
};

/* Define special abilities for each warrior, based on window.players.special */
const specialAbilities = {
  'Tony Stark': {
    name: 'Repulsor Barrage',
    description: 'Fires a focused energy blast at one enemy.',
    manaCost: 30,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.5); // 150% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'Steve Rogers': {
    name: 'Shield Bash',
    description: 'Stuns a single enemy for one turn.',
    manaCost: 25,
    cooldown: 3,
    effect: (target, warrior) => {
      const damage = warrior.attack;
      target.takeDamage(damage);
      target.stunTurns = 1; // Stun for 1 turn
      return damage;
    }
  },
  'Thor Odinson': {
    name: 'Thunder Strike',
    description: 'Deals heavy damage to one enemy with a lightning bolt.',
    manaCost: 40,
    cooldown: 3,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 2); // 200% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'Natasha Romanoff': {
    name: 'Stealth Strike',
    description: 'Attacks with increased critical chance.',
    manaCost: 20,
    cooldown: 2,
    effect: (target, warrior) => {
      const crit = Math.random() < 0.5; // 50% crit chance
      const damage = Math.round(warrior.attack * (crit ? 2 : 1));
      target.takeDamage(damage);
      return damage;
    }
  },
  'Clint Barton': {
    name: 'Explosive Arrow',
    description: 'Damages all enemies in a small area.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.8); // 80% attack damage
      game.enemies.filter(e => e.isAlive).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  'Peter Parker': {
    name: 'Web Trap',
    description: 'Immobilizes an enemy, preventing their next action.',
    manaCost: 25,
    cooldown: 3,
    effect: (target, warrior) => {
      const damage = warrior.attack;
      target.takeDamage(damage);
      target.stunTurns = 1;
      return damage;
    }
  },
  'Stephen Strange': {
    name: 'Time Loop',
    description: 'Resets health of one ally to its starting value.',
    manaCost: 50,
    cooldown: 4,
    effect: (target, warrior, game) => {
      const ally = game.warriors.find(w => w.isAlive);
      if (ally) ally.health = ally.maxHealth;
      return 0;
    }
  },
  'T’Challa': {
    name: 'Vibranium Slash',
    description: 'Deals damage and absorbs some for self-healing.',
    manaCost: 30,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.5);
      target.takeDamage(damage);
      warrior.health = Math.min(warrior.maxHealth, warrior.health + Math.round(damage * 0.3));
      return damage;
    }
  },
  'Wanda Maximoff': {
    name: 'Hex Bolt',
    description: 'Randomly reduces an enemy’s attack or health.',
    manaCost: 25,
    cooldown: 2,
    effect: (target, warrior) => {
      if (Math.random() < 0.5) {
        target.attack = Math.round(target.attack * 0.8); // Reduce attack by 20%
        return 0;
      } else {
        const damage = Math.round(target.health * 0.2); // 20% of current health
        target.takeDamage(damage);
        return damage;
      }
    }
  },
  'Scott Lang': {
    name: 'Giant Stomp',
    description: 'Deals massive damage to one enemy.',
    manaCost: 40,
    cooldown: 3,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 2.5); // 250% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'James Howlett/Logan': {
    name: 'Adamantium Frenzy',
    description: 'Attacks multiple times in one turn.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior) => {
      let totalDamage = 0;
      for (let i = 0; i < 3; i++) {
        const damage = Math.round(warrior.attack * 0.7); // 70% attack per hit
        target.takeDamage(damage);
        totalDamage += damage;
      }
      return totalDamage;
    }
  },
  'Ororo Munroe': {
    name: 'Tornado Blast',
    description: 'Pushes back all enemies, delaying their actions.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      game.enemies.filter(e => e.isAlive).forEach(e => e.stunTurns = 1);
      return 0;
    }
  },
  'Scott Summers': {
    name: 'Optic Barrage',
    description: 'Hits all enemies with reduced damage.',
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.6); // 60% attack damage
      game.enemies.filter(e => e.isAlive).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  'Jean Grey Summers': {
    name: 'Mind Crush',
    description: 'Deals damage based on target’s remaining health.',
    manaCost: 35,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(target.health * 0.3); // 30% of current health
      target.takeDamage(damage);
      return damage;
    }
  },
  'Henry McCoy': {
    name: 'Primal Leap',
    description: 'Attacks and boosts own agility for one turn.',
    manaCost: 25,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = warrior.attack;
      target.takeDamage(damage);
      warrior.buffTurns = 1; // Boost attack by 20% for 1 turn
      warrior.attack = Math.round(warrior.attack * 1.2);
      return damage;
    }
  },
  'Remy LeBeau': {
    name: 'Ace of Spades',
    description: 'Throws a single card for high damage.',
    manaCost: 30,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.8); // 180% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'Anna Marie': {
    name: 'Power Drain',
    description: 'Steals health from an enemy to heal self.',
    manaCost: 30,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.2); // 120% attack damage
      target.takeDamage(damage);
      warrior.health = Math.min(warrior.maxHealth, warrior.health + Math.round(damage * 0.5));
      return damage;
    }
  },
  'Wade Wilson': {
    name: 'Chimichanga Bomb',
    description: 'Explosive attack with random extra effects.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 1.5); // 150% attack damage
      target.takeDamage(damage);
      const rand = Math.random();
      if (rand < 0.33) {
        warrior.health = Math.min(warrior.maxHealth, warrior.health + 20); // Heal 20
      } else if (rand < 0.66) {
        target.stunTurns = 1; // Stun for 1 turn
      }
      return damage;
    }
  },
  'Eddie Brock': {
    name: 'Tendril Assault',
    description: 'Attacks all enemies with symbiote tendrils.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.9); // 90% attack damage
      game.enemies.filter(e => e.isAlive).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  'Max Eisenhardt': {
    name: 'Metal Storm',
    description: 'Crushes one enemy with magnetic force.',
    manaCost: 40,
    cooldown: 3,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 2); // 200% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'Victor Von Doom': {
    name: 'Doom’s Curse',
    description: 'Applies a damage-over-time effect to one enemy.',
    manaCost: 25,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 0.5); // 50% attack damage
      target.takeDamage(damage);
      target.dotDamage = damage; // Damage over time for 2 turns
      target.dotTurns = 2;
      return damage;
    }
  },
  'Thanos': {
    name: 'Infinity Snap',
    description: 'Instantly defeats a weakened enemy.',
    manaCost: 50,
    cooldown: 5,
    effect: (target, warrior) => {
      if (target.health <= target.maxHealth * 0.2) { // Target below 20% health
        target.takeDamage(target.health);
        return target.health;
      }
      return 0;
    }
  },
  'Loki Laufeyson': {
    name: 'Illusionary Double',
    description: 'Creates a decoy to absorb one attack.',
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior) => {
      warrior.decoyTurns = 1; // Decoy for 1 turn
      return 0;
    }
  },
  'Ultron': {
    name: 'Data Corruption',
    description: 'Reduces an enemy’s attack permanently.',
    manaCost: 25,
    cooldown: 2,
    effect: (target, warrior) => {
      target.attack = Math.round(target.attack * 0.7); // Reduce attack by 30%
      return 0;
    }
  },
  'Johann Schmidt': {
    name: 'Cube Surge',
    description: 'Boosts all allies’ attack for one turn.',
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior, game) => {
      game.warriors.filter(w => w.isAlive).forEach(w => {
        w.buffTurns = 1; // Boost attack by 30% for 1 turn
        w.attack = Math.round(w.attack * 1.3);
      });
      return 0;
    }
  },
  'Norman Osborn': {
    name: 'Pumpkin Barrage',
    description: 'Throws multiple bombs at random enemies.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      let totalDamage = 0;
      for (let i = 0; i < 3; i++) {
        const aliveEnemies = game.enemies.filter(e => e.isAlive);
        if (!aliveEnemies.length) break;
        const randTarget = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const damage = Math.round(warrior.attack * 0.7); // 70% attack per bomb
        randTarget.takeDamage(damage);
        totalDamage += damage;
      }
      return totalDamage;
    }
  },
  'Wilson Fisk': {
    name: 'Crushing Blow',
    description: 'Deals high damage to one enemy.',
    manaCost: 35,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.8); // 180% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'Felicia Hardy': {
    name: 'Lucky Strike',
    description: 'Guarantees a critical hit on one enemy.',
    manaCost: 25,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 2); // 200% attack damage
      target.takeDamage(damage);
      return damage;
    }
  },
  'Quentin Beck': {
    name: 'Smoke and Mirrors',
    description: 'Confuses all enemies, reducing accuracy.',
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior, game) => {
      game.enemies.filter(e => e.isAlive).forEach(e => {
        e.debuffTurns = 1; // Reduce attack by 20% for 1 turn
        e.attack = Math.round(e.attack * 0.8);
      });
      return 0;
    }
  },
  'Aleksei Sytsevich': {
    name: 'Rhino Rush',
    description: 'Charges through, damaging multiple enemies.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.7); // 70% attack damage
      game.enemies.filter(e => e.isAlive).slice(0, 2).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  'Flint Marko': {
    name: 'Sandstorm',
    description: 'Blinds enemies, reducing their attack.',
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior, game) => {
      game.enemies.filter(e => e.isAlive).forEach(e => {
        e.debuffTurns = 1; // Reduce attack by 20% for 1 turn
        e.attack = Math.round(e.attack * 0.8);
      });
      return 0;
    }
  },
  'Max Dillon': {
    name: 'Volt Surge',
    description: 'Chains lightning to hit multiple enemies.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.8); // 80% attack damage
      game.enemies.filter(e => e.isAlive).slice(0, 3).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  'Otto Octavius': {
    name: 'Tentacle Slam',
    description: 'Attacks up to three enemies at once.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      const damage = Math.round(warrior.attack * 0.8); // 80% attack damage
      game.enemies.filter(e => e.isAlive).slice(0, 3).forEach(e => e.takeDamage(damage));
      return damage;
    }
  },
  'Sergei Kravinoff': {
    name: 'Hunter’s Trap',
    description: 'Immobilizes one enemy for two turns.',
    manaCost: 30,
    cooldown: 3,
    effect: (target, warrior) => {
      target.stunTurns = 2; // Stun for 2 turns
      return 0;
    }
  },
  'Herman Schultz': {
    name: 'Vibro-Pulse',
    description: 'Disrupts all enemies, delaying their actions.',
    manaCost: 35,
    cooldown: 3,
    effect: (target, warrior, game) => {
      game.enemies.filter(e => e.isAlive).forEach(e => e.stunTurns = 1);
      return 0;
    }
  },
  'Mac Gargan': {
    name: 'Toxic Tail',
    description: 'Poisons one enemy, dealing damage over time.',
    manaCost: 25,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 0.5); // 50% attack damage
      target.takeDamage(damage);
      target.dotDamage = damage; // Damage over time for 2 turns
      target.dotTurns = 2;
      return damage;
    }
  },
  'Adrian Toomes': {
    name: 'Talon Dive',
    description: 'Strikes one enemy, ignoring their defenses.',
    manaCost: 30,
    cooldown: 2,
    effect: (target, warrior) => {
      const damage = Math.round(warrior.attack * 1.5); // 150% attack damage
      target.takeDamage(damage);
      return damage;
    }
  }
};

/* Represents a warrior character with stats and abilities */
class Warrior {
  constructor(name, health, attack, mana, specialAbility, image) {
    this.name = name; // Warrior's real name (e.g., Tony Stark)
    this.health = health; // Current health
    this.maxHealth = health; // Maximum health
    this.attack = attack; // Base attack damage
    this.baseAttack = attack; // Store original attack for buffs/debuffs
    this.mana = mana; // Current mana
    this.maxMana = mana; // Maximum mana
    this.specialAbility = specialAbility; // Special ability object
    this.image = image; // Image path
    this.isAlive = true; // Alive status
    this.cooldown = 0; // Special ability cooldown
    this.decoyTurns = 0; // Turns with decoy active (Loki)
    this.buffTurns = 0; // Turns with attack buff active
  }

  /* Perform a basic attack on a target */
  attackTarget(target) {
    if (!this.isAlive) return 0;
    if (this.decoyTurns > 0) {
      this.decoyTurns = 0;
      this.logAction(`${this.name}'s decoy absorbs the attack!`);
      return 0;
    }
    const damage = Math.round(this.attack * (0.8 + Math.random() * 0.4)); // Random 80-120% attack
    target.takeDamage(damage);
    this.logAction(`${this.name} attacks ${target.name} for ${damage} damage!`);
    return damage;
  }

  /* Use the warrior's special ability */
  useSpecial(target, game) {
    if (!this.isAlive || this.mana < this.specialAbility.manaCost || this.cooldown > 0) return false;
    const damage = this.specialAbility.effect(target, this, game);
    this.mana -= this.specialAbility.manaCost;
    this.cooldown = this.specialAbility.cooldown;
    this.logAction(`${this.name} uses ${this.specialAbility.name} for ${damage} damage!`);
    return damage;
  }

  /* Take damage, respecting decoy */
  takeDamage(damage) {
    if (this.decoyTurns > 0) {
      this.decoyTurns = 0;
      this.logAction(`${this.name}'s decoy absorbs the damage!`);
      return;
    }
    this.health = Math.max(0, this.health - damage);
    if (this.health === 0) {
      this.isAlive = false;
      this.logAction(`${this.name} has been defeated!`);
    }
  }

  /* Regenerate mana and update status effects */
  regenerateMana() {
    this.mana = Math.min(this.maxMana, this.mana + 10); // Regain 10 mana per turn
    if (this.cooldown > 0) this.cooldown--;
    if (this.decoyTurns > 0) this.decoyTurns--;
    if (this.buffTurns > 0) {
      this.buffTurns--;
      if (this.buffTurns === 0) {
        this.attack = this.baseAttack; // Reset attack after buff expires
      }
    }
  }

  /* Log an action to the game log */
  logAction(message) {
    try {
      const log = document.getElementById('gameLog');
      if (log) {
        const entry = document.createElement('p');
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
      }
    } catch (e) {
      console.error('Error logging action:', e);
    }
  }

  /* Serialize warrior state for saving */
  toJSON() {
    return {
      name: this.name,
      health: this.health,
      maxHealth: this.maxHealth,
      attack: this.baseAttack,
      mana: this.mana,
      maxMana: this.maxMana,
      image: this.image,
      isAlive: this.isAlive,
      cooldown: this.cooldown
    };
  }
}

/* Represents an enemy with stats and attack capability */
class Enemy {
  constructor(name, health, attack, image) {
    this.name = name; // Enemy name (e.g., Void Drone)
    this.health = health; // Current health
    this.maxHealth = health; // Maximum health
    this.attack = attack; // Base attack damage
    this.baseAttack = attack; // Store original attack for debuffs
    this.image = image; // Image path
    this.isAlive = true; // Alive status
    this.stunTurns = 0; // Turns stunned
    this.dotDamage = 0; // Damage over time amount
    this.dotTurns = 0; // Turns for DOT effect
    this.debuffTurns = 0; // Turns with attack debuff
  }

  /* Perform a basic attack on a target */
  attackTarget(target) {
    if (!this.isAlive || this.stunTurns > 0) return 0;
    const damage = Math.round(this.attack * (0.8 + Math.random() * 0.4)); // Random 80-120% attack
    target.takeDamage(damage);
    this.logAction(`${this.name} attacks ${target.name} for ${damage} damage!`);
    return damage;
  }

  /* Take damage and apply DOT effects */
  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    if (this.health === 0) {
      this.isAlive = false;
      this.logAction(`${this.name} has been defeated!`);
    }
  }

  /* Update status effects and apply DOT */
  updateStatus() {
    if (this.stunTurns > 0) this.stunTurns--;
    if (this.dotTurns > 0) {
      this.takeDamage(this.dotDamage);
      this.dotTurns--;
      if (this.dotTurns === 0) this.dotDamage = 0;
    }
    if (this.debuffTurns > 0) {
      this.debuffTurns--;
      if (this.debuffTurns === 0) {
        this.attack = this.baseAttack; // Reset attack after debuff expires
      }
    }
  }

  /* Log an action to the game log */
  logAction(message) {
    try {
      const log = document.getElementById('gameLog');
      if (log) {
        const entry = document.createElement('p');
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
      }
    } catch (e) {
      console.error('Error logging action:', e);
    }
  }
}

/* Debounce function to limit UI update frequency */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/* Game state and logic manager */
const Game = {
  wave: 1, // Current wave number
  score: 0, // Player score
  warriors: [], // Active warriors
  enemies: [], // Current enemies
  gameMode: 'campaign', // Game mode (fixed to campaign)
  difficulty: 'medium', // Difficulty level
  isGameOver: false, // Game over status
  achievements: [], // Unlocked achievements
  updateQueue: [], // Queue for UI updates
  lastUpdate: 0, // Timestamp of last UI update

  /* Initialize game, bind events, and start first wave */
  init() {
    this.bindEvents();
    this.loadSavedWarriors();
    this.loadSettings();
    this.startWave();
    this.updateUI();
  },

  /* Bind event listeners for UI controls */
  bindEvents() {
    try {
      const buttons = [
        { id: 'saveGameBtn', handler: () => this.saveGame() },
        { id: 'restartGameBtn', handler: () => this.restartGame() },
        { id: 'saveScoreBtn', handler: () => this.saveScore() },
        { id: 'musicToggle', handler: () => this.toggleMusic() },
        { id: 'themeToggle', handler: () => this.toggleTheme() },
        { id: 'saveSettingsBtn', handler: () => this.saveSettings() }
      ];
      buttons.forEach(({ id, handler }) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
      });

      const sidebarToggle = document.querySelector('.toggle-sidebar');
      if (sidebarToggle) sidebarToggle.addEventListener('click', () => this.toggleSidebar());

      document.addEventListener('keydown', e => this.handleKeyPress(e));
    } catch (e) {
      console.error('Error binding events:', e);
    }
  },

  /* Load warriors from localStorage or use defaults */
  loadSavedWarriors() {
    try {
      const savedWarriors = JSON.parse(localStorage.getItem('warriors'));
      const defaultWarriors = [
        { name: 'Tony Stark', health: 100, attack: 20, mana: 50 },
        { name: 'Steve Rogers', health: 110, attack: 18, mana: 40 },
        { name: 'Thor Odinson', health: 120, attack: 22, mana: 45 }
      ];
      this.warriors = (savedWarriors || defaultWarriors).map(w => {
        if (!warriorImageMap[w.name] || !specialAbilities[w.name]) {
          console.warn(`Invalid warrior: ${w.name}, using default`);
          return new Warrior(
            defaultWarriors[0].name,
            defaultWarriors[0].health,
            defaultWarriors[0].attack,
            defaultWarriors[0].mana,
            specialAbilities[defaultWarriors[0].name],
            warriorImageMap[defaultWarriors[0].name]
          );
        }
        return new Warrior(
          w.name,
          w.health,
          w.attack,
          w.mana,
          specialAbilities[w.name],
          warriorImageMap[w.name]
        );
      });
    } catch (e) {
      console.error('Error loading warriors:', e);
      this.warriors = defaultWarriors.map(w => new Warrior(
        w.name,
        w.health,
        w.attack,
        w.mana,
        specialAbilities[w.name],
        warriorImageMap[w.name]
      ));
    }
  },

  /* Load game settings from localStorage */
  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('gameSettings'));
      if (settings) {
        const soundVolume = document.getElementById('soundVolume');
        const skinSelect = document.getElementById('skinSelect');
        if (soundVolume) soundVolume.value = settings.soundVolume;
        if (skinSelect) skinSelect.value = settings.skin;
        this.applySkin(settings.skin);
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  },

  /* Start a new wave with enemies */
  startWave() {
    this.enemies = this.generateEnemies();
    this.updateUI();
    this.checkAchievements();
    this.log('Wave ${this.wave} started!');
  },

  /* Generate enemies for the current wave */
  generateEnemies() {
    const enemies = [];
    const count = this.wave + (this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3);
    if (this.gameMode === 'campaign' && this.wave === 3) {
      enemies.push(new Enemy('Overlord Zarkon', 400, 40, enemyImageMap['Overlord Zarkon']));
    } else {
      for (let i = 0; i < count; i++) {
        const name = i % 2 === 0 ? 'Void Drone' : 'Abyssal Stalker';
        const health = 80 + this.wave * 15;
        const attack = 15 + this.wave * 5;
        enemies.push(new Enemy(name, health, attack, enemyImageMap[name]));
      }
    }
    return enemies;
  },

  /* Start the next wave after a powerup selection */
  startNextWave() {
    this.wave++;
    this.warriors.forEach(warrior => warrior.regenerateMana());
    this.showPowerupSelection();
  },

  /* Display powerup selection overlay */
  showPowerupSelection() {
    try {
      let powerupOptions = document.getElementById('powerupOptions');
      if (!powerupOptions) {
        powerupOptions = document.createElement('div');
        powerupOptions.id = 'powerupOptions';
      }
      powerupOptions.innerHTML = '';
      const powerups = [
        { name: 'Health Boost', effect: warrior => warrior.health = Math.min(warrior.maxHealth, warrior.health + 50) },
        { name: 'Attack Boost', effect: warrior => warrior.baseAttack = warrior.attack = warrior.attack + 10 },
        { name: 'Mana Boost', effect: warrior => warrior.mana = warrior.maxMana }
      ];

      powerups.forEach((powerup, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-stellar';
        button.textContent = powerup.name;
        button.onclick = () => {
          this.applyPowerup(powerup.effect);
          this.startWave();
        };
        powerupOptions.appendChild(button);
      });

      document.body.appendChild(powerupOptions);
      setTimeout(() => powerupOptions.remove(), 5000);
    } catch (e) {
      console.error('Error showing powerup selection:', e);
      this.startWave(); // Fallback to next wave
    }
  },

  /* Apply a powerup effect to all warriors */
  applyPowerup(effect) {
    this.warriors.forEach(warrior => effect(warrior));
    this.log('Powerup applied to all warriors!');
  },

  /* Update UI with debouncing to prevent excessive renders */
  updateUI: debounce(function () {
    const now = performance.now();
    if (now - this.lastUpdate < 16) return; // Skip if too frequent
    this.lastUpdate = now;

    this.updateQueue.push(() => {
      this.renderWarriors();
      this.renderEnemies();
      this.updateHUD();
      this.updateAchievements();
    });

    requestAnimationFrame(() => {
      while (this.updateQueue.length) this.updateQueue.shift()();
    });
  }, 50),

  /* Render warrior cards in playerHeroesGrid */
  renderWarriors() {
    try {
      const grid = document.getElementById('playerHeroesGrid');
      if (!grid) return;
      grid.innerHTML = '';
      this.warriors.forEach((warrior, index) => {
        if (!warrior.isAlive) return;
        const card = document.createElement('div');
        card.className = `character-card wave-progress-${Math.min(this.wave, 3)}`;
        card.innerHTML = `
          <img src="${warrior.image}" alt="${warrior.name}" class="character-img" onerror="this.src='imgs/default_warrior.png'">
          <div class="action-buttons">
            <button class="btn btn-action" data-action="attack" data-index="${index}" ${this.isGameOver ? 'disabled' : ''}>Attack</button>
            <button class="btn btn-action" data-action="special" data-index="${index}" ${this.isGameOver || warrior.mana < warrior.specialAbility.manaCost || warrior.cooldown > 0 ? 'disabled' : ''}>Special</button>
            <button class="btn btn-info-custom" data-action="info" data-index="${index}">Info</button>
          </div>
          <div class="stats-modal">
            <h6>${warrior.name}</h6>
            <p>Health: ${warrior.health}/${warrior.maxHealth}</p>
            <p>Mana: ${warrior.mana}/${warrior.maxMana}</p>
            <p>Attack: ${warrior.attack}</p>
          </div>
        `;
        grid.appendChild(card);
        card.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => this.handleWarriorAction(btn.dataset.action, index));
        });
      });
    } catch (e) {
      console.error('Error rendering warriors:', e);
    }
  },

  /* Render enemy cards in opponentGrid */
  renderEnemies() {
    try {
      const grid = document.getElementById('opponentGrid');
      if (!grid) return;
      grid.innerHTML = '';
      this.enemies.forEach((enemy, index) => {
        if (!enemy.isAlive) return;
        const card = document.createElement('div');
        card.className = `character-card wave-progress-${Math.min(this.wave, 3)}`;
        card.innerHTML = `
          <img src="${enemy.image}" alt="${enemy.name}" class="character-img" onerror="this.src='imgs/default_enemy.png'">
          <div class="stats-modal">
            <h6>${enemy.name}</h6>
            <p>Health: ${enemy.health}/${enemy.maxHealth}</p>
            <p>Attack: ${enemy.attack}</p>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (e) {
      console.error('Error rendering enemies:', e);
    }
  },

  /* Update heads-up display (wave, score, warriors) */
  updateHUD() {
    try {
      const waveDisplay = document.getElementById('waveDisplay');
      const scoreDisplay = document.getElementById('scoreDisplay');
      const warriorsDisplay = document.getElementById('warriorsDisplay');
      const waveProgressBar = document.getElementById('waveProgressBar');
      if (waveDisplay) waveDisplay.textContent = this.wave;
      if (scoreDisplay) scoreDisplay.textContent = this.score;
      if (warriorsDisplay) {
        const aliveWarriors = this.warriors.filter(w => w.isAlive).length;
        const totalWarriors = this.warriors.length;
        warriorsDisplay.textContent = `${aliveWarriors}/${totalWarriors}`;
      }
      if (waveProgressBar) waveProgressBar.style.width = `${(this.wave % 3) * 33.3}%`;
    } catch (e) {
      console.error('Error updating HUD:', e);
    }
  },

  /* Handle warrior actions (attack, special, info) */
  handleWarriorAction(action, index) {
    if (this.isGameOver) return;
    const warrior = this.warriors[index];
    if (!warrior.isAlive) return;
    const aliveEnemies = this.enemies.filter(e => e.isAlive);
    if (!aliveEnemies.length) return;
    const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

    if (action === 'attack') {
      warrior.attackTarget(target);
      this.score += 10;
      this.animateCard(warrior, 'attack');
    } else if (action === 'special' && warrior.useSpecial(target, this)) {
      this.score += 50;
      this.animateCard(warrior, 'special');
    } else if (action === 'info') {
      this.showSpecialInfo(warrior);
      return;
    }

    this.checkGameState();
    if (!this.isGameOver) this.enemyTurn();
  },

  /* Animate a warrior card for attack or special */
  animateCard(warrior, type) {
    try {
      const cards = document.querySelectorAll('#playerHeroesGrid .character-card');
      cards.forEach(card => {
        const img = card.querySelector('img');
        if (img?.alt === warrior.name) {
          card.classList.add(type);
          setTimeout(() => card.classList.remove(type), 300);
        }
      });
    } catch (e) {
      console.error('Error animating card:', e);
    }
  },

  /* Handle enemy attacks and status updates */
  enemyTurn() {
    const aliveEnemies = this.enemies.filter(e => e.isAlive);
    const aliveWarriors = this.warriors.filter(w => w.isAlive);
    aliveEnemies.forEach(enemy => {
      enemy.updateStatus(); // Apply DOT and update debuffs
      if (aliveWarriors.length) {
        const target = aliveWarriors[Math.floor(Math.random() * aliveWarriors.length)];
        enemy.attackTarget(target);
      }
    });
    this.warriors.forEach(warrior => warrior.regenerateMana());
    this.checkGameState();
  },

  /* Check win/loss conditions and advance game state */
  checkGameState() {
    const aliveWarriors = this.warriors.filter(w => w.isAlive).length;
    const aliveEnemies = this.enemies.filter(e => e.isAlive).length;

    if (aliveWarriors === 0) {
      this.endGame(false);
    } else if (aliveEnemies === 0) {
      if (this.gameMode === 'campaign' && this.wave === 3) {
        this.endGame(true);
      } else {
        this.score += 100;
        this.startNextWave();
      }
    }
    this.updateUI();
  },

  /* End the game with victory or defeat */
  endGame(won) {
    this.isGameOver = true;
    try {
      const overlay = document.getElementById('cinematicOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.textContent = won ? 'Victory!' : 'Defeat!';
        overlay.className = won ? 'VictoryTxt' : 'LossTxt';
      }
      const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
      const message = document.getElementById('gameOverMessage');
      const score = document.getElementById('finalScore');
      if (message) message.textContent = won ? 'You defeated Overlord Zarkon!' : 'Your warriors were defeated.';
      if (score) score.textContent = this.score;
      setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
        modal.show();
      }, 3000);
    } catch (e) {
      console.error('Error ending game:', e);
    }
  },

  /* Show special ability info in a modal */
  showSpecialInfo(warrior) {
    try {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${warrior.specialAbility.name}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>${warrior.specialAbility.description}</p>
              <p>Mana: ${warrior.specialAbility.manaCost}, Cooldown: ${warrior.cooldown}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-stellar" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      modal.addEventListener('hidden.bs.modal', () => modal.remove());
    } catch (e) {
      console.error('Error showing special info:', e);
    }
  },

  /* Check and unlock achievements */
  checkAchievements() {
    const newAchievements = [
      { id: 'firstWave', name: 'First Contact', description: 'Complete the first wave.', condition: () => this.wave >= 1 },
      { id: 'highScore', name: 'Stellar Score', description: 'Score 500 points.', condition: () => this.score >= 500 },
      { id: 'finalBoss', name: 'Overlord Slayer', description: 'Defeat Overlord Zarkon.', condition: () => this.gameMode === 'campaign' && this.wave === 3 && this.enemies.every(e => !e.isAlive) }
    ];

    newAchievements.forEach(ach => {
      if (ach.condition() && !this.achievements.some(a => a.id === ach.id)) {
        this.achievements.push(ach);
        this.log(`Achievement Unlocked: ${ach.name}`);
      }
    });
  },

  /* Update achievement display in sidebar and modal */
  updateAchievements() {
    try {
      const list = document.getElementById('achievementList');
      const modalList = document.getElementById('modalAchievementList');
      if (list) list.innerHTML = '';
      if (modalList) modalList.innerHTML = '';
      this.achievements.forEach(ach => {
        const li = document.createElement('li');
        li.textContent = `${ach.name}: ${ach.description}`;
        if (list) list.appendChild(li);
        if (modalList) modalList.appendChild(li.cloneNode(true));
      });
    } catch (e) {
      console.error('Error updating achievements:', e);
    }
  },

  /* Save game state to localStorage */
  saveGame() {
    try {
      const gameState = {
        wave: this.wave,
        score: this.score,
        warriors: this.warriors.map(warrior => warrior.toJSON()),
        gameMode: this.gameMode,
        difficulty: this.difficulty
      };
      localStorage.setItem('gameState', JSON.stringify(gameState));
      this.log('Game saved!');
    } catch (e) {
      console.error('Error saving game:', e);
      this.log('Failed to save game.');
    }
  },

  /* Load game state from localStorage */
  loadGame() {
    try {
      const savedState = JSON.parse(localStorage.getItem('gameState'));
      if (savedState) {
        this.wave = savedState.wave;
        this.score = savedState.score;
        this.warriors = savedState.warriors.map(w => {
          if (!warriorImageMap[w.name] || !specialAbilities[w.name]) {
            console.warn(`Invalid warrior in saved state: ${w.name}`);
            return null;
          }
          return new Warrior(
            w.name,
            w.health,
            w.attack,
            w.mana,
            specialAbilities[w.name],
            warriorImageMap[w.name]
          );
        }).filter(w => w);
        this.gameMode = savedState.gameMode;
        this.difficulty = savedState.difficulty;
        this.isGameOver = false;
        this.startWave();
        this.log('Game loaded!');
      }
    } catch (e) {
      console.error('Error loading game:', e);
      this.log('Failed to load game.');
    }
  },

  /* Save score to leaderboard in localStorage */
  saveScore() {
    try {
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
      leaderboard.push({
        player: 'Commander',
        score: this.score,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
      this.log('Score saved!');
    } catch (e) {
      console.error('Error saving score:', e);
      this.log('Failed to save score.');
    }
  },

  /* Restart the game with initial state */
  restartGame() {
    this.wave = 1;
    this.score = 0;
    this.isGameOver = false;
    this.warriors.forEach(warrior => {
      warrior.health = warrior.maxHealth;
      warrior.mana = warrior.maxMana;
      warrior.isAlive = true;
      warrior.cooldown = 0;
      warrior.decoyTurns = 0;
      warrior.buffTurns = 0;
      warrior.attack = warrior.baseAttack;
    });
    this.enemies = [];
    this.startWave();
    this.log('Game restarted!');
  },

  /* Toggle background music */
  toggleMusic() {
    try {
      const button = document.getElementById('musicToggle');
      if (button) {
        button.textContent = button.textContent.includes('Off') ? 'Music: On' : 'Music: Off';
        this.log(`Music ${button.textContent.includes('On') ? 'enabled' : 'disabled'}.`);
      }
    } catch (e) {
      console.error('Error toggling music:', e);
    }
  },

  /* Toggle light/dark theme */
  toggleTheme() {
    try {
      document.body.classList.toggle('light-theme');
      const button = document.getElementById('themeToggle');
      if (button) {
        button.textContent = document.body.classList.contains('light-theme') ? 'Theme: Light' : 'Theme: Dark';
        this.log(`Theme switched to ${button.textContent}.`);
      }
    } catch (e) {
      console.error('Error toggling theme:', e);
    }
  },

  /* Toggle game log sidebar visibility */
  toggleSidebar() {
    try {
      const sidebar = document.getElementById('gameLogSidebar');
      if (sidebar) {
        sidebar.classList.toggle('show');
        this.log(`Sidebar ${sidebar.classList.contains('show') ? 'shown' : 'hidden'}.`);
      }
    } catch (e) {
      console.error('Error toggling sidebar:', e);
    }
  },

  /* Save game settings to localStorage */
  saveSettings() {
    try {
      const settings = {
        soundVolume: document.getElementById('soundVolume')?.value || 50,
        skin: document.getElementById('skinSelect')?.value || 'standard'
      };
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      this.applySkin(settings.skin);
      bootstrap.Modal.getInstance(document.getElementById('settingsModal'))?.hide();
      this.log('Settings saved!');
    } catch (e) {
      console.error('Error saving settings:', e);
      this.log('Failed to save settings.');
    }
  },

  /* Apply skin to character images */
  applySkin(skin) {
    try {
      document.querySelectorAll('.character-img').forEach(img => {
        img.classList.toggle('stellar-skin', skin === 'stellar');
      });
    } catch (e) {
      console.error('Error applying skin:', e);
    }
  },

  /* Handle keyboard inputs for quick actions */
  handleKeyPress(e) {
    if (this.isGameOver) return;
    const aliveWarriors = this.warriors.filter(w => w.isAlive);
    if (!aliveWarriors.length) return;
    const target = this.enemies.find(e => e.isAlive);
    if (!target) return;
    switch (e.key.toLowerCase()) {
      case 'a':
        const warriorA = aliveWarriors[0];
        warriorA.attackTarget(target);
        this.score += 10;
        this.animateCard(warriorA, 'attack');
        this.checkGameState();
        if (!this.isGameOver) this.enemyTurn();
        break;
      case 's':
        const warriorS = aliveWarriors[0];
        if (warriorS.useSpecial(target, this)) {
          this.score += 50;
          this.animateCard(warriorS, 'special');
          this.checkGameState();
          if (!this.isGameOver) this.enemyTurn();
        }
        break;
      case 'i':
        this.showSpecialInfo(aliveWarriors[0]);
        break;
    }
  },

  /* Log a message to the game log */
  log(message) {
    try {
      const log = document.getElementById('gameLog');
      if (log) {
        const entry = document.createElement('p');
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
      }
    } catch (e) {
      console.error('Error logging message:', e);
    }
  }
};

/* Start game when DOM is fully loaded */
document.addEventListener('DOMContentLoaded', () => {
  try {
    Game.init();
  } catch (e) {
    console.error('Error initializing game:', e);
    alert('Failed to initialize game. Please check console for details.');
  }
});