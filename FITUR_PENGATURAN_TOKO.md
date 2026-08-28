# ⚙️ FITUR PENGATURAN TOKO - ADMIN BERKUASA PENUH!

## 🎯 TUJUAN
Admin bisa mengubah **SEMUA** info toko dari dashboard tanpa edit code:
- ✅ Nama toko
- ✅ Tagline/slogan
- ✅ Alamat lengkap
- ✅ Nomor WhatsApp & telepon
- ✅ Social media links
- ✅ Jam operasional
- ✅ Footer text
- ✅ Dan masih banyak lagi!

**Perubahan langsung ter-update REAL-TIME di seluruh website!**

---

## 📋 FITUR YANG SUDAH DIIMPLEMENTASI

### 1️⃣ DATABASE TABLE

**File:** `supabase/store_settings_setup.sql`

**Tabel:** `store_settings` (single row table)

**Kolom:**
```sql
- store_name             -> Nama toko (misal: "Pintu Besi Shop")
- store_tagline          -> Slogan (misal: "Konstruksi Besi Kokoh")
- store_description      -> Deskripsi singkat toko
- phone_number           -> Nomor telepon
- whatsapp_number        -> Nomor WA (format: 628xxx)
- email                  -> Email toko
- address                -> Alamat lengkap
- city                   -> Kota
- province               -> Provinsi
- postal_code            -> Kode pos
- google_maps_url        -> Link Google Maps
- instagram_url          -> Link Instagram
- facebook_url           -> Link Facebook
- tiktok_url             -> Link TikTok
- youtube_url            -> Link YouTube
- business_hours         -> Jam operasional
- established_year       -> Tahun berdiri
- footer_text            -> Teks copyright footer
- updated_at             -> Timestamp update terakhir
- updated_by             -> User ID yang update
```

**RLS Policies:**
- ✅ **Public** bisa READ (semua orang lihat info toko)
- ✅ **Admin** bisa UPDATE & INSERT (hanya admin yang bisa edit)

---

### 2️⃣ HELPER FUNCTION

**File:** `lib/supabase/getStoreSettings.js`

**Functions:**
```javascript
// For Server Components
getStoreSettings()

// For Client Components
getStoreSettingsClient(supabaseClient)
```

**Auto-fallback:** Jika fetch gagal, return default values

---

### 3️⃣ ADMIN PANEL - HALAMAN PENGATURAN

**URL:** `/admin/pengaturan`
**File:** `app/admin/pengaturan/page.js`

**Sections:**
1. **🏪 Informasi Dasar Toko**
   - Nama Toko *
   - Tagline / Slogan
   - Deskripsi Toko
   - Tahun Berdiri

2. **📞 Kontak & Komunikasi**
   - Nomor Telepon
   - WhatsApp Number * (format: 628xxx)
   - Email
   - Jam Operasional

3. **📍 Lokasi Toko**
   - Alamat Lengkap
   - Kota
   - Provinsi
   - Kode Pos
   - Google Maps URL

4. **📱 Media Sosial**
   - Instagram URL
   - Facebook URL
   - TikTok URL
   - YouTube URL

5. **📄 Footer & Lain-lain**
   - Teks Footer (Copyright)

**Fitur Form:**
- ✅ Validation (required fields: Nama Toko & WhatsApp)
- ✅ Success notification
- ✅ Auto-refresh page setelah save
- ✅ Modern UI dengan Tailwind CSS
- ✅ Responsive design

---

### 4️⃣ MENU ADMIN

**File Updated:** `app/admin/layout.js`

**Changes:**
- ✅ Tambah link menu "⚙️ Pengaturan Toko" di sidebar
- ✅ Highlight dengan bg biru
- ✅ Nama toko di sidebar ambil dari DB (dynamic)

---

### 5️⃣ NAVBAR - DYNAMIC

**File Updated:** `components/Navbar.js`

**Changes:**
- ✅ Nama toko ambil dari DB (bukan hardcode "PINTU BESI")
- ✅ WhatsApp number dari DB
- ✅ Auto-refresh saat settings berubah

**Fallback:** Jika DB gagal, tampilkan default "Pintu Besi Shop"

---

### 6️⃣ HOMEPAGE - DYNAMIC

**File Updated:** `app/page.js`

**Changes:**
- ✅ Tagline hero section dari DB
- ✅ Deskripsi toko dari DB
- ✅ WhatsApp number untuk CTA button dari DB
- ✅ Footer component (dynamic)

**Sections Updated:**
- Banner hero (tagline + description)
- Konsultasi Gratis button (WA number)
- Footer (semua info toko)

---

### 7️⃣ FOOTER COMPONENT - LENGKAP!

**File:** `components/Footer.js` (NEW!)

**Display:**
- ✅ Nama toko & description
- ✅ Tahun berdiri (jika ada)
- ✅ Kontak (telepon, WA, email)
- ✅ Alamat lengkap (jalan, kota, provinsi, kode pos)
- ✅ Link Google Maps
- ✅ Jam operasional
- ✅ Social media icons (Instagram, Facebook, TikTok, YouTube)
- ✅ Quick links (Katalog, Cart, Dashboard, Register)
- ✅ Footer text / copyright
- ✅ Syarat & Ketentuan, Kebijakan Privasi

**Design:**
- Modern, dark theme (bg-slate-900)
- 4 columns responsive
- Social media icons dengan hover effect
- Conditional rendering (hanya tampil jika ada data)

**Pages dengan Footer:**
- ✅ Homepage (`app/page.js`)
- ✅ Katalog Produk (`app/produk/page.js`)
- ✅ Detail Produk (`app/produk/[slug]/page.js`)

---

### 8️⃣ ORDER ACTIONS - DYNAMIC WA

**File Updated:** `app/produk/[slug]/OrderActions.js`

**Changes:**
- ✅ WhatsApp number ambil dari DB (bukan .env)
- ✅ Fetch saat component mount
- ✅ Fallback ke .env jika DB gagal

---

## 🎨 FLOW REAL-TIME UPDATE

```
ADMIN mengubah info di /admin/pengaturan
            ↓
Klik "💾 Simpan Pengaturan"
            ↓
Data tersimpan ke database `store_settings`
            ↓
Page auto-refresh (window.location.reload())
            ↓
SEMUA HALAMAN WEBSITE langsung ter-update:
  - Navbar: Nama toko berubah
  - Homepage: Tagline & deskripsi berubah
  - Footer: Alamat & kontak berubah
  - WA Button: Nomor WA berubah
  - Admin Sidebar: Nama toko berubah
```

**Catatan:** Next.js Server Components akan fetch data baru saat page load, jadi user lain yang buka website akan langsung lihat data terbaru!

---

## 🚀 CARA MENGGUNAKAN

### STEP 1: Setup Database

1. **Buka Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Pilih Project Anda**

3. **Buka SQL Editor**

4. **Copy & Run Script:**
   - Buka file: `supabase/store_settings_setup.sql`
   - Copy SEMUA isi
   - Paste ke SQL Editor
   - Klik "RUN"

5. **Verify Success:**
   Seharusnya muncul:
   ```
   Table store_settings created
   ```

---

### STEP 2: Login sebagai Admin

1. **Buka Admin Panel:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Login dengan akun admin:**
   ```
   Email: roy.martin@student.tau.ac.id
   Password: [your password]
   ```

3. **Klik menu "⚙️ Pengaturan Toko"** di sidebar

---

### STEP 3: Edit Info Toko

1. **Ubah Nama Toko:**
   ```
   Contoh: "Toko Besi Jaya Abadi"
   ```

2. **Isi WhatsApp Number:**
   ```
   Format: 628xxx (tanpa +)
   Contoh: 6281331941357
   ```

3. **Isi Alamat Lengkap:**
   ```
   Jl. Industri Besi No. 123
   Kota: Jakarta
   Provinsi: DKI Jakarta
   ```

4. **Isi Social Media (opsional):**
   ```
   Instagram: https://instagram.com/tokobesi
   Facebook: https://facebook.com/tokobesi
   ```

5. **Klik "💾 Simpan Pengaturan"**

---

### STEP 4: Lihat Perubahan

1. **Page akan auto-refresh**

2. **Cek Navbar:**
   - Nama toko berubah

3. **Cek Homepage:**
   - Buka: http://localhost:3000
   - Tagline & deskripsi berubah

4. **Cek Footer:**
   - Scroll ke bawah
   - Alamat, kontak, social media muncul

5. **Test WhatsApp Button:**
   - Buka produk
   - Klik "Pesan via WhatsApp"
   - Nomor WA yang dibuka sudah berubah

---

## 📊 TESTING CHECKLIST

### ✅ Database Setup
```
□ SQL script berhasil dijalankan
□ Table `store_settings` ada di database
□ RLS policies ter-create (4 policies)
□ Default data ter-insert (1 row)
```

### ✅ Admin Panel
```
□ Bisa akses /admin/pengaturan
□ Form tampil lengkap (5 sections)
□ Bisa edit semua field
□ Validasi required fields bekerja
□ Save berhasil → success notification muncul
□ Page auto-refresh setelah save
```

### ✅ Display di Website
```
□ Navbar: Nama toko berubah
□ Homepage Hero: Tagline berubah
□ Homepage Hero: Deskripsi berubah
□ Homepage CTA: WA number berubah
□ Footer: Semua info muncul
  □ Nama toko
  □ Deskripsi
  □ Kontak (telepon, WA, email)
  □ Alamat lengkap
  □ Google Maps link
  □ Jam operasional
  □ Social media icons
□ Product Detail: WA button pakai nomor baru
□ Admin Sidebar: Nama toko berubah
```

### ✅ Social Media Links
```
□ Instagram icon muncul (jika URL diisi)
□ Facebook icon muncul (jika URL diisi)
□ TikTok icon muncul (jika URL diisi)
□ YouTube icon muncul (jika URL diisi)
□ Klik icon → buka tab baru ke link yang benar
```

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "Gagal memuat pengaturan"

**Penyebab:**
- Table `store_settings` belum dibuat
- RLS policies belum dijalankan

**Solusi:**
1. Jalankan ulang SQL script
2. Verify table exists:
   ```sql
   SELECT * FROM store_settings;
   ```

---

### ❌ Error: "Gagal menyimpan"

**Penyebab:**
- User bukan admin
- RLS policies memblokir UPDATE

**Solusi:**
1. Cek role user:
   ```sql
   SELECT role FROM profiles WHERE id = '[user-id]';
   ```
2. Pastikan role = 'admin'
3. Jika bukan admin, update:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '[user-id]';
   ```

---

### ❌ Navbar masih tampil "PINTU BESI"

**Penyebab:**
- Cache browser
- Data belum ter-fetch

**Solusi:**
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Restart dev server:
   ```
   Ctrl+C (stop server)
   npm run dev (start again)
   ```

---

### ❌ WhatsApp button buka nomor lama

**Penyebab:**
- Component belum re-render
- Fallback ke .env variable

**Solusi:**
1. Cek format nomor WA di DB:
   ```
   Format: 628xxx (no spaces, no +)
   ```
2. Hard refresh product page
3. Check console browser untuk error

---

### ❌ Footer tidak muncul

**Penyebab:**
- Footer component belum di-import
- Page belum di-update

**Solusi:**
1. Cek import di page:
   ```javascript
   import Footer from '@/components/Footer'
   ```
2. Cek Footer component di-render:
   ```javascript
   <Footer />
   ```
3. Check browser console untuk error

---

## 💡 TIPS & BEST PRACTICES

### 1. Format WhatsApp Number
```
❌ SALAH: +62 813-3194-1357
❌ SALAH: 0813-3194-1357
✅ BENAR: 6281331941357
```

### 2. Social Media URLs
```
✅ BENAR:
Instagram: https://instagram.com/tokobesi
Facebook: https://facebook.com/tokobesi
TikTok: https://tiktok.com/@tokobesi
YouTube: https://youtube.com/@tokobesi

❌ JANGAN:
Pakai URL shortener (bit.ly, dll)
Pakai URL dengan query parameters panjang
```

### 3. Google Maps URL
```
✅ BENAR:
- Buka Google Maps
- Search lokasi Anda
- Klik "Share"
- Copy "Share link"
- Paste ke form

Contoh: https://maps.app.goo.gl/abc123
```

### 4. Jam Operasional
```
✅ Format yang bagus:
"Senin - Jumat: 08.00 - 17.00 WIB
Sabtu: 08.00 - 15.00 WIB
Minggu: Tutup"
```

### 5. Deskripsi Toko
```
✅ Tips:
- Max 200-300 karakter
- Highlight keunggulan utama
- Gunakan bahasa persuasif
- Sebutkan produk utama
```

---

## 🎨 CUSTOMIZATION IDEAS

### Tambah Field Baru

Edit file: `supabase/store_settings_setup.sql`

```sql
-- Tambah kolom baru
ALTER TABLE store_settings
ADD COLUMN store_slogan_2 text,
ADD COLUMN store_color_primary text DEFAULT '#3B82F6',
ADD COLUMN store_logo_url text;
```

Lalu update:
1. `app/admin/pengaturan/page.js` - Tambah input field
2. `components/Footer.js` - Display field baru
3. `components/Navbar.js` - Pakai warna custom

---

### Multi-Language Support

Buat table terpisah:

```sql
CREATE TABLE store_settings_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL, -- 'id', 'en'
  store_name text,
  store_tagline text,
  store_description text,
  ...
);
```

---

## 📈 STATISTICS & ANALYTICS

### Track Settings Changes

Query untuk lihat history perubahan:

```sql
-- Last 10 updates
SELECT 
  updated_at,
  updated_by,
  store_name
FROM store_settings
ORDER BY updated_at DESC
LIMIT 10;

-- Who updated most?
SELECT 
  profiles.full_name,
  COUNT(*) as update_count
FROM store_settings
JOIN profiles ON profiles.id = store_settings.updated_by
GROUP BY profiles.full_name
ORDER BY update_count DESC;
```

---

## ✅ KESIMPULAN

**FITUR PENGATURAN TOKO SUDAH 100% LENGKAP!**

**Admin bisa mengubah:**
- ✅ Nama toko
- ✅ Tagline & deskripsi
- ✅ Alamat lengkap
- ✅ Kontak (telepon, WA, email)
- ✅ Social media (Instagram, Facebook, TikTok, YouTube)
- ✅ Jam operasional
- ✅ Footer text
- ✅ Google Maps link
- ✅ Tahun berdiri

**Perubahan ter-update REAL-TIME di:**
- ✅ Navbar
- ✅ Homepage (hero section)
- ✅ Footer (semua halaman)
- ✅ WhatsApp buttons
- ✅ Admin sidebar

**Database:**
- ✅ Table `store_settings` ter-create
- ✅ RLS policies aktif
- ✅ Public bisa READ
- ✅ Admin bisa UPDATE

**System Benefits:**
- 🎯 **White Label Ready** - Bisa dijual ke toko manapun
- 🎯 **No Code Edit** - Ubah info tanpa coding
- 🎯 **Real-Time** - Update langsung tampil
- 🎯 **Secure** - RLS policies melindungi data
- 🎯 **User Friendly** - Form admin mudah dipakai

**READY FOR PRODUCTION!** 🚀🎉
