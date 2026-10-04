# American Dress House — online store

A premium e-commerce storefront and admin for **American Dress House**, Barkat Plaza, Shop No 14–17, Bank Road, Saddar, Rawalpindi.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style components, Supabase (Postgres + Auth), React Hook Form + Zod, Sonner and Recharts.

The site runs **immediately without any credentials** in demo mode, and switches to Supabase automatically once two environment variables are set.

---

## Prerequisites

* Node.js **18.18 or newer** (20 LTS recommended)
* npm 9+
* Optional: a free [Supabase](https://supabase.com) project

## Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other commands:

```bash
npm run lint       # ESLint (next/core-web-vitals)
npm run typecheck  # TypeScript, no emit
npm run build      # production build
npm start          # serve the production build
```

## Demo mode

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, the app uses demo mode:

* The catalogue comes from `src/data/seed/*.json` (18 sample products, 8 categories).
* Cart and wishlist are kept in `localStorage`.
* Accounts, orders, admin edits and settings are saved **in this browser only**. Nothing is sent to a server.
* Checkout creates a clearly labelled **demo order**. No payment is taken and the store is not notified.
* Admin analytics include **generated sample orders** (labelled "Sample") so the charts aren't empty. They are not real sales.
* Every demo screen says so with an on-page notice.

Demo logins (shown on the sign-in pages):

| Role | Email | Password |
| --- | --- | --- |
| Admin (`/admin/login`) | `admin@demo.store` | `demo-admin-2026` |
| Customer (`/login`) | `customer@demo.store` | `demo-customer` |

Reset all demo data from **Admin → Settings → Reset demo data**.

## Connect Supabase

1. Create a project at supabase.com.
2. Copy the env template and fill in **Project Settings → API**:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Run the SQL files in `supabase/` in order (full guide: [`supabase/README.md`](supabase/README.md)):
   `0001_schema.sql` → `0002_security.sql` → `0003_functions.sql` → `seed.sql` (optional sample catalogue).
4. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` (and your production URL) as redirect URLs.
5. Restart `npm run dev`, sign up at `/signup`, then promote yourself to admin:

   ```sql
   update public.user_roles set role = 'admin'
   where user_id = (select id from auth.users where email = 'you@example.com');
   ```

6. Sign in at `/admin/login`.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For live mode | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live mode | Public anon key. Safe in the browser because RLS protects data |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Used for metadata, sitemap and auth links |

Never add the service-role key. The app doesn't need it.

## How security works with Supabase

* `src/middleware.ts` refreshes the session and sends signed-out visitors away from `/account`, `/checkout` and `/admin`.
* The admin layout re-reads the user's role from `user_roles` on the server; every admin server action calls `requireAdmin()` again. A role sent from the browser is never trusted.
* Row Level Security restricts customers to their own profile, wishlist and orders.
* Orders go through the `place_order()` database function, which reads prices and stock from the database, locks inventory rows and calculates totals. Browser-side prices are ignored.

## Deploy to Vercel

1. Push the project to GitHub and import it in Vercel (framework: Next.js, defaults are fine).
2. Add the three environment variables in **Project → Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain and add `https://<domain>/auth/callback` to Supabase redirect URLs.
4. Deploy. Without Supabase variables the deployment runs in demo mode.

## Replacing sample content

| What | Where |
| --- | --- |
| Products, categories, settings (demo) | `src/data/seed/*.json` (or the admin, or Supabase) |
| Collections (Wedding Edit, etc.) | `src/data/collections.ts` |
| Address, phone, map link, Google rating | `src/config/site.ts` |
| Homepage reviews | `src/data/reviews.ts` — currently **labelled demo content**; paste verified Google reviews and set `source: "google"` |
| About text, FAQ, policies | `src/app/(store)/about`, `src/data/faq.ts`, `src/app/(store)/privacy`, `/terms` |
| Images | `public/images/` and the image URLs in products |

The four store photos in `public/images/` came from the client brief and are small (243 px wide). Replace them with original high-resolution photos for production. Other product images point to Unsplash; any image that fails to load falls back to a branded placeholder instead of a broken image.

## Project structure

```
src/
  app/
    (store)/          storefront routes (home, shop, product, cart, checkout, account, auth, info pages)
    admin/login       admin sign-in
    admin/(panel)/    protected admin routes
    actions/          server actions (orders, admin, account)
    auth/callback     Supabase email-link handler
  components/
    ui/               button, input, sheet, dialog… (shadcn-style)
    layout/ home/ product/ cart/ checkout/ account/ admin/ auth/ shared/
  context/            auth, store data, cart, wishlist providers
  lib/
    supabase/         browser, server and middleware clients, row mappers
    services/         store.server.ts (catalogue), orders.client.ts (demo vs Supabase)
    demo/             localStorage storage, demo auth, sample orders
    payments/         payment provider interface (offline methods today)
    catalog.ts        filtering, sorting, facets
    validation.ts     Zod schemas
  data/               seed JSON, collections, reviews, FAQ
  types/              shared TypeScript types
supabase/
  migrations/         schema, RLS, functions
  seed.sql            sample catalogue
```

## Payments

Online payment is **not** implemented. Checkout offers cash on delivery and pay at store pickup. `src/lib/payments/index.ts` defines a `PaymentProvider` interface and explains where a card or wallet gateway (with server-side keys and webhook confirmation) would plug in.

## Current limitations

* No online payment gateway yet (by design; see above).
* Product images are entered as URLs; there is no upload to Supabase Storage yet.
* The contact form validates input but isn't connected to email or a database; it tells visitors to call.
* Order confirmation emails are not sent.
* Guest checkout works in demo mode; with Supabase, customers sign in before checkout.
* The `customer_addresses` table is ready, but checkout doesn't yet save addresses to it.
* Shop filtering runs in the browser, which suits a catalogue of a few hundred products. Move it to SQL queries for much larger catalogues.
* Demo-mode admin changes affect only the browser they were made in.
* Homepage reviews are demo content until real reviews are added.
* About, FAQ and policy text are neutral templates for the owner to confirm.
