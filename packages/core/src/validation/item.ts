import { z } from 'zod';

export const ITEM_CATEGORIES = [
  'tops',
  'bottoms',
  'outerwear',
  'shoes',
  'accessories',
  'dresses',
  'activewear',
  'swimwear',
  'sleepwear',
  'underwear',
] as const;

export const ITEM_STATUSES = ['active', 'archived', 'donated', 'sold'] as const;
export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export const PATTERNS = [
  'solid',
  'striped',
  'plaid',
  'floral',
  'dotted',
  'geometric',
  'abstract',
  'other',
] as const;

export const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(100).nullable().optional(),
  category: z.enum(ITEM_CATEGORIES),
  subcategory: z.string().max(100).nullable().optional(),
  color_primary: z.string().min(1).max(50),
  color_secondary: z.string().max(50).nullable().optional(),
  pattern: z.enum(PATTERNS).nullable().optional(),
  size: z.string().max(20).nullable().optional(),
  material: z.string().max(100).nullable().optional(),
  season: z.array(z.enum(SEASONS)).default([]),
  formality: z.number().int().min(1).max(5).default(3),
  purchase_date: z.string().nullable().optional(),
  purchase_price: z.number().nonnegative().nullable().optional(),
  purchase_source: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreateItemFormInput = z.input<typeof createItemSchema>;
