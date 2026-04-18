'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface CreateOutfitInput {
  name: string;
  occasion: string | null;
  rating: number | null;
  notes: string | null;
  tags: string[];
  itemIds: string[];
}

export async function createOutfit(input: CreateOutfitInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Create the outfit
  const outfitData = {
    user_id: user.id,
    name: input.name,
    occasion: input.occasion,
    rating: input.rating,
    notes: input.notes,
    tags: input.tags,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: outfit, error: outfitError } = await (supabase.from('outfits') as any)
    .insert(outfitData)
    .select('id')
    .single();

  if (outfitError || !outfit) {
    console.error('Error creating outfit:', outfitError);
    throw new Error('Failed to create outfit');
  }

  // Create outfit_items entries
  if (input.itemIds.length > 0) {
    const outfitItems = input.itemIds.map((itemId) => ({
      outfit_id: outfit.id,
      item_id: itemId,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await (supabase.from('outfit_items') as any).insert(
      outfitItems
    );

    if (itemsError) {
      console.error('Error creating outfit items:', itemsError);
      throw new Error('Failed to add items to outfit');
    }
  }

  revalidatePath('/outfits');
}

export async function deleteOutfit(outfitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // outfit_items rows cascade via FK ON DELETE CASCADE.
  // wear_logs.outfit_id is ON DELETE SET NULL, so per-item wear history is preserved.
  const { error } = await (
    supabase.from('outfits') as ReturnType<typeof supabase.from>
  )
    .delete()
    .eq('id', outfitId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting outfit:', error);
    throw new Error('Failed to delete outfit');
  }

  revalidatePath('/outfits');
  redirect('/outfits');
}
