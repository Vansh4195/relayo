// Customer Service Section - Scroll Effects
// Sticky "eating" effect with parallax and grid animations

document.addEventListener('DOMContentLoaded', function() {

    // Get all feature sections
    const featureSections = document.querySelectorAll('.cs-feature-section');
    const heroSection = document.querySelector('.cs-hero-section');

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const section = entry.target;
            const ratio = entry.intersectionRatio;

            // Scale effect as section enters
            if (ratio > 0 && ratio < 1) {
                const scale = 0.95 + (ratio * 0.05);
                section.style.transform = `scale(${scale})`;
                section.style.opacity = ratio;
            } else if (ratio >= 1) {
                section.style.transform = 'scale(1)';
                section.style.opacity = '1';
            }
        });
    }, observerOptions);

    // Observe all feature sections
    featureSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Parallax scroll effect
    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;

        // Hero parallax - DISABLED to keep text visible
        // if (heroSection) {
        //     const heroContent = heroSection.querySelector('.cs-hero-content');
        //     if (heroContent) {
        //         const offset = scrollY * 0.5;
        //         heroContent.style.transform = `translateY(${offset}px)`;
        //         heroContent.style.opacity = Math.max(0, 1 - (scrollY / 500));
        //     }
        // }

        // Section parallax and "eating" effect
        featureSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const windowHeight = window.innerHeight;

            // Calculate progress (0 to 1) as section enters viewport
            const progress = Math.max(0, Math.min(1, 1 - (sectionTop / windowHeight)));

            // Apply transform based on progress
            if (sectionTop < windowHeight && sectionTop > -rect.height) {
                // Slight scale and opacity adjustment
                const scale = 0.98 + (progress * 0.02);
                const opacity = 0.8 + (progress * 0.2);

                section.style.transform = `scale(${scale}) translateY(${(1 - progress) * 20}px)`;
                section.style.opacity = opacity;

                // Add shadow based on z-index and progress
                const shadowIntensity = 0.05 + (index * 0.02) + (progress * 0.03);
                section.style.boxShadow = `0 ${4 + index * 2}px ${12 + index * 4}px -${2 + index}px rgba(0, 0, 0, ${shadowIntensity})`;
            }
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // Listen to scroll events
    window.addEventListener('scroll', requestTick, { passive: true });

    // Initial call
    updateParallax();

    // Workflow node hover effects
    const workflowNodes = document.querySelectorAll('.cs-workflow-node');
    workflowNodes.forEach(node => {
        node.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'all 0.2s ease';
        });

        node.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Metric cards animation on scroll
    const metricCards = document.querySelectorAll('.cs-metric-card');
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.2
    });

    metricCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        cardObserver.observe(card);
    });

    // Escalation bars animation
    const escalationBars = document.querySelectorAll('.cs-escalation-bar');
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    const barFill = entry.target.querySelector('.cs-bar-fill');
                    if (barFill) {
                        const targetWidth = barFill.style.width;
                        barFill.style.width = '0';
                        setTimeout(() => {
                            barFill.style.transition = 'width 0.8s ease';
                            barFill.style.width = targetWidth;
                        }, 50);
                    }
                }, index * 150);
            }
        });
    }, {
        threshold: 0.5
    });

    escalationBars.forEach(bar => {
        barObserver.observe(bar);
    });

    // Inbox message animation
    const messageGroups = document.querySelectorAll('.cs-message-group');
    const messageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 200);
            }
        });
    }, {
        threshold: 0.3
    });

    messageGroups.forEach(group => {
        group.style.opacity = '0';
        group.style.transform = 'translateX(-20px)';
        group.style.transition = 'all 0.4s ease';
        messageObserver.observe(group);
    });

    // Grid overlay animation
    const sectionWrappers = document.querySelectorAll('.cs-section-wrapper');
    sectionWrappers.forEach(wrapper => {
        wrapper.addEventListener('mouseenter', function() {
            this.style.backgroundSize = '42px 42px';
            this.style.transition = 'background-size 0.3s ease';
        });

        wrapper.addEventListener('mouseleave', function() {
            this.style.backgroundSize = '40px 40px';
        });
    });

    // Smooth scroll to sections
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    console.log('Customer Service scroll effects initialized');
});
