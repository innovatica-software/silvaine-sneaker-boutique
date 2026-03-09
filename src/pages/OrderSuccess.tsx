import { useLocation, Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, items, total, shipping } = location.state || {};

  return (
    <Box sx={{ py: { xs: 10, md: 16 }, minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <SEO title="Order Confirmed | Silvaine" description="Your order has been confirmed." url="/order-success" noIndex />
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 3 }} />
            <Typography variant="h3" sx={{ mb: 2 }}>
              Order Confirmed
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for shopping with Silvaine.
            </Typography>
          </Box>

          <Box sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Order ID</Typography>
              <Typography variant="body2" sx={{ color: 'primary.main' }}>{orderId || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Payment</Typography>
              <Typography variant="body2">Cash on Delivery</Typography>
            </Box>
            {shipping && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Shipping to</Typography>
                <Typography variant="body2">
                  {shipping.fullName}, {shipping.address}, {shipping.city} {shipping.postalCode}, {shipping.country}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 3 }} />
            {items?.map((item: any) => (
              <Box key={`${item.id}-${item.size}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {item.name} (Size {item.size}) × {item.quantity}
                </Typography>
                <Typography variant="body2">€{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">€{total?.toFixed(2) || '0.00'}</Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button component={Link} to="/shop" variant="contained">
              Continue Shopping
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default OrderSuccess;
