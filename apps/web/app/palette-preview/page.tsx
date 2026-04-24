'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

const palettes = [
  { id: 'warm-gold', label: 'Warm Gold', emoji: '🟡' },
  { id: 'terracotta', label: 'Terracotta', emoji: '🟠' },
  { id: 'olive-sage', label: 'Olive Sage', emoji: '🟢' },
  { id: 'dusty-rose', label: 'Dusty Rose', emoji: '🩷' },
] as const;

type PaletteId = (typeof palettes)[number]['id'];

export default function PalettePreviewPage() {
  const [activePalette, setActivePalette] = useState<PaletteId>('warm-gold');
  const [isDark, setIsDark] = useState(false);

  return (
    <>
      <style>{paletteStyles}</style>
      <div
        data-palette={activePalette}
        className={isDark ? 'dark' : ''}
        style={{ minHeight: '100vh' }}
      >
        <div className="min-h-screen bg-[var(--pp-background)] text-[var(--pp-foreground)] transition-colors duration-300">
          {/* Sticky Switcher Bar */}
          <div className="sticky top-0 z-50 border-b border-[var(--pp-border)] bg-[var(--pp-background)]/95 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-[var(--pp-muted-foreground)]">
                Palette:
              </span>
              <div className="flex gap-2">
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePalette(p.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activePalette === p.id
                        ? 'bg-[var(--pp-primary)] text-[var(--pp-primary-foreground)] shadow-sm'
                        : 'bg-[var(--pp-secondary)] text-[var(--pp-secondary-foreground)] hover:bg-[var(--pp-accent)]'
                    }`}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center gap-2 rounded-full bg-[var(--pp-secondary)] px-3 py-1.5 text-sm text-[var(--pp-secondary-foreground)] hover:bg-[var(--pp-accent)] transition-colors"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
            {/* Section: Wordmark Font Comparison */}
            <section>
              <SectionLabel>Wordmark Font Comparison</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Bodoni Moda', family: "'Bodoni Moda', serif", weight: 500, note: 'High fashion. Think Vogue / Harper\'s Bazaar.' },
                  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", weight: 600, note: 'Elegant & light. Claude Garamond lineage.' },
                  { name: 'Playfair Display', family: "'Playfair Display', serif", weight: 700, note: 'Editorial luxury. Strong typographic contrast.' },
                  { name: 'Italiana', family: "'Italiana', serif", weight: 400, note: 'Thin & sophisticated. Italian fashion house feel.' },
                  { name: 'Fraunces', family: "'Fraunces', serif", weight: 500, note: 'Soft & playful serif. Contemporary warmth.' },
                  { name: 'DM Serif Display', family: "'DM Serif Display', serif", weight: 400, note: 'Bold newspaper editorial. High impact.' },
                ].map((font) => (
                  <div
                    key={font.name}
                    className="rounded-xl border border-[var(--pp-border)] overflow-hidden"
                  >
                    <div
                      className="p-8 text-center"
                      style={{
                        background: isDark
                          ? `linear-gradient(135deg, var(--pp-card) 0%, var(--pp-background) 50%, var(--pp-card) 100%)`
                          : `linear-gradient(135deg, var(--pp-accent) 0%, var(--pp-background) 50%, var(--pp-secondary) 100%)`,
                      }}
                    >
                      <h2
                        className="text-5xl tracking-tight mb-2 text-[var(--pp-foreground)]"
                        style={{ fontFamily: font.family, fontWeight: font.weight }}
                      >
                        Ropero
                      </h2>
                      <p
                        className="text-sm text-[var(--pp-muted-foreground)]"
                        style={{ fontFamily: font.family, fontWeight: Math.max(300, font.weight - 200) }}
                      >
                        Your wardrobe, curated.
                      </p>
                    </div>
                    <div className="px-4 py-3 bg-[var(--pp-card)]">
                      <p className="text-xs font-semibold text-[var(--pp-card-foreground)]">{font.name}</p>
                      <p className="text-[10px] text-[var(--pp-muted-foreground)]">{font.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Hero Preview (with selected font — update after choosing) */}
            <section>
              <SectionLabel>Landing Page Hero Preview</SectionLabel>
              <div
                className="rounded-2xl p-12 text-center"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, var(--pp-card) 0%, var(--pp-background) 50%, var(--pp-card) 100%)`
                    : `linear-gradient(135deg, var(--pp-accent) 0%, var(--pp-background) 50%, var(--pp-secondary) 100%)`,
                }}
              >
                <div className="inline-block mb-4 rounded-full bg-[var(--pp-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--pp-primary)]">
                  Invite only
                </div>
                <h1
                  className="text-5xl md:text-7xl tracking-tight mb-3"
                  style={{ fontFamily: "'Bodoni Moda', serif", fontWeight: 500 }}
                >
                  Ropero
                </h1>
                <p
                  className="text-lg text-[var(--pp-muted-foreground)] mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: 'italic' }}
                >
                  Your wardrobe, curated.
                </p>
                <div className="flex justify-center gap-3">
                  <button className="rounded-lg bg-[var(--pp-primary)] px-6 py-2.5 text-sm font-medium text-[var(--pp-primary-foreground)] shadow-md transition-all hover:opacity-90">
                    Get Started
                  </button>
                  <button className="rounded-lg border border-[var(--pp-border)] bg-[var(--pp-background)] px-6 py-2.5 text-sm font-medium text-[var(--pp-foreground)] transition-all hover:bg-[var(--pp-accent)]">
                    Sign In
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Sidebar Preview */}
            <section>
              <SectionLabel>Sidebar</SectionLabel>
              <div className="max-w-xs rounded-xl border border-[var(--pp-border)] bg-[var(--pp-sidebar)] overflow-hidden">
                <div className="flex h-14 items-center border-b border-[var(--pp-sidebar-border)] px-4">
                  <span
                    className="text-lg font-bold tracking-tight text-[var(--pp-sidebar-foreground)]"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Ropero
                  </span>
                </div>
                <nav className="p-3 space-y-1">
                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', active: true },
                    { icon: Shirt, label: 'Wardrobe', active: false },
                    { icon: Layers, label: 'Outfits', active: false },
                    { icon: Plane, label: 'Trips', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        item.active
                          ? 'bg-[var(--pp-sidebar-accent)] text-[var(--pp-sidebar-primary)]'
                          : 'text-[var(--pp-sidebar-foreground)] hover:bg-[var(--pp-sidebar-accent)]'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  ))}
                </nav>
              </div>
            </section>

            {/* Section: Stat Cards */}
            <section>
              <SectionLabel>Dashboard Stat Cards</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'Total Items', value: '47', icon: Shirt, desc: '42 active, 5 archived' },
                  { title: 'Outfits', value: '12', icon: Layers, desc: 'Saved combinations' },
                  { title: 'Upcoming Trips', value: '2', icon: Plane, desc: 'Trips to prepare for' },
                  { title: 'Wardrobe Value', value: '$3,240', icon: TrendingUp, desc: 'Total active value' },
                ].map((stat) => (
                  <div
                    key={stat.title}
                    className="rounded-xl border border-[var(--pp-border)] bg-[var(--pp-card)] p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-sm font-medium text-[var(--pp-card-foreground)]">
                        {stat.title}
                      </span>
                      <stat.icon className="h-4 w-4 text-[var(--pp-muted-foreground)]" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--pp-card-foreground)]">
                      {stat.value}
                    </div>
                    <p className="text-xs text-[var(--pp-muted-foreground)]">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Buttons */}
            <section>
              <SectionLabel>Buttons</SectionLabel>
              <div className="flex flex-wrap gap-3 items-center">
                <button className="rounded-lg bg-[var(--pp-primary)] px-4 py-2 text-sm font-medium text-[var(--pp-primary-foreground)] shadow-sm transition-all hover:opacity-90">
                  Primary
                </button>
                <button className="rounded-lg bg-[var(--pp-secondary)] px-4 py-2 text-sm font-medium text-[var(--pp-secondary-foreground)] transition-all hover:bg-[var(--pp-accent)]">
                  Secondary
                </button>
                <button className="rounded-lg border border-[var(--pp-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--pp-foreground)] transition-all hover:bg-[var(--pp-accent)]">
                  Outline
                </button>
                <button className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-[var(--pp-foreground)] transition-all hover:bg-[var(--pp-accent)]">
                  Ghost
                </button>
                <button className="rounded-lg bg-[var(--pp-destructive)] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90">
                  Destructive
                </button>
                <button className="rounded-lg bg-[var(--pp-primary)] px-4 py-2 text-sm font-medium text-[var(--pp-primary-foreground)] shadow-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
            </section>

            {/* Section: Badges */}
            <section>
              <SectionLabel>Badges & Status</SectionLabel>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center rounded-full bg-[var(--pp-primary)] px-2.5 py-0.5 text-xs font-medium text-[var(--pp-primary-foreground)]">
                  Primary
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--pp-secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--pp-secondary-foreground)]">
                  Secondary
                </span>
                <span className="inline-flex items-center rounded-full border border-[var(--pp-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--pp-foreground)]">
                  Outline
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--pp-destructive)] px-2.5 py-0.5 text-xs font-medium text-white">
                  Destructive
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--pp-status-draft)] px-2.5 py-0.5 text-xs font-medium text-[var(--pp-status-draft-fg)]">
                  Draft
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--pp-status-finalized)] px-2.5 py-0.5 text-xs font-medium text-[var(--pp-status-finalized-fg)]">
                  Finalized
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--pp-status-packed)] px-2.5 py-0.5 text-xs font-medium text-[var(--pp-status-packed-fg)]">
                  Packed
                </span>
              </div>
            </section>

            {/* Section: Form Inputs */}
            <section>
              <SectionLabel>Form Elements</SectionLabel>
              <div className="max-w-md space-y-4 rounded-xl border border-[var(--pp-border)] bg-[var(--pp-card)] p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--pp-card-foreground)]">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Navy Blazer"
                    className="w-full rounded-lg border border-[var(--pp-input)] bg-transparent px-3 py-2 text-sm text-[var(--pp-foreground)] placeholder:text-[var(--pp-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-ring)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--pp-card-foreground)]">
                    Category
                  </label>
                  <select className="w-full rounded-lg border border-[var(--pp-input)] bg-[var(--pp-background)] px-3 py-2 text-sm text-[var(--pp-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-ring)] transition-colors">
                    <option>Tops</option>
                    <option>Bottoms</option>
                    <option>Outerwear</option>
                    <option>Shoes</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pp-fav"
                    className="h-4 w-4 rounded border-[var(--pp-input)] accent-[var(--pp-primary)]"
                  />
                  <label htmlFor="pp-fav" className="text-sm text-[var(--pp-card-foreground)]">
                    Mark as favorite
                  </label>
                </div>
                <button className="w-full rounded-lg bg-[var(--pp-primary)] py-2 text-sm font-medium text-[var(--pp-primary-foreground)] shadow-sm">
                  Save Item
                </button>
              </div>
            </section>

            {/* Section: Item Cards */}
            <section>
              <SectionLabel>Wardrobe Item Cards</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Navy Blazer', category: 'Outerwear', worn: 12, season: 'Fall' },
                  { name: 'White Oxford Shirt', category: 'Tops', worn: 28, season: 'All' },
                  { name: 'Leather Chelsea Boots', category: 'Shoes', worn: 19, season: 'Winter' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="group rounded-xl border border-[var(--pp-border)] bg-[var(--pp-card)] overflow-hidden shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="aspect-[4/3] bg-[var(--pp-muted)] flex items-center justify-center">
                      <Shirt className="h-8 w-8 text-[var(--pp-muted-foreground)]" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[var(--pp-card-foreground)]">{item.name}</h3>
                      <p className="text-sm text-[var(--pp-muted-foreground)]">{item.category}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-[var(--pp-secondary)] px-2 py-0.5 text-xs text-[var(--pp-secondary-foreground)]">
                          {item.season}
                        </span>
                        <span className="text-xs text-[var(--pp-muted-foreground)]">
                          {item.worn}x worn
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Color Swatches */}
            <section>
              <SectionLabel>Color Swatches</SectionLabel>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {[
                  { name: 'Background', var: '--pp-background' },
                  { name: 'Foreground', var: '--pp-foreground' },
                  { name: 'Primary', var: '--pp-primary' },
                  { name: 'Primary FG', var: '--pp-primary-foreground' },
                  { name: 'Secondary', var: '--pp-secondary' },
                  { name: 'Muted', var: '--pp-muted' },
                  { name: 'Muted FG', var: '--pp-muted-foreground' },
                  { name: 'Accent', var: '--pp-accent' },
                  { name: 'Card', var: '--pp-card' },
                  { name: 'Border', var: '--pp-border' },
                  { name: 'Ring', var: '--pp-ring' },
                  { name: 'Destructive', var: '--pp-destructive' },
                  { name: 'Sidebar', var: '--pp-sidebar' },
                  { name: 'Sidebar FG', var: '--pp-sidebar-foreground' },
                  { name: 'Sidebar Primary', var: '--pp-sidebar-primary' },
                  { name: 'Sidebar Accent', var: '--pp-sidebar-accent' },
                ].map((swatch) => (
                  <div key={swatch.name} className="text-center">
                    <div
                      className="h-10 w-full rounded-lg border border-[var(--pp-border)] shadow-sm"
                      style={{ backgroundColor: `var(${swatch.var})` }}
                    />
                    <span className="mt-1 block text-[10px] text-[var(--pp-muted-foreground)]">
                      {swatch.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Typography */}
            <section>
              <SectionLabel>Typography</SectionLabel>
              <div className="space-y-3 rounded-xl border border-[var(--pp-border)] bg-[var(--pp-card)] p-6">
                <h1
                  className="text-4xl font-bold tracking-tight text-[var(--pp-card-foreground)]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Display Heading
                </h1>
                <h2
                  className="text-2xl font-bold tracking-tight text-[var(--pp-card-foreground)]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Section Heading
                </h2>
                <h3
                  className="text-xl font-semibold text-[var(--pp-card-foreground)]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Subsection Heading
                </h3>
                <p className="text-sm text-[var(--pp-foreground)]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Body text in DM Sans. Manage your wardrobe, build outfits, log what you wear, and pack smart for trips.
                  The clean geometry of DM Sans pairs naturally with the editorial elegance of DM Serif Display.
                </p>
                <p className="text-xs text-[var(--pp-muted-foreground)]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Muted caption text — 42 active items, 5 archived
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--pp-muted-foreground)]">
      {children}
    </h2>
  );
}

// All palette CSS variables scoped under data-palette + light/dark
// Using --pp- prefix (palette preview) to avoid conflicting with globals.css
const paletteStyles = `
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display&family=Italiana&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');

/* ═══════════════════════════════════════════ */
/*  WARM GOLD / AMBER — "Honey & Champagne"   */
/* ═══════════════════════════════════════════ */
[data-palette="warm-gold"] {
  --pp-background: oklch(0.993 0.003 90);
  --pp-foreground: oklch(0.205 0.015 60);
  --pp-card: oklch(0.993 0.003 90);
  --pp-card-foreground: oklch(0.205 0.015 60);
  --pp-popover: oklch(0.993 0.003 90);
  --pp-popover-foreground: oklch(0.205 0.015 60);
  --pp-primary: oklch(0.55 0.14 75);
  --pp-primary-foreground: oklch(0.995 0.005 90);
  --pp-secondary: oklch(0.955 0.015 85);
  --pp-secondary-foreground: oklch(0.30 0.03 60);
  --pp-muted: oklch(0.955 0.015 85);
  --pp-muted-foreground: oklch(0.52 0.02 60);
  --pp-accent: oklch(0.90 0.06 85);
  --pp-accent-foreground: oklch(0.25 0.03 60);
  --pp-destructive: oklch(0.577 0.245 27.325);
  --pp-border: oklch(0.905 0.02 85);
  --pp-input: oklch(0.905 0.02 85);
  --pp-ring: oklch(0.55 0.14 75);
  --pp-sidebar: oklch(0.975 0.008 85);
  --pp-sidebar-foreground: oklch(0.205 0.015 60);
  --pp-sidebar-primary: oklch(0.55 0.14 75);
  --pp-sidebar-primary-foreground: oklch(0.995 0.005 90);
  --pp-sidebar-accent: oklch(0.94 0.03 85);
  --pp-sidebar-accent-foreground: oklch(0.25 0.03 60);
  --pp-sidebar-border: oklch(0.905 0.02 85);
  --pp-sidebar-ring: oklch(0.55 0.14 75);
  --pp-status-draft: oklch(0.90 0.06 85);
  --pp-status-draft-fg: oklch(0.40 0.08 75);
  --pp-status-finalized: oklch(0.88 0.06 250);
  --pp-status-finalized-fg: oklch(0.40 0.06 250);
  --pp-status-packed: oklch(0.88 0.08 145);
  --pp-status-packed-fg: oklch(0.38 0.06 145);
}

[data-palette="warm-gold"].dark {
  --pp-background: oklch(0.16 0.012 60);
  --pp-foreground: oklch(0.95 0.01 85);
  --pp-card: oklch(0.22 0.015 60);
  --pp-card-foreground: oklch(0.95 0.01 85);
  --pp-popover: oklch(0.22 0.015 60);
  --pp-popover-foreground: oklch(0.95 0.01 85);
  --pp-primary: oklch(0.72 0.14 80);
  --pp-primary-foreground: oklch(0.18 0.02 60);
  --pp-secondary: oklch(0.28 0.02 60);
  --pp-secondary-foreground: oklch(0.92 0.01 85);
  --pp-muted: oklch(0.28 0.02 60);
  --pp-muted-foreground: oklch(0.65 0.02 75);
  --pp-accent: oklch(0.32 0.04 70);
  --pp-accent-foreground: oklch(0.92 0.01 85);
  --pp-destructive: oklch(0.704 0.191 22.216);
  --pp-border: oklch(1 0 0 / 12%);
  --pp-input: oklch(1 0 0 / 15%);
  --pp-ring: oklch(0.72 0.14 80);
  --pp-sidebar: oklch(0.20 0.015 60);
  --pp-sidebar-foreground: oklch(0.95 0.01 85);
  --pp-sidebar-primary: oklch(0.72 0.14 80);
  --pp-sidebar-primary-foreground: oklch(0.18 0.02 60);
  --pp-sidebar-accent: oklch(0.28 0.02 60);
  --pp-sidebar-accent-foreground: oklch(0.92 0.01 85);
  --pp-sidebar-border: oklch(1 0 0 / 12%);
  --pp-sidebar-ring: oklch(0.72 0.14 80);
  --pp-status-draft: oklch(0.35 0.06 85);
  --pp-status-draft-fg: oklch(0.80 0.06 85);
  --pp-status-finalized: oklch(0.32 0.05 250);
  --pp-status-finalized-fg: oklch(0.78 0.06 250);
  --pp-status-packed: oklch(0.32 0.06 145);
  --pp-status-packed-fg: oklch(0.78 0.06 145);
}

/* ═══════════════════════════════════════════ */
/*  TERRACOTTA / RUST — "Earthen Clay"         */
/* ═══════════════════════════════════════════ */
[data-palette="terracotta"] {
  --pp-background: oklch(0.985 0.005 70);
  --pp-foreground: oklch(0.20 0.02 50);
  --pp-card: oklch(0.985 0.005 70);
  --pp-card-foreground: oklch(0.20 0.02 50);
  --pp-popover: oklch(0.985 0.005 70);
  --pp-popover-foreground: oklch(0.20 0.02 50);
  --pp-primary: oklch(0.52 0.14 38);
  --pp-primary-foreground: oklch(0.98 0.005 70);
  --pp-secondary: oklch(0.95 0.02 100);
  --pp-secondary-foreground: oklch(0.30 0.03 50);
  --pp-muted: oklch(0.95 0.015 70);
  --pp-muted-foreground: oklch(0.52 0.02 50);
  --pp-accent: oklch(0.88 0.04 145);
  --pp-accent-foreground: oklch(0.25 0.03 145);
  --pp-destructive: oklch(0.577 0.245 27.325);
  --pp-border: oklch(0.90 0.02 70);
  --pp-input: oklch(0.90 0.02 70);
  --pp-ring: oklch(0.52 0.14 38);
  --pp-sidebar: oklch(0.97 0.008 70);
  --pp-sidebar-foreground: oklch(0.20 0.02 50);
  --pp-sidebar-primary: oklch(0.52 0.14 38);
  --pp-sidebar-primary-foreground: oklch(0.98 0.005 70);
  --pp-sidebar-accent: oklch(0.93 0.03 100);
  --pp-sidebar-accent-foreground: oklch(0.25 0.03 50);
  --pp-sidebar-border: oklch(0.90 0.02 70);
  --pp-sidebar-ring: oklch(0.52 0.14 38);
  --pp-status-draft: oklch(0.90 0.06 85);
  --pp-status-draft-fg: oklch(0.40 0.08 85);
  --pp-status-finalized: oklch(0.88 0.06 250);
  --pp-status-finalized-fg: oklch(0.40 0.06 250);
  --pp-status-packed: oklch(0.88 0.08 145);
  --pp-status-packed-fg: oklch(0.38 0.06 145);
}

[data-palette="terracotta"].dark {
  --pp-background: oklch(0.155 0.012 50);
  --pp-foreground: oklch(0.95 0.008 70);
  --pp-card: oklch(0.22 0.015 50);
  --pp-card-foreground: oklch(0.95 0.008 70);
  --pp-popover: oklch(0.22 0.015 50);
  --pp-popover-foreground: oklch(0.95 0.008 70);
  --pp-primary: oklch(0.68 0.13 38);
  --pp-primary-foreground: oklch(0.16 0.02 38);
  --pp-secondary: oklch(0.28 0.015 50);
  --pp-secondary-foreground: oklch(0.92 0.008 70);
  --pp-muted: oklch(0.28 0.015 50);
  --pp-muted-foreground: oklch(0.65 0.02 50);
  --pp-accent: oklch(0.35 0.04 145);
  --pp-accent-foreground: oklch(0.90 0.01 145);
  --pp-destructive: oklch(0.704 0.191 22.216);
  --pp-border: oklch(1 0 0 / 12%);
  --pp-input: oklch(1 0 0 / 15%);
  --pp-ring: oklch(0.68 0.13 38);
  --pp-sidebar: oklch(0.20 0.012 50);
  --pp-sidebar-foreground: oklch(0.95 0.008 70);
  --pp-sidebar-primary: oklch(0.68 0.13 38);
  --pp-sidebar-primary-foreground: oklch(0.16 0.02 38);
  --pp-sidebar-accent: oklch(0.28 0.015 50);
  --pp-sidebar-accent-foreground: oklch(0.92 0.008 70);
  --pp-sidebar-border: oklch(1 0 0 / 12%);
  --pp-sidebar-ring: oklch(0.68 0.13 38);
  --pp-status-draft: oklch(0.35 0.06 85);
  --pp-status-draft-fg: oklch(0.80 0.06 85);
  --pp-status-finalized: oklch(0.32 0.05 250);
  --pp-status-finalized-fg: oklch(0.78 0.06 250);
  --pp-status-packed: oklch(0.32 0.06 145);
  --pp-status-packed-fg: oklch(0.78 0.06 145);
}

/* ═══════════════════════════════════════════ */
/*  OLIVE / SAGE GREEN — "Forest & Linen"      */
/* ═══════════════════════════════════════════ */
[data-palette="olive-sage"] {
  --pp-background: oklch(0.985 0.004 110);
  --pp-foreground: oklch(0.20 0.02 150);
  --pp-card: oklch(0.985 0.004 110);
  --pp-card-foreground: oklch(0.20 0.02 150);
  --pp-popover: oklch(0.985 0.004 110);
  --pp-popover-foreground: oklch(0.20 0.02 150);
  --pp-primary: oklch(0.48 0.10 150);
  --pp-primary-foreground: oklch(0.98 0.005 150);
  --pp-secondary: oklch(0.955 0.015 145);
  --pp-secondary-foreground: oklch(0.28 0.03 150);
  --pp-muted: oklch(0.955 0.012 130);
  --pp-muted-foreground: oklch(0.52 0.02 150);
  --pp-accent: oklch(0.85 0.05 140);
  --pp-accent-foreground: oklch(0.22 0.03 150);
  --pp-destructive: oklch(0.577 0.245 27.325);
  --pp-border: oklch(0.90 0.015 140);
  --pp-input: oklch(0.90 0.015 140);
  --pp-ring: oklch(0.48 0.10 150);
  --pp-sidebar: oklch(0.97 0.006 140);
  --pp-sidebar-foreground: oklch(0.20 0.02 150);
  --pp-sidebar-primary: oklch(0.48 0.10 150);
  --pp-sidebar-primary-foreground: oklch(0.98 0.005 150);
  --pp-sidebar-accent: oklch(0.93 0.025 140);
  --pp-sidebar-accent-foreground: oklch(0.22 0.03 150);
  --pp-sidebar-border: oklch(0.90 0.015 140);
  --pp-sidebar-ring: oklch(0.48 0.10 150);
  --pp-status-draft: oklch(0.90 0.06 85);
  --pp-status-draft-fg: oklch(0.40 0.08 85);
  --pp-status-finalized: oklch(0.88 0.06 250);
  --pp-status-finalized-fg: oklch(0.40 0.06 250);
  --pp-status-packed: oklch(0.88 0.08 145);
  --pp-status-packed-fg: oklch(0.38 0.06 145);
}

[data-palette="olive-sage"].dark {
  --pp-background: oklch(0.155 0.01 150);
  --pp-foreground: oklch(0.95 0.006 130);
  --pp-card: oklch(0.22 0.012 150);
  --pp-card-foreground: oklch(0.95 0.006 130);
  --pp-popover: oklch(0.22 0.012 150);
  --pp-popover-foreground: oklch(0.95 0.006 130);
  --pp-primary: oklch(0.68 0.10 148);
  --pp-primary-foreground: oklch(0.16 0.02 150);
  --pp-secondary: oklch(0.27 0.015 150);
  --pp-secondary-foreground: oklch(0.92 0.006 130);
  --pp-muted: oklch(0.27 0.015 150);
  --pp-muted-foreground: oklch(0.62 0.02 145);
  --pp-accent: oklch(0.34 0.04 145);
  --pp-accent-foreground: oklch(0.90 0.01 130);
  --pp-destructive: oklch(0.704 0.191 22.216);
  --pp-border: oklch(1 0 0 / 12%);
  --pp-input: oklch(1 0 0 / 15%);
  --pp-ring: oklch(0.68 0.10 148);
  --pp-sidebar: oklch(0.20 0.01 150);
  --pp-sidebar-foreground: oklch(0.95 0.006 130);
  --pp-sidebar-primary: oklch(0.68 0.10 148);
  --pp-sidebar-primary-foreground: oklch(0.16 0.02 150);
  --pp-sidebar-accent: oklch(0.27 0.015 150);
  --pp-sidebar-accent-foreground: oklch(0.92 0.006 130);
  --pp-sidebar-border: oklch(1 0 0 / 12%);
  --pp-sidebar-ring: oklch(0.68 0.10 148);
  --pp-status-draft: oklch(0.35 0.06 85);
  --pp-status-draft-fg: oklch(0.80 0.06 85);
  --pp-status-finalized: oklch(0.32 0.05 250);
  --pp-status-finalized-fg: oklch(0.78 0.06 250);
  --pp-status-packed: oklch(0.32 0.06 145);
  --pp-status-packed-fg: oklch(0.78 0.06 145);
}

/* ═══════════════════════════════════════════ */
/*  DUSTY ROSE / MAUVE — "Blush & Stone"       */
/* ═══════════════════════════════════════════ */
[data-palette="dusty-rose"] {
  --pp-background: oklch(0.988 0.004 350);
  --pp-foreground: oklch(0.20 0.015 340);
  --pp-card: oklch(0.988 0.004 350);
  --pp-card-foreground: oklch(0.20 0.015 340);
  --pp-popover: oklch(0.988 0.004 350);
  --pp-popover-foreground: oklch(0.20 0.015 340);
  --pp-primary: oklch(0.55 0.10 350);
  --pp-primary-foreground: oklch(0.98 0.005 350);
  --pp-secondary: oklch(0.955 0.015 340);
  --pp-secondary-foreground: oklch(0.30 0.02 340);
  --pp-muted: oklch(0.955 0.012 345);
  --pp-muted-foreground: oklch(0.52 0.015 340);
  --pp-accent: oklch(0.88 0.05 345);
  --pp-accent-foreground: oklch(0.25 0.02 340);
  --pp-destructive: oklch(0.577 0.245 27.325);
  --pp-border: oklch(0.905 0.015 345);
  --pp-input: oklch(0.905 0.015 345);
  --pp-ring: oklch(0.55 0.10 350);
  --pp-sidebar: oklch(0.972 0.006 348);
  --pp-sidebar-foreground: oklch(0.20 0.015 340);
  --pp-sidebar-primary: oklch(0.55 0.10 350);
  --pp-sidebar-primary-foreground: oklch(0.98 0.005 350);
  --pp-sidebar-accent: oklch(0.94 0.025 345);
  --pp-sidebar-accent-foreground: oklch(0.25 0.02 340);
  --pp-sidebar-border: oklch(0.905 0.015 345);
  --pp-sidebar-ring: oklch(0.55 0.10 350);
  --pp-status-draft: oklch(0.90 0.06 85);
  --pp-status-draft-fg: oklch(0.40 0.08 85);
  --pp-status-finalized: oklch(0.88 0.06 250);
  --pp-status-finalized-fg: oklch(0.40 0.06 250);
  --pp-status-packed: oklch(0.88 0.08 145);
  --pp-status-packed-fg: oklch(0.38 0.06 145);
}

[data-palette="dusty-rose"].dark {
  --pp-background: oklch(0.155 0.01 340);
  --pp-foreground: oklch(0.95 0.006 348);
  --pp-card: oklch(0.22 0.012 340);
  --pp-card-foreground: oklch(0.95 0.006 348);
  --pp-popover: oklch(0.22 0.012 340);
  --pp-popover-foreground: oklch(0.95 0.006 348);
  --pp-primary: oklch(0.70 0.10 348);
  --pp-primary-foreground: oklch(0.16 0.015 340);
  --pp-secondary: oklch(0.27 0.012 340);
  --pp-secondary-foreground: oklch(0.92 0.006 348);
  --pp-muted: oklch(0.27 0.012 340);
  --pp-muted-foreground: oklch(0.62 0.015 340);
  --pp-accent: oklch(0.34 0.035 345);
  --pp-accent-foreground: oklch(0.90 0.008 348);
  --pp-destructive: oklch(0.704 0.191 22.216);
  --pp-border: oklch(1 0 0 / 12%);
  --pp-input: oklch(1 0 0 / 15%);
  --pp-ring: oklch(0.70 0.10 348);
  --pp-sidebar: oklch(0.20 0.01 340);
  --pp-sidebar-foreground: oklch(0.95 0.006 348);
  --pp-sidebar-primary: oklch(0.70 0.10 348);
  --pp-sidebar-primary-foreground: oklch(0.16 0.015 340);
  --pp-sidebar-accent: oklch(0.27 0.012 340);
  --pp-sidebar-accent-foreground: oklch(0.92 0.006 348);
  --pp-sidebar-border: oklch(1 0 0 / 12%);
  --pp-sidebar-ring: oklch(0.70 0.10 348);
  --pp-status-draft: oklch(0.35 0.06 85);
  --pp-status-draft-fg: oklch(0.80 0.06 85);
  --pp-status-finalized: oklch(0.32 0.05 250);
  --pp-status-finalized-fg: oklch(0.78 0.06 250);
  --pp-status-packed: oklch(0.32 0.06 145);
  --pp-status-packed-fg: oklch(0.78 0.06 145);
}
`;
