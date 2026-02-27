import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddItemForm } from '@/components/wardrobe/add-item-form';

export default function AddItemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/wardrobe">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Item</h1>
          <p className="text-muted-foreground">
            Add a new item to your wardrobe
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AddItemForm />
        </CardContent>
      </Card>
    </div>
  );
}
