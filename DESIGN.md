# Puppy Pawtraits, design two: "After Dark"

This is the second option for Jason. Design one is a light paper and ink editorial site. This one goes the other way: a dark, cinematic gallery where the photographs do almost all the talking and the page moves with them. The content and the shop are the same, so the two options can be compared like for like.

## References (MiMic)

| Reference | Tier | What we take |
| --- | --- | --- |
| destigmatize.ca | 1 | Warm near-black canvas with apricot panels, towering condensed serif display, a script accent, parallax titles, a horizontal passage driven by vertical scroll. Soft out easing `cubic-bezier(0.215, 0.61, 0.355, 1)`, about 500ms, 95ms stagger. |
| dulcedo.com/what-we-do | 1 | Muted gold type on black, light serif display at very tight line height (0.7 to 0.8), slow image parallax, a short intro before the page settles. In-out curve `cubic-bezier(0.38, 0.005, 0.215, 1)`. |
| pensatori-irrazionali.com | 1 | Script and serif type mixed in with images, images that scrub in scale and blur as you scroll, about 100ms list stagger, a 900ms reveal. |

What we leave out: their WebGL scenes. The photographs are the show, so there's no 3D, and the page stays fast on a phone.

## Character

Warm and cinematic, like a darkened studio with one light on the dog. Every section is built around images. Text stays short and big, there are no badges, icons or feature lists, and **nothing is numbered**: no section numbers, step numbers, counters or "01 / 10".

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--night` | `#130b07` | Page canvas (from destigmatize, warm not blue) |
| `--night-2` | `#1f1510` | Raised panels, image wells |
| `--apricot` | `#ffcea3` | Display type on dark, and the one light panel (Commission) |
| `--cream` | `#f1ebe1` | Body text on dark (shared with design one) |
| `--muted` | `#a8977f` | Captions, breeds, small labels |
| `--collar` | `#b8461f` | The logo's red, used sparingly: the active filter, the bag count and focus rings |
| `--line` | `rgba(255, 206, 163, 0.16)` | Hairlines |

## Type

- **Display:** Instrument Serif (Google Fonts), an open condensed serif standing in for Domaine Display Condensed. Hero sizes are 18 to 22vw at a line height of 0.8 with -0.02em tracking.
- **Script accent:** the brush logo itself (`logo-cream.png`), plus one script word per section at most, set in Pinyon Script. It stays an accent and never becomes body text.
- **Body and UI:** Hanken Grotesk at 15 to 17px with 1.5 leading. Small labels are 11px uppercase with 0.12em tracking.
- **Scale:** each step is about 1.25 times the last, with fluid `clamp()` sizes from mobile to desktop.

## Space and shape

- 8px base grid, 12-column grid with gutters of `clamp(16px, 3vw, 48px)`.
- Sections are separated by `clamp(120px, 16vw, 240px)` of space; images take care of the rhythm.
- Square-cornered images. The only rounded shapes are pill buttons and the bag drawer, at a 2px radius.

## Motion

- **Easing:** `--ease-out: cubic-bezier(0.215, 0.61, 0.355, 1)` for reveals and `--ease-io: cubic-bezier(0.38, 0.005, 0.215, 1)` for transitions between states.
- **Durations:** 500ms for reveals, 900 to 1200ms for image transitions, 95ms stagger.
- **Engine:** GSAP with ScrollTrigger and Flip, and Lenis for smooth scrolling. These are what the pack demos use, ported to React components with `@gsap/react`.
- **Reduced motion:** every effect jumps straight to its end state, so the trail, the intro and the scrubbing turn off and the content is all still there.

## Page plan and Awwwards Pack components

| Section | Pack demo | How it's used |
| --- | --- | --- |
| **Intro** | Hero Animations / 14 "Hover Motion & Transition Image Grid" | The page opens on a tilted, slowly drifting wall of portraits. On the first scroll or click, Flip zooms one portrait to fill the screen, and the logo and headline settle over it. |
| **Hero play** | Mouse Effect / 9 "Image Trail Effect" | Moving the cursor over the hero leaves a trail of portraits that fade out behind it. On touch screens there's no trail and a slow crossfade plays instead. |
| **Statement** | Scroll Animation / 17 "Expanding Image Animation within Typography" | "Every dog sits *differently*." A small portrait sits inside the line and grows to full screen as you scroll. |
| **Gallery** | Grid Animations / 3 "Elastic Grid Scroll" | The main portfolio, with all the work in three columns that trail each other elastically as you scroll. The Studio, Outdoor and Puppies filters stay, without counts. Clicking a portrait opens the lightbox, which has Prev, Next and Close but no counter. |
| **The sitters** | Sliders / 12 "Crossroads Slideshow" | Featured dogs: tilted portraits with each dog's name huge behind them in Instrument Serif, and the breed underneath. You can drag it or use the arrow keys. |
| **Prints** | Grid Animations / 4 "Grid to Full Preview" | A grid of print cards. Clicking one expands it into a full-screen preview with the size picker, paper details and Add to bag. The bag and Stripe Checkout are the same as design one. |
| **Commission** | Scroll Animation / 28 "Fullscreen Scrolling Slideshow" | Say hello, The session and Your gallery, each on its own full-screen photo that wipes into the next. No step numbers. It ends on an apricot panel with the email and Instagram. |
| **Footer** | none | Logo, contact, and the Snurm credit linking to github.com/SadikMohamud. |

## Build

- Next.js 15 App Router and TypeScript, matching design one.
- Carried over from design one unchanged: `lib/catalogue.ts`, `lib/site.ts`, the bag (`Cart.tsx`), `app/api/checkout`, `app/success` and the brand logos. Only the presentation is new.
- Images use `next/image` with AVIF/WebP, lazy loading below the fold, and sizes set per layout.
- Deployed to its own Vercel project, `puppy-pawtraits-after-dark`, leaving design one untouched.

## Conventions

UK spelling, no em dashes in copy or comments, a Snurm footer credit, no AI attribution in the UI, comments or commits, and no numbering anywhere on the page.
