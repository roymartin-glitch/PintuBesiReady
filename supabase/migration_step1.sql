-- ========================================================
-- MIGRATION STEP 1: DATABASE, SECURITY & AUTHENTICATION
-- Jalankan file ini di Supabase SQL Editor
-- ========================================================

-- 1. Helper function untuk mengecek apakah user adalah admin
-- Menggunakan SECURITY DEFINER agar dapat membaca tabel profiles tanpa memicu RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Memperbaiki trigger registrasi user baru untuk menangkap phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone',
    'visitor'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger untuk memastikan menggunakan versi terbaru
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Transaksi proses checkout (RPC) yang aman dan atomik
CREATE OR REPLACE FUNCTION public.process_checkout(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_items jsonb -- format array: [{"product_id": "...", "quantity": 1}]
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
  -- 1. Verifikasi autentikasi user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- 2. Validasi input dasar
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    RAISE EXCEPTION 'Nama customer tidak boleh kosong';
  END IF;
  IF p_customer_phone IS NULL OR p_customer_phone = '' THEN
    RAISE EXCEPTION 'Nomor HP tidak boleh kosong';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Keranjang/item checkout tidak boleh kosong';
  END IF;

  -- 3. Insert order dengan total_price sementara = 0
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

  -- 4. Iterasi setiap item checkout
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity harus lebih besar dari 0';
    END IF;

    -- Lock baris produk untuk mencegah race condition (Concurrency Stock Check)
    SELECT name, price, stock, is_active 
    INTO v_product_name, v_price, v_stock, v_is_active
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk dengan ID % tidak ditemukan', v_product_id;
    END IF;

    IF NOT v_is_active THEN
      RAISE EXCEPTION 'Produk "%" sedang tidak aktif', v_product_name;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Stok tidak mencukupi untuk produk "%" (Sisa stok: %, Diminta: %)', 
        v_product_name, v_stock, v_quantity;
    END IF;

    -- Hitung subtotal & total
    v_subtotal := v_price * v_quantity;
    v_total_price := v_total_price + v_subtotal;

    -- Insert snapshot item pesanan
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

    -- Kurangi stok produk secara langsung
    UPDATE public.products
    SET stock = stock - v_quantity
    WHERE id = v_product_id;

  END LOOP;

  -- 5. Update total_price final di tabel orders
  UPDATE public.orders
  SET total_price = v_total_price
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Restrukturisasi Kebijakan Keamanan Row Level Security (RLS)
-- Pastikan RLS aktif di seluruh tabel utama
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama agar tidak duplikasi/bentrok
DROP POLICY IF EXISTS "User bisa lihat profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "User bisa update profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Admin bisa melihat semua profil" ON public.profiles;
DROP POLICY IF EXISTS "Admin bisa mengelola semua profil" ON public.profiles;

DROP POLICY IF EXISTS "Produk aktif bisa dibaca semua orang" ON public.products;
DROP POLICY IF EXISTS "Admin bisa kelola produk" ON public.products;

DROP POLICY IF EXISTS "Foto produk bisa dibaca semua orang" ON public.product_images;
DROP POLICY IF EXISTS "Admin bisa kelola foto produk" ON public.product_images;

DROP POLICY IF EXISTS "Kategori bisa dibaca semua orang" ON public.categories;
DROP POLICY IF EXISTS "Admin bisa kelola kategori" ON public.categories;

DROP POLICY IF EXISTS "User bisa lihat order sendiri" ON public.orders;
DROP POLICY IF EXISTS "User bisa melihat order sendiri dan admin bisa melihat semua" ON public.orders;
DROP POLICY IF EXISTS "Siapa saja bisa buat order (termasuk guest checkout)" ON public.orders;
DROP POLICY IF EXISTS "Admin bisa update status order" ON public.orders;
DROP POLICY IF EXISTS "Admin bisa mengupdate order" ON public.orders;

DROP POLICY IF EXISTS "Order items ikut aturan order" ON public.order_items;
DROP POLICY IF EXISTS "User bisa melihat order items miliknya dan admin bisa melihat semua" ON public.order_items;
DROP POLICY IF EXISTS "Siapa saja bisa insert order items" ON public.order_items;

-- --- PROFILES POLICIES ---
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

-- --- CATEGORIES POLICIES ---
CREATE POLICY "Semua orang bisa melihat kategori"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admin memiliki akses penuh ke kategori"
  ON public.categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- --- PRODUCTS POLICIES ---
CREATE POLICY "Publik bisa melihat produk aktif dan admin melihat semua"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admin memiliki akses penuh ke produk"
  ON public.products FOR ALL
  USING (public.is_admin(auth.uid()));

-- --- PRODUCT IMAGES POLICIES ---
CREATE POLICY "Semua orang bisa melihat gambar produk"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admin memiliki akses penuh ke gambar produk"
  ON public.product_images FOR ALL
  USING (public.is_admin(auth.uid()));

-- --- ORDERS POLICIES ---
CREATE POLICY "User melihat order sendiri dan admin melihat semua"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admin memiliki akses penuh ke orders"
  ON public.orders FOR ALL
  USING (public.is_admin(auth.uid()));

-- --- ORDER ITEMS POLICIES ---
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
