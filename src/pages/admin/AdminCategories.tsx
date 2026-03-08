import { useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const filtered = categories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await supabase.from('categories').insert({ name, slug, description });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    setAddOpen(false);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#C9A96E' }} /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5' }}>Categories</Typography>
        <Button onClick={() => setAddOpen(true)} startIcon={<AddIcon />} variant="contained" sx={{ backgroundColor: '#C9A96E', color: '#0A0A0A', fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', '&:hover': { backgroundColor: '#E0C992' } }}>
          Add Category
        </Button>
      </Box>

      <TextField placeholder="Search..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }} /></InputAdornment> }}
        sx={{ mb: 3, width: { xs: '100%', md: 250 }, '& .MuiOutlinedInput-root': { backgroundColor: '#111', fontSize: '0.75rem' } }}
      />

      <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
        {filtered.map((cat: any, i: number) => (
          <motion.div key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <Box>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.8rem', color: '#F5F5F5' }}>{cat.name}</Typography>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{cat.description || cat.slug}</Typography>
              </Box>
              <IconButton size="small" onClick={() => handleDelete(cat.id)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#CF6679' } }}>
                <DeleteIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>
          </motion.div>
        ))}
      </Paper>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>New Category</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 350 }}>
          <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" />
          <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} size="small" multiline rows={2} />
        </DialogContent>
        <DialogActions><Button onClick={() => setAddOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button><Button onClick={handleAdd} variant="contained" sx={{ backgroundColor: '#C9A96E', color: '#0A0A0A' }}>Add</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategories;
