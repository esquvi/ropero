'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface CreateTripInput {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
}

export async function createTrip(input: CreateTripInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const tripData = {
    user_id: user.id,
    name: input.name,
    destination: input.destination,
    start_date: input.start_date,
    end_date: input.end_date,
    trip_type: input.trip_type,
    tags: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: trip, error } = await (supabase.from('trips') as any)
    .insert(tripData)
    .select('id')
    .single();

  if (error || !trip) {
    console.error('Error creating trip:', error);
    throw new Error('Failed to create trip');
  }

  // Create a default packing list for the trip
  const packingListData = {
    trip_id: trip.id,
    user_id: user.id,
    status: 'draft',
    tags: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: packingError } = await (supabase.from('packing_lists') as any)
    .insert(packingListData);

  if (packingError) {
    console.error('Error creating packing list:', packingError);
    // Don't throw - trip was created successfully
  }

  revalidatePath('/trips');
  return trip;
}

interface TogglePackingItemInput {
  packingListId: string;
  itemId: string;
  packed: boolean;
}

export async function togglePackingItem(input: TogglePackingItemInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('packing_list_items') as any)
    .update({ packed: input.packed })
    .eq('packing_list_id', input.packingListId)
    .eq('item_id', input.itemId);

  if (error) {
    console.error('Error toggling packing item:', error);
    throw new Error('Failed to update packing item');
  }

  revalidatePath('/trips');
}

interface AddItemToPackingListInput {
  packingListId: string;
  itemId: string;
}

export async function addItemToPackingList(input: AddItemToPackingListInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const insertData = {
    packing_list_id: input.packingListId,
    item_id: input.itemId,
    packed: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('packing_list_items') as any)
    .insert(insertData);

  if (error) {
    console.error('Error adding item to packing list:', error);
    throw new Error('Failed to add item to packing list');
  }

  revalidatePath('/trips');
}

export async function removeItemFromPackingList(input: AddItemToPackingListInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('packing_list_items') as any)
    .delete()
    .eq('packing_list_id', input.packingListId)
    .eq('item_id', input.itemId);

  if (error) {
    console.error('Error removing item from packing list:', error);
    throw new Error('Failed to remove item from packing list');
  }

  revalidatePath('/trips');
}
