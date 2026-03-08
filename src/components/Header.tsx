import { useState, useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
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
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useAppSelector(selectCartCount);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.97)' : 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(30px)',
          borderBottom: scrolled
            ? '1px solid rgba(201, 169, 110, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.04)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: scrolled ? '100%' : '0%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)',
            transition: 'width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, md: 8, lg: 12 },
            py: scrolled ? 0.8 : 1.5,
            minHeight: { xs: 60, md: scrolled ? 70 : 84 },
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        >
          {/* Left: Mobile hamburger or Desktop nav */}
          {isMobile ? (
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                color: 'text.primary',
                '&:hover': { color: '#C9A96E' },
              }}
            >
              <MenuIcon sx={{ fontSize: '1.3rem' }} />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 4.5, alignItems: 'center' }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Typography
                    key={link.path}
                    component={Link}
                    to={link.path}
                    variant="subtitle1"
                    sx={{
                      textDecoration: 'none',
                      color: isActive ? '#C9A96E' : 'rgba(245, 245, 245, 0.65)',
                      fontWeight: isActive ? 400 : 300,
                      fontSize: '0.68rem',
                      letterSpacing: '0.2em',
                      transition: 'all 0.35s ease',
                      '&:hover': { color: '#C9A96E' },
                      position: 'relative',
                      py: 0.5,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isActive ? '100%' : '0%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
                        transition: 'width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      },
                      '&:hover::after': { width: '100%' },
                    }}
                  >
                    {link.label}
                  </Typography>
                );
              })}
            </Box>
          )}

          {/* Center: Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              position: isMobile ? 'absolute' : 'relative',
              left: isMobile ? '50%' : 'auto',
              transform: isMobile ? 'translateX(-50%)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: '#F5F5F5',
                fontWeight: 300,
                letterSpacing: '0.35em',
                fontSize: { xs: '1.3rem', md: scrolled ? '1.4rem' : '1.6rem' },
                transition: 'font-size 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                textShadow: '0 0 40px rgba(201, 169, 110, 0.08)',
              }}
            >
              SILVAINE
            </Typography>
            {!scrolled && !isMobile && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.45rem',
                    letterSpacing: '0.5em',
                    color: 'rgba(201, 169, 110, 0.5)',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                  }}
                >
                  Maison de Chaussures
                </Typography>
              </motion.div>
            )}
          </Box>

          {/* Right: Action icons */}
          <Box sx={{ display: 'flex', gap: { xs: 0.3, md: 0.8 }, alignItems: 'center' }}>
            {/* Search icon - desktop only */}

            {user ? (
              <>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    color: '#C9A96E',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#E0C992',
                      backgroundColor: 'rgba(201, 169, 110, 0.06)',
                    },
                  }}
                >
                  <PersonOutlineIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      backgroundColor: 'rgba(18, 18, 18, 0.98)',
                      backdropFilter: 'blur(30px)',
                      backgroundImage: 'none',
                      minWidth: 220,
                      border: '1px solid rgba(201, 169, 110, 0.1)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      mt: 1.5,
                      py: 0.5,
                      '& .MuiMenuItem-root': {
                        px: 2.5,
                        py: 1.2,
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.72rem',
                        letterSpacing: '0.08em',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(201, 169, 110, 0.06)',
                          color: '#C9A96E',
                        },
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2.5, py: 1.5 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.55rem',
                        letterSpacing: '0.2em',
                        color: 'rgba(201, 169, 110, 0.6)',
                        textTransform: 'uppercase',
                        mb: 0.3,
                      }}
                    >
                      Signed in as
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.7rem',
                        color: 'rgba(245, 245, 245, 0.8)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(201, 169, 110, 0.08)', my: 0.5 }} />
                  {isAdmin && (
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin'); }}>
                      <DashboardOutlinedIcon sx={{ fontSize: '0.95rem', mr: 1.5, color: '#C9A96E' }} />
                      Admin Panel
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleSignOut}>
                    <LogoutIcon sx={{ fontSize: '0.95rem', mr: 1.5 }} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                component={Link}
                to="/login"
                sx={{
                  color: 'rgba(245, 245, 245, 0.65)',
                  '&:hover': {
                    color: '#C9A96E',
                    backgroundColor: 'rgba(201, 169, 110, 0.06)',
                  },
                }}
              >
                <PersonOutlineIcon sx={{ fontSize: '1.25rem' }} />
              </IconButton>
            )}

            {!isMobile && (
              <IconButton
                sx={{
                  color: 'rgba(245, 245, 245, 0.65)',
                  '&:hover': {
                    color: '#C9A96E',
                    backgroundColor: 'rgba(201, 169, 110, 0.06)',
                  },
                }}
              >
                <FavoriteBorderIcon sx={{ fontSize: '1.2rem' }} />
              </IconButton>
            )}

            <IconButton
              component={Link}
              to="/cart"
              sx={{
                color: 'rgba(245, 245, 245, 0.65)',
                '&:hover': {
                  color: '#C9A96E',
                  backgroundColor: 'rgba(201, 169, 110, 0.06)',
                },
              }}
            >
              <Badge
                badgeContent={cartCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#C9A96E',
                    color: '#0A0A0A',
                    fontSize: '0.58rem',
                    fontFamily: '"Montserrat", sans-serif',
                    fontWeight: 600,
                    minWidth: 17,
                    height: 17,
                    boxShadow: '0 2px 12px rgba(201, 169, 110, 0.35)',
                  },
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: '1.2rem' }} />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer to offset fixed navbar + announcement bar */}
      <Box sx={{ height: { xs: 88, md: scrolled ? 70 : 112 }, transition: 'height 0.4s ease' }} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{
              sx: {
                width: '100%',
                maxWidth: 380,
                backgroundColor: '#0A0A0A',
                backgroundImage: 'none',
                borderRight: '1px solid rgba(201, 169, 110, 0.08)',
              },
            }}
          >
            <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Drawer header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      letterSpacing: '0.35em',
                      fontSize: '1.3rem',
                      color: '#F5F5F5',
                    }}
                  >
                    SILVAINE
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.42rem',
                      letterSpacing: '0.5em',
                      color: 'rgba(201, 169, 110, 0.5)',
                      textTransform: 'uppercase',
                      mt: 0.3,
                    }}
                  >
                    Maison de Chaussures
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    color: 'rgba(245, 245, 245, 0.5)',
                    '&:hover': { color: '#C9A96E' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Nav links */}
              <List sx={{ flex: 1 }}>
                {navLinks.map((link, index) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                    >
                      <ListItem
                        component={Link}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        sx={{
                          py: 2.5,
                          px: 0,
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            pl: 1,
                          },
                        }}
                      >
                        <ListItemText
                          primary={link.label}
                          primaryTypographyProps={{
                            sx: {
                              fontFamily: '"Cormorant Garamond", serif',
                              fontSize: '1.6rem',
                              fontWeight: 300,
                              letterSpacing: '0.08em',
                              color: isActive ? '#C9A96E' : 'rgba(245, 245, 245, 0.75)',
                              transition: 'all 0.3s ease',
                              '&:hover': { color: '#C9A96E' },
                            },
                          }}
                        />
                        {isActive && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#C9A96E',
                              boxShadow: '0 0 12px rgba(201, 169, 110, 0.5)',
                            }}
                          />
                        )}
                      </ListItem>
                    </motion.div>
                  );
                })}

                {/* Admin link in mobile */}
                {isAdmin && user && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.08, duration: 0.4 }}
                  >
                    <ListItem
                      component={Link}
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        py: 2.5,
                        px: 0,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        textDecoration: 'none',
                      }}
                    >
                      <ListItemText
                        primary="Admin Panel"
                        primaryTypographyProps={{
                          sx: {
                            fontFamily: '"Cormorant Garamond", serif',
                            fontSize: '1.6rem',
                            fontWeight: 300,
                            letterSpacing: '0.08em',
                            color: 'rgba(201, 169, 110, 0.75)',
                          },
                        }}
                      />
                      <DashboardOutlinedIcon sx={{ color: 'rgba(201, 169, 110, 0.4)', fontSize: '1.1rem' }} />
                    </ListItem>
                  </motion.div>
                )}
              </List>

              {/* Bottom section */}
              <Box sx={{ pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                {user ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.55rem',
                        letterSpacing: '0.2em',
                        color: 'rgba(201, 169, 110, 0.4)',
                        textTransform: 'uppercase',
                        mb: 1,
                      }}
                    >
                      Account
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.72rem',
                        color: 'rgba(245, 245, 245, 0.6)',
                        mb: 2.5,
                      }}
                    >
                      {user.email}
                    </Typography>
                    <Box
                      onClick={() => { setMobileOpen(false); handleSignOut(); }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        color: 'rgba(245, 245, 245, 0.5)',
                        transition: 'color 0.3s ease',
                        '&:hover': { color: '#C9A96E' },
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: '0.9rem' }} />
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.7rem',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Sign Out
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Box
                      component={Link}
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        textDecoration: 'none',
                        color: '#C9A96E',
                        transition: 'opacity 0.3s ease',
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      <PersonOutlineIcon sx={{ fontSize: '1.1rem' }} />
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.7rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          fontWeight: 400,
                        }}
                      >
                        Sign In
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </Box>
            </Box>
          </Drawer>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
