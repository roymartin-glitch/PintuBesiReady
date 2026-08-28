# 🚀 PANDUAN SETUP CEPAT - PINTU BESI SHOP

## ⚡ Quick Start (5 Menit)

### 1️⃣ Setup Database Supabase

**A. Buka Supabase SQL Editor:**
- Login ke https://supabase.com
- Pilih project Anda
- Klik "SQL Editor" di sidebar kiri

**B. Run Database Setup:**
- Buka file: `supabase/FINAL_DATABASE_SETUP.sql`
- Copy semua isinya
- Paste ke SQL Editor
- Klik **"Run"** atau tekan `Ctrl+Enter`
- ✅ Tunggu sampai selesai (sekitar 5-10 detik)

### 2️⃣ Setup Storage untuk Foto Produk

**A. Buat Bucket:**
- Klik "Storage" di sidebar Supabase
- Klik tombol **"New bucket"**
- Name: `product-images`
- ✅ Centang **"Public bucket"**
- Klik **"Create bucket"**

**B. Set Policies (Optional - untuk keamanan extra):**
```sql
-- Allow public read
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow admin to delete
CREATE POLICY "Admin can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
```

### 3️⃣ Buat User Admin Pertama

**A. Register user baru:**
- Jalankan website: `npm run dev`
- Buka http://localhost:3000/auth/register
- Daftar dengan email & password Anda
- Login setelah register

**B. Upgrade ke Admin:**
- Kembali ke Supabase SQL Editor
- Jalankan query ini (ganti email dengan email Anda):

```sql
-- Lihat user yang baru dibuat
SELECT id, email FROM auth.users;

-- Upgrade jadi admin (ganti USER_ID dengan id dari query di atas)
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_ANDA';

-- Atau langsung berdasarkan email:
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'email@anda.com');
```

**C. Logout & Login Lagi:**
- Logout dari website
- Login lagi dengan user yang sama
- Sekarang Anda bisa akses `/admin` ✅

### 4️⃣ Test Project

**A. Test sebagai Admin:**
```
1. Login sebagai admin
2. Buka: http://localhost:3000/admin/produk/baru
3. Tambah produk baru:
   - Nama: Pintu Pagar Besi Minimalis
   - Slug: pintu-pagar-minimalis (auto-generate)
   - Harga: 2500000
   - Stok: 10
   - Kategori: Pintu Pagar
   - Size: 200x100 cm
   - Material: Besi Hollow 4x4
   - Upload 2-3 foto
4. Klik "Simpan Produk"
5. Buka homepage: http://localhost:3000
6. ✅ Produk baru muncul di homepage!
```

**B. Test sebagai Customer:**
```
1. Logout dari admin
2. Buka homepage (tanpa login)
3. Klik produk yang baru dibuat
4. Klik "Tambah ke Keranjang"
5. Klik icon cart di navbar
6. Klik "Lanjutkan ke Checkout"
7. Register/Login sebagai user biasa (bukan admin)
8. Isi form checkout
9. Submit order
10. ✅ Order berhasil dibuat!
11. Buka /dashboard/pesanan
12. ✅ Order muncul dengan status "Menunggu Konfirmasi"
```

**C. Test Update Order (Admin):**
```
1. Login kembali sebagai admin
2. Buka /admin/pesanan
3. ✅ Lihat order yang baru masuk
4. Klik "Detail & Kelola"
5. Ubah status dari dropdown (Pending → Confirmed)
6. ✅ Status berubah!
7. Logout admin, login sebagai customer
8. Buka /dashboard/pesanan
9. ✅ Status sudah berubah di dashboard customer!
```

---

## 🔧 Environment Variables

Pastikan file `.env.local` sudah terisi:

```env
# Supabase Config (WAJIB)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# WhatsApp Number untuk Order (WAJIB)
NEXT_PUBLIC_WA_NUMBER=6281234567890
```

**Cara dapat Supabase Keys:**
1. Buka project Supabase
2. Klik "Settings" (icon gear) di sidebar
3. Klik "API"
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📱 Fitur WhatsApp Order

User bisa order langsung via WhatsApp tanpa checkout. Format pesan otomatis sudah disiapkan dengan:
- Nama produk
- Jumlah
- Harga
- Total
- Spesifikasi (size, material)

---

## 🎨 Customize Design (Optional)

### Ubah Warna Brand:
Edit file `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Biru default, ganti sesuai brand Anda
        secondary: '#64748b',
        // tambah warna lain
      }
    }
  }
}
```

### Ubah Logo/Brand Name:
Edit `components/Navbar.js`, cari:
```jsx
<span className="text-2xl font-black">
  PINTU<span className="text-blue-600">BESI</span>
</span>
```

Ganti dengan nama brand Anda.

---

## 🆘 Troubleshooting

### ❌ Error: "relation 'products' does not exist"
**Solusi:** Database belum di-setup. Jalankan `FINAL_DATABASE_SETUP.sql` di Supabase SQL Editor.

### ❌ Error: "Failed to upload image"
**Solusi:** 
1. Pastikan bucket `product-images` sudah dibuat
2. Pastikan bucket di-set sebagai **Public**
3. Cek storage policies (lihat step 2B di atas)

### ❌ Admin tidak bisa akses `/admin`
**Solusi:**
1. Cek role di database: `SELECT * FROM profiles WHERE id = 'USER_ID';`
2. Pastikan `role = 'admin'`
3. Logout dan login lagi untuk refresh session

### ❌ Produk tidak muncul di homepage
**Solusi:**
1. Pastikan produk `is_active = true`
2. Pastikan ada foto (minimal 1)
3. Refresh browser dengan `Ctrl+F5`

### ❌ Checkout error: "User must be authenticated"
**Solusi:**
1. User harus login dulu sebelum checkout
2. Pastikan session masih valid (coba logout & login lagi)

### ❌ Build error: "Module not found"
**Solusi:**
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 File Penting

| File | Deskripsi |
|------|-----------|
| `supabase/FINAL_DATABASE_SETUP.sql` | Setup database lengkap (run sekali) |
| `LAPORAN_PROJECT_FINAL.md` | Dokumentasi lengkap project |
| `.env.local` | Environment variables (JANGAN di-commit ke Git!) |
| `middleware.js` | Proteksi route admin |
| `app/api/checkout/route.js` | Checkout API endpoint |
| `components/CartContext.js` | Cart state management |

---

## 🚀 Deploy ke Production

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Jangan lupa tambahkan environment variables di Vercel dashboard!

### Option 2: Manual VPS
```bash
# Build production
npm run build

# Start production server
npm start
```

---

## ✅ Checklist Sebelum Go Live

- [ ] Database setup complete
- [ ] Storage bucket created
- [ ] Admin user created & tested
- [ ] Add minimal 5-10 produk dengan foto
- [ ] Test checkout flow end-to-end
- [ ] Test order management di admin
- [ ] Environment variables sudah benar
- [ ] Custom domain setup (optional)
- [ ] WhatsApp number sudah benar
- [ ] Backup database (export SQL)

---

## 📞 Support

Jika ada masalah:
1. Cek `LAPORAN_PROJECT_FINAL.md` untuk dokumentasi lengkap
2. Cek section Troubleshooting di atas
3. Verifikasi environment variables
4. Cek console browser untuk error messages

---

**Happy Selling! 🎉**
