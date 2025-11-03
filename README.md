# Relayo Landing Page

A professional, production-ready landing page for Relayo - your 24/7 AI receptionist powered by n8n and ElevenLabs.

## 🚀 Quick Start

Simply open `index.html` in a web browser. No build process required!

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## 📁 File Structure

```
Relayo/
├── index.html          # Main HTML file
├── styles.css          # All styles and components
├── script.js           # Interactive features
├── README.md           # This file
└── assets/
    ├── logos/          # Logo placeholders
    │   └── logo-*.svg
    ├── icons/          # Icon placeholders
    └── og.jpg          # OpenGraph image (replace with real image)
```

## ✏️ How to Edit Content

### 1. Hero Section (Top of page)

**Location:** `index.html` lines 82-137

**To change the headline:**
```html
<h1 class="hero__headline">
  AI that books jobs and makes you money.  <!-- EDIT THIS -->
</h1>
```

**To change the subheadline:**
```html
<p class="hero__subheadline">
  Relayo is your 24/7 AI receptionist...  <!-- EDIT THIS -->
</p>
```

**To modify CTA buttons:**
```html
<div class="hero__ctas">
  <a href="#demo" class="btn btn--primary">Watch a demo</a>  <!-- EDIT TEXT & LINK -->
  <a href="#how-it-works" class="btn btn--ghost">See how it works</a>
</div>
```

### 2. Features Section

**Location:** `index.html` lines 172-213

**To edit feature cards:**
```html
<div class="feature-card">
  <div class="feature-card__icon">📥</div>  <!-- CHANGE EMOJI -->
  <h3 class="feature-card__title">Capture every lead</h3>  <!-- EDIT TITLE -->
  <p class="feature-card__description">
    Unified inbox from calls, SMS...  <!-- EDIT DESCRIPTION -->
  </p>
</div>
```

**To modify stats:**
```html
<div class="stat">
  <span class="stat__value">+45%</span>  <!-- EDIT VALUE -->
  <span class="stat__label">lift in lead-to-appointment rate</span>  <!-- EDIT LABEL -->
</div>
```

### 3. How It Works Steps

**Location:** `index.html` lines 231-289

**To edit steps:**
```html
<div class="step">
  <div class="step__number">1</div>  <!-- Step number -->
  <div class="step__content">
    <h4>Detect intent from voice/text</h4>  <!-- EDIT TITLE -->
    <p>ElevenLabs conversational AI...</p>  <!-- EDIT DESCRIPTION -->
  </div>
</div>
```

### 4. Agent Tiles

**Location:** `index.html` lines 299-370

**To modify agent tiles:**
```html
<div class="agent-tile">
  <div class="agent-tile__icon">📚</div>  <!-- CHANGE EMOJI -->
  <h3 class="agent-tile__title">Knowledge base syncing</h3>  <!-- EDIT TITLE -->
  <p class="agent-tile__description">
    Automatically sync and search...  <!-- EDIT DESCRIPTION -->
  </p>
</div>
```

### 5. Customer Testimonials

**Location:** `index.html` lines 420-484

**To edit testimonials:**
```html
<div class="testimonial">
  <blockquote class="testimonial__quote">
    "Relayo has transformed..."  <!-- EDIT QUOTE -->
  </blockquote>
  <div class="testimonial__author">
    <div class="testimonial__avatar"></div>
    <div class="testimonial__info">
      <div class="testimonial__name">Sarah Chen</div>  <!-- EDIT NAME -->
      <div class="testimonial__role">Owner, Elite Auto Detail</div>  <!-- EDIT ROLE -->
    </div>
  </div>
  <div class="testimonial__kpi">+180% appointment bookings</div>  <!-- EDIT KPI -->
</div>
```

### 6. Industry Pills & Dock

**Industry pills (hero section):** `index.html` lines 128-135
**Footer dock:** `index.html` lines 568-582

```html
<a href="#" class="pill">Auto</a>  <!-- EDIT INDUSTRY NAME -->
```

## 🎨 Customizing Design

### Colors

**Location:** `styles.css` lines 9-16

```css
--color-primary-from: #2563EB;  /* Primary gradient start */
--color-primary-to: #1E40AF;    /* Primary gradient end */
--color-accent: #60A5FA;        /* Accent color */
--color-text: #0F172A;          /* Text color */
--color-surface: #FFFFFF;       /* Background */
--color-surface-alt: #F7FAFC;   /* Alternate background */
```

### Fonts

Already imported from Google Fonts:
- **Inter** - UI text
- **EB Garamond (italic)** - Emphasized text

To change fonts, modify `index.html` line 34 and `styles.css` lines 18-19.

### Spacing

**Location:** `styles.css` lines 21-26

```css
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
/* etc. */
```

## ⚡ Interactive Features

All handled automatically by `script.js`:

1. **Cursor Glow** - Radial gradient follows mouse
2. **Scroll Reveal** - Sections fade in on scroll
3. **Smooth Scroll** - Anchor links scroll smoothly
4. **Dock Hover** - Footer industry links magnify on hover (macOS-style)
5. **Industry Pills** - Active state on click
6. **Reduced Motion** - Respects user preferences

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on navigation
- Focus states on all interactive elements
- Alt text on images (update placeholders!)
- Color contrast meets WCAG AA standards
- `prefers-reduced-motion` support

## 📱 Responsive Design

Breakpoints:
- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** ≥ 1024px

All sections adapt automatically.

## 🖼️ Adding Real Images

### Replace placeholder logos:
1. Add your logo files to `assets/logos/`
2. Update `<img src>` in `index.html` lines 154-176

### Add OpenGraph image:
1. Create a 1200x630px image
2. Replace `assets/og.jpg`
3. Update meta tags in `index.html` lines 17-27

### Add screenshots:
Replace the placeholder in the "How It Works" section (`index.html` line 294).

## 🔧 Adding New Sections

1. Copy an existing section structure from `index.html`
2. Add custom styles to `styles.css` if needed
3. New sections automatically get scroll-reveal animation

## 📊 SEO & Metadata

**Update these in `index.html`:**

- Title (line 31)
- Description (line 7)
- OpenGraph data (lines 16-27)
- JSON-LD structured data (lines 38-63)

## 🎯 Performance Tips

- Images use `loading="lazy"` for performance
- Fonts are preconnected
- No external dependencies except Google Fonts
- Minimal JavaScript footprint
- CSS custom properties for efficiency

## 📞 Support

For questions or customization help, refer to:
- HTML structure in `index.html`
- All styles in `styles.css`
- Interactions in `script.js`

---

Built with ❤️ for Relayo | Powered by n8n & ElevenLabs
