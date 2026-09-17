import {
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '@/api';
import { useAdminInventory, useAdminStats } from '@/hooks/useAdmin';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

const PAGE_SIZE = 50;

/** Scale for the stock bar. Arbitrary, but at least now it is named. */
const HEALTHY_STOCK = 50;

const card = {
  p: 2.5,
  flex: 1,
  minWidth: 150,
  backgroundColor: '#111',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
};

/**
 * Stock overview.
 *
 * `stock <= 10` used to be written into this file, `ProductStockIndicator.tsx`
 * and `get_admin_stats()` separately — three copies of one business rule, free
 * to disagree. The server now decides what "low" means from
 * `LOW_STOCK_THRESHOLD` and returns `isLowStock` per row (spec §16.6).
 */
const AdminInventory = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminInventory({
    page,
    limit: PAGE_SIZE,
  });
  const { data: stats } = useAdminStats();
  const { data: settings = SETTINGS_FALLBACK } = useSettings();

  const items = data?.data ?? [];
  const meta = data?.meta;

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
          {errorMessage(error, 'Inventory could not be loaded.')}
        </Typography>
        <Button onClick={() => void refetch()} sx={{ color: '#C9A96E' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  // Counted over the current page; the dashboard total is authoritative and is
  // shown beside it rather than being silently conflated with this.
  const outOfStockOnPage = items.filter((item) => item.stock === 0).length;

  const summary = [
    { label: 'Total Products', value: stats?.total_products ?? meta?.total ?? 0, color: '#C9A96E' },
    { label: `Low Stock (≤ ${settings.lowStockThreshold})`, value: stats?.low_stock_products ?? 0, color: '#FF7043' },
    { label: 'Out of Stock (this page)', value: outOfStockOnPage, color: '#CF6679' },
  ];

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
        Inventory
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {summary.map((item) => (
          <Paper key={item.label} sx={card}>
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '2rem',
                color: item.color,
              }}
            >
              {item.value}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
              }}
            >
              {item.label}
            </Typography>
          </Paper>
        ))}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Stock Levels — Lowest First
          </Typography>
          <Typography
            component={Link}
            to="/admin/products"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              color: '#C9A96E',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            EDIT PRODUCTS
          </Typography>
        </Box>

        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                gap: 2,
              }}
            >
              <Box sx={{ flex: 2, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.72rem',
                    color: item.isActive ? '#F5F5F5' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {item.name}
                  {!item.isActive && ' · inactive'}
                </Typography>
                {item.sku && (
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.55rem',
                      color: 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {item.sku}
                  </Typography>
                )}
              </Box>

              <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (item.stock / HEALTHY_STOCK) * 100)}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        item.stock === 0 ? '#CF6679' : item.isLowStock ? '#FF7043' : '#4CAF50',
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.5)',
                    minWidth: 30,
                    textAlign: 'right',
                  }}
                >
                  {item.stock}
                </Typography>
              </Box>

              <Chip
                label={
                  item.stock === 0 ? 'Out of Stock' : item.isLowStock ? 'Low Stock' : 'In Stock'
                }
                size="small"
                sx={{
                  fontSize: '0.45rem',
                  height: 20,
                  letterSpacing: '0.08em',
                  backgroundColor:
                    item.stock === 0
                      ? 'rgba(207,102,121,0.1)'
                      : item.isLowStock
                        ? 'rgba(255,112,67,0.1)'
                        : 'rgba(76,175,80,0.1)',
                  color: item.stock === 0 ? '#CF6679' : item.isLowStock ? '#FF7043' : '#4CAF50',
                }}
              />
            </Box>
          </motion.div>
        ))}

        {items.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.75rem',
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            No products to report on.
          </Typography>
        )}
      </Paper>

      {meta && meta.totalPages > 1 && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}
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
    </Box>
  );
};

export default AdminInventory;
