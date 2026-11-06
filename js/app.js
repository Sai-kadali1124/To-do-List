/**
 * ==============================================================================
 * GLOBAL PATH STUDY ABROAD — APPLICATION LOGIC (js/app.js)
 * Dynamic rendering from config, navigation, forms validation, UI interactions,
 * university detail modal, timetable filtering, testimonial slider & accessibility.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Ensure window.SITE_CONFIG is loaded
  const CONFIG = window.SITE_CONFIG || {};

  // DOM Elements cache
  const docEl = document.documentElement;
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const stickyMobileBar = document.getElementById('stickyMobileBar');
  const heroSection = document.getElementById('hero');
  const enquirySection = document.getElementById('enquiry');

  /**
   * 1. APPLY THEME VARIABLES AT RUNTIME
   */
  function applyTheme() {
    if (!CONFIG.theme) return;
    const t = CONFIG.theme;
    if (t.bg) docEl.style.setProperty('--bg', t.bg);
    if (t.bgSoft) docEl.style.setProperty('--bg-soft', t.bgSoft);
    if (t.bgLavender) docEl.style.setProperty('--bg-lavender', t.bgLavender);
    if (t.bgCream) docEl.style.setProperty('--bg-cream', t.bgCream);
    if (t.ink) docEl.style.setProperty('--ink', t.ink);
    if (t.textMuted) docEl.style.setProperty('--text-muted', t.textMuted);
    if (t.primary) docEl.style.setProperty('--primary', t.primary);
    if (t.primaryDeep) docEl.style.setProperty('--primary-deep', t.primaryDeep);
    if (t.accentYellow) docEl.style.setProperty('--accent-yellow', t.accentYellow);
    if (t.accentCoral) docEl.style.setProperty('--accent-coral', t.accentCoral);
    if (t.accentMint) docEl.style.setProperty('--accent-mint', t.accentMint);
    if (t.error) docEl.style.setProperty('--error', t.error);
    if (t.border) docEl.style.setProperty('--border', t.border);
    if (t.fontHeadlines) docEl.style.setProperty('--font-headlines', t.fontHeadlines);
    if (t.fontBody) docEl.style.setProperty('--font-body', t.fontBody);
  }

  /**
   * 2. SYNC BRAND & CONTACT DETAILS
   */
  function syncBrandDetails() {
    const b = CONFIG.brand || {};

    // Header Phone
    const navPhoneLink = document.getElementById('navPhoneLink');
    const navPhoneText = document.getElementById('navPhoneText');
    if (navPhoneLink && b.phone) {
      navPhoneLink.href = `tel:${b.phone.tel}`;
      if (navPhoneText) navPhoneText.textContent = 'Call us';
    }

    // Mobile Menu Call
    const mobileMenuCall = document.getElementById('mobileMenuCall');
    if (mobileMenuCall && b.phone) {
      mobileMenuCall.href = `tel:${b.phone.tel}`;
      mobileMenuCall.textContent = `Call ${b.phone.display}`;
    }

    // Contact Cards
    const cardPhone = document.getElementById('contactCardPhone');
    const cardPhoneVal = document.getElementById('cardPhoneVal');
    if (cardPhone && b.phone) {
      cardPhone.href = `tel:${b.phone.tel}`;
      if (cardPhoneVal) cardPhoneVal.textContent = b.phone.display;
    }

    const cardWhatsapp = document.getElementById('contactCardWhatsapp');
    if (cardWhatsapp && b.whatsapp) {
      const encodedMsg = encodeURIComponent(b.whatsapp.prefilledMessage || 'Hello Global Path');
      cardWhatsapp.href = `https://wa.me/${b.whatsapp.number}?text=${encodedMsg}`;
    }

    const cardEmail = document.getElementById('contactCardEmail');
    const cardEmailVal = document.getElementById('cardEmailVal');
    if (cardEmail && b.email) {
      cardEmail.href = `mailto:${b.email}`;
      if (cardEmailVal) cardEmailVal.textContent = b.email;
    }

    const cardAddressVal = document.getElementById('cardAddressVal');
    if (cardAddressVal && b.fullAddress) {
      cardAddressVal.textContent = b.fullAddress;
    }

    // Location Address
    const locationCity = document.getElementById('locationAddressCity');
    const locationFull = document.getElementById('locationFullAddressText');
    const getDirectionsBtn = document.getElementById('getDirectionsBtn');
    if (locationCity && b.city) locationCity.textContent = `${b.city} Admissions Center`;
    if (locationFull && b.fullAddress) locationFull.textContent = b.fullAddress;
    if (getDirectionsBtn && b.fullAddress) {
      getDirectionsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.fullAddress)}`;
    }

    // Footer
    const footerTagline = document.getElementById('footerTagline');
    const footerAddressText = document.getElementById('footerAddressText');
    const footerPhoneLink = document.getElementById('footerPhoneLink');
    const footerEmailLink = document.getElementById('footerEmailLink');
    const currentYearSpan = document.getElementById('currentYearSpan');

    if (footerTagline && b.tagline) footerTagline.textContent = `${b.tagline}. Objective, friendly and empirical guidance for Indian scholars.`;
    if (footerAddressText && b.fullAddress) footerAddressText.textContent = b.fullAddress;
    if (footerPhoneLink && b.phone) {
      footerPhoneLink.href = `tel:${b.phone.tel}`;
      footerPhoneLink.textContent = b.phone.display;
    }
    if (footerEmailLink && b.email) {
      footerEmailLink.href = `mailto:${b.email}`;
      footerEmailLink.textContent = b.email;
    }
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }

    // Footer Socials (Empty ones are hidden)
    const footerSocials = document.getElementById('footerSocials');
    if (footerSocials && b.social) {
      footerSocials.innerHTML = '';
      const icons = {
        linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
        instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
        youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>',
        twitter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>'
      };

      Object.keys(b.social).forEach((key) => {
        const url = b.social[key];
        if (url && url.trim().length > 0 && icons[key]) {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'social-icon-btn';
          a.setAttribute('aria-label', `Global Path on ${key}`);
          a.innerHTML = icons[key];
          footerSocials.appendChild(a);
        }
      });
    }

    // Sticky Bar Phone & WhatsApp
    const stickyCallBtn = document.getElementById('stickyCallBtn');
    const stickyWhatsappBtn = document.getElementById('stickyWhatsappBtn');
    if (stickyCallBtn && b.phone) stickyCallBtn.href = `tel:${b.phone.tel}`;
    if (stickyWhatsappBtn && b.whatsapp) {
      stickyWhatsappBtn.href = `https://wa.me/${b.whatsapp.number}?text=${encodeURIComponent(b.whatsapp.prefilledMessage || '')}`;
    }
  }

  /**
   * 3. FEATURE SWITCHES (Clean removal without dead links or gaps)
   */
  function applyFeatureSwitches() {
    const f = CONFIG.features || {};

    const featureSectionMap = {
      video: ['video-band'],
      intro: ['whyChooseUs'],
      destinations: ['destinations'],
      indianUniversities: ['universities'],
      internationalUniversities: ['intlUniversities'],
      services: ['services'],
      counsellors: ['counsellors'],
      process: ['process'],
      packages: ['packages'],
      timetable: ['timetable'],
      gallery: ['gallery'],
      testimonials: ['testimonials'],
      successStories: ['successStories'],
      faq: ['faq'],
      location: ['location'],
      stickyMobileBar: ['stickyMobileBar']
    };

    Object.keys(featureSectionMap).forEach((featureKey) => {
      const isEnabled = f[featureKey] !== false;
      const ids = featureSectionMap[featureKey];

      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && !isEnabled) {
          el.remove();
        }
      });

      // Remove corresponding nav links if disabled
      if (!isEnabled) {
        document.querySelectorAll(`a[href="#${featureKey}"]`).forEach((a) => {
          const li = a.closest('li');
          if (li) li.remove();
          else a.remove();
        });
      }
    });

    if (f.call === false) {
      document.getElementById('navPhoneLink')?.remove();
      document.getElementById('stickyCallBtn')?.remove();
      document.getElementById('contactCardPhone')?.remove();
    }

    if (f.whatsapp === false) {
      document.getElementById('contactCardWhatsapp')?.remove();
      document.getElementById('stickyWhatsappBtn')?.remove();
    }

    if (f.email === false) {
      document.getElementById('contactCardEmail')?.remove();
    }
  }

  /**
   * 4. RENDER TRUST STRIP
   */
  function renderTrustStrip() {
    const grid = document.getElementById('trustStripGrid');
    if (!grid || !CONFIG.trustStrip) return;

    const iconSvgs = {
      users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      globe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
      award: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
      'check-circle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    };

    grid.innerHTML = CONFIG.trustStrip
      .map(
        (item) => `
        <div class="trust-item">
          <div class="trust-icon-box">
            ${iconSvgs[item.icon] || iconSvgs.award}
          </div>
          <div class="trust-text">${item.text}</div>
        </div>
      `
      )
      .join('');
  }

  /**
   * 5. RENDER WHY CHOOSE US (6 feature cards)
   */
  function renderWhyChooseUs() {
    const grid = document.getElementById('whyGrid');
    if (!grid || !CONFIG.whyChooseUs) return;

    const iconMap = {
      building: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><line x1="8" y1="6" x2="8.01" y2="6"></line><line x1="16" y1="6" x2="16.01" y2="6"></line><line x1="8" y1="10" x2="8.01" y2="10"></line><line x1="16" y1="10" x2="16.01" y2="10"></line><line x1="8" y1="14" x2="8.01" y2="14"></line><line x1="16" y1="14" x2="16.01" y2="14"></line></svg>',
      compass: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
      star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
      check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      gift: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',
      shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
    };

    grid.innerHTML = CONFIG.whyChooseUs
      .map(
        (card) => `
        <div class="why-card">
          <div class="icon-tile icon-tile-${card.iconBg}">
            ${iconMap[card.icon] || iconMap.star}
          </div>
          <h3 class="why-title">${card.title}</h3>
          <p class="why-desc">${card.desc}</p>
        </div>
      `
      )
      .join('');
  }

  /**
   * 6. RENDER DESTINATIONS (6 Cards)
   */
  function renderDestinations() {
    const grid = document.getElementById('destinationsGrid');
    if (!grid || !CONFIG.destinations) return;

    grid.innerHTML = CONFIG.destinations
      .map((d) => {
        const chipsHtml = (d.subjects || []).map((s) => `<span class="chip">${s}</span>`).join('');
        return `
          <div class="destination-card" data-dest-id="${d.id}">
            <div class="dest-photo-wrap photo-wrapper">
              <img src="${d.photo}" alt="${d.name}" class="dest-photo img-graded" loading="lazy">
              <span class="dest-flag-badge" aria-label="${d.name} flag">${d.flag}</span>
            </div>
            <div class="dest-body">
              <h3 class="dest-title">${d.name}</h3>
              <p class="dest-sample-count">${d.sampleCount}</p>
              <p class="dest-highlight">${d.highlight}</p>
              <div class="dest-chips">${chipsHtml}</div>
              <div style="margin-top: 1rem;">
                <button type="button" class="btn btn-secondary btn-preselect-dest" data-preselect-dest="${d.name}" style="width: 100%; padding: 10px 18px; font-size: 0.88rem;">
                  Enquire ${d.name}
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * 7. RENDER INDIAN UNIVERSITIES (5 Cards)
   */
  function renderIndianUniversities() {
    const row = document.getElementById('indianUniCardsRow');
    if (!row || !CONFIG.indianUniversities) return;

    row.innerHTML = CONFIG.indianUniversities
      .map((u, idx) => {
        const chipsHtml = (u.chips || []).map((c) => `<span class="chip">${c}</span>`).join('');
        return `
          <div class="uni-card" data-uni-id="${u.id}">
            <div class="uni-photo-wrap photo-wrapper">
              <img src="${u.photo}" alt="${u.name}" class="uni-photo img-graded" loading="lazy">
            </div>
            <div class="uni-body">
              <span class="sample-badge" style="align-self: flex-start; margin-bottom: 2px;">${u.badge || 'Sample partner'}</span>
              <h3 class="uni-name">${u.name}</h3>
              <p class="uni-location">${u.location}</p>
              <p class="uni-desc">${u.desc}</p>
              <div class="uni-chips">${chipsHtml}</div>
              <button type="button" class="btn btn-secondary btn-view-uni-modal" data-uni-type="indian" data-uni-id="${u.id}" style="padding: 9px 16px; font-size: 0.85rem; width: 100%;">
                View Details
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * 8. RENDER INTERNATIONAL UNIVERSITIES (Carousel with Country Tabs)
   */
  let selectedCountry = 'uk';

  function renderInternationalUniversities() {
    const tabsContainer = document.getElementById('intlCountryTabs');
    const cardsContainer = document.getElementById('intlCardsGrid');
    if (!tabsContainer || !cardsContainer || !CONFIG.internationalUniversities) return;

    const countries = [
      { key: 'uk', label: 'United Kingdom 🇬🇧' },
      { key: 'germany', label: 'Germany 🇩🇪' },
      { key: 'ireland', label: 'Ireland 🇮🇪' },
      { key: 'canada', label: 'Canada 🇨🇦' },
      { key: 'australia', label: 'Australia 🇦🇺' },
      { key: 'uae', label: 'UAE (Dubai) 🇦🇪' }
    ];

    tabsContainer.innerHTML = countries
      .map(
        (c) => `
        <button type="button" class="intl-tab-btn ${c.key === selectedCountry ? 'is-active' : ''}" data-country="${c.key}" role="tab" aria-selected="${c.key === selectedCountry}">
          ${c.label}
        </button>
      `
      )
      .join('');

    filterIntlUniversities();

    tabsContainer.querySelectorAll('.intl-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCountry = btn.dataset.country;
        tabsContainer.querySelectorAll('.intl-tab-btn').forEach((b) => {
          b.classList.toggle('is-active', b.dataset.country === selectedCountry);
          b.setAttribute('aria-selected', b.dataset.country === selectedCountry ? 'true' : 'false');
        });
        filterIntlUniversities();
      });
    });
  }

  function filterIntlUniversities() {
    const cardsContainer = document.getElementById('intlCardsGrid');
    const unis = (CONFIG.internationalUniversities && CONFIG.internationalUniversities[selectedCountry]) || [];

    if (!cardsContainer) return;

    cardsContainer.innerHTML = unis
      .map(
        (u, idx) => `
        <div class="intl-card">
          <div class="uni-photo-wrap photo-wrapper">
            <img src="${u.photo}" alt="${u.name}" class="uni-photo img-graded" loading="lazy">
          </div>
          <div class="uni-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span class="sample-badge">${u.badge || 'Sample listing'}</span>
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">${u.courses}</span>
            </div>
            <h3 class="uni-name">${u.name}</h3>
            <p class="uni-location">${u.city}</p>
            <p class="uni-desc">Leading curriculum accredited with high graduate employability and global research rankings.</p>
            <div style="margin-top: 1rem; display: flex; gap: 10px;">
              <button type="button" class="btn btn-secondary btn-view-uni-modal" data-uni-type="intl" data-country="${selectedCountry}" data-index="${idx}" style="flex-grow: 1; padding: 10px 18px; font-size: 0.88rem;">
                View Details
              </button>
              <button type="button" class="btn btn-coral btn-preselect-uni" data-uni-name="${u.name}" style="padding: 10px 18px; font-size: 0.88rem;">
                Apply
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  }

  /**
   * 9. ACCESSIBLE UNIVERSITY DETAIL MODAL
   */
  let lastFocusedElement = null;

  function setupUniversityModal() {
    const modal = document.getElementById('uniDetailModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const dismissBtn = document.getElementById('modalDismissBtn');
    const modalBookBtn = document.getElementById('modalBookBtn');
    const modalName = document.getElementById('modalUniName');
    const modalLocation = document.getElementById('modalUniLocation');
    const modalOverview = document.getElementById('modalUniOverview');
    const modalChips = document.getElementById('modalUniChips');

    if (!modal) return;

    function openModal(data) {
      lastFocusedElement = document.activeElement;
      modalName.textContent = data.name;
      modalLocation.textContent = data.location;
      modalOverview.textContent = data.overview;
      modalChips.innerHTML = (data.chips || []).map((c) => `<span class="chip">${c}</span>`).join('');

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-locked');
      closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-locked');
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    // Delegate open button clicks
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-view-uni-modal');
      if (!btn) return;

      const uniType = btn.dataset.uniType;
      if (uniType === 'indian') {
        const uniId = btn.dataset.uniId;
        const u = (CONFIG.indianUniversities || []).find((x) => x.id === uniId);
        if (u) {
          openModal({
            name: u.name,
            location: u.location,
            overview: u.modalDetails ? u.modalDetails.overview : u.desc,
            chips: (u.modalDetails && u.modalDetails.studyAreas) || u.chips
          });
        }
      } else if (uniType === 'intl') {
        const country = btn.dataset.country;
        const idx = parseInt(btn.dataset.index, 10);
        const list = (CONFIG.internationalUniversities && CONFIG.internationalUniversities[country]) || [];
        const u = list[idx];
        if (u) {
          openModal({
            name: u.name,
            location: u.city,
            overview: `${u.name} is recognized globally for premier academic faculty and high graduate outcomes. Confirm details and usage rights before publishing.`,
            chips: ["Undergraduate", "Postgraduate", "Research Fellowship", "Scholarships"]
          });
        }
      }
    });

    closeBtn.addEventListener('click', closeModal);
    dismissBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeModal();
    });

    if (modalBookBtn) {
      modalBookBtn.addEventListener('click', () => {
        closeModal();
      });
    }
  }

  /**
   * 10. RENDER SERVICES (Bento Grid)
   */
  function renderServices() {
    const grid = document.getElementById('servicesBentoGrid');
    if (!grid || !CONFIG.services) return;

    grid.innerHTML = CONFIG.services
      .map((s, idx) => {
        const sizeClass = s.size === 'large' ? 'bento-large' : s.size === 'wide' ? 'bento-wide' : '';
        const stepsHtml = (s.steps || [])
          .map((step) => `<li class="bento-step-item">${step}</li>`)
          .join('');

        return `
          <div class="bento-card ${sizeClass}">
            <div>
              <span class="sample-badge">Service 0${idx + 1}</span>
              <h3 class="bento-title">${s.title}</h3>
              <p class="bento-desc">${s.desc}</p>
            </div>
            <ul class="bento-steps">
              ${stepsHtml}
            </ul>
          </div>
        `;
      })
      .join('');
  }

  /**
   * 11. RENDER COUNSELLORS (3 Portrait Cards)
   */
  function renderCounsellors() {
    const grid = document.getElementById('counsellorsGrid');
    if (!grid || !CONFIG.counsellors) return;

    grid.innerHTML = CONFIG.counsellors
      .map(
        (c) => `
        <article class="counsellor-card">
          <div class="counsellor-photo-wrap photo-wrapper">
            <img src="${c.image}" alt="${c.name} — ${c.specialty}" class="counsellor-photo img-graded" loading="lazy">
          </div>
          <div class="counsellor-body">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span class="sample-badge">${c.badge || 'Sample profile'}</span>
              <span style="font-size: 0.78rem; color: var(--primary); font-weight: 600;">${c.experience}</span>
            </div>
            <h3 class="counsellor-name">${c.name}</h3>
            <p class="counsellor-specialty">${c.specialty}</p>
            <p class="counsellor-bio">${c.bio}</p>
          </div>
        </article>
      `
      )
      .join('');
  }

  /**
   * 12. RENDER PROCESS (4 Steps Timeline)
   */
  function renderProcess() {
    const grid = document.getElementById('processStepsGrid');
    if (!grid || !CONFIG.process) return;

    grid.innerHTML = CONFIG.process
      .map(
        (p) => `
        <div class="process-step-card">
          <div class="process-step-num">${p.step}</div>
          <h3 class="process-step-title">${p.title}</h3>
          <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-muted);">${p.desc}</p>
        </div>
      `
      )
      .join('');
  }

  /**
   * 13. RENDER PACKAGES & PRICING TOGGLE
   */
  let isPackageMode = false;

  function renderPackages() {
    const grid = document.getElementById('packagesGrid');
    if (!grid || !CONFIG.packages) return;

    grid.innerHTML = CONFIG.packages
      .map((p) => {
        const isPop = p.popular ? 'is-popular' : '';
        const badgeHtml = p.badge ? `<div class="package-popular-badge">${p.badge}</div>` : '';
        const price = isPackageMode ? p.packagePrice : p.sessionPrice;
        const period = isPackageMode ? p.packageLabel : p.sessionLabel;
        const featuresHtml = (p.features || [])
          .map(
            (f) => `
            <li class="package-feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${f}</span>
            </li>
          `
          )
          .join('');

        return `
          <div class="package-card ${isPop}" data-pkg-id="${p.id}">
            ${badgeHtml}
            <h3 class="package-title">${p.name}</h3>
            <p style="font-size: 0.92rem; color: var(--text-muted);">${p.desc}</p>
            
            <div class="package-price-wrap">
              <div class="package-price" data-session-price="${p.sessionPrice}" data-package-price="${p.packagePrice}">${price}</div>
              <div class="package-period" data-session-label="${p.sessionLabel}" data-package-label="${p.packageLabel}">${period}</div>
            </div>

            <ul class="package-features">
              ${featuresHtml}
            </ul>

            <button type="button" class="btn ${p.popular ? 'btn-coral' : 'btn-secondary'} btn-select-pkg" data-preselect-package="${p.id}" style="width: 100%;">
              ${p.ctaText || 'Select Package'}
            </button>
          </div>
        `;
      })
      .join('');
  }

  function setupPackageToggle() {
    const toggleSwitch = document.getElementById('packageToggleSwitch');
    const labelSession = document.getElementById('labelSession');
    const labelPackage = document.getElementById('labelPackage');
    if (!toggleSwitch) return;

    function setMode(packageMode) {
      isPackageMode = packageMode;
      toggleSwitch.classList.toggle('is-package', isPackageMode);
      toggleSwitch.setAttribute('aria-checked', isPackageMode ? 'true' : 'false');
      if (labelSession) labelSession.classList.toggle('is-active', !isPackageMode);
      if (labelPackage) labelPackage.classList.toggle('is-active', isPackageMode);

      document.querySelectorAll('.package-card').forEach((card) => {
        const priceEl = card.querySelector('.package-price');
        const periodEl = card.querySelector('.package-period');
        if (priceEl && periodEl) {
          priceEl.textContent = isPackageMode ? priceEl.dataset.packagePrice : priceEl.dataset.sessionPrice;
          periodEl.textContent = isPackageMode ? periodEl.dataset.packageLabel : periodEl.dataset.sessionLabel;
        }
      });
    }

    toggleSwitch.addEventListener('click', () => setMode(!isPackageMode));
    if (labelSession) labelSession.addEventListener('click', () => setMode(false));
    if (labelPackage) labelPackage.addEventListener('click', () => setMode(true));
  }

  /**
   * 14. RENDER TIMETABLE
   */
  let selectedDay = 'Monday';
  let selectedCategory = 'All';

  function renderTimetable() {
    const tt = CONFIG.timetable;
    if (!tt) return;

    const dayTabs = document.getElementById('timetableDayTabs');
    const chipContainer = document.getElementById('timetableCategoryChips');
    const rowsContainer = document.getElementById('timetableRows');
    if (!dayTabs || !rowsContainer) return;

    dayTabs.innerHTML = tt.schedule
      .map(
        (d) => `
        <button type="button" class="timetable-tab-btn ${d.day === selectedDay ? 'is-active' : ''}" data-day="${d.day}" role="tab" aria-selected="${d.day === selectedDay}">
          ${d.day}
        </button>
      `
      )
      .join('');

    if (chipContainer && tt.categories) {
      chipContainer.innerHTML = tt.categories
        .map(
          (cat) => `
          <button type="button" class="timetable-chip ${cat === selectedCategory ? 'is-active' : ''}" data-category="${cat}">
            ${cat}
          </button>
        `
        )
        .join('');
    }

    filterTimetableRows();

    dayTabs.querySelectorAll('.timetable-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedDay = btn.dataset.day;
        dayTabs.querySelectorAll('.timetable-tab-btn').forEach((b) => {
          b.classList.toggle('is-active', b.dataset.day === selectedDay);
          b.setAttribute('aria-selected', b.dataset.day === selectedDay ? 'true' : 'false');
        });
        filterTimetableRows();
      });
    });

    if (chipContainer) {
      chipContainer.querySelectorAll('.timetable-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          selectedCategory = chip.dataset.category;
          chipContainer.querySelectorAll('.timetable-chip').forEach((c) => {
            c.classList.toggle('is-active', c.dataset.category === selectedCategory);
          });
          filterTimetableRows();
        });
      });
    }
  }

  function filterTimetableRows() {
    const tt = CONFIG.timetable;
    const rowsContainer = document.getElementById('timetableRows');
    if (!tt || !rowsContainer) return;

    const currentDayData = tt.schedule.find((d) => d.day === selectedDay);
    if (!currentDayData) return;

    const filteredSlots = currentDayData.slots.filter(
      (slot) => selectedCategory === 'All' || slot.category === selectedCategory
    );

    if (filteredSlots.length === 0) {
      rowsContainer.innerHTML = `
        <div class="timetable-row" style="text-align: center; justify-content: center; color: var(--text-muted); padding: 2.5rem;">
          No sessions scheduled under "${selectedCategory}" on ${selectedDay}. Please choose another day or filter.
        </div>
      `;
      return;
    }

    rowsContainer.innerHTML = filteredSlots
      .map(
        (s) => `
        <div class="timetable-row">
          <div class="timetable-time">${s.time}</div>
          <div class="timetable-details">
            <h4 class="timetable-session-title">${s.title}</h4>
            <div class="timetable-meta">
              <span><strong>Advisor:</strong> ${s.counsellor}</span>
              <span><strong>Mode:</strong> ${s.mode}</span>
              <span class="sample-badge" style="padding: 1px 8px; font-size: 0.68rem;">${s.category}</span>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-book-slot" data-slot-title="${s.title}" style="padding: 9px 20px; font-size: 0.88rem; flex-shrink: 0;">
            Book
          </button>
        </div>
      `
      )
      .join('');

    rowsContainer.querySelectorAll('.btn-book-slot').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slotTitle = btn.dataset.slotTitle;
        scrollToEnquiry();
        const msgField = document.getElementById('bpMessage');
        if (msgField) msgField.value = `Booking requested for upcoming session: ${slotTitle}`;
      });
    });
  }

  /**
   * 15. RENDER GALLERY & LIGHTBOX
   */
  let currentGalleryIndex = 0;

  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid || !CONFIG.gallery) return;

    grid.innerHTML = CONFIG.gallery
      .map(
        (g, idx) => `
        <div class="gallery-tile photo-wrapper" data-index="${idx}" tabindex="0" role="button" aria-label="View photo: ${g.title}">
          <img src="${g.image}" alt="${g.title}" class="gallery-tile-img img-graded" loading="lazy">
          <div class="gallery-tile-overlay">
            <h4 class="gallery-tile-title">${g.title}</h4>
            <p class="gallery-tile-caption">${g.caption}</p>
          </div>
        </div>
      `
      )
      .join('');

    setupLightbox();
  }

  function setupLightbox() {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (!modal || !CONFIG.gallery) return;

    function openLightbox(index) {
      currentGalleryIndex = index;
      const item = CONFIG.gallery[currentGalleryIndex];
      if (!item) return;

      img.src = item.image;
      img.alt = item.title;
      caption.textContent = `${item.title} — ${item.caption}`;
      modal.classList.add('is-active');
      document.body.classList.add('nav-locked');
      closeBtn.focus();
    }

    function closeLightbox() {
      modal.classList.remove('is-active');
      document.body.classList.remove('nav-locked');
    }

    function showPrev() {
      currentGalleryIndex = (currentGalleryIndex - 1 + CONFIG.gallery.length) % CONFIG.gallery.length;
      openLightbox(currentGalleryIndex);
    }

    function showNext() {
      currentGalleryIndex = (currentGalleryIndex + 1) % CONFIG.gallery.length;
      openLightbox(currentGalleryIndex);
    }

    document.querySelectorAll('.gallery-tile').forEach((tile) => {
      tile.addEventListener('click', () => openLightbox(parseInt(tile.dataset.index, 10)));
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(parseInt(tile.dataset.index, 10));
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /**
   * 16. RENDER SUCCESS STORIES (3 cards with yellow star row)
   */
  function renderSuccessStories() {
    const grid = document.getElementById('storiesGrid');
    if (!grid || !CONFIG.successStories) return;

    grid.innerHTML = CONFIG.successStories
      .map((s) => {
        const starsHtml = '★'.repeat(s.stars || 5);
        return `
          <div class="story-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="sample-badge">${s.badge || 'Sample story'}</span>
              <div class="story-star-row" aria-label="5 stars">${starsHtml}</div>
            </div>
            <blockquote class="story-quote">“${s.quote}”</blockquote>
            <div>
              <h4 class="story-student-name">${s.student}</h4>
              <p class="story-course">${s.course} • ${s.destination}</p>
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * 17. RENDER TESTIMONIALS SLIDER (Auto-advance 7s)
   */
  let testimonialIndex = 0;
  let testimonialTimer = null;

  function renderTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    const dotsWrap = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('testPrevBtn');
    const nextBtn = document.getElementById('testNextBtn');
    const wrapper = document.getElementById('testimonialsSlider');
    if (!container || !CONFIG.testimonials) return;

    container.innerHTML = CONFIG.testimonials
      .map(
        (t, idx) => `
        <div class="testimonial-card ${idx === 0 ? 'is-active' : ''}" data-idx="${idx}">
          <div style="margin-bottom: 1.5rem;">
            <span class="sample-badge">${t.badge || 'Sample review'}</span>
          </div>
          <blockquote class="testimonial-quote">“${t.quote}”</blockquote>
          <div class="testimonial-author">${t.author}</div>
          <div class="testimonial-role">${t.role} • ${t.location}</div>
        </div>
      `
      )
      .join('');

    if (dotsWrap) {
      dotsWrap.innerHTML = CONFIG.testimonials
        .map(
          (_, idx) => `
          <button type="button" class="hero-dot ${idx === 0 ? 'is-active' : ''}" data-test-dot="${idx}" aria-label="Go to review ${idx + 1}"></button>
        `
        )
        .join('');

      dotsWrap.querySelectorAll('.hero-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          showTestimonial(parseInt(dot.dataset.testDot, 10));
          resetTimer();
        });
      });
    }

    function showTestimonial(idx) {
      testimonialIndex = idx;
      container.querySelectorAll('.testimonial-card').forEach((card, i) => {
        card.classList.toggle('is-active', i === testimonialIndex);
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.hero-dot').forEach((d, i) => {
          d.classList.toggle('is-active', i === testimonialIndex);
        });
      }
    }

    function nextTestimonial() {
      const nextIdx = (testimonialIndex + 1) % CONFIG.testimonials.length;
      showTestimonial(nextIdx);
    }

    function prevTestimonial() {
      const prevIdx = (testimonialIndex - 1 + CONFIG.testimonials.length) % CONFIG.testimonials.length;
      showTestimonial(prevIdx);
    }

    function startTimer() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      testimonialTimer = setInterval(nextTestimonial, 7000);
    }

    function resetTimer() {
      clearInterval(testimonialTimer);
      startTimer();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevTestimonial();
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextTestimonial();
        resetTimer();
      });
    }

    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
      wrapper.addEventListener('mouseleave', startTimer);
      wrapper.addEventListener('touchstart', () => clearInterval(testimonialTimer), { passive: true });
      wrapper.addEventListener('touchend', startTimer);
    }

    startTimer();
  }

  /**
   * 18. RENDER FAQ ACCORDION (Accessible)
   */
  function renderFaq() {
    const acc = document.getElementById('faqAccordion');
    if (!acc || !CONFIG.faqs) return;

    acc.innerHTML = CONFIG.faqs
      .map(
        (f, idx) => `
        <div class="faq-item" id="faqItem-${idx}">
          <button type="button" class="faq-trigger" aria-expanded="false" aria-controls="faqAns-${idx}">
            <span>${f.q}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </button>
          <div class="faq-answer" id="faqAns-${idx}" role="region">
            <p>${f.a}</p>
          </div>
        </div>
      `
      )
      .join('');

    acc.querySelectorAll('.faq-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        const isOpen = item.classList.contains('is-open');
        const answer = item.querySelector('.faq-answer');

        acc.querySelectorAll('.faq-item').forEach((other) => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
        }
      });
    });
  }

  /**
   * 19. OPERATING HOURS TABLE & REAL-TIME IST HIGHLIGHT
   */
  function renderHoursTable() {
    const tbody = document.getElementById('hoursTableBody');
    if (!tbody || !CONFIG.hours || !CONFIG.hours.days) return;

    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);
    const todayIndex = istTime.getDay();

    tbody.innerHTML = CONFIG.hours.days
      .map((d) => {
        const isToday = d.dayIndex === todayIndex;
        return `
          <tr class="hours-row ${isToday ? 'is-today' : ''}">
            <td style="font-weight: ${isToday ? '700' : '500'};">${d.day}</td>
            <td style="text-align: right;">${d.open} – ${d.close}</td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * 20. ENQUIRY FORMS, VALIDATION & SUBMISSION
   */
  function setupForms() {
    const tabFreeBtn = document.getElementById('tabFreeCounsellingBtn');
    const tabPkgBtn = document.getElementById('tabBookPackageBtn');
    const freeForm = document.getElementById('freeCounsellingForm');
    const pkgForm = document.getElementById('bookPackageForm');
    const heroLeadForm = document.getElementById('heroQuickLeadForm');
    const statusArea = document.getElementById('formStatusArea');
    const demoNote = document.getElementById('formDemoNote');

    if (!tabFreeBtn || !tabPkgBtn || !freeForm || !pkgForm) return;

    if (CONFIG.forms && CONFIG.forms.showDemoNote === false && demoNote) {
      demoNote.style.display = 'none';
    }

    function switchTab(toPackage) {
      tabFreeBtn.classList.toggle('is-active', !toPackage);
      tabFreeBtn.setAttribute('aria-selected', !toPackage ? 'true' : 'false');
      tabPkgBtn.classList.toggle('is-active', toPackage);
      tabPkgBtn.setAttribute('aria-selected', toPackage ? 'true' : 'false');

      freeForm.style.display = toPackage ? 'none' : 'block';
      pkgForm.style.display = toPackage ? 'block' : 'none';
    }

    tabFreeBtn.addEventListener('click', () => switchTab(false));
    tabPkgBtn.addEventListener('click', () => switchTab(true));

    const dateInput = document.getElementById('fcDate');
    if (dateInput) {
      const todayIso = new Date().toISOString().split('T')[0];
      dateInput.min = todayIso;
    }

    function isValidName(val) {
      return val && val.trim().length >= 2;
    }

    function isValidPhone(val) {
      if (!val) return false;
      const digits = val.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '');
      return /^[6-9]\d{9}$/.test(digits);
    }

    function isValidEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    function validateField(input, testFn) {
      const group = input.closest('.form-group');
      const valid = testFn(input.value);
      if (group) {
        group.classList.toggle('has-error', !valid);
      }
      input.classList.toggle('is-invalid', !valid);
      return valid;
    }

    document.querySelectorAll('.form-input, .form-select, .form-textarea, .lead-input, .lead-select').forEach((inp) => {
      inp.addEventListener('input', () => {
        const group = inp.closest('.form-group');
        if (group && group.classList.contains('has-error')) {
          group.classList.remove('has-error');
          inp.classList.remove('is-invalid');
        }
      });
    });

    // Hero Quick Lead Form
    if (heroLeadForm) {
      heroLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInp = document.getElementById('hlName');
        const emailInp = document.getElementById('hlEmail');
        const phoneInp = document.getElementById('hlPhone');
        const countryInp = document.getElementById('hlCountry');
        const interestInp = document.getElementById('hlInterest');

        const v1 = isValidName(nameInp.value);
        const v2 = isValidEmail(emailInp.value);
        const v3 = isValidPhone(phoneInp.value);
        const v4 = !!countryInp.value;
        const v5 = !!interestInp.value;

        nameInp.classList.toggle('is-invalid', !v1);
        emailInp.classList.toggle('is-invalid', !v2);
        phoneInp.classList.toggle('is-invalid', !v3);
        countryInp.classList.toggle('is-invalid', !v4);
        interestInp.classList.toggle('is-invalid', !v5);

        if (!v1 || !v2 || !v3 || !v4 || !v5) {
          return;
        }

        // Prefill into main form & scroll to inquiry
        scrollToEnquiry();
        document.getElementById('fcName').value = nameInp.value;
        document.getElementById('fcEmail').value = emailInp.value;
        document.getElementById('fcPhone').value = phoneInp.value;
        
        // Match country
        const countryMap = {
          'United Kingdom': 'uk',
          'Germany': 'germany',
          'Ireland': 'ireland',
          'Canada': 'canada',
          'Australia': 'australia',
          'UAE (Dubai)': 'uae'
        };
        const fcCountry = document.getElementById('fcCountry');
        if (fcCountry && countryMap[countryInp.value]) {
          fcCountry.value = countryMap[countryInp.value];
        }

        heroLeadForm.reset();
      });
    }

    // Form 1 Submission: Free Counselling
    freeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('fcName');
      const phoneInput = document.getElementById('fcPhone');
      const emailInput = document.getElementById('fcEmail');
      const academicInput = document.getElementById('fcAcademic');
      const interestInput = document.getElementById('fcInterest');
      const countryInput = document.getElementById('fcCountry');
      const dateInput = document.getElementById('fcDate');
      const slotInput = document.getElementById('fcTimeSlot');

      const v1 = validateField(nameInput, isValidName);
      const v2 = validateField(phoneInput, isValidPhone);
      const v3 = validateField(emailInput, isValidEmail);
      const v4 = validateField(academicInput, (v) => !!v);
      const v5 = validateField(interestInput, (v) => !!v);
      const v6 = validateField(countryInput, (v) => !!v);
      const v7 = validateField(dateInput, (v) => !!v && v >= dateInput.min);
      const v8 = validateField(slotInput, (v) => !!v);

      if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6 || !v7 || !v8) {
        const firstInvalid = freeForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const formData = {
        formType: 'Study Abroad Free Counselling Session',
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        academicBackground: academicInput.value,
        areaOfInterest: interestInput.value,
        targetCountry: countryInput.value,
        preferredDate: dateInput.value,
        preferredSlot: slotInput.value,
        contactMode: freeForm.querySelector('input[name="contactMode"]:checked')?.value || 'Phone call',
        timestamp: new Date().toISOString()
      };

      submitForm(freeForm, formData, document.getElementById('fcSubmitBtn'));
    });

    // Form 2 Submission: Book Package
    pkgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('bpName');
      const phoneInput = document.getElementById('bpPhone');
      const emailInput = document.getElementById('bpEmail');
      const pkgInput = document.getElementById('bpPackage');

      const v1 = validateField(nameInput, isValidName);
      const v2 = validateField(phoneInput, isValidPhone);
      const v3 = validateField(emailInput, isValidEmail);
      const v4 = validateField(pkgInput, (v) => !!v);

      if (!v1 || !v2 || !v3 || !v4) {
        const firstInvalid = pkgForm.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const formData = {
        formType: 'Study Abroad Package Booking',
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        selectedPackage: pkgInput.value,
        message: document.getElementById('bpMessage').value.trim(),
        pricingType: isPackageMode ? 'Full Package' : 'Per Session',
        timestamp: new Date().toISOString()
      };

      submitForm(pkgForm, formData, document.getElementById('bpSubmitBtn'));
    });

    function submitForm(formEl, data, submitBtn) {
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="form-spinner"></span> Submitting...';

      const endpoint = (CONFIG.forms && CONFIG.forms.endpoint) || '';
      const accessKey = (CONFIG.forms && CONFIG.forms.accessKey) || '';

      if (endpoint && endpoint.trim().length > 0) {
        const payload = accessKey ? { ...data, access_key: accessKey } : data;
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        })
          .then((res) => {
            if (!res.ok) throw new Error('Submission failed');
            return res.json();
          })
          .then(() => handleSuccess(formEl, submitBtn, originalBtnText))
          .catch((err) => {
            console.error('Submission error:', err);
            alert('Unable to transmit inquiry. Please reach out directly via WhatsApp or phone.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          });
      } else {
        setTimeout(() => {
          handleSuccess(formEl, submitBtn, originalBtnText);
        }, 1200);
      }
    }

    function handleSuccess(formEl, submitBtn, originalBtnText) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      formEl.reset();
      formEl.style.display = 'none';

      if (statusArea) {
        statusArea.classList.add('is-active');
        statusArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  /**
   * 21. PRESELECTION HELPERS
   */
  function scrollToEnquiry() {
    const el = document.getElementById('enquiry');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function setupPreselections() {
    document.addEventListener('click', (e) => {
      // Destination preselection
      const destBtn = e.target.closest('[data-preselect-dest]');
      if (destBtn) {
        const destName = destBtn.dataset.preselectDest;
        scrollToEnquiry();
        document.getElementById('tabFreeCounsellingBtn')?.click();
        const countryMap = {
          'United Kingdom': 'uk',
          'Germany': 'germany',
          'Ireland': 'ireland',
          'Canada': 'canada',
          'Australia': 'australia',
          'UAE (Dubai)': 'uae'
        };
        const sel = document.getElementById('fcCountry');
        if (sel && countryMap[destName]) sel.value = countryMap[destName];
      }

      // University preselection
      const uniBtn = e.target.closest('[data-preselect-uni]');
      if (uniBtn) {
        const uniName = uniBtn.dataset.uniName;
        scrollToEnquiry();
        document.getElementById('tabBookPackageBtn')?.click();
        const msgField = document.getElementById('bpMessage');
        if (msgField) msgField.value = `Inquiring about admission pathways for ${uniName}`;
      }

      // Package preselection
      const pkgBtn = e.target.closest('[data-preselect-package]');
      if (pkgBtn) {
        const pkgId = pkgBtn.dataset.preselectPackage;
        scrollToEnquiry();
        document.getElementById('tabBookPackageBtn')?.click();
        const sel = document.getElementById('bpPackage');
        if (sel) sel.value = pkgId;
      }
    });
  }

  /**
   * 22. NAVIGATION, SCROLL PROGRESS & MOBILE BAR BEHAVIOUR
   */
  let lastScrollY = window.scrollY;

  function setupNavigation() {
    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('is-open');
        mobileMenu.classList.toggle('is-open', !isOpen);
        navToggle.classList.toggle('is-active', !isOpen);
        navToggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        document.body.classList.toggle('nav-locked', !isOpen);
      });

      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('is-open');
          navToggle.classList.remove('is-active');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-locked');
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
          mobileMenu.classList.remove('is-open');
          navToggle.classList.remove('is-active');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-locked');
        }
      });
    }

    window.addEventListener(
      'scroll',
      () => {
        const currentY = window.scrollY;
        const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Progress line
        if (scrollProgress && totalDocHeight > 0) {
          const ratio = Math.min(Math.max(currentY / totalDocHeight, 0), 1);
          scrollProgress.style.transform = `scaleX(${ratio})`;
        }

        // Nav shadow & hide/show
        if (navbar) {
          if (currentY > 80) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }

          if (currentY > 300 && currentY > lastScrollY && !mobileMenu.classList.contains('is-open')) {
            navbar.classList.add('nav-hidden');
          } else {
            navbar.classList.remove('nav-hidden');
          }
        }

        // Sticky Mobile Bar
        if (stickyMobileBar && heroSection) {
          const heroRect = heroSection.getBoundingClientRect();
          const enquiryRect = enquirySection ? enquirySection.getBoundingClientRect() : null;

          const heroPassed = heroRect.bottom < 0;
          const inEnquiry = enquiryRect && enquiryRect.top < window.innerHeight && enquiryRect.bottom > 0;

          if (heroPassed && !inEnquiry) {
            stickyMobileBar.classList.add('is-visible');
          } else {
            stickyMobileBar.classList.remove('is-visible');
          }
        }

        // Highlight active nav item
        highlightNavLinks();

        lastScrollY = currentY;
      },
      { passive: true }
    );
  }

  function highlightNavLinks() {
    const sections = document.querySelectorAll('section[id], main > section[id]');
    let currentId = '';

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) {
        currentId = sec.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentId}`);
    });
  }

  /**
   * 23. IMAGE FALLBACK HANDLER
   * If an image is missing, show soft blue-to-teal gradient with faint yellow glow
   */
  function setupImageFallbacks() {
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent) {
          parent.style.background = 'linear-gradient(135deg, #2357E0 0%, #2EC4B6 60%, #FFC93C 100%)';
          parent.style.display = 'flex';
          parent.style.alignItems = 'center';
          parent.style.justifyContent = 'center';
          parent.style.color = '#FFFFFF';
          parent.style.fontFamily = 'var(--font-headlines)';
          parent.style.fontWeight = '700';
          parent.style.fontSize = '1.1rem';
          parent.style.textAlign = 'center';
          parent.style.padding = '1rem';
          const altText = img.getAttribute('alt') || 'University Campus';
          parent.setAttribute('aria-label', altText);
          parent.innerHTML = `<span>${altText}</span>`;
        }
      });
    });
  }

  /**
   * INITIALIZE
   */
  function init() {
    applyTheme();
    syncBrandDetails();
    applyFeatureSwitches();
    renderTrustStrip();
    renderWhyChooseUs();
    renderDestinations();
    renderIndianUniversities();
    renderInternationalUniversities();
    setupUniversityModal();
    renderServices();
    renderCounsellors();
    renderProcess();
    renderPackages();
    setupPackageToggle();
    renderTimetable();
    renderGallery();
    renderSuccessStories();
    renderTestimonials();
    renderFaq();
    renderHoursTable();
    setupForms();
    setupPreselections();
    setupNavigation();
    setupImageFallbacks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
