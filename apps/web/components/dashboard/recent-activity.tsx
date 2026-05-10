import { Layers, CheckCircle2, Clock } from 'lucide-react';
import {
  formatRelativeWearDate,
  groupWearLogs,
  type WearLogRow,
} from '@ropero/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export type { WearLogRow };

// Display cap. The dashboard query pulls more rows than this so a multi-item
// outfit wear collapses into a single visible entry without pushing other
// activity off the end (mirrors mobile's 25/5 ratio).
const MAX_ACTIVITY_ENTRIES = 10;

interface RecentActivityProps {
  wearLogs: WearLogRow[];
}

export function RecentActivity({ wearLogs }: RecentActivityProps) {
  const entries = groupWearLogs(wearLogs, { maxEntries: MAX_ACTIVITY_ENTRIES });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.key}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {entry.kind === 'outfit' ? (
                      <Layers className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.kind === 'outfit'
                        ? `Wore ${entry.outfit_name} \u00b7 ${entry.item_count} ${entry.item_count === 1 ? 'item' : 'items'}`
                        : `Wore ${entry.item_name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.occasion && <span className="capitalize">{entry.occasion} &middot; </span>}
                      {formatRelativeWearDate(entry.worn_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No recent activity. Start by logging what you wore today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
