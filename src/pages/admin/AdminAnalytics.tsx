import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { errorMessage } from '@/api';
import { useAdminAnalytics, useAdminCategorySales } from '@/hooks/useAdmin';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

const COLORS = ['#C9A96E', '#E0C992', '#42A5F5', '#AB47BC', '#4CAF50', '#FF7043'];

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

const PERIODS = [3, 6, 12, 24];

/**
 * Analytics.
 *
 * This page was entirely fictional: `salesData` and `categoryData` were literal
 * arrays at the top of the file, so the charts told the same confident story on
 * an empty database as on a busy one (spec G-07). Every figure below is now an
 * aggregate over real orders.
 *
 * Where there is nothing to show, it says so rather than drawing a plausible
 * line — an admin acting on invented numbers is worse off than one who knows
 * the data is not there yet.
 */
const AdminAnalytics = () => {
  const [months, setMonths] = useState(6);

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminAnalytics(months);
  const { data: categorySales = [], isLoading: categoryLoading } =
    useAdminCategorySales(months);
  const { data: settings = SETTINGS_FALLBACK } = useSettings();
  const currency = settings.currencySymbol;

  const series = analytics?.series ?? [];
  const hasActivity = series.some((p) => p.orders > 0 || p.grossValue > 0);

  const money = (value: number) => `${currency}${value.toLocaleString()}`;

  const summary = [
    { label: 'Paid Revenue', value: money(analytics?.totalRevenue ?? 0) },
    { label: 'Booked Value', value: money(analytics?.totalGrossValue ?? 0) },
    { label: 'Orders', value: analytics?.totalOrders ?? 0 },
    { label: 'New Customers', value: analytics?.totalNewCustomers ?? 0 },
    { label: 'Avg. Order Value', value: money(analytics?.averageOrderValue ?? 0) },
  ];

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
        <Typography sx={{ ...panelLabel, mb: 2 }}>
          {errorMessage(error, 'Analytics could not be loaded.')}
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

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.6rem',
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: '#F5F5F5',
          }}
        >
          Analytics
        </Typography>

        <Select
          size="small"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          sx={{ backgroundColor: '#111', fontSize: '0.72rem', minWidth: 150 }}
        >
          {PERIODS.map((value) => (
            <MenuItem key={value} value={value} sx={{ fontSize: '0.75rem' }}>
              Last {value} months
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Summary strip */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {summary.map((item) => (
          <Paper key={item.label} sx={{ ...panel, flex: '1 1 160px', minWidth: 150 }}>
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.6rem',
                color: '#C9A96E',
                lineHeight: 1.1,
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
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ flex: 2 }}
        >
          <Paper sx={{ ...panel, height: '100%' }}>
            <Typography sx={{ ...panelLabel, mb: 3 }}>REVENUE TREND</Typography>
            {hasActivity ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name) => [
                      `${currency}${Number(value).toFixed(2)}`,
                      name === 'revenue' ? 'Paid' : 'Booked',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="grossValue"
                    stroke="#42A5F5"
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C9A96E"
                    fill="url(#goldGrad2)"
                    strokeWidth={2}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty message="No orders in this period." height={300} />
            )}
          </Paper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ flex: 1 }}
        >
          <Paper sx={{ ...panel, height: '100%' }}>
            <Typography sx={{ ...panelLabel, mb: 3 }}>UNITS BY CATEGORY</Typography>
            {categoryLoading ? (
              <Empty message="" height={300} loading />
            ) : categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {categorySales.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, _name, entry) => [
                      `${value} units · ${currency}${Number(
                        (entry?.payload as { revenue?: number })?.revenue ?? 0,
                      ).toFixed(2)}`,
                      entry?.payload?.name as string,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty message="Nothing sold in this period." height={300} />
            )}
          </Paper>
        </motion.div>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper sx={panel}>
          <Typography sx={{ ...panelLabel, mb: 3 }}>ORDERS VS NEW CUSTOMERS</Typography>
          {series.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="orders" name="Orders" fill="#C9A96E" radius={[3, 3, 0, 0]} />
                <Bar
                  dataKey="newCustomers"
                  name="New customers"
                  fill="#42A5F5"
                  radius={[3, 3, 0, 0]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty message="No activity in this period." height={280} />
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

const Empty = ({
  message,
  height,
  loading = false,
}: {
  message: string;
  height: number;
  loading?: boolean;
}) => (
  <Box
    sx={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 3,
    }}
  >
    {loading ? (
      <CircularProgress size={22} sx={{ color: '#C9A96E' }} />
    ) : (
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.25)',
        }}
      >
        {message}
      </Typography>
    )}
  </Box>
);

export default AdminAnalytics;
