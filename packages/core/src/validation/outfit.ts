import { z } from 'zod';

export const OCCASIONS = [
  'work',
  'casual',
  'formal',
  'date',
  'party',
  'wedding',
  'travel',
  'sport',
  'other',
] as const;

export const createOutfitSchema = z.object({
  name: z.string().min(1).max(200),
  occasion: z.enum(OCCASIONS).nullable().optional(),
  photo_url: z.string().url().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
  item_ids: z.array(z.string().uuid()).min(1, 'At least one item is required'),
});

export type CreateOutfitInput = z.infer<typeof createOutfitSchema>;
