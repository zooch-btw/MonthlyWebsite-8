/* JS: Manages the Play Singleplayer button in menu.html. Validates selected heroes, synchronizes settings, and navigates to game.html. */

/* JS: Configuration constants for retry logic and debouncing */
const CONFIG = {
    MAX_ATTEMPTS: 5, // Maximum retry attempts for DOM element lookup
    BASE_RETRY_DELAY: 500, // Base delay for retries in milliseconds
    DEBOUNCE_WAIT: 300 // Debounce delay for button clicks in milliseconds
};

/* JS: Maps real names to hero names for consistency across game.js, warriorAbilitiesAndStats.js, and players.js */
const realNameToHeroName = {
    'Tony Stark': 'Iron Man',
    'Steve Rogers': 'Captain America',
    'Thor Odinson': 'Thor',
    'Natasha Romanoff': 'Black Widow',
    'Clint Barton': 'Hawkeye',
    'Peter Parker': 'Spider-Man',
    'Stephen Strange': 'Doctor Strange',
    'T’Challa': 'Black Panther',
    'Wanda Maximoff': 'Scarlet Witch',
    'Scott Lang': 'Ant-Man',
    'James Howlett': 'Wolverine',
    'Ororo Munroe': 'Storm',
    'Scott Summers': 'Cyclops',
    'Jean Grey': 'Jean Grey',
    'Henry McCoy': 'Beast',
    'Remy LeBeau': 'Gambit',
    'Anna Marie': 'Rogue',
    'Wade Wilson': 'Deadpool',
    'Eddie Brock': 'Venom',
    'Max Eisenhardt': 'Magneto',
    'Victor Von Doom': 'Doctor Doom',
    'Thanos': 'Thanos',
    'Loki Laufeyson': 'Loki',
    'Ultron': 'Ultron',
    'Johann Schmidt': 'Red Skull',
    'Norman Osborn': 'Green Goblin',
    'Wilson Fisk': 'Kingpin',
    'Felicia Hardy': 'Black Cat',
    'Quentin Beck': 'Mysterio',
    'Aleksei Sytsevich': 'Rhino',
    'Flint Marko': 'Sandman',
    'Max Dillon': 'Electro',
    'Otto Octavius': 'Doctor Octopus',
    'Sergei Kravinoff': 'Kraven',
    'Herman Schultz': 'Shocker',
    'Mac Gargan': 'Scorpion',
    'Adrian Toomes': 'Vulture',
    'Bruce Banner': 'Hulk', // Added Hulk
    'Lester': 'Bullseye', // Added Bullseye
    'Bucky Barnes': 'Winter Soldier' // Added Winter Soldier
};

/* JS: Warrior image mappings with fallback to ensure all heroes have an image path */
const warriorImageMap = window.warriorImageMap || {
    'Iron Man': 'imgs/iron man.png',
    'Captain America': 'imgs/capam.png',
    'Thor': 'imgs/thor.png',
    'Black Widow': 'imgs/widow.png',
    'Hawkeye': 'imgs/hawkeye.png',
    'Spider-Man': 'imgs/spiderman.png',
    'Doctor Strange': 'imgs/strange.png',
    'Black Panther': 'imgs/panther.png',
    'Scarlet Witch': 'imgs/witch.png',
    'Ant-Man': 'imgs/antman.png',
    'Wolverine': 'imgs/bub.png',
    'Storm': 'imgs/storm.png',
    'Cyclops': 'imgs/scott.png',
    'Jean Grey': 'imgs/jean.png',
    'Beast': 'imgs/beast.png',
    'Gambit': 'imgs/gambit.png',
    'Rogue': 'imgs/rogue.png',
    'Deadpool': 'imgs/wade.png',
    'Venom': 'imgs/venom.png',
    'Magneto': 'imgs/max.png',
    'Doctor Doom': 'imgs/doom.png',
    'Thanos': 'imgs/thanos.png',
    'Loki': 'imgs/loki.png',
    'Ultron': 'imgs/ai.png',
    'Red Skull': 'imgs/skull.png',
    'Green Goblin': 'imgs/osborn.png',
    'Kingpin': 'imgs/fisk.png',
    'Black Cat': 'imgs/cat.png',
    'Mysterio': 'imgs/illusion.png',
    'Rhino': 'imgs/rhino.png',
    'Sandman': 'imgs/sand.png',
    'Electro': 'imgs/dillon.png',
    'Doctor Octopus': 'imgs/ock.png',
    'Kraven': 'imgs/hunt.png',
    'Shocker': 'imgs/shock.png',
    'Scorpion': 'imgs/sting.png',
    'Vulture': 'imgs/prey.png',
    'Hulk': 'imgs/hulk.png', // Added Hulk
    'Bullseye': 'imgs/bullseye.png', // Added Bullseye
    'Winter Soldier': 'imgs/winter.png' // Added Winter Soldier
};

/* JS: Retrieves selected heroes from localStorage with fallback to Iron Man */
const getPlayerHeroes = () => {
    try {
        const heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
        if (!Array.isArray(heroes) || heroes.length === 0) {
            console.warn('[playSingleplayer.js] No valid heroes in localStorage, defaulting to Iron Man');
            return [{ realName: 'Tony Stark' }];
        }
        return heroes;
    } catch (e) {
        console.error('[playSingleplayer.js] Error parsing player1Heroes:', e);
        return [{ realName: 'Tony Stark' }]; // Fallback to Iron Man
    }
};

/* JS: Synchronizes validated hero names to localStorage for game.js */
const syncWarriorsToGame = () => {
    try {
        const heroes = getPlayerHeroes();
        const warriors = heroes
            .map(h => realNameToHeroName[h.realName] || h.name)
            .filter(w => w && warriorImageMap[w] && window.warriorBaseStats?.[w] && window.specialAbilities?.[w])
            .slice(0, 3); // Limit to 3 heroes
        const selected = warriors.length > 0 ? warriors : ['Iron Man'];
        localStorage.setItem('selectedWarriors', JSON.stringify(selected));
        console.log('[playSingleplayer.js] Synced warriors:', selected);
    } catch (e) {
        console.error('[playSingleplayer.js] Error in syncWarriorsToGame:', e);
        localStorage.setItem('selectedWarriors', JSON.stringify(['Iron Man']));
    }
};

/* JS: Displays an error toast notification at bottom-right with accessibility */
const showError = (message) => {
    try {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--vibrant-red, #e63946)',
            color: 'var(--star-white, #f1faee)',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: '1000',
            fontFamily: '"Nunito", sans-serif',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } catch (e) {
        console.error('[playSingleplayer.js] Error displaying toast:', e);
    }
};

/* JS: Debounces a function to prevent rapid executions */
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/* JS: Sets up the Play Singleplayer button with hero validation and navigation */
const setupPlayButton = (attempt = 1, maxAttempts = CONFIG.MAX_ATTEMPTS, baseDelay = CONFIG.BASE_RETRY_DELAY) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    console.log(`[playSingleplayer.js] Setting up Play Singleplayer button, attempt ${attempt}/${maxAttempts} at ${timestamp}`);
    try {
        const playModeBtn = document.getElementById('playModeBtn');
        if (!playModeBtn) {
            if (attempt < maxAttempts) {
                console.warn('[playSingleplayer.js] playModeBtn not found, retrying...');
                setTimeout(() => setupPlayButton(attempt + 1, maxAttempts, baseDelay * 1.5), baseDelay);
                return false;
            }
            showError('Cosmic Error: Game button not found. Please reload!');
            return false;
        }

        // Initialize button state
        playModeBtn.disabled = true;
        playModeBtn.textContent = 'Loading...';
        playModeBtn.setAttribute('aria-busy', 'true');

        // Check for required game data
        if (!window.warriorBaseStats || !window.specialAbilities) {
            console.warn('[playSingleplayer.js] Game data missing, defaulting to Iron Man');
            localStorage.setItem('selectedWarriors', JSON.stringify(['Iron Man']));
            window.location.href = `./game.html?${Date.now()}`;
            return true;
        }

        // Debounced click handler
        const handleClick = debounce(() => {
            console.log('[playSingleplayer.js] Play button clicked, validating heroes...');
            playModeBtn.disabled = true;
            playModeBtn.textContent = 'Starting...';
            playModeBtn.innerHTML = 'Starting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

            const heroes = getPlayerHeroes();
            console.log('[playSingleplayer.js] Selected heroes:', heroes);

            // Validate hero array
            if (!Array.isArray(heroes) || heroes.length === 0) {
                showError('Cosmic Warning: No heroes selected. Defaulting to Iron Man!');
                localStorage.setItem('selectedWarriors', JSON.stringify(['Iron Man']));
                window.location.href = `./game.html?${Date.now()}`;
                return;
            }

            // Check hero count
            if (heroes.length > 3) {
                showError('Cosmic Error: Select up to 3 heroes only!');
                playModeBtn.disabled = false;
                playModeBtn.textContent = 'Play Singleplayer';
                playModeBtn.removeAttribute('aria-busy');
                return;
            }

            // Validate unique heroes
            const heroNames = heroes.map(h => realNameToHeroName[h.realName] || h.name).filter(Boolean);
            const uniqueHeroes = new Set(heroNames);
            if (uniqueHeroes.size !== heroNames.length) {
                showError('Cosmic Error: Duplicate heroes detected!');
                playModeBtn.disabled = false;
                playModeBtn.textContent = 'Play Singleplayer';
                playModeBtn.removeAttribute('aria-busy');
                return;
            }

            // Validate hero data
            for (const heroName of heroNames) {
                if (!heroName || !warriorImageMap[heroName] || !window.warriorBaseStats?.[heroName] || !window.specialAbilities?.[heroName]) {
                    showError(`Cosmic Error: ${heroName || 'Unknown'} is not a valid hero!`);
                    playModeBtn.disabled = false;
                    playModeBtn.textContent = 'Play Singleplayer';
                    playModeBtn.removeAttribute('aria-busy');
                    return;
                }
            }

            // Save settings and navigate
            console.log('[playSingleplayer.js] Validation passed, redirecting to game.html...');
            window.settings = { ...window.settings, playerMode: 'single' };
            const difficulty = document.getElementById('difficultySelect')?.value || 'normal';
            window.settings.difficulty = difficulty;
            localStorage.setItem('gameSettings', JSON.stringify(window.settings));
            localStorage.setItem('player2Heroes', JSON.stringify([]));
            syncWarriorsToGame();

            const gameUrl = `game.html?${Date.now()}`;
            window.location.href = gameUrl;
            setTimeout(() => {
                if (window.location.pathname.includes('menu.html')) {
                    console.warn('[playSingleplayer.js] Redirect failed, forcing navigation...');
                    window.location.assign(gameUrl);
                }
            }, 1000);
        }, CONFIG.DEBOUNCE_WAIT);

        // Attach event listener
        playModeBtn.addEventListener('click', handleClick);
        playModeBtn.disabled = false;
        playModeBtn.textContent = 'Play Singleplayer';
        playModeBtn.removeAttribute('aria-busy');
        console.log('[playSingleplayer.js] Play button setup complete.');
        return true;
    } catch (e) {
        console.error('[playSingleplayer.js] Error setting up playModeBtn:', e);
        if (attempt < maxAttempts) {
            setTimeout(() => setupPlayButton(attempt + 1, maxAttempts, baseDelay * 1.5), baseDelay * 1.5);
            return false;
        }
        showError('Cosmic Error: Failed to initialize game button. Please reload!');
        return false;
    }
};

/* JS: Initialize play button on DOM load */
document.addEventListener('DOMContentLoaded', () => {
    const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    console.log(`[playSingleplayer.js] DOM loaded, initializing play button at ${timestamp}`);
    setupPlayButton();
});