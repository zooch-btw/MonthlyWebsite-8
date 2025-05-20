// Define player data
window.players = [
    {
        firstName: 'Iron',
        lastName: 'Man',
        realName: 'Tony Stark',
        weapon: 'Iron Man Armor',
        photo: 'imgs/iron man.png',
        skill: 'Genius Inventor: Designs advanced tech on the fly.'
    },
    {
        firstName: 'Captain',
        lastName: 'America',
        realName: 'Steve Rogers',
        weapon: 'Vibranium Shield',
        photo: 'imgs/capam.png',
        skill: 'Tactical Leadership: Inspires and coordinates allies.'
    },
    {
        firstName: 'Thor',
        lastName: 'Odinson',
        realName: 'Thor Odinson',
        weapon: 'Mjolnir',
        photo: 'imgs/thor.png',
        skill: 'Storm Summoning: Controls lightning and storms.'
    },
    {
        firstName: 'Black',
        lastName: 'Widow',
        realName: 'Natasha Romanoff',
        weapon: 'Electroshock Batons',
        photo: 'imgs/widow.png',
        skill: 'Master Espionage: Infiltrates and gathers intel.'
    },
    {
        firstName: 'Hawkeye',
        lastName: '',
        realName: 'Clint Barton',
        weapon: 'Bow and Trick Arrows',
        photo: 'imgs/hawkeye.png',
        skill: 'Precision Aim: Never misses a target.'
    },
    {
        firstName: 'Spider',
        lastName: 'Man',
        realName: 'Peter Parker',
        weapon: 'Web-shooters',
        photo: 'imgs/spiderman.png',
        skill: 'Spider-Sense: Detects imminent danger.'
    },
    {
        firstName: 'Doctor',
        lastName: 'Strange',
        realName: 'Stephen Strange',
        weapon: 'Mystic Arts / Eye of Agamotto',
        photo: 'imgs/strange.png',
        skill: 'Dimensional Manipulation: Opens portals across realms.'
    },
    {
        firstName: 'Black',
        lastName: 'Panther',
        realName: 'T’Challa',
        weapon: 'Vibranium Suit and Claws',
        photo: 'imgs/panther.png',
        skill: 'Kinetic Energy Absorption: Stores and redirects energy.'
    },
    {
        firstName: 'Scarlet',
        lastName: 'Witch',
        realName: 'Wanda Maximoff',
        weapon: 'Chaos Magic',
        photo: 'imgs/witch.png',
        skill: 'Reality Warping: Alters reality with a thought.'
    },
    {
        firstName: 'Ant',
        lastName: 'Man',
        realName: 'Scott Lang',
        weapon: 'Pym Particles Suit',
        photo: 'imgs/antman.png',
        skill: 'Size Manipulation: Shrinks or grows instantly.'
    },
    {
        firstName: 'Wolverine',
        lastName: '',
        realName: 'James Howlett/Logan',
        weapon: 'Adamantium Claws and Healing Factor',
        photo: 'imgs/bub.png',
        skill: 'Berserker Rage: Unleashes unstoppable fury.'
    },
    {
        firstName: 'Storm',
        lastName: '',
        realName: 'Ororo Munroe',
        weapon: 'Weather Manipulation',
        photo: 'imgs/storm.png',
        skill: 'Atmospheric Control: Creates hurricanes or clear skies.'
    },
    {
        firstName: 'Cyclops',
        lastName: '',
        realName: 'Scott Summers',
        weapon: 'Optic Blasts',
        photo: 'imgs/scott.png',
        skill: 'Energy Beam Precision: Adjusts blast intensity.'
    },
    {
        firstName: 'Phoenix',
        lastName: '',
        realName: 'Jean Grey Summers',
        weapon: 'Telepathy and Telekinesis',
        photo: 'imgs/jean.png',
        skill: 'Psychic Overload: Overwhelms minds with psychic energy.'
    },
    {
        firstName: 'Beast',
        lastName: '',
        realName: 'Henry McCoy',
        weapon: 'Enhanced Strength and Agility',
        photo: 'imgs/beast.png',
        skill: 'Scientific Expertise: Solves complex problems instantly.'
    },
    {
        firstName: 'Gambit',
        lastName: '',
        realName: 'Remy LeBeau',
        weapon: 'Charged Playing Cards',
        photo: 'imgs/gambit.png',
        skill: 'Kinetic Charge: Infuses objects with explosive energy.'
    },
    {
        firstName: 'Rogue',
        lastName: '',
        realName: 'Anna Marie',
        weapon: 'Power Absorption',
        photo: 'imgs/rogue.png',
        skill: 'Memory Assimilation: Gains memories of those touched.'
    },
    {
        firstName: 'Deadpool',
        lastName: '',
        realName: 'Wade Wilson',
        weapon: 'Regenerative Healing Factor and Katanas',
        photo: 'imgs/wade.png',
        skill: 'Fourth Wall Break: Interacts with narrative reality.'
    },
    {
        firstName: 'Venom',
        lastName: '',
        realName: 'Eddie Brock',
        weapon: 'Symbiote Powers',
        photo: 'imgs/venom.png',
        skill: 'Symbiote Morph: Shapeshifts into weapons or forms.'
    },
    {
        firstName: 'Magneto',
        lastName: '',
        realName: 'Max Eisenhardt',
        weapon: 'Magnetic Fields',
        photo: 'imgs/max.png',
        skill: 'Electromagnetic Pulse: Disables all electronics.'
    },
    {
        firstName: 'Doctor',
        lastName: 'Doom',
        realName: 'Victor Von Doom',
        weapon: 'Power Armor and Sorcery',
        photo: 'imgs/doom.png',
        skill: 'Mystic-Tech Fusion: Combines magic and technology.'
    },
    {
        firstName: 'Thanos',
        lastName: '',
        realName: 'Thanos',
        weapon: 'Infinity Gauntlet',
        photo: 'imgs/thanos.png',
        skill: 'Cosmic Domination: Commands universal forces.'
    },
    {
        firstName: 'Loki',
        lastName: '',
        realName: 'Loki Laufeyson',
        weapon: 'Sorcery and Illusions',
        photo: 'imgs/loki.png',
        skill: 'Shape-shifting: Transforms into any form.'
    },
    {
        firstName: 'Ultron',
        lastName: '',
        realName: 'Ultron',
        weapon: 'Artificial Intelligence and Energy Blasts',
        photo: 'imgs/ai.png',
        skill: 'Network Hijacking: Controls digital systems.'
    },
    {
        firstName: 'Red',
        lastName: 'Skull',
        realName: 'Johann Schmidt',
        weapon: 'Cosmic Cube',
        photo: 'imgs/skull.png',
        skill: 'Strategic Manipulation: Orchestrates complex schemes.'
    },
    {
        firstName: 'Green',
        lastName: 'Goblin',
        realName: 'Norman Osborn',
        weapon: 'Pumpkin Bombs and Goblin Glider',
        photo: 'imgs/osborn.png',
        skill: 'Insanity Inducing Gas: Disorients foes with chemicals.'
    },
    {
        firstName: 'Kingpin',
        lastName: '',
        realName: 'Wilson Fisk',
        weapon: 'Superhuman Strength and Criminal Empire',
        photo: 'imgs/fisk.png',
        skill: 'Criminal Overlord: Controls underworld networks.'
    },
    {
        firstName: 'Black',
        lastName: 'Cat',
        realName: 'Felicia Hardy',
        weapon: 'Enhanced Agility and Luck Manipulation',
        photo: 'imgs/cat.png',
        skill: 'Probability Shift: Alters luck in her favor.'
    },
    {
        firstName: 'Mysterio',
        lastName: '',
        realName: 'Quentin Beck',
        weapon: 'Illusions and Special Effects',
        photo: 'imgs/illusion.png',
        skill: 'Holographic Deception: Creates lifelike illusions.'
    },
    {
        firstName: 'Rhino',
        lastName: '',
        realName: 'Aleksei Sytsevich',
        weapon: 'Superhuman Strength and Durability',
        photo: 'imgs/rhino.png',
        skill: 'Unstoppable Charge: Crushes obstacles in a rampage.'
    },
    {
        firstName: 'Sand',
        lastName: 'Man',
        realName: 'Flint Marko',
        weapon: 'Sand Manipulation',
        photo: 'imgs/sand.png',
        skill: 'Sand Reformation: Rebuilds body from sand particles.'
    },
    {
        firstName: 'Electro',
        lastName: '',
        realName: 'Max Dillon',
        weapon: 'Electricity Manipulation',
        photo: 'imgs/dillon.png',
        skill: 'Power Surge: Overloads electrical systems.'
    },
    {
        firstName: 'Doctor',
        lastName: 'Octopus',
        realName: 'Otto Octavius',
        weapon: 'Mechanical Arms',
        photo: 'imgs/ock.png',
        skill: 'Multitasking Mastery: Controls arms independently.'
    },
    {
        firstName: 'Kraven',
        lastName: 'the Hunter',
        realName: 'Sergei Kravinoff',
        weapon: 'Enhanced Strength and Tracking',
        photo: 'imgs/hunt.png',
        skill: 'Predator Instinct: Tracks prey across any terrain.'
    },
    {
        firstName: 'Shocker',
        lastName: '',
        realName: 'Herman Schultz',
        weapon: 'Vibro-smash Gauntlets',
        photo: 'imgs/shock.png',
        skill: 'Shockwave Burst: Emits area-wide vibrations.'
    },
    {
        firstName: 'Scorpion',
        lastName: '',
        realName: 'Mac Gargan',
        weapon: 'Mechanical Tail and Enhanced Strength',
        photo: 'imgs/sting.png',
        skill: 'Venomous Sting: Paralyzes with tail strike.'
    },
    {
        firstName: 'Vulture',
        lastName: '',
        realName: 'Adrian Toomes',
        weapon: 'Winged Flight and Enhanced Strength',
        photo: 'imgs/prey.png',
        skill: 'Aerial Assault: Dive-bombs with precision.'
    }
];

// Fallback for image loading issues
window.players.forEach(player => {
    player.photo = player.photo || 'https://via.placeholder.com/150?text=No+Image';
});