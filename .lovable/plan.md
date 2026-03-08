

## Plan: Multiple Image Support for Admin Product Modal + Fix Save Button Overlap

### Problem
1. The form uses a single `image_url` string — only one image can be added/edited
2. The Save button overlaps form content (reported previously)

### Changes — Single file: `src/pages/admin/AdminProducts.tsx`

**1. Form state: Replace `image_url: string` with `image_urls: string[]`**
- Default to empty array `[]` for new products
- When editing, load ALL `product_images` (sorted by `sort_order`) into the array

**2. Multiple image UI section**
- Show a grid of image thumbnails with:
  - Preview thumbnail for each URL
  - Delete (X) button on each image
  - First image highlighted as "Main Image" badge
- Below the grid: an input field + "Add Image" button to append new URLs
- Drag reordering not needed initially — images ordered by addition order

**3. Save logic: Sync `product_images` table**
- On save, delete ALL existing `product_images` for the product
- Insert all URLs from `image_urls` array with correct `sort_order` (0, 1, 2...)
- This is simpler than diffing and handles all add/remove/reorder cases

**4. Fix Save button overlap**
- Change `SheetFooter` from `absolute bottom-0` to `sticky bottom-0`
- Remove `pb-28` padding hack from form content area

### No database changes needed
The `product_images` table already supports multiple images per product with `product_id`, `url`, and `sort_order` columns.

