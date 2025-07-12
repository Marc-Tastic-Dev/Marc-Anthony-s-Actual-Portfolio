/**
 * Terminal Soul Drip Portfolio - Enhanced JavaScript
 * Author: Marc-Anthony
 * A modern, performance-optimized portfolio script with accessibility features
 */

'use strict';

class TerminalSoulDripPortfolio {
    constructor() {
        this.sections = document.querySelectorAll('section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.loader = document.getElementById('page-loader');
        this.currentSection = 'home';
        this.scrollOffset = 60;
        this.debounceTimer = null;
        
        // Performance tracking
        this.perfMetrics = {
            startTime: performance.now(),
            lastScrollTime: 0,
            frameCount: 0
        };
        
        this.init();
    }

    /**
     * Initialize the portfolio functionality
     */
    init() {
        try {
            this.hideLoader();
            this.setupScrollSpy();
            this.setupSmoothScrolling();
            this.setupKeyboardNavigation();
            this.setupLazyLoading();
            this.setupPerformanceMonitoring();
            this.setupTypingAnimation();
            this.logInitialization();
        } catch (error) {
            console.error('Portfolio initialization failed:', error);
            this.handleError(error);
        }
    }

    /**
     * Hide the loading animation
     */
    hideLoader() {
        if (this.loader) {
            // Add a small delay to show the loading animation
            setTimeout(() => {
                this.loader.classList.add('hidden');
                // Remove from DOM after animation completes
                setTimeout(() => {
                    this.loader.remove();
                }, 500);
            }, 1000);
        }
    }

    /**
     * Setup intelligent scroll spy with debouncing
     */
    setupScrollSpy() {
        const scrollHandler = () => {
            this.perfMetrics.lastScrollTime = performance.now();
            
            if (this.debounceTimer) {
                cancelAnimationFrame(this.debounceTimer);
            }
            
            this.debounceTimer = requestAnimationFrame(() => {
                this.updateActiveSection();
            });
        };

        // Use passive listener for better performance
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Initial check
        this.updateActiveSection();
    }

    /**
     * Update the active navigation section
     */
    updateActiveSection() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Check if we're at the bottom of the page
        if (scrollY + viewportHeight >= documentHeight - 10) {
            this.setActiveSection('contact');
            return;
        }

        let currentSection = '';
        
        // Find the current section based on scroll position
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - this.scrollOffset;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        if (currentSection && currentSection !== this.currentSection) {
            this.setActiveSection(currentSection);
        }
    }

    /**
     * Set the active navigation section
     */
    setActiveSection(sectionId) {
        this.currentSection = sectionId;
        
        // Update navigation links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        // Update document title for better UX
        const sectionTitles = {
            home: 'Terminal Soul Drip - Portfolio',
            about: 'About - Terminal Soul Drip',
            projects: 'Projects - Terminal Soul Drip',
            skills: 'Skills - Terminal Soul Drip',
            contact: 'Contact - Terminal Soul Drip'
        };
        
        document.title = sectionTitles[sectionId] || 'Terminal Soul Drip - Portfolio';
    }

    /**
     * Setup smooth scrolling with easing
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    this.smoothScrollToElement(targetSection);
                    
                    // Update focus for accessibility
                    setTimeout(() => {
                        targetSection.setAttribute('tabindex', '-1');
                        targetSection.focus();
                        targetSection.removeAttribute('tabindex');
                    }, 500);
                }
            });
        });
    }

    /**
     * Smooth scroll to element with custom easing
     */
    smoothScrollToElement(element) {
        const targetPosition = element.offsetTop - this.scrollOffset;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let startTime = null;

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);

            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }

    /**
     * Setup keyboard navigation for accessibility
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Navigate with arrow keys when focused on nav
            if (e.target.classList.contains('nav-link')) {
                const currentIndex = Array.from(this.navLinks).indexOf(e.target);
                let nextIndex;

                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        nextIndex = (currentIndex + 1) % this.navLinks.length;
                        this.navLinks[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        nextIndex = currentIndex === 0 ? this.navLinks.length - 1 : currentIndex - 1;
                        this.navLinks[nextIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.navLinks[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        this.navLinks[this.navLinks.length - 1].focus();
                        break;
                }
            }

            // Quick navigation shortcuts
            if (e.ctrlKey || e.metaKey) {
                const shortcuts = {
                    '1': 'home',
                    '2': 'about',
                    '3': 'projects',
                    '4': 'skills',
                    '5': 'contact'
                };

                if (shortcuts[e.key]) {
                    e.preventDefault();
                    const targetSection = document.getElementById(shortcuts[e.key]);
                    if (targetSection) {
                        this.smoothScrollToElement(targetSection);
                    }
                }
            }
        });
    }

    /**
     * Setup lazy loading for performance
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe sections and cards for animation
            document.querySelectorAll('.section, .project-card, .skill-category').forEach(el => {
                observer.observe(el);
            });
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate
        const measureFPS = () => {
            this.perfMetrics.frameCount++;
            requestAnimationFrame(measureFPS);
        };
        measureFPS();

        // Log performance metrics periodically (in development)
        if (this.isDevelopment()) {
            setInterval(() => {
                const fps = this.perfMetrics.frameCount;
                this.perfMetrics.frameCount = 0;
                
                console.log('Performance Metrics:', {
                    fps: fps,
                    lastScrollTime: this.perfMetrics.lastScrollTime,
                    memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 'N/A'
                });
            }, 5000);
        }
    }

    /**
     * Setup typing animation for terminal elements
     */
    setupTypingAnimation() {
        const typeWriter = (element, text, speed = 50) => {
            let i = 0;
            element.textContent = '';
            
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed + Math.random() * 30); // Add natural variation
                }
            };
            
            type();
        };

        // Animate terminal outputs when they come into view
        if ('IntersectionObserver' in window) {
            const terminalObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const originalText = entry.target.textContent;
                        typeWriter(entry.target, originalText, 30);
                        terminalObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.terminal-output').forEach(el => {
                terminalObserver.observe(el);
            });
        }
    }

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';
    }

    /**
     * Log initialization success
     */
    logInitialization() {
        const initTime = performance.now() - this.perfMetrics.startTime;
        console.log(`🚀 Terminal Soul Drip initialized in ${initTime.toFixed(2)}ms`);
        
        if (this.isDevelopment()) {
            console.log('Available keyboard shortcuts:');
            console.log('• Ctrl/Cmd + 1-5: Quick section navigation');
            console.log('• Arrow keys: Navigate when nav link is focused');
            console.log('• Tab: Keyboard navigation');
        }
    }

    /**
     * Handle initialization errors gracefully
     */
    handleError(error) {
        console.error('Portfolio Error:', error);
        
        // Fallback functionality
        if (this.loader) {
            this.loader.style.display = 'none';
        }
        
        // Basic scroll spy fallback
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 100;
            document.body.classList.toggle('scrolled', scrolled);
        });
    }
}

// Email copy functionality
function copyEmail() {
    const email = 'marcanthonymputela@icloud.com';
    const statusElement = document.getElementById('email-copy-status');
    
    if (navigator.clipboard && window.isSecureContext) {
        // Use the modern Clipboard API
        navigator.clipboard.writeText(email).then(() => {
            showCopySuccess(statusElement);
        }).catch(() => {
            fallbackCopyTextToClipboard(email, statusElement);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(email, statusElement);
    }
}

function fallbackCopyTextToClipboard(text, statusElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(statusElement);
    } catch (err) {
        showCopyError(statusElement);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(statusElement) {
    if (statusElement) {
        statusElement.textContent = 'Email copied to clipboard!';
        statusElement.className = 'copy-success';
        
        // Clear the message after 3 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'sr-only';
        }, 3000);
    }
    
    // Visual feedback on the button
    const button = document.querySelector('.primary-button');
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'copied!';
        button.style.background = 'var(--accent-green)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
}

function showCopyError(statusElement) {
    if (statusElement) {
        statusElement.textContent = 'Failed to copy email. Please copy manually.';
        statusElement.className = 'copy-error';
        
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'sr-only';
        }, 5000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TerminalSoulDripPortfolio();
    });
} else {
    new TerminalSoulDripPortfolio();
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TerminalSoulDripPortfolio, copyEmail };
}