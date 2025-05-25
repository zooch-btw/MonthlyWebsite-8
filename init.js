/* JavaScript: Initialize Galaxy BattleForge UI, settings, saved game data, and accessibility.
 * Sets up the single-player campaign with 37 Marvel heroes as warriors fighting sci-fi enemies.
 * Compatible with game.js and provided HTML, using Bootstrap 5.3.2 for modals.
 */

/* Preload warrior and enemy images to improve performance */
function preloadImages() {
    try {
        // Ensure Game object and image maps are defined
        if (!window.Game || !Game.warriorImageMap || !Game.enemyImageMap) {
            console.warn('Game or image maps not ready for preloading');
            return;
        }
        const images = Object.values(Game.warriorImageMap).concat(Object.values(Game.enemyImageMap)); // Get all image paths
        images.forEach(src => {
            const img = new Image(); // Create image object
            img.src = src; // Set source
            img.onerror = () => console.warn(`Failed to preload image: ${src}`); // Log error on failure
        });
    } catch (e) {
        console.error('Error preloading images:', e);
    }
}

/* Set up Bootstrap tooltips for interactive elements with accessibility */
function initTooltips() {
    try {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]'); // Get elements with tooltips
        tooltipTriggerList.forEach(element => {
            new bootstrap.Tooltip(element, { trigger: 'hover' }); // Initialize Bootstrap tooltip
            // Add descriptive ARIA label based on title or default
            element.setAttribute('aria-label', element.getAttribute('title') || 'Interactive element tooltip');
        });
    } catch (e) {
        console.error('Error initializing tooltips:', e);
    }
}

/* Load saved game state for the load game modal */
function loadSavedGames() {
    try {
        const savedGamesList = document.getElementById('savedGamesList'); // Get saved games container
        if (!savedGamesList) throw new Error('savedGamesList element not found');
        savedGamesList.innerHTML = ''; // Clear existing list
        const savedState = JSON.parse(localStorage.getItem('gameState')); // Get single saved state
        if (savedState) {
            const listItem = document.createElement('li'); // Create list item
            listItem.className = 'list-group-item'; // Set Bootstrap class
            listItem.style.cursor = 'pointer'; // Indicate clickable
            listItem.setAttribute('aria-label', 'Load saved game'); // Add ARIA label
            // Use timestamp or current date if missing
            const saveDate = savedState.timestamp ? new Date(savedState.timestamp).toLocaleString() : new Date().toLocaleString();
            listItem.textContent = `Wave ${savedState.wave} - Score: ${savedState.score} - ${saveDate}`; // Display game info
            listItem.addEventListener('click', () => {
                Game.loadGame(); // Load the saved game
                bootstrap.Modal.getInstance(document.getElementById('loadGameModal'))?.hide(); // Hide modal
            });
            savedGamesList.appendChild(listItem); // Add to list
        } else {
            const listItem = document.createElement('li'); // Create placeholder item
            listItem.className = 'list-group-item text-muted'; // Set muted style
            listItem.textContent = 'No saved game found.'; // Indicate no saves
            savedGamesList.appendChild(listItem);
        }
    } catch (e) {
        console.error('Error loading saved games:', e);
        const savedGamesList = document.getElementById('savedGamesList');
        if (savedGamesList) {
            savedGamesList.innerHTML = '<li class="list-group-item text-muted">Error loading saved games.</li>';
        }
    }
}

/* Initialize settings modal with saved or default values */
function initSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('gameSettings')); // Get saved settings
        const soundVolumeInput = document.getElementById('soundVolume'); // Get volume slider
        const voiceSpeedInput = document.getElementById('voiceSpeed'); // Get voice speed slider
        const skinSelect = document.getElementById('skinSelect'); // Get skin dropdown
        const vibrationCheckbox = document.getElementById('vibrationCheckbox'); // Get vibration toggle

        // Validate input elements
        if (!soundVolumeInput || !voiceSpeedInput || !skinSelect || !vibrationCheckbox) {
            throw new Error('Settings input elements not found');
        }

        // Apply saved or default settings
        if (settings) {
            soundVolumeInput.value = Math.max(0, Math.min(100, settings.soundVolume || 50)); // Clamp volume 0-100
            voiceSpeedInput.value = Math.max(0.5, Math.min(2, settings.voiceSpeed || 1)); // Clamp speed 0.5-2
            skinSelect.value = settings.skin || 'default'; // Set skin or default
            vibrationCheckbox.checked = !!settings.vibration; // Set vibration state
            Game.applySkin(settings.skin || 'default'); // Apply skin
        } else {
            soundVolumeInput.value = 50; // Default volume
            voiceSpeedInput.value = 1; // Default voice speed
            skinSelect.value = 'default'; // Default skin
            vibrationCheckbox.checked = false; // Default vibration off
            Game.applySkin('default'); // Apply default skin
        }

        // Add ARIA labels for accessibility
        soundVolumeInput.setAttribute('aria-label', 'Adjust sound volume');
        voiceSpeedInput.setAttribute('aria-label', 'Adjust voice narration speed');
        skinSelect.setAttribute('aria-label', 'Select visual theme');
        vibrationCheckbox.setAttribute('aria-label', 'Toggle haptic feedback');

        // Bind save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                const newSettings = {
                    soundVolume: parseInt(soundVolumeInput.value), // Save volume
                    voiceSpeed: parseFloat(voiceSpeedInput.value), // Save voice speed
                    skin: skinSelect.value, // Save skin
                    vibration: vibrationCheckbox.checked // Save vibration
                };
                localStorage.setItem('gameSettings', JSON.stringify(newSettings)); // Save to localStorage
                Game.applySkin(newSettings.skin); // Apply new skin
                bootstrap.Modal.getInstance(document.getElementById('settingsModal'))?.hide(); // Hide modal
                Game.log('Settings saved!'); // Log save action
            });
        }
    } catch (e) {
        console.error('Error initializing settings:', e);
        Game.log('Failed to initialize settings.');
    }
}

/* Initialize game log and sidebar with accessibility */
function initGameLog() {
    try {
        const gameLog = document.getElementById('gameLog'); // Get game log container
        const sidebar = document.getElementById('gameLogSidebar'); // Get sidebar
        if (!gameLog || !sidebar) throw new Error('Game log or sidebar not found');
        gameLog.setAttribute('aria-live', 'polite'); // Set ARIA live region for screen readers
        sidebar.setAttribute('aria-expanded', 'true'); // Indicate sidebar is open
        sidebar.classList.add('show'); // Show sidebar initially
        // Update ARIA state on sidebar toggle
        const toggleBtn = document.querySelector('.toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isExpanded = sidebar.classList.contains('show');
                sidebar.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            });
        }
    } catch (e) {
        console.error('Error initializing game log:', e);
    }
}

/* Initialize Bootstrap modals used in the game */
function initModals() {
    try {
        const modalIds = [
            'gameOverModal', // Game over screen
            'settingsModal', // Settings configuration
            'loadGameModal' // Load saved game
        ]; // Relevant modals for single-player campaign
        modalIds.forEach(modalId => {
            const element = document.getElementById(modalId); // Get modal element
            if (element) {
                new bootstrap.Modal(element); // Initialize Bootstrap modal
                element.setAttribute('aria-labelledby', `${modalId}Label`); // Add ARIA label
            } else {
                console.warn(`Modal ${modalId} not found in DOM`);
            }
        });
    } catch (e) {
        console.error('Error initializing modals:', e);
    }
}

/* Initialize event listeners for UI buttons */
function initEventListeners() {
    try {
        // Bind load game button
        const loadGameBtn = document.getElementById('loadGameBtn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                loadSavedGames(); // Populate saved games list
                new bootstrap.Modal(document.getElementById('loadGameModal')).show(); // Show modal
            });
        } else {
            console.warn('loadGameBtn not found');
        }

        // Bind settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                new bootstrap.Modal(document.getElementById('settingsModal')).show(); // Show settings modal
            });
        } else {
            console.warn('settingsBtn not found');
        }
    } catch (e) {
        console.error('Error initializing event listeners:', e);
    }
}

/* Initialize the entire game UI, waiting for Game object */
function initializeGameUI() {
    try {
        // Wait for Game object to be defined (game.js must load first)
        if (!window.Game) {
            console.warn('Game object not found, retrying initialization');
            setTimeout(initializeGameUI, 100); // Retry after 100ms
            return;
        }
        preloadImages(); // Preload warrior and enemy images
        initTooltips(); // Set up tooltips
        initSettings(); // Initialize settings modal
        initGameLog(); // Set up game log and sidebar
        initModals(); // Initialize modals
        initEventListeners(); // Bind button listeners
        Game.loadSavedWarriors(); // Load warrior roster
        Game.updateUI(); // Render initial UI
        console.log('Game UI initialized successfully');
    } catch (e) {
        console.error('Error initializing game UI:', e);
        alert('Failed to initialize game. Please check console for details.');
    }
}

/* Start initialization when DOM is fully loaded */
document.addEventListener('DOMContentLoaded', () => {
    initializeGameUI();
});