/* JS: Handles Play Singleplayer button in menu.html. Validates heroes, syncs settings, and redirects to game.html. */

/* JS: Warrior image mappings (consistent with game.js for hero validation) */
const warriorImageMap = {
    'Tony Stark': 'imgs/iron_man.png',
    'Steve Rogers': 'imgs/captain_america.png',
    'Thor Odinson': 'imgs/thor.png',
    'Natasha Romanoff': 'imgs/black_widow.png',
    'Clint Barton': 'imgs/hawkeye.png',
    'Peter Parker': 'imgs/spiderman.png',
    'Stephen Strange': 'imgs/doctor_strange.png',
    'T’Challa': 'imgs/black_panther.png',
    'Wanda Maximoff': 'imgs/scarlet_witch.png',
    'Scott Lang': 'imgs/antman.png',
    'James Howlett': 'imgs/wolverine.png',
    'Ororo Munroe': 'imgs/storm.png',
    'Scott Summers': 'imgs/cyclops.png',
    'Jean Grey': 'imgs/jean_grey.png',
    'Henry McCoy': 'imgs/beast.png',
    'Remy LeBeau': 'imgs/gambit.png',
    'Anna Marie': 'imgs/rogue.png',
    'Wade Wilson': 'imgs/deadpool.png',
    'Eddie Brock': 'imgs/venom.png',
    'Max Eisenhardt': 'imgs/magneto.png',
    'Victor Von Doom': 'imgs/doctor_doom.png',
    'Thanos': 'imgs/thanos.png',
    'Loki Laufeyson': 'imgs/loki.png',
    'Ultron': 'imgs/ultron.png',
    'Johann Schmidt': 'imgs/red_skull.png',
    'Norman Osborn': 'imgs/green_goblin.png',
    'Wilson Fisk': 'imgs/kingpin.png',
    'Felicia Hardy': 'imgs/black_cat.png',
    'Quentin Beck': 'imgs/mysterio.png',
    'Aleksei Sytsevich': 'imgs/rhino.png',
    'Flint Marko': 'imgs/sandman.png',
    'Max Dillon': 'imgs/electro.png',
    'Otto Octavius': 'imgs/doctor_octopus.png',
    'Sergei Kravinoff': 'imgs/kraven.png',
    'Herman Schultz': 'imgs/shocker.png',
    'Mac Gargan': 'imgs/scorpion.png',
    'Adrian Toomes': 'imgs/vulture.png'
};

/* JS: Mock dependencies (ensures functionality if external functions are missing) */
if (typeof getPlayerHeroes !== 'function') {
    console.warn('[playSingleplayer.js] Mocking getPlayerHeroes for compatibility.');
    window.getPlayerHeroes = () => {
        try {
            const heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
            return Array.isArray(heroes) ? heroes : [{ realName: 'Tony Stark' }];
        } catch (e) {
            console.error('[playSingleplayer.js] Mock getPlayerHeroes error:', e);
            return [{ realName: 'Tony Stark' }]; // Fallback to default hero
        }
    };
}

if (typeof syncWarriorsToGame !== 'function') {
    console.warn('[playSingleplayer.js] Mocking syncWarriorsToGame for compatibility.');
    window.syncWarriorsToGame = () => {
        try {
            const heroes = getPlayerHeroes();
            const warriors = heroes
                .map(h => h.realName || h.name)
                .filter(w => w && warriorImageMap[w])
                .slice(0, 3); // Limit to 3 heroes
            localStorage.setItem('selectedWarriors', JSON.stringify(warriors.length ? warriors : ['Tony Stark']));
            console.log('[playSingleplayer.js] Warriors synced:', warriors);
        } catch (e) {
            console.error('[playSingleplayer.js] Mock syncWarriorsToGame error:', e);
            localStorage.setItem('selectedWarriors', JSON.stringify(['Tony Stark']));
        }
    };
}

/* JS: Show centered error toast for user feedback */
function showErrorToast(message) {
    try {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.style.backgroundColor = '#dc3545'; // Bootstrap danger color
        toast.style.position = 'fixed';
        toast.style.top = '50%';
        toast.style.left = '50%';
        toast.style.transform = 'translate(-50%, -50%)';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '8px';
        toast.style.color = '#fff';
        toast.style.fontFamily = '"Nunito", sans-serif';
        toast.style.fontSize = 'clamp(0.9rem, 2vw, 1rem)';
        toast.style.zIndex = '3000';
        toast.style.textAlign = 'center';
        toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } catch (e) {
        console.error('[playSingleplayer.js] Error showing toast:', e);
    }
}

/* JS: Debounce function to prevent multiple button clicks */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* JS: Setup Play Singleplayer button with retry logic */
function setupPlayButton(attempt = 1, maxAttempts = 5, baseDelay = 500) {
    console.log(`[playSingleplayer.js] Setting up Play Singleplayer button, attempt ${attempt}/${maxAttempts}.`);
    try {
        const playModeBtn = document.getElementById('playModeBtn');
        if (!playModeBtn) {
            if (attempt < maxAttempts) {
                console.warn('[playSingleplayer.js] playModeBtn not found, retrying after %dms.', baseDelay);
                setTimeout(() => setupPlayButton(attempt + 1, maxAttempts, baseDelay * 1.5), baseDelay);
                return false;
            }
            console.error('[playSingleplayer.js] playModeBtn not found after %d attempts.', maxAttempts);
            showErrorToast('Game button not found. Please reload the page.');
            return false;
        }

        // Initialize button state
        playModeBtn.disabled = true;
        playModeBtn.textContent = 'Loading...';
        playModeBtn.setAttribute('aria-busy', 'true');
        console.log('[playSingleplayer.js] playModeBtn initialized.');

        // Handle button click with debounce
        const handleClick = debounce(() => {
            console.log('[playSingleplayer.js] Play Singleplayer button clicked.');
            try {
                // Disable button during processing
                playModeBtn.disabled = true;
                playModeBtn.textContent = 'Starting...';
                playModeBtn.innerHTML = 'Starting... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

                // Get selected heroes
                const heroes = getPlayerHeroes();
                console.log('[playSingleplayer.js] Selected heroes:', heroes);

                // Validate heroes
                if (!Array.isArray(heroes)) {
                    showErrorToast('Invalid hero selection. Please try again.');
                    playModeBtn.disabled = false;
                    playModeBtn.textContent = 'Play Singleplayer';
                    playModeBtn.removeAttribute('aria-busy');
                    return false;
                }

                if (heroes.length === 0) {
                    showErrorToast('Please select at least one hero.');
                    playModeBtn.disabled = false;
                    playModeBtn.textContent = 'Play Singleplayer';
                    playModeBtn.removeAttribute('aria-busy');
                    return false;
                }

                if (heroes.length > 3) {
                    showErrorToast('Select up to 3 heroes.');
                    playModeBtn.disabled = false;
                    playModeBtn.textContent = 'Play Singleplayer';
                    playModeBtn.removeAttribute('aria-busy');
                    return false;
                }

                const uniqueHeroes = new Set(heroes.map(h => h.realName || h.name));
                if (uniqueHeroes.size !== heroes.length) {
                    showErrorToast('Duplicate heroes are not allowed.');
                    playModeBtn.disabled = false;
                    playModeBtn.textContent = 'Play Singleplayer';
                    playModeBtn.removeAttribute('aria-busy');
                    return false;
                }

                for (const hero of heroes) {
                    const name = hero.realName || hero.name;
                    if (!name || !warriorImageMap[name]) {
                        showErrorToast(`Invalid hero: ${name || 'Unknown'}.`);
                        playModeBtn.disabled = false;
                        playModeBtn.textContent = 'Play Singleplayer';
                        playModeBtn.removeAttribute('aria-busy');
                        return false;
                    }
                }

                // Save game settings
                window.settings = window.settings || {};
                window.settings.playerMode = 'single';
                window.settings.difficulty = document.getElementById('difficultySelect')?.value || 'normal';
                try {
                    localStorage.setItem('gameSettings', JSON.stringify(window.settings));
                    console.log('[playSingleplayer.js] Game settings saved:', window.settings);
                } catch (e) {
                    console.warn('[playSingleplayer.js] Error saving settings:', e);
                    showErrorToast('Failed to save settings. Proceeding anyway.');
                }

                // Clear player 2 heroes (singleplayer mode)
                try {
                    localStorage.setItem('player2Heroes', JSON.stringify([]));
                    console.log('[playSingleplayer.js] Player 2 heroes cleared.');
                } catch (e) {
                    console.warn('[playSingleplayer.js] Error clearing player 2 heroes:', e);
                }

                // Sync warriors to game
                syncWarriorsToGame();
                console.log('[playSingleplayer.js] Warriors synced to game.');

                // Redirect to game.html
                const gameUrl = './game.html?' + Date.now(); // Cache-busting timestamp
                console.log('[playSingleplayer.js] Redirecting to %s.', gameUrl);
                window.location.href = gameUrl;

                // Fallback redirect if navigation stalls
                setTimeout(() => {
                    if (window.location.pathname.includes('menu.html')) {
                        console.warn('[playSingleplayer.js] Redirect failed, forcing navigation.');
                        window.location.assign(gameUrl);
                    }
                }, 1000);

                return true;
            } catch (e) {
                console.error('[playSingleplayer.js] Error handling button click:', e);
                showErrorToast('Failed to start game. Please try again.');
                playModeBtn.disabled = false;
                playModeBtn.textContent = 'Play Singleplayer';
                playModeBtn.removeAttribute('aria-busy');
                return false;
            }
        }, 300); // Debounce for 300ms

        // Attach event listener
        playModeBtn.addEventListener('click', handleClick);
        console.log('[playSingleplayer.js] Click listener attached to playModeBtn.');

        // Enable button after setup
        playModeBtn.disabled = false;
        playModeBtn.textContent = 'Play Singleplayer';
        playModeBtn.removeAttribute('aria-busy');
        return true;
    } catch (e) {
        console.error('[playSingleplayer.js] Error setting up playModeBtn:', e);
        if (attempt < maxAttempts) {
            console.warn('[playSingleplayer.js] Retrying setup after %dms.', baseDelay * 1.5);
            setTimeout(() => setupPlayButton(attempt + 1, maxAttempts, baseDelay * 1.5), baseDelay * 1.5);
            return false;
        }
        showErrorToast('Failed to initialize game button. Please reload.');
        return false;
    }
}

/* JS: Initialize on DOM load */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[playSingleplayer.js] DOM loaded, initializing play button.');
    setupPlayButton();
});