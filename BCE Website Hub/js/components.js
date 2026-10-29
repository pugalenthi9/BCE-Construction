/* ==========================================================================
   BCE — Shared shell components
   Rendered from templates rather than duplicated across pages, so the nav,
   footer, CTA banner and success modal are defined exactly once.
   Mount points are declared in HTML as <div data-component="site-header">.
   ========================================================================== */

(function (BCE) {
  'use strict';

  var C = BCE.company;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Pages sit at the site root, so links need no prefixing. Kept as a helper
     so a future move into subfolders is a one-line change. */
  function url(path) { return path; }

  /* ---- Small building blocks ------------------------------------------- */

  function contactChip(icon, label, href, cls) {
    return '<a class="contact-chip ' + (cls || '') + '" href="' + href + '">' +
             '<span class="contact-chip__icon"><img src="' + url('images/icons/' + icon) + '" alt=""></span>' +
             '<span>' + esc(label) + '</span>' +
           '</a>';
  }

  BCE.button = function (opts) {
    var tag  = opts.href ? 'a' : 'button';
    var attr = opts.href ? ' href="' + opts.href + '"' : ' type="' + (opts.type || 'button') + '"';
    if (opts.attrs) attr += ' ' + opts.attrs;
    return '<' + tag + ' class="btn ' + (opts.variant || 'btn--primary') + ' ' + (opts.extra || '') + '"' + attr + '>' +
             (opts.icon ? '<span class="btn__icon" data-icon="' + String(opts.icon).replace('.svg','') + '"></span>' : '') +
             '<span>' + esc(opts.label) + '</span>' +
           '</' + tag + '>';
  };

  /* ---- Utility bar + navigation ---------------------------------------- */

  function megaMenu() {
    var items = BCE.services.map(function (s) {
      return '<a class="menu-card" href="' + url('service.html?s=' + s.slug) + '">' +
               '<span class="menu-card__thumb"><img src="' + url(s.thumb || s.image) + '" alt="" loading="lazy"></span>' +
               '<span class="menu-card__body">' +
                 '<span class="menu-card__title">' + esc(s.title) + '</span>' +
                 '<span class="menu-card__desc">' + esc(s.menuDesc) + '</span>' +
                 '<span class="menu-card__arrow" data-icon="menu-arrow" aria-hidden="true"></span>' +
               '</span>' +
             '</a>';
    });
    var half = Math.ceil(items.length / 2);
    return '<div class="mega-menu" role="menu">' +
             '<div class="mega-menu__grid">' +
               '<div class="mega-menu__col">' + items.slice(0, half).join('') + '</div>' +
               '<div class="mega-menu__col">' + items.slice(half).join('') + '</div>' +
             '</div>' +
           '</div>';
  }

  function navItems(active) {
    return BCE.nav.map(function (item) {
      var isActive = active === item.label ? ' is-active' : '';
      if (item.children) {
        return '<li class="nav-menu__item" data-dropdown>' +
                 '<button class="nav-link' + isActive + '" aria-expanded="false" aria-haspopup="true">' +
                   esc(item.label) +
                   '<img class="nav-link__caret" src="' + url('images/icons/arrow-down.svg') + '" alt="">' +
                 '</button>' +
                 megaMenu() +
               '</li>';
      }
      return '<li class="nav-menu__item">' +
               '<a class="nav-link' + isActive + '" href="' + url(item.href) + '">' + esc(item.label) + '</a>' +
             '</li>';
    }).join('');
  }

  BCE.templates = {
    header: function (active) {
      return '' +
      '<div class="utility-bar">' +
        '<div class="container utility-bar__inner">' +
          '<span class="utility-bar__region">' + esc(C.region) + '</span>' +
          '<div class="utility-bar__contacts">' +
            contactChip('phone.svg', C.phone, C.phoneHref) +
            contactChip('email.svg', C.email, C.emailHref) +
          '</div>' +
        '</div>' +
      '</div>' +
      '<header class="navbar">' +
        '<div class="container navbar__inner">' +
          /* The logo artwork already contains the BCE lettering, so no word mark. */
          '<a class="brand" href="' + url('index.html') + '" aria-label="' + esc(C.name) + ' home">' +
            '<img class="brand__mark" src="' + url('images/brand/bce-logo.webp') + '" alt="">' +
          '</a>' +
          '<ul class="nav-menu">' + navItems(active) + '</ul>' +
          '<div class="nav-actions">' +
            '<div style="position:relative">' +
              '<div class="nav-search">' +
                '<img src="' + url('images/icons/search.svg') + '" alt="">' +
                '<input type="search" id="site-search" placeholder="Search services" autocomplete="off" aria-label="Search services">' +
              '</div>' +
              '<div class="search-results" id="search-results" role="listbox"></div>' +
            '</div>' +
            BCE.button({ label: 'Get Quote', icon: 'invoice.svg', variant: 'btn--primary', extra: 'btn--sm', href: url('contact.html') }) +
            '<button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">' +
              '<span></span><span></span><span></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</header>';
    },

    drawer: function () {
      var links = BCE.nav.map(function (item) {
        if (item.children) {
          return '<a class="mobile-drawer__link" href="' + url('index.html#services') + '">Services</a>' +
                 '<div class="mobile-drawer__sub">' +
                   BCE.services.map(function (s) {
                     return '<a class="mobile-drawer__link" href="' + url('service.html?s=' + s.slug) + '">' + esc(s.title) + '</a>';
                   }).join('') +
                 '</div>';
        }
        return '<a class="mobile-drawer__link" href="' + url(item.href) + '">' + esc(item.label) + '</a>';
      }).join('');

      return '<div class="scrim" id="drawer-scrim"></div>' +
             '<aside class="mobile-drawer" id="mobile-drawer" aria-label="Menu">' +
               '<div class="mobile-drawer__section">' + links + '</div>' +
               '<div class="mobile-drawer__section">' +
                 BCE.button({ label: 'Get Quote', icon: 'invoice.svg', href: url('contact.html'), extra: 'btn--block' }) +
               '</div>' +
               '<div class="mobile-drawer__section">' +
                 contactChip('phone.svg', C.phone, C.phoneHref) +
                 '<div style="height:12px"></div>' +
                 contactChip('email.svg', C.email, C.emailHref) +
               '</div>' +
             '</aside>';
    },

    ctaBanner: function () {
      return '' +
      '<section class="cta-banner">' +
        '<div class="container">' +
          '<div class="cta-banner__inner" data-reveal="scale">' +
            '<img class="cta-banner__grid" src="' + url('images/misc/perspective-grid.svg') + '" alt="" aria-hidden="true">' +
            '<div class="cta-banner__copy">' +
              '<p class="cta-banner__eyebrow">Book now - Relax now - Transform your space now</p>' +
              '<h2 class="cta-banner__title">From first call to final check, handled with care and accuracy.</h2>' +
              '<div class="cta-banner__actions">' +
                BCE.button({ label: 'Book Your Service Now', icon: 'star-fall.svg', variant: 'btn--inverse', href: url('contact.html') }) +
                BCE.button({ label: 'Call Us', icon: 'phone-call.svg', variant: 'btn--outline', href: C.phoneHref }) +
              '</div>' +
            '</div>' +
            '<img class="cta-banner__photo" src="' + url('images/misc/cta-banner.webp') + '" alt="">' +
          '</div>' +
        '</div>' +
      '</section>';
    },

    footer: function () {
      var serviceLinks = BCE.services.map(function (s) {
        return '<li><a href="' + url('service.html?s=' + s.slug) + '">' + esc(s.title) + '</a></li>';
      }).join('');

      var quickLinks = [
        ['Home', 'index.html'], ['Services', 'index.html#services'],
        ['About Us', 'about.html'], ['Contact Us', 'contact.html'], ['Get a Quote', 'contact.html']
      ].map(function (l) {
        return '<li><a href="' + url(l[1]) + '">' + esc(l[0]) + '</a></li>';
      }).join('');

      return '' +
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="site-footer__inner">' +
            '<span class="site-footer__accent"></span>' +
            '<div class="footer-grid">' +
              '<div>' +
                /* No mark here - the name is the heading and starts flush on
                   the page margin, so the column aligns with the blurb below. */
                '<div class="footer-brand">' +
                  '<span class="footer-brand__name">' + esc(C.name) + '</span>' +
                  '<span class="footer-brand__uen">' + esc(C.regNo) + '</span>' +
                '</div>' +
                '<p class="footer-blurb">' + esc(C.blurb) + '</p>' +
                '<img class="footer-stamp" src="' + url('images/brand/rubber-stamp.webp') + '" alt="Company seal">' +
              '</div>' +
              '<div>' +
                '<h3 class="footer-heading">Services</h3>' +
                '<ul class="footer-list">' + serviceLinks + '</ul>' +
              '</div>' +
              '<div>' +
                '<h3 class="footer-heading">Quick Links</h3>' +
                '<ul class="footer-list">' + quickLinks + '</ul>' +
              '</div>' +
              '<div>' +
                '<h3 class="footer-heading">Contact</h3>' +
                '<div class="footer-contact">' +
                  contactChip('phone.svg', C.phone, C.phoneHref) +
                  contactChip('email.svg', C.email, C.emailHref) +
                '</div>' +
                '<h3 class="footer-heading" style="margin-top:24px">Location</h3>' +
                '<p class="footer-address">' +
                  '<span class="footer-address__icon"><img src="' + url('images/icons/pin.svg') + '" alt=""></span>' +
                  /* UEN is already shown under the company name above. */
                  '<span>' + esc(C.address) + '</span>' +
                '</p>' +
                '<div class="footer-qr">' +
                  '<img src="' + url('images/brand/footer-qr.svg') + '" alt="QR code to office location">' +
                  '<span>Scan me to see office location</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="footer-rule"></div>' +
            '<div class="footer-base">' +
              '<p class="footer-copy">&copy; ' + new Date().getFullYear() + ' ' + esc(C.name) + '. All rights reserved.</p>' +
              '<nav class="footer-legal">' +
                '<a href="' + url('terms.html') + '">Terms of Use</a>' +
                '<a href="' + url('privacy.html') + '">Privacy Policy</a>' +
              '</nav>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>' +
      '<button class="to-top" id="to-top" aria-label="Back to top">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</button>';
    },

    /* Figma 197:2134 — opened by the "Get in Touch" CTA. */
    getInTouchModal: function () {
      function row(icon, label, value, cls) {
        return '<div class="gt__item ' + (cls || '') + '">' +
                 '<span class="gt__item-head">' +
                   '<span class="gt__icon"><img src="' + url('images/icons/' + icon) + '" alt=""></span>' +
                   '<span class="gt__label">' + esc(label) + '</span>' +
                 '</span>' +
                 '<span class="gt__value">' + value + '</span>' +
               '</div>';
      }

      return '' +
      '<div class="modal modal--gt" id="get-in-touch-modal" role="dialog" aria-modal="true" aria-labelledby="gt-title" hidden>' +
        '<div class="modal__panel gt">' +
          '<img class="gt__grid" src="' + url('images/modal/grid-lines.svg') + '" alt="" aria-hidden="true">' +
          '<img class="gt__skyline" src="' + url('images/modal/skyline-art.webp') + '" alt="" aria-hidden="true">' +

          '<button class="gt__close" type="button" data-close-modal aria-label="Close">' +
            '<img src="' + url('images/icons/close-line.svg') + '" alt="">' +
          '</button>' +

          '<div class="gt__brand">' +
            '<img class="gt__mark" src="' + url('images/modal/bce-mark.webp') + '" alt="">' +
            '<span class="gt__word"><i class="b">B</i><i class="c">C</i><i class="e">E</i></span>' +
          '</div>' +

          '<div class="gt__head">' +
            '<h2 class="gt__title" id="gt-title">Get in Touch</h2>' +
            '<p class="gt__sub">Reach out any time - our experts will talk you through the options and get the job sorted.</p>' +
          '</div>' +

          '<div class="gt__grid-2">' +
            row('phone.svg', 'Mobile/WhatsApp',
                '<a href="' + C.phoneHref + '">' + esc(C.phone) + '</a>') +
            row('email.svg', 'Email',
                '<a href="' + C.emailHref + '">' + esc(C.email) + '</a>') +
          '</div>' +

          /* UEN deliberately omitted - it lives in the footer only. */
          row('pin.svg', 'Office Location', esc(C.address), 'gt__item--wide') +

          '<div class="gt__qr">' +
            '<img src="' + url('images/modal/qr-code.svg') + '" alt="QR code to the BCE office location">' +
            '<p>(Scan me for exact location)</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    /* Optional loading overlay - see BCE.loader below. */
    loader: function () {
      return '' +
      '<div class="loader" id="app-loader" role="status" aria-live="polite" hidden>' +
        '<div class="loader__panel">' +
          '<img class="loader__logo" src="' + url('images/brand/bce-logo.webp') + '" alt="">' +
          '<div class="loader__track"><span class="loader__fill"></span></div>' +
          '<p class="loader__label">Loading</p>' +
        '</div>' +
      '</div>';
    },

    /* Figma 284:1900 — shown after the enquiry form is submitted. */
    successModal: function () {
      return '' +
      '<div class="modal modal--success" id="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title" hidden>' +
        '<div class="modal__panel sc">' +
          '<div class="sc__head">' +
            '<span class="sc__glow" aria-hidden="true"></span>' +
            '<img class="sc__tick" src="' + url('images/icons/tick-square.svg') + '" alt="">' +
            '<h2 class="sc__title" id="success-title">Submitted Successfully</h2>' +
            '<p class="sc__sub">We have received your query.</p>' +
          '</div>' +

          '<p class="sc__body">Sit back and relax - the right team will be in touch within an ' +
            'hour to confirm your booking.</p>' +

          '<p class="sc__ref"></p>' +
          '<p class="sc__fallback" hidden></p>' +
          '<button class="sc__close" type="button" data-close-modal>Close</button>' +

          '<img class="sc__art sc__art--a" src="' + url('images/modal/skyline-art.webp') + '" alt="" aria-hidden="true">' +
          '<img class="sc__art sc__art--b" src="' + url('images/modal/skyline-art.webp') + '" alt="" aria-hidden="true">' +
        '</div>' +
      '</div>';
    }
  };

  /* ---- Mounting --------------------------------------------------------- */

  /* ---- Loading overlay ----------------------------------------------------
     Optional, for work that may be slow on a poor connection.

         BCE.loader.show('Sending your request');   // nothing appears yet
         BCE.loader.progress(0.5);                  // only if a real % is known
         BCE.loader.hide();

     show() does NOT display anything straight away: it waits DELAY_MS first,
     so an operation that finishes quickly never flashes a loader on screen -
     a flash is worse than no feedback at all. If hide() arrives before that,
     the overlay was never shown and nothing happens.

     With no explicit progress the bar eases toward 90% and waits there. It
     deliberately never reaches 100% on its own, because arriving at "done"
     while the page is still waiting is a lie; hide() completes it.
     -------------------------------------------------------------------------- */

  BCE.loader = (function () {
    var DELAY_MS = 400;
    var el, fill, label, revealTimer, creepTimer, pct = 0, visible = false;

    function find() {
      if (!el) {
        el    = document.getElementById('app-loader');
        fill  = el && el.querySelector('.loader__fill');
        label = el && el.querySelector('.loader__label');
      }
      return el;
    }

    function set(p) {
      pct = Math.max(0, Math.min(1, p));
      if (fill) fill.style.width = (pct * 100) + '%';
    }

    return {
      show: function (text) {
        if (!find()) return;
        if (text && label) label.textContent = text;
        window.clearTimeout(revealTimer);
        revealTimer = window.setTimeout(function () {
          set(0.08);
          el.hidden = false;
          requestAnimationFrame(function () { el.classList.add('is-open'); });
          visible = true;
          window.clearInterval(creepTimer);
          creepTimer = window.setInterval(function () { set(pct + (0.9 - pct) * 0.12); }, 300);
        }, DELAY_MS);
      },

      progress: function (p) {
        window.clearInterval(creepTimer);
        set(p);
      },

      hide: function () {
        window.clearTimeout(revealTimer);
        window.clearInterval(creepTimer);
        if (!find() || !visible) { visible = false; return; }
        visible = false;
        set(1);                                  /* let the bar land first */
        window.setTimeout(function () {
          el.classList.remove('is-open');
          window.setTimeout(function () { el.hidden = true; set(0); }, 240);
        }, 180);
      }
    };
  })();

  BCE.mountShell = function () {
    var active = document.body.getAttribute('data-active-nav') || '';

    document.querySelectorAll('[data-component]').forEach(function (host) {
      var name = host.getAttribute('data-component');
      switch (name) {
        /* Replaced, not filled: the navbar must be a body-level sibling or its
           sticky positioning would be trapped inside the header's own box. */
        case 'site-header':   host.outerHTML = BCE.templates.header(active) + BCE.templates.drawer(); break;
        case 'cta-banner':    host.outerHTML = BCE.templates.ctaBanner(); break;
        case 'site-footer':   host.outerHTML = BCE.templates.footer(); break;
        /* Both dialogs mount from this one host so no page markup has to change. */
        case 'success-modal':
          host.outerHTML = BCE.templates.successModal() + BCE.templates.getInTouchModal() +
                           BCE.templates.loader();
          break;
      }
    });
  };
})(window.BCE);
