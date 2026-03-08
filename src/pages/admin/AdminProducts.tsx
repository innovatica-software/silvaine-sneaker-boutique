import { useState } from 'react';
import { Box, Typography, Paper, Button, IconButton, TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useAdminProducts } from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const AdminProducts = () => {
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    is_new: false,
    is_best_seller: false,
    is_trending: false,
  });

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm({ id: '', name: '', slug: '', description: '', sku: '', category_id: '', price: '', discount_price: '', stock: '', sizes: '', colors: '[{"name":"","hex":""}]', is_new: false, is_best_seller: false, is_trending: false });
    setEditOpen(true);
  };

  const openEdit = (p: any) => {
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
      is_new: p.is_new,
      is_best_seller: p.is_best_seller,
      is_trending: p.is_trending,
    });
    setEditOpen(true);
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

    if (form.id) {
      await supabase.from('products').update(payload).eq('id', form.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setDeleteId(null);
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#C9A96E' }} /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5' }}>Products</Typography>
        <Button onClick={openNew} startIcon={<AddIcon />} variant="contained" sx={{ backgroundColor: '#C9A96E', color: '#0A0A0A', fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', '&:hover': { backgroundColor: '#E0C992' } }}>
          Add Product
        </Button>
      </Box>

      <TextField
        placeholder="Search products..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>,
        }}
        sx={{ mb: 3, width: { xs: '100%', md: 300 }, '& .MuiOutlinedInput-root': { backgroundColor: '#111', fontSize: '0.75rem' } }}
      />

      <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
        {/* Table Header */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 2 }}>
          {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
            <Typography key={h} sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', flex: h === 'Product' ? 2 : 1, minWidth: h === 'Actions' ? 80 : undefined }}>
              {h}
            </Typography>
          ))}
        </Box>

        {filtered.map((p: any, i: number) => (
          <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Box sx={{
              display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, px: 2.5, py: 1.5,
              borderBottom: '1px solid rgba(255,255,255,0.03)', gap: { xs: 1, md: 2 },
              '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' }, transition: 'background-color 0.2s',
            }}>
              <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, backgroundColor: '#1a1a1a', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
                  {p.product_images?.[0]?.url && <Box component="img" src={p.product_images[0].url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </Box>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5' }}>{p.name}</Typography>
              </Box>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{p.sku}</Typography>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{p.categories?.name || '—'}</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#C9A96E' }}>€{Number(p.price).toFixed(2)}</Typography>
                {p.discount_price && <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>€{Number(p.discount_price).toFixed(2)}</Typography>}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Chip label={p.stock} size="small" sx={{ backgroundColor: p.stock <= 10 ? 'rgba(255,112,67,0.1)' : 'rgba(76,175,80,0.1)', color: p.stock <= 10 ? '#FF7043' : '#4CAF50', fontSize: '0.6rem', height: 22 }} />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                {p.is_new && <Chip label="New" size="small" sx={{ fontSize: '0.45rem', height: 18, backgroundColor: 'rgba(201,169,110,0.1)', color: '#C9A96E' }} />}
                {p.is_best_seller && <Chip label="Best" size="small" sx={{ fontSize: '0.45rem', height: 18, backgroundColor: 'rgba(76,175,80,0.1)', color: '#4CAF50' }} />}
              </Box>
              <Box sx={{ minWidth: 80, display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#C9A96E' } }}>
                  <EditIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
                <IconButton size="small" onClick={() => setDeleteId(p.id)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#CF6679' } }}>
                  <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
            </Box>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)', fontFamily: '"Montserrat", sans-serif', fontSize: '0.75rem' }}>No products found</Typography>
        )}
      </Paper>

      {/* Edit/Add Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.08em' }}>
          {form.id ? 'Edit Product' : 'New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Price (€)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} size="small" type="number" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Discount Price (€)" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} size="small" type="number" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} size="small" type="number" />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField fullWidth label="Sizes (comma separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} size="small" placeholder="38, 39, 40, 41, 42" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Colors (JSON)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} size="small" placeholder='[{"name":"Black","hex":"#000"}]' />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth select label="Category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} size="small"
                SelectProps={{ native: true }}
              >
                <option value="">No Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#C9A96E', color: '#0A0A0A', '&:hover': { backgroundColor: '#E0C992' } }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>Delete Product?</DialogTitle>
        <DialogContent><Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button onClick={handleDelete} sx={{ color: '#CF6679' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;
