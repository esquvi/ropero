'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, LayoutGrid, Rows3, Search, X } from 'lucide-react';
import { ITEM_CATEGORIES, SEASONS } from '@ropero/core';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'recently-added', label: 'Recently added' },
  { value: 'recently-worn', label: 'Recently worn' },
  { value: 'most-worn', label: 'Most worn' },
  { value: 'least-worn', label: 'Least worn' },
  { value: 'signature', label: 'Signature first' },
  { value: 'by-color', label: 'By color' },
  { value: 'by-brand', label: 'By brand' },
  { value: 'cost-per-wear', label: 'Cost-per-wear' },
] as const;

const SORT_LABEL_BY_VALUE = Object.fromEntries(
  SORT_OPTIONS.map((o) => [o.value, o.label]),
);

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c, c.charAt(0).toUpperCase() + c.slice(1)]),
);

const SEASON_LABEL: Record<string, string> = Object.fromEntries(
  SEASONS.map((s) => [s, s.charAt(0).toUpperCase() + s.slice(1)]),
);

function parseList(v: string | null): string[] {
  if (!v) return [];
  return v.split(',').filter(Boolean);
}

export function ItemFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sort = searchParams.get('sort') ?? 'recently-added';
  const status = searchParams.get('status') === 'archive' ? 'archive' : 'active';
  const density = searchParams.get('density') === 'compact' ? 'compact' : 'regular';
  const categories = parseList(searchParams.get('category'));
  const seasons = parseList(searchParams.get('season'));
  const query = searchParams.get('q') ?? '';

  const [filtersOpen, setFiltersOpen] = useState(
    categories.length > 0 || seasons.length > 0,
  );
  const [searchOpen, setSearchOpen] = useState(query.length > 0);
  const [searchValue, setSearchValue] = useState(query);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const setParam = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    const serialized = Array.isArray(value) ? value.join(',') : value;
    if (!serialized) {
      params.delete(key);
    } else {
      params.set(key, serialized);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const toggleCategory = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    setParam('category', next);
  };

  const toggleSeason = (season: string) => {
    const next = seasons.includes(season)
      ? seasons.filter((s) => s !== season)
      : [...seasons, season];
    setParam('season', next);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    if (status !== 'active') params.set('status', status);
    if (sort !== 'recently-added') params.set('sort', sort);
    if (density !== 'regular') params.set('density', density);
    setSearchValue('');
    setSearchOpen(false);
    setFiltersOpen(false);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const submitSearch = (value: string) => {
    setParam('q', value || null);
  };

  const filterCount = categories.length + seasons.length;
  const hasActivePills = filterCount > 0 || query.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
          <SelectTrigger className="h-9 w-auto min-w-[160px] gap-2 border-border bg-card uppercase text-[10px] font-medium tracking-[0.18em]">
            <span className="text-text-dim">Sort</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className={cn(
            'inline-flex h-9 items-center gap-2 border border-border bg-card px-3',
            'uppercase text-[10px] font-medium tracking-[0.18em] text-foreground',
            'transition-colors hover:border-primary',
            filtersOpen && 'border-primary',
          )}
        >
          Filters
          {filterCount > 0 && (
            <span className="text-gold tabular-nums">{filterCount}</span>
          )}
          <ChevronDown
            className={cn(
              'size-3 transition-transform',
              filtersOpen && 'rotate-180',
            )}
            strokeWidth={2}
          />
        </button>

        {searchOpen ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(searchValue.trim());
            }}
            className="flex h-9 items-center gap-1 border border-border bg-card px-2"
          >
            <Search className="size-3.5 text-text-dim" strokeWidth={2} />
            <input
              ref={searchInputRef}
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={() => {
                if (!searchValue) {
                  setSearchOpen(false);
                  if (query) submitSearch('');
                }
              }}
              placeholder="Search"
              className="h-full w-32 bg-transparent text-xs outline-none placeholder:text-text-dim"
              autoFocus
            />
            {searchValue && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchValue('');
                  submitSearch('');
                  searchInputRef.current?.focus();
                }}
                className="text-text-dim hover:text-foreground"
              >
                <X className="size-3" strokeWidth={2} />
              </button>
            )}
          </form>
        ) : (
          <button
            type="button"
            aria-label="Search wardrobe"
            onClick={() => setSearchOpen(true)}
            className={cn(
              'grid h-9 w-9 place-items-center border border-border bg-card',
              'transition-colors hover:border-primary',
            )}
          >
            <Search className="size-3.5 text-text-dim" strokeWidth={2} />
          </button>
        )}

        <div
          role="group"
          aria-label="Card density"
          className="flex border border-border bg-card"
        >
          <button
            type="button"
            aria-label="Regular density"
            aria-pressed={density === 'regular'}
            onClick={() => setParam('density', null)}
            className={cn(
              'grid h-9 w-9 place-items-center transition-colors',
              density === 'regular'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-dim hover:text-foreground',
            )}
          >
            <LayoutGrid className="size-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Compact density"
            aria-pressed={density === 'compact'}
            onClick={() => setParam('density', 'compact')}
            className={cn(
              'grid h-9 w-9 place-items-center border-l border-border transition-colors',
              density === 'compact'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-dim hover:text-foreground',
            )}
          >
            <Rows3 className="size-3.5" strokeWidth={2} />
          </button>
        </div>

        <div
          role="group"
          aria-label="Active or archive"
          className="ml-auto inline-grid grid-cols-2 border border-border bg-card"
        >
          <button
            type="button"
            aria-pressed={status === 'active'}
            onClick={() => setParam('status', null)}
            className={cn(
              'h-9 px-4 uppercase text-[10px] font-medium tracking-[0.18em] transition-colors',
              status === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-dim hover:text-foreground',
            )}
          >
            Active
          </button>
          <button
            type="button"
            aria-pressed={status === 'archive'}
            onClick={() => setParam('status', 'archive')}
            className={cn(
              'h-9 border-l border-border px-4 uppercase text-[10px] font-medium tracking-[0.18em] transition-colors',
              status === 'archive'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-dim hover:text-foreground',
            )}
          >
            Archive
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="space-y-4 border border-border bg-card p-4">
          <fieldset>
            <legend
              className="mb-2 uppercase text-[10px] font-medium text-text-dim"
              style={{ letterSpacing: 'var(--tracking-caps-md)' }}
            >
              Category
            </legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3 md:grid-cols-5">
              {ITEM_CATEGORIES.map((cat) => {
                const id = `cat-${cat}`;
                const checked = categories.includes(cat);
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <Label
                      htmlFor={id}
                      className="cursor-pointer text-[12px] font-normal"
                    >
                      {CATEGORY_LABEL[cat]}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend
              className="mb-2 uppercase text-[10px] font-medium text-text-dim"
              style={{ letterSpacing: 'var(--tracking-caps-md)' }}
            >
              Season
            </legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
              {SEASONS.map((s) => {
                const id = `season-${s}`;
                const checked = seasons.includes(s);
                return (
                  <div key={s} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleSeason(s)}
                    />
                    <Label
                      htmlFor={id}
                      className="cursor-pointer text-[12px] font-normal"
                    >
                      {SEASON_LABEL[s]}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}

      {hasActivePills && (
        <div className="flex flex-wrap items-center gap-1.5">
          {query && (
            <FilterPill
              label={`"${query}"`}
              onRemove={() => {
                setSearchValue('');
                submitSearch('');
              }}
            />
          )}
          {categories.map((cat) => (
            <FilterPill
              key={`cat-${cat}`}
              label={CATEGORY_LABEL[cat] ?? cat}
              onRemove={() => toggleCategory(cat)}
            />
          ))}
          {seasons.map((s) => (
            <FilterPill
              key={`season-${s}`}
              label={SEASON_LABEL[s] ?? s}
              onRemove={() => toggleSeason(s)}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 px-2 text-[11px] uppercase tracking-[0.18em] text-text-dim hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

interface FilterPillProps {
  label: string;
  onRemove: () => void;
}

function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <span className="inline-flex items-center gap-1 border border-border bg-card px-2 py-0.5 text-[11px] text-foreground">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="text-text-dim hover:text-foreground"
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </span>
  );
}

export { SORT_OPTIONS, SORT_LABEL_BY_VALUE };
