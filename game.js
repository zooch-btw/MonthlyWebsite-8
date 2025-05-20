document.addEventListener('DOMContentLoaded', () => {
    console.log('Game script executed at', new Date().toLocaleString());

    // Color constants
    const colors = {
        heroRed: '#ff2a44',
        cosmicBlue: '#1e90ff',
        vibrantPurple: '#6a0dad',
        infinityGold: '#ffd700',
        nebulaDark: '#0d1b2a',
        starWhite: '#f0f8ff'
    };

    // Theme settings
    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    // Enemy data
    const baseEnemies = [
        { id: 'enemy-chitauri', name: 'Chitauri Soldier', health: 40, attack: 8, image: 'https://via.placeholder.com/150?text=Chitauri', special: 'Laser Blast: Fires a concentrated energy shot, dealing moderate damage.' },
        { id: 'enemy-outrider', name: 'Outrider', health: 60, attack: 12, image: 'https://via.placeholder.com/150?text=Outrider', special: 'Claw Frenzy: Rapidly slashes a target, applying minor bleed damage.' },
        { id: 'enemy-minion', name: 'Thanos Minion', health: 80, attack: 15, image: 'https://via.placeholder.com/150?text=Minion', special: 'Power Surge: Channels dark energy, boosting attack temporarily.' }
    ];

    const defaultEnemy = {
        id: 'enemy-default',
        name: 'Generic Enemy',
        health: 50,
        attack: 10,
        image: 'https://via.placeholder.com/150?text=Enemy',
        special: 'Basic Attack: Deals standard damage.'
    };

    const finalBoss = {
        id: 'boss-thanos',
        name: 'Thanos',
        health: 400,
        attack: 35,
        image: 'https://via.placeholder.com/150?text=Thanos',
        special: 'Infinity Gauntlet Snap: Devastates a single target, potentially wiping them out if their health is low.'
    };

    // Powerup data
    const powerups = [
        { id: 'health-boost', name: 'Health Boost', description: 'Restores 25 health to all heroes (max 100).', effect: (heroes) => heroes.forEach(h => h.health = Math.min(100, h.health + 25)) },
        { id: 'attack-boost', name: 'Attack Boost', description: 'Increases attack by 7 for all heroes.', effect: (heroes) => heroes.forEach(h => h.attack += 7) },
        { id: 'shield', name: 'Shield', description: 'Grants a two-turn shield to all heroes, blocking one attack.', effect: (heroes) => heroes.forEach(h => gameState.statusEffects.set(h.id, [...(gameState.statusEffects.get(h.id) || []), { type: 'shield', duration: 2 }])) }
    ];

    // Unique special abilities
    const specialAbilities = {
        'Unibeam': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.8);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} fires Unibeam at ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Shield Throw': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.5);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            gameState.statusEffects.set(target.id, [...(gameState.statusEffects.get(target.id) || []), { type: 'stun', duration: 1 }]);
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} throws shield at ${target.name || target.firstName}, dealing ${damage} damage and stunning them!`;
        },
        'Mjolnir Strike': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 2);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 25;
            return `⚔️ ${hero.firstName} strikes with Mjolnir on ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Web Sling': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.2);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            gameState.statusEffects.set(target.id, [...(gameState.statusEffects.get(target.id) || []), { type: 'stun', duration: 1 }]);
            hero.mana -= 10;
            return `⚔️ ${hero.firstName} slings webs at ${target.name || target.firstName}, dealing ${damage} damage and immobilizing them!`;
        },
        'Gamma Smash': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 0.8);
            aliveOpponents.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.health = Math.min(100, hero.health + 20);
            hero.mana -= 25;
            return `⚔️ ${hero.firstName} smashes the ground, hitting all enemies for ${damage} damage and healing for 20!`;
        },
        'Arcane Blast': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.7);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} casts Arcane Blast, dealing ${damage} damage to ${target.name || target.firstName}!`;
        },
        'Time Manipulation': (hero, targets, aliveOpponents) => {
            hero.health = Math.min(100, hero.health + 30);
            hero.mana -= 30;
            return `🛡️ ${hero.firstName} manipulates time to restore 30 health!`;
        },
        'Vibranium Claw': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.6);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.health = Math.min(100, hero.health + Math.floor(damage * 0.4));
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} claws ${target.name || target.firstName} for ${damage} damage and heals for ${Math.floor(damage * 0.4)}!`;
        },
        'Chaos Magic': (hero, targets, aliveOpponents) => {
            const target = targets[0];
            if (Math.random() < 0.5) {
                target.attack = Math.floor(target.attack * 0.6);
                hero.mana -= 15;
                return `🛡️ ${hero.firstName} casts Chaos Magic, reducing ${target.name || target.firstName}'s attack!`;
            } else {
                const damage = Math.floor(hero.attack * 1.8);
                target.health = Math.max(0, target.health - damage);
                hero.mana -= 15;
                return `⚔️ ${hero.firstName} casts Chaos Magic, dealing ${damage} damage to ${target.name || target.firstName}!`;
            }
        },
        'Ant-Man Shrink': (hero, targets, aliveOpponents) => {
            gameState.statusEffects.set(hero.id, [...(gameState.statusEffects.get(hero.id) || []), { type: 'dodge', duration: 1 }]);
            hero.mana -= 10;
            return `🛡️ ${hero.firstName} shrinks, dodging the next attack!`;
        },
        'Claw Frenzy': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 0.6);
            for (let i = 0; i < 3 && aliveOpponents.length; i++) {
                const t = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
                t.health = Math.max(0, t.health - damage);
            }
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} unleashes Claw Frenzy, hitting enemies for ${damage} damage each!`;
        },
        'Storm Surge': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 0.7);
            aliveOpponents.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            return `⚔️ ${hero.firstName} summons Storm Surge, hitting all enemies for ${damage} damage!`;
        },
        'Optic Beam': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.5);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} fires Optic Beam at ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Telepathic Strike': (hero, targets, aliveOpponents) => {
            const target = targets[0];
            const damage = Math.floor(target.health * 0.35);
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} uses Telepathic Strike, dealing ${damage} damage to ${target.name || target.firstName}!`;
        },
        'Beast Rush': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.4);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.attack += 5;
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} rushes at ${target.name || target.firstName} for ${damage} damage and boosts attack!`;
        },
        'Card Trick': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.9);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} throws Card Trick at ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Life Drain': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.4);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.health = Math.min(100, hero.health + damage);
            hero.mana -= 25;
            return `⚔️ ${hero.firstName} drains ${damage} health from ${target.name || target.firstName}!`;
        },
        'Chimichanga Chaos': (hero, targets, aliveOpponents) => {
            const effect = Math.random();
            if (effect < 0.4) {
                const damage = Math.floor(hero.attack * 1.6);
                aliveOpponents.forEach(t => t.health = Math.max(0, t.health - damage));
                hero.mana -= 25;
                return `⚔️ ${hero.firstName} throws Chimichanga Chaos, hitting all enemies for ${damage} damage!`;
            } else if (effect < 0.7) {
                hero.health = Math.min(100, hero.health + 35);
                hero.mana -= 15;
                return `🛡️ ${hero.firstName} eats a chimichanga, healing for 35 health!`;
            } else {
                const damage = Math.floor(hero.attack * 1.6);
                const target = targets[0];
                target.health = Math.max(0, target.health - damage);
                hero.mana -= 15;
                return `⚔️ ${hero.firstName} lobs Chimichanga Chaos at ${target.name || target.firstName} for ${damage} damage!`;
            }
        },
        'Symbiote Strike': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.5);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} strikes with Symbiote at ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Magnetic Pulse': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.7);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} unleashes Magnetic Pulse, crushing ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Arcane Curse': (hero, targets, aliveOpponents) => {
            const target = targets[0];
            gameState.statusEffects.set(target.id, [...(gameState.statusEffects.get(target.id) || []), { type: 'poison', duration: 3 }]);
            hero.mana -= 15;
            return `🛡️ ${hero.firstName} casts Arcane Curse, poisoning ${target.name || target.firstName}!`;
        },
        'Reality Snap': (hero, targets, aliveOpponents) => {
            const target = targets[0];
            if (target.health < 40) {
                target.health = 0;
                hero.mana -= 30;
                return `⚔️ ${hero.firstName} snaps reality, obliterating ${target.name || target.firstName}!`;
            } else {
                const damage = Math.floor(hero.attack * 1.8);
                target.health = Math.max(0, target.health - damage);
                hero.mana -= 20;
                return `⚔️ ${hero.firstName} snaps reality, dealing ${damage} damage to ${target.name || target.firstName}!`;
            }
        },
        'Illusion Cast': (hero, targets, aliveOpponents) => {
            aliveOpponents.forEach(t => {
                gameState.statusEffects.set(t.id, [...(gameState.statusEffects.get(t.id) || []), { type: 'confused', duration: 1 }]);
            });
            hero.mana -= 20;
            return `🛡️ ${hero.firstName} casts Illusion, confusing all enemies!`;
        },
        'Code Hack': (hero, targets, aliveOpponents) => {
            const target = targets[0];
            target.attack = Math.floor(target.attack * 0.7);
            hero.mana -= 15;
            return `🛡️ ${hero.firstName} hacks ${target.name || target.firstName}'s code, reducing their attack!`;
        },
        'Cosmic Boost': (hero, targets, aliveOpponents) => {
            const heroes = gameState.currentPlayer === 'player1' ? gameState.player1Heroes : gameState.player2Heroes;
            heroes.forEach(h => h.attack = Math.floor(h.attack * 1.3));
            hero.mana -= 25;
            return `🛡️ ${hero.firstName} uses Cosmic Boost, boosting allied attack by 30%!`;
        },
        'Pumpkin Bomb': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 0.6);
            for (let i = 0; i < 3 && aliveOpponents.length; i++) {
                const t = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
                t.health = Math.max(0, t.health - damage);
            }
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} throws Pumpkin Bomb, hitting enemies for ${damage} damage each!`;
        },
        'Power Slam': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 2);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 25;
            return `⚔️ ${hero.firstName} delivers Power Slam to ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Trick Shot': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.8);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} lands Trick Shot on ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Smoke Veil': (hero, targets, aliveOpponents) => {
            gameState.statusEffects.set(hero.id, [...(gameState.statusEffects.get(hero.id) || []), { type: 'dodge', duration: 1 }]);
            hero.mana -= 10;
            return `🛡️ ${hero.firstName} creates Smoke Veil, dodging the next attack!`;
        },
        'Rhino Charge': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.5);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} charges with Rhino Charge at ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Sand Vortex': (hero, targets, aliveOpponents) => {
            aliveOpponents.forEach(t => t.attack = Math.floor(t.attack * 0.7));
            hero.mana -= 20;
            return `🛡️ ${hero.firstName} summons Sand Vortex, reducing all enemy attacks!`;
        },
        'Electro Shock': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 0.6);
            aliveOpponents.forEach(t => t.health = Math.max(0, t.health - damage));
            hero.mana -= 25;
            return `⚔️ ${hero.firstName} unleashes Electro Shock, chaining ${damage} damage to all enemies!`;
        },
        'Tentacle Crush': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 0.8);
            for (let i = 0; i < Math.min(3, aliveOpponents.length); i++) {
                const t = aliveOpponents[i];
                t.health = Math.max(0, t.health - damage);
            }
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} slams with Tentacle Crush, hitting up to three enemies for ${damage} damage!`;
        },
        'Trap Snare': (hero, targets, aliveOpponents) => {
            const target = targets[0];
            gameState.statusEffects.set(target.id, [...(gameState.statusEffects.get(target.id) || []), { type: 'stun', duration: 2 }]);
            hero.mana -= 15;
            return `🛡️ ${hero.firstName} sets Trap Snare, immobilizing ${target.name || target.firstName} for two turns!`;
        },
        'Sonic Pulse': (hero, targets, aliveOpponents) => {
            aliveOpponents.forEach(t => {
                gameState.statusEffects.set(t.id, [...(gameState.statusEffects.get(t.id) || []), { type: 'delay', duration: 1 }]);
            });
            hero.mana -= 20;
            return `🛡️ ${hero.firstName} emits Sonic Pulse, delaying all enemy actions!`;
        },
        'Venom Sting': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.4);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            gameState.statusEffects.set(target.id, [...(gameState.statusEffects.get(target.id) || []), { type: 'poison', duration: 3 }]);
            hero.mana -= 20;
            return `⚔️ ${hero.firstName} strikes with Venom Sting, poisoning ${target.name || target.firstName} for ${damage} damage!`;
        },
        'Aerial Strike': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.6);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 15;
            return `⚔️ ${hero.firstName} dives with Aerial Strike, dealing ${damage} damage to ${target.name || target.firstName}!`;
        },
        'Basic Attack': (hero, targets, aliveOpponents) => {
            const damage = Math.floor(hero.attack * 1.4);
            const target = targets[0];
            target.health = Math.max(0, target.health - damage);
            hero.mana -= 10;
            return `⚔️ ${hero.firstName} performs a Basic Attack on ${target.name || target.firstName} for ${damage} damage!`;
        }
    };

    // Game state
    let gameState = {
        player1Heroes: [],
        player2Heroes: [],
        enemies: [],
        turn: 0,
        wave: 1,
        player1Wins: 0,
        player2Wins: 0,
        log: [],
        isGameOver: false,
        playerMode: 'single',
        gameMode: 'finalBoss',
        currentPlayer: 'player1',
        heroesActed: new Set(),
        statusEffects: new Map(),
        backgroundMusicPlaying: false
    };

    // DOM cache
    const domCache = {
        player1HeroesGrid: document.getElementById('player1HeroesGrid'),
        opponentGrid: document.getElementById('opponentGrid'),
        gameLog: document.getElementById('gameLog'),
        waveProgress: document.getElementById('waveProgress'),
        musicToggle: document.getElementById('musicToggle')
    };

    // Applies theme
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

    // Sanitizes input
    const sanitizeHTML = str => {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Plays sound
    const playSound = (type) => {
        const sound = document.getElementById(`${type}Sound`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => console.warn(`${type} sound failed to play`));
        }
    };

    // Toggles background music
    const toggleBackgroundMusic = () => {
        const music = document.getElementById('backgroundMusic');
        if (!music) return;
        if (gameState.backgroundMusicPlaying) {
            music.pause();
            gameState.backgroundMusicPlaying = false;
            domCache.musicToggle.textContent = 'Music: Off';
        } else {
            music.loop = true;
            music.play().catch(() => console.warn('Background music failed to play'));
            gameState.backgroundMusicPlaying = true;
            domCache.musicToggle.textContent = 'Music: On';
        }
    };

    // Debounces actions
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Applies damage animation
    const applyDamageAnimation = (element) => {
        element.classList.add('shake');
        requestAnimationFrame(() => {
            setTimeout(() => element.classList.remove('shake'), 500);
        });
    };

    // Styles cards
    const styleCards = () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.border = `2px solid ${colors.infinityGold}`;
            card.style.boxShadow = `0 0 10px ${colors.cosmicBlue}`;
            card.style.borderRadius = '10px';
            card.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.95) 100%)`;
            card.style.color = colors.starWhite;
            card.style.transition = 'transform 0.3s, box-shadow 0.3s';
            if (card.classList.contains('selected')) {
                card.style.border = `3px solid ${colors.heroRed}`;
                card.style.boxShadow = `0 0 20px ${colors.heroRed}`;
                card.style.transform = 'scale(1.05)';
            }

            const img = card.querySelector('.card-img-top');
            if (img) {
                img.style.borderRadius = '8px 8px 0 0';
                img.style.maxHeight = '150px';
                img.style.objectFit = 'cover';
                img.style.filter = `drop-shadow(0 0 4px ${colors.cosmicBlue})`;
                img.onerror = () => {
                    img.src = 'https://via.placeholder.com/150?text=Image+Error';
                    img.style.filter = 'grayscale(50%)';
                };
            }

            const cardTitle = card.querySelector('.card-title');
            if (cardTitle) {
                cardTitle.style.fontFamily = "'Bebas Neue', sans-serif";
                cardTitle.style.fontSize = '1.25rem';
            }

            const progress = card.querySelector('.progress-bar');
            if (progress) {
                progress.style.transition = 'width 0.5s ease';
            }
        });
    };

    // Styles modals
    const styleModals = () => {
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            modal.style.background = `rgba(13, 27, 42, 0.9)`;
            modal.style.border = `2px solid ${colors.infinityGold}`;
            modal.style.color = colors.starWhite;
            modal.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
            modal.style.borderRadius = '10px';
        });

        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });

        const modalTitles = document.querySelectorAll('.modal-title');
        modalTitles.forEach(title => {
            title.style.fontFamily = "'Bebas Neue', sans-serif";
            title.style.color = colors.infinityGold;
            title.style.textShadow = `0 0 10px ${colors.infinityGold}`;
            title.style.fontSize = '1.5rem';
        });

        const buttons = document.querySelectorAll('.modal .btn-close, .modal .btn-outline-light, .modal .btn-marvel-red, .modal .select-powerup-btn');
        buttons.forEach(button => {
            button.style.border = `1px solid ${colors.infinityGold}`;
            button.style.color = colors.starWhite;
            button.style.backgroundColor = 'transparent';
            button.style.transition = 'background-color 0.3s, color 0.3s, box-shadow 0.3s';
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = colors.infinityGold;
                button.style.color = colors.nebulaDark;
                button.style.boxShadow = `0 0 10px ${colors.infinityGold}`;
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = 'transparent';
                button.style.color = colors.starWhite;
                button.style.boxShadow = 'none';
            });
        });
    };

    // Shows special info modal
    const showSpecialInfoModal = (name, special) => {
        const modal = new bootstrap.Modal(document.getElementById('specialInfoModal'));
        const [specialName, specialDesc] = special.split(':').map(s => s.trim());
        document.getElementById('specialInfoModalLabel').textContent = `${sanitizeHTML(name)}'s Special Ability`;
        document.getElementById('specialInfoModalLabel').className = 'modal-title VictoryTxt';
        document.getElementById('specialName').textContent = specialName || 'Basic Attack';
        document.getElementById('specialDescription').textContent = specialDesc || 'Deals standard damage to a single target.';
        document.getElementById('specialUsage').textContent = 'Usage: Requires sufficient mana and no active cooldown.';
        modal.show();
        styleModals();
        playSound('moreInfo');
    };

    // Shows round complete modal
    const showRoundCompleteModal = (wave) => {
        const modal = new bootstrap.Modal(document.getElementById('roundCompleteModal'), { backdrop: 'static', keyboard: false });
        document.getElementById('roundCompleteModalLabel').textContent = `Round ${wave} Complete!`;
        document.getElementById('roundCompleteModalLabel').className = 'modal-title VictoryTxt';
        document.getElementById('roundCompleteMessage').textContent = `You have defeated all opponents in Round ${wave}!`;
        modal.show();
        styleModals();
        playSound('select');
    };

    // Shows powerup selection modal
    const showPowerupSelectionModal = () => {
        const modal = new bootstrap.Modal(document.getElementById('powerupSelectionModal'), { backdrop: 'static', keyboard: false });
        const powerupOptions = document.getElementById('powerupOptions');
        powerupOptions.innerHTML = '';

        const shuffledPowerups = powerups.sort(() => Math.random() - 0.5).slice(0, 3);
        shuffledPowerups.forEach(powerup => {
            const div = document.createElement('div');
            div.className = 'powerup-option';
            div.innerHTML = `
                <h6 class="VictoryTxt">${sanitizeHTML(powerup.name)}</h6>
                <p>${sanitizeHTML(powerup.description)}</p>
                <button class="btn btn-marvel-red select-powerup-btn" data-powerup-id="${powerup.id}">Select</button>
            `;
            powerupOptions.appendChild(div);
        });

        const skipBtn = document.createElement('button');
        skipBtn.className = 'btn btn-outline-light mt-2';
        skipBtn.textContent = 'Skip';
        skipBtn.addEventListener('click', () => {
            modal.hide();
            gameState.wave++;
            spawnNewWave();
        });
        powerupOptions.appendChild(skipBtn);

        powerupOptions.querySelectorAll('.select-powerup-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const powerupId = btn.getAttribute('data-powerup-id');
                applyPowerup(powerupId);
                modal.hide();
                gameState.wave++;
                spawnNewWave();
            });
        });

        modal.show();
        styleModals();
        playSound('select');
    };

    // Applies powerup
    const applyPowerup = (powerupId) => {
        const powerup = powerups.find(p => p.id === powerupId);
        if (!powerup) {
            console.warn('Invalid powerup ID:', powerupId);
            return;
        }
        const heroes = gameState.playerMode === 'multi' ? [...gameState.player1Heroes, ...gameState.player2Heroes] : gameState.player1Heroes;
        powerup.effect(heroes);
        updateGameLog(`🛡️ Applied ${powerup.name}: ${powerup.description}`, 'heal');
        console.log(`Applied powerup: ${powerup.name}`);
    };

    // Validates enemy data
    const validateEnemyData = (enemy) => {
        return {
            id: enemy.id || `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: enemy.name || defaultEnemy.name,
            health: typeof enemy.health === 'number' && enemy.health > 0 ? Math.round(enemy.health) : defaultEnemy.health,
            attack: typeof enemy.attack === 'number' && enemy.attack > 0 ? Math.round(enemy.attack) : defaultEnemy.attack,
            image: typeof enemy.image === 'string' && enemy.image ? enemy.image : defaultEnemy.image,
            special: typeof enemy.special === 'string' && enemy.special.includes(':') ? enemy.special : defaultEnemy.special
        };
    };

    // Spawns a new wave
    const spawnNewWave = () => {
        console.log(`Spawning wave ${gameState.wave} for ${gameState.gameMode} (${gameState.playerMode})`);
        gameState.heroesActed.clear();
        gameState.statusEffects.clear();
        gameState.currentPlayer = 'player1';
        gameState.turn = 0;
        gameState.enemies = [];

        if (gameState.playerMode === 'multi' && gameState.gameMode === 'multiplayer') {
            gameState.player1Heroes.forEach(h => {
                h.health = 100;
                h.mana = 50;
                h.attack = Math.floor(Math.random() * 11) + 15;
            });
            gameState.player2Heroes.forEach(h => {
                h.health = 100;
                h.mana = 50;
                h.attack = Math.floor(Math.random() * 11) + 15;
            });
            updateGameLog(`⚔️ Multiplayer Round ${gameState.wave} begins!`, 'wave');
        } else {
            const statMultiplier = 1 + 0.15 * (gameState.wave - 1); // Increased scaling for better progression
            if (gameState.gameMode === 'finalBoss') {
                if (gameState.wave === 3) {
                    const thanos = validateEnemyData({
                        ...finalBoss,
                        id: `boss-${Date.now()}`,
                        health: Math.round(finalBoss.health * 1.5 * statMultiplier),
                        attack: Math.round(finalBoss.attack * 1.5 * statMultiplier)
                    });
                    gameState.enemies.push(thanos);
                    console.log('Spawned Thanos:', thanos);
                    updateGameLog(`👑 Thanos appears in Round ${gameState.wave}!`, 'wave');
                } else {
                    const numEnemies = gameState.wave === 1 ? 2 : 3; // Fixed number for consistency
                    for (let i = 0; i < numEnemies; i++) {
                        const baseEnemy = baseEnemies[Math.floor(Math.random() * baseEnemies.length)] || defaultEnemy;
                        const enemy = validateEnemyData({
                            ...baseEnemy,
                            id: `enemy-${Date.now()}-${i}`,
                            health: Math.round(baseEnemy.health * (gameState.wave === 2 ? 1.3 * statMultiplier : statMultiplier)),
                            attack: Math.round(baseEnemy.attack * (gameState.wave === 2 ? 1.3 * statMultiplier : statMultiplier))
                        });
                        gameState.enemies.push(enemy);
                        console.log(`Spawned enemy ${i + 1}:`, enemy);
                    }
                }
            } else if (gameState.gameMode === 'infinite') {
                const numEnemies = Math.min(4, 2 + Math.floor(gameState.wave / 3)); // Gradual increase
                for (let i = 0; i < numEnemies; i++) {
                    const baseEnemy = baseEnemies[Math.floor(Math.random() * baseEnemies.length)] || defaultEnemy;
                    const enemy = validateEnemyData({
                        ...baseEnemy,
                        id: `enemy-${Date.now()}-${i}`,
                        health: Math.round(baseEnemy.health * statMultiplier),
                        attack: Math.round(baseEnemy.attack * statMultiplier)
                    });
                    gameState.enemies.push(enemy);
                    console.log(`Spawned enemy ${i + 1}:`, enemy);
                }
            }

            // Ensure at least one enemy spawns
            if (gameState.enemies.length === 0) {
                const fallbackEnemy = validateEnemyData({
                    ...defaultEnemy,
                    id: `fallback-${Date.now()}`
                });
                gameState.enemies.push(fallbackEnemy);
                console.warn('No enemies spawned, using fallback:', fallbackEnemy);
            }

            gameState.player1Heroes.forEach(h => {
                h.health = Math.min(100, h.health + 20);
                h.mana = Math.min(100, h.mana + 10);
            });
            if (gameState.playerMode === 'multi') {
                gameState.player2Heroes.forEach(h => {
                    h.health = Math.min(100, h.health + 20);
                    h.mana = Math.min(100, h.mana + 10);
                });
            }
            updateGameLog(`🌊 Round ${gameState.wave} begins with ${gameState.enemies.length} enemies!`, 'wave');
        }

        renderGameUI();
    };

    // Renders heroes
    const renderHeroes = (heroes, gridId, title) => {
        const grid = domCache[gridId];
        if (!grid) {
            console.error(`${gridId} not found`);
            return;
        }
        grid.innerHTML = '';
        if (!heroes || heroes.length === 0) {
            grid.innerHTML = `<div class="col-12"><p class="text-center text-muted">No heroes available.</p></div>`;
            return;
        }
        heroes.forEach((hero, index) => {
            if (!hero.id || !hero.firstName || !hero.photo) {
                console.warn('Invalid hero data:', hero);
                return;
            }
            const col = document.createElement('div');
            col.className = 'col';
            const glowId = index % 2 === 0 ? 'VictoryTxt' : 'LossTxt';
            const isDisabled = hero.health <= 0 || gameState.isGameOver || gameState.heroesActed.has(hero.id) || (gameState.playerMode === 'multi' && gameState.gameMode === 'multiplayer' && gameState.currentPlayer !== hero.player);
            const [specialName] = (hero.special || 'Basic Attack: Deals standard damage.').split(':').map(s => s.trim());
            const statusEffects = gameState.statusEffects.get(hero.id) || [];
            const statusTooltip = statusEffects.map(e => `${e.type.charAt(0).toUpperCase() + e.type.slice(1)}: ${e.duration} turn(s)`).join(', ') || 'None';
            col.innerHTML = `
                <div class="card h-100 shadow-sm ${hero.health <= 0 ? '' : 'hero-card'}" data-bs-toggle="tooltip" data-bs-placement="top" title="Special: ${sanitizeHTML(specialName)}\nStatus: ${statusTooltip}">
                    <img src="${sanitizeHTML(hero.photo)}" class="card-img-top" alt="${sanitizeHTML(hero.firstName)}">
                    <div class="card-body">
                        <h5 class="card-title ${glowId}">${sanitizeHTML(hero.firstName)}</h5>
                        <p class="card-text">Health: <div class="progress"><div class="progress-bar bg-success" style="width: ${hero.health}%">${hero.health}%</div></div></p>
                        <p class="card-text">Attack: ${hero.attack}</p>
                        <p class="card-text">Mana: ${hero.mana}/100</p>
                        <p class="card-text">Special: ${sanitizeHTML(specialName)}</p>
                        <button class="btn btn-sm btn-marvel-red attack-btn mb-1" data-hero-id="${hero.id}" ${isDisabled ? 'disabled' : ''} aria-label="Attack with ${hero.firstName}">Attack</button>
                        <button class="btn btn-sm btn-outline-light special-btn mb-1" data-hero-id="${hero.id}" ${isDisabled || hero.mana < 10 ? 'disabled' : ''} aria-label="Use special ability of ${hero.firstName}">Special</button>
                        <button class="btn btn-sm btn-marvel-info info-btn" data-hero-id="${hero.id}" aria-label="View special ability info for ${hero.firstName}">Special Info</button>
                    </div>
                </div>
            `;
            grid.appendChild(col);

            const attackBtn = col.querySelector('.attack-btn');
            const specialBtn = col.querySelector('.special-btn');
            const infoBtn = col.querySelector('.info-btn');
            attackBtn.addEventListener('click', debounce(() => handleAction(hero.id, 'attack'), 300));
            specialBtn.addEventListener('click', debounce(() => handleAction(hero.id, 'special'), 300));
            infoBtn.addEventListener('click', () => showSpecialInfoModal(hero.firstName, hero.special));
            if (hero.health <= 0) applyDamageAnimation(col);
        });
        styleCards();
        bootstrap.Tooltip.getOrCreateInstance(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    };

    // Renders enemies
    const renderEnemies = () => {
        const grid = domCache.opponentGrid;
        if (!grid) {
            console.error('Opponent grid not found');
            return;
        }
        grid.innerHTML = '';
        if (!gameState.enemies || gameState.enemies.length === 0) {
            console.warn('No enemies to render');
            grid.innerHTML = `<div class="col-12"><p class="text-center text-muted">No enemies available.</p></div>`;
            return;
        }
        gameState.enemies.forEach((enemy, index) => {
            if (!enemy.id || !enemy.name || !enemy.image) {
                console.warn('Invalid enemy data:', enemy);
                return;
            }
            const col = document.createElement('div');
            col.className = 'col';
            const glowId = index % 2 === 0 ? 'LossTxt' : 'VictoryTxt';
            const [specialName] = enemy.special.split(':').map(s => s.trim());
            const statusEffects = gameState.statusEffects.get(enemy.id) || [];
            const statusTooltip = statusEffects.map(e => `${e.type.charAt(0).toUpperCase() + e.type.slice(1)}: ${e.duration} turn(s)`).join(', ') || 'None';
            col.innerHTML = `
                <div class="card h-100 shadow-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Special: ${sanitizeHTML(specialName)}\nStatus: ${statusTooltip}">
                    <img src="${sanitizeHTML(enemy.image)}" class="card-img-top" alt="${sanitizeHTML(enemy.name)}">
                    <div class="card-body">
                        <h5 class="card-title ${glowId}">${sanitizeHTML(enemy.name)}</h5>
                        <p class="card-text">Health: <div class="progress"><div class="progress-bar bg-danger" style="width: ${enemy.health}%">${enemy.health}%</div></div></p>
                        <p class="card-text">Attack: ${enemy.attack}</p>
                        <p class="card-text">Special: ${sanitizeHTML(specialName)}</p>
                        <button class="btn btn-sm btn-marvel-info info-btn" data-enemy-id="${enemy.id}" aria-label="View special ability info for ${enemy.name}">Special Info</button>
                    </div>
                </div>
            `;
            grid.appendChild(col);

            const infoBtn = col.querySelector('.info-btn');
            infoBtn.addEventListener('click', () => showSpecialInfoModal(enemy.name, enemy.special));
            if (enemy.health <= 0) applyDamageAnimation(col);
        });
        styleCards();
        bootstrap.Tooltip.getOrCreateInstance(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    };

    // Renders game UI
    const renderGameUI = () => {
        renderHeroes(gameState.player1Heroes, 'player1HeroesGrid', 'Player 1 Heroes');
        if (gameState.playerMode === 'multi' && gameState.gameMode === 'multiplayer') {
            renderHeroes(gameState.player2Heroes, 'opponentGrid', 'Player 2 Heroes');
        } else {
            renderEnemies();
        }
        if (domCache.waveProgress) {
            const maxWaves = gameState.gameMode === 'finalBoss' ? 3 : 10;
            domCache.waveProgress.style.width = `${(gameState.wave / maxWaves) * 100}%`;
            domCache.waveProgress.textContent = `Wave ${gameState.wave}/${maxWaves}`;
        }
    };

    // Updates game log
    const updateGameLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const color = {
            info: colors.starWhite,
            damage: colors.heroRed,
            heal: '#28a745',
            wave: colors.infinityGold
        }[type] || colors.starWhite;
        gameState.log.push({ message, timestamp, type });
        if (domCache.gameLog) {
            domCache.gameLog.innerHTML = gameState.log.map(({ message, timestamp, type }) => `<p class="mb-1" style="color: ${color}">[${timestamp}] ${sanitizeHTML(message)}</p>`).join('');
            domCache.gameLog.scrollTop = domCache.gameLog.scrollHeight;
        }
        console.log(`Log [${type}]: ${message}`);
    };

    // Applies status effects
    const applyStatusEffects = () => {
        const aliveEntities = [...gameState.player1Heroes, ...gameState.player2Heroes, ...gameState.enemies].filter(e => e.health > 0);
        aliveEntities.forEach(entity => {
            const effects = gameState.statusEffects.get(entity.id) || [];
            effects.forEach(effect => {
                if (effect.type === 'poison' && effect.duration > 0) {
                    const damage = Math.floor(entity.health * 0.05);
                    entity.health = Math.max(0, entity.health - damage);
                    updateGameLog(`☠️ ${entity.name || entity.firstName} takes ${damage} poison damage!`, 'damage');
                    effect.duration--;
                } else if (effect.type === 'confused' && effect.duration > 0) {
                    effect.duration--;
                } else if (effect.type === 'delay' && effect.duration > 0) {
                    effect.duration--;
                } else if (effect.type === 'shield' && effect.duration > 0) {
                    effect.duration--;
                }
            });
            gameState.statusEffects.set(entity.id, effects.filter(e => e.duration > 0));
        });
    };

    // Checks for game over
    const checkGameOver = () => {
        const player1Alive = gameState.player1Heroes.some(h => h.health > 0);
        const player2Alive = gameState.player2Heroes.some(h => h.health > 0);
        const enemiesAlive = gameState.enemies.some(e => e.health > 0);

        if (gameState.playerMode === 'multi' && gameState.gameMode === 'multiplayer') {
            if (!player1Alive) {
                gameState.player2Wins++;
                updateGameLog(`🏆 Player 2 wins Round ${gameState.wave}!`, 'wave');
                if (gameState.player2Wins >= 3) {
                    updateGameLog('🏆 Player 2 wins the match!', 'wave');
                    showGameOverModal('Player 2 Victory', 'Player 2 has won the best-of-three match!');
                    gameState.isGameOver = true;
                    return true;
                }
                showRoundCompleteModal(gameState.wave);
                return false;
            }
            if (!player2Alive) {
                gameState.player1Wins++;
                updateGameLog(`🏆 Player 1 wins Round ${gameState.wave}!`, 'wave');
                if (gameState.player1Wins >= 3) {
                    updateGameLog('🏆 Player 1 wins the match!', 'wave');
                    showGameOverModal('Player 1 Victory', 'Player 1 has won the best-of-three match!');
                    gameState.isGameOver = true;
                    return true;
                }
                showRoundCompleteModal(gameState.wave);
                return false;
            }
            return false;
        }

        if (!player1Alive || (gameState.playerMode === 'multi' && !player2Alive)) {
            updateGameLog('💀 Your heroes have been defeated!', 'damage');
            showGameOverModal('Defeat', `Game Over! Your heroes fell in ${gameState.gameMode === 'finalBoss' ? 'Final Boss Mode' : gameState.gameMode === 'infinite' ? `Infinite Mode (Round ${gameState.wave})` : 'Multiplayer Mode'}.`);
            gameState.isGameOver = true;
            return true;
        }

        if (!enemiesAlive && (gameState.gameMode === 'finalBoss' || gameState.gameMode === 'infinite')) {
            if (gameState.gameMode === 'finalBoss' && gameState.wave === 3) {
                updateGameLog('🏆 Victory! Thanos has been defeated!', 'wave');
                showGameOverModal('Victory', `You have defeated Thanos in Final Boss Mode! ${gameState.playerMode === 'multi' ? 'Both players win!' : ''}`);
                gameState.isGameOver = true;
                return true;
            }
            showRoundCompleteModal(gameState.wave);
            return false;
        }

        return false;
    };

    // Displays game over modal
    const showGameOverModal = (title, message) => {
        const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
        const modalLabel = document.getElementById('gameOverModalLabel');
        modalLabel.textContent = title;
        modalLabel.className = `modal-title ${title.includes('Victory') ? 'VictoryTxt' : 'LossTxt'}`;
        document.getElementById('gameOverMessage').textContent = message;
        modal.show();
        styleModals();
        playSound('moreInfo');
        if (title.includes('Victory')) {
            // Simple confetti animation
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.top = '0';
            confetti.style.left = '0';
            confetti.style.width = '100%';
            confetti.style.height = '100%';
            confetti.style.pointerEvents = 'none';
            confetti.innerHTML = Array(50).fill().map(() => `<div style="position: absolute; width: 10px; height: 10px; background: ${colors[Math.floor(Math.random() * Object.keys(colors).length)]}; top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; animation: confetti 2s ease-out;"></div>`).join('');
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 2000);
        }
    };

    // Handles enemy attacks
    const enemyAttack = () => {
        if (gameState.gameMode === 'multiplayer' && gameState.playerMode === 'multi') return;
        const aliveHeroes = gameState.playerMode === 'multi' ? [...gameState.player1Heroes, ...gameState.player2Heroes].filter(h => h.health > 0) : gameState.player1Heroes.filter(h => h.health > 0);
        if (!aliveHeroes.length) return;
        const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
        const aliveEnemies = gameState.enemies.filter(e => e.health > 0 && !gameState.statusEffects.get(e.id)?.some(ef => ef.type === 'stun' || ef.type === 'delay'));
        if (!aliveEnemies.length) return;
        const attacker = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const effects = gameState.statusEffects.get(attacker.id) || [];
        if (effects.some(e => e.type === 'confused') && Math.random() < 0.5) {
            updateGameLog(`❓ ${attacker.name}'s attack misses due to confusion!`, 'info');
            return;
        }
        const targetEffects = gameState.statusEffects.get(target.id) || [];
        if (targetEffects.some(e => e.type === 'dodge')) {
            updateGameLog(`🛡️ ${target.firstName} dodges ${attacker.name}'s attack!`, 'info');
            gameState.statusEffects.set(target.id, targetEffects.filter(e => e.type !== 'dodge'));
            return;
        }
        if (targetEffects.some(e => e.type === 'shield')) {
            updateGameLog(`🛡️ ${target.firstName}'s shield blocks ${attacker.name}'s attack!`, 'info');
            gameState.statusEffects.set(target.id, targetEffects.filter(e => e.type !== 'shield'));
            return;
        }
        const damage = Math.floor(attacker.attack * (Math.random() * 0.2 + 0.9));
        target.health = Math.max(0, target.health - damage);
        updateGameLog(`⚔️ ${attacker.name} attacks ${target.firstName} for ${damage} damage!`, 'damage');
        playSound('attack');
    };

    // Advances turn
    const advanceTurn = () => {
        gameState.turn++;
        applyStatusEffects();
        gameState.player1Heroes.forEach(h => h.mana = Math.min(100, h.mana + 10));
        gameState.player2Heroes.forEach(h => h.mana = Math.min(100, h.mana + 10));
        if (gameState.gameMode === 'multiplayer' && gameState.playerMode === 'multi') {
            gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
            updateGameLog(`🔄 Turn ${gameState.turn}: ${gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn.`, 'info');
        } else {
            gameState.enemies.forEach(() => enemyAttack());
            updateGameLog(`🔄 Turn ${gameState.turn} begins.`, 'info');
            if (gameState.playerMode === 'multi') {
                gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
            }
        }
        gameState.heroesActed.clear();
        if (!checkGameOver()) {
            renderGameUI();
        }
    };

    // Handles hero actions
    const handleAction = (heroId, action) => {
        if (gameState.isGameOver) return;
        const heroes = gameState.currentPlayer === 'player1' ? gameState.player1Heroes : gameState.player2Heroes;
        const opponents = (gameState.playerMode === 'multi' && gameState.gameMode === 'multiplayer') ? (gameState.currentPlayer === 'player1' ? gameState.player2Heroes : gameState.player1Heroes) : gameState.enemies;
        const hero = heroes.find(h => h.id === heroId);
        if (!hero || hero.health <= 0 || gameState.heroesActed.has(heroId)) return;
        const aliveOpponents = opponents.filter(o => o.health > 0);
        if (!aliveOpponents.length) return;
        const effects = gameState.statusEffects.get(hero.id) || [];
        if (effects.some(e => e.type === 'confused') && Math.random() < 0.5) {
            updateGameLog(`❓ ${hero.firstName}'s ${action} misses due to confusion!`, 'info');
            gameState.heroesActed.add(heroId);
            if (gameState.heroesActed.size >= heroes.filter(h => h.health > 0).length) {
                advanceTurn();
            }
            renderGameUI();
            return;
        }
        let message = '';
        gameState.heroesActed.add(heroId);
        if (action === 'attack') {
            const target = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
            const damage = Math.floor(hero.attack * (Math.random() * 0.2 + 0.9));
            target.health = Math.max(0, target.health - damage);
            message = `⚔️ ${hero.firstName} attacks ${target.name || target.firstName} for ${damage} damage!`;
            playSound('attack');
        } else {
            const [specialName] = (hero.special || 'Basic Attack: Deals standard damage.').split(':').map(s => s.trim());
            const specialFn = specialAbilities[specialName] || specialAbilities['Basic Attack'];
            const target = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
            message = specialFn(hero, [target], aliveOpponents);
            playSound('special');
        }
        updateGameLog(message, action === 'attack' ? 'damage' : 'info');
        if (checkGameOver()) return;
        if (gameState.heroesActed.size >= heroes.filter(h => h.health > 0).length) {
            advanceTurn();
        }
        renderGameUI();
    };

    // Handles keyboard controls
    const handleKeyboardControls = (event) => {
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
            if (event.key === 'Enter') {
                const closeBtn = activeModal.querySelector('.btn-outline-light, .btn-marvel-red');
                if (closeBtn) closeBtn.click();
            }
            return;
        }
        const heroes = gameState.currentPlayer === 'player1' ? gameState.player1Heroes : gameState.player2Heroes;
        const aliveHeroes = heroes.filter(h => h.health > 0 && !gameState.heroesActed.has(h.id));
        if (!aliveHeroes.length) return;
        const hero = aliveHeroes[0];
        if (event.key === 'a' || event.key === 'A') {
            handleAction(hero.id, 'attack');
        } else if (event.key === 's' || event.key === 'S' && hero.mana >= 10) {
            handleAction(hero.id, 'special');
        }
    };

    // Updates game mode options
    const updateGameModeOptions = () => {
        const playerMode = document.querySelector('input[name="playerMode"]:checked').value;
        const multiplayerRadio = document.getElementById('multiplayerMode');
        multiplayerRadio.disabled = playerMode !== 'multi';
        if (playerMode !== 'multi' && multiplayerRadio.checked) {
            document.getElementById('finalBossMode').checked = true;
        }
    };

    // Initializes the game
    const initializeGame = () => {
        const rawPlayer1Heroes = JSON.parse(sessionStorage.getItem('player1Heroes') || '[]');
        const rawPlayer2Heroes = JSON.parse(sessionStorage.getItem('player2Heroes') || '[]');

        gameState.player1Heroes = rawPlayer1Heroes.map((hero, index) => ({
            ...hero,
            id: hero.id || `hero1-${index}-${Date.now()}`,
            health: 100,
            mana: 50,
            attack: Math.floor(Math.random() * 11) + 15,
            player: 'player1',
            photo: hero.photo || 'https://via.placeholder.com/150?text=No+Image',
            special: hero.special && hero.special.includes(':') ? hero.special : 'Basic Attack: Deals standard damage.'
        }));
        gameState.player2Heroes = rawPlayer2Heroes.map((hero, index) => ({
            ...hero,
            id: hero.id || `hero2-${index}-${Date.now()}`,
            health: 100,
            mana: 50,
            attack: Math.floor(Math.random() * 11) + 15,
            player: 'player2',
            photo: hero.photo || 'https://via.placeholder.com/150?text=No+Image',
            special: hero.special && hero.special.includes(':') ? hero.special : 'Basic Attack: Deals standard damage.'
        }));

        if (!gameState.player1Heroes.length) {
            console.error('No Player 1 heroes found');
            const noHeroesModal = new bootstrap.Modal(document.getElementById('noHeroesModal'));
            document.getElementById('noHeroesMessage').textContent = 'Player 1 has no heroes selected. Please select heroes in the roster.';
            noHeroesModal.show();
            styleModals();
            playSound('moreInfo');
            return;
        }

        const modeModal = new bootstrap.Modal(document.getElementById('modeSelectionModal'), { backdrop: 'static', keyboard: false });
        modeModal.show();
        styleModals();

        const playerModeRadios = document.querySelectorAll('input[name="playerMode"]');
        playerModeRadios.forEach(radio => {
            radio.addEventListener('change', updateGameModeOptions);
        });

        const startGameBtn = document.getElementById('startGameBtn');
        startGameBtn.addEventListener('click', () => {
            const playerMode = document.querySelector('input[name="playerMode"]:checked').value;
            const gameMode = document.querySelector('input[name="gameMode"]:checked').value;

            if (playerMode === 'multi' && gameState.player2Heroes.length === 0) {
                const noHeroesModal = new bootstrap.Modal(document.getElementById('noHeroesModal'));
                document.getElementById('noHeroesMessage').textContent = 'Player 2 must select heroes to play multiplayer modes.';
                noHeroesModal.show();
                styleModals();
                playSound('moreInfo');
                return;
            }
            if (gameMode === 'multiplayer' && playerMode !== 'multi') {
                const invalidModeModal = new bootstrap.Modal(document.getElementById('invalidModeModal'));
                invalidModeModal.show();
                styleModals();
                playSound('moreInfo');
                return;
            }

            gameState.playerMode = playerMode;
            gameState.gameMode = gameMode;
            sessionStorage.setItem('playerMode', gameState.playerMode);
            sessionStorage.setItem('gameMode', gameState.gameMode);

            modeModal.hide();
            resetGame();
        });

        const restartGameBtn = document.getElementById('restartGameBtn');
        restartGameBtn.addEventListener('click', () => {
            resetGame();
            modeModal.show();
            styleModals();
            playSound('select');
        });

        const nextRoundBtn = document.getElementById('nextRoundBtn');
        nextRoundBtn.addEventListener('click', () => {
            if (gameState.gameMode === 'multiplayer') {
                gameState.wave++;
                bootstrap.Modal.getInstance(document.getElementById('roundCompleteModal')).hide();
                spawnNewWave();
            } else {
                bootstrap.Modal.getInstance(document.getElementById('roundCompleteModal')).hide();
                showPowerupSelectionModal();
            }
        });

        document.getElementById('noHeroesModal').addEventListener('hidden.bs.modal', () => {
            if (gameState.player1Heroes.length === 0 || (gameState.playerMode === 'multi' && gameState.player2Heroes.length === 0)) {
                window.location.href = 'roster.html';
            }
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('show.bs.modal', () => {
                document.querySelectorAll('.modal.show').forEach(otherModal => {
                    if (otherModal !== modal) {
                        bootstrap.Modal.getInstance(otherModal).hide();
                    }
                });
                styleModals();
            });
        });

        if (domCache.musicToggle) {
            domCache.musicToggle.addEventListener('click', toggleBackgroundMusic);
        }

        document.addEventListener('keydown', handleKeyboardControls);

        applyTheme();
        styleModals();
    };

    // Resets game state
    const resetGame = () => {
        console.log('Resetting game state');
        gameState.turn = 0;
        gameState.wave = 1;
        gameState.player1Wins = 0;
        gameState.player2Wins = 0;
        gameState.log = [];
        gameState.isGameOver = false;
        gameState.currentPlayer = 'player1';
        gameState.heroesActed.clear();
        gameState.statusEffects.clear();
        gameState.enemies = [];

        gameState.player1Heroes.forEach(hero => {
            hero.health = 100;
            hero.mana = 50;
            hero.attack = Math.floor(Math.random() * 11) + 15;
        });
        gameState.player2Heroes.forEach(hero => {
            hero.health = 100;
            hero.mana = 50;
            hero.attack = Math.floor(Math.random() * 11) + 15;
        });

        domCache.gameLog.innerHTML = '';
        domCache.player1HeroesGrid.innerHTML = '';
        domCache.opponentGrid.innerHTML = '';

        updateGameLog('🎮 Game reset. Starting new game!', 'info');
        spawnNewWave();
    };

    // Initialize the game
    initializeGame();
});