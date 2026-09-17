import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { errorMessage } from '@/api';
import SEO from '@/components/SEO';
import { useOrder } from '@/hooks/useOrders';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

/**
 * Order confirmation.
 *
 * Previously this rendered entirely from `location.state`, so refreshing the
 * page — or following the link in a confirmation email — showed an empty
 * receipt with "N/A" where the order number should be. It now reads the order
 * by id, which the server only returns to the customer who owns it.
 */
const OrderSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error } = useOrder(id);
  const { data: settings = SETTINGS_FALLBACK } = useSettings();
  const currency = settings.currencySymbol;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 20, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 3 }} />
        <Typography variant="h5" sx={{ mb: 1.5 }}>
          We could not find that order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {errorMessage(error, 'It may belong to a different account.')}
        </Typography>
        <Button component={Link} to="/orders" variant="outlined">
          View Your Orders
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <SEO
        title="Order Confirmed | Silvaine"
        description="Your order has been confirmed."
        url={`/order-success/${order.id}`}
        noIndex
      />
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 64, color: 'success.main', mb: 3 }}
            />
            <Typography variant="h3" sx={{ mb: 2 }}>
              Order Confirmed
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for shopping with Silvaine.
            </Typography>
          </Box>

          <Box sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Order ID
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', fontFamily: 'monospace' }}
              >
                {order.id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Status
              </Typography>
              <Chip
                label={order.status}
                size="small"
                sx={{ textTransform: 'capitalize', fontSize: '0.6rem', height: 22 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Payment
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : (order.paymentMethod ?? 'Cash on Delivery')}{' '}
                · {order.paymentStatus}
              </Typography>
            </Box>

            {order.shippingName && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Shipping to
                </Typography>
                <Typography variant="body2">
                  {[
                    order.shippingName,
                    order.shippingAddress,
                    `${order.shippingCity ?? ''} ${order.shippingPostalCode ?? ''}`.trim(),
                    order.shippingCountry,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {order.items?.map((item) => (
              <Box
                key={item.id}
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">
                  {item.productName}
                  {item.size ? ` (Size ${item.size})` : ''} × {item.quantity}
                </Typography>
                <Typography variant="body2">
                  {currency}
                  {item.totalPrice.toFixed(2)}
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
                {order.subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Shipping
              </Typography>
              <Typography variant="body2">
                {order.shippingCost === 0
                  ? 'FREE'
                  : `${currency}${order.shippingCost.toFixed(2)}`}
              </Typography>
            </Box>
            {order.tax > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tax
                </Typography>
                <Typography variant="body2">
                  {currency}
                  {order.tax.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">
                {currency}
                {order.total.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              mt: 6,
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button component={Link} to="/shop" variant="contained">
              Continue Shopping
            </Button>
            <Button component={Link} to="/orders" variant="outlined">
              My Orders
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default OrderSuccess;
