'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

export function RetryButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      onClick={() => start(() => router.refresh())}
      disabled={pending}
      className={cn(
        'underline-offset-4 hover:underline focus-visible:underline disabled:opacity-50',
      )}
    >
      Retry
    </button>
  );
}
