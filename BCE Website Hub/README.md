# BCE Website — v1 Frontend

Static marketing site for **Bala Construction & Engineering Pte Ltd**, built from
the Figma file *BCE Website Design and Development*.

No build step, no framework, no dependencies. Open `index.html` in a browser, or
serve the folder. Everything is plain HTML, CSS and ES5-compatible JavaScript.

---

## Running it

```powershell
# Windows, no toolchain required
powershell -ExecutionPolicy Bypass -File .\serve.ps1          # http://localhost:8080
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8081
```

Any static server works (`python -m http.server`, nginx, S3, Netlify, Vercel).
The only requirement is that it is served over **http/https**, not `file://` —
geolocation and the mail relay are blocked on file origins.

---

## Pages

| File | Route | Notes |
|---|---|---|
| `index.html` | `/` | Home |
| `about.html` | `/about.html` | About |
| `contact.html` | `/contact.html` | Contact + enquiry form |
| `service.html` | `/service.html?s=<slug>` | One template, six services |

Service slugs: `aircon`, `demolition`, `electrical`, `painting`, `renovation`,
`waterproofing`.

`BCE-Website-Preview.html` is a generated single-file build of all four pages
(everything inlined) for sharing by email. It is **output, not source** — never
edit it by hand.

---

## Folder layout

```
css/
  tokens.css        design tokens — colours, type scale, spacing, motion
  base.css          reset, layout primitives, scroll-reveal, grid-line utility
  components.css    buttons, nav, cards, forms, combobox, modals, footer
  sections.css      page sections (hero, process, about, contact, service page)
  responsive.css    all breakpoints, in one place
js/
  data/site.js      ALL CONTENT + the mail config      <-- start here
  components.js     shared shell: nav, footer, CTA banner, modals
  renderers.js      data -> markup for every repeated block
  dropdown.js       custom single/multi select
  mailer.js         email template + delivery
  forms.js          validation, storage, modals, geolocation
  service-page.js   fills the service template from ?s=
  main.js           boot + interactions (nav, reveal, slider, counters)
images/             all assets, grouped by area
```

### The one rule

**Content lives in `js/data/site.js`.** Company details, navigation, the six
services (with their copy, process steps and images), building types,
testimonials and values are all there. Adding a seventh service means appending
one object — it then appears in the nav mega-menu, the home grid, the footer,
search, and gets its own page automatically.

---

## For the backend integration

Everything that needs a server is isolated. There are three touch points.

### 1. Form submissions — `js/mailer.js`

The enquiry form currently posts to a relay (Web3Forms) configured in
`js/data/site.js`:

```js
BCE.mail = {
  to:        'balaceplsg@gmail.com',
  provider:  'web3forms',        // 'web3forms' | 'formspree' | 'custom'
  accessKey: '...',
  endpoint:  ''
};
```

**To point it at your own API**, set:

```js
BCE.mail = { to: '...', provider: 'custom', accessKey: '', endpoint: 'https://api.example.com/enquiry' };
```

Your endpoint then receives a JSON `POST`:

```json
{
  "_subject":  "New Service Request — Aircon — Aravind T [BCE-2610-4821]",
  "_replyto":  "customer@example.com",
  "reference": "BCE-2610-4821",
  "message":   "...plain-text version...",
  "html":      "...HTML version...",
  "fields": {
    "fullName": "", "contactNumber": "", "email": "",
    "address": "", "postalCode": "", "country": "Singapore",
    "buildingType": "", "service": "aircon, electrical",
    "message": "", "submittedAt": "2026-10-08T12:00:00.000Z"
  }
}
```

`service` is a comma-separated list of slugs (multi-select). Everything else is
a plain string. `BCE.sendEnquiry()` resolves `{ ok, via, mail }` — it never
rejects, and the UI shows the confirmation either way so a relay outage does not
look like a failed submission to the visitor.

### 2. Local submission log — `js/forms.js`

Every submission is also written to `localStorage` under `BCE_SUBMISSIONS`
(`BCE.getSubmissions()`). This is a safety net for the static build. **Remove
the `store()` call once a real backend is in place** — it keeps customer data in
the visitor's browser, which you probably do not want in production.

### 3. Reverse geocoding — `js/forms.js`

The address field's location button calls OpenStreetMap Nominatim. It is keyless
and fine for a preview, but its usage policy is not meant for production
traffic. Swap the single `fetch` URL in `reverseGeocode()` for OneMap
(Singapore) or Google with a key.

---

## Things deliberately left for the owner

- **Testimonials are placeholder.** Names and quotes in `BCE.testimonials` were
  written to fill the layout. They must be replaced with real feedback before
  launch — publishing invented reviews is both misleading and a legal risk.
- **Service copy** beyond Aircon was drafted to match the design's structure;
  only Aircon had real text in Figma. Review before launch.
- **Terms of Use / Privacy Policy** link to `#` — no pages exist yet.
- **Images are unoptimised** (~14 MB total). Run them through an image pipeline
  or a CDN with automatic resizing before going live.
- **The relay access key is public** by design (it sits in client JS). Enable
  hCaptcha in the Web3Forms dashboard, or move to the `custom` provider, before
  the form is exposed to real traffic.

---

## Conventions worth knowing

- **Tokens over literals.** Colours, spacing, type and motion all come from
  `css/tokens.css`. Avoid hard-coding hex or px in component CSS.
- **BEM-ish class names** — `.block__element--modifier`.
- **Shared shell is injected**, not duplicated: `components.js` renders the nav,
  footer, CTA banner and both modals into `data-component="..."` mount points,
  so those exist in exactly one place.
- **`data-render="..."`** marks a mount point filled by `renderers.js`.
- **`data-reveal`** on any element gives it the scroll-in animation
  (`left` / `right` / `scale` variants, `--reveal-delay` for stagger).
- **`has-grid`** on any section draws the design's background rules.
- All motion respects `prefers-reduced-motion`.
- Breakpoints: **1280** (desktop) / **1024** (laptop) / **768** (tablet) /
  below (mobile), with page gutters stepping 104 → 64 → 40 → 20px.
