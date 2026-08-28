-- ============================================
-- GOOGLE OAUTH SUPPORT
-- Update trigger untuk support Google OAuth login
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Update handle_new_user function untuk support Google OAuth
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

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- CATATAN:
-- Setelah menjalankan SQL ini:
-- 1. User yang login via Google akan otomatis dibuatkan profile
-- 2. Role default selalu 'visitor' (bukan 'admin')
-- 3. Full name diambil dari Google metadata
-- 4. Phone kosong (user bisa update nanti di profile)
-- ============================================
