-- ============================================
-- BUAT ADMIN INSTANT (SIMPLE VERSION)
-- Copy paste dan jalankan di Supabase SQL Editor
-- ============================================

-- STEP 1: Lihat semua user (untuk referensi)
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- ============================================
-- STEP 2: SET ADMIN - PILIH SALAH SATU
-- ============================================

-- OPTION 1: Set user TERBARU jadi admin
UPDATE profiles 
SET role = 'admin',
    full_name = 'Administrator'
WHERE id = (
  SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1
);

-- ATAU --

-- OPTION 2: Set user berdasarkan EMAIL (lebih aman)
-- Uncomment dan ganti emailnya
/*
UPDATE profiles 
SET role = 'admin',
    full_name = 'Administrator'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'EMAIL_ANDA_DISINI'
);
*/

-- ============================================
-- STEP 3: Verifikasi admin berhasil dibuat
-- ============================================
SELECT 
  u.email,
  p.full_name,
  p.role
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin';

-- ============================================
-- CARA PAKAI:
-- 
-- 1. Register user baru di: http://localhost:3000/auth/register
--    - Email: admin@example.com
--    - Password: password123 (atau terserah)
--    - Nama: Administrator
--    - HP: 08123456789
--
-- 2. Jalankan OPTION 1 (set user terbaru jadi admin)
--    ATAU
--    Jalankan OPTION 2 (ganti EMAIL_ANDA_DISINI dengan email yang baru dibuat)
--
-- 3. Login di: http://localhost:3000/admin/login
--    - Email: yang baru Anda register
--    - Password: yang Anda buat tadi
--
-- 4. SELESAI! ✅
-- ============================================
