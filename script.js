(function() {
    'use strict';

    window.__app = window.__app || {};

    const REGEX = {
        email: /^[^s@]+@[^s@]+.[^s@]+$/,
        phone: /^[ds+-()]{10,20}$/,
        name: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
        message: /^.{10,}$/
    };

    const VALIDATION_MESSAGES = {
        required: 'Dit veld is verplicht',
        email: 'Voer een geldig e-mailadres in',
        phone: 'Voer een geldig telefoonnummer in (10-20 tekens)',
        name: 'Naam mag alleen letters, spaties en koppeltekens bevatten (2-50 tekens)',
        message: 'Bericht moet minimaal 10 tekens bevatten',
        privacy: 'U moet akkoord gaan met het privacybeleid'
    };

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => { inThrottle = false; }, limit);
            }
        };
    }

    function sanitizeInput(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    class BurgerMenuModule {
        constructor() {
            if (window.__app.burgerInit) return;
            window.__app.burgerInit = true;

            this.nav = document.querySelector('.navbar');
            this.toggle = document.querySelector('.navbar-toggler');
            this.collapse = document.querySelector('.navbar-collapse');
            this.links = document.querySelectorAll('.nav-link');
            this.body = document.body;
            this.isOpen = false;

            if (!this.nav || !this.toggle || !this.collapse) return;

            this.init();
        }

        init() {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.nav.contains(e.target)) {
                    this.close();
                }
            });

            this.links.forEach(link => {
                link.addEventListener('click', () => this.close());
            });

            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth >= 768 && this.isOpen) {
                    this.close();
                }
            }, 100));
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.collapse.classList.add('show');
            this.toggle.setAttribute('aria-expanded', 'true');
            this.body.style.overflow = 'hidden';
            
            if (window.innerWidth < 768) {
                this.collapse.style.height = `calc(100vh - var(--header-h))`;
            }
        }

        close() {
            this.isOpen = false;
            this.collapse.classList.remove('show');
            this.toggle.setAttribute('aria-expanded', 'false');
            this.body.style.overflow = '';
            this.collapse.style.height = '';
        }
    }

    class ScrollEffectsModule {
        constructor() {
            if (window.__app.scrollEffectsInit) return;
            window.__app.scrollEffectsInit = true;

            this.observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            this.init();
        }

        init() {
            this.setupImageAnimations();
            this.setupCardAnimations();
            this.setupCountUpAnimations();
            this.setupScrollSpy();
            this.setupScrollToTop();
        }

        setupImageAnimations() {
            const images = document.querySelectorAll('img:not(.c-logo__img)');
            
            images.forEach(img => {
                img.style.opacity = '0';
                img.style.transform = 'translateY(30px)';
                img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            });

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        imageObserver.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            images.forEach(img => imageObserver.observe(img));
        }

        setupCardAnimations() {
            const cards = document.querySelectorAll('.c-card, .card');
            
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px) scale(0.95)';
                card.style.transition = 'all 0.6s ease-out';
                card.style.transitionDelay = `${index * 0.1}s`;
            });

            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                        cardObserver.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            cards.forEach(card => cardObserver.observe(card));
        }

        setupCountUpAnimations() {
            const counters = document.querySelectorAll('[data-count]');
            
            const animateCount = (element) => {
                const target = parseInt(element.getAttribute('data-count'));
                const duration = 2000;
                const start = 0;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const current = Math.floor(progress * target);
                    
                    element.textContent = current.toLocaleString('nl-NL');
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        element.textContent = target.toLocaleString('nl-NL');
                    }
                };

                requestAnimationFrame(updateCount);
            };

            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            counters.forEach(counter => counterObserver.observe(counter));
        }

        setupScrollSpy() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

            if (sections.length === 0 || navLinks.length === 0) return;

            const spyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                                link.setAttribute('aria-current', 'page');
                            } else {
                                link.removeAttribute('aria-current');
                            }
                        });
                    }
                });
            }, {
                threshold: 0.5,
                rootMargin: '-20% 0px -35% 0px'
            });

            sections.forEach(section => spyObserver.observe(section));
        }

        setupScrollToTop() {
            let scrollBtn = document.querySelector('[data-scroll-top]');
            
            if (!scrollBtn) {
                scrollBtn = document.createElement('button');
                scrollBtn.setAttribute('data-scroll-top', '');
                scrollBtn.className = 'c-button c-button--primary';
                scrollBtn.style.cssText = 'position:fixed;bottom:2rem;right:2rem;width:48px;height:48px;border-radius:50%;z-index:999;opacity:0;visibility:hidden;transition:all 0.3s ease-out;padding:0;';
                scrollBtn.innerHTML = '↑';
                scrollBtn.setAttribute('aria-label', 'Scroll naar boven');
                document.body.appendChild(scrollBtn);
            }

            const toggleScrollBtn = throttle(() => {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.opacity = '1';
                    scrollBtn.style.visibility = 'visible';
                } else {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                }
            }, 100);

            window.addEventListener('scroll', toggleScrollBtn);

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    class MicroInteractionsModule {
        constructor() {
            if (window.__app.microInteractionsInit) return;
            window.__app.microInteractionsInit = true;

            this.init();
        }

        init() {
            this.setupButtonEffects();
            this.setupRippleEffect();
            this.setupLinkEffects();
        }

        setupButtonEffects() {
            const buttons = document.querySelectorAll('.c-button, .btn');

            buttons.forEach(btn => {
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';

                btn.addEventListener('mouseenter', (e) => {
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = 'var(--shadow-lg)';
                });

                btn.addEventListener('mouseleave', (e) => {
                    e.target.style.transform = '';
                    e.target.style.boxShadow = '';
                });
            });
        }

        setupRippleEffect() {
            const elements = document.querySelectorAll('.c-button, .nav-link, .card');

            elements.forEach(el => {
                el.addEventListener('click', function(e) {
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;

                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.6);
                        left: ${x}px;
                        top: ${y}px;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                    `;

                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);

                    setTimeout(() => ripple.remove(), 600);
                });
            });

            if (!document.querySelector('#ripple-animation-style')) {
                const style = document.createElement('style');
                style.id = 'ripple-animation-style';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        setupLinkEffects() {
            const links = document.querySelectorAll('a:not(.c-button)');

            links.forEach(link => {
                link.addEventListener('mouseenter', (e) => {
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    e.target.style.transition = 'all 0.2s ease-out';
                });
            });
        }
    }

    class FormValidationModule {
        constructor() {
            if (window.__app.formValidationInit) return;
            window.__app.formValidationInit = true;

            this.forms = document.querySelectorAll('form');
            this.notificationContainer = null;

            this.init();
        }

        init() {
            this.createNotificationContainer();
            this.setupForms();
        }

        createNotificationContainer() {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.className = 'position-fixed top-0 end-0 p-3';
            this.notificationContainer.style.zIndex = '9999';
            document.body.appendChild(this.notificationContainer);
        }

        notify(message, type = 'info') {
            const alertClass = type === 'error' ? 'alert-danger' : type === 'success' ? 'alert-success' : 'alert-info';
            
            const alert = document.createElement('div');
            alert.className = `alert ${alertClass} alert-dismissible fade show`;
            alert.style.cssText = 'min-width:300px;box-shadow:var(--shadow-lg);animation:slideInRight 0.3s ease-out;';
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" aria-label="Sluiten"></button>
            `;

            const closeBtn = alert.querySelector('.btn-close');
            closeBtn.addEventListener('click', () => this.removeNotification(alert));

            this.notificationContainer.appendChild(alert);

            setTimeout(() => this.removeNotification(alert), 5000);

            if (!document.querySelector('#notification-animation-style')) {
                const style = document.createElement('style');
                style.id = 'notification-animation-style';
                style.textContent = `
                    @keyframes slideInRight {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOutRight {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        removeNotification(alert) {
            if (!alert.parentNode) return;
            alert.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }

        validateField(field) {
            const value = field.value.trim();
            const name = field.name || field.id;
            const type = field.type;
            let isValid = true;
            let message = '';

            this.clearFieldError(field);

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                message = VALIDATION_MESSAGES.required;
            } else if (value) {
                if (type === 'email' || name === 'email') {
                    if (!REGEX.email.test(value)) {
                        isValid = false;
                        message = VALIDATION_MESSAGES.email;
                    }
                } else if (type === 'tel' || name === 'phone') {
                    if (value && !REGEX.phone.test(value)) {
                        isValid = false;
                        message = VALIDATION_MESSAGES.phone;
                    }
                } else if (name === 'firstName' || name === 'lastName') {
                    if (!REGEX.name.test(value)) {
                        isValid = false;
                        message = VALIDATION_MESSAGES.name;
                    }
                } else if (name === 'message' && field.hasAttribute('required')) {
                    if (!REGEX.message.test(value)) {
                        isValid = false;
                        message = VALIDATION_MESSAGES.message;
                    }
                }
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                isValid = false;
                message = VALIDATION_MESSAGES.privacy;
            }

            if (!isValid) {
                this.showFieldError(field, message);
            }

            return isValid;
        }

        showFieldError(field, message) {
            field.classList.add('is-invalid');
            
            let errorDiv = field.parentElement.querySelector('.invalid-feedback');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.style.display = 'block';
                field.parentElement.appendChild(errorDiv);
            }
            
            errorDiv.textContent = message;
            errorDiv.style.animation = 'shake 0.3s ease-out';

            if (!document.querySelector('#shake-animation-style')) {
                const style = document.createElement('style');
                style.id = 'shake-animation-style';
                style.textContent = `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        clearFieldError(field) {
            field.classList.remove('is-invalid');
            const errorDiv = field.parentElement.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        }

        setupForms() {
            this.forms.forEach(form => {
                const fields = form.querySelectorAll('input, select, textarea');
                
                fields.forEach(field => {
                    field.addEventListener('blur', () => {
                        if (field.value.trim() || field.hasAttribute('required')) {
                            this.validateField(field);
                        }
                    });

                    field.addEventListener('input', debounce(() => {
                        if (field.classList.contains('is-invalid')) {
                            this.validateField(field);
                        }
                    }, 300));
                });

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmit(form);
                });
            });
        }

        handleFormSubmit(form) {
            const fields = form.querySelectorAll('input, select, textarea');
            let isValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.notify('Controleer de formuliervelden en probeer opnieuw', 'error');
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const submitBtn = form.querySelector('[type="submit"]');
            if (!submitBtn) return;

            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';

            const formData = new FormData(form);
            const jsonData = {};
            
            for (let pair of formData.entries()) {
                jsonData[pair[0]] = sanitizeInput(pair[1]);
            }

            setTimeout(() => {
                const isSuccess = Math.random() > 0.1;

                if (isSuccess) {
                    this.notify('Uw bericht is succesvol verzonden!', 'success');
                    setTimeout(() => {
                        window.location.href = 'thank_you.html';
                    }, 1000);
                } else {
                    this.notify('Er is een fout opgetreden. Controleer uw internetverbinding en probeer het opnieuw.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }, 1500);
        }
    }

    class SmoothScrollModule {
        constructor() {
            if (window.__app.smoothScrollInit) return;
            window.__app.smoothScrollInit = true;

            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault();
                    const header = document.querySelector('.l-header, header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    class CookieBannerModule {
        constructor() {
            if (window.__app.cookieBannerInit) return;
            window.__app.cookieBannerInit = true;

            this.banner = document.getElementById('cookieBanner');
            if (!this.banner) return;

            this.init();
        }

        init() {
            const accepted = localStorage.getItem('cookiesAccepted');
            
            if (!accepted) {
                setTimeout(() => {
                    this.banner.classList.add('is-visible');
                    this.banner.style.transform = 'translateY(0)';
                }, 1000);
            }

            const acceptBtn = document.getElementById('cookieAccept');
            const declineBtn = document.getElementById('cookieDecline');

            if (acceptBtn) {
                acceptBtn.addEventListener('click', () => {
                    localStorage.setItem('cookiesAccepted', 'true');
                    this.hideBanner();
                });
            }

            if (declineBtn) {
                declineBtn.addEventListener('click', () => {
                    localStorage.setItem('cookiesAccepted', 'false');
                    this.hideBanner();
                });
            }
        }

        hideBanner() {
            this.banner.style.transform = 'translateY(100%)';
            setTimeout(() => {
                this.banner.remove();
            }, 300);
        }
    }

    class ImagesModule {
        constructor() {
            if (window.__app.imagesInit) return;
            window.__app.imagesInit = true;

            this.init();
        }

        init() {
            const images = document.querySelectorAll('img');
            const videos = document.querySelectorAll('video');

            images.forEach(img => {
                if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
                    img.setAttribute('loading', 'lazy');
                }

                img.addEventListener('error', function() {
                    const svgPlaceholder = 'data:image/svg+xml;base64,' + btoa(
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" fill="#e9ecef">' +
                        '<rect width="300" height="200" fill="#e9ecef"/>' +
                        '<text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="sans-serif" font-size="14">Afbeelding niet beschikbaar</text>' +
                        '</svg>'
                    );
                    this.src = svgPlaceholder;
                    this.style.objectFit = 'contain';
                }, { once: true });
            });

            videos.forEach(video => {
                if (!video.hasAttribute('loading')) {
                    video.setAttribute('loading', 'lazy');
                }
            });
        }
    }

    class ModalModule {
        constructor() {
            if (window.__app.modalInit) return;
            window.__app.modalInit = true;

            this.init();
        }

        init() {
            const privacyLinks = document.querySelectorAll('a[href*="privacy"]');
            
            privacyLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === '#privacy' || link.hasAttribute('data-modal')) {
                        e.preventDefault();
                        this.openPrivacyModal();
                    }
                });
            });
        }

        openPrivacyModal() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease-out;
            `;

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.cssText = `
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: var(--shadow-lg);
                animation: slideUp 0.3s ease-out;
            `;

            modalContent.innerHTML = `
                <h2>Privacybeleid</h2>
                <p>Wij respecteren uw privacy en beschermen uw persoonlijke gegevens in overeenstemming met de AVG.</p>
                <p>Voor meer informatie bezoek onze <a href="privacy.html">privacypagina</a>.</p>
                <button class="c-button c-button--primary mt-3">Sluiten</button>
            `;

            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            if (!document.querySelector('#modal-animation-style')) {
                const style = document.createElement('style');
                style.id = 'modal-animation-style';
                style.textContent = `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from {
                            transform: translateY(30px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            const closeModal = () => {
                modal.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => modal.remove(), 300);
            };

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            modalContent.querySelector('button').addEventListener('click', closeModal);
        }
    }

    window.__app.init = function() {
        if (window.__app.initialized) return;
        window.__app.initialized = true;

        new BurgerMenuModule();
        new ScrollEffectsModule();
        new MicroInteractionsModule();
        new FormValidationModule();
        new SmoothScrollModule();
        new CookieBannerModule();
        new ImagesModule();
        new ModalModule();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();
