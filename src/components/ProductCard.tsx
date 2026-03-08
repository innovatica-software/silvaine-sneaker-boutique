import { Link } from 'react-router-dom';
import { Box, Typography, Chip, Rating, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import type { Product } from '@/hooks/useProducts';
import ProductStockIndicator from './ProductStockIndicator';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.25, 0.8, 0.25, 1] }}
    >
      <Box
        component={Link}
        to={`/product/${product.slug}`}
        sx={{
          textDecoration: 'none',
          display: 'block',
          position: 'relative',
          '&:hover .product-image': {
            transform: 'scale(1.08)',
          },
          '&:hover .product-overlay': {
            opacity: 1,
          },
          '&:hover .product-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
          '&:hover .card-wrapper': {
            boxShadow: '0 8px 40px rgba(201, 169, 110, 0.08)',
          },
          '&:hover .product-name': {
            color: 'primary.main',
          },
        }}
      >
        <Box
          className="card-wrapper"
          sx={{
            transition: 'box-shadow 0.5s ease',
          }}
        >
          {/* Image Container */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#111',
              aspectRatio: '3/4',
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
                transition: 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
              }}
            />

            {/* Hover Overlay */}
            <Box
              className="product-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)',
                opacity: 0,
                transition: 'opacity 0.4s ease',
              }}
            />

            {/* Quick Action Buttons */}
            <Box
              className="product-actions"
              sx={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                display: 'flex',
                gap: 0.6,
                opacity: 0,
                transform: 'translateY(8px)',
                transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
              }}
            >
              <Tooltip title="Add to Wishlist" placement="top">
                <IconButton
                  size="small"
                  onClick={(e) => e.preventDefault()}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: '#0A0A0A',
                    },
                  }}
                >
                  <FavoriteBorderIcon sx={{ fontSize: '0.95rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Quick Add to Cart" placement="top">
                <IconButton
                  size="small"
                  onClick={(e) => e.preventDefault()}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: '#0A0A0A',
                    },
                  }}
                >
                  <ShoppingBagOutlinedIcon sx={{ fontSize: '0.95rem' }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Badges */}
            <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {product.isNew && (
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '0.5rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    height: 20,
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
                    fontSize: '0.5rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    height: 20,
                    fontFamily: '"Montserrat", sans-serif',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Product Info */}
          <Box sx={{ pt: 1.5, pb: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                mb: 0.3,
                fontSize: '0.55rem',
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
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                mb: 0.5,
                transition: 'color 0.3s ease',
                letterSpacing: '0.05em',
                lineHeight: 1.3,
              }}
            >
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.6 }}>
              <Rating
                value={product.rating}
                precision={0.1}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': { color: '#C9A96E' },
                  '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.12)' },
                  fontSize: '0.75rem',
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.55rem', letterSpacing: '0.05em' }}
              >
                ({product.reviewCount})
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {product.discountPrice ? (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      fontSize: '0.85rem',
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
                      fontSize: '0.7rem',
                      opacity: 0.5,
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
                    fontSize: '0.85rem',
                    fontFamily: '"Montserrat", sans-serif',
                  }}
                >
                  €{product.price}
                </Typography>
              )}
            </Box>

            {/* Stock Indicator */}
            <ProductStockIndicator stock={product.stock} />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ProductCard;
