/* ==========================================================================
   BCE — Enquiry email

   Builds the notification sent to the office when the form is submitted, and
   delivers it through whichever transport is configured in BCE.mail.

   WHY A PROVIDER IS NEEDED
   A browser cannot send email. There is no SMTP in client JavaScript, so a
   static site must hand the payload to something that can: a relay service or
   your own backend. Three options are wired up below; pick one in site.js.

     provider: 'web3forms'  accessKey: '<key>'   - free relay, no backend
     provider: 'formspree'  endpoint: '<url>'    - free tier, no backend
     provider: 'custom'     endpoint: '<url>'    - your own API / serverless fn

   With none configured the submission still succeeds and is stored locally,
   and the visitor is offered a prefilled draft in their own mail app so the
   details are not lost. That fallback needs no setup but relies on the person
   pressing Send, so it is a stopgap, not a delivery guarantee.
   ========================================================================== */

(function (BCE) {
  'use strict';

  function titleCaseService(slug) {
    for (var i = 0; i < BCE.services.length; i++) {
      if (BCE.services[i].slug === slug) return BCE.services[i].title;
    }
    return slug === 'other' ? 'Other / Not sure' : slug;
  }

  function prettyServices(raw) {
    return String(raw || '')
      .split(',')
      .map(function (s) { return titleCaseService(s.trim()); })
      .filter(Boolean)
      .join(', ');
  }

  /* BCE-2610-4821 : short, sortable by month, unique enough to quote on a call. */
  function reference(date) {
    var yy = String(date.getFullYear()).slice(2);
    var mm = ('0' + (date.getMonth() + 1)).slice(-2);
    var rand = String(Math.floor(1000 + Math.random() * 9000));
    return 'BCE-' + yy + mm + '-' + rand;
  }

  function stamp(date) {
    try {
      return date.toLocaleString('en-SG', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Singapore'
      }) + ' (SGT)';
    } catch (e) {
      return date.toISOString();
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Rows grouped the way the office reads them, not the order of the form. */
  var GROUPS = [
    { title: 'Contact',       names: ['fullName', 'contactNumber', 'email'] },
    { title: 'Site details',  names: ['address', 'postalCode', 'country', 'buildingType'] },
    { title: 'Request',       names: ['service', 'message'] }
  ];

  function labelFor(name) {
    var fields = BCE.enquiryFields || [];
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].name === name) return fields[i].label;
    }
    return name;
  }

  function valueFor(name, record) {
    if (name === 'service') return prettyServices(record.service);
    return record[name] || '—';
  }

  BCE.buildEnquiryEmail = function (record) {
    var now  = new Date();
    var ref  = reference(now);
    var who  = record.fullName || 'Website visitor';
    var svc  = prettyServices(record.service) || 'General enquiry';

    var subject = 'New Service Request — ' + svc + ' — ' + who + ' [' + ref + ']';

    /* ---- plain text ---------------------------------------------------- */
    var pad = 0;
    GROUPS.forEach(function (g) {
      g.names.forEach(function (n) { pad = Math.max(pad, labelFor(n).length); });
    });

    var lines = [
      'NEW SERVICE REQUEST',
      'Reference : ' + ref,
      'Received  : ' + stamp(now),
      ''
    ];

    GROUPS.forEach(function (g) {
      lines.push(g.title.toUpperCase());
      lines.push(new Array(g.title.length + 1).join('-'));
      g.names.forEach(function (n) {
        var label = labelFor(n);
        lines.push(label + new Array(pad - label.length + 1).join(' ') + ' : ' + valueFor(n, record));
      });
      lines.push('');
    });

    lines.push('Submitted from : ' + (window.location ? window.location.href : 'n/a'));
    lines.push('Reply to       : ' + (record.email || 'not supplied'));

    var text = lines.join('\n');

    /* ---- html ----------------------------------------------------------- */
    var rows = GROUPS.map(function (g) {
      var head = '<tr><td colspan="2" style="padding:18px 0 6px;font:600 12px/1.4 Arial,sans-serif;' +
                 'letter-spacing:.08em;text-transform:uppercase;color:#737171;">' +
                 esc(g.title) + '</td></tr>';
      var body = g.names.map(function (n) {
        return '<tr>' +
                 '<td style="padding:7px 16px 7px 0;font:400 13px/1.5 Arial,sans-serif;color:#737171;' +
                     'white-space:nowrap;vertical-align:top;">' + esc(labelFor(n)) + '</td>' +
                 '<td style="padding:7px 0;font:500 14px/1.5 Arial,sans-serif;color:#1c1c1e;">' +
                     esc(valueFor(n, record)) + '</td>' +
               '</tr>';
      }).join('');
      return head + body;
    }).join('');

    var html =
      '<div style="background:#f4f7fb;padding:24px;font-family:Arial,sans-serif;">' +
        '<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #ebeff5;border-radius:12px;overflow:hidden;">' +
          '<div style="background:#0046a9;padding:20px 24px;">' +
            '<div style="font:600 18px/1.3 Arial,sans-serif;color:#ffffff;">New Service Request</div>' +
            '<div style="font:400 13px/1.5 Arial,sans-serif;color:rgba(255,255,255,.82);margin-top:4px;">' +
              'Bala Construction &amp; Engineering Pte Ltd' +
            '</div>' +
          '</div>' +
          '<div style="padding:8px 24px 24px;">' +
            '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">' +
              '<tr>' +
                '<td style="padding:16px 16px 16px 0;font:400 13px/1.5 Arial,sans-serif;color:#737171;">Reference</td>' +
                '<td style="padding:16px 0;font:600 14px/1.5 Arial,sans-serif;color:#0046a9;">' + esc(ref) + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding:0 16px 8px 0;font:400 13px/1.5 Arial,sans-serif;color:#737171;">Received</td>' +
                '<td style="padding:0 0 8px;font:400 14px/1.5 Arial,sans-serif;color:#1c1c1e;">' + esc(stamp(now)) + '</td>' +
              '</tr>' +
              rows +
            '</table>' +
            (record.email
              ? '<a href="mailto:' + esc(record.email) + '?subject=' + encodeURIComponent('Re: ' + subject) + '" ' +
                   'style="display:inline-block;margin-top:20px;padding:11px 20px;background:#0046a9;color:#ffffff;' +
                   'font:600 14px Arial,sans-serif;text-decoration:none;border-radius:8px;">Reply to ' + esc(who) + '</a>'
              : '') +
          '</div>' +
          '<div style="padding:14px 24px;border-top:1px solid #ebeff5;font:400 12px/1.5 Arial,sans-serif;color:#737171;">' +
            'Sent from the BCE website enquiry form.' +
          '</div>' +
        '</div>' +
      '</div>';

    return { ref: ref, subject: subject, text: text, html: html };
  };

  /* Opens the visitor's own mail client with everything prefilled. */
  BCE.enquiryMailtoUrl = function (mail) {
    var cfg = BCE.mail || {};
    return 'mailto:' + (cfg.to || '') +
           '?subject=' + encodeURIComponent(mail.subject) +
           '&body=' + encodeURIComponent(mail.text);
  };

  BCE.sendEnquiry = function (record) {
    var cfg  = BCE.mail || {};
    var mail = BCE.buildEnquiryEmail(record);

    if (!cfg.provider) {
      return Promise.resolve({ ok: false, via: 'none', mail: mail });
    }

    var url, payload;

    if (cfg.provider === 'web3forms') {
      url = 'https://api.web3forms.com/submit';
      payload = {
        access_key: cfg.accessKey,
        subject: mail.subject,
        from_name: record.fullName || 'BCE website',
        replyto: record.email || '',
        message: mail.text
      };
    } else {
      url = cfg.endpoint;
      payload = {
        _subject: mail.subject,
        _replyto: record.email || '',
        reference: mail.ref,
        message: mail.text,
        html: mail.html,
        fields: record
      };
    }

    if (!url) return Promise.resolve({ ok: false, via: 'misconfigured', mail: mail });

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return { ok: r.ok, via: cfg.provider, mail: mail }; })
      .catch(function () { return { ok: false, via: cfg.provider, mail: mail }; });
  };
})(window.BCE);
