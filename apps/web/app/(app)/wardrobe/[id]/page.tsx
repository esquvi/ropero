import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ItemDetail } from '@/components/wardrobe/item-detail';
import { updateItemStatus } from './actions';

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

type ItemRow = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  color_primary: string;
  color_secondary: string | null;
  pattern: string | null;
  size: string | null;
  material: string | null;
  season: string[];
  formality: number;
  photo_urls: string[];
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_source: string | null;
  times_worn: number;
  last_worn_at: string | null;
  status: string;
  notes: string | null;
  tags: string[];
  created_at: string;
};

type WearLogRow = {
  id: string;
  worn_at: string;
  occasion: string | null;
  notes: string | null;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch item
  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) {
    notFound();
  }

  // Fetch wear logs
  const { data: wearLogs } = await supabase
    .from('wear_logs')
    .select('id, worn_at, occasion, notes')
    .eq('item_id', id)
    .order('worn_at', { ascending: false })
    .limit(20);

  const typedItem = item as unknown as ItemRow;
  const typedWearLogs = (wearLogs ?? []) as unknown as WearLogRow[];

  async function handleStatusChange(status: string) {
    'use server';
    await updateItemStatus(id, status);
  }

  return (
    <div className="space-y-6">
      <Link href="/wardrobe">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wardrobe
        </Button>
      </Link>

      <ItemDetail
        item={typedItem}
        wearLogs={typedWearLogs}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
