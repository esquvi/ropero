import Link from 'next/link';
import { Plus } from 'lucide-react';
import { sortByDormancy, type Season } from '@ropero/core';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ItemCard, type WardrobeCardItem } from '@/components/wardrobe/item-card';
import { ItemFilters } from '@/components/wardrobe/item-filters';
import { RetryButton } from '@/components/wardrobe/retry-button';
import { cn } from '@/lib/utils';

interface WardrobePageProps {
  searchParams: Promise<{
    sort?: string;
    status?: string;
    category?: string;
    season?: string;
    q?: string;
    density?: string;
  }>;
}

const ARCHIVE_STATUSES = ['archived', 'donated', 'sold'];

type WardrobeRow = WardrobeCardItem & {
  purchase_price: number | null;
  last_worn_at: string | null;
  created_at: string;
  season: Season[];
};

export default async function WardrobePage({ searchParams }: WardrobePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const sort = params.sort ?? 'recently-added';
  const isArchive = params.status === 'archive';
  const compact = params.density === 'compact';
  const categories = (params.category ?? '').split(',').filter(Boolean);
  const seasons = (params.season ?? '').split(',').filter(Boolean);
  const query = (params.q ?? '').trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('items') as any).select(
    'id, name, brand, color_primary, photo_urls, times_worn, is_signature, status, purchase_price, created_at, last_worn_at, season',
  );

  q = isArchive
    ? q.in('status', ARCHIVE_STATUSES)
    : q.eq('status', 'active');

  if (categories.length > 0) {
    q = q.in('category', categories);
  }
  if (seasons.length > 0) {
    q = q.overlaps('season', seasons);
  }
  if (query) {
    const safe = query.replace(/[%,]/g, '');
    q = q.or(`name.ilike.%${safe}%,brand.ilike.%${safe}%`);
  }

  switch (sort) {
    case 'recently-worn':
      q = q.order('last_worn_at', { ascending: false, nullsFirst: false });
      break;
    case 'most-worn':
      q = q.order('times_worn', { ascending: false });
      break;
    case 'least-worn':
      q = q.order('times_worn', { ascending: true });
      break;
    case 'signature':
      q = q
        .order('is_signature', { ascending: false })
        .order('created_at', { ascending: false });
      break;
    case 'by-color':
      q = q.order('color_primary', { ascending: true });
      break;
    case 'by-brand':
      q = q.order('brand', { ascending: true, nullsFirst: false });
      break;
    case 'dormant':
    case 'cost-per-wear':
    case 'recently-added':
    default:
      // dormant and cost-per-wear reorder post-fetch below; created_at is just
      // a stable baseline before that.
      q = q.order('created_at', { ascending: false });
      break;
  }

  // Stable tiebreaker so ties on the primary sort key (multiple pieces
  // with identical times_worn or created_at, or every piece sharing a
  // bulk-import timestamp) resolve to the same order on every
  // revalidation. Without this the grid visually shuffles on server
  // actions like toggleSignature, which reads as a bug.
  q = q.order('id', { ascending: true });

  const { data, error } = await q;
  let items = (data ?? []) as WardrobeRow[];

  if (sort === 'cost-per-wear') {
    items = [...items].sort((a, b) => {
      const aCpw =
        a.times_worn > 0 && a.purchase_price ? a.purchase_price / a.times_worn : Infinity;
      const bCpw =
        b.times_worn > 0 && b.purchase_price ? b.purchase_price / b.times_worn : Infinity;
      return aCpw - bCpw;
    });
  }

  // Dormancy lens: season-aware ordering (in-season forgotten first, resting
  // pieces quieted) computed post-fetch in @ropero/core. The per-item tag drives
  // the card's last-worn fact and the out-of-season de-emphasis.
  let dormancyByItem:
    | Map<string, { lastWornAt: string | null; outOfSeason: boolean }>
    | null = null;
  if (sort === 'dormant') {
    const ordered = sortByDormancy(items, new Date());
    items = ordered;
    dormancyByItem = new Map(
      ordered.map((p) => [p.id, { lastWornAt: p.last_worn_at, outOfSeason: p.outOfSeason }]),
    );
  }

  const total = items.length;
  const hasFilters = categories.length > 0 || seasons.length > 0 || query.length > 0;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1
            className="text-3xl font-light leading-none text-foreground"
            style={{ letterSpacing: '0.04em' }}
          >
            Wardrobe
          </h1>
          <p className="mt-2 text-xs text-gold tabular-nums">
            {total} {total === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
        <Link href="/wardrobe/add">
          <Button>
            <Plus className="size-4" />
            Add a piece
          </Button>
        </Link>
      </header>

      <ItemFilters />

      {error && (
        <div className="border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&rsquo;t load your wardrobe. <RetryButton />
        </div>
      )}

      {!error && items.length === 0 && (
        <EmptyState query={query} hasFilters={hasFilters} isArchive={isArchive} />
      )}

      {!error && items.length > 0 && (
        <div
          className={cn(
            'grid',
            compact
              ? 'grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8'
              : 'grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-8',
          )}
        >
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              compact={compact}
              dormancy={dormancyByItem?.get(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EmptyStateProps {
  query: string;
  hasFilters: boolean;
  isArchive: boolean;
}

function EmptyState({ query, hasFilters, isArchive }: EmptyStateProps) {
  if (query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-foreground">
          Nothing matches &ldquo;<span className="font-medium">{query}</span>&rdquo;.
        </p>
      </div>
    );
  }
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-foreground">No pieces match these filters.</p>
      </div>
    );
  }
  if (isArchive) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-foreground">No archived pieces.</p>
        <p className="mt-1 text-xs text-text-dim">
          Pieces you archive, donate, or sell appear here.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm text-foreground">Your wardrobe is empty.</p>
      <p className="mt-1 text-xs text-text-dim">
        Add your first piece to begin.
      </p>
      <Link href="/wardrobe/add" className="mt-6">
        <Button>
          <Plus className="size-4" />
          Add a piece
        </Button>
      </Link>
    </div>
  );
}
