# Silvaine Sneaker Boutique — Supabase → NestJS + TypeORM + MySQL Migration Specification

> **Scope of this document.** This is a *discovery and specification* document only. It records what the application
> currently is and what it currently depends on Supabase for, and maps each dependency onto a requirement for a new
> standalone NestJS backend. No backend code is implemented here.
>
> **Evidence rule.** Every item below is traceable to a file in this repository. Where the codebase contains a gap
> (a feature that looks implemented in the UI but is not actually wired to a backend), it is called out explicitly as a
> **GAP** rather than assumed to work. These gaps are the single most important part of this document, because the new
> backend will have to implement behaviour that does not exist today.

**Analysed revision:** `main` @ `76e73f4`
**Date of analysis:** 2026-09-17

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Existing Features](#2-existing-features)
3. [Supabase Dependencies](#3-supabase-dependencies)
4. [Feature-by-Feature Analysis](#4-feature-by-feature-analysis)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Database Analysis](#6-database-analysis)
7. [Storage Analysis](#7-storage-analysis)
8. [Realtime Features](#8-realtime-features)
9. [RPC / Functions / Triggers](#9-rpc--functions--triggers)
10. [RLS Policies](#10-rls-policies)
11. [Supabase → NestJS Mapping](#11-supabase--nestjs-mapping)
12. [Proposed NestJS Modules](#12-proposed-nestjs-modules)
13. [Proposed TypeORM Entities](#13-proposed-typeorm-entities)
14. [Entity Relationships](#14-entity-relationships)
15. [API Requirements](#15-api-requirements)
16. [Business Logic Requirements](#16-business-logic-requirements)
17. [Migration Considerations](#17-migration-considerations)
18. [External Services / Integrations](#18-external-services--integrations)
19. [Environment Variables](#19-environment-variables)
20. [Risks and Important Considerations](#20-risks-and-important-considerations)
21. [Recommended Migration Sequence](#21-recommended-migration-sequence)
22. [Final Backend Requirements Checklist](#22-final-backend-requirements-checklist)

---

## 1. Project Overview

### 1.1 What the product is

Silvaine is a single-brand luxury sneaker e-commerce storefront ("Maison de Chaussures", Milano/Italy positioning,
EUR currency) with an attached admin panel. It is a client-rendered SPA that talks directly to Supabase from the
browser — there is no application server of any kind today.

### 1.2 Technology stack (current)

| Layer | Technology | Evidence |
|---|---|---|
| Build tool | Vite 5 + `@vitejs/plugin-react-swc` | `vite.config.ts`, `package.json` |
| Language | TypeScript 5.8 | `tsconfig.json` |
| UI framework | React 18.3 | `package.json` |
| Routing | `react-router-dom` 6.30 (BrowserRouter) | `src/App.tsx` |
| Component libraries | **Two in parallel**: MUI 7 (`@mui/material`, storefront + most admin) and shadcn/ui + Radix + Tailwind (`src/components/ui/*`, used by `AdminProducts`) | `src/components/ui/*`, `src/pages/**` |
| Styling | Tailwind 3.4 + MUI theme (`src/theme/theme.ts`) | `tailwind.config.ts`, `src/theme/theme.ts` |
| Animation | `framer-motion` 12 | throughout `src/pages/**` |
| Server state | TanStack React Query 5 | `src/App.tsx`, `src/hooks/*` |
| Client state | Redux Toolkit 2 (cart only) | `src/redux/store.ts` |
| Forms | `react-hook-form` + `zod` present as dependencies but **not used** in any page; all forms are manual `useState` | `package.json` vs. `src/pages/**` |
| Charts | `recharts` | `src/pages/admin/AdminAnalytics.tsx` |
| Notifications | `sonner` | `src/hooks/useWishlist.ts`, `src/pages/ProductDetail.tsx` |
| SEO | `react-helmet-async` | `src/components/SEO.tsx` |
| Testing | Vitest + Testing Library (1 placeholder test only) | `src/test/example.test.ts` |
| **Backend** | **Supabase (PostgreSQL + GoTrue Auth + Storage), called directly from the browser** | `src/integrations/supabase/client.ts` |
| Origin | Scaffolded by Lovable (`lovable-tagger` dev plugin, README) | `vite.config.ts`, `README.md` |

### 1.3 Architecture today

```
Browser (React SPA)
  ├── @supabase/supabase-js client  ──────────────►  Supabase project "xnvtkbaqjdojuotqdfvu"
  │     • auth.*      (GoTrue)                          ├── auth.users (GoTrue)
  │     • .from(...)  (PostgREST)                       ├── public.* (9 tables, PostgREST + RLS)
  │     • .rpc(...)   (Postgres functions)              ├── 2 SQL functions exposed as RPC
  │                                                      └── storage bucket "product-images"
  ├── Redux (cart)  ──►  localStorage "silvaine_cart"
  └── Supabase session ──►  localStorage (GoTrue keys)
```

**Security posture today:** the browser holds the Supabase anon key and all authorization is enforced *inside the
database* by Row Level Security. There is no server-side business logic anywhere. This is the single biggest structural
change the migration introduces: **all RLS must become server-side authorization, and all trigger logic must become
server-side business logic.**

### 1.4 Route map

| Route | Component | Guard | Layout |
|---|---|---|---|
| `/` | `Home` | public | `MainLayout` |
| `/shop` | `Shop` | public | `MainLayout` |
| `/product/:slug` | `ProductDetail` | public | `MainLayout` |
| `/cart` | `Cart` | public | `MainLayout` |
| `/checkout` | `Checkout` | `ProtectedRoute` (authenticated) | `MainLayout` |
| `/order-success` | `OrderSuccess` | `ProtectedRoute` | `MainLayout` |
| `/login` | `Login` | public | `MainLayout` |
| `/register` | `Register` | public | `MainLayout` |
| `/reset-password` | `ResetPassword` | public (validates URL hash) | `MainLayout` |
| `/about` | `About` | public | `MainLayout` |
| `/contact` | `Contact` | public | `MainLayout` |
| `/admin` | `AdminDashboard` | `AdminRoute` (authenticated + `admin` role) | `AdminLayout` |
| `/admin/products` | `AdminProducts` | `AdminRoute` | `AdminLayout` |
| `/admin/orders` | `AdminOrders` | `AdminRoute` | `AdminLayout` |
| `/admin/inventory` | `AdminInventory` | `AdminRoute` | `AdminLayout` |
| `/admin/categories` | `AdminCategories` | `AdminRoute` | `AdminLayout` |
| `/admin/customers` | `AdminCustomers` | `AdminRoute` | `AdminLayout` |
| `/admin/reviews` | `AdminReviews` | `AdminRoute` | `AdminLayout` |
| `/admin/analytics` | `AdminAnalytics` | `AdminRoute` | `AdminLayout` |
| `/admin/settings` | `AdminSettings` | `AdminRoute` | `AdminLayout` |
| `*` | `NotFound` | public | — |

> Note: `src/pages/Index.tsx` exists but is **not routed** (dead file). `src/data/products.ts` (136 lines of static
> product seed data) is **imported by nothing** (dead file). Both should be deleted or deliberately retained as
> fixtures — they are not part of the runtime and must not be mistaken for a data source.

---

## 2. Existing Features

Features are grouped by whether they are genuinely backed by Supabase today, partially backed, or purely client-side.

### 2.1 Fully backend-backed features (Supabase is load-bearing)

| # | Feature | Backend surface used |
|---|---|---|
| F-01 | User registration (email + password + full name) | `auth.signUp` + `handle_new_user` trigger + `assign_customer_role` trigger |
| F-02 | User login | `auth.signInWithPassword` |
| F-03 | Session persistence + auto refresh | `auth.getSession`, `auth.onAuthStateChange`, localStorage |
| F-04 | Logout | `auth.signOut` |
| F-05 | Password reset request (email link) | `auth.resetPasswordForEmail` |
| F-06 | Password update from recovery link | `auth.updateUser({ password })` |
| F-07 | Post-login role-based redirect (admin → `/admin`) | `rpc('has_role')` |
| F-08 | Admin route guard | `rpc('has_role')` |
| F-09 | Product catalogue listing (active products + category + images) | `products` + `categories` + `product_images` (embedded select) |
| F-10 | Product detail by slug | `products` select by `slug` |
| F-11 | Category listing | `categories` select |
| F-12 | Wishlist read / add / remove | `wishlists` table |
| F-13 | Admin dashboard KPI tiles + recent orders | `rpc('get_admin_stats')` |
| F-14 | Admin product list (with category + images) | `products` embedded select |
| F-15 | Admin product create / update | `products` insert/update |
| F-16 | Admin product delete | `products` delete |
| F-17 | Admin product image sync (delete-all + re-insert) | `product_images` delete + insert |
| F-18 | Admin category create | `categories` insert |
| F-19 | Admin category delete | `categories` delete |
| F-20 | Admin order list (with items + product names) | `orders` embedded select |
| F-21 | Admin order status update | `orders` update |
| F-22 | Admin customer list | `profiles` select |
| F-23 | Admin review list | `reviews` embedded select |
| F-24 | Admin review delete | `reviews` delete |
| F-25 | Inventory / stock overview | derived client-side from `products.stock` |

### 2.2 Client-only features (no backend today, but the new backend will likely need to support them)

| # | Feature | Where it lives | Notes |
|---|---|---|---|
| F-26 | Shopping cart (add / remove / qty / clear) | `src/redux/slices/cartSlice.ts` | Persisted to `localStorage` key `silvaine_cart`. Never synced to a server. Guest carts work. |
| F-27 | Shipping cost rule (€15, free ≥ €500) | `src/pages/Cart.tsx:19-20`, `src/pages/Checkout.tsx:17-18` | Hardcoded constant, **duplicated in two files**. Business rule that belongs on the server. |
| F-28 | Shop filtering, sorting, price range, infinite scroll | `src/pages/Shop.tsx:86-152` | Entirely client-side over the full product list. Will not scale; candidate for server-side query params. |
| F-29 | Product search (admin) | `AdminProducts.tsx:59-61`, `AdminOrders.tsx:25-29`, `AdminCategories.tsx:19` | Client-side `.filter()` over the whole fetched list. |
| F-30 | Pagination (admin products) | `AdminProducts.tsx:66-82` | Client-side slicing of a fully-fetched list. |
| F-31 | Related products | `ProductDetail.tsx:198-203` | Client-side: same category, max 4, fallback to any 4. |
| F-32 | Password strength meter | `Register.tsx:63-70` | Purely visual; the only *enforced* rule is `length >= 8` (`Register.tsx:87`). |
| F-33 | Stock badges ("ONLY n LEFT" ≤10, "OUT OF STOCK" = 0) | `ProductStockIndicator.tsx:8-9`, `AdminInventory.tsx:11-12` | Threshold `10` hardcoded in 3 places (also in `get_admin_stats`). |
| F-34 | SEO meta / JSON-LD / sitemap | `src/components/SEO.tsx`, `public/sitemap.xml` | Static sitemap — does not include dynamic product URLs. |

### 2.3 GAPS — features that appear to exist in the UI but have **no working backend**

These are the highest-priority items for the new backend.

| # | GAP | Evidence | Consequence |
|---|---|---|---|
| **G-01** | **Checkout never creates an order.** `handleSubmit` generates a fake client-side ID (`SLV-${Date.now().toString(36)}`), clears the cart, and navigates to the success page with the data in router state. **Nothing is written to `orders` or `order_items`.** | `src/pages/Checkout.tsx:41-46` | The `orders` / `order_items` tables are never populated by the application. Admin order management, `get_admin_stats` revenue, and verified-purchase detection all operate on data that the app cannot produce. **The new backend must implement order creation from scratch.** |
| **G-02** | **No stock decrement anywhere.** No code path reduces `products.stock`. | absence across `src/**` | Inventory is decorative. Stock can only change via a manual admin edit. |
| **G-03** | **No review submission UI.** `reviews` is only ever read (admin) or deleted (admin). No customer-facing create/edit/delete. | `src/hooks/useAdmin.ts:88-95`, `AdminReviews.tsx:13-16`; no other `reviews` reference | RLS policies and the `update_product_rating` / `check_verified_purchase` triggers exist for a flow the UI does not offer. `products.rating` / `review_count` therefore never change from their seeded values. |
| **G-04** | **No product review display on the product page.** `ProductDetail` renders `product.rating` / `reviewCount` (denormalised columns) but never fetches review rows. | `src/pages/ProductDetail.tsx` | Review text is stored but never shown to customers. |
| **G-05** | **No order history page for customers.** Users can never see their own orders. `orders` RLS grants users SELECT on their own rows, but no UI consumes it. | no route; `src/App.tsx` | New backend should expose `GET /orders/me`; frontend work required. |
| **G-06** | **No profile view/edit UI.** `profiles` has 9 address/contact columns and an UPDATE RLS policy, but the only read is the admin customer list. Users cannot set their own name, phone, or address. | `src/hooks/useAdmin.ts:74-81` only | Checkout re-collects shipping details every time because there is nowhere to save them. |
| **G-07** | **Admin Analytics is 100% hardcoded mock data.** `salesData` and `categoryData` are literal arrays. | `src/pages/admin/AdminAnalytics.tsx:5-20` | No analytics backend exists. Requires new aggregation endpoints if the charts are to become real. |
| **G-08** | **Admin Settings is hardcoded static text.** No settings table, no persistence. | `src/pages/admin/AdminSettings.tsx:9-14` | Store config (name, currency, country) is not configurable. Needs a settings store if it is to be editable. |
| **G-09** | **Contact form does nothing.** `handleSubmit` only flips a local `submitted` boolean. No email, no persistence. | `src/pages/Contact.tsx:12` | Needs a contact/enquiry endpoint + mail transport if it should work. |
| **G-10** | **No image upload.** The storage bucket exists and product image URLs point at it, but the admin UI only accepts **pasted URL strings**. No file is ever uploaded from the app. | `AdminProducts.tsx:119-129` (`addImageUrl` takes a text input) | The new backend must provide real file upload if admins are to manage images without external tooling. |
| **G-11** | **No category update.** Admin can create and delete categories but not edit them, despite an UPDATE RLS policy existing. | `AdminCategories.tsx:21-33` | Minor, but the endpoint should exist. |
| **G-12** | **No user/role management UI.** `user_roles` can only be read by admins; there is no way in the app to grant or revoke a role. Roles are only ever created by the signup trigger (`customer`). | `user_roles` has **no** INSERT/UPDATE/DELETE RLS policy at all | The first `admin` must have been inserted out-of-band (SQL console / service key). The new backend needs an explicit, audited role-assignment path. |
| **G-13** | **`order_items` is never written.** Follows from G-01. | — | — |
| **G-14** | **`tax` column is never computed.** Orders carry a `tax` column defaulting to 0; no code computes it, and the checkout total is `subtotal + shipping` only. | `Checkout.tsx:25`, `orders.tax` | Decide whether tax (Italian VAT?) is in or out of scope. |
| **G-15** | **Payment is not integrated.** `OrderSuccess` hardcodes the text "Cash on Delivery"; `orders.payment_method` / `payment_status` exist but are never set by the app. | `OrderSuccess.tsx:33` | No payment gateway of any kind is present. |

---

## 3. Supabase Dependencies

### 3.1 Client configuration

`src/integrations/supabase/client.ts`

```ts
createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true }
})
```

- Header comment says *"This file is automatically generated. Do not edit it directly."* — it is Lovable-generated.
- `src/integrations/supabase/types.ts` (568 lines) is the generated `Database` type. It is the authoritative
  machine-readable schema snapshot and confirms the migration files.
- Project ref: `xnvtkbaqjdojuotqdfvu` (`supabase/config.toml`, `.env`).

### 3.2 Complete inventory of Supabase call sites

| # | File:Line | Call | Surface |
|---|---|---|---|
| 1 | `contexts/AuthContext.tsx:24` | `auth.onAuthStateChange` | Auth |
| 2 | `contexts/AuthContext.tsx:30` | `auth.getSession` | Auth |
| 3 | `contexts/AuthContext.tsx:40` | `auth.signUp({ email, password, options:{ data:{full_name}, emailRedirectTo } })` | Auth |
| 4 | `contexts/AuthContext.tsx:52` | `auth.signInWithPassword` | Auth |
| 5 | `contexts/AuthContext.tsx:57` | `auth.signOut` | Auth |
| 6 | `contexts/AuthContext.tsx:61` | `auth.resetPasswordForEmail(email, { redirectTo })` | Auth |
| 7 | `contexts/AuthContext.tsx:68` | `auth.updateUser({ password })` | Auth |
| 8 | `pages/Login.tsx:78` | `auth.getUser()` | Auth |
| 9 | `pages/Login.tsx:80` | `rpc('has_role', { _user_id, _role: 'admin' })` | RPC |
| 10 | `hooks/useAdmin.ts:12` | `rpc('has_role', { _user_id, _role: 'admin' })` | RPC |
| 11 | `hooks/useAdmin.ts:28` | `rpc('get_admin_stats')` | RPC |
| 12 | `hooks/useAdmin.ts:49` | `.from('products').select('*, categories(name), product_images(url, sort_order)').order('created_at', desc)` | DB |
| 13 | `hooks/useAdmin.ts:63` | `.from('orders').select('*, order_items(*, products(name))').order('created_at', desc)` | DB |
| 14 | `hooks/useAdmin.ts:77` | `.from('profiles').select('*').order('created_at', desc)` | DB |
| 15 | `hooks/useAdmin.ts:91` | `.from('reviews').select('*, products(name)').order('created_at', desc)` | DB |
| 16 | `hooks/useProducts.ts:76` | `.from('products').select('*, categories(name, slug), product_images(url, alt_text, sort_order)').eq('is_active', true).order('created_at', desc)` | DB |
| 17 | `hooks/useProducts.ts:87` | `.from('products').select(same).eq('slug', slug).single()` | DB |
| 18 | `hooks/useProducts.ts:117` | `.from('categories').select('*').order('name')` | DB |
| 19 | `hooks/useWishlist.ts:15` | `.from('wishlists').select('product_id').eq('user_id', user.id)` | DB |
| 20 | `hooks/useWishlist.ts:30` | `.from('wishlists').delete().eq('user_id').eq('product_id')` | DB |
| 21 | `hooks/useWishlist.ts:38` | `.from('wishlists').insert({ user_id, product_id })` | DB |
| 22 | `admin/AdminProducts.tsx:152` | `.from('products').update(payload).eq('id')` | DB |
| 23 | `admin/AdminProducts.tsx:154` | `.from('products').insert(payload).select('id').single()` | DB |
| 24 | `admin/AdminProducts.tsx:161` | `.from('product_images').delete().eq('product_id')` | DB |
| 25 | `admin/AdminProducts.tsx:170` | `.from('product_images').insert(imageRows)` | DB |
| 26 | `admin/AdminProducts.tsx:184` | `.from('products').delete().eq('id')` | DB |
| 27 | `admin/AdminOrders.tsx:32` | `.from('orders').update({ status, updated_at }).eq('id')` | DB |
| 28 | `admin/AdminCategories.tsx:23` | `.from('categories').insert({ name, slug, description })` | DB |
| 29 | `admin/AdminCategories.tsx:31` | `.from('categories').delete().eq('id')` | DB |
| 30 | `admin/AdminReviews.tsx:14` | `.from('reviews').delete().eq('id')` | DB |

**Totals:** 8 Auth calls, 3 RPC calls, 19 PostgREST data calls. **Zero** Storage SDK calls, **zero** Realtime
subscriptions, **zero** Edge Function invocations.

### 3.3 Dependency summary by Supabase product

| Supabase surface | Used? | Detail |
|---|---|---|
| **Auth (GoTrue)** | ✅ Heavy | Email/password only. No OAuth, no magic link, no OTP, no MFA, no phone. Email confirmation + password-reset emails are handled by Supabase's built-in mailer. |
| **Database (PostgREST)** | ✅ Heavy | 9 tables; embedded/nested selects used in 6 places; filters `.eq`, ordering, `.single()`. |
| **RPC (Postgres functions)** | ✅ | `has_role`, `get_admin_stats`. |
| **Row Level Security** | ✅ Critical | 34 policies; this is the *entire* authorization layer. |
| **Database triggers/functions** | ✅ | 4 trigger functions (2 on `auth.users`, 2 on `reviews`). |
| **Storage** | ⚠️ Indirect | Bucket `product-images` exists and is publicly readable; product image URLs point at it. **No SDK usage** — the app treats these as plain external URLs. |
| **Realtime** | ❌ | Not used. (`subscription.unsubscribe()` in `AuthContext` is the *auth state* listener, not Realtime.) |
| **Edge Functions** | ❌ | None present (`supabase/functions/` does not exist). |
| **Supabase types codegen** | ✅ | `src/integrations/supabase/types.ts` — will be deleted and replaced with hand-written or generated API DTO types. |

---

## 4. Feature-by-Feature Analysis

Each feature below is documented as: current implementation → what the NestJS backend must provide.

### F-01 / F-02 / F-03 / F-04 — Registration, Login, Session, Logout

**Current.** `AuthProvider` (`src/contexts/AuthContext.tsx`) wraps the whole app inside `BrowserRouter`. On mount it
registers `onAuthStateChange` and also calls `getSession()`; both set `{ session, user, loading }`. The Supabase client
persists the session in `localStorage` and auto-refreshes the access token. `signUp` passes `full_name` in
`options.data` (→ `auth.users.raw_user_meta_data`) and `emailRedirectTo: window.location.origin`.

Two database triggers fire on `auth.users` INSERT: `handle_new_user` (creates a `profiles` row copying
`raw_user_meta_data->>'full_name'`) and `assign_customer_role` (inserts `user_roles` row with role `customer`).

**Required in NestJS.**
- `POST /auth/register` — body `{ email, password, fullName }`. Must, in one transaction: create `users` row (bcrypt/argon2 hash), create `profiles` row with `fullName`, create `user_roles` row with `customer`.
- `POST /auth/login` — returns access token (JWT) + refresh token.
- `POST /auth/refresh` — rotate refresh token.
- `POST /auth/logout` — revoke refresh token.
- `GET /auth/me` — returns the current user + profile + roles (replaces `getSession`/`getUser` and folds in the separate `has_role` round-trip).
- Frontend `AuthContext` must be rewritten to hold the JWT and call these endpoints. **Decision required:** JWT in `localStorage` (matches today's behaviour, XSS-exposed) vs. httpOnly refresh cookie + in-memory access token (recommended).

### F-05 / F-06 — Password reset

**Current.** `resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })` sends a Supabase-templated
email. The link returns to `/reset-password` with a URL **hash fragment** containing `type=recovery` and the recovery
tokens. `ResetPassword.tsx:25-32` merely checks `window.location.hash.includes('type=recovery')` and otherwise
redirects to `/login`; the Supabase client silently consumes the hash and establishes a recovery session, after which
`auth.updateUser({ password })` works. Client-side validation: `length >= 8` and `password === confirmPassword`.

**Required in NestJS.**
- `POST /auth/forgot-password` — always returns 200 (no user enumeration); generates a single-use, expiring token (store hash, not the token); sends an email via a real mail provider.
- `POST /auth/reset-password` — body `{ token, newPassword }`; verifies, sets new hash, invalidates the token and all existing refresh tokens for that user.
- **Frontend change required:** the token must move from a URL hash to a query parameter (`?token=`), because there is no longer a client SDK to consume the hash.
- **Email infrastructure is a new external dependency** (see §18).

### F-07 / F-08 — Role-based routing and admin guard

**Current.** `AdminRoute` composes `useAuth()` (is there a user?) with `useAdminCheck()` (`rpc('has_role', {..., 'admin'})`,
cached 10 min). `Login.tsx:78-83` repeats the same RPC after sign-in to choose the redirect target. `Header.tsx`
uses `useAdminCheck()` to conditionally show the admin link.

**Required in NestJS.** Roles should be embedded as a claim in the JWT so no extra round-trip is needed. Server-side
enforcement via `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')` on every admin controller. The client-side guard
remains, but only as UX — it is no longer a security boundary.

### F-09 / F-10 / F-11 — Catalogue browsing

**Current.** `useProducts` fetches **every active product** with nested categories and images in one PostgREST call,
then `mapProduct` flattens it: `categories.name → category`, `product_images` sorted by `sort_order` → `images: string[]`,
falling back to `['/placeholder.svg']`; `colors` is JSON-parsed if it arrives as a string; `discount_price` → `discountPrice`
or `undefined`. Cached 5 min. `useProduct(slug)` does the same filtered by slug with `.single()`, returning `null` on error
(so a DB error is indistinguishable from "not found"). `useCategories` fetches all categories ordered by name, cached 10 min.

Note `fetchProductBySlug` does **not** filter `is_active`, so an inactive product is still reachable by direct URL —
and the `products` SELECT policy is `USING (true)`, so inactive products are readable by anyone who queries directly.

**Required in NestJS.**
- `GET /products` — must preserve the exact response shape the frontend maps today, or the mapper gets rewritten. Recommend returning the already-flattened shape (`category`, `images: string[]`, `discountPrice`) and deleting `mapProduct`.
- `GET /products/:slug` — 404 when missing; decide explicitly whether inactive products are visible (recommend: admin-only).
- `GET /categories`.
- **Recommended improvement:** move `Shop`'s filtering/sorting/paging (F-28) to query params — `?category=&minPrice=&maxPrice=&sort=&page=&limit=` — because the current design downloads the entire catalogue on every visit.

### F-12 — Wishlist

**Current.** `useWishlist` reads `product_id`s for the current user (query disabled when logged out) and toggles by
reading the local array then issuing a delete or insert. `ProductDetail` redirects to `/login` if a guest clicks the
heart. Uniqueness is enforced by the DB constraint `UNIQUE(user_id, product_id)`.

**Required in NestJS.** `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId` — all
`JwtAuthGuard`, all scoped to `req.user.id` (never trust a `userId` from the body). A `POST /wishlist/:productId/toggle`
would match the current UI more closely and removes a client-side race. Duplicate insert must return 409 or be idempotent.

### F-13 — Admin dashboard

**Current.** One `rpc('get_admin_stats')` call returning a JSON blob of 6 counters + the 10 most recent orders. The
function itself re-checks `has_role(auth.uid(),'admin')` and raises `Access denied`.

**Required in NestJS.** `GET /admin/stats` behind `@Roles('admin')`, returning the identical JSON shape
(`total_products`, `total_orders`, `total_revenue`, `total_customers`, `low_stock_products`, `pending_orders`,
`recent_orders[]`) so `AdminDashboard.tsx` needs no changes. Implement as 6 `COUNT`/`SUM` queries plus one ordered
`LIMIT 10` — or a single UNION query if measured to matter.

### F-14 … F-17 — Admin product management

**Current.** `handleSave` builds a payload, then:
1. if editing → `update` by id; else → `insert` + `.select('id').single()` to learn the new id;
2. **unconditionally deletes all `product_images` for the product and re-inserts the current list** with `sort_order = index` and `alt_text = product.name`;
3. invalidates the `admin-products` and `products` React Query caches.

Client-side transformations: slug auto-derived (`name.toLowerCase().replace(/\s+/g,'-')`) when blank; `sizes` parsed
from a comma-separated string; `colors` parsed with `JSON.parse` from a raw textarea (**will throw on malformed JSON
and is only caught by a `console.error`**); `price`/`discount_price` via `parseFloat`; `stock` via `parseInt` with `|| 0`.

Delete is a hard `DELETE` on `products`, which cascades to `product_images`, `reviews`, and `wishlists`, and is
**blocked by `ON DELETE RESTRICT` from `order_items`** if the product was ever ordered.

**Required in NestJS.**
- `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`.
- Product + images must be saved **in one transaction** (today a failure between steps 1 and 2 leaves a product with no images).
- `colors` must be validated server-side as `{ name: string, hex: string }[]` — a `class-validator` nested DTO, not `JSON.parse`.
- Slug uniqueness and SKU uniqueness must be enforced and return a clean 409 (today a duplicate slug produces a raw Postgres error that the UI swallows).
- Delete must return a meaningful 409 when the product is referenced by `order_items`, instead of a silent failure.
- **Recommended:** replace the delete-all/re-insert image sync with a diff, or keep it but inside the transaction.

### F-18 / F-19 (+ G-11) — Admin categories

**Current.** Insert with client-derived slug; hard delete with no confirmation dialog. `products.category_id` is
`ON DELETE SET NULL`, so deleting a category orphans its products to "Uncategorized".

**Required in NestJS.** `GET/POST/PATCH/DELETE /admin/categories`, unique `name` and `slug`, server-side slugification,
and a decision on whether deletion should be blocked when products reference the category (recommend: warn + require
`?force=true`, or reassign).

### F-20 / F-21 — Admin orders

**Current.** Fetches all orders with nested `order_items` and each item's `products(name)`. Filtering by search text
(shipping name or raw id substring) and status is client-side. Status update writes `{ status, updated_at }`.
Status vocabulary observed in the UI: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`
(`AdminOrders.tsx:9-16`) — but the column is free-text `TEXT` with **no DB constraint**, and `get_admin_stats` /
`check_verified_purchase` also reference `completed` (`check_verified_purchase` treats `('completed','delivered')` as
purchased). **The status vocabulary is inconsistent across the codebase** and must be unified.

**Required in NestJS.** `GET /admin/orders` (with real server-side pagination/filtering), `PATCH /admin/orders/:id/status`
with a strict enum, a validated status-transition state machine, and `updated_at` maintained by TypeORM `@UpdateDateColumn`
rather than the client sending a timestamp.

### F-22 — Admin customers

**Current.** `SELECT * FROM profiles` ordered by `created_at` desc. **Notably, the email address is not available** —
it lives in `auth.users`, which PostgREST does not expose — so the customer list shows name, phone, city/country, and
join date only.

**Required in NestJS.** `GET /admin/customers` — and since `users` and `profiles` will now be in the same database, the
backend *can* include email. Also add order count / lifetime value if the admin UI is to be improved.

### F-23 / F-24 — Admin reviews

**Current.** Read all reviews joined to product name; hard delete by id. Deleting fires `on_review_change`, which
recomputes `products.rating` and `products.review_count`.

**Required in NestJS.** `GET /admin/reviews`, `DELETE /admin/reviews/:id`, and the rating recomputation must be
re-implemented in application code (see §9). Plus the missing customer-facing review endpoints (G-03).

### F-25 — Inventory

**Current.** Reuses `useAdminProducts()` and derives everything client-side: sort ascending by stock, `lowStock = stock <= 10`,
`outOfStock = stock === 0`, progress bar scaled against an arbitrary max of 50.

**Required in NestJS.** Either keep it client-derived (fine) or add `GET /admin/inventory?lowStockThreshold=10`.
The threshold `10` should become one configurable value instead of being hardcoded in four places.

### F-26 / F-27 + G-01 — Cart and Checkout

**Current.** Cart is Redux + localStorage, keyed by the composite `(id, size, color)`. `selectCartTotal` sums
`(discountPrice || price) * quantity`. Checkout collects `fullName, phone, address, city, postalCode, country`, computes
`shipping = subtotal >= 500 ? 0 : 15`, `total = subtotal + shipping`, then — **critically** — fabricates an order id and
navigates away without any network call. `OrderSuccess` renders purely from `location.state`, so a page refresh loses
the confirmation entirely.

**Required in NestJS — this is the largest piece of new work.**
`POST /orders` (authenticated) must:
1. Accept cart items `[{ productId, size, color, quantity }]` and a shipping address. **Never accept prices from the client.**
2. Re-load every product server-side and validate it exists, `is_active`, and `stock >= quantity`.
3. Compute `unit_price` from the DB (`discount_price ?? price`), `total_price`, `subtotal`, `shipping_cost` (server-owned rule: free ≥ €500, else €15), `tax`, `total`.
4. Snapshot `product_name` and `product_image` into `order_items` (the schema already denormalises these deliberately, so historical orders survive product edits).
5. Decrement `products.stock` atomically with row locking (`SELECT ... FOR UPDATE`) — closing G-02.
6. Insert `orders` + `order_items` in a single transaction.
7. Optionally persist the shipping address back to `profiles`.
8. Return the real order id, which the frontend then displays.

Also required: `GET /orders/me`, `GET /orders/:id` (ownership-checked) — closing G-05.

### F-28 … F-34 — Presentation-layer features

No backend dependency today. The only ones with migration implications are F-28 (should become server-side querying)
and F-34 (a dynamic sitemap would need a backend endpoint).

---

## 5. Authentication & Authorization

### 5.1 Authentication — current

| Aspect | Current behaviour | Source |
|---|---|---|
| Method | Email + password only | `AuthContext.tsx` |
| Identity store | Supabase `auth.users` (managed, not in `public`) | — |
| Password hashing | Managed by GoTrue (bcrypt) | — |
| Password policy | Client-side `length >= 8` only; strength meter is cosmetic | `Register.tsx:87`, `ResetPassword.tsx:36` |
| Token | Supabase JWT (HS256, signed with project secret), auto-refreshed | `client.ts` |
| Token storage | `localStorage` (`storage: localStorage, persistSession: true`) | `client.ts:11-14` |
| Email verification | Supabase default behaviour; `emailRedirectTo: window.location.origin`. **Note:** `Register.tsx:93` navigates to `/` immediately on success without telling the user to check their inbox — so if confirmation is enabled, the user lands logged-out with no explanation. | `AuthContext.tsx:44` |
| Session bootstrap | `onAuthStateChange` + `getSession()` both set state | `AuthContext.tsx:24-34` |
| Social login / MFA / phone / magic link | **None** | — |

### 5.2 Authorization — current

Authorization is entirely `has_role()` + RLS. The role model:

- Enum `app_role` with values `admin`, `moderator`, `user`, `customer`.
  `moderator` and `user` are **deprecated**: migration `...225038` rewrote all existing rows of both to `customer`, and
  the signup trigger only ever assigns `customer`. They remain in the enum only because PostgreSQL cannot easily drop
  enum values. **The live role model is effectively two roles: `admin` and `customer`.**
- `user_roles` is a many-to-many join with `UNIQUE(user_id, role)` — a user can hold multiple roles.
- `has_role(uuid, app_role)` is `SECURITY DEFINER` + `STABLE`, deliberately written to avoid recursive RLS evaluation
  when `user_roles` policies themselves call it.
- Effective permission matrix:

| Resource | Anonymous | Authenticated `customer` | `admin` |
|---|---|---|---|
| `categories` | read | read | read + create + update + delete |
| `products` | read (incl. inactive) | read | read + create + update + delete |
| `product_images` | read | read | read + create + update + delete |
| `profiles` | — | read/update/insert **own only** | read **all** (no update/delete) |
| `orders` | — | read own, insert own | read all, update all (no insert, no delete) |
| `order_items` | — | read own (via order join), insert own | read all (no update, no delete) |
| `reviews` | read all | read all, insert own, update own, delete own | + update any, delete any |
| `wishlists` | — | read/insert/delete **own only** (no update policy) | no special access |
| `user_roles` | — | **no access at all** | read only — **no INSERT/UPDATE/DELETE policy exists for anyone** |

### 5.3 Required in NestJS

**Authentication module**
- `argon2` (preferred) or `bcrypt` password hashing.
- Access JWT (short-lived, e.g. 15 min) carrying `sub`, `email`, `roles[]`. Refresh token (long-lived, rotating, hashed at rest in a `refresh_tokens` table) enabling real logout/revocation — something Supabase provided for free.
- `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` strategy.
- `JwtAuthGuard`, plus a `@Public()` decorator if the guard is registered globally.
- Email verification tokens and password-reset tokens: single-use, expiring, **stored hashed**.
- Throttling on `/auth/login`, `/auth/register`, `/auth/forgot-password` (`@nestjs/throttler`) — Supabase provided rate limiting that is now yours to implement.

**Authorization module**
- `Role` enum in code: `ADMIN`, `CUSTOMER` (do **not** carry `moderator`/`user` forward — migrate them to `customer` as migration `...225038` already did, then drop them).
- `RolesGuard` + `@Roles(...)` decorator.
- **Ownership enforcement is the direct replacement for RLS** and is the most error-prone part of the migration: every
  RLS `USING (auth.uid() = user_id)` becomes an explicit service-layer check against `req.user.id`. Recommended pattern:
  never accept a `userId` from the request body for owned resources; always derive it from the JWT. Consider a
  `@CurrentUser()` param decorator plus a shared `assertOwnership()` helper so the check is uniform and greppable.
- Optional hardening: CASL or a policy guard, so the rule set is declared in one place rather than scattered across services.

---

## 6. Database Analysis

### 6.1 Schema inventory

**9 tables** in `public`, **1 enum**, **6 functions** (4 trigger functions + 2 RPC), **4 triggers**, **1 storage bucket**.
Source: `supabase/migrations/*.sql`, corroborated by `src/integrations/supabase/types.ts`.

Migration files, in order:

| File | Contents |
|---|---|
| `20260308220145_...` | Core schema: `profiles`, `categories`, `products`, `product_images`, `orders`, `order_items`, `reviews`, `wishlists`; RLS; indexes; `handle_new_user`, `update_product_rating`, `check_verified_purchase` |
| `20260308221333_...` | `app_role` enum, `user_roles`, `has_role()`, all admin RLS policies, `get_admin_stats()` |
| `20260308222041_...` | No-op (`SELECT 1;`) |
| `20260308222051_...` | Creates public storage bucket `product-images` |
| `20260308222059_...` | Public read policy on `storage.objects` for that bucket |
| `20260308224725_...` | **Data seed**: 45 `product_images` rows referencing 15 hardcoded product UUIDs |
| `20260308225027_...` | `ALTER TYPE app_role ADD VALUE 'customer'` |
| `20260308225038_...` | Data migration: `user`/`moderator` → `customer` |
| `20260308225059_...` | `assign_customer_role()` + trigger on `auth.users` |

> **Important:** there is **no migration that seeds `products` or `categories`.** Migration `...224725` inserts
> `product_images` referencing 15 product UUIDs that must already exist. Those products (and the categories referenced
> by the UI: Classic, Minimal, Suede, Heritage, Platform) were created through the Supabase dashboard or admin UI, not
> through version-controlled SQL. **The production data must be exported from the live Supabase project — the
> repository alone cannot reconstruct it.**

### 6.2 Table-by-table

#### `profiles`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | `TEXT` | nullable |
| `avatar_url` | `TEXT` | nullable |
| `phone` | `TEXT` | nullable |
| `address_line1` | `TEXT` | nullable |
| `address_line2` | `TEXT` | nullable |
| `city` | `TEXT` | nullable |
| `state` | `TEXT` | nullable |
| `postal_code` | `TEXT` | nullable |
| `country` | `TEXT` | default `'IT'` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` — **never actually updated; no trigger exists** |

Indexes: PK only.

#### `categories`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL, **UNIQUE** |
| `slug` | `TEXT` | NOT NULL, **UNIQUE** |
| `description` | `TEXT` | nullable |
| `image_url` | `TEXT` | nullable — **never used in the UI** |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |

#### `products`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL |
| `slug` | `TEXT` | NOT NULL, **UNIQUE** |
| `description` | `TEXT` | nullable |
| `brand` | `TEXT` | NOT NULL, default `'Silvaine'` |
| `sku` | `TEXT` | **UNIQUE**, nullable |
| `category_id` | `UUID` | FK → `categories(id)` **ON DELETE SET NULL** |
| `price` | `NUMERIC(10,2)` | NOT NULL |
| `discount_price` | `NUMERIC(10,2)` | nullable |
| `stock` | `INTEGER` | NOT NULL, default `0` |
| `sizes` | `TEXT[]` | NOT NULL, default `'{}'` — **Postgres array; no MySQL equivalent** |
| `colors` | `JSONB` | NOT NULL, default `'[]'` — shape `[{ name, hex }]` |
| `rating` | `NUMERIC(2,1)` | NOT NULL, default `0` — **denormalised, maintained by trigger** |
| `review_count` | `INTEGER` | NOT NULL, default `0` — **denormalised, maintained by trigger** |
| `is_new` | `BOOLEAN` | NOT NULL, default `false` |
| `is_best_seller` | `BOOLEAN` | NOT NULL, default `false` |
| `is_trending` | `BOOLEAN` | NOT NULL, default `false` |
| `is_active` | `BOOLEAN` | NOT NULL, default `true` — **note: no admin UI toggles this field** |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` — only written by `update_product_rating` |

Indexes: `idx_products_category(category_id)`, `idx_products_slug(slug)`, `idx_products_price(price)`, `idx_products_is_active(is_active)`.

#### `product_images`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` **ON DELETE CASCADE** |
| `url` | `TEXT` | NOT NULL |
| `alt_text` | `TEXT` | nullable |
| `sort_order` | `INTEGER` | NOT NULL, default `0` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |

Indexes: `idx_product_images_product(product_id)`.

#### `orders`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `status` | `TEXT` | NOT NULL, default `'pending'` — **free text, no CHECK constraint** |
| `subtotal` | `NUMERIC(10,2)` | NOT NULL, default `0` |
| `shipping_cost` | `NUMERIC(10,2)` | NOT NULL, default `0` |
| `tax` | `NUMERIC(10,2)` | NOT NULL, default `0` |
| `total` | `NUMERIC(10,2)` | NOT NULL, default `0` |
| `shipping_name` | `TEXT` | nullable |
| `shipping_address` | `TEXT` | nullable |
| `shipping_city` | `TEXT` | nullable |
| `shipping_postal_code` | `TEXT` | nullable |
| `shipping_country` | `TEXT` | nullable |
| `payment_method` | `TEXT` | nullable |
| `payment_status` | `TEXT` | NOT NULL, default `'pending'` — free text; `get_admin_stats` compares against `'paid'` |
| `notes` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |

Indexes: `idx_orders_user(user_id)`, `idx_orders_status(status)`.
Note: there is **no `shipping_phone`** column, yet `Checkout.tsx` collects a phone number — it currently has nowhere to go.

#### `order_items`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `order_id` | `UUID` | NOT NULL, FK → `orders(id)` **ON DELETE CASCADE** |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` **ON DELETE RESTRICT** |
| `product_name` | `TEXT` | NOT NULL — **deliberate snapshot** |
| `product_image` | `TEXT` | nullable — **deliberate snapshot** |
| `size` | `TEXT` | nullable |
| `color` | `TEXT` | nullable |
| `quantity` | `INTEGER` | NOT NULL, default `1` |
| `unit_price` | `NUMERIC(10,2)` | NOT NULL |
| `total_price` | `NUMERIC(10,2)` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |

Indexes: `idx_order_items_order(order_id)`.

#### `reviews`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` **ON DELETE CASCADE** |
| `order_id` | `UUID` | FK → `orders(id)` **ON DELETE SET NULL**, nullable |
| `rating` | `INTEGER` | NOT NULL, **CHECK (rating BETWEEN 1 AND 5)** |
| `title` | `TEXT` | nullable |
| `body` | `TEXT` | nullable |
| `is_verified_purchase` | `BOOLEAN` | NOT NULL, default `false` — **set by trigger, not by the client** |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| — | — | **UNIQUE(user_id, product_id)** — one review per user per product |

Indexes: `idx_reviews_product(product_id)`, `idx_reviews_user(user_id)`.

#### `wishlists`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `product_id` | `UUID` | NOT NULL, FK → `products(id)` **ON DELETE CASCADE** |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| — | — | **UNIQUE(user_id, product_id)** |

Indexes: `idx_wishlists_user(user_id)`.

#### `user_roles`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | **PK**, default `gen_random_uuid()` |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| `role` | `app_role` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| — | — | **UNIQUE(user_id, role)** |

#### `auth.users` (Supabase-managed — must be recreated)
Not defined in this repository, but depended upon. The fields the app actually relies on:
`id` (UUID), `email` (read via `user.email` in `Header.tsx:273` and `AdminSidebar`), `encrypted_password`,
`raw_user_meta_data.full_name` (read by `handle_new_user`), and confirmation/recovery token machinery.

### 6.3 PostgreSQL → MySQL migration plan

#### 6.3.1 Type mapping

| PostgreSQL | MySQL 8 | TypeORM column | Notes |
|---|---|---|---|
| `UUID` (PK, `gen_random_uuid()`) | `CHAR(36)` | `@PrimaryGeneratedColumn('uuid')` | MySQL has no native UUID type. `CHAR(36)` keeps ids human-readable and lets you migrate data verbatim. `BINARY(16)` is 2.25× smaller and indexes better but requires conversion on every read/write — **recommend `CHAR(36)` for a faithful, low-risk migration.** |
| `TIMESTAMPTZ` | `DATETIME(6)` | `@CreateDateColumn({ type:'datetime', precision:6 })` | **MySQL `DATETIME` has no timezone.** Store UTC everywhere; set `timezone: 'Z'` in the TypeORM MySQL driver config and normalise on import. Do not use `TIMESTAMP` (2038 limit + implicit TZ conversion). |
| `NUMERIC(10,2)` | `DECIMAL(10,2)` | `@Column('decimal',{precision:10,scale:2,transformer})` | **TypeORM returns MySQL `DECIMAL` as a `string`.** Without a `ColumnNumericTransformer`, `Number(p.price)` silently works in some places and string-concatenates in others. This is a classic, high-impact migration bug — add the transformer on every money column. |
| `NUMERIC(2,1)` (`rating`) | `DECIMAL(2,1)` | same | |
| `TEXT` | `TEXT` / `VARCHAR(n)` | `@Column('varchar',{length})` | Prefer `VARCHAR` where a sane bound exists (`slug`, `sku`, `name`, `status`) so it can be indexed without a prefix length. MySQL cannot index a full `TEXT` column — `UNIQUE` on `TEXT` requires a prefix. **`slug`, `sku`, `name` must become `VARCHAR`** to preserve their UNIQUE constraints. |
| `TEXT[]` (`sizes`) | **no equivalent** | see below | |
| `JSONB` (`colors`) | `JSON` | `@Column('json')` | MySQL `JSON` is fine for storage; it cannot be indexed directly (use a generated column if ever needed). Not needed here — `colors` is only read. |
| `BOOLEAN` | `TINYINT(1)` | `@Column('boolean')` | Handled transparently by TypeORM. |
| `INTEGER` | `INT` | `@Column('int')` | |
| enum `app_role` | `ENUM(...)` or `VARCHAR(20)` | `@Column({type:'enum', enum: Role})` | Recommend a TS enum + MySQL `ENUM`. **Drop `moderator` and `user`** — migration `...225038` already emptied them. |
| `CHECK (rating BETWEEN 1 AND 5)` | `CHECK` (MySQL ≥ 8.0.16) | `@Check()` | Supported, but also enforce in the DTO (`@Min(1) @Max(5)`) since MySQL check enforcement is a relatively recent addition. |

#### 6.3.2 The `sizes TEXT[]` problem

`products.sizes` is a Postgres text array (`['38','39',...]`). MySQL has no array type. Three options:

| Option | Shape | Pros | Cons | Recommendation |
|---|---|---|---|---|
| **A. JSON column** | `sizes JSON` | 1:1 with the current API shape; zero frontend change; trivial migration | Cannot filter/index by size | **Recommended** if size-based filtering is never needed (it isn't today) |
| **B. Join table** | `product_sizes(product_id, size)` | Queryable, indexable, extensible to per-size stock | Schema + API change; more work | Choose this if per-size inventory is on the roadmap |
| **C. Delimited string** | `VARCHAR` `'38,39,40'` | simplest | Worst of both; fragile | Not recommended |

> **Strategic note:** the cart is keyed by `(productId, size, color)` and `order_items` stores `size`/`color` per line,
> but `products.stock` is a single scalar. Real sneaker retail needs per-size stock. If per-size inventory is ever
> wanted, Option B is the entry point — but it is **out of scope for a like-for-like migration**, and this document
> does not assume it.

#### 6.3.3 Structural changes required by the migration

1. **`auth.users` must become an application table.** Create `users(id, email UNIQUE, password_hash, email_verified_at, created_at, updated_at)` in the application database. Every FK that currently points at `auth.users(id)` (`profiles`, `orders`, `reviews`, `wishlists`, `user_roles`) repoints at `users(id)`.
2. **`profiles` may be merged into `users`** — its PK *is* the user id (1:1). Keeping them separate preserves the current shape and makes the data import a direct copy; merging is cleaner. **Recommend keeping them separate** for migration fidelity, and revisiting later.
3. **`gen_random_uuid()` defaults disappear.** IDs are generated by TypeORM (`@PrimaryGeneratedColumn('uuid')`) in the application.
4. **`now()` defaults** become `@CreateDateColumn` / `@UpdateDateColumn`. This *fixes* the existing bug where `profiles.updated_at` and `orders.updated_at` are never maintained.
5. **All indexes must be recreated explicitly** as `@Index()` decorators — TypeORM does not infer the 9 existing indexes.
6. **Partial-index equivalents:** none are used (all four product indexes are plain B-trees), so nothing is lost.
7. **Charset/collation:** use `utf8mb4` / `utf8mb4_unicode_ci` (the product names contain Italian accents and the UI uses typographic characters).
8. **`synchronize: false` in production, always.** Use TypeORM migrations; the whole schema should be captured in an initial migration rather than auto-synced.

#### 6.3.4 Data migration plan

1. **Export from Supabase.** `pg_dump --data-only --schema=public` plus a separate export of `auth.users`
   (`id, email, encrypted_password, raw_user_meta_data, created_at, email_confirmed_at`). *The repository does not
   contain product/category seed data — this export is mandatory.*
2. **Transform.**
   - `sizes`: Postgres array literal `{38,39}` → JSON array `["38","39"]`.
   - `colors`: JSONB → JSON (usually a straight copy; verify it is an array of `{name,hex}`).
   - Timestamps: convert `TIMESTAMPTZ` → UTC `DATETIME(6)`.
   - Booleans: `t`/`f` → `1`/`0`.
   - UUIDs: keep as-is if using `CHAR(36)`.
3. **Password hashes.** Supabase GoTrue stores bcrypt hashes (`$2a$`/`$2b$`). **These are portable** — if the new backend
   uses `bcrypt` with the same cost, existing users keep their passwords. If you choose `argon2`, you must either keep a
   bcrypt verification path for legacy hashes and re-hash on next successful login, or force a global password reset.
   **Decide this before the cutover** — it is the difference between a silent migration and emailing every customer.
4. **Load order (FK-safe):** `users` → `profiles` → `user_roles` → `categories` → `products` → `product_images` →
   `orders` → `order_items` → `reviews` → `wishlists`.
5. **Verify.** Row counts per table; spot-check `products.rating`/`review_count` against a recomputation from `reviews`;
   confirm every `product_images.product_id` resolves; confirm at least one `admin` row survives in `user_roles`.
6. **Image files.** Download the `product-images` bucket contents and re-host (see §7).

---

## 7. Storage Analysis

### 7.1 Current state

- **One bucket:** `product-images`, created `public = true` (migration `...222051`).
- **One policy:** `"Public read access for product images"` — `FOR SELECT USING (bucket_id = 'product-images')`
  (migration `...222059`). **There is no INSERT/UPDATE/DELETE policy**, so nothing can write to the bucket through
  the anon or authenticated role — uploads must have been done via the Supabase dashboard or a service key.
- **Zero Storage SDK usage in the application.** No `supabase.storage.from(...)`, no `.upload()`, no `.getPublicUrl()`.
- Image URLs are stored as **absolute strings** in `product_images.url`, hardcoded to
  `https://xnvtkbaqjdojuotqdfvu.supabase.co/storage/v1/object/public/product-images/<file>.jpg`
  (45 such rows in migration `...224725`).
- The admin UI accepts image URLs **as pasted text** (`AdminProducts.tsx:119-129`) — there is no file picker.
- Local `src/assets/products/*.jpg` contains **60 bundled images** matching the same names (15 products × 4 views).
  These are Vite-bundled assets and are *not* what the app displays — the app displays the Supabase URLs. They are,
  however, a usable source for re-hosting.

### 7.2 Required in NestJS

| Requirement | Detail |
|---|---|
| **File storage service** | Abstract behind a `StorageService` interface with a local-disk implementation for dev and S3-compatible (AWS S3 / Cloudflare R2 / MinIO) for production. |
| **Upload endpoint** | `POST /admin/products/:id/images` (multipart) using `@nestjs/platform-express` + `FileInterceptor`. Admin-only. Closes **G-10**. |
| **Validation** | MIME allowlist (`image/jpeg`, `image/png`, `image/webp`), max size (e.g. 5 MB), magic-byte sniffing (never trust the client's `Content-Type`), randomised filenames (never use the client's filename). |
| **Serving** | Public read. Either static serving from the API (`ServeStaticModule`) or, preferably, a CDN/object-store public URL so the API is not in the image path. |
| **Delete** | `DELETE /admin/products/:id/images/:imageId` — must remove both the DB row and the underlying object. |
| **URL storage strategy** | **Decision required:** keep storing absolute URLs (simple, matches today, but bakes the host into the data and makes future moves painful) vs. storing a relative key and composing the URL at read time (recommended). |
| **Data migration** | Download all 45 objects from the Supabase bucket; re-upload to the new store; **rewrite all `product_images.url` values**. The 45 URLs in migration `...224725` are the known set, but the live table may contain more — export it, do not rely on the migration file. |
| **Legacy risk** | Until URLs are rewritten, the app keeps loading images from the old Supabase project. **If that project is deleted, every product image breaks.** Rewrite URLs *before* decommissioning Supabase. |

---

## 8. Realtime Features

**None. Verified by exhaustive search** for `.channel(`, `realtime`, `.subscribe(`, `postgres_changes` across `src/**`.
The only `unsubscribe()` in the codebase (`AuthContext.tsx:36`) belongs to the **auth state listener**, not to Realtime.

**Implication for the migration:** no WebSocket gateway is required for parity. React Query's `invalidateQueries` +
`staleTime` is the entire freshness strategy today.

**Optional future work (explicitly not required):** if live order-status updates or an admin live dashboard are ever
wanted, a `@WebSocketGateway` with Socket.IO and room-per-user / room-for-admins would be the natural fit. Do not build
it during the migration.

---

## 9. RPC / Functions / Triggers

### 9.1 `has_role(_user_id UUID, _role app_role) → BOOLEAN`
`LANGUAGE sql`, `STABLE`, `SECURITY DEFINER`, `SET search_path = public`.
Returns `EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role)`.

- **Called from:** `useAdmin.ts:12`, `Login.tsx:80`, and from **14 RLS policies**.
- `SECURITY DEFINER` exists specifically to break RLS recursion on `user_roles`.
- **NestJS replacement:** `roles[]` claim inside the JWT, checked by `RolesGuard`. Eliminates a network round-trip and
  the 10-minute staleness window that `useAdminCheck` currently has. **Note the trade-off:** a role revoked mid-session
  stays effective until the access token expires — keep access tokens short-lived, or check the DB on admin routes.

### 9.2 `get_admin_stats() → JSON`
`LANGUAGE plpgsql`, `SECURITY DEFINER`. Raises `Access denied` unless the caller is an admin. Returns:

| Key | Query |
|---|---|
| `total_products` | `COUNT(*) FROM products WHERE is_active = true` |
| `total_orders` | `COUNT(*) FROM orders` |
| `total_revenue` | `COALESCE(SUM(total),0) FROM orders WHERE payment_status = 'paid'` |
| `total_customers` | `COUNT(*) FROM profiles` |
| `low_stock_products` | `COUNT(*) FROM products WHERE stock <= 10 AND is_active = true` |
| `pending_orders` | `COUNT(*) FROM orders WHERE status = 'pending'` |
| `recent_orders` | `SELECT id, status, total, shipping_name, created_at FROM orders ORDER BY created_at DESC LIMIT 10` as a JSON array |

> Because nothing ever sets `payment_status = 'paid'` (G-01, G-15), **`total_revenue` is structurally always 0** today.

- **NestJS replacement:** `AdminStatsService.getStats()` behind `@Roles('admin')`, exposed as `GET /admin/stats`,
  returning the **same JSON keys** so `AdminDashboard.tsx` is untouched. The `<= 10` threshold should come from config.

### 9.3 `handle_new_user()` — trigger `on_auth_user_created` AFTER INSERT ON `auth.users`
Inserts `profiles(id, full_name)` from `NEW.raw_user_meta_data->>'full_name'`.
- **NestJS replacement:** inside `AuthService.register()`, in the same transaction as user creation. Do **not** use a
  TypeORM subscriber for this — an explicit transactional service method is clearer and testable.

### 9.4 `assign_customer_role()` — trigger `on_auth_user_created_assign_role` AFTER INSERT ON `auth.users`
Inserts `user_roles(user_id,'customer')` with `ON CONFLICT DO NOTHING`.
- **NestJS replacement:** same transaction as above.

### 9.5 `update_product_rating()` — trigger `on_review_change` AFTER INSERT OR UPDATE OR DELETE ON `reviews`
Recomputes, for the affected `product_id`:
`rating = ROUND(AVG(rating),1)` (0 if none), `review_count = COUNT(*)`, `updated_at = now()`.
Uses `COALESCE(NEW.product_id, OLD.product_id)` so it works for all three operations.

- **NestJS replacement — two viable approaches:**
  - **(a) Explicit service call (recommended).** `ReviewsService` calls `productsService.recalculateRating(productId)`
    after every create/update/delete, inside the same transaction. Explicit, debuggable, testable.
  - **(b) TypeORM `EntitySubscriber`** with `afterInsert`/`afterUpdate`/`afterRemove` on `Review`. Closer to the
    original trigger semantics, but hidden control flow and awkward transaction/manager handling.
- ⚠️ **A subtle behavioural difference:** the Postgres trigger fires for *any* writer, including a DBA running raw SQL.
  Application-level logic only fires for writes that go through the service. If anything ever writes reviews outside
  the API, ratings silently drift. Consider a periodic reconciliation job if that is a real risk.
- Note the recomputation must also run on **product delete** in reverse: today `ON DELETE CASCADE` from products to
  reviews means the product is gone anyway, so this is moot.

### 9.6 `check_verified_purchase()` — trigger `on_review_insert_check_purchase` BEFORE INSERT ON `reviews`
Sets `NEW.is_verified_purchase := EXISTS (order_items JOIN orders WHERE orders.user_id = NEW.user_id AND
order_items.product_id = NEW.product_id AND orders.status IN ('completed','delivered'))`.

- **NestJS replacement:** computed in `ReviewsService.create()` **server-side only** — the client must never be able to
  set this flag (it is a trust signal shown with a "Verified" badge in `AdminReviews.tsx:32-34`).
- ⚠️ **Status vocabulary conflict:** this function checks for `'completed'`, but `AdminOrders.tsx` offers no such status
  (it offers `delivered`). The new backend must settle on one enum. Recommended:
  `pending | confirmed | processing | shipped | delivered | cancelled`, with "verified purchase" meaning `delivered`.
- Note the trigger is **BEFORE INSERT only** — it does not re-evaluate on UPDATE. Preserve that (a review's verified
  status is decided at creation) or deliberately improve it, but do so consciously.

### 9.7 Summary table

| Object | Type | Fires on | NestJS replacement |
|---|---|---|---|
| `has_role` | RPC (sql, SECURITY DEFINER) | on call | JWT `roles` claim + `RolesGuard` |
| `get_admin_stats` | RPC (plpgsql, SECURITY DEFINER) | on call | `GET /admin/stats` + `AdminStatsService` |
| `handle_new_user` | trigger fn | `auth.users` AFTER INSERT | `AuthService.register()` transaction |
| `assign_customer_role` | trigger fn | `auth.users` AFTER INSERT | `AuthService.register()` transaction |
| `update_product_rating` | trigger fn | `reviews` AFTER I/U/D | `ProductsService.recalculateRating()` |
| `check_verified_purchase` | trigger fn | `reviews` BEFORE INSERT | `ReviewsService.create()` |

---

## 10. RLS Policies

All 9 tables have `ENABLE ROW LEVEL SECURITY`. Full policy inventory, with its NestJS equivalent:

### `profiles`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Users can view own profile | SELECT | `auth.uid() = id` | `GET /profile/me` → `req.user.id` |
| Users can update own profile | UPDATE | `auth.uid() = id` | `PATCH /profile/me` → `req.user.id` |
| Users can insert own profile | INSERT | `auth.uid() = id` | created by `AuthService.register()`; no public endpoint |
| Admins can view all profiles | SELECT | `has_role(auth.uid(),'admin')` | `GET /admin/customers` + `@Roles('admin')` |
| *(none)* | DELETE | — | no delete path; cascades from user deletion |

### `categories`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Categories are publicly readable | SELECT | `true` | `GET /categories` — public |
| Admins can insert/update/delete categories | I/U/D | `has_role(...,'admin')` | `@Roles('admin')` on `/admin/categories` |

### `products`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Products are publicly readable | SELECT | `true` | `GET /products` — **note: this exposes inactive products too.** Recommend the public endpoint filter `is_active = true` and inactive products be admin-only. |
| Admins can insert/update/delete products | I/U/D | `has_role(...,'admin')` | `@Roles('admin')` on `/admin/products` |

### `product_images`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Product images are publicly readable | SELECT | `true` | embedded in product responses |
| Admins can insert/update/delete product images | I/U/D | `has_role(...,'admin')` | `@Roles('admin')` |

### `orders`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Users can view own orders | SELECT | `auth.uid() = user_id` | `GET /orders/me`, `GET /orders/:id` + ownership check |
| Users can insert own orders | INSERT | `auth.uid() = user_id` | `POST /orders` — `user_id` from JWT, **never from the body** |
| Admins can view all orders | SELECT | `has_role(...,'admin')` | `GET /admin/orders` |
| Admins can update orders | UPDATE | `has_role(...,'admin')` | `PATCH /admin/orders/:id/status` |
| *(none)* | DELETE | — | orders are never deletable — **preserve this** |

### `order_items`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Users can view own order items | SELECT | `EXISTS(orders WHERE orders.id = order_id AND orders.user_id = auth.uid())` | ownership check via the parent order |
| Users can insert own order items | INSERT | same EXISTS check | created only inside `OrdersService.create()` |
| Admins can view all order items | SELECT | `has_role(...,'admin')` | `@Roles('admin')` |
| *(none)* | UPDATE/DELETE | — | immutable line items — **preserve this** |

### `reviews`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Reviews are publicly readable | SELECT | `true` | `GET /products/:id/reviews` — public |
| Authenticated users can insert reviews | INSERT | `auth.uid() = user_id` | `POST /reviews` — `user_id` from JWT |
| Users can update own reviews | UPDATE | `auth.uid() = user_id` | `PATCH /reviews/:id` + ownership |
| Users can delete own reviews | DELETE | `auth.uid() = user_id` | `DELETE /reviews/:id` + ownership |
| Admins can update reviews | UPDATE | `has_role(...,'admin')` | `@Roles('admin')` |
| Admins can delete reviews | DELETE | `has_role(...,'admin')` | `DELETE /admin/reviews/:id` |

### `wishlists`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Users can view own wishlist | SELECT | `auth.uid() = user_id` | `GET /wishlist` |
| Users can insert own wishlist | INSERT | `auth.uid() = user_id` | `POST /wishlist/:productId` |
| Users can delete own wishlist | DELETE | `auth.uid() = user_id` | `DELETE /wishlist/:productId` |
| *(none)* | UPDATE | — | not needed (no mutable fields) |

### `user_roles`
| Policy | Op | Predicate | NestJS equivalent |
|---|---|---|---|
| Admins can view all roles | SELECT | `has_role(auth.uid(),'admin')` | `GET /admin/users/:id/roles` |
| **(none)** | **INSERT / UPDATE / DELETE** | — | ⚠️ **No policy exists.** Roles are writable *only* by the signup trigger (which runs `SECURITY DEFINER`) or a service-role key. The new backend must add a deliberate, admin-only, audited role-assignment endpoint (**G-12**) — and must be careful not to accidentally make it broader than the current (effectively zero) surface. |

### Cross-cutting notes

1. **RLS is the only authorization layer today.** Once the browser stops talking to Postgres directly, every one of
   these 34 policies must exist as server-side code. Missing one = a privilege-escalation bug.
2. **The `true` SELECT policies are the trap.** `products`, `product_images`, `categories`, and `reviews` are readable
   by anyone — including product rows with `is_active = false`. Reproduce this deliberately, not accidentally.
3. **Defence in depth is now yours.** Postgres would refuse a mis-scoped query even if the application had a bug.
   MySQL will happily return whatever you ask for. Compensate with: ownership helpers used uniformly, integration tests
   per policy row above, and DTO response serialisation (`class-transformer` `@Exclude()` on `password_hash`).

---

## 11. Supabase → NestJS Mapping

### 11.1 Capability mapping

| Supabase capability | Used in this project | NestJS + TypeORM + MySQL replacement |
|---|---|---|
| `auth.signUp` | ✅ | `POST /auth/register` — `AuthService` + argon2/bcrypt + transactional profile & role creation |
| `auth.signInWithPassword` | ✅ | `POST /auth/login` — validate hash, issue access + refresh JWT |
| `auth.signOut` | ✅ | `POST /auth/logout` — revoke refresh token (server-side revocation, which Supabase abstracted) |
| `auth.getSession` / `getUser` | ✅ | `GET /auth/me` + `JwtStrategy.validate()` |
| `auth.onAuthStateChange` | ✅ | Client-side only: an axios/fetch interceptor + a React context holding the token |
| `auth.resetPasswordForEmail` | ✅ | `POST /auth/forgot-password` + `MailService` + hashed, expiring reset token |
| `auth.updateUser({password})` | ✅ | `POST /auth/reset-password` and `PATCH /auth/password` |
| Auto token refresh | ✅ | `POST /auth/refresh` + client interceptor retry-on-401 |
| Session in `localStorage` | ✅ | Token storage strategy — **decide: localStorage vs. httpOnly cookie** |
| Supabase transactional email | ✅ (implicit) | **New external dependency** — Nodemailer + SMTP/SendGrid/Resend + templates |
| PostgREST `.from().select()` | ✅ | TypeORM `Repository` / `QueryBuilder` in services, exposed as REST controllers |
| PostgREST embedded selects (`products(...)`) | ✅ (6 places) | TypeORM `relations` / `leftJoinAndSelect` |
| PostgREST `.eq()`, `.order()`, `.single()` | ✅ | `where`, `order`, `findOneOrFail` |
| `.insert().select().single()` | ✅ | `repository.save()` returns the entity with its generated id |
| `rpc('has_role')` | ✅ | JWT `roles` claim + `RolesGuard` |
| `rpc('get_admin_stats')` | ✅ | `GET /admin/stats` + `AdminStatsService` |
| RLS (34 policies) | ✅ | `JwtAuthGuard` + `RolesGuard` + explicit ownership checks in services |
| `SECURITY DEFINER` functions | ✅ | ordinary service methods (privilege is now implicit in the trusted server) |
| Triggers on `auth.users` | ✅ | transactional logic in `AuthService.register()` |
| Triggers on `reviews` | ✅ | `ReviewsService` + `ProductsService.recalculateRating()` (or a TypeORM `EntitySubscriber`) |
| `gen_random_uuid()` default | ✅ | `@PrimaryGeneratedColumn('uuid')` |
| `now()` defaults | ✅ | `@CreateDateColumn` / `@UpdateDateColumn` |
| Postgres `CHECK` constraints | ✅ (1) | `@Check()` + `class-validator` `@Min/@Max` |
| Postgres enum type | ✅ (1) | TS enum + MySQL `ENUM` |
| Postgres `TEXT[]` | ✅ (1) | MySQL `JSON` column (or join table) |
| Postgres `JSONB` | ✅ (1) | MySQL `JSON` |
| Storage bucket + public read | ⚠️ indirect | `StorageService` (local disk / S3-compatible) + upload endpoint + static or CDN serving |
| Realtime | ❌ | not required |
| Edge Functions | ❌ | not required |
| Auto-generated TS types | ✅ | replaced by shared DTO types (or generate a client from an OpenAPI spec via `@nestjs/swagger`) |
| Built-in rate limiting | ✅ (implicit) | `@nestjs/throttler` — **a responsibility that is new and easy to forget** |
| Connection pooling | ✅ (implicit) | TypeORM pool config; consider ProxySQL only if needed |
| Managed backups | ✅ (implicit) | **New operational responsibility** — automated `mysqldump`/snapshot schedule |

### 11.2 What you *gain* from the migration

- Real server-side business logic (order creation, stock decrement, price authority) that is impossible to express safely in a browser-only architecture.
- Prices and totals can no longer be tampered with by the client.
- Real transactions spanning multiple tables.
- Server-side pagination and filtering instead of downloading the whole catalogue.
- Real logout / token revocation.
- Testable, versioned business rules.

### 11.3 What you *lose* and must rebuild

- RLS as a database-level safety net (the single biggest loss — 34 policies become application code).
- Managed auth: email delivery, token lifecycle, rate limiting, password hashing, email confirmation flows.
- Auto-generated, always-accurate TypeScript types for the schema.
- Managed backups, connection pooling, and infrastructure operation.

---

## 12. Proposed NestJS Modules

> Derived strictly from the features and tables found in the codebase. Nothing below is speculative except where marked
> *(optional / closes GAP)*.

### 12.1 `AuthModule`
- **Purpose:** identity, credentials, tokens, password lifecycle.
- **Related features:** F-01 … F-08.
- **Entities:** `User`, `RefreshToken` *(new)*, `PasswordResetToken` *(new)*, `EmailVerificationToken` *(new)*.
- **Relationships:** `User` 1:1 `Profile`; `User` 1:N `UserRole`; `User` 1:N `RefreshToken`.
- **Endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`, `PATCH /auth/password`.
- **AuthN:** public except `/auth/me`, `/auth/logout`, `/auth/password`.
- **AuthZ:** none beyond authentication.
- **Business logic:** hash + verify passwords; transactionally create `User` + `Profile` + `UserRole('customer')`; issue/rotate/revoke tokens; generate single-use expiring reset tokens (store the hash); enforce email uniqueness with a clean 409.
- **Validation:** `@IsEmail`, password min length 8 (match `Register.tsx:87`; consider strengthening to match the strength meter's intent), `fullName` non-empty.
- **External deps:** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `argon2`/`bcrypt`, `@nestjs/throttler`, `MailModule`.

### 12.2 `UsersModule` / `ProfilesModule`
- **Purpose:** user profile data and the admin customer list.
- **Related features:** F-22; closes **G-06**.
- **Entities:** `User`, `Profile`.
- **Endpoints:** `GET /profile/me`, `PATCH /profile/me`, `GET /admin/customers`, `GET /admin/customers/:id`.
- **AuthZ:** self for `/profile/me`; `@Roles('admin')` for `/admin/customers`.
- **Business logic:** `country` defaults to `'IT'`; `@UpdateDateColumn` fixes the never-updated `updated_at`.
- **Validation:** all address fields optional strings with sane max lengths; phone format if enforced.

### 12.3 `RolesModule` (or fold into `AuthModule`)
- **Purpose:** role assignment and inspection.
- **Related features:** F-07, F-08; closes **G-12**.
- **Entities:** `UserRole`.
- **Endpoints:** `GET /admin/users/:id/roles`, `POST /admin/users/:id/roles`, `DELETE /admin/users/:id/roles/:role`.
- **AuthZ:** `@Roles('admin')` throughout.
- **Business logic:** unique `(user_id, role)`; **must not allow an admin to remove their own last admin role** (lockout guard); audit log recommended.
- **Note:** a bootstrap path is required to create the very first admin — a seed script or CLI command, not an endpoint.

### 12.4 `CategoriesModule`
- **Purpose:** product taxonomy.
- **Related features:** F-11, F-18, F-19; closes **G-11**.
- **Entities:** `Category`.
- **Relationships:** `Category` 1:N `Product`.
- **Endpoints:** `GET /categories` (public), `POST/PATCH/DELETE /admin/categories[/:id]`.
- **AuthZ:** public read; `@Roles('admin')` for writes.
- **Business logic:** server-side slugification; unique `name` + `slug`; on delete, `product.category_id` → `NULL` (preserve `ON DELETE SET NULL`).
- **Validation:** `name` required + unique, `slug` URL-safe, `description` optional.

### 12.5 `ProductsModule`
- **Purpose:** catalogue — the core read path of the storefront.
- **Related features:** F-09, F-10, F-14 … F-17, F-25, F-28 … F-31.
- **Entities:** `Product`, `ProductImage`.
- **Relationships:** `Product` N:1 `Category`; `Product` 1:N `ProductImage`; `Product` 1:N `Review`; `Product` 1:N `WishlistItem`; `Product` 1:N `OrderItem` (RESTRICT).
- **Endpoints:**
  - `GET /products` (public, filters/sort/pagination), `GET /products/:slug` (public),
  - `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`,
  - `POST /admin/products/:id/images`, `DELETE /admin/products/:id/images/:imageId`,
  - `GET /admin/inventory`.
- **AuthZ:** public read of active products; `@Roles('admin')` for everything else and for inactive products.
- **Business logic:** unique slug/SKU with clean 409s; product + images saved in **one transaction**; `recalculateRating(productId)` (replacing the trigger); `DELETE` must surface a 409 when `order_items` reference the product; `is_active` filtering on the public endpoint.
- **Validation:** `price > 0`; `discountPrice < price` when present; `stock >= 0`; `sizes: string[]`; `colors: { name, hex }[]` with hex-format validation (replaces the raw `JSON.parse` in `AdminProducts.tsx:142`); `rating` and `reviewCount` must be **read-only from the API's perspective** — never settable by a client.
- **External deps:** `StorageModule`.

### 12.6 `CartModule` *(optional — closes nothing today)*
- **Purpose:** server-side cart persistence.
- **Current state:** the cart is entirely client-side (Redux + localStorage) and works for guests.
- **Recommendation:** **do not build this during the migration.** It is not a Supabase dependency and adds scope. Revisit only if cross-device cart sync is a requirement; the checkout endpoint accepts the cart as a request payload either way.

### 12.7 `OrdersModule` — *the highest-priority new module*
- **Purpose:** order placement, order history, order fulfilment.
- **Related features:** F-20, F-21; closes **G-01, G-02, G-05, G-13, G-14**.
- **Entities:** `Order`, `OrderItem`.
- **Relationships:** `Order` N:1 `User`; `Order` 1:N `OrderItem`; `OrderItem` N:1 `Product` (RESTRICT); `Order` 1:N `Review` (SET NULL).
- **Endpoints:** `POST /orders`, `GET /orders/me`, `GET /orders/:id`, `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`.
- **AuthZ:** authenticated + ownership for customer routes; `@Roles('admin')` for admin routes. **No delete endpoint** — matching the absence of a DELETE policy today.
- **Business logic (see §16.1 for the full algorithm):** server-authoritative pricing, stock validation and atomic decrement, price snapshotting into `order_items`, shipping-rule computation, transactional insert, status state machine.
- **Validation:** non-empty items; `quantity >= 1`; `productId` must exist and be active; shipping address fields required; **reject any client-supplied price, subtotal, or total outright.**

### 12.8 `ReviewsModule`
- **Purpose:** product reviews and ratings.
- **Related features:** F-23, F-24; closes **G-03, G-04**.
- **Entities:** `Review`.
- **Relationships:** `Review` N:1 `User`; N:1 `Product`; N:1 `Order` (nullable, SET NULL).
- **Endpoints:** `GET /products/:productId/reviews` (public), `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id`, `GET /admin/reviews`, `DELETE /admin/reviews/:id`.
- **AuthZ:** public read; authenticated + ownership for write; admin can update/delete any.
- **Business logic:** one review per `(user, product)` → 409 on duplicate; `is_verified_purchase` computed server-side at creation (replacing `check_verified_purchase`) and **never accepted from the client**; `ProductsService.recalculateRating()` after every mutation, in the same transaction.
- **Validation:** `rating` integer 1–5 (mirrors the DB `CHECK`); `title`/`body` optional with length caps.

### 12.9 `WishlistModule`
- **Purpose:** saved products per user.
- **Related features:** F-12.
- **Entities:** `WishlistItem`.
- **Endpoints:** `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId` (and optionally `POST /wishlist/:productId/toggle`).
- **AuthZ:** authenticated; always scoped to `req.user.id`.
- **Business logic:** unique `(user, product)`; idempotent add; product must exist.

### 12.10 `AdminStatsModule` (or `DashboardModule`)
- **Purpose:** dashboard KPIs.
- **Related features:** F-13.
- **Entities:** none of its own — reads `Product`, `Order`, `Profile`.
- **Endpoints:** `GET /admin/stats` (returning exactly the `get_admin_stats` JSON shape).
- **AuthZ:** `@Roles('admin')`.
- **Business logic:** the 7 aggregations in §9.2; configurable low-stock threshold.

### 12.11 `AnalyticsModule` *(optional — closes G-07)*
- **Purpose:** make the currently-fake charts real.
- **Endpoints:** `GET /admin/analytics/revenue?period=`, `GET /admin/analytics/sales-by-category`, `GET /admin/analytics/orders-vs-customers`.
- **AuthZ:** `@Roles('admin')`.
- **Note:** this is **new functionality, not a migration requirement.** The current page is hardcoded mock data. Build it only if the charts must become real — and note it is meaningless until `OrdersModule` is producing actual orders.

### 12.12 `StorageModule`
- **Purpose:** file upload/serving for product images.
- **Related features:** replaces the Supabase bucket; closes **G-10**.
- **Endpoints:** used by `ProductsModule`; optionally `GET /uploads/*` for local-disk serving.
- **Business logic:** MIME + magic-byte validation, size cap, randomised keys, delete-object-on-row-delete.
- **External deps:** `multer` (via `@nestjs/platform-express`), optionally `@aws-sdk/client-s3`, optionally `sharp` for resizing.

### 12.13 `MailModule`
- **Purpose:** transactional email — a capability Supabase supplied for free.
- **Related features:** F-05, F-06; supports order confirmations and G-09.
- **Templates needed:** email verification, password reset, (recommended) order confirmation, (optional) contact-form relay.
- **External deps:** `@nestjs-modules/mailer` + Nodemailer + an SMTP provider (SendGrid / Resend / Postmark / SES).

### 12.14 `ContactModule` *(optional — closes G-09)*
- **Purpose:** make the contact form actually do something.
- **Entities:** `ContactMessage` *(new table — does not exist today)*.
- **Endpoints:** `POST /contact` (public, throttled + captcha recommended), `GET /admin/contact-messages`.
- **Note:** **new functionality.** The current form is a no-op.

### 12.15 `SettingsModule` *(optional — closes G-08)*
- **Purpose:** make store settings configurable rather than hardcoded.
- **Entities:** `StoreSetting` *(new key/value table)*.
- **Endpoints:** `GET /settings` (public subset), `PATCH /admin/settings`.
- **Note:** **new functionality.** Today `AdminSettings.tsx` is static JSX. A natural home for the shipping threshold (€500), shipping cost (€15), low-stock threshold (10), currency, and tax rate — all of which are currently hardcoded constants scattered across the codebase.

### 12.16 Cross-cutting infrastructure (not feature modules)
`ConfigModule` (validated env via Joi/zod), `DatabaseModule` (TypeORM), global `ValidationPipe` (`whitelist: true,
forbidNonWhitelisted: true, transform: true`), global exception filter, `@nestjs/throttler`, `helmet`, CORS restricted
to the frontend origin, `@nestjs/swagger`, structured logging with request ids, and a `/health` endpoint.

---

## 13. Proposed TypeORM Entities

> Shapes only — intended as a specification, not as final code. Money columns all need a numeric transformer (§6.3.1).

### 13.1 Entity list

| Entity | Table | Origin |
|---|---|---|
| `User` | `users` | **new** — replaces Supabase `auth.users` |
| `Profile` | `profiles` | existing |
| `UserRole` | `user_roles` | existing |
| `Category` | `categories` | existing |
| `Product` | `products` | existing |
| `ProductImage` | `product_images` | existing |
| `Order` | `orders` | existing |
| `OrderItem` | `order_items` | existing |
| `Review` | `reviews` | existing |
| `WishlistItem` | `wishlists` | existing |
| `RefreshToken` | `refresh_tokens` | **new** — Supabase managed this |
| `PasswordResetToken` | `password_reset_tokens` | **new** — Supabase managed this |
| `EmailVerificationToken` | `email_verification_tokens` | **new** — Supabase managed this |
| `ContactMessage` | `contact_messages` | **new, optional** (G-09) |
| `StoreSetting` | `store_settings` | **new, optional** (G-08) |

### 13.2 Field specifications

**`User`** *(new)* — `id` uuid PK · `email` varchar(255) unique · `passwordHash` varchar(255) *(excluded from all responses)* · `emailVerifiedAt` datetime null · `createdAt` · `updatedAt`
→ 1:1 `Profile` (cascade), 1:N `UserRole`, 1:N `Order`, 1:N `Review`, 1:N `WishlistItem`, 1:N `RefreshToken`

**`Profile`** — `userId` uuid PK & FK → `users.id` (CASCADE) · `fullName` varchar(255) null · `avatarUrl` varchar(500) null · `phone` varchar(50) null · `addressLine1`/`addressLine2` varchar(255) null · `city`/`state` varchar(100) null · `postalCode` varchar(20) null · `country` varchar(2) default `'IT'` · `createdAt` · `updatedAt`

**`UserRole`** — `id` uuid PK · `userId` uuid FK (CASCADE) · `role` enum(`admin`,`customer`) · `createdAt` · **unique (`userId`,`role`)**

**`Category`** — `id` uuid PK · `name` varchar(100) unique · `slug` varchar(120) unique · `description` text null · `imageUrl` varchar(500) null · `createdAt` → 1:N `Product`

**`Product`** — `id` uuid PK · `name` varchar(200) · `slug` varchar(220) unique (indexed) · `description` text null · `brand` varchar(100) default `'Silvaine'` · `sku` varchar(64) unique null · `categoryId` uuid FK null (SET NULL, indexed) · `price` decimal(10,2) (indexed) · `discountPrice` decimal(10,2) null · `stock` int default 0 · `sizes` json (`string[]`) · `colors` json (`{name,hex}[]`) · `rating` decimal(2,1) default 0 *(derived)* · `reviewCount` int default 0 *(derived)* · `isNew`/`isBestSeller`/`isTrending` bool default false · `isActive` bool default true (indexed) · `createdAt` · `updatedAt`

**`ProductImage`** — `id` uuid PK · `productId` uuid FK (CASCADE, indexed) · `url` varchar(500) · `altText` varchar(255) null · `sortOrder` int default 0 · `createdAt`

**`Order`** — `id` uuid PK · `userId` uuid FK (CASCADE, indexed) · `status` enum(`pending`,`confirmed`,`processing`,`shipped`,`delivered`,`cancelled`) default `pending` (indexed) · `subtotal`/`shippingCost`/`tax`/`total` decimal(10,2) default 0 · `shippingName` varchar(255) null · `shippingAddress` varchar(500) null · `shippingCity` varchar(100) null · `shippingPostalCode` varchar(20) null · `shippingCountry` varchar(100) null · `shippingPhone` varchar(50) null ⚠️ **new column — `Checkout.tsx` collects a phone with nowhere to store it** · `paymentMethod` varchar(50) null · `paymentStatus` enum(`pending`,`paid`,`failed`,`refunded`) default `pending` · `notes` text null · `createdAt` · `updatedAt` → 1:N `OrderItem` (cascade)

**`OrderItem`** — `id` uuid PK · `orderId` uuid FK (CASCADE, indexed) · `productId` uuid FK (**RESTRICT**) · `productName` varchar(200) *(snapshot)* · `productImage` varchar(500) null *(snapshot)* · `size` varchar(20) null · `color` varchar(50) null · `quantity` int default 1 · `unitPrice` decimal(10,2) · `totalPrice` decimal(10,2) · `createdAt`

**`Review`** — `id` uuid PK · `userId` uuid FK (CASCADE, indexed) · `productId` uuid FK (CASCADE, indexed) · `orderId` uuid FK null (SET NULL) · `rating` int `@Check('rating BETWEEN 1 AND 5')` · `title` varchar(200) null · `body` text null · `isVerifiedPurchase` bool default false *(server-computed)* · `createdAt` · `updatedAt` · **unique (`userId`,`productId`)**

**`WishlistItem`** — `id` uuid PK · `userId` uuid FK (CASCADE, indexed) · `productId` uuid FK (CASCADE) · `createdAt` · **unique (`userId`,`productId`)**

**`RefreshToken`** *(new)* — `id` uuid PK · `userId` uuid FK (CASCADE) · `tokenHash` varchar(255) · `expiresAt` datetime · `revokedAt` datetime null · `createdAt`

**`PasswordResetToken`** *(new)* — `id` uuid PK · `userId` uuid FK (CASCADE) · `tokenHash` varchar(255) · `expiresAt` datetime · `usedAt` datetime null · `createdAt`

**`EmailVerificationToken`** *(new)* — same shape as above.

### 13.3 Required indexes (recreating the 9 Postgres indexes + new ones)

Existing, must be preserved: `products(category_id)`, `products(slug)`, `products(price)`, `products(is_active)`,
`product_images(product_id)`, `orders(user_id)`, `orders(status)`, `order_items(order_id)`, `reviews(product_id)`,
`reviews(user_id)`, `wishlists(user_id)`.

Recommended additions: `users(email)` unique, `refresh_tokens(token_hash)`, `orders(created_at)` (the admin list and
`recent_orders` both sort by it), `products(created_at)` (the storefront's default sort).

---

## 14. Entity Relationships

```
                        ┌──────────────┐
                        │    User      │  (replaces Supabase auth.users)
                        └──────┬───────┘
         ┌────────────┬────────┼─────────┬──────────────┬──────────────┐
         │ 1:1        │ 1:N    │ 1:N     │ 1:N          │ 1:N          │
   ┌─────▼─────┐ ┌────▼─────┐ ┌▼───────┐ ┌▼──────────┐ ┌▼────────────┐
   │  Profile  │ │ UserRole │ │ Order  │ │  Review   │ │WishlistItem │
   └───────────┘ └──────────┘ └───┬────┘ └─────┬─────┘ └──────┬──────┘
                                  │ 1:N        │ N:1          │ N:1
                            ┌─────▼──────┐     │              │
                            │ OrderItem  │     │              │
                            └─────┬──────┘     │              │
                                  │ N:1        │              │
                                  │  (RESTRICT)│              │
                   ┌──────────────▼────────────▼──────────────▼───┐
                   │                  Product                     │
                   └───────────┬──────────────────────┬───────────┘
                     N:1       │                      │ 1:N
                (SET NULL)     │                      │ (CASCADE)
                   ┌───────────▼──────┐     ┌─────────▼─────────┐
                   │     Category     │     │   ProductImage    │
                   └──────────────────┘     └───────────────────┘

   Order ──1:N (SET NULL)──► Review.orderId   (a review may cite the order it came from)
```

### Referential-integrity rules to preserve exactly

| Relationship | ON DELETE | Consequence |
|---|---|---|
| `Profile.userId → User` | CASCADE | deleting a user removes the profile |
| `UserRole.userId → User` | CASCADE | roles vanish with the user |
| `Order.userId → User` | CASCADE | ⚠️ **deleting a user destroys their order history.** This is the current behaviour, but it is bad practice for a commerce system (accounting/audit). **Recommend switching to `RESTRICT` + soft-delete on `User`** — flag this as a deliberate improvement, not an accident. |
| `OrderItem.orderId → Order` | CASCADE | line items die with the order |
| `OrderItem.productId → Product` | **RESTRICT** | a product that has ever been ordered **cannot be deleted** — this is why `product_name`/`product_image` are snapshotted. **Preserve strictly.** |
| `Product.categoryId → Category` | SET NULL | deleting a category orphans products to "Uncategorized" |
| `ProductImage.productId → Product` | CASCADE | images die with the product |
| `Review.userId → User` | CASCADE | ⚠️ deleting a user deletes their reviews — and **must trigger a rating recalculation** on every affected product. The Postgres trigger handled this automatically; the NestJS version must do it explicitly. |
| `Review.productId → Product` | CASCADE | reviews die with the product |
| `Review.orderId → Order` | SET NULL | review survives order deletion |
| `WishlistItem.userId → User` | CASCADE | |
| `WishlistItem.productId → Product` | CASCADE | |

### Uniqueness constraints
`users.email` · `categories.name` · `categories.slug` · `products.slug` · `products.sku` ·
`reviews(user_id, product_id)` · `wishlists(user_id, product_id)` · `user_roles(user_id, role)`

---

## 15. API Requirements

Suggested global prefix `/api/v1`. `A` = authenticated, `Admin` = `@Roles('admin')`, `P` = public.

### Auth
| Method | Path | Guard | Purpose | Replaces |
|---|---|---|---|---|
| POST | `/auth/register` | P | create account | `auth.signUp` + 2 triggers |
| POST | `/auth/login` | P | issue tokens | `auth.signInWithPassword` |
| POST | `/auth/refresh` | P (refresh token) | rotate access token | SDK auto-refresh |
| POST | `/auth/logout` | A | revoke refresh token | `auth.signOut` |
| GET | `/auth/me` | A | user + profile + roles | `getSession`/`getUser` + `rpc('has_role')` |
| POST | `/auth/forgot-password` | P | send reset email | `auth.resetPasswordForEmail` |
| POST | `/auth/reset-password` | P (reset token) | set new password | `auth.updateUser` |
| PATCH | `/auth/password` | A | change password while signed in | — |
| POST | `/auth/verify-email` | P | confirm address | Supabase built-in |

### Catalogue (public)
| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/products` | P | query: `category`, `minPrice`, `maxPrice`, `sort` (`newest`\|`price-asc`\|`price-desc`\|`popularity`\|`rating` — mirroring `Shop.tsx:32`), `page`, `limit`, `search`. Must return the flattened product shape. Filters `isActive = true`. |
| GET | `/products/:slug` | P | 404 when absent |
| GET | `/products/:productId/reviews` | P | closes G-04 |
| GET | `/categories` | P | ordered by name |

### Customer
| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/profile/me` | A | closes G-06 |
| PATCH | `/profile/me` | A | |
| GET | `/wishlist` | A | returns product ids (or full products) |
| POST | `/wishlist/:productId` | A | idempotent |
| DELETE | `/wishlist/:productId` | A | |
| POST | `/orders` | A | **the critical new endpoint** — closes G-01/G-02/G-13 |
| GET | `/orders/me` | A | closes G-05 |
| GET | `/orders/:id` | A + owner | |
| POST | `/reviews` | A | closes G-03 |
| PATCH | `/reviews/:id` | A + owner | |
| DELETE | `/reviews/:id` | A + owner | |

### Admin
| Method | Path | Guard | Replaces |
|---|---|---|---|
| GET | `/admin/stats` | Admin | `rpc('get_admin_stats')` |
| GET | `/admin/products` | Admin | `useAdminProducts` |
| POST | `/admin/products` | Admin | `AdminProducts.handleSave` (insert) |
| PATCH | `/admin/products/:id` | Admin | `AdminProducts.handleSave` (update) |
| DELETE | `/admin/products/:id` | Admin | `AdminProducts.handleDelete` |
| POST | `/admin/products/:id/images` | Admin | closes G-10 |
| DELETE | `/admin/products/:id/images/:imageId` | Admin | |
| GET | `/admin/inventory` | Admin | `AdminInventory` (currently client-derived) |
| GET | `/admin/categories` | Admin | |
| POST | `/admin/categories` | Admin | `AdminCategories.handleAdd` |
| PATCH | `/admin/categories/:id` | Admin | closes G-11 |
| DELETE | `/admin/categories/:id` | Admin | `AdminCategories.handleDelete` |
| GET | `/admin/orders` | Admin | `useAdminOrders` (add server-side paging) |
| GET | `/admin/orders/:id` | Admin | |
| PATCH | `/admin/orders/:id/status` | Admin | `AdminOrders.updateStatus` |
| GET | `/admin/customers` | Admin | `useAdminCustomers` |
| GET | `/admin/reviews` | Admin | `useAdminReviews` |
| DELETE | `/admin/reviews/:id` | Admin | `AdminReviews.handleDelete` |
| GET | `/admin/users/:id/roles` | Admin | closes G-12 |
| POST | `/admin/users/:id/roles` | Admin | closes G-12 |
| DELETE | `/admin/users/:id/roles/:role` | Admin | closes G-12 |
| GET | `/admin/analytics/*` | Admin | *optional* — closes G-07 |
| GET/PATCH | `/admin/settings` | Admin | *optional* — closes G-08 |

### Cross-cutting API conventions
- Consistent error envelope (NestJS default `{ statusCode, message, error }` is fine — just be consistent).
- `400` validation (with field-level detail), `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict (duplicate slug/SKU/email/review, delete-blocked-by-FK), `422` business-rule violation (insufficient stock), `429` throttled.
- Paginated responses: `{ data: T[], meta: { page, limit, total, totalPages } }`.
- **Never serialise `passwordHash`, token hashes, or other users' data** — enforce with `class-transformer` `@Exclude()` + a global `ClassSerializerInterceptor`.
- Publish an OpenAPI spec via `@nestjs/swagger` (this replaces the lost `types.ts` codegen).

---

## 16. Business Logic Requirements

### 16.1 Order placement — `POST /orders` (entirely new; closes G-01, G-02, G-13)

```
BEGIN TRANSACTION
  1. userId ← req.user.id                       (never from the body)
  2. items must be non-empty
  3. FOR EACH item:
       product ← SELECT * FROM products WHERE id = :productId FOR UPDATE   ← row lock
       assert product exists         else 404
       assert product.isActive       else 422
       assert product.stock >= qty   else 422  "Insufficient stock for <name>"
       unitPrice  ← product.discountPrice ?? product.price      ← SERVER-OWNED
       totalPrice ← unitPrice * quantity
  4. subtotal     ← Σ totalPrice
     shippingCost ← subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST   (500 / 15)
     tax          ← computed per the tax rule (currently 0 — see G-14)
     total        ← subtotal + shippingCost + tax
  5. INSERT orders { userId, status:'pending', paymentStatus:'pending',
                     subtotal, shippingCost, tax, total, shipping*, paymentMethod, notes }
  6. INSERT order_items[] with productName / productImage SNAPSHOTTED from the product row
  7. UPDATE products SET stock = stock - qty  FOR EACH item
  8. (optional) UPDATE profiles with the shipping address for reuse next time
COMMIT
  9. (optional) send order-confirmation email  ← OUTSIDE the transaction
 10. RETURN the created order (real id — replaces the fabricated SLV-xxxx)
```

**Non-negotiables:**
- Prices come from the database. A client-supplied price must be ignored or rejected — today the browser computes the
  total, which is only harmless because nothing is persisted.
- Stock must be decremented under a row lock, or two concurrent buyers can oversell the last pair.
- `productName` / `productImage` must be snapshotted; the schema is deliberately denormalised for this.
- Shipping constants (€15 / €500) must live in **one** server-side config value, not duplicated across
  `Cart.tsx`, `Checkout.tsx`, and the backend.

### 16.2 Order status transitions (F-21)
Allowed vocabulary: `pending → confirmed → processing → shipped → delivered`, with `cancelled` reachable from any
non-terminal state. `delivered` and `cancelled` are terminal. Reject invalid transitions with 422.
**Cancellation must restore stock** (a rule that does not exist today because orders do not exist today).
Unify the `completed` vs. `delivered` inconsistency identified in §9.6.

### 16.3 Review creation (closes G-03)
1. Reject if the user already reviewed that product → 409 (mirrors `UNIQUE(user_id, product_id)`).
2. Compute `isVerifiedPurchase` server-side: does any `delivered` order by this user contain this product?
3. Persist, then recalculate the product's `rating` (avg, 1 dp) and `reviewCount` in the same transaction.
4. Same recalculation on update and delete, and on cascade-delete of a user.

### 16.4 Product rating denormalisation
`products.rating` and `products.review_count` are derived values. They must be **read-only in every DTO** and
recalculated only by `ProductsService.recalculateRating()`. A reconciliation job is advisable if writes can ever
bypass the API.

### 16.5 Shipping rule (F-27)
`shipping = subtotal >= 500 ? 0 : 15` (EUR). Currently duplicated in `Cart.tsx:19-20` and `Checkout.tsx:17-18`.
Must become server-authoritative, with the client displaying a preview only. Ideally expose it via
`GET /settings` so the storefront and server never disagree.

### 16.6 Low-stock threshold
`stock <= 10` appears in `ProductStockIndicator.tsx:8`, `AdminInventory.tsx:11`, and `get_admin_stats`.
Consolidate to one configured value.

### 16.7 Slug generation
Currently client-side: `name.toLowerCase().replace(/\s+/g,'-')` (`AdminProducts.tsx:134`, `AdminCategories.tsx:22`).
This does not strip accents or punctuation — a product named "Città Nera!" produces the slug `città-nera!`.
Move server-side with proper transliteration and a uniqueness suffix on collision.

### 16.8 Password policy
Enforced today: `length >= 8` only. The strength meter (uppercase / number / special char) is purely visual.
**Decide** whether the backend enforces the stronger policy — if it does, the frontend copy must change, and
existing users' passwords remain valid regardless.

### 16.9 Product activation
`is_active` exists, is indexed, and filters the storefront query — but **no admin UI can toggle it.** The backend
should expose it on the product update DTO so the field becomes usable.

---

## 17. Migration Considerations

### 17.1 Sequencing and risk

| Consideration | Detail |
|---|---|
| **Data export is mandatory and time-sensitive** | Products, categories, and users exist **only in the live Supabase project** — the repo has no seed migration for them. Export before anything else. |
| **Password hash portability** | Supabase uses bcrypt. Using bcrypt in NestJS means a silent migration; using argon2 means either a dual-verify + rehash-on-login path or a forced global reset. **Decide early** (§6.3.3 step 3). |
| **Image URLs are absolute and point at Supabase** | All `product_images.url` values embed `xnvtkbaqjdojuotqdfvu.supabase.co`. They must be rewritten **before** the Supabase project is deleted, or every image 404s. |
| **Frontend rewrite is substantial** | `@supabase/supabase-js` must be removed and replaced with an HTTP client (axios/fetch + interceptors). Affected: `client.ts`, `types.ts` (deleted), `AuthContext.tsx`, `useProducts.ts`, `useAdmin.ts`, `useWishlist.ts`, and 5 admin pages. React Query keys and the component tree can stay as they are. |
| **`mapProduct` coupling** | `useProducts.ts:49-69` maps snake_case + nested rows to camelCase. If the API returns the already-flattened shape, the mapper is deleted; if it returns entities verbatim, the mapper stays. **Pick one and be consistent** — this decision affects every component. |
| **Cutover strategy** | A strangler approach (backend proxying to Supabase, migrating endpoint-by-endpoint) is possible but complicated by RLS. Given the app's size, a **single-shot cutover with a maintenance window** is simpler and recommended. |
| **Rollback plan** | Keep the Supabase project running and read-only for at least one full billing cycle after cutover. Do not delete it until images are re-hosted and verified. |
| **No existing test coverage** | `src/test/example.test.ts` is `expect(true).toBe(true)`. There is **no safety net** for this migration. Integration tests for the 34 authorization rules in §10 are strongly advised — they are the rules most likely to be silently dropped. |

### 17.2 Technical gotchas

1. **TypeORM returns `DECIMAL` as a string** — add a numeric transformer to every money column or totals will concatenate.
2. **MySQL `DATETIME` has no timezone** — normalise everything to UTC at the boundary.
3. **MySQL cannot `UNIQUE` a `TEXT` column** — `slug`, `sku`, `name`, `email` must be `VARCHAR`.
4. **MySQL max index key length** — with `utf8mb4`, a `VARCHAR(255)` unique index is 1020 bytes; fine under InnoDB's 3072-byte limit, but avoid `VARCHAR(1000)` unique columns.
5. **`ON DELETE RESTRICT` from `order_items`** will start rejecting product deletions that currently "work" (only because no orders exist). Surface it as a clear 409.
6. **Postgres `NUMERIC` → MySQL `DECIMAL` rounding** differences are negligible at scale 2, but verify totals after import.
7. **`synchronize: true` is a foot-gun** — never enable it against the migrated data.
8. **CORS + cookies** — if you choose httpOnly refresh cookies, `credentials: true` plus an exact-origin CORS allowlist is required (a wildcard origin silently breaks cookies).
9. **`.env` is currently committed to the repository** (see §20). Do not repeat that with database credentials and JWT secrets.

### 17.3 Changes the migration forces on the frontend

| File | Change |
|---|---|
| `src/integrations/supabase/client.ts` | **Delete.** Replace with an `apiClient` (axios instance + auth interceptor + 401-refresh-retry). |
| `src/integrations/supabase/types.ts` | **Delete.** Replace with DTO types (hand-written or OpenAPI-generated). |
| `src/contexts/AuthContext.tsx` | Rewrite all 7 methods against `/auth/*`; manage token storage and refresh manually. |
| `src/hooks/useProducts.ts` | Swap PostgREST calls for `GET /products`; possibly delete `mapProduct`. |
| `src/hooks/useAdmin.ts` | Swap all 6 queries; `useAdminCheck` reads the role from `/auth/me` instead of an RPC. |
| `src/hooks/useWishlist.ts` | Swap 3 calls for the wishlist endpoints. |
| `src/pages/Login.tsx` | Remove the direct `getUser` + `has_role` calls; read roles from the login response. |
| `src/pages/ResetPassword.tsx` | Token moves from URL **hash** to query param. |
| `src/pages/Checkout.tsx` | **Rewrite** — actually `POST /orders` and use the returned id. |
| `src/pages/OrderSuccess.tsx` | Read from the API by order id instead of `location.state` (survives refresh). |
| `src/pages/admin/AdminProducts.tsx` | Swap 5 calls for `/admin/products*`; surface real errors instead of `console.error`. |
| `src/pages/admin/AdminOrders.tsx` | Swap for `PATCH /admin/orders/:id/status`. |
| `src/pages/admin/AdminCategories.tsx` | Swap for `/admin/categories`. |
| `src/pages/admin/AdminReviews.tsx` | Swap for `DELETE /admin/reviews/:id`. |
| `package.json` | Remove `@supabase/supabase-js`; add an HTTP client. |
| `.env` | Replace `VITE_SUPABASE_*` with `VITE_API_BASE_URL`. |
| `supabase/` | Retain as historical reference, or archive. |

---

## 18. External Services / Integrations

### 18.1 Present today

| Service | Purpose | Status after migration |
|---|---|---|
| **Supabase** (project `xnvtkbaqjdojuotqdfvu`) | Auth, database, storage | **Removed** |
| **Supabase transactional email** | Signup confirmation, password reset | **Must be replaced** |
| **Lovable** (`lovable-tagger`, README, `lovable.app` URL in `ProductDetail.tsx:266` JSON-LD) | Dev tooling / hosting origin | Dev-only; the hardcoded canonical URL should be moved to config |
| **Google Fonts** (Cormorant Garamond, Montserrat) | Typography | Unaffected |

### 18.2 Notably absent

- **No payment gateway.** No Stripe, PayPal, or any other. `OrderSuccess.tsx:33` hardcodes "Cash on Delivery" and `orders.payment_method` is never set. If real payments are needed, that is a new project, not part of this migration.
- **No shipping/logistics integration.**
- **No analytics or error tracking** (no GA, Sentry, PostHog).
- **No CDN configuration.**
- **No CI/CD pipeline** in the repository.

### 18.3 Newly required

| Need | Why | Options |
|---|---|---|
| **SMTP / email API** | Supabase handled verification and reset emails | SendGrid, Resend, Postmark, AWS SES, Mailgun |
| **Object storage** | Replace the Supabase bucket | AWS S3, Cloudflare R2, MinIO, or local disk for dev |
| **MySQL 8 hosting** | Replace managed Postgres | PlanetScale, AWS RDS, DigitalOcean, self-hosted |
| **Node hosting for the API** | New tier that did not exist | Railway, Render, Fly.io, AWS ECS, VPS |
| **Backups** | Supabase did this | Scheduled `mysqldump` / provider snapshots |
| **Secrets management** | JWT secret, DB password, SMTP key | Provider secret store or `.env` **excluded from git** |
| *(recommended)* Error tracking | No safety net exists today | Sentry |

---

## 19. Environment Variables

### 19.1 Current (`.env`, committed to the repo)

```
VITE_SUPABASE_PROJECT_ID="xnvtkbaqjdojuotqdfvu"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci...<anon JWT>"
VITE_SUPABASE_URL="https://xnvtkbaqjdojuotqdfvu.supabase.co"
```

Consumed only in `src/integrations/supabase/client.ts` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
`VITE_SUPABASE_PROJECT_ID` is declared but unused by the application code.

⚠️ **`.env` is not listed in `.gitignore` and is tracked by git.** The anon key is designed to be public (RLS is the
protection), so this is not an immediate breach — but the habit must not carry forward. **Add `.env` to `.gitignore`
before the backend introduces real secrets.**

### 19.2 Frontend, after migration

```
VITE_API_BASE_URL=https://api.silvaine.example/api/v1
```

### 19.3 Backend, required

```
# Runtime
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
CORS_ORIGINS=https://silvaine.example

# Database
DB_HOST=            DB_PORT=3306
DB_USERNAME=        DB_PASSWORD=
DB_DATABASE=silvaine
DB_SYNCHRONIZE=false          # never true outside local dev
DB_LOGGING=false
DB_TIMEZONE=Z

# JWT
JWT_ACCESS_SECRET=            JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=           JWT_REFRESH_EXPIRES_IN=7d

# Password hashing
BCRYPT_ROUNDS=12              # or ARGON2_* if argon2 is chosen

# Mail
MAIL_HOST=  MAIL_PORT=  MAIL_USER=  MAIL_PASSWORD=
MAIL_FROM="Silvaine <no-reply@silvaine.example>"
FRONTEND_URL=https://silvaine.example     # for links in emails

# Storage
STORAGE_DRIVER=s3             # local | s3
STORAGE_LOCAL_PATH=./uploads
S3_ENDPOINT=  S3_REGION=  S3_BUCKET=  S3_ACCESS_KEY_ID=  S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=https://cdn.silvaine.example

# Business rules (today hardcoded in the frontend)
SHIPPING_COST=15
FREE_SHIPPING_THRESHOLD=500
LOW_STOCK_THRESHOLD=10
TAX_RATE=0
DEFAULT_CURRENCY=EUR
DEFAULT_COUNTRY=IT

# Security
THROTTLE_TTL=60
THROTTLE_LIMIT=100
PASSWORD_RESET_TOKEN_TTL=3600
```

All of these should be validated at boot with a Joi/zod schema in `ConfigModule` so a missing secret fails fast.

---

## 20. Risks and Important Considerations

### 20.1 High severity

| # | Risk | Detail | Mitigation |
|---|---|---|---|
| R-01 | **Losing an RLS rule becomes a data breach** | 34 policies are the whole authorization model. Each must be re-implemented by hand. One missed ownership check on `GET /orders/:id` exposes every customer's orders. | Use §10 as a literal checklist. Write one integration test per policy row. Centralise ownership checks in a shared helper. |
| R-02 | **Order creation is new, unproven code in the money path** | G-01 means there is no existing implementation to port — the highest-value flow is being written from scratch with no test coverage to inherit. | Build it first, test it hardest. Concurrency test the stock decrement. Never trust client prices. |
| R-03 | **Production data exists only in Supabase** | No seed migration for products/categories/users. If the project lapses or is deleted, the catalogue is gone. | Export and version-control a data dump **before** any other work. |
| R-04 | **Password hash strategy can force a global password reset** | Choosing argon2 without a bcrypt fallback locks out every existing user. | Decide early; prefer bcrypt-compatible verification with rehash-on-login. |
| R-05 | **Image URLs break when Supabase is decommissioned** | 45+ absolute URLs point at the Supabase bucket. | Re-host and rewrite URLs before deleting the project; verify with a link check. |
| R-06 | **Zero test coverage today** | One trivial placeholder test. A migration of this size without tests is high-variance. | Add integration tests for auth, authorization, and order creation at minimum. |

### 20.2 Medium severity

| # | Risk | Detail |
|---|---|---|
| R-07 | **Status vocabulary is inconsistent** | `AdminOrders` offers 6 statuses; `check_verified_purchase` looks for `completed`; the column has no constraint. Unify before writing the state machine, or verified-purchase detection will silently never match. |
| R-08 | **`total_revenue` is structurally always 0** | `get_admin_stats` sums orders with `payment_status = 'paid'`; nothing sets it. Stakeholders may not realise the dashboard number is meaningless. |
| R-09 | **Token storage choice** | `localStorage` matches today's behaviour and is XSS-exposed; httpOnly cookies are safer but require CORS/CSRF work. Make it a deliberate decision, not a default. |
| R-10 | **No rate limiting after migration** | Supabase rate-limited auth endpoints implicitly. Without `@nestjs/throttler`, `/auth/login` is a free credential-stuffing target. |
| R-11 | **Client-side everything does not scale** | `GET /products` fetches the entire catalogue; admin lists fetch every row then filter in the browser. Fine at 15 products; broken at 1,500. |
| R-12 | **Two UI libraries in one app** | MUI and shadcn/Tailwind coexist (`AdminProducts` is shadcn, every other admin page is MUI). Not a migration blocker, but it doubles the surface for any UI change during the rewrite. |
| R-13 | **`colors` is edited as raw JSON in a textarea** | `JSON.parse` on user input, with the failure caught only by `console.error` — the admin sees a silently failed save. Server-side DTO validation fixes this. |
| R-14 | **Deleting a user destroys their orders** (`ON DELETE CASCADE`) | Bad for accounting and audit. Consider `RESTRICT` + soft delete. |
| R-15 | **No first-admin bootstrap path** | `user_roles` has no write policy; the existing admin was created out-of-band. The new backend needs an explicit seed/CLI path or nobody can reach `/admin`. |

### 20.3 Low severity / cleanup

| # | Item |
|---|---|
| R-16 | `.env` is committed and `.gitignore` lacks it. |
| R-17 | Dead files: `src/pages/Index.tsx` (unrouted), `src/data/products.ts` (unimported, 136 lines of stale seed data). |
| R-18 | `react-hook-form` + `zod` + `@hookform/resolvers` are dependencies but unused — every form is manual `useState`. Either adopt them during the rewrite or drop them. |
| R-19 | Hardcoded canonical URL `silvaine-sneaker-boutique.lovable.app` inside JSON-LD (`ProductDetail.tsx:266`). |
| R-20 | `public/sitemap.xml` is static and omits product URLs. |
| R-21 | `Checkout.tsx:48-51` calls `navigate()` during render when the cart is empty — a React anti-pattern that will warn; worth fixing during the rewrite. |
| R-22 | `fetchProductBySlug` returns `null` on *any* error, conflating "not found" with "network/server failure". |
| R-23 | `orders` has no `shipping_phone` column although checkout collects a phone number. |
| R-24 | `categories.image_url` and `orders.notes` exist but are never used by the UI. |

---

## 21. Recommended Migration Sequence

### Phase 0 — Preserve and decide (before writing any backend code)
1. Export all data from Supabase (`public` schema + `auth.users` + the storage bucket). Commit a sanitised dump.
2. Add `.env` to `.gitignore`.
3. Make and record the open decisions: bcrypt vs. argon2 · token storage · `sizes` as JSON vs. join table ·
   `profiles` merged into `users` or kept separate · flattened DTO vs. raw entity responses · order status enum ·
   which optional modules (Analytics, Contact, Settings) are in scope.

### Phase 1 — Foundation
4. Scaffold the NestJS project: `ConfigModule` (validated), `DatabaseModule`, global `ValidationPipe`, exception filter, Swagger, `/health`, helmet, CORS, throttler.
5. Write all entities (§13) and generate the **initial TypeORM migration** covering the full schema + all indexes.
6. Write the data-import script (Postgres dump → MySQL), including the `TEXT[]` → JSON and timestamp conversions. Run it against a staging database and verify row counts.

### Phase 2 — Auth (unblocks everything else)
7. `AuthModule`: register, login, refresh, logout, me — including the transactional `User` + `Profile` + `UserRole` creation that replaces the two signup triggers.
8. `JwtAuthGuard`, `RolesGuard`, `@Roles()`, `@CurrentUser()`, and the shared ownership helper.
9. `MailModule` + forgot/reset password + email verification.
10. A seed/CLI command to create the first admin (closes the bootstrap gap, R-15).
11. **Integration tests for every rule in §10 for `profiles` and `user_roles`.**

### Phase 3 — Read-only catalogue (lowest risk, highest visibility)
12. `CategoriesModule` + `ProductsModule` read paths (`GET /products`, `GET /products/:slug`, `GET /categories`) with server-side filtering, sorting, and pagination.
13. **Frontend:** swap `useProducts` / `useCategories` to the new API. The storefront now runs on NestJS while everything else still runs on Supabase — a natural checkpoint.

### Phase 4 — Customer features
14. `ProfilesModule` (`/profile/me`) — closes G-06.
15. `WishlistModule` — port F-12.
16. **Frontend:** swap `AuthContext` and `useWishlist`.

### Phase 5 — Orders (the critical path)
17. `OrdersModule`: `POST /orders` with the full §16.1 algorithm, `GET /orders/me`, `GET /orders/:id`.
18. Status state machine + admin order endpoints.
19. **Frontend:** rewrite `Checkout` to actually place an order; rewrite `OrderSuccess` to read by id; add an order-history page (G-05).
20. **Concurrency-test the stock decrement.**

### Phase 6 — Reviews
21. `ReviewsModule` with server-computed `isVerifiedPurchase` and rating recalculation (replacing both review triggers).
22. **Frontend:** add review display on the product page (G-04) and a submission form (G-03).

### Phase 7 — Admin
23. Admin product/category/image CRUD + `StorageModule` with real uploads (G-10, G-11).
24. `AdminStatsModule` (`GET /admin/stats` matching the RPC's JSON shape exactly).
25. Admin customers, reviews, inventory, and role management (G-12).
26. **Frontend:** swap all 5 admin pages.

### Phase 8 — Cutover
27. Re-host all images and **rewrite `product_images.url`**.
28. Final data export → import with a maintenance window.
29. Smoke-test every route in §1.4 against production.
30. Remove `@supabase/supabase-js`; delete `src/integrations/supabase/*`; remove the `VITE_SUPABASE_*` variables.
31. Keep the Supabase project alive (read-only) as a rollback path for at least one billing cycle.

### Phase 9 — Optional / post-migration
32. Analytics endpoints (G-07), settings persistence (G-08), contact form (G-09), tax rules (G-14), payment integration (G-15).

---

## 22. Final Backend Requirements Checklist

### Infrastructure
- [ ] NestJS project with validated `ConfigModule` (all §19.3 variables, fail-fast at boot)
- [ ] TypeORM + MySQL 8, `utf8mb4_unicode_ci`, `synchronize: false`, UTC timezone
- [ ] Initial migration covering all 15 entities + all indexes from §13.3
- [ ] Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)
- [ ] Global exception filter + consistent error envelope
- [ ] `ClassSerializerInterceptor` + `@Exclude()` on `passwordHash` and all token hashes
- [ ] `@nestjs/throttler` on auth endpoints
- [ ] `helmet`, exact-origin CORS
- [ ] `@nestjs/swagger` OpenAPI spec
- [ ] `/health` endpoint
- [ ] Numeric transformer on every `decimal` column

### Data migration
- [ ] Full Supabase export (public schema + `auth.users` + storage bucket)
- [ ] Transform script: `TEXT[]` → JSON, `JSONB` → JSON, `TIMESTAMPTZ` → UTC `DATETIME(6)`, booleans, UUIDs
- [ ] Password hash strategy decided and implemented
- [ ] FK-safe import order verified
- [ ] Row-count + spot-check verification
- [ ] Images re-hosted and **all `product_images.url` values rewritten**
- [ ] At least one `admin` role row confirmed present post-import

### Authentication (replacing Supabase Auth — 8 call sites)
- [ ] `POST /auth/register` — transactional `User` + `Profile` + `UserRole('customer')`
- [ ] `POST /auth/login` — access + refresh tokens
- [ ] `POST /auth/refresh` — rotating refresh tokens
- [ ] `POST /auth/logout` — server-side revocation
- [ ] `GET /auth/me` — user + profile + roles
- [ ] `POST /auth/forgot-password` — hashed, expiring, single-use token + email
- [ ] `POST /auth/reset-password`
- [ ] `PATCH /auth/password`
- [ ] `POST /auth/verify-email`
- [ ] Password hashing (bcrypt/argon2), min length 8

### Authorization (replacing 34 RLS policies)
- [ ] `JwtAuthGuard` with `roles[]` in the JWT claim
- [ ] `RolesGuard` + `@Roles()` on **every** `/admin/*` route
- [ ] `@CurrentUser()` decorator; `userId` **never** read from a request body for owned resources
- [ ] Ownership checks on orders, order items, reviews, wishlist, profile
- [ ] Public read on products/categories/images/reviews — matching the `USING (true)` policies
- [ ] `is_active` filtering on the public product endpoint (deliberate improvement over the current policy)
- [ ] Integration test per policy row in §10

### Business logic (replacing 6 database functions)
- [ ] `handle_new_user` → transactional profile creation in `AuthService.register()`
- [ ] `assign_customer_role` → transactional role assignment in `AuthService.register()`
- [ ] `update_product_rating` → `ProductsService.recalculateRating()` on every review mutation
- [ ] `check_verified_purchase` → server-computed `isVerifiedPurchase` at review creation
- [ ] `has_role` → JWT claim + `RolesGuard`
- [ ] `get_admin_stats` → `GET /admin/stats` with the identical JSON shape

### New business logic (closing the GAPs)
- [ ] **`POST /orders`** — server-authoritative pricing, stock validation, atomic decrement with row locks, price/name/image snapshotting, transactional insert (G-01, G-02, G-13)
- [ ] Order status state machine + stock restoration on cancellation
- [ ] `GET /orders/me` + `GET /orders/:id` (G-05)
- [ ] Customer review create/update/delete (G-03)
- [ ] Public product reviews endpoint (G-04)
- [ ] Profile read/update (G-06)
- [ ] Product image upload (G-10)
- [ ] Category update (G-11)
- [ ] Admin role assignment + first-admin bootstrap (G-12)
- [ ] Shipping rule (€15 / free ≥ €500) server-authoritative, single source of truth
- [ ] Low-stock threshold (10) configurable, single source of truth
- [ ] Server-side slug generation with transliteration and collision handling

### Endpoints (see §15 for the full table)
- [ ] 9 auth · 4 public catalogue · 10 customer · 22 admin

### Storage
- [ ] `StorageService` abstraction (local + S3-compatible)
- [ ] Upload with MIME allowlist, magic-byte check, size cap, randomised keys
- [ ] Delete removes both DB row and object
- [ ] Public serving via CDN or static route

### Email
- [ ] `MailModule` + provider configured
- [ ] Templates: email verification, password reset, (recommended) order confirmation

### Frontend rewrite
- [ ] `apiClient` with auth interceptor + 401-refresh-retry
- [ ] `AuthContext` rewritten against `/auth/*`
- [ ] `useProducts`, `useAdmin`, `useWishlist` rewritten
- [ ] `Checkout` actually places an order; `OrderSuccess` reads by id
- [ ] Reset-password token moves from URL hash to query param
- [ ] 5 admin pages rewritten, with real error surfacing (no more silent `console.error`)
- [ ] `@supabase/supabase-js` removed; `src/integrations/supabase/*` deleted
- [ ] `.env` switched to `VITE_API_BASE_URL` and added to `.gitignore`

### Verification
- [ ] Every route in §1.4 smoke-tested against the new backend
- [ ] Authorization tests: a customer cannot read another customer's orders, wishlist, or profile; a customer cannot reach any `/admin/*` route
- [ ] Concurrency test: two simultaneous orders for the last unit in stock
- [ ] Price-tampering test: a client-supplied price in `POST /orders` is ignored
- [ ] All product images load from the new host
- [ ] Rollback path confirmed (Supabase project retained, read-only)

---

## Appendix A — File-to-Backend-Concern Index

| File | Backend concern |
|---|---|
| `src/integrations/supabase/client.ts` | Client config → delete |
| `src/integrations/supabase/types.ts` | Schema snapshot → replaced by DTOs |
| `src/contexts/AuthContext.tsx` | AuthModule (7 methods) |
| `src/hooks/useAdmin.ts` | AdminStats, Products, Orders, Customers, Reviews |
| `src/hooks/useProducts.ts` | Products, Categories |
| `src/hooks/useWishlist.ts` | Wishlist |
| `src/components/AdminRoute.tsx` | RolesGuard (client mirror) |
| `src/components/ProtectedRoute.tsx` | JwtAuthGuard (client mirror) |
| `src/components/Header.tsx` | `/auth/me` for user email + admin flag |
| `src/pages/Login.tsx` | `POST /auth/login` + roles in response |
| `src/pages/Register.tsx` | `POST /auth/register` |
| `src/pages/ResetPassword.tsx` | `POST /auth/reset-password` |
| `src/pages/Shop.tsx` | `GET /products` with filters/sort/pagination |
| `src/pages/ProductDetail.tsx` | `GET /products/:slug`, reviews, wishlist |
| `src/pages/Cart.tsx` | shipping rule (display only) |
| `src/pages/Checkout.tsx` | **`POST /orders`** |
| `src/pages/OrderSuccess.tsx` | `GET /orders/:id` |
| `src/pages/Contact.tsx` | *optional* `POST /contact` |
| `src/redux/slices/cartSlice.ts` | cart payload shape for `POST /orders` |
| `src/pages/admin/AdminDashboard.tsx` | `GET /admin/stats` |
| `src/pages/admin/AdminProducts.tsx` | product + image CRUD |
| `src/pages/admin/AdminOrders.tsx` | order list + status update |
| `src/pages/admin/AdminCategories.tsx` | category CRUD |
| `src/pages/admin/AdminCustomers.tsx` | `GET /admin/customers` |
| `src/pages/admin/AdminReviews.tsx` | review list + delete |
| `src/pages/admin/AdminInventory.tsx` | stock overview |
| `src/pages/admin/AdminAnalytics.tsx` | *optional* analytics (currently mock) |
| `src/pages/admin/AdminSettings.tsx` | *optional* settings (currently static) |
| `supabase/migrations/*.sql` | authoritative source schema |

## Appendix B — Open Decisions Requiring a Human Answer

1. **Password hashing:** bcrypt (seamless migration) or argon2 (stronger, needs a fallback or a forced reset)?
2. **Token storage:** `localStorage` (matches today) or httpOnly refresh cookie (safer)?
3. **`sizes`:** JSON column (1:1 with today) or a join table (enables per-size stock later)?
4. **`profiles`:** keep as a separate 1:1 table (faithful) or merge into `users` (cleaner)?
5. **API response shape:** flattened/camelCase (delete `mapProduct`) or raw entities (keep it)?
6. **Order status enum:** confirm `pending | confirmed | processing | shipped | delivered | cancelled`, and that "verified purchase" means `delivered`.
7. **Tax:** is `orders.tax` in scope (Italian VAT?) or permanently 0?
8. **Inactive products:** should the public endpoint hide them (recommended) or keep the current `USING (true)` behaviour?
9. **User deletion:** keep `CASCADE` (destroys order history) or move to `RESTRICT` + soft delete?
10. **Scope:** are the optional modules — Analytics (G-07), Settings (G-08), Contact (G-09), Payments (G-15) — in or out?
11. **Password policy:** enforce only `length >= 8` (today's behaviour) or the full strength-meter policy?
12. **Cutover:** single maintenance window (recommended) or incremental strangler?
