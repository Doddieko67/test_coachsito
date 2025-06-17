-- Create storage bucket for designs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'designs', 
  'designs', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Storage policies for designs bucket

-- Allow authenticated users to upload their own design files
CREATE POLICY "Users can upload design files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'designs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own design files
CREATE POLICY "Users can update their own design files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'designs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own design files
CREATE POLICY "Users can delete their own design files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'designs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to design files (since bucket is public)
CREATE POLICY "Public can view design files" ON storage.objects
FOR SELECT USING (bucket_id = 'designs');