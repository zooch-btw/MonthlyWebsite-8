/* JS: Menu logic for Marvel Cosmic Arena hero selection screen.
 * Manages selection of up to 3 Marvel heroes for single-player campaign.
 * Saves selections in localStorage as 'selectedWarriors' for game.js compatibility.
 * Handles hero and image loading with fallback from imgs/ folder.
 * Updated to eliminate 'Failed to initialize buttons' error, ensure robust error handling,
 * and prevent execution halts that block playSingleplayer.js.
 */

/* JS: Global flag to track removal mode for deselecting heroes */
let isRemovalMode = false;

/* JS: Fallback image path for missing hero images in imgs/ folder */
const FALLBACK_IMAGE = 'imgs/fallback.png';

/* JS: Define hero data (37 Marvel heroes) with image paths in imgs/ folder */
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
    /* Hero 14: Phoenix */
    {
        id: 'hero-14',
        firstName: 'Phoenix',
        lastName: '',
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
        realName: 'William Baker',
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
        photo: 'imgs/shock.png',
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
    /* Hero 34: Kraven the Hunter */
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
        photo: 'imgs/dillon.png',
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
    }
];

/* JS: Initialize selection screen when DOM is fully loaded */
document.addEventListener('DOMContentLoaded', () => {
    /* JS: Log initialization start */
    console.log('Initializing hero selection screen.');
    try {
        /* JS: Reset localStorage for a clean state */
        localStorage.setItem('player1Heroes', JSON.stringify([]));
        localStorage.setItem('selectedWarriors', JSON.stringify([]));
        localStorage.setItem('player2Heroes', JSON.stringify([]));
        console.log('localStorage reset for heroes.');
        /* JS: Validate hero data */
        if (!Array.isArray(window.players) || window.players.length === 0) {
            console.error('Hero data is invalid or empty.');
            return;
        }
        /* JS: Initialize UI components */
        loadSettings();
        populateAllHeroes();
        populateSelectedHeroes();
        initializeEventListeners();
        console.log('Selection screen initialized with %d heroes.', window.players.length);
    } catch (e) {
        /* JS: Log initialization errors without halting execution */
        console.error('Initialization error:', e);
    }
});

/* JS: Load settings from localStorage or apply defaults */
function loadSettings() {
    /* JS: Log settings load attempt */
    console.log('Loading game settings.');
    try {
        /* JS: Parse saved settings safely */
        let savedSettings = {};
        try {
            const settingsData = localStorage.getItem('gameSettings');
            if (settingsData) savedSettings = JSON.parse(settingsData);
            console.log('Parsed saved settings:', savedSettings);
        } catch (e) {
            console.warn('Corrupted gameSettings in localStorage:', e);
        }
        /* JS: Apply settings with defaults */
        window.settings = {
            soundVolume: savedSettings.soundVolume || 50,
            voiceSpeed: savedSettings.voiceSpeed || 1,
            heroSkin: savedSettings.heroSkin || 'classic',
            vibration: savedSettings.vibration ?? true,
            theme: savedSettings.theme || 'dark',
            playerMode: 'single'
        };
        /* JS: Apply theme to body */
        document.body.classList.toggle('light-theme', window.settings.theme === 'light');
        console.log('Settings applied:', window.settings);
    } catch (e) {
        /* JS: Fallback to default settings on error */
        console.error('Error loading settings:', e);
        window.settings = {
            soundVolume: 50,
            voiceSpeed: 1,
            heroSkin: 'classic',
            vibration: true,
            theme: 'dark',
            playerMode: 'single'
        };
        document.body.classList.remove('light-theme');
        console.log('Applied default settings due to error.');
    }
}

/* JS: Populate grid with all available heroes */
function populateAllHeroes() {
    /* JS: Log population attempt */
    console.log('Populating all heroes grid.');
    try {
        /* JS: Get all heroes grid container */
        const allHeroesGrid = document.getElementById('allHeroesGrid');
        if (!allHeroesGrid) {
            console.error('allHeroesGrid element not found.');
            return;
        }
        allHeroesGrid.innerHTML = ''; // Clear existing cards
        /* JS: Get selected heroes */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Create cards for each hero */
        let validHeroes = 0;
        window.players.forEach((hero, index) => {
            if (!isValidHero(hero)) {
                console.warn('Invalid hero at index %d:', index, hero);
                return;
            }
            const isSelected = player1Heroes.some(h => h.id === hero.id);
            const card = createHeroCard(hero, index, null, isSelected);
            allHeroesGrid.appendChild(card);
            validHeroes++;
        });
        if (validHeroes === 0) {
            console.error('No valid heroes to display.');
            return;
        }
        console.log('Rendered %d available heroes.', validHeroes);
    } catch (e) {
        console.error('Error rendering available heroes:', e);
    }
}

/* JS: Populate grid with selected heroes */
function populateSelectedHeroes() {
    /* JS: Log population attempt */
    console.log('Populating selected heroes grid.');
    try {
        /* JS: Get selected heroes grid container */
        const selectedGrid = document.getElementById('selectedHeroesGrid');
        if (!selectedGrid) {
            console.error('selectedHeroesGrid element not found.');
            return;
        }
        selectedGrid.innerHTML = ''; // Clear existing cards
        /* JS: Get selected heroes */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Create cards for selected heroes */
        player1Heroes.forEach((hero, index) => {
            if (!isValidHero(hero)) {
                console.warn('Invalid selected hero:', hero);
                return;
            }
            const card = createHeroCard(hero, index, 'player1');
            if (isRemovalMode) card.classList.add('removal-mode');
            selectedGrid.appendChild(card);
        });
        console.log('Rendered %d selected heroes.', player1Heroes.length);
    } catch (e) {
        console.error('Error rendering selected heroes:', e);
    }
}

/* JS: Retrieve player heroes from localStorage */
function getPlayerHeroes(player) {
    /* JS: Log retrieval attempt */
    console.log(`Retrieving ${player} heroes from localStorage.`);
    try {
        const heroes = JSON.parse(localStorage.getItem(`${player}Heroes`) || '[]');
        if (!Array.isArray(heroes)) {
            console.warn(`Invalid ${player}Heroes data in localStorage.`);
            localStorage.setItem(`${player}Heroes`, JSON.stringify([]));
            return [];
        }
        console.log(`Retrieved ${heroes.length} heroes for ${player}.`);
        return heroes;
    } catch (e) {
        console.warn(`Error retrieving ${player}Heroes:`, e);
        localStorage.setItem(`${player}Heroes`, JSON.stringify([]));
        console.log(`Reset ${player}Heroes due to error.`);
        return [];
    }
}

/* JS: Validate hero object */
function isValidHero(hero) {
    /* JS: Log validation attempt */
    console.log('Validating hero:', hero?.realName || 'Unknown');
    try {
        const isValid = hero &&
            typeof hero === 'object' &&
            typeof hero.id === 'string' && hero.id.length > 0 &&
            typeof hero.firstName === 'string' &&
            typeof hero.realName === 'string' &&
            typeof hero.photo === 'string' && hero.photo.length > 0 &&
            (hero.photo.startsWith('imgs/') || hero.photo === FALLBACK_IMAGE) &&
            typeof hero.weapon === 'string' &&
            typeof hero.skill === 'string' &&
            typeof hero.special === 'string';
        if (!isValid) console.warn('Hero validation failed:', hero);
        return isValid;
    } catch (e) {
        console.error('Error validating hero:', e);
        return false;
    }
}

/* JS: Create a hero card for grids */
function createHeroCard(hero, index, player, isSelected = false) {
    /* JS: Log card creation attempt */
    console.log(`Creating card for ${hero.realName}, index ${index}.`);
    try {
        /* JS: Create card container */
        const card = document.createElement('div');
        card.classList.add('character-card');
        card.setAttribute('data-index', index);
        if (player) card.setAttribute('data-player', player);
        card.setAttribute('data-hero-id', hero.id);
        card.setAttribute('aria-label', `${hero.firstName} ${hero.lastName || ''} hero card`.trim());

        /* JS: Create hero image */
        const img = document.createElement('img');
        img.src = isValidHero(hero) ? hero.photo : FALLBACK_IMAGE;
        img.alt = `${hero.firstName} ${hero.lastName || ''} portrait`.trim();
        img.classList.add('character-img');
        if (window.settings.heroSkin === 'cosmic') img.classList.add('cosmic-skin');
        /* JS: Handle image load errors */
        img.onerror = () => {
            console.warn(`Image load failed for ${hero.realName}: ${img.src}. Using fallback.`);
            img.src = FALLBACK_IMAGE;
            img.alt = `${hero.firstName} ${hero.lastName || ''} fallback portrait`.trim();
        };

        /* JS: Create stats modal */
        const statsModal = document.createElement('div');
        statsModal.classList.add('stats-modal');
        statsModal.setAttribute('role', 'dialog');
        statsModal.setAttribute('aria-labelledby', `stats-${hero.id}`);
        const displayName = `${hero.firstName} ${hero.lastName || ''}`.trim();
        statsModal.innerHTML = `
            <h6 id="stats-${hero.id}">${displayName}</h6>
            <p>Real Name: ${hero.realName}</p>
            <p>Weapon: ${hero.weapon}</p>
            <p>Skill: ${hero.skill}</p>
            <p>Special: ${hero.special}</p>
        `;

        /* JS: Add click event for selection/removal */
        card.addEventListener('click', () => {
            console.log(`Card clicked for ${hero.realName}.`);
            try {
                if (isRemovalMode && player) {
                    removeHero(hero, player);
                    toggleRemovalMode();
                } else if (player && !isRemovalMode) {
                    removeHero(hero, player);
                } else if (!isRemovalMode && !isSelected) {
                    addHero(hero);
                }
            } catch (e) {
                console.error(`Error handling card click for ${hero.realName}:`, e);
            }
        });

        /* JS: Add keyboard accessibility */
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });

        /* JS: Add select button for available heroes */
        if (!player) {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-select');
            button.textContent = isSelected ? 'Selected' : 'Select';
            button.disabled = isSelected;
            button.setAttribute('aria-label', `Select ${displayName}`);
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isRemovalMode) addHero(hero);
            });
            card.append(img, statsModal, button);
        } else {
            card.append(img, statsModal);
        }

        console.log(`Card created for ${hero.realName}.`);
        return card;
    } catch (e) {
        console.error(`Error creating card for ${hero.realName}:`, e);
        return document.createElement('div');
    }
}

/* JS: Add a hero to Player 1's roster */
function addHero(hero) {
    /* JS: Log addition attempt */
    console.log(`Adding hero: ${hero.realName}`);
    try {
        /* JS: Get current heroes */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Prevent duplicates */
        if (player1Heroes.some(h => h.id === hero.id)) {
            console.log(`Hero ${hero.realName} already selected.`);
            return;
        }
        /* JS: Enforce max 3 heroes */
        const maxHeroes = 3;
        if (player1Heroes.length >= maxHeroes) {
            console.log('Maximum of 3 heroes reached.');
            return;
        }
        /* JS: Add hero and update storage */
        player1Heroes.push(hero);
        localStorage.setItem('player1Heroes', JSON.stringify(player1Heroes));
        /* JS: Sync and refresh UI */
        syncWarriorsToGame();
        populateAllHeroes();
        populateSelectedHeroes();
        /* JS: Trigger vibration */
        triggerVibration();
        console.log(`Hero added: ${hero.realName}`);
    } catch (e) {
        console.error(`Error adding hero ${hero.realName}:`, e);
    }
}

/* JS: Remove a hero from Player 1's roster */
function removeHero(hero, player) {
    /* JS: Log removal attempt */
    console.log(`Removing hero: ${hero.realName}`);
    try {
        /* JS: Filter out hero */
        const heroes = getPlayerHeroes(player);
        const updatedHeroes = heroes.filter(h => h.id !== hero.id);
        localStorage.setItem(`${player}Heroes`, JSON.stringify(updatedHeroes));
        /* JS: Sync and refresh UI */
        syncWarriorsToGame();
        populateAllHeroes();
        populateSelectedHeroes();
        /* JS: Trigger vibration */
        triggerVibration();
        console.log(`Hero removed: ${hero.realName}`);
    } catch (e) {
        console.error(`Error removing hero ${hero.realName}:`, e);
    }
}

/* JS: Sync selected heroes to game.js format */
function syncWarriorsToGame() {
    /* JS: Log sync attempt */
    console.log('Syncing heroes to game.js.');
    try {
        /* JS: Get selected heroes */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Map to real names */
        const selectedWarriors = player1Heroes.map(hero => hero.realName);
        localStorage.setItem('selectedWarriors', JSON.stringify(selectedWarriors));
        console.log('Synced %d heroes:', selectedWarriors.length, selectedWarriors);
    } catch (e) {
        console.error('Error syncing heroes:', e);
    }
}

/* JS: Toggle removal mode */
function toggleRemovalMode() {
    /* JS: Log toggle attempt */
    console.log('Toggling removal mode.');
    try {
        /* JS: Flip removal mode state */
        isRemovalMode = !isRemovalMode;
        /* JS: Update remove button */
        const removeButton = document.getElementById('removeHeroBtn');
        if (removeButton) {
            removeButton.classList.toggle('active', isRemovalMode);
            removeButton.textContent = isRemovalMode ? 'Cancel Removal' : 'Remove Hero';
            removeButton.setAttribute('aria-pressed', isRemovalMode.toString());
            console.log(`Removal mode set to ${isRemovalMode}.`);
        } else {
            console.warn('removeHeroBtn not found.');
        }
        /* JS: Refresh selected heroes grid */
        populateSelectedHeroes();
    } catch (e) {
        console.error('Error toggling removal mode:', e);
    }
}

/* JS: Trigger vibration feedback */
function triggerVibration() {
    /* JS: Log vibration attempt */
    console.log('Triggering vibration.');
    try {
        if (window.settings.vibration && navigator.vibrate && typeof navigator.vibrate === 'function') {
            navigator.vibrate(100);
            console.log('Vibration triggered.');
        }
    } catch (e) {
        console.warn('Error triggering vibration:', e);
    }
}

/* JS: Initialize event listeners */
function initializeEventListeners() {
    /* JS: Log initialization attempt */
    console.log('Initializing event listeners.');
    /* JS: Set up Remove Hero button */
    const removeButton = document.getElementById('removeHeroBtn');
    if (removeButton) {
        removeButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Remove Hero button clicked.');
            try {
                const player1Heroes = getPlayerHeroes('player1');
                if (isRemovalMode || player1Heroes.length > 0) {
                    toggleRemovalMode();
                }
            } catch (e) {
                console.error('Error handling Remove Hero click:', e);
            }
        });
        console.log('Remove Hero button listener attached.');
    } else {
        console.warn('removeHeroBtn not found in DOM.');
    }
    console.log('Event listeners initialized.');
}