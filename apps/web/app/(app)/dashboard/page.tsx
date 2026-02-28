import Link from 'next/link';
import { Shirt, Layers, Plane, TrendingUp, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { UpcomingTrips } from '@/components/dashboard/upcoming-trips';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch all stats in parallel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const [
    { count: totalItems },
    { count: activeItems },
    { count: archivedItems },
    { count: totalOutfits },
    { data: valueData },
    { data: wearLogs },
    { data: upcomingTrips },
    { data: categoryData },
    { data: mostWorn },
    { data: leastWorn },
  ] = await Promise.all([
    sb.from('items').select('*', { count: 'exact', head: true }),
    sb.from('items').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('items').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    sb.from('outfits').select('*', { count: 'exact', head: true }),
    sb.from('items').select('purchase_price').eq('status', 'active').not('purchase_price', 'is', null),
    sb.from('wear_logs').select('id, worn_at, occasion, items(name, category)').order('worn_at', { ascending: false }).limit(10),
    sb.from('trips').select('id, name, destination, start_date, end_date, trip_type, packing_lists(status)').gte('start_date', new Date().toISOString().split('T')[0]).order('start_date').limit(3),
    sb.from('items').select('category').eq('status', 'active'),
    sb.from('items').select('id, name, times_worn, photo_urls').eq('status', 'active').order('times_worn', { ascending: false }).limit(3),
    sb.from('items').select('id, name, times_worn, photo_urls').eq('status', 'active').gt('times_worn', 0).order('times_worn', { ascending: true }).limit(3),
  ]);

  // Calculate wardrobe value
  const wardrobeValue = (valueData ?? []).reduce(
    (sum: number, item: { purchase_price: number }) => sum + (item.purchase_price ?? 0),
    0
  );

  // Count items by category
  const categoryCounts: Record<string, number> = {};
  for (const item of categoryData ?? []) {
    categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
  }

  const sortedCategories = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your wardrobe at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={totalItems ?? 0}
          description={`${activeItems ?? 0} active, ${archivedItems ?? 0} archived`}
          icon={Shirt}
        />
        <StatCard
          title="Outfits"
          value={totalOutfits ?? 0}
          description="Saved outfit combinations"
          icon={Layers}
        />
        <StatCard
          title="Upcoming Trips"
          value={upcomingTrips?.length ?? 0}
          description="Trips to prepare for"
          icon={Plane}
        />
        <StatCard
          title="Wardrobe Value"
          value={`$${wardrobeValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          description="Total active items value"
          icon={TrendingUp}
        />
      </div>

      {/* Items by Category */}
      {sortedCategories.length > 0 && (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {sortedCategories.map(([category, count]) => (
            <div
              key={category}
              className="rounded-lg border p-3 text-center"
            >
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{category}</p>
            </div>
          ))}
        </div>
      )}

      {/* Most/Least Worn + Activity + Trips */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity wearLogs={wearLogs ?? []} />
        <UpcomingTrips trips={upcomingTrips ?? []} />
      </div>

      {/* Most & Least Worn */}
      {((mostWorn?.length ?? 0) > 0 || (leastWorn?.length ?? 0) > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {(mostWorn?.length ?? 0) > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Most Worn</h3>
              <div className="space-y-2">
                {(mostWorn ?? []).map((item: { id: string; name: string; times_worn: number }) => (
                  <Link key={item.id} href={`/wardrobe/${item.id}`} className="flex items-center justify-between rounded p-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.times_worn}x</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {(leastWorn?.length ?? 0) > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Least Worn</h3>
              <div className="space-y-2">
                {(leastWorn ?? []).map((item: { id: string; name: string; times_worn: number }) => (
                  <Link key={item.id} href={`/wardrobe/${item.id}`} className="flex items-center justify-between rounded p-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.times_worn}x</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/wardrobe/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
        <Link href="/wear-log">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Log Wear
          </Button>
        </Link>
        <Link href="/trips">
          <Button variant="outline">
            <Plane className="mr-2 h-4 w-4" />
            Plan Trip
          </Button>
        </Link>
      </div>
    </div>
  );
}
