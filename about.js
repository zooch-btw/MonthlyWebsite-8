// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // Log execution time for debugging
    console.log('Script executed at', new Date().toLocaleString());

    // Maximum number of retries to check for milestone data (set as a precaution, though not used here)
    const maxRetries = 10;
    // Counter to track retry attempts
    let retryCount = 0;

    // Define Marvel-themed colors for consistent styling
    const colors = {
        heroRed: '#ff2a44', // Red for highlights and errors
        cosmicBlue: '#1e90ff', // Blue for shadows and card effects
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

    // Static dataset of Marvel milestones
    const milestones = [
        { year: '1939', title: 'The Beginning', description: 'Marvel started as Timely Comics, introducing characters like the Human Torch and Namor the Sub-Mariner.', image: 'marvel.png' },
        { year: '1961', title: 'The Fantastic Four', description: 'Stan Lee and Jack Kirby launched the Fantastic Four, ushering in the Marvel Age of Comics.', image: 'marvel.png' },
        { year: '2008', title: 'The MCU Begins', description: 'The release of Iron Man marked the start of the Marvel Cinematic Universe, a global phenomenon.', image: 'marvel.png' }
    ];

    // Function to load milestone data (simplified since data is static)
    const loadMilestones = () => {
        // Check if milestones array is defined and valid
        if (milestones && Array.isArray(milestones) && milestones.length > 0) {
            // Log success and initialize app
            console.log('Milestones defined:', milestones);
            initializeApp(milestones);
        } else if (retryCount < maxRetries) {
            // Increment retry counter
            retryCount++;
            // Warn about retry attempt
            console.warn(`Retry ${retryCount}/${maxRetries}: milestones not defined`);
            // Schedule retry after 300ms
            setTimeout(loadMilestones, 300);
        } else {
            // Log error if retries are exhausted
            console.error('Error: milestones undefined after retries');
            alert('Error: Milestone data could not be loaded. Please try again later.');
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

    // Function to style the navbar
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

    // Function to style the milestone cards
    const styleCards = () => {
        // Get all card elements
        const cards = document.querySelectorAll('.card');
        if (cards) {
            cards.forEach(card => {
                // Apply border and shadow
                card.style.border = `2px solid ${colors.infinityGold}`;
                card.style.boxShadow = `0 0 15px ${colors.cosmicBlue}`;
                card.style.borderRadius = '8px';
                // Add hover effect
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'scale(1.05)';
                    card.style.transition = 'transform 0.3s ease';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'scale(1)';
                });
            });
        } else {
            console.warn('Card elements not found');
        }
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

    // Function to render milestones
    const render = (milestonesList, hr) => {
        // Get the row container for milestone cards
        const row = document.querySelector('.row-cols-1.row-cols-md-2.row-cols-lg-3');
        if (!row) {
            // Log error and alert if row is missing
            console.error('Milestone card row not found');
            alert('Error: Milestone card container not found. Please check page structure.');
            return;
        }

        // Clear existing content
        row.innerHTML = '';
        // Check if the milestones list is valid
        if (!milestonesList || !Array.isArray(milestonesList) || milestonesList.length === 0) {
            // Warn if no valid milestones are provided
            console.warn('No valid milestones to render');
            row.innerHTML = `
                <div class="col-12">
                    <div class="p-3">
                        <h5 id="${hr >= 11 && hr < 17 ? 'VictoryTxt' : 'LossTxt'}" class="mb-1">No Milestones</h5>
                        <p class="text-muted">No Marvel milestones available.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render each milestone as a card
        milestonesList.forEach(milestone => {
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="card h-100">
                    <img src="${sanitizeHTML(milestone.image)}" class="card-img-top" alt="${sanitizeHTML(milestone.year)}">
                    <div class="card-body">
                        <h5 class="card-title" id="VictoryTxt">${sanitizeHTML(milestone.year)}: ${sanitizeHTML(milestone.title)}</h5>
                        <p class="card-text">${sanitizeHTML(milestone.description)}</p>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
    };

    // Function to initialize the application
    const initializeApp = (milestones) => {
        // Apply time-based theme
        const hr = applyTheme();
        // Style navbar and cards
        styleNavbar();
        styleCards();

        // Perform initial render
        render(milestones, hr);
    };

    // Start the milestone loading process
    loadMilestones();
});