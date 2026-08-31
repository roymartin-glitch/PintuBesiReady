-- ============================================
-- TABEL PENGATURAN TOKO (STORE SETTINGS)
-- Admin bisa ubah nama toko, alamat, kontak, dll
-- ============================================

-- Tabel store_settings (single row table)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Pintu Besi Shop',
  store_tagline text DEFAULT 'Konstruksi Besi Kokoh, Presisi & Premium',
  store_description text DEFAULT 'Toko Pintu Besi menyediakan pintu garasi lipat, pintu pagar otomatis, teralis jendela, dan rolling door industrial berkualitas terbaik.',
  
  -- Kontak & Lokasi
  phone_number text,
  whatsapp_number text DEFAULT '6285276358423',
  email text,
  address text,
  city text,
  province text,
  postal_code text,
  google_maps_url text,
  
  -- Social Media
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  
  -- Business Info
  business_hours text DEFAULT 'Senin - Sabtu: 08.00 - 17.00 WIB',
  established_year integer,
  
  -- SEO & Branding
  meta_description text,
  meta_keywords text,
  logo_url text,
  favicon_url text,
  
  -- Footer Info
  footer_text text DEFAULT '© 2024 Pintu Besi Shop. All rights reserved.',
  
  -- Timestamps
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Public bisa READ (semua orang bisa lihat info toko)
CREATE POLICY "Public dapat melihat pengaturan toko"
  ON public.store_settings FOR SELECT
  USING (true);

-- Policy: Admin bisa UPDATE (hanya admin yang bisa edit)
CREATE POLICY "Admin dapat mengubah pengaturan toko"
  ON public.store_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin bisa INSERT (untuk inisialisasi pertama kali)
CREATE POLICY "Admin dapat membuat pengaturan toko"
  ON public.store_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default data (single row)
-- CATATAN: Hanya akan insert jika belum ada data
INSERT INTO public.store_settings (
  id,
  store_name,
  store_tagline,
  store_description,
  whatsapp_number,
  phone_number,
  email,
  address,
  city,
  province,
  business_hours,
  footer_text
)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Pintu Besi Shop',
  'Konstruksi Besi Kokoh, Presisi & Premium',
  'Toko Pintu Besi menyediakan pintu garasi lipat, pintu pagar otomatis, teralis jendela, dan rolling door industrial berkualitas terbaik langsung dari pengrajin ahli dengan besi pilihan.',
  '6285276358423',
  '0852-7635-8423',
  'info@pintubesi.shop',
  'Jl. Industri Besi No. 123',
  'Jakarta',
  'DKI Jakarta',
  'Senin - Sabtu: 08.00 - 17.00 WIB | Minggu: Tutup',
  '© 2024 Pintu Besi Shop. Konstruksi besi berkualitas untuk Indonesia.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.store_settings LIMIT 1
);

-- Function helper untuk get settings (always return single row)
CREATE OR REPLACE FUNCTION get_store_settings()
RETURNS SETOF store_settings
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM store_settings LIMIT 1;
$$;

-- ============================================
-- VERIFIKASI
-- ============================================

-- Check table created
SELECT 'Table store_settings created' as status;

-- Check policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'store_settings';

-- Check data
SELECT 
  store_name, 
  whatsapp_number, 
  address, 
  city 
FROM store_settings;

