import { Shirt, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WearLogEntry {
  id: string;
  worn_at: string;
  occasion: string | null;
  items: {
    name: string;
    category: string;
  };
}

interface RecentActivityProps {
  wearLogs: WearLogEntry[];
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {wearLogs.length > 0 ? (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3">
              {wearLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Shirt className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Wore {log.items.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.occasion && <span className="capitalize">{log.occasion} &middot; </span>}
                      {formatDate(log.worn_at)}
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
