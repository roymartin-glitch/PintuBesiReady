-- ============================================================
-- CHECK AND FIX PRODUCTS ISSUE
-- File ini berisi query untuk diagnose dan fix masalah produk
-- ============================================================

-- ============================================================
-- STEP 1: CEK APAKAH PRODUK ADA DI DATABASE
-- ============================================================

-- Cek jumlah total produk
SELECT COUNT(*) as total_products FROM products;

-- Cek jumlah produk yang aktif
SELECT COUNT(*) as active_products FROM products WHERE is_active = true;

-- Lihat 10 produk terbaru
SELECT 
  id, 
  name, 
  slug, 
  price, 
  stock, 
  is_active, 
  created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================================
-- STEP 2: CEK RLS POLICIES UNTUK PRODUCTS TABLE
-- ============================================================

-- Lihat semua policies untuk table products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Cek apakah RLS enabled untuk products table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'products';

-- ============================================================
-- STEP 3: FIX - ALLOW GUEST USERS TO READ PRODUCTS
-- ============================================================

-- Drop existing policies yang mungkin restrict access
DROP POLICY IF EXISTS "Guest can view active products" ON products;
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Anyone can read active products" ON products;

-- Create policy yang benar untuk guest users
CREATE POLICY "Allow public read access to active products"
ON products
FOR SELECT
TO public
USING (is_active = true);

-- ============================================================
-- STEP 4: VERIFY POLICY WORKS
-- ============================================================

-- Test query sebagai anonymous user
-- Query ini seharusnya return products jika policy benar
SELECT COUNT(*) 
FROM products 
WHERE is_active = true;

-- ============================================================
-- STEP 5: CEK PRODUCT IMAGES
-- ============================================================

-- Cek apakah produk punya gambar
SELECT 
  p.id,
  p.name,
  COUNT(pi.id) as total_images,
  SUM(CASE WHEN pi.is_primary THEN 1 ELSE 0 END) as primary_images
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================================
-- STEP 6 (OPTIONAL): INSERT SAMPLE PRODUCTS IF EMPTY
-- ============================================================

-- Jika database kosong, jalankan query ini untuk insert produk sample
-- UNCOMMENT JIKA DIBUTUHKAN:

/*
-- Get category ID untuk "Pintu Garasi"
-- Ganti 'pintu-garasi' dengan slug kategori yang ada
DO $$
DECLARE
  cat_id UUID;
BEGIN
  SELECT id INTO cat_id FROM categories WHERE slug = 'pintu-garasi' LIMIT 1;
  
  IF cat_id IS NOT NULL THEN
    -- Insert sample product
    INSERT INTO products (
      category_id,
      name,
      slug,
      description,
      size,
      material,
      price,
      discount_price,
      discount_percentage,
      stock,
      is_active
    ) VALUES (
      cat_id,
      'Pintu Garasi Lipat Besi Hollow Premium',
      'pintu-garasi-lipat-besi-hollow-premium',
      'Pintu garasi lipat besi hollow dengan ketebalan plat 2.0mm. Sistem lipat manual, kokoh dan tahan lama. Cocok untuk garasi rumah dan ruko.',
      '2.5m x 2.5m',
      'Besi Hollow + Plat 2.0mm',
      7500000,
      8500000,
      12,
      5,
      true
    );
    
    RAISE NOTICE 'Sample product created successfully!';
  ELSE
    RAISE NOTICE 'Category not found. Please create categories first.';
  END IF;
END $$;
*/

-- ============================================================
-- STEP 7: VERIFY CATEGORIES EXIST
-- ============================================================

-- Cek apakah ada kategori
SELECT id, name, slug FROM categories ORDER BY name;

-- Jika tidak ada kategori, create dulu
-- UNCOMMENT JIKA DIBUTUHKAN:

/*
INSERT INTO categories (name, slug) VALUES
('Pintu Garasi', 'pintu-garasi'),
('Pintu Pagar', 'pintu-pagar'),
('Pintu Rumah', 'pintu-rumah'),
('Rolling Door', 'rolling-door'),
('Teralis Jendela', 'teralis-jendela')
ON CONFLICT (slug) DO NOTHING;
*/

-- ============================================================
-- TROUBLESHOOTING TIPS
-- ============================================================

/*
PROBLEM 1: Products table tidak ada
SOLUTION: Jalankan supabase/FINAL_DATABASE_SETUP.sql

PROBLEM 2: RLS blocking guest access
SOLUTION: Jalankan STEP 3 di atas

PROBLEM 3: Categories tidak ada
SOLUTION: Jalankan STEP 7 untuk create categories

PROBLEM 4: Produk ada di localhost tapi tidak di Vercel
SOLUTION: 
  - Cek environment variables di Vercel
  - NEXT_PUBLIC_SUPABASE_URL harus sama di localhost dan Vercel
  - Jika beda, berarti menggunakan database berbeda

PROBLEM 5: Produk muncul di admin tapi tidak di homepage
SOLUTION:
  - Pastikan is_active = true
  - Cek RLS policies (STEP 2-3)
  - Test query di STEP 4
*/

-- ============================================================
-- EXPECTED RESULTS
-- ============================================================

/*
Setelah menjalankan fix:
✅ STEP 1: Total products > 0
✅ STEP 2: Ada policy untuk public/anon users
✅ STEP 4: Query return products > 0
✅ Homepage dan /produk menampilkan produk
✅ Guest users (tidak login) bisa lihat produk
*/
