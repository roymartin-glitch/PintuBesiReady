-- ============================================
-- FIX: Infinite Recursion di RLS Policy Profiles
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Hapus policy lama yang menyebabkan infinite recursion
DROP POLICY IF EXISTS "User bisa lihat profil sendiri" ON profiles;
DROP POLICY IF EXISTS "User bisa update profil sendiri" ON profiles;
DROP POLICY IF EXISTS "Admin bisa kelola produk" ON products;
DROP POLICY IF EXISTS "Admin bisa kelola foto produk" ON product_images;
DROP POLICY IF EXISTS "Admin bisa kelola kategori" ON categories;

-- ============================================
-- PROFILES: Policy baru tanpa recursion
-- ============================================

-- User bisa lihat profil sendiri (tidak cek ke profiles lagi)
CREATE POLICY "User bisa lihat profil sendiri"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- User bisa update profil sendiri
CREATE POLICY "User bisa update profil sendiri"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PRODUCTS, IMAGES, CATEGORIES: Policy admin dengan JOIN yang benar
-- ============================================

-- Admin bisa kelola produk (gunakan JOIN dengan auth.uid())
CREATE POLICY "Admin bisa kelola produk"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin bisa kelola foto produk
CREATE POLICY "Admin bisa kelola foto produk"
  ON product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admin bisa kelola kategori
CREATE POLICY "Admin bisa kelola kategori"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- CATATAN:
-- Setelah jalankan SQL ini, logout dan login kembali
-- untuk memastikan session ter-refresh dengan policy baru
-- ============================================
