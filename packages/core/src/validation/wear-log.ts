import { z } from 'zod';

export const WEATHER_CONDITIONS = [
  'sunny',
  'cloudy',
  'rainy',
  'snowy',
  'windy',
  'hot',
  'cold',
  'mild',
] as const;

export const createWearLogSchema = z.object({
  item_id: z.string().uuid(),
  outfit_id: z.string().uuid().nullable().optional(),
  worn_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format')
    .default(() => new Date().toISOString().split('T')[0]),
  occasion: z.string().max(100).nullable().optional(),
  weather_conditions: z.enum(WEATHER_CONDITIONS).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
});

export type CreateWearLogInput = z.infer<typeof createWearLogSchema>;
