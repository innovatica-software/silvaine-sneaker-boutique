import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdmin';
import { Box, CircularProgress, Typography } from '@mui/material';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();

  if (authLoading || adminLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0A0A0A', gap: 2 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
          VERIFYING ACCESS
        </Typography>
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
