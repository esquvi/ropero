'use client';

import { useState, useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteOutfit } from './actions';

interface DeleteOutfitButtonProps {
  outfitId: string;
  outfitName: string;
}

export function DeleteOutfitButton({
  outfitId,
  outfitName,
}: DeleteOutfitButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteOutfit(outfitId);
        // deleteOutfit calls redirect() on success, so this line only runs on error.
      } catch (err) {
        // NEXT_REDIRECT throws are part of the redirect mechanism. Re-throw so
        // Next.js can perform the navigation.
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
          throw err;
        }
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Outfit
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete outfit?</DialogTitle>
            <DialogDescription>
              Permanently delete &ldquo;{outfitName}&rdquo;. Individual items
              and wear history will not be affected.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
