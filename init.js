/* Initializing the Marvel Cosmic Arena game setup and event listeners */

// Declaring global variables for game settings and state
let settings = {
    soundVolume: 50, // Setting default sound volume (0-100)
    voiceSpeed: 1.2, // Setting default voice speed (0.5-2.0)
    heroSkin: 'classic', // Setting default hero skin
    vibration: true, // Enabling vibration by default for mobile
    theme: 'dark' // Setting default theme
};
let isMusicPlaying = false; // Tracking music playback state
let audioElement = null; // Referencing background music element
let currentGameState = null; // Storing current game state for saving/loading

// Initializing game on DOM content load
document.addEventListener('DOMContentLoaded', () => {
    // Loading saved settings from localStorage
    loadSettings();
    // Applying saved settings to UI
    applySettings();
    // Initializing event listeners for interactive elements
    initializeEventListeners();
    // Setting up tooltips for accessibility
    initializeTooltips();
    // Checking if on game page to initialize game-specific elements
    if (document.getElementById('player1HeroesGrid')) {
        initializeGamePage();
    }
});

// Loading saved settings from localStorage
function loadSettings() {
    // Retrieving stored settings or using defaults
    const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || {};
    // Merging saved settings with defaults
    settings = { ...settings, ...savedSettings };
}

// Applying settings to UI elements
function applySettings() {
    // Updating sound volume input
    const soundVolumeInput = document.getElementById('soundVolume');
    if (soundVolumeInput) {
        soundVolumeInput.value = settings.soundVolume;
    }
    // Updating voice speed input
    const voiceSpeedInput = document.getElementById('voiceSpeed');
    if (voiceSpeedInput) {
        voiceSpeedInput.value = settings.voiceSpeed;
    }
    // Updating hero skin selection
    const skinSelect = document.getElementById('skinSelect');
    if (skinSelect) {
        skinSelect.value = settings.heroSkin;
    }
    // Updating vibration checkbox
    const vibrationCheckbox = document.getElementById('vibrationCheckbox');
    if (vibrationCheckbox) {
        vibrationCheckbox.checked = settings.vibration;
    }
    // Applying theme
    document.body.classList.toggle('light-theme', settings.theme === 'light');
    // Updating theme toggle button text
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = `Theme: ${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}`;
    }
    // Applying hero skin to character images
    applyHeroSkins();
}

// Applying hero skin to character images
function applyHeroSkins() {
    // Selecting all character images
    const characterImages = document.querySelectorAll('.character-img');
    // Applying or removing cosmic skin class
    characterImages.forEach(img => {
        img.classList.toggle('cosmic-skin', settings.heroSkin === 'cosmic');
    });
}

// Initializing event listeners for buttons and inputs
function initializeEventListeners() {
    // Handling save settings button click
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }

    // Handling theme toggle button click
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Handling music toggle button click
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    // Handling sidebar toggle button click
    const sidebarToggle = document.querySelector('.toggle-sidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Handling start game button click
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }

    // Handling save game button click
    const saveGameBtn = document.getElementById('saveGameBtn');
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', saveGame);
    }

    // Handling load game button click
    const loadGameBtn = document.getElementById('loadGameBtn');
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', populateSavedGames);
    }

    // Handling restart game button click
    const restartGameBtn = document.getElementById('restartGameBtn');
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', restartGame);
    }

    // Handling next round button click
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', nextRound);
    }

    // Handling save score button click
    const saveScoreBtn = document.getElementById('saveScoreBtn');
    if (saveScoreBtn) {
        saveScoreBtn.addEventListener('click', saveScore);
    }

    // Handling tutorial next button click
    const nextTutorialBtn = document.querySelector('.next-tutorial-btn');
    if (nextTutorialBtn) {
        nextTutorialBtn.addEventListener('click', advanceTutorial);
    }
}

// Initializing tooltips for accessibility
function initializeTooltips() {
    // Selecting all elements with tooltip data attribute
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    // Creating tooltip instances
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Saving settings to localStorage
function saveSettings() {
    // Updating settings from UI inputs
    settings.soundVolume = parseInt(document.getElementById('soundVolume').value);
    settings.voiceSpeed = parseFloat(document.getElementById('voiceSpeed').value);
    settings.heroSkin = document.getElementById('skinSelect').value;
    settings.vibration = document.getElementById('vibrationCheckbox').checked;
    // Saving to localStorage
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    // Applying updated settings
    applySettings();
    // Triggering vibration if enabled
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(200);
    }
    // Closing settings modal
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    if (settingsModal) {
        settingsModal.hide();
    }
}

// Toggling between dark and light themes
function toggleTheme() {
    // Switching theme setting
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    // Saving updated settings
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    // Applying theme
    applySettings();
}

// Toggling background music playback
function toggleMusic() {
    // Creating audio element if not exists
    if (!audioElement) {
        audioElement = new Audio('assets/background_music.mp3');
        audioElement.loop = true;
        audioElement.volume = settings.soundVolume / 100;
    }
    // Toggling playback state
    if (isMusicPlaying) {
        audioElement.pause();
        isMusicPlaying = false;
        document.getElementById('musicToggle').textContent = 'Music: Off';
    } else {
        audioElement.play().catch(error => console.error('Music playback failed:', error));
        isMusicPlaying = true;
        document.getElementById('musicToggle').textContent = 'Music: On';
    }
}

// Toggling battle log sidebar visibility
function toggleSidebar() {
    // Selecting sidebar element
    const sidebar = document.getElementById('gameLogSidebar');
    // Toggling visibility
    sidebar.classList.toggle('show');
}

// Initializing game page elements
function initializeGamePage() {
    // Setting up keyboard controls
    setupKeyboardControls();
    // Populating hero and enemy grids
    populateGrids();
    // Updating progress HUD
    updateProgressHUD();
    // Checking for tutorial mode
    if (settings.tutorial) {
        startTutorial();
    }
}

// Setting up keyboard controls for game actions
function setupKeyboardControls() {
    // Adding keydown event listener
    document.addEventListener('keydown', (event) => {
        // Handling attack key
        if (event.key.toLowerCase() === 'a') {
            performAction('attack');
        }
        // Handling special ability key
        if (event.key.toLowerCase() === 's') {
            performAction('special');
        }
        // Handling info key
        if (event.key.toLowerCase() === 'i') {
            showSpecialInfo();
        }
        // Handling navigation keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            navigateCards(event.key);
        }
        // Handling action confirmation
        if (event.key === 'Enter') {
            confirmAction();
        }
    });
}

// Performing game actions (attack/special)
function performAction(type) {
    // Checking if game is active
    if (!currentGameState || currentGameState.gameOver) return;
    // Getting selected hero
    const selectedHero = currentGameState.players[0].heroes.find(h => h.selected);
    if (!selectedHero) return;

    // Executing action based on type
    if (type === 'attack') {
        // Performing attack
        selectedHero.attack(currentGameState.enemies, currentGameState);
        updateGameLog(`${selectedHero.name} attacks!`);
    } else if (type === 'special' && selectedHero.mana >= selectedHero.specialCost && selectedHero.cooldown === 0) {
        // Performing special ability
        selectedHero.useSpecial(currentGameState.enemies, currentGameState);
        updateGameLog(`${selectedHero.name} uses ${selectedHero.specialName}!`);
    }
    // Updating game state
    updateGameState();
}

// Showing special ability info for selected hero
function showSpecialInfo() {
    // Getting selected hero
    const selectedHero = currentGameState?.players[0].heroes.find(h => h.selected);
    if (!selectedHero) return;

    // Updating modal content
    document.getElementById('specialName').textContent = selectedHero.specialName;
    document.getElementById('specialDescription').textContent = selectedHero.specialDescription;
    document.getElementById('specialUsage').textContent = `Cost: ${selectedHero.specialCost} Mana, Cooldown: ${selectedHero.cooldown} turns`;
    // Showing modal
    const modal = new bootstrap.Modal(document.getElementById('specialInfoModal'));
    modal.show();
}

// Navigating hero cards with arrow keys
function navigateCards(key) {
    // Getting all hero cards
    const heroCards = document.querySelectorAll('#player1HeroesGrid .character-card');
    if (!heroCards.length) return;

    // Finding current selected card
    let currentIndex = Array.from(heroCards).findIndex(card => card.classList.contains('selected'));
    if (currentIndex === -1) currentIndex = 0;

    // Calculating new index based on key
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
        currentIndex = (currentIndex - 1 + heroCards.length) % heroCards.length;
    } else if (key === 'ArrowRight' || key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % heroCards.length;
    }

    // Updating selection
    heroCards.forEach(card => card.classList.remove('selected'));
    heroCards[currentIndex].classList.add('selected');
    // Updating game state
    currentGameState.players[0].heroes.forEach((hero, i) => {
        hero.selected = i === currentIndex;
    });
}

// Confirming selected action
function confirmAction() {
    // Triggering attack for selected hero
    performAction('attack');
}

// Starting the game with selected mode
function startGame() {
    // Getting game mode settings
    const playerMode = document.querySelector('input[name="playerMode"]:checked').value;
    const gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const tutorial = document.getElementById('tutorialCheckbox').checked;

    // Validating multiplayer mode
    if (gameMode === 'multiplayer' && playerMode !== 'multi') {
        const modal = new bootstrap.Modal(document.getElementById('invalidModeModal'));
        modal.show();
        return;
    }

    // Checking hero selection
    const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
    const player2Heroes = playerMode === 'multi' ? JSON.parse(localStorage.getItem('player2Heroes') || '[]') : [];
    if (!player1Heroes.length || (playerMode === 'multi' && !player2Heroes.length)) {
        const modal = new bootstrap.Modal(document.getElementById('noHeroesModal'));
        modal.show();
        return;
    }

    // Initializing game state
    currentGameState = new GameState(playerMode, gameMode, difficulty, player1Heroes, player2Heroes);
    settings.tutorial = tutorial;
    // Saving settings
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    // Redirecting to game page
    window.location.href = 'game.html';
}

// Populating hero and enemy grids
function populateGrids() {
    // Checking if game state exists
    if (!currentGameState) {
        currentGameState = JSON.parse(localStorage.getItem('currentGameState') || '{}');
        if (!currentGameState.players) return;
    }

    // Populating Player 1 heroes
    const player1Grid = document.getElementById('player1HeroesGrid');
    player1Grid.innerHTML = '';
    currentGameState.players[0].heroes.forEach((hero, index) => {
        player1Grid.appendChild(createCharacterCard(hero, 'hero', index));
    });

    // Populating Player 2 heroes if multiplayer
    const player2Section = document.getElementById('player2HeroesSection');
    const player2Grid = document.getElementById('player2HeroesGrid');
    if (currentGameState.playerMode === 'multi') {
        player2Section.style.display = 'block';
        player2Grid.innerHTML = '';
        currentGameState.players[1].heroes.forEach((hero, index) => {
            player2Grid.appendChild(createCharacterCard(hero, 'hero', index));
        });
    }

    // Populating enemies
    const opponentGrid = document.getElementById('opponentGrid');
    opponentGrid.innerHTML = '';
    currentGameState.enemies.forEach((enemy, index) => {
        opponentGrid.appendChild(createCharacterCard(enemy, 'enemy', index));
    });

    // Updating opponent title for final boss
    const opponentTitle = document.getElementById('opponentTitle');
    opponentTitle.textContent = currentGameState.gameMode === 'finalBoss' && currentGameState.wave === 3 ? 'Thanos' : 'Enemies';
}

// Creating character card element
function createCharacterCard(character, type, index) {
    // Creating card container
    const card = document.createElement('div');
    card.classList.add('character-card', `${type}-card`, `wave-progress-${currentGameState.wave}`);
    if (character.selected) card.classList.add('selected');
    card.setAttribute('data-index', index);
    card.setAttribute('aria-label', `${character.name} card`);

    // Creating character image
    const img = document.createElement('img');
    img.src = character.image || `assets/${character.name.toLowerCase().replace(' ', '-')}.jpg`;
    img.alt = `${character.name}`;
    img.classList.add('character-img');
    if (settings.heroSkin === 'cosmic') img.classList.add('cosmic-skin');

    // Creating stats modal
    const statsModal = document.createElement('div');
    statsModal.classList.add('stats-modal');
    statsModal.innerHTML = `
        <h6>${character.name}</h6>
        <p>Health: ${character.health}/${character.maxHealth}</p>
        <p>Mana: ${character.mana}/${character.maxMana}</p>
        <p>Attack: ${character.attack}</p>
        ${type === 'hero' ? `<p>Cooldown: ${character.cooldown}</p>` : ''}
    `;

    // Creating action buttons for heroes
    if (type === 'hero') {
        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons', 'd-flex', 'justify-content-center', 'gap-2');
        actionButtons.innerHTML = `
            <button class="btn btn-action attack-btn" data-index="${index}" aria-label="Attack with ${character.name}">Attack</button>
            <button class="btn btn-action special-btn" data-index="${index}" aria-label="Use ${character.specialName}" ${character.mana < character.specialCost || character.cooldown > 0 ? 'disabled' : ''}>Special</button>
            <button class="btn btn-info-custom info-btn" data-index="${index}" aria-label="View ${character.specialName} info">Info</button>
        `;
        card.append(img, statsModal, actionButtons);
    } else {
        card.append(img, statsModal);
    }

    // Adding click event for selection
    card.addEventListener('click', () => selectCharacter(type, index));
    return card;
}

// Selecting a character card
function selectCharacter(type, index) {
    // Updating selection for heroes
    if (type === 'hero') {
        const playerIndex = currentGameState.playerMode === 'multi' && document.getElementById('player2HeroesGrid').contains(event.target.closest('.character-card')) ? 1 : 0;
        currentGameState.players[playerIndex].heroes.forEach((hero, i) => {
            hero.selected = i === index;
        });
        // Updating UI
        const grid = playerIndex === 0 ? document.getElementById('player1HeroesGrid') : document.getElementById('player2HeroesGrid');
        grid.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
        grid.querySelector(`[data-index="${index}"]`).classList.add('selected');
    }
}

// Updating progress HUD
function updateProgressHUD() {
    // Updating wave display
    document.getElementById('waveDisplay').textContent = currentGameState.wave;
    // Updating score display
    document.getElementById('scoreDisplay').textContent = currentGameState.score;
    // Updating heroes count
    const aliveHeroes = currentGameState.players[0].heroes.filter(h => h.health > 0).length;
    document.getElementById('heroesDisplay').textContent = `${aliveHeroes}/${currentGameState.players[0].heroes.length}`;
    // Updating progress bar
    document.getElementById('waveProgressBar').style.width = `${(currentGameState.waveProgress / currentGameState.waveEnemies) * 100}%`;
}

// Updating game log with new entries
function updateGameLog(message) {
    // Adding new log entry
    const log = document.getElementById('gameLog');
    const entry = document.createElement('p');
    entry.textContent = `[${new Date().toLocaleTimeString()}]: ${message}`;
    log.appendChild(entry);
    // Scrolling to bottom
    log.scrollTop = log.scrollHeight;
}

// Updating game state after actions
function updateGameState() {
    // Checking for game over
    if (currentGameState.players[0].heroes.every(h => h.health <= 0)) {
        endGame('Defeat! All heroes have fallen.');
        return;
    }
    if (currentGameState.enemies.every(e => e.health <= 0)) {
        currentGameState.waveProgress++;
        if (currentGameState.waveProgress >= currentGameState.waveEnemies) {
            if (currentGameState.gameMode === 'finalBoss' && currentGameState.wave === 3) {
                endGame('Victory! Thanos is defeated!');
            } else {
                showRoundComplete();
            }
        } else {
            spawnNewEnemies();
        }
    }
    // Updating grids
    populateGrids();
    // Updating HUD
    updateProgressHUD();
}

// Ending the game with a message
function endGame(message) {
    // Setting game over state
    currentGameState.gameOver = true;
    // Showing cinematic overlay
    const overlay = document.getElementById('cinematicOverlay');
    overlay.textContent = message;
    overlay.classList.add(message.includes('Victory') ? 'VictoryTxt' : 'LossTxt');
    overlay.style.display = 'flex';
    // Showing game over modal
    setTimeout(() => {
        overlay.style.display = 'none';
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('finalScore').textContent = currentGameState.score;
        const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
        modal.show();
    }, 2000);
}

// Showing round complete modal
function showRoundComplete() {
    // Updating modal message
    document.getElementById('roundCompleteMessage').textContent = `Wave ${currentGameState.wave} cleared! Prepare for the next challenge.`;
    // Showing modal
    const modal = new bootstrap.Modal(document.getElementById('roundCompleteModal'));
    modal.show();
}

// Advancing to the next round
function nextRound() {
    // Incrementing wave
    currentGameState.wave++;
    currentGameState.waveProgress = 0;
    // Spawning new enemies
    spawnNewEnemies();
    // Showing powerup selection
    showPowerupSelection();
    // Updating game state
    updateGameState();
    // Closing modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('roundCompleteModal'));
    modal.hide();
}

// Spawning new enemies for the wave
function spawnNewEnemies() {
    // Generating new enemies based on wave and mode
    currentGameState.enemies = generateEnemies(currentGameState.wave, currentGameState.gameMode, currentGameState.difficulty);
    updateGameLog(`New wave ${currentGameState.wave} enemies spawned!`);
}

// Showing powerup selection modal
function showPowerupSelection() {
    // Generating powerup options
    const powerups = generatePowerups();
    const powerupOptions = document.getElementById('powerupOptions');
    powerupOptions.innerHTML = '';
    powerups.forEach((powerup, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-cosmic');
        button.textContent = powerup.name;
        button.setAttribute('aria-label', `Select ${powerup.name} powerup`);
        button.addEventListener('click', () => applyPowerup(powerup));
        powerupOptions.appendChild(button);
    });
    // Showing modal
    const modal = new bootstrap.Modal(document.getElementById('powerupSelectionModal'));
    modal.show();
}

// Generating powerup options
function generatePowerups() {
    // Returning sample powerups
    return [
        { name: 'Health Boost', effect: () => currentGameState.players[0].heroes.forEach(h => h.health = Math.min(h.health + 20, h.maxHealth)) },
        { name: 'Mana Restore', effect: () => currentGameState.players[0].heroes.forEach(h => h.mana = h.maxMana) },
        { name: 'Attack Up', effect: () => currentGameState.players[0].heroes.forEach(h => h.attack += 5) }
    ];
}

// Applying selected powerup
function applyPowerup(powerup) {
    // Executing powerup effect
    powerup.effect();
    updateGameLog(`Applied ${powerup.name} powerup!`);
    // Updating game state
    updateGameState();
    // Closing modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('powerupSelectionModal'));
    modal.hide();
}

// Saving the current game state
function saveGame() {
    // Generating save slot
    const saveData = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        gameState: currentGameState
    };
    // Retrieving existing saves
    const savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
    savedGames.push(saveData);
    // Saving to localStorage
    localStorage.setItem('savedGames', JSON.stringify(savedGames));
    updateGameLog('Game saved successfully!');
    // Triggering vibration if enabled
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(200);
    }
}

// Populating saved games list in modal
function populateSavedGames() {
    // Retrieving saved games
    const savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
    const savedGamesList = document.getElementById('savedGamesList');
    savedGamesList.innerHTML = '';
    // Creating buttons for each save
    savedGames.forEach(save => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-cosmic', 'mb-2', 'w-100');
        button.textContent = `Save ${save.timestamp}`;
        button.setAttribute('aria-label', `Load game saved on ${save.timestamp}`);
        button.addEventListener('click', () => loadGame(save.id));
        savedGamesList.appendChild(button);
    });
}

// Loading a saved game
function loadGame(saveId) {
    // Finding save by ID
    const savedGames = JSON.parse(localStorage.getItem('savedGames') || '[]');
    const save = savedGames.find(s => s.id === saveId);
    if (save) {
        // Restoring game state
        currentGameState = save.gameState;
        localStorage.setItem('currentGameState', JSON.stringify(currentGameState));
        updateGameLog('Game loaded successfully!');
        // Updating UI
        populateGrids();
        updateProgressHUD();
        // Closing modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('loadGameModal'));
        modal.hide();
    }
}

// Restarting the game
function restartGame() {
    // Resetting game state
    currentGameState = null;
    localStorage.removeItem('currentGameState');
    // Redirecting to menu
    window.location.href = 'menu.html';
}

// Saving the final score to leaderboard
function saveScore() {
    // Creating score entry
    const scoreEntry = {
        player: 'Player 1', // Placeholder, could be dynamic
        score: currentGameState.score,
        date: new Date().toLocaleString()
    };
    // Retrieving existing leaderboard
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push(scoreEntry);
    // Sorting by score descending
    leaderboard.sort((a, b) => b.score - a.score);
    // Saving to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateGameLog('Score saved to leaderboard!');
}

// Starting the tutorial
function startTutorial() {
    // Setting initial tutorial content
    document.getElementById('tutorialContent').innerHTML = `
        <p>Welcome to Marvel Cosmic Arena!</p>
        <p>Use arrow keys to select a hero, then press 'A' to attack or 'S' for special abilities.</p>
    `;
    // Showing tutorial modal
    const modal = new bootstrap.Modal(document.getElementById('tutorialModal'));
    modal.show();
}

// Advancing tutorial steps
function advanceTutorial() {
    // Updating tutorial content (simplified example)
    const content = document.getElementById('tutorialContent');
    if (content.innerHTML.includes('Welcome')) {
        content.innerHTML = `
            <p>Special abilities require mana and have cooldowns.</p>
            <p>Press 'I' to view ability details.</p>
        `;
    } else {
        // Closing tutorial
        const modal = bootstrap.Modal.getInstance(document.getElementById('tutorialModal'));
        modal.hide();
        settings.tutorial = false;
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
}

// Placeholder for GameState class (assumed defined in game.js)
class GameState {
    constructor(playerMode, gameMode, difficulty, player1Heroes, player2Heroes) {
        this.playerMode = playerMode;
        this.gameMode = gameMode;
        this.difficulty = difficulty;
        this.players = [
            { heroes: player1Heroes.map(h => ({ ...h, selected: false })) }
        ];
        if (playerMode === 'multi') {
            this.players.push({ heroes: player2Heroes.map(h => ({ ...h, selected: false })) });
        }
        this.enemies = generateEnemies(1, gameMode, difficulty);
        this.wave = 1;
        this.waveProgress = 0;
        this.waveEnemies = gameMode === 'finalBoss' ? 3 : 5;
        this.score = 0;
        this.gameOver = false;
    }
}

// Placeholder for enemy generation (assumed defined in game.js)
function generateEnemies(wave, gameMode, difficulty) {
    // Simplified example
    const enemy = {
        name: gameMode === 'finalBoss' && wave === 3 ? 'Thanos' : `Enemy ${wave}`,
        health: 100 * wave * (difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.2 : 1),
        maxHealth: 100 * wave * (difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.2 : 1),
        attack: 10 * wave,
        image: `assets/enemy-${wave}.jpg`
    };
    return [enemy];
}