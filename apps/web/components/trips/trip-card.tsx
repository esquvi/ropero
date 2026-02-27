import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TripCardProps {
  trip: {
    id: string;
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    trip_type: string;
    packing_status?: 'draft' | 'finalized' | 'packed' | null;
  };
}

const tripTypeColors: Record<string, string> = {
  business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  vacation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  weekend: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  adventure: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const packingStatusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  finalized: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  packed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export function TripCard({ trip }: TripCardProps) {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{trip.name}</CardTitle>
            <Badge className={tripTypeColors[trip.trip_type] || tripTypeColors.other}>
              {trip.trip_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)} ({duration} {duration === 1 ? 'day' : 'days'})
            </span>
          </div>
          {trip.packing_status && (
            <Badge variant="outline" className={packingStatusColors[trip.packing_status]}>
              {trip.packing_status === 'draft' && 'Packing: Draft'}
              {trip.packing_status === 'finalized' && 'Packing: Ready'}
              {trip.packing_status === 'packed' && 'Packed!'}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
