# Ropero — Design System

The reference for what's actually in the code. Tokens, class strings, component patterns, file paths.

For *why* the system is shaped this way (personas, principles, brand voice), read [PRODUCT.md](PRODUCT.md). For the systemic rules a reviewer should enforce on every PR, read the **Design system rules** section of [CLAUDE.md](CLAUDE.md). For the visual mood board (light + dark side-by-side, hex values), open [docs/brand/matcha.html](docs/brand/matcha.html) in a browser.

This doc is updated when the system changes, not when a screen does. If you find yourself documenting a one-off variation, write a comment in the component instead.

## Where things live

| Concern | File |
| --- | --- |
| OKLCH tokens, dark mode, Tailwind theme bridge | [`apps/web/app/globals.css`](apps/web/app/globals.css) |
| Hex reference + mobile (RN) tokens | [`packages/ui/src/tokens.ts`](packages/ui/src/tokens.ts) |
| Brand mood board (visual reference) | [`docs/brand/matcha.html`](docs/brand/matcha.html) |
| Font load (Jost via `next/font`) | [`apps/web/app/layout.tsx`](apps/web/app/layout.tsx) |
| shadcn primitives (do not edit for app logic) | [`apps/web/components/ui/`](apps/web/components/ui/) |
| Canonical surface (item card, filters, masthead) | [`apps/web/components/wardrobe/`](apps/web/components/wardrobe/) |
| Dark-mode toggle wiring | `next-themes` `ThemeProvider` in root layout |

The web app is the canonical surface for system decisions. Mobile (`apps/mobile`) consumes the hex reference from `@ropero/ui` and rebuilds the same vocabulary with React Native primitives. When the two diverge, the web wins and mobile catches up.

## Color tokens

OKLCH is the canonical storage format (shadcn ecosystem default and what the browser actually sees). Hex in `packages/ui/src/tokens.ts` and `docs/brand/matcha.html` is the human-readable cross-reference. Both representations agree on the same color.

### Light register

Warm off-white ground with a faint green undertone. Matcha green is structure; gold is data.

| Token | Hex | OKLCH | Used for |
| --- | --- | --- | --- |
| `--background` | `#EEEFE8` | `oklch(0.949 0.009 113.2)` | Page ground |
| `--foreground` | `#1A1E14` | `oklch(0.227 0.020 125.6)` | Primary text |
| `--card` | `#F6F7F2` | `oklch(0.974 0.007 115.7)` | Card / popover surfaces |
| `--primary` | `#5A7852` | `oklch(0.539 0.067 139.2)` | Matcha. Buttons, focus rings, hover borders |
| `--secondary` / `--muted` | `#E0E2D6` | `oklch(0.908 0.016 114.4)` | Inert surfaces |
| `--accent` | `#CDD0C0` | `oklch(0.851 0.022 115.5)` | Hover/active surface step |
| `--border` / `--input` | `#B0B89C` | `oklch(0.769 0.040 120.3)` | 1.5px borders |
| `--destructive` | `#A85040` | `oklch(0.538 0.120 31.8)` | Error (muted terracotta) |
| `--text-mid` | `#3C5030` | `oklch(0.405 0.057 134.4)` | Secondary text on warm ground |
| `--text-dim` | `#88926C` | `oklch(0.642 0.055 120.0)` | Tertiary / disabled text |
| `--gold` | `#A88840` | `oklch(0.642 0.099 85.3)` | **Data.** All numbers, prices, dates, counts |
| `--gold-dk` | `#7C6428` | `oklch(0.515 0.084 87.1)` | Warning, deeper gold accents |
| `--gold-lo` | `#E8D8A0` | `oklch(0.882 0.075 94.0)` | Faint gold tint (rare) |
| `--accent-dk` | `#3E5838` | `oklch(0.430 0.060 139.8)` | Deeper matcha step |
| `--accent-lo` | `#C8D8BC` | `oklch(0.863 0.042 131.7)` | Lighter matcha tint |
| `--success` | (= `--primary`) | matcha | Confirmed action — confirmed in brand color |
| `--warning` | (= `--gold-dk`) | gold-dk | Extends gold-as-attention |

### Dark register

Not an inversion. Brighter matcha, warmer gold, `#141A0E` lit-from-within cards on a `#0C0F0A` ground.

| Token | Hex | OKLCH |
| --- | --- | --- |
| `--background` | `#0C0F0A` | `oklch(0.163 0.011 132.9)` |
| `--foreground` | `#E4E8DC` | `oklch(0.925 0.017 121.8)` |
| `--card` | `#141A0E` | `oklch(0.207 0.024 129.9)` |
| `--primary` | `#9EBF94` | `oklch(0.769 0.070 138.5)` |
| `--border` | `#2A3020` | `oklch(0.298 0.029 124.8)` |
| `--destructive` | `#D08070` | `oklch(0.681 0.103 32.0)` |
| `--gold` | `#DCBB6A` | `oklch(0.804 0.107 87.8)` |
| `--text-mid` | `#8A9C80` | `oklch(0.671 0.045 134.4)` |
| `--text-dim` | `#7A8870` | `oklch(0.608 0.039 132.3)` |

The full dark ramp lives in `globals.css` under `.dark`. Run both modes when verifying any new surface — `next-themes` toggles via the `class` attribute on `<html>`.

### Ramp posture

Three steps per family (`-dk` / base / `-lo`). Hover, focus, and disabled states use opacity modifiers (`bg-primary/90`, `text-foreground/55`) or `color-mix()`, not extra ramp tokens. Keeps the surface area memorable.

## Typography

Single committed family: **Jost**, loaded via `next/font/google` in `apps/web/app/layout.tsx` with weights 300 / 400 / 500 / 700. Exposed as `var(--font-jost)`, mapped to Tailwind's `--font-sans` in `globals.css`.

Hierarchy is carried by **weight contrast**, not multiple families. Display (`font-light`, 300) for editorial mastheads, body (`font-normal`, 400), medium (`font-medium`, 500) for buttons and labels, bold (`font-bold`, 700) reserved.

### All-caps tracking scale

ALL-CAPS labels (sort/filter chrome, eyebrows, segmented controls) get one of three tracking tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--tracking-caps-sm` | `0.18em` | Inline chrome (sort label, segmented control buttons, filter pills) |
| `--tracking-caps-md` | `0.24em` | Section eyebrows (filter panel legends) |
| `--tracking-caps-lg` | `0.30em` | Hero / display eyebrows |

Inline use: `style={{ letterSpacing: 'var(--tracking-caps-sm)' }}` *or* the Tailwind utility `tracking-[0.18em]` (both used in the wardrobe; either is fine — the CSS-var form is preferred when the value is also referenced elsewhere).

### Font sizes

The wardrobe ships micro sizes deliberately (`text-[10px]`, `text-[11px]`, `text-[13px]`) for the editorial register. Use Tailwind's standard scale (`text-xs`, `text-sm`, `text-base`) when you don't need that surgical control. Body text never goes below 11px in metadata roles or 12px in primary roles, per WCAG legibility.

`tabular-nums` is mandatory wherever numbers might change in place (counts, prices, durations) so the layout doesn't jitter.

## Radius

Two tokens, no third option:

| Token | Value | Use |
| --- | --- | --- |
| `--radius-structural` | `0px` | Cards, dividers, surfaces, semantic markers |
| `--radius-interactive` | `2px` | Buttons, inputs, chips, badges, tags, pills |

Tailwind named radii are remapped in `globals.css` `@theme inline` so existing shadcn primitives pick up the system without hand-overrides:

```
--radius-sm: 2px
--radius-md: 2px        /* shadcn default — buttons get this */
--radius-lg: 2px
--radius-xl: 0px        /* shadcn default — cards get this */
--radius-2xl: 0px
--radius-3xl: 0px
--radius-4xl: 0px
```

So `rounded-md` reads as 2px and `rounded-xl` reads as 0px without any per-component override. **Never** use `rounded-full` (except for circular avatars), `rounded-2xl`/`-3xl`, or hand-set `border-radius`. If you need a third radius, the system is wrong; surface it before adding a token.

## Borders

- **Width: 1.5px** for precision (`border-[1.5px]`) on cards and primary surfaces. shadcn's default 1px is fine on small chrome (filters, pills, segmented controls).
- **Color at rest: `border-border`** (neutral warm-stone).
- **Hover on interactive surfaces: `hover:border-primary`** (matcha shift). No shadow, no scale, no movement.
- **Focus: `focus-visible:border-primary`** for the same surface; shadcn primitives use the focus-ring mechanism (`ring-ring/50 ring-[3px]`).

The hover discipline is structural: precision is the affordance, not motion.

## The gold rule (systemic)

This is the single load-bearing visual rule. **Every numeric value rendered to the user goes in `text-gold` with `tabular-nums`. The unit travels with the number — `8 pieces`, `24×`, `$3,815`, `In 3 days` are each one gold expression, never a two-color split.**

What counts as data: counts, prices, wear counts, dates and durations on the primary stat axis, scores, percentages, IDs surfaced to the user.

What stays neutral: labels, headings, item names, brand names, body copy, button text, navigation, breadcrumbs, occasion names, all-caps eyebrows.

The named exception: **separate label + badge** patterns (e.g., a `Filters` button with a small `2` count badge). The label is chrome, the badge is data, and the two-color split is correct because they're conceptually distinct elements. See `item-filters.tsx:135-157` for the canonical example.

For the muted "zero" case (`0×` wear count on a never-worn piece), use `text-gold/55`.

Full rationale, persona context, and the reviewer checklist live in PRODUCT.md and CLAUDE.md. This doc just states the implementation: `text-gold tabular-nums`.

## State colors

| State | Token | Color | Note |
| --- | --- | --- | --- |
| Error | `--destructive` | muted terracotta | Warm, earthy. Echoes matcha. Never `red-500` |
| Success | `--success` (= `--primary`) | matcha | A confirmed action confirmed *in* the brand color |
| Warning | `--warning` (= `--gold-dk`) | deeper gold | Extends gold-as-attention |

Never use raw web-default Tailwind palette colors (`red-500`, `yellow-500`, `green-500`). If you reach for one, the token is missing.

## Component patterns

Canonical implementations from PR #68. When building a new surface, mimic the closest existing pattern before improvising.

### Editorial masthead

Page title in `font-light` 300 with subtle letter-spacing, count rendered in gold immediately below. Border-bottom on `border-border` separates from the action chrome.

```tsx
<header className="flex items-end justify-between gap-4 border-b border-border pb-5">
  <div>
    <h1 className="text-3xl font-light leading-none text-foreground"
        style={{ letterSpacing: '0.04em' }}>
      Wardrobe
    </h1>
    <p className="mt-2 text-xs text-gold tabular-nums">
      {total} {total === 1 ? 'piece' : 'pieces'}
    </p>
  </div>
  <Link href="/wardrobe/add">
    <Button><Plus className="size-4" />Add a piece</Button>
  </Link>
</header>
```

Reference: [`wardrobe/page.tsx:113-131`](apps/web/app/(app)/wardrobe/page.tsx).

### Hard-edge item card

`<article>` wrapper, `<Link>` for the card body, sibling button (e.g., the signature toggle) for in-card actions to avoid nested-anchor semantics. `border-[1.5px]` shifts to `border-primary` on group hover. No shadow, no scale, no transform.

```tsx
<article className="group relative">
  <Link className={cn(
    'block border-[1.5px] border-border bg-card transition-colors',
    'group-hover:border-primary focus-visible:outline-none focus-visible:border-primary',
  )}>
    {/* photo, name, brand, gold metric */}
  </Link>
  <SignatureToggle ... />     {/* sibling, not descendant */}
</article>
```

Reference: [`components/wardrobe/item-card.tsx:33-127`](apps/web/components/wardrobe/item-card.tsx).

### Color swatch on photo

Hard-edge square (no border-radius), `ring-1 ring-card/95` for tinted separation from any background image. Sized `size-3` regular, `size-2` compact.

### Archive status pill on photo

Bottom-right of the photo cell when `status !== 'active'`. ALL-CAPS 9px with `--tracking-caps-sm`, on `bg-card/90` for legibility over arbitrary photos.

### Inline chrome row (sort + filters + search + density + status)

All controls share `h-9`, `border border-border bg-card`, and the chrome pattern: ALL-CAPS 10px label in `text-foreground/55` at rest, popping to `text-foreground` on hover. Open/active state carried by `border-primary` (matcha), not by darkening text.

```tsx
className={cn(
  'inline-flex h-9 items-center gap-2 border border-border bg-card px-3',
  'uppercase text-[10px] font-medium tracking-[0.18em]',
  'text-foreground/55 transition-colors hover:border-primary hover:text-foreground',
  open && 'border-primary',
)}
```

Reference: [`components/wardrobe/item-filters.tsx:118-279`](apps/web/components/wardrobe/item-filters.tsx).

### Segmented control (e.g., Active/Archive)

`inline-grid grid-cols-2` on the parent so unequal-length labels share the wider column. Active button: `bg-primary text-primary-foreground`. Inactive: `text-text-dim hover:text-foreground`.

### Filter pill (active filter chip)

`border border-border bg-card px-2 py-0.5 text-[11px]` with an X button that's `text-text-dim hover:text-foreground`. See `FilterPill` in `item-filters.tsx`.

### In-card toggle (signature star)

Sibling of the link, not nested. Uses `useOptimistic` for instant visual feedback before the server action resolves, so the gold flips on click and isn't lagged by `revalidatePath`. Click handler calls both `e.preventDefault()` and `e.stopPropagation()` to keep the underlying card link from firing.

Reference: [`components/wardrobe/signature-toggle.tsx`](apps/web/components/wardrobe/signature-toggle.tsx).

### Stat card (dashboard pattern)

shadcn `<Card>` shell, value in `text-2xl font-bold tabular-nums text-gold`, label in `text-sm font-medium`, description in `text-xs text-muted-foreground`. The value follows the gold rule.

Reference: [`components/dashboard/stat-card.tsx`](apps/web/components/dashboard/stat-card.tsx).

### Empty states

Centered `flex flex-col`, `py-20` to `py-24`, primary message in `text-sm text-foreground`, secondary hint in `text-xs text-text-dim`, single CTA button if the action is obvious. Four distinct variants in `wardrobe/page.tsx`: query-no-match, filters-no-match, archive-empty, wardrobe-empty.

### Inline error block

Border + faint tint of `--destructive`, retry control inline. The retry is a tiny client component (`retry-button.tsx`) that calls `router.refresh()`.

```tsx
<div className="border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
  Couldn't load your wardrobe. <RetryButton />
</div>
```

## Vocabulary

Per PRODUCT.md brand voice. Use these words; avoid the alternatives.

| Use | Don't use |
| --- | --- |
| piece | item, product |
| Add a piece | Add Item, Add to wardrobe |
| wear, worn, wears | use, used |
| signature | favorite, starred |
| curated, considered | trending, popular, featured |
| archive | delete, remove (when piece is kept) |
| pack | add to bag, save for trip |

The wardrobe surface is the most-vocabulary-conformant. Adjacent surfaces (outfits, trips, dashboard, profile) get fixed during their own shape passes. If you're touching copy on a non-wardrobe surface, use this table as a forcing function but don't redesign the surface mid-fix.

## Adding a new surface

The recipe used for the wardrobe (PR #68) and the dashboard hand-paint:

1. **Read PRODUCT.md** for personas + principles. The five Design Principles are the tiebreakers.
2. **Read this doc + CLAUDE.md "Design system rules"** for the systemic enforcement summary.
3. **Pull realistic test data** before iterating. An empty surface or a single mock row hides design problems. The wardrobe iteration loop only worked because there were 10 varied real-feeling pieces in the DB.
4. **Use shadcn primitives** (`Button`, `Card`, `Select`, `Checkbox`, `Label`, etc.). Don't reach for raw `<button>` or `<input>`.
5. **Apply the gold rule on first pass.** Every digit-containing element gets `text-gold tabular-nums`, with the unit traveling with the number. If a number stays neutral, leave an inline comment explaining why.
6. **Hard-edge cards, 2px chips/buttons.** Never `rounded-full` (except avatars), never `rounded-xl` for soft pillows.
7. **Borders shift to matcha on hover.** No shadow, no scale, no movement.
8. **Verify in both light and dark.** Toggle via the theme switcher; the dark register is its own composition.
9. **Verify with VoiceOver / keyboard.** All interactive elements need labels and visible focus.
10. **Hand-apply the gold rule to adjacent surfaces** if they'd otherwise read as gold-empty (Principle: gold rule is systemic, not per-screen).

## Verification & audit

### Gold rule audit

Scan every `<p|span|div>` in the diff that contains a digit. Each one is either:
- `text-gold tabular-nums` (correct), or
- a deliberate exception with an inline comment, or
- a violation.

There is no fourth option. The reviewer hint in PRODUCT.md formalizes this for PRs.

### Contrast audit

WCAG 2.1 AA, 4.5:1 minimum for body text. The matcha + warm-off-white combination passes; verify per-surface for gold-on-card and muted variants. Use the Chrome devtools color picker — the OKLCH values display the contrast ratio directly.

### Touch targets

44×44pt mobile, 40×40px web. Most chrome in the wardrobe is `h-9 w-9` (36px), which is below the web threshold; this is on the deferred polish list ([SHAPE-WARDROBE-2026-04-29]). For new surfaces, default to `h-10` minimum on touch-relevant icon buttons.

### Browser preview

The wardrobe was iterated on the Vercel preview deployment with realistic data. For new surface work, that's the canonical verification surface — local dev hits stub Supabase env, preview hits a real instance with real RLS. See the 2026-04-29 evening session log for the full iteration playbook.

## Explicit deviations from shadcn defaults

Documented so the next person doesn't "fix" them:

- **`rounded-md`, `rounded-lg`, `rounded-sm` all map to 2px.** shadcn's default scales away from 2px at higher sizes; we collapsed them all to the interactive token.
- **`rounded-xl` and up map to 0px.** shadcn cards default to `rounded-xl` (12px); we use them as hard-edge surfaces.
- **No box-shadows on cards.** shadcn ships `shadow-sm` defaults; we strip them at the surface level.
- **Border width 1.5px on primary cards.** shadcn defaults to 1px; we override on the wardrobe item card.
- **Native WebKit search clear button suppressed** in `globals.css` `@layer base` so our custom X is the only one rendered.

## What this doc is not

- **Not the brand brief.** That's PRODUCT.md.
- **Not the systemic-rule cheatsheet for reviewers.** That's CLAUDE.md "Design system rules".
- **Not a screen-by-screen design log.** Surface-specific decisions live in `docs/plans/<date>-<surface>-shape.md` per the Impeccable workflow.
- **Not the visual reference.** That's `docs/brand/matcha.html` — open it in a browser.

## Source provenance

- **Palette + brand**: chosen 2026-04-24 evening from a five-mood-board shootout. See [`docs/sessions/2026-04-24-evening-design-system.md`](docs/sessions/2026-04-24-evening-design-system.md).
- **Tokens migrated to code**: PR #68, 2026-04-29. See [`docs/sessions/2026-04-29-evening-sdk55-and-wardrobe-craft.md`](docs/sessions/2026-04-29-evening-sdk55-and-wardrobe-craft.md).
- **Wardrobe shape brief**: [`docs/plans/2026-04-29-wardrobe-shape.md`](docs/plans/2026-04-29-wardrobe-shape.md).
- **Gold rule refinement (unit-travels-with-number, dashboard universality)**: PR #68 iteration, same evening. Documented in PRODUCT.md, CLAUDE.md, `.github/copilot-instructions.md`, `globals.css`, `tokens.ts` simultaneously.
