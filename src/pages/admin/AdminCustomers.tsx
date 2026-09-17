import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { errorMessage, type Customer } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAdminCustomers,
  useCustomerRoles,
  useGrantRole,
  useRevokeRole,
} from '@/hooks/useAdmin';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const headerCell = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '0.55rem',
  color: 'rgba(255,255,255,0.35)',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  flex: 1,
};

/**
 * Customers, and the role administration that never existed.
 *
 * Two changes worth noting. The email address is here — `profiles` lived in
 * `public` while the address lived in Supabase's `auth.users`, which PostgREST
 * would not expose, so the old list could only show a name and a city. And
 * roles can finally be granted and revoked: `user_roles` had no INSERT, UPDATE
 * or DELETE policy for anyone, so the first admin was created out of band and
 * nobody could be promoted from inside the app (spec G-12).
 *
 * The server refuses to remove the last admin, or an admin's own admin role —
 * either would lock everyone out of this page.
 */
const AdminCustomers = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rolesFor, setRolesFor] = useState<Customer | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminCustomers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const customers = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mb: 2 }}>
          {errorMessage(error, 'Customers could not be loaded.')}
        </Typography>
        <Button onClick={() => void refetch()} sx={{ color: '#C9A96E' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.6rem',
          fontWeight: 300,
          letterSpacing: '0.08em',
          color: '#F5F5F5',
          mb: 3,
        }}
      >
        Customers
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search name or email…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: '100%', md: 280 },
            '& .MuiOutlinedInput-root': { backgroundColor: '#111', fontSize: '0.75rem' },
          }}
        />
        {meta && (
          <Typography
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.3)',
              ml: 'auto',
            }}
          >
            {meta.total} customer{meta.total === 1 ? '' : 's'}
            {isFetching ? ' · refreshing' : ''}
          </Typography>
        )}
      </Box>

      <Paper
        sx={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            gap: 2,
          }}
        >
          {['Customer', 'Email', 'Location', 'Joined', 'Roles'].map((h) => (
            <Typography key={h} sx={headerCell}>
              {h}
            </Typography>
          ))}
        </Box>

        {customers.map((customer, i) => (
          <motion.div
            key={customer.userId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { md: 'center' },
                px: 2.5,
                py: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                gap: { xs: 1, md: 2 },
                '&:hover': { backgroundColor: 'rgba(201,169,110,0.03)' },
              }}
            >
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'rgba(201,169,110,0.15)',
                    color: '#C9A96E',
                    fontSize: '0.65rem',
                  }}
                >
                  {(customer.fullName || customer.email || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.72rem',
                      color: '#F5F5F5',
                    }}
                  >
                    {customer.fullName || 'Unnamed'}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.55rem',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {customer.phone || '—'}
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  flex: 1,
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.55)',
                  wordBreak: 'break-all',
                }}
              >
                {customer.email}
              </Typography>

              <Typography
                sx={{
                  flex: 1,
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                {[customer.city, customer.country].filter(Boolean).join(', ') || '—'}
              </Typography>

              <Typography
                sx={{
                  flex: 1,
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                {new Date(customer.createdAt).toLocaleDateString()}
              </Typography>

              <Box sx={{ flex: 1 }}>
                <Button
                  size="small"
                  startIcon={<ShieldOutlinedIcon sx={{ fontSize: '0.8rem !important' }} />}
                  onClick={() => setRolesFor(customer)}
                  sx={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': { color: '#C9A96E' },
                  }}
                >
                  Manage
                </Button>
              </Box>
            </Box>
          </motion.div>
        ))}

        {customers.length === 0 && (
          <Typography
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.75rem',
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            {debouncedSearch ? 'No customers match your search.' : 'No customers yet.'}
          </Typography>
        )}
      </Paper>

      {meta && meta.totalPages > 1 && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}
        >
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ fontSize: '0.65rem', color: '#C9A96E' }}
          >
            Previous
          </Button>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
            Page {meta.page} of {meta.totalPages}
          </Typography>
          <Button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            sx={{ fontSize: '0.65rem', color: '#C9A96E' }}
          >
            Next
          </Button>
        </Box>
      )}

      <RolesDialog
        customer={rolesFor}
        onClose={() => setRolesFor(null)}
        onFeedback={setFeedback}
      />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={feedback?.severity ?? 'success'}
          onClose={() => setFeedback(null)}
          sx={{ fontSize: '0.75rem' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const RolesDialog = ({
  customer,
  onClose,
  onFeedback,
}: {
  customer: Customer | null;
  onClose: () => void;
  onFeedback: (value: { message: string; severity: 'success' | 'error' }) => void;
}) => {
  const { user, refreshUser } = useAuth();
  const { data: roles = [], isLoading } = useCustomerRoles(customer?.userId);
  const grantRole = useGrantRole();
  const revokeRole = useRevokeRole();

  const isSelf = user?.id === customer?.userId;
  const isAdmin = roles.includes('admin');

  const toggleAdmin = async () => {
    if (!customer) return;

    try {
      if (isAdmin) {
        await revokeRole.mutateAsync({ userId: customer.userId, role: 'admin' });
        onFeedback({ message: 'Admin role revoked.', severity: 'success' });
      } else {
        await grantRole.mutateAsync({ userId: customer.userId, role: 'admin' });
        onFeedback({ message: 'Admin role granted.', severity: 'success' });
      }

      // A change to one's own roles must be reflected in the JWT-derived state,
      // or the sidebar would keep showing access that no longer exists.
      if (isSelf) await refreshUser();
    } catch (err) {
      onFeedback({
        message: errorMessage(err, 'The role could not be changed.'),
        severity: 'error',
      });
    }
  };

  const busy = grantRole.isPending || revokeRole.isPending;

  return (
    <Dialog
      open={Boolean(customer)}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: '#141414', backgroundImage: 'none', minWidth: 340 } }}
    >
      <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif' }}>
        Roles — {customer?.fullName || customer?.email}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={20} sx={{ color: '#C9A96E' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {roles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    fontSize: '0.6rem',
                    backgroundColor:
                      role === 'admin' ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.05)',
                    color: role === 'admin' ? '#C9A96E' : 'rgba(255,255,255,0.6)',
                  }}
                />
              ))}
              {roles.length === 0 && (
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                  No roles assigned.
                </Typography>
              )}
            </Box>

            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
              {isSelf && isAdmin
                ? 'You cannot revoke your own admin role — that would lock you out of this page.'
                : isAdmin
                  ? 'Revoking admin is refused if this is the last admin account.'
                  : 'Granting admin gives full access to the back office.'}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Close
        </Button>
        <Button
          onClick={() => void toggleAdmin()}
          disabled={busy || isLoading || (isSelf && isAdmin)}
          sx={{ color: isAdmin ? '#CF6679' : '#C9A96E' }}
        >
          {busy ? (
            <CircularProgress size={16} sx={{ color: '#C9A96E' }} />
          ) : isAdmin ? (
            'Revoke Admin'
          ) : (
            'Grant Admin'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminCustomers;
