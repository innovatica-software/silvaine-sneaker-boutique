import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useAuth } from '@/contexts/AuthContext';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardOutlinedIcon /> },
  { label: 'Products', path: '/admin/products', icon: <Inventory2OutlinedIcon /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCartOutlinedIcon /> },
  { label: 'Inventory', path: '/admin/inventory', icon: <WarehouseOutlinedIcon /> },
  { label: 'Categories', path: '/admin/categories', icon: <CategoryOutlinedIcon /> },
  { label: 'Customers', path: '/admin/customers', icon: <PeopleOutlinedIcon /> },
  { label: 'Reviews', path: '/admin/reviews', icon: <ReviewsOutlinedIcon /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChartOutlinedIcon /> },
  { label: 'Settings', path: '/admin/settings', icon: <SettingsOutlinedIcon /> },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0D0D0D' }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, backgroundColor: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#0A0A0A', fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '0.9rem' }}>S</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.15em', color: '#F5F5F5' }}>
              SILVAINE
            </Typography>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.45rem', letterSpacing: '0.25em', color: '#C9A96E', textTransform: 'uppercase' }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              borderRadius: '4px',
              mb: 0.3,
              py: 1,
              px: 1.5,
              color: isActive(item.path) ? '#C9A96E' : 'rgba(255,255,255,0.5)',
              backgroundColor: isActive(item.path) ? 'rgba(201,169,110,0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(201,169,110,0.06)',
                color: '#C9A96E',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: '1.1rem' } }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                sx: { fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', fontWeight: isActive(item.path) ? 500 : 400, letterSpacing: '0.05em' },
              }}
            />
            {isActive(item.path) && (
              <Box sx={{ width: 3, height: 16, backgroundColor: '#C9A96E', borderRadius: 2 }} />
            )}
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 2 }} />

      {/* Store link */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <ListItemButton
          component={Link}
          to="/"
          sx={{ borderRadius: '4px', py: 1, px: 1.5, color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#C9A96E', backgroundColor: 'rgba(201,169,110,0.06)' } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: '1.1rem' } }}>
            <StorefrontOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="View Store" primaryTypographyProps={{ sx: { fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', letterSpacing: '0.05em' } }} />
        </ListItemButton>
      </Box>

      {/* User */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 30, height: 30, backgroundColor: 'rgba(201,169,110,0.15)', color: '#C9A96E', fontSize: '0.7rem', fontFamily: '"Montserrat", sans-serif' }}>
          {user?.email?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: '#F5F5F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </Typography>
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.5rem', color: '#C9A96E', letterSpacing: '0.1em' }}>
            Administrator
          </Typography>
        </Box>
        <IconButton onClick={handleSignOut} size="small" sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#CF6679' } }}>
          <LogoutIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          {sidebarContent}
        </Box>
      )}

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: DRAWER_WIDTH, backgroundColor: '#0D0D0D', backgroundImage: 'none' } }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top header */}
        <Box
          sx={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backgroundColor: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(20px)',
            gap: 2,
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
            {navItems.find((n) => isActive(n.path))?.label || 'Admin'}
          </Typography>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
