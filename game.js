/* Managing core game logic for Marvel Cosmic Arena, including combat, character management, and state updates */

// Defining Hero class for player characters
class Hero {
  // Initializing hero properties
  constructor(name, health, mana, attack, specialName, specialCost, specialDescription, image) {
    this.name = name; // Setting hero's name
    this.health = health; // Setting current health
    this.maxHealth = health; // Setting maximum health
    this.mana = mana; // Setting current mana
    this.maxMana = mana; // Setting maximum mana
    this.attack = attack; // Setting attack power
    this.specialName = specialName; // Setting special ability name
    this.specialCost = specialCost; // Setting mana cost for special
    this.specialDescription = specialDescription; // Setting special ability description
    this.image = image; // Setting hero image path
    this.cooldown = 0; // Initializing special ability cooldown
    this.selected = false; // Tracking selection state
  }

  // Performing standard attack
  attack(enemies, gameState) {
    // Selecting random alive enemy
    const aliveEnemies = enemies.filter(e => e.health > 0);
    if (!aliveEnemies.length) return;
    const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    // Calculating damage
    const damage = this.attack;
    target.health = Math.max(0, target.health - damage);
    // Updating game log and score
    updateGameLog(`${this.name} attacks ${target.name} for ${damage} damage!`);
    gameState.score += 10; // Awarding points for attack
    // Applying attack animation
    this.applyAnimation('attack');
    // Regenerating mana
    this.mana = Math.min(this.maxMana, this.mana + 10);
  }

  // Using special ability
  useSpecial(enemies, gameState) {
    // Checking mana and cooldown
    if (this.mana < this.specialCost || this.cooldown > 0) return;
    // Deducting mana cost
    this.mana -= this.specialCost;
    // Setting cooldown
    this.cooldown = 3;
    // Executing special ability effect
    const aliveEnemies = enemies.filter(e => e.health > 0);
    if (!aliveEnemies.length) return;
    const damage = this.attack * 1.5; // Example: 1.5x attack damage
    aliveEnemies.forEach(enemy => {
      enemy.health = Math.max(0, enemy.health - damage);
      updateGameLog(`${this.name}'s ${this.specialName} hits ${enemy.name} for ${damage} damage!`);
    });
    // Updating score
    gameState.score += 50; // Awarding points for special
    // Applying special animation
    this.applyAnimation('special');
  }

  // Applying animation to hero card
  applyAnimation(type) {
    // Finding hero card
    const card = document.querySelector(`#player1HeroesGrid .character-card[data-index="${this.index}"]`) ||
      document.querySelector(`#player2HeroesGrid .character-card[data-index="${this.index}"]`);
    if (card) {
      card.classList.add(type);
      // Removing animation class after duration
      setTimeout(() => card.classList.remove(type), 500);
    }
  }

  // Updating hero state each turn
  update() {
    // Decrementing cooldown if active
    if (this.cooldown > 0) this.cooldown--;
    // Regenerating mana
    this.mana = Math.min(this.maxMana, this.mana + 5);
  }
}

// Defining Enemy class for opponents
class Enemy {
  // Initializing enemy properties
  constructor(name, health, attack, image) {
    this.name = name; // Setting enemy's name
    this.health = health; // Setting current health
    this.maxHealth = health; // Setting maximum health
    this.attack = attack; // Setting attack power
    this.image = image; // Setting enemy image path
  }

  // Performing enemy attack
  attack(heroes, gameState) {
    // Selecting random alive hero
    const aliveHeroes = heroes.filter(h => h.health > 0);
    if (!aliveHeroes.length) return;
    const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
    // Calculating damage
    const damage = this.attack;
    target.health = Math.max(0, target.health - damage);
    // Updating game log
    updateGameLog(`${this.name} attacks ${target.name} for ${damage} damage!`);
    // Applying attack animation
    this.applyAnimation('attack');
  }

  // Applying animation to enemy card
  applyAnimation(type) {
    // Finding enemy card
    const card = document.querySelector(`#opponentGrid .character-card[data-index="${this.index}"]`);
    if (card) {
      card.classList.add(type);
      // Removing animation class after duration
      setTimeout(() => card.classList.remove(type), 500);
    }
  }
}

// Defining GameState class for managing game state
class GameState {
  // Initializing game state
  constructor(playerMode, gameMode, difficulty, player1Heroes, player2Heroes) {
    this.playerMode = playerMode; // Setting player mode (single/multi)
    this.gameMode = gameMode; // Setting game mode (finalBoss/infinite/multiplayer)
    this.difficulty = difficulty; // Setting difficulty (easy/medium/hard)
    this.players = [
      {
        heroes: player1Heroes.map((h, i) => {
          const hero = new Hero(
            h.name,
            h.health,
            h.mana,
            h.attack,
            h.specialName,
            h.specialCost,
            h.specialDescription,
            h.image
          );
          hero.index = i;
          return hero;
        })
      }
    ]; // Initializing Player 1 heroes
    if (playerMode === 'multi') {
      this.players.push({
        heroes: player2Heroes.map((h, i) => {
          const hero = new Hero(
            h.name,
            h.health,
            h.mana,
            h.attack,
            h.specialName,
            h.specialCost,
            h.specialDescription,
            h.image
          );
          hero.index = i;
          return hero;
        })
      }); // Initializing Player 2 heroes for multiplayer
    }
    this.enemies = this.generateEnemies(1); // Generating initial enemies
    this.wave = 1; // Setting starting wave
    this.waveProgress = 0; // Tracking wave progress
    this.waveEnemies = gameMode === 'finalBoss' ? 3 : 5; // Setting enemies per wave
    this.score = 0; // Initializing score
    this.gameOver = false; // Tracking game over state
    this.achievements = []; // Tracking earned achievements
  }

  // Generating enemies for a wave
  generateEnemies(wave) {
    // Adjusting enemy stats based on difficulty
    const difficultyMod = this.difficulty === 'easy' ? 0.8 : this.difficulty === 'hard' ? 1.2 : 1;
    const isFinalBoss = this.gameMode === 'finalBoss' && wave === 3;
    // Defining enemy properties
    const enemyData = isFinalBoss
      ? [{
        name: 'Thanos',
        health: 500 * difficultyMod,
        attack: 25 * difficultyMod,
        image: 'assets/thanos.jpg'
      }]
      : [{
        name: `Enemy Wave ${wave}`,
        health: 100 * wave * difficultyMod,
        attack: 10 * wave * difficultyMod,
        image: `assets/enemy-${wave}.jpg`
      }];
    // Creating enemy instances
    return enemyData.map((e, i) => {
      const enemy = new Enemy(e.name, e.health, e.attack, e.image);
      enemy.index = i;
      return enemy;
    });
  }

  // Updating game state after each turn
  update() {
    // Checking for game over (all heroes defeated)
    const allHeroesDefeated = this.players.every(p => p.heroes.every(h => h.health <= 0));
    if (allHeroesDefeated) {
      this.endGame('Defeat! All heroes have fallen.');
      return;
    }

    // Checking for wave completion
    if (this.enemies.every(e => e.health <= 0)) {
      this.waveProgress++;
      // Checking if wave set is complete
      if (this.waveProgress >= this.waveEnemies) {
        if (this.gameMode === 'finalBoss' && this.wave === 3) {
          this.endGame('Victory! Thanos is defeated!');
          this.unlockAchievement('Thanos Slayer');
        } else {
          this.showRoundComplete();
        }
      } else {
        this.spawnNewEnemies();
      }
    } else {
      // Performing enemy attacks
      this.enemies.filter(e => e.health > 0).forEach(enemy => {
        const targetPlayer = this.playerMode === 'multi' && Math.random() > 0.5 ? 1 : 0;
        enemy.attack(this.players[targetPlayer].heroes, this);
      });
    }

    // Updating hero states
    this.players.forEach(p => p.heroes.forEach(hero => hero.update()));
    // Updating UI
    this.updateUI();
  }

  // Spawning new enemies for the next wave
  spawnNewEnemies() {
    // Generating new enemies
    this.enemies = this.generateEnemies(this.wave);
    updateGameLog(`New wave ${this.wave} enemies spawned!`);
  }

  // Showing round complete modal
  showRoundComplete() {
    // Updating score for wave clear
    this.score += 100;
    // Updating modal message
    document.getElementById('roundCompleteMessage').textContent = `Wave ${this.wave} cleared! Prepare for the next challenge.`;
    // Showing modal
    const modal = new bootstrap.Modal(document.getElementById('roundCompleteModal'));
    modal.show();
    // Unlocking wave clear achievement
    this.unlockAchievement(`Wave ${this.wave} Cleared`);
  }

  // Ending the game with a message
  endGame(message) {
    // Setting game over state
    this.gameOver = true;
    // Showing cinematic overlay
    const overlay = document.getElementById('cinematicOverlay');
    overlay.textContent = message;
    overlay.classList.add(message.includes('Victory') ? 'VictoryTxt' : 'LossTxt');
    overlay.style.display = 'flex';
    // Showing game over modal after delay
    setTimeout(() => {
      overlay.style.display = 'none';
      document.getElementById('gameOverMessage').textContent = message;
      document.getElementById('finalScore').textContent = this.score;
      const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
      modal.show();
    }, 2000);
  }

  // Unlocking an achievement
  unlockAchievement(name) {
    // Adding achievement if not already unlocked
    if (!this.achievements.includes(name)) {
      this.achievements.push(name);
      updateGameLog(`Achievement Unlocked: ${name}`);
      // Updating achievement UI
      this.updateAchievementsUI();
    }
  }

  // Updating achievement UI
  updateAchievementsUI() {
    // Updating main page achievements
    const achievementList = document.getElementById('achievementList');
    if (achievementList) {
      achievementList.innerHTML = this.achievements.map(a => `<li>${a}</li>`).join('');
    }
    // Updating modal achievements
    const modalAchievementList = document.getElementById('modalAchievementList');
    if (modalAchievementList) {
      modalAchievementList.innerHTML = this.achievements.map(a => `<li>${a}</li>`).join('');
    }
  }

  // Updating game UI
  updateUI() {
    // Populating grids
    populateGrids();
    // Updating progress HUD
    updateProgressHUD();
  }
}

// Updating game log (assumed defined in init.js)
function updateGameLog(message) {
  const log = document.getElementById('gameLog');
  if (log) {
    const entry = document.createElement('p');
    entry.textContent = `[${new Date().toLocaleTimeString()}]: ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }
}

// Populating grids (assumed defined in init.js)
function populateGrids() {
  if (!window.currentGameState) return;
  const gameState = window.currentGameState;

  // Populating Player 1 heroes
  const player1Grid = document.getElementById('player1HeroesGrid');
  player1Grid.innerHTML = '';
  gameState.players[0].heroes.forEach((hero, index) => {
    player1Grid.appendChild(createCharacterCard(hero, 'hero', index));
  });

  // Populating Player 2 heroes if multiplayer
  const player2Section = document.getElementById('player2HeroesSection');
  const player2Grid = document.getElementById('player2HeroesGrid');
  if (gameState.playerMode === 'multi') {
    player2Section.style.display = 'block';
    player2Grid.innerHTML = '';
    gameState.players[1].heroes.forEach((hero, index) => {
      player2Grid.appendChild(createCharacterCard(hero, 'hero', index));
    });
  } else {
    player2Section.style.display = 'none';
  }

  // Populating enemies
  const opponentGrid = document.getElementById('opponentGrid');
  opponentGrid.innerHTML = '';
  gameState.enemies.forEach((enemy, index) => {
    opponentGrid.appendChild(createCharacterCard(enemy, 'enemy', index));
  });

  // Updating opponent title
  const opponentTitle = document.getElementById('opponentTitle');
  opponentTitle.textContent = gameState.gameMode === 'finalBoss' && gameState.wave === 3 ? 'Thanos' : 'Enemies';
}

// Creating character card (assumed defined in init.js)
function createCharacterCard(character, type, index) {
  const card = document.createElement('div');
  card.classList.add('character-card', `${type}-card`, `wave-progress-${window.currentGameState.wave}`);
  if (character.selected) card.classList.add('selected');
  card.setAttribute('data-index', index);
  card.setAttribute('aria-label', `${character.name} card`);

  const img = document.createElement('img');
  img.src = character.image;
  img.alt = `${character.name}`;
  img.classList.add('character-img');
  if (document.body.classList.contains('cosmic-skin')) img.classList.add('cosmic-skin');

  const statsModal = document.createElement('div');
  statsModal.classList.add('stats-modal');
  statsModal.innerHTML = `
        <h6>${character.name}</h6>
        <p>Health: ${character.health}/${character.maxHealth}</p>
        ${type === 'hero' ? `
            <p>Mana: ${character.mana}/${character.maxMana}</p>
            <p>Attack: ${character.attack}</p>
            <p>Cooldown: ${character.cooldown}</p>
        ` : `
            <p>Attack: ${character.attack}</p>
        `}
    `;

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

  card.addEventListener('click', () => selectCharacter(type, index));
  return card;
}

// Selecting character (assumed defined in init.js)
function selectCharacter(type, index) {
  if (type === 'hero') {
    const playerIndex = window.currentGameState.playerMode === 'multi' && document.getElementById('player2HeroesGrid').contains(event.target.closest('.character-card')) ? 1 : 0;
    window.currentGameState.players[playerIndex].heroes.forEach((hero, i) => {
      hero.selected = i === index;
    });
    const grid = playerIndex === 0 ? document.getElementById('player1HeroesGrid') : document.getElementById('player2HeroesGrid');
    grid.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));
    grid.querySelector(`[data-index="${index}"]`).classList.add('selected');
  }
}

// Updating progress HUD (assumed defined in init.js)
function updateProgressHUD() {
  if (!window.currentGameState) return;
  const gameState = window.currentGameState;
  document.getElementById('waveDisplay').textContent = gameState.wave;
  document.getElementById('scoreDisplay').textContent = gameState.score;
  const aliveHeroes = gameState.players[0].heroes.filter(h => h.health > 0).length;
  document.getElementById('heroesDisplay').textContent = `${aliveHeroes}/${gameState.players[0].heroes.length}`;
  document.getElementById('waveProgressBar').style.width = `${(gameState.waveProgress / gameState.waveEnemies) * 100}%`;
}

// Initializing game state on load
document.addEventListener('DOMContentLoaded', () => {
  // Loading saved game state
  const savedState = JSON.parse(localStorage.getItem('currentGameState') || '{}');
  if (savedState.players) {
    window.currentGameState = new GameState(
      savedState.playerMode,
      savedState.gameMode,
      savedState.difficulty,
      savedState.players[0].heroes,
      savedState.players[1]?.heroes || []
    );
    window.currentGameState.wave = savedState.wave;
    window.currentGameState.waveProgress = savedState.waveProgress;
    window.currentGameState.score = savedState.score;
    window.currentGameState.achievements = savedState.achievements || [];
    window.currentGameState.enemies = savedState.enemies.map((e, i) => {
      const enemy = new Enemy(e.name, e.health, e.attack, e.image);
      enemy.index = i;
      return enemy;
    });
    // Updating UI
    window.currentGameState.updateUI();
  }

  // Adding event listeners for action buttons
  document.addEventListener('click', (event) => {
    if (!window.currentGameState || window.currentGameState.gameOver) return;
    const target = event.target;
    if (target.classList.contains('attack-btn')) {
      const index = parseInt(target.dataset.index);
      window.currentGameState.players[0].heroes[index].attack(window.currentGameState.enemies, window.currentGameState);
      window.currentGameState.update();
    } else if (target.classList.contains('special-btn')) {
      const index = parseInt(target.dataset.index);
      window.currentGameState.players[0].heroes[index].useSpecial(window.currentGameState.enemies, window.currentGameState);
      window.currentGameState.update();
    } else if (target.classList.contains('info-btn')) {
      const index = parseInt(target.dataset.index);
      const hero = window.currentGameState.players[0].heroes[index];
      document.getElementById('specialName').textContent = hero.specialName;
      document.getElementById('specialDescription').textContent = hero.specialDescription;
      document.getElementById('specialUsage').textContent = `Cost: ${hero.specialCost} Mana, Cooldown: ${hero.cooldown} turns`;
      const modal = new bootstrap.Modal(document.getElementById('specialInfoModal'));
      modal.show();
    }
  });
});