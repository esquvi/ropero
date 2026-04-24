import { describe, it, expect } from 'vitest';
import { createOutfitSchema, OCCASIONS } from '../outfit';

describe('createOutfitSchema', () => {
  const validOutfit = {
    name: 'Weekend Casual',
    item_ids: ['11111111-1111-1111-1111-111111111111'],
  };

  it('validates a complete valid outfit', () => {
    const result = createOutfitSchema.safeParse(validOutfit);
    expect(result.success).toBe(true);
  });

  it('validates with all optional fields', () => {
    const fullOutfit = {
      ...validOutfit,
      occasion: 'work',
      photo_url: 'https://example.com/photo.jpg',
      rating: 4,
      notes: 'Great for client meetings',
      tags: ['favorite', 'spring'],
      item_ids: [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ],
    };
    const result = createOutfitSchema.safeParse(fullOutfit);
    expect(result.success).toBe(true);
  });

  it('fails when name is missing', () => {
    const { name, ...outfitWithoutName } = validOutfit;
    const result = createOutfitSchema.safeParse(outfitWithoutName);
    expect(result.success).toBe(false);
  });

  it('fails when item_ids is missing', () => {
    const { item_ids, ...outfitWithoutItems } = validOutfit;
    const result = createOutfitSchema.safeParse(outfitWithoutItems);
    expect(result.success).toBe(false);
  });

  it('fails when name is empty', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('fails when name exceeds max length', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      name: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('fails when occasion is invalid', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      occasion: 'brunch',
    });
    expect(result.success).toBe(false);
  });

  it('fails when photo_url is not a valid URL', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      photo_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('fails when rating is below 1', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it('fails when rating is above 5', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it('fails when rating is not an integer', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      rating: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it('fails when notes exceed max length', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      notes: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('fails when a tag exceeds max length', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      tags: ['x'.repeat(51)],
    });
    expect(result.success).toBe(false);
  });

  it('fails when item_ids is empty', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      item_ids: [],
    });
    expect(result.success).toBe(false);
  });

  it('fails when an item_id is not a valid uuid', () => {
    const result = createOutfitSchema.safeParse({
      ...validOutfit,
      item_ids: ['not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array when not provided', () => {
    const result = createOutfitSchema.safeParse(validOutfit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts every value in OCCASIONS', () => {
    for (const occasion of OCCASIONS) {
      const result = createOutfitSchema.safeParse({
        ...validOutfit,
        occasion,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('constants', () => {
  it('exports 10 occasions', () => {
    expect(OCCASIONS).toHaveLength(10);
  });

  it('exports valid OCCASIONS', () => {
    expect(OCCASIONS).toContain('work');
    expect(OCCASIONS).toContain('casual');
    expect(OCCASIONS).toContain('formal');
    expect(OCCASIONS).toContain('date');
    expect(OCCASIONS).toContain('party');
    expect(OCCASIONS).toContain('wedding');
    expect(OCCASIONS).toContain('travel');
    expect(OCCASIONS).toContain('exercise');
    expect(OCCASIONS).toContain('interview');
    expect(OCCASIONS).toContain('other');
  });
});
