import { Box, Grid, Typography, Paper, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { motion } from 'framer-motion';
import { useAdminStats } from '@/hooks/useAdmin';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockSalesData = [
  { month: 'Jan', revenue: 12400, orders: 28 },
  { month: 'Feb', revenue: 15800, orders: 35 },
  { month: 'Mar', revenue: 18200, orders: 41 },
  { month: 'Apr', revenue: 16500, orders: 37 },
  { month: 'May', revenue: 21300, orders: 48 },
  { month: 'Jun', revenue: 24800, orders: 55 },
];

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `€${(stats?.total_revenue || 0).toLocaleString()}`, icon: <TrendingUpIcon />, color: '#C9A96E' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: <ShoppingCartOutlinedIcon />, color: '#4CAF50' },
    { label: 'Customers', value: stats?.total_customers || 0, icon: <PeopleOutlinedIcon />, color: '#42A5F5' },
    { label: 'Products', value: stats?.total_products || 0, icon: <Inventory2OutlinedIcon />, color: '#AB47BC' },
    { label: 'Low Stock', value: stats?.low_stock_products || 0, icon: <WarningAmberIcon />, color: '#FF7043' },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: <PendingActionsIcon />, color: '#FFCA28' },
  ];

  return (
    <Box>
      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((card, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
              <Paper
                sx={{
                  p: 2.5,
                  backgroundColor: '#111',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  transition: 'border-color 0.3s',
                  '&:hover': { borderColor: 'rgba(201,169,110,0.15)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ color: card.color, '& .MuiSvgIcon-root': { fontSize: '1.1rem' } }}>{card.icon}</Box>
                </Box>
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 400, color: '#F5F5F5', lineHeight: 1 }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', mt: 0.5 }}>
                  {card.label}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Paper sx={{ p: 3, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 3 }}>
                REVENUE OVERVIEW
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={mockSalesData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 4, fontSize: 12 }}
                    labelStyle={{ color: '#C9A96E' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C9A96E" fill="url(#goldGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Paper sx={{ p: 3, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 3 }}>
                MONTHLY ORDERS
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#C9A96E" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Paper sx={{ mt: 3, p: 3, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 2 }}>
            RECENT ORDERS
          </Typography>
          {stats?.recent_orders && stats.recent_orders.length > 0 ? (
            <Box>
              {stats.recent_orders.map((order: any, i: number) => (
                <Box key={order.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: i < stats.recent_orders!.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <Box>
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: '#F5F5F5' }}>
                      {order.shipping_name || 'Guest'}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      px: 1.5, py: 0.3,
                      backgroundColor: order.status === 'delivered' ? 'rgba(76,175,80,0.1)' : order.status === 'pending' ? 'rgba(255,202,40,0.1)' : 'rgba(201,169,110,0.1)',
                      borderRadius: '3px',
                    }}>
                      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.5rem', color: order.status === 'delivered' ? '#4CAF50' : order.status === 'pending' ? '#FFCA28' : '#C9A96E', textTransform: 'capitalize', letterSpacing: '0.1em' }}>
                        {order.status}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.75rem', color: '#C9A96E', fontWeight: 500 }}>
                      €{Number(order.total).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', py: 4 }}>
              No orders yet
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AdminDashboard;
