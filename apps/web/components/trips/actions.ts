'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { suggestPackingItems } from '@ropero/core';
import type { PackableItem, TripContext, WeatherForecast } from '@ropero/core';

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

interface GeneratePackingSuggestionsInput {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  weatherForecast: unknown | null;
}

export async function generatePackingSuggestions(input: GeneratePackingSuggestionsInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch all active items with wear data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items, error: itemsError } = await (supabase.from('items') as any)
    .select('id, name, category, season, formality, times_worn, last_worn_at, color_primary')
    .eq('status', 'active');

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
    throw new Error('Failed to fetch wardrobe items');
  }

  // Fetch items already in packing list to exclude them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: packingList } = await (supabase.from('packing_lists') as any)
    .select('packing_list_items(item_id)')
    .eq('trip_id', input.tripId)
    .single();

  const existingItemIds = new Set(
    (packingList?.packing_list_items ?? []).map(
      (pli: { item_id: string }) => pli.item_id
    )
  );

  // Filter out items already packed
  const availableItems: PackableItem[] = (items ?? []).filter(
    (item: PackableItem) => !existingItemIds.has(item.id)
  );

  // Calculate trip duration
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  const duration =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const tripContext: TripContext = {
    duration,
    tripType: input.tripType,
    formality: 3,
    weather: (input.weatherForecast as WeatherForecast) ?? null,
  };

  // Generate rule-based suggestions
  const suggestions = suggestPackingItems(availableItems, tripContext);

  // Try AI polish via Edge Function
  try {
    const { data: funcData } = await supabase.functions.invoke('suggest-packing', {
      body: {
        suggestions,
        tripContext: {
          ...tripContext,
          destination: input.destination,
          weatherSummary: tripContext.weather
            ? `${tripContext.weather.daily.length} days forecast available`
            : undefined,
        },
      },
    });

    if (funcData?.items) {
      return {
        items: funcData.items,
        summary: funcData.summary,
        aiPowered: funcData.aiPowered ?? false,
        categoryBreakdown: suggestions.categoryBreakdown,
      };
    }
  } catch {
    // Edge Function not available — use rule-based suggestions
  }

  return {
    items: suggestions.items.map((item) => ({
      ...item,
      aiExplanation: item.reasons.join('. ') + '.',
    })),
    summary: `Suggested ${suggestions.items.length} items for your ${duration}-day ${input.tripType} trip.`,
    aiPowered: false,
    categoryBreakdown: suggestions.categoryBreakdown,
  };
}

interface AcceptPackingSuggestionsInput {
  packingListId: string;
  itemIds: string[];
}

export async function acceptPackingSuggestions(input: AcceptPackingSuggestionsInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Bulk insert all accepted items
  const insertData = input.itemIds.map((itemId) => ({
    packing_list_id: input.packingListId,
    item_id: itemId,
    packed: false,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('packing_list_items') as any)
    .insert(insertData);

  if (error) {
    console.error('Error accepting packing suggestions:', error);
    throw new Error('Failed to add suggested items to packing list');
  }

  revalidatePath('/trips');
}
