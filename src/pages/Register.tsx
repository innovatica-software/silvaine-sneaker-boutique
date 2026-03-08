import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Box sx={{ py: { xs: 10, md: 16 }, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Join Silvaine
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your account to start shopping
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 4 }}
              required
              helperText="Minimum 8 characters"
            />
            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, mb: 3 }}>
              Create Account
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography
                component={Link}
                to="/login"
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign in
              </Typography>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;
