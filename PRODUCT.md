# Ropero — Design Context

This file is the single source of truth for Ropero's design intent. Anyone (human or AI) making visual or product-design decisions should start here before touching a component, writing microcopy, or changing a token.

Update it when the direction shifts, not every time a color does.

## Design Context

### Users

Four equally-weighted personas. None dominates; designs that don't serve all of them risk narrowing the product.

- **The intentional minimalist.** Owns less, cares about each piece. Uses Ropero to plan the week's outfits deliberately, often on Sunday evenings. Reads "cost-per-wear" as confirmation, not guilt.
- **The curator.** Owns more, but with discernment. Treats Ropero as an inventory-of-meaning — what they own, why they own it, when each piece was worn. Lives in the wardrobe detail views.
- **The re-wearer.** Wants to stop buying new things. Uses Ropero to rediscover pieces already in the closet. Values wear-history and low-wear surfacing.
- **The packer.** Travels often. Uses Ropero to build capsule trips without forgetting pieces. Spends time in Trips + Outfits.

**Shared traits across all four**: design-conscious, quality-over-quantity instinct, treats the wardrobe as considered rather than consumed. None of them are gamified by streaks or notifications.

### Brand Personality

- **Three words:** Intentional. Considered. Quiet.
- **Voice**: reflective, not instructional. The app is a mirror ("you wore this 12 times this year"), not a coach ("you should wear this more!").
- **Tone of microcopy**: understated, declarative, confident. Avoid exclamation marks, avoid cute. Words like *curated*, *considered*, *piece*, *wear*, *worn* sit in the vocabulary; words like *item*, *product*, *add to cart*, *favorite*, *trending* do not.
- **Emotional goal**: the user should feel mildly pleased opening the app, the way opening a well-organized drawer feels pleasant. Never urgency. Never FOMO.

### Aesthetic Direction

- **Theme**: Japanese minimalism meets Milanese detail. Restrained, architectural, quietly confident. Editorial rather than promotional.
- **Palette**: Matcha (see [docs/brand/matcha.html](docs/brand/matcha.html)).
  - Primary accent: matcha green `#5A7852` — structure, navigation, primary actions.
  - Secondary accent: ochre gold `#A88840` — highlights, favorites, special-item flag. Whether the dual-accent stays or collapses to green-only is still under iteration (PR [#61](https://github.com/esquvi/ropero/pull/61), `/brand-preview`).
  - Warm off-white background `#EEEFE8` (not neutral white — has a subtle green undertone).
  - Near-black dark `#0C0F0A` (with green undertone matching).
- **Typography**: Jost, single committed family, loaded from Google Fonts. Weight contrast (300 thin / 400 regular / 500 medium / 700 bold) carries display-vs-body hierarchy. Chosen 2026-04-24 from a 5-way shootout for its Bauhaus-architectural geometric character, matching the Muji / Uniqlo / Issey Miyake Japanese-minimalism lineage while staying reliable at product-UI sizes (11px to 64px+). All-caps labels use three tracking tokens: `--track-caps-sm` (0.18em), `--track-caps-md` (0.24em), `--track-caps-lg` (0.30em). Body stays highly legible, never all-caps, regular letter-spacing.
- **Typography — documented runner-up**: Cabinet Grotesk (Fontshare, free, editorial grotesque). Scored the matrix winner overall in the shootout (30/30 vs Jost's 25/30) for Italian-editorial alignment (Totême / Auralee / Lemaire / Söhne / Founders Grotesk neighborhood). Jost was chosen first because it reads Japanese-architectural, which tilts slightly more to the minimalist/curator personas than Cabinet Grotesk's editorial-magazine register. If a future redesign pulls Ropero's voice more toward editorial-Milanese than Japanese-architectural, this is the alternative to test. Worth revisiting; not forgotten.
- **Shape**: hard edges. Default radius 0px to 4px; never large pillows. 1.5px borders for precision. Cards are rectangles with a border, not floating rounded panels.
- **Light + dark mode**: both, equally considered. Dark is not an afterthought; the matcha palette has a native dark variant with a green-tinted black and lighter card-on-background hierarchy.
- **References (what we aspire to)**: Totême, Auralee, Issey Miyake, Lemaire. Also the editorial restraint of Aesop's product pages, the architectural precision of Jil Sander, and the Japanese minimalism of Muji-adjacent (but more refined).
- **Anti-references (what we are explicitly not)**:
  - **Stylebook**: cluttered, database-feeling, "check-off" oriented.
  - **Instagram / Pinterest**: social-comparison-driven, image-grid-heavy, engagement-optimized.
  - **Depop / Vinted**: youth-marketplace saturated colors, gamified listings.
  - **Shein / Zara / fast-fashion apps**: urgent, promotional, cart-first, discount-driven.
  - **Notion / productivity apps**: grayscale, workspace-feeling, functional but not aspirational.

### Accessibility

- **Target**: WCAG 2.1 AA across the board. No intentional AAA push for v1, no lower-than-AA compromises.
- **Practical implications**:
  - All text ≥ 4.5:1 contrast against its background. Matcha green `#5A7852` on warm off-white `#EEEFE8` passes; verify per-surface for gold and muted variants.
  - Touch targets ≥ 44×44pt on mobile, ≥ 40×40px on web.
  - Focus states visible and distinct (outline offset + border color change, never color-only).
  - Respect `prefers-reduced-motion` for any animations we add. Default to no-motion if unsure.
  - Color is never the sole signifier: state (active / selected / error) also uses weight, border, or icon.

### Design Principles

Five directives. When a design decision feels ambiguous, these rank it.

1. **Restraint over assertion.** Speak softly. No bright primaries beyond matcha green and ochre gold. No urgency, no gamified hooks, no streak anxiety. When something feels loud, step back.
2. **Let the wardrobe be the hero.** Items are the content; UI chrome supports them. Photos get space, labels stay quiet, navigation recedes when the user is looking at pieces.
3. **Intention over engagement.** Metrics reward thought (cost-per-wear, re-wear rate, favorites actually worn) and never frequency (streaks, DAU, push-open rate). Never shame the user for not opening the app. Never suggest they buy more.
4. **Editorial precision, ergonomic reality.** Hard edges, wide letter-spacing, and all-caps labels give architectural gravitas. Touch targets stay ≥ 44pt and body type stays highly legible. Precision should never fight use. If a design reads beautifully but people can't tap it, it fails.
5. **Token discipline, always.** Every color, radius, font-size, and spacing goes through a named token (`--primary`, `--radius`, `--font-display`, etc.). Never hardcode hex, rem, or specific Tailwind shades in component code. Palette evolution stays a config change, not a refactor. The palette audit in [docs/sessions/2026-04-24-afternoon-hygiene.md](docs/sessions/2026-04-24-afternoon-hygiene.md) captured what "disciplined" looks like here.
