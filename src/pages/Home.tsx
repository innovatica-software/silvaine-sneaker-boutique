import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import heroImage from '@/assets/hero-sneaker.jpg';

const Home = () => {
  const featured = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);
  const trending = products.filter((p) => p.isTrending);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '100vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.7) 100%)',
            zIndex: 1,
          }}
        />
        <Box
          component="img"
          src={heroImage}
          alt="Silvaine Premium Sneakers"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: 'primary.main', mb: 3, fontSize: '0.8rem' }}
            >
              Handcrafted in Milano
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '5rem', lg: '6rem' },
                lineHeight: 1.05,
                mb: 4,
                maxWidth: 700,
                color: 'text.primary',
              }}
            >
              Walk in
              <br />
              <Box component="span" sx={{ color: 'primary.main' }}>
                Elegance
              </Box>
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mb: 5, maxWidth: 450 }}
            >
              Premium Italian leather sneakers designed for those who appreciate the finer things in life.
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
              >
                Shop Now
              </Button>
              <Button component={Link} to="/about" variant="outlined">
                Our Story
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Featured / Best Sellers */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 2 }}>
                Curated Selection
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                Best Sellers
              </Typography>
            </Box>
          </motion.div>
          <Grid container spacing={4}>
            {featured.map((product, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 6 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* New Arrivals */}
      <Box sx={{ py: { xs: 10, md: 16 }, backgroundColor: '#0E0E0E' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 2 }}>
                  Just Landed
                </Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                  New Arrivals
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/shop"
                variant="text"
                endIcon={<ArrowForwardIcon />}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                View All
              </Button>
            </Box>
          </motion.div>
          <Grid container spacing={4}>
            {newArrivals.map((product, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 6 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Trending */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 2 }}>
                Most Wanted
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                Trending Now
              </Typography>
            </Box>
          </motion.div>
          <Grid container spacing={4}>
            {trending.map((product, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 6 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Brand Banner */}
      <Box
        sx={{
          py: { xs: 12, md: 20 },
          textAlign: 'center',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 4 }}>
              The Silvaine Promise
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 300,
                lineHeight: 1.6,
                color: 'text.secondary',
              }}
            >
              Every pair of Silvaine sneakers is a testament to Italian artistry — handcrafted
              from the finest materials, designed to stand the test of time.
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
