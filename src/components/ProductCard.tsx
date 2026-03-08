import { Link } from 'react-router-dom';
import { Box, Typography, Chip, Rating, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'featured';
}

const ProductCard = ({ product, index = 0, variant = 'default' }: ProductCardProps) => {
  const isFeatured = variant === 'featured';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.8, 0.25, 1] }}
    >
      <Box
        component={Link}
        to={`/product/${product.slug}`}
        sx={{
          textDecoration: 'none',
          display: 'block',
          position: 'relative',
          '&:hover .product-image': {
            transform: 'scale(1.06)',
          },
          '&:hover .product-overlay': {
            opacity: 1,
          },
          '&:hover .product-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
          '&:hover .product-name': {
            color: 'primary.main',
          },
        }}
      >
        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#111',
            aspectRatio: isFeatured ? '3/4' : '4/5',
            mb: 2.5,
          }}
        >
          <Box
            component="img"
            className="product-image"
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          />

          {/* Hover Overlay */}
          <Box
            className="product-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)',
              opacity: 0,
              transition: 'opacity 0.5s ease',
            }}
          />

          {/* Quick Action Buttons */}
          <Box
            className="product-actions"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              gap: 1,
              opacity: 0,
              transform: 'translateY(10px)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => e.preventDefault()}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: '#0A0A0A',
                },
              }}
            >
              <FavoriteBorderIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => e.preventDefault()}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: '#0A0A0A',
                },
              }}
            >
              <ShoppingBagOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {product.isNew && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  height: 22,
                  fontFamily: '"Montserrat", sans-serif',
                }}
              />
            )}
            {product.discountPrice && (
              <Chip
                label={`-${Math.round(((product.price - product.discountPrice) / product.price) * 100)}%`}
                size="small"
                sx={{
                  backgroundColor: '#CF6679',
                  color: '#fff',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  height: 22,
                  fontFamily: '"Montserrat", sans-serif',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Product Info */}
        <Box sx={{ px: 0.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              mb: 0.8,
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
            }}
          >
            {product.category}
          </Typography>

          <Typography
            className="product-name"
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 400,
              fontSize: isFeatured ? '1.2rem' : '1rem',
              mb: 1,
              transition: 'color 0.4s ease',
              letterSpacing: '0.06em',
            }}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
            <Rating
              value={product.rating}
              precision={0.1}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#C9A96E',
                },
                '& .MuiRating-iconEmpty': {
                  color: 'rgba(255,255,255,0.15)',
                },
                fontSize: '0.9rem',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
              }}
            >
              ({product.reviewCount})
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {product.discountPrice ? (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    fontFamily: '"Montserrat", sans-serif',
                  }}
                >
                  €{product.discountPrice}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'line-through',
                    fontSize: '0.8rem',
                    opacity: 0.6,
                  }}
                >
                  €{product.price}
                </Typography>
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                €{product.price}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ProductCard;
