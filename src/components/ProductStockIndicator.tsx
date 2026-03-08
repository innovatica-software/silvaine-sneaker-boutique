import { Box, Typography } from '@mui/material';

interface ProductStockIndicatorProps {
  stock: number;
}

const ProductStockIndicator = ({ stock }: ProductStockIndicatorProps) => {
  const isLow = stock <= 10;
  const isOut = stock === 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: isOut ? '#CF6679' : isLow ? '#E0C992' : '#4CAF50',
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.5rem',
          letterSpacing: '0.1em',
          color: isOut ? '#CF6679' : 'text.secondary',
          fontFamily: '"Montserrat", sans-serif',
        }}
      >
        {isOut ? 'OUT OF STOCK' : isLow ? `ONLY ${stock} LEFT` : 'IN STOCK'}
      </Typography>
    </Box>
  );
};

export default ProductStockIndicator;
