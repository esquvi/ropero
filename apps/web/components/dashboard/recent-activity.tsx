import { Layers, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface WearLogRow {
  id: string;
  worn_at: string;
  occasion: string | null;
  outfit_id: string | null;
  items: {
    name: string;
    category: string;
  };
  outfits: { name: string } | null;
}

// An activity entry is either a single item wear or a group of items worn
// together as an outfit on the same day.
export type ActivityEntry =
  | {
      kind: 'item';
      key: string;
      worn_at: string;
      occasion: string | null;
      item_name: string;
    }
  | {
      kind: 'outfit';
      key: string;
      worn_at: string;
      occasion: string | null;
      outfit_name: string;
      item_count: number;
    };

// Display cap. The dashboard query pulls more rows than this so a multi-item
// outfit wear collapses into a single visible entry without pushing other
// activity off the end (mirrors mobile's 25/5 ratio).
const MAX_ACTIVITY_ENTRIES = 10;

// Collapse wear_logs that share the same outfit_id + worn_at into a single
// outfit entry. Standalone item wears pass through untouched. Preserves the
// server-side order (worn_at desc, then created_at desc) and returns at most
// MAX_ACTIVITY_ENTRIES entries. Once the cap is hit no new entries are
// created, but counts on existing outfit groups continue to increment.
export function groupWearLogs(rows: WearLogRow[]): ActivityEntry[] {
  const out: ActivityEntry[] = [];
  const outfitGroupByKey = new Map<string, Extract<ActivityEntry, { kind: 'outfit' }>>();

  for (const row of rows) {
    if (row.outfit_id) {
      const key = `${row.outfit_id}:${row.worn_at}`;
      const existing = outfitGroupByKey.get(key);
      if (existing) {
        existing.item_count += 1;
        continue;
      }
      if (out.length >= MAX_ACTIVITY_ENTRIES) continue;
      const entry: Extract<ActivityEntry, { kind: 'outfit' }> = {
        kind: 'outfit',
        key,
        worn_at: row.worn_at,
        occasion: row.occasion,
        outfit_name: row.outfits?.name ?? 'Outfit',
        item_count: 1,
      };
      outfitGroupByKey.set(key, entry);
      out.push(entry);
    } else {
      if (out.length >= MAX_ACTIVITY_ENTRIES) continue;
      out.push({
        kind: 'item',
        key: `item:${row.id}`,
        worn_at: row.worn_at,
        occasion: row.occasion,
        item_name: row.items.name,
      });
    }
  }

  return out;
}

interface RecentActivityProps {
  wearLogs: WearLogRow[];
}

export function RecentActivity({ wearLogs }: RecentActivityProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const entries = groupWearLogs(wearLogs);

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
                      {formatDate(entry.worn_at)}
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
