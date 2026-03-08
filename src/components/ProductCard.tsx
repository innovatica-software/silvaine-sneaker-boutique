import { Link } from 'react-router-dom';
import { Box, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Box
        component={Link}
        to={`/product/${product.slug}`}
        sx={{
          textDecoration: 'none',
          display: 'block',
          group: 'card',
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#141414',
            aspectRatio: '1',
            mb: 2,
          }}
        >
          <Box
            component="img"
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
            {product.isNew && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  height: 24,
                }}
              />
            )}
            {product.discountPrice && (
              <Chip
                label="SALE"
                size="small"
                sx={{
                  backgroundColor: '#CF6679',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  height: 24,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Info */}
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {product.category}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: 400,
            mb: 1,
            transition: 'color 0.3s',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {product.discountPrice ? (
            <>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                €{product.discountPrice}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', textDecoration: 'line-through' }}
              >
                €{product.price}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
              €{product.price}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default ProductCard;
