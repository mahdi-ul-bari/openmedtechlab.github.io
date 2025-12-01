 /* =======================================
    * SLIDER FUNCTIONALITY CODE
    * ======================================= */
    const sliderImages = [
        "https://openmedtech-lab.github.io/images/OpenXamp.jpg",
        "https://openmedtech-lab.github.io/images/OpenXstim.png",
        "https://openmedtech-lab.github.io/images/OpenXhand.jpeg",
        "https://openmedtech-lab.github.io/images/OpenXwheel.png",
        "https://openmedtech-lab.github.io/images/OpenXstand.jpg",
        "https://openmedtech-lab.github.io/images/OpenXwalk.jpg"
    ];

    let currentSlideIndex = 0;
    let currentProjectHash = null; // Global state for project hash

    function updateSlider() {
        const sliderImageElement = document.getElementById('slider-image');
        if (sliderImageElement) {
            sliderImageElement.src = sliderImages[currentSlideIndex];
        }
    }

    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % sliderImages.length;
        updateSlider();
    }

    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + sliderImages.length) % sliderImages.length;
        updateSlider();
    }

    /* =======================================
    * TAB AND NAVIGATION MANAGEMENT
    * ======================================= */

    function updateActiveNav(tabId, projectHash = null) {
        // 3. Update desktop button state
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate the main tab button (e.g., 'research' button)
        const mainButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (mainButton) {
            mainButton.classList.add('active');
        }

        // Special handling for the Projects dropdown button:
        const projectsBtn = document.getElementById('tab-projects-btn');
        if (tabId === 'research' && projectsBtn) {
            projectsBtn.classList.add('active');
        } else if (projectsBtn && tabId !== 'research') {
            projectsBtn.classList.remove('active');
        }

        // 4. Update mobile button state
        document.querySelectorAll('.mobile-nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeMobileButton = document.querySelector(`.mobile-nav-item[data-tab="${tabId}"]`);
        if (activeMobileButton) {
            activeMobileButton.classList.add('active');
        }
    }

    // Updated handleProjectClick
    function handleProjectClick(event) {
        event.preventDefault(); 
        
        const tabId = event.currentTarget.dataset.tab; // Should be 'research'
        const projectHash = event.currentTarget.dataset.project; 
        
        currentProjectHash = projectHash;

        // *** FIX: Explicitly hide the desktop dropdown menu ***
        const projectsMenu = document.getElementById('projects-menu');
        if (projectsMenu) {
            // By adding 'hidden', we override the group-hover:block
            projectsMenu.classList.add('hidden');
        }
        // ******************************************************

        // Force Blur on the Projects Button (Good practice for focus management)
        const projectsButton = document.getElementById('tab-projects-btn');
        if (projectsButton) {
            projectsButton.blur(); 
        }
        
        // Close mobile menu after selection (existing code)
        const mobileNavMenu = document.getElementById('mobile-nav-menu');
        const menuIconOpen = document.getElementById('menu-icon-open');
        const menuIconClose = document.getElementById('menu-icon-close');
        if (mobileNavMenu && !mobileNavMenu.classList.contains('hidden')) {
            mobileNavMenu.classList.add('hidden');
            menuIconOpen.classList.remove('hidden');
            menuIconClose.classList.add('hidden');
        }

        // Show the correct tab, passing the specific project hash
        showTab(tabId, false, projectHash); 
    }

    // Modified showTab function
    function showTab(tabId, isInitialLoad = false, projectHash = null) {
        // 1. Hide all content tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // 2. Show the active content tab
        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
            
            if (isInitialLoad) {
                // For initial load, scroll to top completely
                window.scrollTo(0, 0); 
            } else {
                // SCROLL LOGIC
                let targetElement;
                if (tabId === 'research' && projectHash && projectHash !== 'research') {
                    // If a specific project hash exists, scroll instantly to that element ID
                    targetElement = document.getElementById(projectHash);
                } else {
                    // For all other tabs, scroll instantly to the top of the content area
                    targetElement = activeContent;
                }

                if (targetElement) {
                    // *** FIX APPLIED HERE: Changed 'smooth' to 'auto' ***
                    targetElement.scrollIntoView({ behavior: 'auto', block: 'start' }); 
                }
            }
        }

        // 3 & 4. Update Navigation States
        updateActiveNav(tabId, projectHash);
    }

    // Function to fetch and insert the external navbar content
    function loadNavbar() {
        return fetch('navbar.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - Did you create 'navbar.html'?`);
                }
                return response.text();
            })
            .then(data => {
                const container = document.getElementById('navbar-container');
                if (container) {
        
                    const outerHeader = document.querySelector('header');
                    if (outerHeader) {
                        // Insert the loaded HTML *inside* the outer <header>
                        // data is the entire content of navbar.html
                        outerHeader.innerHTML = data;
                            
                        const containerDiv = document.getElementById('navbar-container');
                        if(containerDiv) {
                            // Data contains the full <header> element, let's just insert it here
                            // This replaces the empty placeholder div with the full header.
                            containerDiv.outerHTML = data;
                        }

                    }
                    
                    
                }
            })
            .catch(e => console.error("Could not load navbar:", e));
    }


    /* =======================================
     * INITIALIZATION BLOCK
     * ======================================= */
    document.addEventListener('DOMContentLoaded', () => {
        // --- STEP 1: LOAD NAVBAR CONTENT (runs asynchronously) ---
        loadNavbar().then(() => {
            // --- STEP 2: ALL INITIALIZATION MUST HAPPEN HERE (after content is loaded) ---

            const desktopNav = document.getElementById('desktop-nav');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileNavMenu = document.getElementById('mobile-nav-menu');
            const menuIconOpen = document.getElementById('menu-icon-open');
            const menuIconClose = document.getElementById('menu-icon-close');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');

            // We must check if these exist before trying to call methods on them
            if (desktopNav && mobileMenuBtn && mobileNavMenu) {
                // --- Tab Event Listeners (Desktop) ---
                desktopNav.querySelectorAll('.tab-button[data-tab]').forEach(button => {
                    if (button.id !== 'tab-projects-btn') {
                        button.addEventListener('click', (e) => {
                            currentProjectHash = null; 
                            showTab(e.currentTarget.dataset.tab, false); 
                        });
                    }
                });

                // --- Tab Event Listeners (Mobile) ---
                mobileNavMenu.querySelectorAll('.mobile-nav-item').forEach(button => {
                    button.addEventListener('click', (e) => {
                        currentProjectHash = null; 
                        showTab(e.currentTarget.dataset.tab, false);
                        
                        // Close mobile menu after click
                        mobileNavMenu.classList.add('hidden');
                        menuIconOpen.classList.remove('hidden');
                        menuIconClose.classList.add('hidden');
                    });
                });

                // --- Project Dropdown Links Event Listener ---
                document.querySelectorAll('#projects-menu .dropdown-item').forEach(link => {
                    link.addEventListener('click', handleProjectClick);
                });

                // --- Mobile Menu Toggle ---
                mobileMenuBtn.addEventListener('click', () => {
                    const isHidden = mobileNavMenu.classList.contains('hidden');
                    if (isHidden) {
                        mobileNavMenu.classList.remove('hidden');
                        menuIconOpen.classList.add('hidden');
                        menuIconClose.classList.remove('hidden');
                    } else {
                        mobileNavMenu.classList.add('hidden');
                        menuIconOpen.classList.remove('hidden');
                        menuIconClose.classList.add('hidden');
                    }
                });
            }


            // --- Slider Event Listeners ---
            if (prevBtn) { prevBtn.addEventListener('click', prevSlide); }
            if (nextBtn) { nextBtn.addEventListener('click', nextSlide); }
            
            // --- Initialization ---
            updateSlider(); 
            showTab('home', true); // Initialize to the 'home' tab on load
        }).catch(e => {
            console.error("Initialization failed due to navbar loading error:", e);
        });
    });
// --- Add this function to your js/script.js file ---

function loadResearchContent() {
    const contentLoader = document.getElementById('research-content-loader');
    
    // Check if content is already loaded to prevent redundant network requests
    if (contentLoader && contentLoader.dataset.loaded === 'true') {
        return;
    }

    // Use Fetch API to load the external HTML file
    fetch('research.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // Insert the HTML content into the loader div
            if (contentLoader) {
                contentLoader.innerHTML = html;
                contentLoader.dataset.loaded = 'true'; // Mark as loaded
            }
        })
        .catch(error => {
            console.error('Error loading research.html:', error);
            if (contentLoader) {
                contentLoader.innerHTML = '<p class="text-red-600 p-8 text-center">Sorry, the research content failed to load.</p>';
            }
        });
}

// You must integrate the loadResearchContent() call into your existing showTab function.
// Here is the recommended update for your showTab function (assuming it exists):

function showTab(tabId) {
    // Hide all tab content sections
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the active tab section
    const activeTabSection = document.getElementById('tab-' + tabId);
    if (activeTabSection) {
        activeTabSection.classList.remove('hidden');
    }
    
    // Update active button state (logic omitted for brevity)
    
    // Check if the research tab is being shown, and load content if it is
    if (tabId === 'research') {
        loadResearchContent();
    }
}

// You must ensure all buttons that use 'data-tab="research"' call the showTab('research') function 
// when clicked. (If you use event listeners, update them to use showTab).
