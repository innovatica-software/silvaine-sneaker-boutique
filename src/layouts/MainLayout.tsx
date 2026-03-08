import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ flex: 1, pt: { xs: '64px', md: '80px' } }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
