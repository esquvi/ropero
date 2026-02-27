'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createItemSchema, type CreateItemInput } from '@ropero/core';

type ItemInsert = {
  user_id: string;
  name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  color_primary: string;
  color_secondary: string | null;
  pattern: string | null;
  size: string | null;
  material: string | null;
  season: string[];
  formality: number;
  photo_urls: string[];
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_source: string | null;
  notes: string | null;
  tags: string[];
  status: string;
};

export async function createItem(
  data: CreateItemInput & { photo_urls: string[] }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Validate input
  const validated = createItemSchema.parse(data);

  const insertData: ItemInsert = {
    user_id: user.id,
    name: validated.name,
    brand: validated.brand ?? null,
    category: validated.category,
    subcategory: validated.subcategory ?? null,
    color_primary: validated.color_primary,
    color_secondary: validated.color_secondary ?? null,
    pattern: validated.pattern ?? null,
    size: validated.size ?? null,
    material: validated.material ?? null,
    season: validated.season,
    formality: validated.formality,
    photo_urls: data.photo_urls,
    purchase_date: validated.purchase_date ?? null,
    purchase_price: validated.purchase_price ?? null,
    purchase_source: validated.purchase_source ?? null,
    notes: validated.notes ?? null,
    tags: validated.tags,
    status: 'active',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('items') as any).insert(insertData);

  if (error) {
    console.error('Error creating item:', error);
    throw new Error('Failed to create item');
  }

  redirect('/wardrobe');
}
