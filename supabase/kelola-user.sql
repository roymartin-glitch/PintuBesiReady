-- ============================================
-- KELOLA USER: Admin vs Visitor/Pengguna Biasa
-- Jalankan di Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CEK SEMUA USER DAN ROLE-NYA
-- ============================================
SELECT 
  au.id,
  au.email,
  au.created_at as tanggal_daftar,
  p.full_name as nama_lengkap,
  p.phone as no_hp,
  p.role as role_user
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC;

-- ============================================
-- 2. UBAH USER JADI ADMIN
-- ============================================
-- Ganti 'EMAIL_USER' dengan email user yang mau dijadikan admin

UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- Contoh: Jadikan user admin@gmail.com sebagai admin
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');

-- ============================================
-- 3. UBAH ADMIN JADI USER BIASA (VISITOR)
-- ============================================
-- Ganti 'EMAIL_ADMIN' dengan email admin yang mau dijadikan visitor

UPDATE profiles 
SET role = 'visitor' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
);

-- ============================================
-- 4. BUAT USER VISITOR BARU (Manual via SQL)
-- ============================================
-- Catatan: Cara ini hanya untuk testing, production sebaiknya pakai halaman Register

-- JANGAN GUNAKAN INI - Gunakan halaman /auth/register saja!
-- User harus daftar lewat halaman register agar password ter-hash dengan benar

-- ============================================
-- 5. HAPUS USER (Hati-hati!)
-- ============================================
-- Ini akan hapus user dari auth.users dan otomatis hapus profile-nya juga (cascade)

-- DELETE FROM auth.users WHERE email = 'user@example.com';

-- ============================================
-- CARA PAKAI
-- ============================================

-- A. CEK ROLE USER YANG SEDANG ADA:
--    Jalankan query nomor 1, lihat kolom "role_user"

-- B. BUAT USER VISITOR BARU:
--    1. Buka browser → http://localhost:3000/auth/register
--    2. Isi form: Nama, Email, No HP, Password
--    3. Klik "Daftar"
--    4. Login dengan kredensial baru
--    5. User otomatis dapat role "visitor"

-- C. UBAH USER JADI ADMIN:
--    1. Jalankan query nomor 2
--    2. Ganti 'admin@example.com' dengan email user yang mau dijadikan admin
--    3. Run
--    4. User logout → login lagi → sekarang jadi admin

-- D. UBAH ADMIN JADI VISITOR:
--    1. Jalankan query nomor 3
--    2. Ganti 'admin@gmail.com' dengan email admin
--    3. Run
--    4. Admin logout → login lagi → sekarang jadi visitor

-- ============================================
-- CONTOH KASUS
-- ============================================

-- Scenario 1: Kamu punya 1 akun admin@gmail.com (role: admin)
--             Mau buat akun visitor baru untuk testing

-- Jawab: 
-- 1. Buka http://localhost:3000/auth/register
-- 2. Daftar dengan email lain, misal: user@gmail.com
-- 3. User baru otomatis role "visitor"
-- 4. Login dengan user@gmail.com → Tidak bisa akses /admin/*
-- 5. Login dengan admin@gmail.com → Bisa akses /admin/*

-- Scenario 2: Admin ingin jadi visitor sementara untuk testing

-- Jawab:
-- Jalankan query ini:
-- UPDATE profiles SET role = 'visitor' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
-- Logout → Login lagi → Sekarang jadi visitor

-- Scenario 3: Visitor ingin dijadikan admin

-- Jawab:
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'user@gmail.com');
-- User logout → login lagi → Sekarang jadi admin

-- ============================================
-- CATATAN PENTING
-- ============================================

-- 1. Jangan edit tabel auth.users langsung kecuali untuk delete
-- 2. Untuk ubah role, edit tabel profiles saja
-- 3. User baru WAJIB daftar lewat /auth/register agar password ter-hash
-- 4. Admin di-set manual via SQL, tidak ada halaman register admin
-- 5. Setelah ubah role, user harus logout & login ulang agar session refresh
