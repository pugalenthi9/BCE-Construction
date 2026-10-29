/* ==========================================================================
   BCE — Content renderers
   Turn the data in js/data/site.js into markup. Each renderer targets a mount
   point declared in HTML, e.g. <div data-render="service-cards"></div>.
   ========================================================================== */

(function (BCE) {
  'use strict';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var R = {};

  /* Home services bento (Figma 136:2126).
     Three columns at 388px with 32px gaps; the middle column is the offset one,
     running 486 then 392 while the outer columns run 436/436. Card heights are
     data, not magic numbers in CSS, so the layout stays editable here. */
  var SERVICE_BENTO = [
    { items: [0, 3], heights: [436, 436] },
    { items: [1, 4], heights: [486, 392] },
    { items: [2, 5], heights: [436, 436] }
  ];

  /* __hit is an invisible link covering the card, so a click or tap anywhere
     opens the service page. It sits before the badge and body in the DOM, so
     those - being positioned - paint above it and keep their own behaviour
     untouched. It is hidden from assistive tech and the tab order because the
     badge and "Know more" already offer this destination. */
  function serviceCard(s, height, delay) {
    var href = 'service.html?s=' + s.slug;
    return '<article class="service-card" style="--card-h:' + height + 'px;--reveal-delay:' + delay + 'ms" data-reveal>' +
             '<img class="service-card__img" src="' + s.image + '" alt="' + esc(s.title) + ' service" loading="lazy">' +
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
                   '<span>Book Now</span>' +
                   '<span class="pill-btn__icon" data-icon="star-fall"></span>' +
                 '</a>' +
                 '<a class="pill-btn pill-btn--outline" href="' + href + '">Know more</a>' +
               '</div>' +
             '</div>' +
           '</article>';
  }

  R['service-cards'] = function () {
    return SERVICE_BENTO.map(function (col, ci) {
      var cards = col.items.map(function (idx, ri) {
        return serviceCard(BCE.services[idx], col.heights[ri], ci * 90);
      }).join('');
      return '<div class="services-bento__col">' + cards + '</div>';
    }).join('');
  };

  /* Card badge arrow.
     The Figma export (images/icons/card-arrow.svg) is an 85x85 canvas holding
     the WHOLE badge - circle, blur filter and a foreignObject/div - not just a
     glyph. Scaled into a 36px button it renders as a speck, and foreignObject
     blur is unreliable across browsers. The circle is drawn in CSS instead
     (.service-card__badge) and this is the arrow that sits inside it. */
  BCE.CARD_ARROW =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M5 12h13M12.5 6l5.5 6-5.5 6" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  /* Shared arrow glyph for "Get Free Quote" style links. */
  var ARROW = '<svg viewBox="0 0 22 12" fill="none" aria-hidden="true">' +
                '<path d="M0 6h20M15 1l5 5-5 5" stroke="currentColor" stroke-width="1.6" ' +
                      'stroke-linecap="round" stroke-linejoin="round"/>' +
              '</svg>';

  R['building-types'] = function () {
    return BCE.buildingTypes.map(function (t, i) {
      return '<article class="type-card" data-reveal style="--reveal-delay:' + (i % 3) * 90 + 'ms">' +
               '<div class="type-card__media"><img src="' + t.image + '" alt="' + esc(t.title) + '" loading="lazy"></div>' +
               '<h3 class="type-card__title">' + esc(t.title) + '</h3>' +
               '<p class="type-card__desc">' + esc(t.desc) + '</p>' +
               '<a class="link-arrow type-card__link" href="contact.html?type=' + encodeURIComponent(t.title) + '">' +
                 '<span>Get Free Quote</span>' + ARROW +
               '</a>' +
             '</article>';
    }).join('');
  };

  R['process-steps'] = function () {
    return BCE.process.map(function (p) {
      return '<div class="process__step">' +
               '<div class="process__step-head">' +
                 '<span class="process__num">' + esc(p.n) + '</span>' +
                 '<h3 class="process__step-title">' + esc(p.title) + '</h3>' +
               '</div>' +
               '<p class="process__step-desc">' + esc(p.desc) + '</p>' +
             '</div>';
    }).join('');
  };

  R['testimonials'] = function (host) {
    /* The quotes shipped in site.js are placeholders. Emptying that array is a
       valid way to launch without them, so hide the section rather than leave
       a heading above an empty grid. */
    var section = host && host.closest ? host.closest('section') : null;
    if (!BCE.testimonials || !BCE.testimonials.length) {
      if (section) section.hidden = true;
      return '';
    }
    if (section) section.hidden = false;

    /* Marked, not disguised: while the quotes are samples the section says so
       in plain sight. Set BCE.testimonialsAreSamples = false once real,
       permissioned quotes replace them and this disappears. */
    var notice = BCE.testimonialsAreSamples
      ? '<p class="testimonials__notice">' +
          '<strong>Sample content.</strong> These quotes are placeholders for layout only ' +
          '&mdash; they are not real customer reviews, and must be replaced before launch.' +
        '</p>'
      : '';

    return notice + BCE.testimonials.map(function (t, i) {
      var stars = '';
      for (var n = 0; n < 5; n++) stars += '<span aria-hidden="true">' + (n < t.stars ? '★' : '☆') + '</span>';
      return '<article class="testimonial" data-reveal style="--reveal-delay:' + (i % 3) * 90 + 'ms">' +
               '<div class="testimonial__stars">' + stars +
                 '<span class="sr-only">' + t.stars + ' out of 5</span>' +
               '</div>' +
               '<p class="testimonial__category">' + esc(t.category) + '</p>' +
               '<p class="testimonial__quote">' + esc(t.quote) + '</p>' +
               '<div class="testimonial__client">' +
                 '<span class="testimonial__avatar">' + esc(t.name.charAt(0)) + '</span>' +
                 '<span>' +
                   '<span class="testimonial__name">' + esc(t.name) + '</span><br>' +
                   '<span class="testimonial__role">' + esc(t.role) + '</span>' +
                 '</span>' +
               '</div>' +
             '</article>';
    }).join('');
  };

  /* Figma 437:1221. The icons are supplied SVGs carrying their own colour, so
     they go in as <img> at the design's 60x60 - never recoloured or inlined. */
  R['values'] = function () {
    return BCE.values.map(function (v, i) {
      return '<article class="value" data-reveal style="--reveal-delay:' + i * 90 + 'ms">' +
               '<img class="value__icon" src="' + v.icon + '" alt="" aria-hidden="true" width="60" height="60" loading="lazy">' +
               '<h3 class="value__title">' + esc(v.title) + '</h3>' +
               '<p class="value__desc">' + esc(v.desc) + '</p>' +
             '</article>';
    }).join('');
  };

  /* Figma 437:1464 - the orange "Meet our MD" band. */
  R['founder-band'] = function () {
    var f = BCE.founder;
    return '<img class="md__grid" src="images/misc/perspective-grid.svg" alt="" aria-hidden="true">' +
           '<div class="container md">' +
             /* .eyebrow is already the design's pill: 20px radius, 12px medium,
                uppercase, 8px padding - only the colours differ here. */
             '<span class="eyebrow eyebrow--on-orange" data-reveal>' + esc(f.eyebrow) + '</span>' +
             '<div class="md__body" data-reveal>' +
               '<p class="md__lead">' + esc(f.lead) + '</p>' +
               '<blockquote class="md__quote">' +
                 '<span class="md__mark">&ldquo;</span>' +
                 esc(f.quote).replace('BCE', '<b>BCE</b>') +
                 '<span class="md__mark">&rdquo;</span>' +
               '</blockquote>' +
             '</div>' +
             '<figure class="md__person" data-reveal>' +
               '<img class="md__photo" src="' + f.photo + '" alt="' + esc(f.name) + '" width="56" height="56" loading="lazy">' +
               '<figcaption>' +
                 '<span class="md__name">' + esc(f.name) + '</span>' +
                 '<span class="md__role">' + esc(f.role) + '</span>' +
               '</figcaption>' +
             '</figure>' +
           '</div>';
  };

  /* Hero marquee — the set is duplicated so the CSS loop is seamless. */
  R['hero-gallery'] = function () {
    var slides = [
      ['images/hero/g1-interior-orange.webp', 'Residential interior'],
      ['images/hero/g2-office-corridor.webp', 'Office corridor fit-out'],
      ['images/hero/g3-engineer-model.webp',  'Engineer reviewing a building model'],
      ['images/hero/g4-blueprints.webp',      'Project blueprints'],
      ['images/hero/g5-modern-office.webp',   'Modern office space'],
      ['images/hero/g6-site-plan.webp',       'Site team reviewing plans']
    ];
    function set(hidden) {
      return slides.map(function (s) {
        return '<figure class="hero__slide"' + (hidden ? ' aria-hidden="true"' : '') + '>' +
                 '<img src="' + s[0] + '" alt="' + (hidden ? '' : esc(s[1])) + '">' +
               '</figure>';
      }).join('');
    }
    return set(false) + set(true);
  };

  /* --------------------------------------------------------------------------
     Enquiry form
     Defined once here and rendered into both the home and contact pages, so
     the two forms cannot drift apart. Labels sit above their control; every
     control carries an id, an explicit <label>, aria-required and
     aria-describedby pointing at its error node.
     -------------------------------------------------------------------------- */

  /* Icons exported from the design, not redrawn. */
  var CHEVRON = '<img class="field__chevron" src="images/icons/arrow-down.svg" alt="">';
  var MIC     = '<img src="images/icons/mic.svg" alt="">';

  /* Placeholders are generic examples on purpose. They previously echoed BCE's
     own name, phone, street and postal code, which read as if the form had been
     pre-filled with the company's details instead of the visitor's. */
  var ENQUIRY_FIELDS = [
    { name: 'fullName', label: 'Full Name', type: 'text',
      hint: 'e.g. Tan Wei Ming', autocomplete: 'name' },

    { row: [
      { name: 'contactNumber', label: 'Contact Number', type: 'tel',
        hint: 'e.g. +65 8123 4567', autocomplete: 'tel' },
      { name: 'email', label: 'Email ID', type: 'email',
        hint: 'e.g. yourname@email.com', autocomplete: 'email' }
    ] },

    { name: 'address', label: 'Address', type: 'text',
      hint: 'e.g. Block 123, Ang Mo Kio Ave 6, #05-12', autocomplete: 'street-address',
      geo: true },

    { row: [
      { name: 'postalCode', label: 'Postal Code', type: 'text',
        hint: 'e.g. 560123', inputmode: 'numeric', autocomplete: 'postal-code' },
      { name: 'country', label: 'Country', type: 'text', value: 'Singapore',
        readonly: true, optional: true }
    ] },

    { name: 'buildingType', label: 'Building Type', combo: 'building',
      hint: 'Select the type of property' },

    /* Full width on its own line - it holds chips and needs the room. */
    { name: 'service', label: 'Choose Service', combo: 'service', multi: true,
      hint: 'Add one or more services' },

    { name: 'message', label: 'What is the issue you are facing?', textarea: true,
      hint: 'e.g. Ceiling leak in the master bathroom after heavy rain.' }
  ];

  function field(f, scope) {
    var id  = 'f-' + scope + '-' + f.name;
    var eid = 'e-' + scope + '-' + f.name;
    var lid = 'l-' + scope + '-' + f.name;
    var cls = 'field' + (f.textarea ? ' field--area' : '') + (f.combo ? ' field--combo' : '');

    var described = ' aria-describedby="' + eid + '"' + (f.optional ? '' : ' aria-required="true"');
    var common = ' class="field__control" id="' + id + '" name="' + f.name + '"' + described;

    var control;

    if (f.combo) {
      /* Custom combobox: a native <select> cannot carry chips or the panel
         styling, so it is rebuilt from an input + listbox and writes through
         to a hidden field that the form reads like any other control. */
      control =
        '<div class="combo" data-combo data-options="' + f.combo + '"' +
             (f.multi ? ' data-multi="true"' : '') + '>' +
          '<div class="combo__control">' +
            '<span class="combo__chips"></span>' +
            '<input class="combo__input" id="' + id + '" type="text" autocomplete="off"' +
                   ' role="combobox" aria-expanded="false" aria-autocomplete="list"' +
                   ' aria-controls="' + lid + '"' + described +
                   ' placeholder="' + esc(f.hint) + '">' +
            CHEVRON +
          '</div>' +
          '<ul class="combo__panel" id="' + lid + '" role="listbox"' +
              (f.multi ? ' aria-multiselectable="true"' : '') + ' hidden></ul>' +
          '<input type="hidden" name="' + f.name + '">' +
        '</div>';

    } else if (f.textarea) {
      control = '<div class="field__wrap">' +
                  '<textarea' + common + ' placeholder="' + esc(f.hint) + '" rows="4"></textarea>' +
                  '<button class="voice-btn" type="button" aria-label="Dictate your message">' +
                    MIC + '<span>Voice Input</span></button>' +
                '</div>';

    } else {
      control = '<div class="field__wrap">' +
                  '<input' + common +
                    ' type="' + f.type + '"' +
                    (f.hint ? ' placeholder="' + esc(f.hint) + '"' : '') +
                    (f.value ? ' value="' + esc(f.value) + '"' : '') +
                    (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : '') +
                    (f.inputmode ? ' inputmode="' + f.inputmode + '"' : '') +
                    (f.readonly ? ' readonly' : '') + '>' +
                  (f.geo
                    ? '<button class="field__geo" type="button" data-geolocate' +
                            ' aria-label="Use my current location">' +
                        '<img src="images/icons/pin.svg" alt="">' +
                      '</button>'
                    : '') +
                '</div>';
    }

    return '<div class="' + cls + '">' +
             '<label class="field__label" for="' + id + '">' + esc(f.label) + '</label>' +
             control +
             '<p class="field__error" id="' + eid + '" role="alert"></p>' +
           '</div>';
  }

  /* Flat {name,label} list, so the email template labels its rows with exactly
     the same wording the visitor saw on screen. */
  BCE.enquiryFields = ENQUIRY_FIELDS.reduce(function (out, entry) {
    (entry.row || [entry]).forEach(function (f) {
      out.push({ name: f.name, label: f.label });
    });
    return out;
  }, []);

  R['enquiry-fields'] = function (host) {
    var scope = (host && host.getAttribute('data-form-scope')) || 'x';

    var body = ENQUIRY_FIELDS.map(function (entry) {
      if (entry.row) {
        return '<div class="form-row">' +
                 entry.row.map(function (f) { return field(f, scope); }).join('') +
               '</div>';
      }
      return field(entry, scope);
    }).join('');

    return '<p class="form-note"><span aria-hidden="true">*</span> All fields are mandatory</p>' +
           '<div class="form-grid">' + body +
             '<button class="btn btn--submit" type="submit">' +
               '<span class="btn__icon" data-icon="star-fall"></span>' +
               '<span>Submit Request</span>' +
             '</button>' +
             '<p class="form-note" data-storage-note role="status"></p>' +
           '</div>';
  };

  BCE.renderers = R;

  /* The host is passed through so a renderer can read its own data-* options
     (the enquiry form uses it to namespace field ids per page). */
  BCE.renderAll = function (scope) {
    (scope || document).querySelectorAll('[data-render]').forEach(function (host) {
      var fn = R[host.getAttribute('data-render')];
      if (fn) host.innerHTML = fn(host);
    });
    if (BCE.paintIcons)    BCE.paintIcons(scope || document);
    if (BCE.observeReveal) BCE.observeReveal(scope || document);
  };
})(window.BCE);
