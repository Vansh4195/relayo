// Production-Ready Agents Section JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Feature Cards Animation on Scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
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
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        cardObserver.observe(card);
    });
    
    // Voice AI - Play Button Functionality
    const playBtns = document.querySelectorAll('.play-btn');
    playBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const waveformProgress = this.closest('.call-player').querySelector('.waveform-progress');
            const duration = this.closest('.call-player').querySelector('.duration');
            
            if (this.classList.contains('playing')) {
                this.classList.remove('playing');
                this.innerHTML = `
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <path d="M1 1L11 7L1 13V1Z" fill="#FF6B35"/>
                    </svg>
                `;
            } else {
                this.classList.add('playing');
                this.innerHTML = `
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                        <rect x="2" y="1" width="3" height="12" fill="#FF6B35"/>
                        <rect x="7" y="1" width="3" height="12" fill="#FF6B35"/>
                    </svg>
                `;
                
                // Simulate playback
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 1.67; // 6 seconds = 100%
                    waveformProgress.style.width = progress + '%';
                    duration.textContent = `0:${Math.floor(progress/16.7).toString().padStart(2, '0')} / 0:06`;
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        this.click(); // Reset button
                        waveformProgress.style.width = '0%';
                        duration.textContent = '0:00 / 0:06';
                    }
                }, 100);
            }
        });
    });
    
    // Knowledge Base - Source Badge Interactions
    const sourceBadges = document.querySelectorAll('.source-badge');
    sourceBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            if (!this.classList.contains('dim') && !this.classList.contains('add-source-btn')) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // Add Source Button
    const addSourceBtns = document.querySelectorAll('.add-source-btn');
    addSourceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'rotate(135deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 300);
        });
    });
    
    // Channel Selector Buttons
    const channelBtns = document.querySelectorAll('.channel-btn');
    channelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            channelBtns.forEach(b => {
                b.style.background = '#FFFFFF';
                b.style.borderColor = '#E2E8F0';
                b.style.color = '#475569';
            });
            
            // Add active to clicked
            this.style.background = '#ECFDF5';
            this.style.borderColor = '#6EE7B7';
            this.style.color = '#047857';
        });
    });
    
    // Stress Test Cards - Expand/Collapse
    const testResults = document.querySelectorAll('.test-result');
    testResults.forEach(result => {
        result.addEventListener('click', function() {
            this.classList.toggle('expanded');
            
            const textEls = this.querySelectorAll('.test-text, .eval-text');
            textEls.forEach(el => {
                if (this.classList.contains('expanded')) {
                    el.style.display = 'block';
                    el.style.whiteSpace = 'normal';
                    el.style.overflow = 'visible';
                    el.style.textOverflow = 'unset';
                } else {
                    el.style.display = '-webkit-box';
                    el.style.webkitLineClamp = '2';
                    el.style.webkitBoxOrient = 'vertical';
                    el.style.overflow = 'hidden';
                }
            });
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Parallax effect on scroll
    let ticking = false;
    
    function updateParallax() {
        const scrollY = window.scrollY;
        const cards = document.querySelectorAll('.feature-card');
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;
            
            if (scrollProgress > 0 && scrollProgress < 1) {
                const translateY = (1 - scrollProgress) * 20;
                card.style.transform = `translateY(${translateY}px)`;
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
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial call
    updateParallax();
    
    console.log('Production-Ready Agents section initialized');
});
