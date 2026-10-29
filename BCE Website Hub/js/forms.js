/* ==========================================================================
   BCE — Enquiry form
   Client-side validation, temporary storage, and the success confirmation
   modal. Submissions are held in localStorage under BCE_SUBMISSIONS so the
   flow is demonstrable end-to-end without a backend; swapping in a real
   endpoint means replacing store() with a fetch call.
   ========================================================================== */

(function (BCE) {
  'use strict';

  var STORAGE_KEY = 'BCE_SUBMISSIONS';

  /* localStorage throws in some privacy modes — never let that break submit. */
  function store(record) {
    try {
      var all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      all.push(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  }

  BCE.getSubmissions = function () {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  };

  var rules = {
    fullName: {
      required: true,
      test: function (v) { return v.trim().length >= 2; },
      message: 'Please enter your full name.'
    },
    contactNumber: {
      required: true,
      test: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()); },
      message: 'Enter a valid contact number.'
    },
    email: {
      required: true,
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: 'Enter a valid email address.'
    },
    address:    { required: true, test: function (v) { return v.trim().length >= 4; },
                  message: 'Please enter your address.' },
    postalCode: { required: true, test: function (v) { return /^\d{5,6}$/.test(v.trim()); },
                  message: 'Singapore postal codes are 6 digits.' },
    buildingType: { required: true, test: function (v) { return !!v; },
                  message: 'Select a building type.' },
    service:    { required: true, test: function (v) { return !!v; },
                  message: 'Select a service.' },
    message:    { required: true, test: function (v) { return v.trim().length >= 10; },
                  message: 'Tell us a little more — at least 10 characters.' }
  };

  function fieldWrap(input)  { return input.closest('.field'); }
  function fieldError(input) {
    var wrap = fieldWrap(input);
    return wrap ? wrap.querySelector('.field__error') : null;
  }

  /* Drives the floating label: once a control holds a value its label stays
     lifted even when focus moves away, so the field name never disappears. */
  function syncFilled(input) {
    var wrap = fieldWrap(input);
    if (wrap) wrap.classList.toggle('is-filled', !!(input.value || '').trim());
  }

  function showError(input, msg) {
    input.setAttribute('aria-invalid', 'true');
    var wrap = fieldWrap(input);
    if (wrap) wrap.classList.add('has-error');
    var el = fieldError(input);
    if (el) { el.textContent = msg; el.classList.add('is-shown'); }
  }

  function clearError(input) {
    input.removeAttribute('aria-invalid');
    var wrap = fieldWrap(input);
    if (wrap) wrap.classList.remove('has-error');
    var el = fieldError(input);
    if (el) { el.classList.remove('is-shown'); el.textContent = ''; }
  }

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var value = input.value || '';
    if (rule.required && !value.trim()) { showError(input, rule.message); return false; }
    if (value.trim() && !rule.test(value)) { showError(input, rule.message); return false; }
    clearError(input);
    return true;
  }

  /* ---- Success modal ---------------------------------------------------- */

  var lastFocused = null;
  var FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), ' +
                  'select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

  function openModal(id) {
    var modal = typeof id === 'string' ? document.getElementById(id) : id;
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    var first = modal.querySelector('[data-close-modal]') || modal.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeModal(modal) {
    modal = modal || document.querySelector('.modal.is-open');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { modal.hidden = true; }, 240);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  BCE.openModal  = openModal;
  BCE.closeModal = closeModal;

  BCE.initModal = function () {
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-open-modal]');
      if (opener) {
        e.preventDefault();
        openModal(opener.getAttribute('data-open-modal'));
        return;
      }
      if (e.target.closest('[data-close-modal]')) { closeModal(e.target.closest('.modal')); return; }
      /* A click on the backdrop itself, not inside the panel. */
      if (e.target.classList && e.target.classList.contains('modal')) closeModal(e.target);
    });

    document.addEventListener('keydown', function (e) {
      var open = document.querySelector('.modal.is-open');
      if (!open) return;

      if (e.key === 'Escape') { closeModal(open); return; }

      /* Keep Tab inside the dialog while it is up. */
      if (e.key !== 'Tab') return;
      var items = Array.prototype.filter.call(
        open.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  };

  /* ---- Voice input ------------------------------------------------------ */

  function initVoice(form) {
    var btn = form.querySelector('.voice-btn');
    var area = form.querySelector('textarea[name="message"]');
    if (!btn || !area) return;

    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      btn.disabled = true;
      btn.title = 'Voice input is not supported in this browser';
      btn.style.opacity = '.5';
      return;
    }

    var recog = new Recognition();
    recog.lang = 'en-SG';
    recog.interimResults = false;
    var active = false;

    btn.addEventListener('click', function () {
      if (active) { recog.stop(); return; }
      try { recog.start(); } catch (e) { return; }
      active = true;
      btn.classList.add('is-recording');
      btn.querySelector('span').textContent = 'Listening…';
    });

    recog.addEventListener('result', function (e) {
      var text = Array.prototype.map.call(e.results, function (r) { return r[0].transcript; }).join(' ');
      area.value = (area.value ? area.value + ' ' : '') + text;
      validateField(area);
    });

    ['end', 'error'].forEach(function (evt) {
      recog.addEventListener(evt, function () {
        active = false;
        btn.classList.remove('is-recording');
        btn.querySelector('span').textContent = 'Voice Input';
      });
    });
  }

  /* ---- Current location -------------------------------------------------
     Clicking the pin asks the browser for GPS. The browser owns the permission
     prompt - there is no way to request it earlier or bypass it, so the button
     explains itself and degrades to coordinates if the lookup fails.

     Reverse geocoding uses OpenStreetMap's Nominatim: keyless and CORS-enabled,
     which suits a preview. A production build should swap in a provider with an
     agreement and a key (OneMap for Singapore, or Google) - that is the single
     fetch URL below.
     ---------------------------------------------------------------------- */

  function setHint(wrap, msg, isError) {
    var line = wrap.parentNode.querySelector('.field__hintline');
    if (!line) {
      line = document.createElement('p');
      line.className = 'field__hintline';
      wrap.parentNode.insertBefore(line, wrap.nextSibling);
    }
    line.textContent = msg || '';
    line.classList.toggle('is-error', !!isError);
  }

  function reverseGeocode(lat, lon) {
    var url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18' +
              '&lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon);
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function initGeolocate(form) {
    form.querySelectorAll('[data-geolocate]').forEach(function (btn) {
      var wrap  = btn.closest('.field__wrap');
      var input = wrap.querySelector('.field__control');
      var postal = form.querySelector('[name="postalCode"]');

      btn.addEventListener('click', function () {
        if (!navigator.geolocation) {
          setHint(wrap, 'This browser cannot share a location.', true);
          return;
        }

        btn.disabled = true;
        btn.classList.add('is-busy');
        setHint(wrap, 'Asking your browser for permission to use your location...');

        navigator.geolocation.getCurrentPosition(function (pos) {
          var lat = pos.coords.latitude, lon = pos.coords.longitude;

          /* The permission prompt above waits on the person, so no loader for
             that. This lookup is a real network call that can hang on a weak
             connection - and show() only paints if it actually takes a while.
             reverseGeocode catches its own errors, so hide() always runs. */
          if (BCE.loader) BCE.loader.show('Looking up your address');

          reverseGeocode(lat, lon).then(function (data) {
            if (BCE.loader) BCE.loader.hide();
            if (data && data.display_name) {
              input.value = data.display_name;
              var pc = data.address && (data.address.postcode || '');
              if (pc && postal && !postal.value) { postal.value = pc; syncFilled(postal); }
              setHint(wrap, 'Filled from your current location - edit it if the unit number is missing.');
            } else {
              input.value = lat.toFixed(6) + ', ' + lon.toFixed(6);
              setHint(wrap, 'Address lookup was unavailable, so coordinates were used instead.', true);
            }
            syncFilled(input);
            validateField(input);
            btn.disabled = false;
            btn.classList.remove('is-busy');
          });

        }, function (err) {
          btn.disabled = false;
          btn.classList.remove('is-busy');
          var msg = err.code === 1
            ? 'Location permission was declined. Enable it for this site, or type the address.'
            : 'Could not get a location fix. Please type the address.';
          setHint(wrap, msg, true);
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
      });
    });
  }

  /* ---- Confirmation extras ----------------------------------------------- */

  function showReference(ref) {
    var slot = document.querySelector('#success-modal .sc__ref');
    if (slot) slot.textContent = 'Reference ' + ref;
  }

  /* Only reached when no relay is configured: hands the visitor a prefilled
     draft so the details still reach the office. */
  function offerMailDraft(mail) {
    var slot = document.querySelector('#success-modal .sc__fallback');
    if (!slot) return;
    slot.innerHTML = '<a href="' + BCE.enquiryMailtoUrl(mail) + '">Also send a copy from your email app</a>';
    slot.hidden = false;
  }

  /* ---- Wire up ---------------------------------------------------------- */

  BCE.initForms = function () {
    document.querySelectorAll('form[data-enquiry-form]').forEach(function (form) {
      var fields = form.querySelectorAll('[name]');

      fields.forEach(function (input) {
        syncFilled(input);
        input.addEventListener('blur', function () { validateField(input); });
        ['input', 'change'].forEach(function (evt) {
          input.addEventListener(evt, function () {
            syncFilled(input);
            /* Only re-validate a field already showing an error, so typing a
               fresh entry is not interrupted mid-keystroke. */
            if (input.getAttribute('aria-invalid') === 'true') validateField(input);
          });
        });
      });

      /* Deep links carry intent: contact.html?service=aircon&type=Residential.
         Combo-backed fields need their widget told, not just the hidden input. */
      var params = new URLSearchParams(window.location.search);
      ['service', 'type'].forEach(function (key) {
        var val = params.get(key);
        if (!val) return;
        var target = form.querySelector('[name="' + (key === 'type' ? 'buildingType' : 'service') + '"]');
        if (!target) return;
        var combo = target.closest('.combo');
        if (combo && combo.__combo) { combo.__combo.setValue(val); }
        else { target.value = val; syncFilled(target); }
      });

      initVoice(form);
      initGeolocate(form);

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var firstBad = null;
        fields.forEach(function (input) {
          if (!validateField(input) && !firstBad) firstBad = input;
        });

        if (firstBad) {
          firstBad.focus();
          firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        var record = { submittedAt: new Date().toISOString() };
        fields.forEach(function (input) { record[input.name] = input.value.trim(); });

        store(record);

        /* Email the office. The confirmation is shown either way - the entry is
           already captured locally, so a relay outage must not look like a
           failed submission to the visitor. */
        var note = form.querySelector('[data-storage-note]');
        if (note) note.textContent = 'Sending your request...';

        BCE.sendEnquiry(record).then(function (res) {
          var ref = res.mail.ref;
          if (note) {
            note.textContent = res.ok
              ? 'Sent to ' + BCE.mail.to + ' · Reference ' + ref
              : 'Saved on this device · Reference ' + ref;
          }
          showReference(ref);
          if (!res.ok) offerMailDraft(res.mail);
        });

        form.reset();
        form.querySelectorAll('[data-combo]').forEach(function (c) {
          if (c.__combo) c.__combo.clear();
        });
        fields.forEach(function (input) { clearError(input); syncFilled(input); });
        openModal('success-modal');
      });
    });
  };
})(window.BCE);
