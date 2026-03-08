import { Box, Typography, Paper, Chip, CircularProgress, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useAdminProducts } from '@/hooks/useAdmin';

const AdminInventory = () => {
  const { data: products = [], isLoading } = useAdminProducts();

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#C9A96E' }} /></Box>;

  const sorted = [...products].sort((a: any, b: any) => a.stock - b.stock);
  const lowStock = sorted.filter((p: any) => p.stock <= 10);
  const outOfStock = sorted.filter((p: any) => p.stock === 0);

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 3 }}>Inventory</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Products', value: products.length, color: '#C9A96E' },
          { label: 'Low Stock', value: lowStock.length, color: '#FF7043' },
          { label: 'Out of Stock', value: outOfStock.length, color: '#CF6679' },
        ].map((s, i) => (
          <Paper key={i} sx={{ p: 2.5, flex: 1, minWidth: 150, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', color: s.color }}>{s.value}</Typography>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Stock Levels</Typography>
        </Box>
        {sorted.map((p: any, i: number) => (
          <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)', gap: 2 }}>
              <Typography sx={{ flex: 2, fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5' }}>{p.name}</Typography>
              <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (p.stock / 50) * 100)}
                  sx={{
                    flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': { backgroundColor: p.stock === 0 ? '#CF6679' : p.stock <= 10 ? '#FF7043' : '#4CAF50', borderRadius: 2 },
                  }}
                />
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', minWidth: 30, textAlign: 'right' }}>{p.stock}</Typography>
              </Box>
              <Chip
                label={p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock'}
                size="small"
                sx={{
                  fontSize: '0.45rem', height: 20, letterSpacing: '0.08em',
                  backgroundColor: p.stock === 0 ? 'rgba(207,102,121,0.1)' : p.stock <= 10 ? 'rgba(255,112,67,0.1)' : 'rgba(76,175,80,0.1)',
                  color: p.stock === 0 ? '#CF6679' : p.stock <= 10 ? '#FF7043' : '#4CAF50',
                }}
              />
            </Box>
          </motion.div>
        ))}
      </Paper>
    </Box>
  );
};

export default AdminInventory;
