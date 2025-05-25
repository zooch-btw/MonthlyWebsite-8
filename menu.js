/* JS: Menu logic for Galaxy BattleForge warrior selection screen.
 * Manages the selection of up to 3 Marvel heroes as warriors for the single-player campaign.
 * Clears selected warriors on page refresh and saves selections in a format compatible with game.js.
 */

/* JS: Global flag to track removal mode for deselecting warriors */
let isRemovalMode = false;

/* JS: Define warrior data for Galaxy BattleForge (37 Marvel heroes) */
window.players = [
    /* Warrior 1: Iron Man */
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
    /* Warrior 2: Captain America */
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
    /* Warrior 3: Thor */
    {
        id: 'hero-3',
        firstName: 'Thor',
        lastName: 'Odinson',
        realName: 'ThomaxHealth: 120, attack: 22, mana: 45r Odinson',
        weapon: 'Mjolnir',
        photo: 'imgs/thor.png',
        skill: 'Storm Summoning: Controls lightning and storms.',
        special: 'Thunder Strike: Deals heavy damage to one enemy with a lightning bolt.'
    },
    /* Warrior 4: Black Widow */
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
    /* Warrior 5: Hawkeye */
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
    /* Warrior 6: Spider-Man */
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
    /* Warrior 7: Doctor Strange */
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
    /* Warrior 8: Black Panther */
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
    /* Warrior 9: Scarlet Witch */
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
    /* Warrior 10: Ant-Man */
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
    /* Warrior 11: Wolverine */
    {
        id: 'hero-11',
        firstName: 'Wolverine',
        lastName: '',
        realName: 'James Howlett/Logan',
        weapon: 'Adamantium Claws and Healing Factor',
        photo: 'imgs/bub.png',
        skill: 'Berserker Rage: Unleashes unstoppable fury.',
        special: 'Adamantium Frenzy: Attacks multiple times in one turn.'
    },
    /* Warrior 12: Storm */
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
    /* Warrior 13: Cyclops */
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
    /* Warrior 14: Phoenix */
    {
        id: 'hero-14',
        firstName: 'Phoenix',
        lastName: '',
        realName: 'Jean Grey Summers',
        weapon: 'Telepathy and Telekinesis',
        photo: 'imgs/jean.png',
        skill: 'Psychic Overload: Overwhelms minds with psychic energy.',
        special: 'Mind Crush: Deals damage based on target’s remaining health.'
    },
    /* Warrior 15: Beast */
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
    /* Warrior 16: Gambit */
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
    /* Warrior 17: Rogue */
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
    /* Warrior 18: Deadpool */
    {
        id: 'hero-18',
        firstName: 'Deadpool',
        lastName: '',
        realName: 'Wade Wilson',
        weapon: 'Regenerative Healing Factor and Katanas',
        photo: 'imgs/wade.png',
        skill: 'Fourth Wall Break: Interacts with narrative reality.',
        special: 'Chimichanga Bomb: Explosive attack with random extra effects.'
    },
    /* Warrior 19: Venom */
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
    /* Warrior 20: Magneto */
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
    /* Warrior 21: Doctor Doom */
    {
        id: 'hero-21',
        firstName: 'Doctor',
        lastName: 'Doom',
        realName: 'Victor Von Doom',
        weapon: 'Power Armor and Sorcery',
        photo: 'imgs/doom.png',
        skill: 'Mystic-Tech Fusion: Combines magic and technology.',
        special: 'Doom’s Curse: Applies a damage-over-time effect to one enemy.'
    },
    /* Warrior 22: Thanos */
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
    /* Warrior 23: Loki */
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
    /* Warrior 24: Ultron */
    {
        id: 'hero-24',
        firstName: 'Ultron',
        lastName: '',
        realName: 'Ultron',
        weapon: 'Artificial Intelligence and Energy Blasts',
        photo: 'imgs/ai.png',
        skill: 'Network Hijacking: Controls digital systems.',
        special: 'Data Corruption: Reduces an enemy’s attack permanently.'
    },
    /* Warrior 25: Red Skull */
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
    /* Warrior 26: Green Goblin */
    {
        id: 'hero-26',
        firstName: 'Green',
        lastName: 'Goblin',
        realName: 'Norman Osborn',
        weapon: 'Pumpkin Bombs and Goblin Glider',
        photo: 'imgs/osborn.png',
        skill: 'Insanity Inducing Gas: Disorients foes with chemicals.',
        special: 'Pumpkin Barrage: Throws multiple bombs at random enemies.'
    },
    /* Warrior 27: Kingpin */
    {
        id: 'hero-27',
        firstName: 'Kingpin',
        lastName: '',
        realName: 'Wilson Fisk',
        weapon: 'Superhuman Strength and Criminal Empire',
        photo: 'imgs/fisk.png',
        skill: 'Criminal Overlord: Controls underworld networks.',
        special: 'Crushing Blow: Deals high damage to one enemy.'
    },
    /* Warrior 28: Black Cat */
    {
        id: 'hero-28',
        firstName: 'Black',
        lastName: 'Cat',
        realName: 'Felicia Hardy',
        weapon: 'Enhanced Agility and Luck Manipulation',
        photo: 'imgs/cat.png',
        skill: 'Probability Shift: Alters luck in her favor.',
        special: 'Lucky Strike: Guarantees a critical hit on one enemy.'
    },
    /* Warrior 29: Mysterio */
    {
        id: 'hero-29',
        firstName: 'Mysterio',
        lastName: '',
        realName: 'Quentin Beck',
        weapon: 'Illusions and Special Effects',
        photo: 'imgs/illusion.png',
        skill: 'Holographic Deception: Creates lifelike illusions.',
        special: 'Smoke and Mirrors: Confuses all enemies, reducing accuracy.'
    },
    /* Warrior 30: Rhino */
    {
        id: 'hero-30',
        firstName: 'Rhino',
        lastName: '',
        realName: 'Aleksei Sytsevich',
        weapon: 'Superhuman Strength and Durability',
        photo: 'imgs/rhino.png',
        skill: 'Unstoppable Charge: Crushes obstacles in a rampage.',
        special: 'Rhino Rush: Charges through, damaging multiple enemies.'
    },
    /* Warrior 31: Sandman */
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
    /* Warrior 32: Electro */
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
    /* Warrior 33: Doctor Octopus */
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
    /* Warrior 34: Kraven the Hunter */
    {
        id: 'hero-34',
        firstName: 'Kraven',
        lastName: 'the Hunter',
        realName: 'Sergei Kravinoff',
        weapon: 'Enhanced Strength and Tracking',
        photo: 'imgs/hunt.png',
        skill: 'Predator Instinct: Tracks prey across any terrain.',
        special: 'Hunter’s Trap: Immobilizes one enemy for two turns.'
    },
    /* Warrior 35: Shocker */
    {
        id: 'hero-35',
        firstName: 'Shocker',
        lastName: '',
        realName: 'Herman Schultz',
        weapon: 'Vibro-smash Gauntlets',
        photo: 'imgs/shock.png',
        skill: 'Shockwave Burst: Emits area-wide vibrations.',
        special: 'Vibro-Pulse: Disrupts all enemies, delaying their actions.'
    },
    /* Warrior 36: Scorpion */
    {
        id: 'hero-36',
        firstName: 'Scorpion',
        lastName: '',
        realName: 'Mac Gargan',
        weapon: 'Mechanical Tail and Enhanced Strength',
        photo: 'imgs/sting.png',
        skill: 'Venomous Sting: Paralyzes with tail strike.',
        special: 'Toxic Tail: Poisons one enemy, dealing damage over time.'
    },
    /* Warrior 37: Vulture */
    {
        id: 'hero-37',
        firstName: 'Vulture',
        lastName: '',
        realName: 'Adrian Toomes',
        weapon: 'Winged Flight and Enhanced Strength',
        photo: 'imgs/prey.png',
        skill: 'Aerial Assault: Dive-bombs with precision.',
        special: 'Talon Dive: Strikes one enemy, ignoring their defenses.'
    }
];

/* JS: Initialize selection screen when DOM is fully loaded */
document.addEventListener('DOMContentLoaded', () => {
    try {
        /* JS: Clear selected warriors to ensure empty grid on refresh */
        localStorage.setItem('player1Heroes', JSON.stringify([]));
        localStorage.setItem('player2Heroes', JSON.stringify([]));
        localStorage.setItem('warriors', JSON.stringify([])); // Clear game.js warriors
        /* JS: Load settings and initialize UI */
        loadSettings();
        populateAllHeroes();
        populateSelectedHeroes();
        initializeEventListeners();
    } catch (e) {
        console.error('Error initializing selection screen:', e);
        alert('Failed to initialize selection screen. Please check console.');
    }
});

/* JS: Load saved settings from localStorage or set defaults */
function loadSettings() {
    try {
        /* JS: Retrieve saved settings or use empty object */
        const savedSettings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
        /* JS: Define global settings with defaults, fixed to single-player */
        window.settings = {
            soundVolume: savedSettings.soundVolume || 50, // Volume (0-100)
            voiceSpeed: savedSettings.voiceSpeed || 1, // Voice speed (0.5-2)
            heroSkin: savedSettings.heroSkin || 'classic', // Warrior skin
            vibration: savedSettings.vibration ?? true, // Haptic feedback
            theme: savedSettings.theme || 'dark', // UI theme
            playerMode: 'single' // Fixed to single-player
        };
        /* JS: Apply light theme if set */
        document.body.classList.toggle('light-theme', window.settings.theme === 'light');
    } catch (e) {
        console.error('Error loading settings:', e);
        /* JS: Fallback to default settings */
        window.settings = {
            soundVolume: 50,
            voiceSpeed: 1,
            heroSkin: 'classic',
            vibration: true,
            theme: 'dark',
            playerMode: 'single'
        };
    }
}

/* JS: Populate grid with all available warriors */
function populateAllHeroes() {
    try {
        /* JS: Get grid container and clear content */
        const allHeroesGrid = document.getElementById('allHeroesGrid');
        if (!allHeroesGrid) throw new Error('allHeroesGrid not found');
        allHeroesGrid.innerHTML = '';
        /* JS: Load current selections */
        const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
        /* JS: Create card for each warrior */
        window.players.forEach((hero, index) => {
            const isSelected = player1Heroes.some(h => h.id === hero.id);
            const card = createHeroCard(hero, index, null, isSelected);
            allHeroesGrid.appendChild(card);
        });
    } catch (e) {
        console.error('Error populating all heroes:', e);
    }
}

/* JS: Populate grid with selected warriors */
function populateSelectedHeroes() {
    try {
        /* JS: Get grid container and clear content */
        const selectedGrid = document.getElementById('selectedHeroesGrid');
        if (!selectedGrid) throw new Error('selectedHeroesGrid not found');
        selectedGrid.innerHTML = '';
        /* JS: Load Player 1's selections (single-player only) */
        const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
        player1Heroes.forEach((hero, index) => {
            const card = createHeroCard(hero, index, 'player1');
            if (isRemovalMode) card.classList.add('removal-mode');
            selectedGrid.appendChild(card);
        });
    } catch (e) {
        console.error('Error populating selected heroes:', e);
    }
}

/* JS: Create a warrior card for available or selected grids */
function createHeroCard(hero, index, player, isSelected = false) {
    try {
        /* JS: Create card container */
        const card = document.createElement('div');
        card.classList.add('character-card');
        card.setAttribute('data-index', index); // Store index for reference
        if (player) card.setAttribute('data-player', player); // Indicate player
        card.setAttribute('data-hero-id', hero.id); // Store hero ID
        card.setAttribute('aria-label', `${hero.firstName} ${hero.lastName} card`); // Accessibility label

        /* JS: Create warrior image */
        const img = document.createElement('img');
        img.src = hero.photo; // Set image source
        img.alt = `${hero.firstName} ${hero.lastName}`; // Alt text for accessibility
        img.classList.add('character-img');
        if (window.settings.heroSkin === 'cosmic') img.classList.add('cosmic-skin'); // Apply skin

        /* JS: Create stats modal for warrior details */
        const statsModal = document.createElement('div');
        statsModal.classList.add('stats-modal');
        statsModal.innerHTML = `
            <h6>${hero.firstName} ${hero.lastName}</h6>
            <p>Real Name: ${hero.realName}</p>
            <p>Weapon: ${hero.weapon}</p>
            <p>Skill: ${hero.skill}</p>
            <p>Special: ${hero.special}</p>
        `;

        /* JS: Add click handler for selection or removal */
        card.addEventListener('click', () => {
            if (isRemovalMode && player) {
                /* JS: Remove warrior in removal mode */
                removeHero(hero, player);
                toggleRemovalMode(); // Exit removal mode
            } else if (player && !isRemovalMode) {
                /* JS: Deselect warrior in normal mode */
                removeHero(hero, player);
            } else if (!isRemovalMode && !isSelected) {
                /* JS: Select warrior in normal mode */
                addHero(hero);
            }
        });

        /* JS: Add select button for available warriors */
        if (!player) {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-select');
            button.textContent = 'Select';
            button.disabled = isSelected; // Disable if already selected
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                if (!isRemovalMode) addHero(hero); // Select warrior
            });
            card.append(img, statsModal, button);
        } else {
            card.append(img, statsModal);
        }

        return card;
    } catch (e) {
        console.error('Error creating hero card:', e);
        return document.createElement('div'); // Return empty div as fallback
    }
}

/* JS: Add a warrior to Player 1's roster */
function addHero(hero) {
    try {
        /* JS: Load current selections */
        const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
        /* JS: Check for duplicate selection */
        if (player1Heroes.some(h => h.id === hero.id)) {
            alert('This warrior is already selected!');
            return;
        }
        /* JS: Enforce maximum of 3 warriors */
        const maxHeroes = 3;
        if (player1Heroes.length >= maxHeroes) {
            alert('You can select up to 3 warriors!');
            return;
        }
        /* JS: Add warrior to Player 1's roster */
        player1Heroes.push(hero);
        localStorage.setItem('player1Heroes', JSON.stringify(player1Heroes));
        /* JS: Sync with game.js warriors format */
        syncWarriorsToGame();
        /* JS: Refresh grids */
        populateAllHeroes();
        populateSelectedHeroes();
        /* JS: Trigger vibration feedback if enabled */
        if (window.settings.vibration && navigator.vibrate) {
            navigator.vibrate(100); // Short vibration
        }
    } catch (e) {
        console.error('Error adding hero:', e);
        alert('Failed to add warrior.');
    }
}

/* JS: Remove warrior from Player 1's roster */
function removeHero(hero, player) {
    try {
        /* JS: Load and update selections */
        const heroes = JSON.parse(localStorage.getItem(`${player}Heroes`) || '[]');
        const updatedHeroes = heroes.filter(h => h.id !== hero.id);
        localStorage.setItem(`${player}Heroes`, JSON.stringify(updatedHeroes));
        /* JS: Sync with game.js warriors format */
        syncWarriorsToGame();
        /* JS: Refresh grids */
        populateAllHeroes();
        populateSelectedHeroes();
        /* JS: Trigger vibration feedback if enabled */
        if (window.settings.vibration && navigator.vibrate) {
            navigator.vibrate(100); // Short vibration
        }
    } catch (e) {
        console.error('Error removing hero:', e);
        alert('Failed to remove warrior.');
    }
}

/* JS: Sync selected warriors to game.js warriors format in localStorage */
function syncWarriorsToGame() {
    try {
        /* JS: Load Player 1's selections */
        const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
        /* JS: Map to game.js warrior format */
        const warriors = player1Heroes.map(hero => ({
            name: hero.realName,
            health: hero.realName === 'Tony Stark' ? 100 : hero.realName === 'Steve Rogers' ? 110 : hero.realName === 'Thor Odinson' ? 120 : 100, // Default health
            attack: hero.realName === 'Tony Stark' ? 20 : hero.realName === 'Steve Rogers' ? 18 : hero.realName === 'Thor Odinson' ? 22 : 20, // Default attack
            mana: hero.realName === 'Tony Stark' ? 50 : hero.realName === 'Steve Rogers' ? 40 : hero.realName === 'Thor Odinson' ? 45 : 50 // Default mana
        }));
        /* JS: Save to localStorage for game.js */
        localStorage.setItem('warriors', JSON.stringify(warriors));
    } catch (e) {
        console.error('Error syncing warriors:', e);
    }
}

/* JS: Toggle removal mode for deselecting warriors */
function toggleRemovalMode() {
    try {
        /* JS: Toggle removal mode flag */
        isRemovalMode = !isRemovalMode;
        /* JS: Update button appearance */
        const removeButton = document.getElementById('removeHeroBtn');
        if (removeButton) {
            removeButton.classList.toggle('active', isRemovalMode);
            removeButton.textContent = isRemovalMode ? 'Cancel Removal' : 'Remove Warrior';
        }
        /* JS: Update selected warriors' cards */
        populateSelectedHeroes();
    } catch (e) {
        console.error('Error toggling removal mode:', e);
    }
}

/* JS: Initialize event listeners for UI buttons */
function initializeEventListeners() {
    try {
        /* JS: Handle play button click to start single-player game */
        const playModeBtn = document.getElementById('playModeBtn');
        if (playModeBtn) {
            playModeBtn.addEventListener('click', () => {
                /* JS: Validate selections */
                const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
                if (player1Heroes.length === 0) {
                    alert('Please select at least one warrior.');
                    return;
                }
                /* JS: Ensure single-player mode */
                window.settings.playerMode = 'single';
                localStorage.setItem('gameSettings', JSON.stringify(window.settings));
                localStorage.setItem('player2Heroes', JSON.stringify([])); // Clear Player 2
                /* JS: Redirect to game page */
                window.location.href = 'game.html';
            });
        }

        /* JS: Handle remove warrior button click */
        const removeHeroBtn = document.getElementById('removeHeroBtn');
        if (removeHeroBtn) {
            removeHeroBtn.addEventListener('click', () => {
                /* JS: Toggle removal mode */
                toggleRemovalMode();
                /* JS: Check if selected warriors grid is empty */
                const player1Heroes = JSON.parse(localStorage.getItem('player1Heroes') || '[]');
                if (isRemovalMode && player1Heroes.length === 0) {
                    alert('No warriors selected to remove!');
                    toggleRemovalMode(); // Exit removal mode
                }
            });
        }
    } catch (e) {
        console.error('Error initializing event listeners:', e);
        alert('Failed to initialize buttons.');
    }
}