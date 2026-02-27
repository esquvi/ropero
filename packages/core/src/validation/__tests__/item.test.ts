import { describe, it, expect } from 'vitest';
import { createItemSchema, ITEM_CATEGORIES, ITEM_STATUSES, SEASONS } from '../item';

describe('createItemSchema', () => {
  const validItem = {
    name: 'White Oxford Shirt',
    category: 'tops',
    color_primary: 'white',
    formality: 4,
    season: ['spring', 'fall'],
  };

  it('validates a complete valid item', () => {
    const result = createItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('validates with all optional fields', () => {
    const fullItem = {
      ...validItem,
      brand: 'Brooks Brothers',
      subcategory: 'dress shirt',
      color_secondary: 'blue',
      pattern: 'striped',
      size: 'M',
      material: 'cotton',
      purchase_date: '2024-01-15',
      purchase_price: 89.99,
      purchase_source: 'Nordstrom',
      notes: 'Great for work',
      tags: ['classic', 'work'],
    };
    const result = createItemSchema.safeParse(fullItem);
    expect(result.success).toBe(true);
  });

  it('fails when name is missing', () => {
    const { name, ...itemWithoutName } = validItem;
    const result = createItemSchema.safeParse(itemWithoutName);
    expect(result.success).toBe(false);
  });

  it('fails when category is missing', () => {
    const { category, ...itemWithoutCategory } = validItem;
    const result = createItemSchema.safeParse(itemWithoutCategory);
    expect(result.success).toBe(false);
  });

  it('fails when color_primary is missing', () => {
    const { color_primary, ...itemWithoutColor } = validItem;
    const result = createItemSchema.safeParse(itemWithoutColor);
    expect(result.success).toBe(false);
  });

  it('fails when category is invalid', () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });

  it('fails when formality is below 1', () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      formality: 0,
    });
    expect(result.success).toBe(false);
  });

  it('fails when formality is above 5', () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      formality: 6,
    });
    expect(result.success).toBe(false);
  });

  it('fails when season contains invalid value', () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      season: ['spring', 'invalid_season'],
    });
    expect(result.success).toBe(false);
  });

  it('fails when name exceeds max length', () => {
    const result = createItemSchema.safeParse({
      ...validItem,
      name: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('defaults formality to 3 when not provided', () => {
    const { formality, ...itemWithoutFormality } = validItem;
    const result = createItemSchema.safeParse(itemWithoutFormality);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.formality).toBe(3);
    }
  });

  it('defaults season to empty array when not provided', () => {
    const { season, ...itemWithoutSeason } = validItem;
    const result = createItemSchema.safeParse(itemWithoutSeason);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.season).toEqual([]);
    }
  });

  it('defaults tags to empty array when not provided', () => {
    const result = createItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});

describe('constants', () => {
  it('exports valid ITEM_CATEGORIES', () => {
    expect(ITEM_CATEGORIES).toContain('tops');
    expect(ITEM_CATEGORIES).toContain('bottoms');
    expect(ITEM_CATEGORIES).toContain('shoes');
  });

  it('exports valid ITEM_STATUSES', () => {
    expect(ITEM_STATUSES).toContain('active');
    expect(ITEM_STATUSES).toContain('archived');
    expect(ITEM_STATUSES).toContain('donated');
    expect(ITEM_STATUSES).toContain('sold');
  });

  it('exports valid SEASONS', () => {
    expect(SEASONS).toContain('spring');
    expect(SEASONS).toContain('summer');
    expect(SEASONS).toContain('fall');
    expect(SEASONS).toContain('winter');
  });
});
