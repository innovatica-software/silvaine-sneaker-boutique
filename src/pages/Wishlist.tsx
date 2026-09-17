import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link } from 'react-router-dom';
import { errorMessage, withResolvedImages } from '@/api';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { useWishlistItems } from '@/hooks/useWishlist';

/**
 * Saved products.
 *
 * The heart icon in the header used to be an `IconButton` with no destination —
 * items could be added to a wishlist that had no page. `GET /wishlist` returns
 * the saved rows with their product joined, so the cards render from one call.
 */
const Wishlist = () => {
  const { data: items = [], isLoading, isError, error, refetch } = useWishlistItems();

  const products = items.map((item) => withResolvedImages(item.product));

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, minHeight: '70vh' }}>
      <SEO
        title="Wishlist | Silvaine"
        description="Products you have saved."
        url="/wishlist"
        noIndex
      />
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            mb: 6,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            textAlign: 'center',
          }}
        >
          Wishlist
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {errorMessage(error, 'Your wishlist could not be loaded.')}
            </Typography>
            <Button onClick={() => void refetch()} variant="outlined">
              Try Again
            </Button>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <FavoriteBorderIcon
              sx={{ fontSize: 56, color: 'text.secondary', mb: 3 }}
            />
            <Typography variant="h5" sx={{ mb: 1.5 }}>
              Nothing saved yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Tap the heart on a product to keep it here.
            </Typography>
            <Button component={Link} to="/shop" variant="contained">
              Browse Collection
            </Button>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {products.map((product, index) => (
              <Grid size={{ xs: 6, sm: 6, md: 3 }} key={product.id}>
                <ProductCard product={product} index={index} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Wishlist;
