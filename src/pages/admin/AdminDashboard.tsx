import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { errorMessage } from '@/api';
import { useAdminAnalytics, useAdminStats } from '@/hooks/useAdmin';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

const card = {
  p: 2.5,
  backgroundColor: '#111',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
};

const panel = {
  p: 3,
  backgroundColor: '#111',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
};

const panelLabel = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '0.7rem',
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.1em',
};

const axisTick = { fill: 'rgba(255,255,255,0.4)', fontSize: 10 };

const tooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(201,169,110,0.2)',
  borderRadius: 4,
  fontSize: 12,
};

/**
 * The back office dashboard.
 *
 * The KPI tiles were always real — `get_admin_stats()` computed them — but the
 * two charts underneath were a literal six-element array of invented revenue,
 * indistinguishable from the genuine figures beside them. Both now come from
 * `/admin/analytics/overview`.
 *
 * Note the caption under revenue. The figure counts orders marked *paid*, and
 * nothing marks them paid until an admin records the payment, so it will read
 * zero on a system taking cash on delivery. That was equally true before; it
 * simply was not said out loud.
 */
const AdminDashboard = () => {
  const { data: stats, isLoading, isError, error, refetch } = useAdminStats();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(6);
  const { data: settings = SETTINGS_FALLBACK } = useSettings();
  const currency = settings.currencySymbol;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  if (isError || !stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography sx={{ ...panelLabel, mb: 2 }}>
          {errorMessage(error, 'The dashboard could not be loaded.')}
        </Typography>
        <Button
          onClick={() => void refetch()}
          sx={{ color: '#C9A96E', fontSize: '0.7rem', letterSpacing: '0.15em' }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  const statCards = [
    {
      label: 'Paid Revenue',
      value: `${currency}${stats.total_revenue.toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: '#C9A96E',
      to: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: stats.total_orders,
      icon: <ShoppingCartOutlinedIcon />,
      color: '#4CAF50',
      to: '/admin/orders',
    },
    {
      label: 'Customers',
      value: stats.total_customers,
      icon: <PeopleOutlinedIcon />,
      color: '#42A5F5',
      to: '/admin/customers',
    },
    {
      label: 'Products',
      value: stats.total_products,
      icon: <Inventory2OutlinedIcon />,
      color: '#AB47BC',
      to: '/admin/products',
    },
    {
      label: 'Low Stock',
      value: stats.low_stock_products,
      icon: <WarningAmberIcon />,
      color: '#FF7043',
      to: '/admin/inventory',
    },
    {
      label: 'Pending Orders',
      value: stats.pending_orders,
      icon: <PendingActionsIcon />,
      color: '#FFCA28',
      to: '/admin/orders',
    },
  ];

  const series = analytics?.series ?? [];
  const hasActivity = series.some(
    (point) => point.orders > 0 || point.grossValue > 0,
  );

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.6rem',
          fontWeight: 300,
          letterSpacing: '0.08em',
          color: '#F5F5F5',
          mb: 4,
        }}
      >
        Dashboard Overview
      </Typography>

      {/* KPI tiles */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((item, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={item.label}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Paper
                component={Link}
                to={item.to}
                sx={{
                  ...card,
                  display: 'block',
                  textDecoration: 'none',
                  transition: 'border-color 0.3s',
                  '&:hover': { borderColor: 'rgba(201,169,110,0.25)' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ color: item.color, '& .MuiSvgIcon-root': { fontSize: '1.1rem' } }}>
                    {item.icon}
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: '#F5F5F5',
                    lineHeight: 1,
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
                    mt: 0.5,
                  }}
                >
                  {item.label}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={panel}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  mb: 3,
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography sx={panelLabel}>REVENUE — LAST 6 MONTHS</Typography>
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.5rem',
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  Gold: paid · Blue: booked, awaiting payment
                </Typography>
              </Box>

              {analyticsLoading ? (
                <ChartPlaceholder height={280} />
              ) : hasActivity ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#42A5F5" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#42A5F5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: '#C9A96E' }}
                      formatter={(value: number, name) => [
                        `${currency}${Number(value).toFixed(2)}`,
                        name === 'revenue' ? 'Paid' : 'Booked',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="grossValue"
                      stroke="#42A5F5"
                      fill="url(#blueGrad)"
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#C9A96E"
                      fill="url(#goldGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No orders in the last six months." />
              )}
            </Paper>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Paper sx={panel}>
              <Typography sx={{ ...panelLabel, mb: 3 }}>MONTHLY ORDERS</Typography>
              {analyticsLoading ? (
                <ChartPlaceholder height={280} />
              ) : hasActivity ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="orders" fill="#C9A96E" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No orders yet." />
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Paper sx={{ ...panel, mt: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography sx={panelLabel}>RECENT ORDERS</Typography>
            <Typography
              component={Link}
              to="/admin/orders"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.55rem',
                letterSpacing: '0.15em',
                color: '#C9A96E',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              VIEW ALL
            </Typography>
          </Box>

          {stats.recent_orders.length > 0 ? (
            <Box>
              {stats.recent_orders.map((order, i) => (
                <Box
                  key={order.id}
                  component={Link}
                  to="/admin/orders"
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    textDecoration: 'none',
                    borderBottom:
                      i < stats.recent_orders.length - 1
                        ? '1px solid rgba(255,255,255,0.05)'
                        : 'none',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.7rem',
                        color: '#F5F5F5',
                      }}
                    >
                      {order.shipping_name || 'Guest'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.3,
                        backgroundColor:
                          order.status === 'delivered'
                            ? 'rgba(76,175,80,0.1)'
                            : order.status === 'pending'
                              ? 'rgba(255,202,40,0.1)'
                              : 'rgba(201,169,110,0.1)',
                        borderRadius: '3px',
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.5rem',
                          color:
                            order.status === 'delivered'
                              ? '#4CAF50'
                              : order.status === 'pending'
                                ? '#FFCA28'
                                : '#C9A96E',
                          textTransform: 'capitalize',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {order.status}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.75rem',
                        color: '#C9A96E',
                        fontWeight: 500,
                      }}
                    >
                      {currency}
                      {Number(order.total).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
                py: 4,
              }}
            >
              No orders yet
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

const ChartPlaceholder = ({ height }: { height: number }) => (
  <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress size={22} sx={{ color: '#C9A96E' }} />
  </Box>
);

const EmptyChart = ({ message }: { message: string }) => (
  <Box
    sx={{
      height: 280,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 3,
    }}
  >
    <Typography
      sx={{
        fontFamily: '"Montserrat", sans-serif',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.25)',
      }}
    >
      {message}
    </Typography>
  </Box>
);

export default AdminDashboard;
