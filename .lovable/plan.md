

## Plan: Add Pagination and Search to Admin Products

### Current State
- Search already exists (filters by name/SKU) but only client-side on all loaded products
- No pagination -- all products render in a single list
- Products loaded via `useAdminProducts()` which fetches all products at once

### Changes -- Single file: `src/pages/admin/AdminProducts.tsx`

**1. Add client-side pagination state**
- Add `currentPage` state (default 1) and `ITEMS_PER_PAGE` constant (10 per page)
- After filtering by search, slice the `filtered` array for the current page
- Reset `currentPage` to 1 whenever search term changes

**2. Add pagination controls below the product table**
- Show "Showing X-Y of Z products" text
- Previous/Next buttons with disabled states at boundaries
- Page number buttons (with ellipsis for large page counts)
- Style consistent with the dark luxury theme

**3. Enhance search UX**
- Add a clear (X) button inside the search input when text is present
- Show result count badge next to search (e.g., "12 results")

### No database or hook changes needed
Client-side pagination is sufficient since the product count is manageable (< 1000). The existing `useAdminProducts` hook already fetches all products.

