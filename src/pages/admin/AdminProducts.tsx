import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ApiError,
  errorMessage,
  type Product,
  type ProductColor,
  type ProductInput,
} from '@/api';
import {
  useAdminCategories,
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  useUploadProductImage,
} from '@/hooks/useAdmin';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

interface FormState {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  categoryId: string;
  price: string;
  discountPrice: string;
  stock: string;
  sizes: string;
  colors: ProductColor[];
  imageUrls: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  id: '',
  name: '',
  slug: '',
  description: '',
  sku: '',
  categoryId: '',
  price: '',
  discountPrice: '',
  stock: '',
  sizes: '',
  colors: [],
  imageUrls: [],
  isNew: false,
  isBestSeller: false,
  isTrending: false,
  isActive: true,
};

/**
 * Product management.
 *
 * Three things were broken here and are not any more.
 *
 *  - **Colours were a raw JSON textarea.** `JSON.parse` on whatever was typed,
 *    with the failure caught only by `console.error` — so a malformed bracket
 *    produced a save that silently did nothing. Colours are now edited as
 *    fields, and the server validates each hex value.
 *  - **Images were pasted URLs.** There was no file picker at all; the storage
 *    bucket could only be filled from the Supabase dashboard. Files now upload
 *    through the API, which sniffs the magic bytes and discards the client
 *    filename.
 *  - **Failures were invisible.** Every error went to the console. They surface
 *    in the sheet now, including the 409 that a deletion gets when the product
 *    appears in somebody's order.
 */
const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminProducts({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
  });

  const products = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const saving = createProduct.isPending || updateProduct.isPending;

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i += 1) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);

    return pages;
  }, [page, totalPages]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setNewImageUrl('');
    setFormError('');
    setEditOpen(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      categoryId: product.categoryId ?? '',
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      stock: String(product.stock),
      sizes: product.sizes.join(', '),
      colors: product.colors,
      // The placeholder is what the API substitutes when there are no images;
      // it is not a real one and must not be saved back as one.
      imageUrls: product.images.filter((url) => !url.endsWith('/placeholder.svg')),
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      isTrending: product.isTrending,
      isActive: product.isActive,
    });
    setNewImageUrl('');
    setFormError('');
    setEditOpen(true);
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url || form.imageUrls.includes(url)) return;

    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
    setNewImageUrl('');
  };

  const removeImageUrl = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  /**
   * Uploading needs a product to attach to, so for a new product the file is
   * held until after the first save. Rather than building a staging area, the
   * picker is disabled until the product exists and says why.
   */
  const handleFilePick = async (file: File | undefined) => {
    if (!file || !form.id) return;

    setFormError('');

    try {
      const image = await uploadImage.mutateAsync({ id: form.id, file });
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, image.url] }));
    } catch (err) {
      setFormError(errorMessage(err, 'The image could not be uploaded.'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateColor = (index: number, patch: Partial<ProductColor>) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((colour, i) =>
        i === index ? { ...colour, ...patch } : colour,
      ),
    }));
  };

  const handleSave = async () => {
    setFormError('');

    const price = Number.parseFloat(form.price);

    if (!form.name.trim()) {
      setFormError('A product name is required.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Price must be a number greater than zero.');
      return;
    }

    const payload: ProductInput = {
      name: form.name.trim(),
      // Left out when blank so the server derives it, with transliteration and
      // a collision suffix the old client-side `replace(/\s+/g,'-')` never had.
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      sku: form.sku.trim() || undefined,
      categoryId: form.categoryId || undefined,
      price,
      discountPrice: form.discountPrice
        ? Number.parseFloat(form.discountPrice)
        : undefined,
      stock: Number.parseInt(form.stock, 10) || 0,
      sizes: form.sizes
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean),
      colors: form.colors.filter((colour) => colour.name.trim() && colour.hex.trim()),
      isNew: form.isNew,
      isBestSeller: form.isBestSeller,
      isTrending: form.isTrending,
      isActive: form.isActive,
      images: form.imageUrls,
    };

    try {
      if (form.id) {
        await updateProduct.mutateAsync({ id: form.id, data: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      setEditOpen(false);
    } catch (err) {
      setFormError(errorMessage(err, 'The product could not be saved.'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setListError('');

    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      // The FK from order_items is RESTRICT: an ordered product cannot be
      // deleted, and the right answer is to deactivate it instead.
      setListError(
        err instanceof ApiError && err.isConflict
          ? `"${deleteTarget.name}" appears in an existing order and cannot be deleted. Switch it to inactive instead.`
          : errorMessage(err, 'The product could not be deleted.'),
      );
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          {errorMessage(error, 'Products could not be loaded.')}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="font-serif text-3xl font-light tracking-wide text-foreground">
          Products
        </h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {listError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, brand or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-muted/50 pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {meta && (
          <Badge variant="secondary" className="shrink-0 font-mono text-xs">
            {meta.total} total{isFetching ? ' · …' : ''}
          </Badge>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-white/5 bg-[#111] shadow-sm">
        <div className="hidden items-center border-b border-white/5 bg-black/40 px-6 py-3 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-muted-foreground md:flex">
          <div className="flex-[2]">Product</div>
          <div className="flex-1">SKU</div>
          <div className="flex-1">Category</div>
          <div className="flex-1">Price</div>
          <div className="flex-1">Stock</div>
          <div className="flex-1">Status</div>
          <div className="w-20 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] md:flex-row md:items-center md:gap-0"
            >
              <div className="flex flex-[2] items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/50">
                  {product.images[0] && !product.images[0].endsWith('/placeholder.svg') ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{product.name}</span>
              </div>
              <div className="flex-1 font-mono text-xs text-muted-foreground">
                {product.sku || '—'}
              </div>
              <div className="flex-1 text-sm text-muted-foreground">{product.category}</div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-primary">
                  €{product.price.toFixed(2)}
                </span>
                {product.discountPrice !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    now €{product.discountPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Badge
                  variant={product.stock <= 10 ? 'destructive' : 'secondary'}
                  className="font-mono text-[10px]"
                >
                  {product.stock} in stock
                </Badge>
              </div>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {!product.isActive && (
                  <Badge variant="outline" className="border-white/15 text-[10px] text-muted-foreground">
                    Inactive
                  </Badge>
                )}
                {product.isNew && (
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-[10px] text-primary">
                    New
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge variant="outline" className="border-green-400/20 bg-green-400/10 text-[10px] text-green-400">
                    Best
                  </Badge>
                )}
              </div>
              <div className="flex w-20 justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(product)}
                  className="h-8 w-8 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(product)}
                  className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          {products.length === 0 && (
            <div className="px-6 py-12 text-center font-mono text-sm text-muted-foreground">
              {debouncedSearch
                ? `No products match “${debouncedSearch}”.`
                : 'No products yet. Add your first one.'}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} products
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 border-white/10 px-2 hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((entry, idx) =>
              entry === 'ellipsis' ? (
                <span key={`e-${idx}`} className="px-2 text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={entry}
                  variant={page === entry ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(entry)}
                  className={`h-8 w-8 p-0 font-mono text-xs ${
                    page === entry
                      ? 'bg-primary text-primary-foreground'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  {entry}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 border-white/10 px-2 hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Product sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="flex w-full flex-col overflow-y-auto border-white/10 bg-[#0a0a0a] p-0 sm:max-w-2xl sm:rounded-l-2xl">
          <SheetHeader className="sticky top-0 z-10 flex-shrink-0 border-b border-white/5 bg-[#0a0a0a]/95 px-6 py-6 backdrop-blur">
            <SheetTitle className="font-serif text-2xl tracking-wide text-foreground">
              {form.id ? 'Edit Product' : 'New Product'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {formError && (
              <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border-white/10 bg-black/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={form.slug}
                  placeholder="Derived from the name when blank"
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="border-white/10 bg-black/50"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="min-h-[120px] resize-none border-white/10 bg-black/50"
                />
              </div>

              {/* Images */}
              <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-5 md:col-span-2">
                <Label className="block text-xs uppercase tracking-wider text-muted-foreground">
                  Product Images
                </Label>

                {form.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {form.imageUrls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/50"
                      >
                        <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handleFilePick(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!form.id || uploadImage.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-white/10 hover:bg-white/5"
                  >
                    {uploadImage.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-1 h-4 w-4" />
                    )}
                    Upload File
                  </Button>

                  <Input
                    placeholder="…or paste an image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    className="min-w-[200px] flex-1 border-white/10 bg-black/50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageUrl}
                    className="shrink-0 border-white/10 hover:bg-white/5"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  {form.id
                    ? 'The first image is the main one. JPEG, PNG or WebP, up to 5MB.'
                    : 'Save the product first to upload files. URLs can be added now.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="text-xs uppercase tracking-wider text-muted-foreground">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="border-white/10 bg-black/50 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <select
                  id="category"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="flex h-10 w-full appearance-none rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" className="bg-[#111]">
                    No Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-[#111]">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Price (€) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border-white/10 bg-black/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Discount Price (€)
                </Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  className="border-white/10 bg-black/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Stock Quantity *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="border-white/10 bg-black/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizes" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Sizes (comma separated)
                </Label>
                <Input
                  id="sizes"
                  placeholder="38, 39, 40, 41, 42"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  className="border-white/10 bg-black/50 font-mono text-sm"
                />
              </div>

              {/* Colours — fields, not raw JSON */}
              <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-5 md:col-span-2">
                <Label className="block text-xs uppercase tracking-wider text-muted-foreground">
                  Colours
                </Label>

                {form.colors.map((colour, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Name, e.g. Nero"
                      value={colour.name}
                      onChange={(e) => updateColor(index, { name: e.target.value })}
                      className="flex-1 border-white/10 bg-black/50"
                    />
                    <Input
                      placeholder="#111111"
                      value={colour.hex}
                      onChange={(e) => updateColor(index, { hex: e.target.value })}
                      className="w-32 border-white/10 bg-black/50 font-mono"
                    />
                    <span
                      className="h-8 w-8 shrink-0 rounded-md border border-white/10"
                      style={{
                        backgroundColor: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colour.hex)
                          ? colour.hex
                          : 'transparent',
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          colors: prev.colors.filter((_, i) => i !== index),
                        }))
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      colors: [...prev.colors, { name: '', hex: '#000000' }],
                    }))
                  }
                  className="border-white/10 hover:bg-white/5"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Colour
                </Button>
              </div>

              <div className="mt-2 space-y-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 md:col-span-2">
                <h4 className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">
                  Product Status &amp; Tags
                </h4>

                <ToggleRow
                  label="Visible in Shop"
                  hint="Inactive products are hidden from the storefront entirely."
                  checked={form.isActive}
                  onChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <div className="my-2 h-px bg-white/5" />
                <ToggleRow
                  label="New Arrival"
                  hint="Mark product as a new arrival"
                  checked={form.isNew}
                  onChange={(checked) => setForm({ ...form, isNew: checked })}
                />
                <div className="my-2 h-px bg-white/5" />
                <ToggleRow
                  label="Best Seller"
                  hint="Highlight as a best seller"
                  checked={form.isBestSeller}
                  onChange={(checked) => setForm({ ...form, isBestSeller: checked })}
                />
                <div className="my-2 h-px bg-white/5" />
                <ToggleRow
                  label="Trending"
                  hint="Show in trending sections"
                  checked={form.isTrending}
                  onChange={(checked) => setForm({ ...form, isTrending: checked })}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 z-10 flex-row flex-shrink-0 justify-end gap-3 border-t border-white/5 bg-[#0a0a0a]/95 px-6 py-4 backdrop-blur">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="h-10 border-white/10 px-6 text-sm hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="h-10 bg-primary px-6 text-sm text-primary-foreground hover:bg-primary/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Product
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="border-white/10 bg-[#111] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-wide text-foreground">
              Delete Product
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-sm leading-relaxed text-muted-foreground">
            Delete <span className="text-foreground">{deleteTarget?.name}</span>? This cannot be
            undone. A product that appears in an existing order cannot be deleted — deactivate it
            instead so order history stays intact.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteProduct.isPending}
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ToggleRow = ({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default AdminProducts;
