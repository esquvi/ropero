import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { OutfitBuilder } from '@/components/outfits/outfit-builder';

interface EditOutfitPageProps {
  params: Promise<{ id: string }>;
}

type WardrobeItem = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  color_primary: string;
  photo_urls: string[];
};

interface ExistingOutfitRow {
  id: string;
  name: string;
  occasion: string | null;
  rating: number | null;
  notes: string | null;
  tags: string[] | null;
  outfit_items: Array<{ item_id: string }> | null;
}

export default async function EditOutfitPage({ params }: EditOutfitPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [itemsRes, outfitRes] = await Promise.all([
    supabase
      .from('items')
      .select('id, name, brand, category, color_primary, photo_urls')
      .eq('status', 'active')
      .order('category')
      .order('name'),
    (supabase.from('outfits') as ReturnType<typeof supabase.from>)
      .select('id, name, occasion, rating, notes, tags, outfit_items(item_id)')
      .eq('id', id)
      .single(),
  ]);

  if (outfitRes.error || !outfitRes.data) {
    notFound();
  }

  const items = (itemsRes.data ?? []) as unknown as WardrobeItem[];
  const raw = outfitRes.data as unknown as ExistingOutfitRow;
  const existing = {
    id: raw.id,
    name: raw.name,
    occasion: raw.occasion,
    rating: raw.rating,
    notes: raw.notes,
    tags: raw.tags,
    itemIds: (raw.outfit_items ?? []).map((row) => row.item_id),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/outfits/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Outfit</h1>
          <p className="text-muted-foreground">
            Update items and details for this outfit
          </p>
        </div>
      </div>

      <OutfitBuilder items={items} existing={existing} />
    </div>
  );
}
