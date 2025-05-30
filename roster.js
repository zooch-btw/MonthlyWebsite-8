/* JS: Roster logic for Marvel Cosmic Arena roster page.
 * Displays hero cards with search and sort functionality.
 * Integrates with players.js, aligns with heroSelection.html and menu.js.
 * Supports 40 heroes including Hulk, Bullseye, and Winter Soldier.
 */

/* JS: Wait for DOM to be fully loaded */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[roster.js] Roster script executed at', new Date().toISOString());

    /* JS: Configuration constants */
    const CONFIG = {
        MAX_RETRIES: 10, // Maximum retries for loading player data
        DEBOUNCE_DELAY: 300, // Debounce delay for search/sort in milliseconds
        FALLBACK_IMAGE: 'imgs/fallback.png', // Local fallback image path
        TOAST_DURATION: 3000 // Toast notification duration in milliseconds
    };

    /* JS: Color constants for consistent styling */
    const colors = {
        heroRed: '#ff2a44',
        cosmicBlue: '#1e90ff',
        vibrantPurple: '#6a0dad',
        infinityGold: '#ffd700',
        nebulaDark: '#0d1b2a',
        starWhite: '#f0f8ff'
    };

    /* JS: Theme settings based on time of day */
    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    /* JS: Load player data with retry mechanism */
    let retryCount = 0;
    const loadPlayers = () => {
        try {
            if (window.players && Array.isArray(window.players) && window.players.length > 0) {
                console.log('[roster.js] Players loaded:', window.players.length, 'heroes');
                initializeApp(window.players);
            } else if (retryCount < CONFIG.MAX_RETRIES) {
                retryCount++;
                console.warn(`[roster.js] Retry ${retryCount}/${CONFIG.MAX_RETRIES}: window.players not defined`);
                setTimeout(loadPlayers, 300);
            } else {
                console.error('[roster.js] Error: window.players undefined after retries');
                showError('Unable to load hero data. Please refresh the page.');
                renderErrorUI();
            }
        } catch (e) {
            console.error('[roster.js] Error loading players:', e);
            showError('Failed to load heroes. Please try again.');
            renderErrorUI();
        }
    };

    /* JS: Apply theme based on current hour */
    const applyTheme = () => {
        try {
            const hr = new Date().getHours();
            const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end) || {
                cls: 'night',
                bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
            };
            document.body.classList.remove('morning', 'afternoon', 'evening', 'night');
            document.body.classList.add(setting.cls);
            document.body.style.background = setting.bgGradient;
            console.log('[roster.js] Applied theme:', setting.cls);
            return hr;
        } catch (e) {
            console.error('[roster.js] Error applying theme:', e);
            return new Date().getHours();
        }
    };

    /* JS: Style navigation bar */
    const styleNavbar = () => {
        try {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.borderImageSource = `linear-gradient(90deg, transparent, ${colors.infinityGold}, transparent)`;
                navbar.style.borderImageSlice = '1';
                navbar.style.borderBottomWidth = '2px';
                navbar.style.borderBottomStyle = 'solid';
            }

            const navLinks = document.querySelectorAll('.navbar-brand, .navbar-nav .nav-link');
            navLinks.forEach(link => {
                // Remove existing listeners to prevent duplicates
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                newLink.style.color = colors.starWhite;
                newLink.addEventListener('mouseenter', () => {
                    newLink.style.color = colors.infinityGold;
                    newLink.style.textShadow = `0 0 15px ${colors.infinityGold}`;
                });
                newLink.addEventListener('mouseleave', () => {
                    newLink.style.color = newLink.classList.contains('active') ? colors.heroRed : colors.starWhite;
                    newLink.style.textShadow = newLink.classList.contains('active') ? `0 0 10px ${colors.heroRed}` : 'none';
                });
            });

            const activeLink = document.querySelector('.nav-link.active');
            if (activeLink) {
                activeLink.style.color = colors.heroRed;
                activeLink.style.textShadow = `0 0 10px ${colors.heroRed}`;
            }

            const navbarLogo = document.querySelector('.navbar-logo');
            if (navbarLogo) {
                navbarLogo.style.display = 'block';
                navbarLogo.style.margin = 'auto';
            }
        } catch (e) {
            console.error('[roster.js] Error styling navbar:', e);
        }
    };

    /* JS: Style form controls */
    const styleControls = () => {
        try {
            const controls = document.querySelectorAll('.form-control, .form-select');
            controls.forEach(control => {
                control.style.backgroundColor = `rgba(156, 161, 165, 0.9)`;
                control.style.color = colors.starWhite;
                control.style.borderColor = colors.infinityGold;
                control.style.textAlign = 'center';
                control.style.padding = '0.5rem';
                control.setAttribute('aria-required', 'false');
            });
        } catch (e) {
            console.error('[roster.js] Error styling controls:', e);
        }
    };

    /* JS: Sanitize HTML to prevent XSS */
    const sanitizeHTML = (str) => {
        try {
            if (typeof str !== 'string') return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        } catch (e) {
            console.error('[roster.js] Error sanitizing HTML:', e);
            return '';
        }
    };

    /* JS: Play sound effects */
    const playSound = (type) => {
        try {
            const sound = document.getElementById(`${type}Sound`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => console.warn(`[roster.js] ${type} sound failed to play`));
            }
        } catch (e) {
            console.error('[roster.js] Error playing sound:', type, e);
        }
    };

    /* JS: Show error toast notification */
    const showError = (message) => {
        try {
            const toast = document.createElement('div');
            toast.className = 'error-toast';
            toast.textContent = message;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.background = colors.heroRed;
            toast.style.color = colors.starWhite;
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '5px';
            toast.style.zIndex = '1000';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
        } catch (e) {
            console.error('[roster.js] Error displaying toast:', e);
        }
    };

    /* JS: Render error UI when players fail to load */
    const renderErrorUI = () => {
        try {
            const grid = document.getElementById('rosterGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3 text-white">
                            <h5 class="mb-1">Error Loading Heroes</h5>
                            <p class="text-muted">Unable to load hero data. Please refresh the page or check console.</p>
                        </div>
                    </div>
                `;
            }
        } catch (e) {
            console.error('[roster.js] Error rendering error UI:', e);
        }
    };

    /* JS: Validate hero object */
    const isValidHero = (hero) => {
        try {
            const isValid = hero &&
                typeof hero === 'object' &&
                typeof hero.id === 'string' &&
                typeof hero.firstName === 'string' &&
                typeof hero.realName === 'string' &&
                typeof hero.photo === 'string' &&
                typeof hero.weapon === 'string' &&
                (typeof hero.skill === 'string' || hero.skill === undefined) &&
                (typeof hero.special === 'string' || hero.special === undefined);
            if (!isValid) console.warn('[roster.js] Hero validation failed:', hero);
            return isValid;
        } catch (e) {
            console.error('[roster.js] Error validating hero:', e);
            return false;
        }
    };

    /* JS: Debounce function for search/sort */
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    /* JS: Create focus trap for modals */
    const createFocusTrap = (modal) => {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    };

    /* JS: Render hero roster cards */
    const render = (list, hr) => {
        try {
            const grid = document.getElementById('rosterGrid');
            if (!grid) {
                console.error('[roster.js] Roster grid not found');
                showError('Roster grid not found. Please check page structure.');
                return;
            }

            grid.innerHTML = '';
            if (!list || !Array.isArray(list) || list.length === 0) {
                console.warn('[roster.js] No valid players to render');
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3 text-white">
                            <h5 class="mb-1">No Heroes Available</h5>
                            <p class="text-muted">No heroes match the search criteria.</p>
                        </div>
                    </div>
                `;
                return;
            }

            list.forEach((p, index) => {
                if (!isValidHero(p)) {
                    console.warn('[roster.js] Invalid player data:', p);
                    return;
                }

                p.id = p.id || `hero-${index}`;
                const col = document.createElement('div');
                col.className = 'col-6 col-md-4 col-lg-3';
                const photo = p.photo && p.photo.trim() !== '' ? p.photo : CONFIG.FALLBACK_IMAGE;
                const titleId = `hero-title-${index}`;
                const modalId = `playerModal${index}`;
                const displayName = `${p.firstName} ${p.lastName || ''}`.trim();

                col.innerHTML = `
                    <div class="card h-100 shadow-sm hero-card" role="region" aria-labelledby="${titleId}" tabindex="0">
                        <div class="card-img-container">
                            <img src="${sanitizeHTML(photo)}" class="card-img-top hero-img" alt="${sanitizeHTML(displayName)} portrait" loading="lazy">
                        </div>
                        <div class="card-body text-center">
                            <h5 class="card-title" id="${titleId}">${sanitizeHTML(displayName)}</h5>
                            <div class="badge badge-role">Real Name: ${sanitizeHTML(p.realName)}</div>
                            <p class="card-text">Weapon: ${sanitizeHTML(p.weapon)}</p>
                            <button type="button" class="btn btn-sm btn-outline-light mt-2 more-info-btn" data-bs-toggle="modal" data-bs-target="#${modalId}" aria-label="More info about ${sanitizeHTML(displayName)}">More Info</button>
                        </div>
                    </div>
                    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${modalId}Label">${sanitizeHTML(displayName)}</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body text-center">
                                    <h6 style="font-weight: bold; margin-bottom: 15px; color: ${colors.infinityGold};">
                                        Skill: ${p.skill ? sanitizeHTML(p.skill) : 'No skill available'}
                                    </h6>
                                    <p>
                                        Special: ${p.special ? sanitizeHTML(p.special) : 'No special available'}
                                    </p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                const img = col.querySelector('.hero-img');
                const handleImageError = () => {
                    console.warn(`[roster.js] Image load failed for ${p.realName}`);
                    img.src = CONFIG.FALLBACK_IMAGE;
                    img.alt = 'Fallback hero portrait';
                    img.style.filter = 'grayscale(50%)';
                    img.onerror = null;
                };
                const handleImageLoad = () => {
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    if (aspectRatio > 2 || aspectRatio < 0.5) {
                        img.style.objectFit = 'contain';
                    }
                    img.onload = null;
                };
                img.onerror = handleImageError;
                img.onload = handleImageLoad;

                const card = col.querySelector('.hero-card');
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        col.querySelector('.more-info-btn').click();
                    }
                });

                const moreInfoBtn = col.querySelector('.more-info-btn');
                let triggerElement = null;
                moreInfoBtn.addEventListener('click', () => {
                    playSound('moreInfo');
                    triggerElement = moreInfoBtn;
                });

                const modal = col.querySelector(`#${modalId}`);
                createFocusTrap(modal);
                modal.addEventListener('shown.bs.modal', () => {
                    modal.querySelector('.btn-close').focus();
                });
                modal.addEventListener('hidden.bs.modal', () => {
                    if (triggerElement) {
                        triggerElement.focus();
                        triggerElement = null;
                    }
                });

                grid.appendChild(col);
            });

            console.log('[roster.js] Rendered %d heroes', list.length);
        } catch (e) {
            console.error('[roster.js] Error rendering roster:', e);
            showError('Failed to render heroes');
        }
    };

    /* JS: Apply search and sort filters */
    const applyFilters = (players, searchInput, sortSelect, hr) => {
        try {
            console.log('[roster.js] Applying filters');
            if (!players || !Array.isArray(players)) {
                console.error('[roster.js] Players array not found');
                render(null, hr);
                return;
            }

            const term = searchInput?.value?.trim().toLowerCase() || '';
            let filteredList = players.filter(p =>
                `${p.firstName} ${p.lastName || ''} ${p.realName} ${p.weapon} ${p.skill || ''}`.toLowerCase().includes(term)
            );

            const sortValue = sortSelect?.value || 'firstName-asc';
            if (sortValue.includes('-')) {
                const [key, dir] = sortValue.split('-');
                filteredList.sort((a, b) => {
                    const valueA = (a[key] && typeof a[key] === 'string' ? a[key] : '').toLowerCase();
                    const valueB = (b[key] && typeof b[key] === 'string' ? b[key] : '').toLowerCase();
                    return dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
                });
            }

            render(filteredList, hr);
        } catch (e) {
            console.error('[roster.js] Error applying filters:', e);
            showError('Failed to apply filters');
        }
    };

    /* JS: Initialize application */
    const initializeApp = (players) => {
        try {
            const searchInput = document.getElementById('searchInput');
            const sortSelect = document.getElementById('sortSelect');
            const searchButton = document.getElementById('searchButton');
            const grid = document.getElementById('rosterGrid');

            if (!grid || !searchInput || !sortSelect || !searchButton) {
                console.error('[roster.js] Missing DOM elements:', { grid, searchInput, sortSelect, searchButton });
                showError('Required elements not found. Please check page structure.');
                renderErrorUI();
                return;
            }

            const hr = applyTheme();
            styleNavbar();
            styleControls();

            // Remove existing listeners to prevent duplicates
            const newSearchInput = searchInput.cloneNode(true);
            const newSortSelect = sortSelect.cloneNode(true);
            const newSearchButton = searchButton.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            sortSelect.parentNode.replaceChild(newSortSelect, sortSelect);
            searchButton.parentNode.replaceChild(newSearchButton, searchButton);

            const debouncedFilters = debounce(() => applyFilters(players, newSearchInput, newSortSelect, hr), CONFIG.DEBOUNCE_DELAY);
            newSearchInput.addEventListener('input', debouncedFilters);
            newSortSelect.addEventListener('change', debouncedFilters);
            newSearchButton.addEventListener('click', debouncedFilters);

            applyFilters(players, newSearchInput, newSortSelect, hr);
            console.log('[roster.js] Application initialized');
        } catch (e) {
            console.error('[roster.js] Error initializing app:', e);
            showError('Failed to initialize roster');
        }
    };

    /* JS: Start loading players */
    loadPlayers();
});