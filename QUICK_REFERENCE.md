# 🚀 QUICK REFERENCE - PINTU BESI SHOP

## ⚡ Start Development
```bash
npm run dev
# Open: http://localhost:3000
```

## 📦 Build for Production
```bash
npm run build  # Build website
npm start      # Run production server
```

## 🔐 Login Credentials

### Test User (Setelah Register)
```
Email: user@example.com (atau register baru)
Password: [password yang kamu set]
Role: visitor
Access: Dashboard user, checkout, order history
```

### Admin (Setelah Setup)
```
1. Register user baru via /auth/register
2. Copy user ID dari Supabase Dashboard > Authentication > Users
3. Run SQL di Supabase SQL Editor:
   UPDATE profiles SET role = 'admin' WHERE id = '[user-id]';
4. Login ulang → redirect otomatis ke /admin
```

## 🌐 Important URLs

### Public Pages
- Homepage: `/`
- Katalog: `/produk`
- Detail Produk: `/produk/[slug]`
- Kategori: `/kategori/[slug]`
- Cart: `/cart`

### Auth Pages
- Login: `/auth/login`
- Register: `/auth/register`
- OAuth Callback: `/auth/callback`

### User Dashboard (Login Required)
- Dashboard: `/dashboard`
- Riwayat Pesanan: `/dashboard/pesanan`
- Detail Pesanan: `/dashboard/pesanan/[id]`
- Edit Profil: `/dashboard/profil`

### Checkout Flow (Login Required)
- Checkout: `/checkout`
- Success: `/checkout/success?order_id=[id]`

### Admin Panel (Admin Only)
- Dashboard: `/admin`
- Login Admin: `/admin/login`
- Kelola Produk: `/admin/produk`
- Tambah Produk: `/admin/produk/baru`
- Edit Produk: `/admin/produk/[id]`
- Kelola Kategori: `/admin/kategori`
- Kelola Pesanan: `/admin/pesanan`
- Detail Pesanan: `/admin/pesanan/[id]`

## 🗄️ Database Setup (One Time)

### Step 1: Run SQL Script
```sql
-- Di Supabase SQL Editor, jalankan file:
-- supabase/FINAL_DATABASE_SETUP.sql

-- Script ini akan membuat:
-- ✅ Tables (profiles, categories, products, product_images, orders, order_items)
-- ✅ RLS Policies
-- ✅ Helper Functions
-- ✅ Triggers
-- ✅ Default Categories
```

### Step 2: Create Storage Bucket
```
1. Supabase Dashboard > Storage > Create Bucket
2. Bucket name: product-images
3. Set Public: YES
4. Policies:
   - SELECT: public
   - INSERT/UPDATE/DELETE: authenticated admin only
```

### Step 3: Create Admin User
```sql
-- 1. Register user via website
-- 2. Get user ID from Supabase Dashboard > Authentication
-- 3. Run SQL:
UPDATE profiles SET role = 'admin' WHERE id = '[paste-user-id-here]';
```

## 🔑 Environment Variables

File: `.env.local` (sudah ada, jangan commit ke Git!)
```env
NEXT_PUBLIC_SUPABASE_URL=https://btvycizmtxoouqanedwv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GGH4UinVz3WB2LHZuAtcQg_H1D9ywcj
NEXT_PUBLIC_WA_NUMBER=6281331941357
```

## 🧪 Quick Test Checklist

### Test as Guest
```
✅ Buka homepage → produk muncul dari DB
✅ Klik produk → detail lengkap
✅ Add to cart → masuk cart
✅ Klik checkout → redirect ke login
```

### Test as User
```
✅ Register → profile auto-created
✅ Login → redirect ke homepage
✅ Checkout → order berhasil
✅ Dashboard → lihat pesanan
✅ Coba akses /admin → redirect ke homepage (BLOCKED)
```

### Test as Admin
```
✅ Login as admin → redirect ke /admin
✅ Tambah produk + upload foto → berhasil
✅ Edit produk → update berhasil
✅ Update status pesanan → real-time update
✅ Lihat semua order → semua user visible
```

## 🛠️ Common Tasks

### Add New Product (Admin)
```
1. Login as admin
2. Go to /admin/produk/baru
3. Fill form + upload photos
4. Submit → product created
```

### Update Order Status (Admin)
```
1. Go to /admin/pesanan
2. Click "Detail & Kelola" on order
3. Change status dropdown
4. Auto-save → user sees update in dashboard
```

### Process Customer Order (Admin)
```
1. Customer checkout → order appears in /admin/pesanan
2. Admin opens detail → sees customer info
3. Click WhatsApp link → contact customer
4. Confirm order details → change status to "confirmed"
5. During fabrication → change to "processing"
6. Ready to ship → change to "shipped"
7. Customer received → change to "completed"
```

## 📊 Database Tables Quick Ref

### profiles
```
id, full_name, phone, address, role ('visitor' | 'admin')
```

### categories
```
id, name, slug
```

### products
```
id, name, slug, description, price, discount_price, 
discount_percentage, stock, category_id, size, material, 
is_active, created_at, updated_at
```

### product_images
```
id, product_id, image_url, is_primary, sort_order
```

### orders
```
id, user_id, customer_name, customer_phone, customer_address,
order_type, status, total_price, notes, created_at
```

### order_items
```
id, order_id, product_id, product_name, price, quantity, subtotal
```

## 🔒 Security Notes

### ✅ SAFE (Already Implemented)
- User can only see their own orders (`.eq('user_id', user.id)`)
- Prices always fetched from database (never trust client)
- Stock validated server-side before checkout
- Middleware protects `/admin/*` routes
- RLS policies prevent unauthorized data access

### ⚠️ MANUAL SETUP REQUIRED
- Create admin user manually (no self-promotion)
- Storage bucket permissions (set public for product-images)
- Google OAuth (optional, needs Google Cloud Console setup)

## 🐛 Troubleshooting

### Problem: Build Error
```bash
# Solution: Clear cache & rebuild
rm -rf .next
npm run build
```

### Problem: Can't Login to Admin
```bash
# Solution: Check user role in Supabase
# Dashboard > Authentication > Users > [user] > User Metadata
# OR run SQL:
SELECT * FROM profiles WHERE id = '[user-id]';
# Should show role = 'admin'
```

### Problem: Images Not Showing
```bash
# Solution: Check Storage bucket
# 1. Bucket name must be: product-images
# 2. Bucket must be PUBLIC
# 3. Check next.config.js has: hostname: '**.supabase.co'
```

### Problem: Checkout Fails
```bash
# Solution: Check RPC function exists
# Run in Supabase SQL Editor:
SELECT * FROM pg_proc WHERE proname = 'process_checkout';
# If empty, run: supabase/FINAL_DATABASE_SETUP.sql
```

### Problem: User Can't See Orders
```bash
# Solution: Check orders.user_id matches profiles.id
# Run SQL:
SELECT o.*, p.full_name 
FROM orders o 
JOIN profiles p ON o.user_id = p.id 
WHERE o.user_id = '[user-id]';
```

## 📞 Need Help?

### Read Documentation
- `LAPORAN_AUDIT_DAN_PERBAIKAN.md` - Full audit report
- `dokumen.md` - Feature documentation
- `PANDUAN_SETUP_CEPAT.md` - Quick setup guide

### Check Logs
```bash
# Development logs
npm run dev  # Check terminal for errors

# Supabase logs
# Dashboard > Logs > API / Auth / Database
```

### Common Error Messages

**"User must be authenticated"**
→ User belum login, redirect ke `/auth/login`

**"Tidak ada user, redirect ke /admin/login"**
→ Accessing admin route without login

**"Bukan admin, redirect ke /"**
→ User logged in but not admin role

**"Stok tidak cukup"**
→ Trying to order more than available stock

**"Produk tidak aktif"**
→ Trying to order inactive product

## 🚀 Deploy Checklist

Before deploying to production:
- ✅ Run `npm run build` → must succeed
- ✅ Database setup complete in Supabase
- ✅ Storage bucket created and public
- ✅ Admin user created
- ✅ Environment variables set in hosting platform
- ✅ (Optional) Google OAuth configured
- ✅ (Optional) Custom domain configured
- ✅ Test all features once deployed

## 📱 Mobile Test URLs

Test on mobile devices:
```
# Your local IP (check with ipconfig)
http://192.168.x.x:3000

# Or use ngrok for testing:
npx ngrok http 3000
```

---

**Quick Tips:**
- 💾 Save this file for quick reference!
- 🔄 Restart dev server after .env changes
- 🧹 Clear browser cache if styling issues
- 📸 Test image upload with files < 2MB
- 🔐 Never commit `.env.local` to Git
- ✅ Run `npm run build` before deploying

**Happy Coding! 🎉**
