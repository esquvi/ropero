'use client';

import { useOptimistic, useTransition } from 'react';
import { Star } from 'lucide-react';
import { toggleSignature } from '@/app/(app)/wardrobe/actions';
import { cn } from '@/lib/utils';

interface SignatureToggleProps {
  itemId: string;
  active: boolean;
}

export function SignatureToggle({ itemId, active }: SignatureToggleProps) {
  const [, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(
    active,
    (_state, next: boolean) => next,
  );

  return (
    <button
      type="button"
      aria-label={optimisticActive ? 'Unmark as signature' : 'Mark as signature'}
      aria-pressed={optimisticActive}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          setOptimisticActive(!active);
          await toggleSignature(itemId, active);
        });
      }}
      className={cn(
        'absolute right-2 top-2 grid size-8 place-items-center',
        'hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      )}
    >
      <Star
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          'size-4 transition-colors',
          optimisticActive
            ? 'fill-gold stroke-gold'
            : 'fill-transparent stroke-foreground/85',
        )}
      />
    </button>
  );
}
