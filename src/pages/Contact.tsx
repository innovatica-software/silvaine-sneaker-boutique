import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { contactApi, errorMessage } from '@/api';
import SEO from '@/components/SEO';

const EMPTY = { name: '', email: '', subject: '', message: '' };

/**
 * The enquiry form.
 *
 * Its submit handler used to set a local boolean and nothing else — the form
 * looked like it worked, thanked the customer, and threw the message away
 * (spec G-09). It now posts to `/contact`, which stores the enquiry and relays
 * it to the store inbox, where an admin can see it under Enquiries.
 */
const Contact = () => {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = useMutation({ mutationFn: contactApi.send });

  const handleChange =
    (field: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await sendMessage.mutateAsync({
        name: form.name,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      // The endpoint is throttled to three messages per five minutes, so a 429
      // is a real outcome here and its message is worth showing verbatim.
      setError(errorMessage(err, 'Your message could not be sent.'));
    }
  };

  return (
    <Box sx={{ py: { xs: 10, md: 16 } }}>
      <SEO
        title="Contact Us | Silvaine"
        description="Get in touch with Silvaine's Milano atelier. Visit us at Via Monte Napoleone, 8 or reach out via email and phone. We respond within 24 hours."
        url="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Silvaine',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Via Monte Napoleone, 8',
            addressLocality: 'Milano',
            postalCode: '20121',
            addressCountry: 'IT',
          },
          telephone: '+39 02 1234 5678',
          email: 'info@silvaine.com',
          url: 'https://silvaine-sneaker-boutique.lovable.app',
        }}
      />
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocationOnOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Address
                  </Typography>
                </Box>
                <Typography variant="body1">Via Monte Napoleone, 8</Typography>
                <Typography variant="body1">20121 Milano, Italy</Typography>
              </Box>
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <EmailOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">info@silvaine.com</Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PhoneOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Phone
                  </Typography>
                </Box>
                <Typography variant="body1">+39 02 1234 5678</Typography>
              </Box>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {submitted ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    Thank You
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We'll get back to you within 24 hours.
                  </Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        backgroundColor: 'rgba(207,102,121,0.08)',
                        color: '#CF6679',
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange('name')}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        required
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        value={form.subject}
                        onChange={handleChange('subject')}
                        required
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={6}
                        value={form.message}
                        onChange={handleChange('message')}
                        required
                        helperText="At least 10 characters."
                        inputProps={{ minLength: 10, maxLength: 5000 }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ py: 1.5, px: 6 }}
                        disabled={sendMessage.isPending}
                      >
                        {sendMessage.isPending ? (
                          <CircularProgress size={18} sx={{ color: '#0A0A0A' }} />
                        ) : (
                          'Send Message'
                        )}
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
