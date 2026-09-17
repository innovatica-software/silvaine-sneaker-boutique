import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { errorMessage } from '@/api';
import { useSettings } from '@/hooks/useProducts';

const panel = {
  backgroundColor: '#111',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
  p: 3,
};

const sectionLabel = {
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '0.7rem',
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.1em',
  mb: 2,
};

/**
 * Store configuration.
 *
 * This page was static JSX — five hardcoded strings, including a shipping rule
 * and a currency that the checkout code kept its own separate copies of. Every
 * value below now comes from `GET /settings`, the same source the server uses
 * when it prices an order, so what an admin reads here is what customers are
 * actually charged.
 *
 * It is deliberately read-only. These are deployment configuration, not runtime
 * state: they are set through environment variables, validated at boot, and a
 * mutable settings table would be a second source of truth for rules the server
 * must never be uncertain about.
 */
const AdminSettings = () => {
  const { data: settings, isLoading, isError, error, refetch } = useSettings();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#C9A96E' }} />
      </Box>
    );
  }

  if (isError || !settings) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', mb: 2 }}>
          {errorMessage(error, 'Settings could not be loaded.')}
        </Typography>
        <Button onClick={() => void refetch()} sx={{ color: '#C9A96E' }}>
          Try Again
        </Button>
      </Box>
    );
  }

  const money = (value: number) => `${settings.currencySymbol}${value}`;

  const store = [
    { label: 'Store Name', value: settings.storeName },
    { label: 'Default Brand', value: settings.brand },
    { label: 'Currency', value: `${settings.currency} (${settings.currencySymbol})` },
    { label: 'Default Country', value: settings.defaultCountry },
  ];

  const commerce = [
    {
      label: 'Shipping Cost',
      value: money(settings.shippingCost),
      hint: 'Charged on every order below the free-shipping threshold.',
    },
    {
      label: 'Free Shipping From',
      value: money(settings.freeShippingThreshold),
      hint: 'Subtotal at or above which shipping costs nothing.',
    },
    {
      label: 'Low Stock Threshold',
      value: `${settings.lowStockThreshold} units`,
      hint: 'Drives the low-stock badge and the dashboard counter.',
    },
    {
      label: 'Tax Rate',
      value: `${(settings.taxRate * 100).toFixed(2)}%`,
      hint:
        settings.taxRate === 0
          ? 'Currently zero — orders carry no tax line.'
          : 'Applied to the order subtotal.',
    },
  ];

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1.6rem',
          fontWeight: 300,
          letterSpacing: '0.08em',
          color: '#F5F5F5',
          mb: 3,
        }}
      >
        Settings
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Paper sx={{ ...panel, flex: 1 }}>
          <Typography sx={sectionLabel}>STORE INFORMATION</Typography>
          {store.map((item, i) => (
            <Box key={item.label}>
              <Row label={item.label} value={item.value} />
              {i < store.length - 1 && (
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />
              )}
            </Box>
          ))}
        </Paper>

        <Paper sx={{ ...panel, flex: 1 }}>
          <Typography sx={sectionLabel}>COMMERCE RULES</Typography>
          {commerce.map((item, i) => (
            <Box key={item.label}>
              <Row label={item.label} value={item.value} hint={item.hint} />
              {i < commerce.length - 1 && (
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />
              )}
            </Box>
          ))}
        </Paper>
      </Box>

      <Paper sx={{ ...panel, mt: 2 }}>
        <Typography sx={sectionLabel}>WHERE THESE COME FROM</Typography>
        <Typography
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.8,
          }}
        >
          These values are served by the API from its environment configuration
          (<Mono>SHIPPING_COST</Mono>, <Mono>FREE_SHIPPING_THRESHOLD</Mono>,{' '}
          <Mono>LOW_STOCK_THRESHOLD</Mono>, <Mono>TAX_RATE</Mono>,{' '}
          <Mono>DEFAULT_CURRENCY</Mono>, <Mono>DEFAULT_COUNTRY</Mono>) and are validated when
          the service starts. The storefront reads them for display only — the server recomputes
          shipping and totals on every order it accepts, so a stale browser can never change what
          a customer is charged. To change one, update the API environment and redeploy.
        </Typography>
      </Paper>
    </Box>
  );
};

const Row = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <Box sx={{ py: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.72rem',
          color: '#F5F5F5',
          textAlign: 'right',
        }}
      >
        {value}
      </Typography>
    </Box>
    {hint && (
      <Typography
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontSize: '0.55rem',
          color: 'rgba(255,255,255,0.28)',
          mt: 0.3,
        }}
      >
        {hint}
      </Typography>
    )}
  </Box>
);

const Mono = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="code"
    sx={{
      fontFamily: 'monospace',
      fontSize: '0.62rem',
      color: '#C9A96E',
      backgroundColor: 'rgba(201,169,110,0.06)',
      px: 0.6,
      py: 0.2,
      borderRadius: '3px',
    }}
  >
    {children}
  </Box>
);

export default AdminSettings;
