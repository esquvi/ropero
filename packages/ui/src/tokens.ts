/**
 * Ropero — Matcha design tokens.
 * Source of truth: docs/brand/matcha.html. Hex here is the human-readable
 * reference; apps/web/app/globals.css holds the OKLCH equivalents.
 */

export const colors = {
  light: {
    bg: '#EEEFE8',
    surface: '#E0E2D6',
    surface2: '#CDD0C0',
    border: '#B0B89C',
    text: '#1A1E14',
    textMid: '#3C5030',
    textDim: '#88926C',
    accent: '#5A7852',
    accentDk: '#3E5838',
    accentLo: '#C8D8BC',
    gold: '#A88840',
    goldDk: '#7C6428',
    goldLo: '#E8D8A0',
    white: '#F6F7F2',
  },
  dark: {
    ground: '#0C0F0A',
    card: '#141A0E',
    divider: '#2A3020',
    imgBg: '#0C1008',
    imgFaded: '#1E2818',
    accent: '#9EBF94',
    gold: '#DCBB6A',
    text: '#E4E8DC',
    textMid: '#8A9C80',
    textDim: '#7A8870',
  },
  state: {
    error: '#A85040',
    errorDark: '#D08070',
    success: '#5A7852',
    successDark: '#9EBF94',
    warning: '#7C6428',
    warningDark: '#DCBB6A',
  },
} as const;

export const radii = {
  structural: 0,
  interactive: 2,
} as const;

export const tracking = {
  capsSm: '0.18em',
  capsMd: '0.24em',
  capsLg: '0.30em',
} as const;

export const fontFamily = {
  display: 'Jost',
  body: 'Jost',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 64,
} as const;
