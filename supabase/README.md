# Database setup (Supabase)

Run these files in order in the Supabase dashboard, **SQL Editor → New query → paste → Run**:

1. `migrations/0001_schema.sql` – tables, constraints, indexes, `updated_at` triggers
2. `migrations/0002_security.sql` – Row Level Security policies and the `is_admin()` helper
3. `migrations/0003_functions.sql` – new-user trigger and the `place_order()` function
4. `seed.sql` (optional) – the same 18 sample products and 8 categories used in demo mode

With the Supabase CLI instead: `supabase link --project-ref <ref>` then `supabase db push`, and run `seed.sql` with `psql` or the SQL editor.

## Tables

| Table | Purpose |
| --- | --- |
| `profiles` | One row per auth user: name, phone |
| `user_roles` | `customer` or `admin`; only admins can change roles |
| `categories` | Shop categories |
| `products` | Catalogue, including colours (jsonb), sizes, flags, status |
| `product_images` | Ordered image URLs per product |
| `product_variants` | One row per size × colour, unique SKU |
| `inventory` | Stock per variant (`quantity >= 0`) |
| `wishlists`, `wishlist_items` | One wishlist per user |
| `customer_addresses` | Saved addresses (prepared for a future address book) |
| `orders`, `order_items` | Orders with a snapshot of each line |
| `newsletter_subscriptions` | Email sign-ups, unique per lowercase email |
| `store_settings` | Single row (`id = 1`): currency, delivery fee, announcement |

## Security model

* RLS is enabled on every table.
* Customers can read and edit only their own profile, wishlist, addresses and orders.
* Catalogue tables are publicly readable (drafts only by admins) and writable only by admins.
* Orders cannot be inserted directly. `place_order()` runs as `security definer`, re-reads prices and stock from the database, locks inventory rows, decrements stock and computes totals. The browser only sends variant ids and quantities.
* `is_admin()` checks `user_roles` for the current `auth.uid()`. The app also checks the role on the server before every admin action.
* The app uses the **anon key only**. The service-role key is never needed.

## Create your first admin

1. Sign up on the website (`/signup`) with the owner's email and confirm it.
2. In the SQL editor run:

```sql
update public.user_roles set role = 'admin'
where user_id = (select id from auth.users where email = 'owner@example.com');
```

3. Sign in at `/admin/login`.

## Auth settings

In **Authentication → URL Configuration** set:

* Site URL: your production URL, e.g. `https://americandresshouse.pk`
* Redirect URLs: `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`
