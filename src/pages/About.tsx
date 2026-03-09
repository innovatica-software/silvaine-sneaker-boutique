import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import aboutHero from '@/assets/about-hero.jpg';

const About = () => {
  return (
    <Box>
      <SEO
        title="About Silvaine | Our Story"
        description="Founded by Asif Hossain, Silvaine crafts premium sneakers in Milano using the finest Italian leather. Discover our heritage, philosophy, and commitment to timeless elegance."
        url="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Silvaine',
          description: 'Premium Italian sneakers handcrafted in Milano',
          founder: { '@type': 'Person', name: 'Asif Hossain' },
          foundingDate: '2024',
          address: { '@type': 'PostalAddress', streetAddress: 'Via Monte Napoleone, 8', addressLocality: 'Milano', postalCode: '20121', addressCountry: 'IT' },
          url: 'https://silvaine-sneaker-boutique.lovable.app',
        }}
      />
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '50vh', md: '60vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(10,10,10,0.9))',
            zIndex: 1,
          }}
        />
        <Box
          component="img"
          src={aboutHero}
          alt="Silvaine About"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 2 }}>
              Our Story
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
              About Silvaine
            </Typography>
          </motion.div>
        </Box>
      </Box>

      {/* Story */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Grid container spacing={8}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 3 }}>
                  Heritage
                </Typography>
                <Typography variant="h3" sx={{ mb: 4, fontSize: '1.6rem' }}>
                  Born in Milano, Crafted for the World
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Founded by Asif Hossain, Silvaine was born from a singular vision: to create
                  sneakers that embody the timeless elegance of Italian craftsmanship while
                  embracing contemporary design.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Each pair is meticulously handcrafted in our Milano atelier, using only the
                  finest Italian leathers and materials sourced from heritage tanneries.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 3 }}>
                  Philosophy
                </Typography>
                <Typography variant="h3" sx={{ mb: 4, fontSize: '1.6rem' }}>
                  Less, but Better
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We believe in the power of restraint. Every design decision is intentional,
                  every detail purposeful. Our sneakers are stripped of the unnecessary, leaving
                  only what matters.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sustainability is not an afterthought — it's woven into every step of our process,
                  from ethically sourced materials to responsible manufacturing.
                </Typography>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 10, md: 16 }, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Typography variant="h3" sx={{ mb: 4, fontSize: '1.8rem' }}>
              Experience Silvaine
            </Typography>
            <Button component={Link} to="/shop" variant="contained">
              Explore Collection
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
