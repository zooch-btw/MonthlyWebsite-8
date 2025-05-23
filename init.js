/* Initialization script for Marvel Cosmic Arena, setting up event listeners and starting the game */

/* Initialize game when DOM is fully loaded */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips for accessibility
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Setup button event listeners in header-container
    setupButtonListeners();

    // Setup modal event listeners
    setupModalListeners();

    // Show mode selection modal on game page load
    showModeSelectionModal();

    // Initialize theme based on saved preference
    initializeTheme();

    // Load saved game if available
    checkSavedGame();
});

/* Setup event listeners for header-container buttons */
function setupButtonListeners() {
    // Log sidebar toggle
    document.querySelector('.toggle-sidebar').addEventListener('click', () => {
        game.toggleSidebar();
    });

    // Music toggle
    document.getElementById('musicToggle').addEventListener('click', () => {
        game.toggleMusic();
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        game.toggleTheme();
    });

    // Save game
    document.getElementById('saveGameBtn').addEventListener('click', () => {
        game.saveGame();
    });

    // Load game
    document.getElementById('loadGameBtn').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('loadGameModal'));
        modal.show();
    });

    // Restart game
    document.getElementById('restartGameBtn').addEventListener('click', () => {
        game.restartGame();
    });
}

/* Setup event listeners for modals */
function setupModalListeners() {
    // Start game button in mode selection modal
    document.getElementById('startGameBtn').addEventListener('click', () => {
        const mode = document.querySelector('input[name="gameMode"]:checked').value;
        const isMultiplayer = document.querySelector('input[name="playerMode"]:checked').value === 'multi';
        const difficulty = document.getElementById('difficultySelect').value;

        // Validate mode
        if (mode === 'multiplayer' && !isMultiplayer) {
            const invalidModal = new bootstrap.Modal(document.getElementById('invalidModeModal'));
            invalidModal.show();
            return;
        }

        // Start game
        game.startGame(mode, isMultiplayer, difficulty);
        bootstrap.Modal.getInstance(document.getElementById('modeSelectionModal')).hide();
    });

    // Save settings
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const soundVolume = document.getElementById('soundVolume').value;
        const voiceSpeed = document.getElementById('voiceSpeed').value;
        const skin = document.getElementById('skinSelect').value;
        const vibration = document.getElementById('vibrationCheckbox').checked;

        // Apply settings (placeholder)
        game.backgroundMusic.volume = soundVolume / 100;
        game.addLog(`Settings saved: Volume=${soundVolume}, Skin=${skin}`);
        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    });

    // Next round
    document.getElementById('nextRoundBtn').addEventListener('click', () => {
        game.updateHUD();
        bootstrap.Modal.getInstance(document.getElementById('roundCompleteModal')).hide();
    });

    // Save score
    document.getElementById('saveScoreBtn').addEventListener('click', () => {
        // Placeholder: Save score to leaderboard
        game.addLog(`Score ${game.score} saved to leaderboard`);
        bootstrap.Modal.getInstance(document.getElementById('gameOverModal')).hide();
    });
}

/* Show mode selection modal on game start */
function showModeSelectionModal() {
    const modal = new bootstrap.Modal(document.getElementById('modeSelectionModal'));
    modal.show();
}

/* Initialize theme based on saved preference */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        game.isDarkTheme = false;
        document.getElementById('themeToggle').textContent = 'Theme: Light';
    }
}

/* Check for saved game and update load game modal */
function checkSavedGame() {
    const savedGamesList = document.getElementById('savedGamesList');
    const saveData = JSON.parse(localStorage.getItem('marvelCosmicSave'));
    if (saveData) {
        savedGamesList.innerHTML = `
            <button class="btn btn-cosmic" onclick="game.loadGame()">Load Save (${new Date(saveData.timestamp).toLocaleString()})</button>
        `;
    } else {
        savedGamesList.innerHTML = '<p>No saved games found.</p>';
    }
}