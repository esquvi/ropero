'use client';

import { useState } from 'react';
import { Shirt, Pencil, MoreHorizontal, Archive, Gift, DollarSign, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditItemForm } from './edit-item-form';

interface ItemDetailProps {
  item: {
    id: string;
    name: string;
    brand: string | null;
    category: string;
    subcategory: string | null;
    color_primary: string;
    color_secondary: string | null;
    pattern: string | null;
    size: string | null;
    material: string | null;
    season: string[];
    formality: number;
    photo_urls: string[];
    purchase_date: string | null;
    purchase_price: number | null;
    purchase_source: string | null;
    times_worn: number;
    last_worn_at: string | null;
    status: string;
    notes: string | null;
    tags: string[];
    created_at: string;
  };
  wearLogs?: {
    id: string;
    worn_at: string;
    occasion: string | null;
    notes: string | null;
  }[];
  onStatusChange: (status: string) => Promise<void>;
}

const formalityLabels = [
  '',
  'Very Casual',
  'Casual',
  'Smart Casual',
  'Business Casual',
  'Formal',
];

export function ItemDetail({ item, wearLogs = [], onStatusChange }: ItemDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    description: string;
  }>({ open: false, action: '', title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusAction = (action: string) => {
    const configs: Record<string, { title: string; description: string }> = {
      archive: {
        title: 'Archive this item?',
        description: 'This item will be moved to your archive. You can reactivate it anytime.',
      },
      donate: {
        title: 'Mark as donated?',
        description: 'This item will be marked as donated.',
      },
      sell: {
        title: 'Mark as sold?',
        description: 'This item will be marked as sold.',
      },
      reactivate: {
        title: 'Reactivate this item?',
        description: 'This item will be moved back to your active wardrobe.',
      },
    };

    setConfirmDialog({
      open: true,
      action,
      ...configs[action],
    });
  };

  const confirmStatusChange = async () => {
    setIsLoading(true);
    try {
      const statusMap: Record<string, string> = {
        archive: 'archived',
        donate: 'donated',
        sell: 'sold',
        reactivate: 'active',
      };
      await onStatusChange(statusMap[confirmDialog.action]);
    } finally {
      setIsLoading(false);
      setConfirmDialog({ open: false, action: '', title: '', description: '' });
    }
  };

  const [selectedPhoto, setSelectedPhoto] = useState(0);

  if (isEditing) {
    return (
      <EditItemForm
        item={item}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
          {item.brand && (
            <p className="text-lg text-muted-foreground">{item.brand}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {item.status === 'active' ? (
                <>
                  <DropdownMenuItem onClick={() => handleStatusAction('archive')}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusAction('donate')}>
                    <Gift className="mr-2 h-4 w-4" />
                    Mark as Donated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusAction('sell')}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark as Sold
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => handleStatusAction('reactivate')}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo Gallery */}
        <Card>
          <CardContent className="p-4">
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
              {item.photo_urls.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photo_urls[selectedPhoto]}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Shirt className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            {item.photo_urls.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {item.photo_urls.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setSelectedPhoto(i)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md ${
                      i === selectedPhoto ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${item.name} photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attributes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{item.category}</p>
                </div>
                {item.subcategory && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subcategory</p>
                    <p className="font-medium">{item.subcategory}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Primary Color</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-full border"
                      style={{ backgroundColor: item.color_primary }}
                    />
                    <p className="font-medium">{item.color_primary}</p>
                  </div>
                </div>
                {item.color_secondary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Secondary Color</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: item.color_secondary }}
                      />
                      <p className="font-medium">{item.color_secondary}</p>
                    </div>
                  </div>
                )}
                {item.pattern && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pattern</p>
                    <p className="font-medium capitalize">{item.pattern}</p>
                  </div>
                )}
                {item.size && (
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{item.size}</p>
                  </div>
                )}
                {item.material && (
                  <div>
                    <p className="text-sm text-muted-foreground">Material</p>
                    <p className="font-medium">{item.material}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Formality</p>
                  <p className="font-medium">{formalityLabels[item.formality]}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Seasons</p>
                <div className="flex flex-wrap gap-2">
                  {item.season.map((s) => (
                    <Badge key={s} variant="outline" className="capitalize">
                      {s}
                    </Badge>
                  ))}
                  {item.season.length === 0 && (
                    <p className="text-sm text-muted-foreground">No seasons set</p>
                  )}
                </div>
              </div>

              {item.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.purchase_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(item.purchase_date).toLocaleDateString()}</span>
                </div>
              )}
              {item.purchase_price !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>${item.purchase_price.toFixed(2)}</span>
                </div>
              )}
              {item.purchase_source && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span>{item.purchase_source}</span>
                </div>
              )}
              {!item.purchase_date && item.purchase_price === null && !item.purchase_source && (
                <p className="text-sm text-muted-foreground">No purchase info recorded</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wear Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Times Worn</span>
                <span className="font-medium">{item.times_worn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Worn</span>
                <span>
                  {item.last_worn_at
                    ? new Date(item.last_worn_at).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
              {item.purchase_price !== null && item.times_worn > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Per Wear</span>
                  <span>${(item.purchase_price / item.times_worn).toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wear History */}
      {wearLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wear History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {wearLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 border-l-2 pl-4">
                    <div>
                      <p className="font-medium">
                        {new Date(log.worn_at).toLocaleDateString()}
                      </p>
                      {log.occasion && (
                        <p className="text-sm text-muted-foreground">{log.occasion}</p>
                      )}
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {item.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Change Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !isLoading && setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
