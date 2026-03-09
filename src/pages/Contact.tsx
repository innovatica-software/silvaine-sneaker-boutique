import { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Box sx={{ py: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 2 }}>
              Get in Touch
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.5rem' } }}>
              Contact Us
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocationOnOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Address</Typography>
                </Box>
                <Typography variant="body1">Via Monte Napoleone, 8</Typography>
                <Typography variant="body1">20121 Milano, Italy</Typography>
              </Box>
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <EmailOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Email</Typography>
                </Box>
                <Typography variant="body1">info@silvaine.com</Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PhoneOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Phone</Typography>
                </Box>
                <Typography variant="body1">+39 02 1234 5678</Typography>
              </Box>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {submitted ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>Thank You</Typography>
                  <Typography variant="body1" color="text.secondary">
                    We'll get back to you within 24 hours.
                  </Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Name" required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Email" type="email" required />
                    </Grid>
                    <Grid size={12}>
                      <TextField fullWidth label="Subject" required />
                    </Grid>
                    <Grid size={12}>
                      <TextField fullWidth label="Message" multiline rows={6} required />
                    </Grid>
                    <Grid size={12}>
                      <Button type="submit" variant="contained" sx={{ py: 1.5, px: 6 }}>
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
