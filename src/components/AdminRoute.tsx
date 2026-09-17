import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Gate for the back office.
 *
 * The role now comes from the auth context — it travelled in the JWT and was
 * confirmed by `/auth/me` — so there is no second request and no loading state
 * of its own. Typing `/admin` into the address bar as a customer redirects
 * home, and even if that were bypassed every `/admin/*` endpoint is behind
 * `RolesGuard` and answers 403.
 */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#0A0A0A',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#C9A96E' }} />
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
          }}
        >
          VERIFYING ACCESS
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
