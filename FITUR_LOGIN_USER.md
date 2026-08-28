# 🔐 FITUR LOGIN/REGISTER UNTUK USER BIASA

## Yang Sudah Dibuat

### 1. Halaman Login User (`/auth/login`)
- Form login dengan email & password
- Link ke halaman register
- Link kembali ke beranda
- Redirect ke halaman sebelumnya setelah login (via query param `?redirect=`)

### 2. Halaman Register User (`/auth/register`)
- Form pendaftaran: Nama, Email, No HP, Password
- Validasi password (min 6 karakter, harus match dengan konfirmasi)
- Auto-create profile dengan role `visitor`
- Redirect ke login setelah berhasil daftar

### 3. Update OrderActions (Checkout)
- **Cek login** saat user klik tombol "Checkout"
- Jika belum login → redirect ke `/auth/login?redirect=/produk/[slug]`
- Setelah login → kembali ke halaman produk dan bisa checkout
- Form checkout otomatis ter-prefill dengan data profile user
- **WhatsApp order tetap bisa tanpa login**

### 4. Update Homepage
- Tampilkan status login user
- Jika **belum login**: tampil link "Masuk | Daftar | Admin"
- Jika **sudah login**: tampil "Halo, [nama]" + link "Admin"
- Homepage **tetap bisa diakses tanpa login**

---

## Flow User

### Scenario 1: User Belum Login (Guest)
1. Buka homepage → **BISA**, lihat semua produk
2. Klik produk → **BISA**, lihat detail
3. Klik "Pesan Cepat via WhatsApp" → **BISA**, langsung ke WA tanpa login
4. Klik "Checkout" → **REDIRECT** ke `/auth/login?redirect=/produk/[slug]`
5. User pilih: **Login** atau **Daftar**
6. Setelah login → **REDIRECT** kembali ke halaman produk
7. Klik "Checkout" lagi → **BISA**, form muncul ter-prefill

### Scenario 2: User Sudah Login
1. Buka homepage → Muncul "Halo, [nama]" di header
2. Klik produk → detail produk
3. Klik "Checkout" → **LANGSUNG** muncul form (tidak redirect login)
4. Isi form → Submit → Pesanan tersimpan di database

### Scenario 3: Admin
1. Klik link "Admin" di homepage
2. Login dengan akun admin
3. Masuk ke `/admin/produk` → kelola produk
4. Admin **TIDAK** bisa lihat semua pesanan (fitur ini akan dibuat di Fitur C)

---

## File yang Dibuat/Diupdate

### Baru:
1. `app/auth/login/page.js` - Halaman login user
2. `app/auth/register/page.js` - Halaman register user
3. `FITUR_LOGIN_USER.md` - Dokumentasi ini

### Update:
1. `app/produk/[slug]/OrderActions.js` - Cek login saat checkout
2. `app/page.js` - Tampilkan status login di header

---

## Testing Flow

### Test 1: Register User Baru
1. Buka http://localhost:3000
2. Klik "Daftar" di header
3. Isi form pendaftaran
4. Klik "Daftar" → Muncul alert "Registrasi berhasil"
5. Redirect ke login → Login dengan kredensial tadi
6. Redirect ke homepage → Muncul "Halo, [nama]"

### Test 2: Checkout Tanpa Login
1. **Logout** dulu (clear cookies atau incognito mode)
2. Buka homepage → Pilih produk
3. Klik "Checkout"
4. **Harus** redirect ke `/auth/login`
5. Login → **Harus** kembali ke halaman produk
6. Klik "Checkout" lagi → Form muncul

### Test 3: WhatsApp Tanpa Login
1. **Logout** dulu
2. Buka homepage → Pilih produk
3. Klik "Pesan Cepat via WhatsApp"
4. **Harus** langsung ke WA tanpa redirect login

---

## Perbedaan: User vs Admin

| Fitur | User Biasa (Visitor) | Admin |
|-------|---------------------|-------|
| Login | `/auth/login` | `/admin/login` |
| Register | `/auth/register` | Tidak ada (admin di-set manual) |
| Role di database | `visitor` | `admin` |
| Akses homepage | ✅ Ya | ✅ Ya |
| Lihat produk | ✅ Ya | ✅ Ya |
| Checkout | ✅ Ya (harus login) | ❌ Tidak (admin tidak checkout) |
| Kelola produk | ❌ Tidak | ✅ Ya di `/admin/produk` |
| Kelola pesanan | ❌ Tidak | ✅ Ya (akan dibuat di Fitur C) |

---

## Next Steps

Setelah fitur login user ini, lanjut ke:
- **Fitur C**: Dashboard kelola pesanan (admin)
- **Fitur D**: Halaman kategori (publik)
- **Fitur E**: Layout & navigasi admin
- **Fitur F**: Polish & perbaikan kecil

---

## Catatan Penting

⚠️ **Jangan lupa jalankan SQL migration `fix-rls-policies.sql`** di Supabase jika belum, agar tidak ada infinite recursion error!

✅ **Dev server sudah restart** → semua fitur baru sudah bisa ditest sekarang!
