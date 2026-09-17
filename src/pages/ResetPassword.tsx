import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '@/api';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Sets a new password from a reset link.
 *
 * The token moved from the URL *hash* to a `?token=` query parameter. Under
 * Supabase the recovery tokens arrived in the fragment and the SDK silently
 * consumed them to establish a recovery session; with the SDK gone there is
 * nothing to consume them, so the token is now read explicitly and posted to
 * `/auth/reset-password`.
 *
 * The page no longer bounces to /login when the token is missing — it explains
 * what went wrong, because a silent redirect from a mail link is indis-
 * tinguishable from the link being broken.
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Single-use and expiring; the server also revokes every existing refresh
      // token for the account, so other sessions are signed out.
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(
        errorMessage(
          err,
          'This reset link is no longer valid. Request a new one.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <SEO
        title="Reset Password | Silvaine"
        description="Set your new password."
        url="/reset-password"
        noIndex
      />
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          {!token ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(255,202,40,0.08)',
                  color: '#FFCA28',
                }}
              >
                This link is missing its reset token. Request a new link from
                the sign-in page.
              </Alert>
              <Button component={Link} to="/login" variant="outlined">
                Back to Sign In
              </Button>
            </Box>
          ) : (
            <>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    backgroundColor: 'rgba(207,102,121,0.1)',
                    color: '#CF6679',
                  }}
                >
                  {error}
                </Alert>
              )}

              {success ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password updated. Taking you to sign in…
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    required
                    helperText="Minimum 8 characters"
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ mb: 4 }}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ py: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Update Password'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default ResetPassword;
