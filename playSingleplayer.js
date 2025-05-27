/* JS: Handles Play Singleplayer button in menu.html.
 * Validates 1–3 heroes, redirects to game.html.
 * Updated for reliability with retries and mocks.
 */

/* JS: Mock dependencies if undefined */
if (typeof getPlayerHeroes !== 'function') {
    console.warn('[playSingleplayer.js] Mocking getPlayerHeroes.');
    window.getPlayerHeroes = (player) => {
        try {
            return JSON.parse(localStorage.getItem(`${player}Heroes`) || '[]');
        } catch (e) {
            return [];
        }
    };
}
if (typeof syncWarriorsToGame !== 'function') {
    console.warn('[playSingleplayer.js] Mocking syncWarriorsToGame.');
    window.syncWarriorsToGame = () => {
        try {
            const heroes = getPlayerHeroes('player1');
            const warriors = heroes.map(h => h.realName || 'Unknown');
            localStorage.setItem('selectedWarriors', JSON.stringify(warriors));
        } catch (e) {
            console.error('[playSingleplayer.js] Mock sync error:', e);
        }
    };
}

/* JS: Setup button with retries */
function setupPlayButton(attempt = 1, maxAttempts = 5) {
    console.log('[playSingleplayer.js] Setup attempt %d/%d.', attempt, maxAttempts);
    try {
        const playModeBtn = document.getElementById('playModeBtn');
        if (!playModeBtn) {
            if (attempt < maxAttempts) {
                console.warn('[playSingleplayer.js] playModeBtn not found, retrying.');
                setTimeout(() => setupPlayButton(attempt + 1, maxAttempts), 500);
                return false;
            }
            console.error('[playSingleplayer.js] playModeBtn not found after %d attempts.', maxAttempts);
            return false;
        }

        console.log('[playSingleplayer.js] playModeBtn found.');
        playModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[playSingleplayer.js] Button clicked.');

            try {
                const player1Heroes = getPlayerHeroes('player1');
                console.log('[playSingleplayer.js] Heroes:', player1Heroes);

                if (!Array.isArray(player1Heroes) || player1Heroes.length === 0) {
                    console.warn('[playSingleplayer.js] No heroes selected.');
                    return;
                }
                if (player1Heroes.length > 3) {
                    console.warn('[playSingleplayer.js] Too many heroes:', player1Heroes.length);
                    return;
                }

                window.settings = window.settings || {};
                window.settings.playerMode = 'single';
                try {
                    localStorage.setItem('gameSettings', JSON.stringify(window.settings));
                    console.log('[playSingleplayer.js] Settings saved.');
                } catch (e) {
                    console.warn('[playSingleplayer.js] Settings save error:', e);
                }

                try {
                    localStorage.setItem('player2Heroes', JSON.stringify([]));
                    console.log('[playSingleplayer.js] Player 2 cleared.');
                } catch (e) {
                    console.warn('[playSingleplayer.js] Player 2 clear error:', e);
                }

                syncWarriorsToGame();
                console.log('[playSingleplayer.js] Heroes synced.');

                const gameUrl = './game.html?' + new Date().getTime();
                console.log('[playSingleplayer.js] Redirecting to %s.', gameUrl);
                window.location.href = gameUrl;

                setTimeout(() => {
                    if (window.location.href.includes('menu.html')) {
                        console.warn('[playSingleplayer.js] Redirect failed, retrying.');
                        window.location.assign(gameUrl);
                    }
                }, 1000);

            } catch (e) {
                console.error('[playSingleplayer.js] Click error:', e);
            }
        });
        console.log('[playSingleplayer.js] Listener attached.');
        return true;
    } catch (e) {
        console.error('[playSingleplayer.js] Setup error:', e);
        if (attempt < maxAttempts) {
            setTimeout(() => setupPlayButton(attempt + 1, maxAttempts), 500);
            return false;
        }
        return false;
    }
}

/* JS: Start setup */
console.log('[playSingleplayer.js] Loaded.');
setupPlayButton();