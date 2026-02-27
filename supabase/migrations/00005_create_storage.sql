-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload item photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view item photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-photos');

CREATE POLICY "Users can delete own item photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
