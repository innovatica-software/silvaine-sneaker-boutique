import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';

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

const strengthColors = ['', '#CF6679', '#E8A838', '#C9A96E', '#4CAF50'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

const getStrength = (pwd: string) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) setError(error.message);
    else navigate('/');
  };

  const reqs = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special char', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0A0A0A', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient effects */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '-15%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.03) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '55%', height: '55%', background: 'radial-gradient(circle, rgba(201,169,110,0.02) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.015, backgroundImage: 'linear-gradient(rgba(201,169,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 440, px: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography component={Link} to="/" sx={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 300,
              letterSpacing: '0.4em', color: '#F5F5F5', textDecoration: 'none', display: 'block',
            }}>
              SILVAINE
            </Typography>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.4rem', letterSpacing: '0.5em', color: 'rgba(201,169,110,0.4)', textTransform: 'uppercase', mt: 0.5 }}>
              Maison de Chaussures
            </Typography>
          </Box>
        </motion.div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
          <Box sx={{ width: 50, height: '1px', mx: 'auto', mb: 5, background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' }} />
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Box sx={{
            p: { xs: 3.5, sm: 5 }, backgroundColor: 'rgba(255,255,255,0.012)',
            border: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', position: 'relative',
            '&::before': { content: '""', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)' },
          }}>
            {/* Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '1.5rem', sm: '1.7rem' }, fontWeight: 300, color: '#F5F5F5', letterSpacing: '0.05em', mb: 0.8 }}>
                Join Silvaine
              </Typography>
              <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                Create your account to begin
              </Typography>
            </Box>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <Box sx={{ mb: 3, p: 1.8, backgroundColor: 'rgba(207,102,121,0.05)', border: '1px solid rgba(207,102,121,0.12)' }}>
                    <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', color: '#CF6679' }}>{error}</Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            <Box component="form" onSubmit={handleSubmit}>
              {/* Name */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Box sx={fieldBox(focusedField === 'name')}>
                  <PersonOutlineIcon sx={iconSx(focusedField === 'name')} />
                  <Box component="input" type="text" placeholder="Full Name" value={name}
                    onChange={(e: any) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                    required sx={inputSx} />
                </Box>
              </motion.div>

              {/* Email */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <Box sx={fieldBox(focusedField === 'email')}>
                  <EmailOutlinedIcon sx={iconSx(focusedField === 'email')} />
                  <Box component="input" type="email" placeholder="Email Address" value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    required sx={inputSx} />
                </Box>
              </motion.div>

              {/* Password */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
                <Box sx={{ ...fieldBox(focusedField === 'password'), mb: 1 }}>
                  <LockOutlinedIcon sx={iconSx(focusedField === 'password')} />
                  <Box component="input" type={showPassword ? 'text' : 'password'} placeholder="Create Password" value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    required sx={{ ...inputSx, paddingRight: '48px' }} />
                  <IconButton onClick={() => setShowPassword(!showPassword)}
                    sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.15)', '&:hover': { color: '#C9A96E' } }}>
                    {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: '0.95rem' }} /> : <VisibilityOutlinedIcon sx={{ fontSize: '0.95rem' }} />}
                  </IconButton>
                </Box>
              </motion.div>

              {/* Password strength */}
              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Box sx={{ mb: 3, mt: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        {[1, 2, 3, 4].map((l) => (
                          <Box key={l} sx={{ flex: 1, height: 2.5, borderRadius: 1, backgroundColor: strength >= l ? strengthColors[strength] : 'rgba(255,255,255,0.05)', transition: 'all 0.4s' }} />
                        ))}
                      </Box>
                      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.48rem', letterSpacing: '0.15em', color: strengthColors[strength] || 'rgba(255,255,255,0.15)', textTransform: 'uppercase', fontWeight: 500, mb: 1.5 }}>
                        {strengthLabels[strength] || 'Too short'}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {reqs.map((r, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 13, height: 13, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: r.met ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.02)',
                              border: '1px solid', borderColor: r.met ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.05)',
                              transition: 'all 0.3s',
                            }}>
                              {r.met && <CheckIcon sx={{ fontSize: '0.45rem', color: '#C9A96E' }} />}
                            </Box>
                            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.48rem', color: r.met ? 'rgba(201,169,110,0.6)' : 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                              {r.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {password.length === 0 && <Box sx={{ mb: 3.5 }} />}

              {/* Submit */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
                  <Button type="submit" fullWidth disabled={loading}
                    endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
                    sx={{
                      py: 1.9,
                      background: loading ? 'rgba(201,169,110,0.25)' : 'linear-gradient(135deg, #C9A96E 0%, #E0C992 50%, #C9A96E 100%)',
                      backgroundSize: '200% 100%', color: '#0A0A0A',
                      fontFamily: '"Montserrat", sans-serif', fontSize: '0.65rem', fontWeight: 600,
                      letterSpacing: '0.22em', textTransform: 'uppercase', borderRadius: 0,
                      boxShadow: '0 4px 30px rgba(201,169,110,0.15)',
                      transition: 'all 0.5s ease',
                      '&:hover': { backgroundPosition: '100% 0', boxShadow: '0 8px 40px rgba(201,169,110,0.25)' },
                      '&::after': { content: '""', position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', transform: 'translateX(-100%)', transition: 'transform 0.6s' },
                      '&:hover::after': { transform: 'translateX(100%)' },
                      '&.Mui-disabled': { color: 'rgba(10,10,10,0.4)' },
                      position: 'relative', overflow: 'hidden',
                    }}>
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Box sx={{ width: 18, height: 18, border: '2px solid rgba(10,10,10,0.15)', borderTopColor: '#0A0A0A', borderRadius: '50%' }} />
                      </motion.div>
                    ) : 'Create Account'}
                  </Button>
                </motion.div>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

        {/* Login link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 5, mb: 2 }}>
            <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05))' }} />
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.48rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              Already a Member?
            </Typography>
            <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)' }} />
          </Box>
          <motion.div whileHover={{ y: -1 }}>
            <Button component={Link} to="/login" fullWidth variant="outlined"
              sx={{
                py: 1.6, borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)',
                fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', fontWeight: 400,
                letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 0,
                '&:hover': { borderColor: 'rgba(201,169,110,0.2)', color: '#C9A96E', backgroundColor: 'rgba(201,169,110,0.02)' },
              }}>
              Sign In
            </Button>
          </motion.div>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Register;
