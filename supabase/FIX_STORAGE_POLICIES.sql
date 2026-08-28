-- ============================================
-- FIX STORAGE BUCKET & POLICIES
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Create bucket jika belum ada (akan skip jika sudah ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies untuk clean slate
DROP POLICY IF EXISTS "Public Access untuk melihat gambar" ON storage.objects;
DROP POLICY IF EXISTS "Admin dapat upload gambar" ON storage.objects;
DROP POLICY IF EXISTS "Admin dapat update gambar" ON storage.objects;
DROP POLICY IF EXISTS "Admin dapat delete gambar" ON storage.objects;

-- 3. Policy untuk PUBLIC READ (semua orang bisa lihat gambar)
CREATE POLICY "Public Access untuk melihat gambar"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 4. Policy untuk ADMIN UPLOAD (insert)
CREATE POLICY "Admin dapat upload gambar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 5. Policy untuk ADMIN UPDATE
CREATE POLICY "Admin dapat update gambar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 6. Policy untuk ADMIN DELETE
CREATE POLICY "Admin dapat delete gambar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- VERIFIKASI SETUP
-- ============================================

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check policies
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- ============================================
-- CATATAN PENTING:
-- 1. Bucket 'product-images' harus PUBLIC agar gambar bisa diakses
-- 2. Policies menggunakan role 'admin' dari table profiles
-- 3. Public hanya bisa READ, admin bisa CRUD
-- ============================================
