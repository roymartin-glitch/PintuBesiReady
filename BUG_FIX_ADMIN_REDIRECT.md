# 🐛 PERBAIKAN BUG: Admin Redirect ke Homepage

## Masalah yang Terjadi
Setelah login sebagai admin, user langsung di-redirect ke homepage (/) alih-alih masuk ke `/admin/produk`.

## Penyebab Masalah

### 1. **Urutan `router.refresh()` dan `router.push()` yang Salah**
Di file `app/admin/login/page.js`, setelah login berhasil, kode melakukan:
```javascript
router.push('/admin/produk')  // ❌ Push dulu
router.refresh()              // ❌ Refresh kemudian
```

**Masalahnya:** `router.push()` langsung pindah halaman, tapi session belum ter-sync ke server components. Ketika middleware jalan, cookie Supabase belum sempat di-refresh, jadi middleware tidak bisa menemukan user/profile admin.

**Solusi:** Balik urutannya - `refresh()` dulu baru `push()`:
```javascript
router.refresh()              // ✅ Refresh dulu
setTimeout(() => {            // ✅ Tunggu sebentar
  router.push('/admin/produk') // ✅ Baru push
}, 100)
```

### 2. **Tidak Ada Debug Log di Middleware**
Sulit mengetahui di titik mana middleware gagal tanpa log. Sekarang sudah ditambahkan console.log untuk tracking:
- User email (atau "No user")
- Profile role
- Error dari database (jika ada)
- Decision (allow/redirect)

### 3. **Kemungkinan Banyak Dev Server Menumpuk**
Jika `npm run dev` dijalankan berkali-kali tanpa di-stop, bisa ada banyak proses Node.js di background yang bikin cookie/session tidak konsisten.

**Solusi:** Jalankan `kill-node.bat` sebelum testing untuk membersihkan semua proses Node.js.

---

## Cara Testing Setelah Perbaikan

### Langkah 1: Bersihkan Proses Node yang Menumpuk
```bash
# Di Windows, klik 2x file ini:
kill-node.bat
```

Atau manual via command:
```bash
taskkill /F /IM node.exe /T
```

### Langkah 2: Jalankan Dev Server Fresh
```bash
npm run dev
```

### Langkah 3: Test Login Admin
1. Buka browser (incognito/private mode lebih baik untuk testing fresh)
2. Buka http://localhost:3000/admin/login
3. Login dengan email admin yang sudah diset role='admin' di Supabase
4. Setelah klik "Masuk", perhatikan:
   - Loading state harus muncul
   - Setelah ±100ms, halaman redirect ke `/admin/produk`
   - **TIDAK** redirect ke homepage `/`

### Langkah 4: Cek Console Log
Buka browser console (F12 > Console), perhatikan log dari middleware:
```
✅ Login berhasil: admin@example.com
🔍 Middleware - Path: /admin/produk
👤 User: admin@example.com
👔 Profile role: admin
✅ Admin verified, allow access
```

Jika muncul log seperti ini, berarti **BERHASIL**! ✅

### Jika Masih Gagal:
Cek log yang muncul:
- Jika `👤 User: No user` → Session belum ter-set, coba clear cookies browser dan login ulang
- Jika `👔 Profile role: visitor` → User belum diset sebagai admin di database Supabase
- Jika `❌ Profile error: ...` → Ada masalah dengan RLS policy atau koneksi database

---

## Perubahan yang Dilakukan

### File yang Diubah:
1. **middleware.js** - Tambah console.log untuk debug
2. **app/admin/login/page.js** - Fix urutan refresh() dan push() + tambah delay
3. **kill-node.bat** (BARU) - Command untuk kill semua proses Node.js di Windows

---

## Catatan Penting

⚠️ **Sebelum Testing**, pastikan:
1. User admin sudah diset `role='admin'` di tabel `profiles` di Supabase
2. Cookie browser sudah di-clear (atau gunakan incognito mode)
3. Tidak ada proses `node.exe` lain yang berjalan di background
4. File `.env.local` berisi Supabase URL dan Anon Key yang benar

**Cara Set User Jadi Admin di Supabase:**
```sql
-- Jalankan di Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'UUID_USER_KAMU_DISINI';
```

Cari UUID user di Supabase Dashboard > Authentication > Users.

---

## Setelah Bug Fixed

Setelah bug ini teratasi dan Anda bisa akses `/admin/produk` dengan normal, kita akan lanjut ke fitur-fitur berikutnya:
- A. Halaman Edit Produk
- B. Dropdown Kategori di Form
- C. Dashboard Kelola Pesanan
- Dan seterusnya...

**Konfirmasikan ke saya jika sudah berhasil atau masih ada masalah!** 🚀
