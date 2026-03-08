import { Box, Typography, Paper, Divider } from '@mui/material';

const AdminSettings = () => (
  <Box>
    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.08em', color: '#F5F5F5', mb: 3 }}>Settings</Typography>

    <Paper sx={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', p: 3 }}>
      <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', mb: 2 }}>STORE INFORMATION</Typography>
      {[
        { label: 'Store Name', value: 'Silvaine' },
        { label: 'Brand', value: 'Premium Sneakers from Milano' },
        { label: 'Founded By', value: 'Asif Hossain' },
        { label: 'Currency', value: 'EUR (€)' },
        { label: 'Country', value: 'Italy' },
      ].map((item, i) => (
        <Box key={i}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{item.label}</Typography>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.72rem', color: '#F5F5F5' }}>{item.value}</Typography>
          </Box>
          {i < 4 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />}
        </Box>
      ))}
    </Paper>
  </Box>
);

export default AdminSettings;
