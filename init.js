/* JS: Initializes Galaxy BattleForge UI, settings, saved game data, and accessibility for a single-player campaign.
 * Supports 40 Marvel heroes fighting sci-fi enemies, integrates with game.js, and uses Bootstrap 5.3.2 for modals.
 */

/* JS: Configuration constants for initialization */
const CONFIG = {
    RETRY_DELAY: 100, // Delay for retrying Game object check in milliseconds
    MODAL_IDS: ['gameOverModal', 'settingsModal', 'loadGameModal'] // IDs of modals to initialize
};

/* JS: Preloads warrior and enemy images to enhance performance */
const preloadImages = () => {
    try {
        if (!window.Game || !Game.warriorImageMap || !Game.enemyImageMap) {
            console.warn('[initGame.js] Game or image maps not ready for preloading');
            return;
        }
        const images = [...Object.values(Game.warriorImageMap), ...Object.values(Game.enemyImageMap)];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onerror = () => console.warn(`[initGame.js] Failed to preload image: ${src}`);
        });
        console.log('[initGame.js] Images preloaded successfully');
    } catch (e) {
        console.error('[initGame.js] Error preloading images:', e);
    }
};

/* JS: Initializes Bootstrap tooltips with accessibility attributes */
const initTooltips = () => {
    try {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(element => {
            new bootstrap.Tooltip(element, { trigger: 'hover' });
            element.setAttribute('aria-label', element.getAttribute('title') || 'Interactive element tooltip');
        });
        console.log('[initGame.js] Tooltips initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing tooltips:', e);
    }
};

/* JS: Populates the load game modal with saved game data */
const loadSavedGames = () => {
    try {
        const savedGamesList = document.getElementById('savedGamesList');
        if (!savedGamesList) throw new Error('[initGame.js] savedGamesList element not found');
        savedGamesList.innerHTML = '';
        const savedState = JSON.parse(localStorage.getItem('gameState'));
        if (savedState) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.style.cursor = 'pointer';
            listItem.setAttribute('aria-label', 'Load saved game');
            const saveDate = savedState.timestamp ? new Date(savedState.timestamp).toLocaleString() : new Date().toLocaleString();
            listItem.textContent = `Wave ${savedState.wave} - Score: ${savedState.score} - ${saveDate}`;
            listItem.addEventListener('click', () => {
                Game.loadGame();
                bootstrap.Modal.getInstance(document.getElementById('loadGameModal'))?.hide();
                console.log('[initGame.js] Loaded saved game');
            });
            savedGamesList.appendChild(listItem);
        } else {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item text-muted';
            listItem.textContent = 'No saved game found.';
            savedGamesList.appendChild(listItem);
        }
    } catch (e) {
        console.error('[initGame.js] Error loading saved games:', e);
        const savedGamesList = document.getElementById('savedGamesList');
        if (savedGamesList) {
            savedGamesList.innerHTML = '<li class="list-group-item text-muted">Error loading saved games.</li>';
        }
    }
};

/* JS: Initializes settings modal with saved or default values */
const initSettings = () => {
    try {
        const settings = JSON.parse(localStorage.getItem('gameSettings')) || {};
        const soundVolumeInput = document.getElementById('soundVolume');
        const voiceSpeedInput = document.getElementById('voiceSpeed');
        const skinSelect = document.getElementById('skinSelect');
        const vibrationCheckbox = document.getElementById('vibrationCheckbox');

        if (!soundVolumeInput || !voiceSpeedInput || !skinSelect || !vibrationCheckbox) {
            throw new Error('[initGame.js] Settings input elements not found');
        }

        // Apply saved or default settings
        soundVolumeInput.value = Math.max(0, Math.min(100, settings.soundVolume || 50));
        voiceSpeedInput.value = Math.max(0.5, Math.min(2, settings.voiceSpeed || 1));
        skinSelect.value = settings.skin || 'default';
        vibrationCheckbox.checked = !!settings.vibration;
        Game.applySkin(settings.skin || 'default');

        // Add accessibility attributes
        soundVolumeInput.setAttribute('aria-label', 'Adjust sound volume');
        voiceSpeedInput.setAttribute('aria-label', 'Adjust voice narration speed');
        skinSelect.setAttribute('aria-label', 'Select visual theme');
        vibrationCheckbox.setAttribute('aria-label', 'Toggle haptic feedback');

        // Bind save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                const newSettings = {
                    soundVolume: parseInt(soundVolumeInput.value),
                    voiceSpeed: parseFloat(voiceSpeedInput.value),
                    skin: skinSelect.value,
                    vibration: vibrationCheckbox.checked
                };
                localStorage.setItem('gameSettings', JSON.stringify(newSettings));
                Game.applySkin(newSettings.skin);
                bootstrap.Modal.getInstance(document.getElementById('settingsModal'))?.hide();
                Game.log('Settings saved successfully');
                console.log('[initGame.js] Settings saved:', newSettings);
            });
        }
        console.log('[initGame.js] Settings initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing settings:', e);
        Game.log('Failed to initialize settings');
    }
};

/* JS: Sets up game log and sidebar with accessibility */
const initGameLog = () => {
    try {
        const gameLog = document.getElementById('gameLog');
        const sidebar = document.querySelector('.side-panel');
        if (!gameLog || !sidebar) throw new Error('[initGame.js] Game log or sidebar not found');
        gameLog.setAttribute('aria-live', 'polite');
        sidebar.setAttribute('aria-expanded', 'true');
        sidebar.classList.add('show');

        const toggleBtn = document.querySelector('.toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isExpanded = sidebar.classList.contains('show');
                sidebar.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            });
        }
        console.log('[initGame.js] Game log and sidebar initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing game log:', e);
    }
};

/* JS: Initializes Bootstrap modals for game interactions */
const initModals = () => {
    try {
        CONFIG.MODAL_IDS.forEach(modalId => {
            const element = document.getElementById(modalId);
            if (element) {
                new bootstrap.Modal(element);
                element.setAttribute('aria-labelledby', `${modalId}Label`);
                console.log(`[initGame.js] Initialized modal: ${modalId}`);
            } else {
                console.warn(`[initGame.js] Modal ${modalId} not found in DOM`);
            }
        });
    } catch (e) {
        console.error('[initGame.js] Error initializing modals:', e);
    }
};

/* JS: Binds event listeners for UI buttons */
const initEventListeners = () => {
    try {
        const loadGameBtn = document.getElementById('loadGameBtn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                loadSavedGames();
                new bootstrap.Modal(document.getElementById('loadGameModal')).show();
                console.log('[initGame.js] Load game modal opened');
            });
        } else {
            console.warn('[initGame.js] loadGameBtn not found');
        }

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                new bootstrap.Modal(document.getElementById('settingsModal')).show();
                console.log('[initGame.js] Settings modal opened');
            });
        } else {
            console.warn('[initGame.js] settingsBtn not found');
        }
    } catch (e) {
        console.error('[initGame.js] Error initializing event listeners:', e);
    }
};

/* JS: Initializes the entire game UI, ensuring Game object is available */
const initializeGameUI = (attempt = 1, maxAttempts = 5) => {
    try {
        if (!window.Game) {
            if (attempt < maxAttempts) {
                console.warn(`[initGame.js] Game object not found, retrying attempt ${attempt}/${maxAttempts}`);
                setTimeout(() => initializeGameUI(attempt + 1, maxAttempts), CONFIG.RETRY_DELAY);
                return;
            }
            throw new Error('[initGame.js] Game object not found after max attempts');
        }
        preloadImages();
        initTooltips();
        initSettings();
        initGameLog();
        initModals();
        initEventListeners();
        Game.loadSavedWarriors();
        Game.updateUI();
        console.log('[initGame.js] Game UI initialized successfully at', new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }));
    } catch (e) {
        console.error('[initGame.js] Error initializing game UI:', e);
        alert('Failed to initialize game. Please check console for details.');
    }
};

/* JS: Start initialization on DOM load */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[initGame.js] DOM loaded, starting UI initialization at', new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }));
    initializeGameUI();
});