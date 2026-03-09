import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AdminProducts = () => {
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const [form, setForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    sku: '',
    category_id: '',
    price: '',
    discount_price: '',
    stock: '',
    sizes: '',
    colors: '[{"name":"","hex":""}]',
    image_urls: [] as string[],
    is_new: false,
    is_best_seller: false,
    is_trending: false,
  });

  const filtered = useMemo(() => products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  ), [products, search]);

  // Reset page on search change
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const openNew = () => {
    setForm({ 
      id: '', name: '', slug: '', description: '', sku: '', category_id: '', 
      price: '', discount_price: '', stock: '', sizes: '', colors: '[{"name":"","hex":""}]', 
      image_urls: [], is_new: false, is_best_seller: false, is_trending: false 
    });
    setNewImageUrl('');
    setEditOpen(true);
  };

  const openEdit = (p: any) => {
    const images = (p.product_images || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => img.url);
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      sku: p.sku || '',
      category_id: p.category_id || '',
      price: String(p.price),
      discount_price: p.discount_price ? String(p.discount_price) : '',
      stock: String(p.stock),
      sizes: (p.sizes || []).join(', '),
      colors: JSON.stringify(p.colors || []),
      image_urls: images,
      is_new: p.is_new,
      is_best_seller: p.is_best_seller,
      is_trending: p.is_trending,
    });
    setNewImageUrl('');
    setEditOpen(true);
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (url && !form.image_urls.includes(url)) {
      setForm({ ...form, image_urls: [...form.image_urls, url] });
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setForm({ ...form, image_urls: form.image_urls.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      sku: form.sku,
      category_id: form.category_id || null,
      price: parseFloat(form.price),
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: JSON.parse(form.colors || '[]'),
      is_new: form.is_new,
      is_best_seller: form.is_best_seller,
      is_trending: form.is_trending,
    };

    try {
      let productId = form.id;
      
      if (productId) {
        await supabase.from('products').update(payload).eq('id', productId);
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select('id').single();
        if (error) throw error;
        productId = data.id;
      }
      
      // Sync product_images: delete all then re-insert
      if (productId) {
        await supabase.from('product_images').delete().eq('product_id', productId);
        
        if (form.image_urls.length > 0) {
          const imageRows = form.image_urls.map((url, i) => ({
            product_id: productId,
            url,
            sort_order: i,
            alt_text: form.name,
          }));
          await supabase.from('product_images').insert(imageRows);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-serif text-3xl font-light tracking-wide text-foreground">Products</h2>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-muted/50 border-white/10"
        />
      </div>

      <div className="rounded-md border border-white/5 bg-[#111] overflow-hidden shadow-sm">
        <div className="hidden md:flex items-center px-6 py-3 border-b border-white/5 bg-black/40 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          <div className="flex-[2]">Product</div>
          <div className="flex-1">SKU</div>
          <div className="flex-1">Category</div>
          <div className="flex-1">Price</div>
          <div className="flex-1">Stock</div>
          <div className="flex-1">Status</div>
          <div className="w-20 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map((p: any, i: number) => (
            <motion.div 
              key={p.id} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: i * 0.03 }}
              className="flex flex-col md:flex-row md:items-center px-6 py-4 gap-4 md:gap-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-[2] flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-black/50 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                  {p.product_images?.[0]?.url ? (
                    <img src={p.product_images[0].url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <span className="font-medium text-sm text-foreground">{p.name}</span>
              </div>
              <div className="flex-1 text-sm text-muted-foreground font-mono text-xs">{p.sku || '—'}</div>
              <div className="flex-1 text-sm text-muted-foreground">{p.categories?.name || '—'}</div>
              <div className="flex-1 flex flex-col">
                <span className="text-primary font-medium text-sm">€{Number(p.price).toFixed(2)}</span>
                {p.discount_price && (
                  <span className="text-xs text-muted-foreground line-through">€{Number(p.discount_price).toFixed(2)}</span>
                )}
              </div>
              <div className="flex-1">
                <Badge variant={p.stock <= 10 ? 'destructive' : 'secondary'} className="font-mono text-[10px]">
                  {p.stock} in stock
                </Badge>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {p.is_new && <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 text-[10px]">New</Badge>}
                {p.is_best_seller && <Badge variant="outline" className="text-green-400 border-green-400/20 bg-green-400/10 text-[10px]">Best</Badge>}
              </div>
              <div className="w-20 flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground font-mono text-sm">
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* Product Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-full sm:max-w-2xl bg-[#0a0a0a] border-white/10 overflow-y-auto sm:rounded-l-2xl p-0 flex flex-col">
          <SheetHeader className="px-6 py-6 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10 flex-shrink-0">
            <SheetTitle className="font-serif text-2xl tracking-wide text-foreground">
              {form.id ? 'Edit Product' : 'New Product'}
            </SheetTitle>
          </SheetHeader>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider">Product Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-muted-foreground text-xs uppercase tracking-wider">Slug (auto-generated)</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-black/50 border-white/10 min-h-[120px] resize-none focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            {/* Multiple Images Section */}
            <div className="space-y-4 md:col-span-2 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider block">Product Images</Label>
              
              {/* Image Grid */}
              {form.image_urls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.image_urls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/50">
                      <img src={url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-primary/90 text-primary-foreground text-[9px] font-medium px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  className="bg-black/50 border-white/10 focus-visible:ring-primary focus-visible:border-primary transition-all flex-1"
                />
                <Button type="button" variant="outline" onClick={addImageUrl} className="border-white/10 hover:bg-white/5 shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">First image is the main product image. Add multiple URLs for gallery.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku" className="text-muted-foreground text-xs uppercase tracking-wider">SKU</Label>
              <Input id="sku" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} className="bg-black/50 border-white/10 font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
              <select 
                id="category"
                value={form.category_id} 
                onChange={(e) => setForm({...form, category_id: e.target.value})}
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all"
              >
                <option value="" className="bg-[#111]">No Category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id} className="bg-[#111]">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-muted-foreground text-xs uppercase tracking-wider">Price (€) *</Label>
              <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="bg-black/50 border-white/10 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_price" className="text-muted-foreground text-xs uppercase tracking-wider">Discount Price (€)</Label>
              <Input id="discount_price" type="number" step="0.01" value={form.discount_price} onChange={(e) => setForm({...form, discount_price: e.target.value})} className="bg-black/50 border-white/10 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-muted-foreground text-xs uppercase tracking-wider">Stock Quantity *</Label>
              <Input id="stock" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="bg-black/50 border-white/10 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizes" className="text-muted-foreground text-xs uppercase tracking-wider">Sizes (comma separated)</Label>
              <Input id="sizes" placeholder="38, 39, 40, 41, 42" value={form.sizes} onChange={(e) => setForm({...form, sizes: e.target.value})} className="bg-black/50 border-white/10 font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="colors" className="text-muted-foreground text-xs uppercase tracking-wider">Colors (JSON format)</Label>
              <Input id="colors" placeholder='[{"name":"Black","hex":"#000000"}]' value={form.colors} onChange={(e) => setForm({...form, colors: e.target.value})} className="bg-black/50 border-white/10 font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" />
            </div>

            <div className="space-y-5 md:col-span-2 p-5 bg-white/[0.02] rounded-xl border border-white/5 mt-2">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Product Status & Tags</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">New Arrival</Label>
                  <p className="text-[11px] text-muted-foreground">Mark product as a new arrival</p>
                </div>
                <Switch checked={form.is_new} onCheckedChange={(c) => setForm({...form, is_new: c})} />
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Best Seller</Label>
                  <p className="text-[11px] text-muted-foreground">Highlight as a best seller</p>
                </div>
                <Switch checked={form.is_best_seller} onCheckedChange={(c) => setForm({...form, is_best_seller: c})} />
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Trending</Label>
                  <p className="text-[11px] text-muted-foreground">Show in trending sections</p>
                </div>
                <Switch checked={form.is_trending} onCheckedChange={(c) => setForm({...form, is_trending: c})} />
              </div>
            </div>
          </div>
          
          <SheetFooter className="sticky bottom-0 px-6 py-4 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/5 flex-row justify-end gap-3 z-10 flex-shrink-0">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-white/10 hover:bg-white/5 text-sm h-10 px-6">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 px-6">
              Save Product
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-[#111] border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-wide text-foreground">Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from the database.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-white/10 hover:bg-white/5">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
