# Silvaine — storefront & back office

Single-brand luxury sneaker storefront (Milano, EUR) with an attached admin
panel, talking to [`silvano-api-service`](../silvano-api-service) over REST.

**Vite 5 · React 18 · TypeScript · MUI 7 (storefront) · shadcn/Tailwind (admin) ·
TanStack Query · Redux Toolkit (cart)**

> This app previously called Supabase directly from the browser. It no longer
> depends on Supabase in any form — see [Migration notes](#migration-notes).

---

## Getting started

```bash
npm install
cp .env.example .env     # point VITE_API_BASE_URL at the running API
npm run dev              # http://localhost:8080
```

The API must be running and must list this origin in its `CORS_ORIGINS`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on :8080 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the build locally |
| `npm test` | Vitest (28 tests) |
| `npm run lint` | ESLint |

### Environment

One variable, and it is public by definition — everything `VITE_`-prefixed is
baked into the browser bundle. No secret belongs here.

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

It is read at **build** time, so each environment needs its own build.

---

## Two experiences, deliberately unalike

| | Storefront | Back office |
| --- | --- | --- |
| Routes | `/`, `/shop`, `/product/:slug`, `/cart`, `/checkout`, `/orders`, `/account`, `/wishlist` | `/admin/*` |
| Layout | `MainLayout` — header, footer | `AdminLayout` — sidebar, top bar, breadcrumb |
| Components | MUI 7 | shadcn/ui + Tailwind |
| Palette | dark, gold, serif display type | dense, functional, monospace figures |
| Loaded | always | lazily, as separate chunks |

An admin is reading dense tables and changing state; a customer is being sold a
€485 sneaker. Making the two look alike would serve neither, so they share a
codebase and almost nothing else. Splitting the admin bundle out cut the
storefront entry from 455 kB to 280 kB gzipped.

### Routes

**Public** — `/` · `/shop` · `/product/:slug` · `/cart` · `/about` · `/contact` ·
`/login` · `/register` · `/reset-password` · `/verify-email`

**Customer** (signed in) — `/checkout` · `/order-success/:id` · `/orders` ·
`/orders/:id` · `/account` · `/wishlist`

**Admin** (signed in, `admin` role) — `/admin` · `/products` · `/orders` ·
`/inventory` · `/categories` · `/customers` · `/reviews` · `/enquiries` ·
`/analytics` · `/settings`

Guards are UX, not security. `ProtectedRoute` and `AdminRoute` decide what to
render; the API independently rejects every request that should not be served.
Typing `/admin` as a customer redirects home *and* would get a 403 from every
call the page made.

---

## Architecture

```
src/
├── api/                 the only place that knows the API exists
│   ├── client.ts        fetch wrapper: auth header, 401-refresh-retry, ApiError
│   ├── types.ts         the API contract, as TypeScript
│   ├── auth.api.ts      · products.api.ts · catalogue.api.ts
│   ├── customer.api.ts  orders, profile, wishlist, reviews, contact
│   └── admin.api.ts     the back office surface
│
├── hooks/               TanStack Query on top of src/api
│   ├── useProducts.ts   catalogue, categories, store settings
│   ├── useOrders.ts     history and placement
│   ├── useReviews.ts    · useProfile.ts · useWishlist.ts
│   └── useAdmin.ts      every admin query and mutation
│
├── contexts/AuthContext.tsx   session, roles, sign-in/out
├── components/          shared UI; components/ui is shadcn, components/admin the sidebar
├── layouts/             MainLayout (storefront) · AdminLayout (back office)
├── pages/               one per route; pages/admin for the back office
├── redux/               the cart, and only the cart
└── theme/               the MUI theme
```

### The rule

Components never call `fetch`. They call a hook; the hook calls `src/api`; only
`src/api` knows the API exists. Before the migration, ten files imported the
Supabase client directly and built queries inline — which is why changing the
backend touched every one of them.

### Data fetching

TanStack Query owns all server state. Query keys are namespaced (`['products']`,
`['admin', 'orders', …]`) so a mutation can invalidate exactly what it
invalidated on the server, and signing out can drop every per-user cache in one
call.

Mutations invalidate across boundaries where the server does: saving a product
refreshes the admin list *and* the public catalogue; placing an order refreshes
products, because stock moved; deleting a review refreshes the product, because
its rating was recalculated.

Redux holds the cart and nothing else. It is client-only, persists to
`localStorage`, and works for guests — exactly as before.

### Authentication

Access and refresh tokens live in `localStorage`, matching the Supabase
behaviour they replace. `apiRequest` attaches the access token, and on a 401
refreshes once and replays the request — one refresh at a time, so a page firing
five queries at once does not rotate the token five ways and sign the customer
out.

The trade-off is worth stating: a token in `localStorage` is readable by any
script running on this origin. Moving the refresh token into an httpOnly cookie
is the hardening step, and it is confined to three API endpoints plus
`client.ts`.

Roles arrive inside the session response and `/auth/me`. `useAdminCheck()` is
still a hook, but it no longer makes a request — the old version was an
`rpc('has_role')` round-trip cached for ten minutes, which meant a revoked admin
kept their menu for that long.

### Images

The API stores host-independent paths (`/uploads/products/…`), so the database
carries no hostname. `resolveAssetUrl` in `client.ts` resolves them against the
API origin — otherwise the browser would resolve them against the *frontend*
origin and 404. Absolute CDN URLs and the frontend's own `/placeholder.svg` pass
through untouched.

### Loading, empty and error states

Every API-driven view handles four states, not two. Failures say what went wrong
and offer a retry; empty says *why* it is empty and what to do about it; a failed
catalogue request no longer renders as an empty grid, which reads as "sold out"
rather than "try again".

---

## Migration notes

What changed when Supabase came out, beyond the transport.

| Was | Now |
| --- | --- |
| `supabase.auth.*` (8 call sites) | `authApi` → `/auth/*` |
| `rpc('has_role')` on every guard | roles in the JWT, already in `AuthContext` |
| `.from('products').select(…)` in components | `GET /products` with server-side filter, sort, paging |
| Whole catalogue downloaded, filtered in the browser | one page at a time |
| `mapProduct()` flattening nested PostgREST rows | the API returns the flattened shape |
| Checkout **fabricated an order id and posted nothing** | `POST /orders`, priced and stocked server-side |
| Order confirmation rendered from router state | read by id, so a refresh works |
| Reviews stored but never displayed; no way to write one | shown on every product, with a form |
| No order history, no profile page | `/orders`, `/orders/:id`, `/account` |
| Admin images were pasted URLs | real file upload, validated by magic bytes |
| Admin colours were a raw JSON textarea | fields, validated server-side |
| Dashboard and analytics charts were hardcoded arrays | `/admin/analytics/*` |
| Admin settings were static JSX | `GET /settings`, the same source the server prices with |
| Contact form set a boolean and discarded the message | `POST /contact`, stored and relayed |
| Shipping rule copied into `Cart.tsx` and `Checkout.tsx` | `GET /settings`, and the server recomputes it anyway |
| Errors went to `console.error` | surfaced in the UI, with the server's message |

Removed: `@supabase/supabase-js`, `src/integrations/supabase/` (including 568
lines of generated types), `VITE_SUPABASE_*`, and two dead files
(`src/pages/Index.tsx`, `src/data/products.ts`) that were imported by nothing.

`src/assets/products/*.jpg` is retained deliberately: the 60 files are the
fallback source for the API's image re-hosting script. They are not bundled.

---

## Tests

```bash
npm test
```

Covering the two things that fail silently if they break:

- **`src/api/client.test.ts`** — credentials, the 401-refresh-retry, single-flight
  refresh under concurrency, error mapping, asset-URL resolution.
- **`src/contexts/AuthContext.test.tsx`** — session restore, sign-in/out, and
  every route-guard outcome, including that a customer cannot render `/admin`
  and that nobody is bounced to `/login` mid-restore.

Authorization was 34 RLS policies enforced by Postgres; it is now application
code on both sides. These are the client half of that.
