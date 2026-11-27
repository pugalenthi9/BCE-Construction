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
      var closeBtn = document.getElementById('drawer-close');
      /* Focus follows the drawer: into its close button on open, back to the
         toggle on close, so keyboard and screen-reader users are not stranded. */
      var close = function () {
        if (!drawer.classList.contains('is-open')) return;
        setOpen(false);
        toggle.focus();
      };
      toggle.addEventListener('click', function (e) {
        var open = !drawer.classList.contains('is-open');
        setOpen(open);
        /* Keyboard-activated clicks report detail 0. Only those move focus in;
           on a tap, Safari would otherwise draw a focus ring on the close. */
        if (open && closeBtn && e.detail === 0) closeBtn.focus();
      });
      scrim.addEventListener('click', function () { setOpen(false); });
      if (closeBtn) closeBtn.addEventListener('click', close);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
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

  /* ---- Testimonials strip (home, Figma 616:2590) --------------------------
     The card set is cloned once - hidden from assistive tech and the tab
     order - so the track can loop by sliding exactly one set's width. The
     speed is constant in px/s whatever the card count or screen width. The
     strip runs only while on screen. With reduced motion it stays a
     swipeable row. */
  var REVIEWS_PX_PER_S = 36;

  function initReviews() {
    var root = document.querySelector('[data-reviews]');
    var section = root && root.closest('.reviews');
    var set = root && root.querySelector('.reviews__set');
    if (!section || !set || !set.children.length || reduceMotion) return;

    var track = set.parentNode;
    var clone = set.cloneNode(true);
    clone.removeAttribute('data-render');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');
    track.appendChild(clone);
    section.classList.add('is-marquee');

    function setDuration() {
      var seconds = Math.max(20, set.getBoundingClientRect().width / REVIEWS_PX_PER_S);
      track.style.setProperty('--reviews-duration', seconds.toFixed(1) + 's');
    }
    setDuration();
    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setDuration, 200);
    });

    var onScreen = false;
    function sync() { section.classList.toggle('is-running', onScreen); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }).observe(root);
    } else {
      onScreen = true;
      sync();
    }
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

  /* ---- Contact: live Google map ---------------------------------------------

     Two modes, picked by BCE.maps.apiKey (site.js):
     - Live (with a key, or ?map=js to preview without one): Google's Maps
       JavaScript API. The orange office pin and the details card ride on the
       map together; panning is limited so the pin can never leave the map,
       and the card stays beside the pin - left of it, or right when the left
       runs out of room - sliding up or down to stay inside. Map / Satellite
       is Google's own map-type control, cut to those two.
     - Embed (no key): Google's keyless map, which carries Google's own layer
       switch. Its view is set with `ll` so the pin lands in the open map
       beside the card. Every change reloads the frame, so the framing works
       in 20px steps and the frame is only rebuilt when that changes. */
  var MAP_ZOOM = 17;
  var MAP_STEP = 20;

  function initGoogleMap() {
    var box = document.querySelector('[data-gmap]');
    var C = BCE.company || {};
    if (!box || !C.geo || !C.mapsQuery) return;
    var key = (BCE.maps && BCE.maps.apiKey) || '';
    var preview = /(^|[?&])map=js(&|$)/.test(window.location.search.slice(1) + '&' + (BCE.routeQuery || ''));
    if (!key && !preview) { framedEmbed(box, C); return; }

    /* Load the API once; if it can't load (offline, bad key), keep the embed. */
    window.__bceMapsReady = function () { liveMap(box, C); };
    var s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?v=weekly&callback=__bceMapsReady' +
            (key ? '&key=' + encodeURIComponent(key) : '');
    s.async = true;
    s.onerror = function () { framedEmbed(box, C); };
    document.head.appendChild(s);
    framedEmbed(box, C);   /* shown until the live map replaces it */
  }

  function framedEmbed(box, C) {
    var frame = box.querySelector('.mapview__frame');
    if (!frame || frame.__framed) return;
    frame.__framed = true;
    var card = box.parentNode.querySelector('.mapview__card');
    var degPerPx = 360 / (256 * Math.pow(2, MAP_ZOOM));
    var current = '';

    /* Layout offsets, not rects: the map scales in on reveal, and a
       transform must not skew the framing. All in the box's own pixels. */
    function viewUrl() {
      var w = box.clientWidth, h = box.clientHeight;
      if (!w) return '';
      var left = 0;   /* where the open map starts */
      if (card && getComputedStyle(card).position === 'absolute') {
        left = Math.max(0, card.offsetLeft + card.offsetWidth - box.offsetLeft);
      }
      var snap = function (v) { return Math.round(v / MAP_STEP) * MAP_STEP; };
      var dx = snap((left + w) / 2 - (frame.offsetLeft + frame.offsetWidth / 2));
      var dy = snap(h / 2 - (frame.offsetTop + frame.offsetHeight / 2));
      return 'https://maps.google.com/maps?q=' + encodeURIComponent(C.mapsQuery) +
             '&ll=' + (C.geo.lat + dy * degPerPx).toFixed(6) + ',' + (C.geo.lng - dx * degPerPx).toFixed(6) +
             '&t=m&z=' + MAP_ZOOM + '&output=embed';
    }
    function show() {
      if (!frame.isConnected) return;
      var next = viewUrl();
      if (!next || next === current) return;
      current = next;
      frame.src = next;
    }

    if ('ResizeObserver' in window) {
      var timer;
      new ResizeObserver(function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(show, 150);
      }).observe(box);
    }
    show();
  }

  function liveMap(box, C) {
    var g = window.google && window.google.maps;
    if (!g) return;
    var mapview = box.parentNode;
    var card = mapview.querySelector('.mapview__card');
    var PIN_W = 54, PIN_H = 66, GAP = 24, EDGE = 16;
    var phone = window.matchMedia('(max-width: 767px)');
    var office = new g.LatLng(C.geo.lat, C.geo.lng);

    var frame = box.querySelector('.mapview__frame');
    if (frame) frame.remove();
    var canvas = document.createElement('div');
    canvas.className = 'mapview__canvas';
    box.appendChild(canvas);

    var map = new g.Map(canvas, {
      center: office,
      zoom: MAP_ZOOM,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: g.MapTypeControlStyle.HORIZONTAL_BAR,
        position: g.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['roadmap', 'satellite']
      },
      zoomControl: true,
      zoomControlOptions: { position: g.ControlPosition.RIGHT_BOTTOM },
      fullscreenControl: true,
      fullscreenControlOptions: { position: g.ControlPosition.RIGHT_BOTTOM },
      gestureHandling: 'cooperative',   /* page scroll stays page scroll */
      clickableIcons: false
    });

    /* The pin and (on larger screens) the card, anchored to the office. */
    var mark = document.createElement('div');
    mark.className = 'mapmark';
    mark.innerHTML = '<span class="mapmark__pin" aria-hidden="true"><img src="images/icons/building.svg" alt=""></span>';
    var overlay = new g.OverlayView();
    overlay.onAdd = function () { this.getPanes().floatPane.appendChild(mark); layout(); };
    overlay.onRemove = function () { mark.remove(); };
    overlay.draw = function () {
      var p = this.getProjection().fromLatLngToDivPixel(office);
      mark.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
      placeCard();
    };
    overlay.setMap(map);

    var side = '', sideTimer = 0;
    function floating() { return card && card.classList.contains('is-floating'); }

    /* Card beside the pin, inside the map: left of the pin when it fits,
       otherwise right; vertically centred on the pin but kept inside. */
    function placeCard() {
      var proj = overlay.getProjection();
      if (!floating() || !proj) return;
      var c = proj.fromLatLngToContainerPixel(office);
      var w = box.clientWidth, h = box.clientHeight;
      var cw = card.offsetWidth, ch = card.offsetHeight;
      var reach = PIN_W / 2 + GAP;
      var next = c.x - reach - cw >= EDGE ? 'left'
               : c.x + reach + cw <= w - EDGE ? 'right'
               : (c.x > w / 2 ? 'left' : 'right');
      if (side && next !== side) {
        card.classList.add('is-moving');
        window.clearTimeout(sideTimer);
        sideTimer = window.setTimeout(function () { card.classList.remove('is-moving'); }, 340);
      }
      side = next;
      var x = side === 'left' ? -(reach + cw) : reach;
      var top = Math.min(Math.max(c.y - PIN_H / 2 - ch / 2, EDGE), Math.max(EDGE, h - EDGE - ch));
      card.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(top - c.y) + 'px)';
    }

    /* Pan limit: the viewport may only move while the whole pin stays EDGE
       inside it. Google's restriction keeps the viewport within a box, so
       that box is the pin's own box grown by the viewport, worked out in
       world pixels at the current zoom - hence again after every zoom. */
    function restrict() {
      var proj = map.getProjection();
      if (!proj) return;
      var scale = Math.pow(2, map.getZoom());
      var wp = proj.fromLatLngToPoint(office);
      var px = wp.x * scale, py = wp.y * scale;
      var w = box.clientWidth, h = box.clientHeight;
      var west = px + PIN_W / 2 + EDGE - w, east = px - PIN_W / 2 - EDGE + w;
      var north = py + EDGE - h, south = py - PIN_H - EDGE + h;
      if (west >= east || north >= south) { map.setOptions({ restriction: null }); return; }
      var nw = proj.fromPointToLatLng(new g.Point(west / scale, north / scale));
      var se = proj.fromPointToLatLng(new g.Point(east / scale, south / scale));
      map.setOptions({ restriction: {
        latLngBounds: { north: nw.lat(), south: se.lat(), west: nw.lng(), east: se.lng() },
        strictBounds: false
      } });
    }

    /* Open with the pin and card centred together. */
    function frameOffice() {
      var proj = map.getProjection();
      if (!proj) return;
      var scale = Math.pow(2, map.getZoom());
      var wp = proj.fromLatLngToPoint(office);
      var dx = floating() ? -(GAP + card.offsetWidth) / 2 : 0;
      map.setCenter(proj.fromPointToLatLng(new g.Point(wp.x + dx / scale, wp.y - (PIN_H / 2) / scale)));
    }

    /* The card rides on the pin only where it can always fit beside it: at
       most half the map, less the pin, gap and edge, so whichever half the
       pin is in, the other side has room. Narrower than MIN_FLOAT_W - or
       taller than the map - and it sits under the map instead, as on phones. */
    var MIN_FLOAT_W = 320, guarded = false;
    function below() {
      card.classList.remove('is-floating', 'is-moving');
      card.classList.add('is-below');
      card.style.width = card.style.transform = '';
      if (card.parentNode !== mapview) mapview.appendChild(card);
    }
    function layout() {
      if (!card || !mark.isConnected) return;
      /* Measured in its own place, never inside the pin's layer. */
      if (card.parentNode !== mapview) mapview.appendChild(card);
      card.classList.remove('is-floating', 'is-below');
      card.style.width = '';
      var fit = phone.matches ? 0
              : Math.min(card.offsetWidth, box.clientWidth / 2 - (PIN_W / 2 + GAP + EDGE));
      if (fit >= MIN_FLOAT_W) {
        mark.appendChild(card);
        if (!guarded) { g.OverlayView.preventMapHitsAndGesturesFrom(card); guarded = true; }
        card.style.width = Math.floor(fit) + 'px';
        card.classList.add('is-floating');
        if (card.offsetHeight > box.clientHeight - 2 * EDGE) below();
      } else {
        below();
      }
      side = '';
      restrict();
      frameOffice();
      placeCard();
    }

    var raf = 0;
    map.addListener('bounds_changed', function () {
      if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; placeCard(); });
    });
    map.addListener('zoom_changed', restrict);
    g.event.addListenerOnce(map, 'projection_changed', layout);
    if (phone.addEventListener) phone.addEventListener('change', layout);
    if ('ResizeObserver' in window) {
      var t;
      new ResizeObserver(function () {
        window.clearTimeout(t);
        t = window.setTimeout(layout, 120);
      }).observe(box);
    }
  }

  /* ---- Get Directions -------------------------------------------------------

     Opens Google Maps directions to the office. When the visitor allows it,
     their position goes in as the start, so both ends arrive filled in; if
     they decline or it isn't available, Google Maps starts from its own idea
     of "your location" (the app does that by itself). The tab opens once the
     position is known, so a slow permission prompt can't leave an empty tab
     behind; if the browser then blocks the pop-up, it opens here instead. */
  function initDirections() {
    var C = BCE.company || {};
    if (!C.mapsQuery) return;
    var base = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(C.mapsQuery);

    document.querySelectorAll('[data-directions]').forEach(function (a) {
      a.href = base;
      a.addEventListener('click', function (e) {
        if (!navigator.geolocation || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (a.getAttribute('aria-busy') === 'true') return;
        a.setAttribute('aria-busy', 'true');

        var settled = false;
        function go(origin) {
          if (settled) return;
          settled = true;
          a.removeAttribute('aria-busy');
          var url = base + (origin ? '&origin=' + origin : '');
          var tab = window.open(url, '_blank');
          if (tab) tab.opener = null;
          else window.location.href = url;
        }
        navigator.geolocation.getCurrentPosition(
          function (p) { go(p.coords.latitude.toFixed(6) + ',' + p.coords.longitude.toFixed(6)); },
          function () { go(''); },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
        window.setTimeout(function () { go(''); }, 9000);
      });
    });
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
          /* rAF stamps can predate `start`; clamp so the first frame never reads "-1+". */
          var t = Math.min(Math.max((now - start) / 1200, 0), 1);
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

  /* "Get a Free Quote" is charcoal while the top of the page is on screen and brand
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

  /* ---- How it works timeline (home + service pages) ----------------------

     Scroll-linked: a reading line sits 55% down the screen, and every step
     whose square has passed it is "done" (square filled) while the last of
     those is "current" (title lit orange). The rail's orange fill runs from
     the first square down to the reading line, stopping at the last square.
     It is driven straight from scroll position each frame, transform only,
     so it tracks the page rather than playing back a timed animation. With
     reduced motion the same states apply; only the colour fades are cut. */
  function initSteps() {
    document.querySelectorAll('[data-steps]').forEach(function (track) {
      var fill = track.querySelector('.steps__fill');
      var rail = track.querySelector('.steps__rail');
      if (!fill || !rail) return;
      var raf = 0;

      function update() {
        raf = 0;
        var items = track.querySelectorAll('.steps__item');
        if (!items.length) return;
        var line = window.innerHeight * .55;
        var r = rail.getBoundingClientRect();
        var current = 0;
        items.forEach(function (item, i) {
          var d = item.querySelector('.steps__dot').getBoundingClientRect();
          var reached = i === 0 || d.top + d.height / 2 <= line;
          if (reached) current = i;
          item.classList.toggle('is-done', reached);
        });
        items.forEach(function (item, i) { item.classList.toggle('is-current', i === current); });

        var last = items[items.length - 1].querySelector('.steps__dot').getBoundingClientRect();
        var end = last.top + last.height / 2 - r.top;
        var reach = Math.max(0, Math.min(line - r.top, end));
        fill.style.transform = 'scaleY(' + (r.height ? reach / r.height : 0).toFixed(4) + ')';
      }

      function onScroll() { if (!raf) raf = requestAnimationFrame(update); }

      /* Only listen while the timeline is near the screen. */
      if ('IntersectionObserver' in window) {
        var listening = false;
        new IntersectionObserver(function (entries) {
          var near = entries[0].isIntersecting;
          if (near === listening) return;
          listening = near;
          if (near) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
          else window.removeEventListener('scroll', onScroll);
        }, { rootMargin: '25% 0px' }).observe(track);
      } else {
        window.addEventListener('scroll', onScroll, { passive: true });
      }
      window.addEventListener('resize', onScroll);
      update();
    });
  }

  /* ---- Recent work entrance (service pages, Figma 599:1511) ---------------
     .is-in plays the section's entrance (sections.css). It is set once a
     fifth of the section is on screen and cleared only when none of it is,
     so the entrance replays on every visit but never resets in view. */
  function initWorkReveal() {
    var section = document.querySelector('[data-work-reveal]');
    if (!section || !revealSupported()) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      if (e.intersectionRatio >= .2) section.classList.add('is-in');
      else if (!e.isIntersecting) section.classList.remove('is-in');
    }, { threshold: [0, .2] }).observe(section);
  }

  /* ---- Service page: sub-service groups ----------------------------------

     The two pills sit in a sticky bar (CSS), so they hold under the navbar
     while the lists scroll. This keeps them in step with the page: the
     group whose list has reached the bar is the active pill - blue for
     homes, teal for commercial. A pill click glides to its list's first row. */
  function initSubsvc() {
    var bar = document.querySelector('[data-subsvc-bar]');
    if (!bar) return;
    var section = bar.closest('.subsvc');
    var nav = document.querySelector('.navbar');
    var tabs = bar.querySelectorAll('[data-subsvc-tab]');
    var active = null, raf = 0;

    function groups() { return section.querySelectorAll('[data-subsvc-group]:not([hidden])'); }

    function setActive(name) {
      if (name === active) return;
      active = name;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-subsvc-tab') === name;
        t.classList.toggle('is-active', on);
        if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
    }

    function navBottom() { return nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0; }

    /* Positions are read from a plain marker just above the bar, never from
       the sticky bar itself: mid-scroll, a sticky box's rect can lag a frame
       behind the page, which left the pinned state stale. */
    var mark = document.createElement('span');
    mark.setAttribute('aria-hidden', 'true');
    mark.style.cssText = 'display:block;height:0;visibility:hidden';
    bar.parentNode.insertBefore(mark, bar);

    function update() {
      raf = 0;
      var top = navBottom();
      var barH = bar.offsetHeight;
      var margin = parseFloat(getComputedStyle(bar).marginTop) || 0;
      var natural = mark.getBoundingClientRect().top + margin;   /* where the bar sits unpinned */

      /* A group counts as reached once its top is within 24px of the bar. */
      var line = Math.max(natural, top) + barH + 24, name = null;
      groups().forEach(function (g, i) {
        if (i === 0 || g.getBoundingClientRect().top <= line) name = g.getAttribute('data-subsvc-group');
      });
      if (name) setActive(name);
    }

    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        var g = section.querySelector('[data-subsvc-group="' + tab.getAttribute('data-subsvc-tab') + '"]');
        if (!g) return;
        e.preventDefault();
        setActive(tab.getAttribute('data-subsvc-tab'));
        /* Land the first row just under the pinned bar. */
        var top = window.scrollY + g.getBoundingClientRect().top - navBottom() - bar.offsetHeight - 4;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', onScroll);
    window.addEventListener('resize', onScroll);
    BCE.refreshSubsvc = function () { active = null; update(); };
    update();

    /* Touch has no hover, so a finger on a row shows the hover state (36px
       name, filled arrow) while it is down. It holds a beat after a quick tap
       so the press still reads; a scroll gesture cancels it at once. */
    var pressed = null, releaseTimer = 0;
    function release(delay) {
      var row = pressed;
      pressed = null;
      window.clearTimeout(releaseTimer);
      if (row) releaseTimer = window.setTimeout(function () { row.classList.remove('is-pressed'); }, delay);
    }
    section.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch') return;
      var row = e.target.closest('.subsvc__row');
      if (!row) return;
      window.clearTimeout(releaseTimer);
      section.querySelectorAll('.subsvc__row.is-pressed').forEach(function (r) {
        if (r !== row) r.classList.remove('is-pressed');
      });
      pressed = row;
      row.classList.add('is-pressed');
    }, { passive: true });
    section.addEventListener('pointerup', function () { release(240); });
    section.addEventListener('pointercancel', function () { release(0); });
  }

  /* ---- Company details written once, read everywhere ---------------------
     [data-company="address|hours|..."] text comes from BCE.company, so the
     contact page cannot drift from site.js. */
  function initCompanyFields() {
    var C = BCE.company || {};
    document.querySelectorAll('[data-company]').forEach(function (el) {
      var v = C[el.getAttribute('data-company')];
      if (v) el.textContent = v;
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

  /* ---- WhatsApp chat ------------------------------------------------------

     The float opens wa.me with an opening line typed in. On a service page
     that line names the service ("...about aircon services"), so BCE knows
     the topic before replying. Worked out at tap time, because the
     single-file preview changes page without reloading. */
  function initWhatsApp() {
    var link = document.querySelector('.wa-float');
    if (!link || !BCE.waLink) return;
    link.addEventListener('click', function () {
      var where = window.location.pathname + window.location.search + window.location.hash +
                  '&' + (BCE.routeQuery || '');
      var slug = /service(\.html)?\b/.test(where) && (where.match(/[?&]s=([\w-]+)/) || [])[1];
      var svc = slug && (BCE.services || []).filter(function (s) { return s.slug === slug; })[0];
      link.href = BCE.waLink(svc ? svc.title.toLowerCase() + ' services' : '');
    });
  }

  /* ---- Service page: service badge ----------------------------------------

     Figma 734:1350. Top centre under the navbar, naming the service being
     viewed. It is on screen whenever the hero is out of view and fades away
     as the hero comes back. On phones the sub-service pills pin under the
     navbar across the full width, so while they are stuck the badge sits
     just below them. Checked once per frame at most while scrolling, and on
     every view change in the single-file preview (where a hidden service
     view must never show it). */
  function initSectionBadge() {
    var root  = document.querySelector('[data-service-page]');
    var badge = root && root.querySelector('[data-svc-badge]');
    var hero  = root && root.querySelector('[data-svc-hero]');
    if (!badge || !hero) return;
    var label = badge.querySelector('.svc-badge__label');
    var bar   = root.querySelector('[data-subsvc-bar]');
    var nav   = document.querySelector('.navbar');
    var phone = window.matchMedia('(max-width: 767px)');
    var raf   = 0;

    function update() {
      raf = 0;
      var edge = nav ? nav.getBoundingClientRect().bottom : 0;
      var show = !!hero.offsetParent && hero.getBoundingClientRect().bottom <= edge;
      if (show) {
        label.textContent = root.getAttribute('data-service-name') || '';
        var top = '';
        if (bar && phone.matches) {
          var r = bar.getBoundingClientRect();
          if (r.height && r.top <= edge + 1 && r.bottom > edge) top = Math.round(r.bottom + 8) + 'px';
        }
        badge.style.top = top;
      }
      badge.classList.toggle('is-shown', show);
    }
    function schedule() { if (!raf) raf = window.requestAnimationFrame(update); }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    update();
  }

  /* ---- Service hero: scroll-out -------------------------------------------

     As the hero slides up under the navbar its content lifts away in layers
     - the title fastest, then the lead, then Book Now - and fades, while the
     photo sinks at 30% of the scroll speed and eases in a touch, so the hero
     leaves like a deep scene rather than a flat block. Tied straight to the
     scroll position (scrolling back reverses it exactly), transform and
     opacity only, worked out at most once a frame. The layers move with the
     separate `translate` property and the fade sits on their wrapper, so
     nothing fights the entrance reveal's own transform and opacity.
     Reduced motion keeps the fade and drops the movement. */
  function initHeroExit() {
    var hero = document.querySelector('[data-svc-hero]');
    if (!hero) return;
    var inner  = hero.querySelector('.service-hero__inner');
    var photo  = hero.querySelector('.service-hero__photo');
    var nav    = document.querySelector('.navbar');
    var layers = [['.service-hero__title', 96], ['.service-hero__lead', 64], ['.service-hero__actions', 40]]
      .map(function (l) { return [hero.querySelector(l[0]), l[1]]; })
      .filter(function (l) { return l[0]; });
    var raf = 0, last = -1;

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function smooth(a, b, v) { var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); }

    function frame() {
      raf = 0;
      if (!hero.offsetParent) return;
      var r = hero.getBoundingClientRect();
      var edge = nav ? nav.getBoundingClientRect().bottom : 0;
      var p = Math.round(clamp((edge - r.top) / r.height) * 1000) / 1000;
      if (p === last) return;
      last = p;
      if (!p) {   /* at rest: hand everything back to the stylesheet */
        inner.style.opacity = '';
        if (photo) photo.style.transform = '';
        layers.forEach(function (l) { l[0].style.translate = ''; });
        return;
      }
      inner.style.opacity = (1 - smooth(.1, .7, p)).toFixed(3);
      if (reduceMotion) return;
      layers.forEach(function (l) { l[0].style.translate = '0 ' + (-l[1] * p).toFixed(1) + 'px'; });
      if (photo) photo.style.transform =
        'translateY(' + (r.height * .3 * p).toFixed(1) + 'px) scale(' + (1 + .06 * p).toFixed(4) + ')';
    }
    function schedule() { if (!raf) raf = window.requestAnimationFrame(frame); }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', function () { last = -1; schedule(); });
    frame();
  }

  /* ---- FAQ accordion (home) --------------------------------------------- */

  /* One answer open at a time: opening a question folds the other away in
     the same 300ms, so the list's total height barely changes while the
     stage around it is pinned. The motion itself is all CSS (sections.css). */
  function initFaq() {
    var list = document.querySelector('.faq__list');
    if (!list) return;

    function set(item, open) {
      item.classList.toggle('is-open', open);
      item.querySelector('.faq-item__q').setAttribute('aria-expanded', String(open));
    }

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-item__q');
      if (!btn) return;
      var item = btn.closest('.faq-item');
      var open = !item.classList.contains('is-open');
      list.querySelectorAll('.faq-item.is-open').forEach(function (other) {
        if (other !== item) set(other, false);
      });
      set(item, open);
    });
  }

  /* ---- FAQ skyline scene (home) ------------------------------------------ */

  /* The stage pins for a short runway and the four drawings rise out of the
     ground line as you scroll - each over its own slice of the scroll and
     from its own depth, so the street assembles front-to-back (parallax)
     rather than lifting as one sheet. Where that ground line sits (bottom of
     the screen, or of the section) is CSS's job; see .faq__skyline.

     Scroll-linked, so it is driven from scroll rather than timed; the value
     is eased toward the scroll position each frame, which keeps wheel steps
     from reading as jumps. transform and opacity only, on the images
     themselves - nothing here triggers layout or paint per frame. */
  function initFaqScene() {
    var section = document.querySelector('.faq');
    if (!section || reduceMotion) return;
    var stage = section.querySelector('.faq__stage');
    var nav = document.querySelector('.navbar');

    /* [start, end] of each building's slice of progress, and how far below
       its resting place it starts. Larger drawings travel further. */
    var PLAN = { wide: [0, .8, 150], tall: [.16, .96, 190] };
    var parts = [].map.call(section.querySelectorAll('.faq__bld'), function (el) {
      var p = PLAN[(el.className.match(/faq__bld--(\w+)/) || [])[1]] || [0, 1, 120];
      return { el: el, from: p[0], to: p[1], rise: p[2] };
    });
    if (!stage || !parts.length) return;

    /* start/span are relative to the section's own top, and that top is read
       live: lazy images above the FAQ keep shifting it after load. */
    var start = 0, span = 1, target = 0, current = 0, raf = 0, last = 0;

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function apply(p) {
      parts.forEach(function (b) {
        var t = clamp((p - b.from) / (b.to - b.from));
        var e = 1 - Math.pow(1 - t, 3);          /* ease-out: quick lift, soft landing */
        b.el.style.transform = 'translate3d(0,' + ((1 - e) * b.rise).toFixed(1) + 'px,0)';
        b.el.style.opacity = (.5 * e).toFixed(3); /* .5 is the design's resting opacity */
      });
    }

    /* The stage always pins just under the navbar, so the questions hold
       still where they are being read. On a screen shorter than the stage the
       orange card waits below the fold until the runway ends - the skyline
       does not, because it rides the bottom of the screen.

       Progress runs from "section top 30% down the screen" to "pin ends", so
       the street starts going up as the section arrives, does most of its
       rising while the questions hold still, and is complete before they
       move on. Phones get a shorter runway. */
    var phone = window.matchMedia('(max-width: 767px)');

    function measure() {
      var vh = window.innerHeight;
      var top = nav ? nav.offsetHeight : 0;
      var pin = phone.matches
        ? Math.round(Math.min(Math.max(vh * .45, 260), 420))
        : Math.round(Math.min(Math.max(vh * .6, 320), 640));
      section.style.setProperty('--faq-pin', pin + 'px');
      section.style.setProperty('--faq-top', top + 'px');
      start = -vh * .3;                          /* scrolled past the section top by this much */
      span = Math.max(pin - top - start, 1);
    }

    function progress() { return clamp((-section.getBoundingClientRect().top - start) / span); }

    function frame(now) {
      raf = 0;
      /* Frame-rate independent ease toward the scroll position. */
      var k = 1 - Math.pow(1 - .16, Math.min((now - last) || 16.7, 64) / 16.7);
      last = now;
      current += (target - current) * k;
      if (Math.abs(target - current) < .0005) current = target;
      apply(current);
      if (current !== target) raf = requestAnimationFrame(frame);
    }

    function onScroll() {
      target = progress();
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    function remeasure() { measure(); onScroll(); }

    measure();
    target = current = progress();   /* no replay on reload */
    apply(current);
    section.classList.add('is-live');

    /* Only listen while the section is near the screen. */
    var listening = false;
    new IntersectionObserver(function (entries) {
      var near = entries[0].isIntersecting;
      if (near === listening) return;
      listening = near;
      if (near) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
      else window.removeEventListener('scroll', onScroll);
    }, { rootMargin: '50% 0px' }).observe(section);

    window.addEventListener('resize', remeasure);
  }

  /* ---- Contact Us (home): pinned panel, the form scrolls inside -----------
     Figma 537:2216. When the screen is too short for the whole panel, the
     panel holds under the navbar and the form scrolls up through it 1:1 with
     the page, so it reads as scrolling the form itself. The details column
     (title, contact lines, QR) stays where it is. When the form's end
     arrives the pin releases and the panel leaves with the page.

     On a screen too short to show even the details column whole, it holds
     for as long as it can and only moves over the last stretch, so its end
     arrives together with the form's and the title stays up the longest.

     If the panel already fits there is nothing to reveal, and holding the
     page still with nothing moving would only feel stuck, so it doesn't pin.
     Desktop only: below 1024 the columns stack and scroll normally. */
  function initReachScene() {
    var section = document.querySelector('.reach');
    if (!section || reduceMotion) return;
    var track = section.querySelector('.reach__track');
    var panel = section.querySelector('.reach__panel');
    var info  = section.querySelector('.reach__col--info');
    var form  = section.querySelector('.reach__col--form');
    var nav   = document.querySelector('.navbar');
    if (!track || !panel || !info || !form) return;

    var desktop = window.matchMedia('(min-width: 1024px)');
    var GAP = 24;       /* clear space above and below the pinned panel */
    var MIN_RUN = 40;   /* less travel than this is not worth a pin */
    var top = 0, run = 1, infoRun = 0, formRun = 0, pinned = false;

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    /* Whole device pixels keep the form's text crisp while it moves. */
    function px(v) { var d = window.devicePixelRatio || 1; return Math.round(v * d) / d; }
    /* Bottom of a column in the panel's resting layout (offsets ignore transforms). */
    function end(col) { return col.offsetTop + col.offsetHeight; }

    function apply() {
      if (!pinned) return;
      /* How far the page has scrolled since the panel pinned. */
      var s = clamp((top - track.getBoundingClientRect().top) / run) * run;
      form.style.transform = 'translate3d(0,' + px(-Math.min(s, formRun)) + 'px,0)';
      info.style.transform = 'translate3d(0,' + px(-Math.max(0, s - (run - infoRun))) + 'px,0)';
    }

    function measure() {
      pinned = false;
      section.classList.remove('is-pinned');
      info.style.transform = form.style.transform = '';
      if (!desktop.matches) return;

      top = (nav ? nav.offsetHeight : 0) + GAP;
      var h = window.innerHeight - top - GAP;
      /* Each column ends its travel 24px above the pinned panel's bottom. */
      formRun = Math.max(0, end(form) + GAP - h);
      infoRun = Math.max(0, end(info) + GAP - h);
      run = Math.max(formRun, infoRun);
      if (run < MIN_RUN) return;

      section.style.setProperty('--reach-top', top + 'px');
      section.style.setProperty('--reach-h', h + 'px');
      section.style.setProperty('--reach-run', run + 'px');
      section.classList.add('is-pinned');
      pinned = true;
      apply();
    }

    /* Keep what the visitor is working in inside the window: a field reached
       with Tab, or an open dropdown list. The form tracks the page 1:1 while
       pinned, so scrolling the page by the overshoot brings it into view. */
    var pending = 0;
    function keepInView() {
      pending = 0;
      if (!pinned) return;
      var list = form.querySelector('.combo.is-open .combo__panel');
      var el = list || (form.contains(document.activeElement) ? document.activeElement : null);
      if (!el) return;
      var r = el.getBoundingClientRect(), w = panel.getBoundingClientRect();
      var above = (w.top + GAP) - r.top;
      var below = Math.min(r.bottom - (w.bottom - GAP), -above);  /* never push its top out */
      var by = above > 0 ? -above : below > 0 ? below : 0;
      if (by) window.scrollBy({ top: by, behavior: list ? 'smooth' : 'instant' });
    }
    function check() { if (!pending) pending = requestAnimationFrame(keepInView); }
    ['focusin', 'click', 'keyup'].forEach(function (t) { form.addEventListener(t, check); });

    measure();

    var listening = false;
    new IntersectionObserver(function (entries) {
      var near = entries[0].isIntersecting;
      if (near === listening) return;
      listening = near;
      if (near) { window.addEventListener('scroll', apply, { passive: true }); apply(); }
      else window.removeEventListener('scroll', apply);
    }, { rootMargin: '50% 0px' }).observe(section);

    /* Error messages, chips in the multi-select and late web fonts all
       change the columns' height, and with it how far they travel. */
    var queued = 0;
    function remeasure() {
      if (queued) return;
      queued = requestAnimationFrame(function () { queued = 0; measure(); });
    }
    window.addEventListener('resize', remeasure);
    if (desktop.addEventListener) desktop.addEventListener('change', remeasure);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(remeasure);
      ro.observe(form); ro.observe(info);
    }
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
    initReviews();
    initCompare();
    initGoogleMap();
    initDirections();
    initCounters();
    initNavCta();
    initSteps();
    initWorkReveal();
    initSubsvc();
    initCompanyFields();
    initToTop();
    initWhatsApp();
    initSectionBadge();
    initHeroExit();
    initFaq();
    initFaqScene();
    initReachScene();
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
