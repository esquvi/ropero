import { describe, it, expect } from 'vitest';
import {
  groupWearLogs,
  parseWearDate,
  formatRelativeWearDate,
  type WearLogRow,
} from '../index';

function row(overrides: Partial<WearLogRow> & { id: string }): WearLogRow {
  return {
    id: overrides.id,
    worn_at: overrides.worn_at ?? '2026-04-29',
    occasion: overrides.occasion ?? null,
    outfit_id: overrides.outfit_id ?? null,
    items: overrides.items === undefined ? { name: 'Item' } : overrides.items,
    outfits: overrides.outfits ?? null,
  };
}

describe('groupWearLogs', () => {
  it('passes standalone item wears through', () => {
    const rows: WearLogRow[] = [
      row({ id: '1', items: { name: 'Linen tee' } }),
      row({ id: '2', items: { name: 'Wool trousers' } }),
    ];

    const entries = groupWearLogs(rows, { maxEntries: 10 });

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      kind: 'item',
      item_name: 'Linen tee',
      key: 'item:1',
    });
    expect(entries[1]).toMatchObject({ kind: 'item', item_name: 'Wool trousers' });
  });

  it('collapses rows with the same outfit_id + worn_at into one entry with item_count', () => {
    const rows: WearLogRow[] = [
      row({ id: '1', outfit_id: 'o1', outfits: { name: 'Sunday brunch' } }),
      row({ id: '2', outfit_id: 'o1', outfits: { name: 'Sunday brunch' } }),
      row({ id: '3', outfit_id: 'o1', outfits: { name: 'Sunday brunch' } }),
    ];

    const entries = groupWearLogs(rows, { maxEntries: 10 });

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      kind: 'outfit',
      outfit_name: 'Sunday brunch',
      item_count: 3,
    });
  });

  it('keeps wears of the same outfit on different days as separate entries', () => {
    const rows: WearLogRow[] = [
      row({ id: '1', outfit_id: 'o1', worn_at: '2026-04-28' }),
      row({ id: '2', outfit_id: 'o1', worn_at: '2026-04-29' }),
    ];

    const entries = groupWearLogs(rows, { maxEntries: 10 });

    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.kind === 'outfit')).toBe(true);
  });

  it('falls back to "Outfit" when outfits join is null', () => {
    const rows: WearLogRow[] = [row({ id: '1', outfit_id: 'o1', outfits: null })];

    const entries = groupWearLogs(rows, { maxEntries: 10 });

    expect(entries[0]).toMatchObject({ kind: 'outfit', outfit_name: 'Outfit' });
  });

  it('respects the maxEntries cap', () => {
    const rows: WearLogRow[] = Array.from({ length: 8 }, (_, i) =>
      row({ id: String(i), items: { name: `Item ${i}` } }),
    );

    const entries = groupWearLogs(rows, { maxEntries: 5 });

    expect(entries).toHaveLength(5);
  });

  it('keeps incrementing existing outfit groups after the cap is hit', () => {
    // Five item wears fill the cap, then two more rows of an outfit that's
    // already in the result (via a sixth-position row that won't be added)
    // should not be created. This test instead covers the documented case:
    // an outfit group that's already in the result continues to count rows
    // that arrive after the cap.
    const rows: WearLogRow[] = [
      row({ id: 'o1a', outfit_id: 'o1', outfits: { name: 'Set A' } }),
      row({ id: '1', items: { name: 'a' } }),
      row({ id: '2', items: { name: 'b' } }),
      row({ id: '3', items: { name: 'c' } }),
      row({ id: '4', items: { name: 'd' } }),
      // Cap (5) is now hit. Subsequent matching outfit rows still
      // increment the existing Set A group.
      row({ id: 'o1b', outfit_id: 'o1', outfits: { name: 'Set A' } }),
      row({ id: 'o1c', outfit_id: 'o1', outfits: { name: 'Set A' } }),
      // A brand-new entry past the cap is dropped.
      row({ id: 'late', items: { name: 'late' } }),
    ];

    const entries = groupWearLogs(rows, { maxEntries: 5 });

    expect(entries).toHaveLength(5);
    const setA = entries.find((e) => e.kind === 'outfit' && e.outfit_name === 'Set A');
    expect(setA).toBeDefined();
    expect(setA && setA.kind === 'outfit' && setA.item_count).toBe(3);
    expect(entries.find((e) => e.kind === 'item' && e.item_name === 'late')).toBeUndefined();
  });

  it('preserves the input order of the first row of each entry', () => {
    const rows: WearLogRow[] = [
      row({ id: '1', worn_at: '2026-04-29', items: { name: 'newest' } }),
      row({ id: '2', worn_at: '2026-04-28', items: { name: 'older' } }),
      row({ id: '3', worn_at: '2026-04-27', items: { name: 'oldest' } }),
    ];

    const entries = groupWearLogs(rows, { maxEntries: 10 });

    expect(entries.map((e) => e.kind === 'item' && e.item_name)).toEqual([
      'newest',
      'older',
      'oldest',
    ]);
  });
});

describe('parseWearDate', () => {
  it('parses bare YYYY-MM-DD strings as local midnight', () => {
    const date = parseWearDate('2026-05-10');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(10);
    expect(date.getHours()).toBe(0);
  });

  it('passes through full ISO timestamps untouched', () => {
    const date = parseWearDate('2026-05-10T15:30:00Z');

    expect(date.getTime()).toBe(new Date('2026-05-10T15:30:00Z').getTime());
  });
});

describe('formatRelativeWearDate', () => {
  // Anchor `now` at noon local time so day-rollover edge cases don't depend
  // on the test runner's clock.
  const now = new Date(2026, 4, 10, 12, 0, 0); // 2026-05-10 12:00 local

  it('returns "Today" for the same calendar day', () => {
    expect(formatRelativeWearDate('2026-05-10', { now })).toBe('Today');
  });

  it('returns "Today" for a date-only string regardless of UTC offset (no off-by-one)', () => {
    // Pre-fix, parsing '2026-05-10' as UTC midnight would render as
    // 2026-05-09 in any negative-UTC offset, returning "Yesterday". Using
    // local-midnight parsing keeps it on the intended day.
    expect(formatRelativeWearDate('2026-05-10', { now })).toBe('Today');
  });

  it('returns "Yesterday" for a one-day diff', () => {
    expect(formatRelativeWearDate('2026-05-09', { now })).toBe('Yesterday');
  });

  it('returns "N days ago" by default for 2 to 6 day diffs', () => {
    expect(formatRelativeWearDate('2026-05-07', { now })).toBe('3 days ago');
    expect(formatRelativeWearDate('2026-05-04', { now })).toBe('6 days ago');
  });

  it('returns "Nd ago" in short style', () => {
    expect(formatRelativeWearDate('2026-05-07', { now, style: 'short' })).toBe('3d ago');
  });

  it('falls back to a localized month-day for diffs >= 7 days', () => {
    expect(formatRelativeWearDate('2026-04-15', { now })).toBe('Apr 15');
  });
});
