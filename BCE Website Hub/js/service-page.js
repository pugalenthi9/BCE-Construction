/* ==========================================================================
   BCE — Service detail page
   One template serves all six services. The slug comes from ?s=<slug>;
   an unknown or missing slug falls back to the first service rather than
   rendering an empty page.

   Sections follow Figma "Service Page 1" (1:958):
     hero 49:2930 · founder 49:2951 · process 1:2079 · how it works 1:1990
     · services grid 1:2017
   ========================================================================== */

(function (BCE) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Same card as the home grid - see renderers.js for what __hit does. */
  function serviceCard(s, delay) {
    var href = 'service.html?s=' + s.slug;
    return '<article class="service-card" data-reveal style="--reveal-delay:' + delay + 'ms">' +
             '<img class="service-card__img" src="' + s.image + '" alt="' + esc(s.title) + '" loading="lazy">' +
             '<span class="service-card__scrim"></span>' +
             '<span class="service-card__glow"></span>' +
             '<a class="service-card__hit" href="' + href + '" aria-hidden="true" tabindex="-1"></a>' +
             '<a class="service-card__badge" href="' + href + '" aria-label="Explore ' + esc(s.title) + '">' +
               BCE.CARD_ARROW +
             '</a>' +
             '<div class="service-card__body">' +
               '<h3 class="service-card__title">' + esc(s.title) + '</h3>' +
               '<div class="service-card__actions">' +
                 '<a class="pill-btn pill-btn--solid" href="contact.html?service=' + s.slug + '">' +
                   '<span>Book Now</span><span class="pill-btn__icon" data-icon="star-fall"></span>' +
                 '</a>' +
                 '<a class="pill-btn pill-btn--outline" href="' + href + '">Know more</a>' +
               '</div>' +
             '</div>' +
           '</article>';
  }

  BCE.initServicePage = function () {
    var root = document.querySelector('[data-service-page]');
    if (!root) return;

    var slug = new URLSearchParams(window.location.search).get('s');
    var service = BCE.services.filter(function (s) { return s.slug === slug; })[0] || BCE.services[0];

    function set(sel, value) {
      var el = root.querySelector(sel);
      if (el) el.textContent = value;
    }
    function fill(sel, html) {
      var el = root.querySelector(sel);
      if (el) el.innerHTML = html;
    }

    document.title = service.title + ' Services in Singapore — Bala Construction & Engineering';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', service.heroLead);

    /* Hero ----------------------------------------------------------------- */
    set('[data-field="heroTitle"]', service.heroTitle);
    set('[data-field="heroLead"]',  service.heroLead);

    /* The hero keeps the design's own backdrop unless a service overrides it;
       the card photo is a different crop and reads badly behind the veil. */
    var heroImg = root.querySelector('[data-field="heroImage"]');
    if (heroImg) {
      if (service.heroImage) heroImg.src = service.heroImage;
      heroImg.alt = '';
    }

    var book = root.querySelector('[data-field="bookLink"]');
    if (book) book.href = 'contact.html?service=' + service.slug;

    /* Founder. The service name is picked out in blue, as in the design. */
    var phrase = service.title.toLowerCase() + ' service';
    var quote  = esc(service.intro);
    var at     = quote.toLowerCase().indexOf(phrase);
    if (at === -1) { phrase = service.title.toLowerCase(); at = quote.toLowerCase().indexOf(phrase); }
    if (at > -1) {
      quote = quote.slice(0, at) +
              '<b>' + quote.substr(at, phrase.length) + '</b>' +
              quote.slice(at + phrase.length);
    }
    fill('[data-field="intro"]', quote);
    set('[data-field="body"]', service.body);

    /* Service process — six cards ------------------------------------------- */
    set('[data-field="processTitle"]', service.processTitle || ('Complete ' + service.title + ' Process'));
    set('[data-field="processLead"]',  service.processLead  || service.intro);

    fill('[data-field="steps"]', (service.steps || []).map(function (s, i) {
      return '<article class="provide__card" data-reveal style="--reveal-delay:' + (i % 3) * 90 + 'ms">' +
               '<span class="provide__icon" data-icon="tools-filled" aria-hidden="true"></span>' +
               '<h3 class="provide__title">' + esc(s.title) + '</h3>' +
               '<p class="provide__desc">' + esc(s.desc) + '</p>' +
             '</article>';
    }).join(''));

    /* Every other service, plus an "Others" route into the contact form. */
    var others = BCE.services.filter(function (s) { return s.slug !== service.slug; });
    fill('[data-field="related"]',
      others.map(function (s, i) { return serviceCard(s, (i % 3) * 90); }).join('') +
      /* "Others" routes to the enquiry form rather than a service page. */
      '<article class="service-card" data-reveal>' +
        '<img class="service-card__img" src="images/services/others.webp" alt="Other services" loading="lazy">' +
        '<span class="service-card__scrim"></span>' +
        '<span class="service-card__glow"></span>' +
        '<a class="service-card__hit" href="contact.html?service=other" aria-hidden="true" tabindex="-1"></a>' +
        '<a class="service-card__badge" href="contact.html?service=other" aria-label="Ask about another service">' +
          BCE.CARD_ARROW +
        '</a>' +
        '<div class="service-card__body">' +
          '<h3 class="service-card__title">Others</h3>' +
          '<div class="service-card__actions">' +
            '<a class="pill-btn pill-btn--solid" href="contact.html?service=other">' +
              '<span>Book Now</span><span class="pill-btn__icon" data-icon="star-fall"></span>' +
            '</a>' +
            '<a class="pill-btn pill-btn--outline" href="contact.html">Know more</a>' +
          '</div>' +
        '</div>' +
      '</article>');

    /* This runs again on every route change in the bundled build, so the
       freshly rendered cards must be re-registered with the scroll observer
       and the icon painter - otherwise they stay in their hidden start state. */
    if (BCE.paintIcons)    BCE.paintIcons(root);
    if (BCE.observeReveal) BCE.observeReveal(root);

    /* Mark the Services tab active in the nav. */
    var servicesTab = document.querySelector('[data-dropdown] .nav-link');
    if (servicesTab) servicesTab.classList.add('is-active');
  };
})(window.BCE);
