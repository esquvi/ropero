import { describe, it, expect } from 'vitest';
import {
  createTripSchema,
  createPackingListSchema,
  TRIP_TYPES,
  PACKING_LIST_STATUSES,
} from '../trip';

describe('createTripSchema', () => {
  const validTrip = {
    name: 'Paris Vacation',
    destination: 'Paris, France',
    start_date: '2026-06-01',
    end_date: '2026-06-08',
    trip_type: 'leisure',
  };

  it('validates a complete valid trip', () => {
    const result = createTripSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
  });

  it('validates with all optional fields', () => {
    const fullTrip = {
      ...validTrip,
      notes: 'Bring light layers',
      tags: ['europe', 'summer'],
    };
    const result = createTripSchema.safeParse(fullTrip);
    expect(result.success).toBe(true);
  });

  it('validates when start_date equals end_date', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      start_date: '2026-06-01',
      end_date: '2026-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('fails when name is missing', () => {
    const { name, ...tripWithoutName } = validTrip;
    const result = createTripSchema.safeParse(tripWithoutName);
    expect(result.success).toBe(false);
  });

  it('fails when destination is missing', () => {
    const { destination, ...tripWithoutDestination } = validTrip;
    const result = createTripSchema.safeParse(tripWithoutDestination);
    expect(result.success).toBe(false);
  });

  it('fails when start_date is missing', () => {
    const { start_date, ...tripWithoutStart } = validTrip;
    const result = createTripSchema.safeParse(tripWithoutStart);
    expect(result.success).toBe(false);
  });

  it('fails when end_date is missing', () => {
    const { end_date, ...tripWithoutEnd } = validTrip;
    const result = createTripSchema.safeParse(tripWithoutEnd);
    expect(result.success).toBe(false);
  });

  it('fails when trip_type is missing', () => {
    const { trip_type, ...tripWithoutType } = validTrip;
    const result = createTripSchema.safeParse(tripWithoutType);
    expect(result.success).toBe(false);
  });

  it('fails when name is empty', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails when name exceeds max length', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      name: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('fails when destination is empty', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      destination: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails when destination exceeds max length', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      destination: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('fails when start_date is not YYYY-MM-DD format', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      start_date: '06/01/2026',
    });
    expect(result.success).toBe(false);
  });

  it('fails when end_date is not YYYY-MM-DD format', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      end_date: '2026-6-8',
    });
    expect(result.success).toBe(false);
  });

  it('fails when trip_type is invalid', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      trip_type: 'staycation',
    });
    expect(result.success).toBe(false);
  });

  it('fails when end_date is before start_date', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      start_date: '2026-06-10',
      end_date: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('fails when notes exceed max length', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      notes: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('fails when a tag exceeds max length', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      tags: ['x'.repeat(51)],
    });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array when not provided', () => {
    const result = createTripSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts every value in TRIP_TYPES', () => {
    for (const trip_type of TRIP_TYPES) {
      const result = createTripSchema.safeParse({
        ...validTrip,
        trip_type,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('createPackingListSchema', () => {
  const validPackingList = {
    trip_id: '11111111-1111-1111-1111-111111111111',
  };

  it('validates a minimal valid packing list', () => {
    const result = createPackingListSchema.safeParse(validPackingList);
    expect(result.success).toBe(true);
  });

  it('validates with all optional fields', () => {
    const fullPackingList = {
      ...validPackingList,
      status: 'finalized',
      notes: 'Double check shoes',
      tags: ['weekend'],
      item_ids: ['22222222-2222-2222-2222-222222222222'],
      outfit_ids: ['33333333-3333-3333-3333-333333333333'],
    };
    const result = createPackingListSchema.safeParse(fullPackingList);
    expect(result.success).toBe(true);
  });

  it('fails when trip_id is missing', () => {
    const result = createPackingListSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('fails when trip_id is not a valid uuid', () => {
    const result = createPackingListSchema.safeParse({
      trip_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('fails when status is invalid', () => {
    const result = createPackingListSchema.safeParse({
      ...validPackingList,
      status: 'shipped',
    });
    expect(result.success).toBe(false);
  });

  it('fails when notes exceed max length', () => {
    const result = createPackingListSchema.safeParse({
      ...validPackingList,
      notes: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('fails when a tag exceeds max length', () => {
    const result = createPackingListSchema.safeParse({
      ...validPackingList,
      tags: ['x'.repeat(51)],
    });
    expect(result.success).toBe(false);
  });

  it('fails when an item_id is not a valid uuid', () => {
    const result = createPackingListSchema.safeParse({
      ...validPackingList,
      item_ids: ['not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });

  it('fails when an outfit_id is not a valid uuid', () => {
    const result = createPackingListSchema.safeParse({
      ...validPackingList,
      outfit_ids: ['not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });

  it('defaults status to draft when not provided', () => {
    const result = createPackingListSchema.safeParse(validPackingList);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('draft');
    }
  });

  it('defaults tags, item_ids, and outfit_ids to empty arrays', () => {
    const result = createPackingListSchema.safeParse(validPackingList);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.item_ids).toEqual([]);
      expect(result.data.outfit_ids).toEqual([]);
    }
  });

  it('accepts every value in PACKING_LIST_STATUSES', () => {
    for (const status of PACKING_LIST_STATUSES) {
      const result = createPackingListSchema.safeParse({
        ...validPackingList,
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('constants', () => {
  it('exports valid TRIP_TYPES', () => {
    expect(TRIP_TYPES).toContain('business');
    expect(TRIP_TYPES).toContain('leisure');
    expect(TRIP_TYPES).toContain('adventure');
    expect(TRIP_TYPES).toContain('beach');
    expect(TRIP_TYPES).toContain('city');
    expect(TRIP_TYPES).toContain('wedding');
    expect(TRIP_TYPES).toContain('conference');
    expect(TRIP_TYPES).toContain('other');
  });

  it('exports valid PACKING_LIST_STATUSES', () => {
    expect(PACKING_LIST_STATUSES).toContain('draft');
    expect(PACKING_LIST_STATUSES).toContain('finalized');
    expect(PACKING_LIST_STATUSES).toContain('packed');
  });
});
