import { useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { motion } from 'framer-motion';
import { useProduct, useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/slices/cartSlice';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: allProducts = [] } = useProducts();
  const dispatch = useAppDispatch();

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 20, textAlign: 'center' }}>
        <Typography variant="h4">Product not found</Typography>
        <Button component={Link} to="/shop" sx={{ mt: 3 }}>Back to Shop</Button>
      </Container>
    );
  }

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 3);
  const selectedColor = product.colors[0];
  const mainImage = product.images[selectedImageIndex] || product.images[0] || '/placeholder.svg';

  const handleAddToCart = () => {
    if (!selectedSize) return;
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
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Breadcrumbs sx={{ mb: 4 }}>
            <Typography component={Link} to="/" variant="caption" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Home</Typography>
            <Typography component={Link} to="/shop" variant="caption" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Shop</Typography>
            <Typography variant="caption" color="text.primary">{product.name}</Typography>
          </Breadcrumbs>
        </motion.div>

        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Box sx={{ position: 'relative', backgroundColor: '#141414', overflow: 'hidden', aspectRatio: { xs: '1', md: '4/3' } }}>
                <Box component="img" src={mainImage} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', '&:hover': { transform: 'scale(1.03)' } }} />
                {product.isNew && (
                  <Chip label="NEW" size="small" sx={{ position: 'absolute', top: 20, left: 20, backgroundColor: 'primary.main', color: 'primary.contrastText', fontSize: '0.6rem', letterSpacing: '0.15em' }} />
                )}
              </Box>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Typography variant="subtitle1" sx={{ color: 'primary.main', mb: 1 }}>{product.category}</Typography>
              <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>{product.name}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                {product.discountPrice ? (
                  <>
                    <Typography variant="h5" sx={{ color: 'primary.main' }}>€{product.discountPrice}</Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontWeight: 300 }}>€{product.price}</Typography>
                  </>
                ) : (
                  <Typography variant="h5">€{product.price}</Typography>
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{product.description}</Typography>
              <Divider sx={{ mb: 4 }} />

              {selectedColor && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>Color — {selectedColor.name}</Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: selectedColor.hex, border: '2px solid', borderColor: 'primary.main', cursor: 'pointer' }} />
                </Box>
              )}

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>Size (EU)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.sizes.map((size) => (
                    <Chip key={size} label={size} onClick={() => setSelectedSize(size)} sx={{ minWidth: 48, backgroundColor: selectedSize === size ? 'primary.main' : 'transparent', color: selectedSize === size ? 'primary.contrastText' : 'text.primary', border: '1px solid', borderColor: selectedSize === size ? 'primary.main' : 'divider', '&:hover': { borderColor: 'primary.main' }, transition: 'all 0.3s' }} />
                  ))}
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: product.stock <= 10 ? 'error.main' : 'success.main', mb: 3, display: 'block' }}>
                {product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In Stock'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Quantity</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider' }}>
                  <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))}><RemoveIcon fontSize="small" /></IconButton>
                  <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton size="small" onClick={() => setQuantity(quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" fullWidth onClick={handleAddToCart} disabled={!selectedSize} startIcon={<ShoppingBagOutlinedIcon />} sx={{ py: 1.5 }}>
                  {selectedSize ? 'Add to Bag' : 'Select a Size'}
                </Button>
                <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0, px: 2, '&:hover': { borderColor: 'primary.main' } }}>
                  <FavoriteBorderIcon />
                </IconButton>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>SKU: {product.sku}</Typography>
            </motion.div>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 10, md: 16 } }}>
          <Typography variant="h4" sx={{ mb: 6, textAlign: 'center' }}>You May Also Like</Typography>
          <Grid container spacing={4}>
            {relatedProducts.map((p, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                <ProductCard product={p} index={i} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetail;
