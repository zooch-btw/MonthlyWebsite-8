document.addEventListener('DOMContentLoaded', () => {
    console.log('Script executed at', new Date().toLocaleString());

    // Retry mechanism for loading players
    const maxRetries = 5;
    let retryCount = 0;
    const loadPlayers = () => {
        if (window.players) {
            console.log('Players defined:', window.players);
            initializeApp(window.players);
        } else if (retryCount < maxRetries) {
            retryCount++;
            console.warn(`Retry ${retryCount}/${maxRetries}: window.players not defined`);
            setTimeout(loadPlayers, 100 * retryCount);
        } else {
            console.error('Error: window.players is undefined after retries');
            const grid = document.getElementById('rosterGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3">
                            <h5 id="LossTxt" class="mb-1">Error Loading Heroes</h5>
                            <p class="text-muted">Unable to load hero data. Please refresh the page.</p>
                        </div>
                    </div>
                `;
            }
        }
    };

    // Define Marvel-themed colors
    const colors = {
        heroRed: '#ff2a44',
        cosmicBlue: '#1e90ff',
        vibrantPurple: '#6a0dad',
        infinityGold: '#ffd700',
        nebulaDark: '#0d1b2a',
        starWhite: '#f0f8ff'
    };

    // Define time-based background themes
    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    // Apply theme based on current hour
    const applyTheme = () => {
        const hr = new Date().getHours();
        const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end) || {
            cls: 'night',
            bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
        };
        document.body.classList.add(setting.cls);
        document.body.style.background = setting.bgGradient;
        console.log('Applied theme:', setting.cls);
        return hr;
    };

    // Style navbar and links
    const styleNavbar = () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.9) 100%)`;
            navbar.style.borderImageSource = `linear-gradient(90deg, transparent, ${colors.infinityGold}, transparent)`;
            navbar.style.borderImageSlice = '1';
        } else {
            console.warn('Navbar not found');
        }

        const navLinks = document.querySelectorAll('.navbar-brand, .navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.style.color = colors.starWhite;
            link.style.textAlign = 'center';
            link.addEventListener('mouseenter', () => {
                link.style.color = colors.infinityGold;
                link.style.textShadow = `0 0 15px ${colors.infinityGold}`;
            });
            link.addEventListener('mouseleave', () => {
                link.style.color = link.classList.contains('active') ? colors.heroRed : colors.starWhite;
                link.style.textShadow = link.classList.contains('active') ? `0 0 10px ${colors.heroRed}` : 'none';
            });
        });

        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            activeLink.style.color = colors.heroRed;
            activeLink.style.textShadow = `0 0 10px ${colors.heroRed}`;
        }

        const navbarLogo = document.querySelector('.navbar-logo');
        if (navbarLogo) {
            navbarLogo.style.filter = `drop-shadow(0 0 8px ${colors.cosmicBlue}) brightness(1.2)`;
            navbarLogo.style.display = 'block';
            navbarLogo.style.margin = 'auto';
        }
    };

    // Style controls
    const styleControls = () => {
        const controls = document.querySelectorAll('.form-control, .form-select');
        controls.forEach(control => {
            control.style.backgroundColor = `rgba(156, 161, 165, 0.9)`;
            control.style.color = colors.starWhite;
            control.style.borderColor = colors.infinityGold;
            control.style.textAlign = 'center';
        });
    };

    // Improved HTML sanitization
    const sanitizeHTML = str => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    // Debounce utility
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Render player cards
    const render = (list, hr) => {
        const grid = document.getElementById('rosterGrid');
        if (!grid) return;

        console.log('Rendering players:', list);
        grid.innerHTML = '';
        if (!list || !Array.isArray(list) || list.length === 0) {
            console.warn('No valid players to render');
            grid.innerHTML = `
                <div class="col-12">
                    <div class="placeholder-card p-3">
                        <h5 id="${hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt'}" class="mb-1">No Heroes Available</h5>
                        <p class="text-muted">Please provide hero data to display the roster.</p>
                    </div>
                </div>
            `;
            return;
        }

        list.forEach(p => {
            if (!p.firstName || !p.realName || !p.weapon) {
                console.warn('Invalid player data:', p);
                return;
            }

            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3'; // Adjusted for more space
            const photo = p.photo || 'https://via.placeholder.com/150?text=No+Image';
            const titleId = hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt';

            col.innerHTML = `
                <div class="card h-100 shadow-sm hero-card">
                    <img src="${sanitizeHTML(photo)}" class="card-img" alt="${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}">
                    <div class="card-body text-center">
                        <h5 class="card-title" id="${titleId}">${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}</h5>
                        <div class="badge badge-role">Real Name: ${sanitizeHTML(p.realName)}</div>
                        <p class="card-text">Weapon: ${sanitizeHTML(p.weapon)}</p>
                        ${p.role ? `<p class="card-text">Role: ${sanitizeHTML(p.role)}</p>` : ''}
                        ${p.age ? `<p class="card-text">Age: ${sanitizeHTML(p.age.toString())}</p>` : ''}
                    </div>
                </div>
            `;

            // Handle image load errors
            const img = col.querySelector('img');
            img.onerror = () => {
                console.warn(`Failed to load image for ${p.firstName}`);
                img.src = 'https://via.placeholder.com/150?text=Image+Error';
                img.style.filter = 'grayscale(50%)'; // Style placeholder
            };

            grid.appendChild(col);
        });

        // Style cards after rendering
        const cards = document.querySelectorAll('.hero-card');
        cards.forEach(card => {
            card.style.background = `rgba(211, 24, 24, 0.9)`;
            card.style.border = `2px solid ${colors.infinityGold}`;
            card.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
        });

        const badges = document.querySelectorAll('.badge-role');
        badges.forEach(badge => {
            badge.style.color = colors.starWhite;
            badge.style.backgroundColor = `rgba(48, 148, 255, 0.8)`;
        });
    };

    // Apply search and sort filters
    const applyFilters = (players, searchInput, sortSelect) => {
        console.log('Applying filters');
        if (!players || !Array.isArray(players)) {
            console.error('Players array not found.');
            render(null);
            return;
        }

        const term = searchInput.value.trim().toLowerCase();
        let filteredList = players.filter(p =>
            `${p.firstName} ${p.lastName || ''}`.toLowerCase().includes(term)
        );

        const [key, dir] = sortSelect.value.split('-');
        filteredList.sort((a, b) => {
            if (key === 'age') {
                const ageA = a.age || 0;
                const ageB = b.age || 0;
                return dir === 'asc' ? ageA - ageB : ageB - ageA;
            }
            const valueA = (a[key] || '').toLowerCase();
            const valueB = (b[key] || '').toLowerCase();
            return dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        render(filteredList, hr);
    };

    // Initialize the app
    let hr;
    const initializeApp = (players) => {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const grid = document.getElementById('rosterGrid');

        if (!grid || !searchInput || !sortSelect) {
            console.error('Missing DOM elements:', { grid, searchInput, sortSelect });
            if (grid) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3">
                            <h5 id="LossTxt" class="mb-1">Initialization Error</h5>
                            <p class="text-muted">Required elements not found. Please check the page structure.</p>
                        </div>
                    </div>
                `;
            }
            return;
        }

        hr = applyTheme();
        styleNavbar();
        styleControls();

        const debouncedFilters = debounce(() => applyFilters(players, searchInput, sortSelect), 300);
        searchInput.addEventListener('input', debouncedFilters);
        sortSelect.addEventListener('change', debouncedFilters);

        applyFilters(players, searchInput, sortSelect);
    };

    // Start loading players
    loadPlayers();
});