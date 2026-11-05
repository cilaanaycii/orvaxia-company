INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'orvaxia-images',
  'orvaxia-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view Orvaxia images" ON storage.objects;
CREATE POLICY "Public can view Orvaxia images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'orvaxia-images');
