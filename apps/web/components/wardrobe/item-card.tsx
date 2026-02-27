import Link from 'next/link';
import { Shirt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    brand: string | null;
    category: string;
    color_primary: string;
    season: string[];
    photo_urls: string[];
    times_worn: number;
  };
}

export function ItemCard({ item }: ItemCardProps) {
  const hasPhoto = item.photo_urls.length > 0;

  return (
    <Link href={`/wardrobe/${item.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square relative bg-muted">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photo_urls[0]}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Shirt className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div
            className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: item.color_primary }}
            title={item.color_primary}
          />
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium truncate">{item.name}</h3>
          {item.brand && (
            <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
            {item.season.slice(0, 2).map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Worn {item.times_worn} {item.times_worn === 1 ? 'time' : 'times'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
