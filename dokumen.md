# PROMPT UNTUK AI CODING ASSISTANT (Kiro / Claude Code / dll)

Paste seluruh isi ini ke chat AI assistant Anda di dalam project folder `pintu-besi-shop`.

---

## KONTEKS PROJECT

Saya punya project Next.js 14 (App Router) untuk website e-commerce "Toko Pintu Besi" yang sudah berjalan dengan stack berikut:

- **Framework**: Next.js 14 (App Router, JavaScript bukan TypeScript)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **Deploy target**: Vercel (free tier)
- **2 Role user**: `visitor` (pengunjung biasa) dan `admin` (pemilik toko, akses penuh kelola produk)

### Struktur project saat ini:
```
pintu-besi-shop/
├── app/
│   ├── page.js                          # Katalog produk publik (homepage)
│   ├── layout.js
│   ├── globals.css
│   ├── produk/[slug]/
│   │   ├── page.js                      # Detail produk
│   │   └── OrderActions.js              # 2 opsi order: WA cepat & checkout form
│   ├── api/checkout/route.js            # API proses checkout
│   └── admin/
│       ├── login/page.js                # Login admin
│       └── produk/
│           ├── page.js                  # List produk (admin)
│           ├── DeleteProductButton.js
│           └── baru/page.js             # Tambah produk baru
├── lib/supabase/
│   ├── client.js                        # Supabase client (browser)
│   └── server.js                        # Supabase client (server)
├── middleware.js                        # Proteksi route /admin (cek role=admin)
└── supabase/schema.sql                  # Skema database lengkap + RLS policies
```

### Skema database (sudah dijalankan di Supabase):
- `profiles` (id, full_name, phone, role: visitor/admin)
- `categories` (id, name, slug)
- `products` (id, name, slug, description, price, stock, category_id, size, material, is_active)
- `product_images` (id, product_id, image_url, is_primary, sort_order)
- `orders` (id, user_id, customer_name, customer_phone, customer_address, order_type, status, total_price, notes)
- `order_items` (id, order_id, product_id, product_name, price, quantity, subtotal)

Row Level Security (RLS) sudah aktif: publik hanya bisa baca produk `is_active=true`, hanya admin yang bisa insert/update/delete produk & kategori, user hanya bisa lihat order miliknya sendiri (admin bisa lihat semua).

Environment variables yang sudah ada di `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_WA_NUMBER=...
```

---

## TUGAS: Lengkapi fitur-fitur berikut sampai TUNTAS dan siap deploy ke Vercel

Kerjakan satu per satu secara berurutan, test tiap fitur sebelum lanjut ke berikutnya. Ikuti pola/style coding yang sudah ada di project (function component, Tailwind utility classes, bahasa Indonesia untuk UI text).

### 1. Upload Foto Produk (Supabase Storage)
- Buat Storage bucket bernama `product-images` di Supabase (public bucket), sertakan instruksi SQL/dashboard untuk itu jika perlu policy tambahan
- Di halaman `/admin/produk/baru`, tambahkan input file upload gambar (bisa multi foto)
- Setelah produk berhasil disimpan, upload foto ke Supabase Storage, simpan URL hasil upload ke tabel `product_images`
- Foto pertama otomatis jadi `is_primary = true`
- Tampilkan preview foto sebelum upload (pakai `URL.createObjectURL`)
- Validasi: max ukuran file 2MB per foto, hanya format jpg/png/webp

### 2. Halaman Edit Produk
- Buat `/admin/produk/[id]/page.js`
- Form serupa dengan halaman tambah produk, tapi ter-prefill data existing (fetch by id)
- Bisa update semua field termasuk ganti/tambah foto
- Bisa hapus foto individual dari produk
- Tombol "Edit" di halaman `/admin/produk` (list) sudah mengarah ke route ini, tinggal dibuatkan halamannya
- Setelah simpan, redirect ke `/admin/produk` dengan pesan sukses

### 3. Dashboard Order untuk Admin
- Buat `/admin/pesanan/page.js`
- Tampilkan semua order (tabel `orders`) join dengan `order_items`, urutkan dari terbaru
- Tampilkan: nama customer, no HP, alamat, total harga, status, tanggal order, daftar item yang dipesan
- Admin bisa update status order lewat dropdown (pending → confirmed → processing → shipped → completed, atau cancelled)
- Filter berdasarkan status (tab atau dropdown filter)
- Tambahkan link ke halaman ini di navigasi admin

### 4. Halaman Kategori
- Buat `/app/kategori/[slug]/page.js`
- Tampilkan produk yang difilter berdasarkan `category_id` sesuai slug kategori
- Reuse komponen card produk yang sama seperti di homepage (extract jadi component `ProductCard.js` di `/components` supaya tidak duplikasi kode)
- Update link kategori di homepage supaya mengarah ke halaman ini (sudah ada linknya di `app/page.js`, tinggal pastikan halaman targetnya ada)

### 5. Navigasi & Layout Admin
- Buat layout khusus admin (`/app/admin/layout.js`) dengan sidebar/navbar berisi link: Dashboard, Kelola Produk, Kelola Pesanan, Logout
- Tombol logout memanggil `supabase.auth.signOut()` lalu redirect ke `/admin/login`
- Tampilkan nama/email admin yang sedang login

### 6. Perbaikan & Polish Kecil
- Tambahkan input `category_id` (dropdown pilih kategori) di form tambah & edit produk — saat ini field ini belum ada di form padahal sudah ada di database
- Tambahkan halaman 404 custom yang sesuai tema (`app/not-found.js`)
- Tambahkan loading state (skeleton atau spinner) saat fetch data di halaman katalog & detail produk
- Tambahkan komponen `Header.js` sederhana (logo/nama toko + link ke semua kategori) yang dipakai di homepage & halaman produk
- Pastikan responsive di mobile (cek semua halaman di viewport kecil)

### 7. Persiapan Deploy ke Vercel
- Cek `next.config.js` sudah benar untuk image domain Supabase Storage
- Buat file `.gitignore` yang benar (pastikan `.env.local`, `node_modules` diabaikan)
- Tuliskan ringkasan environment variables apa saja yang perlu diisi manual di Vercel Dashboard > Settings > Environment Variables setelah project di-import dari GitHub

---

## ATURAN PENGERJAAN

1. Kerjakan bertahap, satu fitur selesai dan bisa saya test dulu sebelum lanjut ke fitur berikutnya — jangan generate semua sekaligus tanpa penjelasan.
2. Jelaskan singkat apa yang diubah/ditambah di tiap fitur.
3. Gunakan bahasa Indonesia untuk semua teks yang tampil ke user (label tombol, pesan error, dll).
4. Jangan ubah struktur database (`schema.sql`) kecuali benar-benar diperlukan — kalau perlu tambahan kolom/tabel, beritahu saya dulu SQL migration-nya secara terpisah.
5. Pastikan tidak ada fitur yang bentrok dengan Row Level Security yang sudah diatur di Supabase.

Mulai dari fitur nomor 1 (Upload Foto Produk) dulu.