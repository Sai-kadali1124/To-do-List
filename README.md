# Global Path Study Abroad — Demo Website

> **Bright, colourful, modern, photo-led single-page demo website for an international education and career counselling consultancy in India.**

Built purely with vanilla HTML5, CSS3, and JavaScript using classic `<script>` tags (no bundler, no npm, no build step). It is immediately ready to view by double-clicking `index.html` or running on any static hosting environment.

---

## ✦ Mandatory Disclosure & Usage Rights Notice

1. **Sample Content**: All student testimonials, counsellor names, packages, pricing, timetable schedules, university course counts, and student stories are **fictional sample content** created strictly for demonstration.
2. **University Usage Rights**: All Indian and International universities mentioned (e.g. VIT, ITM, Marwadi, Ganpat, PP Savani, Manchester, TUM, Trinity, UBC, Melbourne, Heriot-Watt) are placeholder demo entries. **Named universities, photos, trademarks, and logos require formal institutional permission and explicit usage rights before public deployment.**
3. **No Unofficial Claims**: Do not present fees, cut-offs, or deadlines as verified current facts. The site displays honest `Sample partner listing` or `Sample` badges across all institutional and pricing cards, controllable via `config.js` (`forms.sampleLabels: true/false`).

---

## 1. How to Run Locally

### Option A: Double-Click File (Zero Setup)
Double-click `index.html` in your file explorer or open it in any web browser (`Chrome`, `Firefox`, `Safari`, `Edge`).
Because classic `<script>` tags are used rather than ES modules, `file://` protocol execution works seamlessly.

### Option B: Local Static Server (Recommended)
Run any one-line static server from the project directory:

```bash
# Python 3
python3 -m http.server 8080

# Or Node.js (if installed)
npx serve .
```

Open `http://localhost:8080` in your browser.

---

## 2. Project Directory Structure

```
├── index.html                      # Semantic HTML5, accessible landmarks, JSON-LD schema
├── README.md                       # Documentation & setup guide
├── css/
│   └── styles.css                  # Light design system, Poppins/Inter typography, bento grid
├── js/
│   ├── config.js                   # Single source of truth for branding, content & switches
│   ├── app.js                      # Content rendering, form validation, modal, tab filters
│   └── motion.js                   # GSAP 3.12.5 + ScrollTrigger animation choreography
└── assets/
    ├── images/
    │   ├── .gitkeep
    │   ├── hero-1-explore.jpg      # Students with counsellor, planning, warm light
    │   ├── hero-2-achieve.jpg      # Students celebrating campus admission
    │   ├── hero-3-begin.jpg        # Classroom study session in bright light
    │   ├── intro-campus.jpg        # Wide campus architecture
    │   ├── video-poster.jpg        # Video fallback poster frame
    │   ├── enquiry-bg.jpg          # Faint counselling conversation backdrop
    │   ├── counsellor-1.jpg        # Priya Malhotra portrait
    │   ├── counsellor-2.jpg        # David Fernandes portrait
    │   ├── counsellor-3.jpg        # Dr. Sunita Rao portrait
    │   ├── destinations/           # Country destination landmark photos
    │   │   ├── .gitkeep
    │   │   ├── uk.jpg
    │   │   ├── germany.jpg
    │   │   ├── ireland.jpg
    │   │   ├── canada.jpg
    │   │   ├── australia.jpg
    │   │   └── uae.jpg
    │   └── universities/           # Indian partner university photos
    │       ├── .gitkeep
    │       ├── vit.jpg
    │       ├── itm.jpg
    │       ├── marwadi.jpg
    │       ├── ganpat.jpg
    │       └── ppsavani.jpg
    └── video/
        ├── .gitkeep
        └── campus-reel.mp4         # (Optional .webm, 8-15s looping 1280x720 video)
```

---

## 3. Photo & Video Asset Requirements

The site comes pre-populated with bright, cheerful placeholder imagery so that the demo renders cleanly on first launch.

When ready with your client's high-resolution photography, simply replace files in `assets/images/`, `assets/images/destinations/`, and `assets/images/universities/`:

| Filename | Crop / Orientation | Recommended Specs |
| :--- | :--- | :--- |
| `hero-1-explore.jpg`, `hero-2-achieve.jpg`, `hero-3-begin.jpg` | Landscape (1200x800) | Bright, warm, portrait-capable crops (< 400 KB) |
| `intro-campus.jpg` | Tall Portrait (900x1100) | Modern university building or library (< 250 KB) |
| `counsellor-1.jpg`, `counsellor-2.jpg`, `counsellor-3.jpg` | Portrait (600x750) | Friendly, professional advisor portraits (< 200 KB) |
| `destinations/*.jpg` | Landscape (800x560) | Iconic cityscapes / landmarks for 6 countries (< 200 KB) |
| `universities/*.jpg` | Landscape (800x560) | Campus building photos for Indian universities (< 200 KB) |
| `video-poster.jpg` | 16:9 Landscape (1280x720) | High-contrast campus scene (< 200 KB) |
| `campus-reel.mp4` | 16:9 Landscape (1280x720) | Muted, seamless 8–15s loop, H.264 (< 4 MB) |

*Note: If any image is deleted or fails to load, a resilient gradient placeholder with the institution or destination name automatically appears.*

---

## 4. White-Labeling & Client Customization (`js/config.js`)

All client-specific information is centralized in `window.SITE_CONFIG`:

### A. Brand Identity & City
```javascript
brand: {
  name: "Global Path Study Abroad",
  shortName: "Global Path",
  tagline: "Your passport to the world’s best universities",
  city: "Delhi",
  state: "Delhi",
  fullAddress: "123 Sample Road, Connaught Place, New Delhi 110001",
  email: "hello@globalpath-demo.example",
  phone: { display: "+91 90000 00000", tel: "+919000000000" },
  whatsapp: { number: "919000000000", prefilledMessage: "Hello Global Path..." }
}
```

### B. Theme Palette & Typography
```javascript
theme: {
  bg: "#FFFFFF",
  bgSoft: "#F4F8FF",
  ink: "#14213D",
  primary: "#2357E0",       // Royal Blue
  accentYellow: "#FFC93C",  // Sunshine Yellow
  accentCoral: "#FF6B5B",   // Coral Main CTA
  accentMint: "#2EC4B6"     // Mint Ticks
}
```

### C. Feature Switches
Remove any section or action button cleanly across the site with a single boolean:
```javascript
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
}
```

---

## 5. Connecting Forms to a Real Inbox

By default, submitting forms performs real client-side validation (10-digit Indian phone numbers, valid email, required selects, non-past dates), simulates a 1.2-second network request, and animates an SVG checkmark.

To forward inquiries to an inbox:
1. Obtain an endpoint URL from [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com).
2. Open `js/config.js` and set:
   ```javascript
   forms: {
     endpoint: "https://formspree.io/f/your_form_id",
     accessKey: "",
     showDemoNote: false, // Turn off for production
     sampleLabels: false
   }
   ```
3. Form submissions will now POST JSON data directly to your inbox.

---

## 6. Static Hosting & Deployment

Because the website requires no build step, you can deploy in seconds to:
- **GitHub Pages**: Push repository and turn on Pages in settings.
- **Vercel / Netlify / Cloudflare Pages**: Connect git or drag & drop the root folder.
- **AWS S3 / Nginx / Apache**: Copy all static files into your webroot directory.
