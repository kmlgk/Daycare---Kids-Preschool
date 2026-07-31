/* ==========================================================================
   Little Sprouts Early Learning — Template 02 (Daycare & Kids Preschool)
   Shared vanilla-JS behavior for every page.
   ========================================================================== */
(function () {
  'use strict';

  var DESKTOP_BREAKPOINT = 1280; // px — matches Tailwind `xl`; centered-logo split nav needs the extra room
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Theme (dark / light) — persisted in localStorage
   * ------------------------------------------------------------------ */
  function initTheme() {
    var stored = localStorage.getItem('ls-theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored ? stored === 'dark' : systemDark;
    root.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nowDark = !root.classList.contains('dark');
        root.classList.toggle('dark', nowDark);
        localStorage.setItem('ls-theme', nowDark ? 'dark' : 'light');
        updateThemeIcons(nowDark);
      });
    });
  }

  function updateThemeIcons(isDark) {
    document.querySelectorAll('[data-icon="sun"]').forEach(function (el) {
      el.classList.toggle('hidden', !isDark);
    });
    document.querySelectorAll('[data-icon="moon"]').forEach(function (el) {
      el.classList.toggle('hidden', isDark);
    });
  }

  /* ------------------------------------------------------------------ *
   * Direction (RTL / LTR) — persisted in localStorage
   * ------------------------------------------------------------------ */
  function initDirection() {
    var stored = localStorage.getItem('ls-dir') || 'ltr';
    applyDirection(stored);

    document.querySelectorAll('[data-dir-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
        applyDirection(next);
        localStorage.setItem('ls-dir', next);
      });
    });
  }

  function applyDirection(dir) {
    root.setAttribute('dir', dir);
    document.querySelectorAll('[data-dir-label]').forEach(function (el) {
      el.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  /* ------------------------------------------------------------------ *
   * Smart-scroll header: hide the top utility bar + add shadow on scroll
   * ------------------------------------------------------------------ */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    var utilityBar = document.querySelector('.utility-bar');
    if (!header) return;
    var lastY = window.scrollY;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 12);
      if (utilityBar) {
        utilityBar.classList.toggle('is-hidden', y > 120 && y > lastY);
      }
      lastY = y;
      toggleBackToTop(y);
    }, { passive: true });
  }

  function toggleBackToTop(y) {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.classList.toggle('show', y > 500);
  }

  /* ------------------------------------------------------------------ *
   * Mobile full-screen overlay menu
   * ------------------------------------------------------------------ */
  function initMobileMenu() {
    var openBtn = document.querySelector('[data-menu-open]');
    var closeBtn = document.querySelector('[data-menu-close]');
    var overlay = document.getElementById('mobile-overlay');
    if (!openBtn || !overlay) return;
    var lastFocused;

    function open() {
      lastFocused = document.activeElement;
      overlay.classList.add('open');
      overlay.removeAttribute('aria-hidden');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var firstLink = overlay.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }
    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= DESKTOP_BREAKPOINT && overlay.classList.contains('open')) close();
    });
  }

  /* ------------------------------------------------------------------ *
   * Desktop "Home" dropdown (Home 1 / Home 2) — click + keyboard, closes
   * on outside click, Escape, or link selection
   * ------------------------------------------------------------------ */
  function initDesktopDropdown() {
    document.querySelectorAll('[data-dropdown]').forEach(function (dropdown) {
      var trigger = dropdown.querySelector('[data-dropdown-trigger]');
      var panel = dropdown.querySelector('[data-dropdown-panel]');
      if (!trigger || !panel) return;

      function open() {
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      function close() {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      // Click/tap always opens (never toggles closed) so a hover-then-click
      // mouse user isn't fighting their own hover state; closing is handled
      // separately via outside-click, Escape, focus-out, and mouseleave.
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      });
      dropdown.addEventListener('mouseenter', open);
      dropdown.addEventListener('mouseleave', close);
      dropdown.addEventListener('focusout', function (e) {
        if (!dropdown.contains(e.relatedTarget)) close();
      });
      panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
      document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target)) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
          close();
          trigger.focus();
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Mobile "Home" submenu (Home 1 / Home 2) — inline accordion toggle
   * inside the full-screen overlay
   * ------------------------------------------------------------------ */
  function initMobileSubmenu() {
    document.querySelectorAll('[data-mobile-submenu-toggle]').forEach(function (btn) {
      var panelId = btn.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        panel.classList.toggle('open', !isOpen);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Accordion — used by FAQ page and Daily Schedule section
   * ------------------------------------------------------------------ */
  function initAccordions() {
    document.querySelectorAll('[data-accordion]').forEach(function (group) {
      var singleOpen = group.getAttribute('data-accordion') === 'single';
      group.querySelectorAll('.accordion-item').forEach(function (item) {
        var trigger = item.querySelector('.accordion-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function () {
          var isOpen = item.getAttribute('data-open') === 'true';
          if (singleOpen) {
            group.querySelectorAll('.accordion-item').forEach(function (i) {
              i.setAttribute('data-open', 'false');
              var t = i.querySelector('.accordion-trigger');
              if (t) t.setAttribute('aria-expanded', 'false');
            });
          }
          item.setAttribute('data-open', isOpen && singleOpen ? 'false' : String(!isOpen));
          trigger.setAttribute('aria-expanded', String(!isOpen));
        });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Tabs — Age-Group Programs (Home + Programs page), URL-hash aware
   * ------------------------------------------------------------------ */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var buttons = group.querySelectorAll('.tab-btn');
      var panels = group.querySelectorAll('.tab-panel');

      function activate(key) {
        buttons.forEach(function (b) {
          var match = b.getAttribute('data-tab') === key;
          b.setAttribute('aria-selected', String(match));
          b.tabIndex = match ? 0 : -1;
        });
        panels.forEach(function (p) {
          p.classList.toggle('hidden', p.getAttribute('data-panel') !== key);
        });
      }

      buttons.forEach(function (btn, idx) {
        btn.addEventListener('click', function () {
          activate(btn.getAttribute('data-tab'));
          history.replaceState(null, '', '#' + btn.getAttribute('data-tab'));
        });
        btn.addEventListener('keydown', function (e) {
          var i = idx;
          if (e.key === 'ArrowRight') i = (idx + 1) % buttons.length;
          else if (e.key === 'ArrowLeft') i = (idx - 1 + buttons.length) % buttons.length;
          else return;
          buttons[i].focus();
          activate(buttons[i].getAttribute('data-tab'));
        });
      });

      var hash = window.location.hash.replace('#', '');
      var hasHash = hash && group.querySelector('[data-tab="' + hash + '"]');
      activate(hasHash ? hash : buttons[0].getAttribute('data-tab'));
    });
  }

  /* ------------------------------------------------------------------ *
   * Teacher bio modal
   * ------------------------------------------------------------------ */
  function initTeacherModal() {
    var backdrop = document.getElementById('teacher-modal');
    if (!backdrop) return;
    var panel = backdrop.querySelector('.modal-panel');
    var nameEl = backdrop.querySelector('[data-modal-name]');
    var roleEl = backdrop.querySelector('[data-modal-role]');
    var bioEl = backdrop.querySelector('[data-modal-bio]');
    var imgEl = backdrop.querySelector('[data-modal-img]');
    var closeBtn = backdrop.querySelector('[data-modal-close]');
    var yearsEl = backdrop.querySelector('[data-modal-years]');
    var qualEl = backdrop.querySelector('[data-modal-qualification]');
    var statsRow = backdrop.querySelector('[data-modal-stats]');
    var specialtiesEl = backdrop.querySelector('[data-modal-specialties]');
    var quoteEl = backdrop.querySelector('[data-modal-quote]');
    var certsEl = backdrop.querySelector('[data-modal-certifications]');
    var lastFocused;

    function fillTags(container, csv, colorClass) {
      if (!container) return;
      var items = (csv || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      container.innerHTML = '';
      container.classList.toggle('hidden', items.length === 0);
      items.forEach(function (text) {
        var span = document.createElement('span');
        span.className = 'text-xs font-semibold px-3 py-1 rounded-full ' + colorClass;
        span.textContent = text;
        container.appendChild(span);
      });
    }

    document.querySelectorAll('[data-teacher-card]').forEach(function (card) {
      card.addEventListener('click', function () {
        lastFocused = document.activeElement;
        nameEl.textContent = card.getAttribute('data-name');
        roleEl.textContent = card.getAttribute('data-role');
        bioEl.textContent = card.getAttribute('data-bio');
        imgEl.src = card.getAttribute('data-img');
        imgEl.alt = card.getAttribute('data-name');

        var years = card.getAttribute('data-years');
        var qualification = card.getAttribute('data-qualification');
        if (yearsEl) { yearsEl.innerHTML = years ? '<i class="fa-solid fa-clock text-sky-500" aria-hidden="true"></i> ' + years + ' yrs experience' : ''; }
        if (qualEl) { qualEl.innerHTML = qualification ? '<i class="fa-solid fa-graduation-cap text-leaf-500" aria-hidden="true"></i> ' + qualification : ''; }
        if (statsRow) { statsRow.classList.toggle('hidden', !years && !qualification); }

        fillTags(specialtiesEl, card.getAttribute('data-specialties'), 'bg-coral-100 dark:bg-coral-500/15 text-coral-700 dark:text-coral-300');
        fillTags(certsEl, card.getAttribute('data-certifications'), 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300');

        var quote = card.getAttribute('data-quote');
        if (quoteEl) {
          quoteEl.textContent = quote ? '“' + quote + '”' : '';
          quoteEl.classList.toggle('hidden', !quote);
        }

        backdrop.classList.add('open');
        backdrop.removeAttribute('aria-hidden');
        closeBtn.focus();
        document.body.style.overflow = 'hidden';
      });
    });

    function close() {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
    });
  }

  /* ------------------------------------------------------------------ *
   * Gallery filter (Gallery page)
   * ------------------------------------------------------------------ */
  function initGalleryFilter() {
    var filterBar = document.querySelector('[data-gallery-filters]');
    var grid = document.querySelector('[data-gallery-grid]');
    if (!filterBar || !grid) return;
    var buttons = filterBar.querySelectorAll('[data-filter]');
    var items = Array.prototype.slice.call(grid.querySelectorAll('[data-gallery-item]'));
    var loadMoreBtn = document.querySelector('[data-gallery-load-more]');
    var countLabel = document.querySelector('[data-gallery-count]');
    var batchSize = parseInt(grid.getAttribute('data-batch-size'), 10) || items.length;
    var totalBatches = Math.ceil(items.length / batchSize);
    var currentFilter = 'all';
    var batchesShown = 1;

    // Populate each filter button's live photo count (e.g. "Classrooms (4)")
    buttons.forEach(function (btn) {
      var filter = btn.getAttribute('data-filter');
      var countEl = btn.querySelector('[data-filter-count]');
      if (!countEl) return;
      var count = filter === 'all' ? items.length : items.filter(function (i) { return i.getAttribute('data-gallery-item') === filter; }).length;
      countEl.textContent = count;
    });

    function revealItem(item) {
      item.style.display = '';
      item.classList.remove('gallery-tile-visible');
      // eslint-disable-next-line no-unused-expressions
      item.offsetHeight; // force reflow so the transition re-triggers
      requestAnimationFrame(function () { item.classList.add('gallery-tile-visible'); });
    }
    function hideItem(item) {
      item.classList.remove('gallery-tile-visible');
      item.style.display = 'none';
    }

    function render() {
      var visibleCount = 0;
      items.forEach(function (item, index) {
        var matchesFilter = currentFilter === 'all' || item.getAttribute('data-gallery-item') === currentFilter;
        var withinBatch = currentFilter !== 'all' || Math.floor(index / batchSize) < batchesShown;
        var show = matchesFilter && withinBatch;
        if (show) { revealItem(item); visibleCount++; } else { hideItem(item); }
      });
      var moreAvailable = currentFilter === 'all' && batchesShown < totalBatches;
      if (loadMoreBtn) loadMoreBtn.classList.toggle('hidden', !moreAvailable);
      if (countLabel) {
        var totalForFilter = currentFilter === 'all' ? items.length : items.filter(function (i) { return i.getAttribute('data-gallery-item') === currentFilter; }).length;
        countLabel.textContent = 'Showing ' + visibleCount + ' of ' + totalForFilter + ' photos';
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
        btn.setAttribute('aria-selected', 'true');
        currentFilter = btn.getAttribute('data-filter');
        batchesShown = 1;
        render();
      });
    });

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        batchesShown++;
        render();
      });
    }

    render();
  }

  /* ------------------------------------------------------------------ *
   * FAQ search
   * ------------------------------------------------------------------ */
  function initFaqSearch() {
    var input = document.getElementById('faq-search');
    if (!input) return;
    var items = document.querySelectorAll('[data-faq-item]');
    var noResults = document.getElementById('faq-no-results');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var visibleCount = 0;
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var show = text.indexOf(q) !== -1;
        item.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      if (noResults) noResults.classList.toggle('hidden', visibleCount !== 0);
    });
  }

  /* ------------------------------------------------------------------ *
   * Form validation helper
   * ------------------------------------------------------------------ */
  function validateField(field) {
    var input = field.querySelector('input, select, textarea');
    if (!input) return true;
    var errorMsg = field.querySelector('.form-error-msg');
    var valid = input.checkValidity();

    if (valid && input.type === 'date' && input.hasAttribute('min') && input.value) {
      valid = input.value >= input.getAttribute('min');
      if (!valid && errorMsg) errorMsg.textContent = 'Please choose a date from today onward.';
    }
    if (valid && input.getAttribute('data-phone') && input.value) {
      valid = /^[0-9+()\-\s]{7,20}$/.test(input.value);
      if (!valid && errorMsg) errorMsg.textContent = 'Please enter a valid phone number.';
    }
    if (!valid && errorMsg && !errorMsg.textContent) {
      errorMsg.textContent = input.validationMessage || 'Please check this field.';
    }
    field.classList.toggle('has-error', !valid);
    return valid;
  }

  function initDateDefaults() {
    var today = new Date();
    var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    document.querySelectorAll('[data-min-today]').forEach(function (input) { input.min = iso; });
    document.querySelectorAll('[data-max-today]').forEach(function (input) { input.max = iso; });
  }

  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      var fields = form.querySelectorAll('.form-field');
      var successBox = form.querySelector('[data-form-success]');

      fields.forEach(function (field) {
        var input = field.querySelector('input, select, textarea');
        if (!input) return;
        input.addEventListener('blur', function () { validateField(field); });
        input.addEventListener('input', function () {
          if (field.classList.contains('has-error')) validateField(field);
        });
      });

      // Child DOB -> suggested age group (admissions form)
      var dobInput = form.querySelector('[data-child-dob]');
      var suggestionEl = form.querySelector('[data-age-suggestion]');
      if (dobInput && suggestionEl) {
        dobInput.addEventListener('change', function () {
          if (!dobInput.value) { suggestionEl.textContent = ''; return; }
          var dob = new Date(dobInput.value);
          var months = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
          var group;
          if (months < 0) { suggestionEl.textContent = ''; return; }
          else if (months < 12) group = 'Infant Program (6 weeks – 12 months)';
          else if (months < 24) group = 'Toddler Program (1 – 2 years)';
          else if (months < 48) group = 'Preschool Program (3 – 4 years)';
          else group = 'Pre-K Program (4 – 5 years)';
          suggestionEl.textContent = 'Suggested program: ' + group;
        });
      }

      // Character counter
      var textarea = form.querySelector('[data-char-count]');
      var counter = form.querySelector('[data-char-count-display]');
      if (textarea && counter) {
        var max = parseInt(textarea.getAttribute('maxlength') || '500', 10);
        var updateCount = function () {
          counter.textContent = textarea.value.length + ' / ' + max;
        };
        textarea.addEventListener('input', updateCount);
        updateCount();
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var allValid = true;
        fields.forEach(function (field) {
          if (!validateField(field)) allValid = false;
        });
        if (!allValid) {
          var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
          if (firstError) firstError.focus();
          return;
        }
        form.reset();
        fields.forEach(function (field) { field.classList.remove('has-error'); });
        if (successBox) {
          successBox.classList.remove('hidden');
          successBox.setAttribute('tabindex', '-1');
          successBox.focus();
          setTimeout(function () { successBox.classList.add('hidden'); }, 8000);
        }
      });
    });

    // Password visibility toggles (used on Contact page "staff login" note N/A — kept generic)
    document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-toggle-password'));
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Active nav link (aria-current) based on current file name
   * ------------------------------------------------------------------ */
  function initActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .menu-item a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  function initFooterYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------ *
   * Back to top button
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ *
   * Horizontal scroll strips (polaroid filmstrips, timelines, etc.)
   * On desktop a mouse only has a vertical wheel, and the scrollbar is
   * intentionally hidden — without help, hovering the strip just scrolls
   * the page and the extra content is unreachable. Redirect vertical
   * wheel input into horizontal scroll, and support click-and-drag.
   * ------------------------------------------------------------------ */
  function initHorizontalScrollStrips() {
    document.querySelectorAll('.overflow-x-auto.no-scrollbar').forEach(function (strip) {
      strip.addEventListener('wheel', function (e) {
        if (strip.scrollWidth <= strip.clientWidth) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          strip.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });

      var isDown = false, startX = 0, startScrollLeft = 0, moved = false;
      strip.addEventListener('mousedown', function (e) {
        if (strip.scrollWidth <= strip.clientWidth) return;
        isDown = true;
        moved = false;
        strip.classList.add('is-dragging');
        startX = e.pageX;
        startScrollLeft = strip.scrollLeft;
      });
      window.addEventListener('mouseup', function () {
        isDown = false;
        strip.classList.remove('is-dragging');
      });
      strip.addEventListener('mouseleave', function () {
        isDown = false;
        strip.classList.remove('is-dragging');
      });
      strip.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        var delta = e.pageX - startX;
        if (Math.abs(delta) > 3) moved = true;
        strip.scrollLeft = startScrollLeft - delta;
      });
      // Suppress the click on a link/card immediately after a drag so
      // dragging the strip doesn't accidentally activate what's under the cursor.
      strip.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
    });
  }

  /* ------------------------------------------------------------------ *
   * GSAP ScrollTrigger reveals
   * ------------------------------------------------------------------ */
  function initScrollReveals() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    var groups = {};
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var key = el.getAttribute('data-reveal-group') || Math.random().toString(36);
      groups[key] = groups[key] || [];
      groups[key].push(el);
    });
    Object.keys(groups).forEach(function (key) {
      gsap.from(groups[key], {
        y: 36,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: groups[key][0],
          start: 'top 85%',
        },
      });
    });

    document.querySelectorAll('[data-reveal-number]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-reveal-number'));
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.val).toLocaleString(); },
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Typed.js hero word-cycle
   * ------------------------------------------------------------------ */
  function initTyped() {
    var el = document.getElementById('typed-hero');
    if (!el || typeof Typed === 'undefined' || prefersReducedMotion) return;
    new Typed(el, {
      strings: ['Loving Care.', 'Early Learning.', 'Bright Futures.', 'Joyful Days.'],
      typeSpeed: 55,
      backSpeed: 30,
      backDelay: 1400,
      loop: true,
      smartBackspace: true,
    });
  }

  /* ------------------------------------------------------------------ *
   * Swiper instances
   * ------------------------------------------------------------------ */
  function initSwipers() {
    if (typeof Swiper === 'undefined') return;
    if (document.querySelector('.teacher-swiper')) {
      new Swiper('.teacher-swiper', {
        slidesPerView: 2,
        spaceBetween: 20,
        loop: true,
        autoplay: { delay: 3200, disableOnInteraction: false },
        breakpoints: {
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        },
      });
    }
    if (document.querySelector('.testimonial-swiper')) {
      new Swiper('.testimonial-swiper', {
        slidesPerView: 1,
        loop: true,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.testimonial-pagination', clickable: true },
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * GLightbox
   * ------------------------------------------------------------------ */
  function initLightbox() {
    if (typeof GLightbox === 'undefined') return;
    GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true });
  }

  /* ------------------------------------------------------------------ *
   * Graceful fallback for any photo that fails to load
   * ------------------------------------------------------------------ */
  var PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23FFE08A'/%3E%3Cstop offset='1' stop-color='%2385D6F2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3Ccircle cx='240' cy='420' r='70' fill='%23ffffff' fill-opacity='.4'/%3E%3Ccircle cx='560' cy='170' r='100' fill='%23ffffff' fill-opacity='.3'/%3E%3Cpath d='M0 470 Q200 400 400 470 T800 470 V600 H0 Z' fill='%23ffffff' fill-opacity='.25'/%3E%3C/svg%3E";
  function initImageFallback() {
    document.querySelectorAll('img.ph-img').forEach(function (img) {
      img.addEventListener('error', function () {
        this.onerror = null;
        this.src = PLACEHOLDER_SVG;
        this.classList.add('object-cover');
      }, { once: true });
    });
  }

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initDirection();
    initHeaderScroll();
    initMobileMenu();
    initDesktopDropdown();
    initMobileSubmenu();
    initAccordions();
    initTabs();
    initTeacherModal();
    initGalleryFilter();
    initFaqSearch();
    initDateDefaults();
    initForms();
    initActiveNav();
    initFooterYear();
    initBackToTop();
    initHorizontalScrollStrips();
    initScrollReveals();
    initTyped();
    initSwipers();
    initLightbox();
    initImageFallback();
  });
})();
