import { Box, Typography, Paper, Avatar, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useAdminCustomers } from '@/hooks/useAdmin';

const AdminCustomers = () => {
  const { data: customers = [], isLoading } = useAdminCustomers();

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#C9A96E' }} /></Box>;

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 3 }}>Customers</Typography>

      <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 2 }}>
          {['Customer', 'Location', 'Joined'].map((h) => (
            <Typography key={h} sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', flex: 1 }}>{h}</Typography>
          ))}
        </Box>
        {customers.map((c: any, i: number) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)', gap: 2, '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' } }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 30, height: 30, backgroundColor: 'rgba(201,169,110,0.15)', color: '#C9A96E', fontSize: '0.65rem' }}>
                  {(c.full_name || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5' }}>{c.full_name || 'Unknown'}</Typography>
                  <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{c.phone || '—'}</Typography>
                </Box>
              </Box>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                {[c.city, c.country].filter(Boolean).join(', ') || '—'}
              </Typography>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                {new Date(c.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </motion.div>
        ))}
        {customers.length === 0 && <Typography sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>No customers yet</Typography>}
      </Paper>
    </Box>
  );
};

export default AdminCustomers;
