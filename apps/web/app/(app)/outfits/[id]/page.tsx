import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Layers, Shirt, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogWearButton } from '@/components/wear/log-wear-button';
import { DeleteOutfitButton } from '@/components/outfits/delete-outfit-button';

interface OutfitDetailPageProps {
  params: Promise<{ id: string }>;
}

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  photo_urls: string[];
}

interface OutfitRow {
  id: string;
  name: string;
  occasion: string | null;
  rating: number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  outfit_items: Array<{ items: OutfitItem | null }> | null;
}

interface FlattenedOutfit {
  id: string;
  name: string;
  occasion: string | null;
  rating: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  items: OutfitItem[];
}

export default async function OutfitDetailPage({
  params,
}: OutfitDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await (
    supabase.from('outfits') as ReturnType<typeof supabase.from>
  )
    .select(
      `id, name, occasion, rating, notes, tags, created_at,
       outfit_items(items(id, name, category, photo_urls))`,
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const raw = data as unknown as OutfitRow;
  const items: OutfitItem[] = (raw.outfit_items ?? [])
    .map((row) => row.items)
    .filter((it): it is OutfitItem => it !== null);

  const outfit: FlattenedOutfit = {
    id: raw.id,
    name: raw.name,
    occasion: raw.occasion,
    rating: raw.rating,
    notes: raw.notes,
    tags: raw.tags ?? [],
    created_at: raw.created_at,
    items,
  };

  const heroPhotos = outfit.items
    .map((it) => it.photo_urls[0])
    .filter((u): u is string => Boolean(u))
    .slice(0, 4);
  const itemCount = outfit.items.length;
  const createdLabel = new Date(outfit.created_at).toLocaleDateString();

  return (
    <div className="space-y-6">
      <Link href="/outfits">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Outfits
        </Button>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{outfit.name}</h1>
          {outfit.occasion && (
            <Badge variant="secondary" className="capitalize">
              {outfit.occasion}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {itemCount > 0 && (
            <LogWearButton
              target={{ type: 'outfit', outfitId: outfit.id }}
              variant="default"
              size="default"
              label="Wear Outfit"
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hero photo grid */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square relative bg-muted">
              {heroPhotos.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Layers className="h-16 w-16 text-muted-foreground" />
                </div>
              ) : heroPhotos.length === 1 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroPhotos[0]}
                  alt={outfit.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full grid-cols-2 gap-0.5">
                  {heroPhotos.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ))}
                  {Array.from({ length: 4 - heroPhotos.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-muted" />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meta strip and notes */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">{itemCount}</p>
                <p className="text-xs text-muted-foreground">
                  {itemCount === 1 ? 'Item' : 'Items'}
                </p>
              </CardContent>
            </Card>
            {outfit.rating != null && (
              <Card>
                <CardContent className="p-4">
                  <p className="flex items-center gap-1 text-2xl font-bold">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {outfit.rating}
                    <span className="text-base font-normal text-muted-foreground">
                      /5
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </CardContent>
              </Card>
            )}
            {outfit.occasion && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-base font-semibold capitalize">
                    {outfit.occasion}
                  </p>
                  <p className="text-xs text-muted-foreground">Occasion</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-4">
                <p className="text-base font-semibold">{createdLabel}</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </CardContent>
            </Card>
          </div>

          {outfit.notes && (
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-2 text-sm font-semibold">Notes</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {outfit.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {outfit.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="mb-2 text-sm font-semibold">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {outfit.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Items grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Items</h2>
        {outfit.items.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {outfit.items.map((item) => (
              <Link
                key={item.id}
                href={`/wardrobe/${item.id}`}
                className="group block"
              >
                <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
                  <div className="aspect-square relative bg-muted">
                    {item.photo_urls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photo_urls[0]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Shirt className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="truncate text-xs capitalize text-muted-foreground">
                      {item.category}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No items in this outfit.
          </p>
        )}
      </div>

      {/* Destructive action */}
      <div className="flex justify-end border-t pt-6">
        <DeleteOutfitButton outfitId={outfit.id} outfitName={outfit.name} />
      </div>
    </div>
  );
}
