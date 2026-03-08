import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Divider, Rating, Avatar } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import { useProducts, type Product } from '@/hooks/useProducts';
import heroImage from '@/assets/hero-sneaker.jpg';
import { useRef } from 'react';

const customerReviews = [
  {
    name: 'Marco V.',
    rating: 5,
    review: 'The Milano Noir exceeded all expectations. The leather quality is exceptional — truly Italian craftsmanship at its finest.',
    product: 'Milano Noir',
    verified: true,
  },
  {
    name: 'Elena S.',
    rating: 5,
    review: 'Bianco Puro is my go-to sneaker. Minimalist, elegant, and incredibly comfortable for all-day wear.',
    product: 'Bianco Puro',
    verified: true,
  },
  {
    name: 'James K.',
    rating: 4.5,
    review: 'The attention to detail on the Cognac Classico is remarkable. The patina develops beautifully over time.',
    product: 'Cognac Classico',
    verified: true,
  },
];

const Home = () => {
  const featured = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);
  const trending = products.filter((p) => p.isTrending);
  const allProducts = products;

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

  const productGrid = (items: typeof products, columns: { xs: number; sm: number; md: number; lg: number }) => (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
      {items.map((product, index) => (
        <Grid size={{ xs: 12 / columns.xs, sm: 12 / columns.sm, md: 12 / columns.md, lg: 12 / columns.lg }} key={product.id}>
          <ProductCard product={product} index={index} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      {/* ═══════════════ HERO ═══════════════ */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          height: { xs: '100vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Multi-layer gradient overlay for cinematic depth */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.35) 30%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.95) 100%),
              radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.03) 0%, transparent 50%)
            `,
            zIndex: 1,
          }}
        />

        {/* Subtle gold vignette top */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 10%, rgba(201,169,110,0.3) 50%, transparent 90%)',
            zIndex: 3,
          }}
        />

        {/* Parallax hero image */}
        <motion.div style={{ position: 'absolute', inset: 0, y: heroImageY }}>
          <Box
            component="img"
            src={heroImage}
            alt="Silvaine Premium Sneakers — Handcrafted Italian Luxury"
            sx={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition: { xs: 'center 40%', md: 'center center' } }}
          />
        </motion.div>

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div style={{ opacity: heroOpacity }}>
            {/* Subtitle with animated line */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2.5 }, mb: { xs: 3, md: 5 } }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 50 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Box sx={{ height: '1px', backgroundColor: 'primary.main', width: '100%' }} />
                </motion.div>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'primary.main',
                    fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.7rem' },
                    letterSpacing: '0.3em',
                  }}
                >
                  Handcrafted in Milano
                </Typography>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 20 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <Box sx={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.3)', width: '100%' }} />
                </motion.div>
              </Box>
            </motion.div>

            {/* Main Heading — cinematic stagger */}
            <Box sx={{ mb: { xs: 3, md: 5 } }}>
              <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '7rem' },
                    lineHeight: { xs: 1.05, md: 0.95 },
                    fontWeight: 200,
                    letterSpacing: { xs: '0.08em', md: '0.12em' },
                  }}
                >
                  Walk in
                </Typography>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <Typography
                  variant="h1"
                  component="span"
                  sx={{
                    fontSize: { xs: '3.5rem', sm: '4.5rem', md: '6rem', lg: '8rem' },
                    lineHeight: { xs: 1.1, md: 1 },
                    fontWeight: 200,
                    letterSpacing: { xs: '0.08em', md: '0.12em' },
                    color: 'primary.main',
                    display: 'block',
                    textShadow: '0 0 80px rgba(201,169,110,0.15)',
                  }}
                >
                  Elegance
                </Typography>
              </motion.div>
            </Box>

            {/* Divider accent */}
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }} style={{ transformOrigin: 'left' }}>
              <Box sx={{ width: { xs: 50, md: 80 }, height: '2px', background: 'linear-gradient(90deg, #C9A96E, transparent)', mb: { xs: 3, md: 4 } }} />
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.1 }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  mb: { xs: 4, md: 6 },
                  maxWidth: { xs: 300, sm: 380, md: 440 },
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.92rem' },
                  lineHeight: 2,
                  letterSpacing: '0.04em',
                }}
              >
                Premium Italian leather sneakers designed for those who appreciate the finer things in life.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.3 }}>
              <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2.5 }, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: { xs: 3.5, md: 5 },
                    py: { xs: 1.4, md: 1.8 },
                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                    background: 'linear-gradient(135deg, #C9A96E 0%, #E0C992 100%)',
                    boxShadow: '0 4px 30px rgba(201,169,110,0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E0C992 0%, #C9A96E 100%)',
                      boxShadow: '0 6px 40px rgba(201,169,110,0.35)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Shop Collection
                </Button>
                <Button
                  component={Link}
                  to="/about"
                  variant="outlined"
                  sx={{
                    px: { xs: 3.5, md: 5 },
                    py: { xs: 1.4, md: 1.8 },
                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      backgroundColor: 'rgba(201,169,110,0.05)',
                    },
                  }}
                >
                  Our Story
                </Button>
              </Box>
            </motion.div>
          </motion.div>
        </Container>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}
        >
          <Box
            sx={{
              borderTop: '1px solid rgba(201,169,110,0.1)',
              background: 'linear-gradient(180deg, transparent, rgba(10,10,10,0.6))',
              backdropFilter: 'blur(20px)',
              py: { xs: 2, md: 3 },
              px: { xs: 2, md: 6 },
            }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'space-between' },
                  alignItems: 'center',
                  gap: { xs: 3, md: 4 },
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { value: '100%', label: 'Italian Leather' },
                  { value: 'Est. 2024', label: 'Milano, Italy' },
                  { value: '2,400+', label: 'Happy Clients' },
                  { value: '4.9★', label: 'Avg Rating' },
                ].map((stat, i) => (
                  <Box key={i} sx={{ textAlign: 'center', display: { xs: i > 1 ? 'none' : 'block', sm: 'block' } }}>
                    <Typography
                      sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: { xs: '1rem', md: '1.2rem' },
                        fontWeight: 300,
                        color: 'primary.main',
                        letterSpacing: '0.05em',
                        lineHeight: 1,
                        mb: 0.3,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: { xs: '0.45rem', md: '0.5rem' },
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          style={{ position: 'absolute', bottom: 80, right: 40, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', writingMode: { xs: 'horizontal-tb', md: 'vertical-rl' }, textTransform: 'uppercase', display: { xs: 'none', md: 'block' } }}>
            Scroll
          </Typography>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <Box sx={{ width: 1, height: 30, backgroundColor: 'rgba(201,169,110,0.3)', display: { xs: 'none', md: 'block' } }} />
          </motion.div>
        </motion.div>
      </Box>

      {/* ═══════════════ TRUST BADGES ═══════════════ */}
      <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 3, md: 4 }, backgroundColor: '#0C0C0C' }}>
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            {trustBadges.map((badge, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.8 }}>
                    <Box sx={{ color: 'primary.main', '& .MuiSvgIcon-root': { fontSize: '1.2rem' } }}>{badge.icon}</Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontSize: '0.6rem', fontWeight: 500 }}>{badge.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.5rem' }}>{badge.desc}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ FEATURED SNEAKERS ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="xl">
          <SectionHeader label="Curated Selection" title="Featured Sneakers" align="left" linkText="View All" linkTo="/shop" />
          {productGrid(allProducts, { xs: 2, sm: 3, md: 5, lg: 6 })}
        </Container>
      </Box>

      {/* ═══════════════ EDITORIAL BANNER ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#0C0C0C' }}>
        <Container maxWidth="lg">
          <Grid container spacing={0} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <Box sx={{ pr: { md: 8 }, py: { xs: 4, md: 0 } }}>
                  <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 3 }}>The Art of Craft</Typography>
                  <Typography variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 300, lineHeight: 1.3, mb: 3 }}>
                    Where Italian<br />Tradition Meets<br />
                    <Box component="span" sx={{ color: 'primary.main' }}>Modern Design</Box>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, fontSize: '0.85rem' }}>
                    Each pair of Silvaine sneakers is handcrafted by master artisans in Milano, using only the finest Italian leather and materials.
                  </Typography>
                  <Button component={Link} to="/about" variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ px: 4 }}>
                    Discover More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Box sx={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                  <Box component="img" src={products[0].images[0]} alt="Silvaine Craftsmanship" sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8) contrast(1.1)' }} />
                  <Box sx={{ position: 'absolute', inset: 0, border: '1px solid rgba(201, 169, 110, 0.15)' }} />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ BEST SELLERS ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="xl">
          <SectionHeader label="Most Popular" title="Best Sellers" align="left" linkText="Shop All" linkTo="/shop" />
          {productGrid(featured, { xs: 2, sm: 3, md: 5, lg: 6 })}
        </Container>
      </Box>

      {/* ═══════════════ NEW ARRIVALS ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 }, backgroundColor: '#0C0C0C' }}>
        <Container maxWidth="xl">
          <SectionHeader label="Just Landed" title="New Arrivals" align="left" linkText="View All" linkTo="/shop" />
          {productGrid(newArrivals, { xs: 2, sm: 3, md: 5, lg: 6 })}
        </Container>
      </Box>

      {/* ═══════════════ TRENDING ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="xl">
          <SectionHeader label="Most Wanted" title="Trending Now" align="left" linkText="Explore" linkTo="/shop" />
          {productGrid(trending, { xs: 2, sm: 3, md: 5, lg: 6 })}
        </Container>
      </Box>

      {/* ═══════════════ CUSTOMER REVIEWS ═══════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 }, backgroundColor: '#0C0C0C' }}>
        <Container maxWidth="lg">
          <SectionHeader label="What They Say" title="Customer Reviews" />
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {customerReviews.map((review, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                >
                  <Box
                    sx={{
                      p: { xs: 3, md: 4 },
                      border: '1px solid rgba(255,255,255,0.06)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.4s ease',
                      '&:hover': {
                        borderColor: 'rgba(201, 169, 110, 0.2)',
                      },
                    }}
                  >
                    <FormatQuoteIcon sx={{ color: 'primary.main', fontSize: '1.5rem', mb: 2, opacity: 0.5 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.8rem', lineHeight: 1.8, flex: 1 }}>
                      "{review.review}"
                    </Typography>
                    <Box>
                      <Rating value={review.rating} precision={0.5} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#C9A96E' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.12)' }, fontSize: '0.85rem', mb: 1.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, backgroundColor: 'rgba(201, 169, 110, 0.15)', color: 'primary.main', fontSize: '0.65rem', fontFamily: '"Montserrat", sans-serif' }}>
                          {review.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontSize: '0.6rem', fontWeight: 500 }}>
                            {review.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {review.verified && (
                              <VerifiedOutlinedIcon sx={{ fontSize: '0.55rem', color: '#4CAF50' }} />
                            )}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.5rem' }}>
                              Verified Purchase — {review.product}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ BRAND STORY / PROMISE ═══════════════ */}
      <Box sx={{ py: { xs: 12, md: 20 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)' }} />
        <Container maxWidth="sm" sx={{ position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Divider sx={{ width: 60, mx: 'auto', mb: 5, borderColor: 'primary.main', borderWidth: 0.5 }} />
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 4 }}>The Silvaine Promise</Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.3rem', md: '1.7rem' }, fontWeight: 300, lineHeight: 1.8, color: 'text.secondary', fontStyle: 'italic' }}>
              "Every pair of Silvaine sneakers is a testament to Italian artistry — handcrafted from the finest materials, designed to stand the test of time."
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', mt: 4, fontWeight: 400 }}>
              — Asif Hossain, Founder
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
