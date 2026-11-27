/* ==========================================================================
   BCE — Service detail page
   One template serves all six services. The slug comes from ?s=<slug>;
   an unknown or missing slug falls back to the first service rather than
   rendering an empty page.

   Sections follow Figma "Service Page 1" (1:958):
     hero 49:2930 · sub-services 606:2048 · how it works 1:1990
     · why choose us 597:1351 · recent work 599:1511 · FAQ 603:1600
     · other services 1:2017
   How it works, Why choose us and the FAQ are rendered by renderers.js.
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

  /* "[We Handle] All Your Aircon Work" - the bracketed lead-in takes its own
     line in the quiet title-lead tone; the rest is the point, in full colour. */
  function twoTone(text) {
    return esc(text).replace(/\[([^\]]+)\]/g, '<span class="title-lead">$1</span>');
  }

  /* Arrow inside the row's circle. Drawn pointing up-right; the row's hover
     turns the whole circle 45deg so it points along the row (Figma 609:2177). */
  var ROW_ARROW =
    '<svg viewBox="0 0 33 33" aria-hidden="true">' +
      '<path d="M10.5 22.31l.35.36 11.32-11.32-.36-.35-.35-.35-11.31 11.31.35.35zM22.31 11a.5.5 0 0 0-.5-.5h-4.5a.5.5 0 0 0 0 1h4v4a.5.5 0 0 0 1 0V11z" fill="currentColor"/>' +
    '</svg>';

  /* One row per sub-service. The whole row is one link (the stretched
     __go link) that opens the enquiry form with this service picked and the
     job named in the message, so a visitor never re-types what they chose. */
  function rows(list, service) {
    return (list || []).map(function (r, i) {
      var name = r[0], desc = r[1];
      var href = 'contact.html?service=' + service.slug + '&need=' + encodeURIComponent(name) + '#enquiry';
      var n = (i + 1 < 10 ? '0' : '') + (i + 1);
      return '<li class="subsvc__row" data-reveal style="--reveal-delay:' + Math.min(i, 4) * 50 + 'ms">' +
               '<span class="subsvc__num">' + n + '</span>' +
               '<h4 class="subsvc__name">' + esc(name) + '</h4>' +
               '<p class="subsvc__desc">' + esc(desc) + '</p>' +
               '<a class="subsvc__go" href="' + href + '" aria-label="Book ' + esc(name) + '">' +
                 ROW_ARROW +
               '</a>' +
             '</li>';
    }).join('');
  }

  /* Figma 599:1511 - the client's review card beside the photo (with its
     category badge), and the job details underneath. The review is the
     sample testimonial for the same trade (BCE.testimonials).
     Entrance and hover each own an element, so the two never fight over one
     transform: the slot and the figure animate in (initWorkReveal in
     main.js); the card and the image respond to hover. */
  function workBlock(service) {
    var w = service.work;
    if (!w) return '';
    var review = (BCE.testimonials || []).filter(function (t) {
      return t.category.toLowerCase() === service.title.toLowerCase();
    })[0];

    /* work.zoom reproduces a designed crop: the photo drawn that many times
       larger than a plain cover fit, anchored to its top-left corner. */
    var crop = w.zoom ? ' class="is-cropped" style="--crop:' + Number(w.zoom) + '"' : '';

    return '<article class="work__item">' +
             '<div class="work__stage">' +
               (review
                 ? '<div class="work__card-slot">' +
                     BCE.reviewCard(review, { stars: 'single', cls: 'work-review' }) +
                   '</div>'
                 : '') +
               '<figure class="work__media">' +
                 '<div class="work__zoom">' +
                   '<img src="' + w.image + '" alt="' + esc(w.alt || w.title) + '" loading="lazy"' + crop + '>' +
                 '</div>' +
                 '<figcaption class="work__badge">' + esc(w.tag) + '</figcaption>' +
               '</figure>' +
             '</div>' +
             '<div class="work__meta">' +
               '<span>' + esc(w.date) + '</span>' +
               '<span>' + esc(w.place) + '</span>' +
             '</div>' +
             '<h3 class="work__name">' + esc(w.title) + '</h3>' +
             '<p class="work__desc">' + esc(w.desc) + '</p>' +
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

    /* The where-am-I badge (main.js) names the service from here, so the
       single-file preview's views always show the one on screen. */
    root.setAttribute('data-service-name', service.title);

    var book = root.querySelector('[data-field="bookLink"]');
    if (book) book.href = 'contact.html?service=' + service.slug;
    var ask = root.querySelector('[data-field="askLink"]');
    if (ask) ask.href = 'contact.html?service=' + service.slug + '#enquiry';

    /* Sub-services ---------------------------------------------------------- */
    fill('[data-field="listTitle"]', twoTone(service.listTitle || ('[We Handle] All Your ' + service.title + ' Work')));
    set('[data-field="listLead"]', service.listLead || service.heroLead);
    fill('[data-field="homes"]', rows(service.homes, service));
    fill('[data-field="commercial"]', rows(service.commercial, service));

    /* A trade with no commercial list drops that group and its pill. */
    var hasCom = service.commercial && service.commercial.length;
    root.querySelectorAll('[data-subsvc-group="commercial"], [data-subsvc-tab="commercial"]').forEach(function (el) {
      el.hidden = !hasCom;
    });

    /* Recent work ----------------------------------------------------------- */
    var work = workBlock(service);
    fill('[data-field="work"]', work);
    var workSection = root.querySelector('[data-field="workSection"]');
    if (workSection) workSection.hidden = !work;

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
    if (BCE.refreshSubsvc) BCE.refreshSubsvc();

    /* Mark the Services tab active in the nav. */
    var servicesTab = document.querySelector('[data-dropdown] .nav-link');
    if (servicesTab) servicesTab.classList.add('is-active');
  };
})(window.BCE);
