'use client';

import { useTransition } from 'react';
import { Star } from 'lucide-react';
import { toggleSignature } from '@/app/(app)/wardrobe/actions';
import { cn } from '@/lib/utils';

interface SignatureToggleProps {
  itemId: string;
  active: boolean;
}

export function SignatureToggle({ itemId, active }: SignatureToggleProps) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label={active ? 'Unmark as signature' : 'Mark as signature'}
      aria-pressed={active}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(() => {
          void toggleSignature(itemId, active);
        });
      }}
      className={cn(
        'absolute right-2 top-2 grid size-8 place-items-center transition-opacity',
        'hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        pending && 'opacity-40',
      )}
    >
      <Star
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          'size-4 transition-colors',
          active
            ? 'fill-gold stroke-gold'
            : 'fill-transparent stroke-foreground/85',
        )}
      />
    </button>
  );
}
