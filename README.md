# Pintu Besi Shop

Pintu Besi Shop adalah aplikasi e-commerce modern dan profesional untuk penjualan pintu besi premium, pintu garasi lipat, pintu pagar otomatis, teralis, canopy, dan rolling door industrial. Website ini dikembangkan menggunakan Next.js (App Router), React, Tailwind CSS, dan Supabase (Database, Auth, RLS, & RPC Transactions).

---

## Fitur Utama

### 🛒 1. E-Commerce Core & Shopping Cart
* **Browsing Publik**: Pengunjung (guest) dapat menjelajahi beranda, melihat katalog lengkap, memfilter berdasarkan kategori, mengurutkan harga, mencari produk, dan melihat detail spesifikasi secara gratis tanpa harus masuk.
* **Keranjang Belanja**: Sistem cart berbasis React Context yang dapat menampung barang, menambah/mengurangi quantity, menghapus item, dan menghitung subtotal tagihan.
* **Checkout Profesional**: Form checkout aman yang secara otomatis memprefill data nama, telepon, dan alamat dari akun profil terdaftar. Mencegah submit ganda dan menampilkan status loading.
* **WhatsApp Quick Order**: Tombol alternatif untuk melakukan pemesanan instan lewat WhatsApp chat dengan format template otomatis.

### 👥 2. User & Admin Dashboards
* **Dashboard Pelanggan**:
  * Melihat profil terdaftar beserta email, HP, dan alamat default.
  * Mengedit profil dan alamat pengiriman default.
  * Tinjau riwayat transaksi beserta timeline pengerjaan pesanan (*Pending*, *Confirmed*, *Processing*, *Shipped*, *Completed*, *Cancelled*).
* **Dashboard Admin**:
  * Metrik ringkasan kinerja (Total Pendapatan, Jumlah Transaksi, Total Produk Aktif, Alert Produk Stok Menipis < 5).
  * Kelola Produk (CRUD): Tambah, ubah data, unggah foto, dan hapus. Untuk produk yang memiliki riwayat transaksi, fitur delete dinonaktifkan secara otomatis (digantikan toggle status `is_active` soft-delete) untuk menjaga integritas data.
  * Kelola Kategori (CRUD): Tambah, ubah, dan hapus kategori dengan slug URL-friendly otomatis.
  * Kelola Pesanan: Melihat daftar order masuk, mencari transaksi, memfilter status, dan mengubah status pengerjaan pesanan.

---

## Arsitektur Keamanan (Security final review)

* **Supabase Row Level Security (RLS)**: Semua tabel utama (`profiles`, `products`, `product_images`, `categories`, `orders`, `order_items`) diproteksi dengan kebijakan RLS yang ketat.
* **API Checkout Protection**: Operasi `INSERT` langsung ke tabel `orders` dan `order_items` diblokir untuk semua user publik dan non-admin. Pesanan hanya dapat dibuat melalui fungsi PostgreSQL RPC `process_checkout` yang bersifat `SECURITY DEFINER`.
* **Integritas Harga & Stok (Concurrency Check)**: Fungsi `process_checkout` mengambil data harga langsung dari database (Single Source of Truth) untuk menghindari manipulasi harga di sisi frontend. Fungsi ini juga menggunakan query `FOR UPDATE` untuk mengunci baris produk, memeriksa ketersediaan stok secara atomik, dan langsung mengurangi stok produk ketika order dibuat.
* **Admin Guard**: Halaman `/admin/*` diproteksi secara ketat menggunakan middleware Next.js (`middleware.js`) untuk memverifikasi token sesi Supabase dan memeriksa apakah role pengguna adalah `admin`.

---

## Persyaratan Lingkungan (Environment Variables)

Salin `.env.example` menjadi `.env.local` dan lengkapi variabel berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_WA_NUMBER=628123456789
```

---

## Struktur Proyek Utama

```text
├── app/
│   ├── admin/                # Dashboard Admin (Layout, Produk, Kategori, Pesanan)
│   ├── api/
│   │   ├── auth/             # API Router Auth login/logout
│   │   └── checkout/         # API Endpoint Proses Transaksi Checkout
│   ├── auth/                 # Halaman Login & Registrasi Pelanggan
│   ├── cart/                 # Halaman Keranjang Belanja Pelanggan
│   ├── checkout/             # Halaman Formulir Checkout & Success Page
│   ├── dashboard/            # Halaman Dashboard Pelanggan (Profil, Pesanan)
│   ├── kategori/             # Halaman Filter Produk per Kategori
│   ├── produk/               # Halaman Katalog Produk & Detail Produk
│   ├── layout.js             # Layout Utama (Plus Jakarta Sans Font & Provider)
│   ├── loading.js            # Loading Skeleton Transisi
│   └── not-found.js          # Halaman Kustom 404
├── components/
│   ├── CartContext.js        # React Context Provider Cart State
│   ├── Navbar.js             # Sticky Glassmorphism Header
│   └── ProductGallery.js     # Detail Galeri Gambar Produk
└── supabase/
    ├── schema.sql            # Skema Awal Tabel Supabase & RLS awal
    ├── migration_step1.sql   # Fungsi RPC process_checkout & RLS diperketat
    └── migration_step2.sql   # Alter Column original_price & profil address
```

---

## Panduan Instalasi & Migrasi Database

### 1. Kloning & Instalasi Dependensi
Jalankan di terminal lokal Anda:
```bash
npm install
```

### 2. Konfigurasi Database Supabase
Jalankan file SQL berikut secara berurutan di **Supabase SQL Editor**:
1. [`supabase/schema.sql`](file:///c:/sem%20antara/project%20web/pintu-besi-shop/supabase/schema.sql) — Membuat tabel awal & RLS awal.
2. [`supabase/migration_step1.sql`](file:///c:/sem%20antara/project%20web/pintu-besi-shop/supabase/migration_step1.sql) — Membuat helper `is_admin`, RPC `process_checkout`, dan RLS diperketat.
3. [`supabase/migration_step2.sql`](file:///c:/sem%20antara/project%20web/pintu-besi-shop/supabase/migration_step2.sql) — Menambahkan kolom diskon `original_price` dan alamat `address`.

### 3. Konfigurasi Admin Akun Pertama
Daftarkan akun pelanggan baru melalui website (`/auth/register`). Setelah itu, jalankan SQL query berikut di editor Supabase untuk menjadikannya admin:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'UUID_PENGGUNA_ANDA';
```

### 4. Menjalankan Server Lokal
Jalankan perintah berikut:
```bash
npm run dev
```
Akses website melalui browser di alamat [http://localhost:3000](http://localhost:3000).

### 5. Kompilasi & Build Produksi
Sebelum deploy, pastikan build produksi lolos verifikasi kompilasi Next.js:
```bash
npm run build
```

---

## Langkah Deployment (Production Readiness)

1. **GitHub**: Push seluruh kode proyek (pastikan `.env.local` tidak ikut di-commit melalui `.gitignore`).
2. **Supabase**: Pastikan skema migrasi database sudah berjalan lengkap dan RLS diaktifkan.
3. **Vercel**: Import proyek GitHub Anda di Vercel, lalu isi **Environment Variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_WA_NUMBER`) di pengaturan Vercel.
4. **Deploy**: Klik tombol deploy. Website siap diakses secara publik dan aman!
