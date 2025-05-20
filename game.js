document.addEventListener('DOMContentLoaded', () => {
    console.log('Game script executed at', new Date().toLocaleString());

    const colors = {
        heroRed: '#ff2a44',
        cosmicBlue: '#1e90ff',
        vibrantPurple: '#6a0dad',
        infinityGold: '#ffd700',
        nebulaDark: '#0d1b2a',
        starWhite: '#f0f8ff'
    };

    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    const applyTheme = () => {
        const hr = new Date().getHours();
        const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end) || {
            cls: 'night',
            bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
        };
        document.body.classList.remove('morning', 'afternoon', 'evening', 'night');
        document.body.classList.add(setting.cls);
        document.body.style.background = setting.bgGradient;
        console.log('Applied theme:', setting.cls);
        return hr;
    };

    const sanitizeHTML = str => {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const selectedHeroes = JSON.parse(sessionStorage.getItem('selectedHeroes') || '[]');
    if (!selectedHeroes.length) {
        const modal = new bootstrap.Modal(document.getElementById('noHeroesModal'));
        modal.show();
        return;
    }

    const enemies = [
        { id: 'enemy-1', name: 'Chitauri Soldier', health: 50, attack: 10, image: 'https://via.placeholder.com/300x200?text=Chitauri' },
        { id: 'enemy-2', name: 'Outrider', health: 70, attack: 15, image: 'https://via.placeholder.com/300x200?text=Outrider' },
        { id: 'enemy-3', name: 'Thanos Minion', health: 100, attack: 20, image: 'https://via.placeholder.com/300x200?text=Minion' }
    ];

    let gameState = {
        heroes: selectedHeroes.map(h => ({
            ...h,
            health: 100,
            attack: 15 + Math.floor(Math.random() * 10),
            special: h.skill || 'Power Strike'
        })),
        enemies: enemies.map(e => ({ ...e })),
        turn: 0,
        log: []
    };

    const styleCards = () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.border = `2px solid ${colors.infinityGold}`;
            card.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
            card.style.borderRadius = '12px';
            card.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.95) 100%)`;
            card.style.color = colors.starWhite;

            const img = card.querySelector('.card-img-top');
            if (img) {
                img.style.borderRadius = '10px 10px 0 0';
                img.style.maxHeight = '200px';
                img.style.objectFit = 'cover';
                img.style.filter = `drop-shadow(0 0 5px ${colors.cosmicBlue})`;
            }

            const cardTitle = card.querySelector('.card-title');
            if (cardTitle) {
                cardTitle.style.fontFamily = "'Bebas Neue', sans-serif";
                cardTitle.style.fontSize = '1.5rem';
            }

            const progress = card.querySelector('.progress-bar');
            if (progress) {
                progress.style.transition = 'width 0.5s ease';
            }
        });
    };

    const renderHeroes = () => {
        const heroesGrid = document.getElementById('heroesGrid');
        heroesGrid.innerHTML = '';
        gameState.heroes.forEach((hero, index) => {
            const col = document.createElement('div');
            col.className = 'col';
            const glowId = index % 2 === 0 ? 'VictoryTxt' : 'LossTxt';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${sanitizeHTML(hero.photo)}" class="card-img-top" alt="${sanitizeHTML(hero.firstName)}">
                    <div class="card-body">
                        <h5 class="card-title" id="${glowId}">${sanitizeHTML(hero.firstName)}</h5>
                        <p class="card-text">Health: <div class="progress"><div class="progress-bar bg-success" style="width: ${hero.health}%">${hero.health}%</div></div></p>
                        <p class="card-text">Attack: ${hero.attack}</p>
                        <p class="card-text">Special: ${sanitizeHTML(hero.special)}</p>
                        <button class="btn btn-sm btn-marvel-red attack-btn mb-2" data-hero-id="${hero.id}" ${hero.health <= 0 ? 'disabled' : ''}>Attack</button>
                        <button class="btn btn-sm btn-outline-light special-btn" data-hero-id="${hero.id}" ${hero.health <= 0 ? 'disabled' : ''}>Special</button>
                    </div>
                </div>
            `;
            heroesGrid.appendChild(col);
        });
        styleCards();
    };

    const renderEnemies = () => {
        const enemiesGrid = document.getElementById('enemiesGrid');
        enemiesGrid.innerHTML = '';
        gameState.enemies.forEach((enemy, index) => {
            const col = document.createElement('div');
            col.className = 'col';
            const glowId = index % 2 === 0 ? 'LossTxt' : 'VictoryTxt';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${sanitizeHTML(enemy.image)}" class="card-img-top" alt="${sanitizeHTML(enemy.name)}">
                    <div class="card-body">
                        <h5 class="card-title" id="${glowId}">${sanitizeHTML(enemy.name)}</h5>
                        <p class="card-text">Health: <div class="progress"><div class="progress-bar bg-danger" style="width: ${enemy.health}%">${enemy.health}%</div></div></p>
                        <p class="card-text">Attack: ${enemy.attack}</p>
                    </div>
                </div>
            `;
            enemiesGrid.appendChild(col);
        });
        styleCards();
    };

    const updateGameLog = (message) => {
        gameState.log.push(message);
        const gameLog = document.getElementById('gameLog');
        gameLog.innerHTML = gameState.log.map(msg => `<p class="mb-1">${sanitizeHTML(msg)}</p>`).join('');
        gameLog.scrollTop = gameLog.scrollHeight;
    };

    const playSound = (type) => {
        const sound = document.getElementById(`${type}Sound`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => console.warn(`${type} sound failed to play`));
        }
    };

    const checkGameOver = () => {
        const heroesAlive = gameState.heroes.some(h => h.health > 0);
        const enemiesAlive = gameState.enemies.some(e => e.health > 0);
        if (!heroesAlive) {
            updateGameLog('Your heroes have been defeated!');
            showGameOverModal('Defeat', 'Your heroes have fallen. Select new heroes to try again!');
            return true;
        }
        if (!enemiesAlive) {
            updateGameLog('Victory! All enemies defeated!');
            showGameOverModal('Victory', 'You have defeated Thanos\'s minions! Select new heroes for another battle!');
            return true;
        }
        return false;
    };

    const showGameOverModal = (title, message) => {
        const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
        document.getElementById('gameOverModalLabel').textContent = title;
        document.getElementById('gameOverModalLabel').id = title === 'Victory' ? 'VictoryTxt' : 'LossTxt';
        document.getElementById('gameOverMessage').textContent = message;
        modal.show();
        document.getElementById('gameControls').style.display = 'none';
    };

    const enemyAttack = () => {
        const aliveHeroes = gameState.heroes.filter(h => h.health > 0);
        if (!aliveHeroes.length) return;
        const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        const aliveEnemies = gameState.enemies.filter(e => e.health > 0);
        if (!aliveEnemies.length) return;
        const attacker = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const damage = attacker.attack;
        target.health = Math.max(0, target.health - damage);
        updateGameLog(`${attacker.name} attacks ${target.firstName} for ${damage} damage!`);
        playSound('attack');
    };

    const handleAction = (heroId, action) => {
        const hero = gameState.heroes.find(h => h.id === heroId);
        if (!hero || hero.health <= 0) return;
        const aliveEnemies = gameState.enemies.filter(e => e.health > 0);
        if (!aliveEnemies.length) return;
        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        let damage = hero.attack;
        let message = `${hero.firstName} attacks ${target.name} for ${damage} damage!`;
        if (action === 'special') {
            damage *= 1.5;
            message = `${hero.firstName} uses ${hero.special} on ${target.name} for ${Math.floor(damage)} damage!`;
            playSound('special');
        } else {
            playSound('attack');
        }
        target.health = Math.max(0, target.health - Math.floor(damage));
        updateGameLog(message);
        renderHeroes();
        renderEnemies();
        if (checkGameOver()) return;
        enemyAttack();
        renderHeroes();
        renderEnemies();
        checkGameOver();
    };

    const initializeGame = () => {
        applyTheme();
        renderHeroes();
        renderEnemies();
        updateGameLog('Battle begins! Choose your actions.');
        document.querySelectorAll('.attack-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAction(btn.dataset.heroId, 'attack'));
        });
        document.querySelectorAll('.special-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAction(btn.dataset.heroId, 'special'));
        });
        document.getElementById('nextTurnBtn').addEventListener('click', () => {
            gameState.turn++;
            updateGameLog(`Turn ${gameState.turn} begins!`);
            enemyAttack();
            renderHeroes();
            renderEnemies();
            checkGameOver();
        });
    };

    initializeGame();
});