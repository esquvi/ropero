'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OCCASIONS } from '@ropero/core';
import { cn } from '@/lib/utils';
import { logWear, wearOutfit } from './actions';

export type LogWearTarget =
  | { type: 'item'; itemId: string }
  | { type: 'outfit'; outfitId: string };

interface LogWearButtonProps {
  target: LogWearTarget;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  label?: string;
  /** Stops click events bubbling to parent (useful when the trigger sits inside a link). */
  stopPropagation?: boolean;
}

export function LogWearButton({
  target,
  variant = 'outline',
  size = 'sm',
  className,
  label,
  stopPropagation = false,
}: LogWearButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [occasion, setOccasion] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOutfit = target.type === 'outfit';
  const triggerLabel = label ?? (isOutfit ? 'Wear' : 'Log Wear');
  const heading = isOutfit ? 'Wear Outfit' : 'Log Wear';
  const description = isOutfit
    ? 'Logs a wear for every item in this outfit.'
    : 'Record when you wore this item.';
  const submitLabel = isOutfit ? 'Log Outfit Wear' : 'Log Wear';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const wornAt = format(date, 'yyyy-MM-dd');
      const occasionValue = occasion || null;
      const notesValue = notes || null;

      if (target.type === 'item') {
        await logWear({
          itemId: target.itemId,
          wornAt,
          occasion: occasionValue,
          notes: notesValue,
        });
      } else {
        await wearOutfit({
          outfitId: target.outfitId,
          wornAt,
          occasion: occasionValue,
          notes: notesValue,
        });
      }

      setOpen(false);
      setOccasion('');
      setNotes('');
      setDate(new Date());
      router.refresh();
    } catch (err) {
      console.error('Error logging wear:', err);
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => {
            if (stopPropagation) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        >
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{heading}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Occasion (optional)</label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((occ) => (
                  <SelectItem key={occ} value={occ} className="capitalize">
                    {occ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder="Any notes about this wear..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
