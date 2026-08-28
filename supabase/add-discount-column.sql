-- ============================================
-- MIGRATION: Tambah Kolom Diskon pada Produk
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Tambah kolom discount_price (harga sebelum diskon/harga coret) dan discount_percentage
-- CATATAN: 
-- - price = harga jual final (yang customer bayar)
-- - discount_price = harga normal sebelum diskon (harga coret)
-- - discount_percentage = persentase diskon untuk label

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_price numeric(12,2),
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0;

-- Tambah comment untuk dokumentasi
COMMENT ON COLUMN products.price IS 'Harga jual saat ini (final price yang customer bayar)';
COMMENT ON COLUMN products.discount_price IS 'Harga sebelum diskon (harga coret, NULL jika tidak ada diskon)';
COMMENT ON COLUMN products.discount_percentage IS 'Persentase diskon 0-100 (hanya untuk label UI)';

-- Update existing products (set discount jadi 0 jika NULL)
UPDATE products SET discount_percentage = 0 WHERE discount_percentage IS NULL;

-- ============================================
-- Contoh penggunaan:
-- 
-- Produk tanpa diskon:
-- price = 1000000, discount_price = NULL, discount_percentage = 0
-- Tampil: Rp 1.000.000 (tidak ada coret)
-- 
-- Produk dengan diskon:
-- price = 800000 (harga setelah diskon), discount_price = 1000000 (harga coret), discount_percentage = 20
-- Tampil: 
--   Rp 1.000.000 (dicoret)
--   Rp 800.000 (harga final, bold)
--   Badge: DISKON 20%
-- ============================================

