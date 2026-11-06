/**
 * ==============================================================================
 * GLOBAL PATH STUDY ABROAD — SITE CONFIGURATION (js/config.js)
 * Single source of truth for all branding, content, theme variables & feature switches.
 * Easily re-skin or toggle features for any study-abroad consultancy in minutes.
 * ==============================================================================
 */

window.SITE_CONFIG = {
  // BRAND & CONTACT DETAILS (All marked as sample data for demonstration)
  brand: {
    name: "Global Path Study Abroad",
    shortName: "Global Path",
    tagline: "Your passport to the world’s best universities",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    fullAddress: "123 Sample Road, Connaught Place, New Delhi 110001",
    email: "hello@globalpath-demo.example",
    phone: {
      display: "+91 90000 00000",
      tel: "+919000000000"
    },
    whatsapp: {
      number: "919000000000",
      prefilledMessage: "Hello Global Path, I would like to book a free study-abroad counselling session."
    },
    social: {
      linkedin: "https://linkedin.com/company/globalpath-demo",
      instagram: "https://instagram.com/globalpath_demo",
      youtube: "https://youtube.com/@globalpath_demo",
      twitter: "" // Empty links are automatically hidden in the UI
    }
  },

  // THEME COLORS & FONTS (Applied as CSS variables dynamically at runtime)
  theme: {
    bg: "#FFFFFF",
    bgSoft: "#F4F8FF",
    bgLavender: "#F3F0FF",
    bgCream: "#FFFBF5",
    ink: "#14213D",
    textMuted: "#5B6785",
    primary: "#2357E0",      // Royal blue
    primaryDeep: "#1B3FA8",  // Deep blue (hover and gradients)
    accentYellow: "#FFC93C", // Sunshine yellow
    accentCoral: "#FF6B5B",  // Coral (main CTA accent)
    accentMint: "#2EC4B6",   // Mint (ticks, success)
    error: "#E5484D",
    border: "#DCE4F5",
    fontHeadlines: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },

  // OPERATING HOURS (Shown with real-time Indian Standard Time (IST) highlighting)
  hours: {
    timezone: "Asia/Kolkata",
    days: [
      { day: "Monday", open: "10:00 AM", close: "7:00 PM", dayIndex: 1 },
      { day: "Tuesday", open: "10:00 AM", close: "7:00 PM", dayIndex: 2 },
      { day: "Wednesday", open: "10:00 AM", close: "7:00 PM", dayIndex: 3 },
      { day: "Thursday", open: "10:00 AM", close: "7:00 PM", dayIndex: 4 },
      { day: "Friday", open: "10:00 AM", close: "7:00 PM", dayIndex: 5 },
      { day: "Saturday", open: "10:00 AM", close: "7:00 PM", dayIndex: 6 },
      { day: "Sunday", open: "11:00 AM", close: "3:00 PM", dayIndex: 0 }
    ],
    summary: "Mon–Sat 10:00 AM – 7:00 PM | Sun 11:00 AM – 3:00 PM (IST)"
  },

  // HERO: "TAKE THE FIRST STEP"
  hero: {
    eyebrow: "Study abroad, made simple",
    headlineLines: [
      "Take the first step",
      "to study abroad"
    ],
    supportingLine: "Get matched with the right university, course and scholarship, with expert counselling from application to departure.",
    bullets: [
      "Shortlists in 7 days (sample)",
      "Scholarship guidance",
      "Visa and documentation support"
    ],
    primaryCta: "Get free counselling",
    secondaryCta: "Explore universities",
    leadForm: {
      title: "Book your free session",
      subtitle: "Personalised roadmap with our senior advisors"
    },
    scenes: [
      {
        id: "explore",
        image: "assets/images/hero-1-explore.jpg",
        label: "Explore Options",
        altText: "Students with a counsellor planning overseas university admissions",
        mobileFocalPoint: "center top",
        desktopFocalPoint: "center center"
      },
      {
        id: "achieve",
        image: "assets/images/hero-2-achieve.jpg",
        label: "Achieve Acceptance",
        altText: "Happy students celebrating study abroad admission offer letters",
        mobileFocalPoint: "center center",
        desktopFocalPoint: "center center"
      },
      {
        id: "begin",
        image: "assets/images/hero-3-begin.jpg",
        label: "Begin Your Journey",
        altText: "Focused student preparing in an illuminated modern lecture hall",
        mobileFocalPoint: "center bottom",
        desktopFocalPoint: "center center"
      }
    ]
  },

  // TRUST STRIP
  trustStrip: [
    { text: "Sample: 500+ students guided", icon: "users" },
    { text: "Sample: 20+ countries covered", icon: "globe" },
    { text: "Sample: Scholarship guidance", icon: "award" },
    { text: "Sample: Visa support", icon: "check-circle" }
  ],

  // WHY CHOOSE US (6 feature cards in 3x2 grid with colored icon tiles)
  whyChooseUs: [
    {
      id: "partnerships",
      title: "University partnerships",
      desc: "Direct institutional relationships with top public and private universities across Europe, North America and Asia-Pacific.",
      iconBg: "blue",
      icon: "building"
    },
    {
      id: "end-to-end",
      title: "End-to-end support",
      desc: "From initial profile audit and aptitude matching to statement of purpose reviews, visa interviews, and campus arrivals.",
      iconBg: "coral",
      icon: "compass"
    },
    {
      id: "success",
      title: "Proven success pathways",
      desc: "Methodical profile building that emphasizes student leadership, research acumen, and authentic co-curricular distinction.",
      iconBg: "yellow",
      icon: "star"
    },
    {
      id: "acceptance",
      title: "Clear shortlists in days",
      desc: "Clear shortlists in days, not months. We benchmark target admission tiers using Dream, Target, and Safety categories.",
      iconBg: "mint",
      icon: "check"
    },
    {
      id: "scholarships",
      title: "Scholarship advisory",
      desc: "Targeted evaluation of merit grants, athletic endowments, tuition waivers, and government bilateral fellowships.",
      iconBg: "lavender",
      icon: "gift"
    },
    {
      id: "beyond",
      title: "Beyond admissions",
      desc: "Assistance with student health insurance, education loan tie-ups, vetted student accommodation, and flight arrangements.",
      iconBg: "blue",
      icon: "shield"
    }
  ],

  // CINEMATIC VIDEO BAND
  video: {
    srcMp4: "assets/video/campus-reel.mp4",
    srcWebm: "assets/video/campus-reel.webm",
    poster: "assets/images/video-poster.jpg",
    overlayLine: "Your next chapter starts here."
  },

  // DESTINATIONS (6 colourful cards)
  destinations: [
    {
      id: "uk",
      name: "United Kingdom",
      flag: "🇬🇧",
      sampleCount: "120+ Universities (Sample)",
      sampleLabel: "Sample count",
      highlight: "Post-study work visa & world-renowned 1-year Masters programmes",
      subjects: ["Business", "Computing", "Biomedical"],
      photo: "assets/images/destinations/uk.jpg"
    },
    {
      id: "germany",
      name: "Germany",
      flag: "🇩🇪",
      sampleCount: "80+ Universities (Sample)",
      sampleLabel: "Sample count",
      highlight: "Tuition-free public universities with global technology excellence",
      subjects: ["Mechanical", "Automotive", "Data Science"],
      photo: "assets/images/destinations/germany.jpg"
    },
    {
      id: "ireland",
      name: "Ireland",
      flag: "🇮🇪",
      sampleCount: "30+ Universities (Sample)",
      sampleLabel: "Sample count",
      highlight: "European tech capital with a 2-year post-study work visa",
      subjects: ["Fintech", "Cloud Systems", "Pharma"],
      photo: "assets/images/destinations/ireland.jpg"
    },
    {
      id: "canada",
      name: "Canada",
      flag: "🇨🇦",
      sampleCount: "95+ Universities (Sample)",
      sampleLabel: "Sample count",
      highlight: "Paid Co-op work terms and clear permanent residency pathways",
      subjects: ["AI & Analytics", "Management", "Bio-Tech"],
      photo: "assets/images/destinations/canada.jpg"
    },
    {
      id: "australia",
      name: "Australia",
      flag: "🇦🇺",
      sampleCount: "45+ Universities (Sample)",
      sampleLabel: "Sample count",
      highlight: "Group of Eight research powerhouses and unmatched student lifestyle",
      subjects: ["Engineering", "Mining", "Public Health"],
      photo: "assets/images/destinations/australia.jpg"
    },
    {
      id: "uae",
      name: "UAE (Dubai)",
      flag: "🇦🇪",
      sampleCount: "25+ Universities (Sample)",
      sampleLabel: "Sample count",
      highlight: "Accredited global branch campuses in a world-leading trade gateway",
      subjects: ["Intl Business", "Design", "Hospitality"],
      photo: "assets/images/destinations/uae.jpg"
    }
  ],

  // INDIAN UNIVERSITIES (5 sample partner listings)
  indianUniversities: [
    {
      id: "vit",
      name: "VIT (Vellore Institute of Technology)",
      location: "Vellore, Tamil Nadu (verify)",
      photo: "assets/images/universities/vit.jpg",
      desc: "Multidisciplinary Indian university offering engineering, computing, and management curricula with international credit transfer programs.",
      chips: ["Engineering", "Computing", "Sample programme"],
      badge: "Sample partner listing",
      modalDetails: {
        established: "Multi-campus institution (verify)",
        overview: "Offers structured dual-degree options with international university partners. Confirm details, intake dates and usage rights before publishing.",
        studyAreas: ["Computer Science & Engineering", "Electronics & Communication", "Bio Sciences & Technology", "Business School"]
      }
    },
    {
      id: "itm",
      name: "ITM Skills University",
      location: "Navi Mumbai, Maharashtra (verify)",
      photo: "assets/images/universities/itm.jpg",
      desc: "Industry-aligned institution providing specialized undergraduate and postgraduate tracks in business, design, and health technologies.",
      chips: ["Management", "Design", "Sample programme"],
      badge: "Sample partner listing",
      modalDetails: {
        established: "Industry-focused programs (verify)",
        overview: "Curriculum tailored around corporate internships and practical skills. Confirm details, fees and usage rights before publishing.",
        studyAreas: ["Business Administration", "Interior & Fashion Design", "Allied Healthcare", "Hospitality"]
      }
    },
    {
      id: "marwadi",
      name: "Marwadi University",
      location: "Rajkot, Gujarat (verify)",
      photo: "assets/images/universities/marwadi.jpg",
      desc: "Comprehensive academic campus with specialized departments in engineering, pharmaceutical sciences, law, and computer applications.",
      chips: ["Engineering", "Pharmacy", "Sample programme"],
      badge: "Sample partner listing",
      modalDetails: {
        established: "State private university (verify)",
        overview: "Extensive campus facilities hosting diverse Indian and international students. Confirm details and usage rights before publishing.",
        studyAreas: ["Civil & Mechanical Engineering", "Pharmaceutical Sciences", "Law & Legal Studies", "Computer Applications"]
      }
    },
    {
      id: "ganpat",
      name: "Ganpat University",
      location: "Mehsana, Gujarat (verify)",
      photo: "assets/images/universities/ganpat.jpg",
      desc: "Innovation-driven university delivering degree pathways in advanced engineering, maritime studies, management, and pharmacy.",
      chips: ["Technology", "Management", "Sample programme"],
      badge: "Sample partner listing",
      modalDetails: {
        established: "Technical & professional campus (verify)",
        overview: "Industry collaborations and specialized sector training labs. Confirm details, fees and usage rights before publishing.",
        studyAreas: ["Marine Engineering", "Cybersecurity", "Applied Management", "Pharmacy & Health Sciences"]
      }
    },
    {
      id: "ppsavani",
      name: "PP Savani University",
      location: "Surat, Gujarat (verify)",
      photo: "assets/images/universities/ppsavani.jpg",
      desc: "Expansive green campus fostering interdisciplinary studies in architecture, design, sciences, nursing, and liberal arts.",
      chips: ["Architecture", "Sciences", "Sample programme"],
      badge: "Sample partner listing",
      modalDetails: {
        established: "Multi-discipline institution (verify)",
        overview: "Hands-on studio spaces and student-centric academic community. Confirm details and usage rights before publishing.",
        studyAreas: ["Architecture & Planning", "Design & Fine Arts", "Nursing & Allied Sciences", "Liberal Arts"]
      }
    }
  ],

  // INTERNATIONAL UNIVERSITIES (Grouped by country tabs)
  internationalUniversities: {
    uk: [
      { name: "University of Manchester", city: "Manchester, United Kingdom", courses: "450+ Courses (Sample)", photo: "assets/images/destinations/uk.jpg", badge: "Sample listing" },
      { name: "University of Edinburgh", city: "Edinburgh, Scotland", courses: "380+ Courses (Sample)", photo: "assets/images/destinations/uk.jpg", badge: "Sample listing" }
    ],
    germany: [
      { name: "Technical University of Munich (TUM)", city: "Munich, Germany", courses: "180+ Courses (Sample)", photo: "assets/images/destinations/germany.jpg", badge: "Sample listing" },
      { name: "Heidelberg University", city: "Heidelberg, Germany", courses: "160+ Courses (Sample)", photo: "assets/images/destinations/germany.jpg", badge: "Sample listing" }
    ],
    ireland: [
      { name: "Trinity College Dublin", city: "Dublin, Ireland", courses: "220+ Courses (Sample)", photo: "assets/images/destinations/ireland.jpg", badge: "Sample listing" },
      { name: "University College Dublin (UCD)", city: "Dublin, Ireland", courses: "210+ Courses (Sample)", photo: "assets/images/destinations/ireland.jpg", badge: "Sample listing" }
    ],
    canada: [
      { name: "University of British Columbia", city: "Vancouver, Canada", courses: "320+ Courses (Sample)", photo: "assets/images/destinations/canada.jpg", badge: "Sample listing" },
      { name: "University of Toronto", city: "Toronto, Canada", courses: "360+ Courses (Sample)", photo: "assets/images/destinations/canada.jpg", badge: "Sample listing" }
    ],
    australia: [
      { name: "University of Melbourne", city: "Melbourne, Australia", courses: "340+ Courses (Sample)", photo: "assets/images/destinations/australia.jpg", badge: "Sample listing" },
      { name: "University of Sydney", city: "Sydney, Australia", courses: "330+ Courses (Sample)", photo: "assets/images/destinations/australia.jpg", badge: "Sample listing" }
    ],
    uae: [
      { name: "Heriot-Watt University Dubai", city: "Dubai, UAE", courses: "110+ Courses (Sample)", photo: "assets/images/destinations/uae.jpg", badge: "Sample listing" },
      { name: "University of Wollongong in Dubai", city: "Dubai, UAE", courses: "95+ Courses (Sample)", photo: "assets/images/destinations/uae.jpg", badge: "Sample listing" }
    ]
  },

  // SERVICES (6 core services in a Bento layout)
  services: [
    {
      id: "university-shortlisting",
      title: "University Shortlisting",
      size: "large", // bento prominence
      desc: "Data-driven, tier-calibrated selection based on student GPA, budget, career goals, and post-study opportunities.",
      steps: [
        "Academic score & profile assessment",
        "Dream, Target, and Safety categorisation",
        "ROI, cost-of-living and campus audit"
      ]
    },
    {
      id: "course-counselling",
      title: "Course & Career Counselling",
      size: "wide", // bento prominence
      desc: "Psychometric personality and aptitude evaluation to match natural strengths with emerging high-growth global professions.",
      steps: [
        "Aptitude & interest profiling",
        "10-year industry demand projections",
        "Curriculum & specialization mapping"
      ]
    },
    {
      id: "admission-support",
      title: "Application & Admission Support",
      size: "regular",
      desc: "End-to-end documentation, statement of purpose (SOP) guidance, letter of recommendation (LOR) polishing, and portal filings.",
      steps: [
        "SOP & essay narrative brainstorming",
        "Faculty LOR review & formatting",
        "Direct university portal submissions"
      ]
    },
    {
      id: "scholarships",
      title: "Scholarship Guidance",
      size: "regular",
      desc: "Unlocking merit-based awards, country bursaries, research assistantships, and sports endowments across target universities.",
      steps: [
        "Global scholarship eligibility scan",
        "Impact essay drafting & coaching",
        "Deadline management & filings"
      ]
    },
    {
      id: "visa-documentation",
      title: "Visa & Documentation",
      size: "regular",
      desc: "Meticulous financial dossier prep, visa application lodgement, and realistic mock interview simulations with country experts.",
      steps: [
        "Financial solvency & funds structuring",
        "Visa form verification & filing",
        "Embassy mock interview preparation"
      ]
    },
    {
      id: "pre-departure",
      title: "Pre-Departure Guidance",
      size: "regular",
      desc: "From forex cards, international student health insurance, and baggage packing to vetted accommodation and airport pick-ups.",
      steps: [
        "Forex card & bank account setup",
        "Accommodation & roommate matchmaking",
        "Alumni orientation & flight briefings"
      ]
    }
  ],

  // COUNSELLORS (3 sample profiles)
  counsellors: [
    {
      id: "priya",
      name: "Priya Malhotra",
      specialty: "Head of Global Admissions — UK & Europe",
      bio: "12+ years evaluating European university requirements, Russell Group admissions, and Ireland post-study work visa strategies.",
      experience: "12+ Years Advisory",
      image: "assets/images/counsellor-1.jpg",
      badge: "Sample profile"
    },
    {
      id: "david",
      name: "David Fernandes",
      specialty: "Senior Advisor — North America & Australia",
      bio: "Guided hundreds of Indian scholars into Canadian Co-op programs, US Tier-1 institutions, and Australia Group of Eight universities.",
      experience: "10+ Years Advisory",
      image: "assets/images/counsellor-2.jpg",
      badge: "Sample profile"
    },
    {
      id: "sunita",
      name: "Dr. Sunita Rao",
      specialty: "Scholarship & Visa Documentation Specialist",
      bio: "Former university international office panellist specializing in merit grants, research statements, and embassy interview coaching.",
      experience: "14+ Years Advisory",
      image: "assets/images/counsellor-3.jpg",
      badge: "Sample profile"
    }
  ],

  // PACKAGES (3 sample packages with session/package toggle)
  packages: [
    {
      id: "starter",
      name: "Starter Consultation",
      popular: false,
      desc: "Ideal for early-stage aspirants seeking country comparison and preliminary profile evaluation.",
      sessionPrice: "₹ 2,499",
      sessionLabel: "per 60-min session",
      packagePrice: "₹ 7,999",
      packageLabel: "per 3-session bundle",
      features: [
        "1-on-1 discovery profile audit",
        "Country & intake suitability review",
        "Custom report with 5 recommended universities",
        "Initial scholarship & budget roadmap"
      ],
      ctaText: "Select Starter"
    },
    {
      id: "guidance",
      name: "Guided Pathway",
      popular: true, // Marked as popular with rotating gradient border
      badge: "Most Popular",
      desc: "Our most requested comprehensive mentorship for students applying to 3 to 5 universities.",
      sessionPrice: "₹ 6,999",
      sessionLabel: "per deep-dive session",
      packagePrice: "₹ 24,999",
      packageLabel: "full season milestone plan",
      features: [
        "Complete academic & aptitude assessment",
        "Dream-Target-Safety shortlist of 5 universities",
        "SOP & LOR editing with 3 revision cycles",
        "Full application filing & portal management",
        "Dedicated mentor on WhatsApp throughout admissions"
      ],
      ctaText: "Select Guided Pathway"
    },
    {
      id: "complete",
      name: "Comprehensive Support",
      popular: false,
      desc: "End-to-end concierge guidance from country selection through visa stamping and airport departure.",
      sessionPrice: "₹ 14,999",
      sessionLabel: "per intensive session",
      packagePrice: "₹ 49,999",
      packageLabel: "full cycle VIP mentorship",
      features: [
        "Everything in Guided Pathway",
        "Unlimited university applications (up to 8)",
        "Exclusive scholarship & fellowship coaching",
        "Embassy mock interview simulation with experts",
        "Housing, forex, student visa and pre-departure briefings"
      ],
      ctaText: "Select Comprehensive"
    }
  ],

  // PROCESS (4 steps)
  process: [
    {
      step: "01",
      title: "Free Discovery Call",
      desc: "A 25-minute one-on-one session to discuss your academic aspirations, target destinations, and family budget considerations."
    },
    {
      step: "02",
      title: "Profile & Goals Review",
      desc: "Comprehensive evaluation of your GPA, test scores (IELTS/TOEFL/GRE), co-curriculars, and long-term residency goals."
    },
    {
      step: "03",
      title: "Shortlist & Application Plan",
      desc: "A bespoke matrix of Dream, Target, and Safety universities with tailored SOP brainstorming and intake deadlines."
    },
    {
      step: "04",
      title: "Pre-Departure Support",
      desc: "Hands-on visa filing, financial dossier audit, mock interview drill, accommodation booking, and alumni orientation."
    }
  ],

  // TIMETABLE (Weekly schedule with Day tabs & Category chips)
  timetable: {
    categories: ["All", "Counselling", "Workshops", "Webinars"],
    schedule: [
      {
        day: "Monday",
        slots: [
          { time: "11:00 AM – 12:00 PM", title: "1-on-1 UK Master's Discovery Call", counsellor: "Priya Malhotra", mode: "Online (Video)", category: "Counselling" },
          { time: "03:00 PM – 04:30 PM", title: "German Public Universities Masterclass", counsellor: "David Fernandes", mode: "Webinar", category: "Webinars" },
          { time: "05:00 PM – 06:00 PM", title: "Study in Ireland: 2-Year Stay-Back Option", counsellor: "Priya Malhotra", mode: "In-Person", category: "Counselling" }
        ]
      },
      {
        day: "Tuesday",
        slots: [
          { time: "10:30 AM – 11:30 AM", title: "Canadian Co-op Programs & Work Permits", counsellor: "David Fernandes", mode: "Online (Video)", category: "Webinars" },
          { time: "02:00 PM – 03:00 PM", title: "Undergraduate Profile Evaluation", counsellor: "Dr. Sunita Rao", mode: "Online (Video)", category: "Counselling" },
          { time: "04:30 PM – 06:00 PM", title: "Parent Financial Planning & Education Loans", counsellor: "David Fernandes", mode: "In-Person", category: "Workshops" }
        ]
      },
      {
        day: "Wednesday",
        slots: [
          { time: "11:00 AM – 12:30 PM", title: "SOP Writing Workshop: Stand Out to Admissions", counsellor: "Dr. Sunita Rao", mode: "Online (Video)", category: "Workshops" },
          { time: "03:00 PM – 04:00 PM", title: "Australia Group of Eight Admissions Desk", counsellor: "David Fernandes", mode: "In-Person", category: "Counselling" },
          { time: "05:30 PM – 06:30 PM", title: "Dubai Branch Campuses & Global Degrees", counsellor: "Priya Malhotra", mode: "Online (Video)", category: "Counselling" }
        ]
      },
      {
        day: "Thursday",
        slots: [
          { time: "10:00 AM – 11:00 AM", title: "Global Scholarships & Fee Waivers for 2026/2027", counsellor: "Dr. Sunita Rao", mode: "Webinar", category: "Webinars" },
          { time: "02:30 PM – 03:30 PM", title: "STEM Programs & Tech Post-Study Opportunities", counsellor: "David Fernandes", mode: "Online (Video)", category: "Counselling" },
          { time: "04:00 PM – 05:00 PM", title: "Visa Documentation Checklist Review", counsellor: "Dr. Sunita Rao", mode: "In-Person", category: "Counselling" }
        ]
      },
      {
        day: "Friday",
        slots: [
          { time: "11:00 AM – 12:00 PM", title: "Europe English-Taught Bachelor's Degrees", counsellor: "Priya Malhotra", mode: "Online (Video)", category: "Counselling" },
          { time: "03:00 PM – 04:30 PM", title: "IELTS & Duolingo Exam Strategy Clinic", counsellor: "Academic Mentor", mode: "Workshops", category: "Workshops" },
          { time: "05:00 PM – 06:00 PM", title: "Express 1-on-1 Shortlist Consultation", counsellor: "Priya Malhotra", mode: "Webinar", category: "Webinars" }
        ]
      },
      {
        day: "Saturday",
        slots: [
          { time: "10:30 AM – 12:00 PM", title: "Open Study Abroad Admissions Clinic", counsellor: "Senior Team", mode: "In-Person", category: "Workshops" },
          { time: "02:00 PM – 03:30 PM", title: "Mock Visa Interview Drill (US / UK / Canada)", counsellor: "Dr. Sunita Rao", mode: "Online (Video)", category: "Workshops" },
          { time: "04:30 PM – 05:30 PM", title: "Postgraduate Engineering & MBA Roundtables", counsellor: "David Fernandes", mode: "In-Person", category: "Counselling" }
        ]
      },
      {
        day: "Sunday",
        slots: [
          { time: "11:30 AM – 01:00 PM", title: "Global Path International Admissions Roadmap", counsellor: "Lead Counsellors", mode: "Webinar", category: "Webinars" },
          { time: "01:30 PM – 02:30 PM", title: "Fast-Track University Matching Session", counsellor: "Dr. Sunita Rao", mode: "Online (Video)", category: "Counselling" }
        ]
      }
    ]
  },

  // GALLERY (8 tiles reusing supplied photos)
  gallery: [
    { image: "assets/images/hero-1-explore.jpg", title: "One-on-One Mentorship", caption: "Personalized study-abroad planning", category: "Counselling" },
    { image: "assets/images/hero-2-achieve.jpg", title: "Acceptance Celebrations", caption: "Celebrating premier admission offers", category: "Admissions" },
    { image: "assets/images/hero-3-begin.jpg", title: "Modern Campus Halls", caption: "Inspiring world-class research facilities", category: "Campus" },
    { image: "assets/images/intro-campus.jpg", title: "Global Partner Campuses", caption: "Leading universities across Europe and America", category: "Campuses" },
    { image: "assets/images/destinations/uk.jpg", title: "United Kingdom Horizons", caption: "Historic institutions and cultural hubs", category: "Destinations" },
    { image: "assets/images/destinations/germany.jpg", title: "Germany Tech & Research", caption: "Engineering excellence and high ROI", category: "Destinations" },
    { image: "assets/images/destinations/canada.jpg", title: "Canada Co-op Campuses", caption: "Work experience and diverse communities", category: "Destinations" },
    { image: "assets/images/enquiry-bg.jpg", title: "Family Roadmap Sessions", caption: "Collaborative parent and student alignment", category: "Advisory" }
  ],

  // SUCCESS STORIES (3 sample stories with yellow star row)
  successStories: [
    {
      student: "Aarav S.",
      destination: "United Kingdom",
      course: "MSc Data Science & AI",
      institution: "Top UK Russell Group University (Sample)",
      quote: "Global Path made my UK application completely stress-free. From SOP editing to receiving my visa in two weeks, the clarity was invaluable.",
      badge: "Sample story",
      stars: 5
    },
    {
      student: "Meera K.",
      destination: "Germany",
      course: "Automotive Systems Engineering",
      institution: "Leading German Technical University (Sample)",
      quote: "Getting into a tuition-free German university felt impossible until my counsellor guided my APS certification and application portfolio.",
      badge: "Sample story",
      stars: 5
    },
    {
      student: "Kabir N.",
      destination: "Canada",
      course: "Bachelor of Commerce (Co-op)",
      institution: "Premier Canadian University (Sample)",
      quote: "The team assisted with everything from course credits to off-campus housing. Highly recommended for any student dreaming of studying abroad.",
      badge: "Sample story",
      stars: 5
    }
  ],

  // TESTIMONIALS (3 sample reviews without fake statistics)
  testimonials: [
    {
      quote: "Sending our daughter abroad for higher studies was a major decision for our family. Global Path explained tuition costs, part-time work norms, and safety with calm transparency. We felt supported at every single step.",
      author: "Sanjay & Meenakshi Verma",
      role: "Parents of Overseas Scholar",
      location: "New Delhi",
      badge: "Sample review"
    },
    {
      quote: "I had average test scores and was unsure if I could secure scholarships in Ireland. My counsellor identified three funding grants I qualified for and helped me win a 25% tuition waiver.",
      author: "Divya Nambiar",
      role: "Postgraduate Student",
      location: "Bengaluru",
      badge: "Sample review"
    },
    {
      quote: "The mock visa interview drills gave me immense confidence before my consulate appointment. Everything they asked was practiced in advance. Exceptional dedication from the entire team.",
      author: "Rohan Gupta",
      role: "Undergraduate Aspirant",
      location: "Mumbai",
      badge: "Sample review"
    }
  ],

  // FAQS (6 accessible questions with generic, truthful answers)
  faqs: [
    {
      q: "How do we get started with Global Path Study Abroad?",
      a: "Begin by booking a free discovery counselling session through our form or WhatsApp. We will connect with you to review your target countries, academic scores, budget, and recommend an actionable roadmap."
    },
    {
      q: "What is included in the free initial counselling session?",
      a: "Our senior advisors provide a 25-minute evaluation covering course suitability, country intake schedules, tuition estimates, and a preliminary list of 3 to 5 recommended universities."
    },
    {
      q: "What documents should I prepare before my consultation?",
      a: "Please keep your academic mark sheets (Class 10, 12, or undergraduate transcripts), any language test scores (IELTS, TOEFL, PTE, Duolingo), and an updated resume or CV handy."
    },
    {
      q: "Do you offer online sessions for students across India?",
      a: "Yes. We conduct secure 1-on-1 video consultations for students and parents across all Indian states, as well as in-person advisory at our New Delhi office."
    },
    {
      q: "What is your rescheduling and cancellation policy?",
      a: "Scheduled sessions can be rescheduled up to 24 hours prior without fee. During peak visa and intake filing months, we provide flexible priority slots."
    },
    {
      q: "How do you help students choose between conflicting countries?",
      a: "We evaluate post-study work regulations, tuition costs versus return on investment (ROI), language requirements, and long-term residency options to help you choose the best fit."
    }
  ],

  // FEATURE TOGGLES (Setting any to false cleanly removes that section & corresponding nav links)
  features: {
    trial: true,
    packages: true,
    whatsapp: true,
    call: true,
    email: true,
    video: true,
    intro: true,
    destinations: true,
    indianUniversities: true,
    internationalUniversities: true,
    services: true,
    counsellors: true,
    process: true,
    timetable: true,
    gallery: true,
    testimonials: true,
    successStories: true,
    faq: true,
    location: true,
    stickyMobileBar: true
  },

  // FORM HANDLING CONFIGURATION
  forms: {
    endpoint: "",       // Paste Formspree/Web3Forms/etc. endpoint URL here for live delivery
    accessKey: "",      // Optional API access key
    showDemoNote: true, // Shows small demo notice under success state
    sampleLabels: true  // Displays "Sample" tags across pricing, reviews, and profiles
  }
};
