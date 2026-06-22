import { describe, it, expect } from 'vitest';
import {
  currentSeason,
  isInSeason,
  sortByDormancy,
  selectBackInSeason,
  dormancyLabel,
  lastWornSince,
  type RediscoveryPiece,
} from '../dormancy';

function piece(overrides: Partial<RediscoveryPiece> & Pick<RediscoveryPiece, 'id'>): RediscoveryPiece {
  return {
    id: overrides.id,
    season: overrides.season ?? [],
    last_worn_at: overrides.last_worn_at ?? null,
  };
}

describe('currentSeason', () => {
  it('maps months to northern-hemisphere seasons', () => {
    expect(currentSeason(new Date(2026, 0, 15))).toBe('winter'); // Jan
    expect(currentSeason(new Date(2026, 1, 15))).toBe('winter'); // Feb
    expect(currentSeason(new Date(2026, 2, 15))).toBe('spring'); // Mar
    expect(currentSeason(new Date(2026, 4, 15))).toBe('spring'); // May
    expect(currentSeason(new Date(2026, 5, 15))).toBe('summer'); // Jun
    expect(currentSeason(new Date(2026, 7, 15))).toBe('summer'); // Aug
    expect(currentSeason(new Date(2026, 8, 15))).toBe('fall'); // Sep
    expect(currentSeason(new Date(2026, 10, 15))).toBe('fall'); // Nov
    expect(currentSeason(new Date(2026, 11, 15))).toBe('winter'); // Dec
  });
});

describe('isInSeason', () => {
  it('matches when the season is included', () => {
    expect(isInSeason(['summer'], 'summer')).toBe(true);
    expect(isInSeason(['summer'], 'winter')).toBe(false);
    expect(isInSeason(['spring', 'fall'], 'fall')).toBe(true);
  });

  it('treats an empty season array as always in-season', () => {
    expect(isInSeason([], 'summer')).toBe(true);
    expect(isInSeason([], 'winter')).toBe(true);
  });
});

describe('sortByDormancy', () => {
  const june = new Date(2026, 5, 15); // summer

  it('orders in-season pieces ahead of out-of-season, regardless of raw recency', () => {
    const rows = [
      piece({ id: 'wool-coat', season: ['winter'], last_worn_at: '2026-03-01' }), // out of season, long ago
      piece({ id: 'linen-shirt', season: ['summer'], last_worn_at: '2026-05-20' }), // in season, more recent
    ];

    const result = sortByDormancy(rows, june);

    expect(result.map((p) => p.id)).toEqual(['linen-shirt', 'wool-coat']);
    expect(result.find((p) => p.id === 'wool-coat')!.outOfSeason).toBe(true);
    expect(result.find((p) => p.id === 'linen-shirt')!.outOfSeason).toBe(false);
  });

  it('ranks a never-worn in-season piece ahead of a worn one', () => {
    const rows = [
      piece({ id: 'worn', season: ['summer'], last_worn_at: '2026-05-01' }),
      piece({ id: 'never', season: ['summer'], last_worn_at: null }),
    ];

    const result = sortByDormancy(rows, june);

    expect(result.map((p) => p.id)).toEqual(['never', 'worn']);
  });

  it('orders worn in-season pieces oldest-last-worn first', () => {
    const rows = [
      piece({ id: 'recent', season: ['summer'], last_worn_at: '2026-05-20' }),
      piece({ id: 'older', season: ['summer'], last_worn_at: '2026-01-10' }),
    ];

    const result = sortByDormancy(rows, june);

    expect(result.map((p) => p.id)).toEqual(['older', 'recent']);
  });

  it('breaks ties on identical last_worn_at by id ascending', () => {
    const rows = [
      piece({ id: 'b', season: ['summer'], last_worn_at: '2026-05-01' }),
      piece({ id: 'a', season: ['summer'], last_worn_at: '2026-05-01' }),
    ];

    const result = sortByDormancy(rows, june);

    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('treats empty-season pieces as in-season', () => {
    const rows = [
      piece({ id: 'all-season', season: [], last_worn_at: '2026-01-01' }),
      piece({ id: 'winter', season: ['winter'], last_worn_at: '2026-01-01' }),
    ];

    const result = sortByDormancy(rows, june);

    // all-season (in-season) precedes the out-of-season winter piece
    expect(result.map((p) => p.id)).toEqual(['all-season', 'winter']);
    expect(result.find((p) => p.id === 'all-season')!.outOfSeason).toBe(false);
  });
});

describe('selectBackInSeason', () => {
  const october = new Date(2026, 9, 15); // fall, season window starts 2026-09-01

  it('returns in-season pieces not worn since the season window began', () => {
    const rows = [
      piece({ id: 'jacket', season: ['fall'], last_worn_at: '2025-11-02' }), // last fall, not this season
      piece({ id: 'worn-this-fall', season: ['fall'], last_worn_at: '2026-09-20' }), // worn this season -> excluded
      piece({ id: 'summer-tee', season: ['summer'], last_worn_at: null }), // out of season -> excluded
    ];

    const result = selectBackInSeason(rows, october, 3);

    expect(result.map((p) => p.id)).toEqual(['jacket']);
  });

  it('includes never-worn in-season pieces and orders them first', () => {
    const rows = [
      piece({ id: 'worn-last-year', season: ['fall'], last_worn_at: '2025-10-01' }),
      piece({ id: 'never', season: ['fall'], last_worn_at: null }),
    ];

    const result = selectBackInSeason(rows, october, 3);

    expect(result.map((p) => p.id)).toEqual(['never', 'worn-last-year']);
  });

  it('caps the result at the limit, deterministically', () => {
    const rows = [
      piece({ id: 'p4', season: ['fall'], last_worn_at: '2025-12-01' }),
      piece({ id: 'p1', season: ['fall'], last_worn_at: '2025-01-01' }),
      piece({ id: 'p3', season: ['fall'], last_worn_at: '2025-09-01' }),
      piece({ id: 'p2', season: ['fall'], last_worn_at: '2025-06-01' }),
    ];

    const first = selectBackInSeason(rows, october, 2);
    const second = selectBackInSeason(rows, october, 2);

    expect(first.map((p) => p.id)).toEqual(['p1', 'p2']); // oldest two
    expect(second.map((p) => p.id)).toEqual(first.map((p) => p.id)); // stable
  });

  it('returns an empty array when nothing qualifies', () => {
    const rows = [
      piece({ id: 'worn-this-fall', season: ['fall'], last_worn_at: '2026-10-01' }),
      piece({ id: 'summer', season: ['summer'], last_worn_at: null }),
    ];

    expect(selectBackInSeason(rows, october, 3)).toEqual([]);
  });

  it('treats winter as the Dec-Feb window spanning the year boundary', () => {
    const january = new Date(2026, 0, 15); // winter, window starts 2025-12-01
    const rows = [
      piece({ id: 'worn-in-dec', season: ['winter'], last_worn_at: '2025-12-10' }), // this winter -> excluded
      piece({ id: 'worn-last-winter', season: ['winter'], last_worn_at: '2025-02-01' }), // before window -> included
    ];

    const result = selectBackInSeason(rows, january, 3);

    expect(result.map((p) => p.id)).toEqual(['worn-last-winter']);
  });
});

describe('lastWornSince', () => {
  const june2026 = new Date(2026, 5, 15);

  it('returns null for a never-worn piece', () => {
    expect(lastWornSince(null, june2026)).toBeNull();
  });

  it('returns just the month for a current-year date', () => {
    expect(lastWornSince('2026-02-09', june2026)).toBe('February');
  });

  it('appends the year for a prior-year date', () => {
    expect(lastWornSince('2024-10-20', june2026)).toBe('October 2024');
  });

  it('does not shift the month at a boundary (timezone-safe)', () => {
    expect(lastWornSince('2026-01-31', june2026)).toBe('January');
  });
});

describe('dormancyLabel', () => {
  const june2026 = new Date(2026, 5, 15);

  it('says "not worn yet" for a never-worn piece', () => {
    expect(dormancyLabel(null, june2026)).toBe('not worn yet');
  });

  it('names the month for a date in the current year', () => {
    expect(dormancyLabel('2026-02-09', june2026)).toBe('not worn since February');
  });

  it('includes the year for a prior-year date', () => {
    expect(dormancyLabel('2024-10-20', june2026)).toBe('not worn since October 2024');
  });

  it('does not shift the month at a boundary (timezone-safe)', () => {
    // A naive new Date('2026-01-31') parses as UTC midnight and can render as
    // December 30 in negative-offset zones. The label must stay January.
    expect(dormancyLabel('2026-01-31', june2026)).toBe('not worn since January');
    expect(dormancyLabel('2026-03-01', june2026)).toBe('not worn since March');
  });
});
