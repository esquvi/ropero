import Link from 'next/link';
import { Plus, Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { OutfitCard } from '@/components/outfits/outfit-card';

type OutfitRow = {
  id: string;
  name: string;
  occasion: string | null;
  photo_url: string | null;
  rating: number | null;
  items: {
    id: string;
    photo_urls: string[];
  }[];
};

export default async function OutfitsPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('outfits') as any)
    .select(`
      id,
      name,
      occasion,
      photo_url,
      rating,
      outfit_items (
        items (
          id,
          photo_urls
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching outfits:', error);
  }

  // Transform the data to flatten the nested structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outfits: OutfitRow[] = (data ?? []).map((outfit: any) => ({
    id: outfit.id as string,
    name: outfit.name as string,
    occasion: outfit.occasion as string | null,
    photo_url: outfit.photo_url as string | null,
    rating: outfit.rating as number | null,
    items: ((outfit.outfit_items ?? []) as { items: { id: string; photo_urls: string[] } }[]).map((oi) => ({
      id: oi.items?.id as string,
      photo_urls: (oi.items?.photo_urls ?? []) as string[],
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outfits</h1>
          <p className="text-muted-foreground">
            {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'} saved
          </p>
        </div>
        <Link href="/outfits/builder">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Outfit
          </Button>
        </Link>
      </div>

      {outfits.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <Layers className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No outfits yet</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Create your first outfit by combining items from your wardrobe.
          </p>
          <Link href="/outfits/builder" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Outfit
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
