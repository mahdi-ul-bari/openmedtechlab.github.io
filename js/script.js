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
 * ASYNCHRONOUS CONTENT LOADING
 * ======================================= */

// Function to dynamically load research.html content
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
                // Check for HTTP errors (404, 500, etc.)
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
                contentLoader.innerHTML = '<p class="text-red-600 p-8 text-center">Sorry, the research content failed to load. Check your console for details.</p>';
            }
        });
}


/* =======================================
 * TAB AND NAVIGATION MANAGEMENT
 * ======================================= */

// ** 🚀 CORRECTED PLACEMENT: updateActiveNav is a top-level function 🚀 **
function updateActiveNav(tabId, projectHash = null) {
    // 3. Update desktop button state: Remove 'active' from ALL tab buttons first
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    const researchBtn = document.getElementById('tab-research-btn');
    const projectsBtn = document.getElementById('tab-projects-btn');

    if (tabId === 'research') {
        // SCENARIO 1: We clicked a specific project link inside the dropdown, or the "All Projects" link.
        // In these cases, projectHash will be set (e.g., 'OpenXamp' or 'research').
        if (projectHash) {
            if (projectsBtn) {
                // Activate the Projects dropdown button
                projectsBtn.classList.add('active');
            }
            // Ensure the standalone Research button is NOT active
            if (researchBtn) {
                researchBtn.classList.remove('active');
            }
        } 
        // SCENARIO 2: We clicked the standalone 'Research' button (projectHash is null).
        else { 
            if (researchBtn) {
                // Activate the standalone Research button
                researchBtn.classList.add('active');
            }
            // Ensure the Projects dropdown button is NOT active
            if (projectsBtn) {
                projectsBtn.classList.remove('active');
            }
        }
    } else {
        // For any other tab (home, people, contact), activate the main button for that tab
        const mainButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (mainButton) {
            mainButton.classList.add('active');
        }
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
// ** ---------------------------------------------------------------------- **


// Updated handleProjectClick
function handleProjectClick(event) {
    event.preventDefault();

    const tabId = event.currentTarget.dataset.tab; // Should be 'research'
    const projectHash = event.currentTarget.dataset.project;

    currentProjectHash = projectHash;

    // Explicitly hide the desktop dropdown menu
    const projectsMenu = document.getElementById('projects-menu');
    if (projectsMenu) {
        // By adding 'hidden', we override the group-hover:block
        projectsMenu.classList.add('hidden');
    }

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

// Modified showTab function (now globally accessible)
function showTab(tabId, isInitialLoad = false, projectHash = null) {
    // 1. Hide all content tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // 2. Show the active content tab
    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');

        // Load Research Content if tab is 'research'
        if (tabId === 'research') {
            loadResearchContent();
        }

        if (isInitialLoad) {
            // For initial load, scroll to top completely
            window.scrollTo(0, 0);
        } else {
            // SCROLL LOGIC
            let targetElement;
            
            if (tabId === 'research' && projectHash && projectHash !== 'research') {
                // If a specific project hash exists, scroll instantly to that element ID
                // Delay scroll to ensure the content from research.html has time to load and render
                setTimeout(() => {
                    targetElement = document.getElementById(projectHash);
                    if (targetElement) {
                         targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                }, 50); // 50ms delay for content loading
            } else {
                // For all other tabs, scroll instantly to the top of the content area
                targetElement = activeContent;
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            }
        }
    }

    // 3 & 4. Update Navigation States (Now correctly calling the top-level function)
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
            const containerDiv = document.getElementById('navbar-container');

            if (containerDiv) {
                // Insert the loaded HTML into the container
                containerDiv.innerHTML = data;
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
        
        // Ensure necessary elements exist before adding listeners
        if (desktopNav && mobileMenuBtn && mobileNavMenu) {
            // --- Tab Event Listeners (Desktop) ---
            desktopNav.querySelectorAll('.tab-button[data-tab]').forEach(button => {
                // We exclude the Projects dropdown button itself from this click handler
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
            const projectsMenu = document.getElementById('projects-menu');
            if (projectsMenu) {
                projectsMenu.querySelectorAll('.dropdown-item').forEach(link => {
                    link.addEventListener('click', handleProjectClick);
                });
            }

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
