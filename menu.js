/* JS: Menu logic for Marvel Cosmic Arena hero selection screen.
 * Manages selection of up to 3 Marvel heroes for single-player campaign.
 * Saves selections in localStorage as 'player1Heroes' and 'selectedWarriors'.
 * Integrates with heroSelection.html, ensuring robust error handling and accessibility.
 */

/* JS: Configuration constants */
const CONFIG = {
    MAX_HEROES: 3, // Maximum selectable heroes
    VIBRATION_DURATION: 100, // Vibration feedback duration in milliseconds
    TOAST_DURATION: 3000, // Toast notification duration in milliseconds
    FALLBACK_IMAGE: 'imgs/fallback.png' // Fallback image path
};

/* JS: Global state for removal mode */
let isRemovalMode = false;

/* JS: Hero data with 40 Marvel heroes */
window.players = [
    /* Hero 1: Iron Man */
    {
        id: 'hero-1',
        firstName: 'Iron',
        lastName: 'Man',
        realName: 'Tony Stark',
        weapon: 'Iron Man Armor',
        photo: 'imgs/iron man.png',
        skill: 'Genius Inventor: Designs advanced tech on the fly.',
        special: 'Repulsor Barrage: Fires a focused energy blast at one enemy.'
    },
    /* Hero 2: Captain America */
    {
        id: 'hero-2',
        firstName: 'Captain',
        lastName: 'America',
        realName: 'Steve Rogers',
        weapon: 'Vibranium Shield',
        photo: 'imgs/capam.png',
        skill: 'Tactical Leadership: Inspires and coordinates allies.',
        special: 'Shield Bash: Stuns a single enemy for one turn.'
    },
    /* Hero 3: Thor */
    {
        id: 'hero-3',
        firstName: 'Thor',
        lastName: 'Odinson',
        realName: 'Thor Odinson',
        weapon: 'Mjolnir',
        photo: 'imgs/thor.png',
        skill: 'Storm Summoning: Controls lightning and storms.',
        special: 'Thunder Strike: Deals heavy damage to one enemy.'
    },
    /* Hero 4: Black Widow */
    {
        id: 'hero-4',
        firstName: 'Black',
        lastName: 'Widow',
        realName: 'Natasha Romanoff',
        weapon: 'Electroshock Batons',
        photo: 'imgs/widow.png',
        skill: 'Master Espionage: Infiltrates and gathers intel.',
        special: 'Stealth Strike: Attacks with increased critical chance.'
    },
    /* Hero 5: Hawkeye */
    {
        id: 'hero-5',
        firstName: 'Hawkeye',
        lastName: '',
        realName: 'Clint Barton',
        weapon: 'Bow and Trick Arrows',
        photo: 'imgs/hawkeye.png',
        skill: 'Precision Aim: Never misses a target.',
        special: 'Explosive Arrow: Damages all enemies in a small area.'
    },
    /* Hero 6: Spider-Man */
    {
        id: 'hero-6',
        firstName: 'Spider',
        lastName: 'Man',
        realName: 'Peter Parker',
        weapon: 'Web-shooters',
        photo: 'imgs/spiderman.png',
        skill: 'Spider-Sense: Detects imminent danger.',
        special: 'Web Trap: Immobilizes an enemy, preventing their next action.'
    },
    /* Hero 7: Doctor Strange */
    {
        id: 'hero-7',
        firstName: 'Doctor',
        lastName: 'Strange',
        realName: 'Stephen Strange',
        weapon: 'Mystic Arts / Eye of Agamotto',
        photo: 'imgs/strange.png',
        skill: 'Dimensional Manipulation: Opens portals across realms.',
        special: 'Time Loop: Resets health of one ally to its starting value.'
    },
    /* Hero 8: Black Panther */
    {
        id: 'hero-8',
        firstName: 'Black',
        lastName: 'Panther',
        realName: 'T’Challa',
        weapon: 'Vibranium Suit and Claws',
        photo: 'imgs/panther.png',
        skill: 'Kinetic Energy Absorption: Stores and redirects energy.',
        special: 'Vibranium Slash: Deals damage and absorbs some for self-healing.'
    },
    /* Hero 9: Scarlet Witch */
    {
        id: 'hero-9',
        firstName: 'Scarlet',
        lastName: 'Witch',
        realName: 'Wanda Maximoff',
        weapon: 'Chaos Magic',
        photo: 'imgs/witch.png',
        skill: 'Reality Warping: Alters reality with a thought.',
        special: 'Hex Bolt: Randomly reduces an enemy’s attack or health.'
    },
    /* Hero 10: Ant-Man */
    {
        id: 'hero-10',
        firstName: 'Ant',
        lastName: 'Man',
        realName: 'Scott Lang',
        weapon: 'Pym Particles Suit',
        photo: 'imgs/antman.png',
        skill: 'Size Manipulation: Shrinks or grows instantly.',
        special: 'Giant Stomp: Deals massive damage to one enemy.'
    },
    /* Hero 11: Wolverine */
    {
        id: 'hero-11',
        firstName: 'Wolverine',
        lastName: '',
        realName: 'James Howlett',
        weapon: 'Adamantium Claws',
        photo: 'imgs/bub.png',
        skill: 'Berserker Rage: Unleashes unstoppable fury.',
        special: 'Adamantium Frenzy: Attacks multiple times in one turn.'
    },
    /* Hero 12: Storm */
    {
        id: 'hero-12',
        firstName: 'Storm',
        lastName: '',
        realName: 'Ororo Munroe',
        weapon: 'Weather Manipulation',
        photo: 'imgs/storm.png',
        skill: 'Atmospheric Control: Creates hurricanes or clear skies.',
        special: 'Tornado Blast: Pushes back all enemies, delaying their actions.'
    },
    /* Hero 13: Cyclops */
    {
        id: 'hero-13',
        firstName: 'Cyclops',
        lastName: '',
        realName: 'Scott Summers',
        weapon: 'Optic Blasts',
        photo: 'imgs/scott.png',
        skill: 'Energy Beam Precision: Adjusts blast intensity.',
        special: 'Optic Barrage: Hits all enemies with reduced damage.'
    },
    /* Hero 14: Jean Grey */
    {
        id: 'hero-14',
        firstName: 'Jean',
        lastName: 'Grey',
        realName: 'Jean Grey',
        weapon: 'Telepathy and Telekinesis',
        photo: 'imgs/jean.png',
        skill: 'Psychic Overload: Overwhelms minds with psychic energy.',
        special: 'Mind Crush: Deals damage based on target’s remaining health.'
    },
    /* Hero 15: Beast */
    {
        id: 'hero-15',
        firstName: 'Beast',
        lastName: '',
        realName: 'Henry McCoy',
        weapon: 'Enhanced Strength and Agility',
        photo: 'imgs/beast.png',
        skill: 'Scientific Expertise: Solves complex problems instantly.',
        special: 'Primal Leap: Attacks and boosts own agility for one turn.'
    },
    /* Hero 16: Gambit */
    {
        id: 'hero-16',
        firstName: 'Gambit',
        lastName: '',
        realName: 'Remy LeBeau',
        weapon: 'Charged Playing Cards',
        photo: 'imgs/gambit.png',
        skill: 'Kinetic Charge: Infuses objects with explosive energy.',
        special: 'Ace of Spades: Throws a single card for high damage.'
    },
    /* Hero 17: Rogue */
    {
        id: 'hero-17',
        firstName: 'Rogue',
        lastName: '',
        realName: 'Anna Marie',
        weapon: 'Power Absorption',
        photo: 'imgs/rogue.png',
        skill: 'Memory Assimilation: Gains memories of those touched.',
        special: 'Power Drain: Steals health from an enemy to heal self.'
    },
    /* Hero 18: Deadpool */
    {
        id: 'hero-18',
        firstName: 'Deadpool',
        lastName: '',
        realName: 'Wade Wilson',
        weapon: 'Katanas',
        photo: 'imgs/wade.png',
        skill: 'Fourth Wall Break: Interacts with narrative reality.',
        special: 'Chimichanga Bomb: Explosive attack with random extra effects.'
    },
    /* Hero 19: Venom */
    {
        id: 'hero-19',
        firstName: 'Venom',
        lastName: '',
        realName: 'Eddie Brock',
        weapon: 'Symbiote Powers',
        photo: 'imgs/venom.png',
        skill: 'Symbiote Morph: Shapeshifts into weapons or forms.',
        special: 'Tendril Assault: Attacks all enemies with symbiote tendrils.'
    },
    /* Hero 20: Magneto */
    {
        id: 'hero-20',
        firstName: 'Magneto',
        lastName: '',
        realName: 'Max Eisenhardt',
        weapon: 'Magnetic Fields',
        photo: 'imgs/max.png',
        skill: 'Electromagnetic Pulse: Disables all electronics.',
        special: 'Metal Storm: Crushes one enemy with magnetic force.'
    },
    /* Hero 21: Doctor Doom */
    {
        id: 'hero-21',
        firstName: 'Doctor',
        lastName: 'Doom',
        realName: 'Victor von Doom',
        weapon: 'Power Armor and Sorcery',
        photo: 'imgs/doom.png',
        skill: 'Mystic-Tech Fusion: Combines magic and technology.',
        special: 'Doom’s Curse: Applies a damage-over-time effect.'
    },
    /* Hero 22: Thanos */
    {
        id: 'hero-22',
        firstName: 'Thanos',
        lastName: '',
        realName: 'Thanos',
        weapon: 'Infinity Gauntlet',
        photo: 'imgs/thanos.png',
        skill: 'Cosmic Domination: Commands universal forces.',
        special: 'Infinity Snap: Instantly defeats a weakened enemy.'
    },
    /* Hero 23: Loki */
    {
        id: 'hero-23',
        firstName: 'Loki',
        lastName: '',
        realName: 'Loki Laufeyson',
        weapon: 'Sorcery and Illusions',
        photo: 'imgs/loki.png',
        skill: 'Shape-shifting: Transforms into any form.',
        special: 'Illusionary Double: Creates a decoy to absorb one attack.'
    },
    /* Hero 24: Ultron */
    {
        id: 'hero-24',
        firstName: 'Ultron',
        lastName: '',
        realName: 'Ultron',
        weapon: 'Energy Blasts',
        photo: 'imgs/ai.png',
        skill: 'Network Hijacking: Controls digital systems.',
        special: 'Data Corruption: Reduces an enemy’s attack permanently.'
    },
    /* Hero 25: Red Skull */
    {
        id: 'hero-25',
        firstName: 'Red',
        lastName: 'Skull',
        realName: 'Johann Schmidt',
        weapon: 'Cosmic Cube',
        photo: 'imgs/skull.png',
        skill: 'Strategic Manipulation: Orchestrates complex schemes.',
        special: 'Cube Surge: Boosts all allies’ attack for one turn.'
    },
    /* Hero 26: Green Goblin */
    {
        id: 'hero-26',
        firstName: 'Green',
        lastName: 'Goblin',
        realName: 'Norman Osborn',
        weapon: 'Pumpkin Bombs',
        photo: 'imgs/osborn.png',
        skill: 'Insanity Gas: Disorients foes with chemicals.',
        special: 'Pumpkin Barrage: Throws multiple bombs at random enemies.'
    },
    /* Hero 27: Kingpin */
    {
        id: 'hero-27',
        firstName: 'Kingpin',
        lastName: '',
        realName: 'Wilson Fisk',
        weapon: 'Superhuman Strength',
        photo: 'imgs/fisk.png',
        skill: 'Criminal Overlord: Controls underworld networks.',
        special: 'Crushing Blow: Deals high damage to one enemy.'
    },
    /* Hero 28: Black Cat */
    {
        id: 'hero-28',
        firstName: 'Black',
        lastName: 'Cat',
        realName: 'Felicia Hardy',
        weapon: 'Enhanced Agility',
        photo: 'imgs/cat.png',
        skill: 'Probability Shift: Alters luck in her favor.',
        special: 'Lucky Strike: Guarantees a critical hit on one enemy.'
    },
    /* Hero 29: Mysterio */
    {
        id: 'hero-29',
        firstName: 'Mysterio',
        lastName: '',
        realName: 'Quentin Beck',
        weapon: 'Illusions',
        photo: 'imgs/illusion.png',
        skill: 'Holographic Deception: Creates lifelike illusions.',
        special: 'Smoke and Mirrors: Confuses all enemies, reducing accuracy.'
    },
    /* Hero 30: Rhino */
    {
        id: 'hero-30',
        firstName: 'Rhino',
        lastName: '',
        realName: 'Aleksei Sytsevich',
        weapon: 'Superhuman Strength',
        photo: 'imgs/rhino.png',
        skill: 'Unstoppable Charge: Crushes obstacles in a rampage.',
        special: 'Rhino Rush: Charges through, damaging multiple enemies.'
    },
    /* Hero 31: Sandman */
    {
        id: 'hero-31',
        firstName: 'Sand',
        lastName: 'Man',
        realName: 'Flint Marko',
        weapon: 'Sand Manipulation',
        photo: 'imgs/sand.png',
        skill: 'Sand Reformation: Rebuilds body from sand particles.',
        special: 'Sandstorm: Blinds enemies, reducing their attack.'
    },
    /* Hero 32: Electro */
    {
        id: 'hero-32',
        firstName: 'Electro',
        lastName: '',
        realName: 'Max Dillon',
        weapon: 'Electricity Manipulation',
        photo: 'imgs/dillon.png',
        skill: 'Power Surge: Overloads electrical systems.',
        special: 'Volt Surge: Chains lightning to hit multiple enemies.'
    },
    /* Hero 33: Doctor Octopus */
    {
        id: 'hero-33',
        firstName: 'Doctor',
        lastName: 'Octopus',
        realName: 'Otto Octavius',
        weapon: 'Mechanical Arms',
        photo: 'imgs/ock.png',
        skill: 'Multitasking Mastery: Controls arms independently.',
        special: 'Tentacle Slam: Attacks up to three enemies at once.'
    },
    /* Hero 34: Kraven */
    {
        id: 'hero-34',
        firstName: 'Kraven',
        lastName: 'the Hunter',
        realName: 'Sergei Kravinoff',
        weapon: 'Hunting Tools',
        photo: 'imgs/hunt.png',
        skill: 'Predator Instinct: Tracks prey across any terrain.',
        special: 'Hunter’s Trap: Immobilizes one enemy for two turns.'
    },
    /* Hero 35: Shocker */
    {
        id: 'hero-35',
        firstName: 'Shocker',
        lastName: '',
        realName: 'Herman Schultz',
        weapon: 'Vibro-Gauntlets',
        photo: 'imgs/shock.png',
        skill: 'Shockwave Burst: Emits area-wide vibrations.',
        special: 'Vibro-Pulse: Disrupts all enemies, delaying their actions.'
    },
    /* Hero 36: Scorpion */
    {
        id: 'hero-36',
        firstName: 'Scorpion',
        lastName: '',
        realName: 'Mac Gargan',
        weapon: 'Mechanical Tail',
        photo: 'imgs/sting.png',
        skill: 'Venomous Sting: Paralyzes with tail strike.',
        special: 'Toxic Tail: Poisons one enemy, dealing damage over time.'
    },
    /* Hero 37: Vulture */
    {
        id: 'hero-37',
        firstName: 'Vulture',
        lastName: '',
        realName: 'Adrian Toomes',
        weapon: 'Winged Flight',
        photo: 'imgs/prey.png',
        skill: 'Aerial Assault: Dive-bombs with precision.',
        special: 'Talon Dive: Strikes one enemy, ignoring their defenses.'
    },
    /* Hero 38: Hulk */
    {
        id: 'hero-38',
        firstName: 'Hulk',
        lastName: '',
        realName: 'Bruce Banner',
        weapon: 'Superhuman Strength',
        photo: 'imgs/hulk.png',
        skill: 'Gamma Rage: Strength increases with anger.',
        special: 'Smash: Deals massive area damage to all enemies.'
    },
    /* Hero 39: Bullseye */
    {
        id: 'hero-39',
        firstName: 'Bullseye',
        lastName: '',
        realName: 'Lester',
        weapon: 'Precision Throwing Weapons',
        photo: 'imgs/bullseye.png',
        skill: 'Deadly Accuracy: Hits any target with pinpoint precision.',
        special: 'Targeted Strike: Deals critical damage to one enemy.'
    },
    /* Hero 40: Winter Soldier */
    {
        id: 'hero-40',
        firstName: 'Winter',
        lastName: 'Soldier',
        realName: 'Bucky Barnes',
        weapon: 'Bionic Arm',
        photo: 'imgs/winter.png',
        skill: 'Covert Operations: Excels in stealth and sabotage.',
        special: 'Bionic Bash: Delivers a powerful punch with stun effect.'
    }
];

/* JS: Initialize selection screen on DOM load */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[menu.js] Initializing hero selection at', new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }));
    try {
        // Reset localStorage for clean state
        localStorage.setItem('player1Heroes', JSON.stringify([]));
        localStorage.setItem('selectedWarriors', JSON.stringify([]));
        localStorage.setItem('player2Heroes', JSON.stringify([]));
        if (!Array.isArray(window.players) || window.players.length === 0) {
            throw new Error('Hero data is invalid or empty');
        }
        loadSettings();
        populateAllHeroes();
        initializeEventListeners();
        console.log('[menu.js] Selection screen initialized with %d heroes', window.players.length);
    } catch (e) {
        console.error('[menu.js] Initialization error:', e);
        showError('Failed to initialize hero selection. Please reload.');
    }
});

/* JS: Load settings from localStorage or apply defaults */
const loadSettings = () => {
    console.log('[menu.js] Loading game settings');
    try {
        let savedSettings = {};
        try {
            const settingsData = localStorage.getItem('gameSettings');
            if (settingsData) savedSettings = JSON.parse(settingsData);
        } catch (e) {
            console.warn('[menu.js] Corrupted gameSettings:', e);
        }
        window.settings = {
            soundVolume: savedSettings.soundVolume || 50,
            voiceSpeed: savedSettings.voiceSpeed || 1,
            heroSkin: savedSettings.heroSkin || 'classic',
            vibration: savedSettings.vibration ?? true,
            theme: savedSettings.theme || 'dark',
            playerMode: 'single'
        };
        document.body.classList.toggle('light-theme', window.settings.theme === 'light');
        console.log('[menu.js] Settings applied:', window.settings);
    } catch (e) {
        console.error('[menu.js] Error loading settings:', e);
        window.settings = {
            soundVolume: 50,
            voiceSpeed: 1,
            heroSkin: 'classic',
            vibration: true,
            theme: 'dark',
            playerMode: 'single'
        };
        document.body.classList.remove('light-theme');
        showError('Failed to apply settings');
    }
};

/* JS: Populate hero grid with all available heroes */
const populateAllHeroes = () => {
    console.log('[menu.js] Populating hero grid');
    try {
        const heroGrid = document.getElementById('heroGrid');
        if (!heroGrid) throw new Error('heroGrid element not found');
        heroGrid.innerHTML = '';
        const player1Heroes = getPlayerHeroes('player1');
        let validHeroes = 0;
        window.players.forEach((hero, index) => {
            if (!isValidHero(hero)) {
                console.warn('[menu.js] Invalid hero at index %d:', index, hero);
                return;
            }
            const isSelected = player1Heroes.some(h => h.realName === hero.realName);
            const card = createHeroCard(hero, index, null, isSelected);
            heroGrid.appendChild(card);
            validHeroes++;
        });
        if (validHeroes === 0) throw new Error('No valid heroes to display');
        console.log('[menu.js] Rendered %d heroes', validHeroes);
    } catch (e) {
        console.error('[menu.js] Error rendering heroes:', e);
        showError('Failed to load heroes');
    }
};

/* JS: Retrieve player heroes from localStorage */
const getPlayerHeroes = (player) => {
    console.log('[menu.js] Retrieving %s heroes', player);
    try {
        const heroes = JSON.parse(localStorage.getItem(`${player}Heroes`) || '[]');
        if (!Array.isArray(heroes)) {
            console.warn('[menu.js] Invalid %sHeroes data', player);
            localStorage.setItem(`${player}Heroes`, JSON.stringify([]));
            return [];
        }
        console.log('[menu.js] Retrieved %d heroes for %s', heroes.length, player);
        return heroes;
    } catch (e) {
        console.error('[menu.js] Error retrieving %sHeroes:', player, e);
        localStorage.setItem(`${player}Heroes`, JSON.stringify([]));
        return [];
    }
};

/* JS: Validate hero object */
const isValidHero = (hero) => {
    console.log('[menu.js] Validating hero:', hero?.realName || 'Unknown');
    try {
        const isValid = hero &&
            typeof hero === 'object' &&
            typeof hero.id === 'string' && hero.id.length > 0 &&
            typeof hero.firstName === 'string' &&
            typeof hero.realName === 'string' &&
            typeof hero.photo === 'string' && hero.photo.length > 0 &&
            (hero.photo.startsWith('imgs/') || hero.photo === CONFIG.FALLBACK_IMAGE) &&
            typeof hero.weapon === 'string' &&
            typeof hero.skill === 'string' &&
            typeof hero.special === 'string';
        if (!isValid) console.warn('[menu.js] Hero validation failed:', hero);
        return isValid;
    } catch (e) {
        console.error('[menu.js] Error validating hero:', e);
        return false;
    }
};

/* JS: Create hero card for grid */
const createHeroCard = (hero, index, player, isSelected = false) => {
    console.log('[menu.js] Creating card for %s, index %d', hero.realName, index);
    try {
        const card = document.createElement('div');
        card.classList.add('hero-card');
        card.setAttribute('data-index', index);
        if (player) card.setAttribute('data-player', player);
        card.setAttribute('data-hero-id', hero.id);
        card.setAttribute('aria-label', `${hero.firstName} ${hero.lastName || ''} hero card`.trim());
        card.tabIndex = 0;

        const img = document.createElement('img');
        img.src = isValidHero(hero) ? hero.photo : CONFIG.FALLBACK_IMAGE;
        img.alt = `${hero.firstName} ${hero.lastName || ''} portrait`.trim();
        img.classList.add('hero-img');
        if (window.settings.heroSkin === 'cosmic') img.classList.add('cosmic-skin');
        img.onerror = () => {
            console.warn('[menu.js] Image load failed for %s: %s', hero.realName, img.src);
            img.src = CONFIG.FALLBACK_IMAGE;
            img.alt = 'Fallback hero portrait';
        };

        const info = document.createElement('div');
        info.className = 'hero-info';
        const displayName = `${hero.firstName} ${hero.lastName || ''}`.trim();
        info.innerHTML = `
            <div class="hero-name">${displayName}</div>
            <div class="hero-stats">
                <p>Real Name: ${hero.realName}</p>
                <p>Weapon: ${hero.weapon}</p>
                <p>Skill: ${hero.skill}</p>
                <p>Special: ${hero.special}</p>
            </div>
        `;

        card.addEventListener('click', () => {
            console.log('[menu.js] Card clicked for %s', hero.realName);
            try {
                if (isRemovalMode && player) {
                    removeHero(hero, player);
                    toggleRemovalMode();
                } else if (!isSelected) {
                    addHero(hero);
                }
            } catch (e) {
                console.error('[menu.js] Error handling click for %s:', hero.realName, e);
                showError('Error processing hero selection');
            }
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });

        if (!player) {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-marvel');
            button.textContent = isSelected ? 'Selected' : 'Select';
            button.disabled = isSelected;
            button.setAttribute('aria-label', `Select ${displayName}`);
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isRemovalMode) addHero(hero);
            });
            card.append(img, info, button);
        } else {
            card.append(img, info);
        }

        console.log('[menu.js] Card created for %s', hero.realName);
        return card;
    } catch (e) {
        console.error('[menu.js] Error creating card for %s:', hero.realName, e);
        return document.createElement('div');
    }
};

/* JS: Add hero to Player 1's roster */
const addHero = (hero) => {
    console.log('[menu.js] Adding hero: %s', hero.realName);
    try {
        const player1Heroes = getPlayerHeroes('player1');
        if (player1Heroes.some(h => h.realName === hero.realName)) {
            showError(`${hero.realName} is already selected`);
            return;
        }
        if (player1Heroes.length >= CONFIG.MAX_HEROES) {
            showError('Maximum 3 heroes can be selected');
            return;
        }
        player1Heroes.push(hero);
        localStorage.setItem('player1Heroes', JSON.stringify(player1Heroes));
        syncWarriorsToGame();
        populateAllHeroes();
        triggerVibration();
        console.log('[menu.js] Hero added: %s', hero.realName);
    } catch (e) {
        console.error('[menu.js] Error adding hero %s:', hero.realName, e);
        showError('Failed to add hero');
    }
};

/* JS: Remove hero from Player 1's roster */
const removeHero = (hero, player) => {
    console.log('[menu.js] Removing hero: %s', hero.realName);
    try {
        const heroes = getPlayerHeroes(player);
        const updatedHeroes = heroes.filter(h => h.realName !== hero.realName);
        localStorage.setItem(`${player}Heroes`, JSON.stringify(updatedHeroes));
        syncWarriorsToGame();
        populateAllHeroes();
        triggerVibration();
        console.log('[menu.js] Hero removed: %s', hero.realName);
    } catch (e) {
        console.error('[menu.js] Error removing hero %s:', hero.realName, e);
        showError('Failed to remove hero');
    }
};

/* JS: Sync selected heroes to game.js format */
const syncWarriorsToGame = () => {
    console.log('[menu.js] Syncing heroes to game.js');
    try {
        const player1Heroes = getPlayerHeroes('player1');
        const selectedWarriors = player1Heroes.map(hero => hero.realName);
        localStorage.setItem('selectedWarriors', JSON.stringify(selectedWarriors));
        console.log('[menu.js] Synced %d heroes:', selectedWarriors.length, selectedWarriors);
    } catch (e) {
        console.error('[menu.js] Error syncing heroes:', e);
        showError('Failed to sync heroes');
    }
};

/* JS: Toggle removal mode */
const toggleRemovalMode = () => {
    console.log('[menu.js] Toggling removal mode');
    try {
        isRemovalMode = !isRemovalMode;
        const removeButton = document.getElementById('removeHeroBtn');
        if (removeButton) {
            removeButton.classList.toggle('active', isRemovalMode);
            removeButton.textContent = isRemovalMode ? 'Cancel Removal' : 'Remove Hero';
            removeButton.setAttribute('aria-pressed', isRemovalMode.toString());
            console.log('[menu.js] Removal mode set to %s', isRemovalMode);
        }
        populateAllHeroes();
    } catch (e) {
        console.error('[menu.js] Error toggling removal mode:', e);
        showError('Failed to toggle removal mode');
    }
};

/* JS: Trigger vibration feedback */
const triggerVibration = () => {
    console.log('[menu.js] Triggering vibration');
    try {
        if (window.settings.vibration && navigator.vibrate) {
            navigator.vibrate(CONFIG.VIBRATION_DURATION);
            console.log('[menu.js] Vibration triggered');
        }
    } catch (e) {
        console.warn('[menu.js] Error triggering vibration:', e);
    }
};

/* JS: Show error toast notification */
const showError = (message) => {
    console.log('[menu.js] Showing error toast: %s', message);
    try {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
    } catch (e) {
        console.error('[menu.js] Error displaying toast:', e);
    }
};

/* JS: Initialize event listeners */
const initializeEventListeners = () => {
    console.log('[menu.js] Initializing event listeners');
    try {
        // Remove Hero button
        const removeButton = document.getElementById('removeHeroBtn');
        if (removeButton) {
            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('[menu.js] Remove Hero button clicked');
                const player1Heroes = getPlayerHeroes('player1');
                if (isRemovalMode || player1Heroes.length > 0) {
                    toggleRemovalMode();
                }
            });
        } else {
            console.warn('[menu.js] removeHeroBtn not found');
        }

        // Play Singleplayer button
        const playButton = document.getElementById('playModeBtn');
        if (playButton) {
            playButton.addEventListener('click', () => {
                console.log('[menu.js] Play Singleplayer button clicked');
                const player1Heroes = getPlayerHeroes('player1');
                if (player1Heroes.length === 0) {
                    showError('Please select at least one hero');
                    return;
                }
                window.location.href = 'game.html';
            });
        } else {
            console.warn('[menu.js] playModeBtn not found');
        }

        console.log('[menu.js] Event listeners initialized');
    } catch (e) {
        console.error('[menu.js] Error initializing listeners:', e);
        showError('Failed to initialize buttons');
    }
};