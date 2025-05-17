document.addEventListener('DOMContentLoaded', () => {
    // --- Marvel Theming Script ---

    const colors = {
        heroRed: '#ff2a44',        // Iron Man’s armor red
        cosmicBlue: '#1e90ff',     // Captain Marvel’s cosmic energy
        vibrantPurple: '#6a0dad',  // Thanos’ mystic purple
        infinityGold: '#ffd700',   // Infinity Stone glow
        nebulaDark: '#0d1b2a',     // Deep space background
        starWhite: '#f0f8ff'       // Starlight white
    };

    const themeSettings = [
        {
            start: 5,
            end: 11,
            cls: 'morning',
            bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)`
        },
        {
            start: 11,
            end: 17,
            cls: 'afternoon',
            bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)`
        },
        {
            start: 17,
            end: 22,
            cls: 'evening',
            bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)`
        },
        {
            start: 22,
            end: 24,
            cls: 'night',
            bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
        },
        {
            start: 0,
            end: 5,
            cls: 'night',
            bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
        }
    ];

    const hr = new Date().getHours();
    const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end);

    if (setting) {
        document.body.classList.add(setting.cls);
        document.body.style.background = setting.bgGradient;
    }

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.9) 100%)`;
        navbar.style.borderImageSource = `linear-gradient(90deg, transparent, ${colors.infinityGold}, transparent)`;
    }

    const navLinks = document.querySelectorAll('.navbar-brand, .navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.style.color = colors.starWhite;
        link.style.textAlign = 'center';
    });

    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        activeLink.style.color = colors.heroRed;
        activeLink.style.textShadow = `0 0 10px ${colors.heroRed}`;
    }

    document.querySelectorAll('.navbar-brand:hover, .navbar-nav .nav-link:hover, .navbar-nav .nav-link:focus').forEach(link => {
        link.style.color = colors.infinityGold;
        link.style.textShadow = `0 0 15px ${colors.infinityGold}`;
    });

    const navbarLogo = document.querySelector('.navbar-logo');
    if (navbarLogo) {
        navbarLogo.style.filter = `drop-shadow(0 0 8px ${colors.cosmicBlue}) brightness(1.2)`;
        navbarLogo.style.display = 'block';
        navbarLogo.style.margin = 'auto';
    }

    const controls = document.querySelectorAll('.form-control, .form-select');
    controls.forEach(control => {
        control.style.backgroundColor = `rgba(13, 27, 42, 0.9)`;
        control.style.color = colors.starWhite;
        control.style.borderColor = colors.infinityGold;
        control.style.textAlign = 'center';
    });

    const cards = document.querySelectorAll('.hero-card');
    cards.forEach(card => {
        card.style.background = `rgba(13, 27, 42, 0.9)`;
        card.style.border = `2px solid ${colors.infinityGold}`;
        card.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
    });

    const cardTitles = document.querySelectorAll('.hero-card .card-title');
    cardTitles.forEach(title => {
        title.id = (hr >= 11 && hr < 17) ? 'VictoryTxt' : 'LossTxt';
        title.style.color = colors.starWhite;
        title.style.textShadow = `0 0 8px ${colors.heroRed}`;
    });

    const badges = document.querySelectorAll('.badge-role');
    badges.forEach(badge => {
        badge.style.color = colors.starWhite;
    });

    // --- Roster Filtering & Rendering Script ---

    const grid = document.getElementById('rosterGrid');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (!grid || !searchInput || !sortSelect) {
        console.error('Missing one or more DOM elements.');
        return;
    }

    const render = list => {
        grid.innerHTML = '';

        list.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col-6 col-lg-2';

            col.innerHTML = `
                <div class="card h-100 shadow-sm hero-card">
                    <img src="${p.photo}" class="card-img-top" alt="${p.firstName} ${p.lastName}">
                    <div class="card-body text-center">
                        <h5 class="card-title mb-1">${p.firstName} ${p.lastName}</h5>
                        <div class="badge badge-position badge-role">Real Name: ${p.realName}</div>
                        <p class="small text-muted mb-0">Signature Weapon: ${p.weapon}</p>
                        <p class="small text-muted mb-0">Role: ${p.role}</p>
                        <p class="small text-muted mb-0">Age: ${p.age}</p>
                    </div>
                </div>
            `;

            grid.appendChild(col);
        });
    };

    const applyFilters = () => {
        if (!window.players || !Array.isArray(players)) {
            console.error('Global `players` array not found.');
            return;
        }

        const term = searchInput.value.trim().toLowerCase();

        let filteredList = players.filter(p =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(term)
        );

        const [key, dir] = sortSelect.value.split('-');

        filteredList.sort((a, b) => {
            if (key === 'age') {
                return dir === 'asc' ? a.age - b.age : b.age - a.age;
            }

            const valueA = (
                key === 'firstName' ? a.firstName :
                    key === 'lastName' ? a.lastName :
                        a.role
            ).toLowerCase();

            const valueB = (
                key === 'firstName' ? b.firstName :
                    key === 'lastName' ? b.lastName :
                        b.role
            ).toLowerCase();

            return dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        render(filteredList);
    };

    // Attach listeners
    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Initial render
    if (window.players && Array.isArray(players)) {
        render(players);
    } else {
        console.error('Global `players` array not found on initial render.');
    }
});