import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { errorMessage, type Category } from '@/api';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useAdmin';

const EMPTY = { name: '', description: '' };

/**
 * Category management.
 *
 * Editing is new — the old admin could create and delete but not update, even
 * though an UPDATE policy had always existed (spec G-11). Deletion is now
 * confirmed and explains its consequence: products keep existing and fall back
 * to "Uncategorized", because the foreign key is SET NULL, not CASCADE.
 *
 * Slugs are derived server-side. The old client-side
 * `name.toLowerCase().replace(/\s+/g,'-')` turned "Città Nera!" into
 * `città-nera!`.
 */
const AdminCategories = () => {
  const { data: categories = [], isLoading, isError, error, refetch } =
    useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [listError, setListError] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term),
    );
  }, [categories, search]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({ name: category.name, description: category.description ?? '' });
    setFormError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    setFormError('');

    if (!form.name.trim()) {
      setFormError('A name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    };

    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (err) {
      // 409 is the unique-name constraint, which is worth naming precisely.
      setFormError(errorMessage(err, 'The category could not be saved.'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setListError('');

    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setListError(errorMessage(err, 'The category could not be deleted.'));
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mb: 2 }}>
          {errorMessage(error, 'Categories could not be loaded.')}
        </Typography>
        <Button onClick={() => void refetch()} sx={{ color: '#C9A96E' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  const saving = createCategory.isPending || updateCategory.isPending;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.6rem',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: '#F5F5F5',
          }}
        >
          Categories
        </Typography>
        <Button
          onClick={openNew}
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            backgroundColor: '#C9A96E',
            color: '#0A0A0A',
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '0.65rem',
            '&:hover': { backgroundColor: '#E0C992' },
          }}
        >
          Add Category
        </Button>
      </Box>

      {listError && (
        <Alert
          severity="error"
          onClose={() => setListError('')}
          sx={{ mb: 3, backgroundColor: 'rgba(207,102,121,0.08)', color: '#CF6679' }}
        >
          {listError}
        </Alert>
      )}

      <TextField
        placeholder="Search…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          width: { xs: '100%', md: 250 },
          '& .MuiOutlinedInput-root': { backgroundColor: '#111', fontSize: '0.75rem' },
        }}
      />

      <Paper
        sx={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {filtered.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2.5,
                py: 2,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.8rem',
                    color: '#F5F5F5',
                  }}
                >
                  {category.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {category.description || category.slug}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => openEdit(category)}
                  sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#C9A96E' } }}
                >
                  <EditIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setDeleteTarget(category)}
                  sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#CF6679' } }}
                >
                  <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
            </Box>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.75rem',
            }}
          >
            {search ? 'No categories match your search.' : 'No categories yet.'}
          </Typography>
        )}
      </Paper>

      {/* Create / edit */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {editing ? 'Edit Category' : 'New Category'}
        </DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 350 }}
        >
          {formError && (
            <Alert
              severity="error"
              sx={{ backgroundColor: 'rgba(207,102,121,0.08)', color: '#CF6679' }}
            >
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            size="small"
            autoFocus
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            size="small"
            multiline
            rows={2}
          />
          <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>
            The URL slug is generated from the name.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            variant="contained"
            disabled={saving}
            sx={{ backgroundColor: '#C9A96E', color: '#0A0A0A' }}
          >
            {saving ? <CircularProgress size={16} sx={{ color: '#0A0A0A' }} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Delete Category
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
            Delete “{deleteTarget?.name}”? Products in it are not deleted — they move to
            Uncategorized and stay on sale.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDelete()}
            disabled={deleteCategory.isPending}
            sx={{ color: '#CF6679' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategories;
