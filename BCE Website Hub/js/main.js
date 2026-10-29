/* ==========================================================================
   BCE — Interaction layer
   Boots the shared shell, renders data-driven sections, then wires behaviour.
   ========================================================================== */

(function (BCE) {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll reveal ---------------------------------------------------- */

  function revealSupported() {
    return ('IntersectionObserver' in window) && !reduceMotion;
  }

  /* Applied before any rendering so revealed content never flashes in at full
     opacity and then jumps back to its start position. */
  function enableReveal() {
    if (revealSupported()) document.documentElement.classList.add('js-reveal');
  }

  var revealIO = null;

  function initReveal() {
    if (!revealSupported()) return;   // content stays visible, no observer

    /* Elements are kept under observation rather than unobserved on first hit,
       so the reveal replays when a section is scrolled back into view - the
       motion reads the same going up as going down. */
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { rootMargin: '-4% 0px -8% 0px', threshold: 0.06 });

    BCE.observeReveal(document);
  }

  /* Anything rendered AFTER boot must be handed to the observer, or it keeps
     the hidden start state forever. observe() on an already-watched element is
     a no-op, so this is safe to call repeatedly. */
  BCE.observeReveal = function (scope) {
    if (!revealIO) return;
    (scope || document).querySelectorAll('[data-reveal]').forEach(function (el) {
      revealIO.observe(el);
    });
  };

  /* ---- Navigation ------------------------------------------------------- */

  function initNav() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      var onScroll = function () {
        navbar.classList.toggle('is-stuck', window.scrollY > 8);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* Services mega-menu — click only. Hovering the tab must not open it, so
       there are deliberately no mouseenter/mouseleave handlers here. */
    document.querySelectorAll('[data-dropdown]').forEach(function (item) {
      var trigger = item.querySelector('.nav-link');

      function open()  { item.classList.add('is-open');    trigger.setAttribute('aria-expanded', 'true'); }
      function close() { item.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        item.classList.contains('is-open') ? close() : open();
      });

      /* Click anywhere outside, or pick an item inside, and it closes. */
      document.addEventListener('click', function (e) {
        if (!item.contains(e.target)) close();
      });
      item.addEventListener('click', function (e) {
        if (e.target.closest('.menu-card')) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { close(); trigger.blur(); }
      });
    });

    /* Mobile drawer */
    var toggle = document.getElementById('nav-toggle');
    var drawer = document.getElementById('mobile-drawer');
    var scrim  = document.getElementById('drawer-scrim');
    if (toggle && drawer && scrim) {
      var setOpen = function (open) {
        toggle.classList.toggle('is-open', open);
        drawer.classList.toggle('is-open', open);
        scrim.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      };
      toggle.addEventListener('click', function () { setOpen(!drawer.classList.contains('is-open')); });
      scrim.addEventListener('click', function () { setOpen(false); });
      drawer.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
    }
  }

  /* ---- Service search --------------------------------------------------- */

  function initSearch() {
    var input = document.getElementById('site-search');
    var panel = document.getElementById('search-results');
    if (!input || !panel) return;

    function render(matches) {
      if (!matches.length) {
        panel.innerHTML = '<p class="search-results__empty">No services match that.</p>';
        return;
      }
      panel.innerHTML = matches.map(function (s) {
        return '<a class="search-results__item" href="service.html?s=' + s.slug + '">' +
                 '<img src="' + (s.thumb || s.image) + '" alt="" loading="lazy">' +
                 '<span><strong>' + s.title + '</strong></span>' +
               '</a>';
      }).join('');
    }

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { panel.classList.remove('is-open'); return; }
      render(BCE.services.filter(function (s) {
        return (s.title + ' ' + s.menuDesc).toLowerCase().indexOf(q) > -1;
      }));
      panel.classList.add('is-open');
    });

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var first = panel.querySelector('.search-results__item');
      if (first) window.location.href = first.getAttribute('href');
    });

    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== input) panel.classList.remove('is-open');
    });
  }

  /* ---- Hero marquee ------------------------------------------------------
     Duration is derived from the rendered track so the pixels-per-second rate
     stays constant no matter how many slides or how wide the viewport is.    */

  function initMarquee() {
    var track = document.querySelector('.hero__track');
    if (!track || reduceMotion) return;

    var setDuration = function () {
      var halfWidth = track.scrollWidth / 2;
      var seconds = Math.max(18, halfWidth / 55);   // ~55px per second
      track.style.setProperty('--marquee-duration', seconds.toFixed(1) + 's');
    };

    if (document.readyState === 'complete') setDuration();
    else window.addEventListener('load', setDuration);

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setDuration, 200);
    });
  }

  /* ---- Before / after slider -------------------------------------------- */

  function initCompare() {
    document.querySelectorAll('[data-compare]').forEach(function (root) {
      var dragging = false;

      function sync() {
        root.style.setProperty('--compare-width', root.clientWidth + 'px');
      }

      function setPos(clientX) {
        setPosRaw(clientX - root.getBoundingClientRect().left);
      }

      root.addEventListener('pointerdown', function (e) {
        dragging = true;
        root.setPointerCapture(e.pointerId);
        setPos(e.clientX);
      });
      root.addEventListener('pointermove', function (e) {
        if (dragging) setPos(e.clientX);
      });
      ['pointerup', 'pointercancel'].forEach(function (evt) {
        root.addEventListener(evt, function () { dragging = false; });
      });

      /* Keyboard support on the grip */
      var grip = root.querySelector('.compare__grip');
      if (grip) {
        grip.setAttribute('tabindex', '0');
        grip.setAttribute('role', 'slider');
        grip.setAttribute('aria-label', 'Reveal the finished result');
        grip.setAttribute('aria-valuemin', '0');
        grip.setAttribute('aria-valuemax', '100');
        grip.addEventListener('keydown', function (e) {
          var step = e.shiftKey ? 40 : 16;
          var current = parseFloat(getComputedStyle(root).getPropertyValue('--compare-pos')) || 32;
          if (e.key === 'ArrowLeft')  { e.preventDefault(); setPosRaw(current - step); }
          if (e.key === 'ArrowRight') { e.preventDefault(); setPosRaw(current + step); }
        });
      }

      /* Each badge only shows once its side of the handle has room for it, so
         a mid-drag shows both and either extreme shows just the one. */
      var badgeAfter  = root.querySelector('.compare__badge--after');
      var badgeBefore = root.querySelector('.compare__badge--before');
      var BADGE_ROOM = 150;

      function syncBadges(pos, w) {
        if (badgeAfter)  badgeAfter.classList.toggle('is-shown', pos > BADGE_ROOM);
        if (badgeBefore) badgeBefore.classList.toggle('is-shown', pos < w - BADGE_ROOM);
      }

      function setPosRaw(x) {
        var w = root.clientWidth;
        var clamped = Math.min(Math.max(x, 0), w);
        root.style.setProperty('--compare-pos', clamped + 'px');
        root.setAttribute('aria-valuenow', Math.round((clamped / w) * 100));
        syncBadges(clamped, w);
      }

      sync();
      setPosRaw(parseFloat(getComputedStyle(root).getPropertyValue('--compare-pos')) || 32);
      window.addEventListener('resize', function () { sync(); setPosRaw(root.clientWidth * 0.55); });

      /* Gentle opening hint so the control announces itself. */
      if (!reduceMotion && 'IntersectionObserver' in window) {
        var seen = false;
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || seen) return;
            seen = true;
            var target = root.clientWidth * 0.55;
            var start = performance.now();
            (function step(now) {
              var t = Math.min((now - start) / 900, 1);
              var eased = 1 - Math.pow(1 - t, 3);
              setPosRaw(32 + (target - 32) * eased);
              if (t < 1) requestAnimationFrame(step);
            })(start);
          });
        }, { threshold: 0.4 });
        io.observe(root);
      }
    });
  }

  /* ---- Map zoom (contact page) ------------------------------------------- */

  function initMapZoom() {
    var map = document.querySelector('.mapview');
    if (!map) return;

    var MIN = 1, MAX = 2.4, STEP = 0.3;
    var zoom = MIN;

    function apply() {
      map.style.setProperty('--map-zoom', zoom.toFixed(2));
      map.querySelectorAll('[data-map-zoom]').forEach(function (btn) {
        var dir = btn.getAttribute('data-map-zoom');
        btn.disabled = (dir === 'in' && zoom >= MAX) || (dir === 'out' && zoom <= MIN);
        btn.style.opacity = btn.disabled ? '.45' : '';
      });
    }

    map.querySelectorAll('[data-map-zoom]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        zoom = btn.getAttribute('data-map-zoom') === 'in'
          ? Math.min(MAX, zoom + STEP)
          : Math.max(MIN, zoom - STEP);
        apply();
      });
    });

    apply();
  }

  /* ---- Stat counters ----------------------------------------------------- */

  function initCounters() {
    var stats = document.querySelectorAll('[data-count]');
    if (!stats.length || !('IntersectionObserver' in window) || reduceMotion) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);

        var target = parseInt(el.getAttribute('data-count'), 10);
        var start = performance.now();
        (function step(now) {
          var t = Math.min((now - start) / 1200, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + '+';
          if (t < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.6 });

    stats.forEach(function (el) { io.observe(el); });
  }

  /* ---- Intro loader ------------------------------------------------------ */

  /* The curtain lives in the markup and animates entirely in CSS, so it works
     with scripting off. This only clears the dead node afterwards.

     Whether it runs at all is decided by the inline <head> script, which both
     reads AND writes the once-per-session flag. That has to happen in the
     head: writing it here, at DOMContentLoaded, meant a visitor who clicked
     through before this ran left the flag unset, and the next page replayed
     the whole curtain. Append ?intro=1 to any URL to force it. */

  var INTRO_MS = 4000;     /* keep in step with the CSS sequence above */

  function initIntro() {
    var intro = document.getElementById('intro');
    if (!intro) return;

    function drop() { if (intro.parentNode) intro.parentNode.removeChild(intro); }

    /* The head guard already hid it for this visit; just bin the dead node. */
    if (document.documentElement.classList.contains('intro-seen')) { drop(); return; }

    /* Start the page's own rise while the curtain is still fading, so the two
       overlap into one parallax hand-off rather than reading as two steps. */
    window.setTimeout(function () {
      document.documentElement.classList.add('intro-exit');
    }, INTRO_MS - 600);

    window.setTimeout(drop, INTRO_MS);
  }

  /* ---- Nav CTA colour ---------------------------------------------------- */

  /* "Get Quote" is charcoal while the top of the page is on screen and brand
     blue once you scroll past it.

     The trigger is each page's FIRST section, not ".hero" specifically, so the
     behaviour is identical on all four pages. On Home and Services that first
     section happens to be the hero; on About and Contact it is their opening
     block, which previously had no trigger at all and left those pages stuck
     on blue. Every page's section is observed rather than just the current
     one, because the single-file bundle keeps all four pages in the DOM at
     once - the inactive ones are hidden, so they simply never intersect. */

  function initNavCta() {
    var tops = [];
    document.querySelectorAll('main').forEach(function (main) {
      var first = main.querySelector('section');
      if (first) tops.push(first);
    });
    if (!tops.length) return;

    if (!('IntersectionObserver' in window)) {
      document.body.classList.add('is-hero-view');
      return;
    }

    var onScreen = [];

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var at = onScreen.indexOf(entry.target);
        if (entry.isIntersecting && at < 0) { onScreen.push(entry.target); }
        else if (!entry.isIntersecting && at > -1) { onScreen.splice(at, 1); }
      });
      document.body.classList.toggle('is-hero-view', onScreen.length > 0);
    }, { threshold: 0 });

    tops.forEach(function (section) { io.observe(section); });
  }

  /* ---- "The Process" auto-scan ------------------------------------------- */

  /* Walks the primary-blue highlight down the numbered steps while the card is
     on screen, looping back to the first. Steps are re-queried on every tick so
     a re-render (the bundle's router rebuilds the service page) cannot leave a
     stale node lit. */

  var SCAN_DWELL = 1400;   /* ms each number stays lit */

  function initProcessScan() {
    var cards = document.querySelectorAll('.process__card');
    if (!cards.length || !('IntersectionObserver' in window) || reduceMotion) return;

    cards.forEach(function (card) {
      var timer = null, index = 0, paused = false, visible = false;

      function steps() { return card.querySelectorAll('.process__step'); }

      /* light(-1) matches nothing, so it doubles as "clear all". */
      function light(n) {
        steps().forEach(function (step, i) {
          step.classList.toggle('is-scanning', i === n);
        });
      }

      function stop() {
        if (timer) { clearInterval(timer); timer = null; }
        light(-1);
      }

      function start() {
        if (timer || paused || !visible) return;
        if (steps().length < 2) return;
        index = 0;
        light(index);
        timer = setInterval(function () {
          var total = steps().length;
          if (!total) { stop(); return; }
          index = (index + 1) % total;
          light(index);
        }, SCAN_DWELL);
      }

      /* A real hover takes over, so two numbers never light at once. */
      card.addEventListener('mouseenter', function () { paused = true;  stop(); });
      card.addEventListener('mouseleave', function () { paused = false; start(); });

      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { start(); } else { stop(); }
      }, { threshold: 0.35 }).observe(card);
    });
  }

  /* ---- Back to top ------------------------------------------------------ */

  function initToTop() {
    var btn = document.getElementById('to-top');
    if (!btn) return;
    var onScroll = function () { btn.classList.toggle('is-shown', window.scrollY > 640); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---- Boot -------------------------------------------------------------- */

  function boot() {
    initIntro();              /* first: the curtain is already on screen */
    enableReveal();
    BCE.mountShell();
    BCE.renderAll(document);
    if (BCE.initServicePage) BCE.initServicePage();
    /* After every render, so injected markup gets its glyphs too. */
    if (BCE.paintIcons) BCE.paintIcons(document);

    initNav();
    initSearch();
    initMarquee();
    initCompare();
    initMapZoom();
    initCounters();
    initNavCta();
    initProcessScan();
    initToTop();
    BCE.initModal();
    if (BCE.initCombos) BCE.initCombos(document);   /* before forms: deep links need the widgets */
    BCE.initForms();
    initReveal();

    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.BCE);
