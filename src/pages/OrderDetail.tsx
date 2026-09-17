import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { errorMessage, type OrderStatus } from '@/api';
import SEO from '@/components/SEO';
import { useOrder } from '@/hooks/useOrders';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

const STATUS_COLOURS: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: 'rgba(255,202,40,0.1)', color: '#FFCA28' },
  confirmed: { bg: 'rgba(66,165,245,0.1)', color: '#42A5F5' },
  processing: { bg: 'rgba(171,71,188,0.1)', color: '#AB47BC' },
  shipped: { bg: 'rgba(201,169,110,0.1)', color: '#C9A96E' },
  delivered: { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50' },
  cancelled: { bg: 'rgba(207,102,121,0.1)', color: '#CF6679' },
};

/**
 * A single past order. This is also where the confirmation email's
 * "View your order" link lands, so it has to work from a cold page load with no
 * router state to lean on.
 */
const OrderDetail = () => {
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
        <Typography variant="h5" sx={{ mb: 1.5 }}>
          Order not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {errorMessage(error, 'It may belong to a different account.')}
        </Typography>
        <Button component={Link} to="/orders" variant="outlined">
          Back to My Orders
        </Button>
      </Container>
    );
  }

  const palette = STATUS_COLOURS[order.status];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, minHeight: '70vh' }}>
      <SEO
        title={`Order ${order.id.slice(0, 8).toUpperCase()} | Silvaine`}
        description="Your Silvaine order."
        url={`/orders/${order.id}`}
        noIndex
      />
      <Container maxWidth="sm">
        <Button
          component={Link}
          to="/orders"
          startIcon={<ArrowBackIcon sx={{ fontSize: '0.9rem' }} />}
          sx={{ mb: 4, color: 'text.secondary', fontSize: '0.7rem' }}
        >
          My Orders
        </Button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Order {order.id.slice(0, 8).toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placed{' '}
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
            <Chip
              label={order.status}
              sx={{
                backgroundColor: palette.bg,
                color: palette.color,
                textTransform: 'capitalize',
                fontSize: '0.6rem',
              }}
            />
          </Box>

          <Box sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            {order.shippingName && (
              <>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Shipping to
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {[
                    order.shippingName,
                    order.shippingAddress,
                    `${order.shippingCity ?? ''} ${order.shippingPostalCode ?? ''}`.trim(),
                    order.shippingCountry,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Typography>
                {order.shippingPhone && (
                  <Typography variant="caption" color="text.secondary">
                    {order.shippingPhone}
                  </Typography>
                )}
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {order.items?.map((item) => (
              <Box
                key={item.id}
                sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}
              >
                {item.productImage && (
                  <Box
                    component="img"
                    src={item.productImage}
                    alt={item.productName}
                    sx={{
                      width: 56,
                      height: 56,
                      objectFit: 'cover',
                      backgroundColor: '#141414',
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2">{item.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[item.size && `Size ${item.size}`, item.color]
                      .filter(Boolean)
                      .join(' · ')}{' '}
                    × {item.quantity}
                  </Typography>
                </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Payment
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {order.paymentStatus}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">
                {currency}
                {order.total.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default OrderDetail;
