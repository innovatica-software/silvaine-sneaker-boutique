import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  return (
    <Box sx={{ py: { xs: 10, md: 16 }, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {resetMode ? 'Reset Password' : 'Welcome Back'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {resetMode ? 'Enter your email to receive a reset link' : 'Sign in to your Silvaine account'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(207,102,121,0.1)', color: '#CF6679' }}>
              {error}
            </Alert>
          )}

          {resetSent ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset link sent! Check your email.
            </Alert>
          ) : resetMode ? (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, mb: 3 }} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Send Reset Link'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => { setResetMode(false); setError(''); }}
                >
                  Back to Sign In
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 1 }}
                  required
                />
                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => { setResetMode(true); setError(''); }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>
                <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, mb: 3 }} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : 'Sign In'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">or</Typography>
              </Divider>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Typography
                    component={Link}
                    to="/register"
                    variant="body2"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Create one
                  </Typography>
                </Typography>
              </Box>
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
