import Link from 'next/link';
import { Shirt } from 'lucide-react';
import { SignatureToggle } from './signature-toggle';
import { cn } from '@/lib/utils';

export interface WardrobeCardItem {
  id: string;
  name: string;
  brand: string | null;
  color_primary: string;
  photo_urls: string[];
  times_worn: number;
  is_signature: boolean;
  status: string;
}

interface ItemCardProps {
  item: WardrobeCardItem;
  compact?: boolean;
}

const ARCHIVE_STATUS_LABEL: Record<string, string> = {
  archived: 'Archived',
  donated: 'Donated',
  sold: 'Sold',
};

export function ItemCard({ item, compact = false }: ItemCardProps) {
  const hasPhoto = item.photo_urls.length > 0;
  const archiveLabel =
    item.status !== 'active' ? ARCHIVE_STATUS_LABEL[item.status] : null;

  return (
    <article className="group relative">
      <Link
        href={`/wardrobe/${item.id}`}
        className={cn(
          'block border-[1.5px] border-border bg-card transition-colors',
          'group-hover:border-primary focus-visible:outline-none focus-visible:border-primary',
          archiveLabel && 'border-border/60',
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photo_urls[0]}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Shirt className="size-10 text-text-dim" strokeWidth={1.25} />
            </div>
          )}

          <span
            aria-hidden
            className={cn(
              'absolute bottom-2 left-2 ring-1 ring-card/95',
              compact ? 'size-2' : 'size-3',
            )}
            style={{ backgroundColor: item.color_primary }}
          />

          {archiveLabel && (
            <span
              className={cn(
                'absolute bottom-2 right-2 px-1.5 py-0.5 text-[9px] font-medium uppercase',
                'bg-card/90 text-text-mid',
              )}
              style={{ letterSpacing: 'var(--tracking-caps-sm)' }}
            >
              {archiveLabel}
            </span>
          )}
        </div>

        <div className={cn('px-3 pb-3 pt-2.5', compact && 'px-2 pb-1.5 pt-1.5')}>
          <h3
            className={cn(
              'truncate font-medium leading-tight',
              compact ? 'text-[11px]' : 'text-[13px]',
            )}
          >
            {item.name}
          </h3>

          {compact ? (
            <div className="mt-1 flex items-baseline gap-2">
              {item.brand && (
                <span className="truncate text-[10px] text-foreground/55">
                  {item.brand}
                </span>
              )}
              <span
                className={cn(
                  'ml-auto shrink-0 tabular-nums text-[10px] text-gold',
                  item.times_worn === 0 && 'text-gold/55',
                )}
              >
                {item.times_worn}×
              </span>
            </div>
          ) : (
            <>
              {item.brand && (
                <p className="mt-0.5 truncate text-[11px] text-foreground/55">
                  {item.brand}
                </p>
              )}
              <p
                className={cn(
                  'mt-1.5 text-[11px] tabular-nums text-gold',
                  item.times_worn === 0 && 'text-gold/55',
                )}
              >
                {item.times_worn}×
              </p>
            </>
          )}
        </div>
      </Link>

      <SignatureToggle itemId={item.id} active={item.is_signature} />
    </article>
  );
}
