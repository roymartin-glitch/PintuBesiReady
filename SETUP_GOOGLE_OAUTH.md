# 🔐 SETUP GOOGLE OAUTH - PINTU BESI SHOP

## 📋 Prerequisites

Sebelum mulai, pastikan Anda punya:
- Akun Google Cloud Console
- Project Supabase aktif
- Akses ke Supabase Dashboard

---

## 🚀 STEP 1: Setup Google Cloud Console

### A. Buat Project di Google Cloud Console

1. Buka https://console.cloud.google.com/
2. Klik dropdown project di navbar atas
3. Klik **"New Project"**
4. Nama project: **Pintu Besi Shop** (atau sesuai keinginan)
5. Klik **"Create"**

### B. Enable Google+ API

1. Di sidebar kiri, klik **"APIs & Services"** → **"Library"**
2. Search: **"Google+ API"**
3. Klik pada **"Google+ API"**
4. Klik tombol **"ENABLE"**

### C. Configure OAuth Consent Screen

1. Di sidebar, klik **"OAuth consent screen"**
2. User Type: Pilih **"External"** → Klik **"CREATE"**
3. Isi form:
   - **App name**: `Pintu Besi Shop`
   - **User support email**: Email Anda
   - **App logo**: (Optional) Upload logo toko
   - **Authorized domains**: (Untuk production nanti)
     - Contoh: `pintubesi.com`
   - **Developer contact email**: Email Anda
4. Klik **"SAVE AND CONTINUE"**
5. **Scopes**: Klik **"SAVE AND CONTINUE"** (pakai default)
6. **Test users**: (Optional) Tambahkan email untuk testing
7. Klik **"SAVE AND CONTINUE"** → **"BACK TO DASHBOARD"**

### D. Buat OAuth 2.0 Credentials

1. Di sidebar, klik **"Credentials"**
2. Klik **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Pintu Besi Shop Web Client`
5. **Authorized JavaScript origins**:
   - Tambahkan: `http://localhost:3000` (untuk development)
   - Tambahkan: `https://your-project.supabase.co` (ganti dengan URL Supabase project Anda)
   - Untuk production nanti: `https://yourdomain.com`
6. **Authorized redirect URIs**:
   - Tambahkan: `http://localhost:3000/auth/callback`
   - Tambahkan: `https://your-project.supabase.co/auth/v1/callback` (PENTING!)
   - Untuk production nanti: `https://yourdomain.com/auth/callback`
7. Klik **"CREATE"**

### E. Copy Credentials

Setelah credentials dibuat, Anda akan melihat popup dengan:
- **Client ID**: `123456789-abc123def456.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123def456xyz789`

**⚠️ SIMPAN KEDUA VALUE INI!** Akan digunakan di step berikutnya.

---

## 🔧 STEP 2: Setup Supabase OAuth Provider

### A. Buka Supabase Dashboard

1. Login ke https://supabase.com
2. Pilih project **Pintu Besi Shop**
3. Di sidebar kiri, klik **"Authentication"**
4. Klik tab **"Providers"**

### B. Enable Google Provider

1. Scroll ke bawah, cari **"Google"**
2. Klik toggle untuk **Enable** Google provider
3. Isi form dengan credentials dari Google Cloud Console:

```
Google enabled: ✅ ON

Client ID (for OAuth):
[Paste Client ID dari Google Cloud Console]

Client Secret (for OAuth):
[Paste Client Secret dari Google Cloud Console]
```

4. **Redirect URL** sudah otomatis terisi:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   **Copy URL ini!** Pastikan sudah ditambahkan ke Google Cloud Console (lihat Step 1D.6)

5. Klik **"Save"**

---

## 💾 STEP 3: Update Database

### A. Run SQL Migration

1. Buka **Supabase SQL Editor**
2. Copy-paste isi file `supabase/google-oauth-support.sql`
3. Klik **"Run"** atau tekan `Ctrl+Enter`

SQL ini akan:
- Update trigger `handle_new_user()` untuk support Google OAuth
- Otomatis create profile saat user login via Google
- Set role default = `visitor` (bukan admin)

---

## ✅ STEP 4: Test Google OAuth

### A. Jalankan Development Server

```bash
npm run dev
```

Buka: http://localhost:3000

### B. Test Login dengan Google (User Baru)

1. Klik **"Masuk"** atau buka `/auth/login`
2. Klik tombol **"Continue with Google"**
3. Pilih akun Google Anda
4. Google akan redirect ke consent screen (jika pertama kali)
5. Klik **"Allow"** atau **"Continue"**
6. ✅ Anda akan di-redirect ke homepage (atau halaman tujuan)
7. ✅ Cek navbar, nama Anda sudah muncul di profile dropdown

### C. Verifikasi Profile di Database

1. Buka **Supabase Table Editor**
2. Pilih tabel **"profiles"**
3. ✅ Lihat profile baru dengan:
   - `full_name` dari Google
   - `role = 'visitor'`
   - `phone` kosong (bisa diupdate nanti)

### D. Test Logout & Login Lagi (User Existing)

1. Logout dari website
2. Login lagi dengan Google
3. ✅ Langsung masuk (tidak perlu consent lagi)
4. ✅ Profile tidak duplikat

### E. Test Access Control

1. Login dengan Google
2. Coba akses `/admin`
3. ✅ Harus di-redirect ke homepage (karena role = visitor, bukan admin)

---

## 🔒 Security Checklist

- [x] Google OAuth hanya create profile dengan role = `visitor`
- [x] Admin tidak bisa dibuat via Google OAuth
- [x] Trigger database handle duplikasi (ON CONFLICT DO NOTHING)
- [x] Callback route validate session
- [x] Middleware tetap cek role untuk admin routes
- [x] Tidak ada password Google tersimpan di database

---

## 🌍 Production Setup (Nanti)

Ketika deploy ke production:

### 1. Update Google Cloud Console

**Authorized JavaScript origins:**
- Tambahkan: `https://yourdomain.com`

**Authorized redirect URIs:**
- Tambahkan: `https://yourdomain.com/auth/callback`
- Tambahkan: `https://your-project.supabase.co/auth/v1/callback`

### 2. Update OAuth Consent Screen

- **Authorized domains**: Tambahkan domain production Anda
- **Publishing status**: Ubah dari "Testing" ke "In production" (jika sudah siap)

### 3. Environment Variables

Pastikan `.env.local` atau environment variables production sudah benar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WA_NUMBER=6281234567890
```

---

## 🆘 Troubleshooting

### ❌ Error: "redirect_uri_mismatch"

**Penyebab:** Redirect URI tidak cocok dengan yang didaftarkan di Google Cloud Console

**Solusi:**
1. Cek URL callback di Google Cloud Console
2. Pastikan format exact: `http://localhost:3000/auth/callback` (tanpa trailing slash)
3. Pastikan juga ada: `https://your-project.supabase.co/auth/v1/callback`

### ❌ Error: "Error 400: invalid_request"

**Penyebab:** Client ID atau Client Secret salah

**Solusi:**
1. Cek kembali credentials di Google Cloud Console
2. Copy-paste ulang ke Supabase Auth Provider settings
3. Jangan ada spasi atau karakter hidden

### ❌ User login tapi profile tidak dibuat

**Penyebab:** Trigger `handle_new_user()` belum di-update

**Solusi:**
1. Jalankan `supabase/google-oauth-support.sql`
2. Cek apakah trigger aktif:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

### ❌ Callback redirect ke 404

**Penyebab:** Route `/auth/callback/route.js` tidak ada atau error

**Solusi:**
1. Pastikan file ada di: `app/auth/callback/route.js`
2. Restart development server: `npm run dev`
3. Cek console browser untuk error

### ❌ Google OAuth bekerja tapi email/password tidak

**Penyebab:** Tidak ada konflik, kedua method harus jalan bersamaan

**Solusi:**
- Pastikan email confirmation disabled di Supabase:
  - **Authentication** → **Settings** → **Email Auth**
  - `Confirm email` = **OFF** (untuk development)

---

## 📱 User Experience Flow

### New User (Belum Pernah Daftar)

```
1. User klik "Continue with Google"
2. → Redirect ke Google login
3. → Google authentication
4. → User pilih akun Google
5. → Google consent screen (jika pertama kali)
6. → Redirect ke /auth/callback
7. → Callback create profile baru (role = visitor)
8. → Redirect ke halaman tujuan (homepage/checkout)
9. ✅ User sudah login & bisa langsung belanja
```

### Existing User (Sudah Pernah Daftar)

```
1. User klik "Continue with Google"
2. → Redirect ke Google login
3. → Google authentication
4. → User pilih akun Google
5. → Redirect ke /auth/callback
6. → Callback cek profile sudah ada
7. → Redirect ke halaman tujuan
8. ✅ User langsung login
```

---

## 📝 Testing Checklist

Sebelum go live, test semua scenario:

- [ ] Login dengan email/password (existing feature)
- [ ] Register dengan email/password (existing feature)
- [ ] Login dengan Google (user baru)
- [ ] Login dengan Google (user existing)
- [ ] Logout & login lagi dengan Google
- [ ] Access dashboard setelah Google login
- [ ] Add to cart & checkout setelah Google login
- [ ] Verifikasi role = `visitor` di database
- [ ] Coba akses `/admin` dengan Google user (harus ditolak)
- [ ] Admin tetap login dengan email/password (tidak boleh via Google)

---

## ✅ Hasil Akhir

Setelah setup selesai:

✅ User bisa pilih: **Email/Password** atau **Google OAuth**  
✅ Google user otomatis dibuatkan profile  
✅ Role default = `visitor` (secure)  
✅ Session management pakai Supabase Auth  
✅ Middleware tetap protect admin routes  
✅ Logout universal (Google + email/password)  
✅ Redirect ke tujuan awal setelah login  

---

**Setup by Kiro AI Assistant**  
**Date: 22 Agustus 2026**
