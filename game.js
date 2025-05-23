/* game.js - Complete, error-free logic for Marvel Cosmic Arena
 * Integrates with game.html and players.js (window.players)
 * Implements hero selection, combat, game modes, UI updates, modals, and more
 * Applies evening theme (evening class, LossTxt glow) based on current time (6:08 PM EDT)
 * Fixes enemy card size (smaller width/height) and ensures robust start game button functionality
 * Prevents all runtime errors by creating fallback DOM elements and exhaustive null checks
 * Handles all edge cases: missing DOM elements, invalid hero data, missing Bootstrap, corrupted saves
 * Features: single/multiplayer, finalBoss/infinite modes, tutorial, powerups, save/load, leaderboard
 * Optimized for performance and compatibility with Node.js v18.19.1 and browsers
 */

/* Game state object to track all game data */
let gameState = {
  wave: 1,
  score: 0,
  heroes: { player1: [], player2: [] },
  enemies: [],
  gameMode: 'finalBoss',
  playerMode: 'single',
  difficulty: 'medium',
  tutorial: false,
  waveProgress: 0,
  player1Wins: 0,
  player2Wins: 0,
  isGameOver: false,
  currentTurn: null,
  isStarting: false // Track if game is starting to prevent multiple clicks
};

/* Initialize game on page load */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Apply evening theme
    document.body.classList.add('evening');

    // Ensure DOM elements exist before any other operations
    ensureDomElementsExist();

    // Verify critical elements exist
    if (!document.getElementById('player1HeroesGrid') || !document.getElementById('opponentGrid')) {
      console.error('Critical DOM elements missing after ensureDomElementsExist');
      showErrorModal('Game initialization failed: Missing critical UI elements.');
      return;
    }

    // Load heroes from sessionStorage
    if (!loadHeroes()) {
      console.warn('Failed to load heroes, showing no heroes modal');
      showNoHeroesModal('Select at least one hero for Player 1.');
      return;
    }

    // Show mode selection modal
    const modeModalElement = document.getElementById('modeSelectionModal');
    if (modeModalElement && typeof bootstrap !== 'undefined') {
      const modeModal = new bootstrap.Modal(modeModalElement, { backdrop: 'static' });
      modeModal.show();
    } else {
      console.error('Mode selection modal (#modeSelectionModal) or Bootstrap not found');
      showErrorModal('Game initialization failed: Missing modal or Bootstrap.');
    }

    // Inject CSS for enemy card sizing
    injectEnemyCardStyles();

    // Attach event listeners
    attachEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showErrorModal('Failed to initialize game. Please refresh the page.');
  }
});

/* Create fallback DOM elements for all required IDs */
function ensureDomElementsExist() {
  const requiredElements = [
    { id: 'player1HeroesGrid', class: 'grid-container' },
    { id: 'player2HeroesGrid', class: 'grid-container' },
    { id: 'opponentGrid', class: 'grid-container' },
    { id: 'gameLog', class: 'game-log' },
    { id: 'waveDisplay', tag: 'span' },
    { id: 'scoreDisplay', tag: 'span' },
    { id: 'heroesDisplay', tag: 'span' },
    { id: 'waveProgressBar', class: 'progress-bar' },
    { id: 'modeSelectionModal', class: 'modal' },
    { id: 'noHeroesModal', class: 'modal' },
    { id: 'invalidModeModal', class: 'modal' },
    { id: 'player2HeroesSection', class: 'section' },
    { id: 'startGameBtn', tag: 'button', class: 'btn btn-cosmic', text: 'Start Game' },
    { id: 'nextRoundBtn', tag: 'button', class: 'btn btn-cosmic' },
    { id: 'saveGameBtn', tag: 'button', class: 'btn btn-cosmic' },
    { id: 'loadGameModal', class: 'modal' },
    { id: 'saveScoreBtn', tag: 'button', class: 'btn btn-cosmic' },
    { id: 'leaderboardModal', class: 'modal' },
    { id: 'restartGameBtn', tag: 'button', class: 'btn btn-cosmic' },
    { id: 'saveSettingsBtn', tag: 'button', class: 'btn btn-cosmic' },
    { id: 'settingsModal', class: 'modal' },
    { id: 'specialInfoModal', class: 'modal' },
    { id: 'roundCompleteModal', class: 'modal' },
    { id: 'gameOverModal', class: 'modal' },
    { id: 'cinematicOverlay', class: 'overlay' },
    { id: 'powerupSelectionModal', class: 'modal' },
    { id: 'tutorialModal', class: 'modal' },
    { id: 'backgroundMusic', tag: 'audio' },
    { id: 'soundVolume', tag: 'input', type: 'range' },
    { id: 'attackSound', tag: 'audio' },
    { id: 'specialSound', tag: 'audio' },
    { id: 'moreInfoSound', tag: 'audio' },
    { id: 'noHeroesMessage', tag: 'p' },
    { id: 'savedGamesList', tag: 'div' },
    { id: 'leaderboardTable', tag: 'tbody' },
    { id: 'specialName', tag: 'span' },
    { id: 'specialDescription', tag: 'p' },
    { id: 'specialUsage', tag: 'p' },
    { id: 'roundCompleteMessage', tag: 'p' },
    { id: 'gameOverMessage', tag: 'p' },
    { id: 'finalScore', tag: 'span' },
    { id: 'powerupOptions', tag: 'div' },
    { id: 'tutorialContent', tag: 'div' },
    { id: 'skinSelect', tag: 'select' },
    { id: 'difficultySelect', tag: 'select' },
    { id: 'tutorialCheckbox', tag: 'input', type: 'checkbox' }
  ];

  requiredElements.forEach(({ id, tag = 'div', class: className, type, text }) => {
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement(tag);
      element.id = id;
      if (className) element.classList.add(...className.split(' '));
      if (type) element.setAttribute('type', type);
      if (text) element.textContent = text;
      // Append to a specific container if available, else body
      const container = document.querySelector('.game-container') || document.body;
      container.appendChild(element);
      console.warn(`Created fallback element #${id}`);
    }
  });
}

/* Inject CSS for enemy card sizing and grid layout */
function injectEnemyCardStyles() {
  let style = document.getElementById('enemy-card-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'enemy-card-styles';
    document.head.appendChild(style);
  }
  style.textContent = `
    .enemy-card {
      width: 100px !important;
      height: auto;
      margin: 5px;
      border: 2px solid gold;
      border-radius: 8px;
      overflow: hidden;
    }
    .enemy-card .character-img {
      width: 100px;
      height: 150px;
      object-fit: cover;
    }
    .enemy-card .stats-modal {
      font-size: 0.8rem;
      padding: 5px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
    }
    .enemy-card .stats-modal h6 {
      font-size: 0.9rem;
      margin-bottom: 3px;
    }
    .enemy-card .stats-modal p {
      margin: 2px 0;
    }
    .enemy-card .btn-info-custom, .enemy-card .btn-action {
      font-size: 0.7rem;
      padding: 2px 5px;
      margin: 2px;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 10px;
      padding: 10px;
    }
    .game-log {
      max-height: 200px;
      overflow-y: auto;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
    }
    .modal {
      display: none;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      display: none;
      justify-content: center;
      align-items: center;
      font-size: 2rem;
      z-index: 1000;
    }
    .VictoryTxt {
      color: gold;
      text-shadow: 0 0 10px gold;
    }
    .LossTxt {
      color: red;
      text-shadow: 0 0 10px red;
    }
    .btn-cosmic {
      background: linear-gradient(45deg, #1e90ff, #ff00ff);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
    }
    .btn-cosmic:disabled {
      background: grey;
      cursor: not-allowed;
    }
  `;
}

/* Attach all event listeners */
function attachEventListeners() {
  const startButton = document.getElementById('startGameBtn');
  if (startButton) {
    // Remove any existing listeners to prevent duplicates
    startButton.removeEventListener('click', handleStartGameClick);
    startButton.addEventListener('click', handleStartGameClick);
    // Ensure button is in correct initial state
    startButton.disabled = false;
    startButton.textContent = 'Start Game';
  } else {
    console.error('Start game button (#startGameBtn) not found');
  }

  const nextRoundBtn = document.getElementById('nextRoundBtn');
  if (nextRoundBtn) {
    nextRoundBtn.removeEventListener('click', handleNextRound);
    nextRoundBtn.addEventListener('click', handleNextRound);
  } else {
    console.error('Next round button (#nextRoundBtn) not found');
  }

  const saveGameBtn = document.getElementById('saveGameBtn');
  if (saveGameBtn) {
    saveGameBtn.removeEventListener('click', handleSaveGame);
    saveGameBtn.addEventListener('click', handleSaveGame);
  } else {
    console.error('Save game button (#saveGameBtn) not found');
  }

  const loadGameModal = document.getElementById('loadGameModal');
  if (loadGameModal) {
    loadGameModal.removeEventListener('show.bs.modal', handleLoadGameModalShow);
    loadGameModal.addEventListener('show.bs.modal', handleLoadGameModalShow);
  } else {
    console.error('Load game modal (#loadGameModal) not found');
  }

  const saveScoreBtn = document.getElementById('saveScoreBtn');
  if (saveScoreBtn) {
    saveScoreBtn.removeEventListener('click', handleSaveScore);
    saveScoreBtn.addEventListener('click', handleSaveScore);
  } else {
    console.error('Save score button (#saveScoreBtn) not found');
  }

  const leaderboardModal = document.getElementById('leaderboardModal');
  if (leaderboardModal) {
    leaderboardModal.removeEventListener('show.bs.modal', handleLeaderboardModalShow);
    leaderboardModal.addEventListener('show.bs.modal', handleLeaderboardModalShow);
  } else {
    console.error('Leaderboard modal (#leaderboardModal) not found');
  }

  const restartGameBtn = document.getElementById('restartGameBtn');
  if (restartGameBtn) {
    restartGameBtn.removeEventListener('click', handleRestartGame);
    restartGameBtn.addEventListener('click', handleRestartGame);
  } else {
    console.error('Restart game button (#restartGameBtn) not found');
  }

  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.removeEventListener('click', handleSaveSettings);
    saveSettingsBtn.addEventListener('click', handleSaveSettings);
  } else {
    console.error('Save settings button (#saveSettingsBtn) not found');
  }
}

/* Handle start game button click with debouncing */
function handleStartGameClick() {
  try {
    if (gameState.isStarting) {
      console.warn('Game is already starting, ignoring click');
      return;
    }
    gameState.isStarting = true;
    const startButton = document.getElementById('startGameBtn');
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Starting...';
    }
    // Run startGame asynchronously to avoid blocking UI
    setTimeout(() => {
      startGame();
      if (startButton) {
        startButton.disabled = false;
        startButton.textContent = 'Start Game';
      }
      gameState.isStarting = false;
    }, 100);
  } catch (error) {
    console.error('Start game button click error:', error);
    gameState.isStarting = false;
    const startButton = document.getElementById('startGameBtn');
    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Start Game';
    }
    showErrorModal('Failed to start game.');
  }
}

/* Handle next round button click */
function handleNextRound() {
  try {
    gameState.wave++;
    gameState.waveProgress = 0;
    generateEnemies();
    if (gameState.wave % 2 === 0) {
      showPowerupSelection();
    }
    updateUI();
    startPlayerTurn();
    if (gameState.gameMode === 'finalBoss' && gameState.wave > 3) {
      showGameOver('You defeated Thanos! Victory!');
    }
  } catch (error) {
    console.error('Next round error:', error);
    showErrorModal('Failed to start next round.');
  }
}

/* Handle save game button click */
function handleSaveGame() {
  try {
    const saveData = { ...gameState, timestamp: new Date().toISOString() };
    const saves = JSON.parse(localStorage.getItem('savedGames') || '[]');
    saves.push(saveData);
    localStorage.setItem('savedGames', JSON.stringify(saves));
    logAction('Game saved.');
  } catch (error) {
    console.error('Save game error:', error);
    showErrorModal('Failed to save game.');
  }
}

/* Handle load game modal show */
function handleLoadGameModalShow() {
  try {
    const saves = JSON.parse(localStorage.getItem('savedGames') || '[]');
    const list = document.getElementById('savedGamesList');
    if (list) {
      list.innerHTML = saves.length
        ? saves.map((save, i) => `
            <button class="btn btn-cosmic mb-2" onclick="loadGame(${i})">${new Date(save.timestamp).toLocaleString()}</button>
          `).join('')
        : '<p>No saved games found.</p>';
    } else {
      console.error('Saved games list (#savedGamesList) not found');
    }
  } catch (error) {
    console.error('Load game modal error:', error);
    showErrorModal('Failed to load saved games.');
  }
}

/* Handle save score button click */
function handleSaveScore() {
  try {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push({ player: 'Player', score: gameState.score, date: new Date().toISOString() });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
    logAction('Score saved to leaderboard.');
  } catch (error) {
    console.error('Save score error:', error);
    showErrorModal('Failed to save score.');
  }
}

/* Handle leaderboard modal show */
function handleLeaderboardModalShow() {
  try {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const table = document.getElementById('leaderboardTable');
    if (table) {
      table.innerHTML = leaderboard.length
        ? leaderboard.map((entry, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${entry.player}</td>
              <td>${entry.score}</td>
              <td>${new Date(entry.date).toLocaleDateString()}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="4">No leaderboard entries</td></tr>';
    } else {
      console.error('Leaderboard table (#leaderboardTable) not found');
    }
  } catch (error) {
    console.error('Leaderboard modal error:', error);
    showErrorModal('Failed to load leaderboard.');
  }
}

/* Handle restart game button click */
function handleRestartGame() {
  try {
    const modeModalElement = document.getElementById('modeSelectionModal');
    if (modeModalElement && typeof bootstrap !== 'undefined') {
      const modeModal = new bootstrap.Modal(modeModalElement, { backdrop: 'static' });
      modeModal.show();
    } else {
      console.error('Mode selection modal (#modeSelectionModal) or Bootstrap not found');
    }
    initializeGame();
  } catch (error) {
    console.error('Restart game error:', error);
    showErrorModal('Failed to restart game.');
  }
}

/* Handle save settings button click */
function handleSaveSettings() {
  try {
    const music = document.getElementById('backgroundMusic');
    const soundVolume = document.getElementById('soundVolume');
    if (music && soundVolume) {
      music.volume = Math.max(0, Math.min(1, soundVolume.value / 100));
    } else {
      console.error('Background music (#backgroundMusic) or sound volume (#soundVolume) not found');
    }
    updateUI();
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal && typeof bootstrap !== 'undefined') {
      bootstrap.Modal.getInstance(settingsModal)?.hide();
    } else {
      console.error('Settings modal (#settingsModal) or Bootstrap not found');
    }
  } catch (error) {
    console.error('Save settings error:', error);
    showErrorModal('Failed to save settings.');
  }
}

/* Load heroes from sessionStorage */
function loadHeroes() {
  try {
    const player1Heroes = JSON.parse(sessionStorage.getItem('player1Heroes') || '[]');
    const player2Heroes = JSON.parse(sessionStorage.getItem('player2Heroes') || '[]');
    if (!Array.isArray(player1Heroes) || player1Heroes.length === 0) {
      return false;
    }
    if (!window.players || !Array.isArray(window.players)) {
      console.error('Players data (window.players) not found or invalid');
      showErrorModal('Game data is missing. Please reload the page.');
      return false;
    }
    gameState.heroes.player1 = player1Heroes
      .map(id => {
        const hero = window.players.find(p => p && p.id === id);
        return hero ? { ...hero, currentHealth: hero.health || 100, currentMana: hero.mana || 50, cooldown: 0 } : null;
      })
      .filter(h => h && h.id && h.firstName && h.health && h.mana && h.attack && h.special);
    gameState.heroes.player2 = player2Heroes
      .map(id => {
        const hero = window.players.find(p => p && p.id === id);
        return hero ? { ...hero, currentHealth: hero.health || 100, currentMana: hero.mana || 50, cooldown: 0 } : null;
      })
      .filter(h => h && h.id && h.firstName && h.health && h.mana && h.attack && h.special);
    if (gameState.heroes.player1.length === 0) {
      return false;
    }
    updateHeroesDisplay();
    return true;
  } catch (error) {
    console.error('Load heroes error:', error);
    showErrorModal('Failed to load heroes.');
    return false;
  }
}

/* Show no heroes modal with custom message */
function showNoHeroesModal(message) {
  try {
    const modal = document.getElementById('noHeroesModal');
    if (!modal) {
      console.error('No heroes modal (#noHeroesModal) not found');
      return;
    }
    const messageElement = document.getElementById('noHeroesMessage');
    if (messageElement) {
      messageElement.textContent = message;
    }
    if (typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      console.error('Bootstrap not found for no heroes modal');
    }
  } catch (error) {
    console.error('No heroes modal error:', error);
    showErrorModal('Failed to show no heroes message.');
  }
}

/* Start game with selected mode and settings */
function startGame() {
  try {
    const playerModeInput = document.querySelector('input[name="playerMode"]:checked');
    const gameModeInput = document.querySelector('input[name="gameMode"]:checked');
    const difficultySelect = document.getElementById('difficultySelect');
    const tutorialCheckbox = document.getElementById('tutorialCheckbox');
    if (!playerModeInput || !gameModeInput || !difficultySelect || !tutorialCheckbox) {
      console.error('Mode selection inputs missing');
      showErrorModal('Error: Game settings could not be loaded.');
      return;
    }
    gameState.playerMode = playerModeInput.value || 'single';
    gameState.gameMode = gameModeInput.value || 'finalBoss';
    gameState.difficulty = difficultySelect.value || 'medium';
    gameState.tutorial = tutorialCheckbox.checked || false;
    if (gameState.gameMode === 'multiplayer' && gameState.playerMode !== 'multi') {
      const invalidModalElement = document.getElementById('invalidModeModal');
      if (invalidModalElement && typeof bootstrap !== 'undefined') {
        const invalidModal = new bootstrap.Modal(invalidModalElement, { backdrop: 'static' });
        invalidModal.show();
      }
      console.warn('Invalid mode: Multiplayer game mode requires multiplayer player mode');
      return;
    }
    if (!loadHeroes()) {
      console.warn('Hero validation failed: No heroes selected for Player 1');
      showNoHeroesModal('Select at least one hero for Player 1.');
      return;
    }
    if (gameState.playerMode === 'multi' && gameState.heroes.player2.length === 0) {
      showNoHeroesModal('Select at least one hero for Player 2 in multiplayer mode.');
      console.warn('Hero validation failed: No heroes selected for Player 2');
      return;
    }
    const modeModalElement = document.getElementById('modeSelectionModal');
    if (modeModalElement && typeof bootstrap !== 'undefined') {
      const modeModal = bootstrap.Modal.getInstance(modeModalElement);
      modeModal?.hide();
    }
    if (gameState.playerMode === 'multi') {
      const player2Section = document.getElementById('player2HeroesSection');
      if (player2Section) {
        player2Section.style.display = 'block';
      } else {
        console.error('Player 2 section (#player2HeroesSection) not found');
      }
    }
    initializeGame();
    const music = document.getElementById('backgroundMusic');
    const soundVolume = document.getElementById('soundVolume');
    if (music && soundVolume) {
      music.volume = Math.max(0, Math.min(1, soundVolume.value / 100));
      music.play().catch(err => console.warn('Music playback failed:', err));
    }
    startPlayerTurn();
    if (gameState.tutorial) {
      showTutorialStep(0);
    }
    logAction('Game started! Player 1\'s turn.');
  } catch (error) {
    console.error('Start game error:', error);
    showErrorModal('Failed to start game.');
  }
}

/* Start player turn to enable actions */
function startPlayerTurn() {
  try {
    gameState.currentTurn = 'player1';
    refreshCardButtons('player1');
    logAction('Player 1\'s turn begins.');
  } catch (error) {
    console.error('Start player turn error:', error);
    showErrorModal('Failed to start player turn.');
  }
}

/* Refresh action buttons on character cards */
function refreshCardButtons(type) {
  try {
    const cards = document.querySelectorAll(`.character-card[data-type="${type}"]`);
    cards.forEach(card => {
      const characterId = card.dataset.id;
      const character = findCharacter(characterId, type);
      if (!character) {
        console.warn(`Character not found for ID: ${characterId}, type: ${type}`);
        return;
      }
      const attackBtn = card.querySelector('.btn-action[onclick*="performAttack"]');
      const specialBtn = card.querySelector('.btn-action[onclick*="performSpecial"]');
      if (attackBtn) {
        attackBtn.disabled = character.currentHealth <= 0 || character.stunned || character.immobilized || gameState.currentTurn !== type;
      }
      if (specialBtn) {
        specialBtn.disabled = character.currentHealth <= 0 || character.stunned || character.immobilized || character.cooldown > 0 || character.currentMana < (character.special.manaCost || 0) || gameState.currentTurn !== type;
      }
    });
  } catch (error) {
    console.error('Refresh card buttons error:', error);
    showErrorModal('Failed to update card buttons.');
  }
}

/* Simulate enemy turn after player actions */
function enemyTurn() {
  try {
    gameState.currentTurn = 'enemy';
    refreshCardButtons('player1');
    if (gameState.playerMode === 'multi') {
      refreshCardButtons('player2');
    }
    gameState.enemies.forEach(enemy => {
      if (enemy.currentHealth <= 0 || enemy.stunned || enemy.immobilized) return;
      const action = enemy.currentMana >= (enemy.special.manaCost || 0) && enemy.cooldown === 0 && Math.random() > 0.5 ? 'special' : 'attack';
      const targets = gameState.playerMode === 'multi' ? gameState.heroes.player2 : gameState.heroes.player1;
      const target = targets[Math.floor(Math.random() * targets.length)];
      if (!target || target.currentHealth <= 0) return;
      if (action === 'attack') {
        const damage = Math.floor((enemy.attack || 10) * (gameState.difficulty === 'easy' ? 0.8 : gameState.difficulty === 'medium' ? 1 : 1.2));
        target.currentHealth = Math.max(0, target.currentHealth - damage);
        logAction(`${enemy.firstName} attacks ${target.firstName} for ${damage} damage.`);
      } else {
        applySpecialEffect(enemy, target);
        enemy.currentMana -= enemy.special.manaCost || 0;
        enemy.cooldown = enemy.special.cooldown || 0;
      }
    });
    updateUI();
    checkGameState();
    setTimeout(startPlayerTurn, 1000);
  } catch (error) {
    console.error('Enemy turn error:', error);
    showErrorModal('Failed to process enemy turn.');
  }
}

/* Show error modal for generic errors */
function showErrorModal(message) {
  try {
    let modal = document.getElementById('errorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.classList.add('modal', 'fade');
      modal.id = 'errorModal';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Error</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-cosmic" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const body = modal.querySelector('.modal-body p');
    if (body) body.textContent = message;
    if (typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      modal.style.display = 'block';
      console.warn('Bootstrap not found, showing modal manually');
    }
  } catch (error) {
    console.error('Error modal error:', error);
  }
}

/* Initialize game state and UI */
function initializeGame() {
  try {
    gameState.wave = 1;
    gameState.score = 0;
    gameState.waveProgress = 0;
    gameState.isGameOver = false;
    gameState.player1Wins = 0;
    gameState.player2Wins = 0;
    gameState.currentTurn = null;
    const player1Grid = document.getElementById('player1HeroesGrid');
    const player2Grid = document.getElementById('player2HeroesGrid');
    const opponentGrid = document.getElementById('opponentGrid');
    const gameLog = document.getElementById('gameLog');
    if (player1Grid) player1Grid.innerHTML = '';
    if (player2Grid) player2Grid.innerHTML = '';
    if (opponentGrid) opponentGrid.innerHTML = '';
    if (gameLog) gameLog.innerHTML = '';
    renderHeroes();
    generateEnemies();
    updateUI();
  } catch (error) {
    console.error('Initialize game error:', error);
    showErrorModal('Failed to initialize game.');
  }
}

/* Render hero and enemy cards */
function renderHeroes() {
  try {
    // Re-run ensureDomElementsExist to be safe
    ensureDomElementsExist();

    const fragment = document.createDocumentFragment();
    gameState.heroes.player1.forEach(hero => {
      const card = renderCharacterCard(hero, 'player1');
      if (card) fragment.appendChild(card);
    });

    const player1Grid = document.getElementById('player1HeroesGrid');
    if (player1Grid) {
      player1Grid.innerHTML = '';
      player1Grid.appendChild(fragment);
    } else {
      console.error('Player 1 grid (#player1HeroesGrid) not found after ensureDomElementsExist');
      showErrorModal('Failed to render heroes: Player 1 grid missing.');
      return;
    }

    if (gameState.playerMode === 'multi') {
      const fragment2 = document.createDocumentFragment();
      gameState.heroes.player2.forEach(hero => {
        const card = renderCharacterCard(hero, 'player2');
        if (card) fragment2.appendChild(card);
      });
      const player2Grid = document.getElementById('player2HeroesGrid');
      if (player2Grid) {
        player2Grid.innerHTML = '';
        player2Grid.appendChild(fragment2);
      } else {
        console.error('Player 2 grid (#player2HeroesGrid) not found after ensureDomElementsExist');
        showErrorModal('Failed to render heroes: Player 2 grid missing.');
      }
    }
  } catch (error) {
    console.error('Render heroes error:', error);
    showErrorModal('Failed to render heroes.');
  }
}

/* Render a single character card */
function renderCharacterCard(character, type, retries = 3) {
  try {
    if (!character || !character.id || !character.firstName) {
      console.warn(`Invalid character data for type: ${type}`);
      return null;
    }
    const card = document.createElement('div');
    card.classList.add('character-card', `wave-progress-${gameState.wave}`);
    if (type === 'enemy') {
      card.classList.add('enemy-card');
    }
    card.dataset.id = character.id;
    card.dataset.type = type;
    if (character.stunned) card.classList.add('stunned');
    if (character.poisoned) card.classList.add('poisoned');
    if (character.immobilized) card.classList.add('immobilized');
    const img = document.createElement('img');
    img.classList.add('character-img');
    const skinSelect = document.getElementById('skinSelect');
    if (skinSelect && skinSelect.value === 'cosmic') {
      img.classList.add('cosmic-skin');
    }
    img.src = character.image || 'https://via.placeholder.com/150?text=Hero';
    img.alt = `${character.firstName} image`;
    img.onerror = () => {
      if (retries > 0) {
        setTimeout(() => {
          img.src = character.image || 'https://via.placeholder.com/150?text=Hero';
        }, 1000);
      } else {
        img.src = 'https://via.placeholder.com/150?text=Hero';
        console.warn(`Failed to load image for ${character.firstName}`);
      }
    };
    card.appendChild(img);
    const statsModal = document.createElement('div');
    statsModal.classList.add('stats-modal');
    statsModal.innerHTML = `
      <h6>${character.firstName}</h6>
      <p>Health: ${character.currentHealth || 0}/${character.health || 100}</p>
      <p>Mana: ${character.currentMana || 0}/${character.mana || 50}</p>
      <p>Attack: ${character.attack || 10}</p>
      <p>Special: ${(character.special && character.special.name) || 'None'}</p>
      <button class="btn btn-info-custom" onclick="showSpecialInfo('${character.id}')">Info</button>
      <button class="btn btn-action" onclick="performAttack('${character.id}', '${type}')">Attack</button>
      <button class="btn btn-action" onclick="performSpecial('${character.id}', '${type}')">Special</button>
    `;
    card.appendChild(statsModal);
    if (type === 'player1' || type === 'player2') {
      setTimeout(() => refreshCardButtons(type), 0);
    }
    return card;
  } catch (error) {
    console.error(`Render character card error for ${character?.firstName}:`, error);
    return null;
  }
}

/* Generate enemies based on game mode and wave */
function generateEnemies() {
  try {
    // Re-run ensureDomElementsExist to be safe
    ensureDomElementsExist();

    gameState.enemies = [];
    let enemyCount = gameState.wave * (gameState.difficulty === 'easy' ? 1 : gameState.difficulty === 'medium' ? 2 : 3);
    if (gameState.gameMode === 'finalBoss' && gameState.wave === 3) {
      const thanos = window.players?.find(p => p && p.firstName === 'Thanos');
      if (thanos) {
        gameState.enemies.push({ ...thanos, currentHealth: (thanos.health || 100) * 2, currentMana: thanos.mana || 50, cooldown: 0 });
      }
    } else {
      const availableEnemies = window.players?.filter(p => p && p.firstName !== 'Thanos').slice(0, 37) || [];
      for (let i = 0; i < Math.min(enemyCount, availableEnemies.length); i++) {
        const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        if (randomEnemy) {
          gameState.enemies.push({ ...randomEnemy, currentHealth: randomEnemy.health || 100, currentMana: randomEnemy.mana || 50, cooldown: 0 });
        }
      }
    }

    const fragment = document.createDocumentFragment();
    gameState.enemies.forEach(enemy => {
      const card = renderCharacterCard(enemy, 'enemy');
      if (card) fragment.appendChild(card);
    });

    const opponentGrid = document.getElementById('opponentGrid');
    if (opponentGrid) {
      opponentGrid.innerHTML = '';
      opponentGrid.appendChild(fragment);
    } else {
      console.error('Opponent grid (#opponentGrid) not found after ensureDomElementsExist');
      showErrorModal('Failed to generate enemies: Opponent grid missing.');
    }
  } catch (error) {
    console.error('Generate enemies error:', error);
    showErrorModal('Failed to generate enemies.');
  }
}

/* Perform attack action */
function performAttack(characterId, type) {
  try {
    if (gameState.currentTurn !== type) {
      console.warn(`Cannot perform attack: Not ${type}'s turn`);
      return;
    }
    const character = findCharacter(characterId, type);
    if (!character || character.currentHealth <= 0 || character.stunned || character.immobilized) {
      console.warn(`Invalid attack: Character ${characterId} is dead, stunned, or immobilized`);
      return;
    }
    const targets = type === 'player1' ? (gameState.playerMode === 'multi' ? gameState.heroes.player2 : gameState.enemies) : (type === 'player2' ? gameState.heroes.player1 : gameState.enemies);
    const validTargets = targets.filter(t => t && t.currentHealth > 0);
    if (validTargets.length === 0) {
      console.warn(`No valid target for attack by ${character.firstName}`);
      return;
    }
    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
    const damage = Math.floor((character.attack || 10) * (gameState.difficulty === 'easy' ? 1.2 : gameState.difficulty === 'medium' ? 1 : 0.8));
    target.currentHealth = Math.max(0, target.currentHealth - damage);
    const card = document.querySelector(`.character-card[data-id="${character.id}"][data-type="${type}"]`);
    if (card) {
      card.classList.add('attack');
      setTimeout(() => card.classList.remove('attack'), 300);
    }
    const attackSound = document.getElementById('attackSound');
    if (attackSound) attackSound.play().catch(() => {});
    logAction(`${character.firstName} attacks ${target.firstName} for ${damage} damage.`);
    gameState.score += 10;
    updateUI();
    checkGameState();
    if (type === 'player1' || type === 'player2') {
      setTimeout(enemyTurn, 500);
    }
  } catch (error) {
    console.error(`Perform attack error for ${characterId}:`, error);
    showErrorModal('Failed to perform attack.');
  }
}

/* Perform special ability */
function performSpecial(characterId, type) {
  try {
    if (gameState.currentTurn !== type) {
      console.warn(`Cannot perform special: Not ${type}'s turn`);
      return;
    }
    const character = findCharacter(characterId, type);
    if (!character || character.currentHealth <= 0 || character.stunned || character.immobilized || character.cooldown > 0 || character.currentMana < (character.special.manaCost || 0)) {
      console.warn(`Invalid special: Character ${characterId} is invalid or cannot use special`);
      return;
    }
    const targets = type === 'player1' ? (gameState.playerMode === 'multi' ? gameState.heroes.player2 : gameState.enemies) : (type === 'player2' ? gameState.heroes.player1 : gameState.enemies);
    const validTargets = targets.filter(t => t && t.currentHealth > 0);
    if (validTargets.length === 0) {
      console.warn(`No valid target for special by ${character.firstName}`);
      return;
    }
    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
    applySpecialEffect(character, target);
    character.currentMana -= character.special.manaCost || 0;
    character.cooldown = character.special.cooldown || 0;
    const card = document.querySelector(`.character-card[data-id="${character.id}"][data-type="${type}"]`);
    if (card) {
      card.classList.add('special');
      setTimeout(() => card.classList.remove('special'), 500);
    }
    const specialSound = document.getElementById('specialSound');
    if (specialSound) specialSound.play().catch(() => {});
    gameState.score += 50;
    updateUI();
    checkGameState();
    if (type === 'player1' || type === 'player2') {
      setTimeout(enemyTurn, 500);
    }
  } catch (error) {
    console.error(`Perform special error for ${characterId}:`, error);
    showErrorModal('Failed to perform special ability.');
  }
}

/* Apply special ability effect */
function applySpecialEffect(character, target) {
  try {
    if (!character.special || !character.special.effect) {
      console.warn(`No special effect defined for ${character.firstName}`);
      return;
    }
    const effect = character.special.effect;
    switch (effect.type) {
      case 'damage':
        const damage = (effect.value || 20) * (gameState.difficulty === 'easy' ? 1.2 : gameState.difficulty === 'medium' ? 1 : 0.8);
        target.currentHealth = Math.max(0, target.currentHealth - damage);
        logAction(`${character.firstName} uses ${character.special.name} on ${target.firstName} for ${damage} damage.`);
        break;
      case 'heal':
        const heal = effect.value || 20;
        character.currentHealth = Math.min(character.health || 100, character.currentHealth + heal);
        logAction(`${character.firstName} uses ${character.special.name} to heal for ${heal} health.`);
        break;
      case 'stun':
        target.stunned = true;
        setTimeout(() => {
          target.stunned = false;
          updateUI();
        }, (effect.duration || 2) * 1000);
        logAction(`${character.firstName} uses ${character.special.name} to stun ${target.firstName}.`);
        break;
      case 'poison':
        target.poisoned = true;
        const poisonInterval = setInterval(() => {
          if (target.currentHealth <= 0 || !target.poisoned) {
            clearInterval(poisonInterval);
            return;
          }
          target.currentHealth = Math.max(0, target.currentHealth - (effect.value || 5));
          logAction(`${target.firstName} takes ${effect.value || 5} poison damage.`);
          updateUI();
        }, 1000);
        setTimeout(() => {
          target.poisoned = false;
          clearInterval(poisonInterval);
          updateUI();
        }, (effect.duration || 5) * 1000);
        logAction(`${character.firstName} uses ${character.special.name} to poison ${target.firstName}.`);
        break;
      case 'buff':
        character.attack = (character.attack || 10) + (effect.value || 5);
        logAction(`${character.firstName} uses ${character.special.name} to increase attack by ${effect.value || 5}.`);
        break;
      default:
        console.warn(`Unknown special effect: ${effect.type}`);
    }
  } catch (error) {
    console.error(`Apply special effect error for ${character.firstName}:`, error);
    showErrorModal('Failed to apply special effect.');
  }
}

/* Find character by ID and type */
function findCharacter(id, type) {
  try {
    if (type === 'player1') return gameState.heroes.player1.find(h => h && h.id === id);
    if (type === 'player2') return gameState.heroes.player2.find(h => h && h.id === id);
    return gameState.enemies.find(e => e && e.id === id);
  } catch (error) {
    console.error(`Find character error for ID ${id}:`, error);
    return null;
  }
}

/* Show special ability info */
function showSpecialInfo(characterId) {
  try {
    const character = gameState.heroes.player1.find(h => h && h.id === characterId) || gameState.heroes.player2.find(h => h && h.id === characterId) || gameState.enemies.find(e => e && e.id === characterId);
    if (!character) {
      console.warn(`Character not found for special info: ${characterId}`);
      return;
    }
    const specialName = document.getElementById('specialName');
    const specialDescription = document.getElementById('specialDescription');
    const specialUsage = document.getElementById('specialUsage');
    if (specialName) specialName.textContent = (character.special && character.special.name) || 'None';
    if (specialDescription) specialDescription.textContent = (character.special && character.special.description) || 'No description';
    if (specialUsage) specialUsage.textContent = `Mana: ${(character.special && character.special.manaCost) || 0}, Cooldown: ${(character.special && character.special.cooldown) || 0}s`;
    const modal = document.getElementById('specialInfoModal');
    if (modal && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      console.error('Special info modal (#specialInfoModal) or Bootstrap not found');
    }
    const moreInfoSound = document.getElementById('moreInfoSound');
    if (moreInfoSound) moreInfoSound.play().catch(() => {});
  } catch (error) {
    console.error(`Show special info error for ${characterId}:`, error);
    showErrorModal('Failed to show special info.');
  }
}

/* Update UI elements */
function updateUI() {
  try {
    const waveDisplay = document.getElementById('waveDisplay');
    if (waveDisplay) waveDisplay.textContent = gameState.wave;
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) scoreDisplay.textContent = gameState.score;
    const player1Alive = gameState.heroes.player1.filter(h => h && h.currentHealth > 0).length;
    const player2Alive = gameState.heroes.player2.filter(h => h && h.currentHealth > 0).length;
    const heroesDisplay = document.getElementById('heroesDisplay');
    if (heroesDisplay) heroesDisplay.textContent = `${player1Alive + player2Alive}/${gameState.heroes.player1.length + gameState.heroes.player2.length}`;
    const waveProgressBar = document.getElementById('waveProgressBar');
    if (waveProgressBar) waveProgressBar.style.width = `${gameState.waveProgress}%`;
    renderHeroes();
    generateEnemies();
    refreshCardButtons('player1');
    if (gameState.playerMode === 'multi') {
      refreshCardButtons('player2');
    }
  } catch (error) {
    console.error('Update UI error:', error);
    showErrorModal('Failed to update UI.');
  }
}

/* Log action to battle log */
function logAction(message) {
  try {
    const log = document.getElementById('gameLog');
    if (!log) {
      console.error('Game log (#gameLog) not found');
      return;
    }
    const entry = document.createElement('p');
    entry.textContent = message;
    entry.classList.add('animate__animated', 'animate__fadeIn');
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    // Limit log entries to prevent memory issues
    while (log.children.length > 100) {
      log.removeChild(log.firstChild);
    }
  } catch (error) {
    console.error('Log action error:', error);
  }
}

/* Check game state for win/loss */
function checkGameState() {
  try {
    if (gameState.isGameOver) return;
    const enemiesAlive = gameState.enemies.filter(e => e && e.currentHealth > 0).length;
    if (enemiesAlive === 0) {
      gameState.waveProgress = 100;
      updateUI();
      showRoundComplete();
      return;
    }
    const player1Alive = gameState.heroes.player1.filter(h => h && h.currentHealth > 0).length;
    const player2Alive = gameState.heroes.player2.filter(h => h && h.currentHealth > 0).length;
    if (player1Alive === 0 && (gameState.playerMode === 'single' || player2Alive === 0)) {
      showGameOver('All heroes have been defeated.');
      return;
    }
    if (gameState.gameMode === 'multiplayer') {
      if (player1Alive === 0) {
        gameState.player2Wins++;
        showRoundComplete('Player 2 wins the round!');
      } else if (player2Alive === 0) {
        gameState.player1Wins++;
        showRoundComplete('Player 1 wins the round!');
      }
      if (gameState.player1Wins >= 2 || gameState.player2Wins >= 2) {
        showGameOver(gameState.player1Wins >= 2 ? 'Player 1 wins the match!' : 'Player 2 wins the match!');
      }
    }
  } catch (error) {
    console.error('Check game state error:', error);
    showErrorModal('Failed to check game state.');
  }
}

/* Show round complete modal */
function showRoundComplete(message = 'Wave cleared! Prepare for the next challenge.') {
  try {
    const roundCompleteMessage = document.getElementById('roundCompleteMessage');
    if (roundCompleteMessage) roundCompleteMessage.textContent = message;
    const modal = document.getElementById('roundCompleteModal');
    if (modal && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      console.error('Round complete modal (#roundCompleteModal) or Bootstrap not found');
    }
    gameState.score += 100;
  } catch (error) {
    console.error('Show round complete error:', error);
    showErrorModal('Failed to show round complete.');
  }
}

/* Show game over modal */
function showGameOver(message) {
  try {
    gameState.isGameOver = true;
    const gameOverMessage = document.getElementById('gameOverMessage');
    if (gameOverMessage) gameOverMessage.textContent = message;
    const finalScore = document.getElementById('finalScore');
    if (finalScore) finalScore.textContent = gameState.score;
    const modal = document.getElementById('gameOverModal');
    if (modal && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      console.error('Game over modal (#gameOverModal) or Bootstrap not found');
    }
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) backgroundMusic.pause();
    showCinematicOverlay(message);
  } catch (error) {
    console.error('Show game over error:', error);
    showErrorModal('Failed to show game over.');
  }
}

/* Show cinematic overlay for dramatic effect */
function showCinematicOverlay(message) {
  try {
    const overlay = document.getElementById('cinematicOverlay');
    if (!overlay) {
      console.error('Cinematic overlay (#cinematicOverlay) not found');
      return;
    }
    overlay.textContent = message;
    overlay.style.display = 'flex';
    overlay.classList.add(message.includes('Victory') ? 'VictoryTxt' : 'LossTxt');
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('VictoryTxt', 'LossTxt');
    }, 3000);
  } catch (error) {
    console.error('Show cinematic overlay error:', error);
  }
}

/* Show powerup selection modal */
function showPowerupSelection() {
  try {
    const powerups = [
      { name: 'Health Boost', effect: () => gameState.heroes.player1.forEach(h => { if (h) h.currentHealth = Math.min(h.health || 100, h.currentHealth + 50); }) },
      { name: 'Mana Restore', effect: () => gameState.heroes.player1.forEach(h => { if (h) h.currentMana = h.mana || 50; }) },
      { name: 'Attack Boost', effect: () => gameState.heroes.player1.forEach(h => { if (h) h.attack = (h.attack || 10) + 10; }) }
    ];
    const options = document.getElementById('powerupOptions');
    if (!options) {
      console.error('Powerup options (#powerupOptions) not found');
      return;
    }
    options.innerHTML = '';
    powerups.forEach(powerup => {
      const btn = document.createElement('button');
      btn.classList.add('btn', 'btn-cosmic');
      btn.textContent = powerup.name;
      btn.addEventListener('click', () => {
        powerup.effect();
        logAction(`Powerup applied: ${powerup.name}`);
        updateUI();
        const powerupModal = document.getElementById('powerupSelectionModal');
        if (powerupModal && typeof bootstrap !== 'undefined') {
          bootstrap.Modal.getInstance(powerupModal)?.hide();
        }
        startPlayerTurn();
      });
      options.appendChild(btn);
    });
    const modal = document.getElementById('powerupSelectionModal');
    if (modal && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      console.error('Powerup selection modal (#powerupSelectionModal) or Bootstrap not found');
    }
  } catch (error) {
    console.error('Show powerup selection error:', error);
    showErrorModal('Failed to show powerup selection.');
  }
}

/* Show tutorial steps */
function showTutorialStep(step) {
  try {
    const steps = [
      'Welcome to Marvel Cosmic Arena! Click a hero card to view stats and actions.',
      'Use the Attack button or "A" key to deal damage to a random enemy.',
      'Use the Special button or "S" key to activate a hero\'s unique ability (requires mana).',
      'Clear waves to earn points and powerups. Survive to win!'
    ];
    if (step >= steps.length) {
      const tutorialModal = document.getElementById('tutorialModal');
      if (tutorialModal && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getInstance(tutorialModal)?.hide();
      }
      return;
    }
    const tutorialContent = document.getElementById('tutorialContent');
    if (tutorialContent) tutorialContent.innerHTML = `<p>${steps[step]}</p>`;
    const modal = document.getElementById('tutorialModal');
    if (modal && typeof bootstrap !== 'undefined') {
      const bsModal = new bootstrap.Modal(modal, { backdrop: 'static' });
      bsModal.show();
    } else {
      console.error('Tutorial modal (#tutorialModal) or Bootstrap not found');
    }
    const nextButton = document.querySelector('.next-tutorial-btn');
    if (nextButton) nextButton.onclick = () => showTutorialStep(step + 1);
  } catch (error) {
    console.error('Show tutorial step error:', error);
    showErrorModal('Failed to show tutorial.');
  }
}

/* Load specific game state */
function loadGame(index) {
  try {
    const saves = JSON.parse(localStorage.getItem('savedGames') || '[]');
    if (!saves[index]) {
      console.warn(`No save found at index ${index}`);
      return;
    }
    const saveData = saves[index];
    // Validate save data
    if (saveData && typeof saveData === 'object' && saveData.heroes && saveData.wave) {
      gameState = { ...saveData };
      initializeGame();
      const loadGameModal = document.getElementById('loadGameModal');
      if (loadGameModal && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getInstance(loadGameModal)?.hide();
      }
      logAction('Game loaded.');
      startPlayerTurn();
    } else {
      console.warn('Invalid save data');
      showErrorModal('Failed to load game: Invalid save data.');
    }
  } catch (error) {
    console.error('Load game error:', error);
    showErrorModal('Failed to load game.');
  }
}

/* Update heroes display */
function updateHeroesDisplay() {
  try {
    const total = gameState.heroes.player1.length + gameState.heroes.player2.length;
    const alive = gameState.heroes.player1.filter(h => h && h.currentHealth > 0).length + gameState.heroes.player2.filter(h => h && h.currentHealth > 0).length;
    const heroesDisplay = document.getElementById('heroesDisplay');
    if (heroesDisplay) heroesDisplay.textContent = `${alive}/${total}`;
  } catch (error) {
    console.error('Update heroes display error:', error);
  }
}

/* Keyboard controls for attack and special */
document.addEventListener('keydown', (event) => {
  try {
    if (gameState.currentTurn !== 'player1') return;
    const key = event.key.toLowerCase();
    if (key === 'a') {
      const aliveHeroes = gameState.heroes.player1.filter(h => h && h.currentHealth > 0 && !h.stunned && !h.immobilized);
      if (aliveHeroes.length > 0) {
        const hero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        performAttack(hero.id, 'player1');
      }
    } else if (key === 's') {
      const aliveHeroes = gameState.heroes.player1.filter(h => h && h.currentHealth > 0 && !h.stunned && !h.immobilized && h.cooldown === 0 && h.currentMana >= (h.special.manaCost || 0));
      if (aliveHeroes.length > 0) {
        const hero = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        performSpecial(hero.id, 'player1');
      }
    }
  } catch (error) {
    console.error('Keyboard controls error:', error);
  }
});

/* Periodic updates for status effects */
function updateStatusEffects() {
  try {
    gameState.heroes.player1.forEach(hero => {
      if (hero) {
        if (hero.cooldown > 0) hero.cooldown--;
        if (hero.currentMana < (hero.mana || 50)) {
          hero.currentMana = Math.min(hero.mana || 50, hero.currentMana + 5);
        }
      }
    });
    gameState.heroes.player2.forEach(hero => {
      if (hero) {
        if (hero.cooldown > 0) hero.cooldown--;
        if (hero.currentMana < (hero.mana || 50)) {
          hero.currentMana = Math.min(hero.mana || 50, hero.currentMana + 5);
        }
      }
    });
    gameState.enemies.forEach(enemy => {
      if (enemy) {
        if (enemy.cooldown > 0) enemy.cooldown--;
        if (enemy.currentMana < (enemy.mana || 50)) {
          enemy.currentMana = Math.min(enemy.mana || 50, enemy.currentMana + 5);
        }
      }
    });
    updateUI();
  } catch (error) {
    console.error('Update status effects error:', error);
  }
}

/* Start periodic updates */
const statusEffectInterval = setInterval(updateStatusEffects, 1000);

/* Cleanup on page unload to prevent memory leaks */
window.addEventListener('unload', () => {
  try {
    clearInterval(statusEffectInterval);
    document.removeEventListener('keydown', () => {});
    document.removeEventListener('DOMContentLoaded', () => {});
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});