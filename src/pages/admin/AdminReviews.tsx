import { Box, Typography, Paper, Chip, IconButton, Rating, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import { useAdminReviews } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const AdminReviews = () => {
  const { data: reviews = [], isLoading } = useAdminReviews();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#C9A96E' }} /></Box>;

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 3 }}>Reviews</Typography>

      <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
        {reviews.map((r: any, i: number) => (
          <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5' }}>{r.products?.name || 'Product'}</Typography>
                    {r.is_verified_purchase && (
                      <Chip icon={<VerifiedIcon sx={{ fontSize: '0.6rem !important' }} />} label="Verified" size="small" sx={{ fontSize: '0.45rem', height: 18, backgroundColor: 'rgba(76,175,80,0.1)', color: '#4CAF50' }} />
                    )}
                  </Box>
                  <Rating value={r.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#C9A96E' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' }, fontSize: '0.85rem' }} />
                </Box>
                <IconButton size="small" onClick={() => handleDelete(r.id)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#CF6679' } }}>
                  <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              {r.title && <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5', mb: 0.5 }}>{r.title}</Typography>}
              {r.body && <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{r.body}</Typography>}
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', mt: 1 }}>{new Date(r.created_at).toLocaleDateString()}</Typography>
            </Box>
          </motion.div>
        ))}
        {reviews.length === 0 && <Typography sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>No reviews yet</Typography>}
      </Paper>
    </Box>
  );
};

export default AdminReviews;
