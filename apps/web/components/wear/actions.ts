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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('wear_logs') as any).insert(insertData);

  if (error) {
    console.error('Error logging wear:', error);
    throw new Error('Failed to log wear');
  }

  // The database trigger automatically updates items.times_worn and items.last_worn_at
  revalidatePath(`/wardrobe/${input.itemId}`);
  revalidatePath('/wardrobe');
}
