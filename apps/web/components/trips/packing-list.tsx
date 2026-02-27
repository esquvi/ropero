'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Package, Plus, Search, Shirt, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  togglePackingItem,
  addItemToPackingList,
  removeItemFromPackingList,
} from './actions';

interface PackingItem {
  item_id: string;
  packed: boolean;
  item: {
    id: string;
    name: string;
    category: string;
    photo_urls: string[];
  };
}

interface AvailableItem {
  id: string;
  name: string;
  category: string;
  photo_urls: string[];
}

interface PackingListProps {
  packingListId: string | undefined;
  items: PackingItem[];
  availableItems: AvailableItem[];
}

export function PackingList({ packingListId, items, availableItems }: PackingListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const packedCount = items.filter((i) => i.packed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const filteredAvailableItems = availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (itemId: string, currentPacked: boolean) => {
    if (!packingListId) return;

    setLoadingItems((prev) => new Set(prev).add(itemId));
    try {
      await togglePackingItem({
        packingListId,
        itemId,
        packed: !currentPacked,
      });
      router.refresh();
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleAddItem = async (itemId: string) => {
    if (!packingListId) return;

    setLoadingItems((prev) => new Set(prev).add(itemId));
    try {
      await addItemToPackingList({ packingListId, itemId });
      router.refresh();
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!packingListId) return;

    setLoadingItems((prev) => new Set(prev).add(itemId));
    try {
      await removeItemFromPackingList({ packingListId, itemId });
      router.refresh();
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (!packingListId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No packing list available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Packing List</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {packedCount} of {totalCount} items packed
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Items
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Items to Packing List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  {filteredAvailableItems.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAvailableItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border p-2"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                            {item.photo_urls.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photo_urls[0]}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Shirt className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.category}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(item.id)}
                            disabled={loadingItems.has(item.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shirt className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {searchQuery
                          ? 'No items match your search'
                          : 'All items are already in your packing list'}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
              <div key={category}>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground capitalize">
                  {category} ({categoryItems.filter((i) => i.packed).length}/{categoryItems.length})
                </h4>
                <div className="space-y-2">
                  {categoryItems.map((packingItem) => (
                    <div
                      key={packingItem.item_id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-2 transition-colors',
                        packingItem.packed && 'bg-muted/50'
                      )}
                    >
                      <Checkbox
                        checked={packingItem.packed}
                        onCheckedChange={() =>
                          handleToggle(packingItem.item_id, packingItem.packed)
                        }
                        disabled={loadingItems.has(packingItem.item_id)}
                      />
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                        {packingItem.item.photo_urls.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={packingItem.item.photo_urls[0]}
                            alt={packingItem.item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Shirt className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span
                        className={cn(
                          'flex-1 truncate',
                          packingItem.packed && 'text-muted-foreground line-through'
                        )}
                      >
                        {packingItem.item.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(packingItem.item_id)}
                        disabled={loadingItems.has(packingItem.item_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No items in packing list</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add items from your wardrobe to start packing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
