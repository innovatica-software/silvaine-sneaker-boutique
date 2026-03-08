import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-sneaker.jpg';

const inputSx = {
  width: '100%',
  '& input': {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '0.8rem',
    letterSpacing: '0.03em',
    color: '#F5F5F5',
    padding: '16px 16px 16px 48px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.25)',
      fontWeight: 300,
    },
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 30px #141414 inset !important',
      WebkitTextFillColor: '#F5F5F5 !important',
    },
  },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: currentUser.id,
        _role: 'admin',
      });
      setLoading(false);
      navigate(isAdmin ? '/admin' : '/');
    } else {
      setLoading(false);
      navigate('/');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error.message);
    else setResetSent(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#0A0A0A',
      }}
    >
      {/* Left — Image Panel (Desktop) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
          style={{ width: '100%', height: '100%' }}
        >
          <Box
            component="img"
            src={heroImage}
            alt="Silvaine Premium Sneakers"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </motion.div>
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(135deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.6) 100%),
              linear-gradient(180deg, transparent 60%, rgba(10,10,10,0.9) 100%)
            `,
          }}
        />
        {/* Overlay Content */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: { md: 6, lg: 8 },
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: { md: '2.5rem', lg: '3rem' },
                fontWeight: 300,
                color: '#F5F5F5',
                lineHeight: 1.15,
                letterSpacing: '0.04em',
                mb: 2,
              }}
            >
              Walk in
              <Box component="span" sx={{ color: '#C9A96E', display: 'block' }}>
                Elegance
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
                maxWidth: 320,
                lineHeight: 1.8,
              }}
            >
              Handcrafted Italian leather sneakers for those who appreciate the finer things.
            </Typography>
          </motion.div>
        </Box>
        {/* Gold accent line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '1px',
            height: '100%',
            background: 'linear-gradient(180deg, transparent 10%, rgba(201,169,110,0.2) 50%, transparent 90%)',
          }}
        />
      </Box>

      {/* Right — Form Panel */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 8, lg: 12 },
          py: { xs: 8, md: 0 },
          position: 'relative',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(circle at 25% 25%, #C9A96E 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <Box sx={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
              <Typography
                component={Link}
                to="/"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '1.6rem',
                  fontWeight: 300,
                  letterSpacing: '0.35em',
                  color: '#F5F5F5',
                  textDecoration: 'none',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                SILVAINE
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
                  mx: 'auto',
                  mb: 3,
                }}
              />
            </Box>
          </motion.div>

          <AnimatePresence mode="wait">
            {resetSent ? (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#C9A96E', mb: 3 }} />
                  </motion.div>
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '1.5rem',
                      color: '#F5F5F5',
                      mb: 1.5,
                    }}
                  >
                    Check Your Email
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: 1.8,
                      mb: 4,
                    }}
                  >
                    We've sent a password reset link to your email address.
                  </Typography>
                  <Typography
                    onClick={() => { setResetMode(false); setResetSent(false); setError(''); }}
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.65rem',
                      color: '#C9A96E',
                      cursor: 'pointer',
                      letterSpacing: '0.15em',
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    ← Back to Sign In
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key={resetMode ? 'reset' : 'login'}
                initial={{ opacity: 0, x: resetMode ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: resetMode ? -30 : 30 }}
                transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
              >
                {/* Heading */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: { xs: '1.6rem', md: '1.9rem' },
                      fontWeight: 300,
                      color: '#F5F5F5',
                      letterSpacing: '0.04em',
                      mb: 1,
                    }}
                  >
                    {resetMode ? 'Reset Password' : 'Welcome Back'}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {resetMode
                      ? 'Enter your email to receive a reset link'
                      : 'Sign in to your Silvaine account'}
                  </Typography>
                </Box>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          mb: 3,
                          p: 2,
                          backgroundColor: 'rgba(207,102,121,0.06)',
                          border: '1px solid rgba(207,102,121,0.15)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: '0.68rem',
                            color: '#CF6679',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {error}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <Box component="form" onSubmit={resetMode ? handleResetPassword : handleSubmit}>
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        mb: 2.5,
                        border: '1px solid',
                        borderColor: focusedField === 'email'
                          ? 'rgba(201,169,110,0.4)'
                          : 'rgba(255,255,255,0.06)',
                        backgroundColor: focusedField === 'email'
                          ? 'rgba(201,169,110,0.02)'
                          : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        '&:hover': {
                          borderColor: 'rgba(201,169,110,0.2)',
                        },
                      }}
                    >
                      <EmailOutlinedIcon
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '1rem',
                          color: focusedField === 'email' ? '#C9A96E' : 'rgba(255,255,255,0.2)',
                          transition: 'color 0.3s',
                        }}
                      />
                      <Box
                        component="input"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        sx={inputSx}
                      />
                    </Box>
                  </motion.div>

                  {/* Password Field (not in reset mode) */}
                  {!resetMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          mb: 1.5,
                          border: '1px solid',
                          borderColor: focusedField === 'password'
                            ? 'rgba(201,169,110,0.4)'
                            : 'rgba(255,255,255,0.06)',
                          backgroundColor: focusedField === 'password'
                            ? 'rgba(201,169,110,0.02)'
                            : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          '&:hover': {
                            borderColor: 'rgba(201,169,110,0.2)',
                          },
                        }}
                      >
                        <LockOutlinedIcon
                          sx={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1rem',
                            color: focusedField === 'password' ? '#C9A96E' : 'rgba(255,255,255,0.2)',
                            transition: 'color 0.3s',
                          }}
                        />
                        <Box
                          component="input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          onChange={(e: any) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          required
                          sx={{
                            ...inputSx,
                            '& input': {
                              ...inputSx['& input'],
                              paddingRight: '48px',
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'rgba(255,255,255,0.2)',
                            '&:hover': { color: '#C9A96E' },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon sx={{ fontSize: '1rem' }} />
                          ) : (
                            <VisibilityOutlinedIcon sx={{ fontSize: '1rem' }} />
                          )}
                        </IconButton>
                      </Box>
                    </motion.div>
                  )}

                  {/* Forgot Password */}
                  {!resetMode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Box sx={{ textAlign: 'right', mb: 4 }}>
                        <Typography
                          onClick={() => { setResetMode(true); setError(''); }}
                          sx={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: '0.6rem',
                            color: 'rgba(201,169,110,0.6)',
                            cursor: 'pointer',
                            letterSpacing: '0.1em',
                            transition: 'color 0.3s',
                            '&:hover': { color: '#C9A96E' },
                          }}
                        >
                          Forgot Password?
                        </Typography>
                      </Box>
                    </motion.div>
                  )}

                  {resetMode && <Box sx={{ mb: 3 }} />}

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: resetMode ? 0.2 : 0.35, duration: 0.4 }}
                  >
                    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        fullWidth
                        disabled={loading}
                        sx={{
                          py: 1.8,
                          background: loading
                            ? 'rgba(201,169,110,0.3)'
                            : 'linear-gradient(135deg, #C9A96E 0%, #E0C992 100%)',
                          color: '#0A0A0A',
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.68rem',
                          fontWeight: 500,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          borderRadius: 0,
                          boxShadow: '0 4px 25px rgba(201,169,110,0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.4s ease',
                          '&:hover': {
                            boxShadow: '0 6px 35px rgba(201,169,110,0.3)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                            transition: 'left 0.5s ease',
                          },
                          '&:hover::before': { left: '100%' },
                          '&.Mui-disabled': {
                            color: 'rgba(10,10,10,0.5)',
                          },
                        }}
                        endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                border: '2px solid rgba(10,10,10,0.2)',
                                borderTopColor: '#0A0A0A',
                                borderRadius: '50%',
                              }}
                            />
                          </motion.div>
                        ) : resetMode ? (
                          'Send Reset Link'
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Back to sign in (reset mode) */}
                  {resetMode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography
                          onClick={() => { setResetMode(false); setError(''); }}
                          sx={{
                            fontFamily: '"Montserrat", sans-serif',
                            fontSize: '0.62rem',
                            color: 'rgba(201,169,110,0.6)',
                            cursor: 'pointer',
                            letterSpacing: '0.1em',
                            transition: 'color 0.3s',
                            '&:hover': { color: '#C9A96E' },
                          }}
                        >
                          ← Back to Sign In
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </Box>

                {/* Divider & Register Link */}
                {!resetMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 4 }}>
                      <Box sx={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.5rem',
                          color: 'rgba(255,255,255,0.2)',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                        }}
                      >
                        New Here?
                      </Typography>
                      <Box sx={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.04)' }} />
                    </Box>

                    <motion.div whileHover={{ y: -1 }}>
                      <Button
                        component={Link}
                        to="/register"
                        fullWidth
                        variant="outlined"
                        sx={{
                          py: 1.6,
                          borderColor: 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.6)',
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.65rem',
                          fontWeight: 400,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          borderRadius: 0,
                          '&:hover': {
                            borderColor: 'rgba(201,169,110,0.3)',
                            color: '#C9A96E',
                            backgroundColor: 'rgba(201,169,110,0.03)',
                          },
                        }}
                      >
                        Create Account
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
