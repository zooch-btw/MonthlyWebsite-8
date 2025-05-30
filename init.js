/* JS: Initializes Galaxy BattleForge UI, settings, saved game data, and accessibility for a single-player campaign.
 * Supports 40 Marvel heroes fighting sci-fi enemies, integrates with game.js, and uses Bootstrap 5.3.2 for modals.
 */

/* JS: Configuration constants for initialization */
const CONFIG = {
    RETRY_DELAY: 100, // Delay for retrying Game object check in milliseconds
    MODAL_IDS: [
        'gameModeModal',
        'gameOverModal',
        'victoryModal',
        'settingsModal',
        'loadGameModal',
        'powerupModal',
        'achievementsModal',
        'specialAchievementsModal',
        'saveGameModal'
    ], // IDs of modals to initialize
    MAX_ATTEMPTS: 5 // Maximum attempts to find Game object
};

/* JS: Preloads hero and enemy images to enhance performance */
const preloadImages = () => {
    try {
        if (!window.Game || !Game.heroImageMap || !Game.enemyImageMap) {
            console.warn('[initGame.js] Game or image maps not ready for preloading');
            return;
        }
        const images = [...Object.values(Game.heroImageMap), ...Object.values(Game.enemyImageMap)];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onerror = () => console.warn(`[initGame.js] Failed to preload image: ${src}`);
        });
        console.log('[initGame.js] Images preloaded successfully');
    } catch (e) {
        console.error('[initGame.js] Error preloading images:', e);
        alert('Failed to preload game assets. Some images may not load correctly.');
    }
};

/* JS: Initializes Bootstrap tooltips with accessibility attributes */
const initTooltips = () => {
    try {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(element => {
            new bootstrap.Tooltip(element, { trigger: 'hover focus' });
            element.setAttribute('aria-label', element.getAttribute('title') || 'Interactive element tooltip');
            element.setAttribute('tabindex', '0');
        });
        console.log('[initGame.js] Tooltips initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing tooltips:', e);
        Game.log('Failed to initialize tooltips');
    }
};

/* JS: Populates the load game modal with saved game data */
const loadSavedGames = () => {
    try {
        const savedGamesList = document.getElementById('savedGamesList');
        if (!savedGamesList) throw new Error('[initGame.js] savedGamesList element not found');
        savedGamesList.innerHTML = '';

        const savedState = JSON.parse(localStorage.getItem('gameSave'));
        if (savedState && savedState.wave && savedState.score && Array.isArray(savedState.warriors)) {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.style.cursor = 'pointer';
            listItem.setAttribute('aria-label', 'Load saved game');
            listItem.setAttribute('tabindex', '0');

            const saveDate = savedState.timestamp ? new Date(savedState.timestamp).toLocaleString() : new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
            const warriorNames = savedState.warriors.map(w => w.name).join(', ');
            listItem.textContent = `Wave ${savedState.wave} - Score: ${savedState.score} - Team: ${warriorNames} - ${saveDate}`;

            listItem.addEventListener('click', () => {
                Game.loadGame();
                bootstrap.Modal.getInstance(document.getElementById('loadGameModal'))?.hide();
                Game.log('Loaded saved game');
                console.log('[initGame.js] Loaded saved game');
            });
            listItem.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') listItem.click();
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
        Game.log('Failed to load saved games');
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
        const soundEffectsCheckbox = document.getElementById('soundEffectsCheckbox');
        const highContrastCheckbox = document.getElementById('highContrastCheckbox');

        if (!soundVolumeInput || !voiceSpeedInput || !skinSelect || !vibrationCheckbox || !soundEffectsCheckbox || !highContrastCheckbox) {
            throw new Error('[initGame.js] Settings input elements not found');
        }

        // Apply saved or default settings
        soundVolumeInput.value = Math.max(0, Math.min(100, settings.soundVolume || 50));
        voiceSpeedInput.value = Math.max(0.5, Math.min(2, settings.voiceSpeed || 1));
        skinSelect.value = settings.skin || 'default';
        vibrationCheckbox.checked = !!settings.vibration;
        soundEffectsCheckbox.checked = settings.soundEffects !== false;
        highContrastCheckbox.checked = !!settings.highContrast;

        // Apply settings to game
        Game.applySkin(settings.skin || 'default');
        if (settings.highContrast) document.body.classList.add('high-contrast');
        Object.values(Game.soundEffects).forEach(sound => {
            sound.volume = (soundVolumeInput.value / 100) * (soundEffectsCheckbox.checked ? 1 : 0);
        });

        // Add accessibility attributes
        soundVolumeInput.setAttribute('aria-label', 'Adjust sound volume (0 to 100)');
        voiceSpeedInput.setAttribute('aria-label', 'Adjust voice narration speed (0.5 to 2)');
        skinSelect.setAttribute('aria-label', 'Select visual theme');
        vibrationCheckbox.setAttribute('aria-label', 'Toggle haptic feedback');
        soundEffectsCheckbox.setAttribute('aria-label', 'Toggle sound effects');
        highContrastCheckbox.setAttribute('aria-label', 'Toggle high-contrast mode');

        // Bind save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                const newSettings = {
                    soundVolume: parseInt(soundVolumeInput.value),
                    voiceSpeed: parseFloat(voiceSpeedInput.value),
                    skin: skinSelect.value,
                    vibration: vibrationCheckbox.checked,
                    soundEffects: soundEffectsCheckbox.checked,
                    highContrast: highContrastCheckbox.checked
                };
                localStorage.setItem('gameSettings', JSON.stringify(newSettings));
                Game.applySkin(newSettings.skin);
                document.body.classList.toggle('high-contrast', newSettings.highContrast);
                Object.values(Game.soundEffects).forEach(sound => {
                    sound.volume = (newSettings.soundVolume / 100) * (newSettings.soundEffects ? 1 : 0);
                });
                bootstrap.Modal.getInstance(document.getElementById('settingsModal'))?.hide();
                Game.log('Settings saved successfully');
                console.log('[initGame.js] Settings saved:', newSettings);
            });
        }
        console.log('[initGame.js] Settings initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing settings:', e);
        Game.log('Failed to initialize settings');
        alert('Failed to load settings. Using default values.');
    }
};

/* JS: Sets up game log and sidebar with accessibility */
const initGameLog = () => {
    try {
        const gameLog = document.getElementById('gameLog');
        const sidebar = document.querySelector('.side-panel');
        if (!gameLog || !sidebar) throw new Error('[initGame.js] Game log or sidebar not found');

        gameLog.setAttribute('aria-live', 'polite');
        gameLog.setAttribute('role', 'log');
        sidebar.setAttribute('aria-expanded', 'true');
        sidebar.classList.add('show');

        const toggleBtn = document.querySelector('.toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
            toggleBtn.addEventListener('click', () => {
                const isExpanded = sidebar.classList.toggle('show');
                sidebar.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            });
        }
        console.log('[initGame.js] Game log and sidebar initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing game log:', e);
        Game.log('Failed to initialize game log');
    }
};

/* JS: Initializes Bootstrap modals for game interactions */
const initModals = () => {
    try {
        CONFIG.MODAL_IDS.forEach(modalId => {
            const element = document.getElementById(modalId);
            if (element) {
                new bootstrap.Modal(element, { backdrop: modalId === 'gameModeModal' ? 'static' : true });
                element.setAttribute('aria-labelledby', `${modalId}Label`);
                element.querySelectorAll('.modal-header .btn-close').forEach(btn => {
                    btn.setAttribute('aria-label', 'Close modal');
                });
                console.log(`[initGame.js] Initialized modal: ${modalId}`);
            } else {
                console.warn(`[initGame.js] Modal ${modalId} not found in DOM`);
            }
        });
    } catch (e) {
        console.error('[initGame.js] Error initializing modals:', e);
        Game.log('Failed to initialize modals');
    }
};

/* JS: Binds event listeners for UI buttons and game mode selection */
const initEventListeners = () => {
    try {
        const buttons = [
            {
                id: 'loadGameBtn', handler: () => {
                    loadSavedGames();
                    new bootstrap.Modal(document.getElementById('loadGameModal')).show();
                    console.log('[initGame.js] Load game modal opened');
                }
            },
            {
                id: 'settingsBtn', handler: () => {
                    new bootstrap.Modal(document.getElementById('settingsModal')).show();
                    console.log('[initGame.js] Settings modal opened');
                }
            },
            {
                id: 'saveGameBtn', handler: () => {
                    Game.saveGame();
                    console.log('[initGame.js] Save game triggered');
                }
            },
            {
                id: 'restartGameBtn', handler: () => {
                    Game.restart();
                    console.log('[initGame.js] Game restart triggered');
                }
            },
            {
                id: 'themeToggle', handler: () => {
                    Game.toggleTheme();
                    console.log('[initGame.js] Theme toggled');
                }
            },
            {
                id: 'achievementsBtn', handler: () => {
                    Game.showAchievements();
                    console.log('[initGame.js] Achievements modal opened');
                }
            },
            {
                id: 'specialAchievementsBtn', handler: () => {
                    Game.showSpecialAchievements();
                    console.log('[initGame.js] Special achievements modal opened');
                }
            }
        ];

        buttons.forEach(({ id, handler }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
                btn.setAttribute('aria-label', id.replace(/Btn$/, '').replace(/([A-Z])/g, ' $1').trim());
                btn.setAttribute('tabindex', '0');
            } else {
                console.warn(`[initGame.js] Button ${id} not found`);
            }
        });

        // Game mode selection buttons
        const modeButtons = [
            { id: 'infiniteModeBtn', mode: 'infinite' },
            { id: 'finalModeBtn', mode: 'final' },
            { id: 'mirrorModeBtn', mode: 'mirror' }
        ];

        modeButtons.forEach(({ id, mode }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    Game.switchMode(mode);
                    bootstrap.Modal.getInstance(document.getElementById('gameModeModal'))?.hide();
                    Game.log(`Switched to ${mode} mode`);
                    console.log(`[initGame.js] Switched to ${mode} mode`);
                });
                btn.setAttribute('aria-label', `Select ${mode} game mode`);
                btn.setAttribute('tabindex', '0');
            } else {
                console.warn(`[initGame.js] Mode button ${id} not found`);
            }
        });

        // Add keyboard navigation for buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    btn.click();
                    e.preventDefault();
                }
            });
        });

        console.log('[initGame.js] Event listeners initialized');
    } catch (e) {
        console.error('[initGame.js] Error initializing event listeners:', e);
        Game.log('Failed to initialize event listeners');
    }
};

/* JS: Initializes the entire game UI, ensuring Game object is available */
const initializeGameUI = (attempt = 1) => {
    try {
        if (!window.Game) {
            if (attempt < CONFIG.MAX_ATTEMPTS) {
                console.warn(`[initGame.js] Game object not found, retrying attempt ${attempt}/${CONFIG.MAX_ATTEMPTS}`);
                setTimeout(() => initializeGameUI(attempt + 1), CONFIG.RETRY_DELAY);
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
        Game.log('Game UI initialized successfully');

        // Log initialization time
        const initTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
        console.log(`[initGame.js] Game UI initialized successfully at ${initTime}`);

        // Ensure gameModeModal is shown if no mode is set
        if (!localStorage.getItem('gameMode')) {
            new bootstrap.Modal(document.getElementById('gameModeModal'), {
                backdrop: 'static',
                keyboard: false
            }).show();
        }
    } catch (e) {
        console.error('[initGame.js] Error initializing game UI:', e);
        alert('Failed to initialize game. Please check console for details or try refreshing the page.');
        Game.log('Failed to initialize game UI');
    }
};

/* JS: Start initialization on DOM load */
document.addEventListener('DOMContentLoaded', () => {
    const startTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    console.log(`[initGame.js] DOM loaded, starting UI initialization at ${startTime}`);
    initializeGameUI();
});