'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  createItemSchema,
  type CreateItemInput,
  ITEM_CATEGORIES,
  SEASONS,
  PATTERNS,
} from '@ropero/core';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoUpload } from './photo-upload';
import { createItem } from '@/app/(app)/wardrobe/add/actions';

// Form values type - matches what the form actually holds
interface FormValues {
  name: string;
  brand: string | null;
  category: (typeof ITEM_CATEGORIES)[number];
  subcategory: string | null;
  color_primary: string;
  color_secondary: string | null;
  pattern: (typeof PATTERNS)[number] | null;
  size: string | null;
  material: string | null;
  season: (typeof SEASONS)[number][];
  formality: number;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_source: string | null;
  notes: string | null;
  tags: string[];
}

export function AddItemForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('photo');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(createItemSchema) as never,
    defaultValues: {
      name: '',
      brand: null,
      category: 'tops',
      subcategory: null,
      color_primary: '#000000',
      color_secondary: null,
      pattern: null,
      size: null,
      material: null,
      season: [],
      formality: 3,
      purchase_date: null,
      purchase_price: null,
      purchase_source: null,
      notes: null,
      tags: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await createItem({
        ...data,
        photo_urls: photoUrls,
      } as CreateItemInput & { photo_urls: string[] });
      router.push('/wardrobe');
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.getValues('tags').includes(tag)) {
      const currentTags = form.getValues('tags');
      form.setValue('tags', [...currentTags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((t) => t !== tagToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photo">1. Photo</TabsTrigger>
            <TabsTrigger value="details">2. Details</TabsTrigger>
            <TabsTrigger value="tags">3. Tags & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="space-y-6 pt-4">
            <div>
              <h3 className="text-lg font-medium">Add Photos</h3>
              <p className="text-sm text-muted-foreground">
                Upload photos of your item. The first photo will be used as the
                thumbnail.
              </p>
            </div>
            <PhotoUpload value={photoUrls} onChange={setPhotoUrls} maxPhotos={5} />
            <div className="flex justify-end">
              <Button type="button" onClick={() => goToTab('details')}>
                Next: Details
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Blue Oxford Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ralph Lauren"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dress shirts"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color_primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" className="h-10 w-14 p-1" {...field} />
                        <Input
                          placeholder="#000000"
                          {...field}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color_secondary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="h-10 w-14 p-1"
                          value={field.value ?? '#ffffff'}
                          onChange={field.onChange}
                        />
                        <Input
                          placeholder="#ffffff"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pattern</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PATTERNS.map((pattern) => (
                          <SelectItem
                            key={pattern}
                            value={pattern}
                            className="capitalize"
                          >
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="M, 32, 10.5"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="100% Cotton"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formality (1-5)</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select formality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Casual</SelectItem>
                        <SelectItem value="2">2 - Casual</SelectItem>
                        <SelectItem value="3">3 - Smart Casual</SelectItem>
                        <SelectItem value="4">4 - Business Casual</SelectItem>
                        <SelectItem value="5">5 - Formal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="season"
              render={() => (
                <FormItem>
                  <FormLabel>Seasons</FormLabel>
                  <FormDescription>
                    Select the seasons this item is suitable for.
                  </FormDescription>
                  <div className="flex flex-wrap gap-4">
                    {SEASONS.map((season) => (
                      <FormField
                        key={season}
                        control={form.control}
                        name="season"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(season)}
                                onCheckedChange={(checked) => {
                                  const currentSeasons = field.value ?? [];
                                  if (checked) {
                                    field.onChange([...currentSeasons, season]);
                                  } else {
                                    field.onChange(
                                      currentSeasons.filter((s) => s !== season)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="capitalize font-normal">
                              {season}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="49.99"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Source</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nordstrom"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => goToTab('photo')}>
                Back: Photo
              </Button>
              <Button type="button" onClick={() => goToTab('tags')}>
                Next: Tags & Submit
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this item..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {field.value.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Review</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {photoUrls.length} photo(s) • {form.watch('category')} •{' '}
                {form.watch('season').length > 0
                  ? form.watch('season').join(', ')
                  : 'No seasons selected'}
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => goToTab('details')}
              >
                Back: Details
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
