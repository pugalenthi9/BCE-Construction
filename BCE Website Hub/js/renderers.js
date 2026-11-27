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

  /* Sectors We Serve (Figma 715:3657). One label on every card, "Request a
     Site Visit"; it lands on the contact page's form (#enquiry) with the
     building type already chosen. The hidden "for <type>" keeps the six
     links apart in screen-reader link lists. */
  R['building-types'] = function () {
    return BCE.buildingTypes.map(function (t, i) {
      return '<article class="type-card" data-reveal style="--reveal-delay:' + (i % 2) * 90 + 'ms">' +
               '<div class="type-card__media"><img src="' + t.image + '" alt="' + esc(t.title) + '" loading="lazy"></div>' +
               '<div class="type-card__body">' +
                 '<h3 class="type-card__title">' + esc(t.title) + '</h3>' +
                 '<p class="type-card__desc">' + esc(t.desc) + '</p>' +
               '</div>' +
               '<a class="type-card__link" href="contact.html?type=' + encodeURIComponent(t.title) + '#enquiry">' +
                 '<span>Request a Site Visit<span class="sr-only"> for ' + esc(t.title) + '</span></span>' +
                 '<img class="type-card__arrow" src="images/icons/arrow-site-visit.svg" alt="">' +
               '</a>' +
             '</article>';
    }).join('');
  };

  /* How it works timeline (Figma 1:1990 / 636:1436), on the home and service
     pages. The first step ships lit so the list reads right before main.js
     runs; initSteps then moves the light down the rail as the page scrolls. */
  R['process-steps'] = function () {
    return BCE.process.map(function (p, i) {
      return '<li class="steps__item' + (i === 0 ? ' is-current is-done' : '') + '">' +
               '<span class="steps__dot" aria-hidden="true"></span>' +
               '<h3 class="steps__name"><span class="steps__n">' + esc(p.n) + '</span> ' + esc(p.title) + '</h3>' +
               '<p class="steps__desc">' + esc(p.desc) + '</p>' +
             '</li>';
    }).join('');
  };

  /* "Why choose us" on the service pages (Figma 597:1351). Supplied icons8
     art carrying its own colour, shown as-is at 48px. */
  R['why-choose'] = function () {
    return (BCE.whyChoose || []).map(function (v, i) {
      return '<article class="why__item" data-reveal style="--reveal-delay:' + i * 90 + 'ms">' +
               '<span class="why__icon"><img src="' + v.icon + '" alt="" width="48" height="48" loading="lazy"></span>' +
               '<h3 class="why__name">' + esc(v.title) + '</h3>' +
               '<p class="why__desc">' + esc(v.desc) + '</p>' +
             '</article>';
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
    var notice = section && section.querySelector('.reviews__notice');
    if (notice) notice.hidden = !BCE.testimonialsAreSamples;

    /* One card per review, in a list; the strip's motion lives in main.js. */
    return BCE.testimonials.map(function (t) {
      return '<li class="reviews__item">' + BCE.reviewCard(t, { stars: 'row' }) + '</li>';
    }).join('');
  };

  /* Home FAQ (Figma 495:1320). A real disclosure pattern: each question is a
     button inside a heading, wired to its answer region with aria-expanded /
     aria-controls. The first item ships open, so the page reads correctly
     before main.js runs. The answer box sits inside an extra wrapper because
     the 0fr -> 1fr row transition needs a child that can shrink to nothing. */
  R['faq'] = function () {
    return (BCE.faqs || []).map(function (f, i) {
      var open = i === 0;
      var qid = 'faq-q-' + i, aid = 'faq-a-' + i;
      return '<div class="faq-item' + (open ? ' is-open' : '') + '">' +
               '<h3 class="faq-item__head">' +
                 '<button class="faq-item__q" id="' + qid + '" type="button"' +
                        ' aria-expanded="' + open + '" aria-controls="' + aid + '">' +
                   '<span>' + esc(f.q) + '</span>' +
                   '<img class="faq-item__chev" src="images/icons/chevron-down-small.svg" alt="" width="20" height="20">' +
                 '</button>' +
               '</h3>' +
               '<div class="faq-item__panel" id="' + aid + '" role="region" aria-labelledby="' + qid + '">' +
                 '<div class="faq-item__clip">' +
                   '<div class="faq-item__a"><p>' + esc(f.a) + '</p></div>' +
                 '</div>' +
               '</div>' +
             '</div>';
    }).join('');
  };

  /* The fact timeline (Figma 697:2998, 437:1464): one square on the rail
     over each fact. initCounters ticks each count up when it comes into view.
     The licence is the supplied bizSAFE STAR artwork, wreath included. */
  R['facts'] = function () {
    return (BCE.facts || []).map(function (f) {
      return '<li class="facts__item">' +
               '<p class="facts__label">' + esc(f.label) + '</p>' +
               '<p class="facts__value" data-count="' + Number(f.count) + '">' + Number(f.count) + '+</p>' +
             '</li>';
    }).join('') +
    '<li class="facts__item facts__item--license">' +
      '<p class="facts__label">License</p>' +
      '<img class="facts__license" src="images/brand/bizsafe-wreath.webp" alt="bizSAFE STAR certified" width="153" height="64" loading="lazy">' +
    '</li>';
  };

  /* About page: words from the MD (Figma 437:1464). */
  R['md-words'] = function () {
    var f = BCE.founder;
    return '<blockquote class="md-words__quote">' + esc(f.quote) + '</blockquote>' +
           '<figcaption class="md-words__by">' +
             '<span class="md-words__name">' + esc(f.name) + '</span>' +
             '<span class="md-words__role">' + esc(f.role) + '</span>' +
           '</figcaption>';
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

  /* Icons exported from the design, not redrawn. The contact page's inline
     form (Figma 734:1214) has its own chevron, location and mic exports. */
  var CHEVRON = '<img class="field__chevron" src="images/icons/arrow-down.svg" alt="">';
  var MIC     = '<img src="images/icons/mic.svg" alt="">';
  var ICONS_INLINE = {
    chevron: '<img class="field__chevron" src="images/icons/chevron-up-20.svg" alt="">',
    mic:     '<img src="images/icons/mic-ai.svg" alt="">',
    geo:     'images/icons/location-target.svg'
  };

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
      inlineLabel: 'More about your problem',
      hint: 'e.g. Ceiling leak in the master bathroom after heavy rain.',
      /* What happens after Submit, said where the visitor is about to commit. */
      note: 'Our team will reply within 24 hours and arrange a site visit before we quote.' }
  ];

  /* `inline`: the label sits inside the field where the design shows it and
     lifts onto the top border once the field is focused or filled (CSS);
     the example hint only appears under it while the field has focus. */
  function field(f, scope, inline) {
    var id  = 'f-' + scope + '-' + f.name;
    var eid = 'e-' + scope + '-' + f.name;
    var lid = 'l-' + scope + '-' + f.name;
    var cls = 'field' + (f.textarea ? ' field--area' : '') + (f.combo ? ' field--combo' : '') +
              (inline ? ' field--inline' : '') + (inline && f.readonly ? ' field--fixed' : '');
    var label   = inline && f.inlineLabel ? f.inlineLabel : f.label;
    var chevron = inline ? ICONS_INLINE.chevron : CHEVRON;
    var mic     = inline ? ICONS_INLINE.mic : MIC;
    var note    = inline ? '' : f.note;

    var nid = 'n-' + scope + '-' + f.name;
    var described = ' aria-describedby="' + eid + (note ? ' ' + nid : '') + '"' +
                    (f.optional ? '' : ' aria-required="true"');
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
            chevron +
          '</div>' +
          '<ul class="combo__panel" id="' + lid + '" role="listbox"' +
              (f.multi ? ' aria-multiselectable="true"' : '') + ' hidden></ul>' +
          '<input type="hidden" name="' + f.name + '">' +
        '</div>';

    } else if (f.textarea) {
      control = '<div class="field__wrap">' +
                  '<textarea' + common + ' placeholder="' + esc(f.hint) + '" rows="4"></textarea>' +
                  '<button class="voice-btn" type="button" aria-label="Dictate your message">' +
                    mic + '<span>Voice Input</span></button>' +
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
                        '<img src="' + (inline ? ICONS_INLINE.geo : 'images/icons/pin.svg') + '" alt="">' +
                      '</button>'
                    : '') +
                '</div>';
    }

    return '<div class="' + cls + '">' +
             '<label class="field__label" for="' + id + '">' + esc(label) + '</label>' +
             control +
             '<p class="field__error" id="' + eid + '" role="alert"></p>' +
             (note ? '<p class="field__note" id="' + nid + '">' +
                         '<span class="field__note-icon" data-icon="info"></span>' +
                         '<span>' + esc(note) + '</span>' +
                       '</p>' : '') +
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
    var scope  = (host && host.getAttribute('data-form-scope')) || 'x';
    /* data-form-style="inline" (contact page, Figma 734:1214): labels inside
       the fields, and Building Type + Choose Service share one row. */
    var inline = !!host && host.getAttribute('data-form-style') === 'inline';
    var entries = !inline ? ENQUIRY_FIELDS : ENQUIRY_FIELDS.reduce(function (out, e) {
      var prev = out[out.length - 1];
      if (e.name === 'service' && prev && prev.name === 'buildingType') out[out.length - 1] = { row: [prev, e] };
      else out.push(e);
      return out;
    }, []);

    var body = entries.map(function (entry) {
      if (entry.row) {
        return '<div class="form-row">' +
                 entry.row.map(function (f) { return field(f, scope, inline); }).join('') +
               '</div>';
      }
      return field(entry, scope, inline);
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
