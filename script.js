document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const themeToggleButton = document.getElementById('darkModeToggle');
    const body = document.body;
    const currentYearSpan = document.getElementById('currentYear');

    // --- Set Current Year in Footer ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Mobile Menu Toggle ---
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active'); // For styling the hamburger icon itself
            const expanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', expanded);
        });

        // Close menu when a link is clicked (optional, good for SPAs, but can be kept for multi-page)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    // Only close if it's not a link that opens in new tab or external
                    if (!link.target || link.target === '_self') {
                        navLinks.classList.remove('active');
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    }

    // --- Theme (Dark/Light Mode) Toggle ---
    function applyTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode'); // Ensure dark-mode is removed if set by default in HTML
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode'); // Add dark-mode if not already present
        }
        localStorage.setItem('portfolioTheme', theme);
    }

    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // If no saved theme, check if body has 'light-mode' class from HTML (for default light)
        // Or default to dark if 'dark-mode' is set in HTML or no class is set
        if (body.classList.contains('light-mode')) {
            applyTheme('light');
        } else {
            applyTheme('dark'); // Fallback to dark if neither or dark-mode is set in HTML
        }
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            if (body.classList.contains('light-mode')) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        });
    }

    // --- Active Nav Link for Multi-Page Sites ---
    // This script assumes that the `data-page` attribute on nav links
    // matches the body's ID or a specific class for the current page.
    // For simpler multi-page, we can match against window.location.pathname.

    const currentPagePath = window.location.pathname.split('/').pop() || 'index.html'; // Gets 'about.html', 'index.html' etc.
    const navItems = document.querySelectorAll('.nav-links .nav-item');

    navItems.forEach(item => {
        const itemPath = item.getAttribute('href').split('/').pop();
        if (itemPath === currentPagePath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active'); // Ensure others are not active
        }
    });

     // Sticky header class (optional, if you want header to change on scroll)
    const header = document.getElementById('main-header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Downscroll and past header height
            header.style.top = `-${header.offsetHeight}px`; // Hide header
        } else {
            // Upscroll or at the top
            header.style.top = "0"; // Show header
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        
        // Add a class when scrolled a bit, e.g., for shadow or background change
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // --- Hero Section Role Typer ---
const roleTyperElement = document.getElementById('role-typer');
if (roleTyperElement) {
    const roles = ["Web Developer", "UI/UX Enthusiast", "Creative Coder", "Problem Solver", "Tech Alchemist"];
    let roleIndex = 0;
    let charIndex = 0;
    let currentRole = "";
    let isDeleting = false;

    function typeRole() {
        const fullCurrentRole = roles[roleIndex];
        if (isDeleting) {
            currentRole = fullCurrentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentRole = fullCurrentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        roleTyperElement.textContent = currentRole;

        let typeSpeed = isDeleting ? 75 : 150;

        if (!isDeleting && charIndex === fullCurrentRole.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Pause before typing new word
        }

        setTimeout(typeRole, typeSpeed);
    }
    // Start typer if element exists
    typeRole();
}

// --- Glitch effect for Name (HTML data-text attribute is used by CSS) ---
// No JS needed for the basic CSS glitch, but you could enhance it with JS if desired.
// For example, to trigger the glitch animation on hover or at intervals.
const nameGlitchElement = document.querySelector('.hero-headline .name-line.glitch');
if (nameGlitchElement) {
    const text = nameGlitchElement.getAttribute('data-text');
    // You can create more complex JS-driven glitch if needed, but CSS handles this one.
}





// --- Enhanced Contact Form Handling ---
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('form-status');
const submitButton = document.getElementById('submitBtn');

if (contactForm && formStatus && submitButton) {
    const defaultIcon = submitButton.querySelector('.icon-default');
    const loadingIcon = submitButton.querySelector('.icon-loading');
    const buttonText = submitButton.querySelector('.btn-text');

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // --- UI updates for loading state ---
        if (defaultIcon) defaultIcon.style.display = 'none';
        if (loadingIcon) loadingIcon.style.display = 'inline-block';
        if (buttonText) buttonText.textContent = 'Transmitting...';
        submitButton.disabled = true;
        formStatus.textContent = ""; // Clear previous status
        formStatus.className = 'form-status-message';

        // --- Collect form data ---
        const formData = new FormData(contactForm);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // --- Choose your submission method ---

        // Method 1: Using Fetch API with a Form Submission Service (e.g., Formspree, custom backend)
        // Replace 'YOUR_FORM_ENDPOINT_URL' with your actual endpoint
        const formEndpoint = 'YOUR_FORM_ENDPOINT_URL'; // Example: https://formspree.io/f/your_form_id

        try {
            const response = await fetch(formEndpoint, {
                method: 'POST',
                body: JSON.stringify(formObject), // Or formData if your endpoint accepts multipart/form-data
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Important for services like Formspree
                }
            });

            if (response.ok) {
                // Successful submission
                formStatus.textContent = "Signal_Received! I'll be in touch soon.";
                formStatus.className = 'form-status-message success';
                contactForm.reset();
            } else {
                // Server returned an error
                const errorData = await response.json().catch(() => null); // Try to parse error
                formStatus.textContent = `Transmission_Error. Status: ${response.status}. ${errorData?.error || 'Please try again or use an alternate channel.'}`;
                formStatus.className = 'form-status-message error';
            }
        } catch (error) {
            // Network error or other issues
            console.error('Form submission error:', error);
            formStatus.textContent = "Network_Failure. Check connection or try alternate channel.";
            formStatus.className = 'form-status-message error';
        }


        // Method 2: For Netlify Forms (if you're using Netlify)
        // Ensure your HTML form has: name="contact" data-netlify="true"
        /*
        try {
            const response = await fetch("/", { // Netlify processes forms submitted to the current path
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            });

            if (response.ok) {
                formStatus.textContent = "Signal_Received (via Netlify)! I'll be in touch soon.";
                formStatus.className = 'form-status-message success';
                contactForm.reset();
            } else {
                formStatus.textContent = `Transmission_Error (Netlify). Status: ${response.status}. Please try again.`;
                formStatus.className = 'form-status-message error';
            }
        } catch (error) {
            console.error('Netlify form submission error:', error);
            formStatus.textContent = "Network_Failure (Netlify). Check connection.";
            formStatus.className = 'form-status-message error';
        }
        */


        // --- UI updates after submission attempt ---
        if (defaultIcon) defaultIcon.style.display = 'inline-block';
        if (loadingIcon) loadingIcon.style.display = 'none';
        if (buttonText) buttonText.textContent = 'Send_Signal_';
        submitButton.disabled = false;
    });
}




// --- Basic Project Filtering (Example) ---
const filterButtons = document.querySelectorAll('.project-filters .filter-btn');
const projectCards = document.querySelectorAll('.projects-showcase-grid .project-showcase-card');

if (filterButtons.length > 0 && projectCards.length > 0) {
    // Make filter section visible if JS is enabled and elements exist
    const filterContainer = document.querySelector('.project-filters');
    if (filterContainer) filterContainer.style.display = 'flex';


    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Active button class
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategories = card.getAttribute('data-category'); // e.g., "web-dev ui-ux"
                if (filterValue === 'all' || (cardCategories && cardCategories.includes(filterValue))) {
                    card.style.display = 'flex'; // Or 'block', or 'grid' depending on card's display type
                    // You might need a more sophisticated show/hide with animation
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}


});// End of script.js