/**
 * ==============================================================================
 * GLOBAL PATH STUDY ABROAD — MOTION DESIGN SYSTEM (js/motion.js)
 * GSAP 3.12.5 + ScrollTrigger implementation with strict progressive enhancement,
 * 3 gsap.matchMedia() modes (Desktop, Mobile, Reduced Motion), zero layout shift,
 * and joyful light-theme hero choreography.
 * ==============================================================================
 */

(function () {
  'use strict';

  // 1. VERIFY GSAP & SCROLLTRIGGER AVAILABILITY
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('Global Path: GSAP or ScrollTrigger not loaded. Graceful fallback active (all content remains visible).');
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Apply js-motion class to <html> ONLY when GSAP is verified and operational
  document.documentElement.classList.add('js-motion');

  const CONFIG = window.SITE_CONFIG || {};
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDataSaver = navigator.connection && navigator.connection.saveData === true;

  // Wait for fonts & hero photo 1 before triggering intro
  function onReady(fn) {
    if (document.readyState === 'complete') {
      fn();
    } else {
      window.addEventListener('load', fn);
    }
  }

  onReady(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    initMotionSystem();
  });

  function initMotionSystem() {
    const mm = gsap.matchMedia();

    // ---------------------------------------------------------------------------
    // MODE 1: REDUCED MOTION (Strict compliance: zero heavy zoom/parallax/cycle)
    // ---------------------------------------------------------------------------
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(['.word-inner', '#heroEyebrow', '#heroSubtext', '#heroBullets', '#heroCtas', '#heroLeadFormCard', '#heroSceneControls', '#navbar', '#heroMediaWrapper'], {
        opacity: 1,
        y: 0,
        scale: 1,
        clipPath: 'none'
      });

      setupHeroSceneManualControls();
      setupVideoPlayer(true); // poster only
      return () => {};
    });

    // ---------------------------------------------------------------------------
    // MODE 2: MOBILE MOTION (max-width: 767px)
    // ---------------------------------------------------------------------------
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      heroTl
        .from('#navbar', { y: -50, opacity: 0, duration: 0.5 })
        .from('.hero-headline .word-inner', {
          y: '105%',
          opacity: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: 'expo.out'
        }, '-=0.2')
        .from('#heroEyebrow', { opacity: 0, y: 15, duration: 0.4 }, '-=0.4')
        .from('#heroSubtext', { opacity: 0, y: 15, duration: 0.4 }, '-=0.3')
        .from('#heroBullets li', { opacity: 0, x: -10, stagger: 0.08, duration: 0.4 }, '-=0.2')
        .from('#heroCtas', { opacity: 0, y: 15, duration: 0.4 }, '-=0.2')
        .from('#heroMediaWrapper', {
          opacity: 0,
          scale: 0.96,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=0.1')
        .from('#heroLeadFormCard', { opacity: 0, y: 20, duration: 0.5 }, '-=0.2');

      // Auto scene cycle for mobile (5s intervals)
      setupHeroSceneCycle(5000, true);

      // Single fade-in for video on mobile (no pinning)
      const videoWrapper = document.getElementById('videoBandWrapper');
      if (videoWrapper) {
        gsap.from(videoWrapper, {
          scrollTrigger: {
            trigger: videoWrapper,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          scale: 0.94,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      setupVideoPlayer(isDataSaver);
      setupStandardSectionReveals();

      return () => {
        heroTl.kill();
      };
    });

    // ---------------------------------------------------------------------------
    // MODE 3: DESKTOP MOTION (min-width: 768px)
    // ---------------------------------------------------------------------------
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      // 1. HERO "TAKE THE FIRST STEP" CHOREOGRAPHY
      const heroTl = gsap.timeline();

      // Initial states
      gsap.set('.hero-headline .word-inner', { y: '110%' });
      gsap.set(['#heroEyebrow', '#heroSubtext', '#heroBullets', '#heroCtas', '#heroSceneControls'], { opacity: 0, y: 20 });
      gsap.set('#heroLeadFormCard', { opacity: 0, y: 40 });
      gsap.set('#navbar', { opacity: 0, y: -30 });
      gsap.set('#heroMediaWrapper', {
        clipPath: 'inset(10% 10% 10% 10% round 28px)',
        scale: 1.05,
        opacity: 0
      });

      // 0.0s: Gradient line & navbar
      heroTl
        .to('#navbar', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '0.0')

        // 0.4s: Photo 1 scales from 105% to 100% with clip-path reveal
        .to('#heroMediaWrapper', {
          clipPath: 'inset(0% 0% 0% 0% round 28px)',
          scale: 1.0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out'
        }, '0.4')

        // 0.8s: Eyebrow pill appears
        .to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '0.8')

        // 1.0s: Headline words rise from masks (0.8s, expo.out, 0.08s stagger)
        .to('.hero-headline .word-inner', {
          y: '0%',
          duration: 0.8,
          stagger: 0.08,
          ease: 'expo.out'
        }, '1.0')

        // 1.8s: Supporting line and check items fade up
        .to('#heroSubtext', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '1.8')
        .to('#heroBullets', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '2.0')

        // 2.2s: CTAs rise; coral button gets one soft pulse ring
        .to('#heroCtas', {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            const btn = document.getElementById('heroPrimaryCta');
            if (btn) {
              gsap.fromTo(
                btn,
                { boxShadow: '0 0 0 0 rgba(255, 107, 91, 0.6)' },
                { boxShadow: '0 0 0 16px rgba(255, 107, 91, 0)', duration: 1.0, ease: 'power2.out' }
              );
            }
          }
        }, '2.2')

        // 2.6s: Lead form card slides up
        .to('#heroLeadFormCard', {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out'
        }, '2.6')

        // 3.0s: Scene counter, dots and controls appear
        .to('#heroSceneControls', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '3.0');

      // Parallax on hero scroll out (0.3x scroll speed)
      gsap.to('#heroMediaWrapper', {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: '20%',
        opacity: 0.7
      });

      gsap.to('.hero-left', {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: '-10%',
        opacity: 0.2
      });

      // Desktop auto scene cycle (6s intervals)
      setupHeroSceneCycle(6000, false);

      // 2. VIDEO BAND INSET TO FULL-BLEED SCRUBBED SCROLLTRIGGER
      const videoWrapper = document.getElementById('videoBandWrapper');
      if (videoWrapper) {
        gsap.fromTo(
          videoWrapper,
          { width: '78%', borderRadius: '28px' },
          {
            width: '100%',
            borderRadius: '0px',
            ease: 'none',
            scrollTrigger: {
              trigger: '#video-band',
              start: 'top 80%',
              end: 'center 40%',
              scrub: 0.6
            }
          }
        );

        // Video overlay line word reveal
        gsap.from('#videoOverlayLine .word-inner', {
          scrollTrigger: {
            trigger: '#video-band',
            start: 'top 65%',
            toggleActions: 'play none none reverse'
          },
          y: '105%',
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: 'expo.out'
        });
      }

      setupVideoPlayer(isDataSaver);

      // 3. PROCESS LINE DRAW-IN ON SCROLL
      const processLine = document.getElementById('processLineFill');
      if (processLine) {
        gsap.to(processLine, {
          scrollTrigger: {
            trigger: '#process',
            start: 'top 70%',
            end: 'center 40%',
            scrub: 0.8
          },
          scaleX: 1,
          ease: 'none'
        });
      }

      // 4. COUNSELLORS ALTERNATING SLIDE-IN
      const counsellorCards = document.querySelectorAll('.counsellor-card');
      if (counsellorCards.length > 0) {
        counsellorCards.forEach((card, idx) => {
          const xOffset = idx % 2 === 0 ? -40 : 40;
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            },
            x: xOffset,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
        });
      }

      // 5. MAGNETIC BUTTONS (Desktop fine pointers only)
      setupMagneticButtons();

      // 6. CARD HOVER 3D TILT
      setupCardTilt();

      // 7. SECTION REVEALS
      setupStandardSectionReveals();

      return () => {
        heroTl.kill();
      };
    });
  }

  /**
   * HERO SCENE CYCLE & TRANSITION
   */
  let currentSceneIdx = 0;
  let heroCycleTimer = null;

  function setupHeroSceneCycle(intervalMs, isMobile) {
    const scenes = document.querySelectorAll('.hero-scene');
    const dots = document.querySelectorAll('#heroDots .hero-dot');
    const counterEl = document.getElementById('heroCounter');
    const labelEl = document.getElementById('heroSceneLabel');

    if (scenes.length === 0) return;

    function goToScene(targetIdx) {
      if (targetIdx === currentSceneIdx) return;
      const outgoing = scenes[currentSceneIdx];
      const incoming = scenes[targetIdx];
      if (!incoming) return;

      currentSceneIdx = targetIdx;

      // Update dots & counter
      dots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === currentSceneIdx);
        dot.setAttribute('aria-selected', idx === currentSceneIdx ? 'true' : 'false');
      });

      if (counterEl) {
        counterEl.textContent = `0${currentSceneIdx + 1} / 0${scenes.length}`;
      }

      const labelText = incoming.dataset.label || '';
      if (labelEl) {
        gsap.to(labelEl, {
          y: -6,
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            labelEl.textContent = labelText;
            gsap.fromTo(labelEl, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 });
          }
        });
      }

      // Smooth crossfade with subtle scale
      incoming.style.zIndex = '3';
      outgoing.style.zIndex = '2';
      incoming.classList.add('is-active');

      gsap.fromTo(
        incoming,
        { opacity: 0, scale: 1.04 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power2.out',
          onComplete: () => {
            outgoing.classList.remove('is-active');
            outgoing.style.zIndex = '1';
            incoming.style.zIndex = '2';
          }
        }
      );
    }

    function nextScene() {
      const nextIdx = (currentSceneIdx + 1) % scenes.length;
      goToScene(nextIdx);
    }

    function startCycle() {
      if (heroCycleTimer) clearInterval(heroCycleTimer);
      heroCycleTimer = setInterval(nextScene, intervalMs);
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        goToScene(idx);
        startCycle();
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(heroCycleTimer);
      } else {
        startCycle();
      }
    });

    startCycle();
  }

  function setupHeroSceneManualControls() {
    const scenes = document.querySelectorAll('.hero-scene');
    const dots = document.querySelectorAll('#heroDots .hero-dot');
    const counterEl = document.getElementById('heroCounter');
    const labelEl = document.getElementById('heroSceneLabel');

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIdx = parseInt(dot.dataset.index, 10);
        scenes.forEach((s, i) => s.classList.toggle('is-active', i === targetIdx));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === targetIdx));
        if (counterEl) counterEl.textContent = `0${targetIdx + 1} / 0${scenes.length}`;
        if (labelEl && scenes[targetIdx]) labelEl.textContent = scenes[targetIdx].dataset.label || '';
      });
    });
  }

  /**
   * VIDEO BAND PLAYBACK & OBSERVER
   */
  function setupVideoPlayer(disableVideo) {
    const video = document.getElementById('campusVideo');
    if (!video) return;

    if (disableVideo) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
  }

  /**
   * STANDARD SECTION REVEALS
   */
  function setupStandardSectionReveals() {
    // Headings fade up
    document.querySelectorAll('.section-heading, .section-desc, .center-heading-wrap').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        },
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out'
      });
    });

    // Destination Cards Stagger
    const destCards = document.querySelectorAll('.destination-card');
    if (destCards.length > 0) {
      gsap.from(destCards, {
        scrollTrigger: {
          trigger: '#destinationsGrid',
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'power2.out'
      });
    }

    // Why Choose Us Cards Stagger
    const whyCards = document.querySelectorAll('.why-card');
    if (whyCards.length > 0) {
      gsap.from(whyCards, {
        scrollTrigger: {
          trigger: '#whyGrid',
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        },
        y: 35,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'power2.out'
      });
    }

    // Bento Services Cards
    const bentoCards = document.querySelectorAll('.bento-card');
    if (bentoCards.length > 0) {
      gsap.from(bentoCards, {
        scrollTrigger: {
          trigger: '#servicesBentoGrid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });
    }

    // Process Cards
    const processCards = document.querySelectorAll('.process-step-card');
    if (processCards.length > 0) {
      gsap.from(processCards, {
        scrollTrigger: {
          trigger: '#processStepsGrid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }

  /**
   * MAGNETIC BUTTONS (Desktop Fine Pointer Only)
   */
  function setupMagneticButtons() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.btn-coral, .btn-primary').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.22,
          y: y * 0.22,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.45,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  /**
   * CARD TILT (Max 6 degrees, desktop fine pointer)
   */
  function setupCardTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.why-card, .destination-card, .uni-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(card, {
          transformPerspective: 900,
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.3,
          ease: 'power1.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    });
  }
})();
