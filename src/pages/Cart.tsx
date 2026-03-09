import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity } from '@/redux/slices/cartSlice';

const SHIPPING_COST = 15;
const FREE_SHIPPING_THRESHOLD = 500;

const Cart = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 20, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h4" sx={{ mb: 2 }}>
            Your bag is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Discover our collection of premium Italian sneakers.
          </Typography>
          <Button component={Link} to="/shop" variant="contained">
            Continue Shopping
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO title="Shopping Bag | Silvaine" description="Review your selections of premium Italian sneakers." url="/cart" noIndex />
        <Typography variant="h2" sx={{ mb: 8, fontSize: { xs: '1.8rem', md: '2.5rem' }, textAlign: 'center' }}>
          Shopping Bag
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          {/* Items */}
          <Box sx={{ flex: 2 }}>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      py: 3,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      component={Link}
                      to={`/product/${item.slug}`}
                      sx={{
                        width: { xs: 100, md: 140 },
                        height: { xs: 100, md: 140 },
                        flexShrink: 0,
                        overflow: 'hidden',
                        backgroundColor: '#141414',
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                            {item.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }))}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Size: {item.size} · Color: {item.color}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider' }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              dispatch(updateQuantity({ id: item.id, size: item.size, color: item.color, quantity: item.quantity - 1 }))
                            }
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 2, minWidth: 30, textAlign: 'center', fontSize: '0.85rem' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              dispatch(updateQuantity({ id: item.id, size: item.size, color: item.color, quantity: item.quantity + 1 }))
                            }
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          €{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {/* Summary */}
          <Box
            sx={{
              flex: 1,
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              alignSelf: 'flex-start',
              position: { md: 'sticky' },
              top: { md: 120 },
            }}
          >
            <Typography variant="h6" sx={{ mb: 4 }}>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2">€{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Shipping</Typography>
              <Typography variant="body2" sx={{ color: shipping === 0 ? 'success.main' : 'text.primary' }}>
                {shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}
              </Typography>
            </Box>
            {shipping > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Free shipping on orders over €{FREE_SHIPPING_THRESHOLD}
              </Typography>
            )}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">€{total.toFixed(2)}</Typography>
            </Box>
            <Button
              component={Link}
              to="/checkout"
              variant="contained"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Proceed to Checkout
            </Button>
            <Button
              component={Link}
              to="/shop"
              variant="text"
              fullWidth
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Cart;
