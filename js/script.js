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
    // NOTE: This function is currently unused in the corrected logic, 
    // as all research content is embedded in index.html (tab-research).
    // Keeping it for future use if external loading is needed.
    const contentLoader = document.getElementById('research-content-loader');

    // Check if content is already loaded to prevent redundant network requests
    if (contentLoader && contentLoader.dataset.loaded === 'true') {
        return;
    }

    // Use Fetch API to load the external HTML file
    fetch('research.html') // If you need the parent directory, change this to '../research.html'
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
 * TAB AND NAVIGATION MANAGEMENT (Helper)
 * ======================================= */

// Define updateActiveNav globally so it can be called correctly
function updateActiveNav(tabId, projectHash = null) {
    // 3. Update desktop button state: Remove 'active' from ALL tab buttons first
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        // Removing hover/active styles for non-active buttons
        btn.classList.remove('bg-red-700', 'text-white');
        btn.classList.add('text-white'); // Ensure default state is applied
    });

    // Get the Projects dropdown button (used for activation when a project is clicked)
    const projectsBtn = document.getElementById('tab-projects-btn');

    if (tabId === 'projects') {
        // SCENARIO: We are on the projects tab, either via 'Projects' button or a specific project link
        if (projectsBtn) {
            projectsBtn.classList.add('active'); // Activate the Projects dropdown button
            projectsBtn.classList.add('bg-red-700', 'text-white');
        }
    } else {
        // For any other tab (home, research, people, contact), activate the main button for that tab
        const mainButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (mainButton) {
            mainButton.classList.add('active');
            mainButton.classList.add('bg-red-700', 'text-white');
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

// Updated handleProjectClick
function handleProjectClick(event) {
    event.preventDefault();

    // The tabId should always be 'projects' for these links
    const tabId = event.currentTarget.dataset.tab; // This should be 'projects'
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

    // Close mobile menu after selection (elements retrieved in DOMContentLoaded)
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');
    
    if (mobileNavMenu && !mobileNavMenu.classList.contains('hidden')) {
        mobileNavMenu.classList.add('hidden');
        if (menuIconOpen && menuIconClose) {
            menuIconOpen.classList.remove('hidden');
            menuIconClose.classList.add('hidden');
        }
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

        // Load Research Content if tab is 'research' (keeping this logic for future use)
        if (tabId === 'research') {
            loadResearchContent();
        }

        // SCROLL LOGIC
        if (isInitialLoad) {
            // For initial load, scroll to top completely
            window.scrollTo(0, 0);
        } else {
            let targetElement;
            
            // This block handles scrolling ONLY if a specific project hash is passed 
            // (i.e., when clicking a link in the 'Projects' dropdown menu).
            // The project hash value for 'All Projects' is also 'projects', so we exclude it from scrolling.
            if (tabId === 'projects' && projectHash && projectHash !== 'projects') {
                // If a specific project hash exists, scroll instantly to that element ID
                // Delay to ensure the content has time to render after showing the tab
                setTimeout(() => {
                    targetElement = document.getElementById(projectHash);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 50); // 50ms delay for content rendering
            } else if (tabId === 'projects' && projectHash === 'projects') {
                // Clicking 'All Projects' should just scroll to the top of the Projects tab
                 setTimeout(() => {
                    activeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            }
            // *** ALL OTHER GENERAL TAB CLICKS DO NOT TRIGGER SCROLLING HERE ***
        }
    }

    // 3 & 4. Update Navigation States (Called globally defined function)
    updateActiveNav(tabId, projectHash);
}


/* =======================================
 * INITIALIZATION (DOM Ready)
 * ======================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements *once* on load
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn'); 
    const projectsMenu = document.getElementById('projects-menu');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    // --- Tab Event Listeners (Desktop) ---
    // Attach listeners to all standard tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior if applicable
            currentProjectHash = null;
            showTab(e.currentTarget.dataset.tab, false);
        });
    });

    // --- Tab Event Listeners (Mobile) ---
    if (mobileNavMenu && menuIconOpen && menuIconClose) {
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
    }

    // --- Project Dropdown Links Event Listener ---
    if (projectsMenu) {
        projectsMenu.querySelectorAll('.dropdown-item').forEach(link => {
            link.addEventListener('click', handleProjectClick);
        });
    }

    // --- Mobile Menu Toggle ---
    if (mobileMenuBtn && mobileNavMenu && menuIconOpen && menuIconClose) { 
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
});
