# 🐛 FIX: Infinite Recursion di RLS Policy

## Masalah yang Ditemukan

Saat mencoba akses `/admin/produk` setelah login, muncul error di console server:

```
❌ Profile error: infinite recursion detected in policy for relation "profiles"
❌ Bukan admin, redirect ke /
```

## Penyebab Masalah

Di file `supabase/schema.sql`, ada policy RLS untuk tabel `profiles` yang **membaca dirinya sendiri** (infinite loop):

```sql
-- ❌ SALAH: Policy ini baca profiles lagi untuk cek admin
create policy "User bisa lihat profil sendiri"
  on profiles for select
  using (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles  -- ❌ Baca profiles lagi!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Masalahnya:** 
- Saat middleware coba baca `profiles` table untuk cek role
- Policy ini jalan dan cek `profiles` table lagi untuk validasi admin
- Loop terus-menerus → infinite recursion
- PostgreSQL detect loop dan reject query

## Solusi

Pisahkan policy agar tidak terjadi loop:

1. **Policy untuk user biasa**: Hanya cek `auth.uid() = id` (tanpa baca profiles lagi)
2. **Policy untuk admin**: Tetap bisa kelola produk/kategori/foto dengan JOIN yang benar

## Cara Memperbaiki

### Langkah 1: Jalankan SQL Migration

1. Buka **Supabase Dashboard** → Project Anda
2. Klik **SQL Editor** di sidebar
3. Klik **New query**
4. Copy-paste isi file `supabase/fix-rls-policies.sql` ke editor
5. Klik **Run** (atau tekan Ctrl+Enter)
6. Tunggu sampai muncul "Success. No rows returned"

### Langkah 2: Logout dan Login Kembali

1. Di aplikasi, logout dari admin (atau clear cookies browser)
2. Login kembali dengan kredensial admin
3. Coba akses `/admin/produk` lagi

### Langkah 3: Verifikasi

Setelah fix, log di terminal **seharusnya** berubah jadi:

```
✅ Login berhasil: admin@gmail.com
🔍 Middleware - Path: /admin/produk
👤 User: admin@gmail.com
👔 Profile role: admin
✅ Admin verified, allow access
```

## File SQL Migration

File sudah dibuat di: `supabase/fix-rls-policies.sql`

Policy baru yang diperbaiki:

```sql
-- ✅ BENAR: Hanya cek auth.uid(), tidak baca profiles lagi
CREATE POLICY "User bisa lihat profil sendiri"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy admin tetap bisa akses produk/kategori dengan JOIN
CREATE POLICY "Admin bisa kelola produk"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

## Update Schema.sql (Opsional)

Jika ingin update file `schema.sql` untuk deploy fresh di tempat lain, ganti policy lama dengan yang baru di file `supabase/schema.sql` (baris ~157).

Tapi untuk database yang sudah jalan, cukup jalankan migration `fix-rls-policies.sql` saja.

---

## Setelah Fix Berhasil

Setelah policy diperbaiki dan Anda bisa akses `/admin/produk` dengan normal, kita bisa lanjut test:

### Fitur yang Sudah Selesai:
- ✅ Upload foto produk (Fitur #1)
- ✅ Halaman edit produk dengan upload/hapus foto (Fitur A)
- ✅ Dropdown kategori di form tambah & edit produk (Fitur B)

### Fitur Berikutnya:
- Fitur C: Dashboard kelola pesanan (admin)
- Fitur D: Halaman kategori (publik)
- Fitur E: Layout & navigasi admin
- Fitur F: Polish & perbaikan kecil

**Konfirmasi ke saya setelah SQL migration berhasil dijalankan!** 🚀
