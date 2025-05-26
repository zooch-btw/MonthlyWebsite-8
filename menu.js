/* JS: Menu logic for Marvel Cosmic Arena hero selection screen.
 * Manages selection of up to 3 Marvel heroes for single-player campaign.
 * Saves selections in localStorage as 'selectedWarriors' for game.js compatibility.
 * Ensures robust hero and image loading with fallback handling.
 * Optimizes DOM updates and enhances accessibility.
 */

/* JS: Global flag to track removal mode for deselecting heroes */
let isRemovalMode = false;

/* JS: Fallback image path for missing or invalid hero images */
const FALLBACK_IMAGE = 'imgs/fallback.png';

/* JS: Define hero data (37 Marvel heroes) with standardized image paths */
window.players = [
    /* Hero 1: Iron Man */
    {
        id: 'hero-1',
        firstName: 'Iron',
        lastName: 'Man',
        realName: 'Tony Stark',
        weapon: 'Iron Man Armor',
        photo: 'imgs/ironman.png',
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
        photo: 'imgs/captainamerica.png',
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
        photo: 'imgs/blackwidow.png',
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
        photo: 'imgs/doctorstrange.png',
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
        photo: 'imgs/blackpanther.png',
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
        photo: 'imgs/scarletwitch.png',
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
        photo: 'imgs/wolverine.png',
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
        photo: 'imgs/cyclops.png',
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
        photo: 'imgs/phoenix.png',
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
        photo: 'imgs/deadpool.png',
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
        photo: 'imgs/magneto.png',
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
        photo: 'imgs/doctordoom.png',
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
        photo: 'imgs/ultron.png',
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
        photo: 'imgs/redskull.png',
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
        photo: 'imgs/greengoblin.png',
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
        photo: 'imgs/kingpin.png',
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
        photo: 'imgs/blackcat.png',
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
        photo: 'imgs/mysterio.png',
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
        photo: 'imgs/sandman.png',
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
        photo: 'imgs/electro.png',
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
        photo: 'imgs/doctoroctopus.png',
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
        photo: 'imgs/kraven.png',
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
        photo: 'imgs/shocker.png',
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
        photo: 'imgs/scorpion.png',
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
        photo: 'imgs/vulture.png',
        skill: 'Aerial Assault: Dive-bombs with precision.',
        special: 'Talon Dive: Strikes one enemy, ignoring their defenses.'
    }
];

/* JS: Initialize selection screen when DOM is fully loaded */
document.addEventListener('DOMContentLoaded', () => {
    try {
        /* JS: Reset localStorage to ensure a clean state on page load */
        localStorage.setItem('player1Heroes', JSON.stringify([]));
        localStorage.setItem('selectedWarriors', JSON.stringify([]));
        localStorage.setItem('player2Heroes', JSON.stringify([]));
        /* JS: Validate hero data */
        if (!Array.isArray(window.players) || window.players.length === 0) {
            throw new Error('Hero data is invalid or empty.');
        }
        /* JS: Initialize UI components */
        loadSettings();
        populateAllHeroes();
        populateSelectedHeroes();
        initializeEventListeners();
        console.log('Selection screen initialized with %d heroes.', window.players.length);
    } catch (e) {
        console.error('Initialization failed:', e);
        alert('Failed to initialize hero selection. Please refresh the page.');
    }
});

/* JS: Load settings from localStorage or apply defaults */
function loadSettings() {
    try {
        /* JS: Safely parse saved settings */
        let savedSettings = {};
        try {
            const settingsData = localStorage.getItem('gameSettings');
            if (settingsData) savedSettings = JSON.parse(settingsData);
        } catch (e) {
            console.warn('Corrupted gameSettings in localStorage:', e);
            alert('Settings corrupted. Using defaults.');
        }
        /* JS: Set global settings with defaults */
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
        console.error('Error loading settings:', e);
        /* JS: Fallback to defaults */
        window.settings = {
            soundVolume: 50,
            voiceSpeed: 1,
            heroSkin: 'classic',
            vibration: true,
            theme: 'dark',
            playerMode: 'single'
        };
        document.body.classList.remove('light-theme');
        alert('Failed to load settings. Using defaults.');
    }
}

/* JS: Populate grid with all available heroes */
function populateAllHeroes() {
    try {
        /* JS: Get grid container */
        const allHeroesGrid = document.getElementById('allHeroesGrid');
        if (!allHeroesGrid) throw new Error('allHeroesGrid element missing.');
        allHeroesGrid.innerHTML = ''; // Clear existing cards
        /* JS: Load selected heroes */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Render valid hero cards */
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
        if (validHeroes === 0) throw new Error('No valid heroes to display.');
        console.log('Rendered %d available heroes.', validHeroes);
    } catch (e) {
        console.error('Error rendering available heroes:', e);
        alert('Failed to load available heroes.');
    }
}

/* JS: Populate grid with selected heroes */
function populateSelectedHeroes() {
    try {
        /* JS: Get selected grid container */
        const selectedGrid = document.getElementById('selectedHeroesGrid');
        if (!selectedGrid) throw new Error('selectedHeroesGrid element missing.');
        selectedGrid.innerHTML = ''; // Clear existing cards
        /* JS: Load selected heroes */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Render valid selected hero cards */
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
        alert('Failed to load selected heroes.');
    }
}

/* JS: Safely retrieve player heroes from localStorage */
function getPlayerHeroes(player) {
    try {
        const heroes = JSON.parse(localStorage.getItem(`${player}Heroes`) || '[]');
        if (!Array.isArray(heroes)) throw new Error('Invalid heroes data.');
        return heroes;
    } catch (e) {
        console.warn(`Corrupted ${player}Heroes in localStorage:`, e);
        localStorage.setItem(`${player}Heroes`, JSON.stringify([]));
        alert(`Failed to load ${player} heroes. Data reset.`);
        return [];
    }
}

/* JS: Validate hero object for required fields */
function isValidHero(hero) {
    try {
        /* JS: Check required fields */
        const isValid = hero &&
            typeof hero === 'object' &&
            typeof hero.id === 'string' &&
            hero.id.length > 0 &&
            typeof hero.firstName === 'string' &&
            typeof hero.realName === 'string' &&
            typeof hero.photo === 'string' &&
            hero.photo.length > 0 &&
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

/* JS: Create a hero card for available or selected grids */
function createHeroCard(hero, index, player, isSelected = false) {
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
            console.warn('Image load failed for %s: %s. Using fallback.', hero.realName, img.src);
            img.src = FALLBACK_IMAGE;
            img.alt = `${hero.firstName} ${hero.lastName || ''} fallback portrait`.trim();
        };

        /* JS: Create stats modal with accessibility */
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

        /* JS: Add click handler for selection/removal */
        card.addEventListener('click', () => {
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
                console.error('Card click error:', e);
                alert('Action failed. Please try again.');
            }
        });

        /* JS: Add keyboard support */
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

        return card;
    } catch (e) {
        console.error('Error creating card for %s:', hero.realName, e);
        return document.createElement('div');
    }
}

/* JS: Add a hero to Player 1's roster */
function addHero(hero) {
    try {
        /* JS: Load current selections */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Prevent duplicates */
        if (player1Heroes.some(h => h.id === hero.id)) {
            alert('This hero is already selected.');
            return;
        }
        /* JS: Enforce max 3 heroes */
        const maxHeroes = 3;
        if (player1Heroes.length >= maxHeroes) {
            alert('Maximum of 3 heroes allowed.');
            return;
        }
        /* JS: Add hero */
        player1Heroes.push(hero);
        localStorage.setItem('player1Heroes', JSON.stringify(player1Heroes));
        /* JS: Sync and refresh */
        syncWarriorsToGame();
        populateAllHeroes();
        populateSelectedHeroes();
        /* JS: Trigger vibration */
        triggerVibration();
        console.log('Added hero: %s', hero.realName);
    } catch (e) {
        console.error('Error adding hero:', e);
        alert('Failed to add hero.');
    }
}

/* JS: Remove a hero from Player 1's roster */
function removeHero(hero, player) {
    try {
        /* JS: Update selections */
        const heroes = getPlayerHeroes(player);
        const updatedHeroes = heroes.filter(h => h.id !== hero.id);
        localStorage.setItem(`${player}Heroes`, JSON.stringify(updatedHeroes));
        /* JS: Sync and refresh */
        syncWarriorsToGame();
        populateAllHeroes();
        populateSelectedHeroes();
        /* JS: Trigger vibration */
        triggerVibration();
        console.log('Removed hero: %s', hero.realName);
    } catch (e) {
        console.error('Error removing hero:', e);
        alert('Failed to remove hero.');
    }
}

/* JS: Sync selected heroes to game.js format */
function syncWarriorsToGame() {
    try {
        /* JS: Load selections */
        const player1Heroes = getPlayerHeroes('player1');
        /* JS: Map to names for game.js */
        const selectedWarriors = player1Heroes.map(hero => hero.realName);
        localStorage.setItem('selectedWarriors', JSON.stringify(selectedWarriors));
        console.log('Synced %d heroes:', selectedWarriors.length, selectedWarriors);
    } catch (e) {
        console.error('Error syncing heroes:', e);
        alert('Failed to sync heroes.');
    }
}

/* JS: Toggle removal mode */
function toggleRemovalMode() {
    try {
        /* JS: Update flag */
        isRemovalMode = !isRemovalMode;
        /* JS: Update button */
        const removeButton = document.getElementById('removeHeroBtn');
        if (removeButton) {
            removeButton.classList.toggle('active', isRemovalMode);
            removeButton.textContent = isRemovalMode ? 'Cancel Removal' : 'Remove Hero';
            removeButton.setAttribute('aria-pressed', isRemovalMode.toString());
        } else {
            console.warn('removeHeroBtn missing.');
        }
        /* JS: Refresh selected grid */
        populateSelectedHeroes();
        console.log('Removal mode: %s', isRemovalMode);
    } catch (e) {
        console.error('Error toggling removal mode:', e);
        alert('Failed to toggle removal mode.');
    }
}

/* JS: Trigger vibration feedback if supported */
function triggerVibration() {
    try {
        if (window.settings.vibration && navigator.vibrate && typeof navigator.vibrate === 'function') {
            navigator.vibrate(100);
        } else if (window.settings.vibration) {
            console.log('Vibration not supported in this browser.');
        }
    } catch (e) {
        console.warn('Vibration error:', e);
    }
}

/* JS: Initialize event listeners */
function initializeEventListeners() {
    try {
        /* JS: Play button handler */
        const playModeBtn = document.getElementById('playModeBtn');
        if (playModeBtn) {
            playModeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    /* JS: Validate selections */
                    const player1Heroes = getPlayerHeroes('player1');
                    if (player1Heroes.length === 0) {
                        alert('Please select at least one hero.');
                        return;
                    }
                    if (player1Heroes.length > 3) {
                        alert('Maximum of 3 heroes allowed.');
                        return;
                    }
                    /* JS: Set single-player mode */
                    window.settings.playerMode = 'single';
                    localStorage.setItem('gameSettings', JSON.stringify(window.settings));
                    /* JS: Clear player2 data */
                    localStorage.setItem('player2Heroes', JSON.stringify([]));
                    /* JS: Sync heroes */
                    syncWarriorsToGame();
                    /* JS: Check if game.html exists */
                    try {
                        const response = await fetch('game.html', { method: 'HEAD' });
                        if (!response.ok) throw new Error('game.html not found.');
                        window.location.href = 'game.html';
                        console.log('Navigating to game with %d heroes.', player1Heroes.length);
                    } catch (navError) {
                        console.error('Navigation failed:', navError);
                        alert('Game page unavailable. Please check setup.');
                    }
                } catch (e) {
                    console.error('Error starting game:', e);
                    alert('Failed to start game.');
                }
            });
        } else {
            console.warn('playModeBtn missing.');
        }

        /* JS: Remove button handler */
        const removeButton = document.getElementById('removeHeroBtn');
        if (removeButton) {
            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    const player1Heroes = getPlayerHeroes('player1');
                    if (isRemovalMode || player1Heroes.length > 0) {
                        toggleRemovalMode();
                    } else {
                        alert('No heroes selected to remove.');
                    }
                } catch (e) {
                    console.error('Error toggling removal:', e);
                    alert('Failed to toggle removal mode.');
                }
            });
        } else {
            console.warn('removeHeroBtn missing.');
        }

        console.log('Event listeners initialized.');
    } catch (e) {
        console.error('Error initializing listeners:', e);
        alert('Failed to initialize buttons.');
    }
}