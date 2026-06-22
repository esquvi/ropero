// Pure season + dormancy logic for the rediscovery surface (the wardrobe
// dormancy lens and the dashboard "back in season" module). Kept free of the
// DB and the browser so it can be fully unit-tested. See
// docs/plans/2026-06-22-002-feat-rediscovery-surface-plan.md.

import type { Season } from '../types';

// The minimal shape callers pass in. Real wardrobe rows carry far more; this is
// all the dormancy logic reads. `last_worn_at` is the items.last_worn_at
// timestamptz, which PostgREST serializes as an ISO string (e.g.
// "2026-05-20T00:00:00+00:00"); the logic only ever reasons about its date
// portion, so every read normalizes via dateOnly().
export interface RediscoveryPiece {
  id: string;
  season: Season[];
  last_worn_at: string | null;
}

// The YYYY-MM-DD date portion of a serialized timestamptz (or null). Comparing
// and parsing the date portion only keeps ordering, the season-window boundary,
// and the month label correct regardless of the time/offset suffix.
function dateOnly(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// Northern-hemisphere season for a given date (calendar-based, no weather).
// Documented assumption: hemisphere is not detected; weather/location-aware
// season is a deferred follow-up.
export function currentSeason(date: Date): Season {
  const month = date.getMonth(); // 0-11
  if (month === 11 || month <= 1) return 'winter'; // Dec, Jan, Feb
  if (month <= 4) return 'spring'; // Mar, Apr, May
  if (month <= 7) return 'summer'; // Jun, Jul, Aug
  return 'fall'; // Sep, Oct, Nov
}

// An empty season array means "any season" (the piece is always in-season).
export function isInSeason(seasons: Season[], current: Season): boolean {
  return seasons.length === 0 || seasons.includes(current);
}

// Dormancy ordering within a season group: never-worn first (treated as
// infinitely dormant via the empty-string key, which sorts before any
// YYYY-MM-DD), then oldest last-worn first, then a stable id tiebreaker.
function dormancyCompare(a: RediscoveryPiece, b: RediscoveryPiece): number {
  const ak = dateOnly(a.last_worn_at) ?? '';
  const bk = dateOnly(b.last_worn_at) ?? '';
  if (ak !== bk) return ak < bk ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

// Order pieces for the wardrobe dormancy lens: in-season pieces first, then
// out-of-season "resting" pieces, each group ordered by dormancy. Tags every
// piece with `outOfSeason` so the card can quiet the resting ones.
export function sortByDormancy<T extends RediscoveryPiece>(
  pieces: T[],
  now: Date,
): Array<T & { outOfSeason: boolean }> {
  const current = currentSeason(now);
  const tagged = pieces.map((p) => ({ ...p, outOfSeason: !isInSeason(p.season, current) }));
  return tagged.sort((a, b) => {
    if (a.outOfSeason !== b.outOfSeason) return a.outOfSeason ? 1 : -1;
    return dormancyCompare(a, b);
  });
}

// The first day of the current season's window, as a YYYY-MM-DD string for
// lexical comparison against last_worn_at. Winter spans Dec-Feb, so its window
// starts the previous December when `now` is Jan/Feb.
function seasonStartISO(now: Date): string {
  const season = currentSeason(now);
  const year = now.getFullYear();
  switch (season) {
    case 'winter':
      return `${now.getMonth() === 11 ? year : year - 1}-12-01`;
    case 'spring':
      return `${year}-03-01`;
    case 'summer':
      return `${year}-06-01`;
    case 'fall':
      return `${year}-09-01`;
  }
}

// Pieces for the dashboard "back in season" module: in-season now AND not worn
// since the season's window began (or never worn), ordered by dormancy and
// capped at `limit`. Deterministic given the same input.
export function selectBackInSeason<T extends RediscoveryPiece>(
  pieces: T[],
  now: Date,
  limit: number,
): T[] {
  const current = currentSeason(now);
  const start = seasonStartISO(now);
  return pieces
    .filter((p) => {
      const worn = dateOnly(p.last_worn_at);
      return isInSeason(p.season, current) && (worn === null || worn < start);
    })
    .sort(dormancyCompare)
    .slice(0, limit);
}

// The date portion of a dormancy fact -- "October" for a date in the current
// year, "October 2024" for a prior year, or null when the piece was never worn.
// Parses the YYYY-MM-DD components directly (never `new Date(str)`) so it can't
// shift a month in a negative-UTC timezone -- the off-by-one the web/mobile
// formatDate copies have. Callers render this in gold (it is the datum); the
// "not worn since" lead-in stays neutral chrome.
export function lastWornSince(lastWornAt: string | null, now: Date): string | null {
  const datePart = dateOnly(lastWornAt);
  if (!datePart) return null;
  const [year, month] = datePart.split('-').map(Number);
  const monthName = MONTHS[month - 1];
  if (!Number.isFinite(year) || !monthName) return null;
  return year === now.getFullYear() ? monthName : `${monthName} ${year}`;
}

// Full mirror-voice fact as a single string (for accessible labels and the
// non-split case): "not worn since October" / "not worn yet".
export function dormancyLabel(lastWornAt: string | null, now: Date): string {
  const since = lastWornSince(lastWornAt, now);
  return since ? `not worn since ${since}` : 'not worn yet';
}
