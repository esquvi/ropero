'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function toggleSignature(itemId: string, current: boolean) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('items') as any)
    .update({ is_signature: !current })
    .eq('id', itemId);

  if (error) {
    console.error('toggleSignature failed', error);
    throw new Error('Could not update piece');
  }

  revalidatePath('/wardrobe');
}
