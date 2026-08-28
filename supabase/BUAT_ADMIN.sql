-- ============================================
-- MEMBUAT USER ADMIN
-- Jalankan di Supabase SQL Editor
-- ============================================

-- STEP 1: Lihat semua user yang ada
-- Copy-paste dan run query ini dulu untuk melihat daftar user
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 2: Set user jadi admin
-- GANTI 'email@anda.com' dengan email yang baru Anda register
-- ============================================

UPDATE profiles 
SET role = 'admin',
    full_name = 'Administrator'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email@anda.com'
);

-- Contoh:
-- UPDATE profiles 
-- SET role = 'admin',
--     full_name = 'Administrator'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
-- );

-- ============================================
-- STEP 3: Verifikasi perubahan
-- ============================================
SELECT 
  u.email,
  p.full_name,
  p.role
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin';

-- ============================================
-- CATATAN:
-- Setelah run SQL ini:
-- 1. Logout dari website jika sudah login
-- 2. Login lagi dengan email/password yang baru Anda buat
-- 3. Anda sekarang bisa akses /admin
-- 
-- PENTING:
-- - Ganti 'email@anda.com' di STEP 2 dengan email Anda yang sebenarnya
-- - Password tetap yang Anda gunakan saat register
-- - Tidak ada cara reset password via SQL, gunakan Supabase Dashboard
-- ============================================
