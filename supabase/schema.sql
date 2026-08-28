-- ============================================
-- SKEMA DATABASE: Toko Pintu Besi
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Extension untuk UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. TABEL PROFILES (extend auth.users bawaan Supabase)
-- ============================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  role text not null default 'visitor' check (role in ('visitor', 'admin')),
  created_at timestamptz default now()
);

-- Trigger: otomatis buat profile saat user baru daftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'visitor');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 2. TABEL KATEGORI
-- ============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

insert into categories (name, slug) values
  ('Pintu Pagar', 'pintu-pagar'),
  ('Pintu Garasi', 'pintu-garasi'),
  ('Pintu Rumah', 'pintu-rumah'),
  ('Pintu Gudang / Rolling Door', 'rolling-door');

-- ============================================
-- 3. TABEL PRODUK
-- ============================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null,
  stock integer default 0,
  category_id uuid references categories(id) on delete set null,
  size text,          -- misal "200x100 cm"
  material text,       -- misal "Besi Hollow 4x4"
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 4. TABEL FOTO PRODUK (bisa multi foto per produk)
-- ============================================
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  sort_order integer default 0
);

-- ============================================
-- 5. TABEL ORDERS (untuk checkout, bukan cuma WA)
-- ============================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  order_type text not null default 'checkout' check (order_type in ('whatsapp', 'checkout')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
  total_price numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,  -- disimpan snapshot, biar aman kalau produk dihapus/diedit
  price numeric(12,2) not null,
  quantity integer not null default 1,
  subtotal numeric(12,2) not null
);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) — WAJIB untuk keamanan
-- ============================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Semua orang boleh baca produk aktif & kategori (publik)
create policy "Produk aktif bisa dibaca semua orang"
  on products for select
  using (is_active = true);

create policy "Foto produk bisa dibaca semua orang"
  on product_images for select
  using (true);

create policy "Kategori bisa dibaca semua orang"
  on categories for select
  using (true);

-- Hanya admin yang boleh insert/update/delete produk
create policy "Admin bisa kelola produk"
  on products for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin bisa kelola foto produk"
  on product_images for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin bisa kelola kategori"
  on categories for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Profile: user hanya bisa lihat/edit profil sendiri, admin bisa lihat semua
create policy "User bisa lihat profil sendiri"
  on profiles for select
  using (auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "User bisa update profil sendiri"
  on profiles for update
  using (auth.uid() = id);

-- Orders: user hanya bisa lihat order miliknya, admin bisa lihat semua
create policy "User bisa lihat order sendiri"
  on orders for select
  using (auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Siapa saja bisa buat order (termasuk guest checkout)"
  on orders for insert
  with check (true);

create policy "Admin bisa update status order"
  on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Order items ikut aturan order"
  on order_items for select
  using (
    exists (select 1 from orders where orders.id = order_id and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin')))
  );

create policy "Siapa saja bisa insert order items"
  on order_items for insert
  with check (true);

-- ============================================
-- CATATAN:
-- 1. Setelah user pertama daftar, ubah role jadi admin manual lewat SQL Editor:
--    update profiles set role = 'admin' where id = 'UUID_USER_ADMIN';
-- 2. Buat Storage bucket "product-images" di Supabase Storage untuk upload foto.
-- ============================================
