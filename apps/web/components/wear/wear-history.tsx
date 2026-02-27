import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WearLog {
  id: string;
  worn_at: string;
  occasion: string | null;
  notes: string | null;
}

interface WearHistoryProps {
  logs: WearLog[];
  maxHeight?: string;
}

export function WearHistory({ logs, maxHeight = '300px' }: WearHistoryProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wear History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              No wear history yet. Log your first wear!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Wear History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

            {logs.map((log, index) => (
              <div key={log.id} className="relative flex gap-4 pb-4">
                {/* Timeline dot */}
                <div className="relative z-10 mt-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {new Date(log.worn_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {log.occasion && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {log.occasion}
                      </Badge>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
