import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { errorMessage, type Order, type OrderStatus } from '@/api';
import SEO from '@/components/SEO';
import { useMyOrders } from '@/hooks/useOrders';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

/** Same palette the admin order list uses, so a status reads the same everywhere. */
const STATUS_COLOURS: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: 'rgba(255,202,40,0.1)', color: '#FFCA28' },
  confirmed: { bg: 'rgba(66,165,245,0.1)', color: '#42A5F5' },
  processing: { bg: 'rgba(171,71,188,0.1)', color: '#AB47BC' },
  shipped: { bg: 'rgba(201,169,110,0.1)', color: '#C9A96E' },
  delivered: { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50' },
  cancelled: { bg: 'rgba(207,102,121,0.1)', color: '#CF6679' },
};

/**
 * The customer's order history.
 *
 * `orders` always granted each user SELECT on their own rows, but no page in
 * the application ever consumed it — customers could place an order (in theory)
 * and then never see it again (spec G-05).
 */
const Orders = () => {
  const { data, isLoading, isError, error, refetch } = useMyOrders({ limit: 20 });
  const { data: settings = SETTINGS_FALLBACK } = useSettings();
  const currency = settings.currencySymbol;

  const orders = data?.data ?? [];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, minHeight: '70vh' }}>
      <SEO
        title="My Orders | Silvaine"
        description="Track your Silvaine orders."
        url="/orders"
        noIndex
      />
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            mb: 6,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            textAlign: 'center',
          }}
        >
          My Orders
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {errorMessage(error, 'Your orders could not be loaded.')}
            </Typography>
            <Button onClick={() => void refetch()} variant="outlined">
              Try Again
            </Button>
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <ReceiptLongOutlinedIcon
              sx={{ fontSize: 56, color: 'text.secondary', mb: 3 }}
            />
            <Typography variant="h5" sx={{ mb: 1.5 }}>
              No orders yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              When you place an order it will appear here.
            </Typography>
            <Button component={Link} to="/shop" variant="contained">
              Start Shopping
            </Button>
          </Box>
        ) : (
          orders.map((order, index) => (
            <OrderRow
              key={order.id}
              order={order}
              index={index}
              currency={currency}
            />
          ))
        )}
      </Container>
    </Box>
  );
};

const OrderRow = ({
  order,
  index,
  currency,
}: {
  order: Order;
  index: number;
  currency: string;
}) => {
  const palette = STATUS_COLOURS[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Box
        component={Link}
        to={`/orders/${order.id}`}
        sx={{
          display: 'block',
          textDecoration: 'none',
          p: 3,
          mb: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'border-color 0.3s ease',
          '&:hover': { borderColor: 'rgba(201,169,110,0.3)' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
            >
              {order.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={order.status}
              size="small"
              sx={{
                backgroundColor: palette.bg,
                color: palette.color,
                textTransform: 'capitalize',
                fontSize: '0.55rem',
                height: 22,
              }}
            />
            <Typography variant="body1" sx={{ color: 'primary.main' }}>
              {currency}
              {order.total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {order.items && order.items.length > 0 && (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.04)' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {order.items
                .map((item) => `${item.productName} × ${item.quantity}`)
                .join(' · ')}
            </Typography>
          </>
        )}
      </Box>
    </motion.div>
  );
};

export default Orders;
