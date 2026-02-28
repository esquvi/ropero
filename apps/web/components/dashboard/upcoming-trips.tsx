import Link from 'next/link';
import { Plane, MapPin, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TripEntry {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  packing_lists: { status: string }[];
}

interface UpcomingTripsProps {
  trips: TripEntry[];
}

const packingStatusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  finalized: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  packed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export function UpcomingTrips({ trips }: UpcomingTripsProps) {
  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
  };

  const daysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Upcoming Trips
          </CardTitle>
          <Link href="/trips">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => {
              const packingStatus = trip.packing_lists[0]?.status ?? 'none';
              return (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{trip.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <CalendarDays className="h-3 w-3" />
                          {formatDateRange(trip.start_date, trip.end_date)}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs font-medium text-primary">
                          {daysUntil(trip.start_date)}
                        </p>
                        {packingStatus !== 'none' && (
                          <Badge className={packingStatusColors[packingStatus] ?? ''}>
                            {packingStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No upcoming trips. Plan your next adventure!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
