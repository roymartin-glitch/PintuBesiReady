# 🔐 TABEL AKSES: User Biasa vs Admin

## Perbandingan Akses

| Halaman/Fitur | URL | User Biasa (Visitor) | Admin |
|---------------|-----|---------------------|-------|
| **HOMEPAGE** | `/` | ✅ Bisa akses | ✅ Bisa akses |
| **Lihat semua produk** | `/` | ✅ Tanpa login | ✅ Tanpa login |
| **Detail produk** | `/produk/[slug]` | ✅ Tanpa login | ✅ Tanpa login |
| **Pesan via WhatsApp** | (di detail produk) | ✅ Tanpa login | ✅ Tanpa login |
| **Checkout** | (di detail produk) | ✅ Harus login dulu | ❌ Admin tidak checkout |
| **Lihat kategori** | `/kategori/[slug]` | ✅ Tanpa login | ✅ Tanpa login |
| | | | |
| **AUTENTIKASI USER** | | | |
| Login user | `/auth/login` | ✅ Ya | ❌ Tidak perlu |
| Register user | `/auth/register` | ✅ Ya | ❌ Tidak ada |
| Dashboard/Profil user | `/dashboard` | ✅ Harus login | ❌ Tidak |
| Lihat pesanan sendiri | `/dashboard/pesanan` | ✅ Harus login | ❌ Tidak |
| | | | |
| **ADMIN AREA** | | | |
| Login admin | `/admin/login` | ❌ Tidak | ✅ Ya |
| Kelola produk | `/admin/produk` | ❌ Redirect ke `/` | ✅ Ya |
| Tambah produk | `/admin/produk/baru` | ❌ Tidak | ✅ Ya |
| Edit produk | `/admin/produk/[id]` | ❌ Tidak | ✅ Ya |
| Hapus produk | (tombol di list) | ❌ Tidak | ✅ Ya |
| Kelola pesanan | `/admin/pesanan` | ❌ Tidak | ✅ Ya (akan dibuat) |

---

## 🎯 Flow User Biasa (Visitor)

### 1. Tanpa Login (Guest)
```
Homepage → Lihat produk → Detail produk → Pesan via WA ✅
```

### 2. Dengan Login
```
Register (/auth/register)
  ↓
Login (/auth/login)
  ↓
Homepage (muncul "Halo, [nama]")
  ↓
Detail produk → Checkout (form muncul, data ter-prefill)
  ↓
Pesanan tersimpan di database
  ↓
Lihat pesanan di Dashboard (/dashboard/pesanan)
```

---

## 🎯 Flow Admin

```
Homepage → Klik "Admin"
  ↓
Login Admin (/admin/login)
  ↓
Dashboard Admin (/admin/produk)
  ↓
Kelola produk: Tambah | Edit | Hapus
  ↓
Kelola pesanan: Lihat semua order, update status
```

---

## 🚫 Apa yang TIDAK Bisa Diakses User Biasa

1. ❌ `/admin/*` → Semua route admin akan redirect ke `/`
2. ❌ Kelola produk → Hanya admin
3. ❌ Lihat semua pesanan → User hanya bisa lihat pesanan sendiri
4. ❌ Update status pesanan → Hanya admin

---

## ✅ Apa yang TIDAK Bisa Diakses Admin

1. ❌ Checkout produk → Admin tidak perlu checkout (admin adalah pemilik toko)
2. ❌ Dashboard user → Admin punya dashboard sendiri

---

## 🔧 Cara Testing

### Test sebagai User Biasa:
1. Buka **incognito/private mode**
2. Buka http://localhost:3000
3. Klik **"Daftar"** → Isi form → Daftar
4. Login dengan kredensial baru
5. Coba akses produk → Checkout (form muncul)
6. Coba akses `/admin/produk` → **Harus** redirect ke `/`

### Test sebagai Admin:
1. **Logout** dari user biasa
2. Klik **"Admin"** di homepage
3. Login dengan email admin
4. Masuk ke `/admin/produk` → **Berhasil**
5. Kelola produk: Tambah, Edit, Hapus
6. Coba akses homepage → Tetap bisa, tapi tidak bisa checkout

---

## 🆕 Fitur yang Akan Dibuat untuk User Biasa

1. **Dashboard User** (`/dashboard`)
   - Tampilkan profil user
   - Link ke lihat pesanan
   - Link edit profil
   - Tombol logout

2. **Halaman Pesanan User** (`/dashboard/pesanan`)
   - Lihat semua pesanan yang dibuat user
   - Filter berdasarkan status
   - Detail per pesanan

Mau saya buatkan fitur dashboard user sekarang?
