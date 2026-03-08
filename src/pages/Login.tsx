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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will integrate with Supabase auth
    navigate('/');
  };

  return (
    <Box sx={{ py: { xs: 10, md: 16 }, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your Silvaine account
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
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
              sx={{ mb: 1 }}
              required
            />
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot Password?
              </Typography>
            </Box>
            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, mb: 3 }}>
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Typography
                component={Link}
                to="/register"
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Create one
              </Typography>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
