# Sponsor Studio design system

Use this brief when building or restyling any Sponsor Studio surface (marketing site, product demo, consultation site, app) so they all look like one brand. The reference implementation is the marketing site in this folder (`app/globals.css`, `components/ui/`).

## 1. The feel

Sponsor Studio is a sponsorship marketplace where brands spend real money, so the design has to feel **calm, editorial and trustworthy**, never flashy or "AI template". Think a well-set magazine, not a crypto landing page.

- Warm paper backgrounds, white cards, hairline borders, one blue.
- Serif headlines with a single italic phrase for emphasis; clean sans-serif everywhere else.
- Real product UI and real photos instead of illustrations or decoration.
- Motion is subtle and purposeful: things settle into place once; nothing loops, glows or bounces.

## 2. Colour

| Token | Hex | Use |
|---|---|---|
| `brand-600` / primary | `#2A3A92` | Primary buttons, links, active states (sampled from the logo) |
| `brand-700` / primary-hover | `#212E75` | Hover on primary |
| `brand-50` | `#EEF0FA` | Tinted icon tiles, soft badges |
| `brand-100 / 200 / 300 / 400 / 500 / 800 / 900` | `#DDE1F4` `#BAC2E8` `#8F9AD6` `#5F6DBF` `#3D4DAB` `#1A2459` `#121940` | Rarely: charts, focus ring (`500`) |
| `ink` | `#0B1020` | Headings and body text |
| `navy` | `#141C4A` | Dark sections and dark cards (the logo blue, deepened) |
| `navy-soft` | `#1E2862` | Surfaces inside navy sections |
| `background` | `#FAF9F6` | Page background (warm paper) |
| `background-secondary` | `#F2F1EC` | Alternate section background |
| `surface` | `#FFFFFF` | Cards, inputs, menus |
| `surface-hover` | `#F5F4F0` | Hover on cards and menu items |
| `text-primary` | `#0B1020` | Headings, key text |
| `text-secondary` | `#4A5168` | Body copy |
| `text-muted` | `#7A8199` | Hints, meta, placeholders |
| `border` | `rgb(11 16 32 / 0.10)` | All hairlines |
| `border-hover` | `rgb(11 16 32 / 0.22)` | Hover on bordered items |
| `success` | `#15803D` | Accepted, verified, positive |
| `warning` | `#B45309` | Pending, medium risk |
| `danger` | `#B91C1C` | Errors, pass/dislike |

Rules: one accent colour only (the brand blue). Status colours are used only for status. On navy sections, text is white and secondary text is `white/70`, borders `white/15`.

## 3. Typography

Load from Google Fonts (or `next/font`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

- **Display / headings (h1, h2):** Fraunces, weight **400** (never bold), `letter-spacing: -0.02em`, `line-height: 1.05`, `text-wrap: balance`. Put **one** phrase per heading in italic for emphasis, e.g. `Sponsorships, <em>minus the cold emails.</em>`
- **Body and UI (h3 and below, buttons, labels):** Geist, weights 400 / 500 / 600. h3 = 18–20px semibold sans.
- **Small figures and meta (dates, read time, step numbers, prices in tables):** Geist Mono, 12px.
- **Sizes:** h1 48 / 60 / 72px (mobile / tablet / desktop), section h2 36 / 48px, lead paragraph 18–20px, body 16–18px with `line-height: 1.6–1.75`, small 14px, meta 12px.
- Stat numbers (e.g. `1,000+`, `₹2 Cr+`) use Fraunces at 30–36px.

## 4. Layout and spacing

- Page container: `max-width: 76rem` (1216px), side padding 16px → 24px (≥640px) → 32px (≥1024px).
- Section spacing: `py-20` (80px) mobile, `py-28` (112px) desktop. Sections alternate `background` and `background-secondary`.
- Use a 12-column grid for split layouts (e.g. 6/6 hero, 5/7 text/form, 4/8 heading/accordion).
- Headings are **left-aligned** by default; centre only short, standalone headers.
- Sticky header: 80px tall, transparent at top, `background/90` with `backdrop-blur` and a bottom hairline once scrolled; hides on scroll down, returns on scroll up.

## 5. Shape and elevation

- Cards: `radius 12px`, `1px` hairline border, white surface, **no** shadow or `0 1px 2px rgb(11 16 32 / .04)`.
- Floating elements (menus, product mock-ups, toasts): `0 12px 32px -12px rgb(11 16 32 / .18), 0 2px 6px rgb(11 16 32 / .06)`.
- Buttons and inputs: `radius 10px`. Chips, badges, segmented controls: fully rounded or `radius 12px` container with `8px` inner pills.

## 6. Components

**Buttons** (font 14–16px, weight 500, no shadow, no scale on hover; colour change only)

| Variant | Style |
|---|---|
| Primary | `bg #2A3A92`, white text, hover `#212E75` |
| Secondary | white bg, 1px hairline border, ink text; hover `surface-hover` and `border-hover` |
| Ghost | text only, `text-secondary` → `text-primary`, hover `surface-hover` |
| Inverse (on navy) | white bg, ink text, hover `brand-50` |
| Outline inverse (on navy) | 1px `white/25` border, white text, hover `white/10` |

Sizes: sm `h-36px px-14px`, md `h-40px px-16px`, lg `h-48px px-24px`. Trailing arrow icon (`ArrowRight`, 16px) on primary calls to action; `ArrowUpRight` for external links.

**Inputs:** white, 1px hairline, radius 10px, height 40–48px, placeholder `text-muted`, focus border `brand-500`, labels above fields (14px, 500).

**Segmented control / tabs:** white container with hairline border and 4px padding; active pill `bg primary` + white text (on navy: `bg white` + ink text). Dashboard-style tabs: text tabs with a 2px `brand-600` underline on the active one.

**Badges / chips:** small (11–12px), rounded-full. Verified = `brand-50` bg + `brand-700` text + `BadgeCheck` icon. Status: `success/10` bg + success text (Accepted), `warning/10` + warning text (Pending).

**Icon tiles:** 40–44px square, radius 8px, `brand-50` bg, `brand-600` icon (on navy: `white/10` bg, white icon).

**Accordions:** list with hairline dividers, question 18px medium, `Plus` icon rotating 45° when open, answer `text-secondary`, max-width ~42rem.

**Content cards (blog, stories):** image `aspect-[16/10]` in a rounded, bordered frame; meta in Geist Mono uppercase 12px; title 18px semibold; excerpt 2 lines.

## 7. Navy sections

- Colour `#0B1020` with white text.
- Large sections (pinned "How it works", success stories) run **full width**.
- The closing call-to-action is the one **inset panel**: 8–12px side margin, `radius 28–32px`.
- Smaller accents on sub-pages: a single navy card per page (e.g. contact details, price summary, "still have a question?"). Never make a whole page navy.

## 8. Icons and imagery

- Icons: `lucide-react`, 16–20px, one colour (brand, ink or muted). No multi-coloured icon sets.
- Imagery: real event photos, real product screenshots, or UI mock-ups built from the same components. **No** stock 3D illustrations or clip-art people.
- Logo: the wordmark PNG (`/logo.png`, cropped tight), 48px tall in the header, 40px in the footer. Never recolour, stretch or put it on a busy image.

## 9. Motion

- Library: Framer Motion (`motion` / `framer-motion`). One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Entrances: fade + 16px rise, 0.5–0.7s, **once**, as the element enters the viewport; stagger siblings by 0.06–0.1s.
- Headlines: each line rises from behind a mask (`overflow: hidden` wrapper, `y: 110% → 0`, 0.9s).
- Numbers count up once when visible.
- Hover: colour/border changes only (images may scale 1.02–1.03 inside their frame).
- Respect `prefers-reduced-motion` (wrap the app in `<MotionConfig reducedMotion="user">` and disable CSS animations).
- **Never:** infinite loops, shimmer, pulsing dots, bouncing, glow animations, parallax on text.

## 10. Do not use

- Gradients of any kind on text, buttons or backgrounds (the only exception is a dark scrim over photos for legible text).
- Glows, coloured shadows, blurred blobs/orbs, grid or dot background patterns.
- Glassmorphism: `backdrop-blur` on cards (the sticky header is the only blurred element).
- Uppercase "pill" labels or eyebrow text above headings (e.g. "THE SPONSORSHIP MARKETPLACE").
- Emojis in UI, rainbow icon colours, `font-black`/extra-bold headings, `hover:scale` on cards and buttons.
- More than one accent colour.

## 11. Copy and formatting

- Tone: intelligent but conversational; plain and specific. Say what happens ("Interest sent · −50 credits"), not hype ("Revolutionary AI-powered synergy").
- Sentence case for headings, buttons and navigation ("Book a demo", not "Book A Demo").
- Spelling: Indian/British English ("organiser", "programme").
- Money: Indian format with the rupee sign: `₹2,450`, `₹4L – ₹9L`, `₹2 Cr+`, `₹5,000 + GST`. Credits: `2,450 credits`.
- Only claim what is true. If a figure or feature isn't confirmed, don't show it.

## 12. Implementation snippets

**Tailwind v4 (`globals.css`)**

```css
@import "tailwindcss";
@theme {
  --color-brand-50: #eef0fa; --color-brand-100: #dde1f4; --color-brand-200: #bac2e8; --color-brand-300: #8f9ad6;
  --color-brand-400: #5f6dbf; --color-brand-500: #3d4dab; --color-brand-600: #2a3a92; --color-brand-700: #212e75;
  --color-brand-800: #1a2459; --color-brand-900: #121940;
  --color-ink: #0b1020; --color-ink-soft: #161c30;
  --color-navy: #141c4a; --color-navy-soft: #1e2862;
  --color-primary: #2a3a92; --color-primary-hover: #212e75;
  --color-success: #15803d; --color-warning: #b45309; --color-danger: #b91c1c;
  --color-background: #faf9f6; --color-background-secondary: #f2f1ec;
  --color-surface: #ffffff; --color-surface-hover: #f5f4f0;
  --color-text-primary: #0b1020; --color-text-secondary: #4a5168; --color-text-muted: #7a8199;
  --color-border: rgb(11 16 32 / 0.1); --color-border-hover: rgb(11 16 32 / 0.22);
  --radius-card: 0.75rem;
  --shadow-card: 0 1px 2px rgb(11 16 32 / 0.04), 0 1px 1px rgb(11 16 32 / 0.02);
  --shadow-pop: 0 12px 32px -12px rgb(11 16 32 / 0.18), 0 2px 6px rgb(11 16 32 / 0.06);
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
}
body { background: var(--color-background); color: var(--color-text-primary); font-family: var(--font-sans); }
h1, h2 { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.02em; line-height: 1.05; text-wrap: balance; }
```

**Tailwind v3 (`tailwind.config.js`)**

```js
theme: {
  extend: {
    colors: {
      brand: { 50: '#eef0fa', 100: '#dde1f4', 200: '#bac2e8', 300: '#8f9ad6', 400: '#5f6dbf', 500: '#3d4dab', 600: '#2a3a92', 700: '#212e75', 800: '#1a2459', 900: '#121940' },
      ink: { DEFAULT: '#0b1020', soft: '#161c30' },
      navy: { DEFAULT: '#141c4a', soft: '#1e2862' },
      primary: { DEFAULT: '#2a3a92', hover: '#212e75' },
      success: '#15803d', warning: '#b45309', danger: '#b91c1c',
      background: { DEFAULT: '#faf9f6', secondary: '#f2f1ec' },
      surface: { DEFAULT: '#ffffff', hover: '#f5f4f0' },
      'text-primary': '#0b1020', 'text-secondary': '#4a5168', 'text-muted': '#7a8199',
      border: { DEFAULT: 'rgb(11 16 32 / 0.1)', hover: 'rgb(11 16 32 / 0.22)' },
    },
    fontFamily: {
      sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
    },
    borderRadius: { card: '0.75rem' },
    boxShadow: {
      card: '0 1px 2px rgb(11 16 32 / 0.04), 0 1px 1px rgb(11 16 32 / 0.02)',
      pop: '0 12px 32px -12px rgb(11 16 32 / 0.18), 0 2px 6px rgb(11 16 32 / 0.06)',
    },
    transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)' },
  },
},
```

## 13. Checklist before shipping a screen

- [ ] Page background is warm paper `#FAF9F6`; cards are white with hairline borders.
- [ ] Headings use Fraunces 400 with at most one italic phrase; UI text uses Geist.
- [ ] The only accent colour is `#2A3A92`; status colours appear only on status.
- [ ] No gradients, glows, blobs, glass cards, pulsing dots, eyebrow labels or emojis.
- [ ] Buttons match the five variants and change colour, not size, on hover.
- [ ] Motion uses the single easing curve, plays once and respects reduced motion.
- [ ] Copy is sentence case, specific and uses ₹ Indian number formatting.
