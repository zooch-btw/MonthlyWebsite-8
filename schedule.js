// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Log execution time for debugging
    console.log('Script executed at', new Date().toLocaleString());

    // Maximum number of retries to check for mission data
    const maxRetries = 10;
    // Counter to track retry attempts
    let retryCount = 0;

    // Define Marvel-themed colors for consistent styling
    const colors = {
        heroRed: '#ff2a44', // Red for highlights and errors
        cosmicBlue: '#1e90ff', // Blue for shadows and table stripes
        vibrantPurple: '#6a0dad', // Purple for evening theme
        infinityGold: '#ffd700', // Gold for borders and hover effects
        nebulaDark: '#0d1b2a', // Dark blue for backgrounds
        starWhite: '#f0f8ff' // White for text
    };

    // Define time-based themes for background gradients
    const themeSettings = [
        { start: 5, end: 11, cls: 'morning', bgGradient: `linear-gradient(135deg, ${colors.heroRed} 0%, ${colors.infinityGold} 100%)` },
        { start: 11, end: 17, cls: 'afternoon', bgGradient: `linear-gradient(135deg, ${colors.cosmicBlue} 0%, #00e6e6 100%)` },
        { start: 17, end: 22, cls: 'evening', bgGradient: `linear-gradient(135deg, ${colors.vibrantPurple} 0%, #2a1b3d 100%)` },
        { start: 22, end: 24, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` },
        { start: 0, end: 5, cls: 'night', bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)` }
    ];

    // Static dataset of Marvel hero missions for 2025
    const missions = [
        { date: '2025-01-15', villain: 'Loki', location: 'Asgard', isEarth: false, time: '2:00 PM' },
        { date: '2025-02-10', villain: 'Thanos', location: 'Titan', isEarth: false, time: '8:00 PM' },
        { date: '2025-03-05', villain: 'Green Goblin', location: 'New York City', isEarth: true, time: '3:30 PM' },
        { date: '2025-04-20', villain: 'Doctor Doom', location: 'Latveria', isEarth: true, time: '6:45 PM' },
        { date: '2025-05-12', villain: 'Magneto', location: 'Genosha', isEarth: true, time: '10:00 AM' },
        { date: '2025-06-08', villain: 'Ultron', location: 'Sokovia', isEarth: true, time: '4:15 PM' },
        { date: '2025-07-25', villain: 'Galactus', location: 'Cosmic Void', isEarth: false, time: '11:00 PM' },
        { date: '2025-08-14', villain: 'Red Skull', location: 'HYDRA Base', isEarth: true, time: '1:30 PM' },
        { date: '2025-09-03', villain: 'Kang the Conqueror', location: 'Chronopolis', isEarth: false, time: '7:00 PM' },
        { date: '2025-10-18', villain: 'Venom', location: 'San Francisco', isEarth: true, time: '5:00 PM' },
        { date: '2025-11-07', villain: 'Mystique', location: 'Washington D.C.', isEarth: true, time: '9:30 AM' },
        { date: '2025-12-22', villain: 'Annihilus', location: 'Negative Zone', isEarth: false, time: '12:00 AM' }
    ];

    // Function to load mission data with a retry mechanism
    const loadMissions = () => {
        // Check if missions array is defined and valid
        if (missions && Array.isArray(missions) && missions.length > 0) {
            // Log success and initialize app
            console.log('Missions defined:', missions);
            initializeApp(missions);
        } else if (retryCount < maxRetries) {
            // Increment retry counter
            retryCount++;
            // Warn about retry attempt
            console.warn(`Retry ${retryCount}/${maxRetries}: missions not defined`);
            // Schedule retry after 300ms
            setTimeout(loadMissions, 300);
        } else {
            // Log error if retries are exhausted
            console.error('Error: missions undefined after retries');
            // Get the table body element
            const tbody = document.querySelector('#scheduleTable tbody');
            if (tbody) {
                // Display error message in the table
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            <div class="p-3">
                                <h5 id="LossTxt" class="mb-1">Error Loading Missions</h5>
                                <p class="text-muted">Unable to load mission data. Please refresh the page.</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                // Alert user if table is missing
                alert('Error: Mission table not found. Please check page structure.');
            }
        }
    };

    // Function to apply time-based theme to the page
    const applyTheme = () => {
        // Get current hour (0-23)
        const hr = new Date().getHours();
        // Find theme matching the current hour, default to night
        const setting = themeSettings.find(({ start, end }) => hr >= start && hr < end) || {
            cls: 'night',
            bgGradient: `linear-gradient(135deg, ${colors.nebulaDark} 0%, #0a0a23 100%)`
        };
        // Remove existing theme classes
        document.body.classList.remove('morning', 'afternoon', 'evening', 'night');
        // Add new theme class
        document.body.classList.add(setting.cls);
        // Apply background gradient
        document.body.style.background = setting.bgGradient;
        // Log applied theme
        console.log('Applied theme:', setting.cls);
        return hr;
    };

    // Function to style the navbar, matching roster page
    const styleNavbar = () => {
        // Get navbar element
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Apply gradient background
            navbar.style.background = `linear-gradient(180deg, ${colors.nebulaDark} 0%, rgba(13, 27, 42, 0.9) 100%)`;
            // Add gold border effect
            navbar.style.borderImageSource = `linear-gradient(90deg, transparent, ${colors.infinityGold}, transparent)`;
            navbar.style.borderImageSlice = '1';
            navbar.style.borderBottomWidth = '2px';
            navbar.style.borderBottomStyle = 'solid';
        } else {
            // Warn if navbar is missing
            console.warn('Navbar not found');
        }

        // Style navbar links and brand
        const navLinks = document.querySelectorAll('.navbar-brand, .navbar-nav .nav-link');
        navLinks.forEach(link => {
            // Set white text color
            link.style.color = colors.starWhite;
            // Center text
            link.style.textAlign = 'center';
            // Add hover effect
            link.addEventListener('mouseenter', () => {
                link.style.color = colors.infinityGold;
                link.style.textShadow = `0 0 15px ${colors.infinityGold}`;
            });
            // Reset style on mouse leave, apply active styling
            link.addEventListener('mouseleave', () => {
                link.style.color = link.classList.contains('active') ? colors.heroRed : colors.starWhite;
                link.style.textShadow = link.classList.contains('active') ? `0 0 10px ${colors.heroRed}` : 'none';
            });
        });

        // Style active link
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            activeLink.style.color = colors.heroRed;
            activeLink.style.textShadow = `0 0 10px ${colors.heroRed}`;
        }

        // Style navbar logo
        const navbarLogo = document.querySelector('.navbar-logo');
        if (navbarLogo) {
            // Add shadow and brightness
            navbarLogo.style.filter = `drop-shadow(0 0 8px ${colors.cosmicBlue}) brightness(1.2)`;
            navbarLogo.style.display = 'block';
            navbarLogo.style.margin = 'auto';
            navbarLogo.style.maxWidth = '100px';
        }
    };

    // Function to style search input and sort select
    const styleControls = () => {
        // Get all form control elements
        const controls = document.querySelectorAll('.form-control, .form-select');
        controls.forEach(control => {
            // Apply Marvel-themed cosmic gradient
            control.style.background = `linear-gradient(45deg, rgba(13, 27, 42, 0.85), rgba(30, 144, 255, 0.85))`;
            // Set text color to white
            control.style.color = colors.starWhite;
            // Add gold border
            control.style.borderColor = colors.infinityGold;
            // Center text
            control.style.textAlign = 'center';
            // Add padding
            control.style.padding = '0.5rem';
            // Apply Marvel font
            control.style.fontFamily = "'Bebas Neue', 'Comic Neue', 'Nunito', sans-serif";
        });
    };

    // Function to style the table container
    const styleTable = () => {
        // Get table container
        const tableContainer = document.querySelector('.table-responsive');
        if (tableContainer) {
            // Apply cosmic gradient with starfield effect
            tableContainer.style.background = `
                linear-gradient(45deg, rgba(13, 27, 42, 0.95), rgba(48, 148, 255, 0.2)),
                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0.1%, transparent 0.2%),
                radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.1) 0.1%, transparent 0.2%),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0.1%, transparent 0.2%)
            `;
            tableContainer.style.border = `2px solid ${colors.infinityGold}`;
            tableContainer.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
            tableContainer.style.borderRadius = '8px';
            tableContainer.style.padding = '10px';
        } else {
            // Warn if table container is missing
            console.warn('Table container not found');
        }

        // Style table headers
        const ths = document.querySelectorAll('#scheduleTable th');
        ths.forEach(th => {
            th.style.backgroundColor = colors.nebulaDark;
            th.style.color = colors.starWhite;
            th.style.borderColor = colors.infinityGold;
            th.style.fontFamily = "'Bebas Neue', 'Comic Neue', 'Nunito', sans-serif";
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
            // Set a new timeout
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Function to render mission rows
    const render = (list, hr) => {
        // Get the table body element
        const tbody = document.querySelector('#scheduleTable tbody');
        if (!tbody) {
            // Log error and alert if table is missing
            console.error('Mission table not found');
            alert('Error: Mission table not found. Please check page structure.');
            return;
        }

        // Clear existing table content
        tbody.innerHTML = '';
        // Check if the mission list is valid
        if (!list || !Array.isArray(list) || list.length === 0) {
            // Warn if no valid missions are provided
            console.warn('No valid missions to render');
            // Display placeholder message
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="p-3">
                            <h5 id="${hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt'}" class="mb-1">No Missions Available</h5>
                            <p class="text-muted">No hero missions scheduled for 2025.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Render each mission as a table row
        list.forEach(mission => {
            // Create table row
            const tr = document.createElement('tr');
            // Set victory/loss text based on time
            const titleId = hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt';
            // Set row HTML with sanitized data
            tr.innerHTML = `
                <td>${sanitizeHTML(mission.date)}</td>
                <td>${sanitizeHTML(mission.villain)}</td>
                <td>${sanitizeHTML(mission.location)}</td>
                <td>${mission.isEarth ? 'Earth' : 'Off-World'}</td>
                <td>${sanitizeHTML(mission.time)}</td>
            `;
            // Append row to table
            tbody.appendChild(tr);

            // Add hover effect to row
            tr.addEventListener('mouseenter', () => {
                tr.style.backgroundColor = `rgba(${hr >= 11 && hr < 17 ? '30, 144, 255' : '255, 42, 68'}, 0.2)`;
                tr.style.boxShadow = `0 0 10px ${colors.cosmicBlue}`;
            });
            tr.addEventListener('mouseleave', () => {
                tr.style.backgroundColor = '';
                tr.style.boxShadow = 'none';
            });
        });
    };

    // Function to apply search and sort filters to the mission list
    const applyFilters = (missions, searchInput, sortSelect, hr) => {
        // Log filter application for debugging
        console.log('Applying filters');
        // Validate mission data
        if (!missions || !Array.isArray(missions)) {
            // Log error and render empty table
            console.error('Missions array not found');
            render(null, hr);
            return;
        }

        // Get search term from input, default to empty string
        const term = searchInput && searchInput.value ? searchInput.value.trim().toLowerCase() : '';
        // Filter missions by villain matching the search term
        let filteredList = missions.filter(m =>
            m.villain.toLowerCase().includes(term)
        );

        // Get sort value from select element
        const sortValue = sortSelect && sortSelect.value ? sortSelect.value : '';
        if (sortValue && sortValue.includes('-')) {
            // Split sort value into key and direction (e.g., 'villain-asc')
            const [key, dir] = sortValue.split('-');
            // Sort the filtered list based on key and direction
            filteredList.sort((a, b) => {
                const valueA = (a[key] && typeof a[key] === 'string' ? a[key] : '').toLowerCase();
                const valueB = (b[key] && typeof b[key] === 'string' ? b[key] : '').toLowerCase();
                // Sort ascending or descending
                return dir === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            });
        } else {
            // Warn if sort value is invalid
            console.warn('Invalid sort value:', sortValue);
        }

        // Render the filtered and sorted list
        render(filteredList, hr);
    };

    // Function to initialize the application
    const initializeApp = (missions) => {
        // Get required DOM elements
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const tbody = document.querySelector('#scheduleTable tbody');

        // Validate required elements
        if (!tbody || !searchInput || !sortSelect) {
            // Log error if any elements are missing
            console.error('Missing DOM elements:', { tbody, searchInput, sortSelect });
            if (tbody) {
                // Display error message in the table
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            <div class="p-3">
                                <h5 id="LossTxt" class="mb-1">Initialization Error</h5>
                                <p class="text-muted">Required elements not found. Please check page structure.</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                // Alert user if table is missing
                alert('Error: Required elements not found. Please check page structure.');
            }
            return;
        }

        // Apply time-based theme
        const hr = applyTheme();
        // Style navbar, controls, and table
        styleNavbar();
        styleControls();
        styleTable();

        // Create debounced filter function
        const debouncedFilters = debounce(() => applyFilters(missions, searchInput, sortSelect, hr), 300);
        // Bind search input event
        searchInput.addEventListener('input', debouncedFilters);
        // Bind sort select event
        sortSelect.addEventListener('change', debouncedFilters);

        // Perform initial render with filters applied
        applyFilters(missions, searchInput, sortSelect, hr);
    };

    // Start the mission loading process
    loadMissions();
});