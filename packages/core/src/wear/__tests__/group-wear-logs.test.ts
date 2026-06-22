import { describe, it, expect } from 'vitest';
import {
  groupWearLogs,
  MAX_ACTIVITY_ENTRIES,
  type WearLogRow,
} from '../group-wear-logs';

// Minimal row factory. Defaults to a standalone item wear; pass `outfit_id`
// (and optionally `outfit_name`) to make it part of an outfit group.
function row(overrides: Partial<WearLogRow> & Pick<WearLogRow, 'id'>): WearLogRow {
  return {
    id: overrides.id,
    worn_at: overrides.worn_at ?? '2026-06-01',
    occasion: overrides.occasion ?? null,
    outfit_id: overrides.outfit_id ?? null,
    items: overrides.items ?? { name: `Item ${overrides.id}`, category: 'tops' },
    outfits: overrides.outfits ?? null,
  };
}

describe('groupWearLogs', () => {
  it('passes standalone item rows through as item entries, preserving order and occasion', () => {
    const rows = [
      row({ id: 'a', occasion: 'work', items: { name: 'Shirt', category: 'tops' } }),
      row({ id: 'b', items: { name: 'Trousers', category: 'bottoms' } }),
    ];

    const result = groupWearLogs(rows);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      kind: 'item',
      key: 'item:a',
      item_name: 'Shirt',
      occasion: 'work',
    });
    expect(result[1]).toMatchObject({ kind: 'item', key: 'item:b', item_name: 'Trousers' });
  });

  it('collapses rows sharing outfit_id + worn_at into one outfit entry with a count', () => {
    const rows = [
      row({ id: '1', outfit_id: 'o1', worn_at: '2026-06-01', outfits: { name: 'Monday Look' } }),
      row({ id: '2', outfit_id: 'o1', worn_at: '2026-06-01', outfits: { name: 'Monday Look' } }),
      row({ id: '3', outfit_id: 'o1', worn_at: '2026-06-01', outfits: { name: 'Monday Look' } }),
    ];

    const result = groupWearLogs(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: 'outfit',
      key: 'o1:2026-06-01',
      outfit_name: 'Monday Look',
      item_count: 3,
    });
  });

  it('keeps the same outfit worn on different days as separate entries', () => {
    const rows = [
      row({ id: '1', outfit_id: 'o1', worn_at: '2026-06-02', outfits: { name: 'Look' } }),
      row({ id: '2', outfit_id: 'o1', worn_at: '2026-06-01', outfits: { name: 'Look' } }),
    ];

    const result = groupWearLogs(rows);

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.key)).toEqual(['o1:2026-06-02', 'o1:2026-06-01']);
  });

  it('returns an empty array for empty input', () => {
    expect(groupWearLogs([])).toEqual([]);
  });

  it('falls back to "Outfit" when the joined outfit name is missing', () => {
    const rows = [row({ id: '1', outfit_id: 'o1', worn_at: '2026-06-01', outfits: null })];

    const result = groupWearLogs(rows);

    expect(result[0]).toMatchObject({ kind: 'outfit', outfit_name: 'Outfit' });
  });

  it('caps the number of entries at the default MAX_ACTIVITY_ENTRIES', () => {
    const rows = Array.from({ length: MAX_ACTIVITY_ENTRIES + 2 }, (_, i) =>
      row({ id: `item-${i}` }),
    );

    const result = groupWearLogs(rows);

    expect(result).toHaveLength(MAX_ACTIVITY_ENTRIES);
  });

  it('increments an existing outfit group after the cap is reached but drops new groups', () => {
    const rows: WearLogRow[] = [
      // First entry is an outfit group worn on day 1.
      row({ id: 'o-first', outfit_id: 'o1', worn_at: '2026-06-01', outfits: { name: 'First' } }),
      // Nine standalone items fill the list up to the cap of 10.
      ...Array.from({ length: MAX_ACTIVITY_ENTRIES - 1 }, (_, i) => row({ id: `fill-${i}` })),
      // After the cap: another row for the SAME outfit group must still increment it.
      row({ id: 'o-late', outfit_id: 'o1', worn_at: '2026-06-01', outfits: { name: 'First' } }),
      // After the cap: a brand-new outfit group must be dropped.
      row({ id: 'o-new', outfit_id: 'o2', worn_at: '2026-06-09', outfits: { name: 'New' } }),
    ];

    const result = groupWearLogs(rows);

    expect(result).toHaveLength(MAX_ACTIVITY_ENTRIES);
    expect(result[0]).toMatchObject({ kind: 'outfit', key: 'o1:2026-06-01', item_count: 2 });
    expect(result.some((e) => e.key === 'o2:2026-06-09')).toBe(false);
  });

  it('honors a custom cap', () => {
    const rows = [row({ id: 'a' }), row({ id: 'b' }), row({ id: 'c' })];

    const result = groupWearLogs(rows, 2);

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.key)).toEqual(['item:a', 'item:b']);
  });

  it('preserves the input order of mixed item and outfit entries', () => {
    const rows = [
      row({ id: 'i1', worn_at: '2026-06-03' }),
      row({ id: 'o1a', outfit_id: 'oX', worn_at: '2026-06-02', outfits: { name: 'X' } }),
      row({ id: 'o1b', outfit_id: 'oX', worn_at: '2026-06-02', outfits: { name: 'X' } }),
      row({ id: 'i2', worn_at: '2026-06-01' }),
    ];

    const result = groupWearLogs(rows);

    expect(result.map((e) => e.key)).toEqual(['item:i1', 'oX:2026-06-02', 'item:i2']);
  });
});
