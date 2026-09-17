import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi, errorMessage } from '@/api';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';

type State = 'verifying' | 'verified' | 'invalid' | 'missing';

/**
 * Consumes the link from the verification email.
 *
 * Supabase handled this leg entirely — the SDK swallowed the token from the URL
 * hash and confirmed the address before the app noticed. `MailService` now
 * sends `/verify-email?token=…`, and this is the page that answers it.
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'verifying' : 'missing');
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();

  // The token is single-use, so React's development double-invoke of effects
  // would burn it on the first mount and report the second as invalid.
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        await refreshUser();
        setState('verified');
      } catch (err) {
        setError(errorMessage(err, 'This confirmation link is no longer valid.'));
        setState('invalid');
      }
    };

    void verify();
  }, [token, refreshUser]);

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <SEO
        title="Confirm Email | Silvaine"
        description="Confirm your email address."
        url="/verify-email"
        noIndex
      />
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
              Confirm Your Email
            </Typography>

            {state === 'verifying' && (
              <CircularProgress sx={{ color: 'primary.main', my: 4 }} />
            )}

            {state === 'verified' && (
              <>
                <Alert
                  severity="success"
                  sx={{
                    mb: 4,
                    backgroundColor: 'rgba(76,175,80,0.08)',
                    color: '#4CAF50',
                  }}
                >
                  Your email address is confirmed.
                </Alert>
                <Button component={Link} to="/shop" variant="contained">
                  Start Shopping
                </Button>
              </>
            )}

            {state === 'missing' && (
              <>
                <Alert
                  severity="warning"
                  sx={{
                    mb: 4,
                    backgroundColor: 'rgba(255,202,40,0.08)',
                    color: '#FFCA28',
                  }}
                >
                  This link is missing its confirmation token.
                </Alert>
                <Button component={Link} to="/" variant="outlined">
                  Back to Silvaine
                </Button>
              </>
            )}

            {state === 'invalid' && (
              <>
                <Alert
                  severity="error"
                  sx={{
                    mb: 4,
                    backgroundColor: 'rgba(207,102,121,0.08)',
                    color: '#CF6679',
                  }}
                >
                  {error}
                </Alert>
                <Button component={Link} to="/" variant="outlined">
                  Back to Silvaine
                </Button>
              </>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
