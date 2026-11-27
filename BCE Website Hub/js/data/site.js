/* ==========================================================================
   BCE - Single source of truth for site content.
   Everything that appears in more than one place lives here: company details,
   navigation, and the six services. Editing a service here updates the nav
   mega-menu, the home grid, the search index and the service page at once.

   Kept ASCII-only on purpose so the file survives any editor or tooling
   encoding; typographic characters belong in the HTML as entities.
   ========================================================================== */

window.BCE = window.BCE || {};

BCE.company = {
  name:      'Bala Construction & Engineering Pte Ltd',
  shortName: 'BCE',
  phone:     '+65 98945223',
  phoneHref: 'tel:+6598945223',
  email:     'balaceplsg@gmail.com',
  emailHref: 'mailto:balaceplsg@gmail.com',
  region:    'Singapore',
  address:   '7 Temasek Boulevard #12-07 Suntec Tower One, Singapore - 038987',
  regNo:     'UEN NO: 202413369H',   /* shown in the footer only, under the company name */
  uen:       '202413369H',
  tagline:   'Quality - Innovation - Team Work - Passion',
  /* Shown on the contact page's location card (Figma 637:1556). Taken from
     the design - confirm with the office before launch. */
  hours:     'MON - SAT 9:00 AM - 7:00 PM',
  /* The live map on the contact page (initGoogleMap): the place it searches
     and the office's position, so it can frame the pin beside the card. */
  mapsQuery: 'Suntec Tower One, 7 Temasek Boulevard, Singapore 038987',
  geo:       { lat: 1.29532, lng: 103.85855 },
  /* Footer blurb - kept short; no year count by owner request. */
  blurb:     'Proven experience delivering residential, commercial and industrial ' +
             'projects across Singapore.'
};

/* --------------------------------------------------------------------------
   WhatsApp chat - the floating button (Figma 626:2979), on every page.

   Tapping it opens a chat with BCE (wa.me) with `message` already typed in
   the visitor's box; %s becomes "your services", or "<service> services" on
   a service page. `number` is the company mobile: country code + number,
   digits only, as wa.me requires.

   BCE's welcome reply cannot come from the website - only the account owner
   can send it. Set it once in the WhatsApp Business app on this number:
   Settings > Business tools > Greeting message > on, recipients "Everyone".
   WhatsApp then sends it by itself after a customer's first message, and
   again after 14 days without contact. Suggested greeting:

     Hello, and thank you for contacting Bala Construction & Engineering
     (BCE).

     We are a bizSAFE-certified building services company in Singapore,
     handling aircon, electrical, painting, renovation, waterproofing and
     demolition works for homes and businesses.

     To help us prepare an accurate quotation, please share:
     1. Your name
     2. The service you need
     3. Your property type and area (e.g. 4-room HDB, Tampines)
     4. A few photos of the work area, if you have them

     Our team replies during working hours, Mon - Sat, 9am - 7pm. For
     anything urgent, call us on +65 9894 5223.

   And for Business tools > Away message (outside those hours):

     Thank you for your message. Our office is closed right now (Mon - Sat,
     9am - 7pm). Your enquiry has reached us, and our team will reply as
     soon as we are back.
   -------------------------------------------------------------------------- */
BCE.whatsapp = {
  number:  '6598945223',
  message: 'Hello BCE, I\'d like to enquire about %s.'
};

/* --------------------------------------------------------------------------
   Where enquiry notifications go.

   A browser cannot send email by itself, so delivery needs a relay or a
   backend. Set ONE of these and submissions are emailed automatically:

     provider: 'web3forms', accessKey: '<your key>'   // web3forms.com, free, no backend
     provider: 'formspree', endpoint: 'https://formspree.io/f/<id>'
     provider: 'custom',    endpoint: 'https://your-api/enquiry'

   Left blank, the form still validates, stores the entry locally and shows the
   confirmation - and offers the visitor a prefilled draft in their mail app so
   nothing is lost. See js/mailer.js.
   -------------------------------------------------------------------------- */
BCE.mail = {
  to:        'balaceplsg@gmail.com',
  provider:  'web3forms',
  accessKey: '8c08dd96-4403-478c-89ba-d133e1bb8a60',
  endpoint:  ''
};

BCE.nav = [
  { label: 'Home',       href: 'index.html' },
  { label: 'Services',   href: 'index.html#services', children: true },
  { label: 'About Us',   href: 'about.html' },
  { label: 'Contact Us', href: 'contact.html' }
];

/* Order matches the Figma home grid (row 1: aircon, demolition, electrical).
   A service may add `thumb` to point the mega-menu at a smaller image; when
   absent the card image is reused. */
BCE.services = [
  {
    slug: 'aircon',
    title: 'Aircon',
    image: 'images/services/aircon.webp',
    heroImage: 'images/misc/service-hero.webp',
    menuDesc: 'Servicing, installation and repairs for home and office units.',
    heroTitle: 'Aircon - Services & Solutions',
    heroLead: "In Singapore\u2019s hot and humid climate, regular servicing is essential to maintain " +
              'cooling performance, prevent sudden breakdowns, and extend the lifespan of your unit.',

    /* Sub-service list (Figma 606:2048). Copy from "BCE service page copy.pdf":
       each service appears once, so the counts differ per trade. The [words]
       in listTitle are the two-line title's quiet lead-in (.title-lead). */
    listTitle: '[We Handle] All Your Aircon Work',
    listLead:  'From a single wall unit to a building-wide ACMV system, we install it properly and keep it running.',
    homes: [
      ['Aircon Installation',      'Split and multi-split units fitted and tested, or old ones replaced or removed.'],
      ['General Servicing',        'Filters, coils, drains and the outdoor unit cleaned, one-off or on a yearly plan.'],
      ['Chemical Wash & Overhaul', 'A deep chemical clean, done in place or with the unit fully dismantled.'],
      ['Aircon Repair',            "Fixes for units that won\u2019t cool, leak water, make noise or show error codes."],
      ['Gas Top-Up & Leak Check',  'Refrigerant leaks found and sealed, then gas topped up to the correct level.']
    ],
    commercial: [
      ['ACMV Installation',     'Ducted and central systems with mechanical ventilation, installed and commissioned.'],
      ['VRF System Servicing',  'Servicing and repair for VRF systems that cool many rooms from one outdoor unit.'],
      ['AHU & FCU Maintenance', 'Filter changes, coil cleaning and checks for air handling and fan coil units.'],
      ['Maintenance Contracts', 'Monthly or quarterly servicing for whole buildings, with a record of every visit.']
    ],

    /* Recent work (Figma 599:1511) - SAMPLE, see BCE.worksAreSamples below. */
    work: {
      tag: 'Residential', date: 'Nov, 2026', place: 'HDB Flat, Woodlands',
      title: 'Aircon Chemical Wash', desc: 'System 3 fan coils chemical-washed, drain pipes flushed',
      image: 'images/works/aircon.webp',
      /* Figma 599:1511 draws this photo 1.394x a cover fit, from its top-left. */
      zoom: 1.394,
      alt: 'Two BCE technicians servicing an outdoor aircon unit on an HDB service ledge'
    }
  },
  {
    slug: 'demolition',
    title: 'Demolition',
    image: 'images/services/demolition.webp',
    heroImage: 'images/services/demolition.webp',
    menuDesc: 'Controlled strip-out and structural demolition with full disposal.',
    heroTitle: 'Demolition - Services & Solutions',
    heroLead: 'Safe, controlled demolition carried out to Singapore site standards, with hoarding, ' +
              'dust control and certified debris disposal handled end to end.',

    listTitle: '[We Handle] All Your Demolition Work',
    listLead:  'From hacking a single wall to stripping out a whole unit, we protect what stays and clear what goes.',
    homes: [
      ['Wall Hacking',          'Non-structural walls removed, with HDB approval obtained where required.'],
      ['Floor & Tile Hacking',  'Old tiles, screed and floor finishes broken out, including kitchens and toilets.'],
      ['Carpentry Dismantling', 'Built-in wardrobes, cabinets and feature walls taken down and removed.'],
      ['False Ceiling Removal', 'Plasterboard ceilings and cove lighting taken down, with wiring made safe.'],
      ['Haulage & Disposal',    'Debris and old fittings carted away and disposed of at licensed sites.']
    ],
    commercial: [
      ['Interior Strip-Out',    'A whole unit cleared of workstations, carpets, ceilings and partitions.'],
      ['Reinstatement Works',   'Leased units restored to original or bare-shell condition and made good for handover.'],
      ['Structural Demolition', 'Slabs, beams and walls removed under a BCA permit and QP supervision.']
    ],

    work: {
      tag: 'Commercial', date: 'Oct, 2026', place: 'Office Unit, Jurong East',
      title: 'Interior Strip-Out', desc: 'Partition walls hacked out ahead of the new fit-out',
      image: 'images/services/demolition.webp',
      alt: 'A worker in ear defenders hacking out a brick partition wall'
    }
  },
  {
    slug: 'electrical',
    title: 'Electrical',
    image: 'images/services/electrical.webp',
    heroImage: 'images/services/electrical.webp',
    menuDesc: 'Licensed wiring, DB upgrades, lighting and fault finding.',
    heroTitle: 'Electrical - Services & Solutions',
    heroLead: 'Licensed electrical work for homes, offices and industrial units, from new circuits ' +
              'and distribution boards to fault finding and lighting upgrades.',

    listTitle: '[We Handle] All Your Electrical Work',
    listLead:  'From a new power point to a full rewire or switchboard upgrade, every circuit we install is tested before handover.',
    homes: [
      ['Wiring & Rewiring',        'Full or partial rewiring to replace old, damaged or overloaded wiring.'],
      ['DB Box & RCCB Upgrade',    'A new distribution board with modern breakers and RCCB protection.'],
      ['Power & Appliance Points', 'New sockets and points for aircon, water heater, oven and hob.'],
      ['Lighting Installation',    'Ceiling lights, fans, cove and feature lighting fitted and wired.'],
      ['Fault Finding & Repair',   'Tripping, short circuits and power loss traced to the cause and fixed.']
    ],
    commercial: [
      ['Electrical Installation', 'New circuits, cable trays and trunking for office, retail and factory fit-outs.'],
      ['Power Supply Upgrade',    'Approved-load increases and three-phase supply, with switchboard upgrades to match.'],
      ['Emergency Lighting',      'Emergency and exit lights installed and tested to keep premises compliant.'],
      ['Testing & Turn-On',       'LEW testing, Certificate of Compliance and SP inspection to get power on.'],
      ['Preventive Maintenance',  'Scheduled checks of switchboards and DBs to catch faults before they trip.']
    ],

    work: {
      tag: 'Commercial', date: 'Oct, 2026', place: 'Cafe, Tiong Bahru',
      title: 'DB Board Upgrade', desc: 'A tripping DB rewired after closing and every circuit labelled',
      image: 'images/services/electrical.webp',
      alt: 'An electrician wiring a distribution board'
    }
  },
  {
    slug: 'painting',
    title: 'Painting',
    image: 'images/services/painting.webp',
    heroImage: 'images/services/painting.webp',
    menuDesc: 'Interior and exterior painting with proper surface prep.',
    heroTitle: 'Painting - Services & Solutions',
    heroLead: 'Interior and exterior painting done the way it lasts: proper preparation, quality ' +
              'coatings, protected furnishings and a genuinely clean finish.',

    listTitle: '[We Handle] All Your Painting Work',
    listLead:  'From a single room to a full building fa\u00e7ade, we prepare every surface properly before the first coat goes on.',
    homes: [
      ['Interior Painting',       'Walls, ceilings and doors patched, primed and painted in the sheen you choose.'],
      ['Exterior Painting',       'Weather-resistant repainting of house exteriors, gates and boundary walls.'],
      ['Anti-Mould Treatment',    'Mould treated at the source, then sealed with anti-mould or anti-algae paint.'],
      ['Feature & Texture Walls', 'Limewash, sand-texture and accent walls for a decorative finish.'],
      ['Metal & Wood Finishes',   'Gates and railings rust-proofed and painted; doors and timber varnished.']
    ],
    commercial: [
      ['Repairs & Redecoration', 'Planned fa\u00e7ade repainting and minor repairs (R&R) for MCSTs and town councils.'],
      ['Epoxy Flooring',         'Hard-wearing floor coatings and line marking for factories, kitchens and car parks.']
    ],

    work: {
      tag: 'Residential', date: 'Sep, 2026', place: '4-Room HDB Flat, Tampines',
      title: 'Interior Repaint', desc: 'Furniture covered, walls primed and spray-finished',
      image: 'images/services/painting.webp',
      alt: 'Painters in protective suits repainting a living room with the furniture covered'
    }
  },
  {
    slug: 'renovation',
    title: 'Renovation',
    image: 'images/services/renovation.webp',
    heroImage: 'images/services/renovation.webp',
    menuDesc: 'Full renovation managed from design through to handover.',
    heroTitle: 'Renovation - Services & Solutions',
    heroLead: 'Complete renovation for homes and workplaces, managed by one team from first ' +
              'measurement through to the final walkthrough.',

    listTitle: '[We Handle] All Your Renovation Work',
    listLead:  'From a kitchen refit to a full office fit-out, we plan the work, coordinate every trade and see it through to handover.',
    homes: [
      ['HDB & Condo Renovation', 'Whole-home renovation, with HDB permits and MCST approvals handled.'],
      ['Kitchen Renovation',     'Cabinets, worktops, tiling, plumbing and electrical points in one job.'],
      ['Bathroom Renovation',    'Waterproofing, re-tiling and new sanitary fittings, with a ponding test.'],
      ['Carpentry & Built-Ins',  'Wardrobes, TV consoles, study tables and feature walls made to measure.'],
      ['Ceilings & Partitions',  'Plasterboard ceilings, cove lighting and drywall partitions.'],
      ['Tiling & Flooring',      'Floor tiles, vinyl and screeding for living areas, laid level and true.']
    ],
    commercial: [
      ['Office & Retail Fit-Out', 'Offices, shops and F&B units fitted out with ceilings, partitions, flooring and M&E.'],
      ['Addition & Alteration',   'Layout changes and mezzanines in existing buildings, with QP submissions if needed.']
    ],

    work: {
      tag: 'Residential', date: 'Aug, 2026', place: 'Resale HDB Flat, Punggol',
      title: 'Whole-Home Renovation', desc: 'Ceilings, partitions and wiring redone in one programme',
      image: 'images/services/renovation.webp',
      alt: 'A unit mid-renovation with new ceiling and partition boards in place'
    }
  },
  {
    slug: 'waterproofing',
    title: 'Waterproofing',
    image: 'images/services/waterproofing.webp',
    heroImage: 'images/services/waterproofing.webp',
    menuDesc: 'Leak tracing and membrane systems for wet areas and roofs.',
    heroTitle: 'Waterproofing - Services & Solutions',
    heroLead: 'Leak investigation and waterproofing for bathrooms, balconies, roofs and planters: ' +
              'treating the cause, not just the stain.',

    listTitle: '[We Handle] All Your Waterproofing Work',
    listLead:  'From a leaking toilet to a basement or roof, we trace the source first, then seal it and test the repair.',
    homes: [
      ['Leak Investigation',      'The leak traced to its source before any repair, with a report for owners and MCSTs.'],
      ['Toilet & Wet Areas',      'Toilets, bathrooms and kitchens resealed under new tiles, or treated without hacking.'],
      ['Roof Waterproofing',      'Torch-on or liquid membranes for flat roofs, roof gardens and car porches.'],
      ['Balcony & Planter Boxes', 'Membrane and drainage details for balconies, ledges and planter boxes.'],
      ['Crack Injection',         'PU or epoxy resin injected into cracks to stop seepage through walls and slabs.'],
      ['External Wall Sealing',   'Wall cracks and window frames sealed so rain stays out.']
    ],
    commercial: [
      ['Basement & Water Tanks',  'Waterproofing for below-ground walls, slabs and water-retaining structures.'],
      ['Expansion Joint Sealing', 'Failed sealant removed and movement joints resealed on roofs and car parks.']
    ],

    work: {
      tag: 'Residential', date: 'Jul, 2026', place: 'HDB Flat, Sengkang',
      title: 'Leak Repair & Waterproofing', desc: 'Leak traced with a ponding test, then the wet area resealed',
      image: 'images/services/waterproofing.webp',
      alt: 'Technicians applying a waterproofing membrane in a kitchen'
    }
  }
];

/* ##########################################################################
   SAMPLE CONTENT - the "Our Recent Work" entries above (service.work).
   Dates, job titles and places were written to fill the Figma layout; the
   review shown beside each one is that service's entry in BCE.testimonials,
   which are samples too. Replace each `work` with a real, permissioned job
   (and its own photo) before launch. Deleting a service's `work` hides the
   section on that page.
   ########################################################################## */
BCE.worksAreSamples = true;

/* Building types - dark "We Provide For All Building Types" section.
   Labels follow the Singapore benchmark (reports/Singapore construction
   website benchmark.md, section C): "Commercial", not "Commercial Space";
   "Hospitality & Leisure" for "Entertainment"; no peer says "Multistory".
   BCE is a trades contractor, so each line names the trades it brings to
   that building type rather than claiming to build it. Every card shares
   one button, "Get a Free Quote" (renderers.js), which opens the enquiry
   form with the building type set.
   The titles are also the form's building-type options (dropdown.js). */
BCE.buildingTypes = [
  { title: 'Residential',
    image: 'images/building-types/residential.webp',
    desc: 'Renovation, repainting, aircon, rewiring and leak repairs for HDB flats, condos and landed homes, all by one team.' },
  { title: 'High-Rise & Mixed-Use',
    image: 'images/building-types/multistory.webp',
    desc: 'Facade repainting, roof waterproofing and common-area upgrades for condo towers, HDB blocks and mixed developments.' },
  { title: 'Commercial',
    image: 'images/building-types/commercial.webp',
    desc: 'Office and retail fit-outs, reinstatement, aircon and electrical works, scheduled around your business hours.' },
  { title: 'Industrial',
    image: 'images/building-types/industrial.webp',
    desc: 'Power upgrades, ACMV, industrial painting and roof waterproofing for factories and warehouses, with minimal downtime.' },
  { title: 'Institutional',
    image: 'images/building-types/institutional.webp',
    desc: 'Repainting, ACMV servicing and upgrading works for schools, clinics and community buildings, done safely around occupants.' },
  { title: 'Hospitality & Leisure',
    image: 'images/building-types/entertainment.webp',
    desc: 'Refurbishment, aircon and lighting works for hotels, F&B outlets and leisure venues, phased so you can stay open.' }
];

/* How it works timeline (Figma 1:1990 service, 636:1436 home). */
BCE.process = [
  { n: '01', title: 'Request a Service', desc: 'Share your service requirements through our online form or contact our team directly.' },
  { n: '02', title: 'Get Confirmation',  desc: 'Our expert will confirm the schedule, visit your site and provide a clear service quotation.' },
  { n: '03', title: 'Plan & Execute',    desc: 'We plan the work, coordinate the necessary resources and carry out the service as agreed.' },
  { n: '04', title: 'Review',            desc: 'We review the completed work with you, address any outstanding concerns and complete the handover.' }
];

/* ##########################################################################
   SAMPLE CONTENT - NOT REAL CUSTOMERS.

   Every name, role and quote below was written to fill the layout. Publishing
   invented reviews as if they were genuine misleads customers and is an
   offence under Singapore's Consumer Protection (Fair Trading) Act.

   While the flag below is true the section renders a visible "sample content"
   banner, so nobody - client, product owner or visitor - can mistake these for
   real reviews. Replace the entries with quotes BCE has permission to use and
   set the flag to false. Emptying the array instead hides the whole section.
   ########################################################################## */
/* Notice hidden at the owner's request (Nov 2026); the quotes are still samples. */
BCE.testimonialsAreSamples = false;

/* Localised for Singapore (Nov 2026): first name + initial and the client's
   area, the way local review cards read. Still written, not collected. */
BCE.testimonials = [
  { category: 'Painting',   stars: 5, name: 'Daniel T.',   role: 'Homeowner, Tampines',
    quote: 'Repainted our whole 4-room flat in two days. Every piece of furniture was covered and they cleaned up each evening. Neat finish, fair price.' },
  { category: 'Renovation', stars: 5, name: 'Priya M.',    role: 'Homeowner, Punggol',
    quote: 'Our resale flat renovation kept to the timeline we agreed. One coordinator for every trade, and the site was cleared at the end of each day.' },
  { category: 'Aircon',     stars: 5, name: 'Wei Ling H.', role: 'Homeowner, Woodlands',
    quote: 'Booked a chemical wash for our System 3. They came on time, showed me the coils before and after, and did not push a new unit on me.' },
  { category: 'Electrical', stars: 5, name: 'Arun K.',     role: 'Cafe Owner, Tiong Bahru',
    quote: 'They traced a tripping fault two other contractors missed and labelled the whole DB. Work was done after closing, so we lost no business.' },
  { category: 'Waterproofing', stars: 4, name: 'Michelle L.', role: 'Homeowner, Sengkang',
    quote: 'Ceiling leak from the bathroom above, sorted properly. They ran a ponding test, explained the cause and gave us a written report.' },
  { category: 'Demolition', stars: 5, name: 'Suresh N.',   role: 'Facilities Manager, Jurong East',
    quote: 'Strip-out finished ahead of programme, with hoarding and dust control in place. The neighbouring units in the building had no complaints.' }
];

/* Home FAQ (Figma 495:1320) - the owner's copy (Nov 2026). The section
   renders whatever this list holds, and the first entry opens by default. */
BCE.faqs = [
  { q: 'How can I request a service from BCE?',
    a: 'You can submit your requirements through our contact form or call our team ' +
       'directly to discuss your service needs.' },
  { q: 'How can I contact your team for support?',
    a: 'You can reach us through our contact form, phone number, or email for service ' +
       'enquiries and assistance.' },
  { q: 'How soon can I expect to hear back from your team after submitting an enquiry?',
    a: 'Our team will review your enquiry and get back to you within 24 hours. ' +
       'We\u2019ll discuss your requirements and guide you through the next steps.' },
  { q: 'Do you provide free quotations?',
    a: 'Yes, we will provide you with a free quotation before starting the work. ' +
       'On your approval, we will proceed to the next steps.' },
  { q: 'Do you provide services for both residential and commercial properties?',
    a: 'Yes, BCE caters to residential and commercial service requirements, depending ' +
       'on the type and scope of work.' }
];

/* Google Maps JavaScript API key for the contact page map. With a key, the
   map goes live: the details card rides beside the office pin and the map
   cannot be panned far enough to lose them. Without one, the page uses
   Google's keyless embed instead (no card-on-pin).
   To get a key: Google Cloud console > enable "Maps JavaScript API" > create
   an API key, restrict it to this site's domain (HTTP referrers), paste it here. */
BCE.maps = {
  apiKey: ''
};

/* The fact timeline (Figma 697:2998 home About, 437:1464 About page MD block).
   Each count ticks up to its value on view; the bizSAFE licence closes the row. */
BCE.facts = [
  { label: 'Satisfied Customer',  count: 100 },
  { label: 'Successful Projects', count: 20 },
  { label: 'Expert Team Members', count: 10 }
];

/* "Why choose us" band on every service page (Figma 597:1351). Icons are the
   supplied icons8 exports at 100px, shown at 48px. */
BCE.whyChoose = [
  { title: 'Quality',    icon: 'images/why/quality.png',
    desc: 'We maintain high standards of workmanship, using quality materials and careful attention to detail in every project.' },
  { title: 'Team Work',  icon: 'images/why/teamwork.png',
    desc: 'Our team coordinates every stage of the project to ensure smooth communication and efficient delivery.' },
  { title: 'Innovation', icon: 'images/why/innovation.png',
    desc: 'We adopt practical methods and suitable technologies to deliver effective, lasting solutions.' },
  { title: 'Commitment', icon: 'images/why/commitment.png',
    desc: 'We take pride in our work and remain committed to delivering dependable service and customer satisfaction.' }
];

/* Words from the MD on the About page (Figma 437:1464). The design reads
   "At BEC, we build ec project"; the company is BCE and "ec" is a typo for
   "every", so both are corrected. */
BCE.founder = {
  name:  'Balamurugan',
  role:  'Director',
  quote: 'At BCE, we build every project on trust, quality and commitment. We provide reliable ' +
         'construction and maintenance solutions, with a focus on meeting our customers\u2019 needs ' +
         'and building lasting relationships.'
};

/* The About page now reuses the home page's "We Provide For All Building
   Types" section here, so the Recent Works data, renderer and styles were
   removed. The card photos remain in images/works/ if it is ever restored. */
