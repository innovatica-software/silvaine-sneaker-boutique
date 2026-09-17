import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/api';

const fieldBox = (focused: boolean) => ({
  position: 'relative' as const,
  mb: 2.5,
  border: '1px solid',
  borderColor: focused ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.06)',
  backgroundColor: focused ? 'rgba(201,169,110,0.03)' : 'rgba(255,255,255,0.015)',
  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': { borderColor: focused ? 'rgba(201,169,110,0.5)' : 'rgba(201,169,110,0.15)' },
  ...(focused && {
    boxShadow: '0 0 20px rgba(201,169,110,0.04), inset 0 0 20px rgba(201,169,110,0.02)',
  }),
});

const inputSx = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '0.82rem',
  letterSpacing: '0.03em',
  color: '#F5F5F5',
  padding: '18px 48px',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  width: '100%',
  '&::placeholder': { color: 'rgba(255,255,255,0.2)', fontWeight: 300 },
  '&:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 30px #0A0A0A inset !important',
    WebkitTextFillColor: '#F5F5F5 !important',
  },
};

const iconSx = (focused: boolean) => ({
  position: 'absolute' as const,
  left: 18,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '1.05rem',
  color: focused ? '#C9A96E' : 'rgba(255,255,255,0.15)',
  transition: 'all 0.3s ease',
});

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
  const location = useLocation();
  const { signIn, requestPasswordReset } = useAuth();

  /** Where ProtectedRoute/AdminRoute wanted to send them before the detour. */
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)
    ?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // The session response already carries the roles, so the old pattern of
      // signing in and then asking `has_role` in two more round-trips is gone.
      const user = await signIn(email, password);
      navigate(redirectTo ?? (user.roles.includes('admin') ? '/admin' : '/'), {
        replace: true,
      });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign you in.'));
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Succeeds whether or not the address exists — the response must not
      // reveal which addresses have accounts.
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(errorMessage(err, 'Could not send the reset link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SEO title="Sign In | Silvaine" description="Sign in to your Silvaine account to manage orders and wishlist." url="/login" noIndex />
      {/* Ambient background effects */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.03) 0%, transparent 70%)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.02) 0%, transparent 70%)',
        }} />
        {/* Subtle grid */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.015,
          backgroundImage: 'linear-gradient(rgba(201,169,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 440, px: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              component={Link}
              to="/"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.8rem',
                fontWeight: 300,
                letterSpacing: '0.4em',
                color: '#F5F5F5',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              SILVAINE
            </Typography>
            <Typography sx={{
              fontFamily: '"Montserrat", sans-serif', fontSize: '0.4rem',
              letterSpacing: '0.5em', color: 'rgba(201,169,110,0.4)',
              textTransform: 'uppercase', mt: 0.5,
            }}>
              Maison de Chaussures
            </Typography>
          </Box>
        </motion.div>

        {/* Decorative line */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <Box sx={{
            width: 50, height: '1px', mx: 'auto', mb: 5,
            background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
          }} />
        </motion.div>

        {/* Card container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Box sx={{
            p: { xs: 3.5, sm: 5 },
            backgroundColor: 'rgba(255,255,255,0.012)',
            border: '1px solid rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            '&::before': {
              content: '""', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '40%', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)',
            },
          }}>
            <AnimatePresence mode="wait">
              {resetSent ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 44, color: '#C9A96E', mb: 3 }} />
                    </motion.div>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#F5F5F5', mb: 1.5 }}>
                      Check Your Email
                    </Typography>
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, mb: 4 }}>
                      Password reset link has been sent.
                    </Typography>
                    <Typography
                      onClick={() => { setResetMode(false); setResetSent(false); setError(''); }}
                      sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: '#C9A96E', cursor: 'pointer', letterSpacing: '0.12em', '&:hover': { opacity: 0.7 } }}
                    >
                      ← Back to Sign In
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key={resetMode ? 'reset' : 'login'}
                  initial={{ opacity: 0, x: resetMode ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: resetMode ? -20 : 20 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Title */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: { xs: '1.5rem', sm: '1.7rem' }, fontWeight: 300,
                      color: '#F5F5F5', letterSpacing: '0.05em', mb: 0.8,
                    }}>
                      {resetMode ? 'Reset Password' : 'Welcome Back'}
                    </Typography>
                    <Typography sx={{
                      fontFamily: '"Montserrat", sans-serif', fontSize: '0.62rem',
                      color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em',
                    }}>
                      {resetMode ? 'Enter your email to receive a reset link' : 'Sign in to continue your journey'}
                    </Typography>
                  </Box>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <Box sx={{ mb: 3, p: 1.8, backgroundColor: 'rgba(207,102,121,0.05)', border: '1px solid rgba(207,102,121,0.12)' }}>
                          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: '#CF6679' }}>
                            {error}
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Box component="form" onSubmit={resetMode ? handleResetPassword : handleSubmit}>
                    {/* Email */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Box sx={fieldBox(focusedField === 'email')}>
                        <EmailOutlinedIcon sx={iconSx(focusedField === 'email')} />
                        <Box component="input" type="email" placeholder="Email Address" value={email}
                          onChange={(e: any) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                          required sx={inputSx}
                        />
                      </Box>
                    </motion.div>

                    {/* Password */}
                    {!resetMode && (
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                        <Box sx={{ ...fieldBox(focusedField === 'password'), mb: 1.5 }}>
                          <LockOutlinedIcon sx={iconSx(focusedField === 'password')} />
                          <Box component="input" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                            onChange={(e: any) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                            required sx={{ ...inputSx, paddingRight: '48px' }}
                          />
                          <IconButton onClick={() => setShowPassword(!showPassword)}
                            sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.15)', '&:hover': { color: '#C9A96E' } }}
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: '0.95rem' }} /> : <VisibilityOutlinedIcon sx={{ fontSize: '0.95rem' }} />}
                          </IconButton>
                        </Box>
                        <Box sx={{ textAlign: 'right', mb: 3.5 }}>
                          <Typography onClick={() => { setResetMode(true); setError(''); }}
                            sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.55rem', color: 'rgba(201,169,110,0.5)', cursor: 'pointer', letterSpacing: '0.1em', '&:hover': { color: '#C9A96E' } }}
                          >
                            Forgot Password?
                          </Typography>
                        </Box>
                      </motion.div>
                    )}

                    {resetMode && <Box sx={{ mb: 1 }} />}

                    {/* Submit */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
                        <Button type="submit" fullWidth disabled={loading}
                          endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
                          sx={{
                            py: 1.9,
                            background: loading ? 'rgba(201,169,110,0.25)' : 'linear-gradient(135deg, #C9A96E 0%, #E0C992 50%, #C9A96E 100%)',
                            backgroundSize: '200% 100%',
                            color: '#0A0A0A', fontFamily: '"Montserrat", sans-serif',
                            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.22em',
                            textTransform: 'uppercase', borderRadius: 0,
                            boxShadow: '0 4px 30px rgba(201,169,110,0.15)',
                            transition: 'all 0.5s ease',
                            '&:hover': { backgroundPosition: '100% 0', boxShadow: '0 8px 40px rgba(201,169,110,0.25)' },
                            '&::after': {
                              content: '""', position: 'absolute', inset: 0,
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                              transform: 'translateX(-100%)', transition: 'transform 0.6s',
                            },
                            '&:hover::after': { transform: 'translateX(100%)' },
                            '&.Mui-disabled': { color: 'rgba(10,10,10,0.4)' },
                            position: 'relative', overflow: 'hidden',
                          }}
                        >
                          {loading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              <Box sx={{ width: 18, height: 18, border: '2px solid rgba(10,10,10,0.15)', borderTopColor: '#0A0A0A', borderRadius: '50%' }} />
                            </motion.div>
                          ) : resetMode ? 'Send Reset Link' : 'Sign In'}
                        </Button>
                      </motion.div>
                    </motion.div>

                    {resetMode && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                          <Typography onClick={() => { setResetMode(false); setError(''); }}
                            sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.58rem', color: 'rgba(201,169,110,0.5)', cursor: 'pointer', letterSpacing: '0.1em', '&:hover': { color: '#C9A96E' } }}
                          >
                            ← Back to Sign In
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>

        {/* Register link */}
        {!resetMode && !resetSent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 5, mb: 2 }}>
              <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05))' }} />
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.48rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                New to Silvaine?
              </Typography>
              <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)' }} />
            </Box>
            <motion.div whileHover={{ y: -1 }}>
              <Button component={Link} to="/register" fullWidth variant="outlined"
                sx={{
                  py: 1.6, borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)',
                  fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', fontWeight: 400,
                  letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 0,
                  '&:hover': { borderColor: 'rgba(201,169,110,0.2)', color: '#C9A96E', backgroundColor: 'rgba(201,169,110,0.02)' },
                }}
              >
                Create Account
              </Button>
            </motion.div>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default Login;
