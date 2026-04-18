'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface LogWearInput {
  itemId: string;
  wornAt: string;
  occasion: string | null;
  notes: string | null;
}

export async function logWear(input: LogWearInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const insertData = {
    user_id: user.id,
    item_id: input.itemId,
    worn_at: input.wornAt,
    occasion: input.occasion,
    notes: input.notes,
  };

  const { error } = await (
    supabase.from('wear_logs') as ReturnType<typeof supabase.from>
  ).insert(insertData);

  if (error) {
    console.error('Error logging wear:', error);
    throw new Error('Failed to log wear');
  }

  // The database trigger automatically updates items.times_worn and items.last_worn_at
  revalidatePath(`/wardrobe/${input.itemId}`);
  revalidatePath('/wardrobe');
}

interface WearOutfitInput {
  outfitId: string;
  wornAt: string;
  occasion: string | null;
  notes: string | null;
}

interface OutfitItemRow {
  item_id: string;
}

export async function wearOutfit(input: WearOutfitInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: itemRows, error: itemsError } = await (
    supabase.from('outfit_items') as ReturnType<typeof supabase.from>
  )
    .select('item_id')
    .eq('outfit_id', input.outfitId);

  if (itemsError) {
    console.error('Error loading outfit items:', itemsError);
    throw new Error('Failed to load outfit items');
  }

  const items = (itemRows ?? []) as unknown as OutfitItemRow[];

  if (items.length === 0) {
    throw new Error('This outfit has no items to log');
  }

  const rows = items.map((it) => ({
    user_id: user.id,
    item_id: it.item_id,
    outfit_id: input.outfitId,
    worn_at: input.wornAt,
    occasion: input.occasion,
    notes: input.notes,
  }));

  const { error: insertError } = await (
    supabase.from('wear_logs') as ReturnType<typeof supabase.from>
  ).insert(rows);

  if (insertError) {
    console.error('Error logging outfit wear:', insertError);
    throw new Error('Failed to log outfit wear');
  }

  // The database trigger automatically updates items.times_worn and items.last_worn_at
  revalidatePath('/outfits');
  revalidatePath(`/outfits/${input.outfitId}`);
  revalidatePath('/wardrobe');
  revalidatePath('/dashboard');
}
