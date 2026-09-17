# Archived — Supabase schema history

**Nothing here runs.** This directory is kept as the historical record of the
backend this application used before the migration, not as live infrastructure.

The application no longer depends on Supabase in any form: `@supabase/supabase-js`
is uninstalled, `src/integrations/supabase/` is deleted, and the `VITE_SUPABASE_*`
variables are gone. The storefront talks to
[`silvano-api-service`](../../silvano-api-service) over REST.

## Why keep it

The nine migrations in `migrations/` are the only version-controlled description
of the original schema — its columns, its 34 Row Level Security policies, its six
functions and its four triggers. The NestJS backend reimplements all of that in
application code, and when a question comes up about *why* a rule looks the way
it does, this is the answer.

`20260308224725_…sql` is also the only record in either repository of the seeded
`product_images` rows, referencing fifteen product UUIDs that were created
through the Supabase dashboard rather than by migration.

## What replaced what

| Here | There |
| --- | --- |
| 9 `CREATE TABLE` statements | `src/database/migrations/` in the API |
| 34 RLS policies | `JwtAuthGuard` + `RolesGuard` + `assertOwnership()` |
| `has_role()` | the `roles` claim in the JWT |
| `get_admin_stats()` | `GET /admin/stats` (same JSON keys) |
| `handle_new_user()`, `assign_customer_role()` | `AuthService.register()`, one transaction |
| `update_product_rating()` | `ProductsService.recalculateRating()` |
| `check_verified_purchase()` | `ReviewsService.create()` |
| storage bucket `product-images` | `StorageService` (local disk or S3-compatible) |

Data migration tooling lives in the API repository:
`silvano-api-service/docs/MIGRATION.md`.

## Before deleting the Supabase project

The catalogue and all 60 product images have been migrated and their URLs
rewritten, so nothing in the running application points at Supabase any more.
The remaining tables — `users`, `profiles`, `user_roles`, `orders`,
`order_items`, `reviews`, `wishlists` — are behind RLS and still need a
service-role key to export.

Keep the project alive and read-only until that has been done and verified. It is
the rollback path, and it is worth nothing once deleted.
