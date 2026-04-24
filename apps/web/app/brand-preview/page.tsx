'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Shirt,
  Layers,
  Plane,
  TrendingUp,
  Sun,
  Moon,
  Plus,
  Star,
  Heart,
  Search,
} from 'lucide-react';

const FONTS = [
  {
    id: 'josefin-sans',
    label: 'Josefin Sans',
    family: "'Josefin Sans', Arial, sans-serif",
    note: 'Matcha default. Geometric with long ascenders, vintage-fashion undertone.',
  },
  {
    id: 'manrope',
    label: 'Manrope',
    family: "'Manrope', system-ui, sans-serif",
    note: 'Modern geometric, neutral and clean. Less era-specific.',
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: "'Space Grotesk', system-ui, sans-serif",
    note: 'Contemporary grotesque. Swiss confidence, tighter than Josefin.',
  },
  {
    id: 'jost',
    label: 'Jost',
    family: "'Jost', system-ui, sans-serif",
    note: 'Futura-inspired Bauhaus geometry. Pure geometric shapes.',
  },
  {
    id: 'inter',
    label: 'Inter',
    family: "'Inter', system-ui, sans-serif",
    note: 'Neutral baseline. Safest, reads "app" rather than "brand".',
  },
  {
    id: 'dm-sans',
    label: 'DM Sans (unified)',
    family: "'DM Sans', system-ui, sans-serif",
    note: 'Unified display + body from same family. Most coherent, least distinctive.',
  },
] as const;

const RADII = [
  { id: '0', label: '0px', value: '0px', note: 'Matcha default. Architectural, editorial, clinical.' },
  { id: '2', label: '2px', value: '2px', note: 'Barely-there softening. Keeps precision.' },
  { id: '4', label: '4px', value: '4px', note: 'Friendly without losing "designed" feel.' },
  { id: '8', label: '8px', value: '8px', note: 'Conventional app-like. Least editorial.' },
] as const;

type FontId = (typeof FONTS)[number]['id'];
type RadiusId = (typeof RADII)[number]['id'];
type AccentMode = 'dual' | 'green-only';

export default function BrandPreviewPage() {
  const [fontId, setFontId] = useState<FontId>('josefin-sans');
  const [radiusId, setRadiusId] = useState<RadiusId>('0');
  const [accentMode, setAccentMode] = useState<AccentMode>('dual');
  const [isDark, setIsDark] = useState(false);

  const activeFont = FONTS.find((f) => f.id === fontId)!;
  const activeRadius = RADII.find((r) => r.id === radiusId)!;

  return (
    <>
      <style>{styles}</style>
      <div
        className={isDark ? 'bp-root bp-dark' : 'bp-root'}
        data-accent={accentMode}
        style={{
          fontFamily: activeFont.family,
          // Expose selected radius as a CSS var so components downstream pick it up.
          ['--bp-radius' as string]: activeRadius.value,
        }}
      >
        {/* ──────────── Sticky switcher ──────────── */}
        <div className="bp-switcher">
          <div className="bp-switcher-inner">
            <div className="bp-switcher-group">
              <span className="bp-switcher-label">Font</span>
              <div className="bp-chip-row">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontId(f.id)}
                    className={fontId === f.id ? 'bp-chip bp-chip-active' : 'bp-chip'}
                    style={{ fontFamily: f.family }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bp-switcher-group">
              <span className="bp-switcher-label">Radius</span>
              <div className="bp-chip-row">
                {RADII.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRadiusId(r.id)}
                    className={radiusId === r.id ? 'bp-chip bp-chip-active' : 'bp-chip'}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bp-switcher-group">
              <span className="bp-switcher-label">Accent</span>
              <div className="bp-chip-row">
                <button
                  onClick={() => setAccentMode('dual')}
                  className={accentMode === 'dual' ? 'bp-chip bp-chip-active' : 'bp-chip'}
                >
                  Green + Gold
                </button>
                <button
                  onClick={() => setAccentMode('green-only')}
                  className={accentMode === 'green-only' ? 'bp-chip bp-chip-active' : 'bp-chip'}
                >
                  Green only
                </button>
              </div>
            </div>

            <div className="bp-switcher-group">
              <button
                onClick={() => setIsDark(!isDark)}
                className="bp-chip bp-chip-mode"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          <div className="bp-switcher-note">
            <strong>{activeFont.label}:</strong> {activeFont.note} &nbsp;·&nbsp;
            <strong>Radius {activeRadius.label}:</strong> {activeRadius.note}
          </div>
        </div>

        {/* ──────────── Hero wordmark ──────────── */}
        <section className="bp-section bp-hero">
          <p className="bp-eyebrow">Ropero · Brand preview · Matcha</p>
          <div className="bp-hero-split">
            <div>
              <h1 className="bp-hero-title">
                ROP<em>ERO</em>
              </h1>
              <p className="bp-hero-desc">
                Two accents, one harmony. Matcha green anchors the structure while ochre gold catches the light.
                This preview lets you swap the display font and shape radius without committing.
                Pick a direction, then we wire it into globals.css.
              </p>
              <div className="bp-hero-tags">
                <span className="bp-tag bp-tag-green">Matcha palette</span>
                <span className="bp-tag bp-tag-gold">{accentMode === 'dual' ? 'Dual accent' : 'Green only'}</span>
                <span className="bp-tag bp-tag-outline">{activeFont.label}</span>
                <span className="bp-tag bp-tag-outline">Radius {activeRadius.label}</span>
              </div>
            </div>
            <div>
              <p className="bp-refs-label">References</p>
              <span className="bp-ref bp-ref-primary">Totême</span>
              <span className="bp-ref">Auralee</span>
              <span className="bp-ref">Issey Miyake</span>
              <span className="bp-ref">Lemaire</span>
            </div>
          </div>
        </section>

        {/* ──────────── Type specimen ──────────── */}
        <section className="bp-section">
          <p className="bp-section-label">Typography</p>
          <div className="bp-type-grid">
            <div className="bp-type-block">
              <p className="bp-type-block-label">Display · Light 300</p>
              <p className="bp-type-display-light">WARD</p>
              <p className="bp-type-block-label">Display · Bold 700</p>
              <p className="bp-type-display-bold">ROBE</p>
              <p className="bp-type-detail">Aa Bb Cc · 300 · 600 · 700</p>
            </div>
            <div className="bp-type-block">
              <p className="bp-type-block-label">Body · DM Sans</p>
              <p className="bp-type-body">
                A well-curated wardrobe is less about quantity and more about intention.
                Each piece carries its own weight — texture, memory, occasion.
                The app quietly tracks what you wear, when, and where, so the gaps and the favourites become visible over time.
              </p>
              <p className="bp-type-caption">Muted caption · 42 pieces · 12 outfits logged this month</p>
            </div>
          </div>
        </section>

        {/* ──────────── Sidebar + cards ──────────── */}
        <section className="bp-section">
          <p className="bp-section-label">Navigation + dashboard</p>
          <div className="bp-dashboard">
            <aside className="bp-sidebar">
              <div className="bp-sidebar-brand">ROPERO</div>
              <nav>
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', active: true },
                  { icon: Shirt, label: 'Wardrobe' },
                  { icon: Layers, label: 'Outfits' },
                  { icon: Plane, label: 'Trips' },
                  { icon: TrendingUp, label: 'Insights' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={item.active ? 'bp-nav-item bp-nav-item-active' : 'bp-nav-item'}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </div>
                ))}
              </nav>
            </aside>
            <div className="bp-dashboard-main">
              <div className="bp-stat-row">
                {[
                  { label: 'Pieces', value: '47', sub: '42 active · 5 archived' },
                  { label: 'Outfits', value: '12', sub: 'Saved combinations' },
                  { label: 'Trips', value: '2', sub: 'Upcoming' },
                  { label: 'Wardrobe Value', value: '$3,240', sub: '+$140 this month', gold: true },
                ].map((s) => (
                  <div key={s.label} className={s.gold && accentMode === 'dual' ? 'bp-stat bp-stat-gold' : 'bp-stat'}>
                    <p className="bp-stat-label">{s.label}</p>
                    <p className="bp-stat-value">{s.value}</p>
                    <p className="bp-stat-sub">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="bp-card-row">
                {[
                  { name: 'Linen Overcoat', category: 'Outerwear', meta: 'Worn 4× · Last Thu', special: false, num: '01' },
                  { name: 'Silk Haori', category: 'Special', meta: 'Worn 2× · Last Fri', special: true, num: '02' },
                  { name: 'Wide Trousers', category: 'Bottoms', meta: 'Worn 8× · Yesterday', special: false, num: '03' },
                ].map((item) => {
                  const useGold = item.special && accentMode === 'dual';
                  return (
                    <div key={item.name} className={useGold ? 'bp-card bp-card-gold' : 'bp-card'}>
                      <div className="bp-card-img">
                        <span className="bp-card-img-label">{item.num}</span>
                        {item.special && <span className="bp-card-badge">{accentMode === 'dual' ? 'Special' : '★'}</span>}
                      </div>
                      <div className="bp-card-body">
                        <p className="bp-card-category">{item.category}</p>
                        <p className="bp-card-title">{item.name}</p>
                        <p className="bp-card-meta">{item.meta}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── Buttons + inputs + badges ──────────── */}
        <section className="bp-section">
          <p className="bp-section-label">Actions &amp; forms</p>
          <div className="bp-buttons">
            <button className="bp-btn bp-btn-primary">Add to Wardrobe</button>
            {accentMode === 'dual' && (
              <button className="bp-btn bp-btn-gold">Mark Special</button>
            )}
            <button className="bp-btn bp-btn-secondary">Log Outfit</button>
            <button className="bp-btn bp-btn-ghost">Browse</button>
            <button className="bp-btn bp-btn-primary bp-btn-icon">
              <Plus size={13} /> Add Piece
            </button>
          </div>

          <div className="bp-form-row">
            <div className="bp-field">
              <label>Item Name</label>
              <input type="text" defaultValue="" placeholder="e.g. Linen Overcoat" />
            </div>
            <div className="bp-field">
              <label>Category</label>
              <input type="text" defaultValue="Outerwear" />
            </div>
            <div className="bp-field bp-field-grow">
              <label>Search</label>
              <div className="bp-search">
                <Search size={14} />
                <input type="text" defaultValue="" placeholder="Linen, silk, jersey…" />
              </div>
            </div>
          </div>

          <div className="bp-tag-row">
            <span className="bp-tag bp-tag-green">Minimal</span>
            {accentMode === 'dual' && <span className="bp-tag bp-tag-gold">Special</span>}
            <span className="bp-tag bp-tag-outline">Linen</span>
            <span className="bp-tag bp-tag-outline">Silk</span>
            <span className="bp-tag bp-tag-neutral">Neutral</span>
            <span className="bp-tag bp-tag-green"><Star size={10} /> Favorite</span>
            <span className="bp-tag bp-tag-outline"><Heart size={10} /> Loved</span>
          </div>
        </section>

        {/* ──────────── Phone preview ──────────── */}
        <section className="bp-section bp-section-last">
          <p className="bp-section-label">Mobile context</p>
          <div className="bp-phone-row">
            <div className="bp-phone">
              <div className="bp-phone-notch" />
              <div className="bp-phone-nav">
                <p className="bp-phone-nav-title">WARDROBE</p>
                <p className="bp-phone-nav-sub">42 Pieces</p>
              </div>
              <div className="bp-phone-body">
                {[
                  { cat: 'Outerwear', name: 'Linen Overcoat', meta: 'Worn 4× · Thu', gold: false },
                  { cat: 'Special', name: 'Silk Haori', meta: 'Worn 2× · Fri', gold: true },
                  { cat: 'Bottoms', name: 'Wide Trousers', meta: 'Worn 8× · Yesterday', gold: false },
                  { cat: 'Tops', name: 'Boxy White Tee', meta: 'Worn 14× · Today', gold: false },
                ].map((p) => {
                  const useGold = p.gold && accentMode === 'dual';
                  return (
                    <div key={p.name} className={useGold ? 'bp-phone-card bp-phone-card-gold' : 'bp-phone-card'}>
                      <p className="bp-phone-card-tag">{p.cat}</p>
                      <p className="bp-phone-card-name">{p.name}</p>
                      <p className="bp-phone-card-meta">{p.meta}</p>
                    </div>
                  );
                })}
              </div>
              <div className="bp-phone-tabs">
                {['Wardrobe', 'Outfits', 'Log', 'Pack'].map((t, i) => (
                  <div key={t} className={i === 0 ? 'bp-phone-tab bp-phone-tab-active' : 'bp-phone-tab'}>
                    <div className="bp-phone-tab-dot" />
                    <div className="bp-phone-tab-label">{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.bp-root {
  --bp-bg: #EEEFE8;
  --bp-surface: #E0E2D6;
  --bp-surface-2: #CDD0C0;
  --bp-border: #B0B89C;
  --bp-text: #1A1E14;
  --bp-text-mid: #3C5030;
  --bp-text-dim: #88926C;
  --bp-accent: #5A7852;
  --bp-accent-dk: #3E5838;
  --bp-accent-lo: #C8D8BC;
  --bp-gold: #A88840;
  --bp-gold-dk: #7C6428;
  --bp-gold-lo: #E8D8A0;
  --bp-white: #F6F7F2;

  background: var(--bp-bg);
  color: var(--bp-text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-family: inherit;
}

.bp-dark {
  --bp-bg: #0C0F0A;
  --bp-surface: #141A0E;
  --bp-surface-2: #1E2818;
  --bp-border: #2A3020;
  --bp-text: #E8EADF;
  --bp-text-mid: #90B878;
  --bp-text-dim: #6A7D55;
  --bp-accent: #6A9060;
  --bp-accent-dk: #4E6848;
  --bp-accent-lo: #1E2818;
  --bp-gold: #C8A040;
  --bp-gold-dk: #9A7C28;
  --bp-gold-lo: #2A2314;
  --bp-white: #141A0E;
}

.bp-root *, .bp-root *::before, .bp-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.bp-root button {
  font: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

/* ──────────── Switcher ──────────── */
.bp-switcher {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--bp-bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--bp-border);
  padding: 16px 44px 12px;
}
.bp-switcher-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;
  align-items: center;
}
.bp-switcher-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bp-switcher-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
}
.bp-chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.bp-chip {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  padding: 6px 12px;
  background: transparent;
  color: var(--bp-text-mid);
  border: 1px solid var(--bp-border);
  border-radius: var(--bp-radius);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.bp-chip:hover {
  border-color: var(--bp-accent);
  color: var(--bp-accent);
}
.bp-chip-active {
  background: var(--bp-accent);
  color: var(--bp-white);
  border-color: var(--bp-accent);
}
.bp-chip-active:hover {
  background: var(--bp-accent-dk);
  color: var(--bp-white);
}
.bp-chip-mode {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bp-switcher-note {
  margin-top: 10px;
  font-size: 11px;
  color: var(--bp-text-dim);
  line-height: 1.5;
}
.bp-switcher-note strong {
  color: var(--bp-text-mid);
  font-weight: 600;
}

/* ──────────── Layout ──────────── */
.bp-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 44px 0;
}
.bp-section-last { padding-bottom: 80px; }
.bp-hero { padding-top: 72px; border-bottom: 1px solid var(--bp-border); padding-bottom: 64px; }
.bp-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 32px;
}
.bp-hero-split {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 48px;
  align-items: end;
}
.bp-hero-title {
  font-size: 104px;
  font-weight: 300;
  line-height: 0.9;
  color: var(--bp-accent);
  margin-bottom: 24px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.bp-hero-title em {
  font-style: normal;
  color: var(--bp-gold);
  font-weight: 700;
}
.bp-root[data-accent="green-only"] .bp-hero-title em {
  color: var(--bp-accent);
  font-weight: 700;
}
.bp-hero-desc {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--bp-text-mid);
  font-family: 'DM Sans', system-ui, sans-serif;
  max-width: 520px;
}
.bp-hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.bp-refs-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 10px;
}
.bp-ref {
  display: block;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bp-text-mid);
  line-height: 1.9;
}
.bp-ref-primary { color: var(--bp-accent); font-weight: 600; }

.bp-section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 24px;
}

/* ──────────── Typography ──────────── */
.bp-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.bp-type-block {
  padding: 32px;
  background: var(--bp-white);
  border: 1px solid var(--bp-border);
  border-radius: var(--bp-radius);
}
.bp-type-block-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 12px;
}
.bp-type-display-light {
  font-size: 56px;
  font-weight: 300;
  line-height: 0.9;
  color: var(--bp-accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.bp-type-display-bold {
  font-size: 56px;
  font-weight: 700;
  line-height: 0.9;
  color: var(--bp-gold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.bp-root[data-accent="green-only"] .bp-type-display-bold { color: var(--bp-accent); }
.bp-type-body {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--bp-text-mid);
  font-family: 'DM Sans', system-ui, sans-serif;
  margin-bottom: 16px;
}
.bp-type-caption {
  font-size: 11px;
  color: var(--bp-text-dim);
  font-family: 'DM Sans', system-ui, sans-serif;
}
.bp-type-detail {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--bp-text-dim);
  text-transform: uppercase;
  margin-top: 8px;
}

/* ──────────── Dashboard ──────────── */
.bp-dashboard {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
}
.bp-sidebar {
  background: var(--bp-white);
  border: 1px solid var(--bp-border);
  border-radius: var(--bp-radius);
  padding: 20px 12px;
}
.bp-sidebar-brand {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--bp-accent);
  padding: 4px 8px 20px;
  border-bottom: 1px solid var(--bp-border);
  margin-bottom: 14px;
}
.bp-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bp-text-mid);
  border-radius: var(--bp-radius);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.bp-nav-item:hover {
  background: var(--bp-accent-lo);
  color: var(--bp-accent);
}
.bp-nav-item-active {
  background: var(--bp-accent-lo);
  color: var(--bp-accent);
  font-weight: 700;
}
.bp-dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.bp-stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.bp-stat {
  padding: 18px;
  background: var(--bp-white);
  border: 1px solid var(--bp-border);
  border-radius: var(--bp-radius);
}
.bp-stat-gold { border-left: 3px solid var(--bp-gold); }
.bp-stat-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 8px;
}
.bp-stat-value {
  font-size: 26px;
  font-weight: 600;
  color: var(--bp-text);
  margin-bottom: 4px;
  letter-spacing: 0.02em;
}
.bp-stat-gold .bp-stat-value { color: var(--bp-gold-dk); }
.bp-root.bp-dark .bp-stat-gold .bp-stat-value { color: var(--bp-gold); }
.bp-stat-sub {
  font-size: 11px;
  color: var(--bp-text-dim);
  font-family: 'DM Sans', system-ui, sans-serif;
}

.bp-card-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.bp-card {
  background: var(--bp-white);
  border: 1px solid var(--bp-border);
  border-radius: var(--bp-radius);
  overflow: hidden;
}
.bp-card-img {
  height: 140px;
  background: var(--bp-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.bp-card-gold .bp-card-img { background: var(--bp-gold-lo); }
.bp-card-img-label {
  font-size: 32px;
  font-weight: 700;
  color: var(--bp-accent-lo);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.bp-card-gold .bp-card-img-label { color: var(--bp-gold-lo); filter: brightness(0.9); }
.bp-card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--bp-gold);
  color: var(--bp-white);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.14em;
  padding: 3px 8px;
  border-radius: var(--bp-radius);
  text-transform: uppercase;
}
.bp-card-gold .bp-card-badge { background: var(--bp-accent); }
.bp-card-body { padding: 16px; }
.bp-card-category {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 6px;
}
.bp-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bp-accent);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.bp-card-gold .bp-card-title { color: var(--bp-gold-dk); }
.bp-root.bp-dark .bp-card-gold .bp-card-title { color: var(--bp-gold); }
.bp-card-meta {
  font-size: 11px;
  color: var(--bp-text-dim);
  font-weight: 400;
  font-family: 'DM Sans', system-ui, sans-serif;
}

/* ──────────── Buttons ──────────── */
.bp-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 28px;
}
.bp-btn {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 12px 24px;
  border-radius: var(--bp-radius);
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bp-btn-primary { background: var(--bp-accent); color: var(--bp-white); }
.bp-btn-primary:hover { background: var(--bp-accent-dk); }
.bp-btn-gold { background: var(--bp-gold); color: var(--bp-white); }
.bp-btn-gold:hover { background: var(--bp-gold-dk); }
.bp-btn-secondary {
  background: transparent;
  color: var(--bp-accent);
  border: 1.5px solid var(--bp-accent);
}
.bp-btn-secondary:hover { background: var(--bp-accent-lo); }
.bp-btn-ghost { background: transparent; color: var(--bp-text-mid); }
.bp-btn-ghost:hover { color: var(--bp-accent); }

/* ──────────── Form ──────────── */
.bp-form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.bp-field { min-width: 180px; }
.bp-field-grow { flex: 1; min-width: 240px; }
.bp-field label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bp-text-dim);
  margin-bottom: 6px;
}
.bp-field input {
  width: 100%;
  background: var(--bp-white);
  border: 1.5px solid var(--bp-border);
  border-radius: var(--bp-radius);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--bp-text);
  padding: 11px 14px;
  outline: none;
  transition: border-color 0.15s;
}
.bp-field input:focus { border-color: var(--bp-accent); }
.bp-field input::placeholder { color: var(--bp-text-dim); }
.bp-search {
  position: relative;
  display: flex;
  align-items: center;
}
.bp-search svg {
  position: absolute;
  left: 12px;
  color: var(--bp-text-dim);
  pointer-events: none;
}
.bp-search input { padding-left: 34px; }

/* ──────────── Tags ──────────── */
.bp-tag-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.bp-tag {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 5px 12px;
  border-radius: var(--bp-radius);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.bp-tag-green { background: var(--bp-accent); color: var(--bp-white); }
.bp-tag-gold { background: var(--bp-gold); color: var(--bp-white); }
.bp-tag-outline {
  border: 1.5px solid var(--bp-accent);
  color: var(--bp-accent);
}
.bp-tag-neutral { background: var(--bp-surface); color: var(--bp-text-mid); }

/* ──────────── Phone ──────────── */
.bp-phone-row {
  display: flex;
  justify-content: center;
  gap: 24px;
}
.bp-phone {
  width: 240px;
  height: 480px;
  background: var(--bp-white);
  border-radius: calc(var(--bp-radius) + 28px);
  border: 2px solid var(--bp-border);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(26, 30, 20, 0.08);
}
.bp-phone-notch {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 20px;
  background: var(--bp-bg);
  border-radius: 100px;
  z-index: 10;
}
.bp-phone-nav {
  padding: 44px 16px 12px;
  border-bottom: 1px solid var(--bp-border);
}
.bp-phone-nav-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--bp-accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.bp-phone-nav-sub {
  font-size: 10px;
  color: var(--bp-text-dim);
  margin-top: 3px;
  letter-spacing: 0.08em;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.bp-phone-body {
  flex: 1;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.bp-phone-card {
  background: var(--bp-surface);
  padding: 12px;
  border-left: 2px solid var(--bp-accent);
  border-radius: var(--bp-radius);
}
.bp-phone-card-gold { border-left-color: var(--bp-gold); }
.bp-phone-card-tag {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bp-accent);
  margin-bottom: 4px;
}
.bp-phone-card-gold .bp-phone-card-tag { color: var(--bp-gold); }
.bp-phone-card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--bp-accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.bp-phone-card-gold .bp-phone-card-name { color: var(--bp-gold-dk); }
.bp-root.bp-dark .bp-phone-card-gold .bp-phone-card-name { color: var(--bp-gold); }
.bp-phone-card-meta {
  font-size: 10px;
  color: var(--bp-text-dim);
  margin-top: 3px;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.bp-phone-tabs {
  display: flex;
  justify-content: space-around;
  padding: 10px 0 14px;
  border-top: 1px solid var(--bp-border);
}
.bp-phone-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.bp-phone-tab-dot {
  width: 16px;
  height: 2px;
  background: var(--bp-surface-2);
}
.bp-phone-tab-active .bp-phone-tab-dot { background: var(--bp-accent); }
.bp-phone-tab-label {
  font-size: 7px;
  font-weight: 700;
  color: var(--bp-text-dim);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.bp-phone-tab-active .bp-phone-tab-label { color: var(--bp-accent); }
`;
