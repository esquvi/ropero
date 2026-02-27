import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { OutfitBuilder } from '@/components/outfits/outfit-builder';

type WardrobeItem = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  color_primary: string;
  photo_urls: string[];
};

export default async function OutfitBuilderPage() {
  const supabase = await createClient();

  // Fetch active wardrobe items
  const { data, error } = await supabase
    .from('items')
    .select('id, name, brand, category, color_primary, photo_urls')
    .eq('status', 'active')
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching items:', error);
  }

  const items = (data ?? []) as unknown as WardrobeItem[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/outfits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Outfit</h1>
          <p className="text-muted-foreground">
            Build an outfit from your wardrobe items
          </p>
        </div>
      </div>

      <OutfitBuilder items={items} />
    </div>
  );
}
