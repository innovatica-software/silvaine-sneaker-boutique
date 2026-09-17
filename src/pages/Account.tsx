import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, type UpdateProfileInput } from '@/api';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { SETTINGS_FALLBACK, useSettings } from '@/hooks/useProducts';

type FormState = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const EMPTY: FormState = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

/**
 * The customer's own profile page.
 *
 * `profiles` has carried name, phone and a full address since the first
 * migration, with an UPDATE policy to match — and nothing in the app ever read
 * or wrote it except the admin customer list. This is the page that was missing
 * (spec G-06); with it, checkout can prefill instead of asking again.
 */
const Account = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading, isError, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: settings = SETTINGS_FALLBACK } = useSettings();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      addressLine1: profile.addressLine1 ?? '',
      addressLine2: profile.addressLine2 ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      postalCode: profile.postalCode ?? '',
      country: profile.country ?? settings.defaultCountry,
    });
  }, [profile, settings.defaultCountry]);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSaved(false);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaved(false);

    // Empty strings are sent as undefined so a cleared field is left alone
    // rather than being written as "".
    const payload: UpdateProfileInput = {
      fullName: form.fullName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      addressLine1: form.addressLine1.trim() || undefined,
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      postalCode: form.postalCode.trim() || undefined,
      country: form.country.trim().toUpperCase() || undefined,
    };

    try {
      await updateProfile.mutateAsync(payload);
      setSaved(true);
    } catch (err) {
      setSaveError(errorMessage(err, 'Your details could not be saved.'));
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, minHeight: '70vh' }}>
      <SEO
        title="My Account | Silvaine"
        description="Manage your Silvaine account details."
        url="/account"
        noIndex
      />
      <Container maxWidth="sm">
        <Typography
          variant="h2"
          sx={{
            mb: 1,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            textAlign: 'center',
          }}
        >
          My Account
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 6 }}
        >
          {user?.email}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : isError ? (
          <Alert
            severity="error"
            sx={{ backgroundColor: 'rgba(207,102,121,0.08)', color: '#CF6679' }}
          >
            {errorMessage(error, 'Your profile could not be loaded.')}
          </Alert>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}
            >
              {saveError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    backgroundColor: 'rgba(207,102,121,0.08)',
                    color: '#CF6679',
                  }}
                >
                  {saveError}
                </Alert>
              )}
              {saved && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    backgroundColor: 'rgba(76,175,80,0.08)',
                    color: '#4CAF50',
                  }}
                >
                  Your details are saved.
                </Alert>
              )}

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    autoComplete="address-line1"
                    value={form.addressLine1}
                    onChange={handleChange('addressLine1')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    autoComplete="address-line2"
                    value={form.addressLine2}
                    onChange={handleChange('addressLine2')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="City"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={handleChange('city')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Province / State"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={handleChange('state')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={handleChange('postalCode')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    autoComplete="country"
                    value={form.country}
                    onChange={handleChange('country')}
                    inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                    helperText="Two-letter country code, e.g. IT"
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 4, py: 1.4 }}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <CircularProgress size={18} sx={{ color: '#0A0A0A' }} />
                ) : (
                  'Save Details'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.04)' }} />

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button component={Link} to="/orders" variant="outlined">
                My Orders
              </Button>
              <Button
                onClick={() => void signOut()}
                sx={{ color: 'text.secondary' }}
              >
                Sign Out
              </Button>
            </Box>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default Account;
