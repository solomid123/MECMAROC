/* =========================================================
   Site-wide partial injection + active-route highlighting.
   Inserts /partials/header.html and /partials/footer.html
   into the placeholders #site-header / #site-footer on
   every page. Runs as early as possible; must be loaded
   before main.js on pages that rely on nav elements.
   ========================================================= */
// Pre-initialize theme to prevent flash of dark content
(() => {
  try {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (storedTheme === 'light' || (!storedTheme && systemPrefersLight)) {
      document.documentElement.classList.add('light-mode');
    }
  } catch (e) {
    console.warn('[Theme] LocalStorage read blocked or failed on load:', e);
  }
})();

(async () => {
  const HEADER = '/partials/header.html';
  const FOOTER = '/partials/footer.html';

  async function inject(targetSelector, url) {
    const host = document.querySelector(targetSelector);
    if (!host) return;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${url} → ${res.status}`);
      host.innerHTML = await res.text();
    } catch (err) {
      console.warn('[includes] failed to load', url, err);
    }
  }

  await Promise.all([
    inject('#site-header', HEADER),
    inject('#site-footer', FOOTER)
  ]);

  initTheme();

  // Mark the active nav item from <body data-route="...">.
  const route = document.body.dataset.route;
  if (route) {
    const link = document.querySelector(`.nav-links a[data-route="${route}"]`);
    if (link) link.classList.add('is-active');
    const parent = document.querySelector(`.nav-links [data-route-match="${route}"]`);
    if (parent) parent.classList.add('is-active');
  }

  initMobileNav();
  initTouchMegaMenus();

  // Expose a ready event so main.js (or page scripts) can wait.
  document.dispatchEvent(new CustomEvent('partials:ready'));

  /* ---------------------------------------------------------
     Mobile nav drawer: hamburger toggle, focus trap-lite,
     body scroll lock, close on link click / Escape.
     --------------------------------------------------------- */
  function initMobileNav() {
    const burger = document.querySelector('.nav-burger');
    const drawer = document.getElementById('navDrawer');
    if (!burger || !drawer) return;

    const open = () => {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    };
    const close = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    };

    burger.addEventListener('click', () => {
      drawer.classList.contains('is-open') ? close() : open();
    });

    // Close when tapping any link inside the drawer (same-page nav edge case).
    drawer.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', close)
    );

    // Close when tapping the dimmed backdrop (outside the drawer panel).
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) close();
    });

    // Close on Escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    // Close if viewport grows past the mobile breakpoint while open.
    const mq = window.matchMedia('(min-width: 821px)');
    mq.addEventListener('change', (e) => { if (e.matches) close(); });
  }

  /* ---------------------------------------------------------
     Touch-friendly mega-menus: on coarse pointers (phones /
     tablets), toggle submenu on tap instead of relying on
     :hover, which never triggers on touch.
     --------------------------------------------------------- */
  function initTouchMegaMenus() {
    const isCoarse = window.matchMedia('(hover: none)').matches;
    if (!isCoarse) return;

    document.querySelectorAll('.nav-links .has-menu').forEach((li) => {
      const trigger = li.querySelector('.nav-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const wasOpen = li.classList.contains('is-tap-open');
        // Close any siblings
        document.querySelectorAll('.nav-links .has-menu.is-tap-open')
          .forEach((n) => n.classList.remove('is-tap-open'));
        if (!wasOpen) li.classList.add('is-tap-open');
      });
    });

    // Tap outside closes any open mega-menu.
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-links .has-menu')) {
        document.querySelectorAll('.nav-links .has-menu.is-tap-open')
          .forEach((n) => n.classList.remove('is-tap-open'));
      }
    });
  }

  function initTheme() {
    console.log('[Theme] Initializing theme toggle...');
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) {
      console.warn('[Theme] #themeToggle element not found in DOM!');
      return;
    }

    const sunIcon = toggleBtn.querySelector('.sun-icon');
    const moonIcon = toggleBtn.querySelector('.moon-icon');
    console.log('[Theme] Icons found:', { sunIcon: !!sunIcon, moonIcon: !!moonIcon });

    const updateIcons = (light) => {
      console.log('[Theme] Updating icons. Light mode active:', light);
      try {
        if (sunIcon) sunIcon.style.display = light ? 'none' : 'block';
        if (moonIcon) moonIcon.style.display = light ? 'block' : 'none';
      } catch (e) {
        console.error('[Theme] Error updating icons:', e);
      }
    };

    try {
      const isLight = document.documentElement.classList.contains('light-mode');
      updateIcons(isLight);
    } catch (e) {
      console.error('[Theme] Error setting initial icon state:', e);
    }

    toggleBtn.addEventListener('click', (e) => {
      console.log('[Theme] Toggle button clicked!');
      try {
        const currentlyLight = document.documentElement.classList.toggle('light-mode');
        console.log('[Theme] Toggled light-mode class. Now light:', currentlyLight);
        
        try {
          localStorage.setItem('theme', currentlyLight ? 'light' : 'dark');
        } catch (storageErr) {
          console.warn('[Theme] LocalStorage write blocked or failed:', storageErr);
        }
        
        updateIcons(currentlyLight);
      } catch (clickErr) {
        console.error('[Theme] Error handling click:', clickErr);
      }
    });
    console.log('[Theme] Event listener attached successfully.');
  }
})();
