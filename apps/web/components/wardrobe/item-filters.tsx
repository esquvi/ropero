'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ITEM_CATEGORIES, SEASONS } from '@ropero/core';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function ItemFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') ?? '';
  const season = searchParams.get('season') ?? '';
  const status = searchParams.get('status') ?? 'active';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/wardrobe?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/wardrobe');
  };

  const hasFilters = category || season || status !== 'active';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={category || 'all'} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {ITEM_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat} className="capitalize">
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={season || 'all'} onValueChange={(v) => updateFilter('season', v)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Season" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Seasons</SelectItem>
          {SEASONS.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
          <SelectItem value="donated">Donated</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
