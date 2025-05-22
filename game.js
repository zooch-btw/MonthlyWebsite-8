// Defines color palette for consistent styling across the game
const colors = {
    heroRed: '#ff2a44',
    cosmicBlue: '#1e90ff',
    vibrantPurple: '#6a0dad',
    infinityGold: '#ffd700',
    nebulaDark: '#0d1b2a',
    starWhite: '#f0f8ff'
};

// Defines theme settings for time-based styling based on current hour
const themeSettings = [
    { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
    { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
    { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
    { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
    { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
];

// URLs for sound effects and background music (already looped in HTML)
const soundURLs = {
    attack: 'https://cdn.freesound.org/previews/171/171104_2432228-lq.mp3',
    special: 'https://cdn.freesound.org/previews/344/344690_5762272-lq.mp3',
    select: 'https://cdn.freesound.org/previews/270/270306_4761266-lq.mp3',
    moreInfo: 'https://cdn.freesound.org/previews/242/242804_3159293-lq.mp3',
    background: 'https://cdn.freesound.org/previews/511/511484_9156144-lq.mp3'
};

// Applies time-based theme to the document body
const applyTheme = () => {
    const hr = new Date().getHours();
    const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end) || {
        cls: 'night',
        bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
    };
    document.body.classList.remove('morning', 'afternoon', 'evening', 'night');
    document.body.classList.add(setting.cls);
    document.body.style.background = setting.bgGradient;
    console.log('Applied theme:', setting.cls);
    return hr; // Returns current hour for card rendering
};

// Sanitizes HTML input to prevent XSS attacks
const sanitizeHTML = str => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// Plays a sound effect with volume control and haptic feedback
const playSound = (type) => {
    try {
        const sound = document.getElementById(`${type}Sound`);
        if (!sound) throw new Error(`Sound ${type} not found`);
        sound.currentTime = 0;
        sound.volume = (document.getElementById('soundVolume')?.value || 50) / 100;
        sound.play().catch(e => logMessage(`Failed to play ${type} sound: ${e.message}`));
        if (document.getElementById('vibrationCheckbox')?.checked && navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
        console.warn('playSound error:', e);
        logMessage(`Error playing sound: ${e.message}`);
    }
};

// Uses text-to-speech to announce text for accessibility
const speak = (text) => {
    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2;
        utterance.volume = (document.getElementById('soundVolume')?.value || 50) / 100;
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn('speak error:', e);
        logMessage(`Error with text-to-speech: ${e.message}`);
    }
};

// Logs messages to the game log sidebar
const logMessage = (message) => {
    const gameLog = document.getElementById('gameLog');
    if (gameLog) {
        const p = document.createElement('p');
        p.innerHTML = sanitizeHTML(message);
        gameLog.appendChild(p);
        gameLog.scrollTop = gameLog.scrollHeight;
        speak(message);
    }
};

// Game state object to manage wave, score, heroes, and settings
const gameState = {
    wave: 1,
    score: 0,
    player1Heroes: [],
    player2Heroes: [],
    enemies: [],
    gameMode: 'finalBoss',
    playerMode: 'single',
    difficulty: 'medium',
    isTutorial: false,
    tutorialStep: 0,
    statusEffects: new Map(),
    achievements: []
};

// Defines special abilities for all 37 characters
const specialAbilities = {
    'Repulsor Barrage': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.5);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Repulsor Barrage'] = 3;
            return `💥 ${hero.firstName} fires Repulsor Barrage, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 3,
        description: 'Fires a focused energy blast at one enemy.'
    },
    'Shield Bash': {
        type: 'control',
        execute: (hero, target) => {
            target.statusEffects.push({ type: 'stun', duration: 1 });
            hero.mana -= 25;
            hero.cooldowns['Shield Bash'] = 4;
            return `🛡️ ${hero.firstName} uses Shield Bash, stunning ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Stuns a single enemy for one turn.'
    },
    'Thunder Strike': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.8);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 25;
            hero.cooldowns['Thunder Strike'] = 4;
            return `⚡ ${hero.firstName} unleashes Thunder Strike, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Deals heavy damage to one enemy with a lightning bolt.'
    },
    'Stealth Strike': {
        type: 'damage',
        execute: (hero, target) => {
            const critChance = Math.random() < 0.5 ? 2 : 1;
            const damage = Math.floor(hero.attack * critChance);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Stealth Strike'] = 3;
            return `🕵️‍♀️ ${hero.firstName} lands a Stealth Strike, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 3,
        description: 'Attacks with increased critical chance.'
    },
    'Explosive Arrow': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 1.2);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Explosive Arrow'] = 4;
            return `🏹 ${hero.firstName} fires an Explosive Arrow, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Damages all enemies in a small area.'
    },
    'Web Trap': {
        type: 'control',
        execute: (hero, target) => {
            target.statusEffects.push({ type: 'immobilize', duration: 1 });
            hero.mana -= 25;
            hero.cooldowns['Web Trap'] = 4;
            return `🕸️ ${hero.firstName} uses Web Trap, immobilizing ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Immobilizes an enemy, preventing their next action.'
    },
    'Time Loop': {
        type: 'support',
        execute: (hero, target) => {
            target.health = 100;
            hero.mana -= 30;
            hero.cooldowns['Time Loop'] = 5;
            return `⏳ ${hero.firstName} casts Time Loop, resetting ${target.firstName}'s health!`;
        },
        cooldown: 5,
        description: 'Resets health of one ally to its starting value.'
    },
    'Vibranium Slash': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.4);
            target.health = Math.max(0, target.health - damage);
            hero.health = Math.min(100, hero.health + Math.floor(damage * 0.3));
            hero.mana -= 20;
            hero.cooldowns['Vibranium Slash'] = 3;
            return `🐆 ${hero.firstName} uses Vibranium Slash, dealing ${damage} to ${target.firstName} and healing for ${Math.floor(damage * 0.3)}!`;
        },
        cooldown: 3,
        description: 'Deals damage and absorbs some for self-healing.'
    },
    'Hex Bolt': {
        type: 'debuff',
        execute: (hero, target) => {
            const effect = Math.random() < 0.5 ? 'attack' : 'health';
            const value = Math.floor(target[effect] * 0.2);
            target[effect] = Math.max(1, target[effect] - value);
            hero.mana -= 25;
            hero.cooldowns['Hex Bolt'] = 4;
            return `🪄 ${hero.firstName} casts Hex Bolt, reducing ${target.firstName}'s ${effect} by ${value}!`;
        },
        cooldown: 4,
        description: 'Randomly reduces an enemy’s attack or health.'
    },
    'Giant Stomp': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 2);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 30;
            hero.cooldowns['Giant Stomp'] = 5;
            return `👣 ${hero.firstName} uses Giant Stomp, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 5,
        description: 'Deals massive damage to one enemy.'
    },
    'Adamantium Frenzy': {
        type: 'damage',
        execute: (hero, target) => {
            const hits = 3;
            const damagePerHit = Math.floor(hero.attack * 0.8);
            target.health = Math.max(0, target.health - damagePerHit * hits);
            hero.mana -= 25;
            hero.cooldowns['Adamantium Frenzy'] = 4;
            return `🗡️ ${hero.firstName} unleashes Adamantium Frenzy, hitting ${target.firstName} ${hits} times for ${damagePerHit * hits} total damage!`;
        },
        cooldown: 4,
        description: 'Attacks multiple times in one turn.'
    },
    'Tornado Blast': {
        type: 'control',
        execute: (hero, targets) => {
            targets.forEach(t => t.statusEffects.push({ type: 'delay', duration: 1 }));
            hero.mana -= 30;
            hero.cooldowns['Tornado Blast'] = 5;
            return `🌪️ ${hero.firstName} summons a Tornado Blast, delaying all enemies!`;
        },
        cooldown: 5,
        description: 'Pushes back all enemies, delaying their actions.'
    },
    'Optic Barrage': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 0.9);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Optic Barrage'] = 4;
            return `🔴 ${hero.firstName} fires Optic Barrage, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Hits all enemies with reduced damage.'
    },
    'Mind Crush': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(target.health * 0.3);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 25;
            hero.cooldowns['Mind Crush'] = 4;
            return `🧠 ${hero.firstName} uses Mind Crush, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Deals damage based on target’s remaining health.'
    },
    'Primal Leap': {
        type: 'buff',
        execute: (hero) => {
            hero.attack += 5;
            hero.mana -= 20;
            hero.cooldowns['Primal Leap'] = 3;
            return `🐾 ${hero.firstName} uses Primal Leap, boosting attack by 5!`;
        },
        cooldown: 3,
        description: 'Attacks and boosts own agility for one turn.'
    },
    'Ace of Spades': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.6);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Ace of Spades'] = 3;
            return `🃏 ${hero.firstName} throws Ace of Spades, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 3,
        description: 'Throws a single card for high damage.'
    },
    'Power Drain': {
        type: 'support',
        execute: (hero, target) => {
            const drain = Math.floor(target.health * 0.2);
            target.health = Math.max(0, target.health - drain);
            hero.health = Math.min(100, hero.health + drain);
            hero.mana -= 25;
            hero.cooldowns['Power Drain'] = 4;
            return `🧬 ${hero.firstName} uses Power Drain, stealing ${drain} health from ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Steals health from an enemy to heal self.'
    },
    'Chimichanga Bomb': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.5);
            target.health = Math.max(0, target.health - damage);
            const extra = Math.random() < 0.3 ? ' and stuns them!' : '';
            if (extra) target.statusEffects.push({ type: 'stun', duration: 1 });
            hero.mana -= 25;
            hero.cooldowns['Chimichanga Bomb'] = 4;
            return `🌮 ${hero.firstName} throws a Chimichanga Bomb, dealing ${damage} to ${target.firstName}${extra}!`;
        },
        cooldown: 4,
        description: 'Explosive attack with random extra effects.'
    },
    'Tendril Assault': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 1.1);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Tendril Assault'] = 4;
            return `🕷️ ${hero.firstName} uses Tendril Assault, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Attacks all enemies with symbiote tendrils.'
    },
    'Metal Storm': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.7);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 25;
            hero.cooldowns['Metal Storm'] = 4;
            return `🧲 ${hero.firstName} unleashes Metal Storm, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Crushes one enemy with magnetic force.'
    },
    'Doom’s Curse': {
        type: 'debuff',
        execute: (hero, target) => {
            target.statusEffects.push({ type: 'dot', duration: 3, damage: 10 });
            hero.mana -= 25;
            hero.cooldowns['Doom’s Curse'] = 4;
            return `🪬 ${hero.firstName} casts Doom’s Curse, applying damage over time to ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Applies a damage-over-time effect to one enemy.'
    },
    'Infinity Snap': {
        type: 'damage',
        execute: (hero, target) => {
            if (target.health <= 20) {
                target.health = 0;
                hero.mana -= 50;
                hero.cooldowns['Infinity Snap'] = 6;
                return `💨 ${hero.firstName} uses Infinity Snap, instantly defeating ${target.firstName}!`;
            }
            return `${hero.firstName} attempts Infinity Snap, but ${target.firstName} is too strong!`;
        },
        cooldown: 6,
        description: 'Instantly defeats a weakened enemy.'
    },
    'Illusionary Double': {
        type: 'support',
        execute: (hero) => {
            hero.statusEffects.push({ type: 'decoy', duration: 1 });
            hero.mana -= 20;
            hero.cooldowns['Illusionary Double'] = 3;
            return `🪞 ${hero.firstName} creates an Illusionary Double to absorb one attack!`;
        },
        cooldown: 3,
        description: 'Creates a decoy to absorb one attack.'
    },
    'Data Corruption': {
        type: 'debuff',
        execute: (hero, target) => {
            target.attack = Math.floor(target.attack * 0.8);
            hero.mana -= 25;
            hero.cooldowns['Data Corruption'] = 4;
            return `💾 ${hero.firstName} uses Data Corruption, reducing ${target.firstName}'s attack!`;
        },
        cooldown: 4,
        description: 'Reduces an enemy’s attack permanently.'
    },
    'Cube Surge': {
        type: 'buff',
        execute: (hero, allies) => {
            allies.forEach(a => a.attack += 5);
            hero.mana -= 30;
            hero.cooldowns['Cube Surge'] = 5;
            return `🌌 ${hero.firstName} activates Cube Surge, boosting all allies’ attack by 5!`;
        },
        cooldown: 5,
        description: 'Boosts all allies’ attack for one turn.'
    },
    'Pumpkin Barrage': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 0.8);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Pumpkin Barrage'] = 4;
            return `🎃 ${hero.firstName} throws Pumpkin Barrage, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Throws multiple bombs at random enemies.'
    },
    'Crushing Blow': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.6);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Crushing Blow'] = 3;
            return `👊 ${hero.firstName} lands a Crushing Blow, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 3,
        description: 'Deals high damage to one enemy.'
    },
    'Lucky Strike': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 2);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Lucky Strike'] = 3;
            return `🍀 ${hero.firstName} uses Lucky Strike, critically hitting ${target.firstName} for ${damage}!`;
        },
        cooldown: 3,
        description: 'Guarantees a critical hit on one enemy.'
    },
    'Smoke and Mirrors': {
        type: 'control',
        execute: (hero, targets) => {
            targets.forEach(t => t.statusEffects.push({ type: 'confuse', duration: 1 }));
            hero.mana -= 30;
            hero.cooldowns['Smoke and Mirrors'] = 5;
            return `🎭 ${hero.firstName} casts Smoke and Mirrors, confusing all enemies!`;
        },
        cooldown: 5,
        description: 'Confuses all enemies, reducing accuracy.'
    },
    'Rhino Rush': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 1.3);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Rhino Rush'] = 4;
            return `🦏 ${hero.firstName} charges with Rhino Rush, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Charges through, damaging multiple enemies.'
    },
    'Sandstorm': {
        type: 'debuff',
        execute: (hero, targets) => {
            targets.forEach(t => t.attack = Math.floor(t.attack * 0.9));
            hero.mana -= 25;
            hero.cooldowns['Sandstorm'] = 4;
            return `🏜️ ${hero.firstName} summons a Sandstorm, reducing all enemies’ attack!`;
        },
        cooldown: 4,
        description: 'Blinds enemies, reducing their attack.'
    },
    'Volt Surge': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 1.2);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Volt Surge'] = 4;
            return `⚡️ ${hero.firstName} unleashes Volt Surge, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Chains lightning to hit multiple enemies.'
    },
    'Tentacle Slam': {
        type: 'damage',
        execute: (hero, targets) => {
            const maxTargets = Math.min(3, targets.length);
            const selected = targets.slice(0, maxTargets);
            const damage = Math.floor(hero.attack * 1.4);
            selected.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Tentacle Slam'] = 4;
            return `🐙 ${hero.firstName} uses Tentacle Slam, hitting ${maxTargets} enemies for ${damage} each!`;
        },
        cooldown: 4,
        description: 'Attacks up to three enemies at once.'
    },
    'Hunter’s Trap': {
        type: 'control',
        execute: (hero, target) => {
            target.statusEffects.push({ type: 'immobilize', duration: 2 });
            hero.mana -= 25;
            hero.cooldowns['Hunter’s Trap'] = 4;
            return `🪤 ${hero.firstName} sets a Hunter’s Trap, immobilizing ${target.firstName} for two turns!`;
        },
        cooldown: 4,
        description: 'Immobilizes one enemy for two turns.'
    },
    'Vibro-Pulse': {
        type: 'control',
        execute: (hero, targets) => {
            targets.forEach(t => t.statusEffects.push({ type: 'delay', duration: 1 }));
            hero.mana -= 30;
            hero.cooldowns['Vibro-Pulse'] = 5;
            return `📡 ${hero.firstName} emits a Vibro-Pulse, delaying all enemies!`;
        },
        cooldown: 5,
        description: 'Disrupts all enemies, delaying their actions.'
    },
    'Toxic Tail': {
        type: 'debuff',
        execute: (hero, target) => {
            target.statusEffects.push({ type: 'dot', duration: 3, damage: 8 });
            hero.mana -= 25;
            hero.cooldowns['Toxic Tail'] = 4;
            return `🦂 ${hero.firstName} strikes with Toxic Tail, poisoning ${target.firstName}!`;
        },
        cooldown: 4,
        description: 'Poisons one enemy, dealing damage over time.'
    },
    'Talon Dive': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.6);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Talon Dive'] = 3;
            return `🦅 ${hero.firstName} uses Talon Dive, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 3,
        description: 'Strikes one enemy, ignoring their defenses.'
    }
};

// Defines powerup options for post-wave boosts
const powerups = [
    { name: 'Health Boost', effect: hero => { hero.health = Math.min(100, hero.health + 20); return `${hero.firstName} gains 20 health!`; } },
    { name: 'Attack Boost', effect: hero => { hero.attack += 5; return `${hero.firstName} gains 5 attack!`; } },
    { name: 'Mana Regen', effect: hero => { hero.mana = Math.min(100, hero.mana + 30); return `${hero.firstName} recovers 30 mana!`; } }
];

// Defines achievements for player accomplishments
const achievements = [
    { id: 'wave5', name: 'Wave 5 Survivor', description: 'Reach Wave 5', condition: () => gameState.wave >= 5 },
    { id: 'score1000', name: 'High Scorer', description: 'Score 1000 points', condition: () => gameState.score >= 1000 },
    { id: 'special10', name: 'Specialist', description: 'Use 10 special abilities', condition: () => gameState.specialsUsed >= 10 }
];

// Initializes a hero or enemy with default stats
const initializeCharacter = (player) => ({
    ...player,
    health: 100,
    attack: 20,
    mana: 50,
    cooldowns: {},
    statusEffects: [],
    isAlive: true
});

// Renders a character card in the specified grid
const renderCharacterCard = (character, gridId, isHero = true) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.id = character.id;
    if (character.statusEffects.some(e => e.type === 'damage')) card.classList.add('damaged');
    card.classList.add(`wave-progress-${Math.min(gameState.wave, 3)}`);

    const img = document.createElement('img');
    img.src = character.photo;
    img.alt = `${character.firstName} ${character.lastName}`.trim();
    img.className = 'character-img';
    card.appendChild(img);

    if (isHero) {
        const statsModal = document.createElement('div');
        statsModal.className = 'stats-modal';
        statsModal.innerHTML = `
            <h6>${sanitizeHTML(character.firstName)} ${sanitizeHTML(character.lastName)}</h6>
            <p>Health: ${character.health}</p>
            <p>Attack: ${character.attack}</p>
            <p>Mana: ${character.mana}</p>
            <p>Skill: ${sanitizeHTML(character.skill)}</p>
            <button class="btn btn-action" data-action="attack">Attack</button>
            <button class="btn btn-action" data-action="special" ${character.mana < 20 || Object.values(character.cooldowns).some(cd => cd > 0) ? 'disabled' : ''}>Special</button>
            <button class="btn btn-info-custom" data-action="info">Info</button>
        `;
        card.appendChild(statsModal);
    }

    grid.appendChild(card);
};

// Updates the progress HUD with current game stats
const updateHUD = () => {
    document.getElementById('waveDisplay').textContent = gameState.wave;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('heroesDisplay').textContent = `${gameState.player1Heroes.filter(h => h.isAlive).length}/${gameState.player1Heroes.length}`;
};

// Renders all heroes and enemies
const renderGrids = () => {
    const playerGrid = document.getElementById('player1HeroesGrid');
    const opponentGrid = document.getElementById('opponentGrid');
    if (playerGrid) playerGrid.innerHTML = '';
    if (opponentGrid) opponentGrid.innerHTML = '';
    gameState.player1Heroes.forEach(hero => hero.isAlive && renderCharacterCard(hero, 'player1HeroesGrid'));
    gameState.enemies.forEach(enemy => enemy.isAlive && renderCharacterCard(enemy, 'opponentGrid', false));
};

// Generates enemies for the current wave
const generateEnemies = () => {
    const enemyCount = gameState.wave <= 3 ? gameState.wave + 1 : 4;
    gameState.enemies = [];
    for (let i = 0; i < enemyCount; i++) {
        const randomPlayer = window.players[Math.floor(Math.random() * window.players.length)];
        gameState.enemies.push(initializeCharacter(randomPlayer));
    }
    if (gameState.wave === 3 && gameState.gameMode === 'finalBoss') {
        const thanos = window.players.find(p => p.firstName === 'Thanos');
        if (thanos) gameState.enemies.push(initializeCharacter(thanos));
    }
};

// Handles character attacks
const handleAttack = (hero, target) => {
    if (!hero.isAlive || !target.isAlive) return;
    const damage = Math.floor(hero.attack * (gameState.difficulty === 'easy' ? 1.2 : gameState.difficulty === 'hard' ? 0.8 : 1));
    target.health = Math.max(0, target.health - damage);
    target.isAlive = target.health > 0;
    hero.statusEffects.push({ type: 'damage', duration: 1 });
    gameState.score += 10;
    playSound('attack');
    logMessage(`${hero.firstName} attacks ${target.firstName} for ${damage} damage!`);
    checkGameState();
};

// Handles special ability usage
const handleSpecial = (hero, targets) => {
    if (!hero.isAlive || hero.mana < 20 || Object.values(hero.cooldowns).some(cd => cd > 0)) return;
    const ability = specialAbilities[hero.special];
    if (!ability) return logMessage(`Special ability ${hero.special} not found!`);
    const target = ability.type === 'damage' || ability.type === 'control' || ability.type === 'debuff' ? targets[Math.floor(Math.random() * targets.length)] : hero;
    const message = ability.execute(hero, ability.type === 'damage' || ability.type === 'control' || ability.type === 'debuff' ? target : gameState.player1Heroes);
    gameState.specialsUsed = (gameState.specialsUsed || 0) + 1;
    gameState.score += 50;
    playSound('special');
    logMessage(message);
    checkGameState();
};

// Displays special ability info in a modal
const showSpecialInfo = (hero) => {
    const ability = specialAbilities[hero.special];
    if (!ability) return;
    document.getElementById('specialName').textContent = hero.special;
    document.getElementById('specialDescription').textContent = ability.description;
    document.getElementById('specialUsage').textContent = `Cooldown: ${ability.cooldown} turns, Mana: 20`;
    new bootstrap.Modal(document.getElementById('specialInfoModal')).show();
    playSound('moreInfo');
};

// Updates status effects and cooldowns
const updateStatusEffects = () => {
    [gameState.player1Heroes, gameState.enemies].forEach(group => {
        group.forEach(char => {
            char.statusEffects = char.statusEffects.filter(e => {
                if (e.type === 'dot') char.health = Math.max(0, char.health - e.damage);
                return --e.duration > 0;
            });
            char.isAlive = char.health > 0;
            Object.keys(char.cooldowns).forEach(key => {
                if (--char.cooldowns[key] <= 0) delete char.cooldowns[key];
            });
        });
    });
};

// Checks game state for win/loss conditions
const checkGameState = () => {
    updateStatusEffects();
    renderGrids();
    updateHUD();
    const heroesAlive = gameState.player1Heroes.some(h => h.isAlive);
    const enemiesAlive = gameState.enemies.some(e => e.isAlive);

    if (!heroesAlive) {
        endGame('Defeat! Your heroes have fallen.');
    } else if (!enemiesAlive) {
        gameState.wave++;
        gameState.score += 100;
        showPowerupModal();
        checkAchievements();
    }
};

// Ends the game with a message
const endGame = (message) => {
    document.getElementById('cinematicOverlay').style.display = 'flex';
    document.getElementById('cinematicOverlay').textContent = message;
    document.getElementById('gameOverMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('gameOverModal')).show();
};

// Displays powerup selection modal
const showPowerupModal = () => {
    const optionsDiv = document.getElementById('powerupOptions');
    optionsDiv.innerHTML = '';
    powerups.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-cosmic';
        btn.textContent = p.name;
        btn.onclick = () => {
            gameState.player1Heroes.forEach(h => logMessage(p.effect(h)));
            generateEnemies();
            renderGrids();
            bootstrap.Modal.getInstance(document.getElementById('powerupSelectionModal')).hide();
        };
        optionsDiv.appendChild(btn);
    });
    new bootstrap.Modal(document.getElementById('powerupSelectionModal')).show();
};

// Checks and awards achievements
const checkAchievements = () => {
    achievements.forEach(a => {
        if (!gameState.achievements.includes(a.id) && a.condition()) {
            gameState.achievements.push(a.id);
            const li = document.createElement('li');
            li.textContent = `${a.name}: ${a.description}`;
            document.querySelectorAll('#achievementList').forEach(list => list.appendChild(li.cloneNode(true)));
            logMessage(`Achievement Unlocked: ${a.name}!`);
        }
    });
};

// Handles enemy AI actions
const enemyTurn = () => {
    gameState.enemies.forEach(enemy => {
        if (!enemy.isAlive || enemy.statusEffects.some(e => e.type === 'stun' || e.type === 'immobilize')) return;
        const target = gameState.player1Heroes.filter(h => h.isAlive)[Math.floor(Math.random() * gameState.player1Heroes.filter(h => h.isAlive).length)];
        if (!target) return;
        if (Math.random() < 0.3 && enemy.mana >= 20 && !Object.values(enemy.cooldowns).some(cd => cd > 0)) {
            handleSpecial(enemy, gameState.player1Heroes);
        } else {
            handleAttack(enemy, target);
        }
    });
};

// Initializes the game
const initializeGame = () => {
    if (!window.players || window.players.length < 5) {
        document.getElementById('noHeroesMessage').textContent = 'Not enough heroes available!';
        new bootstrap.Modal(document.getElementById('noHeroesModal')).show();
        return;
    }
    gameState.player1Heroes = window.players.slice(0, 5).map(initializeCharacter);
    gameState.wave = 1;
    gameState.score = 0;
    gameState.specialsUsed = 0;
    generateEnemies();
    renderGrids();
    updateHUD();
    applyTheme();
    if (gameState.isTutorial) showTutorial();
};

// Shows tutorial steps
const showTutorial = () => {
    const steps = [
        'Welcome to Marvel Cosmic Arena! Click a hero’s Attack button to deal damage.',
        'Use Special abilities for powerful effects, but they cost mana and have cooldowns.',
        'Defeat all enemies to advance waves. Choose powerups to boost your heroes.',
        'Survive to face Thanos in Final Boss Mode or endless waves in Infinite Mode!'
    ];
    const content = document.getElementById('tutorialContent');
    const nextBtn = document.querySelector('.next-tutorial-btn');
    content.innerHTML = `<p>${steps[gameState.tutorialStep]}</p>`;
    nextBtn.onclick = () => {
        gameState.tutorialStep++;
        if (gameState.tutorialStep >= steps.length) {
            bootstrap.Modal.getInstance(document.getElementById('tutorialModal')).hide();
            gameState.tutorialStep = 0;
        } else {
            content.innerHTML = `<p>${steps[gameState.tutorialStep]}</p>`;
        }
    };
    new bootstrap.Modal(document.getElementById('tutorialModal')).show();
};

// Event listeners for game controls
document.addEventListener('DOMContentLoaded', () => {
    // Start game on button click or nav link
    document.getElementById('startGameBtn')?.addEventListener('click', () => {
        gameState.gameMode = document.querySelector('input[name="gameMode"]:checked')?.value || 'finalBoss';
        gameState.playerMode = document.querySelector('input[name="playerMode"]:checked')?.value || 'single';
        gameState.difficulty = document.getElementById('difficultySelect')?.value || 'medium';
        gameState.isTutorial = document.getElementById('tutorialCheckbox')?.checked || false;
        if (gameState.gameMode === 'multiplayer' && gameState.playerMode !== 'multi') {
            new bootstrap.Modal(document.getElementById('invalidModeModal')).show();
            return;
        }
        initializeGame();
        bootstrap.Modal.getInstance(document.getElementById('modeSelectionModal'))?.hide();
    });

    // Restart game
    document.getElementById('restartGameBtn')?.addEventListener('click', initializeGame);

    // Save settings
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
        const volume = document.getElementById('soundVolume').value / 100;
        document.querySelectorAll('audio').forEach(a => a.volume = volume);
        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    });

    // Music toggle
    document.getElementById('musicToggle')?.addEventListener('click', () => {
        const music = document.getElementById('backgroundMusic');
        const isPlaying = music.paused;
        if (isPlaying) {
            music.play().catch(e => logMessage(`Music failed to play: ${e.message}`));
            musicToggle.textContent = 'Music: On';
            localStorage.setItem('musicState', 'on');
        } else {
            music.pause();
            musicToggle.textContent = 'Music: Off';
            localStorage.setItem('musicState', 'off');
        }
    });

    // Card interactions
    document.getElementById('player1HeroesGrid')?.addEventListener('click', e => {
        const action = e.target.dataset.action;
        const card = e.target.closest('.character-card');
        if (!card || !action) return;
        const hero = gameState.player1Heroes.find(h => h.id === card.dataset.id);
        if (!hero || !hero.isAlive) return;
        const targets = gameState.enemies.filter(e => e.isAlive);
        if (!targets.length) return;
        if (action === 'attack') {
            handleAttack(hero, targets[Math.floor(Math.random() * targets.length)]);
            enemyTurn();
        } else if (action === 'special') {
            handleSpecial(hero, targets);
            enemyTurn();
        } else if (action === 'info') {
            showSpecialInfo(hero);
        }
    });

    // Next round
    document.getElementById('nextRoundBtn')?.addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('roundCompleteModal')).hide();
        generateEnemies();
        renderGrids();
    });

    // Start game on nav link click
    document.addEventListener('startGame', initializeGame);
});

// Initialize theme on load
applyTheme();