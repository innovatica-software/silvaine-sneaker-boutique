import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectCartItems, selectCartTotal, clearCart } from '@/redux/slices/cartSlice';

const SHIPPING_COST = 15;
const FREE_SHIPPING_THRESHOLD = 500;

const Checkout = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `SLV-${Date.now().toString(36).toUpperCase()}`;
    dispatch(clearCart());
    navigate('/order-success', { state: { orderId, items, total, shipping: form } });
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 8, fontSize: { xs: '1.8rem', md: '2.5rem' }, textAlign: 'center' }}>
          Checkout
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          {/* Shipping Info */}
          <Box sx={{ flex: 2 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="h6" sx={{ mb: 4 }}>Shipping Information</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Full Name" value={form.fullName} onChange={handleChange('fullName')} required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Phone Number" value={form.phone} onChange={handleChange('phone')} required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Address" value={form.address} onChange={handleChange('address')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="City" value={form.city} onChange={handleChange('city')} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Postal Code" value={form.postalCode} onChange={handleChange('postalCode')} required />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Country" value={form.country} onChange={handleChange('country')} required />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1 }}>
                  Payment Method
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cash on Delivery — Pay when your order arrives.
                </Typography>
              </Box>
            </motion.div>
          </Box>

          {/* Order Summary */}
          <Box sx={{ flex: 1, p: 4, border: '1px solid', borderColor: 'divider', alignSelf: 'flex-start' }}>
            <Typography variant="h6" sx={{ mb: 4 }}>Order Summary</Typography>
            {items.map((item) => (
              <Box key={`${item.id}-${item.size}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size {item.size} × {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2">€{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2">€{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Shipping</Typography>
              <Typography variant="body2">{shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">€{total.toFixed(2)}</Typography>
            </Box>
            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5 }}>
              Place Order
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Checkout;
