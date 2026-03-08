import { useState } from 'react';
import { Box, Typography, Paper, Chip, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { useAdminOrders } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(255,202,40,0.1)', color: '#FFCA28' },
  confirmed: { bg: 'rgba(66,165,245,0.1)', color: '#42A5F5' },
  processing: { bg: 'rgba(171,71,188,0.1)', color: '#AB47BC' },
  shipped: { bg: 'rgba(201,169,110,0.1)', color: '#C9A96E' },
  delivered: { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50' },
  cancelled: { bg: 'rgba(207,102,121,0.1)', color: '#CF6679' },
};

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useAdminOrders();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState<any>(null);

  const filtered = orders.filter((o: any) => {
    const matchSearch = (o.shipping_name || '').toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#C9A96E' }} /></Box>;

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 3 }}>Orders</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search orders..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }} /></InputAdornment> }}
          sx={{ width: { xs: '100%', md: 250 }, '& .MuiOutlinedInput-root': { backgroundColor: '#111', fontSize: '0.75rem' } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ backgroundColor: '#111', fontSize: '0.75rem' }}>
            <MenuItem value="all">All</MenuItem>
            {Object.keys(statusColors).map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 2 }}>
          {['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Update'].map((h) => (
            <Typography key={h} sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', flex: 1 }}>{h}</Typography>
          ))}
        </Box>

        {filtered.map((order: any, i: number) => (
          <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <Box sx={{
              display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, px: 2.5, py: 1.5,
              borderBottom: '1px solid rgba(255,255,255,0.03)', gap: { xs: 1, md: 2 },
              cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' }, transition: 'background-color 0.2s',
            }} onClick={() => setDetailOrder(order)}>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>
                {order.id.slice(0, 8)}...
              </Typography>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5' }}>
                {order.shipping_name || 'Guest'}
              </Typography>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                {new Date(order.created_at).toLocaleDateString()}
              </Typography>
              <Typography sx={{ flex: 1, fontFamily: '"Montserrat", sans-serif', fontSize: '0.75rem', color: '#C9A96E', fontWeight: 500 }}>
                €{Number(order.total).toFixed(2)}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Chip label={order.status} size="small" sx={{ ...statusColors[order.status], fontSize: '0.5rem', height: 22, textTransform: 'capitalize', backgroundColor: statusColors[order.status]?.bg }} />
              </Box>
              <Box sx={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} sx={{ fontSize: '0.65rem', backgroundColor: '#1a1a1a' }}>
                    {Object.keys(statusColors).map((s) => <MenuItem key={s} value={s} sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.3)', fontFamily: '"Montserrat", sans-serif', fontSize: '0.75rem' }}>No orders found</Typography>
        )}
      </Paper>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onClose={() => setDetailOrder(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}>
        {detailOrder && (
          <>
            <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.08em' }}>Order Details</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Order ID</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#F5F5F5' }}>{detailOrder.id.slice(0, 12)}...</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Customer</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#F5F5F5' }}>{detailOrder.shipping_name || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Address</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#F5F5F5', textAlign: 'right' }}>{detailOrder.shipping_address}, {detailOrder.shipping_city} {detailOrder.shipping_postal_code}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Total</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#C9A96E', fontWeight: 500 }}>€{Number(detailOrder.total).toFixed(2)}</Typography>
                </Box>
                {detailOrder.order_items?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1 }}>Items</Typography>
                    {detailOrder.order_items.map((item: any) => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#F5F5F5' }}>{item.product_name} × {item.quantity}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#C9A96E' }}>€{Number(item.total_price).toFixed(2)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminOrders;
