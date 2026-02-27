import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Cloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackingList } from '@/components/trips/packing-list';

interface TripPageProps {
  params: Promise<{
    id: string;
  }>;
}

type TripRow = {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  weather_forecast: unknown | null;
  notes: string | null;
};

type PackingListRow = {
  id: string;
  status: string;
  items: {
    item_id: string;
    packed: boolean;
    items: {
      id: string;
      name: string;
      category: string;
      photo_urls: string[];
    };
  }[];
};

const tripTypeColors: Record<string, string> = {
  business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  vacation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  weekend: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  adventure: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch trip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: trip, error } = await (supabase.from('trips') as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !trip) {
    notFound();
  }

  const typedTrip = trip as TripRow;

  // Fetch packing list with items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: packingList } = await (supabase.from('packing_lists') as any)
    .select(`
      id,
      status,
      packing_list_items (
        item_id,
        packed,
        items (
          id,
          name,
          category,
          photo_urls
        )
      )
    `)
    .eq('trip_id', id)
    .single();

  // Fetch all active items for adding to packing list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allItems } = await (supabase.from('items') as any)
    .select('id, name, category, photo_urls')
    .eq('status', 'active')
    .order('category')
    .order('name');

  const startDate = new Date(typedTrip.start_date);
  const endDate = new Date(typedTrip.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Transform packing list items
  const packingItems = packingList?.packing_list_items?.map((pli: { item_id: string; packed: boolean; items: { id: string; name: string; category: string; photo_urls: string[] } }) => ({
    item_id: pli.item_id,
    packed: pli.packed,
    item: pli.items,
  })) ?? [];

  // Items already in packing list
  const packedItemIds = new Set(packingItems.map((pi: { item_id: string }) => pi.item_id));

  // Available items not yet in packing list
  const availableItems = (allItems ?? []).filter((item: { id: string }) => !packedItemIds.has(item.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trips">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{typedTrip.name}</h1>
            <Badge className={tripTypeColors[typedTrip.trip_type] || tripTypeColors.other}>
              {typedTrip.trip_type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trip Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{typedTrip.destination}</p>
                  <p className="text-sm text-muted-foreground">Destination</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(startDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    to {formatDate(endDate)} ({duration} {duration === 1 ? 'day' : 'days'})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Forecast Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              {typedTrip.weather_forecast ? (
                <div className="text-sm">
                  {/* Weather display will be implemented in Task 27 */}
                  <p className="text-muted-foreground">Weather data available</p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-center">
                  <Cloud className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Weather forecast will be available closer to your trip date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {typedTrip.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{typedTrip.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Packing List */}
        <div className="lg:col-span-2">
          <PackingList
            packingListId={packingList?.id}
            items={packingItems}
            availableItems={availableItems ?? []}
          />
        </div>
      </div>
    </div>
  );
}
