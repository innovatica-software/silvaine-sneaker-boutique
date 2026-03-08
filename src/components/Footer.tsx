import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, IconButton, Divider } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.default',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 10,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" sx={{ letterSpacing: '0.3em', mb: 3 }}>
              SILVAINE
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 2 }}>
              Premium sneakers handcrafted in Milano, Italy. Where heritage meets modern luxury.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 3, color: 'primary.main' }}>
              Shop
            </Typography>
            {['New Arrivals', 'Best Sellers', 'Collections', 'Sale'].map((item) => (
              <Typography
                key={item}
                component={Link}
                to="/shop"
                variant="body2"
                sx={{
                  display: 'block',
                  mb: 1.5,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {item}
              </Typography>
            ))}
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 3, color: 'primary.main' }}>
              Company
            </Typography>
            {[
              { label: 'About', to: '/about' },
              { label: 'Contact', to: '/contact' },
              { label: 'Careers', to: '/about' },
              { label: 'Press', to: '/about' },
            ].map((item) => (
              <Typography
                key={item.label}
                component={Link}
                to={item.to}
                variant="body2"
                sx={{
                  display: 'block',
                  mb: 1.5,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 3, color: 'primary.main' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to know about new collections and exclusive offers.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                <XIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 6 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 Silvaine. All rights reserved. Founded by Asif Hossain.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Milano, Italy
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
