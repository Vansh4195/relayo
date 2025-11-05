/**
 * RELAYO LANDING PAGE INTERACTIONS
 */

(function() {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * CURSOR GLOW EFFECT
   * Follows mouse cursor with radial gradient
   */
  function initCursorGlow() {
    if (prefersReducedMotion) return;

    let cursorX = 0;
    let cursorY = 0;
    let isMoving = false;
    let timeoutId = null;

    const updateCursorPosition = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;

      // Update CSS custom properties
      document.documentElement.style.setProperty('--cursor-x', `${cursorX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${cursorY}px`);

      // Add active class
      if (!isMoving) {
        document.body.classList.add('cursor-active');
        isMoving = true;
      }

      // Clear existing timeout
      clearTimeout(timeoutId);

      // Remove active class after 2 seconds of no movement
      timeoutId = setTimeout(() => {
        document.body.classList.remove('cursor-active');
        isMoving = false;
      }, 2000);
    };

    // Use throttling for performance
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateCursorPosition(e);
        rafId = null;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
  }

  /**
   * SCROLL REVEAL
   * Fades in sections as they enter viewport
   */
  function initScrollReveal() {
    if (prefersReducedMotion) {
      // Make all sections visible immediately if reduced motion
      const sections = document.querySelectorAll('.section');
      sections.forEach(section => section.classList.add('visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => observer.observe(section));
  }

  /**
   * SMOOTH SCROLL
   * Smooth scrolling for anchor links
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Ignore empty hash or just "#"
        if (!href || href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const offsetTop = target.offsetTop - 80; // Account for sticky nav

          window.scrollTo({
            top: offsetTop,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });

          // Update URL without jumping
          history.pushState(null, '', href);
        }
      });
    });
  }

  /**
   * MAC DOCK HOVER EFFECT
   * Magnifies items near cursor like macOS Dock
   */
  function initDockHover() {
    if (prefersReducedMotion) return;

    const dock = document.querySelector('.dock');
    if (!dock) return;

    const items = dock.querySelectorAll('.dock__item');
    if (!items.length) return;

    const baseSize = 1; // Base scale
    const maxSize = 2.0; // Maximum scale
    const range = 120; // Distance in pixels for effect falloff

    const updateDockItems = (mouseX) => {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(mouseX - itemCenter);

        // Calculate scale based on distance
        let scale = baseSize;

        if (distance < range) {
          const proximity = 1 - (distance / range);
          scale = baseSize + (proximity * (maxSize - baseSize));
        }

        item.style.transform = `scale(${scale})`;
        item.style.zIndex = Math.floor(scale * 10);
      });
    };

    const resetDockItems = () => {
      items.forEach(item => {
        item.style.transform = `scale(${baseSize})`;
        item.style.zIndex = '1';
      });
    };

    dock.addEventListener('mousemove', (e) => {
      updateDockItems(e.clientX);
    });

    dock.addEventListener('mouseleave', resetDockItems);
  }

  /**
   * INDUSTRY PILLS INTERACTION
   * Highlight active industry pill
   */
  function initIndustryPills() {
    const pills = document.querySelectorAll('.pill');

    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all pills
        pills.forEach(p => p.classList.remove('active'));

        // Add active class to clicked pill
        pill.classList.add('active');
      });
    });

    // Set "All" as active by default
    const firstPill = document.querySelector('.pill');
    if (firstPill) {
      firstPill.classList.add('active');
    }
  }

  /**
   * LAZY LOADING IMAGES
   * Load images as they enter viewport
   */
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    // Fallback for browsers that don't support native lazy loading
    if ('loading' in HTMLImageElement.prototype) {
      return; // Browser supports native lazy loading
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * MOBILE MENU TOGGLE
   * Handle mobile navigation (if needed)
   */
  function initMobileMenu() {
    // This is a placeholder for mobile menu functionality
    // Implement if you add a hamburger menu for mobile
    const menuButton = document.querySelector('[data-mobile-menu-button]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!menuButton || !menu) return;

    menuButton.addEventListener('click', () => {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('open');
    });
  }

  /**
   * FOOTER LETTER HOVER EFFECT
   * Split footer brand backdrop into individual letters for per-letter zoom effect
   * with proximity-based lift (macOS dock style)
   */
  function initFooterLetterHover() {
    if (prefersReducedMotion) return;

    const footerBrand = document.querySelector('.footer-brand-backdrop');

    if (!footerBrand) return;

    // Skip if already processed
    if (footerBrand.dataset.lettersProcessed) return;

    // Get the text content
    const text = footerBrand.textContent.trim();

    // Clear the element
    footerBrand.textContent = '';

    // Split into letters and wrap each in a span
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'footer-brand-letter';
      span.textContent = char;
      footerBrand.appendChild(span);
    });

    // Mark as processed
    footerBrand.dataset.lettersProcessed = 'true';

    // Get all letters
    const letters = footerBrand.querySelectorAll('.footer-brand-letter');
    if (!letters.length) return;

    // Proximity-based hover effect
    const maxLift = 60; // Maximum lift in pixels
    const maxScale = 1.15; // Maximum scale
    const range = 250; // Distance in pixels for effect falloff

    const updateLetters = (mouseX, mouseY) => {
      letters.forEach(letter => {
        const rect = letter.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2;
        const letterCenterY = rect.top + rect.height / 2;
        
        // Calculate distance from cursor to letter center
        const distanceX = mouseX - letterCenterX;
        const distanceY = mouseY - letterCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < range) {
          // Calculate proximity (1 = closest, 0 = farthest)
          const proximity = 1 - (distance / range);
          
          // Apply easing for smoother effect
          const easedProximity = proximity * proximity;
          
          // Calculate lift and scale
          const lift = easedProximity * maxLift;
          const scale = 1 + (easedProximity * (maxScale - 1));
          
          // Calculate letter spacing expansion
          const spacing = easedProximity * 0.15; // Adds spacing when lifted
          
          // Calculate shadow intensity based on proximity
          const shadowBlur = easedProximity * 30;
          const shadowSpread = easedProximity * 15;
          const glowIntensity = easedProximity * 0.8;
          
          letter.style.transform = `translateY(-${lift}px) scale(${scale})`;
          letter.style.letterSpacing = `${spacing}em`;
          letter.style.zIndex = Math.floor(easedProximity * 100);
          
          // Add blue glow outline/shadow effect
          letter.style.textShadow = `
            0 0 ${shadowBlur}px rgba(96, 165, 250, ${glowIntensity}),
            0 0 ${shadowSpread}px rgba(37, 99, 235, ${glowIntensity * 0.8}),
            0 4px ${shadowBlur * 1.5}px rgba(37, 99, 235, ${glowIntensity * 0.5})
          `;
          letter.style.filter = `drop-shadow(0 0 ${shadowBlur * 0.5}px rgba(96, 165, 250, ${glowIntensity * 0.6}))`;
          
          // Show glow based on proximity
          const glowOpacity = easedProximity;
          letter.querySelector('::before') || (letter.style.setProperty('--glow-opacity', glowOpacity));
          
          // Set CSS variable for glow
          if (easedProximity > 0.1) {
            letter.style.setProperty('--glow-opacity', glowOpacity);
            // Manually set the before pseudo-element opacity via inline style hack
            const beforeStyle = window.getComputedStyle(letter, '::before');
            letter.setAttribute('data-glow', glowOpacity);
          } else {
            letter.style.removeProperty('--glow-opacity');
            letter.removeAttribute('data-glow');
          }
        } else {
          // Reset to default
          letter.style.transform = 'translateY(0) scale(1)';
          letter.style.letterSpacing = '0em';
          letter.style.zIndex = '1';
          letter.style.textShadow = '0 0 0 transparent';
          letter.style.filter = 'none';
          letter.style.removeProperty('--glow-opacity');
          letter.removeAttribute('data-glow');
        }
      });
    };

    const resetLetters = () => {
      letters.forEach(letter => {
        letter.style.transform = 'translateY(0) scale(1)';
        letter.style.letterSpacing = '0em';
        letter.style.zIndex = '1';
        letter.style.textShadow = '0 0 0 transparent';
        letter.style.filter = 'none';
        letter.style.removeProperty('--glow-opacity');
        letter.removeAttribute('data-glow');
      });
    };

    // Use throttling for performance
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateLetters(e.clientX, e.clientY);
        rafId = null;
      });
    };

    footerBrand.addEventListener('mousemove', handleMouseMove);
    footerBrand.addEventListener('mouseleave', resetLetters);
  }

  /**
   * FLOATING HEADER APPEAR ON SCROLL
   * Show/hide floating header based on scroll position (> 40px)
   */
  function initFloatingHeader() {
    const updateHeaderVisibility = () => {
      if (window.scrollY > 40) {
        document.body.classList.add('is-stuck');
      } else {
        document.body.classList.remove('is-stuck');
      }
    };

    // Check on load
    updateHeaderVisibility();

    // Check on scroll with throttling for performance
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateHeaderVisibility();
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * RELAYO WALKTHROUGH (Podium-style)
   * Auto-advancing accordion with progress bars
   */
  function initWalkthrough() {
    const walkthroughSection = document.getElementById('relayo-walkthrough');
    if (!walkthroughSection) return;

    const AUTO_STEP_MS = 12000; // 12 seconds per item
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const items = Array.from(walkthroughSection.querySelectorAll('.walkthrough-item'));
    const visualSteps = Array.from(walkthroughSection.querySelectorAll('.walkthrough-visual__step'));
    
    let currentIndex = 0;
    let progressInterval = null;
    let progressStartTime = 0;

    // Initialize first item as active
    function activateItem(index) {
      // Remove active class from all items
      items.forEach((item, i) => {
        if (i === index) {
          item.classList.add('active');
          const header = item.querySelector('.walkthrough-item__header');
          const content = item.querySelector('.walkthrough-item__content');
          if (header) header.setAttribute('aria-expanded', 'true');
          if (content) content.style.display = 'block';
        } else {
          item.classList.remove('active');
          const header = item.querySelector('.walkthrough-item__header');
          const content = item.querySelector('.walkthrough-item__content');
          if (header) header.setAttribute('aria-expanded', 'false');
          if (content) content.style.display = 'none';
        }
      });

      // Update visual step
      visualSteps.forEach((step, i) => {
        if (i === index) {
          // Show step with fade-in
          step.style.display = 'block';
          // Force reflow for animation
          step.offsetHeight;
          step.style.opacity = '1';
          step.style.transform = 'translateX(0)';
        } else {
          // Hide step with fade-out
          step.style.opacity = '0';
          step.style.transform = 'translateX(-10px)';
          // Hide after transition completes
          setTimeout(() => {
            if (step.style.opacity === '0') {
              step.style.display = 'none';
            }
          }, 240);
        }
      });

      currentIndex = index;
      
      // Reset progress immediately
      updateProgress(0);
      
      // Start progress animation immediately if not reduced motion
      if (!prefersReducedMotion) {
        startProgress();
      }
    }

    function updateProgress(percentage) {
      const activeItem = items[currentIndex];
      if (!activeItem) return;
      
      const progressBar = activeItem.querySelector('.progress__bar');
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
    }

    function startProgress() {
      // Cancel any existing animation frame
      if (progressInterval) {
        cancelAnimationFrame(progressInterval);
      }

      // Reset elapsed time to start fresh
      progressStartTime = Date.now();

      // Use requestAnimationFrame for smooth, refresh-rate-independent animation
      function animateProgress() {
        const elapsed = Date.now() - progressStartTime;
        const percentage = Math.min((elapsed / AUTO_STEP_MS) * 100, 100);

        updateProgress(percentage);

        if (percentage >= 100) {
          // Immediately advance to next - no delay
          advanceToNext();
        } else {
          // Continue animation loop synced to monitor refresh rate
          progressInterval = requestAnimationFrame(animateProgress);
        }
      }

      // Start animation
      progressInterval = requestAnimationFrame(animateProgress);
    }

    function advanceToNext() {
      const nextIndex = (currentIndex + 1) % items.length;
      // Immediately activate next item - no delay
      activateItem(nextIndex);
    }

    // Manual click handlers - just switch items, progress continues automatically
    items.forEach((item, index) => {
      const header = item.querySelector('.walkthrough-item__header');
      if (!header) return;
      
      header.addEventListener('click', () => {
        if (index === currentIndex && item.classList.contains('active')) {
          // Already active, do nothing
          return;
        }
        // Immediately switch to clicked item - progress will restart automatically
        activateItem(index);
      });
    });

    // Keyboard navigation - just switch items, progress continues automatically
    walkthroughSection.addEventListener('keydown', (e) => {
      if (e.target.tagName !== 'BUTTON' || !e.target.closest('.walkthrough-item__header')) {
        return;
      }

      const currentItem = e.target.closest('.walkthrough-item');
      const currentItemIndex = items.indexOf(currentItem);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentItemIndex + 1) % items.length;
        items[nextIndex].querySelector('.walkthrough-item__header').focus();
        activateItem(nextIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentItemIndex - 1 + items.length) % items.length;
        items[prevIndex].querySelector('.walkthrough-item__header').focus();
        activateItem(prevIndex);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateItem(currentItemIndex);
      }
    });

    // Initialize first item
    activateItem(0);
    
    // Start auto-advance if not reduced motion (will be handled by activateItem)
    // No need to call startProgress() here as activateItem will handle it
  }

  /**
   * INDUSTRY-SPECIFIC CONTENT
   * Dynamic content switching based on industry selection
   */
  function initIndustryContent() {
    // Industry-specific content
    const industryContent = {
      'all': {
        headline: 'AI that <em class="text-italic">books</em> jobs and <em class="text-italic">makes</em> you money.',
        subheadline: 'An AI Employee that puts in the work 24/7, capturing leads instantly and converting conversations into revenue—on autopilot.',
        walkthrough: {
          titles: [
            'Capture every inquiry.',
            'Convert in under a minute.',
            'Bring customers back automatically.',
            'Get found & chosen online.'
          ],
          descriptions: [
            'See calls, texts, chat, and web forms in one inbox—nothing slips through the cracks.',
            'Instant replies with smart qualification and booking built in—typically in <60 seconds.',
            'Friendly follow-ups and win-backs run on autopilot to keep your calendar full.',
            'Request reviews at the right moments and reply fast to rank higher and win trust.'
          ]
        }
      },
      'auto': {
        headline: 'AI that <em class="text-italic">drives</em> more revenue for your dealership.',
        subheadline: 'Turn every call, text, and web inquiry into test drives and service appointments. Your AI Employee qualifies leads, books appointments, and follows up—so you sell more cars and keep service bays full.',
        walkthrough: {
          titles: [
            'Capture and convert more leads.',
            'Turn inquiries into appointments.',
            'Keep service bays full.',
            'Become the dealership they choose.'
          ],
          descriptions: [
            'Instantly handle calls, chats, texts, and emails to qualify leads, recommend inventory, and schedule test drives—so no opportunity falls through the cracks.',
            'Voice AI answers every call, qualifies interest, and books test drives or service appointments directly into your calendar in under a minute.',
            'Automated reminders for maintenance, service appointments, and follow-ups reduce no-shows and maximize shop efficiency.',
            'Stay top of mind with automated follow-ups for lease expirations, trade-ins, and service milestones to turn customer moments into revenue opportunities.'
          ]
        }
      },
      'wellness': {
        headline: 'AI that <em class="text-italic">fills</em> your schedule and <em class="text-italic">grows</em> your practice.',
        subheadline: 'Convert every inquiry into booked appointments. Your AI Employee handles scheduling, reminders, and follow-ups 24/7—so you focus on delivering exceptional patient care.',
        walkthrough: {
          titles: [
            'Never miss a patient inquiry.',
            'Book appointments instantly.',
            'Reduce no-shows automatically.',
            'Turn patients into advocates.'
          ],
          descriptions: [
            'Capture every call, text, web chat, and form submission in one unified inbox—ensuring no patient inquiry goes unanswered.',
            'AI responds in under 60 seconds to answer questions about treatments, pricing, and availability, then books appointments directly into your calendar.',
            'Automated appointment reminders and easy rescheduling keep your schedule full and reduce costly no-shows.',
            'Request reviews after successful treatments and respond promptly to build your reputation and attract more patients.'
          ]
        }
      },
      'home-services': {
        headline: 'AI that <em class="text-italic">books</em> more jobs and <em class="text-italic">boosts</em> your bottom line.',
        subheadline: 'Turn every inquiry into a booked job. Your AI Employee answers calls, qualifies leads, and schedules appointments 24/7—so you never miss a revenue opportunity.',
        walkthrough: {
          titles: [
            'Answer every call, every time.',
            'Book jobs in seconds.',
            'Keep your calendar full.',
            'Build a 5-star reputation.'
          ],
          descriptions: [
            'Capture calls, texts, chats, and web forms in one place—ensuring every inquiry gets an immediate response, day or night.',
            'AI qualifies leads, provides estimates, and books appointments directly into your schedule in under a minute—no back-and-forth required.',
            'Automated follow-ups for seasonal maintenance, warranty work, and service reminders keep customers coming back and your calendar packed.',
            'Request reviews after every completed job and respond quickly to build trust, rank higher in local search, and win more business.'
          ]
        }
      },
      'dental': {
        headline: 'AI that <em class="text-italic">fills</em> chairs and <em class="text-italic">grows</em> your practice.',
        subheadline: 'Convert every patient inquiry into booked appointments. Your AI Employee handles calls, schedules appointments, and sends reminders—so you focus on providing excellent dental care.',
        walkthrough: {
          titles: [
            'Capture every patient inquiry.',
            'Schedule appointments instantly.',
            'Reduce cancellations and no-shows.',
            'Grow through patient referrals.'
          ],
          descriptions: [
            'Every call, text, chat, and form submission lands in one inbox—so no patient inquiry is missed, even after hours.',
            'AI answers questions about procedures, insurance, and availability, then books appointments in your schedule in under 60 seconds.',
            'Automated reminders for cleanings, check-ups, and follow-up appointments keep chairs filled and reduce last-minute cancellations.',
            'Request reviews from happy patients and respond quickly to feedback—building your reputation and attracting new patients through referrals.'
          ]
        }
      },
      'retail': {
        headline: 'AI that <em class="text-italic">converts</em> browsers into buyers.',
        subheadline: 'Turn every customer inquiry into a sale. Your AI Employee answers questions, provides product recommendations, and schedules consultations 24/7—driving more traffic and revenue to your store.',
        walkthrough: {
          titles: [
            'Never miss a customer inquiry.',
            'Convert online interest into store visits.',
            'Bring customers back for more.',
            'Build loyalty through reputation.'
          ],
          descriptions: [
            'Capture every call, text, website chat, and social message in one inbox—ensuring customers get instant answers about products, availability, and store hours.',
            'AI responds immediately to product questions, checks inventory, and schedules in-store consultations or pickups—turning browsers into buyers in under a minute.',
            'Automated follow-ups for new arrivals, sales events, and personalized recommendations keep customers engaged and returning to your store.',
            'Request reviews after purchases and respond to feedback quickly—building trust, improving your online reputation, and attracting more shoppers.'
          ]
        }
      }
    };

    // Get industry pills
    const pills = document.querySelectorAll('.pills--top .pill');
    const heroHeadline = document.getElementById('hero-headline');
    const heroSubheadline = document.getElementById('hero-subheadline');
    
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all pills
        pills.forEach(p => p.classList.remove('active'));
        
        // Add active to clicked pill
        pill.classList.add('active');
        
        // Get industry
        const industry = pill.dataset.industry;
        const content = industryContent[industry];
        
        if (content) {
          // Update hero content with fade effect
          heroHeadline.style.opacity = '0';
          heroSubheadline.style.opacity = '0';
          
          setTimeout(() => {
            heroHeadline.innerHTML = content.headline;
            heroSubheadline.textContent = content.subheadline;
            heroHeadline.style.opacity = '1';
            heroSubheadline.style.opacity = '1';
          }, 200);
          
          // Update walkthrough content
          content.walkthrough.titles.forEach((title, index) => {
            const titleEl = document.querySelector(`[data-walkthrough-title="${index}"]`);
            const descEl = document.querySelector(`[data-walkthrough-desc="${index}"]`);
            
            if (titleEl && descEl) {
              setTimeout(() => {
                titleEl.textContent = title;
                descEl.innerHTML = content.walkthrough.descriptions[index];
              }, 200);
            }
          });
        }
      });
    });
  }

  /**
   * REVEAL SECTIONS SCROLL TRACKING
   * reveal: Smooth page-overlay transition with blur/fade (Conduit AI style)
   */
  function initRevealSections() {
    // reveal: Check for reduced motion preference
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // Skip animations if user prefers reduced motion

    const sections = document.querySelectorAll('[data-reveal]');
    if (!sections.length) return;

    // reveal: Track each section's progress (0→1 as it gets covered)
    const sectionProgress = new Map();
    sections.forEach(section => sectionProgress.set(section, 0));

    // reveal: Update CSS custom property for each section
    const updateSectionProgress = (section, progress) => {
      const clampedProgress = Math.max(0, Math.min(1, progress));
      section.style.setProperty('--reveal', clampedProgress);
      sectionProgress.set(section, clampedProgress);
    };

    // reveal: Calculate progress based on viewport position
    const calculateProgress = (section, nextSection) => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // reveal: Progress from 0 when section enters top to 1 when fully covered
      // Start calculating when section's top hits viewport top
      if (rect.top > 0) return 0; // Section hasn't reached top yet
      if (rect.bottom < viewportHeight * 0.2) return 1; // Section mostly scrolled past

      // reveal: Calculate how much the section has been scrolled past the top
      const distanceFromTop = Math.abs(rect.top);
      const sectionHeight = rect.height;

      // reveal: Progress based on how far through the section we've scrolled
      const progress = distanceFromTop / (sectionHeight * 0.8); // Use 80% of height for smoother transition
      return progress;
    };

    // reveal: Main scroll handler (throttled with rAF)
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        sections.forEach((section, index) => {
          const nextSection = sections[index + 1];

          // reveal: Calculate and update progress for current section
          const progress = calculateProgress(section, nextSection);
          updateSectionProgress(section, progress);

          // reveal: Mark next section for incoming animation
          if (nextSection) {
            if (progress > 0.1) {
              nextSection.setAttribute('data-reveal-next', '');
              updateSectionProgress(nextSection, progress);
            } else {
              nextSection.removeAttribute('data-reveal-next');
            }
          }
        });

        rafId = null;
      });
    };

    // reveal: Use IntersectionObserver to detect when sections enter/leave viewport
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // reveal: Section is in viewport, start tracking scroll
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll(); // Update immediately
        }
      });
    }, observerOptions);

    // reveal: Observe all sections
    sections.forEach(section => observer.observe(section));

    // reveal: Initial calculation on load
    handleScroll();

    // reveal: Cleanup function (optional, for SPA usage)
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }

  /**
   * STICKY OVERLAPPING SECTIONS (Conduit AI style)
   * Creates the "eating up" effect where sections slide over each other
   */
  function initStickyOverlap() {
    // Check for reduced motion preference
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // Skip animations if user prefers reduced motion

    const targetSections = ['relayo-walkthrough', 'ai-solution', 'customer-journey'];
    const sections = targetSections.map(id => document.getElementById(id)).filter(Boolean);
    
    if (!sections.length) return;

    // Update progress for a section based on scroll position
    const updateSectionProgress = (section, progress) => {
      section.style.setProperty('--overlap-progress', progress);
    };

    // Calculate scroll progress
    const calculateProgress = (section, nextSection) => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Progress from 0 when section enters top to 1 when fully covered
      if (rect.top > 0) return 0; // Section hasn't reached top yet
      if (rect.bottom < viewportHeight * 0.2) return 1; // Section mostly scrolled past

      const distanceFromTop = Math.abs(rect.top);
      const sectionHeight = rect.height;
      const progress = distanceFromTop / (sectionHeight * 0.8); // Use 80% of height for smoother transition
      return progress;
    };

    // Main scroll handler (throttled with rAF)
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        sections.forEach((section, index) => {
          const nextSection = sections[index + 1];

          // Calculate and update progress for current section
          const progress = calculateProgress(section, nextSection);
          updateSectionProgress(section, progress);

          // Mark next section for incoming animation
          if (nextSection) {
            if (progress > 0.1) {
              nextSection.setAttribute('data-overlap-next', '');
              updateSectionProgress(nextSection, progress);
            } else {
              nextSection.removeAttribute('data-overlap-next');
            }
          }
        });

        rafId = null;
      });
    };

    // Use IntersectionObserver to detect when sections enter/leave viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          handleScroll();
        }
      });
    }, {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      rootMargin: '-10% 0px -10% 0px'
    });

    sections.forEach(section => observer.observe(section));

    // Initial call to set correct progress
    handleScroll();

    // Listen for scroll events with throttling
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * INITIALIZE ALL
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all features
    initCursorGlow();
    initScrollReveal();
    initSmoothScroll();
    initFloatingHeader();
    initDockHover();
    // initIndustryPills(); // Removed - handled by initIndustryContent()
    initLazyLoading();
    initMobileMenu();
    initFooterLetterHover();
    initWalkthrough();
    initRevealSections(); // reveal: Initialize Conduit AI-style scroll transitions
    // initStickyOverlap(); // Initialize sticky overlapping sections - DISABLED (was causing scroll issues)
    // initIndustryContent(); // Disabled - using separate pages instead

    // Add loaded class to body
    document.body.classList.add('loaded');
  }

  // Start initialization
  init();

  /**
   * PERFORMANCE OPTIMIZATION
   * Log performance metrics in development
   */
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`⚡ Page loaded in ${loadTime}ms`);
      }
    });
  }

})();
