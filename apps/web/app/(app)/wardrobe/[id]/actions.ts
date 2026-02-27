'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createItemSchema, type CreateItemInput } from '@ropero/core';

type ItemUpdate = {
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
};

export async function updateItem(
  id: string,
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

  const updateData: ItemUpdate = {
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
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('items') as any)
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating item:', error);
    throw new Error('Failed to update item');
  }

  revalidatePath(`/wardrobe/${id}`);
  revalidatePath('/wardrobe');
}

export async function updateItemStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('items') as any)
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating item status:', error);
    throw new Error('Failed to update item status');
  }

  revalidatePath(`/wardrobe/${id}`);
  revalidatePath('/wardrobe');
}
