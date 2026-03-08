import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdmin';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppSelector } from '@/redux/hooks';
import { selectCartCount } from '@/redux/slices/cartSlice';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const cartCount = useAppSelector(selectCartCount);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/');
  };

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, md: 6 },
            py: 1,
            minHeight: { xs: 64, md: 80 },
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 5 }}>
              {navLinks.map((link) => (
                <Typography
                  key={link.path}
                  component={Link}
                  to={link.path}
                  variant="subtitle1"
                  sx={{
                    textDecoration: 'none',
                    color: location.pathname === link.path ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.3s ease',
                    '&:hover': { color: 'primary.main' },
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -4,
                      left: 0,
                      width: location.pathname === link.path ? '100%' : '0%',
                      height: '1px',
                      backgroundColor: 'primary.main',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover::after': { width: '100%' },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>
          )}

          <Typography
            component={Link}
            to="/"
            variant="h4"
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 300,
              letterSpacing: '0.3em',
              position: isMobile ? 'absolute' : 'relative',
              left: isMobile ? '50%' : 'auto',
              transform: isMobile ? 'translateX(-50%)' : 'none',
            }}
          >
            SILVAINE
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {user ? (
              <>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'primary.main' }}>
                  <PersonOutlineIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    sx: { backgroundColor: 'background.paper', backgroundImage: 'none', minWidth: 180 },
                  }}
                >
                  <MenuItem disabled>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      {user.email}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <LogoutIcon sx={{ fontSize: '1rem', mr: 1 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton component={Link} to="/login" sx={{ color: 'text.primary' }}>
                <PersonOutlineIcon />
              </IconButton>
            )}
            {!isMobile && (
              <IconButton sx={{ color: 'text.primary' }}>
                <FavoriteBorderIcon />
              </IconButton>
            )}
            <IconButton component={Link} to="/cart" sx={{ color: 'text.primary' }}>
              <Badge
                badgeContent={cartCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <AnimatePresence>
        {mobileOpen && (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{
              sx: { width: '100%', maxWidth: 360, backgroundColor: 'background.default', backgroundImage: 'none' },
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Typography variant="h5" sx={{ letterSpacing: '0.3em' }}>SILVAINE</Typography>
                <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
              </Box>
              <List>
                {navLinks.map((link, index) => (
                  <motion.div key={link.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <ListItem
                      component={Link}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider', textDecoration: 'none' }}
                    >
                      <ListItemText
                        primary={link.label}
                        primaryTypographyProps={{
                          variant: 'h6',
                          sx: { color: location.pathname === link.path ? 'primary.main' : 'text.primary', letterSpacing: '0.1em' },
                        }}
                      />
                    </ListItem>
                  </motion.div>
                ))}
                {user ? (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.1 }}>
                    <ListItem
                      onClick={() => { setMobileOpen(false); handleSignOut(); }}
                      sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                    >
                      <ListItemText primary="Sign Out" primaryTypographyProps={{ variant: 'h6', sx: { color: 'text.primary', letterSpacing: '0.1em' } }} />
                    </ListItem>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.1 }}>
                    <ListItem
                      component={Link}
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider', textDecoration: 'none' }}
                    >
                      <ListItemText primary="Sign In" primaryTypographyProps={{ variant: 'h6', sx: { color: 'primary.main', letterSpacing: '0.1em' } }} />
                    </ListItem>
                  </motion.div>
                )}
              </List>
            </Box>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
