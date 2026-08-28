-- ============================================
-- PINTU BESI SHOP - COMPLETE DATABASE SETUP
-- Jalankan file ini di Supabase SQL Editor
-- 
-- URUTAN INSTALASI:
-- 1. Jalankan SQL ini sekali untuk setup database lengkap
-- 2. Buat bucket storage "product-images" dengan public access
-- 3. Buat user admin pertama dengan mengupdate role di profiles
-- ============================================

-- Extension untuk UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABEL PROFILES (extend auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  phone text,
  address text,
  role text NOT NULL DEFAULT 'visitor' CHECK (role IN ('visitor', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. HELPER FUNCTION: is_admin
-- Menggunakan SECURITY DEFINER untuk menghindari RLS recursion
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. TRIGGER: Auto-create profile saat user baru daftar
-- Support Email/Password & Google OAuth
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile untuk user baru (email/password atau Google OAuth)
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    'visitor'  -- Always visitor, never admin via OAuth
  )
  ON CONFLICT (id) DO NOTHING;  -- Skip jika sudah ada
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 4. TABEL CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories (hanya jika belum ada)
INSERT INTO categories (name, slug) VALUES
  ('Pintu Pagar', 'pintu-pagar'),
  ('Pintu Garasi', 'pintu-garasi'),
  ('Pintu Rumah', 'pintu-rumah'),
  ('Pintu Gudang / Rolling Door', 'rolling-door')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 5. TABEL PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(12,2) NOT NULL,
  original_price numeric(12,2),
  discount_price numeric(12,2),
  discount_percentage integer DEFAULT 0,
  stock integer DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  size text,
  material text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comments
COMMENT ON COLUMN products.price IS 'Harga jual final (yang customer bayar)';
COMMENT ON COLUMN products.original_price IS 'Harga asli sebelum diskon';
COMMENT ON COLUMN products.discount_price IS 'Harga sebelum diskon (untuk display coret)';
COMMENT ON COLUMN products.discount_percentage IS 'Persentase diskon 0-100 (untuk label badge)';

-- ============================================
-- 6. TABEL PRODUCT_IMAGES
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0
);

-- ============================================
-- 7. TABEL ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  order_type text NOT NULL DEFAULT 'checkout' CHECK (order_type IN ('whatsapp', 'checkout')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 8. TABEL ORDER_ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  price numeric(12,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric(12,2) NOT NULL
);

-- ============================================
-- 9. RPC FUNCTION: process_checkout
-- Transaksi atomic untuk checkout dengan validasi stok
-- ============================================
CREATE OR REPLACE FUNCTION public.process_checkout(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_total_price numeric(12,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_price numeric(12,2);
  v_product_name text;
  v_stock integer;
  v_is_active boolean;
  v_subtotal numeric(12,2);
BEGIN
  -- 1. Verifikasi autentikasi
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- 2. Validasi input
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    RAISE EXCEPTION 'Nama customer tidak boleh kosong';
  END IF;
  IF p_customer_phone IS NULL OR p_customer_phone = '' THEN
    RAISE EXCEPTION 'Nomor HP tidak boleh kosong';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Keranjang tidak boleh kosong';
  END IF;

  -- 3. Insert order
  INSERT INTO public.orders (
    user_id,
    customer_name,
    customer_phone,
    customer_address,
    notes,
    order_type,
    status,
    total_price
  ) VALUES (
    v_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_address,
    p_notes,
    'checkout',
    'pending',
    0
  ) RETURNING id INTO v_order_id;

  -- 4. Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity harus lebih besar dari 0';
    END IF;

    -- Lock product row for concurrency control
    SELECT name, price, stock, is_active 
    INTO v_product_name, v_price, v_stock, v_is_active
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan';
    END IF;

    IF NOT v_is_active THEN
      RAISE EXCEPTION 'Produk "%" tidak aktif', v_product_name;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Stok tidak cukup untuk produk "%" (Tersedia: %, Diminta: %)', 
        v_product_name, v_stock, v_quantity;
    END IF;

    -- Calculate subtotal
    v_subtotal := v_price * v_quantity;
    v_total_price := v_total_price + v_subtotal;

    -- Insert order item (snapshot)
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      price,
      quantity,
      subtotal
    ) VALUES (
      v_order_id,
      v_product_id,
      v_product_name,
      v_price,
      v_quantity,
      v_subtotal
    );

    -- Reduce stock
    UPDATE public.products
    SET stock = stock - v_quantity
    WHERE id = v_product_id;

  END LOOP;

  -- 5. Update total price
  UPDATE public.orders
  SET total_price = v_total_price
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "User bisa melihat profil sendiri atau admin" ON public.profiles;
DROP POLICY IF EXISTS "User bisa update profil sendiri atau admin" ON public.profiles;
DROP POLICY IF EXISTS "Admin bisa insert/delete profil" ON public.profiles;
DROP POLICY IF EXISTS "Semua orang bisa melihat kategori" ON public.categories;
DROP POLICY IF EXISTS "Admin memiliki akses penuh ke kategori" ON public.categories;
DROP POLICY IF EXISTS "Publik bisa melihat produk aktif dan admin melihat semua" ON public.products;
DROP POLICY IF EXISTS "Admin memiliki akses penuh ke produk" ON public.products;
DROP POLICY IF EXISTS "Semua orang bisa melihat gambar produk" ON public.product_images;
DROP POLICY IF EXISTS "Admin memiliki akses penuh ke gambar produk" ON public.product_images;
DROP POLICY IF EXISTS "User melihat order sendiri dan admin melihat semua" ON public.orders;
DROP POLICY IF EXISTS "Admin memiliki akses penuh ke orders" ON public.orders;
DROP POLICY IF EXISTS "User melihat order items sendiri dan admin melihat semua" ON public.order_items;
DROP POLICY IF EXISTS "Admin memiliki akses penuh ke order items" ON public.order_items;

-- PROFILES POLICIES
CREATE POLICY "User bisa melihat profil sendiri atau admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "User bisa update profil sendiri atau admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admin bisa insert/delete profil"
  ON public.profiles FOR ALL
  USING (public.is_admin(auth.uid()));

-- CATEGORIES POLICIES
CREATE POLICY "Semua orang bisa melihat kategori"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admin memiliki akses penuh ke kategori"
  ON public.categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- PRODUCTS POLICIES
CREATE POLICY "Publik bisa melihat produk aktif dan admin melihat semua"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admin memiliki akses penuh ke produk"
  ON public.products FOR ALL
  USING (public.is_admin(auth.uid()));

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Semua orang bisa melihat gambar produk"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admin memiliki akses penuh ke gambar produk"
  ON public.product_images FOR ALL
  USING (public.is_admin(auth.uid()));

-- ORDERS POLICIES
CREATE POLICY "User melihat order sendiri dan admin melihat semua"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admin memiliki akses penuh ke orders"
  ON public.orders FOR ALL
  USING (public.is_admin(auth.uid()));

-- ORDER ITEMS POLICIES
CREATE POLICY "User melihat order items sendiri dan admin melihat semua"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY "Admin memiliki akses penuh ke order items"
  ON public.order_items FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- POST-INSTALLATION STEPS:
-- 
-- 1. Buat Storage Bucket "product-images":
--    - Buka Storage di dashboard Supabase
--    - Buat bucket baru bernama "product-images"
--    - Set sebagai Public bucket
--    - Allow file upload .jpg, .jpeg, .png, .webp
--
-- 2. Buat User Admin Pertama:
--    Setelah user pertama register, jalankan:
--    UPDATE profiles SET role = 'admin' WHERE id = '[USER_UUID]';
--    
--    Untuk mendapatkan USER_UUID, cek di:
--    SELECT id, email FROM auth.users LIMIT 5;
--
-- 3. Test Database:
--    - Login sebagai admin
--    - Tambah produk di /admin/produk/baru
--    - Lihat produk di homepage
--    - Test cart dan checkout
-- ============================================
