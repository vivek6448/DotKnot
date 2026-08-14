-- Replaces the simplified initial schema with the full catalog/attribute/order
-- model from the DotKnot build plan (Section 4). Safe to drop and rebuild:
-- no real product or order data has been loaded yet.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists
  public.order_items,
  public.payments,
  public.orders,
  public.cart_items,
  public.carts,
  public.coupons,
  public.variant_attribute_values,
  public.product_variants,
  public.attribute_values,
  public.attributes,
  public.product_images,
  public.product_categories,
  public.products,
  public.categories,
  public.addresses,
  public.settings,
  public.profiles
cascade;

drop function if exists public.set_updated_at();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  name text,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email)
  values (new.id, new.phone, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bypasses RLS to answer "is the current user an admin" without recursive
-- policy checks; used by every admin-only write policy below.
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  phone text not null,
  is_default boolean not null default false
);

create index addresses_user_id_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories (id) on delete set null
);

create index categories_parent_id_idx on public.categories (parent_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  sale_price numeric(10, 2) check (sale_price >= 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  stitch_count integer,
  processing_days integer,
  created_at timestamptz not null default now()
);

create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create index product_categories_category_id_idx on public.product_categories (category_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create index product_images_product_id_idx on public.product_images (product_id);

create table public.attributes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.attribute_values (
  id uuid primary key default gen_random_uuid(),
  attribute_id uuid not null references public.attributes (id) on delete cascade,
  value text not null,
  unique (attribute_id, value)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) check (sale_price >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  weight_grams integer
);

create index product_variants_product_id_idx on public.product_variants (product_id);

create table public.variant_attribute_values (
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  attribute_value_id uuid not null references public.attribute_values (id) on delete cascade,
  primary key (variant_id, attribute_value_id)
);

create index variant_attribute_values_attr_value_idx on public.variant_attribute_values (attribute_value_id);

-- ---------------------------------------------------------------------------
-- Cart
-- ---------------------------------------------------------------------------

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index carts_user_id_idx on public.carts (user_id);

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unique (cart_id, variant_id)
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);

-- ---------------------------------------------------------------------------
-- Coupons, orders, payments
-- ---------------------------------------------------------------------------

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value >= 0),
  min_order_value numeric(10, 2),
  expires_at timestamptz,
  active boolean not null default true
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  address_id uuid not null references public.addresses (id) on delete restrict,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  shipping_fee numeric(10, 2) not null default 0 check (shipping_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  coupon_code text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  product_name_snapshot text not null,
  variant_label_snapshot text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'razorpay',
  provider_payment_id text,
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null check (status in ('initiated', 'success', 'failed')),
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);

-- ---------------------------------------------------------------------------
-- Config-driven marketing widgets (announcement bar, promo popup, etc.)
-- ---------------------------------------------------------------------------

create table public.settings (
  key text primary key,
  value jsonb not null
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.attributes enable row level security;
alter table public.attribute_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_attribute_values enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.settings enable row level security;

-- Owner-only: profiles, addresses, carts, cart_items, orders, order_items, payments

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can manage own addresses" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own cart" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own cart items" on public.cart_items
  for all using (
    exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
  );

create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Users can create own orders" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Users can view own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );
create policy "Users can create own order items" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

create policy "Users can view own payments" on public.payments
  for select using (
    exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid())
  );

-- Public read, admin write: catalog + settings

create policy "Public can read categories" on public.categories
  for select using (true);
create policy "Admins can write categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active products" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "Admins can write products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read product categories" on public.product_categories
  for select using (true);
create policy "Admins can write product categories" on public.product_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read product images" on public.product_images
  for select using (true);
create policy "Admins can write product images" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read attributes" on public.attributes
  for select using (true);
create policy "Admins can write attributes" on public.attributes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read attribute values" on public.attribute_values
  for select using (true);
create policy "Admins can write attribute values" on public.attribute_values
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read product variants" on public.product_variants
  for select using (true);
create policy "Admins can write product variants" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read variant attribute values" on public.variant_attribute_values
  for select using (true);
create policy "Admins can write variant attribute values" on public.variant_attribute_values
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Public can read settings" on public.settings
  for select using (true);
create policy "Admins can write settings" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Coupons: never readable via the client (validated server-side only in the
-- apply-coupon Edge Function using the service role); admins can manage them.
create policy "Admins can manage coupons" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

insert into public.categories (name, slug) values
  ('T-Shirts', 't-shirts'),
  ('Shirts', 'shirts'),
  ('Hoodies', 'hoodies'),
  ('Sweatshirts', 'sweatshirts'),
  ('Lower', 'lower');

insert into public.attributes (name) values
  ('Size'),
  ('Fit');

insert into public.attribute_values (attribute_id, value)
select id, v.value
from public.attributes, unnest(array['XS', 'S', 'M', 'L', 'XL', 'XXL']) as v(value)
where public.attributes.name = 'Size';

insert into public.attribute_values (attribute_id, value)
select id, v.value
from public.attributes, unnest(array['Regular', 'Oversized']) as v(value)
where public.attributes.name = 'Fit';
