// ==========================================
// GALAXY BACKGROUND ANIMATION
// ==========================================
class GalaxyBackground {
    constructor() {
        this.canvas = document.getElementById('galaxy-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 150;
        this.mouse = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(102, 126, 234, ',
            'rgba(118, 75, 162, ',
            'rgba(255, 107, 107, ',
            'rgba(254, 202, 87, ',
            'rgba(255, 255, 255, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, particle.color + '1)');
        gradient.addColorStop(0.5, particle.color + '0.5)');
        gradient.addColorStop(1, particle.color + '0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${1 - distance / 150})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                particle.x -= dx / distance * 2;
                particle.y -= dy / distance * 2;
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.connectParticles();
        
        this.particles.forEach(particle => this.drawParticle(particle));
        
        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
// CREATE ANIMATED STARS
// ==========================================
function createStars() {
    const starsContainer = document.querySelector('.stars-container');
    if (!starsContainer) return;
    
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3}px;
            height: ${Math.random() * 3}px;
            background: white;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
            box-shadow: 0 0 ${Math.random() * 10 + 5}px rgba(255, 255, 255, 0.8);
        `;
        starsContainer.appendChild(star);
    }
}

// ==========================================
// THEME MANAGER
// ==========================================
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
        this.bindEvents();
    }

    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        document.body.classList.add('theme-switching');
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 300);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        this.updateMetaThemeColor(theme);
        
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            light: '#ffffff',
            dark: '#1a1a1a'
        };
        
        metaThemeColor.content = colors[theme];
    }

    getTheme() {
        return this.currentTheme;
    }
}

// ==========================================
// DOM ELEMENTS
// ==========================================
const navbar = document.querySelector('.navbar');
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('backToTop');
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const contactForm = document.querySelector('.contact-form');
const statNumbers = document.querySelectorAll('.stat-number');

// ==========================================
// INITIALIZE
// ==========================================
let themeManager;

window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            
            // Initialize after preloader
            new GalaxyBackground();
            createStars();
        }, 500);
    }, 1500);
    
    // Initialize Theme Manager
    themeManager = new ThemeManager();
});

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
window.addEventListener('scroll', throttle(() => {
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
        navbar.classList.add('scrolled');
        backToTop.classList.add('show');
    } else {
        navbar.classList.remove('scrolled');
        backToTop.classList.remove('show');
    }
    
    // Parallax effect
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent && scrolled < hero.offsetHeight) {
        const rate = scrolled * -0.3;
        heroContent.style.transform = `translateY(${rate}px)`;
    }
}, 16));

// ==========================================
// MOBILE MENU
// ==========================================
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ==========================================
// SMOOTH SCROLLING
// ==========================================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Only prevent default for internal anchor links (starting with #)
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
        // Allow external links and page navigation to work normally
    });
});

// ==========================================
// BACK TO TOP BUTTON
// ==========================================
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==========================================
// PORTFOLIO FILTER
// ==========================================
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hide');
                item.style.display = 'block';
            } else {
                item.classList.add('hide');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ==========================================
// ANIMATED COUNTER
// ==========================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// ==========================================
// INTERSECTION OBSERVER
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate counters
            if (entry.target.classList.contains('stat-number')) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
            }
        }
    });
}, observerOptions);

// ==========================================
// ADD ANIMATIONS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    // Slide animations
    const slideLeftElements = document.querySelectorAll('.about-text, .contact-info');
    slideLeftElements.forEach(el => {
        el.classList.add('slide-left');
        observer.observe(el);
    });
    
    const slideRightElements = document.querySelectorAll('.about-stats, .contact-form');
    slideRightElements.forEach(el => {
        el.classList.add('slide-right');
        observer.observe(el);
    });
    
    // Observe stat numbers
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
    
    // Service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Portfolio items
    const portfolioCards = document.querySelectorAll('.portfolio-item');
    portfolioCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Skill items
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
        observer.observe(item);
    });
});

// ==========================================
// EMAILJS INITIALIZATION
// ==========================================
// Replace these with your actual EmailJS service ID, template ID, and public key
const SERVICE_ID = 'your_service_id';
const TEMPLATE_ID = 'your_template_id';
const PUBLIC_KEY = 'your_public_key';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

// ==========================================
// CONTACT FORM
// ==========================================
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Prepare template parameters
    const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
        to_name: 'Althaaf' // Replace with your name
    };

    // Send email using EmailJS
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then((response) => {
            console.log('Email sent successfully!', response.status, response.text);
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        })
        .catch((error) => {
            console.error('Failed to send email:', error);
            showNotification('Failed to send message. Please try again later.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
});

// ==========================================
// EMAIL VALIDATION
// ==========================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================
// MODERN NOTIFICATION (SweetAlert2)
// ==========================================
function showNotification(message, type = 'info') {
    let icon = 'info';
    let title = 'Notification';

    if (type === 'success') {
        icon = 'success';
        title = 'Success';
    } else if (type === 'error') {
        icon = 'error';
        title = 'Error';
    } else if (type === 'warning') {
        icon = 'warning';
        title = 'Warning';
    }

    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        background: '#1a1b4b',
        color: '#fff',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        backdrop: `
            rgba(0,0,0,0.4)
            url("https://i.gifer.com/ZZ5H.gif")
            left top
            no-repeat
        `,
    });
}

// ==========================================
// TYPING ANIMATION
// ==========================================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation
const heroTitle = document.querySelector('.hero-title .highlight-text');
if (heroTitle) {
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    typeWriter(heroTitle, 'Althaaf Basysyar', 150);
                }, 1000);
                titleObserver.unobserve(entry.target);
            }
        });
    });
    
    titleObserver.observe(heroTitle);
}

// ==========================================
// RIPPLE EFFECT
// ==========================================
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// Apply ripple effect
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn, .filter-btn, .back-to-top');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

// ==========================================
// THROTTLE FUNCTION
// ==========================================
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// KEYBOARD NAVIGATION
// ==========================================
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Enter key on theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (e.key === 'Enter' && e.target === themeToggle) {
        themeManager.toggleTheme();
    }
});

// ==========================================
// ACCESSIBILITY IMPROVEMENTS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add aria-labels
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
    backToTop.setAttribute('aria-label', 'Back to top');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');
    
    // Update aria-expanded
    hamburger.addEventListener('click', () => {
        const isExpanded = navMenu.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded.toString());
    });
});

// ==========================================
// ERROR HANDLING FOR IMAGES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn(`Failed to load image: ${img.src}`);
        });
    });
});

// ==========================================
// SMOOTH SCROLL BEHAVIOR
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==========================================
// PREVENT FORM RESUBMISSION
// ==========================================
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// ==========================================
// LAZY LOADING IMAGES
// ==========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================
// Reduce animations on low-end devices
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
    document.documentElement.style.setProperty('scroll-behavior', 'auto');
}

// ==========================================
// CONSOLE WELCOME MESSAGE
// ==========================================
console.log(`
%c🌌 Galaxy Portfolio Website%c
✨ Features: Galaxy Animation, Dark/Light Mode, Responsive Design
🚀 Built with: HTML5, CSS3, Vanilla JavaScript
💫 Theme: ${themeManager ? themeManager.getTheme() : 'Loading...'}
`, 
'color: #667eea; font-size: 20px; font-weight: bold;',
'color: #666; font-size: 14px;'
);

// ==========================================
// THEME CHANGE EVENT LISTENER
// ==========================================
window.addEventListener('themeChanged', (e) => {
    console.log(`%cTheme changed to: ${e.detail.theme}`, 'color: #667eea; font-weight: bold;');
});

// ==========================================
// PAGE VISIBILITY API
// ==========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden
        console.log('Page is hidden');
    } else {
        // Page is visible
        console.log('Page is visible');
    }
});

// ==========================================
// ONLINE/OFFLINE STATUS
// ==========================================
window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may not work.', 'error');
});

// ==========================================
// PREVENT RIGHT CLICK (OPTIONAL)
// ==========================================
// Uncomment to enable
// document.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
//     showNotification('Right click is disabled', 'info');
// });

// ==========================================
// COPY TO CLIPBOARD FUNCTION
// ==========================================
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy to clipboard', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy to clipboard', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Add copy functionality to contact details
document.addEventListener('DOMContentLoaded', () => {
    const contactDetails = document.querySelectorAll('.contact-details p');
    contactDetails.forEach(detail => {
        detail.style.cursor = 'pointer';
        detail.setAttribute('title', 'Click to copy');
        detail.addEventListener('click', () => {
            copyToClipboard(detail.textContent);
        });
    });
});

// ==========================================
// SCROLL PROGRESS INDICATOR (OPTIONAL)
// ==========================================
// Uncomment to enable scroll progress bar
/*
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    z-index: 10000;
    transition: width 0.1s;
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = scrolled + '%';
});
*/

// ==========================================
// SERVICE WORKER (OPTIONAL - FOR PWA)
// ==========================================
// Uncomment to enable service worker
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
*/

// ==========================================
// INITIALIZE ALL FEATURES
// ==========================================
console.log('%c✅ All features initialized successfully!', 'color: #4CAF50; font-weight: bold;');