import { Box, Typography, Paper } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'framer-motion';

const salesData = [
  { month: 'Jan', revenue: 12400, orders: 28, customers: 22 },
  { month: 'Feb', revenue: 15800, orders: 35, customers: 28 },
  { month: 'Mar', revenue: 18200, orders: 41, customers: 33 },
  { month: 'Apr', revenue: 16500, orders: 37, customers: 30 },
  { month: 'May', revenue: 21300, orders: 48, customers: 38 },
  { month: 'Jun', revenue: 24800, orders: 55, customers: 45 },
];

const categoryData = [
  { name: 'Classic', value: 35 },
  { name: 'Minimal', value: 20 },
  { name: 'Suede', value: 18 },
  { name: 'Heritage', value: 15 },
  { name: 'Platform', value: 12 },
];

const COLORS = ['#C9A96E', '#E0C992', '#42A5F5', '#AB47BC', '#4CAF50'];

const AdminAnalytics = () => (
  <Box>
    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 3 }}>Analytics</Typography>

    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ flex: 2 }}>
        <Paper sx={{ p: 3, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', height: '100%' }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 3 }}>REVENUE TREND</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs><linearGradient id="goldGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9A96E" stopOpacity={0.3} /><stop offset="100%" stopColor="#C9A96E" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 4, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A96E" fill="url(#goldGrad2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ flex: 1 }}>
        <Paper sx={{ p: 3, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', height: '100%' }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 3 }}>SALES BY CATEGORY</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 4, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </motion.div>
    </Box>

    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Paper sx={{ p: 3, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 3 }}>ORDERS VS CUSTOMERS</Typography>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 4, fontSize: 12 }} />
            <Bar dataKey="orders" fill="#C9A96E" radius={[3, 3, 0, 0]} />
            <Bar dataKey="customers" fill="#42A5F5" radius={[3, 3, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  </Box>
);

export default AdminAnalytics;
