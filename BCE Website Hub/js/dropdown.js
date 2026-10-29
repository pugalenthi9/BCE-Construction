/* ==========================================================================
   BCE — Combobox (single select + multi select with chips)

   A native <select> cannot carry chips, a filtered list, or the detached
   panel styling the design calls for, so this rebuilds the control from an
   input + listbox and writes the result into a hidden field. The hidden field
   keeps the same name, so the rest of the form reads it like any other input.

   Multi-select chips land in a warm yellow "received" state and settle to
   green after a few seconds, so picking a service reads as acknowledged.
   ========================================================================== */

(function (BCE) {
  'use strict';

  var CONFIRM_DELAY = 5000;   // ms before a new chip settles from amber to green

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Line icons, one per option, drawn on a 24px grid with a 1.6 stroke so they
     stay legible at 18px. Purely decorative: the option label carries the
     meaning, so they are aria-hidden and never the only cue. */
  var ICONS = {
    /* Building types */
    'Residential':      'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5',
    'Multistory':       'M3 21h18M5 21V4h8v17M13 21V10h6v11M7.5 7.5h3M7.5 11h3M7.5 14.5h3M15.5 13.5h1M15.5 17h1',
    'Commercial Space': 'M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9ZM3 9l1.6-5h14.8L21 9M9.5 21v-6h5v6',
    'Industrial':       'M3 21V11l5.5 3.2V11L14 14.2V11l5.5 3.2V21ZM3 21h18M6.5 17.5h1.5M11 17.5h1.5M15.5 17.5H17',
    'Institutional':    'M3 10h18L12 4 3 10ZM5.5 10v8M9.5 10v8M14.5 10v8M18.5 10v8M3 21h18',
    'Entertainment':    'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3.5a2.5 2.5 0 0 0 0-5ZM10 6.5v11',

    /* Services */
    'aircon':        'M12 2.5v19M4.4 7l15.2 8.8M19.6 7 4.4 15.8M12 6.2 9.6 3.8M12 6.2l2.4-2.4M12 17.8l-2.4 2.4M12 17.8l2.4 2.4',
    'demolition':    'M14.5 2.5 21 9l-2.6 2.6-6.5-6.5ZM11.3 7.7 3.5 15.5a2.2 2.2 0 0 0 3.1 3.1l7.8-7.8M4.5 20.5h6',
    'electrical':    'M13.2 2.5 4.5 13.8h6l-1 7.7 8.7-11.3h-6Z',
    'painting':      'M16.5 3 21 7.5l-8.6 8.6H8.4v-4L16.5 3ZM7.5 16.5 4 21l4.5-3.5M4 7h5M6.5 4.5v5',
    'renovation':    'M20.3 4.6a4.2 4.2 0 0 1-5.6 5.6L6.4 18.5a2 2 0 1 1-2.9-2.9l8.3-8.3a4.2 4.2 0 0 1 5.6-5.6l-2.8 2.8 2.9 2.9 2.8-2.8Z',
    'waterproofing': 'M12 3.2s6 6.4 6 10.3a6 6 0 1 1-12 0C6 9.6 12 3.2 12 3.2Z',

    /* Shared fallback for the "Other" entries */
    '_other': 'M5 12h.01M12 12h.01M19 12h.01'
  };

  function iconFor(value) {
    var d = ICONS[value] || ICONS._other;
    var round = value === 'Other' || value === 'other' ? ' stroke-width="2.6"' : ' stroke-width="1.6"';
    return '<svg class="combo__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
           round + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
             '<path d="' + d + '"/>' +
           '</svg>';
  }

  /* Option sources, resolved lazily so site.js can change without touching this. */
  BCE.comboOptions = {
    building: function () {
      return BCE.buildingTypes.map(function (t) {
        return { value: t.title, label: t.title };
      }).concat([{ value: 'Other', label: 'Other' }]);
    },
    service: function () {
      return BCE.services.map(function (s) {
        return { value: s.slug, label: s.title };
      }).concat([{ value: 'other', label: 'Other / Not sure' }]);
    }
  };

  function Combo(root) {
    this.root    = root;
    this.multi   = root.getAttribute('data-multi') === 'true';
    this.control = root.querySelector('.combo__control');
    this.chips   = root.querySelector('.combo__chips');
    this.input   = root.querySelector('.combo__input');
    this.panel   = root.querySelector('.combo__panel');
    this.hidden  = root.querySelector('input[type="hidden"]');

    var src = BCE.comboOptions[root.getAttribute('data-options')];
    this.options  = src ? src() : [];
    this.selected = [];
    this.active   = -1;
    this.timers   = {};
    this.basePlaceholder = this.input.getAttribute('placeholder') || '';

    this.bind();
    this.renderPanel();
  }

  Combo.prototype.bind = function () {
    var self = this;

    this.control.addEventListener('mousedown', function (e) {
      if (e.target.closest('.combo__chip-remove')) return;
      e.preventDefault();

      /* The chevron toggles; anywhere else in the control just opens. */
      if (e.target.closest('.field__chevron')) {
        if (self.isOpen()) { self.close(); } else { self.input.focus(); self.open(); }
        return;
      }

      self.input.focus();
      self.open();
    });

    this.input.addEventListener('input', function () {
      self.open();
      self.renderPanel();
    });

    this.input.addEventListener('keydown', function (e) { self.onKey(e); });

    this.input.addEventListener('blur', function () {
      /* Delay so a click on an option is processed before the panel closes. */
      window.setTimeout(function () {
        if (!self.root.contains(document.activeElement)) self.close();
      }, 120);
    });

    this.panel.addEventListener('mousedown', function (e) {
      var li = e.target.closest('[data-value]');
      if (!li) return;
      e.preventDefault();
      self.toggle(li.getAttribute('data-value'));
    });

    this.chips.addEventListener('click', function (e) {
      var btn = e.target.closest('.combo__chip-remove');
      if (!btn) return;
      e.stopPropagation();
      self.remove(btn.getAttribute('data-value'));
    });

    document.addEventListener('click', function (e) {
      if (!self.root.contains(e.target)) self.close();
    });
  };

  Combo.prototype.onKey = function (e) {
    var visible = this.visibleOptions();

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.open();
      var step = e.key === 'ArrowDown' ? 1 : -1;
      this.active = (this.active + step + visible.length) % Math.max(visible.length, 1);
      this.renderPanel();
      return;
    }
    if (e.key === 'Enter') {
      if (this.isOpen() && visible[this.active]) {
        e.preventDefault();
        this.toggle(visible[this.active].value);
      }
      return;
    }
    if (e.key === 'Escape') { this.close(); return; }
    if (e.key === 'Backspace' && !this.input.value && this.multi && this.selected.length) {
      this.remove(this.selected[this.selected.length - 1]);
    }
  };

  Combo.prototype.isOpen = function () { return !this.panel.hidden; };

  Combo.prototype.open = function () {
    if (this.isOpen()) return;
    this.panel.hidden = false;
    this.root.classList.add('is-open');
    this.input.setAttribute('aria-expanded', 'true');
    this.renderPanel();
  };

  Combo.prototype.close = function () {
    if (!this.isOpen()) return;
    this.panel.hidden = true;
    this.root.classList.remove('is-open');
    this.input.setAttribute('aria-expanded', 'false');
    this.active = -1;
    if (!this.multi) this.input.value = this.labelFor(this.selected[0]) || '';
  };

  Combo.prototype.labelFor = function (value) {
    for (var i = 0; i < this.options.length; i++) {
      if (this.options[i].value === value) return this.options[i].label;
    }
    return '';
  };

  Combo.prototype.visibleOptions = function () {
    var q = (this.input.value || '').trim().toLowerCase();
    /* A single select showing its own chosen label should still list everything. */
    if (!this.multi && q && q === (this.labelFor(this.selected[0]) || '').toLowerCase()) q = '';
    if (!q) return this.options;
    return this.options.filter(function (o) {
      return o.label.toLowerCase().indexOf(q) > -1;
    });
  };

  Combo.prototype.renderPanel = function () {
    var self = this;
    var visible = this.visibleOptions();

    if (!visible.length) {
      this.panel.innerHTML = '<li class="combo__empty">No match</li>';
      return;
    }

    this.panel.innerHTML = visible.map(function (o, i) {
      var on = self.selected.indexOf(o.value) > -1;
      return '<li class="combo__option' + (on ? ' is-selected' : '') +
                  (i === self.active ? ' is-active' : '') + '"' +
                ' role="option" aria-selected="' + on + '" data-value="' + esc(o.value) + '">' +
               '<span class="combo__option-main">' +
                 iconFor(o.value) + '<span>' + esc(o.label) + '</span>' +
               '</span>' +
               (on ? '<svg class="combo__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
                       '<path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.8" ' +
                             'stroke-linecap="round" stroke-linejoin="round"/></svg>'
                   : '') +
             '</li>';
    }).join('');
  };

  Combo.prototype.toggle = function (value) {
    var at = this.selected.indexOf(value);

    if (this.multi) {
      if (at > -1) { this.remove(value); return; }
      this.selected.push(value);
      this.input.value = '';
      this.sync();
      this.renderChips(value);
      this.renderPanel();
      this.input.focus();
      return;
    }

    this.selected = [value];
    this.input.value = this.labelFor(value);
    this.sync();
    this.close();
  };

  Combo.prototype.remove = function (value) {
    var at = this.selected.indexOf(value);
    if (at > -1) this.selected.splice(at, 1);
    window.clearTimeout(this.timers[value]);
    this.sync();
    this.renderChips();
    this.renderPanel();
  };

  /* `justAdded` gets the amber-to-green treatment; existing chips stay settled. */
  Combo.prototype.renderChips = function (justAdded) {
    var self = this;
    if (!this.multi) return;

    var settled = {};
    this.chips.querySelectorAll('.combo__chip').forEach(function (c) {
      if (c.classList.contains('is-confirmed')) settled[c.getAttribute('data-chip')] = true;
    });

    this.chips.innerHTML = this.selected.map(function (v) {
      var done = settled[v] && v !== justAdded;
      return '<span class="combo__chip' + (done ? ' is-confirmed' : '') + '" data-chip="' + esc(v) + '">' +
               iconFor(v) +
               '<span>' + esc(self.labelFor(v)) + '</span>' +
               '<button class="combo__chip-remove" type="button" data-value="' + esc(v) + '"' +
                       ' aria-label="Remove ' + esc(self.labelFor(v)) + '">&times;</button>' +
             '</span>';
    }).join('');

    this.input.setAttribute('placeholder', this.selected.length ? 'Add more' : this.basePlaceholder);

    if (justAdded) {
      this.timers[justAdded] = window.setTimeout(function () {
        var chip = self.chips.querySelector('[data-chip="' + CSS.escape(justAdded) + '"]');
        if (chip) chip.classList.add('is-confirmed');
      }, CONFIRM_DELAY);
    }
  };

  /* Mirror the selection into the hidden input and fire `change` so the form's
     validation and filled-state logic react exactly as they do for a <select>. */
  Combo.prototype.sync = function () {
    this.hidden.value = this.selected.join(', ');
    var field = this.root.closest('.field');
    if (field) field.classList.toggle('is-filled', this.selected.length > 0);
    this.hidden.dispatchEvent(new Event('change', { bubbles: true }));
  };

  /* Used by deep links such as contact.html?service=aircon */
  Combo.prototype.setValue = function (raw) {
    var self = this;
    var wanted = String(raw).split(',').map(function (v) { return v.trim(); }).filter(Boolean);

    this.selected = wanted.filter(function (v) { return self.labelFor(v) !== ''; });
    if (!this.multi) {
      this.selected = this.selected.slice(0, 1);
      this.input.value = this.labelFor(this.selected[0]) || '';
    } else {
      this.renderChips();
      this.selected.forEach(function (v) {
        var chip = self.chips.querySelector('[data-chip="' + CSS.escape(v) + '"]');
        if (chip) chip.classList.add('is-confirmed');
      });
    }
    this.sync();
  };

  Combo.prototype.clear = function () {
    this.selected = [];
    this.input.value = '';
    if (this.multi) this.renderChips();
    this.sync();
  };

  BCE.initCombos = function (scope) {
    (scope || document).querySelectorAll('[data-combo]').forEach(function (root) {
      if (root.__combo) return;
      root.__combo = new Combo(root);
    });
  };
})(window.BCE);
