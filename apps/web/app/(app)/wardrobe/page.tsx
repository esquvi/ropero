import Link from 'next/link';
import { Plus, Shirt } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/wardrobe/item-card';
import { ItemFilters } from '@/components/wardrobe/item-filters';

interface WardrobePageProps {
  searchParams: Promise<{
    category?: string;
    season?: string;
    status?: string;
  }>;
}

type WardrobeItem = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  color_primary: string;
  season: string[];
  photo_urls: string[];
  times_worn: number;
};

export default async function WardrobePage({ searchParams }: WardrobePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build filter conditions
  const status = params.status || 'active';

  let query = supabase
    .from('items')
    .select('id, name, brand, category, color_primary, season, photo_urls, times_worn')
    .eq('status', status)
    .order('created_at', { ascending: false });

  // Apply optional filters
  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.season) {
    query = query.contains('season', [params.season]);
  }

  const { data, error } = await query;
  const items = data as WardrobeItem[] | null;

  if (error) {
    console.error('Error fetching items:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wardrobe</h1>
          <p className="text-muted-foreground">
            {items?.length ?? 0} items in your wardrobe
          </p>
        </div>
        <Link href="/wardrobe/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      <ItemFilters />

      {items && items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <Shirt className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No items found</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {params.category || params.season
              ? 'Try adjusting your filters or add a new item.'
              : 'Get started by adding your first wardrobe item.'}
          </p>
          <Link href="/wardrobe/add" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
