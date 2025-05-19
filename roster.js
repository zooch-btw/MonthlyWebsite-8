// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Log the current time for debugging (e.g., 5:00 PM EDT)
    console.log('Script executed at', new Date().toLocaleString());

    // Maximum number of retries to check for window.players availability
    const maxRetries = 10;
    // Counter to track retry attempts
    let retryCount = 0;

    // Function to load player data with a retry mechanism
    const loadPlayers = () => {
        // Check if window.players exists and is an array
        if (window.players && Array.isArray(window.players)) {
            // Log success and proceed to initialize the app
            console.log('Players defined:', window.players);
            initializeApp(window.players);
        } else if (retryCount < maxRetries) {
            // Increment retry counter
            retryCount++;
            // Warn about retry attempt
            console.warn(`Retry ${retryCount}/${maxRetries}: window.players not defined`);
            // Schedule retry after 300ms delay to handle slow network or async loading
            setTimeout(loadPlayers, 300);
        } else {
            // Log error if retries are exhausted
            console.error('Error: window.players is undefined after retries');
            // Get the roster grid element
            const grid = document.getElementById('rosterGrid');
            if (grid) {
                // Display error message in the grid with a placeholder card
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3">
                            <h5 id="LossTxt" class="mb-1">Error Loading Heroes</h5>
                            <p class="text-muted">Unable to load hero data. Please refresh the page or check console.</p>
                        </div>
                    </div>
                `;
            } else {
                // Fallback alert if grid element is missing
                alert('Error: Roster grid not found. Please check page structure.');
            }
        }
    };

    // Object defining Marvel-themed colors for consistent styling
    const colors = {
        heroRed: '#ff2a44', // Red for active links and highlights
        cosmicBlue: '#1e90ff', // Blue for shadows and logos
        vibrantPurple: '#6a0dad', // Purple for evening theme
        infinityGold: '#ffd700', // Gold for borders and hover effects
        nebulaDark: '#0d1b2a', // Dark blue for backgrounds
        starWhite: '#f0f8ff' // White for text and highlights
    };

    // Array of theme settings for time-based background gradients
    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    // Function to apply a time-based theme to the page
    const applyTheme = () => {
        // Get the current hour (0-23)
        const hr = new Date().getHours();
        // Find the theme setting matching the current hour, default to night
        const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end) || {
            cls: 'night',
            bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
        };
        // Remove existing theme classes to prevent conflicts
        document.body.classList.remove('morning', 'afternoon', 'evening', 'night');
        // Add the selected theme class to the body
        document.body.classList.add(setting.cls);
        // Apply the corresponding background gradient
        document.body.style.background = setting.bgGradient;
        // Log the applied theme for debugging
        console.log('Applied theme:', setting.cls);
        // Return the current hour for use in rendering
        return hr;
    };

    // Function to style the navbar and its links
    const styleNavbar = () => {
        // Get the navbar element
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Apply a gradient background to the navbar
            navbar.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.9) 100%)`;
            // Add a gold border effect
            navbar.style.borderImageSource = `linear-gradient(90deg, transparent, ${colors.infinityGold}, transparent)`;
            navbar.style.borderImageSlice = '1';
            navbar.style.borderBottomWidth = '2px';
            navbar.style.borderBottomStyle = 'solid';
        } else {
            // Warn if navbar element is missing
            console.warn('Navbar not found');
        }

        // Get all navbar links and brand elements
        const navLinks = document.querySelectorAll('.navbar-brand, .navbar-nav .nav-link');
        navLinks.forEach(link => {
            // Set default link color to white
            link.style.color = colors.starWhite;
            // Center link text
            link.style.textAlign = 'center';
            // Add hover effect with gold color and shadow
            link.addEventListener('mouseenter', () => {
                link.style.color = colors.infinityGold;
                link.style.textShadow = `0 0 15px ${colors.infinityGold}`;
            });
            // Reset style on mouse leave, apply active styling if applicable
            link.addEventListener('mouseleave', () => {
                link.style.color = link.classList.contains('active') ? colors.heroRed : colors.starWhite;
                link.style.textShadow = link.classList.contains('active') ? `0 0 10px ${colors.heroRed}` : 'none';
            });
        });

        // Style the active link with red color and shadow
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            activeLink.style.color = colors.heroRed;
            activeLink.style.textShadow = `0 0 10px ${colors.heroRed}`;
        }

        // Style the navbar logo
        const navbarLogo = document.querySelector('.navbar-logo');
        if (navbarLogo) {
            // Add shadow and brightness effects
            navbarLogo.style.filter = `drop-shadow(0 0 8px ${colors.cosmicBlue}) brightness(1.2)`;
            // Ensure logo is displayed as a block
            navbarLogo.style.display = 'block';
            // Center the logo
            navbarLogo.style.margin = 'auto';
            // Limit logo width
            navbarLogo.style.maxWidth = '100px';
        }
    };

    // Function to style search input and sort select elements
    const styleControls = () => {
        // Get all form control elements
        const controls = document.querySelectorAll('.form-control, .form-select');
        controls.forEach(control => {
            // Apply semi-transparent gray background
            control.style.backgroundColor = `rgba(156, 161, 165, 0.9)`;
            // Set text color to white
            control.style.color = colors.starWhite;
            // Add gold border
            control.style.borderColor = colors.infinityGold;
            // Center text
            control.style.textAlign = 'center';
            // Add padding for better appearance
            control.style.padding = '0.5rem';
        });
    };

    // Function to sanitize HTML input to prevent XSS attacks
    const sanitizeHTML = str => {
        // Return empty string for non-string inputs
        if (typeof str !== 'string') return '';
        // Create a div to escape HTML content
        const div = document.createElement('div');
        div.textContent = str;
        // Return the escaped HTML
        return div.innerHTML;
    };

    // Function to debounce frequent function calls for performance
    const debounce = (func, wait) => {
        // Store timeout ID
        let timeout;
        return (...args) => {
            // Clear any existing timeout
            clearTimeout(timeout);
            // Set a new timeout to call the function after the wait period
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Function to render player cards in the roster grid
    const render = (list, hr) => {
        // Get the roster grid element
        const grid = document.getElementById('rosterGrid');
        if (!grid) {
            // Log error and alert if grid is missing
            console.error('Roster grid not found');
            alert('Error: Roster grid not found. Please check page structure.');
            return;
        }

        // Clear existing grid content
        grid.innerHTML = '';
        // Check if the player list is valid
        if (!list || !Array.isArray(list) || list.length === 0) {
            // Warn if no valid players are provided
            console.warn('No valid players to render');
            // Display placeholder message
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

        // Iterate over players to create cards
        list.forEach((p, index) => {
            // Validate required player properties
            if (!p.firstName || !p.realName || !p.weapon) {
                // Warn if player data is invalid
                console.warn('Invalid player data:', p);
                return;
            }

            // Create a column for the responsive grid
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';
            // Use a placeholder image if photo is invalid
            const photo = p.photo && typeof p.photo === 'string' && p.photo.trim() !== '' ? p.photo : 'https://via.placeholder.com/150?text=No+Image';
            // Set title ID based on time for theming (VictoryTxt during 11 AM - 5 PM)
            const titleId = hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt';
            // Unique modal ID for each player
            const modalId = `playerModal${index}`;

            // Render card and modal HTML
            col.innerHTML = `
                <div class="card h-100 shadow-sm hero-card">
                    <div class="card-img-container">
                        <img src="${sanitizeHTML(photo)}" class="card-img-top hero-img" alt="${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}">
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title" id="${titleId}">${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}</h5>
                        <div class="badge badge-role">Real Name: ${sanitizeHTML(p.realName)}</div>
                        <p class="card-text">Weapon: ${sanitizeHTML(p.weapon)}</p>
                        <button type="button" class="btn btn-sm btn-outline-light mt-2" data-bs-toggle="modal" data-bs-target="#${modalId}">More Info</button>
                    </div>
                </div>
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-describedby="${modalId}Desc" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content" style="background: rgba(13, 27, 42, 0.98); border: 2px solid ${colors.infinityGold}; font-family: 'Arial', 'Helvetica', sans-serif;">
                            <div class="modal-header" style="display: flex; justify-content: center; align-items: center; border-bottom: 1px solid ${colors.infinityGold}; padding: 20px;">
                                <h5 class="modal-title" id="${modalId}Label" style="color: ${colors.starWhite}; font-size: 1.75rem; font-weight: bold; text-align: center; flex: 1; margin: 0; line-height: 1.4;">
                                    ${sanitizeHTML(p.firstName)} ${sanitizeHTML(p.lastName || '')}
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" style="position: absolute; right: 20px; top: 20px; filter: brightness(1.5);"></button>
                            </div>
                            <div class="modal-body text-center" id="${modalId}Desc" style="color: ${colors.starWhite}; padding: 30px; font-size: 1.25rem; line-height: 1.6;">
                                <h5 id="${titleId}" style="font-weight: bold; margin-bottom: 15px; color: ${colors.infinityGold};">
                                    ${p.skill && typeof p.skill === 'string' ? sanitizeHTML(p.skill) : 'No skill available'}
                                </h5>
                            </div>
                            <div class="modal-footer" style="justify-content: center; border-top: 1px solid ${colors.infinityGold}; padding: 20px;">
                                <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal" style="padding: 10px 20px; font-size: 1rem; border-color: ${colors.infinityGold}; color: ${colors.starWhite}; transition: background-color 0.3s, color 0.3s;">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Handle image loading errors
            const img = col.querySelector('.hero-img');
            img.onerror = () => {
                // Log warning if image fails to load
                console.warn(`Failed to load image for ${p.firstName}`);
                // Set fallback image
                img.src = 'https://via.placeholder.com/150?text=Image+Error';
                // Apply grayscale effect to indicate error
                img.style.filter = 'grayscale(50%)';
            };
            // Adjust image fit for extreme aspect ratios
            img.onload = () => {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                if (aspectRatio > 2 || aspectRatio < 0.5) {
                    img.style.objectFit = 'contain';
                }
            };

            // Append the card to the grid
            grid.appendChild(col);

            // Add hover effects to modal buttons
            const closeButton = col.querySelector(`#${modalId} .btn-close`);
            const footerButton = col.querySelector(`#${modalId} .btn-outline-light`);
            [closeButton, footerButton].forEach(button => {
                // Apply gold background and dark text on hover
                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = colors.infinityGold;
                    button.style.color = colors.nebulaDark;
                });
                // Reset styles on mouse leave
                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = 'transparent';
                    button.style.color = colors.starWhite;
                });
            });
        });

        // Style all hero cards
        const cards = document.querySelectorAll('.hero-card');
        cards.forEach(card => {
            // Set red background with transparency
            card.style.background = `rgba(211, 24, 24, 0.9)`;
            // Add gold border
            card.style.border = `2px solid ${colors.infinityGold}`;
            // Add blue shadow effect
            card.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
        });

        // Style role badges
        const badges = document.querySelectorAll('.badge-role');
        badges.forEach(badge => {
            // Set white text color
            badge.style.color = colors.starWhite;
            // Set blue background with transparency
            badge.style.backgroundColor = `rgba(48, 148, 255, 0.8)`;
        });
    };

    // Function to apply search and sort filters to the player list
    const applyFilters = (players, searchInput, sortSelect, hr) => {
        // Log filter application for debugging
        console.log('Applying filters');
        // Validate player data
        if (!players || !Array.isArray(players)) {
            // Log error and render empty grid if players are invalid
            console.error('Players array not found');
            render(null, hr);
            return;
        }

        // Get search term from input, default to empty string
        const term = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
        // Filter players by name matching the search term
        let filteredList = players.filter(p =>
            `${p.firstName} ${p.lastName || ''}`.toLowerCase().includes(term)
        );

        // Get sort value from select element
        const sortValue = sortSelect && sortSelect.value ? sortSelect.value : '';
        if (sortValue && sortValue.includes('-')) {
            // Split sort value into key and direction (e.g., 'firstName-asc')
            const [key, dir] = sortValue.split('-');
            // Sort the filtered list based on key and direction
            filteredList.sort((a, b) => {
                const valueA = (a[key] && typeof a[key] === 'string' ? a[key] : '').toLowerCase();
                const valueB = (b[key] && typeof b[key] === 'string' ? b[key] : '').toLowerCase();
                // Sort ascending or descending based on direction
                return dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            });
        } else {
            // Warn if sort value is invalid
            console.warn('Invalid sort value:', sortValue);
        }

        // Render the filtered and sorted list
        render(filteredList, hr);
    };

    // Store current hour for theming
    let hr = new Date().getHours();

    // Function to initialize the application
    const initializeApp = (players) => {
        // Get required DOM elements
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const grid = document.getElementById('rosterGrid');

        // Validate required elements
        if (!grid || !searchInput || !sortSelect) {
            // Log error if any elements are missing
            console.error('Missing DOM elements:', { grid, searchInput, sortSelect });
            if (grid) {
                // Display error message in the grid
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="placeholder-card p-3">
                            <h5 id="LossTxt" class="mb-1">Initialization Error</h5>
                            <p class="text-muted">Required elements not found. Please check the page structure.</p>
                        </div>
                    </div>
                `;
            } else {
                // Alert user if grid is missing
                alert('Error: Required elements not found. Please check page structure.');
            }
            return;
        }

        // Apply theme and update current hour
        hr = applyTheme();
        // Style the navbar
        styleNavbar();
        // Style form controls
        styleControls();

        // Create debounced filter function to improve performance
        const debouncedFilters = debounce(() => applyFilters(players, searchInput, sortSelect, hr), 300);
        // Bind search input event to apply filters on input
        searchInput.addEventListener('input', debouncedFilters);
        // Bind sort select event to apply filters on change
        sortSelect.addEventListener('change', debouncedFilters);

        // Perform initial render with filters applied
        applyFilters(players, searchInput, sortSelect, hr);
    };

    // Start the player loading process
    loadPlayers();
});