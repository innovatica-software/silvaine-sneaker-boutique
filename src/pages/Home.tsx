import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Divider } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import { products } from '@/data/products';
import heroImage from '@/assets/hero-sneaker.jpg';
import { useRef } from 'react';

const Home = () => {
  const featured = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);
  const trending = products.filter((p) => p.isTrending);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const trustBadges = [
    { icon: <LocalShippingOutlinedIcon />, label: 'Free Shipping', desc: 'On orders over €200' },
    { icon: <VerifiedOutlinedIcon />, label: 'Authenticity', desc: 'Certified craftsmanship' },
    { icon: <AutorenewOutlinedIcon />, label: 'Easy Returns', desc: '30-day return policy' },
    { icon: <DiamondOutlinedIcon />, label: 'Premium Quality', desc: 'Italian leather' },
  ];

  return (
    <Box>
      {/* ═══════════════ HERO ═══════════════ */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.85) 100%)',
            zIndex: 1,
          }}
        />
        {/* Parallax hero image */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            y: heroImageY,
          }}
        >
          <Box
            component="img"
            src={heroImage}
            alt="Silvaine Premium Sneakers — Handcrafted Italian Luxury"
            sx={{
              width: '100%',
              height: '120%',
              objectFit: 'cover',
            }}
          />
        </motion.div>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div style={{ opacity: heroOpacity }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box sx={{ width: 40, height: '1px', backgroundColor: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ color: 'primary.main', fontSize: '0.7rem' }}>
                  Handcrafted in Milano
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.8rem', sm: '3.5rem', md: '5rem', lg: '6.5rem' },
                  lineHeight: 1.02,
                  mb: 4,
                  maxWidth: 750,
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 6,
                  maxWidth: 420,
                  fontSize: '0.9rem',
                  lineHeight: 1.9,
                }}
              >
                Premium Italian leather sneakers designed for those who appreciate the finer things in life.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1 }}
            >
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 5, py: 1.8 }}
                >
                  Shop Now
                </Button>
                <Button
                  component={Link}
                  to="/about"
                  variant="outlined"
                  sx={{ px: 5, py: 1.8 }}
                >
                  Our Story
                </Button>
              </Box>
            </motion.div>
          </motion.div>
        </Container>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              sx={{
                width: 1,
                height: 40,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </motion.div>
        </motion.div>
      </Box>

      {/* ═══════════════ TRUST BADGES ═══════════════ */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 4, md: 5 },
          backgroundColor: '#0C0C0C',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {trustBadges.map((badge, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1.2,
                    }}
                  >
                    <Box sx={{ color: 'primary.main', '& .MuiSvgIcon-root': { fontSize: '1.4rem' } }}>
                      {badge.icon}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'text.primary', fontSize: '0.65rem', fontWeight: 500 }}
                    >
                      {badge.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.6rem' }}
                    >
                      {badge.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ BEST SELLERS ═══════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <SectionHeader label="Curated Selection" title="Best Sellers" />
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {featured.map((product, index) => (
              <Grid size={{ xs: 6, sm: 6, md: 6 }} key={product.id}>
                <ProductCard product={product} index={index} variant="featured" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ EDITORIAL BANNER ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#0C0C0C' }}>
        <Container maxWidth="lg">
          <Grid container spacing={0} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ pr: { md: 8 }, py: { xs: 4, md: 0 } }}>
                  <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 3 }}>
                    The Art of Craft
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.8rem', md: '2.4rem' },
                      fontWeight: 300,
                      lineHeight: 1.3,
                      mb: 3,
                    }}
                  >
                    Where Italian
                    <br />
                    Tradition Meets
                    <br />
                    <Box component="span" sx={{ color: 'primary.main' }}>
                      Modern Design
                    </Box>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, fontSize: '0.85rem' }}
                  >
                    Each pair of Silvaine sneakers is handcrafted by master artisans in Milano,
                    using only the finest Italian leather and materials.
                  </Typography>
                  <Button
                    component={Link}
                    to="/about"
                    variant="outlined"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ px: 4 }}
                  >
                    Discover More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '4/5',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={products[0].images[0]}
                    alt="Silvaine Craftsmanship"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.8) contrast(1.1)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      border: '1px solid rgba(201, 169, 110, 0.15)',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ NEW ARRIVALS ═══════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <SectionHeader
            label="Just Landed"
            title="New Arrivals"
            align="left"
            linkText="View All"
            linkTo="/shop"
          />
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {newArrivals.map((product, index) => (
              <Grid size={{ xs: 6, sm: 6, md: 6 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ TRENDING ═══════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 }, backgroundColor: '#0C0C0C' }}>
        <Container maxWidth="lg">
          <SectionHeader
            label="Most Wanted"
            title="Trending Now"
            align="left"
            linkText="Explore"
            linkTo="/shop"
          />
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {trending.map((product, index) => (
              <Grid size={{ xs: 6, sm: 6, md: 6 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ BRAND PROMISE ═══════════════ */}
      <Box
        sx={{
          py: { xs: 14, md: 22 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glow */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Divider
              sx={{
                width: 60,
                mx: 'auto',
                mb: 5,
                borderColor: 'primary.main',
                borderWidth: 0.5,
              }}
            />
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 4 }}>
              The Silvaine Promise
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.3rem', md: '1.7rem' },
                fontWeight: 300,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              "Every pair of Silvaine sneakers is a testament to Italian artistry — handcrafted
              from the finest materials, designed to stand the test of time."
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: 'primary.main', mt: 4, fontWeight: 400 }}
            >
              — Asif Hossain, Founder
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
