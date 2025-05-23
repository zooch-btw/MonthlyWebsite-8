// Wait for the DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
    // Log when the roster script runs for debugging
    console.log('Roster script executed at', new Date().toLocaleString());

    // Configuration for retrying player data load
    const maxRetries = 10;
    let retryCount = 0;

    // Color constants used for styling elements
    const colors = {
        heroRed: '#ff2a44',
        cosmicBlue: '#1e90ff',
        vibrantPurple: '#6a0dad',
        infinityGold: '#ffd700',
        nebulaDark: '#0d1b2a',
        starWhite: '#f0f8ff'
    };

    // Theme settings based on time of day for dynamic background
    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    // Load player data with retry mechanism if window.players is not immediately available
    const loadPlayers = () => {
        if (window.players && Array.isArray(window.players)) {
            console.log('Players defined:', window.players);
            initializeApp(window.players);
        } else if (retryCount < maxRetries) {
            retryCount++;
            console.warn(`Retry ${retryCount}/${maxRetries}: window.players not defined`);
            setTimeout(loadPlayers, 300);
        } else {
            console.error('Error: window.players is undefined after retries');
            const grid = document.getElementById('rosterGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3">
                            <h5 id="LossTxt" class="mb-1">Error Loading Heroes</h5>
                            <p class="text-muted">Unable to load hero data. Please refresh the page or check console.</p>
                        </div>
                    </div>
                `;
            } else {
                alert('Error: Roster grid not found. Please check page structure.');
            }
        }
    };

    // Apply theme based on current hour for dynamic styling
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

    // Style the navigation bar with custom colors and effects
    const styleNavbar = () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.9) 100%)`;
            navbar.style.borderImageSource = `linear-gradient(90deg, transparent, ${colors.infinityGold}, transparent)`;
            navbar.style.borderImageSlice = '1';
            navbar.style.borderBottomWidth = '2px';
            navbar.style.borderBottomStyle = 'solid';
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
            navbarLogo.style.maxWidth = '100px';
        }
    };

    // Style form controls (search and sort) with consistent theme
    const styleControls = () => {
        const controls = document.querySelectorAll('.form-control, .form-select');
        controls.forEach(control => {
            control.style.backgroundColor = `rgba(156, 161, 165, 0.9)`;
            control.style.color = colors.starWhite;
            control.style.borderColor = colors.infinityGold;
            control.style.textAlign = 'center';
            control.style.padding = '0.5rem';
        });
    };

    // Sanitize HTML to prevent XSS attacks
    const sanitizeHTML = str => {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Play sound effects for user interactions
    const playSound = (type) => {
        const sound = document.getElementById(`${type}Sound`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => console.warn(`${type} sound failed to play`));
        }
    };

    // Removed toggleHeroSelection function as select buttons are no longer used
    // const toggleHeroSelection = (hero, btn) => { ... }

    // Removed updateSelectButtons function as select buttons are no longer used
    // const updateSelectButtons = () => { ... }

    // Debounce function to limit the frequency of filter application
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Render the hero roster cards
    const render = (list, hr) => {
        const grid = document.getElementById('rosterGrid');
        if (!grid) {
            console.error('Roster grid not found');
            alert('Error: Roster grid not found. Please check page structure.');
            return;
        }

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

        list.forEach((p, index) => {
            if (!p.firstName || !p.realName || !p.weapon) {
                console.warn('Invalid player data:', p);
                return;
            }

            if (!p.id) p.id = `hero-${index}`;
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';
            const photo = p.photo && typeof p.photo === 'string' && p.photo.trim() !== '' ? p.photo : 'https://via.placeholder.com/150?text=No+Image';
            const titleId = hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt';
            const modalId = `playerModal${index}`;

            // Card HTML without select button
            col.innerHTML = `
                <div class="card h-100 shadow-sm hero-card">
                    <div class="card-img-container">
                        <img src="${sanitizeHTML(photo)}" class="card-img-top hero-img" alt="${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}">
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title" id="${titleId}">${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}</h5>
                        <div class="badge badge-role">Real Name: ${sanitizeHTML(p.realName)}</div>
                        <p class="card-text">Weapon: ${sanitizeHTML(p.weapon)}</p>
                        <button type="button" class="btn btn-sm btn-outline-light mt-2 more-info-btn" data-bs-toggle="modal" data-bs-target="#${modalId}">More Info</button>
                    </div>
                </div>
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-describedby="${modalId}Desc" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="${modalId}Label">${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body text-center">
                                <h5 id="${titleId}" style="font-weight: bold; margin-bottom: 15px; color: ${colors.infinityGold};">
                                    ${p.skill && typeof p.skill === 'string' ? sanitizeHTML(p.skill) : 'No skill available'}
                                </h5>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const img = col.querySelector('.hero-img');
            img.onerror = () => {
                console.warn(`Failed to load image for ${p.firstName}`);
                img.src = 'https://via.placeholder.com/150?text=Image+Error';
                img.style.filter = 'grayscale(50%)';
            };
            img.onload = () => {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                if (aspectRatio > 2 || aspectRatio < 0.5) {
                    img.style.objectFit = 'contain';
                }
            };

            grid.appendChild(col);

            const closeButton = col.querySelector(`#${modalId} .btn-close`);
            const footerButton = col.querySelector(`#${modalId} .btn-outline-light`);
            [closeButton, footerButton].forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = colors.infinityGold;
                    button.style.color = colors.nebulaDark;
                });
                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = 'transparent';
                    button.style.color = colors.starWhite;
                });
            });

            const moreInfoBtn = col.querySelector('.more-info-btn');
            moreInfoBtn.addEventListener('click', () => playSound('moreInfo'));
        });

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

    // Apply search and sort filters to the hero list
    const applyFilters = (players, searchInput, sortSelect, hr) => {
        console.log('Applying filters');
        if (!players || !Array.isArray(players)) {
            console.error('Players array not found');
            render(null, hr);
            return;
        }

        const term = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
        let filteredList = players.filter(p =>
            `${p.firstName} ${p.lastName || ''}`.toLowerCase().includes(term)
        );

        const sortValue = sortSelect && sortSelect.value ? sortSelect.value : '';
        if (sortValue && sortValue.includes('-')) {
            const [key, dir] = sortValue.split('-');
            filteredList.sort((a, b) => {
                const valueA = (a[key] && typeof a[key] === 'string' ? a[key] : '').toLowerCase();
                const valueB = (b[key] && typeof b[key] === 'string' ? b[key] : '').toLowerCase();
                return dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            });
        } else {
            console.warn('Invalid sort value:', sortValue);
        }

        render(filteredList, hr);
    };

    let hr = new Date().getHours();

    // Initialize the application with required elements
    const initializeApp = (players) => {
        // Get required DOM elements
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const grid = document.getElementById('rosterGrid');

        // Check if required elements exist
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
            } else {
                alert('Error: Required elements not found. Please check page structure.');
            }
            return;
        }

        hr = applyTheme();
        styleNavbar();
        styleControls();

        // Set up debounced filter application
        const debouncedFilters = debounce(() => applyFilters(players, searchInput, sortSelect, hr), 300);
        searchInput.addEventListener('input', debouncedFilters);
        sortSelect.addEventListener('change', debouncedFilters);

        // Apply initial filters and render the roster
        applyFilters(players, searchInput, sortSelect, hr);
    };

    // Start loading players
    loadPlayers();
});