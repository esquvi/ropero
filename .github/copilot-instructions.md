# Copilot Instructions — Ropero

Ropero is a wardrobe management app (Next.js 16 + shadcn/ui web, Expo + React Native mobile, Supabase backend). Single-developer project, friends-and-family beta.

**Read these before generating suggestions:**
- `CLAUDE.md` at repo root for workflow, code style, testing, and deployment conventions.
- `PRODUCT.md` at repo root for the canonical Design Context (this file mirrors the Design Context section below; keep them in sync).
- `KNOWN-ISSUES.md` for rough edges and tech debt we're aware of.

## Code conventions (load-bearing)

- TypeScript strict everywhere. Zod for validation (shared in `packages/core`). Import types from `@ropero/core`; never redefine data types in app code.
- Web components compose shadcn/ui primitives in `apps/web/components/ui/`. Do not modify the shadcn primitives directly for app logic — build on top in `apps/web/components/`.
- Use the `cn()` helper from `@/lib/utils` for conditional Tailwind classes.
- Never hardcode color literals in component code (no `bg-[#...]`, no `text-zinc-400`, no `color: '#111'` in RN StyleSheet). Always go through tokens (`bg-primary`, `text-foreground`, or the `packages/ui` tokens for mobile). See design principle 5 below.
- Every table needs RLS policies (`user_id = auth.uid()`). Never add a Supabase table without them.
- No em-dashes (—) in PR descriptions, commit messages, or prose. Use periods, commas, colons, semicolons, or parentheses.

## Design Context

This section mirrors `PRODUCT.md`. If one is updated, update both.

### Users

Four equally-weighted personas. None dominates.

- **The intentional minimalist** — owns less, cares about each piece, plans the week deliberately.
- **The curator** — owns more with discernment, treats Ropero as an inventory-of-meaning.
- **The re-wearer** — wants to stop buying new; uses Ropero to rediscover what's already in the closet.
- **The packer** — travels often, builds capsule trips without forgetting pieces.

Shared across all four: design-conscious, quality-over-quantity, treats the wardrobe as considered rather than consumed.

### Brand Personality

- **Three words**: Intentional. Considered. Quiet.
- **Voice**: reflective, not instructional. The app is a mirror, not a coach.
- **Vocabulary**: use *curated, considered, piece, wear, worn*. Avoid *item, product, add to cart, favorite, trending*.
- **Emotional goal**: mild pleasure, like opening a well-organized drawer. Never urgency, never FOMO.

### Aesthetic Direction

- **Theme**: Japanese minimalism meets Milanese detail. Restrained, architectural, quietly confident. Editorial, not promotional.
- **Palette**: Matcha. Primary accent matcha green `#5A7852`, secondary ochre gold `#A88840`, warm off-white bg `#EEEFE8`, near-black dark `#0C0F0A`. Dual-accent vs green-only still under iteration (see PR #61 / `/brand-preview`).
- **Typography**: geometric sans for display, DM Sans for body. Display font still under iteration. All-caps labels with wide letter-spacing (≥0.18em) for editorial labels; body stays regular-case and highly legible.
- **Shape**: hard edges. Default radius 0px to 4px; never large pillow corners. 1.5px borders for precision.
- **Light and dark mode**: both equally considered. Dark is not an afterthought.
- **References**: Totême, Auralee, Issey Miyake, Lemaire. Aesop for restraint, Jil Sander for architectural precision.
- **Anti-references** (do not emulate): Stylebook, Instagram, Pinterest, Depop, Vinted, Shein, Zara, Notion-style productivity apps.

### Accessibility

- **Target**: WCAG 2.1 AA.
- Text contrast ≥4.5:1 against its background.
- Touch targets ≥44×44pt on mobile, ≥40×40px on web.
- Focus states visible and distinct (outline offset + border color change, never color-only).
- Respect `prefers-reduced-motion`.
- Color is never the sole state signifier — pair with weight, border, or icon.

### Design Principles

When a design decision feels ambiguous, these rank it.

1. **Restraint over assertion.** Speak softly. No bright primaries beyond matcha green and ochre gold, no urgency copy, no gamified hooks, no streak anxiety. When something feels loud, step back.
2. **Let the wardrobe be the hero.** Items are the content; UI chrome supports them. Photos get space, labels stay quiet, navigation recedes when the user is looking at pieces.
3. **Intention over engagement.** Metrics reward thought (cost-per-wear, re-wear rate, favorites actually worn) and never frequency (streaks, DAU, push-open rate). Never shame the user for not opening the app. Never suggest they buy more.
4. **Editorial precision, ergonomic reality.** Hard edges, wide letter-spacing, and all-caps labels give architectural gravitas. Touch targets stay ≥44pt and body type stays highly legible. Precision should never fight use.
5. **Token discipline, always.** Every color, radius, font-size, and spacing goes through a named token (`--primary`, `--radius`, `--font-display`, tokens in `packages/ui`). Never hardcode hex, rem, or specific Tailwind shades in component code. Palette evolution stays a config change, not a refactor.

## When suggesting code

- **UI components**: compose shadcn primitives, use semantic tokens (`bg-primary`, not `bg-green-600`), respect the four design principles above. Microcopy should match the brand voice — declarative and quiet, not exclamation-pointed.
- **Data / business logic**: shared types and validators belong in `packages/core`. Server actions for mutations in Next.js; Supabase client SDK directly (no custom API server).
- **Database changes**: always include RLS policies. Migrations live in `supabase/migrations/`.
- **Tests**: unit tests for `packages/core` (Vitest), E2E for user-facing web features (Playwright), RLS integration tests for any new policy.
- **Error handling**: never silently swallow errors. Always destructure `error` from Supabase calls and surface it. No empty catch blocks.
