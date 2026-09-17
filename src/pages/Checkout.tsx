import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError, errorMessage } from '@/api';
import SEO from '@/components/SEO';
import { usePlaceOrder } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import {
  SETTINGS_FALLBACK,
  previewShipping,
  useSettings,
} from '@/hooks/useProducts';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  clearCart,
  selectCartItems,
  selectCartTotal,
} from '@/redux/slices/cartSlice';

interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const EMPTY_FORM: ShippingForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

/**
 * Checkout.
 *
 * This page used to be the largest hole in the application: its submit handler
 * invented an order id (`SLV-${Date.now()}`), cleared the cart and navigated
 * away. No request was made, nothing was written, and no order the admin panel
 * could see had ever been created by the app.
 *
 * It now posts the cart to `POST /orders`, which re-reads every product under a
 * row lock, prices it from the database, applies the shipping rule, snapshots
 * the line items, decrements stock and writes the order in one transaction. The
 * totals rendered below are a preview; the server's answer is what is charged.
 */
const Checkout = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: settings = SETTINGS_FALLBACK } = useSettings();
  const { data: profile } = useProfile();
  const placeOrder = usePlaceOrder();

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [error, setError] = useState('');

  const shipping = previewShipping(subtotal, settings);
  const tax = Math.round(subtotal * settings.taxRate * 100) / 100;
  const total = subtotal + shipping + tax;
  const currency = settings.currencySymbol;

  // Prefill from the saved profile. Checkout used to re-collect the whole
  // address on every order because there was nowhere to keep it; the profile
  // now stores it and the server writes it back after the first order.
  useEffect(() => {
    if (!profile) return;

    setForm((current) => ({
      fullName: current.fullName || profile.fullName || '',
      phone: current.phone || profile.phone || '',
      address: current.address || profile.addressLine1 || '',
      city: current.city || profile.city || '',
      postalCode: current.postalCode || profile.postalCode || '',
      country: current.country || profile.country || settings.defaultCountry,
    }));
  }, [profile, settings.defaultCountry]);

  const handleChange =
    (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const order = await placeOrder.mutateAsync({
        // Ids, sizes and quantities only. There is no field for a price, so a
        // tampered total is not merely ignored — it cannot be expressed.
        items: items.map((item) => ({
          productId: item.id,
          size: item.size || undefined,
          color: item.color || undefined,
          quantity: item.quantity,
        })),
        shippingName: form.fullName,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingPostalCode: form.postalCode,
        shippingCountry: form.country,
        shippingPhone: form.phone || undefined,
        paymentMethod: 'cod',
      });

      // Only clear the bag once the order is safely persisted — the old flow
      // cleared it unconditionally, so a failure would have lost the basket.
      dispatch(clearCart());
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      // 422 means a business rule was hit — usually stock ran out between
      // adding to the bag and checking out — and the message names the product.
      setError(
        err instanceof ApiError && err.status === 422
          ? err.message
          : errorMessage(err, 'We could not place your order. Please try again.'),
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Redirecting during render logged a React warning and could fire twice.
  if (items.length === 0) return <Navigate to="/cart" replace />;

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Checkout | Silvaine"
        description="Complete your order."
        url="/checkout"
        noIndex
      />
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            mb: 6,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            textAlign: 'center',
          }}
        >
          Checkout
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              backgroundColor: 'rgba(207,102,121,0.08)',
              color: '#CF6679',
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 6,
          }}
        >
          {/* Shipping Info */}
          <Box sx={{ flex: 2 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="h6" sx={{ mb: 4 }}>
                Shipping Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    required
                    helperText="Used by the courier for delivery."
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange('address')}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="City"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={handleChange('city')}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={handleChange('postalCode')}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    autoComplete="country-name"
                    value={form.country}
                    onChange={handleChange('country')}
                    required
                  />
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
          <Box
            sx={{
              flex: 1,
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              alignSelf: 'flex-start',
            }}
          >
            <Typography variant="h6" sx={{ mb: 4 }}>
              Order Summary
            </Typography>
            {items.map((item) => (
              <Box
                key={`${item.id}-${item.size}-${item.color}`}
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Box>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size {item.size} × {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {currency}
                  {((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2">
                {currency}
                {subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Shipping
              </Typography>
              <Typography variant="body2">
                {shipping === 0 ? 'FREE' : `${currency}${shipping.toFixed(2)}`}
              </Typography>
            </Box>
            {tax > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="body2">
                  {currency}
                  {tax.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">
                {currency}
                {total.toFixed(2)}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 3 }}
            >
              Final total is confirmed by our system when the order is placed.
            </Typography>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ py: 1.5 }}
              disabled={placeOrder.isPending}
            >
              {placeOrder.isPending ? (
                <CircularProgress size={20} sx={{ color: '#0A0A0A' }} />
              ) : (
                'Place Order'
              )}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Checkout;
