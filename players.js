const characters = [
    {
        firstName: 'Iron',
        lastName: 'Man',
        realName: 'Tony Stark',
        weapon: 'Iron Man Armor',
        photo: 'https://www.marvel.com/characters/iron-man/iron-man'
    },
    {
        firstName: 'Captain',
        lastName: 'America',
        realName: 'Steve Rogers',
        weapon: 'Vibranium Shield',
        photo: 'https://www.marvel.com/characters/captain-america/captain-america'
    },
    {
        firstName: 'Thor',
        lastName: 'Odinson',
        realName: 'Thor Odinson',
        weapon: 'Mjolnir',
        photo: 'https://www.marvel.com/characters/thor/thor'
    },
    {
        firstName: 'Black',
        lastName: 'Widow',
        realName: 'Natasha Romanoff',
        weapon: 'Electroshock Batons',
        photo: 'https://www.marvel.com/characters/black-widow/black-widow'
    },
    {
        firstName: 'Hawkeye',
        lastName: '',
        realName: 'Clint Barton',
        weapon: 'Bow and Trick Arrows',
        photo: 'https://www.marvel.com/characters/hawkeye/hawkeye'
    },
    {
        firstName: 'Spider',
        lastName: 'Man',
        realName: 'Peter Parker',
        weapon: 'Web-shooters',
        photo: 'https://www.marvel.com/characters/spider-man/spider-man'
    },
    {
        firstName: 'Doctor',
        lastName: 'Strange',
        realName: 'Stephen Strange',
        weapon: 'Mystic Arts / Eye of Agamotto',
        photo: 'https://www.marvel.com/characters/doctor-strange/doctor-strange'
    },
    {
        firstName: 'Black',
        lastName: 'Panther',
        realName: 'T’Challa',
        weapon: 'Vibranium Suit and Claws',
        photo: 'https://www.marvel.com/characters/black-panther/black-panther'
    },
    {
        firstName: 'Scarlet',
        lastName: 'Witch',
        realName: 'Wanda Maximoff',
        weapon: 'Chaos Magic',
        photo: 'https://www.marvel.com/characters/scarlet-witch/scarlet-witch'
    },
    {
        firstName: 'Ant',
        lastName: 'Man',
        realName: 'Scott Lang',
        weapon: 'Pym Particles Suit',
        photo: 'https://www.marvel.com/characters/ant-man/ant-man'
    },
    {
        firstName: 'Wolverine',
        lastName: '',
        realName: 'James Howlett',
        weapon: 'Adamantium Claws and Healing Factor',
        photo: 'https://www.marvel.com/characters/wolverine/wolverine'
    },
    {
        firstName: 'Storm',
        lastName: '',
        realName: 'Ororo Munroe',
        weapon: 'Weather Manipulation',
        photo: 'https://www.marvel.com/characters/storm/storm'
    },
    {
        firstName: 'Cyclops',
        lastName: '',
        realName: 'Scott Summers',
        weapon: 'Optic Blasts',
        photo: 'https://www.marvel.com/characters/cyclops/cyclops'
    },
    {
        firstName: 'Jean',
        lastName: 'Grey',
        realName: 'Jean Grey',
        weapon: 'Telepathy and Telekinesis',
        photo: 'https://www.marvel.com/characters/jean-grey/jean-grey'
    },
    {
        firstName: 'Beast',
        lastName: '',
        realName: 'Henry McCoy',
        weapon: 'Enhanced Strength and Agility',
        photo: 'https://www.marvel.com/characters/beast/beast'
    },
    {
        firstName: 'Gambit',
        lastName: '',
        realName: 'Remy LeBeau',
        weapon: 'Charged Playing Cards',
        photo: 'https://www.marvel.com/characters/gambit/gambit'
    },
    {
        firstName: 'Rogue',
        lastName: '',
        realName: 'Anna Marie',
        weapon: 'Power Absorption',
        photo: 'https://www.marvel.com/characters/rogue/rogue'
    },
    {
        firstName: 'Deadpool',
        lastName: '',
        realName: 'Wade Wilson',
        weapon: 'Regenerative Healing Factor and Katanas',
        photo: 'https://www.marvel.com/characters/deadpool/deadpool'
    },
    {
        firstName: 'Venom',
        lastName: '',
        realName: 'Eddie Brock',
        weapon: 'Symbiote Powers',
        photo: 'https://www.marvel.com/characters/venom/venom'
    },
    {
        firstName: 'Magneto',
        lastName: '',
        realName: 'Max Eisenhardt',
        weapon: 'Magnetic Fields',
        photo: 'https://www.marvel.com/characters/magneto/magneto'
    },
    {
        firstName: 'Doctor',
        lastName: 'Doom',
        realName: 'Victor Von Doom',
        weapon: 'Power Armor and Sorcery',
        photo: 'https://www.marvel.com/characters/doctor-doom/doctor-doom'
    },
    {
        firstName: 'Thanos',
        lastName: '',
        realName: 'Thanos',
        weapon: 'Infinity Gauntlet',
        photo: 'https://www.marvel.com/characters/thanos/thanos'
    },
    {
        firstName: 'Loki',
        lastName: '',
        realName: 'Loki Laufeyson',
        weapon: 'Sorcery and Illusions',
        photo: 'https://www.marvel.com/characters/loki/loki'
    },
    {
        firstName: 'Ultron',
        lastName: '',
        realName: 'Ultron',
        weapon: 'Artificial Intelligence and Energy Blasts',
        photo: 'https://www.marvel.com/characters/ultron/ultron'
    },
    {
        firstName: 'Red',
        lastName: 'Skull',
        realName: 'Johann Schmidt',
        weapon: 'Cosmic Cube',
        photo: 'https://www.marvel.com/characters/red-skull/red-skull'
    },
    {
        firstName: 'Green',
        lastName: 'Goblin',
        realName: 'Norman Osborn',
        weapon: 'Pumpkin Bombs and Goblin Glider',
        photo: 'https://www.marvel.com/characters/green-goblin/green-goblin'
    },
    {
        firstName: 'Kingpin',
        lastName: '',
        realName: 'Wilson Fisk',
        weapon: 'Superhuman Strength and Criminal Empire',
        photo: 'https://www.marvel.com/characters/kingpin/kingpin'
    },
    {
        firstName: 'Black',
        lastName: 'Cat',
        realName: 'Felicia Hardy',
        weapon: 'Enhanced Agility and Luck Manipulation',
        photo: 'https://www.marvel.com/characters/black-cat/black-cat'
    },
    {
        firstName: 'Mysterio',
        lastName: '',
        realName: 'Quentin Beck',
        weapon: 'Illusions and Special Effects',
        photo: 'https://www.marvel.com/characters/mysterio/mysterio'
    },
    {
        firstName: 'Rhino',
        lastName: '',
        realName: 'Aleksei Sytsevich',
        weapon: 'Superhuman Strength and Durability',
        photo: 'https://www.marvel.com/characters/rhino/rhino'
    },
    {
        firstName: 'Vulture',
        lastName: '',
        realName: 'Adrian Toomes',
        weapon: 'Winged Flight and Enhanced Strength',
        photo: 'https://www.marvel.com/characters/vulture/vulture'
    },
    {
        firstName: 'Sand',
        lastName: 'Man',
        realName: 'Flint Marko',
        weapon: 'Sand Manipulation',
        photo: 'https://www.marvel.com/characters/sandman/sandman'
    },
    {
        firstName: 'Electro',
        lastName: '',
        realName: 'Max Dillon',
        weapon: 'Electricity Manipulation',
        photo: 'https://www.marvel.com/characters/electro/electro'
    },
    {
        firstName: 'Doctor',
        lastName: 'Octopus',
        realName: 'Otto Octavius',
        weapon: 'Mechanical Arms',
        photo: 'https://www.marvel.com/characters/doctor-octopus/doctor-octopus'
    },
    {
        firstName: 'Kraven',
        lastName: 'the',
        realName: 'Sergei Kravinoff',
        weapon: 'Enhanced Strength and Tracking',
        photo: 'https://www.marvel.com/characters/kraven-the-hunter/kraven-the-hunter'
    },
    {
        firstName: 'Mysterio',
        lastName: '',
        realName: 'Quentin Beck',
        weapon: 'Illusions and Special Effects',
        photo: 'https://www.marvel.com/characters/mysterio/mysterio'
    },
    {
        firstName: 'Shocker',
        lastName: '',
        realName: 'Herman Schultz',
        weapon: 'Vibro-smash Gauntlets',
        photo: 'https://www.marvel.com/characters/shocker/shocker'
    },
    {
        firstName: 'Scorpion',
        lastName: '',
        realName: 'Mac Gargan',
        weapon: 'Mechanical Tail and Enhanced Strength',
        photo: 'https://www.marvel.com/characters/scorpion/scorpion'
    },
    {
        firstName: 'Vulture',
        lastName: '',
        realName: 'Adrian Toomes',
        weapon: 'Winged Flight and Enhanced Strength',
        photo: 'https://www.marvel.com/characters/vulture/vulture'
    }, {
        firstName: 'Sand',
        lastName: 'Man',
        realName: 'Flint Marko',
        weapon: 'Sand Manipulation',
        photo: 'https://www.marvel.com/characters/sandman-flint-marko'
    }
]     