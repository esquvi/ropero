# 2026-04-24 (evening): Design system shaping via /impeccable — palette, type, radius, color posture

Long session landing a big chunk of Ropero's design system onto `main` directly (doc-only, per CLAUDE.md). Ran the Impeccable skill's critique / typeset / layout / colorize passes against `docs/brand/matcha.html`, then encoded every decision in PRODUCT.md + `.github/copilot-instructions.md` so agents in the next session pick up the same rules.

Nothing in `apps/web/app/globals.css` or `packages/ui/src/tokens.ts` has been touched yet. That migration is step 6 and is the clean starting point for the next session.

## Shipped (4 commits on main, unpushed)

- `e39da11` — **/impeccable critique on matcha.html + 8 priority fixes + gold=data rule.** Rewrote the dark band to "own register" (brighter matcha `#9EBF94`, warmer gold `#DCBB6A`, WCAG AA contrast on every text-on-bg pair). Stripped decorative gold from ~11 uses down to semantic only. Killed the kanji "新着" badge (category-reflex tell), dropped the banned side-stripe border on `phone-card`, consolidated letter-spacing into 3 tokens (`--track-caps-sm/md/lg`), added a product-size type-scale ladder section, fixed the `transition: width` violation on footer dots, raised body-text floor to 12px. Adopted systemic rule "gold marks the data" — every number, date, and value renders in gold; labels and chrome stay neutral. ~20 gold uses across both modes, all earned. See the audit comment at the top of `<style>` in `docs/brand/matcha.html` for the full log.
- `3f22a16` — **Typography: Jost locked in, Cabinet Grotesk documented as runner-up.** Ran a 5-way shootout (original PR #61 candidates minus reflex-rejects, plus Fontshare additions): Josefin Sans + DM Sans, Jost, Satoshi, Cabinet Grotesk, Switzer. Scored on register fit, small-size reliability, signature presence, brand-reference alignment (Totême / Auralee / Lemaire), persona fit, AI-slop risk. Cabinet Grotesk won the matrix at 30/30 for Italian-editorial alignment. Jost took second at 25/30 for Japanese-architectural alignment (Muji / Uniqlo / Issey Miyake lineage). User picked Jost for the Japanese-architectural lead; Cabinet Grotesk is logged in PRODUCT.md + the matcha audit comment + copilot-instructions as the alternative to revisit if Ropero's voice ever pulls more editorial-Milanese.
- `ccdedae` — **2-token radius scale: 0 structural / 2px interactive.** Replaced the uniform 0px rule with `--radius-structural: 0px` (cards, dividers, markers, surfaces) and `--radius-interactive: 2px` (buttons, inputs, chips, badges, tags). Principle 4 ("precision should never fight use") encoded as a rule. Applied to `.btn`, `.field input`, `.tag`, `.hero-tag`, `.card-badge`, `.phone-detail-action`. Phone mockup device corners (36px) and notch (100px) unchanged since those simulate physical hardware, not Ropero surfaces.
- `d8ae31f` — **State colors tinted to matcha, color system posture documented.** `--state-error: #A85040` (muted terracotta, warm, ~4.9:1 on warm off-white). `--state-success` = `--accent` (matcha green reused as a semantic alias: a confirmed action is confirmed IN the brand color). `--state-warning` = `--gold-dk` (extends the gold-as-attention rule). Dark-mode equivalents alongside. Added a small "State Feedback" specimen in matcha.html after the tag row. Two systemic decisions documented for the future globals.css migration: OKLCH is canonical in the app's globals.css (shadcn ecosystem default); hex stays in brand docs as the human-readable reference. 3 ramp steps per family (dk / base / lo); hover / focus / disabled use Tailwind opacity modifiers (`/90`, `/50`) or `color-mix()`, not additional ramp tokens.

## Decisions worth remembering

- **Palette locked.** Matcha green `#5A7852`, ochre gold `#A88840`, warm off-white `#EEEFE8`, near-black `#0C0F0A`. Dark is its own register, not an inversion: matcha `#9EBF94`, gold `#DCBB6A`, ground `#0C0F0A`, card `#141A0E`.
- **Typography: Jost.** Single committed family (Google Fonts). Weight contrast 300 / 400 / 500 / 700. Cabinet Grotesk (Fontshare) is the logged runner-up; revisit only if Ropero's voice pulls editorial-Milanese.
- **Radius: 2-token scale.** 0 for structural, 2px for interactive.
- **Letter-spacing: 3-token scale.** `--track-caps-sm` 0.18em / `--track-caps-md` 0.24em / `--track-caps-lg` 0.30em.
- **Gold rule: "Gold marks the data."** One recitable rule, systemic. Numbers, dates, values render in gold across light and dark modes; labels and UI chrome stay neutral. Magazine-folio convention.
- **State colors: tinted-toward-brand, never stock.** Success and warning are semantic aliases of existing accent tokens.
- **Color posture for future migration.** OKLCH in globals.css, hex in brand docs, 3 ramp steps, states via opacity modifiers.
- **Impeccable workflow proven.** Sub-command pipeline (critique → typeset → layout → colorize) works as a structured design-shaping session when run inside superpowers:brainstorming. Each sub-command makes one atomic decision; decisions compound. User feedback ("still lost too much of the gold," "take our time and be smart") was treated as a signal to widen the candidate pool or revise the rule, not to ignore the matrix.

## Process notes and user preferences picked up

- **User values disciplined deliberation over speed.** When offered a 3-font narrow shootout vs a 5-font deep dive, chose the deeper pass. When offered to keep gold at 4 semantic uses, pushed for more presence — which led to the systemic "gold marks the data" rule being discovered as the right level of generalization.
- **User has good AI-slop instincts.** Flagged the hero MAT/CHA gold-half split unprompted as "an obvious AI tell" — correctly, adjacent to the gradient-text ban in impeccable's shared laws.
- **User wants Impeccable to lead, not just respond.** Explicitly asked to leverage the full skill library ("shape and craft and any of the other impeccable skills that could help"). The response was a mapped sequence, not a single command.
- **Pre-commit eyeball on complex design changes.** User asked to see matcha.html in a real browser before committing the split-render or the font swap. The `.claude/launch.json` brand preview server config was added to support this going forward (`python3 -m http.server 7341 --directory docs/brand`).

## Known issues opened/closed

### Opened — [DESIGN-SYSTEM-2026-04-24]

- **`packages/ui/src/tokens.ts` is the legacy blue palette, not matcha.** The shared token file still exports `primary: { 500: '#0c7ee8' }` and neutral grayscale from before the matcha direction was chosen. It is not currently imported anywhere that affects web rendering (web uses `globals.css` directly; mobile uses it), but the drift will bite the moment someone wires it into `apps/web`. Migration to matcha tokens is part of step 6.
- **`/brand-preview` route (PR #61, branch `feat/brand-preview-matcha`) is effectively obsolete.** Its three iteration goals (font pick, radius pick, accent-mode pick) are all resolved. Keep the branch open locally for the archive, but either close the PR or convert it into the actual migration PR when step 6 starts. The route files themselves aren't on `main` yet, only on the branch.

### Closed — nothing this session.

## Next session starting points

- **Step 5: `/impeccable shape` on the wardrobe grid first.** Wardrobe is the most-trafficked screen and the one the mood board has most-modeled (phone mockup: 4 wardrobe cards). Shape pass defines the UX architecture: sort / filter affordances, grid density, card hover treatment, empty state, loading state, favorite-toggle interaction. Then outfit detail, trip packer, and home in subsequent shape passes.
- **Step 6: `/impeccable craft`** starts the actual code migration:
  - Convert matcha.html hex tokens to OKLCH in `apps/web/app/globals.css`, replacing the stock shadcn grayscale.
  - Rewrite `packages/ui/src/tokens.ts` to the matcha palette (currently legacy blue — see DESIGN-SYSTEM-2026-04-24).
  - Swap the `next/font` imports to Jost.
  - Apply the `--radius-structural` / `--radius-interactive` pattern to shadcn primitives.
  - Retire `/brand-preview` (PR #61) in the same PR as the migration.
  - Regular feature branch + PR (code change, not doc-only).
- **Step 7: `/impeccable document`** writes DESIGN.md + DESIGN.json from the landed system. Stitch schema. This is the final codification.
- **Preview server config already in place.** `.claude/launch.json` has the `brand` server entry (python3 http.server on port 7341 serving `docs/brand/`). Next session can start it with `node .claude/skills/impeccable/scripts/load-context.mjs && <preview_start tool> brand`.
- **`feat/brand-preview-matcha` branch still exists.** Decide whether to close PR #61 or convert it into the step-6 migration PR.

## Artifacts

- Canonical design context: `PRODUCT.md` at repo root. Mirrored in `.github/copilot-instructions.md` — keep them in sync when either changes.
- Brand mood board: `docs/brand/matcha.html` — encodes every decision made this session as working HTML/CSS, with an extensive audit comment at the top of `<style>`.
- Brand preview server config: `.claude/launch.json`, entry `brand`, port 7341.
- 24 other HTML design guides in `docs/brand/` — historical record; matcha won.
