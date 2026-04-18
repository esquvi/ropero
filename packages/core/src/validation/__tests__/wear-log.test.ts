import { describe, it, expect } from 'vitest';
import { createWearLogSchema, WEATHER_CONDITIONS } from '../wear-log';

describe('createWearLogSchema', () => {
  const validWearLog = {
    item_id: '11111111-1111-1111-1111-111111111111',
  };

  it('validates a minimal valid wear log', () => {
    const result = createWearLogSchema.safeParse(validWearLog);
    expect(result.success).toBe(true);
  });

  it('validates with all optional fields', () => {
    const fullWearLog = {
      ...validWearLog,
      outfit_id: '22222222-2222-2222-2222-222222222222',
      worn_at: '2026-04-18',
      occasion: 'coffee with friends',
      weather_conditions: 'sunny',
      notes: 'Comfortable all day',
      tags: ['casual', 'weekend'],
    };
    const result = createWearLogSchema.safeParse(fullWearLog);
    expect(result.success).toBe(true);
  });

  it('fails when item_id is missing', () => {
    const result = createWearLogSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('fails when item_id is not a valid uuid', () => {
    const result = createWearLogSchema.safeParse({
      item_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('fails when outfit_id is not a valid uuid', () => {
    const result = createWearLogSchema.safeParse({
      ...validWearLog,
      outfit_id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('fails when worn_at is not YYYY-MM-DD format', () => {
    const result = createWearLogSchema.safeParse({
      ...validWearLog,
      worn_at: '04/18/2026',
    });
    expect(result.success).toBe(false);
  });

  it('fails when occasion exceeds max length', () => {
    const result = createWearLogSchema.safeParse({
      ...validWearLog,
      occasion: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('fails when weather_conditions is invalid', () => {
    const result = createWearLogSchema.safeParse({
      ...validWearLog,
      weather_conditions: 'foggy',
    });
    expect(result.success).toBe(false);
  });

  it('fails when notes exceed max length', () => {
    const result = createWearLogSchema.safeParse({
      ...validWearLog,
      notes: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('fails when a tag exceeds max length', () => {
    const result = createWearLogSchema.safeParse({
      ...validWearLog,
      tags: ['x'.repeat(51)],
    });
    expect(result.success).toBe(false);
  });

  it("defaults worn_at to today's date when not provided", () => {
    const today = new Date().toISOString().split('T')[0];
    const result = createWearLogSchema.safeParse(validWearLog);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.worn_at).toBe(today);
    }
  });

  it('defaults tags to empty array when not provided', () => {
    const result = createWearLogSchema.safeParse(validWearLog);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts every value in WEATHER_CONDITIONS', () => {
    for (const weather_conditions of WEATHER_CONDITIONS) {
      const result = createWearLogSchema.safeParse({
        ...validWearLog,
        weather_conditions,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('constants', () => {
  it('exports valid WEATHER_CONDITIONS', () => {
    expect(WEATHER_CONDITIONS).toContain('sunny');
    expect(WEATHER_CONDITIONS).toContain('cloudy');
    expect(WEATHER_CONDITIONS).toContain('rainy');
    expect(WEATHER_CONDITIONS).toContain('snowy');
    expect(WEATHER_CONDITIONS).toContain('windy');
    expect(WEATHER_CONDITIONS).toContain('hot');
    expect(WEATHER_CONDITIONS).toContain('cold');
    expect(WEATHER_CONDITIONS).toContain('mild');
  });
});
