-- Row Level Security. Customers see only their own data; admins are checked in the database.

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.store_settings enable row level security;

-- Profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Roles: users may read their own; only admins change roles.
drop policy if exists "roles: read own or admin" on public.user_roles;
create policy "roles: read own or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "roles: admin write" on public.user_roles;
create policy "roles: admin write" on public.user_roles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Catalog: public read, admin write
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories for select using (true);
drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products: public read active" on public.products;
create policy "products: public read active" on public.products for select
  using (status = 'active' or public.is_admin());
drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "images: public read" on public.product_images;
create policy "images: public read" on public.product_images for select using (true);
drop policy if exists "images: admin write" on public.product_images;
create policy "images: admin write" on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants: public read" on public.product_variants;
create policy "variants: public read" on public.product_variants for select using (true);
drop policy if exists "variants: admin write" on public.product_variants;
create policy "variants: admin write" on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inventory: public read" on public.inventory;
create policy "inventory: public read" on public.inventory for select using (true);
drop policy if exists "inventory: admin write" on public.inventory;
create policy "inventory: admin write" on public.inventory for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Wishlists
drop policy if exists "wishlists: own" on public.wishlists;
create policy "wishlists: own" on public.wishlists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "wishlist items: own" on public.wishlist_items;
create policy "wishlist items: own" on public.wishlist_items for all to authenticated
  using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));

-- Addresses
drop policy if exists "addresses: own" on public.customer_addresses;
create policy "addresses: own" on public.customer_addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "addresses: admin read" on public.customer_addresses;
create policy "addresses: admin read" on public.customer_addresses for select to authenticated
  using (public.is_admin());

-- Orders: customers read their own. Inserts happen only through place_order().
drop policy if exists "orders: read own or admin" on public.orders;
create policy "orders: read own or admin" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders: admin delete" on public.orders;
create policy "orders: admin delete" on public.orders for delete to authenticated
  using (public.is_admin());

drop policy if exists "order items: read own or admin" on public.order_items;
create policy "order items: read own or admin" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- Newsletter: anyone can subscribe, only admins can read the list.
drop policy if exists "newsletter: subscribe" on public.newsletter_subscriptions;
create policy "newsletter: subscribe" on public.newsletter_subscriptions for insert to anon, authenticated
  with check (true);
drop policy if exists "newsletter: admin read" on public.newsletter_subscriptions;
create policy "newsletter: admin read" on public.newsletter_subscriptions for select to authenticated
  using (public.is_admin());

-- Settings
drop policy if exists "settings: public read" on public.store_settings;
create policy "settings: public read" on public.store_settings for select using (true);
drop policy if exists "settings: admin write" on public.store_settings;
create policy "settings: admin write" on public.store_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
