'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, X, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { generatePackingSuggestions, acceptPackingSuggestions } from './actions';

interface PackingSuggestionsProps {
  tripId: string;
  packingListId: string | undefined;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  weatherForecast: unknown | null;
  hasExistingItems: boolean;
}

interface SuggestedItem {
  itemId: string;
  name: string;
  category: string;
  score: number;
  reasons: string[];
  aiExplanation?: string;
}

interface SuggestionResult {
  items: SuggestedItem[];
  summary: string;
  aiPowered: boolean;
  categoryBreakdown: Record<string, { needed: number; suggested: number }>;
}

export function PackingSuggestions({
  tripId,
  packingListId,
  destination,
  startDate,
  endDate,
  tripType,
  weatherForecast,
  hasExistingItems,
}: PackingSuggestionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generatePackingSuggestions({
        tripId,
        destination,
        startDate,
        endDate,
        tripType,
        weatherForecast,
      });
      setSuggestions(result);
      // Select all by default
      setSelectedIds(new Set(result.items.map((i: SuggestedItem) => i.itemId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!packingListId || selectedIds.size === 0) return;

    setAccepting(true);
    try {
      await acceptPackingSuggestions({
        packingListId,
        itemIds: Array.from(selectedIds),
      });
      setOpen(false);
      setSuggestions(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add items');
    } finally {
      setAccepting(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!suggestions) return;
    if (selectedIds.size === suggestions.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suggestions.items.map((i) => i.itemId)));
    }
  };

  // Group suggestions by category for display
  const groupedItems = suggestions?.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SuggestedItem[]>);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSuggestions(null);
        setError(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!packingListId}>
          <Sparkles className="mr-2 h-4 w-4" />
          Smart Pack
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Packing Suggestions
          </DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions based on your trip details, weather, and wardrobe.
          </DialogDescription>
        </DialogHeader>

        {!suggestions && !loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Package className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Analyze your wardrobe and suggest the best items for your{' '}
                {tripType} trip to {destination}.
              </p>
              {hasExistingItems && (
                <p className="text-xs text-muted-foreground">
                  Items already in your packing list will be excluded.
                </p>
              )}
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Suggestions
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your wardrobe...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleGenerate}
            >
              Try Again
            </Button>
          </div>
        )}

        {suggestions && !loading && (
          <>
            {/* Summary */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm">{suggestions.summary}</p>
              {suggestions.aiPowered && (
                <Badge variant="secondary" className="mt-2">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI-Enhanced
                </Badge>
              )}
            </div>

            {/* Select all toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} of {suggestions.items.length} items selected
              </p>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedIds.size === suggestions.items.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {/* Items list */}
            <ScrollArea className="flex-1 min-h-0 max-h-[40vh]">
              <div className="space-y-4 pr-4">
                {groupedItems && Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                      {suggestions.categoryBreakdown[category] && (
                        <span className="ml-2 font-normal normal-case">
                          ({suggestions.categoryBreakdown[category].suggested}/
                          {suggestions.categoryBreakdown[category].needed} recommended)
                        </span>
                      )}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Card
                          key={item.itemId}
                          className={cn(
                            'cursor-pointer transition-colors',
                            selectedIds.has(item.itemId)
                              ? 'border-primary bg-primary/5'
                              : 'opacity-60'
                          )}
                          onClick={() => toggleItem(item.itemId)}
                        >
                          <CardContent className="flex items-start gap-3 p-3">
                            <div
                              className={cn(
                                'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                                selectedIds.has(item.itemId)
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground'
                              )}
                            >
                              {selectedIds.has(item.itemId) && (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.aiExplanation || item.reasons.join('. ')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {Math.round(item.score * 100)}%
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSuggestions(null);
                  setError(null);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleAccept}
                disabled={selectedIds.size === 0 || accepting}
              >
                {accepting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Add {selectedIds.size} Items
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
