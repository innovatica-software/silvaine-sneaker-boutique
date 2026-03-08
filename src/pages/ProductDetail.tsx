import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Breadcrumbs,
  Divider,
  Skeleton,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct, useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';
import { toast } from 'sonner';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Skeleton Loading ─────────────────────────────────────────
const ProductDetailSkeleton = () => (
  <Box sx={{ py: { xs: 4, md: 8 } }}>
    <Container maxWidth="lg">
      {/* Breadcrumb skeleton */}
      <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
        <Skeleton variant="text" width={40} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Skeleton variant="text" width={10} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Skeleton variant="text" width={40} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Skeleton variant="text" width={10} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Skeleton variant="text" width={120} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
      </Box>

      <Grid container spacing={{ xs: 4, md: 8 }}>
        {/* Image skeleton */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton
            variant="rectangular"
            sx={{
              width: '100%',
              aspectRatio: '4/3',
              bgcolor: 'rgba(255,255,255,0.04)',
              borderRadius: 0,
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={80}
                height={80}
                sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 0, flexShrink: 0 }}
              />
            ))}
          </Box>
        </Grid>

        {/* Details skeleton */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="text" width={80} height={16} sx={{ bgcolor: 'rgba(201,169,110,0.08)', mb: 1.5 }} />
          <Skeleton variant="text" width="85%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 1 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Skeleton variant="text" width={80} height={30} sx={{ bgcolor: 'rgba(201,169,110,0.08)' }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="circular" width={16} height={16} sx={{ bgcolor: 'rgba(201,169,110,0.08)' }} />
            ))}
          </Box>

          <Skeleton variant="text" width="100%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 0.5 }} />
          <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 0.5 }} />
          <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 4 }} />

          <Skeleton variant="rectangular" width="100%" height={1} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 4 }} />

          {/* Color skeleton */}
          <Skeleton variant="text" width={100} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 1.5 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          </Box>

          {/* Size skeleton */}
          <Skeleton variant="text" width={80} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 1.5 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={52}
                height={40}
                sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 0 }}
              />
            ))}
          </Box>

          {/* Quantity skeleton */}
          <Skeleton variant="rectangular" width={140} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 3 }} />

          {/* Button skeleton */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton
              variant="rectangular"
              sx={{ flex: 1, height: 52, bgcolor: 'rgba(201,169,110,0.1)', borderRadius: 0 }}
            />
            <Skeleton
              variant="rectangular"
              width={52}
              height={52}
              sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 0 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────
const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: allProducts = [], isLoading: relatedLoading } = useProducts();
  const dispatch = useAppDispatch();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    setSelectedSize('');
    setSelectedColorIndex(0);
    setQuantity(1);
    setSelectedImageIndex(0);
    setWishlisted(false);
    setImageLoaded(false);
    setAddedToBag(false);
  }, [slug]);

  if (isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 20, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>Product Not Found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            The item you're looking for may have been moved or is no longer available.
          </Typography>
          <Button component={Link} to="/shop" variant="outlined" sx={{ px: 5 }}>
            Browse Collection
          </Button>
        </motion.div>
      </Container>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const fallbackRelated = relatedProducts.length > 0
    ? relatedProducts
    : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const selectedColor = product.colors[selectedColorIndex] || product.colors[0];
  const mainImage = product.images[selectedImageIndex] || product.images[0] || '/placeholder.svg';

  const handlePrevImage = () => {
    setImageLoaded(false);
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setImageLoaded(false);
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size', {
        style: { background: '#141414', border: '1px solid rgba(207,102,121,0.3)', color: '#F5F5F5' },
      });
      return;
    }
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: mainImage,
        size: selectedSize,
        color: selectedColor?.name || '',
        quantity,
        slug: product.slug,
      })
    );
    setAddedToBag(true);
    toast.success(`${product.name} added to bag`, {
      style: { background: '#141414', border: '1px solid rgba(201,169,110,0.2)', color: '#F5F5F5' },
    });
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Box sx={{ pb: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        {/* ─── Breadcrumbs ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Breadcrumbs
            sx={{
              mb: { xs: 3, md: 5 },
              pt: { xs: 2, md: 4 },
              '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.15)' },
            }}
          >
            <Typography
              component={Link}
              to="/"
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
                '&:hover': { color: '#C9A96E' },
              }}
            >
              Home
            </Typography>
            <Typography
              component={Link}
              to="/shop"
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
                '&:hover': { color: '#C9A96E' },
              }}
            >
              Shop
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(201,169,110,0.7)',
                fontFamily: '"Montserrat", sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
              }}
            >
              {product.name}
            </Typography>
          </Breadcrumbs>
        </motion.div>

        <Grid container spacing={{ xs: 4, md: 10 }}>
          {/* ─── Image Gallery ─────────────────────── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}>
              {/* Main Image */}
              <Box
                sx={{
                  position: 'relative',
                  backgroundColor: '#0E0E0E',
                  overflow: 'hidden',
                  aspectRatio: { xs: '1', md: '4/3.2' },
                  border: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                {/* Skeleton behind image */}
                {!imageLoaded && (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: 0,
                      zIndex: 1,
                    }}
                  />
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                  >
                    <Box
                      component="img"
                      src={mainImage}
                      alt={product.name}
                      onLoad={() => setImageLoaded(true)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {product.isNew && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <Chip
                        label="NEW ARRIVAL"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(201, 169, 110, 0.95)',
                          color: '#0A0A0A',
                          fontSize: '0.5rem',
                          fontWeight: 600,
                          letterSpacing: '0.2em',
                          height: 22,
                          fontFamily: '"Montserrat", sans-serif',
                        }}
                      />
                    </motion.div>
                  )}
                  {discountPercent > 0 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                      <Chip
                        label={`-${discountPercent}%`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(207, 102, 121, 0.9)',
                          color: '#fff',
                          fontSize: '0.5rem',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          height: 22,
                          fontFamily: '"Montserrat", sans-serif',
                        }}
                      />
                    </motion.div>
                  )}
                </Box>

                {/* Image navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 3,
                        color: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)',
                        width: 40,
                        height: 40,
                        '&:hover': { backgroundColor: 'rgba(201,169,110,0.3)' },
                      }}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 3,
                        color: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)',
                        width: 40,
                        height: 40,
                        '&:hover': { backgroundColor: 'rgba(201,169,110,0.3)' },
                      }}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </>
                )}

                {/* Image counter */}
                {product.images.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      zIndex: 3,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(10px)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: '0.55rem',
                        letterSpacing: '0.15em',
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {selectedImageIndex + 1} / {product.images.length}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 2, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    {product.images.map((img, i) => (
                      <motion.div key={i} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                        <Box
                          onClick={() => { setSelectedImageIndex(i); setImageLoaded(false); }}
                          sx={{
                            width: 80,
                            height: 80,
                            minWidth: 80,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: selectedImageIndex === i ? '#C9A96E' : 'rgba(255,255,255,0.05)',
                            opacity: selectedImageIndex === i ? 1 : 0.5,
                            transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            '&:hover': {
                              opacity: 1,
                              borderColor: selectedImageIndex === i ? '#C9A96E' : 'rgba(201,169,110,0.3)',
                            },
                            backgroundColor: '#0E0E0E',
                            position: 'relative',
                          }}
                        >
                          <Box
                            component="img"
                            src={img}
                            alt={`${product.name} view ${i + 1}`}
                            loading="lazy"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {selectedImageIndex === i && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 2,
                                background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
                              }}
                            />
                          )}
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              )}
            </motion.div>
          </Grid>

          {/* ─── Product Details ───────────────────── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.8, 0.25, 1] }}>
              {/* Category & Brand */}
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.58rem',
                  letterSpacing: '0.3em',
                  color: '#C9A96E',
                  textTransform: 'uppercase',
                  mb: 1.5,
                  fontWeight: 500,
                }}
              >
                {product.category} — {product.brand}
              </Typography>

              {/* Product Name */}
              <Typography
                variant="h3"
                sx={{
                  mb: 2,
                  fontSize: { xs: '1.6rem', md: '2rem', lg: '2.3rem' },
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                  lineHeight: 1.15,
                  color: '#F5F5F5',
                }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Rating
                  value={product.rating}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{
                    '& .MuiRating-iconFilled': { color: '#C9A96E' },
                    '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.1)' },
                    fontSize: '0.9rem',
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", sans-serif',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {product.rating} ({product.reviewCount} reviews)
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
                {product.discountPrice ? (
                  <>
                    <Typography
                      sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '2rem',
                        fontWeight: 300,
                        color: '#C9A96E',
                        lineHeight: 1,
                      }}
                    >
                      €{product.discountPrice}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '1.3rem',
                        color: 'rgba(255,255,255,0.3)',
                        textDecoration: 'line-through',
                        fontWeight: 300,
                      }}
                    >
                      €{product.price}
                    </Typography>
                    <Chip
                      label={`Save €${product.price - product.discountPrice}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(201, 169, 110, 0.1)',
                        color: '#C9A96E',
                        fontSize: '0.5rem',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        height: 22,
                        fontFamily: '"Montserrat", sans-serif',
                        border: '1px solid rgba(201,169,110,0.15)',
                      }}
                    />
                  </>
                ) : (
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '2rem',
                      fontWeight: 300,
                      color: '#F5F5F5',
                      lineHeight: 1,
                    }}
                  >
                    €{product.price}
                  </Typography>
                )}
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  mb: 4,
                  lineHeight: 1.9,
                  fontSize: '0.78rem',
                }}
              >
                {product.description}
              </Typography>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 4 }} />

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      mb: 1.5,
                    }}
                  >
                    Color — <span style={{ color: '#F5F5F5' }}>{selectedColor?.name}</span>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {product.colors.map((color, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                        <Box
                          onClick={() => setSelectedColorIndex(i)}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: color.hex,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: selectedColorIndex === i ? '#C9A96E' : 'rgba(255,255,255,0.1)',
                            outline: selectedColorIndex === i ? '2px solid transparent' : 'none',
                            outlineOffset: 2,
                            transition: 'all 0.3s ease',
                            boxShadow: selectedColorIndex === i
                              ? `0 0 16px ${color.hex}40`
                              : 'none',
                            '&:hover': {
                              borderColor: '#C9A96E',
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Size Selection */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Size (EU){selectedSize && <span style={{ color: '#F5F5F5' }}> — {selectedSize}</span>}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.55rem',
                      color: 'rgba(201,169,110,0.6)',
                      cursor: 'pointer',
                      letterSpacing: '0.1em',
                      '&:hover': { color: '#C9A96E' },
                    }}
                  >
                    Size Guide
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <motion.div key={size} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                        <Box
                          onClick={() => setSelectedSize(size)}
                          sx={{
                            minWidth: 52,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: isSelected ? '#C9A96E' : 'rgba(255,255,255,0.08)',
                            backgroundColor: isSelected ? 'rgba(201,169,110,0.1)' : 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            '&:hover': {
                              borderColor: isSelected ? '#C9A96E' : 'rgba(201,169,110,0.3)',
                              backgroundColor: isSelected ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.02)',
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: '"Montserrat", sans-serif',
                              fontSize: '0.7rem',
                              fontWeight: isSelected ? 500 : 300,
                              color: isSelected ? '#C9A96E' : 'rgba(255,255,255,0.6)',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {size}
                          </Typography>
                        </Box>
                      </motion.div>
                    );
                  })}
                </Box>
              </Box>

              {/* Stock Indicator */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Box sx={{ mb: 4 }}>
                  {product.stock <= 10 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#CF6679', animation: 'pulse 2s infinite' }} />
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.6rem',
                          color: '#CF6679',
                          letterSpacing: '0.1em',
                        }}
                      >
                        Only {product.stock} left — order soon
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.6rem',
                          color: 'rgba(76, 175, 80, 0.8)',
                          letterSpacing: '0.1em',
                        }}
                      >
                        In Stock — Ready to Ship
                      </Typography>
                    </Box>
                  )}
                </Box>
              </motion.div>

              {/* Quantity & Add to Bag */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#C9A96E' } }}
                  >
                    <RemoveIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                  <Typography
                    sx={{
                      px: 2.5,
                      minWidth: 40,
                      textAlign: 'center',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      color: '#F5F5F5',
                    }}
                  >
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(quantity + 1)}
                    sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#C9A96E' } }}
                  >
                    <AddIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <motion.div style={{ flex: 1 }} whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    startIcon={<ShoppingBagOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
                    sx={{
                      py: 1.8,
                      fontSize: '0.68rem',
                      letterSpacing: '0.2em',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover::before': { left: '100%' },
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={addedToBag ? 'added' : 'add'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {addedToBag ? 'Added ✓' : selectedSize ? 'Add to Bag' : 'Select a Size'}
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={() => setWishlisted(!wishlisted)}
                    sx={{
                      border: '1px solid',
                      borderColor: wishlisted ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.08)',
                      borderRadius: 0,
                      px: 2,
                      height: '100%',
                      backgroundColor: wishlisted ? 'rgba(201,169,110,0.05)' : 'transparent',
                      '&:hover': { borderColor: '#C9A96E' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {wishlisted ? (
                      <FavoriteIcon sx={{ color: '#C9A96E', fontSize: '1.1rem' }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: '1.1rem' }} />
                    )}
                  </IconButton>
                </motion.div>
              </Box>

              {/* Trust Badges */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 3,
                    py: 2.5,
                    px: 2,
                    backgroundColor: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    mb: 4,
                  }}
                >
                  {[
                    { icon: <LocalShippingOutlinedIcon sx={{ fontSize: '1rem' }} />, text: 'Free Shipping' },
                    { icon: <CachedOutlinedIcon sx={{ fontSize: '1rem' }} />, text: '30-Day Returns' },
                    { icon: <VerifiedOutlinedIcon sx={{ fontSize: '1rem' }} />, text: 'Authenticity' },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: 1, justifyContent: 'center' }}>
                      <Box sx={{ color: 'rgba(201,169,110,0.5)' }}>{item.icon}</Box>
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.5rem',
                          letterSpacing: '0.1em',
                          color: 'rgba(255,255,255,0.4)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>

              {/* Accordion Details */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                {[
                  { title: 'Product Details', content: `SKU: ${product.sku}\nBrand: ${product.brand}\nCategory: ${product.category}` },
                  { title: 'Shipping & Returns', content: 'Complimentary shipping on orders over €250. Express delivery available. 30-day hassle-free returns for unworn items in original packaging.' },
                  { title: 'Care Instructions', content: 'Store in the provided dust bag. Use a soft brush for cleaning. Avoid prolonged exposure to direct sunlight and moisture.' },
                ].map((item, i) => (
                  <Accordion
                    key={i}
                    disableGutters
                    elevation={0}
                    sx={{
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      '&::before': { display: 'none' },
                      '&.Mui-expanded': { margin: 0 },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem', color: 'rgba(201,169,110,0.4)' }} />}
                      sx={{
                        px: 0,
                        minHeight: 48,
                        '& .MuiAccordionSummary-content': { my: 1.5 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.62rem',
                          letterSpacing: '0.2em',
                          color: 'rgba(255,255,255,0.6)',
                          textTransform: 'uppercase',
                          fontWeight: 400,
                        }}
                      >
                        {item.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0, pb: 2.5 }}>
                      <Typography
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontSize: '0.72rem',
                          color: 'rgba(255,255,255,0.4)',
                          lineHeight: 2,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {item.content}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>

        {/* ─── Related Products ────────────────────── */}
        <Box sx={{ mt: { xs: 12, md: 18 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.4em',
                  color: 'rgba(201,169,110,0.5)',
                  textTransform: 'uppercase',
                  mb: 1.5,
                }}
              >
                Complete the Look
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                  fontSize: { xs: '1.4rem', md: '1.8rem' },
                }}
              >
                You May Also Like
              </Typography>
            </Box>
          </motion.div>

          {relatedLoading ? (
            <Grid container spacing={3}>
              {[0, 1, 2, 3].map((i) => (
                <Grid size={{ xs: 6, sm: 6, md: 3 }} key={i}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      width: '100%',
                      aspectRatio: '3/4',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: 0,
                    }}
                  />
                  <Box sx={{ pt: 1.5 }}>
                    <Skeleton variant="text" width="40%" sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
                    <Skeleton variant="text" width="70%" sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
                    <Skeleton variant="text" width="30%" sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {fallbackRelated.map((p, i) => (
                <Grid size={{ xs: 6, sm: 6, md: 3 }} key={p.id}>
                  <ProductCard product={p} index={i} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetail;
