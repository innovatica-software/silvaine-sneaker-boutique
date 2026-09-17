import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUSES,
  errorMessage,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/api';
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from '@/hooks/useAdmin';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

const statusColors: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: 'rgba(255,202,40,0.1)', color: '#FFCA28' },
  confirmed: { bg: 'rgba(66,165,245,0.1)', color: '#42A5F5' },
  processing: { bg: 'rgba(171,71,188,0.1)', color: '#AB47BC' },
  shipped: { bg: 'rgba(201,169,110,0.1)', color: '#C9A96E' },
  delivered: { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50' },
  cancelled: { bg: 'rgba(207,102,121,0.1)', color: '#CF6679' },
};

const PAGE_SIZE = 20;

const headerCell = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '0.55rem',
  color: 'rgba(255,255,255,0.35)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  flex: 1,
};

/**
 * Order fulfilment.
 *
 * Two things changed beyond swapping the data source. Status is a state machine
 * now — the dropdown only offers moves the server will accept, and an illegal
 * one is refused with a 422 rather than silently written — and cancelling an
 * order restores the stock it reserved. Paging and status filtering happen on
 * the server instead of over a fully-downloaded list.
 */
const AdminOrders = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminOrders({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const updateStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const { data: settings = SETTINGS_FALLBACK } = useSettings();
  const currency = settings.currencySymbol;

  const orders = data?.data ?? [];
  const meta = data?.meta;

  /**
   * Search stays client-side over the current page. The API has no order-search
   * parameter, and inventing a filter that only sees 20 rows at a time would be
   * worse than one that is honestly scoped to what is on screen.
   */
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter(
      (order) =>
        (order.shippingName ?? '').toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term),
    );
  }, [orders, search]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      setFeedback({ message: `Order moved to ${status}.`, severity: 'success' });
      setDetailOrder(null);
    } catch (err) {
      setFeedback({
        message: errorMessage(err, 'The status could not be changed.'),
        severity: 'error',
      });
    }
  };

  const handlePaymentChange = async (id: string, paymentStatus: PaymentStatus) => {
    try {
      await updatePaymentStatus.mutateAsync({ id, paymentStatus });
      setFeedback({ message: `Payment marked ${paymentStatus}.`, severity: 'success' });
    } catch (err) {
      setFeedback({
        message: errorMessage(err, 'The payment status could not be changed.'),
        severity: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mb: 2 }}>
          {errorMessage(error, 'Orders could not be loaded.')}
        </Typography>
        <Button onClick={() => void refetch()} sx={{ color: '#C9A96E' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.6rem',
          fontWeight: 300,
          letterSpacing: '0.08em',
          color: '#F5F5F5',
          mb: 3,
        }}
      >
        Orders
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search this page…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', md: 250 },
            '& .MuiOutlinedInput-root': { backgroundColor: '#111', fontSize: '0.75rem' },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | 'all');
              setPage(1);
            }}
            sx={{ backgroundColor: '#111', fontSize: '0.75rem' }}
          >
            <MenuItem value="all">All</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {meta && (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.3)',
              ml: 'auto',
            }}
          >
            {meta.total} order{meta.total === 1 ? '' : 's'}
            {isFetching ? ' · refreshing' : ''}
          </Typography>
        )}
      </Box>

      <Paper
        sx={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            gap: 2,
          }}
        >
          {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Update'].map((h) => (
            <Typography key={h} sx={headerCell}>
              {h}
            </Typography>
          ))}
        </Box>

        {visible.map((order, i) => {
          const allowed = ORDER_STATUS_TRANSITIONS[order.status];

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { md: 'center' },
                  px: 2.5,
                  py: 1.5,
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  gap: { xs: 1, md: 2 },
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' },
                  transition: 'background-color 0.2s',
                }}
                onClick={() => setDetailOrder(order)}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {order.id.slice(0, 8)}
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.72rem',
                    color: '#F5F5F5',
                  }}
                >
                  {order.shippingName || 'Guest'}
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.75rem',
                    color: '#C9A96E',
                    fontWeight: 500,
                  }}
                >
                  {currency}
                  {order.total.toFixed(2)}
                </Typography>

                <Box sx={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                  <Select
                    size="small"
                    value={order.paymentStatus}
                    onChange={(e) =>
                      void handlePaymentChange(order.id, e.target.value as PaymentStatus)
                    }
                    sx={{ fontSize: '0.62rem', backgroundColor: '#1a1a1a', minWidth: 100 }}
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }}
                      >
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={order.status}
                    size="small"
                    sx={{
                      fontSize: '0.5rem',
                      height: 22,
                      textTransform: 'capitalize',
                      backgroundColor: statusColors[order.status].bg,
                      color: statusColors[order.status].color,
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                  {allowed.length === 0 ? (
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.58rem',
                        color: 'rgba(255,255,255,0.25)',
                      }}
                    >
                      Final
                    </Typography>
                  ) : (
                    <FormControl size="small" sx={{ minWidth: 118 }}>
                      <Select
                        value=""
                        displayEmpty
                        renderValue={() => 'Move to…'}
                        onChange={(e) =>
                          void handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        sx={{ fontSize: '0.62rem', backgroundColor: '#1a1a1a' }}
                      >
                        {/* Only legal transitions are offered; the server
                            rejects anything else with a 422 regardless. */}
                        {allowed.map((s) => (
                          <MenuItem
                            key={s}
                            value={s}
                            sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }}
                          >
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>
            </motion.div>
          );
        })}

        {visible.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.75rem',
            }}
          >
            {search
              ? 'No orders on this page match your search.'
              : statusFilter !== 'all'
                ? `No ${statusFilter} orders.`
                : 'No orders yet.'}
          </Typography>
        )}
      </Paper>

      {meta && meta.totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ fontSize: '0.65rem', color: '#C9A96E' }}
          >
            Previous
          </Button>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
            Page {meta.page} of {meta.totalPages}
          </Typography>
          <Button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            sx={{ fontSize: '0.65rem', color: '#C9A96E' }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Detail dialog */}
      <Dialog
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none' } }}
      >
        {detailOrder && (
          <>
            <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: '0.08em' }}>
              Order Details
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DetailRow label="Order ID" value={detailOrder.id} mono />
                <DetailRow label="Customer" value={detailOrder.shippingName ?? 'N/A'} />
                <DetailRow
                  label="Address"
                  value={[
                    detailOrder.shippingAddress,
                    detailOrder.shippingCity,
                    detailOrder.shippingPostalCode,
                    detailOrder.shippingCountry,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                />
                {detailOrder.shippingPhone && (
                  <DetailRow label="Phone" value={detailOrder.shippingPhone} />
                )}
                <DetailRow
                  label="Placed"
                  value={new Date(detailOrder.createdAt).toLocaleString()}
                />
                <DetailRow
                  label="Payment"
                  value={`${detailOrder.paymentMethod ?? '—'} · ${detailOrder.paymentStatus}`}
                />

                {detailOrder.items && detailOrder.items.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.6rem',
                        color: 'rgba(255,255,255,0.35)',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        mb: 1,
                      }}
                    >
                      Items
                    </Typography>
                    {detailOrder.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 0.8,
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.7rem', color: '#F5F5F5' }}>
                          {item.productName}
                          {item.size ? ` · ${item.size}` : ''} × {item.quantity}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#C9A96E' }}>
                          {currency}
                          {item.totalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ mt: 1 }}>
                  <DetailRow
                    label="Subtotal"
                    value={`${currency}${detailOrder.subtotal.toFixed(2)}`}
                  />
                  <DetailRow
                    label="Shipping"
                    value={`${currency}${detailOrder.shippingCost.toFixed(2)}`}
                  />
                  {detailOrder.tax > 0 && (
                    <DetailRow label="Tax" value={`${currency}${detailOrder.tax.toFixed(2)}`} />
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                      Total
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#C9A96E', fontWeight: 500 }}>
                      {currency}
                      {detailOrder.total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {ORDER_STATUS_TRANSITIONS[detailOrder.status].length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {ORDER_STATUS_TRANSITIONS[detailOrder.status].map((next) => (
                      <Button
                        key={next}
                        size="small"
                        disabled={updateStatus.isPending}
                        onClick={() => void handleStatusChange(detailOrder.id, next)}
                        sx={{
                          fontSize: '0.6rem',
                          letterSpacing: '0.1em',
                          textTransform: 'capitalize',
                          color: statusColors[next].color,
                          border: '1px solid rgba(255,255,255,0.08)',
                          px: 2,
                        }}
                      >
                        Mark {next}
                      </Button>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={feedback?.severity ?? 'success'}
          onClose={() => setFeedback(null)}
          sx={{ fontSize: '0.75rem' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const DetailRow = ({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '0.7rem',
        color: '#F5F5F5',
        textAlign: 'right',
        fontFamily: mono ? 'monospace' : undefined,
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default AdminOrders;
