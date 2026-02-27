import Link from 'next/link';
import { Layers, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface OutfitItem {
  id: string;
  photo_urls: string[];
}

interface OutfitCardProps {
  outfit: {
    id: string;
    name: string;
    occasion: string | null;
    photo_url: string | null;
    rating: number | null;
    items?: OutfitItem[];
  };
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  const itemPhotos = outfit.items?.slice(0, 4).map((item) => item.photo_urls[0]).filter(Boolean) ?? [];

  return (
    <Link href={`/outfits/${outfit.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square relative bg-muted">
          {outfit.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={outfit.photo_url}
              alt={outfit.name}
              className="h-full w-full object-cover"
            />
          ) : itemPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-0.5 h-full w-full">
              {itemPhotos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ))}
              {itemPhotos.length < 4 &&
                Array.from({ length: 4 - itemPhotos.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-muted" />
                ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Layers className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium truncate">{outfit.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {outfit.occasion && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {outfit.occasion}
                </Badge>
              )}
            </div>
            {outfit.rating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {outfit.rating}
              </div>
            )}
          </div>
          {outfit.items && (
            <p className="mt-2 text-xs text-muted-foreground">
              {outfit.items.length} {outfit.items.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
