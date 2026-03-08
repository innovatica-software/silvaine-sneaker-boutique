import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SectionHeaderProps {
  label: string;
  title: string;
  align?: 'left' | 'center';
  linkText?: string;
  linkTo?: string;
}

const SectionHeader = ({ label, title, align = 'center', linkText, linkTo }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: linkText ? 'space-between' : align === 'center' ? 'center' : 'flex-start',
        alignItems: 'flex-end',
        mb: { xs: 5, md: 8 },
        textAlign: align,
      }}
    >
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ color: 'primary.main', mb: 2, fontSize: '0.7rem' }}
        >
          {label}
        </Typography>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 300 }}
        >
          {title}
        </Typography>
      </Box>
      {linkText && linkTo && (
        <Button
          component={Link}
          to={linkTo}
          variant="text"
          endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
          sx={{
            display: { xs: 'none', md: 'flex' },
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
          }}
        >
          {linkText}
        </Button>
      )}
    </Box>
  </motion.div>
);

export default SectionHeader;
