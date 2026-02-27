import { z } from 'zod';

export const TRIP_TYPES = [
  'business',
  'leisure',
  'adventure',
  'beach',
  'city',
  'wedding',
  'conference',
  'other',
] as const;

export const PACKING_LIST_STATUSES = ['draft', 'finalized', 'packed'] as const;

export const createTripSchema = z
  .object({
    name: z.string().min(1).max(200),
    destination: z.string().min(1).max(500),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
    trip_type: z.enum(TRIP_TYPES),
    notes: z.string().max(2000).nullable().optional(),
    tags: z.array(z.string().max(50)).default([]),
  })
  .refine(
    (data) => new Date(data.end_date) >= new Date(data.start_date),
    { message: 'End date must be on or after start date', path: ['end_date'] }
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const createPackingListSchema = z.object({
  trip_id: z.string().uuid(),
  status: z.enum(PACKING_LIST_STATUSES).default('draft'),
  notes: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
  item_ids: z.array(z.string().uuid()).default([]),
  outfit_ids: z.array(z.string().uuid()).default([]),
});

export type CreatePackingListInput = z.infer<typeof createPackingListSchema>;
