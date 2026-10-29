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
  /* Footer blurb - kept short; the "4+ years" claim must stay. */
  blurb:     '4+ years of experience delivering residential, commercial and industrial ' +
             'projects across Singapore.'
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
  accessKey: '3c01a683-7c75-4824-808e-ba004e0b22d1',
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
    heroImage: 'images/misc/service-hero.webp',
    processTitle: 'Complete Aircon Service Process',
    processLead: 'Keep your air conditioning system running at peak performance with our professional servicing process.',
    steps: [
      { title: 'Aircon Installation',        desc: 'Professional setup of new units for maximum cooling efficiency.' },
      { title: 'General Servicing',          desc: 'Routine cleaning and checks that keep output steady all year.' },
      { title: 'Chemical Wash & Overhaul',   desc: 'Deep cleaning of coils and filters to restore cooling power.' },
      { title: 'Aircon Repair',              desc: 'Fast, reliable fixes for cooling issues, leaks or unusual noises.' },
      { title: 'Gas Top-Up',                 desc: 'Restoring refrigerant levels to keep your unit running smoothly.' },
      { title: 'Annual Maintenance',         desc: 'Scheduled servicing for worry-free comfort year-round.' }
    ],
    title: 'Aircon',
    image: 'images/services/aircon.webp',
    menuDesc: 'Servicing, installation and repairs for home and office units.',
    heroTitle: 'Aircon - Services & Solutions',
    heroLead: "In Singapore\u2019s hot and humid climate, regular servicing is essential to maintain " +
              'cooling performance, prevent sudden breakdowns, and extend the lifespan of your unit.',
    intro: 'Our aircon service is designed to keep your cooling systems running efficiently, ' +
           'safely, and smoothly throughout the year.',
    body:  'From installation and routine maintenance to repairs and deep cleaning, we ensure your ' +
           'air conditioning delivers consistent performance, cleaner air, and lasting comfort for ' +
           'your home or workplace.',
    features: [
      { title: 'Servicing & deep cleaning', desc: 'Chemical wash, coil and filter cleaning to restore cooling output.' },
      { title: 'Installation',              desc: 'Correct sizing, piping and mounting for split and cassette systems.' },
      { title: 'Repairs & gas top-up',      desc: 'Leak tracing, compressor diagnostics and refrigerant recharge.' }
    ]
  },
  {
    slug: 'demolition',
    heroImage: 'images/services/demolition.webp',
    processTitle: 'Complete Demolition Process',
    processLead: 'Controlled removal carried out to Singapore site standards, with protection and disposal handled end to end.',
    steps: [
      { title: 'Site Survey',        desc: 'Assessment of the structure and an agreed method statement.' },
      { title: 'Hoarding & Protection', desc: 'Screening and covers so adjoining units stay untouched.' },
      { title: 'Interior Strip-Out', desc: 'Hacking of walls, floors and fittings ready for rebuild.' },
      { title: 'Structural Works',   desc: 'Planned removal with temporary propping where required.' },
      { title: 'Debris Disposal',    desc: 'Sorted removal and licensed disposal with documentation.' },
      { title: 'Clean Handover',     desc: 'Site swept and cleared, ready for the next trade.' }
    ],
    title: 'Demolition',
    image: 'images/services/demolition.webp',
    menuDesc: 'Controlled strip-out and structural demolition with full disposal.',
    heroTitle: 'Demolition - Services & Solutions',
    heroLead: 'Safe, controlled demolition carried out to Singapore site standards, with hoarding, ' +
              'dust control and certified debris disposal handled end to end.',
    intro: 'We take structures down as carefully as we put them up, with a method statement, ' +
           'protection for what stays, and a clean site at handover.',
    body:  'From single-room hacking and full interior strip-outs to structural demolition, our crew ' +
           'works to an agreed sequence that protects adjoining units, keeps noise within permitted ' +
           'hours, and clears all debris responsibly.',
    features: [
      { title: 'Interior strip-out', desc: 'Hacking of walls, floors and fittings ready for rebuild.' },
      { title: 'Structural works',   desc: 'Planned removal with temporary propping where required.' },
      { title: 'Disposal & haulage', desc: 'Sorted debris removal and licensed disposal with records.' }
    ]
  },
  {
    slug: 'electrical',
    heroImage: 'images/services/electrical.webp',
    processTitle: 'Complete Electrical Service Process',
    processLead: 'Licensed electrical work that is tested, labelled and documented before it is handed over.',
    steps: [
      { title: 'Load Assessment',    desc: 'Checking existing capacity before any new circuit is added.' },
      { title: 'Wiring & Rewiring',  desc: 'New points, circuit extensions and full rewires.' },
      { title: 'DB Upgrade',         desc: 'Board replacement, protection devices and load balancing.' },
      { title: 'Lighting Install',   desc: 'Fittings, switches and controls set out to plan.' },
      { title: 'Fault Finding',      desc: 'Tripping, earth leakage and intermittent fault diagnosis.' },
      { title: 'Testing & Handover', desc: 'Every circuit tested, labelled and recorded.' }
    ],
    title: 'Electrical',
    image: 'images/services/electrical.webp',
    menuDesc: 'Licensed wiring, DB upgrades, lighting and fault finding.',
    heroTitle: 'Electrical - Services & Solutions',
    heroLead: 'Licensed electrical work for homes, offices and industrial units, from new circuits ' +
              'and distribution boards to fault finding and lighting upgrades.',
    intro: 'Electrical work is where shortcuts cost the most, so every circuit we install is tested, ' +
           'labelled and documented before we hand it over.',
    body:  'We handle rewiring, DB upgrades, power and lighting points, and emergency fault tracing. ' +
           'All work follows the relevant Singapore standards and is carried out by qualified crew.',
    features: [
      { title: 'Wiring & rewiring', desc: 'New points, circuit extensions and full rewires.' },
      { title: 'DB upgrade & RCCB', desc: 'Board replacement, protection devices and load balancing.' },
      { title: 'Fault finding',     desc: 'Tripping, earth leakage and intermittent fault diagnosis.' }
    ]
  },
  {
    slug: 'painting',
    heroImage: 'images/services/painting.webp',
    processTitle: 'Complete Painting Process',
    processLead: 'Most paint problems are preparation problems, so the groundwork is where the work goes.',
    steps: [
      { title: 'Surface Inspection', desc: 'Identifying damp, cracks and failed coatings before quoting.' },
      { title: 'Protection',         desc: 'Furnishings, floors and fittings covered and taped.' },
      { title: 'Preparation',        desc: 'Scraping, skim coat, patching and sanding.' },
      { title: 'Priming',            desc: 'The right primer for the substrate so the topcoat holds.' },
      { title: 'Finish Coats',       desc: 'Even application in your chosen sheen, cut in by hand.' },
      { title: 'Clean & Inspect',    desc: 'Site cleared daily and a joint walkthrough at the end.' }
    ],
    title: 'Painting',
    image: 'images/services/painting.webp',
    menuDesc: 'Interior and exterior painting with proper surface prep.',
    heroTitle: 'Painting - Services & Solutions',
    heroLead: 'Interior and exterior painting done the way it lasts: proper preparation, quality ' +
              'coatings, protected furnishings and a genuinely clean finish.',
    intro: 'Most paint problems are preparation problems. We sand, patch, prime and protect before ' +
           'the first coat goes on.',
    body:  'Our painters cover residential units, offices and commercial frontages, working around ' +
           'your schedule where the space stays in use, and leaving the site tidy each day.',
    features: [
      { title: 'Surface preparation', desc: 'Scraping, skim coat, patching and priming.' },
      { title: 'Interior finishes',   desc: 'Walls, ceilings and joinery in your chosen sheen.' },
      { title: 'Exterior & weather',  desc: 'Weather-resistant systems for facades and boundary walls.' }
    ]
  },
  {
    slug: 'renovation',
    heroImage: 'images/services/renovation.webp',
    processTitle: 'Complete Renovation Process',
    processLead: 'One point of contact and one programme, from first measurement through to the final walkthrough.',
    steps: [
      { title: 'Design & Planning',  desc: 'Layout, material selection and a costed programme.' },
      { title: 'Approvals',          desc: 'Permits and submissions handled where the works require them.' },
      { title: 'Demolition & Prep',  desc: 'Strip-out and making good before new work begins.' },
      { title: 'Trade Coordination', desc: 'Carpentry, tiling, electrical and plumbing in sequence.' },
      { title: 'Finishing',          desc: 'Painting, fixtures and the details that get noticed.' },
      { title: 'Handover & Defects', desc: 'Joint inspection with a defects list closed out in writing.' }
    ],
    title: 'Renovation',
    image: 'images/services/renovation.webp',
    menuDesc: 'Full renovation managed from design through to handover.',
    heroTitle: 'Renovation - Services & Solutions',
    heroLead: 'Complete renovation for homes and workplaces, managed by one team from first ' +
              'measurement through to the final walkthrough.',
    intro: 'One point of contact, one programme, one team accountable for the result: that is the ' +
           'difference between a renovation that runs and one that drifts.',
    body:  'We coordinate carpentry, tiling, electrical, plumbing and painting under a single ' +
           'schedule, so trades follow each other in the right order and the handover date holds.',
    features: [
      { title: 'Design & planning',   desc: 'Layout, material selection and a costed programme.' },
      { title: 'Full coordination',   desc: 'All trades sequenced under one site supervisor.' },
      { title: 'Handover & defects',  desc: 'Joint inspection with a defects list closed out in writing.' }
    ]
  },
  {
    slug: 'waterproofing',
    heroImage: 'images/services/waterproofing.webp',
    processTitle: 'Complete Waterproofing Process',
    processLead: 'A leak is a symptom. We trace where water actually enters before recommending any treatment.',
    steps: [
      { title: 'Leak Investigation', desc: 'Ponding and moisture testing to locate the true source.' },
      { title: 'Surface Preparation',desc: 'Removing failed layers and repairing the substrate.' },
      { title: 'Membrane Systems',   desc: 'Liquid or sheet membranes suited to the area.' },
      { title: 'Joint Sealing',      desc: 'Corners, pipe penetrations and movement joints sealed.' },
      { title: 'Ponding Test',       desc: 'Held and verified before anything is covered back up.' },
      { title: 'Reinstatement',      desc: 'Screed and tiling restored, with a written report.' }
    ],
    title: 'Waterproofing',
    image: 'images/services/waterproofing.webp',
    menuDesc: 'Leak tracing and membrane systems for wet areas and roofs.',
    heroTitle: 'Waterproofing - Services & Solutions',
    heroLead: 'Leak investigation and waterproofing for bathrooms, balconies, roofs and planters: ' +
              'treating the cause, not just the stain.',
    intro: 'A leak is a symptom. We trace where water actually enters before recommending any ' +
           'treatment, so the repair holds.',
    body:  'Our team carries out ponding tests, membrane systems, screed reinstatement and joint ' +
           'sealing, with a written report of what was found and what was done.',
    features: [
      { title: 'Leak investigation',  desc: 'Ponding and moisture testing to locate the true source.' },
      { title: 'Membrane systems',    desc: 'Liquid and sheet membranes for wet areas and roofs.' },
      { title: 'Sealing & reinstate', desc: 'Joint sealing, screed and tile reinstatement after works.' }
    ]
  }
];

/* Building types - dark "We Provide For All Building Types" section. */
BCE.buildingTypes = [
  { title: 'Residential',      image: 'images/building-types/residential.webp',
    desc: "Build the elegant home you\u2019ve always dreamed of. From new construction and renovations we deliver exceptional craftsmanship for every project." },
  { title: 'Multistory',       image: 'images/building-types/multistory.webp',
    desc: 'Expert construction solutions for modern apartment and multistorey developments, combining structural excellence with timely delivery.' },
  { title: 'Commercial Space', image: 'images/building-types/commercial.webp',
    desc: 'Create distinctive, modern commercial spaces that inspire success. From offices and retail outlets, we build with precision and innovation.' },
  { title: 'Industrial',       image: 'images/building-types/industrial.webp',
    desc: 'Engineered industrial spaces that maximize productivity, operational efficiency, and sustainable growth.' },
  { title: 'Institutional',    image: 'images/building-types/institutional.webp',
    desc: 'Thoughtfully designed institutional buildings that foster learning, healthcare, and community development.' },
  { title: 'Entertainment',    image: 'images/building-types/entertainment.webp',
    desc: 'Distinctive entertainment destinations crafted to deliver memorable experiences and exceptional functionality.' }
];

BCE.process = [
  { n: '01', title: 'Request a Service',         desc: 'Fill out our online form or give us a quick call with your service needs.' },
  { n: '02', title: 'Get Confirmation',          desc: 'Our expert will confirm the schedule and provide a clear service quote.' },
  { n: '03', title: 'Enjoy Hassle-Free Service', desc: 'Our experts will arrive on time, complete the job, and make sure everything is working smoothly before they leave.' }
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
BCE.testimonialsAreSamples = true;

BCE.testimonials = [
  { category: 'Painting',   stars: 5, name: 'Daniel Tan',  role: 'Homeowner',
    quote: 'The painting team was professional and neat. They finished the job with good attention to detail and minimal mess. Great value for the price.' },
  { category: 'Renovation', stars: 5, name: 'Priya Menon', role: 'Office Manager',
    quote: 'Our office refit ran to schedule and the site was left clean every evening. Coordination between trades was genuinely well handled.' },
  { category: 'Aircon',     stars: 5, name: 'Wei Ling Ho', role: 'Condo Resident',
    quote: 'Booked a servicing slot and they arrived on time. Explained what was wrong with the unit clearly instead of upselling me.' },
  { category: 'Electrical', stars: 5, name: 'Arun Kumar',  role: 'Cafe Owner',
    quote: 'They traced a tripping fault two other contractors had missed, then labelled the whole board properly. Straightforward and fair.' },
  { category: 'Waterproofing', stars: 4, name: 'Michelle Lau', role: 'Property Agent',
    quote: 'Balcony leak sorted after a proper ponding test. I appreciated getting a written report of what was found and what was done.' },
  { category: 'Demolition', stars: 5, name: 'Suresh Nair', role: 'Developer',
    quote: 'Strip-out was completed ahead of programme with hoarding and dust control in place. Adjoining units had no complaints.' }
];

/* "Your reliable partner" band (Figma 437:1221). The four headings are the
   company tagline - Quality, Innovation, Team Work, Passion - and the order
   below matches the design's columns left to right. Icons are the supplied
   icons8 exports, used unmodified because they carry their own colour. */
BCE.values = [
  { title: 'Quality',   icon: 'images/values/quality.svg',
    desc: 'Every job is finished to a standard we would accept in our own home. Materials are agreed up front and the work is checked before we call it done.' },
  { title: 'Team Work', icon: 'images/values/teamwork.svg',
    desc: 'One supervisor, one programme, and trades that follow each other in the right order. You deal with a single point of contact from first visit to handover.' },
  { title: 'Innovation', icon: 'images/values/innovation.svg',
    desc: 'Better methods, not simply more hours. We bring current techniques and the right equipment to each site so the work lasts and the disruption is shorter.' },
  { title: 'Passion',   icon: 'images/values/passion.svg',
    desc: 'We take the work personally. 4+ years on Singapore sites have not changed the fact that we would rather do a job properly than do it twice.' }
];

/* "Meet our MD" band (Figma 437:1464). The design reads "BEC" here and in the
   Recent Works heading; the company is BCE, so that is corrected. */
BCE.founder = {
  eyebrow: 'MEET OUR MD',
  lead:    'a vision built on trust & quality',
  name:    'Balamurugan',
  role:    'Director',
  photo:   'images/about/md-balamurugan.webp',
  quote:   'At BCE, we believe every successful project begins with trust, thoughtful planning, ' +
           'and a commitment to quality. Our vision is to deliver reliable construction and ' +
           'maintenance solutions that meet our clients’ needs while building lasting ' +
           'relationships. We strive to make every project a smooth and rewarding experience.'
};

/* The About page now reuses the home page's "We Provide For All Building
   Types" section here, so the Recent Works data, renderer and styles were
   removed. The card photos remain in images/works/ if it is ever restored. */
