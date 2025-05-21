// Sound URLs for game audio effects and background music
const soundURLs = {
    attack: 'https://cdn.freesound.org/previews/171/171104_2432228-lq.mp3',
    special: 'https://cdn.freesound.org/previews/344/344690_5762272-lq.mp3',
    select: 'https://cdn.freesound.org/previews/270/270306_4761266-lq.mp3',
    moreInfo: 'https://cdn.freesound.org/previews/242/242804_3159293-lq.mp3',
    background: 'https://cdn.freesound.org/previews/511/511484_9156144-lq.mp3'
};

// Default heroes to ensure spawning if sessionStorage is empty
const defaultHeroes = [
    { firstName: 'Iron Man', photo: 'https://via.placeholder.com/150?text=Iron+Man', special: 'Unibeam:Heavy damage' },
    { firstName: 'Thor', photo: 'https://via.placeholder.com/150?text=Thor', special: 'Thunder Strike:Area damage' },
    { firstName: 'Captain America', photo: 'https://via.placeholder.com/150?text=Captain+America', special: 'Time Warp:Control' }
];

// Plays a sound with volume control and haptic feedback
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

// Announces text via text-to-speech for accessibility
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

// Game state object to track wave, score, heroes, and settings
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
};

// Defines special abilities for heroes with their effects
const specialAbilities = {
    'Unibeam': {
        type: 'damage',
        execute: (hero, target) => {
            const damage = Math.floor(hero.attack * 1.5);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            hero.cooldowns['Unibeam'] = 3;
            return `💥 ${hero.firstName} fires Unibeam, dealing ${damage} to ${target.firstName}!`;
        },
        cooldown: 3,
        description: 'Deals heavy damage to a single enemy.'
    },
    'Thunder Strike': {
        type: 'damage',
        execute: (hero, targets) => {
            const damage = Math.floor(hero.attack * 1.2);
            targets.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            hero.cooldowns['Thunder Strike'] = 4;
            return `⚡ ${hero.firstName} unleashes Thunder Strike, hitting all enemies for ${damage}!`;
        },
        cooldown: 4,
        description: 'Deals moderate damage to all enemies.'
    },
    'Time Warp': {
        type: 'control',
        execute: (hero) => {
            gameState.statusEffects.set('enemies', [{ type: 'skip', duration: 1 }]);
            hero.mana -= 30;
            hero.cooldowns['Time Warp'] = 5;
            return `⏳ ${hero.firstName} casts Time Warp, delaying enemy actions!`;
        },
        cooldown: 5,
        description: 'Skips enemy turn for one round.'
    }
};

// Templates for enemy characters with stats and abilities
const enemyTemplates = [
    { id: 'enemy1', firstName: 'Loki', health: 80, attack: 15, photo: 'https://via.placeholder.com/150?text=Loki', special: 'Illusion:Confuses heroes' },
    { id: 'enemy2', firstName: 'Ultron', health: 100, attack: 20, photo: 'https://via.placeholder.com/150?text=Ultron', special: 'Hack:Disables specials' },
    { id: 'enemy3', firstName: 'Thanos', health: 150, attack: 30, photo: 'https://via.placeholder.com/150?text=Thanos', special: 'Snap:Halves hero health' }
];

// Powerups available after clearing waves to boost heroes
const powerups = [
    { name: 'Health Boost', effect: (heroes) => heroes.forEach(h => h.health = Math.min(100, h.health + 25)), description: 'Restores 25 health to all heroes.' },
    { name: 'Attack Boost', effect: (heroes) => heroes.forEach(h => h.attack += 7), description: 'Increases attack by 7 for all heroes.' },
    { name: 'Shield', effect: (heroes) => heroes.forEach(h => h.statusEffects.push({ type: 'shield', duration: 2 })), description: 'Grants a shield for 2 turns.' }
];

// Achievements for player milestones with rewards
const achievements = [
    { id: 'wave5', name: 'Wave 5 Reached', condition: () => gameState.wave >= 5, reward: 500 },
    { id: '10kills', name: '10 Enemies Defeated', condition: () => gameState.score >= 1000, reward: 1000 }
];

// Cache DOM elements for performance and repeated access
const DOMCache = {
    player1HeroesGrid: document.getElementById('player1HeroesGrid'),
    opponentGrid: document.getElementById('opponentGrid'),
    gameLog: document.getElementById('gameLog'),
    achievementList: document.getElementById('achievementList'),
    waveDisplay: document.getElementById('waveDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    heroesDisplay: document.getElementById('heroesDisplay'),
    cinematicOverlay: document.getElementById('cinematicOverlay')
};

// Debounces a function to prevent rapid executions (e.g., button spam)
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Updates the HUD with current game stats (wave, score, heroes)
const updateHUD = () => {
    try {
        if (!DOMCache.waveDisplay || !DOMCache.scoreDisplay || !DOMCache.heroesDisplay) {
            throw new Error('HUD elements missing');
        }
        DOMCache.waveDisplay.textContent = gameState.wave;
        DOMCache.scoreDisplay.textContent = gameState.score;
        DOMCache.heroesDisplay.textContent = `${gameState.player1Heroes.filter(h => h.health > 0).length}/${gameState.player1Heroes.length}`;
    } catch (e) {
        console.warn('updateHUD error:', e);
        logMessage(`Error updating HUD: ${e.message}`);
    }
};

// Appends a message to the game log with a timestamp
const logMessage = (message) => {
    try {
        if (!DOMCache.gameLog) throw new Error('Game log element not found');
        const timestamp = new Date().toLocaleTimeString();
        const p = document.createElement('p');
        p.textContent = `[${timestamp}] ${message}`;
        DOMCache.gameLog.appendChild(p);
        DOMCache.gameLog.scrollTop = DOMCache.gameLog.scrollHeight;
    } catch (e) {
        console.warn('logMessage error:', e);
    }
};

// Renders a character card (hero or enemy) in the specified container
const renderCard = (character, isHero, container, index) => {
    try {
        if (!container || !character || !character.firstName || !character.photo) {
            throw new Error(`Invalid character data for ${character?.firstName || 'unknown'}`);
        }
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.index = index;
        // Apply wave progress class based on current wave (1 to 3 for finalBoss mode)
        card.classList.add(`wave-progress-${Math.min(gameState.wave, 3)}`);
        const img = new Image();
        img.src = character.photo;
        img.alt = character.firstName;
        img.className = 'character-img';
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/150?text=Placeholder';
            logMessage(`Image failed for ${character.firstName}. Using fallback.`);
        };
        img.onload = () => {
            const health = character.health || 100;
            const attack = character.attack || 15;
            const mana = isHero ? (character.mana || 100) : null;
            card.innerHTML = `
                <div class="stats-modal">
                    <h6>${character.firstName}</h6>
                    <p>Health: ${health}</p>
                    <p>Attack: ${attack}</p>
                    ${isHero ? `
                        <p>Mana: ${mana}</p>
                        <button class="btn btn-action attack-btn" data-index="${index}" aria-label="Attack with ${character.firstName}" ${health <= 0 ? 'disabled' : ''}>Attack</button>
                        <button class="btn btn-action special-btn" data-index="${index}" aria-label="Use special ability of ${character.firstName}" ${health <= 0 || mana < 20 || character.cooldowns[character.special?.split(':')[0]] ? 'disabled' : ''}>Special</button>
                        <button class="btn btn-info-custom more-info-btn" data-index="${index}" aria-label="More info on ${character.firstName}">More Info</button>
                    ` : ''}
                </div>
            `;
            card.prepend(img);
            container.appendChild(card);
            logMessage(`Rendered ${isHero ? 'hero' : 'enemy'} card: ${character.firstName}`);
        };
        setTimeout(() => {
            if (!card.parentNode) {
                img.src = 'https://via.placeholder.com/150?text=Placeholder';
                logMessage(`Image load timeout for ${character.firstName}.`);
            }
        }, 2000);
    } catch (e) {
        console.warn('renderCard error:', e);
        logMessage(`Error rendering card: ${e.message}`);
    }
};

// Renders hero and enemy grids by clearing and repopulating cards
const renderGame = () => {
    try {
        if (!DOMCache.player1HeroesGrid || !DOMCache.opponentGrid) {
            throw new Error('Grid elements missing');
        }
        DOMCache.player1HeroesGrid.innerHTML = '';
        DOMCache.opponentGrid.innerHTML = '';
        gameState.player1Heroes.forEach((hero, i) => {
            if (validateHero(hero)) {
                renderCard(hero, true, DOMCache.player1HeroesGrid, i);
            } else {
                logMessage(`Skipped invalid hero at index ${i}`);
            }
        });
        gameState.enemies.forEach((enemy, i) => renderCard(enemy, false, DOMCache.opponentGrid, i));
        updateHUD();
        if (DOMCache.player1HeroesGrid.children.length === 0) logMessage('No hero cards rendered');
        if (DOMCache.opponentGrid.children.length === 0) logMessage('No enemy cards rendered');
    } catch (e) {
        console.warn('renderGame error:', e);
        logMessage(`Error rendering game: ${e.message}`);
    }
};

// Applies a shake animation to a card when damaged
const applyDamageAnimation = (index, isHero) => {
    try {
        const container = isHero ? DOMCache.player1HeroesGrid : DOMCache.opponentGrid;
        const card = container?.children[index];
        if (!card) throw new Error('Card not found for animation');
        card.classList.add('damaged');
        setTimeout(() => card.classList.remove('damaged'), 500);
    } catch (e) {
        console.warn('applyDamageAnimation error:', e);
        logMessage(`Error applying damage animation: ${e.message}`);
    }
};

// Displays cinematic overlay for victory or loss messages
const showCinematic = (message, isVictory) => {
    try {
        if (!DOMCache.cinematicOverlay) throw new Error('Cinematic overlay missing');
        DOMCache.cinematicOverlay.textContent = message;
        DOMCache.cinematicOverlay.style.display = 'flex';
        DOMCache.cinematicOverlay.className = isVictory ? 'animate__animated animate__zoomIn VictoryTxt' : 'animate__animated animate__fadeOut LossTxt';
        setTimeout(() => DOMCache.cinematicOverlay.style.display = 'none', 2000);
    } catch (e) {
        console.warn('showCinematic error:', e);
        logMessage(`Error showing cinematic: ${e.message}`);
    }
};

// Checks and unlocks achievements based on game progress
const checkAchievements = () => {
    try {
        if (!DOMCache.achievementList) throw new Error('Achievement list missing');
        achievements.forEach(a => {
            if (!localStorage.getItem(a.id) && a.condition()) {
                localStorage.setItem(a.id, 'true');
                gameState.score += a.reward;
                const li = document.createElement('li');
                li.textContent = `${a.name} (+${a.reward} points)`;
                DOMCache.achievementList.appendChild(li);
                logMessage(`Achievement Unlocked: ${a.name}`);
            }
        });
    } catch (e) {
        console.warn('checkAchievements error:', e);
        logMessage(`Error checking achievements: ${e.message}`);
    }
};

// Applies status effects (e.g., skip, shield) to targets
const applyStatusEffects = (target) => {
    try {
        const effects = gameState.statusEffects.get(target) || [];
        let skip = false;
        let shield = false;
        effects.forEach(e => {
            if (e.type === 'skip' && e.duration > 0) {
                e.duration--;
                skip = true;
            }
            if (e.type === 'shield' && e.duration > 0) {
                e.duration--;
                shield = true;
            }
            if (e.type === 'rage' && e.duration > 0) {
                e.duration--;
                target.attack = Math.floor(target.attack * 1.2);
            }
            if (e.type === 'regen' && e.duration > 0) {
                e.duration--;
                target.health = Math.min(100, target.health + 10);
            }
        });
        gameState.statusEffects.set(target, effects.filter(e => e.duration > 0));
        return { skip, shield };
    } catch (e) {
        console.warn('applyStatusEffects error:', e);
        logMessage(`Error applying status effects: ${e.message}`);
        return { skip: false, shield: false };
    }
};

// Handles enemy turn actions, including attacks and specials
const enemyTurn = () => {
    try {
        if (applyStatusEffects('enemies').skip) {
            logMessage('Enemies delayed by Time Warp!');
            return;
        }
        gameState.enemies.forEach((enemy, i) => {
            if (enemy.health <= 0) return;
            const target = gameState.player1Heroes.find(h => h.health > 0);
            if (!target) return;
            if (Math.random() < 0.1) {
                switch (enemy.firstName) {
                    case 'Loki':
                        gameState.player1Heroes.forEach(h => h.statusEffects.push({ type: 'skip', duration: 1 }));
                        logMessage(`${enemy.firstName} uses Illusion, confusing heroes!`);
                        break;
                    case 'Ultron':
                        gameState.player1Heroes.forEach(h => {
                            if (h.special) h.cooldowns[h.special.split(':')[0]] = 2;
                        });
                        logMessage(`${enemy.firstName} uses Hack, disabling specials!`);
                        break;
                    case 'Thanos':
                        gameState.player1Heroes.forEach(h => h.health = Math.max(1, Math.floor(h.health / 2)));
                        logMessage(`${enemy.firstName} uses Snap, halving hero health!`);
                        break;
                }
            } else {
                const { shield } = applyStatusEffects(target);
                const damage = Math.floor(enemy.attack * (gameState.difficulty === 'easy' ? 0.8 : gameState.difficulty === 'hard' ? 1.2 : 1));
                if (!shield) {
                    target.health = Math.max(0, target.health - damage);
                    logMessage(`${enemy.firstName} attacks ${target.firstName} for ${damage} damage!`);
                    applyDamageAnimation(gameState.player1Heroes.indexOf(target), true);
                } else {
                    logMessage(`${target.firstName}'s shield blocks ${enemy.firstName}'s attack!`);
                }
            }
        });
        renderGame();
        checkGameOver();
    } catch (e) {
        console.warn('enemyTurn error:', e);
        logMessage(`Error during enemy turn: ${e.message}`);
    }
};

// Checks for game over conditions (win/loss)
const checkGameOver = () => {
    try {
        const heroesAlive = gameState.player1Heroes.some(h => h.health > 0);
        const enemiesAlive = gameState.enemies.some(e => e.health > 0);
        if (!heroesAlive) {
            showCinematic('Defeat!', false);
            speak('Game over. You have been defeated.');
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('gameOverModal'));
            document.getElementById('gameOverMessage').textContent = `Game Over! Your score: ${gameState.score}`;
            modal.show();
        } else if (!enemiesAlive) {
            showCinematic('Victory!', true);
            gameState.score += gameState.wave * 200;
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('roundCompleteModal'));
            document.getElementById('roundCompleteMessage').textContent = `Wave ${gameState.wave} cleared! Score: ${gameState.score}`;
            modal.show();
        }
    } catch (e) {
        console.warn('checkGameOver error:', e);
        logMessage(`Error checking game over: ${e.message}`);
    }
};

// Starts a new wave by spawning enemies
const startWave = () => {
    try {
        speak(`Wave ${gameState.wave} begins!`);
        gameState.enemies = Array.from({ length: Math.min(gameState.wave + 1, 4) }, () => {
            const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
            const enemy = { ...template, health: template.health, attack: template.attack, statusEffects: [] };
            if (gameState.wave > 5 && Math.random() < 0.3) {
                enemy.statusEffects.push(Math.random() < 0.5 ? { type: 'rage', duration: 3 } : { type: 'regen', duration: 3 });
            }
            return enemy;
        });
        if (gameState.gameMode === 'finalBoss' && gameState.wave === 3) {
            gameState.enemies = [{ ...enemyTemplates[2], health: 150, attack: 30, statusEffects: [] }];
        }
        gameState.player1Heroes.forEach(h => {
            h.cooldowns = {};
            h.mana = 100;
        });
        renderGame();
        logMessage(`Started wave ${gameState.wave} with ${gameState.enemies.length} enemies`);
    } catch (e) {
        console.warn('startWave error:', e);
        logMessage(`Error starting wave: ${e.message}`);
    }
};

// Applies a selected powerup to heroes
const applyPowerup = (powerup) => {
    try {
        powerup.effect(gameState.player1Heroes);
        logMessage(`Powerup applied: ${powerup.name}`);
        gameState.wave++;
        startWave();
    } catch (e) {
        console.warn('applyPowerup error:', e);
        logMessage(`Error applying powerup: ${e.message}`);
    }
};

// Shows powerup selection modal after a wave
const showPowerupSelection = () => {
    try {
        if (gameState.gameMode === 'multiplayer') {
            gameState.wave++;
            startWave();
            logMessage('Multiplayer mode: Skipping powerup selection');
            return;
        }
        const options = powerups.sort(() => Math.random() - 0.5).slice(0, 3);
        const powerupOptions = document.getElementById('powerupOptions');
        if (!powerupOptions) throw new Error('Powerup options element missing');
        powerupOptions.innerHTML = options.map(p => `
            <div class="powerup-option">
                <h6>${p.name}</h6>
                <p>${p.description}</p>
                <button class="btn btn-cosmic select-powerup" data-name="${p.name}" aria-label="Select ${p.name} powerup">Select</button>
            </div>
        `).join('');
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('powerupSelectionModal'));
        modal.show();
    } catch (e) {
        console.warn('showPowerupSelection error:', e);
        logMessage(`Error showing powerup selection: ${e.message}`);
    }
};

// Handles hero attack action against a random enemy
const handleAttack = debounce((heroIndex, targetIndex) => {
    try {
        const hero = gameState.player1Heroes[heroIndex];
        const target = gameState.enemies[targetIndex];
        if (!hero || !target || hero.health <= 0 || target.health <= 0) {
            throw new Error('Invalid attack action');
        }
        const { shield } = applyStatusEffects(target);
        const damage = Math.floor(hero.attack * (gameState.difficulty === 'easy' ? 1.2 : gameState.difficulty === 'hard' ? 0.8 : 1));
        if (!shield) {
            target.health = Math.max(0, target.health - damage);
            logMessage(`${hero.firstName} attacks ${target.firstName} for ${damage} damage!`);
            applyDamageAnimation(targetIndex, false);
        } else {
            logMessage(`${target.firstName}'s shield blocks ${hero.firstName}'s attack!`);
        }
        gameState.score += 100;
        playSound('attack');
        renderGame();
        checkAchievements();
        checkGameOver();
        if (gameState.enemies.some(e => e.health > 0)) {
            setTimeout(enemyTurn, 500);
        }
    } catch (e) {
        console.warn('handleAttack error:', e);
        logMessage(`Error during attack: ${e.message}`);
    }
}, 300);

// Handles hero special ability usage
const handleSpecial = debounce((heroIndex) => {
    try {
        const hero = gameState.player1Heroes[heroIndex];
        if (!hero || hero.health <= 0 || hero.mana < 20 || hero.cooldowns[hero.special?.split(':')[0]]) {
            throw new Error('Invalid special action');
        }
        const abilityName = hero.special.split(':')[0];
        const ability = specialAbilities[abilityName];
        if (!ability) throw new Error(`Ability ${abilityName} not found`);
        const targets = ability.type === 'damage' ? gameState.enemies.filter(e => e.health > 0) : [];
        const message = ability.execute(hero, targets.length > 1 ? targets : targets[0] || gameState.enemies[0]);
        logMessage(message);
        gameState.score += 50;
        playSound('special');
        renderGame();
        checkAchievements();
        checkGameOver();
        if (gameState.enemies.some(e => e.health > 0)) {
            setTimeout(enemyTurn, 500);
        }
    } catch (e) {
        console.warn('handleSpecial error:', e);
        logMessage(`Error using special ability: ${e.message}`);
    }
}, 300);

// Displays special ability info in a modal
const handleMoreInfo = debounce((heroIndex) => {
    try {
        const hero = gameState.player1Heroes[heroIndex];
        if (!hero) throw new Error('Hero not found for info');
        const abilityName = hero.special?.split(':')[0];
        if (!abilityName || !specialAbilities[abilityName]) {
            throw new Error(`No ability info for ${hero.firstName}`);
        }
        document.getElementById('specialName').textContent = abilityName;
        document.getElementById('specialDescription').textContent = specialAbilities[abilityName].description || 'No description available';
        document.getElementById('specialUsage').textContent = `Cooldown: ${specialAbilities[abilityName].cooldown} turns, Mana: 20`;
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('specialInfoModal'));
        modal.show();
        playSound('moreInfo');
    } catch (e) {
        console.warn('handleMoreInfo error:', e);
        logMessage(`Error showing ability info: ${e.message}`);
    }
}, 300);

// Saves game settings (volume, skins, vibration)
const handleSettings = () => {
    try {
        const soundVolume = document.getElementById('soundVolume').value / 100;
        document.querySelectorAll('audio').forEach(a => a.volume = soundVolume);
        const skin = document.getElementById('skinSelect').value;
        gameState.player1Heroes.forEach(h => h.photo = `https://via.placeholder.com/150?text=${h.firstName}+${skin}`);
        renderGame();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('settingsModal')).hide();
        logMessage('Settings saved');
    } catch (e) {
        console.warn('handleSettings error:', e);
        logMessage(`Error saving settings: ${e.message}`);
    }
};

// Advances tutorial steps in the tutorial modal
const advanceTutorial = () => {
    try {
        const steps = [
            '<p>Hover over a hero to see their stats.</p>',
            '<p>Click Attack to deal damage to a random enemy.</p>',
            '<p>Use Special for powerful abilities (requires mana).</p>',
            '<p>Click More Info for ability details.</p>'
        ];
        if (gameState.tutorialStep < steps.length - 1) {
            gameState.tutorialStep++;
            document.getElementById('tutorialContent').innerHTML = steps[gameState.tutorialStep];
        } else {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('tutorialModal')).hide();
            gameState.isTutorial = false;
            logMessage('Tutorial completed');
        }
    } catch (e) {
        console.warn('advanceTutorial error:', e);
        logMessage(`Error advancing tutorial: ${e.message}`);
    }
};

// Validates hero data for rendering
const validateHero = (hero) => {
    try {
        return hero &&
            typeof hero.firstName === 'string' && hero.firstName.trim() &&
            typeof hero.photo === 'string' && hero.photo.trim() &&
            typeof hero.special === 'string' && hero.special.trim();
    } catch (e) {
        console.warn('validateHero error:', e);
        logMessage(`Error validating hero: ${e.message}`);
        return false;
    }
};

// Starts the game with default settings and spawns heroes/enemies
const startGame = () => {
    try {
        gameState.playerMode = 'single';
        gameState.gameMode = 'finalBoss';
        gameState.difficulty = 'medium';
        gameState.isTutorial = false;

        let rawHeroes1 = [];
        try {
            rawHeroes1 = JSON.parse(sessionStorage.getItem('player1Heroes') || '[]');
            if (!Array.isArray(rawHeroes1)) rawHeroes1 = [];
        } catch (e) {
            console.warn('Failed to parse sessionStorage:', e);
            logMessage(`Error loading heroes from storage: ${e.message}`);
            rawHeroes1 = [];
        }

        gameState.player1Heroes = (rawHeroes1.length > 0 ? rawHeroes1 : defaultHeroes)
            .filter(validateHero)
            .map(h => ({
                ...h,
                health: 100,
                attack: 15,
                mana: 100,
                cooldowns: {},
                statusEffects: []
            }));

        gameState.player2Heroes = [];
        if (gameState.player1Heroes.length === 0) {
            logMessage('No valid heroes. Using default heroes');
            gameState.player1Heroes = defaultHeroes.map(h => ({
                ...h,
                health: 100,
                attack: 15,
                mana: 100,
                cooldowns: {},
                statusEffects: []
            }));
        }

        gameState.wave = 1;
        gameState.score = 0;
        gameState.tutorialStep = 0;
        gameState.statusEffects.clear();

        startWave();
        logMessage(`Game started with ${gameState.player1Heroes.length} heroes`);

        if (localStorage.getItem('musicState') === 'on') {
            playSound('background');
        }
    } catch (e) {
        console.warn('startGame error:', e);
        logMessage(`Error starting game: ${e.message}`);
    }
};

// Initializes event listeners for game interactions
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Start the game on page load
        startGame();

        // Custom event for starting the game via navbar link
        document.addEventListener('startGame', startGame);

        // Start game button (unused due to auto-start, but included for compatibility)
        document.getElementById('startGameBtn')?.addEventListener('click', startGame);

        // Proceed to next round after wave completion
        document.getElementById('nextRoundBtn')?.addEventListener('click', () => {
            try {
                bootstrap.Modal.getOrCreateInstance(document.getElementById('roundCompleteModal')).hide();
                showPowerupSelection();
            } catch (e) {
                console.warn('nextRoundBtn error:', e);
                logMessage(`Error proceeding to next round: ${e.message}`);
            }
        });

        // Restart the game from scratch
        document.getElementById('restartGameBtn')?.addEventListener('click', () => {
            try {
                gameState.wave = 1;
                gameState.score = 0;
                startGame();
                logMessage('Game restarted');
            } catch (e) {
                console.warn('restartGameBtn error:', e);
                logMessage(`Error restarting game: ${e.message}`);
            }
        });

        // Toggle background music on/off
        document.getElementById('musicToggle')?.addEventListener('click', () => {
            try {
                const music = document.getElementById('backgroundMusic');
                const musicToggle = document.getElementById('musicToggle');
                if (!music || !musicToggle) throw new Error('Music elements missing');
                if (music.paused) {
                    music.play().catch(e => logMessage(`Error playing music: ${e.message}`));
                    musicToggle.textContent = 'Music: On';
                    localStorage.setItem('musicState', 'on');
                } else {
                    music.pause();
                    musicToggle.textContent = 'Music: Off';
                    localStorage.setItem('musicState', 'off');
                }
            } catch (e) {
                console.warn('musicToggle error:', e);
                logMessage(`Error toggling music: ${e.message}`);
            }
        });

        // Theme toggle (disabled in UI as per design)
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            logMessage('Theme toggle disabled');
        });

        // Save settings from settings modal
        document.getElementById('saveSettingsBtn')?.addEventListener('click', handleSettings);

        // Advance tutorial steps in the tutorial modal
        document.querySelector('.next-tutorial-btn')?.addEventListener('click', advanceTutorial);

        // Handle powerup selection from the powerup modal
        document.getElementById('powerupOptions')?.addEventListener('click', (e) => {
            try {
                const button = e.target.closest('.select-powerup');
                if (!button) return;
                const powerupName = button.dataset.name;
                const powerup = powerups.find(p => p.name === powerupName);
                if (!powerup) throw new Error(`Powerup ${powerupName} not found`);
                applyPowerup(powerup);
                bootstrap.Modal.getOrCreateInstance(document.getElementById('powerupSelectionModal')).hide();
                logMessage(`Selected powerup: ${powerupName}`);
            } catch (e) {
                console.warn('powerupSelection error:', e);
                logMessage(`Error selecting powerup: ${e.message}`);
            }
        });

        // Handle hero actions (attack, special, more info) on hero grid clicks
        document.getElementById('player1HeroesGrid')?.addEventListener('click', (e) => {
            try {
                const button = e.target.closest('.btn');
                if (!button) return;
                const index = parseInt(button.dataset.index);
                if (isNaN(index)) throw new Error('Invalid hero index');
                if (button.classList.contains('attack-btn')) {
                    const targetIndex = Math.floor(Math.random() * gameState.enemies.filter(e => e.health > 0).length);
                    if (isNaN(targetIndex)) throw new Error('No valid enemy targets');
                    handleAttack(index, targetIndex);
                } else if (button.classList.contains('special-btn')) {
                    handleSpecial(index);
                } else if (button.classList.contains('more-info-btn')) {
                    handleMoreInfo(index);
                }
            } catch (e) {
                console.warn('player1HeroesGrid click error:', e);
                logMessage(`Error in hero action: ${e.message}`);
            }
        });

        // Keyboard controls for attacks and specials ('A' for attack, 'S' for special)
        document.addEventListener('keydown', (e) => {
            try {
                if (gameState.isTutorial) return; // Disable keyboard controls during tutorial
                const hero = gameState.player1Heroes.find(h => h.health > 0);
                if (!hero) return; // No alive heroes to act
                const index = gameState.player1Heroes.indexOf(hero);
                if (e.key === 'a' || e.key === 'A') {
                    const targetIndex = Math.floor(Math.random() * gameState.enemies.filter(e => e.health > 0).length);
                    if (!isNaN(targetIndex)) handleAttack(index, targetIndex);
                } else if (e.key === 's' || e.key === 'S') {
                    handleSpecial(index);
                }
            } catch (e) {
                console.warn('keydown error:', e);
                logMessage(`Error in keyboard input: ${e.message}`);
            }
        });
    } catch (e) {
        console.warn('DOMContentLoaded error:', e);
        logMessage(`Error initializing game: ${e.message}`);
    }
});