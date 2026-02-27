import { Plane } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripCard } from '@/components/trips/trip-card';
import { CreateTripForm } from '@/components/trips/create-trip-form';

type TripRow = {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  packing_lists: {
    status: string;
  }[];
};

export default async function TripsPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('trips') as any)
    .select(`
      id,
      name,
      destination,
      start_date,
      end_date,
      trip_type,
      packing_lists (
        status
      )
    `)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching trips:', error);
  }

  const trips = (data ?? []) as TripRow[];

  // Split into upcoming and past
  const upcomingTrips = trips.filter((trip) => trip.end_date >= today);
  const pastTrips = trips.filter((trip) => trip.end_date < today).reverse();

  // Transform to include packing status
  const transformTrip = (trip: TripRow) => ({
    ...trip,
    packing_status: trip.packing_lists?.[0]?.status as 'draft' | 'finalized' | 'packed' | undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground">
            Plan and pack for your upcoming trips
          </p>
        </div>
        <CreateTripForm />
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTrips.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastTrips.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTrips.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={transformTrip(trip)} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No upcoming trips"
              description="Plan your next adventure by creating a new trip."
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastTrips.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastTrips.map((trip) => (
                <TripCard key={trip.id} trip={transformTrip(trip)} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No past trips"
              description="Your completed trips will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message, description }: { message: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
      <Plane className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{message}</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
